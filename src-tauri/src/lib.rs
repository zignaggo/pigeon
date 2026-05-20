mod client;
mod server;

use std::sync::Arc;

use server::ServerState;
use tauri::{AppHandle, Manager, State};

struct AppState {
    server: Arc<ServerState>,
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
fn default_save_dir(app: AppHandle) -> Result<String, String> {
    #[cfg(target_os = "android")]
    {
        let _ = app;
        return Ok("/storage/emulated/0/Download/PomboPOC".to_string());
    }
    #[cfg(not(target_os = "android"))]
    {
        let dir = app
            .path()
            .download_dir()
            .map_err(|e| format!("download dir: {e}"))?;
        Ok(dir.join("PomboPOC").to_string_lossy().to_string())
    }
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
            app.manage(AppState {
                server: Arc::new(ServerState::new()),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_local_ip,
            start_server,
            send_file,
            send_data,
            default_save_dir,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
