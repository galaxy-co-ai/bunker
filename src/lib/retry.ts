// ═══════════════════════════════════════════════════════════════
// BUNKER - Retry Utility with Exponential Backoff
// Handles transient failures with configurable retry logic
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface RetryConfig {
  /** Maximum number of retry attempts (default: 3) */
  maxAttempts?: number;
  /** Initial delay in ms before first retry (default: 1000) */
  initialDelay?: number;
  /** Maximum delay cap in ms (default: 30000) */
  maxDelay?: number;
  /** Backoff multiplier (default: 2) */
  backoffFactor?: number;
  /** Add random jitter to prevent thundering herd (default: true) */
  jitter?: boolean;
  /** Predicate to determine if error is retryable (default: all errors) */
  isRetryable?: (error: unknown) => boolean;
  /** Callback called before each retry attempt */
  onRetry?: (attempt: number, error: unknown, nextDelay: number) => void;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: unknown;
  attempts: number;
  totalTime: number;
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: Required<Omit<RetryConfig, 'onRetry' | 'isRetryable'>> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffFactor: 2,
  jitter: true,
};

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate delay with optional jitter
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  backoffFactor: number,
  maxDelay: number,
  jitter: boolean
): number {
  // Exponential backoff: delay = initialDelay * (backoffFactor ^ attempt)
  let delay = initialDelay * Math.pow(backoffFactor, attempt);

  // Cap at max delay
  delay = Math.min(delay, maxDelay);

  // Add jitter (±25% randomization) to prevent thundering herd
  if (jitter) {
    const jitterRange = delay * 0.25;
    delay = delay - jitterRange + Math.random() * jitterRange * 2;
  }

  return Math.floor(delay);
}

/**
 * Check if an error is a network/transient error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('timeout') ||
      message.includes('connection') ||
      message.includes('econnrefused') ||
      message.includes('enotfound') ||
      message.includes('etimedout')
    );
  }
  return false;
}

/**
 * Check if an error is a server error (5xx status codes)
 */
export function isServerError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('500') ||
      message.includes('502') ||
      message.includes('503') ||
      message.includes('504') ||
      message.includes('server error') ||
      message.includes('internal error')
    );
  }
  return false;
}

/**
 * Default retryable error check - retries network and server errors
 */
export function isDefaultRetryable(error: unknown): boolean {
  return isNetworkError(error) || isServerError(error);
}

// ═══════════════════════════════════════════════════════════════
// MAIN RETRY FUNCTION
// ═══════════════════════════════════════════════════════════════

/**
 * Execute an async operation with retry logic and exponential backoff
 *
 * @example
 * const result = await withRetry(
 *   () => invoke('get_vault_secrets'),
 *   { maxAttempts: 3, initialDelay: 1000 }
 * );
 *
 * if (result.success) {
 *   console.log('Data:', result.data);
 * } else {
 *   console.error('Failed after', result.attempts, 'attempts');
 * }
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = {}
): Promise<RetryResult<T>> {
  const {
    maxAttempts = DEFAULT_CONFIG.maxAttempts,
    initialDelay = DEFAULT_CONFIG.initialDelay,
    maxDelay = DEFAULT_CONFIG.maxDelay,
    backoffFactor = DEFAULT_CONFIG.backoffFactor,
    jitter = DEFAULT_CONFIG.jitter,
    isRetryable = isDefaultRetryable,
    onRetry,
  } = config;

  const startTime = Date.now();
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const data = await operation();
      return {
        success: true,
        data,
        attempts: attempt + 1,
        totalTime: Date.now() - startTime,
      };
    } catch (error) {
      lastError = error;

      // Check if we should retry
      const isLastAttempt = attempt === maxAttempts - 1;
      const shouldRetry = !isLastAttempt && isRetryable(error);

      if (!shouldRetry) {
        break;
      }

      // Calculate delay for next attempt
      const delay = calculateDelay(
        attempt,
        initialDelay,
        backoffFactor,
        maxDelay,
        jitter
      );

      // Notify about retry
      if (onRetry) {
        onRetry(attempt + 1, error, delay);
      }

      // Wait before retrying
      await sleep(delay);
    }
  }

  return {
    success: false,
    error: lastError,
    attempts: maxAttempts,
    totalTime: Date.now() - startTime,
  };
}

// ═══════════════════════════════════════════════════════════════
// SPECIALIZED RETRY WRAPPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Retry wrapper optimized for Vault operations
 * Uses shorter delays and fewer attempts for local operations
 */
export async function withVaultRetry<T>(
  operation: () => Promise<T>,
  onRetry?: (attempt: number) => void
): Promise<RetryResult<T>> {
  return withRetry(operation, {
    maxAttempts: 3,
    initialDelay: 500,
    maxDelay: 5000,
    backoffFactor: 2,
    jitter: false,
    onRetry: onRetry
      ? (attempt) => onRetry(attempt)
      : undefined,
  });
}

/**
 * Retry wrapper optimized for cloud/network operations
 * Uses longer delays and more attempts for remote services
 */
export async function withCloudRetry<T>(
  operation: () => Promise<T>,
  onRetry?: (attempt: number, error: unknown, delay: number) => void
): Promise<RetryResult<T>> {
  return withRetry(operation, {
    maxAttempts: 5,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffFactor: 2,
    jitter: true,
    onRetry,
  });
}

/**
 * Retry wrapper for Ollama local service
 * Quick retries with short delays for local process
 */
export async function withOllamaRetry<T>(
  operation: () => Promise<T>,
  onRetry?: (attempt: number) => void
): Promise<RetryResult<T>> {
  return withRetry(operation, {
    maxAttempts: 3,
    initialDelay: 300,
    maxDelay: 2000,
    backoffFactor: 1.5,
    jitter: false,
    isRetryable: (error) => {
      // Retry connection errors (Ollama might be starting up)
      if (isNetworkError(error)) return true;
      // Also retry if Ollama returns specific errors
      if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        return msg.includes('loading') || msg.includes('starting');
      }
      return false;
    },
    onRetry: onRetry
      ? (attempt) => onRetry(attempt)
      : undefined,
  });
}

// ═══════════════════════════════════════════════════════════════
// CIRCUIT BREAKER PATTERN
// ═══════════════════════════════════════════════════════════════

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerConfig {
  /** Number of failures before opening circuit (default: 5) */
  failureThreshold?: number;
  /** Time in ms before attempting to close circuit (default: 30000) */
  resetTimeout?: number;
  /** Number of successes needed to close circuit from half-open (default: 2) */
  successThreshold?: number;
}

/**
 * Circuit breaker for protecting against cascading failures
 */
export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failures = 0;
  private successes = 0;
  private lastFailureTime = 0;
  private readonly failureThreshold: number;
  private readonly resetTimeout: number;
  private readonly successThreshold: number;

  constructor(config: CircuitBreakerConfig = {}) {
    this.failureThreshold = config.failureThreshold ?? 5;
    this.resetTimeout = config.resetTimeout ?? 30000;
    this.successThreshold = config.successThreshold ?? 2;
  }

  /**
   * Get current circuit state
   */
  getState(): CircuitState {
    if (this.state === 'open') {
      // Check if enough time has passed to try half-open
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = 'half-open';
        this.successes = 0;
      }
    }
    return this.state;
  }

  /**
   * Check if operation can be attempted
   */
  canAttempt(): boolean {
    const state = this.getState();
    return state !== 'open';
  }

  /**
   * Record a successful operation
   */
  recordSuccess(): void {
    this.failures = 0;

    if (this.state === 'half-open') {
      this.successes++;
      if (this.successes >= this.successThreshold) {
        this.state = 'closed';
        this.successes = 0;
      }
    }
  }

  /**
   * Record a failed operation
   */
  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.state === 'half-open') {
      // Immediately open circuit on failure in half-open state
      this.state = 'open';
      this.failures = 0;
    } else if (this.failures >= this.failureThreshold) {
      this.state = 'open';
    }
  }

  /**
   * Reset the circuit breaker
   */
  reset(): void {
    this.state = 'closed';
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = 0;
  }

  /**
   * Execute operation with circuit breaker protection
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.canAttempt()) {
      throw new Error('Circuit breaker is open - operation rejected');
    }

    try {
      const result = await operation();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }
}
