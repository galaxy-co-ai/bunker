// ═══════════════════════════════════════════════════════════════
// BUNKER - Test Utilities
// Custom render functions and testing helpers
// ═══════════════════════════════════════════════════════════════

import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { vi } from 'vitest';

// Re-export everything from testing library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

// ═══════════════════════════════════════════════════════════════
// PROVIDERS WRAPPER
// ═══════════════════════════════════════════════════════════════

interface AllProvidersProps {
  children: ReactNode;
}

function AllProviders({ children }: AllProvidersProps) {
  // Add providers here as needed (e.g., context providers)
  return <>{children}</>;
}

// ═══════════════════════════════════════════════════════════════
// CUSTOM RENDER
// ═══════════════════════════════════════════════════════════════

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialState?: Record<string, unknown>;
}

function customRender(
  ui: ReactElement,
  options?: CustomRenderOptions
): RenderResult {
  const { initialState: _initialState, ...renderOptions } = options || {};

  return render(ui, {
    wrapper: AllProviders,
    ...renderOptions,
  });
}

// Override render export
export { customRender as render };

// ═══════════════════════════════════════════════════════════════
// MOCK FACTORIES
// ═══════════════════════════════════════════════════════════════

/**
 * Create a mock ModelStatus for testing
 */
export function createMockModelStatus(overrides: Partial<import('../lib/types').ModelStatus> = {}): import('../lib/types').ModelStatus {
  return {
    id: 'test-model-1',
    name: 'Test Model',
    status: 'idle',
    ramUsage: 4,
    ramCapacity: 8,
    temperature: 45,
    uptime: '2h 30m',
    tasksToday: 10,
    avgResponseTime: 500,
    ...overrides,
  };
}

/**
 * Create a mock QueueTask for testing
 */
export function createMockQueueTask(overrides: Partial<import('../lib/types').QueueTask> = {}): import('../lib/types').QueueTask {
  return {
    id: 'task-1',
    timestamp: new Date(),
    type: 'classification',
    status: 'queued',
    model: 'test-model',
    progress: 0,
    duration: 0,
    estimatedTime: 5000,
    ...overrides,
  };
}

/**
 * Create a mock Operation for testing
 */
export function createMockOperation(overrides: Partial<import('../lib/types').Operation> = {}): import('../lib/types').Operation {
  return {
    id: 'op-1',
    timestamp: new Date(),
    name: 'Test Operation',
    status: 'success',
    model: 'test-model',
    duration: 1500,
    ...overrides,
  };
}

/**
 * Create mock CostMetrics for testing
 */
export function createMockCostMetrics(overrides: Partial<import('../lib/types').CostMetrics> = {}): import('../lib/types').CostMetrics {
  return {
    today: 0.50,
    todayVsCloud: 85,
    savedToday: 2.50,
    week: 3.50,
    weekVsCloud: 82,
    month: 15.00,
    monthVsCloud: 80,
    totalSaved: 45.00,
    ...overrides,
  };
}

/**
 * Create mock Secret for testing
 */
export function createMockSecret(overrides: Partial<{ name: string; value: string | null; category: string }> = {}) {
  return {
    name: 'TEST_SECRET',
    value: null,
    category: 'Other',
    ...overrides,
  };
}

/**
 * Create mock OllamaStatus for testing
 */
export function createMockOllamaStatus(overrides: Partial<import('../lib/types').OllamaStatus> = {}): import('../lib/types').OllamaStatus {
  return {
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
    ],
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════
// ASYNC HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Wait for async state updates
 */
export async function waitForStateUpdate(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Wait for a specific amount of time
 */
export async function wait(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Flush all pending promises
 */
export async function flushPromises(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

// ═══════════════════════════════════════════════════════════════
// MOCK HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Setup mock invoke function with predefined responses
 */
export function setupMockInvoke(responses: Record<string, unknown>) {
  const mockInvoke = vi.fn().mockImplementation((command: string) => {
    if (command in responses) {
      return Promise.resolve(responses[command]);
    }
    return Promise.reject(new Error(`Unknown command: ${command}`));
  });

  vi.mock('@tauri-apps/api/core', () => ({
    invoke: mockInvoke,
  }));

  return mockInvoke;
}

/**
 * Create a controlled mock invoke with jest-style expectations
 */
export function createMockInvoke() {
  const handlers = new Map<string, (...args: unknown[]) => unknown>();

  const mockInvoke = vi.fn().mockImplementation((command: string, args?: unknown) => {
    const handler = handlers.get(command);
    if (handler) {
      return Promise.resolve(handler(args));
    }
    return Promise.resolve(null);
  });

  return {
    invoke: mockInvoke,
    when: (command: string, handler: (...args: unknown[]) => unknown) => {
      handlers.set(command, handler);
    },
    reset: () => {
      handlers.clear();
      mockInvoke.mockClear();
    },
  };
}

// ═══════════════════════════════════════════════════════════════
// CONSOLE MOCK
// ═══════════════════════════════════════════════════════════════

/**
 * Suppress console errors during test execution
 */
export function suppressConsoleErrors() {
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });
}

// ═══════════════════════════════════════════════════════════════
// ASSERTION HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Check if an element has specific class names
 */
export function hasClasses(element: Element, classNames: string[]): boolean {
  return classNames.every((className) => element.classList.contains(className));
}

/**
 * Get all text content from an element tree
 */
export function getAllTextContent(element: Element): string {
  return element.textContent || '';
}
