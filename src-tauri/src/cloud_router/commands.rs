// Cloud Router Tauri Commands
// Command handlers for the cloud router functionality

use crate::cloud_router::types::*;
use crate::cloud_router::classifier::classify_task;
use crate::cloud_router::clients::{ClaudeClient, ChatGPTClient, PerplexityClient};
use crate::cloud_router::browser::{is_browser_mode_available, execute_browser_task};
use crate::validation::validate_secret_name;
use chrono::Utc;
use parking_lot::Mutex;
use std::collections::HashMap;
use std::process::Command;
use std::sync::{Arc, OnceLock};
use tauri::{AppHandle, Emitter};
use uuid::Uuid;

// ═══════════════════════════════════════════════════════════════
// GLOBAL STATE
// ═══════════════════════════════════════════════════════════════

/// Get the task queue singleton
fn task_queue() -> &'static Arc<Mutex<HashMap<String, QueuedTask>>> {
    static TASK_QUEUE: OnceLock<Arc<Mutex<HashMap<String, QueuedTask>>>> = OnceLock::new();
    TASK_QUEUE.get_or_init(|| Arc::new(Mutex::new(HashMap::new())))
}

/// Get the cost records singleton
fn cost_records() -> &'static Arc<Mutex<Vec<CostRecord>>> {
    static COST_RECORDS: OnceLock<Arc<Mutex<Vec<CostRecord>>>> = OnceLock::new();
    COST_RECORDS.get_or_init(|| Arc::new(Mutex::new(Vec::new())))
}

/// Vault path for API key retrieval
const VAULT_PATH: &str = "/c/Users/Owner/workspace/bunker/.bunker-secrets/vault";

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/// Get an API key from the vault (with input validation)
fn get_api_key(name: &str) -> Option<String> {
    // Validate the key name to prevent command injection
    if validate_secret_name(name).is_err() {
        log::warn!("Invalid API key name: {}", name);
        return None;
    }

    let output = Command::new("bash")
        .env("VAULT_SECRET_NAME", name)
        .args(["-c", &format!("{} get \"$VAULT_SECRET_NAME\"", VAULT_PATH)])
        .output()
        .ok()?;

    if output.status.success() {
        let value = String::from_utf8_lossy(&output.stdout).trim().to_string();
        if value.is_empty() {
            None
        } else {
            Some(value)
        }
    } else {
        None
    }
}

/// Check if an API key exists in the vault
fn has_api_key(name: &str) -> bool {
    get_api_key(name).is_some()
}

/// Generate a unique task ID
fn generate_task_id() -> String {
    format!("task-{}", Uuid::new_v4().to_string()[..8].to_string())
}

/// Record cost for a completed task
fn record_cost(response: &CloudResponse) {
    let record = CostRecord {
        task_id: response.task_id.clone(),
        provider: response.provider,
        model: response.model.clone(),
        tokens_input: response.tokens_input,
        tokens_output: response.tokens_output,
        cost: response.cost,
        mode: response.mode,
        timestamp: response.timestamp,
    };

    let mut records = cost_records().lock();
    records.push(record);

    // Keep only last 1000 records
    if records.len() > 1000 {
        records.remove(0);
    }
}

// ═══════════════════════════════════════════════════════════════
// TAURI COMMANDS
// ═══════════════════════════════════════════════════════════════

/// Get the status of all cloud providers
#[tauri::command]
pub fn get_cloud_status() -> CloudRouterStatus {
    let providers = vec![
        ProviderStatus {
            provider: CloudProvider::Claude,
            api_key_configured: has_api_key("ANTHROPIC_API_KEY"),
            available_models: vec![
                "claude-sonnet-4-20250514".to_string(),
                "claude-opus-4-20250514".to_string(),
                "claude-3-5-haiku-20241022".to_string(),
            ],
            is_healthy: true,
            last_check: Some(Utc::now()),
            error: None,
        },
        ProviderStatus {
            provider: CloudProvider::ChatGPT,
            api_key_configured: has_api_key("OPENAI_API_KEY"),
            available_models: vec![
                "gpt-4o".to_string(),
                "gpt-4o-mini".to_string(),
                "gpt-4-turbo".to_string(),
            ],
            is_healthy: true,
            last_check: Some(Utc::now()),
            error: None,
        },
        ProviderStatus {
            provider: CloudProvider::Perplexity,
            api_key_configured: has_api_key("PERPLEXITY_API_KEY"),
            available_models: vec![
                "llama-3.1-sonar-large-128k-online".to_string(),
                "llama-3.1-sonar-small-128k-online".to_string(),
            ],
            is_healthy: true,
            last_check: Some(Utc::now()),
            error: None,
        },
    ];

    let queue = task_queue().lock();
    let active_tasks = queue.values().filter(|t| t.status == TaskStatus::Running || t.status == TaskStatus::Streaming).count() as u32;
    let queued_tasks = queue.values().filter(|t| t.status == TaskStatus::Pending).count() as u32;

    CloudRouterStatus {
        providers,
        active_tasks,
        queued_tasks,
    }
}

/// Classify a task and get routing suggestion
#[tauri::command]
pub fn classify_task_prompt(prompt: String) -> TaskClassification {
    classify_task(&prompt)
}

/// Submit a task for execution
#[tauri::command]
pub async fn submit_task(app: AppHandle, request: TaskRequest) -> Result<String, CloudError> {
    let task_id = generate_task_id();

    // Classify if no category provided
    let classification = classify_task(&request.prompt);
    let category = request.category.unwrap_or(classification.category);

    // Determine provider
    let provider = request.preferred_provider.unwrap_or(category.suggested_provider());

    // Determine execution mode
    let mode = match request.mode {
        ExecutionMode::Auto => {
            // Auto mode: use API for streaming or complex tasks, browser for simple
            if request.stream || request.prompt.len() > 500 {
                ExecutionMode::Api
            } else {
                ExecutionMode::Api // Default to API for now, browser mode in Phase 4
            }
        }
        other => other,
    };

    // Create queued task
    let queued_task = QueuedTask {
        id: task_id.clone(),
        request: request.clone(),
        status: TaskStatus::Pending,
        provider,
        mode,
        created_at: Utc::now(),
        started_at: None,
        completed_at: None,
        partial_response: None,
        error: None,
    };

    // Add to queue
    {
        let mut queue = task_queue().lock();
        queue.insert(task_id.clone(), queued_task);
    }

    // Execute task in background
    let task_id_clone = task_id.clone();
    let app_clone = app.clone();

    tokio::spawn(async move {
        execute_task(app_clone, task_id_clone).await;
    });

    Ok(task_id)
}

/// Execute a queued task
async fn execute_task(app: AppHandle, task_id: String) {
    // Get task from queue
    let task = {
        let mut queue = task_queue().lock();
        if let Some(task) = queue.get_mut(&task_id) {
            task.status = TaskStatus::Running;
            task.started_at = Some(Utc::now());
            task.clone()
        } else {
            return;
        }
    };

    // Check if browser mode is requested
    if task.mode == ExecutionMode::Browser {
        let browser_result = execute_browser_task(task.provider, &task.request.prompt).await;

        match browser_result {
            Ok(browser_response) => {
                let response = CloudResponse {
                    task_id: task_id.clone(),
                    provider: task.provider,
                    model: "browser".to_string(),
                    content: browser_response.content.unwrap_or_default(),
                    tokens_input: 0,
                    tokens_output: 0,
                    cost: 0.0, // Browser mode is FREE
                    duration_ms: browser_response.duration_ms,
                    citations: None,
                    mode: ExecutionMode::Browser,
                    timestamp: Utc::now(),
                };

                // Record cost (will be $0)
                record_cost(&response);

                // Update queue
                {
                    let mut queue = task_queue().lock();
                    if let Some(t) = queue.get_mut(&task_id) {
                        t.status = TaskStatus::Completed;
                        t.completed_at = Some(Utc::now());
                        t.partial_response = Some(response.content.clone());
                    }
                }

                // Emit completion event
                let _ = app.emit("task-completed", response);
                return;
            }
            Err(error) => {
                let cloud_error = CloudError {
                    task_id: task_id.clone(),
                    provider: task.provider,
                    error_type: CloudErrorType::BrowserError,
                    message: error,
                    retry_after_ms: None,
                };

                // Update queue
                {
                    let mut queue = task_queue().lock();
                    if let Some(t) = queue.get_mut(&task_id) {
                        t.status = TaskStatus::Failed;
                        t.completed_at = Some(Utc::now());
                        t.error = Some(cloud_error.message.clone());
                    }
                }

                // Emit error event
                let _ = app.emit("task-error", cloud_error);
                return;
            }
        }
    }

    // API mode execution
    let result = match task.provider {
        CloudProvider::Claude => {
            let api_key = get_api_key("ANTHROPIC_API_KEY");
            let client = ClaudeClient::new(api_key);

            if task.request.stream {
                // Update status to streaming
                {
                    let mut queue = task_queue().lock();
                    if let Some(t) = queue.get_mut(&task_id) {
                        t.status = TaskStatus::Streaming;
                    }
                }

                client.send_streaming(
                    app.clone(),
                    &task_id,
                    &task.request.prompt,
                    task.request.model.as_deref(),
                    task.request.max_tokens,
                    task.request.temperature,
                ).await
            } else {
                client.send(
                    &task_id,
                    &task.request.prompt,
                    task.request.model.as_deref(),
                    task.request.max_tokens,
                    task.request.temperature,
                ).await
            }
        }
        CloudProvider::ChatGPT => {
            let api_key = get_api_key("OPENAI_API_KEY");
            let client = ChatGPTClient::new(api_key);

            if task.request.stream {
                {
                    let mut queue = task_queue().lock();
                    if let Some(t) = queue.get_mut(&task_id) {
                        t.status = TaskStatus::Streaming;
                    }
                }

                client.send_streaming(
                    app.clone(),
                    &task_id,
                    &task.request.prompt,
                    task.request.model.as_deref(),
                    task.request.max_tokens,
                    task.request.temperature,
                ).await
            } else {
                client.send(
                    &task_id,
                    &task.request.prompt,
                    task.request.model.as_deref(),
                    task.request.max_tokens,
                    task.request.temperature,
                ).await
            }
        }
        CloudProvider::Perplexity => {
            let api_key = get_api_key("PERPLEXITY_API_KEY");
            let client = PerplexityClient::new(api_key);

            if task.request.stream {
                {
                    let mut queue = task_queue().lock();
                    if let Some(t) = queue.get_mut(&task_id) {
                        t.status = TaskStatus::Streaming;
                    }
                }

                client.send_streaming(
                    app.clone(),
                    &task_id,
                    &task.request.prompt,
                    task.request.model.as_deref(),
                    task.request.max_tokens,
                    task.request.temperature,
                ).await
            } else {
                client.send(
                    &task_id,
                    &task.request.prompt,
                    task.request.model.as_deref(),
                    task.request.max_tokens,
                    task.request.temperature,
                ).await
            }
        }
    };

    // Update task status and emit result
    match result {
        Ok(response) => {
            // Record cost
            record_cost(&response);

            // Update queue
            {
                let mut queue = task_queue().lock();
                if let Some(t) = queue.get_mut(&task_id) {
                    t.status = TaskStatus::Completed;
                    t.completed_at = Some(Utc::now());
                    t.partial_response = Some(response.content.clone());
                }
            }

            // Emit completion event
            let _ = app.emit("task-completed", response);
        }
        Err(error) => {
            // Update queue
            {
                let mut queue = task_queue().lock();
                if let Some(t) = queue.get_mut(&task_id) {
                    t.status = TaskStatus::Failed;
                    t.completed_at = Some(Utc::now());
                    t.error = Some(error.message.clone());
                }
            }

            // Emit error event
            let _ = app.emit("task-error", error);
        }
    }
}

/// Cancel a running task
#[tauri::command]
pub fn cancel_task(task_id: String) -> Result<(), String> {
    let mut queue = task_queue().lock();

    if let Some(task) = queue.get_mut(&task_id) {
        if task.status == TaskStatus::Running || task.status == TaskStatus::Streaming || task.status == TaskStatus::Pending {
            task.status = TaskStatus::Cancelled;
            task.completed_at = Some(Utc::now());
            Ok(())
        } else {
            Err(format!("Task {} is not in a cancellable state", task_id))
        }
    } else {
        Err(format!("Task {} not found", task_id))
    }
}

/// Get task status
#[tauri::command]
pub fn get_task_status(task_id: String) -> Option<QueuedTask> {
    let queue = task_queue().lock();
    queue.get(&task_id).cloned()
}

/// Get recent tasks
#[tauri::command]
pub fn get_recent_tasks(limit: Option<usize>) -> Vec<QueuedTask> {
    let queue = task_queue().lock();
    let limit = limit.unwrap_or(20);

    let mut tasks: Vec<QueuedTask> = queue.values().cloned().collect();
    tasks.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    tasks.truncate(limit);
    tasks
}

/// Get cost summary
#[tauri::command]
pub fn get_cost_summary() -> CostSummary {
    let records = cost_records().lock();

    let mut provider_summaries: HashMap<CloudProvider, ProviderCostSummary> = HashMap::new();

    // Initialize summaries for all providers
    for provider in [CloudProvider::Claude, CloudProvider::ChatGPT, CloudProvider::Perplexity] {
        provider_summaries.insert(provider, ProviderCostSummary {
            provider,
            total_cost: 0.0,
            total_tasks: 0,
            total_tokens_input: 0,
            total_tokens_output: 0,
            api_tasks: 0,
            browser_tasks: 0,
        });
    }

    // Aggregate costs
    let mut earliest = Utc::now();
    let mut latest = Utc::now();

    for record in records.iter() {
        if let Some(summary) = provider_summaries.get_mut(&record.provider) {
            summary.total_cost += record.cost;
            summary.total_tasks += 1;
            summary.total_tokens_input += record.tokens_input as u64;
            summary.total_tokens_output += record.tokens_output as u64;

            match record.mode {
                ExecutionMode::Api | ExecutionMode::Auto => summary.api_tasks += 1,
                ExecutionMode::Browser => summary.browser_tasks += 1,
            }
        }

        if record.timestamp < earliest {
            earliest = record.timestamp;
        }
        if record.timestamp > latest {
            latest = record.timestamp;
        }
    }

    let providers: Vec<ProviderCostSummary> = provider_summaries.into_values().collect();
    let total_cost: f64 = providers.iter().map(|p| p.total_cost).sum();
    let total_tasks: u32 = providers.iter().map(|p| p.total_tasks).sum();

    CostSummary {
        providers,
        total_cost,
        total_tasks,
        period_start: earliest,
        period_end: latest,
    }
}

/// Clear task history (keeps last 10)
#[tauri::command]
pub fn clear_task_history() {
    let mut queue = task_queue().lock();

    // Keep only active/streaming tasks and last 10 completed
    let active: Vec<_> = queue.values()
        .filter(|t| t.status == TaskStatus::Running || t.status == TaskStatus::Streaming || t.status == TaskStatus::Pending)
        .cloned()
        .collect();

    let mut completed: Vec<_> = queue.values()
        .filter(|t| t.status == TaskStatus::Completed || t.status == TaskStatus::Failed || t.status == TaskStatus::Cancelled)
        .cloned()
        .collect();

    completed.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    completed.truncate(10);

    queue.clear();

    for task in active {
        queue.insert(task.id.clone(), task);
    }
    for task in completed {
        queue.insert(task.id.clone(), task);
    }
}

// ═══════════════════════════════════════════════════════════════
// BROWSER MODE COMMANDS
// ═══════════════════════════════════════════════════════════════

/// Get browser mode status
#[tauri::command]
pub fn get_browser_status() -> BrowserModeStatus {
    BrowserModeStatus {
        available: is_browser_mode_available(),
        kapture_available: false, // Will be updated when browser worker is initialized
        playwright_available: false,
        active_tabs: vec![],
        error: None,
    }
}

/// Browser mode status response
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct BrowserModeStatus {
    pub available: bool,
    pub kapture_available: bool,
    pub playwright_available: bool,
    pub active_tabs: Vec<String>,
    pub error: Option<String>,
}
