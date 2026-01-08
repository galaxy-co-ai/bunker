// Error Handler Utility
// Centralized error handling with toast notifications

import { invoke } from '@tauri-apps/api/core';
import { OPERATIONS_COMMANDS } from './tauri-commands';
import { TOAST_DURATIONS, UI_LIMITS } from './config';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface AppError {
  code: string;
  message: string;
  details?: string;
  timestamp: Date;
  source?: string;
}

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface Toast {
  id: string;
  severity: ErrorSeverity;
  title: string;
  message: string;
  duration: number;
  timestamp: Date;
}

type ToastListener = (toast: Toast) => void;

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLER SINGLETON
// ═══════════════════════════════════════════════════════════════

class ErrorHandler {
  private listeners: Set<ToastListener> = new Set();
  private toastQueue: Toast[] = [];
  private maxQueueSize = UI_LIMITS.MAX_TOAST_QUEUE;

  /**
   * Subscribe to toast notifications
   */
  subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Emit a toast to all listeners
   */
  private emit(toast: Toast): void {
    this.toastQueue.push(toast);
    if (this.toastQueue.length > this.maxQueueSize) {
      this.toastQueue.shift();
    }
    this.listeners.forEach((listener) => listener(toast));
  }

  /**
   * Generate a unique toast ID
   */
  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  /**
   * Show an info toast
   */
  info(title: string, message: string, duration = TOAST_DURATIONS.INFO): void {
    this.emit({
      id: this.generateId(),
      severity: 'info',
      title,
      message,
      duration,
      timestamp: new Date(),
    });
  }

  /**
   * Show a warning toast
   */
  warning(title: string, message: string, duration = TOAST_DURATIONS.WARNING): void {
    this.emit({
      id: this.generateId(),
      severity: 'warning',
      title,
      message,
      duration,
      timestamp: new Date(),
    });
  }

  /**
   * Show an error toast
   */
  error(title: string, message: string, duration = TOAST_DURATIONS.ERROR): void {
    this.emit({
      id: this.generateId(),
      severity: 'error',
      title,
      message,
      duration,
      timestamp: new Date(),
    });
  }

  /**
   * Show a critical error toast
   */
  critical(title: string, message: string): void {
    this.emit({
      id: this.generateId(),
      severity: 'critical',
      title,
      message,
      duration: TOAST_DURATIONS.CRITICAL, // Critical toasts don't auto-dismiss
      timestamp: new Date(),
    });
  }

  /**
   * Handle a caught error
   */
  handleError(error: unknown, source?: string): AppError {
    const appError = this.parseError(error, source);

    // Log to console
    console.error(`[${source || 'App'}]`, appError.message, appError.details);

    // Log to operations log (fire and forget)
    this.logToBackend(appError).catch(() => {
      // Silently fail if backend logging fails
    });

    // Show toast based on severity
    if (appError.code.startsWith('CRITICAL_')) {
      this.critical('Critical Error', appError.message);
    } else if (appError.code.startsWith('NETWORK_')) {
      this.warning('Connection Issue', appError.message);
    } else {
      this.error('Error', appError.message);
    }

    return appError;
  }

  /**
   * Parse an unknown error into AppError format
   */
  private parseError(error: unknown, source?: string): AppError {
    const timestamp = new Date();

    if (error instanceof Error) {
      return {
        code: this.getErrorCode(error),
        message: error.message,
        details: error.stack,
        timestamp,
        source,
      };
    }

    if (typeof error === 'string') {
      return {
        code: 'UNKNOWN_ERROR',
        message: error,
        timestamp,
        source,
      };
    }

    if (typeof error === 'object' && error !== null) {
      const obj = error as Record<string, unknown>;
      return {
        code: (obj.code as string) || 'UNKNOWN_ERROR',
        message: (obj.message as string) || 'An unknown error occurred',
        details: JSON.stringify(error, null, 2),
        timestamp,
        source,
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      details: String(error),
      timestamp,
      source,
    };
  }

  /**
   * Derive an error code from an Error object
   */
  private getErrorCode(error: Error): string {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return 'NETWORK_ERROR';
    }
    if (message.includes('timeout')) {
      return 'TIMEOUT_ERROR';
    }
    if (message.includes('permission') || message.includes('unauthorized')) {
      return 'AUTH_ERROR';
    }
    if (message.includes('not found')) {
      return 'NOT_FOUND';
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return 'VALIDATION_ERROR';
    }

    return 'RUNTIME_ERROR';
  }

  /**
   * Log error to backend operations log
   */
  private async logToBackend(error: AppError): Promise<void> {
    await invoke(OPERATIONS_COMMANDS.ADD, {
      opType: 'error',
      target: error.source || 'frontend',
      status: 'failed',
      details: `${error.code}: ${error.message}`,
    });
  }

  /**
   * Get recent toasts
   */
  getRecentToasts(): Toast[] {
    return [...this.toastQueue];
  }

  /**
   * Clear toast queue
   */
  clearToasts(): void {
    this.toastQueue = [];
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Wrapper for async operations with error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  source?: string
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    errorHandler.handleError(error, source);
    return null;
  }
}

/**
 * Create a safe invoke wrapper for Tauri commands
 */
export function createSafeInvoke<TArgs extends Record<string, unknown>, TResult>(
  command: string,
  source?: string
) {
  return async (args?: TArgs): Promise<TResult | null> => {
    return withErrorHandling(
      () => invoke<TResult>(command, args),
      source || command
    );
  };
}
