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
const DISCOVERY_PORT: u16 = 7879;
const TRANSFER_PORT: u16 = 7878;
const INTERVAL: Duration = Duration::from_secs(3);
const PEER_TTL: Duration = Duration::from_secs(10);
const REAP_INTERVAL: Duration = Duration::from_secs(2);
pub const DEFAULT_THRESHOLD: u32 = 30;

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
pub struct ScanState {
    inner: Mutex<Inner>,
}

#[derive(Default)]
struct Inner {
    running: bool,
    id: String,
    nick: String,
    threshold: u32,
    peers: HashMap<String, PeerEntry>,
    tasks: Vec<JoinHandle<()>>,
}

impl ScanState {
    pub fn new() -> Self {
        Self::default()
    }
}

fn dlog(app: &AppHandle, message: impl Into<String>) {
    let message = message.into();
    log::info!("[scan] {message}");
    let _ = app.emit("discovery-log", DiscoveryLog { message });
}

pub async fn start(
    app: AppHandle,
    state: Arc<ScanState>,
    nick: String,
    device_id: String,
    threshold: u32,
) -> Result<(), String> {
    let threshold = if threshold == 0 {
        DEFAULT_THRESHOLD
    } else {
        threshold
    };
    {
        let mut inner = state.inner.lock().await;
        if inner.running {
            inner.nick = nick;
            inner.threshold = threshold;
            let snapshot = snapshot(&inner);
            drop(inner);
            dlog(&app, "start: já rodando, reenviando snapshot");
            let _ = app.emit("peers", snapshot);
            return Ok(());
        }
        inner.running = true;
        inner.id = device_id;
        inner.nick = nick;
        inner.threshold = threshold;
        inner.peers.clear();
    }

    let socket = match bind_socket() {
        Ok(s) => Arc::new(s),
        Err(e) => {
            state.inner.lock().await.running = false;
            dlog(&app, format!("bind falhou: {e}"));
            return Err(format!("bind scan: {e}"));
        }
    };

    dlog(
        &app,
        format!("bind 0.0.0.0:{DISCOVERY_PORT} ok (modo varredura)"),
    );
    dlog(&app, format!("meu ip: {}", local_ipv4()));
    dlog(&app, format!("limite de ips: {threshold}"));

    let sender = {
        let socket = socket.clone();
        let state = state.clone();
        let app = app.clone();
        tokio::spawn(async move {
            let mut first = true;
            loop {
                let (ann, threshold) = {
                    let inner = state.inner.lock().await;
                    (
                        make_announcement(&inner.id, &inner.nick, "hello"),
                        inner.threshold,
                    )
                };
                let targets = scan_targets(threshold);
                if let Ok(bytes) = serde_json::to_vec(&ann) {
                    let mut sent = 0;
                    for ip in &targets {
                        let dest = SocketAddrV4::new(*ip, DISCOVERY_PORT);
                        if socket.send_to(&bytes, dest).await.is_ok() {
                            sent += 1;
                        }
                    }
                    if first {
                        dlog(
                            &app,
                            format!(
                                "varrendo {} ips ({}..) · {sent} enviados",
                                targets.len(),
                                targets.first().map(|i| i.to_string()).unwrap_or_default(),
                            ),
                        );
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
            loop {
                match socket.recv_from(&mut buf).await {
                    Ok((n, src)) => {
                        let Ok(ann) = serde_json::from_slice::<Announcement>(&buf[..n]) else {
                            continue;
                        };
                        if ann.magic != MAGIC {
                            continue;
                        }
                        let reply_to = src;
                        let mut inner = state.inner.lock().await;
                        if ann.id == inner.id {
                            continue;
                        }
                        let short = ann.id.chars().take(8).collect::<String>();
                        let is_hello = ann.kind != "bye";
                        let changed = if ann.kind == "bye" {
                            inner.peers.remove(&ann.id).is_some()
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
                            let reply = if is_hello {
                                Some(make_announcement(&inner.id, &inner.nick, "hello"))
                            } else {
                                None
                            };
                            drop(inner);
                            let _ = app.emit("peers", snapshot);
                            if let Some(reply) = reply {
                                if let Ok(bytes) = serde_json::to_vec(&reply) {
                                    let _ = socket.send_to(&bytes, reply_to).await;
                                }
                            }
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

    state.inner.lock().await.tasks = vec![sender, listener, reaper];
    Ok(())
}

pub async fn stop(state: Arc<ScanState>) -> Result<(), String> {
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
    Ok(())
}

pub async fn set_nick(state: Arc<ScanState>, nick: String) {
    state.inner.lock().await.nick = nick;
}

async fn send_bye(state: &ScanState) {
    let (ann, threshold) = {
        let inner = state.inner.lock().await;
        (
            make_announcement(&inner.id, &inner.nick, "bye"),
            inner.threshold,
        )
    };
    let Ok(bytes) = serde_json::to_vec(&ann) else {
        return;
    };
    if let Ok(socket) = UdpSocket::bind((Ipv4Addr::UNSPECIFIED, 0)).await {
        for ip in scan_targets(threshold) {
            let _ = socket
                .send_to(&bytes, SocketAddrV4::new(ip, DISCOVERY_PORT))
                .await;
        }
    }
}

fn scan_targets(threshold: u32) -> Vec<Ipv4Addr> {
    let Some(local) = local_ip_v4_addr() else {
        return Vec::new();
    };
    let o = local.octets();
    let max = threshold.clamp(1, 254);
    let mut targets = Vec::new();
    for host in 1..=max {
        let ip = Ipv4Addr::new(o[0], o[1], o[2], host as u8);
        if ip != local {
            targets.push(ip);
        }
    }
    targets
}

fn bind_socket() -> std::io::Result<UdpSocket> {
    let socket = Socket::new(Domain::IPV4, Type::DGRAM, Some(Protocol::UDP))?;
    socket.set_reuse_address(true)?;
    #[cfg(all(unix, not(target_os = "android")))]
    socket.set_reuse_port(true)?;
    let bind_addr: SocketAddr = SocketAddrV4::new(Ipv4Addr::UNSPECIFIED, DISCOVERY_PORT).into();
    socket.bind(&bind_addr.into())?;
    socket.set_nonblocking(true)?;
    let std_socket: StdUdpSocket = socket.into();
    UdpSocket::from_std(std_socket)
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

fn make_announcement(id: &str, nick: &str, kind: &str) -> Announcement {
    Announcement {
        magic: MAGIC.to_string(),
        kind: kind.to_string(),
        id: id.to_string(),
        nick: nick.to_string(),
        ip: local_ipv4(),
        port: TRANSFER_PORT,
        mac: local_mac(),
        platform: platform().to_string(),
    }
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
