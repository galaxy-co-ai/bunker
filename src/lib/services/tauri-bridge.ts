// BUNKER Tauri Bridge
// Typed wrappers for Tauri IPC commands

import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import type {
  Message,
  SendMessageResponse,
  StreamChunk,
  ClaudeModel,
  ToolDefinition,
  ToolExecutionResult,
} from '../types/claude';

// ═══════════════════════════════════════════════════════════════
// API KEY MANAGEMENT
// ═══════════════════════════════════════════════════════════════

export const apiKeys = {
  set: (name: string, value: string): Promise<void> =>
    invoke('set_api_key', { name, value }),

  remove: (name: string): Promise<void> =>
    invoke('remove_api_key', { name }),

  check: (name: string): Promise<boolean> =>
    invoke('check_api_key', { name }),

  list: (): Promise<string[]> =>
    invoke('list_api_keys'),
};

// ═══════════════════════════════════════════════════════════════
// CLAUDE API
// ═══════════════════════════════════════════════════════════════

export const claude = {
  sendMessage: (
    messages: Message[],
    model: string,
    maxTokens?: number,
    system?: string
  ): Promise<SendMessageResponse> =>
    invoke('claude_send_message', {
      messages,
      model,
      maxTokens: maxTokens ?? 4096,
      system: system ?? null,
    }),

  streamMessage: async (
    conversationId: string,
    messages: Message[],
    model: string,
    onChunk: (chunk: StreamChunk) => void,
    maxTokens?: number,
    system?: string
  ): Promise<UnlistenFn> => {
    // Set up listener before invoking
    const unlisten = await listen<StreamChunk>(
      `claude-stream-${conversationId}`,
      (event) => onChunk(event.payload)
    );

    // Start streaming (fire and forget - events will come through listener)
    invoke('claude_stream_message', {
      conversationId,
      messages,
      model,
      maxTokens: maxTokens ?? 4096,
      system: system ?? null,
    }).catch((error) => {
      onChunk({
        chunk_type: 'error',
        content: null,
        usage: null,
        error: String(error),
        tool_use: null,
        stop_reason: null,
      });
    });

    return unlisten;
  },

  listModels: (): Promise<ClaudeModel[]> =>
    invoke('claude_list_models'),

  checkConnection: (): Promise<boolean> =>
    invoke('claude_check_connection'),

  estimateCost: (
    model: string,
    inputTokens: number,
    outputTokens: number
  ): Promise<number> =>
    invoke('claude_estimate_cost', {
      model,
      inputTokens,
      outputTokens,
    }),
};

// ═══════════════════════════════════════════════════════════════
// TERMINAL
// ═══════════════════════════════════════════════════════════════

export const terminal = {
  create: (shell?: string): Promise<string> =>
    invoke('terminal_create', { shell: shell ?? null }),

  write: (id: string, data: string): Promise<void> =>
    invoke('terminal_write', { id, data }),

  resize: (id: string, cols: number, rows: number): Promise<void> =>
    invoke('terminal_resize', { id, cols, rows }),

  close: (id: string): Promise<void> =>
    invoke('terminal_close', { id }),

  list: (): Promise<string[]> =>
    invoke('terminal_list'),

  onOutput: (
    sessionId: string,
    callback: (data: string) => void
  ): Promise<UnlistenFn> =>
    listen<string>(`terminal-output-${sessionId}`, (event) =>
      callback(event.payload)
    ),

  onClose: (
    sessionId: string,
    callback: () => void
  ): Promise<UnlistenFn> =>
    listen(`terminal-closed-${sessionId}`, () => callback()),
};

// ═══════════════════════════════════════════════════════════════
// METRICS
// ═══════════════════════════════════════════════════════════════

export interface ApiCallMetricInput {
  id: string;
  timestamp: number;
  provider: 'claude' | 'openai' | 'perplexity' | 'gemini';
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  responseTimeMs: number;
  success: boolean;
  error?: string;
  conversationId?: string;
  agentId?: string;
}

export interface TaskMetricInput {
  id: string;
  timestamp: number;
  type: string;
  status: 'queued' | 'running' | 'success' | 'failed';
  agentId?: string;
  model?: string;
  durationMs: number;
  logs?: string[];
  output?: Record<string, unknown>;
}

export interface MetricsSummary {
  costSummary: {
    today: number;
    week: number;
    month: number;
    allTime: number;
  };
  tokenSummary: {
    input: number;
    output: number;
    total: number;
  };
  totalApiCalls: number;
  totalTasks: number;
  activeTasks: number;
  successRate: number;
}

export const metrics = {
  saveApiCall: (metric: ApiCallMetricInput): Promise<void> =>
    invoke('metrics_save_api_call', { metric }),

  saveTask: (task: TaskMetricInput): Promise<void> =>
    invoke('metrics_save_task', { task }),

  updateTaskStatus: (
    taskId: string,
    status: 'queued' | 'running' | 'success' | 'failed',
    durationMs?: number
  ): Promise<void> =>
    invoke('metrics_update_task_status', {
      taskId,
      status,
      durationMs: durationMs ?? null,
    }),

  getSummary: (): Promise<MetricsSummary> =>
    invoke('metrics_get_summary'),

  getRecentApiCalls: (limit?: number): Promise<ApiCallMetricInput[]> =>
    invoke('metrics_get_recent_api_calls', { limit: limit ?? null }),

  getRecentTasks: (limit?: number): Promise<TaskMetricInput[]> =>
    invoke('metrics_get_recent_tasks', { limit: limit ?? null }),

  getActiveTasks: (): Promise<TaskMetricInput[]> =>
    invoke('metrics_get_active_tasks'),

  clearOld: (olderThanDays?: number): Promise<void> =>
    invoke('metrics_clear_old', { olderThanDays: olderThanDays ?? null }),
};

// ═══════════════════════════════════════════════════════════════
// TOOLS
// ═══════════════════════════════════════════════════════════════

export interface ToolContext {
  working_dir: string;
  max_file_size: number;
  command_timeout_ms: number;
}

export const tools = {
  execute: (name: string, input: Record<string, unknown>): Promise<ToolExecutionResult> =>
    invoke('tools_execute', { name, input }),

  list: (): Promise<ToolDefinition[]> =>
    invoke('tools_list'),

  setWorkingDir: (path: string): Promise<void> =>
    invoke('tools_set_working_dir', { path }),

  getContext: (): Promise<ToolContext> =>
    invoke('tools_get_context'),
};
