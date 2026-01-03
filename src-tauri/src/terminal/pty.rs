// BUNKER PTY Manager
// Cross-platform pseudo-terminal management

use crate::error::{AppError, AppResult};
use portable_pty::{native_pty_system, Child, CommandBuilder, MasterPty, PtySize};
use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::Arc;
use tauri::{AppHandle, Emitter};
use tokio::sync::Mutex;
use uuid::Uuid;

pub struct PtySession {
    pub id: String,
    master: Box<dyn MasterPty + Send>,
    #[allow(dead_code)]
    child: Box<dyn Child + Send + Sync>,
    writer: Box<dyn Write + Send>,
}

pub struct PtyManager {
    sessions: Arc<Mutex<HashMap<String, PtySession>>>,
    app: AppHandle,
}

impl PtyManager {
    pub fn new(app: AppHandle) -> Self {
        Self {
            sessions: Arc::new(Mutex::new(HashMap::new())),
            app,
        }
    }

    /// Create a new terminal session
    pub async fn create_session(&self, shell: Option<String>) -> AppResult<String> {
        let pty_system = native_pty_system();

        let pair = pty_system
            .openpty(PtySize {
                rows: 24,
                cols: 80,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| AppError::TerminalError(e.to_string()))?;

        // Detect shell based on platform
        let shell_cmd = shell.unwrap_or_else(|| {
            if cfg!(windows) {
                std::env::var("COMSPEC").unwrap_or_else(|_| "cmd.exe".into())
            } else {
                std::env::var("SHELL").unwrap_or_else(|_| "/bin/bash".into())
            }
        });

        let mut cmd = CommandBuilder::new(&shell_cmd);

        // Set up environment
        if cfg!(windows) {
            // Windows-specific setup
            cmd.env("TERM", "xterm-256color");
        } else {
            cmd.env("TERM", "xterm-256color");
            cmd.env("COLORTERM", "truecolor");
        }

        let child = pair
            .slave
            .spawn_command(cmd)
            .map_err(|e| AppError::TerminalError(e.to_string()))?;

        let writer = pair
            .master
            .take_writer()
            .map_err(|e| AppError::TerminalError(e.to_string()))?;

        let id = Uuid::new_v4().to_string();

        // Set up reader task to emit output events
        let reader = pair
            .master
            .try_clone_reader()
            .map_err(|e| AppError::TerminalError(e.to_string()))?;

        let session_id = id.clone();
        let app = self.app.clone();
        let sessions = self.sessions.clone();

        // Spawn output reader task
        std::thread::spawn(move || {
            read_pty_output(reader, session_id.clone(), app, sessions);
        });

        let session = PtySession {
            id: id.clone(),
            master: pair.master,
            child,
            writer,
        };

        self.sessions.lock().await.insert(id.clone(), session);

        Ok(id)
    }

    /// Write data to a terminal session
    pub async fn write(&self, session_id: &str, data: &str) -> AppResult<()> {
        let mut sessions = self.sessions.lock().await;
        let session = sessions
            .get_mut(session_id)
            .ok_or_else(|| AppError::SessionNotFound(session_id.into()))?;

        session
            .writer
            .write_all(data.as_bytes())
            .map_err(|e| AppError::TerminalError(e.to_string()))?;

        session
            .writer
            .flush()
            .map_err(|e| AppError::TerminalError(e.to_string()))?;

        Ok(())
    }

    /// Resize a terminal session
    pub async fn resize(&self, session_id: &str, cols: u16, rows: u16) -> AppResult<()> {
        let sessions = self.sessions.lock().await;
        let session = sessions
            .get(session_id)
            .ok_or_else(|| AppError::SessionNotFound(session_id.into()))?;

        session
            .master
            .resize(PtySize {
                rows,
                cols,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| AppError::TerminalError(e.to_string()))?;

        Ok(())
    }

    /// Close a terminal session
    pub async fn close(&self, session_id: &str) -> AppResult<()> {
        self.sessions.lock().await.remove(session_id);
        Ok(())
    }

    /// List active session IDs
    pub async fn list_sessions(&self) -> Vec<String> {
        self.sessions.lock().await.keys().cloned().collect()
    }
}

/// Background thread to read PTY output and emit events
fn read_pty_output(
    mut reader: Box<dyn Read + Send>,
    session_id: String,
    app: AppHandle,
    sessions: Arc<Mutex<HashMap<String, PtySession>>>,
) {
    let event_name = format!("terminal-output-{}", session_id);
    let mut buffer = [0u8; 4096];

    loop {
        match reader.read(&mut buffer) {
            Ok(0) => {
                // EOF - session ended
                break;
            }
            Ok(n) => {
                let output = String::from_utf8_lossy(&buffer[..n]).to_string();
                if let Err(e) = app.emit(&event_name, &output) {
                    eprintln!("Failed to emit terminal output: {}", e);
                }
            }
            Err(e) => {
                eprintln!("PTY read error: {}", e);
                break;
            }
        }
    }

    // Clean up session
    let rt = tokio::runtime::Handle::try_current();
    if let Ok(handle) = rt {
        handle.block_on(async {
            sessions.lock().await.remove(&session_id);
        });
    }

    // Emit close event
    let _ = app.emit(&format!("terminal-closed-{}", session_id), ());
}
