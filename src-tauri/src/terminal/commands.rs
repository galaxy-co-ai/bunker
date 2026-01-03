// BUNKER Terminal Commands
// Tauri commands for terminal management

use crate::error::AppError;
use crate::terminal::pty::PtyManager;
use tauri::State;

/// Create a new terminal session
#[tauri::command]
pub async fn terminal_create(
    pty_manager: State<'_, PtyManager>,
    shell: Option<String>,
) -> Result<String, AppError> {
    pty_manager.create_session(shell).await
}

/// Write data to a terminal session
#[tauri::command]
pub async fn terminal_write(
    pty_manager: State<'_, PtyManager>,
    id: String,
    data: String,
) -> Result<(), AppError> {
    pty_manager.write(&id, &data).await
}

/// Resize a terminal session
#[tauri::command]
pub async fn terminal_resize(
    pty_manager: State<'_, PtyManager>,
    id: String,
    cols: u16,
    rows: u16,
) -> Result<(), AppError> {
    pty_manager.resize(&id, cols, rows).await
}

/// Close a terminal session
#[tauri::command]
pub async fn terminal_close(
    pty_manager: State<'_, PtyManager>,
    id: String,
) -> Result<(), AppError> {
    pty_manager.close(&id).await
}

/// List active terminal sessions
#[tauri::command]
pub async fn terminal_list(pty_manager: State<'_, PtyManager>) -> Result<Vec<String>, AppError> {
    Ok(pty_manager.list_sessions().await)
}
