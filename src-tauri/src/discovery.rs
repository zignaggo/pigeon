use std::collections::HashMap;
use std::net::{Ipv4Addr, SocketAddr, SocketAddrV4, UdpSocket as StdUdpSocket};
use std::sync::Arc;
use std::time::{Duration, Instant};

use serde::{Deserialize, Serialize};
use socket2::{Domain, Protocol, Socket, Type};
use tauri::{AppHandle, Emitter};
use tokio::net::UdpSocket;
use tokio::sync::Mutex;
use tokio::task::JoinHandle;

const MAGIC: &str = "PGN1";
const GROUP: Ipv4Addr = Ipv4Addr::new(239, 255, 42, 99);
const DISCOVERY_PORT: u16 = 7879;
const TRANSFER_PORT: u16 = 7878;
const INTERVAL: Duration = Duration::from_secs(3);
const PEER_TTL: Duration = Duration::from_secs(10);
const REAP_INTERVAL: Duration = Duration::from_secs(2);

#[derive(Serialize, Deserialize)]
struct Announcement {
    magic: String,
    #[serde(rename = "type")]
    kind: String,
    id: String,
    nick: String,
    ip: String,
    port: u16,
    mac: String,
    platform: String,
}

#[derive(Clone, Serialize)]
pub struct Peer {
    id: String,
    nick: String,
    ip: String,
    port: u16,
    mac: String,
    platform: String,
}

struct PeerEntry {
    peer: Peer,
    last_seen: Instant,
}

#[derive(Clone, Serialize)]
struct PeersSnapshot {
    peers: Vec<Peer>,
}

#[derive(Clone, Serialize)]
struct DiscoveryLog {
    message: String,
}

#[derive(Default)]
pub struct DiscoveryState {
    inner: Mutex<Inner>,
}

#[derive(Default)]
struct Inner {
    running: bool,
    id: String,
    nick: String,
    peers: HashMap<String, PeerEntry>,
    tasks: Vec<JoinHandle<()>>,
    #[cfg(target_os = "android")]
    multicast_lock: Option<jni::objects::GlobalRef>,
}

impl DiscoveryState {
    pub fn new() -> Self {
        Self::default()
    }
}

fn dlog(app: &AppHandle, message: impl Into<String>) {
    let message = message.into();
    log::info!("[discovery] {message}");
    let _ = app.emit("discovery-log", DiscoveryLog { message });
}

pub async fn start(
    app: AppHandle,
    state: Arc<DiscoveryState>,
    nick: String,
    device_id: String,
) -> Result<(), String> {
    {
        let mut inner = state.inner.lock().await;
        if inner.running {
            inner.nick = nick;
            let snapshot = snapshot(&inner);
            drop(inner);
            dlog(&app, "start: já rodando, reenviando snapshot");
            let _ = app.emit("peers", snapshot);
            return Ok(());
        }
        inner.running = true;
        inner.id = device_id;
        inner.nick = nick;
        inner.peers.clear();
    }

    #[cfg(target_os = "android")]
    {
        let state = state.clone();
        let app = app.clone();
        tokio::spawn(async move {
            let res = tokio::time::timeout(
                Duration::from_secs(5),
                tokio::task::spawn_blocking(acquire_multicast_lock),
            )
            .await;
            match res {
                Ok(Ok(Ok(lock))) => {
                    state.inner.lock().await.multicast_lock = Some(lock);
                    dlog(&app, "MulticastLock adquirido");
                }
                Ok(Ok(Err(e))) => dlog(&app, format!("MulticastLock falhou: {e}")),
                Ok(Err(_)) => dlog(&app, "MulticastLock panic ao adquirir"),
                Err(_) => dlog(&app, "MulticastLock timeout"),
            }
        });
    }

    let (socket, joined) = match setup_socket() {
        Ok(s) => (Arc::new(s.0), s.1),
        Err(e) => {
            state.inner.lock().await.running = false;
            dlog(&app, format!("bind falhou: {e}"));
            return Err(format!("bind multicast: {e}"));
        }
    };

    dlog(&app, format!("bind 0.0.0.0:{DISCOVERY_PORT} ok"));
    dlog(&app, format!("interfaces locais: {:?}", interface_ipv4s()));
    dlog(
        &app,
        format!("multicast {GROUP} join em {} iface(s)", joined.len()),
    );
    dlog(&app, format!("meu ip: {}", local_ipv4()));

    let dests = announce_targets();
    dlog(&app, format!("destinos de anúncio: {dests:?}"));

    let broadcaster = {
        let socket = socket.clone();
        let state = state.clone();
        let app = app.clone();
        tokio::spawn(async move {
            let mut first = true;
            loop {
                let ann = build_announcement(&state, "hello").await;
                if let Ok(bytes) = serde_json::to_vec(&ann) {
                    let mut report = Vec::new();
                    for dest in &dests {
                        let res = socket.send_to(&bytes, *dest).await;
                        if first {
                            report.push(format!("{dest}={}", result_label(&res)));
                        } else if let Err(e) = res {
                            dlog(&app, format!("envio {dest} erro: {e}"));
                        }
                    }
                    if first {
                        dlog(&app, format!("hello enviado · {}", report.join(" ")));
                        first = false;
                    }
                }
                tokio::time::sleep(INTERVAL).await;
            }
        })
    };

    let listener = {
        let socket = socket.clone();
        let state = state.clone();
        let app = app.clone();
        tokio::spawn(async move {
            let mut buf = vec![0u8; 2048];
            let mut loopback_seen = false;
            loop {
                match socket.recv_from(&mut buf).await {
                    Ok((n, src)) => {
                        let parsed = serde_json::from_slice::<Announcement>(&buf[..n]);
                        let Ok(ann) = parsed else {
                            dlog(&app, format!("recv {n}B de {src}: json inválido"));
                            continue;
                        };
                        if ann.magic != MAGIC {
                            dlog(&app, format!("recv {n}B de {src}: magic inválido"));
                            continue;
                        }
                        let mut inner = state.inner.lock().await;
                        if ann.id == inner.id {
                            drop(inner);
                            if !loopback_seen {
                                loopback_seen = true;
                                dlog(&app, "loopback ok (recebo meus próprios pacotes)");
                            }
                            continue;
                        }
                        let short = ann.id.chars().take(8).collect::<String>();
                        let changed = if ann.kind == "bye" {
                            let removed = inner.peers.remove(&ann.id).is_some();
                            if removed {
                                dlog(&app, format!("bye de {} (#{short})", ann.nick));
                            }
                            removed
                        } else {
                            let known = inner.peers.contains_key(&ann.id);
                            if !known {
                                dlog(
                                    &app,
                                    format!(
                                        "peer encontrado: {} (#{short}) {} {}",
                                        ann.nick, ann.platform, ann.ip
                                    ),
                                );
                            }
                            inner.peers.insert(
                                ann.id.clone(),
                                PeerEntry {
                                    peer: to_peer(ann),
                                    last_seen: Instant::now(),
                                },
                            );
                            !known
                        };
                        if changed {
                            let snapshot = snapshot(&inner);
                            drop(inner);
                            let _ = app.emit("peers", snapshot);
                        }
                    }
                    Err(e) => {
                        dlog(&app, format!("recv erro: {e}"));
                        tokio::time::sleep(Duration::from_millis(200)).await;
                    }
                }
            }
        })
    };

    let reaper = {
        let state = state.clone();
        let app = app.clone();
        tokio::spawn(async move {
            loop {
                tokio::time::sleep(REAP_INTERVAL).await;
                let mut inner = state.inner.lock().await;
                let before = inner.peers.len();
                let now = Instant::now();
                inner
                    .peers
                    .retain(|_, entry| now.duration_since(entry.last_seen) < PEER_TTL);
                let after = inner.peers.len();
                if after != before {
                    let snapshot = snapshot(&inner);
                    drop(inner);
                    dlog(&app, format!("peer(s) expirado(s): {before} → {after}"));
                    let _ = app.emit("peers", snapshot);
                }
            }
        })
    };

    state.inner.lock().await.tasks = vec![broadcaster, listener, reaper];
    Ok(())
}

pub async fn stop(state: Arc<DiscoveryState>) -> Result<(), String> {
    {
        let inner = state.inner.lock().await;
        if !inner.running {
            return Ok(());
        }
    }

    let _ = tokio::time::timeout(Duration::from_secs(2), send_bye(&state)).await;

    let mut inner = state.inner.lock().await;
    for task in inner.tasks.drain(..) {
        task.abort();
    }
    inner.peers.clear();
    inner.running = false;

    #[cfg(target_os = "android")]
    if let Some(lock) = inner.multicast_lock.take() {
        tokio::task::spawn_blocking(move || release_multicast_lock(&lock));
    }

    Ok(())
}

pub async fn set_nick(state: Arc<DiscoveryState>, nick: String) {
    state.inner.lock().await.nick = nick;
}

fn announce_targets() -> Vec<SocketAddrV4> {
    let mut targets = vec![
        SocketAddrV4::new(GROUP, DISCOVERY_PORT),
        SocketAddrV4::new(Ipv4Addr::BROADCAST, DISCOVERY_PORT),
    ];
    for ip in interface_ipv4s() {
        let o = ip.octets();
        let addr = SocketAddrV4::new(Ipv4Addr::new(o[0], o[1], o[2], 255), DISCOVERY_PORT);
        if !targets.contains(&addr) {
            targets.push(addr);
        }
    }
    targets
}

fn result_label(res: &std::io::Result<usize>) -> String {
    match res {
        Ok(n) => format!("ok({n}B)"),
        Err(e) => format!("erro({e})"),
    }
}

fn snapshot(inner: &Inner) -> PeersSnapshot {
    PeersSnapshot {
        peers: inner
            .peers
            .values()
            .map(|entry| entry.peer.clone())
            .collect(),
    }
}

fn to_peer(ann: Announcement) -> Peer {
    Peer {
        id: ann.id,
        nick: ann.nick,
        ip: ann.ip,
        port: ann.port,
        mac: ann.mac,
        platform: ann.platform,
    }
}

async fn build_announcement(state: &DiscoveryState, kind: &str) -> Announcement {
    let inner = state.inner.lock().await;
    Announcement {
        magic: MAGIC.to_string(),
        kind: kind.to_string(),
        id: inner.id.clone(),
        nick: inner.nick.clone(),
        ip: local_ipv4(),
        port: TRANSFER_PORT,
        mac: local_mac(),
        platform: platform().to_string(),
    }
}

async fn send_bye(state: &DiscoveryState) {
    let ann = build_announcement(state, "bye").await;
    let Ok(bytes) = serde_json::to_vec(&ann) else {
        return;
    };
    if let Ok(socket) = UdpSocket::bind((Ipv4Addr::UNSPECIFIED, 0)).await {
        let _ = socket.set_broadcast(true);
        let _ = socket
            .send_to(&bytes, SocketAddrV4::new(GROUP, DISCOVERY_PORT))
            .await;
        let _ = socket
            .send_to(
                &bytes,
                SocketAddrV4::new(Ipv4Addr::BROADCAST, DISCOVERY_PORT),
            )
            .await;
    }
}

fn setup_socket() -> std::io::Result<(UdpSocket, Vec<Ipv4Addr>)> {
    let socket = Socket::new(Domain::IPV4, Type::DGRAM, Some(Protocol::UDP))?;
    socket.set_reuse_address(true)?;
    #[cfg(all(unix, not(target_os = "android")))]
    socket.set_reuse_port(true)?;
    socket.set_broadcast(true)?;

    let bind_addr: SocketAddr = SocketAddrV4::new(Ipv4Addr::UNSPECIFIED, DISCOVERY_PORT).into();
    socket.bind(&bind_addr.into())?;
    socket.set_multicast_loop_v4(true)?;
    socket.set_multicast_ttl_v4(1)?;

    let ifaces = interface_ipv4s();
    let mut joined = Vec::new();
    for ip in &ifaces {
        if socket.join_multicast_v4(&GROUP, ip).is_ok() {
            joined.push(*ip);
        }
    }
    if joined.is_empty() {
        let _ = socket.join_multicast_v4(&GROUP, &Ipv4Addr::UNSPECIFIED);
    }

    if let Some(egress) = local_ip_v4_addr().or_else(|| ifaces.first().copied()) {
        let _ = socket.set_multicast_if_v4(&egress);
    }

    socket.set_nonblocking(true)?;
    let std_socket: StdUdpSocket = socket.into();
    Ok((UdpSocket::from_std(std_socket)?, joined))
}

fn interface_ipv4s() -> Vec<Ipv4Addr> {
    let mut out = Vec::new();
    if let Ok(ifaces) = local_ip_address::list_afinet_netifas() {
        for (_, ip) in ifaces {
            if let std::net::IpAddr::V4(v4) = ip {
                if !v4.is_loopback() && !v4.is_unspecified() {
                    out.push(v4);
                }
            }
        }
    }
    out
}

fn local_ip_v4_addr() -> Option<Ipv4Addr> {
    match local_ip_address::local_ip() {
        Ok(std::net::IpAddr::V4(v4)) => Some(v4),
        _ => None,
    }
}

fn local_ipv4() -> String {
    local_ip_address::local_ip()
        .ok()
        .map(|ip| ip.to_string())
        .unwrap_or_default()
}

fn platform() -> &'static str {
    if cfg!(target_os = "android") {
        "android"
    } else if cfg!(target_os = "ios") {
        "ios"
    } else if cfg!(target_os = "windows") {
        "windows"
    } else if cfg!(target_os = "macos") {
        "macos"
    } else {
        "linux"
    }
}

#[cfg(not(target_os = "android"))]
fn local_mac() -> String {
    mac_address::get_mac_address()
        .ok()
        .flatten()
        .map(|mac| mac.to_string())
        .unwrap_or_default()
}

#[cfg(target_os = "android")]
fn local_mac() -> String {
    String::new()
}

#[cfg(target_os = "android")]
fn acquire_multicast_lock() -> Result<jni::objects::GlobalRef, String> {
    use jni::objects::{JObject, JValue};

    let ctx = ndk_context::android_context();
    let vm = unsafe { jni::JavaVM::from_raw(ctx.vm().cast()) }.map_err(|e| e.to_string())?;
    let mut env = vm.attach_current_thread().map_err(|e| e.to_string())?;
    let context = unsafe { JObject::from_raw(ctx.context().cast()) };

    let service_name = env.new_string("wifi").map_err(|e| e.to_string())?;
    let wifi_manager = env
        .call_method(
            &context,
            "getSystemService",
            "(Ljava/lang/String;)Ljava/lang/Object;",
            &[(&service_name).into()],
        )
        .map_err(|e| e.to_string())?
        .l()
        .map_err(|e| e.to_string())?;

    let tag = env
        .new_string("pigeon-discovery")
        .map_err(|e| e.to_string())?;
    let lock = env
        .call_method(
            &wifi_manager,
            "createMulticastLock",
            "(Ljava/lang/String;)Landroid/net/wifi/WifiManager$MulticastLock;",
            &[(&tag).into()],
        )
        .map_err(|e| e.to_string())?
        .l()
        .map_err(|e| e.to_string())?;

    env.call_method(&lock, "setReferenceCounted", "(Z)V", &[JValue::Bool(0)])
        .map_err(|e| e.to_string())?;
    env.call_method(&lock, "acquire", "()V", &[])
        .map_err(|e| e.to_string())?;

    env.new_global_ref(&lock).map_err(|e| e.to_string())
}

#[cfg(target_os = "android")]
fn release_multicast_lock(lock: &jni::objects::GlobalRef) {
    let ctx = ndk_context::android_context();
    if let Ok(vm) = unsafe { jni::JavaVM::from_raw(ctx.vm().cast()) } {
        if let Ok(mut env) = vm.attach_current_thread() {
            let _ = env.call_method(lock.as_obj(), "release", "()V", &[]);
        }
    }
}
