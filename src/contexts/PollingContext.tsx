// ═══════════════════════════════════════════════════════════════
// BUNKER - Polling Context
// React Context for centralized polling state management
// ═══════════════════════════════════════════════════════════════

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { usePolling, type UsePollingReturn, type PollingConfig } from '../hooks/usePolling';

// ═══════════════════════════════════════════════════════════════
// CONTEXT CREATION
// ═══════════════════════════════════════════════════════════════

const PollingContext = createContext<UsePollingReturn | null>(null);

// ═══════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════

interface PollingProviderProps {
  children: ReactNode;
  config?: PollingConfig;
}

/**
 * Provider component for centralized polling state
 *
 * @example
 * <PollingProvider config={{ systemMetrics: 2000, ollamaStatus: 3000 }}>
 *   <App />
 * </PollingProvider>
 */
export function PollingProvider({ children, config }: PollingProviderProps) {
  const polling = usePolling(config);

  // Memoize the value to prevent unnecessary re-renders
  const value = useMemo(() => polling, [
    polling.systemMetrics,
    polling.ollamaStatus,
    polling.cloudCostSummary,
    polling.currentTime,
    polling.isPolling,
    polling.errors,
    polling.startPolling,
    polling.stopPolling,
    polling.refreshAll,
    polling.refreshSystemMetrics,
    polling.refreshOllamaStatus,
    polling.refreshCloudCosts,
  ]);

  return (
    <PollingContext.Provider value={value}>
      {children}
    </PollingContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════
// CONSUMER HOOK
// ═══════════════════════════════════════════════════════════════

/**
 * Hook to access centralized polling state
 *
 * @example
 * const { systemMetrics, ollamaStatus, refreshAll } = usePollingContext();
 */
export function usePollingContext(): UsePollingReturn {
  const context = useContext(PollingContext);

  if (!context) {
    throw new Error(
      'usePollingContext must be used within a PollingProvider. ' +
        'Wrap your app with <PollingProvider>.'
    );
  }

  return context;
}

// ═══════════════════════════════════════════════════════════════
// SELECTIVE HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Hook to get only system metrics from polling context
 */
export function useSystemMetricsPolling() {
  const { systemMetrics, refreshSystemMetrics, errors } = usePollingContext();
  return {
    metrics: systemMetrics,
    refresh: refreshSystemMetrics,
    error: errors.systemMetrics,
  };
}

/**
 * Hook to get only Ollama status from polling context
 */
export function useOllamaStatusPolling() {
  const { ollamaStatus, refreshOllamaStatus, errors } = usePollingContext();
  return {
    status: ollamaStatus,
    refresh: refreshOllamaStatus,
    error: errors.ollamaStatus,
  };
}

/**
 * Hook to get only cloud costs from polling context
 */
export function useCloudCostsPolling() {
  const { cloudCostSummary, refreshCloudCosts, errors } = usePollingContext();
  return {
    costs: cloudCostSummary,
    refresh: refreshCloudCosts,
    error: errors.cloudCosts,
  };
}

/**
 * Hook to get current time from polling context
 */
export function useCurrentTime() {
  const { currentTime } = usePollingContext();
  return currentTime;
}

/**
 * Hook to get polling control functions
 */
export function usePollingControl() {
  const { isPolling, startPolling, stopPolling, refreshAll } = usePollingContext();
  return { isPolling, startPolling, stopPolling, refreshAll };
}

export default PollingContext;
