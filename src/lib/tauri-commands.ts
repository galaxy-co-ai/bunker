// Tauri Command Constants
// Centralized command names for type-safe Tauri IPC calls

// ═══════════════════════════════════════════════════════════════
// VAULT COMMANDS
// ═══════════════════════════════════════════════════════════════

export const VAULT_COMMANDS = {
  LIST: 'vault_list',
  GET: 'vault_get',
  ADD: 'vault_add',
  DELETE: 'vault_delete',
} as const;

// ═══════════════════════════════════════════════════════════════
// SYSTEM COMMANDS
// ═══════════════════════════════════════════════════════════════

export const SYSTEM_COMMANDS = {
  GET_INFO: 'get_system_info',
  GET_METRICS: 'get_system_metrics',
  GET_PROCESS_LIST: 'get_process_list',
  EXECUTE_COMMAND: 'execute_command',
} as const;

// ═══════════════════════════════════════════════════════════════
// PTY COMMANDS
// ═══════════════════════════════════════════════════════════════

export const PTY_COMMANDS = {
  SPAWN: 'pty_spawn',
  WRITE: 'pty_write',
  RESIZE: 'pty_resize',
  KILL: 'pty_kill',
  STATUS: 'pty_status',
  SIGNAL: 'pty_signal',
} as const;

// ═══════════════════════════════════════════════════════════════
// OLLAMA COMMANDS
// ═══════════════════════════════════════════════════════════════

export const OLLAMA_COMMANDS = {
  GET_STATUS: 'get_ollama_status',
} as const;

// ═══════════════════════════════════════════════════════════════
// OPERATIONS LOG COMMANDS
// ═══════════════════════════════════════════════════════════════

export const OPERATIONS_COMMANDS = {
  GET_LOG: 'get_operations_log',
  CLEAR_LOG: 'clear_operations_log',
  ADD: 'add_operation',
} as const;

// ═══════════════════════════════════════════════════════════════
// CLOUD ROUTER COMMANDS
// ═══════════════════════════════════════════════════════════════

export const CLOUD_ROUTER_COMMANDS = {
  GET_STATUS: 'get_cloud_status',
  CLASSIFY_TASK: 'classify_task_prompt',
  SUBMIT_TASK: 'submit_task',
  CANCEL_TASK: 'cancel_task',
  GET_TASK_STATUS: 'get_task_status',
  GET_RECENT_TASKS: 'get_recent_tasks',
  GET_COST_SUMMARY: 'get_cost_summary',
  CLEAR_HISTORY: 'clear_task_history',
  GET_BROWSER_STATUS: 'get_browser_status',
} as const;

// ═══════════════════════════════════════════════════════════════
// DATABASE COMMANDS
// ═══════════════════════════════════════════════════════════════

export const DB_COMMANDS = {
  // Settings
  GET_SETTING: 'db_get_setting',
  SET_SETTING: 'db_set_setting',
  GET_ALL_SETTINGS: 'db_get_all_settings',
  // Tasks
  SAVE_TASK: 'db_save_task',
  UPDATE_TASK: 'db_update_task',
  GET_TASKS: 'db_get_tasks',
  // Preferences
  GET_PREFERENCE: 'db_get_preference',
  SET_PREFERENCE: 'db_set_preference',
  GET_PREFERENCES_BY_CATEGORY: 'db_get_preferences_by_category',
  // Workflows
  SAVE_WORKFLOW: 'db_save_workflow',
  GET_WORKFLOWS: 'db_get_workflows',
  DELETE_WORKFLOW: 'db_delete_workflow',
  TOGGLE_WORKFLOW: 'db_toggle_workflow',
} as const;

// ═══════════════════════════════════════════════════════════════
// N8N COMMANDS
// ═══════════════════════════════════════════════════════════════

export const N8N_COMMANDS = {
  START: 'start_n8n',
} as const;

// ═══════════════════════════════════════════════════════════════
// ALL COMMANDS (for type unions)
// ═══════════════════════════════════════════════════════════════

export const TAURI_COMMANDS = {
  ...VAULT_COMMANDS,
  ...SYSTEM_COMMANDS,
  ...PTY_COMMANDS,
  ...OLLAMA_COMMANDS,
  ...OPERATIONS_COMMANDS,
  ...CLOUD_ROUTER_COMMANDS,
  ...DB_COMMANDS,
  ...N8N_COMMANDS,
} as const;

// Type for all command names
export type TauriCommand = typeof TAURI_COMMANDS[keyof typeof TAURI_COMMANDS];
