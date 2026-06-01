use std::path::{Path, PathBuf};
use std::sync::Arc;

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};
use tokio::fs::File;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpListener;
use tokio::sync::Mutex;
use tokio::task::JoinHandle;

pub const PORT: u16 = 7878;

#[derive(Debug, Serialize, Deserialize)]
struct Header {
    name: String,
    size: u64,
}

#[derive(Clone, Serialize)]
struct ReceiveStarted {
    name: String,
    size: u64,
    from: String,
}

#[derive(Clone, Serialize)]
struct ReceiveDone {
    path: String,
}

#[derive(Clone, Serialize)]
struct ErrorEvent {
    message: String,
}

#[derive(Default)]
pub struct ServerState {
    running: Mutex<bool>,
    task: Mutex<Option<JoinHandle<()>>>,
}

impl ServerState {
    pub fn new() -> Self {
        Self::default()
    }
}

pub async fn start(
    app: AppHandle,
    state: Arc<ServerState>,
    save_dir: String,
) -> Result<(), String> {
    {
        let mut running = state.running.lock().await;
        if *running {
            return Ok(());
        }
        *running = true;
    }

    let save_dir = PathBuf::from(save_dir);
    if let Err(e) = tokio::fs::create_dir_all(&save_dir).await {
        let mut running = state.running.lock().await;
        *running = false;
        return Err(format!("failed to create save dir: {e}"));
    }

    let bind_addr = format!("0.0.0.0:{PORT}");
    let listener = match TcpListener::bind(&bind_addr).await {
        Ok(l) => l,
        Err(e) => {
            let mut running = state.running.lock().await;
            *running = false;
            return Err(format!("bind {bind_addr} failed: {e}"));
        }
    };

    log::info!(
        "server listening on {bind_addr}, save_dir={}",
        save_dir.display()
    );

    let app_clone = app.clone();
    let save_dir_clone = save_dir.clone();
    let task = tokio::spawn(async move {
        loop {
            match listener.accept().await {
                Ok((stream, peer)) => {
                    let app_inner = app_clone.clone();
                    let save_dir_inner = save_dir_clone.clone();
                    tokio::spawn(async move {
                        if let Err(e) = handle_connection(
                            app_inner.clone(),
                            save_dir_inner,
                            stream,
                            peer.to_string(),
                        )
                        .await
                        {
                            log::error!("connection error from {peer}: {e}");
                            let _ = app_inner.emit("error", ErrorEvent { message: e });
                        }
                    });
                }
                Err(e) => {
                    log::error!("accept failed: {e}");
                    let _ = app_clone.emit(
                        "error",
                        ErrorEvent {
                            message: format!("accept failed: {e}"),
                        },
                    );
                }
            }
        }
    });

    *state.task.lock().await = Some(task);

    Ok(())
}

pub async fn stop(state: Arc<ServerState>) -> Result<(), String> {
    let mut running = state.running.lock().await;
    if !*running {
        return Ok(());
    }

    if let Some(task) = state.task.lock().await.take() {
        task.abort();
    }
    *running = false;

    log::info!("server stopped");
    Ok(())
}

async fn handle_connection(
    app: AppHandle,
    save_dir: PathBuf,
    mut stream: tokio::net::TcpStream,
    peer: String,
) -> Result<(), String> {
    let mut header_len_buf = [0u8; 4];
    stream
        .read_exact(&mut header_len_buf)
        .await
        .map_err(|e| format!("read header len: {e}"))?;
    let header_len = u32::from_be_bytes(header_len_buf) as usize;

    if header_len == 0 || header_len > 64 * 1024 {
        return Err(format!("invalid header length: {header_len}"));
    }

    let mut header_buf = vec![0u8; header_len];
    stream
        .read_exact(&mut header_buf)
        .await
        .map_err(|e| format!("read header: {e}"))?;

    let header: Header =
        serde_json::from_slice(&header_buf).map_err(|e| format!("parse header: {e}"))?;

    log::info!(
        "incoming: name='{}' size={} from={}",
        header.name,
        header.size,
        peer
    );

    let safe_name = sanitize_name(&header.name);
    let dest_path = unique_path(&save_dir, &safe_name);

    let _ = app.emit(
        "receive-started",
        ReceiveStarted {
            name: safe_name.clone(),
            size: header.size,
            from: peer.clone(),
        },
    );

    let mut file = File::create(&dest_path)
        .await
        .map_err(|e| format!("create file: {e}"))?;

    let mut remaining = header.size;
    let mut buf = vec![0u8; 64 * 1024];

    while remaining > 0 {
        let to_read = std::cmp::min(buf.len() as u64, remaining) as usize;
        let n = stream
            .read(&mut buf[..to_read])
            .await
            .map_err(|e| format!("read payload: {e}"))?;
        if n == 0 {
            return Err(format!("connection closed, {remaining} bytes missing"));
        }
        file.write_all(&buf[..n])
            .await
            .map_err(|e| format!("write file: {e}"))?;
        remaining -= n as u64;
    }

    file.flush().await.map_err(|e| format!("flush: {e}"))?;
    drop(file);

    let final_path = match adjust_extension(&dest_path, &save_dir).await {
        Ok(p) => p,
        Err(e) => {
            log::warn!("could not adjust extension: {e}");
            dest_path
        }
    };

    log::info!("received -> {}", final_path.display());

    let _ = app.emit(
        "receive-done",
        ReceiveDone {
            path: final_path.to_string_lossy().to_string(),
        },
    );

    Ok(())
}

async fn adjust_extension(path: &Path, save_dir: &Path) -> Result<PathBuf, String> {
    let mut f = tokio::fs::File::open(path)
        .await
        .map_err(|e| format!("reopen for sniff: {e}"))?;
    let mut buf = [0u8; 16];
    let n = f
        .read(&mut buf)
        .await
        .map_err(|e| format!("sniff read: {e}"))?;
    drop(f);

    let Some(correct) = detect_extension(&buf[..n]) else {
        return Ok(path.to_path_buf());
    };

    let current = path
        .extension()
        .and_then(|e| e.to_str())
        .map(|s| s.to_ascii_lowercase());
    if current.as_deref() == Some(correct) {
        return Ok(path.to_path_buf());
    }

    let stem = path
        .file_stem()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| "file".to_string());
    let candidate_name = format!("{stem}.{correct}");
    let new_path = unique_path(save_dir, &candidate_name);

    tokio::fs::rename(path, &new_path)
        .await
        .map_err(|e| format!("rename: {e}"))?;
    Ok(new_path)
}

fn detect_extension(header: &[u8]) -> Option<&'static str> {
    if header.starts_with(&[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]) {
        return Some("png");
    }
    if header.starts_with(&[0xFF, 0xD8, 0xFF]) {
        return Some("jpg");
    }
    if header.starts_with(b"GIF87a") || header.starts_with(b"GIF89a") {
        return Some("gif");
    }
    if header.len() >= 12 && &header[0..4] == b"RIFF" && &header[8..12] == b"WEBP" {
        return Some("webp");
    }
    if header.starts_with(b"BM") {
        return Some("bmp");
    }
    if header.starts_with(b"%PDF") {
        return Some("pdf");
    }
    if header.starts_with(&[0x50, 0x4B, 0x03, 0x04]) {
        return Some("zip");
    }
    if header.starts_with(&[0x1F, 0x8B]) {
        return Some("gz");
    }
    if header.starts_with(b"ID3")
        || header.starts_with(&[0xFF, 0xFB])
        || header.starts_with(&[0xFF, 0xF3])
    {
        return Some("mp3");
    }
    if header.len() >= 12 && &header[4..8] == b"ftyp" {
        let brand = &header[8..12];
        if matches!(brand, b"heic" | b"heix" | b"hevc" | b"heim" | b"heis") {
            return Some("heic");
        }
        if matches!(brand, b"mif1" | b"msf1") {
            return Some("heif");
        }
        if matches!(brand, b"qt  ") {
            return Some("mov");
        }
        return Some("mp4");
    }
    None
}

fn sanitize_name(name: &str) -> String {
    let trimmed = name.trim();
    let base = Path::new(trimmed)
        .file_name()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| "incoming.bin".to_string());

    let cleaned: String = base
        .chars()
        .map(|c| {
            if c.is_ascii_alphanumeric() || matches!(c, '.' | '_' | '-' | ' ' | '(' | ')') {
                c
            } else {
                '_'
            }
        })
        .collect();

    if cleaned.is_empty() {
        "incoming.bin".to_string()
    } else {
        cleaned
    }
}

fn unique_path(dir: &Path, name: &str) -> PathBuf {
    let candidate = dir.join(name);
    if !candidate.exists() {
        return candidate;
    }
    let (stem, ext) = match name.rsplit_once('.') {
        Some((s, e)) => (s.to_string(), format!(".{e}")),
        None => (name.to_string(), String::new()),
    };
    for i in 1..10_000 {
        let try_name = format!("{stem} ({i}){ext}");
        let p = dir.join(&try_name);
        if !p.exists() {
            return p;
        }
    }
    dir.join(format!("{}-{}", name, std::process::id()))
}
