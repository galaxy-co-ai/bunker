// Cloud API Clients
// HTTP clients for Claude, ChatGPT, and Perplexity APIs

pub mod claude;
pub mod chatgpt;
pub mod perplexity;

pub use claude::ClaudeClient;
pub use chatgpt::ChatGPTClient;
pub use perplexity::PerplexityClient;

use crate::cloud_router::types::{CloudProvider, CloudResponse, CloudError, CloudErrorType, StreamChunk};
use tauri::AppHandle;

/// Common trait for all cloud API clients
pub trait CloudClient {
    /// Send a non-streaming request
    fn send(&self, prompt: &str, model: Option<&str>, max_tokens: Option<u32>, temperature: Option<f32>)
        -> impl std::future::Future<Output = Result<CloudResponse, CloudError>> + Send;

    /// Send a streaming request (emits events via AppHandle)
    fn send_streaming(
        &self,
        app: AppHandle,
        task_id: &str,
        prompt: &str,
        model: Option<&str>,
        max_tokens: Option<u32>,
        temperature: Option<f32>
    ) -> impl std::future::Future<Output = Result<CloudResponse, CloudError>> + Send;

    /// Get the provider type
    fn provider(&self) -> CloudProvider;

    /// Check if the client is configured (has API key)
    fn is_configured(&self) -> bool;

    /// Get available models
    fn available_models(&self) -> Vec<String>;
}
