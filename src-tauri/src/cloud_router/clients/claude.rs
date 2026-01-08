// Claude API Client
// Anthropic Claude API with streaming support

use crate::cloud_router::types::{
    CloudProvider, CloudResponse, CloudError, CloudErrorType, StreamChunk,
    ClaudeRequest, ClaudeMessage, ClaudeResponse, ExecutionMode, Pricing,
};
use chrono::Utc;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};
use std::time::Instant;

const CLAUDE_API_URL: &str = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION: &str = "2023-06-01";

pub struct ClaudeClient {
    client: Client,
    api_key: Option<String>,
}

impl ClaudeClient {
    pub fn new(api_key: Option<String>) -> Self {
        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(120))
            .build()
            .expect("Failed to create HTTP client");

        Self { client, api_key }
    }

    pub fn with_api_key(api_key: String) -> Self {
        Self::new(Some(api_key))
    }

    pub fn provider(&self) -> CloudProvider {
        CloudProvider::Claude
    }

    pub fn is_configured(&self) -> bool {
        self.api_key.is_some()
    }

    pub fn available_models(&self) -> Vec<String> {
        vec![
            "claude-sonnet-4-20250514".to_string(),
            "claude-opus-4-20250514".to_string(),
            "claude-3-5-haiku-20241022".to_string(),
        ]
    }

    /// Send a non-streaming request to Claude
    pub async fn send(
        &self,
        task_id: &str,
        prompt: &str,
        model: Option<&str>,
        max_tokens: Option<u32>,
        temperature: Option<f32>,
    ) -> Result<CloudResponse, CloudError> {
        let api_key = self.api_key.as_ref().ok_or_else(|| CloudError {
            task_id: task_id.to_string(),
            provider: CloudProvider::Claude,
            error_type: CloudErrorType::NoApiKey,
            message: "No Anthropic API key configured".to_string(),
            retry_after_ms: None,
        })?;

        let model_name = model.unwrap_or(CloudProvider::Claude.default_model());
        let max_tokens = max_tokens.unwrap_or(4096);

        let request = ClaudeRequest {
            model: model_name.to_string(),
            max_tokens,
            messages: vec![ClaudeMessage {
                role: "user".to_string(),
                content: prompt.to_string(),
            }],
            stream: Some(false),
            temperature,
        };

        let start = Instant::now();

        let response = self.client
            .post(CLAUDE_API_URL)
            .header("x-api-key", api_key)
            .header("anthropic-version", ANTHROPIC_VERSION)
            .header("content-type", "application/json")
            .json(&request)
            .send()
            .await
            .map_err(|e| CloudError {
                task_id: task_id.to_string(),
                provider: CloudProvider::Claude,
                error_type: CloudErrorType::NetworkError,
                message: format!("Network error: {}", e),
                retry_after_ms: None,
            })?;

        let status = response.status();

        if status == 401 {
            return Err(CloudError {
                task_id: task_id.to_string(),
                provider: CloudProvider::Claude,
                error_type: CloudErrorType::InvalidApiKey,
                message: "Invalid API key".to_string(),
                retry_after_ms: None,
            });
        }

        if status == 429 {
            let retry_after = response
                .headers()
                .get("retry-after")
                .and_then(|v| v.to_str().ok())
                .and_then(|s| s.parse::<u64>().ok())
                .map(|s| s * 1000);

            return Err(CloudError {
                task_id: task_id.to_string(),
                provider: CloudProvider::Claude,
                error_type: CloudErrorType::RateLimit,
                message: "Rate limit exceeded".to_string(),
                retry_after_ms: retry_after,
            });
        }

        if !status.is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(CloudError {
                task_id: task_id.to_string(),
                provider: CloudProvider::Claude,
                error_type: CloudErrorType::ProviderError,
                message: format!("API error ({}): {}", status, error_text),
                retry_after_ms: None,
            });
        }

        let claude_response: ClaudeResponse = response.json().await.map_err(|e| CloudError {
            task_id: task_id.to_string(),
            provider: CloudProvider::Claude,
            error_type: CloudErrorType::ParseError,
            message: format!("Failed to parse response: {}", e),
            retry_after_ms: None,
        })?;

        let duration_ms = start.elapsed().as_millis() as u64;
        let content = claude_response.content
            .iter()
            .filter_map(|block| block.text.as_deref())
            .collect::<Vec<&str>>()
            .join("");

        let cost = Pricing::calculate_cost(
            CloudProvider::Claude,
            model_name,
            claude_response.usage.input_tokens,
            claude_response.usage.output_tokens,
        );

        Ok(CloudResponse {
            task_id: task_id.to_string(),
            provider: CloudProvider::Claude,
            model: model_name.to_string(),
            content,
            tokens_input: claude_response.usage.input_tokens,
            tokens_output: claude_response.usage.output_tokens,
            cost,
            duration_ms,
            citations: None,
            mode: ExecutionMode::Api,
            timestamp: Utc::now(),
        })
    }

    /// Send a streaming request to Claude
    pub async fn send_streaming(
        &self,
        app: AppHandle,
        task_id: &str,
        prompt: &str,
        model: Option<&str>,
        max_tokens: Option<u32>,
        temperature: Option<f32>,
    ) -> Result<CloudResponse, CloudError> {
        let api_key = self.api_key.as_ref().ok_or_else(|| CloudError {
            task_id: task_id.to_string(),
            provider: CloudProvider::Claude,
            error_type: CloudErrorType::NoApiKey,
            message: "No Anthropic API key configured".to_string(),
            retry_after_ms: None,
        })?;

        let model_name = model.unwrap_or(CloudProvider::Claude.default_model());
        let max_tokens = max_tokens.unwrap_or(4096);

        let request = ClaudeRequest {
            model: model_name.to_string(),
            max_tokens,
            messages: vec![ClaudeMessage {
                role: "user".to_string(),
                content: prompt.to_string(),
            }],
            stream: Some(true),
            temperature,
        };

        let start = Instant::now();

        let response = self.client
            .post(CLAUDE_API_URL)
            .header("x-api-key", api_key)
            .header("anthropic-version", ANTHROPIC_VERSION)
            .header("content-type", "application/json")
            .json(&request)
            .send()
            .await
            .map_err(|e| CloudError {
                task_id: task_id.to_string(),
                provider: CloudProvider::Claude,
                error_type: CloudErrorType::NetworkError,
                message: format!("Network error: {}", e),
                retry_after_ms: None,
            })?;

        let status = response.status();

        if !status.is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(CloudError {
                task_id: task_id.to_string(),
                provider: CloudProvider::Claude,
                error_type: if status == 401 {
                    CloudErrorType::InvalidApiKey
                } else if status == 429 {
                    CloudErrorType::RateLimit
                } else {
                    CloudErrorType::ProviderError
                },
                message: format!("API error ({}): {}", status, error_text),
                retry_after_ms: None,
            });
        }

        // Process SSE stream
        let mut full_content = String::new();
        let mut input_tokens = 0u32;
        let mut output_tokens = 0u32;

        let mut stream = response.bytes_stream();
        use futures_util::StreamExt;

        let mut buffer = String::new();

        while let Some(chunk_result) = stream.next().await {
            let chunk = chunk_result.map_err(|e| CloudError {
                task_id: task_id.to_string(),
                provider: CloudProvider::Claude,
                error_type: CloudErrorType::NetworkError,
                message: format!("Stream error: {}", e),
                retry_after_ms: None,
            })?;

            buffer.push_str(&String::from_utf8_lossy(&chunk));

            // Process complete SSE events
            while let Some(event_end) = buffer.find("\n\n") {
                let event_str = buffer[..event_end].to_string();
                buffer = buffer[event_end + 2..].to_string();

                // Parse SSE event
                for line in event_str.lines() {
                    if line.starts_with("data: ") {
                        let data = &line[6..];
                        if let Ok(event) = serde_json::from_str::<ClaudeStreamEvent>(data) {
                            match event {
                                ClaudeStreamEvent::ContentBlockDelta { delta, .. } => {
                                    if let Some(text) = delta.text {
                                        full_content.push_str(&text);

                                        // Emit stream chunk
                                        let _ = app.emit("task-stream", StreamChunk {
                                            task_id: task_id.to_string(),
                                            delta: text,
                                            is_final: false,
                                        });
                                    }
                                }
                                ClaudeStreamEvent::MessageStart { message } => {
                                    if let Some(usage) = message.usage {
                                        input_tokens = usage.input_tokens;
                                    }
                                }
                                ClaudeStreamEvent::MessageDelta { usage, .. } => {
                                    if let Some(usage) = usage {
                                        output_tokens = usage.output_tokens;
                                    }
                                }
                                _ => {}
                            }
                        }
                    }
                }
            }
        }

        // Emit final chunk
        let _ = app.emit("task-stream", StreamChunk {
            task_id: task_id.to_string(),
            delta: String::new(),
            is_final: true,
        });

        let duration_ms = start.elapsed().as_millis() as u64;
        let cost = Pricing::calculate_cost(
            CloudProvider::Claude,
            model_name,
            input_tokens,
            output_tokens,
        );

        Ok(CloudResponse {
            task_id: task_id.to_string(),
            provider: CloudProvider::Claude,
            model: model_name.to_string(),
            content: full_content,
            tokens_input: input_tokens,
            tokens_output: output_tokens,
            cost,
            duration_ms,
            citations: None,
            mode: ExecutionMode::Api,
            timestamp: Utc::now(),
        })
    }
}

// Claude SSE Event types
#[derive(Debug, Deserialize)]
#[serde(tag = "type")]
enum ClaudeStreamEvent {
    #[serde(rename = "message_start")]
    MessageStart { message: ClaudeMessageStart },
    #[serde(rename = "content_block_start")]
    ContentBlockStart { index: u32, content_block: ClaudeContentBlockInfo },
    #[serde(rename = "content_block_delta")]
    ContentBlockDelta { index: u32, delta: ClaudeDelta },
    #[serde(rename = "content_block_stop")]
    ContentBlockStop { index: u32 },
    #[serde(rename = "message_delta")]
    MessageDelta { delta: ClaudeMessageDeltaInfo, usage: Option<ClaudeStreamUsage> },
    #[serde(rename = "message_stop")]
    MessageStop,
    #[serde(rename = "ping")]
    Ping,
    #[serde(other)]
    Unknown,
}

#[derive(Debug, Deserialize)]
struct ClaudeMessageStart {
    id: String,
    #[serde(rename = "type")]
    msg_type: String,
    role: String,
    model: String,
    usage: Option<ClaudeStartUsage>,
}

#[derive(Debug, Deserialize)]
struct ClaudeStartUsage {
    input_tokens: u32,
}

#[derive(Debug, Deserialize)]
struct ClaudeStreamUsage {
    output_tokens: u32,
}

#[derive(Debug, Deserialize)]
struct ClaudeContentBlockInfo {
    #[serde(rename = "type")]
    block_type: String,
    text: Option<String>,
}

#[derive(Debug, Deserialize)]
struct ClaudeDelta {
    #[serde(rename = "type")]
    delta_type: Option<String>,
    text: Option<String>,
}

#[derive(Debug, Deserialize)]
struct ClaudeMessageDeltaInfo {
    stop_reason: Option<String>,
}
