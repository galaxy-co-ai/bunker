// ═══════════════════════════════════════════════════════════════
// BUNKER - useSystemMetrics Hook
// Hook for polling system metrics (CPU, RAM)
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

// System metrics type from backend
export interface SystemMetrics {
  cpu_usage: number;
  memory_used: number;  // MB
  memory_total: number; // MB
  memory_percent: number;
}

interface UseSystemMetricsOptions {
  /** Polling interval in milliseconds (default: 2000) */
  pollingInterval?: number;
  /** Whether polling is enabled (default: true) */
  enabled?: boolean;
}

interface UseSystemMetricsResult {
  /** Current system metrics */
  metrics: SystemMetrics;
  /** Whether we're currently fetching */
  isLoading: boolean;
  /** Last error if any */
  error: string | null;
  /** Manually refresh the metrics */
  refresh: () => Promise<void>;
}

const DEFAULT_METRICS: SystemMetrics = {
  cpu_usage: 0,
  memory_used: 0,
  memory_total: 32 * 1024, // Default 32GB in MB
  memory_percent: 0,
};

/**
 * Hook for polling system metrics
 *
 * @example
 * const { metrics, isLoading, refresh } = useSystemMetrics({ pollingInterval: 2000 });
 */
export function useSystemMetrics({
  pollingInterval = 2000,
  enabled = true,
}: UseSystemMetricsOptions = {}): UseSystemMetricsResult {
  const [metrics, setMetrics] = useState<SystemMetrics>(DEFAULT_METRICS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const result = await invoke<SystemMetrics>('get_system_metrics');
      setMetrics(result);
      setError(null);
    } catch (e) {
      console.error('Failed to get system metrics:', e);
      setError(`Failed to fetch: ${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchMetrics();

    // Set up polling
    const interval = setInterval(fetchMetrics, pollingInterval);
    return () => clearInterval(interval);
  }, [pollingInterval, enabled]);

  return { metrics, isLoading, error, refresh: fetchMetrics };
}

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Convert MB to GB with rounding
 */
export function mbToGb(mb: number): number {
  return Math.round(mb / 1024);
}

/**
 * Format bytes as human-readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Get RAM in GB from metrics
 */
export function getRamGb(metrics: SystemMetrics): { used: number; total: number } {
  return {
    used: mbToGb(metrics.memory_used),
    total: mbToGb(metrics.memory_total),
  };
}
