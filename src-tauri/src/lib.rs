// BUNKER - Rust Backend Library
// Phase 2 will add: System monitoring, Ollama API, real-time metrics

use tauri::Manager;

// Phase 2: Add these commands
// #[tauri::command]
// fn get_system_stats() -> SystemStats { ... }
//
// #[tauri::command]
// fn get_ollama_models() -> Vec<ModelInfo> { ... }

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // Get the main window
            let window = app.get_webview_window("main").unwrap();

            // Set window title with version
            window.set_title("BUNKER Control System v7.6.2").unwrap();

            Ok(())
        })
        // Phase 2: Register commands here
        // .invoke_handler(tauri::generate_handler![get_system_stats, get_ollama_models])
        .run(tauri::generate_context!())
        .expect("error while running BUNKER application");
}
