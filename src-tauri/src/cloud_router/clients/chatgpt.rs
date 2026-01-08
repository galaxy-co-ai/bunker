// ChatGPT API Client
// OpenAI ChatGPT API with streaming support

use crate::cloud_router::types::{
    CloudProvider, CloudResponse, CloudError, CloudErrorType, StreamChunk,
    OpenAIRequest, OpenAIMessage, OpenAIResponse, ExecutionMode, Pricing,
};
use chrono::Utc;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};
use std::time::Instant;

const OPENAI_API_URL: &str = "https://api.openai.com/v1/chat/completions";

pub struct ChatGPTClient {
    client: Client,
    api_key: Option<String>,
}

impl ChatGPTClient {
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
        CloudProvider::ChatGPT
    }

    pub fn is_configured(&self) -> bool {
        self.api_key.is_some()
    }

    pub fn available_models(&self) -> Vec<String> {
        vec![
            "gpt-4o".to_string(),
            "gpt-4o-mini".to_string(),
            "gpt-4-turbo".to_string(),
            "gpt-3.5-turbo".to_string(),
        ]
    }

    /// Send a non-streaming request to ChatGPT
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
            provider: CloudProvider::ChatGPT,
            error_type: CloudErrorType::NoApiKey,
            message: "No OpenAI API key configured".to_string(),
            retry_after_ms: None,
        })?;

        let model_name = model.unwrap_or(CloudProvider::ChatGPT.default_model());

        let request = OpenAIRequest {
            model: model_name.to_string(),
            messages: vec![OpenAIMessage {
                role: "user".to_string(),
                content: prompt.to_string(),
            }],
            max_tokens,
            stream: Some(false),
            temperature,
        };

        let start = Instant::now();

        let response = self.client
            .post(OPENAI_API_URL)
            .header("Authorization", format!("Bearer {}", api_key))
            .header("content-type", "application/json")
            .json(&request)
            .send()
            .await
            .map_err(|e| CloudError {
                task_id: task_id.to_string(),
                provider: CloudProvider::ChatGPT,
                error_type: CloudErrorType::NetworkError,
                message: format!("Network error: {}", e),
                retry_after_ms: None,
            })?;

        let status = response.status();

        if status == 401 {
            return Err(CloudError {
                task_id: task_id.to_string(),
                provider: CloudProvider::ChatGPT,
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
                provider: CloudProvider::ChatGPT,
                error_type: CloudErrorType::RateLimit,
                message: "Rate limit exceeded".to_string(),
                retry_after_ms: retry_after,
            });
        }

        if !status.is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(CloudError {
                task_id: task_id.to_string(),
                provider: CloudProvider::ChatGPT,
                error_type: CloudErrorType::ProviderError,
                message: format!("API error ({}): {}", status, error_text),
                retry_after_ms: None,
            });
        }

        let openai_response: OpenAIResponse = response.json().await.map_err(|e| CloudError {
            task_id: task_id.to_string(),
            provider: CloudProvider::ChatGPT,
            error_type: CloudErrorType::ParseError,
            message: format!("Failed to parse response: {}", e),
            retry_after_ms: None,
        })?;

        let duration_ms = start.elapsed().as_millis() as u64;

        let content = openai_response.choices
            .first()
            .map(|c| c.message.content.clone())
            .unwrap_or_default();

        let (input_tokens, output_tokens) = openai_response.usage
            .map(|u| (u.prompt_tokens, u.completion_tokens))
            .unwrap_or((0, 0));

        let cost = Pricing::calculate_cost(
            CloudProvider::ChatGPT,
            model_name,
            input_tokens,
            output_tokens,
        );

        Ok(CloudResponse {
            task_id: task_id.to_string(),
            provider: CloudProvider::ChatGPT,
            model: model_name.to_string(),
            content,
            tokens_input: input_tokens,
            tokens_output: output_tokens,
            cost,
            duration_ms,
            citations: None,
            mode: ExecutionMode::Api,
            timestamp: Utc::now(),
        })
    }

    /// Send a streaming request to ChatGPT
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
            provider: CloudProvider::ChatGPT,
            error_type: CloudErrorType::NoApiKey,
            message: "No OpenAI API key configured".to_string(),
            retry_after_ms: None,
        })?;

        let model_name = model.unwrap_or(CloudProvider::ChatGPT.default_model());

        let request = OpenAIStreamRequest {
            model: model_name.to_string(),
            messages: vec![OpenAIMessage {
                role: "user".to_string(),
                content: prompt.to_string(),
            }],
            max_tokens,
            stream: true,
            stream_options: Some(StreamOptions { include_usage: true }),
            temperature,
        };

        let start = Instant::now();

        let response = self.client
            .post(OPENAI_API_URL)
            .header("Authorization", format!("Bearer {}", api_key))
            .header("content-type", "application/json")
            .json(&request)
            .send()
            .await
            .map_err(|e| CloudError {
                task_id: task_id.to_string(),
                provider: CloudProvider::ChatGPT,
                error_type: CloudErrorType::NetworkError,
                message: format!("Network error: {}", e),
                retry_after_ms: None,
            })?;

        let status = response.status();

        if !status.is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(CloudError {
                task_id: task_id.to_string(),
                provider: CloudProvider::ChatGPT,
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
                provider: CloudProvider::ChatGPT,
                error_type: CloudErrorType::NetworkError,
                message: format!("Stream error: {}", e),
                retry_after_ms: None,
            })?;

            buffer.push_str(&String::from_utf8_lossy(&chunk));

            // Process complete SSE events
            while let Some(line_end) = buffer.find('\n') {
                let line = buffer[..line_end].trim().to_string();
                buffer = buffer[line_end + 1..].to_string();

                if line.is_empty() {
                    continue;
                }

                if line.starts_with("data: ") {
                    let data = &line[6..];

                    if data == "[DONE]" {
                        break;
                    }

                    if let Ok(event) = serde_json::from_str::<OpenAIStreamChunk>(data) {
                        // Handle content delta
                        if let Some(choice) = event.choices.first() {
                            if let Some(content) = &choice.delta.content {
                                full_content.push_str(content);

                                // Emit stream chunk
                                let _ = app.emit("task-stream", StreamChunk {
                                    task_id: task_id.to_string(),
                                    delta: content.clone(),
                                    is_final: false,
                                });
                            }
                        }

                        // Handle usage (final chunk)
                        if let Some(usage) = event.usage {
                            input_tokens = usage.prompt_tokens;
                            output_tokens = usage.completion_tokens;
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
            CloudProvider::ChatGPT,
            model_name,
            input_tokens,
            output_tokens,
        );

        Ok(CloudResponse {
            task_id: task_id.to_string(),
            provider: CloudProvider::ChatGPT,
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

// OpenAI Stream-specific request (with stream_options)
#[derive(Debug, Serialize)]
struct OpenAIStreamRequest {
    model: String,
    messages: Vec<OpenAIMessage>,
    #[serde(skip_serializing_if = "Option::is_none")]
    max_tokens: Option<u32>,
    stream: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    stream_options: Option<StreamOptions>,
    #[serde(skip_serializing_if = "Option::is_none")]
    temperature: Option<f32>,
}

#[derive(Debug, Serialize)]
struct StreamOptions {
    include_usage: bool,
}

// OpenAI SSE Event types
#[derive(Debug, Deserialize)]
struct OpenAIStreamChunk {
    id: String,
    object: String,
    created: u64,
    model: String,
    choices: Vec<OpenAIStreamChoice>,
    usage: Option<OpenAIStreamUsage>,
}

#[derive(Debug, Deserialize)]
struct OpenAIStreamChoice {
    index: u32,
    delta: OpenAIDelta,
    finish_reason: Option<String>,
}

#[derive(Debug, Deserialize)]
struct OpenAIDelta {
    role: Option<String>,
    content: Option<String>,
}

#[derive(Debug, Deserialize)]
struct OpenAIStreamUsage {
    prompt_tokens: u32,
    completion_tokens: u32,
    total_tokens: u32,
}
