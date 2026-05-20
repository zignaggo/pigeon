use std::path::Path;
use std::time::Duration;

use serde::Serialize;
use tauri::{AppHandle, Emitter};
use tokio::fs::File;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpStream;

use crate::server::PORT;

#[derive(Clone, Serialize)]
struct SendProgress {
    bytes_sent: u64,
    total: u64,
}

#[derive(Clone, Serialize)]
struct SendDone {
    name: String,
    target: String,
}

#[derive(serde::Serialize)]
struct Header<'a> {
    name: &'a str,
    size: u64,
}

pub async fn send_file(app: AppHandle, target_ip: String, file_path: String) -> Result<(), String> {
    let path = Path::new(&file_path);
    let file_name = path
        .file_name()
        .ok_or_else(|| "invalid file path".to_string())?
        .to_string_lossy()
        .to_string();

    let meta = tokio::fs::metadata(&file_path)
        .await
        .map_err(|e| format!("stat file: {e}"))?;
    let total = meta.len();

    let addr = format!("{}:{}", target_ip.trim(), PORT);
    log::info!("connecting to {addr}");

    let mut stream = tokio::time::timeout(Duration::from_secs(10), TcpStream::connect(&addr))
        .await
        .map_err(|_| format!("timeout connecting to {addr}"))?
        .map_err(|e| format!("connect {addr}: {e}"))?;

    let header = Header {
        name: &file_name,
        size: total,
    };
    let header_bytes = serde_json::to_vec(&header).map_err(|e| format!("encode header: {e}"))?;
    let header_len = header_bytes.len() as u32;

    stream
        .write_all(&header_len.to_be_bytes())
        .await
        .map_err(|e| format!("write header len: {e}"))?;
    stream
        .write_all(&header_bytes)
        .await
        .map_err(|e| format!("write header: {e}"))?;

    let mut file = File::open(&file_path)
        .await
        .map_err(|e| format!("open file: {e}"))?;

    let mut buf = vec![0u8; 64 * 1024];
    let mut sent: u64 = 0;
    let mut last_emit: u64 = 0;

    loop {
        let n = file
            .read(&mut buf)
            .await
            .map_err(|e| format!("read file: {e}"))?;
        if n == 0 {
            break;
        }
        stream
            .write_all(&buf[..n])
            .await
            .map_err(|e| format!("write payload: {e}"))?;
        sent += n as u64;

        if sent - last_emit >= 256 * 1024 || sent == total {
            let _ = app.emit(
                "send-progress",
                SendProgress {
                    bytes_sent: sent,
                    total,
                },
            );
            last_emit = sent;
        }
    }

    stream.flush().await.map_err(|e| format!("flush: {e}"))?;
    stream.shutdown().await.ok();

    log::info!("sent {} bytes to {}", sent, addr);
    let _ = app.emit(
        "send-done",
        SendDone {
            name: file_name,
            target: addr,
        },
    );

    Ok(())
}

pub async fn send_data(
    app: AppHandle,
    target_ip: String,
    name: String,
    data: Vec<u8>,
) -> Result<(), String> {
    let total = data.len() as u64;
    let addr = format!("{}:{}", target_ip.trim(), PORT);
    log::info!("connecting to {addr} for {name} ({total} bytes)");

    let mut stream = tokio::time::timeout(Duration::from_secs(10), TcpStream::connect(&addr))
        .await
        .map_err(|_| format!("timeout connecting to {addr}"))?
        .map_err(|e| format!("connect {addr}: {e}"))?;

    let header = Header {
        name: &name,
        size: total,
    };
    let header_bytes = serde_json::to_vec(&header).map_err(|e| format!("encode header: {e}"))?;
    let header_len = header_bytes.len() as u32;

    stream
        .write_all(&header_len.to_be_bytes())
        .await
        .map_err(|e| format!("write header len: {e}"))?;
    stream
        .write_all(&header_bytes)
        .await
        .map_err(|e| format!("write header: {e}"))?;

    let mut sent: u64 = 0;
    let mut last_emit: u64 = 0;
    let chunk = 64 * 1024usize;

    while (sent as usize) < data.len() {
        let end = std::cmp::min(sent as usize + chunk, data.len());
        let slice = &data[sent as usize..end];
        stream
            .write_all(slice)
            .await
            .map_err(|e| format!("write payload: {e}"))?;
        sent += slice.len() as u64;
        if sent - last_emit >= 256 * 1024 || sent == total {
            let _ = app.emit(
                "send-progress",
                SendProgress {
                    bytes_sent: sent,
                    total,
                },
            );
            last_emit = sent;
        }
    }

    stream.flush().await.map_err(|e| format!("flush: {e}"))?;
    stream.shutdown().await.ok();

    log::info!("sent {} bytes to {}", sent, addr);
    let _ = app.emit(
        "send-done",
        SendDone { name, target: addr },
    );

    Ok(())
}
