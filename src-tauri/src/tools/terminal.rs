// BUNKER Terminal Tools
// execute_command - Run shell commands

use super::types::{Tool, ToolContext, ToolError, ToolResult};
use async_trait::async_trait;
use serde_json::{json, Value};
use std::process::Stdio;
use tokio::io::AsyncReadExt;
use tokio::process::Command;
use tokio::time::{timeout, Duration};

// ═══════════════════════════════════════════════════════════════
// EXECUTE COMMAND TOOL
// ═══════════════════════════════════════════════════════════════

pub struct ExecuteCommandTool;

#[async_trait]
impl Tool for ExecuteCommandTool {
    fn name(&self) -> &str {
        "execute_command"
    }

    fn description(&self) -> &str {
        "Execute a shell command and return its output. Use for running builds, tests, git commands, etc."
    }

    fn input_schema(&self) -> Value {
        json!({
            "type": "object",
            "properties": {
                "command": {
                    "type": "string",
                    "description": "The command to execute"
                },
                "working_dir": {
                    "type": "string",
                    "description": "Working directory for the command (optional, uses default if not specified)"
                },
                "timeout_ms": {
                    "type": "integer",
                    "description": "Command timeout in milliseconds (optional, default: 30000)"
                }
            },
            "required": ["command"]
        })
    }

    async fn execute(&self, input: Value, ctx: &ToolContext) -> Result<ToolResult, ToolError> {
        let command_str = input["command"]
            .as_str()
            .ok_or_else(|| ToolError::new("Missing 'command' parameter"))?;

        let working_dir = input["working_dir"]
            .as_str()
            .map(|s| std::path::PathBuf::from(s))
            .unwrap_or_else(|| ctx.working_dir.clone());

        let timeout_ms = input["timeout_ms"]
            .as_u64()
            .unwrap_or(ctx.command_timeout_ms);

        // Determine shell based on platform
        let (shell, shell_arg) = if cfg!(windows) {
            ("cmd", "/C")
        } else {
            ("sh", "-c")
        };

        // Build command
        let mut cmd = Command::new(shell);
        cmd.arg(shell_arg)
            .arg(command_str)
            .current_dir(&working_dir)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());

        // Execute with timeout
        let result = timeout(Duration::from_millis(timeout_ms), async {
            let mut child = cmd.spawn().map_err(|e| ToolError::new(format!("Failed to spawn command: {}", e)))?;

            let mut stdout = String::new();
            let mut stderr = String::new();

            if let Some(mut out) = child.stdout.take() {
                out.read_to_string(&mut stdout).await.ok();
            }
            if let Some(mut err) = child.stderr.take() {
                err.read_to_string(&mut stderr).await.ok();
            }

            let status = child.wait().await.map_err(|e| ToolError::new(format!("Command failed: {}", e)))?;

            Ok::<_, ToolError>((status, stdout, stderr))
        })
        .await;

        match result {
            Ok(Ok((status, stdout, stderr))) => {
                let exit_code = status.code().unwrap_or(-1);
                let mut output = String::new();

                if !stdout.is_empty() {
                    output.push_str(&stdout);
                }
                if !stderr.is_empty() {
                    if !output.is_empty() {
                        output.push_str("\n--- stderr ---\n");
                    }
                    output.push_str(&stderr);
                }

                // Truncate if too long
                if output.len() > 50000 {
                    output.truncate(50000);
                    output.push_str("\n... (output truncated)");
                }

                if status.success() {
                    Ok(ToolResult::success(format!(
                        "Exit code: {}\n{}",
                        exit_code,
                        output
                    )))
                } else {
                    Ok(ToolResult {
                        success: false,
                        output: format!("Exit code: {}\n{}", exit_code, output),
                        error: Some(format!("Command exited with code {}", exit_code)),
                    })
                }
            }
            Ok(Err(e)) => Err(e),
            Err(_) => Ok(ToolResult::error(format!(
                "Command timed out after {}ms",
                timeout_ms
            ))),
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// LIST DIRECTORY TOOL
// ═══════════════════════════════════════════════════════════════

pub struct ListDirectoryTool;

#[async_trait]
impl Tool for ListDirectoryTool {
    fn name(&self) -> &str {
        "list_directory"
    }

    fn description(&self) -> &str {
        "List contents of a directory with file types and sizes."
    }

    fn input_schema(&self) -> Value {
        json!({
            "type": "object",
            "properties": {
                "path": {
                    "type": "string",
                    "description": "Directory path to list (optional, defaults to working directory)"
                },
                "recursive": {
                    "type": "boolean",
                    "description": "List recursively (default: false)"
                },
                "max_depth": {
                    "type": "integer",
                    "description": "Maximum recursion depth (default: 3)"
                }
            },
            "required": []
        })
    }

    async fn execute(&self, input: Value, ctx: &ToolContext) -> Result<ToolResult, ToolError> {
        let path = input["path"]
            .as_str()
            .map(|s| std::path::PathBuf::from(s))
            .unwrap_or_else(|| ctx.working_dir.clone());

        let recursive = input["recursive"].as_bool().unwrap_or(false);
        let max_depth = input["max_depth"].as_u64().unwrap_or(3) as usize;

        // Check path is allowed
        if !ctx.is_path_allowed(&path) {
            return Err(ToolError::new(format!(
                "Path not allowed: {}",
                path.display()
            )));
        }

        if !path.is_dir() {
            return Ok(ToolResult::error(format!(
                "Not a directory: {}",
                path.display()
            )));
        }

        let mut entries = Vec::new();
        list_dir_recursive(&path, &path, recursive, max_depth, 0, &mut entries).await?;

        if entries.is_empty() {
            Ok(ToolResult::success("Directory is empty."))
        } else {
            Ok(ToolResult::success(entries.join("\n")))
        }
    }
}

fn list_dir_recursive<'a>(
    base: &'a std::path::Path,
    path: &'a std::path::Path,
    recursive: bool,
    max_depth: usize,
    current_depth: usize,
    entries: &'a mut Vec<String>,
) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<(), ToolError>> + Send + 'a>> {
    Box::pin(async move {
        if current_depth > max_depth {
            return Ok(());
        }

        let mut dir_entries = tokio::fs::read_dir(path)
            .await
            .map_err(|e| ToolError::new(format!("Cannot read directory: {}", e)))?;

        let indent = "  ".repeat(current_depth);

        while let Some(entry) = dir_entries.next_entry().await.map_err(|e| ToolError::new(e.to_string()))? {
            let entry_path = entry.path();
            let name = entry.file_name().to_string_lossy().to_string();

            if let Ok(meta) = entry.metadata().await {
                if meta.is_dir() {
                    entries.push(format!("{}[DIR] {}/", indent, name));
                    if recursive && current_depth < max_depth {
                        list_dir_recursive(base, &entry_path, recursive, max_depth, current_depth + 1, entries).await?;
                    }
                } else {
                    let size = meta.len();
                    let size_str = if size < 1024 {
                        format!("{} B", size)
                    } else if size < 1024 * 1024 {
                        format!("{:.1} KB", size as f64 / 1024.0)
                    } else {
                        format!("{:.1} MB", size as f64 / (1024.0 * 1024.0))
                    };
                    entries.push(format!("{}[FILE] {} ({})", indent, name, size_str));
                }
            }
        }

        Ok(())
    })
}
