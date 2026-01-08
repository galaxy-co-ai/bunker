// ═══════════════════════════════════════════════════════════════
// BUNKER - Centralized Polling Service
// Manages all polling intervals with configurable rates
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { SYSTEM_COMMANDS, OLLAMA_COMMANDS, CLOUD_ROUTER_COMMANDS } from '../lib/tauri-commands';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface SystemMetrics {
  cpu_usage: number;
  memory_used: number;
  memory_total: number;
  memory_percent: number;
}

export interface OllamaModelStatus {
  id: string;
  name: string;
  status: string;
  ram_usage: number;
  ram_capacity: number;
  size_gb: number;
  parameter_size?: string;
  quantization?: string;
}

export interface OllamaStatus {
  online: boolean;
  models: OllamaModelStatus[];
  error?: string;
}

export interface ProviderCostSummary {
  provider: string;
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

export interface PollingConfig {
  systemMetrics?: number; // Default: 2000ms
  ollamaStatus?: number; // Default: 3000ms
  cloudCosts?: number; // Default: 10000ms
  time?: number; // Default: 1000ms
  enabled?: boolean; // Default: true
}

export interface PollingState {
  systemMetrics: SystemMetrics;
  ollamaStatus: OllamaStatus | null;
  cloudCostSummary: CostSummary | null;
  currentTime: Date;
  isPolling: boolean;
  errors: Record<string, string | null>;
}

export interface UsePollingReturn extends PollingState {
  startPolling: () => void;
  stopPolling: () => void;
  refreshAll: () => Promise<void>;
  refreshSystemMetrics: () => Promise<void>;
  refreshOllamaStatus: () => Promise<void>;
  refreshCloudCosts: () => Promise<void>;
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: Required<PollingConfig> = {
  systemMetrics: 2000,
  ollamaStatus: 3000,
  cloudCosts: 10000,
  time: 1000,
  enabled: true,
};

const DEFAULT_SYSTEM_METRICS: SystemMetrics = {
  cpu_usage: 0,
  memory_used: 0,
  memory_total: 32 * 1024,
  memory_percent: 0,
};

// ═══════════════════════════════════════════════════════════════
// HOOK IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════

export function usePolling(config: PollingConfig = {}): UsePollingReturn {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>(DEFAULT_SYSTEM_METRICS);
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus | null>(null);
  const [cloudCostSummary, setCloudCostSummary] = useState<CostSummary | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPolling, setIsPolling] = useState(mergedConfig.enabled);
  const [errors, setErrors] = useState<Record<string, string | null>>({
    systemMetrics: null,
    ollamaStatus: null,
    cloudCosts: null,
  });

  // Store interval IDs
  const intervalsRef = useRef<{
    time?: number;
    systemMetrics?: number;
    ollamaStatus?: number;
    cloudCosts?: number;
  }>({});

  // Error handler
  const setError = useCallback((key: string, error: string | null) => {
    setErrors((prev) => ({ ...prev, [key]: error }));
  }, []);

  // Fetch functions
  const refreshSystemMetrics = useCallback(async () => {
    try {
      const metrics = await invoke<SystemMetrics>(SYSTEM_COMMANDS.GET_METRICS);
      setSystemMetrics(metrics);
      setError('systemMetrics', null);
    } catch (e) {
      console.error('Failed to get system metrics:', e);
      setError('systemMetrics', String(e));
    }
  }, [setError]);

  const refreshOllamaStatus = useCallback(async () => {
    try {
      const status = await invoke<OllamaStatus>(OLLAMA_COMMANDS.GET_STATUS);
      setOllamaStatus(status);
      setError('ollamaStatus', null);
    } catch (e) {
      console.error('Failed to get Ollama status:', e);
      setOllamaStatus({
        online: false,
        models: [],
        error: String(e),
      });
      setError('ollamaStatus', String(e));
    }
  }, [setError]);

  const refreshCloudCosts = useCallback(async () => {
    try {
      const costs = await invoke<CostSummary>(CLOUD_ROUTER_COMMANDS.GET_COST_SUMMARY);
      setCloudCostSummary(costs);
      setError('cloudCosts', null);
    } catch (e) {
      console.error('Failed to get cloud costs:', e);
      setError('cloudCosts', String(e));
    }
  }, [setError]);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      refreshSystemMetrics(),
      refreshOllamaStatus(),
      refreshCloudCosts(),
    ]);
  }, [refreshSystemMetrics, refreshOllamaStatus, refreshCloudCosts]);

  // Start all polling intervals
  const startPolling = useCallback(() => {
    setIsPolling(true);

    // Time update
    intervalsRef.current.time = window.setInterval(() => {
      setCurrentTime(new Date());
    }, mergedConfig.time);

    // System metrics
    intervalsRef.current.systemMetrics = window.setInterval(
      refreshSystemMetrics,
      mergedConfig.systemMetrics
    );

    // Ollama status
    intervalsRef.current.ollamaStatus = window.setInterval(
      refreshOllamaStatus,
      mergedConfig.ollamaStatus
    );

    // Cloud costs
    intervalsRef.current.cloudCosts = window.setInterval(
      refreshCloudCosts,
      mergedConfig.cloudCosts
    );

    // Initial fetch
    refreshAll();
  }, [
    mergedConfig.time,
    mergedConfig.systemMetrics,
    mergedConfig.ollamaStatus,
    mergedConfig.cloudCosts,
    refreshSystemMetrics,
    refreshOllamaStatus,
    refreshCloudCosts,
    refreshAll,
  ]);

  // Stop all polling intervals
  const stopPolling = useCallback(() => {
    setIsPolling(false);

    Object.values(intervalsRef.current).forEach((id) => {
      if (id) window.clearInterval(id);
    });

    intervalsRef.current = {};
  }, []);

  // Start/stop based on enabled config
  useEffect(() => {
    if (mergedConfig.enabled) {
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [mergedConfig.enabled, startPolling, stopPolling]);

  return {
    systemMetrics,
    ollamaStatus,
    cloudCostSummary,
    currentTime,
    isPolling,
    errors,
    startPolling,
    stopPolling,
    refreshAll,
    refreshSystemMetrics,
    refreshOllamaStatus,
    refreshCloudCosts,
  };
}

export default usePolling;
