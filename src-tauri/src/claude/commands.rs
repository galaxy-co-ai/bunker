// BUNKER Claude API Commands
// Tauri commands for frontend interaction

use crate::claude::client::ClaudeClient;
use crate::claude::types::*;
use crate::error::AppError;
use crate::keyring::KeyringManager;
use futures::StreamExt;
use tauri::{AppHandle, Emitter, State};

const ANTHROPIC_KEY_NAME: &str = "ANTHROPIC_API_KEY";

/// Send a message to Claude and get a complete response
#[tauri::command]
pub async fn claude_send_message(
    keyring: State<'_, KeyringManager>,
    messages: Vec<Message>,
    model: String,
    max_tokens: Option<u32>,
    system: Option<String>,
) -> Result<SendMessageResponse, AppError> {
    let api_key = keyring
        .get_api_key(ANTHROPIC_KEY_NAME)
        .await?
        .ok_or_else(|| AppError::MissingApiKey(ANTHROPIC_KEY_NAME.into()))?;

    let client = ClaudeClient::new(api_key);
    client
        .send_message(messages, model, max_tokens.unwrap_or(4096), system)
        .await
}

/// Stream a message response from Claude
/// Emits events to frontend: claude-stream-{conversation_id}
#[tauri::command]
pub async fn claude_stream_message(
    app: AppHandle,
    keyring: State<'_, KeyringManager>,
    conversation_id: String,
    messages: Vec<Message>,
    model: String,
    max_tokens: Option<u32>,
    system: Option<String>,
) -> Result<(), AppError> {
    let api_key = keyring
        .get_api_key(ANTHROPIC_KEY_NAME)
        .await?
        .ok_or_else(|| AppError::MissingApiKey(ANTHROPIC_KEY_NAME.into()))?;

    let client = ClaudeClient::new(api_key);
    let mut stream = client
        .stream_message(messages, model, max_tokens.unwrap_or(4096), system)
        .await?;

    let event_name = format!("claude-stream-{}", conversation_id);

    while let Some(chunk_result) = stream.next().await {
        match chunk_result {
            Ok(chunk) => {
                if let Err(e) = app.emit(&event_name, &chunk) {
                    eprintln!("Failed to emit stream event: {}", e);
                    break;
                }
            }
            Err(e) => {
                let error_chunk = StreamChunk {
                    chunk_type: StreamChunkType::Error,
                    content: None,
                    usage: None,
                    error: Some(e.to_string()),
                    tool_use: None,
                    stop_reason: None,
                };
                let _ = app.emit(&event_name, &error_chunk);
                break;
            }
        }
    }

    Ok(())
}

/// List available Claude models
#[tauri::command]
pub fn claude_list_models() -> Vec<ClaudeModel> {
    ClaudeModel::available_models()
}

/// Check if Claude API connection is working
#[tauri::command]
pub async fn claude_check_connection(
    keyring: State<'_, KeyringManager>,
) -> Result<bool, AppError> {
    let api_key = match keyring.get_api_key(ANTHROPIC_KEY_NAME).await? {
        Some(key) => key,
        None => return Ok(false),
    };

    let client = ClaudeClient::new(api_key);
    client.check_connection().await
}

/// Estimate cost for a message
#[tauri::command]
pub fn claude_estimate_cost(
    model: String,
    input_tokens: u32,
    output_tokens: u32,
) -> Result<f64, AppError> {
    let models = ClaudeModel::available_models();
    let model_info = models
        .iter()
        .find(|m| m.id == model)
        .ok_or_else(|| AppError::ConfigError(format!("Unknown model: {}", model)))?;

    let input_cost = (input_tokens as f64 / 1000.0) * model_info.input_cost_per_1k;
    let output_cost = (output_tokens as f64 / 1000.0) * model_info.output_cost_per_1k;

    Ok(input_cost + output_cost)
}
