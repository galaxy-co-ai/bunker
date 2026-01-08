// ═══════════════════════════════════════════════════════════════
// BUNKER Cloud Router - React Hook
// Main interface for cloud API routing functionality
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import {
  TaskRequest,
  TaskClassification,
  CloudResponse,
  CloudError,
  CloudRouterStatus,
  CostSummary,
  QueuedTask,
  StreamChunk,
  CloudProvider,
} from './types';
import { classifyTask as classifyTaskLocal } from './classifier';

// ═══════════════════════════════════════════════════════════════
// HOOK STATE INTERFACE
// ═══════════════════════════════════════════════════════════════

export interface CloudRouterState {
  // Status
  status: CloudRouterStatus | null;
  isLoading: boolean;
  error: string | null;

  // Current task
  currentTaskId: string | null;
  isStreaming: boolean;
  streamContent: string;

  // Tasks and costs
  recentTasks: QueuedTask[];
  costSummary: CostSummary | null;

  // Classification
  classification: TaskClassification | null;
}

export interface CloudRouterActions {
  // Task submission
  submitTask: (request: TaskRequest) => Promise<string>;
  submitTaskWithCallback: (
    request: TaskRequest,
    onChunk?: (chunk: StreamChunk) => void,
    onComplete?: (response: CloudResponse) => void,
    onError?: (error: CloudError) => void
  ) => Promise<string>;

  // Classification
  classifyPrompt: (prompt: string) => TaskClassification;
  classifyPromptAsync: (prompt: string) => Promise<TaskClassification>;

  // Task management
  cancelTask: (taskId: string) => Promise<void>;
  getTaskStatus: (taskId: string) => Promise<QueuedTask | null>;
  clearHistory: () => Promise<void>;

  // Status refresh
  refreshStatus: () => Promise<void>;
  refreshCosts: () => Promise<void>;
  refreshTasks: () => Promise<void>;
}

// ═══════════════════════════════════════════════════════════════
// MAIN HOOK
// ═══════════════════════════════════════════════════════════════

export function useCloudRouter(): CloudRouterState & CloudRouterActions {
  // State
  const [status, setStatus] = useState<CloudRouterStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const [recentTasks, setRecentTasks] = useState<QueuedTask[]>([]);
  const [costSummary, setCostSummary] = useState<CostSummary | null>(null);
  const [classification, setClassification] = useState<TaskClassification | null>(null);

  // Refs for event callbacks
  const onChunkRef = useRef<((chunk: StreamChunk) => void) | null>(null);
  const onCompleteRef = useRef<((response: CloudResponse) => void) | null>(null);
  const onErrorRef = useRef<((error: CloudError) => void) | null>(null);

  // ═══════════════════════════════════════════════════════════════
  // EVENT LISTENERS
  // ═══════════════════════════════════════════════════════════════

  useEffect(() => {
    const unlisteners: UnlistenFn[] = [];

    // Listen for stream chunks
    listen<StreamChunk>('task-stream', (event) => {
      const chunk = event.payload;

      if (chunk.task_id === currentTaskId || !currentTaskId) {
        if (!chunk.is_final) {
          setStreamContent((prev) => prev + chunk.delta);
        }

        if (chunk.is_final) {
          setIsStreaming(false);
        }

        onChunkRef.current?.(chunk);
      }
    }).then((unlisten) => unlisteners.push(unlisten));

    // Listen for task completion
    listen<CloudResponse>('task-completed', (event) => {
      const response = event.payload;

      if (response.task_id === currentTaskId || !currentTaskId) {
        setCurrentTaskId(null);
        setIsStreaming(false);

        // Refresh tasks and costs
        refreshTasks();
        refreshCosts();

        onCompleteRef.current?.(response);
      }
    }).then((unlisten) => unlisteners.push(unlisten));

    // Listen for task errors
    listen<CloudError>('task-error', (event) => {
      const cloudError = event.payload;

      if (cloudError.task_id === currentTaskId || !currentTaskId) {
        setCurrentTaskId(null);
        setIsStreaming(false);
        setError(cloudError.message);

        // Refresh tasks
        refreshTasks();

        onErrorRef.current?.(cloudError);
      }
    }).then((unlisten) => unlisteners.push(unlisten));

    // Cleanup
    return () => {
      unlisteners.forEach((unlisten) => unlisten());
    };
  }, [currentTaskId]);

  // Initial load
  useEffect(() => {
    refreshStatus();
    refreshTasks();
    refreshCosts();
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // REFRESH FUNCTIONS
  // ═══════════════════════════════════════════════════════════════

  const refreshStatus = useCallback(async () => {
    try {
      const result = await invoke<CloudRouterStatus>('get_cloud_status');
      setStatus(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const refreshCosts = useCallback(async () => {
    try {
      const result = await invoke<CostSummary>('get_cost_summary');
      setCostSummary(result);
    } catch (err) {
      console.error('Failed to refresh costs:', err);
    }
  }, []);

  const refreshTasks = useCallback(async () => {
    try {
      const result = await invoke<QueuedTask[]>('get_recent_tasks', { limit: 20 });
      setRecentTasks(result);
    } catch (err) {
      console.error('Failed to refresh tasks:', err);
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // CLASSIFICATION
  // ═══════════════════════════════════════════════════════════════

  const classifyPrompt = useCallback((prompt: string): TaskClassification => {
    const result = classifyTaskLocal(prompt);
    setClassification(result);
    return result;
  }, []);

  const classifyPromptAsync = useCallback(async (prompt: string): Promise<TaskClassification> => {
    try {
      // Use backend classification for more accurate results
      const result = await invoke<TaskClassification>('classify_task_prompt', { prompt });
      setClassification(result);
      return result;
    } catch {
      // Fall back to frontend classification
      return classifyPrompt(prompt);
    }
  }, [classifyPrompt]);

  // ═══════════════════════════════════════════════════════════════
  // TASK SUBMISSION
  // ═══════════════════════════════════════════════════════════════

  const submitTask = useCallback(async (request: TaskRequest): Promise<string> => {
    setIsLoading(true);
    setError(null);
    setStreamContent('');

    try {
      const taskId = await invoke<string>('submit_task', { request });
      setCurrentTaskId(taskId);

      if (request.stream) {
        setIsStreaming(true);
      }

      return taskId;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitTaskWithCallback = useCallback(async (
    request: TaskRequest,
    onChunk?: (chunk: StreamChunk) => void,
    onComplete?: (response: CloudResponse) => void,
    onError?: (error: CloudError) => void
  ): Promise<string> => {
    // Store callbacks
    onChunkRef.current = onChunk || null;
    onCompleteRef.current = onComplete || null;
    onErrorRef.current = onError || null;

    return submitTask(request);
  }, [submitTask]);

  // ═══════════════════════════════════════════════════════════════
  // TASK MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  const cancelTask = useCallback(async (taskId: string): Promise<void> => {
    try {
      await invoke('cancel_task', { taskId });
      if (taskId === currentTaskId) {
        setCurrentTaskId(null);
        setIsStreaming(false);
      }
      await refreshTasks();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      throw new Error(message);
    }
  }, [currentTaskId, refreshTasks]);

  const getTaskStatus = useCallback(async (taskId: string): Promise<QueuedTask | null> => {
    try {
      return await invoke<QueuedTask | null>('get_task_status', { taskId });
    } catch {
      return null;
    }
  }, []);

  const clearHistory = useCallback(async (): Promise<void> => {
    try {
      await invoke('clear_task_history');
      await refreshTasks();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  }, [refreshTasks]);

  // ═══════════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════════

  return {
    // State
    status,
    isLoading,
    error,
    currentTaskId,
    isStreaming,
    streamContent,
    recentTasks,
    costSummary,
    classification,

    // Actions
    submitTask,
    submitTaskWithCallback,
    classifyPrompt,
    classifyPromptAsync,
    cancelTask,
    getTaskStatus,
    clearHistory,
    refreshStatus,
    refreshCosts,
    refreshTasks,
  };
}

// ═══════════════════════════════════════════════════════════════
// UTILITY HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Hook for polling cloud router status
 */
export function useCloudRouterStatus(pollingInterval: number = 5000) {
  const [status, setStatus] = useState<CloudRouterStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const result = await invoke<CloudRouterStatus>('get_cloud_status');
        setStatus(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, pollingInterval);

    return () => clearInterval(interval);
  }, [pollingInterval]);

  return { status, error };
}

/**
 * Hook for checking if a specific provider is available
 */
export function useProviderStatus(provider: CloudProvider) {
  const { status } = useCloudRouterStatus();

  if (!status) {
    return {
      isConfigured: false,
      isHealthy: false,
      availableModels: [],
    };
  }

  const providerStatus = status.providers.find((p) => p.provider === provider);

  return {
    isConfigured: providerStatus?.api_key_configured ?? false,
    isHealthy: providerStatus?.is_healthy ?? false,
    availableModels: providerStatus?.available_models ?? [],
  };
}

/**
 * Hook for browser mode status
 */
export function useBrowserModeStatus(pollingInterval: number = 10000) {
  const [status, setStatus] = useState<{
    available: boolean;
    kapture_available: boolean;
    playwright_available: boolean;
    active_tabs: string[];
    error?: string;
  } | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const result = await invoke<{
          available: boolean;
          kapture_available: boolean;
          playwright_available: boolean;
          active_tabs: string[];
          error?: string;
        }>('get_browser_status');
        setStatus(result);
      } catch (err) {
        setStatus({
          available: false,
          kapture_available: false,
          playwright_available: false,
          active_tabs: [],
          error: err instanceof Error ? err.message : String(err),
        });
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, pollingInterval);

    return () => clearInterval(interval);
  }, [pollingInterval]);

  return status;
}
