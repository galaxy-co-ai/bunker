// ═══════════════════════════════════════════════════════════════
// BUNKER - Hooks Barrel Export
// ═══════════════════════════════════════════════════════════════

export { useTerminal } from './useTerminal';
export { usePolling } from './usePolling';
export {
  usePersistence,
  // Settings API
  getSetting,
  setSetting,
  getAllSettings,
  // Preferences API
  getPreference,
  setPreference,
  getPreferencesByCategory,
  // Task History API
  saveTask,
  updateTask,
  getTasks,
  // Workflow API
  saveWorkflow,
  getWorkflows,
  deleteWorkflow,
  toggleWorkflow,
  // App State
  loadAppState,
  saveAppState,
  PERSISTENCE_KEYS,
} from './usePersistence';

// Re-export types
export type {
  Setting,
  Preference,
  TaskRecord,
  Workflow,
} from './usePersistence';
