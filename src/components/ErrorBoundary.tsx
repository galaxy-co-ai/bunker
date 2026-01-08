// Error Boundary Component
// Catches JavaScript errors anywhere in child component tree
// Prevents entire app from crashing due to component errors

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  section?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log to console for development
    console.error('Error Boundary caught error:', error);
    console.error('Component stack:', errorInfo.componentStack);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, section } = this.props;

    if (hasError) {
      // Custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI with Vault-Tec styling
      return (
        <div className="vault-panel p-4 m-2 flex flex-col items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="text-danger text-4xl mb-4">
              <span className="led-danger inline-block w-6 h-6" />
            </div>
            <h2 className="heading-text text-danger text-lg mb-2">
              SYSTEM MALFUNCTION
            </h2>
            <p className="terminal-text text-sm text-text-muted mb-4">
              {section ? `Error in ${section.toUpperCase()} module` : 'Component error detected'}
            </p>
            <div className="bg-concrete-dark border border-danger/50 rounded p-3 mb-4 max-w-md text-left">
              <p className="terminal-text text-xs text-danger break-all">
                {error?.message || 'Unknown error'}
              </p>
              {import.meta.env.DEV && errorInfo && (
                <details className="mt-2">
                  <summary className="text-text-muted text-xs cursor-pointer hover:text-vault-yellow">
                    Stack Trace
                  </summary>
                  <pre className="text-xs text-text-muted mt-2 overflow-auto max-h-40 whitespace-pre-wrap">
                    {errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
            <button
              onClick={this.handleRetry}
              className="vault-button vault-button-small"
              type="button"
            >
              RETRY OPERATION
            </button>
          </div>
        </div>
      );
    }

    return children;
  }
}

// HOC for wrapping functional components
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  section?: string
): React.ComponentType<P> {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const WithErrorBoundary: React.FC<P> = (props) => (
    <ErrorBoundary section={section || displayName}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundary.displayName = `WithErrorBoundary(${displayName})`;

  return WithErrorBoundary;
}

export default ErrorBoundary;
