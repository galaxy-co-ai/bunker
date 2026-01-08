// ═══════════════════════════════════════════════════════════════
// BUNKER - Centralized Type Exports
// Single source of truth for all TypeScript type definitions
// ═══════════════════════════════════════════════════════════════

/**
 * Type System Organization:
 *
 * TypeScript types are organized by domain and mirror Rust backend types:
 *
 * - lib/types.ts          -> App-wide types (ModelStatus, QueueTask, etc.)
 * - lib/cloud-router/     -> Cloud router (mirrors src-tauri/src/cloud_router/types.rs)
 * - lib/console/          -> Console/system (mirrors src-tauri/src/system.rs)
 * - lib/roster/           -> Roster system (Agent, Tool definitions)
 * - components/vault/     -> Vault types (mirrors src-tauri/src/vault.rs)
 * - hooks/usePersistence  -> Database types (mirrors src-tauri/src/db.rs)
 */

// ═══════════════════════════════════════════════════════════════
// APP-WIDE TYPES
// ═══════════════════════════════════════════════════════════════

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
} from '../lib/types';

// ═══════════════════════════════════════════════════════════════
// CLOUD ROUTER TYPES
// ═══════════════════════════════════════════════════════════════

export type {
  CloudProvider,
  TaskCategory,
  ExecutionMode,
  TaskStatus,
  CloudErrorType,
  TaskRequest,
  TaskClassification,
  StreamChunk,
  Citation,
  CloudResponse,
  CloudError,
  ProviderStatus,
  CloudRouterStatus,
  CostRecord,
  ProviderCostSummary,
  CostSummary,
  QueuedTask,
  TaskRouterProps,
  CloudProviderCardProps,
  TaskStreamProps,
  BrowserModeStatus,
  BrowserModeConfig,
} from '../lib/cloud-router/types';

export {
  PROVIDER_INFO,
  CATEGORY_INFO,
  DEFAULT_BROWSER_CONFIG,
  formatCost,
  formatTokens,
  formatDuration,
  getProviderColor,
  getCategoryIcon,
} from '../lib/cloud-router/types';

// ═══════════════════════════════════════════════════════════════
// CONSOLE / SYSTEM TYPES
// ═══════════════════════════════════════════════════════════════

export type {
  SystemInfo,
  DiskInfo,
  SystemMetrics,
  ProcessInfo,
  CommandResult,
  TerminalLine,
  TerminalHistory,
  PtyResult,
  PtyOutput,
  PtySignal,
  Operation as ConsoleOperation,
} from '../lib/console/types';

// ═══════════════════════════════════════════════════════════════
// ROSTER TYPES
// ═══════════════════════════════════════════════════════════════

export type {
  AgentStatus,
  DecisionRule,
  Metric,
  Agent,
  ToolStatus,
  ToolType,
  ExposureType,
  ToolCategory,
  Tool,
  Roster,
  RosterView,
  DepthChartPosition,
  OrgChartNode,
} from '../lib/roster/types';

// ═══════════════════════════════════════════════════════════════
// VAULT TYPES
// ═══════════════════════════════════════════════════════════════

export type {
  Secret,
  VaultResult,
  ParsedSecret,
} from '../components/vault/types';

export {
  categoryConfig,
  knownProjects,
  environments,
  knownServices,
  parseSecretName,
} from '../components/vault/types';

// ═══════════════════════════════════════════════════════════════
// DATABASE / PERSISTENCE TYPES
// ═══════════════════════════════════════════════════════════════

export type {
  Setting,
  Preference,
  TaskRecord,
  Workflow,
} from '../hooks/usePersistence';

// ═══════════════════════════════════════════════════════════════
// NAVIGATION TYPES
// ═══════════════════════════════════════════════════════════════

export type { AppView } from '../components/bunker/NavigationBar';
