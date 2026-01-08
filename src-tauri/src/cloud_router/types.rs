// Cloud Router Types
// Core types for cloud API routing between Claude, ChatGPT, and Perplexity

use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

// ═══════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════

/// Cloud API providers
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum CloudProvider {
    Claude,
    ChatGPT,
    Perplexity,
}

impl CloudProvider {
    pub fn as_str(&self) -> &'static str {
        match self {
            CloudProvider::Claude => "claude",
            CloudProvider::ChatGPT => "chatgpt",
            CloudProvider::Perplexity => "perplexity",
        }
    }

    pub fn display_name(&self) -> &'static str {
        match self {
            CloudProvider::Claude => "Claude",
            CloudProvider::ChatGPT => "ChatGPT",
            CloudProvider::Perplexity => "Perplexity",
        }
    }

    pub fn api_key_name(&self) -> &'static str {
        match self {
            CloudProvider::Claude => "ANTHROPIC_API_KEY",
            CloudProvider::ChatGPT => "OPENAI_API_KEY",
            CloudProvider::Perplexity => "PERPLEXITY_API_KEY",
        }
    }

    pub fn default_model(&self) -> &'static str {
        match self {
            CloudProvider::Claude => "claude-sonnet-4-20250514",
            CloudProvider::ChatGPT => "gpt-4o",
            CloudProvider::Perplexity => "llama-3.1-sonar-large-128k-online",
        }
    }
}

/// Task categories for classification
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum TaskCategory {
    Code,
    Analysis,
    Reasoning,
    Research,
    Creative,
    General,
    Image,
}

impl TaskCategory {
    pub fn suggested_provider(&self) -> CloudProvider {
        match self {
            TaskCategory::Code => CloudProvider::Claude,
            TaskCategory::Analysis => CloudProvider::Claude,
            TaskCategory::Reasoning => CloudProvider::Claude,
            TaskCategory::Research => CloudProvider::Perplexity,
            TaskCategory::Creative => CloudProvider::ChatGPT,
            TaskCategory::General => CloudProvider::ChatGPT,
            TaskCategory::Image => CloudProvider::ChatGPT,
        }
    }

    pub fn fallback_provider(&self) -> Option<CloudProvider> {
        match self {
            TaskCategory::Code => Some(CloudProvider::ChatGPT),
            TaskCategory::Analysis => Some(CloudProvider::ChatGPT),
            TaskCategory::Reasoning => Some(CloudProvider::ChatGPT),
            TaskCategory::Research => Some(CloudProvider::Claude),
            TaskCategory::Creative => Some(CloudProvider::Claude),
            TaskCategory::General => Some(CloudProvider::Claude),
            TaskCategory::Image => None, // Only ChatGPT does images
        }
    }
}

/// Execution mode for tasks
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ExecutionMode {
    Api,      // Direct API calls (usage-based cost)
    Browser,  // Kapture MCP browser automation (free with subscription)
    Auto,     // Auto-select based on task complexity
}

impl Default for ExecutionMode {
    fn default() -> Self {
        ExecutionMode::Auto
    }
}

/// Task status
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum TaskStatus {
    Pending,
    Running,
    Streaming,
    Completed,
    Failed,
    Cancelled,
}

// ═══════════════════════════════════════════════════════════════
// REQUEST/RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════

/// Task submission request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskRequest {
    pub prompt: String,
    #[serde(default)]
    pub category: Option<TaskCategory>,
    #[serde(default)]
    pub preferred_provider: Option<CloudProvider>,
    #[serde(default)]
    pub model: Option<String>,
    #[serde(default)]
    pub stream: bool,
    #[serde(default)]
    pub mode: ExecutionMode,
    #[serde(default)]
    pub max_tokens: Option<u32>,
    #[serde(default)]
    pub temperature: Option<f32>,
}

/// Classification result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskClassification {
    pub category: TaskCategory,
    pub confidence: f32,
    pub suggested_provider: CloudProvider,
    pub reasoning: String,
    pub keywords_matched: Vec<String>,
}

/// Streaming chunk
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamChunk {
    pub task_id: String,
    pub delta: String,
    pub is_final: bool,
}

/// Complete cloud response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CloudResponse {
    pub task_id: String,
    pub provider: CloudProvider,
    pub model: String,
    pub content: String,
    pub tokens_input: u32,
    pub tokens_output: u32,
    pub cost: f64,
    pub duration_ms: u64,
    #[serde(default)]
    pub citations: Option<Vec<Citation>>,
    pub mode: ExecutionMode,
    pub timestamp: DateTime<Utc>,
}

/// Citation (for Perplexity responses)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Citation {
    pub url: String,
    pub title: Option<String>,
}

/// Error response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CloudError {
    pub task_id: String,
    pub provider: CloudProvider,
    pub error_type: CloudErrorType,
    pub message: String,
    pub retry_after_ms: Option<u64>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CloudErrorType {
    NoApiKey,
    InvalidApiKey,
    RateLimit,
    Timeout,
    NetworkError,
    ParseError,
    ProviderError,
    BrowserError,
}

// ═══════════════════════════════════════════════════════════════
// STATUS TYPES
// ═══════════════════════════════════════════════════════════════

/// Provider status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderStatus {
    pub provider: CloudProvider,
    pub api_key_configured: bool,
    pub available_models: Vec<String>,
    pub is_healthy: bool,
    pub last_check: Option<DateTime<Utc>>,
    pub error: Option<String>,
}

/// Overall cloud router status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CloudRouterStatus {
    pub providers: Vec<ProviderStatus>,
    pub active_tasks: u32,
    pub queued_tasks: u32,
}

// ═══════════════════════════════════════════════════════════════
// COST TRACKING
// ═══════════════════════════════════════════════════════════════

/// Cost record for a single task
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CostRecord {
    pub task_id: String,
    pub provider: CloudProvider,
    pub model: String,
    pub tokens_input: u32,
    pub tokens_output: u32,
    pub cost: f64,
    pub mode: ExecutionMode,
    pub timestamp: DateTime<Utc>,
}

/// Cost summary by provider
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderCostSummary {
    pub provider: CloudProvider,
    pub total_cost: f64,
    pub total_tasks: u32,
    pub total_tokens_input: u64,
    pub total_tokens_output: u64,
    pub api_tasks: u32,
    pub browser_tasks: u32,
}

/// Overall cost summary
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CostSummary {
    pub providers: Vec<ProviderCostSummary>,
    pub total_cost: f64,
    pub total_tasks: u32,
    pub period_start: DateTime<Utc>,
    pub period_end: DateTime<Utc>,
}

// ═══════════════════════════════════════════════════════════════
// TASK QUEUE
// ═══════════════════════════════════════════════════════════════

/// Task in the queue
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueuedTask {
    pub id: String,
    pub request: TaskRequest,
    pub status: TaskStatus,
    pub provider: CloudProvider,
    pub mode: ExecutionMode,
    pub created_at: DateTime<Utc>,
    pub started_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub partial_response: Option<String>,
    pub error: Option<String>,
}

// ═══════════════════════════════════════════════════════════════
// API-SPECIFIC TYPES
// ═══════════════════════════════════════════════════════════════

/// Claude API message format
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClaudeMessage {
    pub role: String,
    pub content: String,
}

/// Claude API request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClaudeRequest {
    pub model: String,
    pub max_tokens: u32,
    pub messages: Vec<ClaudeMessage>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stream: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f32>,
}

/// Claude API response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClaudeResponse {
    pub id: String,
    #[serde(rename = "type")]
    pub response_type: String,
    pub role: String,
    pub content: Vec<ClaudeContentBlock>,
    pub model: String,
    pub stop_reason: Option<String>,
    pub usage: ClaudeUsage,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClaudeContentBlock {
    #[serde(rename = "type")]
    pub content_type: String,
    pub text: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClaudeUsage {
    pub input_tokens: u32,
    pub output_tokens: u32,
}

/// OpenAI/ChatGPT API message format
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OpenAIMessage {
    pub role: String,
    pub content: String,
}

/// OpenAI API request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OpenAIRequest {
    pub model: String,
    pub messages: Vec<OpenAIMessage>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_tokens: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stream: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f32>,
}

/// OpenAI API response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OpenAIResponse {
    pub id: String,
    pub object: String,
    pub created: u64,
    pub model: String,
    pub choices: Vec<OpenAIChoice>,
    pub usage: Option<OpenAIUsage>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OpenAIChoice {
    pub index: u32,
    pub message: OpenAIMessage,
    pub finish_reason: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OpenAIUsage {
    pub prompt_tokens: u32,
    pub completion_tokens: u32,
    pub total_tokens: u32,
}

/// Perplexity API response (extends OpenAI format)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerplexityResponse {
    pub id: String,
    pub object: String,
    pub created: u64,
    pub model: String,
    pub choices: Vec<OpenAIChoice>,
    pub usage: Option<OpenAIUsage>,
    #[serde(default)]
    pub citations: Option<Vec<String>>,
}

// ═══════════════════════════════════════════════════════════════
// PRICING (approximate rates per 1M tokens)
// ═══════════════════════════════════════════════════════════════

pub struct Pricing;

impl Pricing {
    /// Get input token price per million tokens
    pub fn input_price(provider: CloudProvider, model: &str) -> f64 {
        match provider {
            CloudProvider::Claude => {
                if model.contains("opus") {
                    15.0 // $15/M input
                } else if model.contains("sonnet") {
                    3.0 // $3/M input
                } else if model.contains("haiku") {
                    0.25 // $0.25/M input
                } else {
                    3.0 // Default to sonnet pricing
                }
            }
            CloudProvider::ChatGPT => {
                if model.contains("gpt-4o") {
                    2.5 // $2.50/M input
                } else if model.contains("gpt-4-turbo") {
                    10.0 // $10/M input
                } else if model.contains("gpt-3.5") {
                    0.5 // $0.50/M input
                } else {
                    2.5 // Default to gpt-4o
                }
            }
            CloudProvider::Perplexity => {
                1.0 // ~$1/M tokens
            }
        }
    }

    /// Get output token price per million tokens
    pub fn output_price(provider: CloudProvider, model: &str) -> f64 {
        match provider {
            CloudProvider::Claude => {
                if model.contains("opus") {
                    75.0 // $75/M output
                } else if model.contains("sonnet") {
                    15.0 // $15/M output
                } else if model.contains("haiku") {
                    1.25 // $1.25/M output
                } else {
                    15.0 // Default to sonnet pricing
                }
            }
            CloudProvider::ChatGPT => {
                if model.contains("gpt-4o") {
                    10.0 // $10/M output
                } else if model.contains("gpt-4-turbo") {
                    30.0 // $30/M output
                } else if model.contains("gpt-3.5") {
                    1.5 // $1.50/M output
                } else {
                    10.0 // Default to gpt-4o
                }
            }
            CloudProvider::Perplexity => {
                1.0 // ~$1/M tokens
            }
        }
    }

    /// Calculate cost for a request
    pub fn calculate_cost(provider: CloudProvider, model: &str, input_tokens: u32, output_tokens: u32) -> f64 {
        let input_cost = (input_tokens as f64 / 1_000_000.0) * Self::input_price(provider, model);
        let output_cost = (output_tokens as f64 / 1_000_000.0) * Self::output_price(provider, model);
        input_cost + output_cost
    }
}
