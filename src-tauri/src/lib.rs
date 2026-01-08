// BUNKER - Rust Backend Library
// Vault-Tec AI Command Center

mod claude;
mod error;
mod keyring;
mod metrics;
mod terminal;
mod tools;

use keyring::KeyringManager;
use metrics::MetricsManager;
use tauri::Manager;

// Internal modules
mod validation;
mod shell_security;
mod cloud_router;
mod vault;
mod system;
mod pty;
mod ollama;
mod operations;
mod db;

// Re-export types that may be needed externally
pub use vault::{Secret, VaultResult};
pub use system::{SystemInfo, SystemMetrics, DiskInfo, ProcessInfo, CommandResult, N8nStartResult};
pub use pty::{PtyOutput, PtyResult, PtySignal};
pub use ollama::{OllamaStatus, OllamaModelStatus};
pub use operations::Operation;
pub use db::{Setting, TaskRecord, Preference, Workflow};

// ═══════════════════════════════════════════════════════════════
// APP INITIALIZATION
// ═══════════════════════════════════════════════════════════════

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize database
    if let Err(e) = db::init_db() {
        eprintln!("Failed to initialize database: {}", e);
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            window.set_title("BUNKER Control System v7.6.2").unwrap();
            Ok(())
        })
        .on_window_event(|_window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                // Cleanup PTY sessions on window close
                pty::cleanup_pty_sessions();
                // Close database connection
                db::close_db();
            }
        })
        .invoke_handler(tauri::generate_handler![
            // Vault commands
            vault::vault_list,
            vault::vault_get,
            vault::vault_add,
            vault::vault_delete,
            // System commands
            system::get_system_info,
            system::get_system_metrics,
            system::get_process_list,
            system::execute_command,
            system::start_n8n,
            // PTY commands
            pty::pty_spawn,
            pty::pty_write,
            pty::pty_resize,
            pty::pty_kill,
            pty::pty_status,
            pty::pty_signal,
            // Ollama commands
            ollama::get_ollama_status,
            // Operations commands
            operations::get_operations_log,
            operations::clear_operations_log,
            operations::add_operation,
            // Database commands
            db::db_get_setting,
            db::db_set_setting,
            db::db_get_all_settings,
            db::db_save_task,
            db::db_update_task,
            db::db_get_tasks,
            db::db_get_preference,
            db::db_set_preference,
            db::db_get_preferences_by_category,
            db::db_save_workflow,
            db::db_get_workflows,
            db::db_delete_workflow,
            db::db_toggle_workflow,
            // Cloud Router commands
            cloud_router::get_cloud_status,
            cloud_router::classify_task_prompt,
            cloud_router::submit_task,
            cloud_router::cancel_task,
            cloud_router::get_task_status,
            cloud_router::get_recent_tasks,
            cloud_router::get_cost_summary,
            cloud_router::clear_task_history,
            cloud_router::get_browser_status
        ])
        .run(tauri::generate_context!())
        .expect("error while running BUNKER application");
}
