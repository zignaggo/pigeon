mod client;
mod discovery;
mod server;

use std::sync::Arc;

use discovery::DiscoveryState;
use server::ServerState;
use tauri::{AppHandle, Manager, State};

#[cfg(target_os = "android")]
use tauri_plugin_android_fs::{AndroidFsExt, FileUri};

struct AppState {
    server: Arc<ServerState>,
    discovery: Arc<DiscoveryState>,
}

#[tauri::command]
fn get_local_ip() -> Result<String, String> {
    local_ip_address::local_ip()
        .map(|ip| ip.to_string())
        .map_err(|e| format!("could not determine local IP: {e}"))
}

#[tauri::command]
async fn start_server(
    app: AppHandle,
    state: State<'_, AppState>,
    save_dir: String,
) -> Result<(), String> {
    let server = state.server.clone();
    server::start(app, server, save_dir).await
}

#[tauri::command]
async fn stop_server(state: State<'_, AppState>) -> Result<(), String> {
    let server = state.server.clone();
    server::stop(server).await
}

#[tauri::command]
async fn send_file(
    app: AppHandle,
    target_ip: String,
    file_path: String,
) -> Result<(), String> {
    client::send_file(app, target_ip, file_path).await
}

#[tauri::command]
async fn send_data(
    app: AppHandle,
    target_ip: String,
    name: String,
    data: Vec<u8>,
) -> Result<(), String> {
    client::send_data(app, target_ip, name, data).await
}

#[tauri::command]
async fn start_discovery(
    app: AppHandle,
    state: State<'_, AppState>,
    nick: String,
    device_id: String,
) -> Result<(), String> {
    discovery::start(app, state.discovery.clone(), nick, device_id).await
}

#[tauri::command]
async fn stop_discovery(state: State<'_, AppState>) -> Result<(), String> {
    discovery::stop(state.discovery.clone()).await
}

#[tauri::command]
async fn set_nick(state: State<'_, AppState>, nick: String) -> Result<(), String> {
    discovery::set_nick(state.discovery.clone(), nick).await;
    Ok(())
}

#[tauri::command]
fn default_save_dir(app: AppHandle) -> Result<String, String> {
    #[cfg(target_os = "android")]
    {
        // No Android os arquivos chegam primeiro no cache do app (gravável via
        // tokio::fs); a pasta visível ao usuário é a árvore SAF escolhida, e o
        // arquivo é movido pra lá via `saf_import_file`.
        let dir = app
            .path()
            .app_cache_dir()
            .map_err(|e| format!("cache dir: {e}"))?;
        Ok(dir.join("received").to_string_lossy().to_string())
    }
    #[cfg(not(target_os = "android"))]
    {
        let dir = app
            .path()
            .download_dir()
            .map_err(|e| format!("download dir: {e}"))?;
        Ok(dir.join("pigeon").to_string_lossy().to_string())
    }
}

// ---- SAF (Storage Access Framework) — somente Android ----
// Exposto via invoke; o resto do app trata a pasta escolhida como um objeto
// opaco (FileUri) que vai e volta serializado por serde.

#[cfg(target_os = "android")]
#[tauri::command]
async fn saf_pick_dir(app: AppHandle) -> Result<Option<FileUri>, String> {
    let api = app.android_fs_async();
    let dir = api
        .file_picker()
        .pick_dir(None, false)
        .await
        .map_err(|e| e.to_string())?;
    if let Some(ref uri) = dir {
        api.file_picker()
            .persist_uri_permission(uri)
            .await
            .map_err(|e| e.to_string())?;
    }
    Ok(dir)
}

#[cfg(target_os = "android")]
#[tauri::command]
async fn saf_import_file(
    app: AppHandle,
    dir: FileUri,
    src_path: String,
    name: String,
) -> Result<(), String> {
    let api = app.android_fs_async();
    let file_uri = api
        .create_new_file(&dir, &name, Some("application/octet-stream"))
        .await
        .map_err(|e| e.to_string())?;
    let mut dest = api
        .open_file_writable(&file_uri)
        .await
        .map_err(|e| e.to_string())?;
    let mut src = std::fs::File::open(&src_path).map_err(|e| format!("open src: {e}"))?;
    std::io::copy(&mut src, &mut dest).map_err(|e| format!("copy: {e}"))?;
    let _ = std::fs::remove_file(&src_path);
    Ok(())
}

#[cfg(not(target_os = "android"))]
#[tauri::command]
async fn saf_pick_dir() -> Result<Option<String>, String> {
    Err("SAF disponível apenas no Android".into())
}

#[cfg(not(target_os = "android"))]
#[tauri::command]
async fn saf_import_file() -> Result<(), String> {
    Err("SAF disponível apenas no Android".into())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            #[cfg(target_os = "android")]
            app.handle().plugin(tauri_plugin_android_fs::init())?;
            app.manage(AppState {
                server: Arc::new(ServerState::new()),
                discovery: Arc::new(DiscoveryState::new()),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_local_ip,
            start_server,
            stop_server,
            send_file,
            send_data,
            start_discovery,
            stop_discovery,
            set_nick,
            default_save_dir,
            saf_pick_dir,
            saf_import_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
