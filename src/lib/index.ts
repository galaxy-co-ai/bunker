// ═══════════════════════════════════════════════════════════════
// BUNKER - Library Barrel Export
// ═══════════════════════════════════════════════════════════════

// Configuration constants
export {
  POLLING_INTERVALS,
  TOAST_DURATIONS,
  DEBOUNCE,
  UI_LIMITS,
  FORMAT_THRESHOLDS,
  SECURITY,
  DEFAULTS,
} from './config';

// Tauri command bindings
export {
  SYSTEM_COMMANDS,
  PTY_COMMANDS,
  VAULT_COMMANDS,
  OLLAMA_COMMANDS,
  CLOUD_ROUTER_COMMANDS,
  OPERATIONS_COMMANDS,
  DB_COMMANDS,
  N8N_COMMANDS,
} from './tauri-commands';

// Error handling
export {
  errorHandler,
  withErrorHandling,
  createSafeInvoke,
} from './error-handler';
export type { AppError, ErrorSeverity, Toast } from './error-handler';

// App-wide types
export type {
  ModelStatus,
  QueueTask,
  Operation,
  CostMetrics,
  TaskFlowNode,
  TaskFlowEdge,
  Particle,
  HeaderProps,
  SystemHealthProps,
  TaskFlowProps,
  LiveQueueProps,
  OperationsLogProps,
  CostTrackerProps,
  OllamaModelStatus,
  OllamaStatus,
} from './types';
