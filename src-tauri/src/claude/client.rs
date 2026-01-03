// BUNKER Claude API Client
// HTTP client for Anthropic's Claude API with Tool Use support

use crate::claude::types::*;
use crate::error::{AppError, AppResult};
use futures::StreamExt;
use reqwest::Client;
use serde_json::Value;
use std::pin::Pin;

const ANTHROPIC_API_URL: &str = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION: &str = "2023-06-01";

pub struct ClaudeClient {
    client: Client,
    api_key: String,
}

impl ClaudeClient {
    pub fn new(api_key: String) -> Self {
        Self {
            client: Client::new(),
            api_key,
        }
    }

    /// Send a message and get a complete response
    pub async fn send_message(
        &self,
        messages: Vec<Message>,
        model: String,
        max_tokens: u32,
        system: Option<String>,
    ) -> AppResult<SendMessageResponse> {
        let request = ApiRequest {
            model,
            max_tokens,
            messages,
            stream: Some(false),
            system,
        };

        let response = self
            .client
            .post(ANTHROPIC_API_URL)
            .header("x-api-key", &self.api_key)
            .header("anthropic-version", ANTHROPIC_VERSION)
            .header("content-type", "application/json")
            .json(&request)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(AppError::ClaudeApiError(format!(
                "API request failed: {}",
                error_text
            )));
        }

        let api_response: ApiResponse = response.json().await?;

        // Extract text content from response
        let content = api_response
            .content
            .iter()
            .filter_map(|block| block.text.clone())
            .collect::<Vec<_>>()
            .join("");

        Ok(SendMessageResponse {
            id: api_response.id,
            content,
            model: api_response.model,
            usage: api_response.usage,
            stop_reason: api_response.stop_reason,
        })
    }

    /// Stream a message response
    pub async fn stream_message(
        &self,
        messages: Vec<Message>,
        model: String,
        max_tokens: u32,
        system: Option<String>,
    ) -> AppResult<Pin<Box<dyn futures::Stream<Item = AppResult<StreamChunk>> + Send>>> {
        let request = ApiRequest {
            model,
            max_tokens,
            messages,
            stream: Some(true),
            system,
        };

        let response = self
            .client
            .post(ANTHROPIC_API_URL)
            .header("x-api-key", &self.api_key)
            .header("anthropic-version", ANTHROPIC_VERSION)
            .header("content-type", "application/json")
            .json(&request)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(AppError::ClaudeApiError(format!(
                "API request failed: {}",
                error_text
            )));
        }

        let byte_stream = response.bytes_stream();

        // Parse SSE stream
        let stream = byte_stream.filter_map(|result| async move {
            match result {
                Ok(bytes) => {
                    let text = String::from_utf8_lossy(&bytes);
                    parse_sse_chunk(&text)
                }
                Err(e) => Some(Err(AppError::HttpError(e.to_string()))),
            }
        });

        Ok(Box::pin(stream))
    }

    /// Check if API key is valid by making a minimal request
    pub async fn check_connection(&self) -> AppResult<bool> {
        // Make a minimal request to check if the API key works
        let request = ApiRequest {
            model: "claude-3-5-haiku-20241022".into(),
            max_tokens: 1,
            messages: vec![Message {
                role: Role::User,
                content: "Hi".into(),
            }],
            stream: Some(false),
            system: None,
        };

        let response = self
            .client
            .post(ANTHROPIC_API_URL)
            .header("x-api-key", &self.api_key)
            .header("anthropic-version", ANTHROPIC_VERSION)
            .header("content-type", "application/json")
            .json(&request)
            .send()
            .await?;

        Ok(response.status().is_success())
    }

    /// Send a message with tools and get a complete response
    pub async fn send_message_with_tools(
        &self,
        messages: Vec<Value>,
        model: String,
        max_tokens: u32,
        system: Option<String>,
        tools: Vec<ToolDefinition>,
    ) -> AppResult<ToolApiResponse> {
        let request = ToolApiRequest {
            model,
            max_tokens,
            messages,
            stream: Some(false),
            system,
            tools: Some(tools),
        };

        let response = self
            .client
            .post(ANTHROPIC_API_URL)
            .header("x-api-key", &self.api_key)
            .header("anthropic-version", ANTHROPIC_VERSION)
            .header("content-type", "application/json")
            .json(&request)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(AppError::ClaudeApiError(format!(
                "API request failed: {}",
                error_text
            )));
        }

        let api_response: ToolApiResponse = response.json().await?;
        Ok(api_response)
    }

    /// Stream a message with tools
    pub async fn stream_message_with_tools(
        &self,
        messages: Vec<Value>,
        model: String,
        max_tokens: u32,
        system: Option<String>,
        tools: Vec<ToolDefinition>,
    ) -> AppResult<Pin<Box<dyn futures::Stream<Item = AppResult<StreamChunk>> + Send>>> {
        let request = ToolApiRequest {
            model,
            max_tokens,
            messages,
            stream: Some(true),
            system,
            tools: Some(tools),
        };

        let response = self
            .client
            .post(ANTHROPIC_API_URL)
            .header("x-api-key", &self.api_key)
            .header("anthropic-version", ANTHROPIC_VERSION)
            .header("content-type", "application/json")
            .json(&request)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(AppError::ClaudeApiError(format!(
                "API request failed: {}",
                error_text
            )));
        }

        let byte_stream = response.bytes_stream();

        // Parse SSE stream
        let stream = byte_stream.filter_map(|result| async move {
            match result {
                Ok(bytes) => {
                    let text = String::from_utf8_lossy(&bytes);
                    parse_sse_chunk(&text)
                }
                Err(e) => Some(Err(AppError::HttpError(e.to_string()))),
            }
        });

        Ok(Box::pin(stream))
    }
}

/// Parse SSE chunk into StreamChunk
fn parse_sse_chunk(data: &str) -> Option<AppResult<StreamChunk>> {
    for line in data.lines() {
        if let Some(json_str) = line.strip_prefix("data: ") {
            if json_str.trim().is_empty() {
                continue;
            }

            match serde_json::from_str::<StreamEvent>(json_str) {
                Ok(event) => {
                    let chunk = match event {
                        StreamEvent::ContentBlockStart { content_block, .. } => {
                            // Check if it's a tool_use block starting
                            if content_block.content_type == "tool_use" {
                                if let (Some(id), Some(name)) = (content_block.id, content_block.name) {
                                    Some(StreamChunk {
                                        chunk_type: StreamChunkType::ToolUse,
                                        content: None,
                                        usage: None,
                                        error: None,
                                        tool_use: Some(ToolUseChunk {
                                            id,
                                            name,
                                            input: content_block.input.unwrap_or(serde_json::json!({})),
                                        }),
                                        stop_reason: None,
                                    })
                                } else {
                                    None
                                }
                            } else {
                                None
                            }
                        }
                        StreamEvent::ContentBlockDelta { delta, .. } => {
                            if let Some(text) = delta.text {
                                Some(StreamChunk {
                                    chunk_type: StreamChunkType::Text,
                                    content: Some(text),
                                    usage: None,
                                    error: None,
                                    tool_use: None,
                                    stop_reason: None,
                                })
                            } else {
                                None
                            }
                        }
                        StreamEvent::MessageDelta { usage, delta } => Some(StreamChunk {
                            chunk_type: StreamChunkType::Done,
                            content: None,
                            usage: Some(usage),
                            error: None,
                            tool_use: None,
                            stop_reason: delta.stop_reason,
                        }),
                        StreamEvent::MessageStop => Some(StreamChunk {
                            chunk_type: StreamChunkType::Done,
                            content: None,
                            usage: None,
                            error: None,
                            tool_use: None,
                            stop_reason: None,
                        }),
                        StreamEvent::Error { error } => Some(StreamChunk {
                            chunk_type: StreamChunkType::Error,
                            content: None,
                            usage: None,
                            error: Some(error.message),
                            tool_use: None,
                            stop_reason: None,
                        }),
                        _ => None,
                    };

                    if let Some(c) = chunk {
                        return Some(Ok(c));
                    }
                }
                Err(e) => {
                    // Skip parse errors for non-data events
                    if json_str != "[DONE]" {
                        eprintln!("SSE parse warning: {}", e);
                    }
                }
            }
        }
    }
    None
}
