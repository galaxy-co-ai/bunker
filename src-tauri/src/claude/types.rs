// BUNKER Claude API Types
// Matches Anthropic API structures with Tool Use support

use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Role {
    User,
    Assistant,
}

// ═══════════════════════════════════════════════════════════════
// TOOL DEFINITIONS
// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolDefinition {
    pub name: String,
    pub description: String,
    pub input_schema: Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolUse {
    pub id: String,
    pub name: String,
    pub input: Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolResult {
    #[serde(rename = "type")]
    pub result_type: String, // Always "tool_result"
    pub tool_use_id: String,
    pub content: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_error: Option<bool>,
}

// ═══════════════════════════════════════════════════════════════
// MESSAGE CONTENT (supports text, tool_use, tool_result)
// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum MessageContent {
    #[serde(rename = "text")]
    Text { text: String },
    #[serde(rename = "tool_use")]
    ToolUse {
        id: String,
        name: String,
        input: Value,
    },
    #[serde(rename = "tool_result")]
    ToolResult {
        tool_use_id: String,
        content: String,
        #[serde(skip_serializing_if = "Option::is_none")]
        is_error: Option<bool>,
    },
}

// Simple message with string content (for basic chat)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Message {
    pub role: Role,
    pub content: String,
}

// Rich message with content blocks (for tool use)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RichMessage {
    pub role: Role,
    pub content: Vec<MessageContent>,
}

// Basic API request (no tools)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiRequest {
    pub model: String,
    pub max_tokens: u32,
    pub messages: Vec<Message>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stream: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub system: Option<String>,
}

// API request with tool support
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolApiRequest {
    pub model: String,
    pub max_tokens: u32,
    pub messages: Vec<Value>, // Can be Message or RichMessage
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stream: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub system: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tools: Option<Vec<ToolDefinition>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Usage {
    pub input_tokens: u32,
    pub output_tokens: u32,
}

// Response content block (can be text or tool_use)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum ResponseContentBlock {
    #[serde(rename = "text")]
    Text { text: String },
    #[serde(rename = "tool_use")]
    ToolUse {
        id: String,
        name: String,
        input: Value,
    },
}

// Legacy content block for backwards compatibility
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContentBlock {
    #[serde(rename = "type")]
    pub content_type: String,
    pub text: Option<String>,
    // Tool use fields
    pub id: Option<String>,
    pub name: Option<String>,
    pub input: Option<Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiResponse {
    pub id: String,
    #[serde(rename = "type")]
    pub response_type: String,
    pub role: Role,
    pub content: Vec<ContentBlock>,
    pub model: String,
    pub stop_reason: Option<String>, // "end_turn", "tool_use", "max_tokens", "stop_sequence"
    pub usage: Usage,
}

// Rich API response with typed content blocks
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolApiResponse {
    pub id: String,
    #[serde(rename = "type")]
    pub response_type: String,
    pub role: Role,
    pub content: Vec<ResponseContentBlock>,
    pub model: String,
    pub stop_reason: Option<String>,
    pub usage: Usage,
}

// Streaming response types
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum StreamEvent {
    #[serde(rename = "message_start")]
    MessageStart { message: StreamMessageStart },

    #[serde(rename = "content_block_start")]
    ContentBlockStart { index: u32, content_block: ContentBlock },

    #[serde(rename = "content_block_delta")]
    ContentBlockDelta { index: u32, delta: ContentDelta },

    #[serde(rename = "content_block_stop")]
    ContentBlockStop { index: u32 },

    #[serde(rename = "message_delta")]
    MessageDelta { delta: MessageDelta, usage: Usage },

    #[serde(rename = "message_stop")]
    MessageStop,

    #[serde(rename = "ping")]
    Ping,

    #[serde(rename = "error")]
    Error { error: ApiError },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamMessageStart {
    pub id: String,
    #[serde(rename = "type")]
    pub message_type: String,
    pub role: Role,
    pub model: String,
    pub usage: Usage,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContentDelta {
    #[serde(rename = "type")]
    pub delta_type: String, // "text_delta" or "input_json_delta"
    pub text: Option<String>,
    pub partial_json: Option<String>, // For tool_use input streaming
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MessageDelta {
    pub stop_reason: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiError {
    #[serde(rename = "type")]
    pub error_type: String,
    pub message: String,
}

// Frontend-facing types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SendMessageResponse {
    pub id: String,
    pub content: String,
    pub model: String,
    pub usage: Usage,
    pub stop_reason: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamChunk {
    pub chunk_type: StreamChunkType,
    pub content: Option<String>,
    pub usage: Option<Usage>,
    pub error: Option<String>,
    // Tool use fields
    pub tool_use: Option<ToolUseChunk>,
    pub stop_reason: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolUseChunk {
    pub id: String,
    pub name: String,
    pub input: Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum StreamChunkType {
    Text,
    ToolUse,
    Done,
    Error,
}

// Model information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClaudeModel {
    pub id: String,
    pub name: String,
    pub context_length: u32,
    pub input_cost_per_1k: f64,
    pub output_cost_per_1k: f64,
}

impl ClaudeModel {
    pub fn available_models() -> Vec<ClaudeModel> {
        vec![
            ClaudeModel {
                id: "claude-sonnet-4-20250514".into(),
                name: "Claude Sonnet 4".into(),
                context_length: 200000,
                input_cost_per_1k: 0.003,
                output_cost_per_1k: 0.015,
            },
            ClaudeModel {
                id: "claude-opus-4-20250514".into(),
                name: "Claude Opus 4".into(),
                context_length: 200000,
                input_cost_per_1k: 0.015,
                output_cost_per_1k: 0.075,
            },
            ClaudeModel {
                id: "claude-3-5-haiku-20241022".into(),
                name: "Claude 3.5 Haiku".into(),
                context_length: 200000,
                input_cost_per_1k: 0.001,
                output_cost_per_1k: 0.005,
            },
        ]
    }
}
