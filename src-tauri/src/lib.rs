// BUNKER - Vault-Tec AI Command Center
// Rust Backend with Claude API, Terminal PTY, and Secure Storage

mod claude;
mod error;
mod keyring;
mod metrics;
mod terminal;
mod tools;

use keyring::KeyringManager;
use metrics::MetricsManager;
use tauri::Manager;
use terminal::PtyManager;
use tools::{ToolContext, ToolRegistryState};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            // Initialize managers
            let keyring = KeyringManager::new(app.handle().clone());
            let pty_manager = PtyManager::new(app.handle().clone());
            let metrics_manager = MetricsManager::new(app.handle().clone());
            let tool_registry = ToolRegistryState::new(ToolContext::default());

            // Initialize keyring (load cached keys)
            let keyring_clone = keyring.clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = keyring_clone.init().await {
                    eprintln!("Failed to initialize keyring: {}", e);
                }
            });

            // Initialize metrics (load cached metrics)
            let metrics_clone = metrics_manager.clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = metrics_clone.init().await {
                    eprintln!("Failed to initialize metrics: {}", e);
                }
            });

            // Register state
            app.manage(keyring);
            app.manage(pty_manager);
            app.manage(metrics_manager);
            app.manage(tool_registry);

            // Get the main window
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_title("BUNKER Control System v7.6.2");
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Keyring commands
            keyring::set_api_key,
            keyring::remove_api_key,
            keyring::check_api_key,
            keyring::list_api_keys,
            // Claude commands
            claude::claude_send_message,
            claude::claude_stream_message,
            claude::claude_list_models,
            claude::claude_check_connection,
            claude::claude_estimate_cost,
            // Terminal commands
            terminal::terminal_create,
            terminal::terminal_write,
            terminal::terminal_resize,
            terminal::terminal_close,
            terminal::terminal_list,
            // Metrics commands
            metrics::metrics_save_api_call,
            metrics::metrics_save_task,
            metrics::metrics_update_task_status,
            metrics::metrics_get_summary,
            metrics::metrics_get_recent_api_calls,
            metrics::metrics_get_recent_tasks,
            metrics::metrics_get_active_tasks,
            metrics::metrics_clear_old,
            // Tool commands
            tools::tools_execute,
            tools::tools_list,
            tools::tools_set_working_dir,
            tools::tools_get_context,
        ])
        .run(tauri::generate_context!())
        .expect("error while running BUNKER application");
}
