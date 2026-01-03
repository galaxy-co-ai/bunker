// BUNKER Claude API Types
// Matches Rust backend types with Tool Use support

export type Role = 'user' | 'assistant';

export interface Message {
  role: Role;
  content: string;
}

export interface Usage {
  input_tokens: number;
  output_tokens: number;
}

export interface SendMessageResponse {
  id: string;
  content: string;
  model: string;
  usage: Usage;
  stop_reason: string | null;
}

// ═══════════════════════════════════════════════════════════════
// TOOL USE TYPES
// ═══════════════════════════════════════════════════════════════

export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

export interface ToolUseChunk {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ToolExecutionResult {
  success: boolean;
  output: string;
  error: string | null;
}

export type StreamChunkType = 'text' | 'tool_use' | 'done' | 'error';

export interface StreamChunk {
  chunk_type: StreamChunkType;
  content: string | null;
  usage: Usage | null;
  error: string | null;
  tool_use: ToolUseChunk | null;
  stop_reason: string | null;
}

export interface ClaudeModel {
  id: string;
  name: string;
  context_length: number;
  input_cost_per_1k: number;
  output_cost_per_1k: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: Date;
  totalTokens: number;
  totalCost: number;
}

export interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isStreaming: boolean;
  selectedModel: string;
  error: string | null;
}
