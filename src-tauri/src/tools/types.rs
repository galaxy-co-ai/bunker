// BUNKER Tool System Types
// Defines the Tool trait and supporting types

use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::path::PathBuf;

/// Error type for tool execution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolError {
    pub message: String,
    pub recoverable: bool,
}

impl ToolError {
    pub fn new(message: impl Into<String>) -> Self {
        Self {
            message: message.into(),
            recoverable: true,
        }
    }

    pub fn fatal(message: impl Into<String>) -> Self {
        Self {
            message: message.into(),
            recoverable: false,
        }
    }
}

impl std::fmt::Display for ToolError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.message)
    }
}

impl std::error::Error for ToolError {}

/// Context passed to tool execution
#[derive(Debug, Clone)]
pub struct ToolContext {
    /// Working directory for file operations
    pub working_dir: PathBuf,
    /// Maximum file size to read (bytes)
    pub max_file_size: usize,
    /// Command timeout (milliseconds)
    pub command_timeout_ms: u64,
    /// Allowed paths for file operations (sandboxing)
    pub allowed_paths: Vec<PathBuf>,
}

impl Default for ToolContext {
    fn default() -> Self {
        Self {
            working_dir: std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")),
            max_file_size: 10 * 1024 * 1024, // 10MB
            command_timeout_ms: 30000,        // 30 seconds
            allowed_paths: vec![],            // Empty = no restrictions
        }
    }
}

impl ToolContext {
    /// Check if a path is allowed for operations
    pub fn is_path_allowed(&self, path: &PathBuf) -> bool {
        if self.allowed_paths.is_empty() {
            return true; // No restrictions
        }

        let canonical = path.canonicalize().ok();
        if let Some(canon) = canonical {
            self.allowed_paths.iter().any(|allowed| {
                if let Ok(allowed_canon) = allowed.canonicalize() {
                    canon.starts_with(&allowed_canon)
                } else {
                    false
                }
            })
        } else {
            false
        }
    }
}

/// Result of tool execution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolResult {
    pub success: bool,
    pub output: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

impl ToolResult {
    pub fn success(output: impl Into<String>) -> Self {
        Self {
            success: true,
            output: output.into(),
            error: None,
        }
    }

    pub fn error(message: impl Into<String>) -> Self {
        let msg = message.into();
        Self {
            success: false,
            output: String::new(),
            error: Some(msg),
        }
    }
}

/// The Tool trait that all tools must implement
#[async_trait]
pub trait Tool: Send + Sync {
    /// Unique name of the tool
    fn name(&self) -> &str;

    /// Description shown to Claude
    fn description(&self) -> &str;

    /// JSON Schema for the input parameters
    fn input_schema(&self) -> Value;

    /// Execute the tool with given input
    async fn execute(&self, input: Value, ctx: &ToolContext) -> Result<ToolResult, ToolError>;
}

/// Metadata about a tool for the registry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolInfo {
    pub name: String,
    pub description: String,
    pub input_schema: Value,
    pub category: ToolCategory,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ToolCategory {
    FileSystem,
    Terminal,
    Network,
    Workflow,
    Utility,
}
