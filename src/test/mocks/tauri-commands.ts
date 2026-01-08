// ═══════════════════════════════════════════════════════════════
// BUNKER - Tauri Command Mocks
// Mock implementations for all Tauri backend commands
// ═══════════════════════════════════════════════════════════════

import { vi } from 'vitest';

// ═══════════════════════════════════════════════════════════════
// VAULT COMMAND MOCKS
// ═══════════════════════════════════════════════════════════════

export const mockVaultList = vi.fn().mockResolvedValue({
  success: true,
  message: 'Found 3 secrets',
  data: [
    { name: 'OPENAI_API_KEY', value: null, category: 'AI Services' },
    { name: 'DATABASE_URL', value: null, category: 'Database' },
    { name: 'STRIPE_SECRET_KEY', value: null, category: 'Payments' },
  ],
});

export const mockVaultGet = vi.fn().mockImplementation(({ name }: { name: string }) => {
  const secrets: Record<string, string> = {
    OPENAI_API_KEY: 'sk-test-123456789',
    DATABASE_URL: 'postgresql://localhost:5432/test',
    STRIPE_SECRET_KEY: 'sk_test_abcdef',
  };

  if (name in secrets) {
    return Promise.resolve({
      success: true,
      message: 'Secret retrieved',
      data: [{ name, value: secrets[name], category: 'Other' }],
    });
  }

  return Promise.resolve({
    success: false,
    message: `Secret not found: ${name}`,
    data: null,
  });
});

export const mockVaultAdd = vi.fn().mockResolvedValue({
  success: true,
  message: 'Secret saved',
  data: null,
});

export const mockVaultDelete = vi.fn().mockResolvedValue({
  success: true,
  message: 'Secret deleted',
  data: null,
});

// ═══════════════════════════════════════════════════════════════
// SYSTEM COMMAND MOCKS
// ═══════════════════════════════════════════════════════════════

export const mockGetSystemInfo = vi.fn().mockResolvedValue({
  os_name: 'Windows',
  os_version: '10.0.22000',
  hostname: 'TEST-PC',
  cpu_count: 8,
  cpu_brand: 'Intel Core i7-10700K',
  total_memory: 32768,
  kernel_version: '10.0.22000',
});

export const mockGetSystemMetrics = vi.fn().mockResolvedValue({
  cpu_usage: 25.5,
  memory_used: 16384,
  memory_total: 32768,
  memory_percent: 50.0,
  disks: [
    {
      name: 'C:',
      mount_point: 'C:',
      total_space: 500,
      available_space: 250,
      used_space: 250,
      usage_percent: 50.0,
    },
  ],
});

export const mockGetProcessList = vi.fn().mockResolvedValue([
  { pid: 1234, name: 'chrome.exe', cpu_usage: 5.2, memory_mb: 512, status: 'Running' },
  { pid: 5678, name: 'node.exe', cpu_usage: 2.1, memory_mb: 256, status: 'Running' },
  { pid: 9012, name: 'code.exe', cpu_usage: 1.5, memory_mb: 384, status: 'Running' },
]);

export const mockExecuteCommand = vi.fn().mockResolvedValue({
  success: true,
  stdout: 'Command output',
  stderr: '',
  exit_code: 0,
});

export const mockStartN8n = vi.fn().mockResolvedValue({
  success: true,
  message: 'n8n starting in background...',
  already_running: false,
});

// ═══════════════════════════════════════════════════════════════
// OLLAMA COMMAND MOCKS
// ═══════════════════════════════════════════════════════════════

export const mockGetOllamaStatus = vi.fn().mockResolvedValue({
  online: true,
  models: [
    {
      id: 'llama3.1:8b',
      name: 'llama3.1:8b',
      status: 'idle',
      ram_usage: 4.5,
      ram_capacity: 8,
      size_gb: 4.7,
      parameter_size: '8B',
      quantization: 'Q4_0',
    },
    {
      id: 'mistral:7b',
      name: 'mistral:7b',
      status: 'offline',
      ram_usage: 0,
      ram_capacity: 8,
      size_gb: 4.1,
      parameter_size: '7B',
      quantization: 'Q4_0',
    },
  ],
  error: null,
});

// ═══════════════════════════════════════════════════════════════
// PTY COMMAND MOCKS
// ═══════════════════════════════════════════════════════════════

export const mockPtySpawn = vi.fn().mockResolvedValue({
  success: true,
  message: 'PTY session started with powershell.exe',
});

export const mockPtyWrite = vi.fn().mockResolvedValue({
  success: true,
  message: 'Data written',
});

export const mockPtyResize = vi.fn().mockResolvedValue({
  success: true,
  message: 'Resized to 120x40',
});

export const mockPtyKill = vi.fn().mockResolvedValue({
  success: true,
  message: 'PTY session terminated',
});

export const mockPtyStatus = vi.fn().mockResolvedValue(true);

export const mockPtySignal = vi.fn().mockResolvedValue({
  success: true,
  message: 'Signal sent',
});

// ═══════════════════════════════════════════════════════════════
// OPERATIONS COMMAND MOCKS
// ═══════════════════════════════════════════════════════════════

export const mockGetOperationsLog = vi.fn().mockResolvedValue([
  {
    id: 'op-1',
    timestamp: new Date().toISOString(),
    name: 'Test Operation 1',
    status: 'success',
    model: 'llama3.1:8b',
    duration_ms: 1500,
  },
  {
    id: 'op-2',
    timestamp: new Date().toISOString(),
    name: 'Test Operation 2',
    status: 'running',
    model: 'mistral:7b',
    duration_ms: null,
  },
]);

export const mockClearOperationsLog = vi.fn().mockResolvedValue({
  success: true,
  message: 'Log cleared',
});

export const mockAddOperation = vi.fn().mockResolvedValue({
  success: true,
  message: 'Operation added',
});

// ═══════════════════════════════════════════════════════════════
// DATABASE COMMAND MOCKS
// ═══════════════════════════════════════════════════════════════

export const mockDbGetSetting = vi.fn().mockResolvedValue(null);

export const mockDbSetSetting = vi.fn().mockResolvedValue({
  success: true,
});

export const mockDbGetAllSettings = vi.fn().mockResolvedValue([]);

export const mockDbSaveTask = vi.fn().mockResolvedValue({
  success: true,
  id: 'task-123',
});

export const mockDbUpdateTask = vi.fn().mockResolvedValue({
  success: true,
});

export const mockDbGetTasks = vi.fn().mockResolvedValue([]);

export const mockDbGetPreference = vi.fn().mockResolvedValue(null);

export const mockDbSetPreference = vi.fn().mockResolvedValue({
  success: true,
});

export const mockDbGetPreferencesByCategory = vi.fn().mockResolvedValue([]);

export const mockDbSaveWorkflow = vi.fn().mockResolvedValue({
  success: true,
  id: 'workflow-123',
});

export const mockDbGetWorkflows = vi.fn().mockResolvedValue([]);

export const mockDbDeleteWorkflow = vi.fn().mockResolvedValue({
  success: true,
});

export const mockDbToggleWorkflow = vi.fn().mockResolvedValue({
  success: true,
});

// ═══════════════════════════════════════════════════════════════
// CLOUD ROUTER COMMAND MOCKS
// ═══════════════════════════════════════════════════════════════

export const mockGetCloudStatus = vi.fn().mockResolvedValue({
  providers: {
    claude: { configured: true, status: 'ready' },
    openai: { configured: true, status: 'ready' },
    perplexity: { configured: false, status: 'not_configured' },
  },
  active_provider: 'claude',
  browser_mode_available: true,
});

export const mockClassifyTaskPrompt = vi.fn().mockResolvedValue({
  category: 'general',
  recommended_provider: 'claude',
  confidence: 0.95,
});

export const mockSubmitTask = vi.fn().mockResolvedValue({
  task_id: 'task-123',
  status: 'submitted',
});

export const mockCancelTask = vi.fn().mockResolvedValue({
  success: true,
});

export const mockGetTaskStatus = vi.fn().mockResolvedValue({
  task_id: 'task-123',
  status: 'completed',
  result: 'Task completed successfully',
});

export const mockGetRecentTasks = vi.fn().mockResolvedValue([]);

export const mockGetCostSummary = vi.fn().mockResolvedValue({
  total_cost: 0.15,
  total_tasks: 5,
  providers: [
    {
      provider: 'claude',
      total_cost: 0.10,
      api_tasks: 3,
      browser_tasks: 1,
    },
    {
      provider: 'openai',
      total_cost: 0.05,
      api_tasks: 1,
      browser_tasks: 0,
    },
  ],
});

export const mockClearTaskHistory = vi.fn().mockResolvedValue({
  success: true,
});

export const mockGetBrowserStatus = vi.fn().mockResolvedValue({
  available: true,
  worker_count: 2,
});

// ═══════════════════════════════════════════════════════════════
// COMMAND MAP - Used by invoke mock
// ═══════════════════════════════════════════════════════════════

export const tauriCommandMap: Record<string, ReturnType<typeof vi.fn>> = {
  // Vault
  vault_list: mockVaultList,
  vault_get: mockVaultGet,
  vault_add: mockVaultAdd,
  vault_delete: mockVaultDelete,
  // System
  get_system_info: mockGetSystemInfo,
  get_system_metrics: mockGetSystemMetrics,
  get_process_list: mockGetProcessList,
  execute_command: mockExecuteCommand,
  start_n8n: mockStartN8n,
  // Ollama
  get_ollama_status: mockGetOllamaStatus,
  // PTY
  pty_spawn: mockPtySpawn,
  pty_write: mockPtyWrite,
  pty_resize: mockPtyResize,
  pty_kill: mockPtyKill,
  pty_status: mockPtyStatus,
  pty_signal: mockPtySignal,
  // Operations
  get_operations_log: mockGetOperationsLog,
  clear_operations_log: mockClearOperationsLog,
  add_operation: mockAddOperation,
  // Database
  db_get_setting: mockDbGetSetting,
  db_set_setting: mockDbSetSetting,
  db_get_all_settings: mockDbGetAllSettings,
  db_save_task: mockDbSaveTask,
  db_update_task: mockDbUpdateTask,
  db_get_tasks: mockDbGetTasks,
  db_get_preference: mockDbGetPreference,
  db_set_preference: mockDbSetPreference,
  db_get_preferences_by_category: mockDbGetPreferencesByCategory,
  db_save_workflow: mockDbSaveWorkflow,
  db_get_workflows: mockDbGetWorkflows,
  db_delete_workflow: mockDbDeleteWorkflow,
  db_toggle_workflow: mockDbToggleWorkflow,
  // Cloud Router
  get_cloud_status: mockGetCloudStatus,
  classify_task_prompt: mockClassifyTaskPrompt,
  submit_task: mockSubmitTask,
  cancel_task: mockCancelTask,
  get_task_status: mockGetTaskStatus,
  get_recent_tasks: mockGetRecentTasks,
  get_cost_summary: mockGetCostSummary,
  clear_task_history: mockClearTaskHistory,
  get_browser_status: mockGetBrowserStatus,
};

// ═══════════════════════════════════════════════════════════════
// MOCK INVOKE FUNCTION
// ═══════════════════════════════════════════════════════════════

/**
 * Creates a mock invoke function that routes to the appropriate mock
 */
export function createMockInvoke() {
  return vi.fn().mockImplementation((command: string, args?: unknown) => {
    const mockFn = tauriCommandMap[command];
    if (mockFn) {
      return mockFn(args);
    }
    console.warn(`No mock found for command: ${command}`);
    return Promise.resolve(null);
  });
}

/**
 * Reset all command mocks to their default state
 */
export function resetAllMocks() {
  Object.values(tauriCommandMap).forEach((mock) => mock.mockClear());
}

/**
 * Configure a specific mock to return a custom value
 */
export function configureMock(command: string, response: unknown) {
  const mock = tauriCommandMap[command];
  if (mock) {
    mock.mockResolvedValueOnce(response);
  }
}

/**
 * Configure a specific mock to reject with an error
 */
export function configureMockError(command: string, error: Error | string) {
  const mock = tauriCommandMap[command];
  if (mock) {
    mock.mockRejectedValueOnce(typeof error === 'string' ? new Error(error) : error);
  }
}
