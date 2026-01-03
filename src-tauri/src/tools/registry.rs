// BUNKER Tool Registry
// Manages registration and lookup of available tools

use super::file_ops::{ReadFileTool, SearchFilesTool, WriteFileTool};
use super::terminal::{ExecuteCommandTool, ListDirectoryTool};
use super::types::{Tool, ToolCategory, ToolContext, ToolError, ToolInfo, ToolResult};
use crate::claude::types::ToolDefinition;
use serde_json::Value;
use std::collections::HashMap;
use std::sync::Arc;

pub struct ToolRegistry {
    tools: HashMap<String, Arc<dyn Tool>>,
    context: ToolContext,
}

impl ToolRegistry {
    /// Create a new registry with default built-in tools
    pub fn new(context: ToolContext) -> Self {
        let mut registry = Self {
            tools: HashMap::new(),
            context,
        };

        // Register built-in tools
        registry.register(Arc::new(ReadFileTool));
        registry.register(Arc::new(WriteFileTool));
        registry.register(Arc::new(SearchFilesTool));
        registry.register(Arc::new(ExecuteCommandTool));
        registry.register(Arc::new(ListDirectoryTool));

        registry
    }

    /// Register a tool
    pub fn register(&mut self, tool: Arc<dyn Tool>) {
        self.tools.insert(tool.name().to_string(), tool);
    }

    /// Get a tool by name
    pub fn get(&self, name: &str) -> Option<&Arc<dyn Tool>> {
        self.tools.get(name)
    }

    /// Execute a tool by name
    pub async fn execute(&self, name: &str, input: Value) -> Result<ToolResult, ToolError> {
        let tool = self
            .tools
            .get(name)
            .ok_or_else(|| ToolError::new(format!("Tool not found: {}", name)))?;

        tool.execute(input, &self.context).await
    }

    /// Get all tool definitions for Claude API
    pub fn get_tool_definitions(&self) -> Vec<ToolDefinition> {
        self.tools
            .values()
            .map(|tool| ToolDefinition {
                name: tool.name().to_string(),
                description: tool.description().to_string(),
                input_schema: tool.input_schema(),
            })
            .collect()
    }

    /// Get tool info for display
    pub fn get_tool_info(&self) -> Vec<ToolInfo> {
        self.tools
            .values()
            .map(|tool| {
                let category = match tool.name() {
                    "read_file" | "write_file" | "search_files" | "list_directory" => {
                        ToolCategory::FileSystem
                    }
                    "execute_command" => ToolCategory::Terminal,
                    "trigger_workflow" => ToolCategory::Workflow,
                    _ => ToolCategory::Utility,
                };

                ToolInfo {
                    name: tool.name().to_string(),
                    description: tool.description().to_string(),
                    input_schema: tool.input_schema(),
                    category,
                }
            })
            .collect()
    }

    /// Update the tool context
    pub fn set_context(&mut self, context: ToolContext) {
        self.context = context;
    }

    /// Get current context
    pub fn context(&self) -> &ToolContext {
        &self.context
    }

    /// List all tool names
    pub fn list_tools(&self) -> Vec<String> {
        self.tools.keys().cloned().collect()
    }
}

impl Default for ToolRegistry {
    fn default() -> Self {
        Self::new(ToolContext::default())
    }
}
