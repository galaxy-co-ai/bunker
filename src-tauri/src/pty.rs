// PTY TERMINAL - Full pseudo-terminal for interactive programs

use std::io::{Read, Write};
use std::sync::{Arc, OnceLock};
use std::thread;
use tauri::{AppHandle, Emitter};
use serde::{Deserialize, Serialize};
use portable_pty::{CommandBuilder, PtySize, native_pty_system, MasterPty, Child};
use parking_lot::Mutex;
use log::warn;

use crate::shell_security::sanitize_pty_input;

/// Global PTY session state
struct PtySession {
    master: Box<dyn MasterPty + Send>,
    child: Box<dyn Child + Send + Sync>,
    writer: Box<dyn Write + Send>,
}

/// Get the PTY session singleton
fn pty_session() -> &'static Arc<Mutex<Option<PtySession>>> {
    static PTY_SESSION: OnceLock<Arc<Mutex<Option<PtySession>>>> = OnceLock::new();
    PTY_SESSION.get_or_init(|| Arc::new(Mutex::new(None)))
}

/// Get the PTY running flag singleton
fn pty_running() -> &'static Arc<Mutex<bool>> {
    static PTY_RUNNING: OnceLock<Arc<Mutex<bool>>> = OnceLock::new();
    PTY_RUNNING.get_or_init(|| Arc::new(Mutex::new(false)))
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PtyOutput {
    pub data: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PtyResult {
    pub success: bool,
    pub message: String,
}

/// Spawn a new PTY shell session
#[tauri::command]
pub fn pty_spawn(app: AppHandle, rows: u16, cols: u16) -> PtyResult {
    // Kill existing session if any
    {
        let mut session = pty_session().lock();
        if session.is_some() {
            *session = None;
        }
        *pty_running().lock() = false;
    }

    let pty_system = native_pty_system();

    let pair = match pty_system.openpty(PtySize {
        rows,
        cols,
        pixel_width: 0,
        pixel_height: 0,
    }) {
        Ok(pair) => pair,
        Err(e) => return PtyResult {
            success: false,
            message: format!("Failed to open PTY: {}", e),
        },
    };

    // Determine shell - use PowerShell on Windows for better ConPTY integration
    let (shell, shell_args): (&str, Vec<&str>) = if cfg!(windows) {
        // PowerShell works best with ConPTY on Windows
        ("powershell.exe", vec!["-NoLogo", "-NoExit"])
    } else {
        let shell_path = std::env::var("SHELL").unwrap_or_else(|_| "/bin/bash".to_string());
        // Leak the string to get a static reference (acceptable for shell path)
        (Box::leak(shell_path.into_boxed_str()) as &str, vec![])
    };

    let mut cmd = CommandBuilder::new(shell);
    for arg in shell_args {
        cmd.arg(arg);
    }
    cmd.cwd(std::env::var("USERPROFILE")
        .or_else(|_| std::env::var("HOME"))
        .unwrap_or_else(|_| ".".to_string())
    );

    // Set environment for proper terminal support
    cmd.env("TERM", "xterm-256color");
    cmd.env("COLORTERM", "truecolor");

    // On Windows, ensure no visible console window
    #[cfg(windows)]
    {
        cmd.env("CONPTY_SHOW_WINDOW", "0");
    }

    let child = match pair.slave.spawn_command(cmd) {
        Ok(child) => child,
        Err(e) => return PtyResult {
            success: false,
            message: format!("Failed to spawn shell: {}", e),
        },
    };

    let master = pair.master;
    let mut reader = match master.try_clone_reader() {
        Ok(r) => r,
        Err(e) => return PtyResult {
            success: false,
            message: format!("Failed to clone reader: {}", e),
        },
    };

    let writer = match master.take_writer() {
        Ok(w) => w,
        Err(e) => return PtyResult {
            success: false,
            message: format!("Failed to get writer: {}", e),
        },
    };

    // Store session
    {
        let mut session = pty_session().lock();
        *session = Some(PtySession {
            master,
            child,
            writer,
        });
        *pty_running().lock() = true;
    }

    // Spawn reader thread to emit output events
    let app_handle = app.clone();
    let running_flag = pty_running().clone();

    thread::spawn(move || {
        let mut buf = [0u8; 4096];
        loop {
            if !*running_flag.lock() {
                break;
            }

            match reader.read(&mut buf) {
                Ok(0) => {
                    // EOF - process exited
                    *running_flag.lock() = false;
                    let _ = app_handle.emit("pty-exit", ());
                    break;
                }
                Ok(n) => {
                    let data = String::from_utf8_lossy(&buf[..n]).to_string();
                    let _ = app_handle.emit("pty-output", PtyOutput { data });
                }
                Err(e) => {
                    if e.kind() != std::io::ErrorKind::WouldBlock {
                        *running_flag.lock() = false;
                        let _ = app_handle.emit("pty-error", format!("{}", e));
                        break;
                    }
                }
            }
        }
    });

    PtyResult {
        success: true,
        message: format!("PTY session started with {}", shell),
    }
}

/// Write data to the PTY with security sanitization
#[tauri::command]
pub fn pty_write(data: String) -> PtyResult {
    // Sanitize input before writing to PTY
    let sanitized_data = match sanitize_pty_input(&data) {
        Ok(safe_data) => safe_data,
        Err(e) => {
            warn!("PTY write rejected by security filter: {}", e);
            return PtyResult {
                success: false,
                message: format!("Security validation failed: {}", e),
            };
        }
    };

    let mut session = pty_session().lock();

    if let Some(ref mut pty) = *session {
        match pty.writer.write_all(sanitized_data.as_bytes()) {
            Ok(_) => {
                let _ = pty.writer.flush();
                PtyResult {
                    success: true,
                    message: "Data written".to_string(),
                }
            }
            Err(e) => PtyResult {
                success: false,
                message: format!("Write failed: {}", e),
            },
        }
    } else {
        PtyResult {
            success: false,
            message: "No PTY session active".to_string(),
        }
    }
}

/// Resize the PTY
#[tauri::command]
pub fn pty_resize(rows: u16, cols: u16) -> PtyResult {
    let session = pty_session().lock();

    if let Some(ref pty) = *session {
        match pty.master.resize(PtySize {
            rows,
            cols,
            pixel_width: 0,
            pixel_height: 0,
        }) {
            Ok(_) => PtyResult {
                success: true,
                message: format!("Resized to {}x{}", cols, rows),
            },
            Err(e) => PtyResult {
                success: false,
                message: format!("Resize failed: {}", e),
            },
        }
    } else {
        PtyResult {
            success: false,
            message: "No PTY session active".to_string(),
        }
    }
}

/// Kill the PTY session
#[tauri::command]
pub fn pty_kill() -> PtyResult {
    *pty_running().lock() = false;

    let mut session = pty_session().lock();
    if let Some(mut pty) = session.take() {
        let _ = pty.child.kill();
        PtyResult {
            success: true,
            message: "PTY session terminated".to_string(),
        }
    } else {
        PtyResult {
            success: false,
            message: "No PTY session to kill".to_string(),
        }
    }
}

/// Check if PTY is running
#[tauri::command]
pub fn pty_status() -> bool {
    *pty_running().lock()
}

/// Signal types for PTY control
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum PtySignal {
    Interrupt, // Ctrl+C - SIGINT (0x03)
    EOF,       // Ctrl+D - EOF/logout (0x04)
    Suspend,   // Ctrl+Z - SIGTSTP (0x1A)
}

/// Send a signal to the PTY (Ctrl+C, Ctrl+D, etc.)
#[tauri::command]
pub fn pty_signal(signal: PtySignal) -> PtyResult {
    let mut session = pty_session().lock();

    if let Some(ref mut pty) = *session {
        let bytes: &[u8] = match signal {
            PtySignal::Interrupt => &[0x03], // ETX - Ctrl+C
            PtySignal::EOF => &[0x04],       // EOT - Ctrl+D
            PtySignal::Suspend => &[0x1A],   // SUB - Ctrl+Z
        };

        match pty.writer.write_all(bytes) {
            Ok(_) => {
                let _ = pty.writer.flush();
                PtyResult {
                    success: true,
                    message: format!("Signal {:?} sent", signal),
                }
            }
            Err(e) => PtyResult {
                success: false,
                message: format!("Signal failed: {}", e),
            },
        }
    } else {
        PtyResult {
            success: false,
            message: "No PTY session active".to_string(),
        }
    }
}

/// Cleanup all PTY sessions (called on app close)
pub fn cleanup_pty_sessions() {
    *pty_running().lock() = false;
    let mut session = pty_session().lock();
    if let Some(mut pty) = session.take() {
        let _ = pty.child.kill();
    }
}
