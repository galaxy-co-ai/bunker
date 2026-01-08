// ═══════════════════════════════════════════════════════════════
// BUNKER - Application Configuration
// Centralized constants and magic numbers
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// POLLING INTERVALS (milliseconds)
// ═══════════════════════════════════════════════════════════════

export const POLLING_INTERVALS = {
  /** Time display update interval */
  TIME: 1000,
  /** System metrics (CPU, RAM) polling */
  SYSTEM_METRICS: 2000,
  /** Ollama service status check */
  OLLAMA_STATUS: 3000,
  /** Cloud cost summary refresh */
  CLOUD_COSTS: 10000,
} as const;

// ═══════════════════════════════════════════════════════════════
// TOAST NOTIFICATION DURATIONS (milliseconds)
// ═══════════════════════════════════════════════════════════════

export const TOAST_DURATIONS = {
  /** Info notifications */
  INFO: 3000,
  /** Warning notifications */
  WARNING: 5000,
  /** Error notifications */
  ERROR: 7000,
  /** Critical - 0 means no auto-dismiss */
  CRITICAL: 0,
} as const;

// ═══════════════════════════════════════════════════════════════
// DEBOUNCE TIMINGS (milliseconds)
// ═══════════════════════════════════════════════════════════════

export const DEBOUNCE = {
  /** Default debounce for persistence saves */
  PERSISTENCE_SAVE: 500,
  /** Search input debounce */
  SEARCH: 300,
  /** Resize event debounce */
  RESIZE: 150,
} as const;

// ═══════════════════════════════════════════════════════════════
// UI LIMITS
// ═══════════════════════════════════════════════════════════════

export const UI_LIMITS = {
  /** Maximum toast queue size */
  MAX_TOAST_QUEUE: 50,
  /** Maximum operations log entries */
  MAX_OPERATIONS_LOG: 100,
  /** Maximum terminal history lines */
  MAX_TERMINAL_HISTORY: 1000,
} as const;

// ═══════════════════════════════════════════════════════════════
// FORMATTING THRESHOLDS
// ═══════════════════════════════════════════════════════════════

export const FORMAT_THRESHOLDS = {
  /** Token count to show as 'K' (thousands) */
  TOKENS_K: 1000,
  /** Token count to show as 'M' (millions) */
  TOKENS_M: 1000000,
  /** Duration in ms to show as seconds */
  DURATION_SECONDS: 1000,
  /** Duration in ms to show as minutes */
  DURATION_MINUTES: 60000,
} as const;

// ═══════════════════════════════════════════════════════════════
// SECURITY CONSTANTS
// ═══════════════════════════════════════════════════════════════

export const SECURITY = {
  /** Maximum PTY input length (chars) */
  MAX_PTY_INPUT_LENGTH: 4096,
  /** Maximum command length */
  MAX_COMMAND_LENGTH: 8192,
} as const;

// ═══════════════════════════════════════════════════════════════
// DEFAULT VALUES
// ═══════════════════════════════════════════════════════════════

export const DEFAULTS = {
  /** Default total memory in MB for fallback */
  MEMORY_MB: 32 * 1024, // 32GB
} as const;
