// BUNKER Metrics Store
// Zustand state management for API calls, tasks, and cost tracking

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type ApiProvider = 'claude' | 'openai' | 'perplexity' | 'gemini';
export type TaskStatus = 'queued' | 'running' | 'success' | 'failed';

export interface ApiCallMetric {
  id: string;
  timestamp: number; // Unix timestamp for easier serialization
  provider: ApiProvider;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  responseTimeMs: number;
  success: boolean;
  error?: string;
  conversationId?: string;
  agentId?: string;
}

export interface TaskMetric {
  id: string;
  timestamp: number;
  type: string;
  status: TaskStatus;
  agentId?: string;
  model?: string;
  durationMs: number;
  logs?: string[];
  output?: Record<string, unknown>;
}

export interface CostSummary {
  today: number;
  week: number;
  month: number;
  allTime: number;
}

export interface TokenSummary {
  input: number;
  output: number;
  total: number;
}

interface MetricsState {
  // Raw metrics data
  apiCalls: ApiCallMetric[];
  tasks: TaskMetric[];

  // Computed summaries (recalculated on changes)
  costSummary: CostSummary;
  tokenSummary: TokenSummary;

  // Connection state
  lastUpdated: number | null;
}

interface MetricsActions {
  // Record new metrics
  recordApiCall: (metric: Omit<ApiCallMetric, 'id'>) => void;
  recordTask: (task: Omit<TaskMetric, 'id'>) => void;

  // Update existing task
  updateTaskStatus: (id: string, status: TaskStatus, durationMs?: number) => void;
  appendTaskLog: (id: string, log: string) => void;
  setTaskOutput: (id: string, output: Record<string, unknown>) => void;

  // Queries
  getRecentApiCalls: (limit?: number) => ApiCallMetric[];
  getRecentTasks: (limit?: number) => TaskMetric[];
  getActiveTasks: () => TaskMetric[];
  getApiCallsByProvider: (provider: ApiProvider) => ApiCallMetric[];
  getTasksByStatus: (status: TaskStatus) => TaskMetric[];

  // Maintenance
  clearOldMetrics: (olderThanDays?: number) => void;
  recalculateSummaries: () => void;
  reset: () => void;
}

type MetricsStore = MetricsState & MetricsActions;

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function generateId(): string {
  return crypto.randomUUID();
}

function getStartOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function getStartOfWeek(timestamp: number): number {
  const date = new Date(timestamp);
  const day = date.getDay();
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function getStartOfMonth(timestamp: number): number {
  const date = new Date(timestamp);
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function calculateCostSummary(apiCalls: ApiCallMetric[]): CostSummary {
  const now = Date.now();
  const startOfToday = getStartOfDay(now);
  const startOfWeek = getStartOfWeek(now);
  const startOfMonth = getStartOfMonth(now);

  let today = 0;
  let week = 0;
  let month = 0;
  let allTime = 0;

  for (const call of apiCalls) {
    allTime += call.cost;
    if (call.timestamp >= startOfMonth) {
      month += call.cost;
    }
    if (call.timestamp >= startOfWeek) {
      week += call.cost;
    }
    if (call.timestamp >= startOfToday) {
      today += call.cost;
    }
  }

  return {
    today: Math.round(today * 10000) / 10000,
    week: Math.round(week * 10000) / 10000,
    month: Math.round(month * 10000) / 10000,
    allTime: Math.round(allTime * 10000) / 10000,
  };
}

function calculateTokenSummary(apiCalls: ApiCallMetric[]): TokenSummary {
  let input = 0;
  let output = 0;

  for (const call of apiCalls) {
    input += call.inputTokens;
    output += call.outputTokens;
  }

  return { input, output, total: input + output };
}

// ═══════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════

const initialState: MetricsState = {
  apiCalls: [],
  tasks: [],
  costSummary: { today: 0, week: 0, month: 0, allTime: 0 },
  tokenSummary: { input: 0, output: 0, total: 0 },
  lastUpdated: null,
};

export const useMetricsStore = create<MetricsStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ─────────────────────────────────────────────────────────
      // Record new metrics
      // ─────────────────────────────────────────────────────────

      recordApiCall: (metric) => {
        const newCall: ApiCallMetric = {
          ...metric,
          id: generateId(),
        };

        set((state) => {
          const apiCalls = [newCall, ...state.apiCalls];
          return {
            apiCalls,
            costSummary: calculateCostSummary(apiCalls),
            tokenSummary: calculateTokenSummary(apiCalls),
            lastUpdated: Date.now(),
          };
        });
      },

      recordTask: (task) => {
        const newTask: TaskMetric = {
          ...task,
          id: generateId(),
        };

        set((state) => ({
          tasks: [newTask, ...state.tasks],
          lastUpdated: Date.now(),
        }));

        return newTask.id;
      },

      // ─────────────────────────────────────────────────────────
      // Update existing task
      // ─────────────────────────────────────────────────────────

      updateTaskStatus: (id, status, durationMs) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  status,
                  durationMs: durationMs ?? task.durationMs,
                }
              : task
          ),
          lastUpdated: Date.now(),
        }));
      },

      appendTaskLog: (id, log) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  logs: [...(task.logs ?? []), log],
                }
              : task
          ),
        }));
      },

      setTaskOutput: (id, output) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, output } : task
          ),
        }));
      },

      // ─────────────────────────────────────────────────────────
      // Queries
      // ─────────────────────────────────────────────────────────

      getRecentApiCalls: (limit = 50) => {
        return get().apiCalls.slice(0, limit);
      },

      getRecentTasks: (limit = 50) => {
        return get().tasks.slice(0, limit);
      },

      getActiveTasks: () => {
        return get().tasks.filter(
          (t) => t.status === 'queued' || t.status === 'running'
        );
      },

      getApiCallsByProvider: (provider) => {
        return get().apiCalls.filter((c) => c.provider === provider);
      },

      getTasksByStatus: (status) => {
        return get().tasks.filter((t) => t.status === status);
      },

      // ─────────────────────────────────────────────────────────
      // Maintenance
      // ─────────────────────────────────────────────────────────

      clearOldMetrics: (olderThanDays = 30) => {
        const cutoff = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;

        set((state) => {
          const apiCalls = state.apiCalls.filter((c) => c.timestamp >= cutoff);
          const tasks = state.tasks.filter((t) => t.timestamp >= cutoff);

          return {
            apiCalls,
            tasks,
            costSummary: calculateCostSummary(apiCalls),
            tokenSummary: calculateTokenSummary(apiCalls),
          };
        });
      },

      recalculateSummaries: () => {
        set((state) => ({
          costSummary: calculateCostSummary(state.apiCalls),
          tokenSummary: calculateTokenSummary(state.apiCalls),
        }));
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'bunker-metrics',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        apiCalls: state.apiCalls,
        tasks: state.tasks,
      }),
      onRehydrateStorage: () => (state) => {
        // Recalculate summaries after rehydration
        if (state) {
          state.recalculateSummaries();
        }
      },
    }
  )
);

// ═══════════════════════════════════════════════════════════════
// SELECTORS (for optimized subscriptions)
// ═══════════════════════════════════════════════════════════════

export const selectCostSummary = (state: MetricsStore) => state.costSummary;
export const selectTokenSummary = (state: MetricsStore) => state.tokenSummary;
export const selectActiveTasks = (state: MetricsStore) =>
  state.tasks.filter((t) => t.status === 'queued' || t.status === 'running');
export const selectRecentTasks = (limit: number) => (state: MetricsStore) =>
  state.tasks.slice(0, limit);
