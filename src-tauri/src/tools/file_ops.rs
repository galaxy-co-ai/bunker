// BUNKER File Operation Tools
// read_file, write_file, search_files

use super::types::{Tool, ToolContext, ToolError, ToolResult};
use async_trait::async_trait;
use glob::glob;
use serde_json::{json, Value};
use std::path::PathBuf;
use tokio::fs;

// ═══════════════════════════════════════════════════════════════
// READ FILE TOOL
// ═══════════════════════════════════════════════════════════════

pub struct ReadFileTool;

#[async_trait]
impl Tool for ReadFileTool {
    fn name(&self) -> &str {
        "read_file"
    }

    fn description(&self) -> &str {
        "Read the contents of a file at the specified path. Returns the file content as text."
    }

    fn input_schema(&self) -> Value {
        json!({
            "type": "object",
            "properties": {
                "path": {
                    "type": "string",
                    "description": "The path to the file to read (relative to working directory or absolute)"
                },
                "max_lines": {
                    "type": "integer",
                    "description": "Maximum number of lines to read (optional, default: all)"
                }
            },
            "required": ["path"]
        })
    }

    async fn execute(&self, input: Value, ctx: &ToolContext) -> Result<ToolResult, ToolError> {
        let path_str = input["path"]
            .as_str()
            .ok_or_else(|| ToolError::new("Missing 'path' parameter"))?;

        let path = if PathBuf::from(path_str).is_absolute() {
            PathBuf::from(path_str)
        } else {
            ctx.working_dir.join(path_str)
        };

        // Check path is allowed
        if !ctx.is_path_allowed(&path) {
            return Err(ToolError::new(format!(
                "Path not allowed: {}",
                path.display()
            )));
        }

        // Check file exists
        if !path.exists() {
            return Ok(ToolResult::error(format!(
                "File not found: {}",
                path.display()
            )));
        }

        // Check file size
        let metadata = fs::metadata(&path)
            .await
            .map_err(|e| ToolError::new(format!("Cannot read file metadata: {}", e)))?;

        if metadata.len() as usize > ctx.max_file_size {
            return Ok(ToolResult::error(format!(
                "File too large: {} bytes (max: {} bytes)",
                metadata.len(),
                ctx.max_file_size
            )));
        }

        // Read file
        let content = fs::read_to_string(&path)
            .await
            .map_err(|e| ToolError::new(format!("Failed to read file: {}", e)))?;

        // Apply max_lines if specified
        let output = if let Some(max_lines) = input["max_lines"].as_u64() {
            content
                .lines()
                .take(max_lines as usize)
                .collect::<Vec<_>>()
                .join("\n")
        } else {
            content
        };

        Ok(ToolResult::success(output))
    }
}

// ═══════════════════════════════════════════════════════════════
// WRITE FILE TOOL
// ═══════════════════════════════════════════════════════════════

pub struct WriteFileTool;

#[async_trait]
impl Tool for WriteFileTool {
    fn name(&self) -> &str {
        "write_file"
    }

    fn description(&self) -> &str {
        "Write content to a file. Creates the file if it doesn't exist, or overwrites if it does."
    }

    fn input_schema(&self) -> Value {
        json!({
            "type": "object",
            "properties": {
                "path": {
                    "type": "string",
                    "description": "The path to the file to write"
                },
                "content": {
                    "type": "string",
                    "description": "The content to write to the file"
                },
                "append": {
                    "type": "boolean",
                    "description": "If true, append to file instead of overwriting (default: false)"
                }
            },
            "required": ["path", "content"]
        })
    }

    async fn execute(&self, input: Value, ctx: &ToolContext) -> Result<ToolResult, ToolError> {
        let path_str = input["path"]
            .as_str()
            .ok_or_else(|| ToolError::new("Missing 'path' parameter"))?;

        let content = input["content"]
            .as_str()
            .ok_or_else(|| ToolError::new("Missing 'content' parameter"))?;

        let append = input["append"].as_bool().unwrap_or(false);

        let path = if PathBuf::from(path_str).is_absolute() {
            PathBuf::from(path_str)
        } else {
            ctx.working_dir.join(path_str)
        };

        // Check path is allowed
        if !ctx.is_path_allowed(&path) {
            return Err(ToolError::new(format!(
                "Path not allowed: {}",
                path.display()
            )));
        }

        // Create parent directories if needed
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)
                .await
                .map_err(|e| ToolError::new(format!("Failed to create directories: {}", e)))?;
        }

        // Write or append
        if append {
            let existing = fs::read_to_string(&path).await.unwrap_or_default();
            fs::write(&path, format!("{}{}", existing, content))
                .await
                .map_err(|e| ToolError::new(format!("Failed to append to file: {}", e)))?;
        } else {
            fs::write(&path, content)
                .await
                .map_err(|e| ToolError::new(format!("Failed to write file: {}", e)))?;
        }

        Ok(ToolResult::success(format!(
            "Successfully {} {} ({} bytes)",
            if append { "appended to" } else { "wrote" },
            path.display(),
            content.len()
        )))
    }
}

// ═══════════════════════════════════════════════════════════════
// SEARCH FILES TOOL
// ═══════════════════════════════════════════════════════════════

pub struct SearchFilesTool;

#[async_trait]
impl Tool for SearchFilesTool {
    fn name(&self) -> &str {
        "search_files"
    }

    fn description(&self) -> &str {
        "Search for files using glob patterns and optionally search for text within files."
    }

    fn input_schema(&self) -> Value {
        json!({
            "type": "object",
            "properties": {
                "pattern": {
                    "type": "string",
                    "description": "Glob pattern to match files (e.g., '**/*.rs', 'src/*.ts')"
                },
                "search_text": {
                    "type": "string",
                    "description": "Optional text to search for within matched files"
                },
                "max_results": {
                    "type": "integer",
                    "description": "Maximum number of results to return (default: 50)"
                }
            },
            "required": ["pattern"]
        })
    }

    async fn execute(&self, input: Value, ctx: &ToolContext) -> Result<ToolResult, ToolError> {
        let pattern = input["pattern"]
            .as_str()
            .ok_or_else(|| ToolError::new("Missing 'pattern' parameter"))?;

        let search_text = input["search_text"].as_str();
        let max_results = input["max_results"].as_u64().unwrap_or(50) as usize;

        // Build full pattern path
        let full_pattern = ctx.working_dir.join(pattern);
        let pattern_str = full_pattern.to_string_lossy();

        let mut results = Vec::new();

        // Find matching files
        for entry in glob(&pattern_str).map_err(|e| ToolError::new(format!("Invalid pattern: {}", e)))? {
            if results.len() >= max_results {
                break;
            }

            if let Ok(path) = entry {
                if !path.is_file() {
                    continue;
                }

                // Check path is allowed
                if !ctx.is_path_allowed(&path) {
                    continue;
                }

                if let Some(text) = search_text {
                    // Search within file
                    if let Ok(content) = fs::read_to_string(&path).await {
                        let mut matches = Vec::new();
                        for (i, line) in content.lines().enumerate() {
                            if line.contains(text) {
                                matches.push(format!("  L{}: {}", i + 1, line.trim()));
                                if matches.len() >= 5 {
                                    matches.push("  ...".to_string());
                                    break;
                                }
                            }
                        }
                        if !matches.is_empty() {
                            let rel_path = path
                                .strip_prefix(&ctx.working_dir)
                                .unwrap_or(&path);
                            results.push(format!("{}:\n{}", rel_path.display(), matches.join("\n")));
                        }
                    }
                } else {
                    // Just list the file
                    let rel_path = path
                        .strip_prefix(&ctx.working_dir)
                        .unwrap_or(&path);
                    results.push(rel_path.display().to_string());
                }
            }
        }

        if results.is_empty() {
            Ok(ToolResult::success("No matching files found."))
        } else {
            Ok(ToolResult::success(format!(
                "Found {} result(s):\n{}",
                results.len(),
                results.join("\n")
            )))
        }
    }
}
