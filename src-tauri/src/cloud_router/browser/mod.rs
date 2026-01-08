// Browser Mode - Automated browser interaction for cloud providers
// Uses Node.js sidecar with Kapture MCP (primary) or Playwright (fallback)

use serde::{Deserialize, Serialize};
use std::io::{BufRead, BufReader, Write};
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex, OnceLock};
use std::time::Duration;

use super::types::CloudProvider;

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrowserWorkerStatus {
    pub kapture: bool,
    pub playwright: bool,
    pub browser_connected: bool,
    pub active_tabs: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrowserResponse {
    pub success: bool,
    pub provider: String,
    #[serde(default)]
    pub mode: Option<String>,
    #[serde(default)]
    pub content: Option<String>,
    #[serde(default)]
    pub error: Option<String>,
    #[serde(default)]
    pub duration_ms: u64,
    #[serde(default)]
    pub cost: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum WorkerMessage {
    #[serde(rename = "ready")]
    Ready { kapture: bool, playwright: bool },
    #[serde(rename = "status")]
    Status(BrowserWorkerStatus),
    #[serde(rename = "result")]
    Result(BrowserResponse),
    #[serde(rename = "log")]
    Log {
        level: String,
        message: String,
        timestamp: String,
    },
    #[serde(rename = "error")]
    Error { message: String },
}

#[derive(Debug, Serialize)]
struct SendCommand {
    cmd: &'static str,
    provider: String,
    prompt: String,
}

#[derive(Debug, Serialize)]
struct StatusCommand {
    cmd: &'static str,
}

// ═══════════════════════════════════════════════════════════════
// BROWSER WORKER MANAGER
// ═══════════════════════════════════════════════════════════════

pub struct BrowserWorker {
    process: Option<Child>,
    stdin: Option<std::process::ChildStdin>,
    ready: bool,
    kapture_available: bool,
    playwright_available: bool,
}

impl BrowserWorker {
    pub fn new() -> Self {
        Self {
            process: None,
            stdin: None,
            ready: false,
            kapture_available: false,
            playwright_available: false,
        }
    }

    /// Start the browser worker sidecar process
    pub async fn start(&mut self) -> Result<(), String> {
        if self.process.is_some() {
            return Ok(());
        }

        // Find the sidecar script path
        let sidecar_path = Self::find_sidecar_path()?;

        log::info!("Starting browser worker from: {}", sidecar_path);

        // Spawn Node.js process
        let mut child = Command::new("node")
            .arg(&sidecar_path)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::inherit())
            .spawn()
            .map_err(|e| format!("Failed to spawn browser worker: {}", e))?;

        let stdin = child.stdin.take().ok_or("Failed to get stdin")?;
        let stdout = child.stdout.take().ok_or("Failed to get stdout")?;

        self.stdin = Some(stdin);
        self.process = Some(child);

        // Read initial ready message
        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            match line {
                Ok(line) => {
                    if let Ok(msg) = serde_json::from_str::<WorkerMessage>(&line) {
                        match msg {
                            WorkerMessage::Ready { kapture, playwright } => {
                                self.kapture_available = kapture;
                                self.playwright_available = playwright;
                                self.ready = true;
                                log::info!(
                                    "Browser worker ready. Kapture: {}, Playwright: {}",
                                    kapture,
                                    playwright
                                );
                                return Ok(());
                            }
                            WorkerMessage::Log { level, message, .. } => {
                                log::info!("[BrowserWorker] {}: {}", level, message);
                            }
                            _ => {}
                        }
                    }
                }
                Err(e) => {
                    return Err(format!("Failed to read from browser worker: {}", e));
                }
            }
        }

        Err("Browser worker did not send ready message".to_string())
    }

    /// Find the sidecar script path
    fn find_sidecar_path() -> Result<String, String> {
        // In development, it's relative to the project
        let dev_path = std::env::current_dir()
            .map_err(|e| e.to_string())?
            .join("sidecar")
            .join("browser-worker.js");

        if dev_path.exists() {
            return Ok(dev_path.to_string_lossy().to_string());
        }

        // In production, check next to the executable
        if let Ok(exe_path) = std::env::current_exe() {
            let prod_path = exe_path
                .parent()
                .map(|p| p.join("sidecar").join("browser-worker.js"));

            if let Some(path) = prod_path {
                if path.exists() {
                    return Ok(path.to_string_lossy().to_string());
                }
            }
        }

        Err("Could not find browser-worker.js sidecar".to_string())
    }

    /// Send a command to the worker
    fn send_command<T: Serialize>(&mut self, cmd: &T) -> Result<(), String> {
        let stdin = self.stdin.as_mut().ok_or("Worker not started")?;
        let json = serde_json::to_string(cmd).map_err(|e| e.to_string())?;
        writeln!(stdin, "{}", json).map_err(|e| format!("Failed to write to worker: {}", e))?;
        stdin.flush().map_err(|e| format!("Failed to flush: {}", e))?;
        Ok(())
    }

    /// Check if browser mode is available
    pub fn is_available(&self) -> bool {
        self.ready && (self.kapture_available || self.playwright_available)
    }

    /// Get current status
    pub fn get_status(&self) -> BrowserWorkerStatus {
        BrowserWorkerStatus {
            kapture: self.kapture_available,
            playwright: self.playwright_available,
            browser_connected: self.ready,
            active_tabs: vec![],
        }
    }

    /// Stop the worker
    pub fn stop(&mut self) {
        if let Some(mut process) = self.process.take() {
            // Send quit command
            if let Some(stdin) = self.stdin.as_mut() {
                let _ = writeln!(stdin, r#"{{"cmd":"quit"}}"#);
                let _ = stdin.flush();
            }

            // Wait briefly for graceful shutdown
            std::thread::sleep(Duration::from_millis(500));

            // Kill if still running
            let _ = process.kill();
        }
        self.stdin = None;
        self.ready = false;
    }
}

impl Drop for BrowserWorker {
    fn drop(&mut self) {
        self.stop();
    }
}

// ═══════════════════════════════════════════════════════════════
// ASYNC BROWSER CLIENT
// ═══════════════════════════════════════════════════════════════

/// Async browser automation client using tokio channels
pub struct BrowserClient {
    worker: Arc<Mutex<BrowserWorker>>,
}

impl BrowserClient {
    pub fn new() -> Self {
        Self {
            worker: Arc::new(Mutex::new(BrowserWorker::new())),
        }
    }

    /// Initialize the browser worker
    pub async fn initialize(&self) -> Result<(), String> {
        let mut worker = self.worker.lock().map_err(|e| e.to_string())?;
        worker.start().await
    }

    /// Check if browser mode is available
    pub fn is_available(&self) -> bool {
        self.worker
            .lock()
            .map(|w| w.is_available())
            .unwrap_or(false)
    }

    /// Get browser worker status
    pub fn get_status(&self) -> Option<BrowserWorkerStatus> {
        self.worker.lock().ok().map(|w| w.get_status())
    }

    /// Send a prompt to a provider via browser
    pub async fn send_prompt(
        &self,
        provider: CloudProvider,
        prompt: &str,
    ) -> Result<BrowserResponse, String> {
        // For now, we'll use a synchronous approach
        // In a full implementation, we'd use async channels

        let provider_str = match provider {
            CloudProvider::Claude => "claude",
            CloudProvider::ChatGPT => "chatgpt",
            CloudProvider::Perplexity => "perplexity",
        };

        // This is a simplified implementation
        // In production, we'd want proper async communication
        let response = self.send_prompt_sync(provider_str, prompt)?;

        Ok(response)
    }

    fn send_prompt_sync(&self, _provider: &str, _prompt: &str) -> Result<BrowserResponse, String> {
        // Placeholder - actual implementation below in execute_browser_task
        Err("Use execute_browser_task instead".to_string())
    }
}

// ═══════════════════════════════════════════════════════════════
// DIRECT CDP BROWSER EXECUTION
// ═══════════════════════════════════════════════════════════════

/// Execute a task via browser automation using CDP
pub async fn execute_browser_task(
    provider: CloudProvider,
    prompt: &str,
) -> Result<BrowserResponse, String> {
    use std::time::Instant;

    let start = Instant::now();
    let provider_str = match provider {
        CloudProvider::Claude => "claude",
        CloudProvider::ChatGPT => "chatgpt",
        CloudProvider::Perplexity => "perplexity",
    };

    // Check if CDP is available on port 9222
    let client = reqwest::Client::new();
    let tabs_response = client
        .get("http://localhost:9222/json")
        .timeout(Duration::from_secs(5))
        .send()
        .await
        .map_err(|e| format!("CDP not available. Start browser with --remote-debugging-port=9222. Error: {}", e))?;

    let tabs: Vec<serde_json::Value> = tabs_response
        .json()
        .await
        .map_err(|e| format!("Failed to parse CDP response: {}", e))?;

    // Find a suitable tab for the provider
    let provider_url = match provider {
        CloudProvider::Claude => "claude.ai",
        CloudProvider::ChatGPT => "chat.openai.com",
        CloudProvider::Perplexity => "perplexity.ai",
    };

    let tab = tabs.iter()
        .find(|t| {
            t.get("type").and_then(|v| v.as_str()) == Some("page") &&
            t.get("url").and_then(|v| v.as_str()).map(|u| u.contains(provider_url)).unwrap_or(false)
        })
        .ok_or_else(|| format!(
            "No {} tab found. Please open {} in your browser.",
            provider_str,
            match provider {
                CloudProvider::Claude => "https://claude.ai",
                CloudProvider::ChatGPT => "https://chat.openai.com",
                CloudProvider::Perplexity => "https://perplexity.ai",
            }
        ))?;

    let ws_url = tab.get("webSocketDebuggerUrl")
        .and_then(|v| v.as_str())
        .ok_or("Tab has no WebSocket URL")?;

    // For now, return a response indicating browser mode is connected but needs JS execution
    // Full implementation would use WebSocket to send CDP commands
    let duration = start.elapsed().as_millis() as u64;

    Ok(BrowserResponse {
        success: true,
        provider: provider_str.to_string(),
        mode: Some("browser".to_string()),
        content: Some(format!(
            "🌐 Browser mode connected to {} via CDP!\n\nWebSocket: {}\n\nPrompt received: \"{}\"\n\n⚠️ Note: Full browser automation requires the Kapture MCP extension or manual interaction in the browser tab.",
            provider_str,
            ws_url,
            if prompt.len() > 100 { &prompt[..100] } else { prompt }
        )),
        error: None,
        duration_ms: duration,
        cost: 0.0, // Browser mode is FREE
    })
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════

/// Get the browser client singleton
fn browser_client() -> &'static Arc<Mutex<Option<BrowserClient>>> {
    static BROWSER_CLIENT: OnceLock<Arc<Mutex<Option<BrowserClient>>>> = OnceLock::new();
    BROWSER_CLIENT.get_or_init(|| Arc::new(Mutex::new(None)))
}

/// Get or create the browser client
pub async fn get_browser_client() -> Result<Arc<Mutex<Option<BrowserClient>>>, String> {
    let mut client_guard = browser_client().lock().map_err(|e: std::sync::PoisonError<_>| e.to_string())?;

    if client_guard.is_none() {
        let client = BrowserClient::new();
        // Try to initialize, but don't fail if it doesn't work
        if let Err(e) = client.initialize().await {
            log::warn!("Browser client initialization failed: {}", e);
        }
        *client_guard = Some(client);
    }

    drop(client_guard);
    Ok(browser_client().clone())
}

/// Check if browser mode is available
pub fn is_browser_mode_available() -> bool {
    browser_client()
        .lock()
        .ok()
        .and_then(|guard: std::sync::MutexGuard<Option<BrowserClient>>| guard.as_ref().map(|c: &BrowserClient| c.is_available()))
        .unwrap_or(false)
}
