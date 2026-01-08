// ═══════════════════════════════════════════════════════════════
// BUNKER - Persistence Hook
// Manages state persistence to SQLite database
// ═══════════════════════════════════════════════════════════════

import { useEffect, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { DB_COMMANDS } from '../lib/tauri-commands';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface Setting {
  key: string;
  value: string;
}

export interface Preference {
  key: string;
  value: string;
  category: string;
}

export interface TaskRecord {
  id: string;
  prompt: string;
  provider: string;
  model?: string;
  status: string;
  response?: string;
  tokens_used?: number;
  cost_estimate?: number;
  created_at: string;
  completed_at?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  config: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════════════════════════
// SETTINGS API
// ═══════════════════════════════════════════════════════════════

/**
 * Get a setting value from the database
 */
export async function getSetting(key: string): Promise<string | null> {
  try {
    return await invoke<string | null>(DB_COMMANDS.GET_SETTING, { key });
  } catch (error) {
    console.error('Failed to get setting:', key, error);
    return null;
  }
}

/**
 * Set a setting value in the database
 */
export async function setSetting(key: string, value: string): Promise<boolean> {
  try {
    return await invoke<boolean>(DB_COMMANDS.SET_SETTING, { key, value });
  } catch (error) {
    console.error('Failed to set setting:', key, error);
    return false;
  }
}

/**
 * Get all settings from the database
 */
export async function getAllSettings(): Promise<Setting[]> {
  try {
    return await invoke<Setting[]>(DB_COMMANDS.GET_ALL_SETTINGS);
  } catch (error) {
    console.error('Failed to get all settings:', error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// PREFERENCES API
// ═══════════════════════════════════════════════════════════════

/**
 * Get a preference value from the database
 */
export async function getPreference(key: string): Promise<string | null> {
  try {
    return await invoke<string | null>(DB_COMMANDS.GET_PREFERENCE, { key });
  } catch (error) {
    console.error('Failed to get preference:', key, error);
    return null;
  }
}

/**
 * Set a preference value in the database
 */
export async function setPreference(
  key: string,
  value: string,
  category?: string
): Promise<boolean> {
  try {
    return await invoke<boolean>(DB_COMMANDS.SET_PREFERENCE, { key, value, category });
  } catch (error) {
    console.error('Failed to set preference:', key, error);
    return false;
  }
}

/**
 * Get all preferences in a category
 */
export async function getPreferencesByCategory(category: string): Promise<Preference[]> {
  try {
    return await invoke<Preference[]>(DB_COMMANDS.GET_PREFERENCES_BY_CATEGORY, { category });
  } catch (error) {
    console.error('Failed to get preferences by category:', category, error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// TASK HISTORY API
// ═══════════════════════════════════════════════════════════════

/**
 * Save a task to history
 */
export async function saveTask(task: TaskRecord): Promise<boolean> {
  try {
    return await invoke<boolean>(DB_COMMANDS.SAVE_TASK, { task });
  } catch (error) {
    console.error('Failed to save task:', error);
    return false;
  }
}

/**
 * Update a task's status and response
 */
export async function updateTask(
  id: string,
  status: string,
  response?: string,
  tokens?: number,
  cost?: number
): Promise<boolean> {
  try {
    return await invoke<boolean>(DB_COMMANDS.UPDATE_TASK, { id, status, response, tokens, cost });
  } catch (error) {
    console.error('Failed to update task:', id, error);
    return false;
  }
}

/**
 * Get recent tasks from history
 */
export async function getTasks(limit?: number): Promise<TaskRecord[]> {
  try {
    return await invoke<TaskRecord[]>(DB_COMMANDS.GET_TASKS, { limit });
  } catch (error) {
    console.error('Failed to get tasks:', error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// WORKFLOW API
// ═══════════════════════════════════════════════════════════════

/**
 * Save a workflow
 */
export async function saveWorkflow(workflow: Workflow): Promise<boolean> {
  try {
    return await invoke<boolean>(DB_COMMANDS.SAVE_WORKFLOW, { workflow });
  } catch (error) {
    console.error('Failed to save workflow:', error);
    return false;
  }
}

/**
 * Get all workflows
 */
export async function getWorkflows(): Promise<Workflow[]> {
  try {
    return await invoke<Workflow[]>(DB_COMMANDS.GET_WORKFLOWS);
  } catch (error) {
    console.error('Failed to get workflows:', error);
    return [];
  }
}

/**
 * Delete a workflow
 */
export async function deleteWorkflow(id: string): Promise<boolean> {
  try {
    return await invoke<boolean>(DB_COMMANDS.DELETE_WORKFLOW, { id });
  } catch (error) {
    console.error('Failed to delete workflow:', id, error);
    return false;
  }
}

/**
 * Toggle workflow enabled status
 */
export async function toggleWorkflow(id: string, enabled: boolean): Promise<boolean> {
  try {
    return await invoke<boolean>(DB_COMMANDS.TOGGLE_WORKFLOW, { id, enabled });
  } catch (error) {
    console.error('Failed to toggle workflow:', id, error);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// PERSISTENCE HOOK
// ═══════════════════════════════════════════════════════════════

interface UsePersistenceOptions<T> {
  /** Key to store the state under */
  key: string;
  /** Default value if no persisted state exists */
  defaultValue: T;
  /** Category for preferences (optional) */
  category?: string;
  /** Debounce delay in ms for saves (default: 500) */
  debounceMs?: number;
}

/**
 * Hook for persisting state to the database
 *
 * @example
 * const { value, setValue, isLoading } = usePersistence({
 *   key: 'selectedProvider',
 *   defaultValue: 'claude',
 *   category: 'cloud-router'
 * });
 */
export function usePersistence<T>({
  key,
  defaultValue,
  category = 'general',
  debounceMs = 500,
}: UsePersistenceOptions<T>) {
  const [value, setValueState] = React.useState<T>(defaultValue);
  const [isLoading, setIsLoading] = React.useState(true);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Load initial value
  useEffect(() => {
    let mounted = true;

    async function loadValue() {
      try {
        const stored = await getPreference(key);
        if (stored && mounted) {
          try {
            setValueState(JSON.parse(stored) as T);
          } catch {
            // Value is not JSON, use as string
            setValueState(stored as unknown as T);
          }
        }
      } catch (error) {
        console.error('Failed to load persisted value:', key, error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadValue();

    return () => {
      mounted = false;
    };
  }, [key]);

  // Debounced save function
  const setValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValueState((prev) => {
      const resolved = typeof newValue === 'function'
        ? (newValue as (prev: T) => T)(prev)
        : newValue;

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Schedule save with debounce
      saveTimeoutRef.current = setTimeout(() => {
        const serialized = typeof resolved === 'string'
          ? resolved
          : JSON.stringify(resolved);
        setPreference(key, serialized, category);
      }, debounceMs);

      return resolved;
    });
  }, [key, category, debounceMs]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return { value, setValue, isLoading };
}

// Need to import React for the hook
import React from 'react';

// ═══════════════════════════════════════════════════════════════
// APP STATE PERSISTENCE
// ═══════════════════════════════════════════════════════════════

/** Keys for app-wide persisted settings */
export const PERSISTENCE_KEYS = {
  // UI State
  ACTIVE_TAB: 'ui.activeTab',
  SIDEBAR_COLLAPSED: 'ui.sidebarCollapsed',
  THEME: 'ui.theme',

  // Cloud Router
  PREFERRED_PROVIDER: 'cloudRouter.preferredProvider',
  BROWSER_MODE_ENABLED: 'cloudRouter.browserModeEnabled',

  // Console
  TERMINAL_SHELL: 'console.terminalShell',
  TERMINAL_FONT_SIZE: 'console.terminalFontSize',

  // Vault
  VAULT_SORT_ORDER: 'vault.sortOrder',
  VAULT_GROUP_BY: 'vault.groupBy',
} as const;

/**
 * Load initial app state from database
 */
export async function loadAppState(): Promise<Record<string, unknown>> {
  const settings = await getAllSettings();
  const state: Record<string, unknown> = {};

  for (const setting of settings) {
    try {
      state[setting.key] = JSON.parse(setting.value);
    } catch {
      state[setting.key] = setting.value;
    }
  }

  return state;
}

/**
 * Save a single app state value
 */
export async function saveAppState(key: string, value: unknown): Promise<void> {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  await setSetting(key, serialized);
}
