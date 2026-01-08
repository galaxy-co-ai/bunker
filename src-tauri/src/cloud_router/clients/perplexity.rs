// Perplexity API Client
// Perplexity API (OpenAI-compatible) with citation support

use crate::cloud_router::types::{
    CloudProvider, CloudResponse, CloudError, CloudErrorType, StreamChunk,
    OpenAIRequest, OpenAIMessage, Citation, ExecutionMode, Pricing,
};
use chrono::Utc;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};
use std::time::Instant;

const PERPLEXITY_API_URL: &str = "https://api.perplexity.ai/chat/completions";

pub struct PerplexityClient {
    client: Client,
    api_key: Option<String>,
}

impl PerplexityClient {
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
        CloudProvider::Perplexity
    }

    pub fn is_configured(&self) -> bool {
        self.api_key.is_some()
    }

    pub fn available_models(&self) -> Vec<String> {
        vec![
            "llama-3.1-sonar-large-128k-online".to_string(),
            "llama-3.1-sonar-small-128k-online".to_string(),
            "llama-3.1-sonar-huge-128k-online".to_string(),
        ]
    }

    /// Send a non-streaming request to Perplexity
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
            provider: CloudProvider::Perplexity,
            error_type: CloudErrorType::NoApiKey,
            message: "No Perplexity API key configured".to_string(),
            retry_after_ms: None,
        })?;

        let model_name = model.unwrap_or(CloudProvider::Perplexity.default_model());

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
            .post(PERPLEXITY_API_URL)
            .header("Authorization", format!("Bearer {}", api_key))
            .header("content-type", "application/json")
            .json(&request)
            .send()
            .await
            .map_err(|e| CloudError {
                task_id: task_id.to_string(),
                provider: CloudProvider::Perplexity,
                error_type: CloudErrorType::NetworkError,
                message: format!("Network error: {}", e),
                retry_after_ms: None,
            })?;

        let status = response.status();

        if status == 401 {
            return Err(CloudError {
                task_id: task_id.to_string(),
                provider: CloudProvider::Perplexity,
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
                provider: CloudProvider::Perplexity,
                error_type: CloudErrorType::RateLimit,
                message: "Rate limit exceeded".to_string(),
                retry_after_ms: retry_after,
            });
        }

        if !status.is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(CloudError {
                task_id: task_id.to_string(),
                provider: CloudProvider::Perplexity,
                error_type: CloudErrorType::ProviderError,
                message: format!("API error ({}): {}", status, error_text),
                retry_after_ms: None,
            });
        }

        let perplexity_response: PerplexityResponse = response.json().await.map_err(|e| CloudError {
            task_id: task_id.to_string(),
            provider: CloudProvider::Perplexity,
            error_type: CloudErrorType::ParseError,
            message: format!("Failed to parse response: {}", e),
            retry_after_ms: None,
        })?;

        let duration_ms = start.elapsed().as_millis() as u64;

        let content = perplexity_response.choices
            .first()
            .map(|c| c.message.content.clone())
            .unwrap_or_default();

        let (input_tokens, output_tokens) = perplexity_response.usage
            .map(|u| (u.prompt_tokens, u.completion_tokens))
            .unwrap_or((0, 0));

        // Parse citations
        let citations = perplexity_response.citations.map(|urls| {
            urls.into_iter()
                .map(|url| Citation { url, title: None })
                .collect()
        });

        let cost = Pricing::calculate_cost(
            CloudProvider::Perplexity,
            model_name,
            input_tokens,
            output_tokens,
        );

        Ok(CloudResponse {
            task_id: task_id.to_string(),
            provider: CloudProvider::Perplexity,
            model: model_name.to_string(),
            content,
            tokens_input: input_tokens,
            tokens_output: output_tokens,
            cost,
            duration_ms,
            citations,
            mode: ExecutionMode::Api,
            timestamp: Utc::now(),
        })
    }

    /// Send a streaming request to Perplexity
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
            provider: CloudProvider::Perplexity,
            error_type: CloudErrorType::NoApiKey,
            message: "No Perplexity API key configured".to_string(),
            retry_after_ms: None,
        })?;

        let model_name = model.unwrap_or(CloudProvider::Perplexity.default_model());

        let request = OpenAIRequest {
            model: model_name.to_string(),
            messages: vec![OpenAIMessage {
                role: "user".to_string(),
                content: prompt.to_string(),
            }],
            max_tokens,
            stream: Some(true),
            temperature,
        };

        let start = Instant::now();

        let response = self.client
            .post(PERPLEXITY_API_URL)
            .header("Authorization", format!("Bearer {}", api_key))
            .header("content-type", "application/json")
            .json(&request)
            .send()
            .await
            .map_err(|e| CloudError {
                task_id: task_id.to_string(),
                provider: CloudProvider::Perplexity,
                error_type: CloudErrorType::NetworkError,
                message: format!("Network error: {}", e),
                retry_after_ms: None,
            })?;

        let status = response.status();

        if !status.is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(CloudError {
                task_id: task_id.to_string(),
                provider: CloudProvider::Perplexity,
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
        let mut citations: Option<Vec<Citation>> = None;

        let mut stream = response.bytes_stream();
        use futures_util::StreamExt;

        let mut buffer = String::new();

        while let Some(chunk_result) = stream.next().await {
            let chunk = chunk_result.map_err(|e| CloudError {
                task_id: task_id.to_string(),
                provider: CloudProvider::Perplexity,
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

                    if let Ok(event) = serde_json::from_str::<PerplexityStreamChunk>(data) {
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

                        // Handle citations (may come in final chunk)
                        if let Some(urls) = event.citations {
                            citations = Some(
                                urls.into_iter()
                                    .map(|url| Citation { url, title: None })
                                    .collect()
                            );
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
            CloudProvider::Perplexity,
            model_name,
            input_tokens,
            output_tokens,
        );

        Ok(CloudResponse {
            task_id: task_id.to_string(),
            provider: CloudProvider::Perplexity,
            model: model_name.to_string(),
            content: full_content,
            tokens_input: input_tokens,
            tokens_output: output_tokens,
            cost,
            duration_ms,
            citations,
            mode: ExecutionMode::Api,
            timestamp: Utc::now(),
        })
    }
}

// Perplexity Response types
#[derive(Debug, Deserialize)]
struct PerplexityResponse {
    id: String,
    object: String,
    created: u64,
    model: String,
    choices: Vec<PerplexityChoice>,
    usage: Option<PerplexityUsage>,
    #[serde(default)]
    citations: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
struct PerplexityChoice {
    index: u32,
    message: PerplexityMessage,
    finish_reason: Option<String>,
}

#[derive(Debug, Deserialize)]
struct PerplexityMessage {
    role: String,
    content: String,
}

#[derive(Debug, Deserialize)]
struct PerplexityUsage {
    prompt_tokens: u32,
    completion_tokens: u32,
    total_tokens: u32,
}

// Perplexity SSE Event types
#[derive(Debug, Deserialize)]
struct PerplexityStreamChunk {
    id: String,
    object: String,
    created: u64,
    model: String,
    choices: Vec<PerplexityStreamChoice>,
    usage: Option<PerplexityUsage>,
    #[serde(default)]
    citations: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
struct PerplexityStreamChoice {
    index: u32,
    delta: PerplexityDelta,
    finish_reason: Option<String>,
}

#[derive(Debug, Deserialize)]
struct PerplexityDelta {
    role: Option<String>,
    content: Option<String>,
}
