// BUNKER Tool Commands
// Tauri commands for tool execution

use super::{ToolContext, ToolRegistry};
use crate::claude::types::ToolDefinition;
use crate::error::AppResult;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::sync::Arc;
use tauri::State;
use tokio::sync::Mutex;

/// Wrapper for thread-safe tool registry
pub struct ToolRegistryState(pub Arc<Mutex<ToolRegistry>>);

impl ToolRegistryState {
    pub fn new(context: ToolContext) -> Self {
        Self(Arc::new(Mutex::new(ToolRegistry::new(context))))
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ToolExecutionResult {
    pub success: bool,
    pub output: String,
    pub error: Option<String>,
}

/// Execute a tool by name
#[tauri::command]
pub async fn tools_execute(
    registry: State<'_, ToolRegistryState>,
    name: String,
    input: Value,
) -> AppResult<ToolExecutionResult> {
    let reg = registry.0.lock().await;
    match reg.execute(&name, input).await {
        Ok(result) => Ok(ToolExecutionResult {
            success: result.success,
            output: result.output,
            error: result.error,
        }),
        Err(e) => Ok(ToolExecutionResult {
            success: false,
            output: String::new(),
            error: Some(e.message),
        }),
    }
}

/// Get all available tool definitions
#[tauri::command]
pub async fn tools_list(
    registry: State<'_, ToolRegistryState>,
) -> AppResult<Vec<ToolDefinition>> {
    let reg = registry.0.lock().await;
    Ok(reg.get_tool_definitions())
}

/// Update tool context (e.g., working directory)
#[tauri::command]
pub async fn tools_set_working_dir(
    registry: State<'_, ToolRegistryState>,
    path: String,
) -> AppResult<()> {
    let mut reg = registry.0.lock().await;
    let mut ctx = reg.context().clone();
    ctx.working_dir = std::path::PathBuf::from(path);
    reg.set_context(ctx);
    Ok(())
}

/// Get current tool context info
#[tauri::command]
pub async fn tools_get_context(
    registry: State<'_, ToolRegistryState>,
) -> AppResult<Value> {
    let reg = registry.0.lock().await;
    let ctx = reg.context();
    Ok(serde_json::json!({
        "working_dir": ctx.working_dir.to_string_lossy(),
        "max_file_size": ctx.max_file_size,
        "command_timeout_ms": ctx.command_timeout_ms,
    }))
}
