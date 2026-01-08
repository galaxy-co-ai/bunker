// ═══════════════════════════════════════════════════════════════
// BUNKER Cloud Router - TypeScript Types
// Mirrors the Rust types in src-tauri/src/cloud_router/types.rs
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════

export type CloudProvider = 'claude' | 'chatgpt' | 'perplexity';

export type TaskCategory =
  | 'code'
  | 'analysis'
  | 'reasoning'
  | 'research'
  | 'creative'
  | 'general'
  | 'image';

export type ExecutionMode = 'api' | 'browser' | 'auto';

export type TaskStatus =
  | 'pending'
  | 'running'
  | 'streaming'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type CloudErrorType =
  | 'no_api_key'
  | 'invalid_api_key'
  | 'rate_limit'
  | 'timeout'
  | 'network_error'
  | 'parse_error'
  | 'provider_error'
  | 'browser_error';

// ═══════════════════════════════════════════════════════════════
// PROVIDER METADATA
// ═══════════════════════════════════════════════════════════════

export const PROVIDER_INFO: Record<CloudProvider, {
  name: string;
  icon: string;
  apiKeyName: string;
  defaultModel: string;
  color: string;
  apiDocsUrl: string;
}> = {
  claude: {
    name: 'Claude',
    icon: '🧠',
    apiKeyName: 'ANTHROPIC_API_KEY',
    defaultModel: 'claude-sonnet-4-20250514',
    color: '#D97706', // Amber
    apiDocsUrl: 'https://console.anthropic.com/settings/keys',
  },
  chatgpt: {
    name: 'ChatGPT',
    icon: '💬',
    apiKeyName: 'OPENAI_API_KEY',
    defaultModel: 'gpt-4o',
    color: '#10B981', // Green
    apiDocsUrl: 'https://platform.openai.com/api-keys',
  },
  perplexity: {
    name: 'Perplexity',
    icon: '🔍',
    apiKeyName: 'PERPLEXITY_API_KEY',
    defaultModel: 'llama-3.1-sonar-large-128k-online',
    color: '#6366F1', // Indigo
    apiDocsUrl: 'https://www.perplexity.ai/settings/api',
  },
};

export const CATEGORY_INFO: Record<TaskCategory, {
  name: string;
  icon: string;
  suggestedProvider: CloudProvider;
  keywords: string[];
}> = {
  code: {
    name: 'Code',
    icon: '💻',
    suggestedProvider: 'claude',
    keywords: ['rust', 'typescript', 'python', 'function', 'debug', 'implement'],
  },
  analysis: {
    name: 'Analysis',
    icon: '📊',
    suggestedProvider: 'claude',
    keywords: ['analyze', 'compare', 'evaluate', 'review', 'examine'],
  },
  reasoning: {
    name: 'Reasoning',
    icon: '🤔',
    suggestedProvider: 'claude',
    keywords: ['why', 'explain', 'logic', 'deduce', 'because'],
  },
  research: {
    name: 'Research',
    icon: '🔍',
    suggestedProvider: 'perplexity',
    keywords: ['search', 'find', 'latest', 'current', 'news', '2024', '2025'],
  },
  creative: {
    name: 'Creative',
    icon: '✨',
    suggestedProvider: 'chatgpt',
    keywords: ['write', 'story', 'brainstorm', 'imagine', 'creative'],
  },
  general: {
    name: 'General',
    icon: '📝',
    suggestedProvider: 'chatgpt',
    keywords: ['summarize', 'translate', 'list', 'format'],
  },
  image: {
    name: 'Image',
    icon: '🖼️',
    suggestedProvider: 'chatgpt',
    keywords: ['image', 'picture', 'generate', 'dall-e', 'draw'],
  },
};

// ═══════════════════════════════════════════════════════════════
// REQUEST/RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════

export interface TaskRequest {
  prompt: string;
  category?: TaskCategory;
  preferred_provider?: CloudProvider;
  model?: string;
  stream?: boolean;
  mode?: ExecutionMode;
  max_tokens?: number;
  temperature?: number;
}

export interface TaskClassification {
  category: TaskCategory;
  confidence: number;
  suggested_provider: CloudProvider;
  reasoning: string;
  keywords_matched: string[];
}

export interface StreamChunk {
  task_id: string;
  delta: string;
  is_final: boolean;
}

export interface Citation {
  url: string;
  title?: string;
}

export interface CloudResponse {
  task_id: string;
  provider: CloudProvider;
  model: string;
  content: string;
  tokens_input: number;
  tokens_output: number;
  cost: number;
  duration_ms: number;
  citations?: Citation[];
  mode: ExecutionMode;
  timestamp: string; // ISO date string
}

export interface CloudError {
  task_id: string;
  provider: CloudProvider;
  error_type: CloudErrorType;
  message: string;
  retry_after_ms?: number;
}

// ═══════════════════════════════════════════════════════════════
// STATUS TYPES
// ═══════════════════════════════════════════════════════════════

export interface ProviderStatus {
  provider: CloudProvider;
  api_key_configured: boolean;
  available_models: string[];
  is_healthy: boolean;
  last_check?: string;
  error?: string;
}

export interface CloudRouterStatus {
  providers: ProviderStatus[];
  active_tasks: number;
  queued_tasks: number;
}

// ═══════════════════════════════════════════════════════════════
// COST TRACKING
// ═══════════════════════════════════════════════════════════════

export interface CostRecord {
  task_id: string;
  provider: CloudProvider;
  model: string;
  tokens_input: number;
  tokens_output: number;
  cost: number;
  mode: ExecutionMode;
  timestamp: string;
}

export interface ProviderCostSummary {
  provider: CloudProvider;
  total_cost: number;
  total_tasks: number;
  total_tokens_input: number;
  total_tokens_output: number;
  api_tasks: number;
  browser_tasks: number;
}

export interface CostSummary {
  providers: ProviderCostSummary[];
  total_cost: number;
  total_tasks: number;
  period_start: string;
  period_end: string;
}

// ═══════════════════════════════════════════════════════════════
// TASK QUEUE
// ═══════════════════════════════════════════════════════════════

export interface QueuedTask {
  id: string;
  request: TaskRequest;
  status: TaskStatus;
  provider: CloudProvider;
  mode: ExecutionMode;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  partial_response?: string;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT PROPS
// ═══════════════════════════════════════════════════════════════

export interface TaskRouterProps {
  onTaskSubmit?: (taskId: string) => void;
  onTaskComplete?: (response: CloudResponse) => void;
  onTaskError?: (error: CloudError) => void;
}

export interface CloudProviderCardProps {
  provider: CloudProvider;
  status: ProviderStatus;
  onConfigure?: () => void;
  onTest?: () => void;
}

export interface TaskStreamProps {
  taskId: string;
  content: string;
  isStreaming: boolean;
  provider?: CloudProvider;
}

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export function formatCost(cost: number): string {
  if (cost === 0) return 'FREE';
  if (cost < 0.01) return `$${(cost * 100).toFixed(4)}¢`;
  return `$${cost.toFixed(4)}`;
}

export function formatTokens(tokens: number): string {
  if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
  return tokens.toString();
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

export function getProviderColor(provider: CloudProvider): string {
  return PROVIDER_INFO[provider].color;
}

export function getCategoryIcon(category: TaskCategory): string {
  return CATEGORY_INFO[category].icon;
}

// ═══════════════════════════════════════════════════════════════
// BROWSER MODE TYPES
// ═══════════════════════════════════════════════════════════════

export interface BrowserModeStatus {
  available: boolean;
  kapture_available: boolean;
  playwright_available: boolean;
  active_tabs: string[];
  error?: string;
}

export interface BrowserModeConfig {
  prefer_kapture: boolean;
  chrome_debug_port: number;
  timeout_ms: number;
}

export const DEFAULT_BROWSER_CONFIG: BrowserModeConfig = {
  prefer_kapture: true,
  chrome_debug_port: 9222,
  timeout_ms: 120000,
};
