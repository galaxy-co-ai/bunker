// ═══════════════════════════════════════════════════════════════
// BUNKER - useOllamaStatus Hook
// Hook for polling Ollama service status
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { OllamaStatus, ModelStatus } from '../lib/types';

interface UseOllamaStatusOptions {
  /** Polling interval in milliseconds (default: 3000) */
  pollingInterval?: number;
  /** Whether polling is enabled (default: true) */
  enabled?: boolean;
}

interface UseOllamaStatusResult {
  /** Current Ollama status */
  status: OllamaStatus | null;
  /** Whether we're currently fetching */
  isLoading: boolean;
  /** Last error if any */
  error: string | null;
  /** Manually refresh the status */
  refresh: () => Promise<void>;
}

/**
 * Hook for polling Ollama service status
 *
 * @example
 * const { status, isLoading, error, refresh } = useOllamaStatus({ pollingInterval: 3000 });
 */
export function useOllamaStatus({
  pollingInterval = 3000,
  enabled = true,
}: UseOllamaStatusOptions = {}): UseOllamaStatusResult {
  const [status, setStatus] = useState<OllamaStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const result = await invoke<OllamaStatus>('get_ollama_status');
      setStatus(result);
      setError(null);
    } catch (e) {
      console.error('Failed to get Ollama status:', e);
      setStatus({
        online: false,
        models: [],
        error: `Failed to fetch: ${e}`,
      });
      setError(`Failed to fetch: ${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchStatus();

    // Set up polling
    const interval = setInterval(fetchStatus, pollingInterval);
    return () => clearInterval(interval);
  }, [pollingInterval, enabled]);

  return { status, isLoading, error, refresh: fetchStatus };
}

// ═══════════════════════════════════════════════════════════════
// MODEL CONVERSION UTILITIES
// ═══════════════════════════════════════════════════════════════

interface ConvertModelsOptions {
  ollamaStatus: OllamaStatus | null;
  totalRamMb: number;
  includeClaudeApi?: boolean;
}

/**
 * Convert Ollama status to ModelStatus array for SystemHealth display
 */
export function useModelStatus({
  ollamaStatus,
  totalRamMb,
  includeClaudeApi = true,
}: ConvertModelsOptions): ModelStatus[] {
  return useMemo(() => {
    const ramTotalGb = totalRamMb / 1024; // MB to GB

    // If Ollama is online and has models, show them
    if (ollamaStatus?.online && ollamaStatus.models.length > 0) {
      const models: ModelStatus[] = ollamaStatus.models.map((m) => ({
        id: m.id,
        name: m.name,
        status: m.status as ModelStatus['status'],
        ramUsage: Math.round(m.ram_usage * 10) / 10,
        ramCapacity: Math.round(ramTotalGb),
        temperature: 0,
        uptime: '---',
        tasksToday: 0,
        avgResponseTime: 0,
      }));

      // Add Claude API as a cloud model entry
      if (includeClaudeApi) {
        models.push({
          id: 'claude-api',
          name: 'CLAUDE API',
          status: 'idle',
          ramUsage: 0,
          ramCapacity: 0,
          temperature: 0,
          uptime: '---',
          tasksToday: 0,
          avgResponseTime: 0,
        });
      }

      return models;
    }

    // Ollama is offline - show offline status
    const offlineModels: ModelStatus[] = [
      {
        id: 'ollama-offline',
        name: 'OLLAMA SERVICE',
        status: 'offline',
        ramUsage: 0,
        ramCapacity: Math.round(ramTotalGb),
        temperature: 0,
        uptime: '---',
        tasksToday: 0,
        avgResponseTime: 0,
      },
    ];

    if (includeClaudeApi) {
      offlineModels.push({
        id: 'claude-api',
        name: 'CLAUDE API',
        status: 'idle',
        ramUsage: 0,
        ramCapacity: 0,
        temperature: 0,
        uptime: '---',
        tasksToday: 0,
        avgResponseTime: 0,
      });
    }

    return offlineModels;
  }, [ollamaStatus, totalRamMb, includeClaudeApi]);
}
