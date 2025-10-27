import React, { Component, ReactNode, ErrorInfo } from 'react';
import logger from '~/utils/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  /**
   * Custom fallback UI to display when an error occurs.
   * If not provided, uses the default error UI.
   */
  fallback?: ReactNode | ((error: Error, errorInfo: ErrorInfo) => ReactNode);
  /**
   * Callback fired when an error is caught.
   * Useful for error reporting services (e.g., Sentry, LogRocket).
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /**
   * Whether to show the detailed error message to users.
   * Default: false (only show in development)
   */
  showDetails?: boolean;
  /**
   * Custom error message to display to users instead of the actual error.
   */
  userMessage?: string;
  /**
   * Whether to show a reset button that clears the error state.
   * Default: true
   */
  showReset?: boolean;
  /**
   * Custom class name for the error container
   */
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Comprehensive Error Boundary component that catches JavaScript errors
 * anywhere in the child component tree, logs those errors, and displays
 * a fallback UI.
 *
 * @example
 * // Basic usage
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * @example
 * // With custom fallback
 * <ErrorBoundary fallback={<div>Something went wrong</div>}>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * @example
 * // With error reporting
 * <ErrorBoundary onError={(error, errorInfo) => {
 *   logErrorToService(error, errorInfo);
 * }}>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * @example
 * // With dynamic fallback based on error
 * <ErrorBoundary fallback={(error, errorInfo) => (
 *   <CustomErrorUI error={error} />
 * )}>
 *   <MyComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console
    logger.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error info for detailed display
    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (callbackError) {
        logger.error('Error in ErrorBoundary onError callback:', callbackError);
      }
    }

    // In production, you might want to send the error to an error reporting service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const {
      children,
      fallback,
      showDetails = import.meta.env.DEV,
      userMessage = 'Something went wrong. Please try refreshing the page.',
      showReset = true,
      className,
    } = this.props;

    if (hasError && error) {
      // If custom fallback is a function, call it with error details
      if (typeof fallback === 'function') {
        return fallback(error, errorInfo!);
      }

      // If custom fallback is provided, use it
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div
          role="alert"
          aria-live="assertive"
          className={
            className ||
            'flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-red-500/20 bg-red-500/5 p-8 text-center'
          }
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <svg
              className="h-8 w-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h2 className="mb-2 text-xl font-semibold text-text-primary">
            Oops! Something went wrong
          </h2>

          <p className="mb-4 max-w-md text-sm text-text-secondary">{userMessage}</p>

          {showDetails && error && (
            <details className="mb-4 w-full max-w-2xl text-left">
              <summary className="cursor-pointer text-sm font-medium text-text-primary hover:underline">
                Error Details (Development Mode)
              </summary>
              <div className="mt-2 rounded-md bg-black/5 p-4 dark:bg-white/5">
                <p className="mb-2 font-mono text-xs text-red-600 dark:text-red-400">
                  {error.toString()}
                </p>
                {errorInfo?.componentStack && (
                  <pre className="mt-2 max-h-60 overflow-auto whitespace-pre-wrap font-mono text-xs text-text-secondary">
                    {errorInfo.componentStack}
                  </pre>
                )}
              </div>
            </details>
          )}

          <div className="flex gap-3">
            {showReset && (
              <button
                onClick={this.handleReset}
                className="rounded-md bg-surface-primary px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-primary-hover focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Try again"
              >
                Try Again
              </button>
            )}
            <button
              onClick={() => window.location.reload()}
              className="rounded-md border border-border-medium bg-transparent px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Reload page"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
