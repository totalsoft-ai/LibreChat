import type { ErrorInfo } from 'react';

interface ErrorFallbackProps {
  error?: Error;
  errorInfo?: ErrorInfo;
  resetError?: () => void;
  title?: string;
  message?: string;
  showDetails?: boolean;
  className?: string;
}

/**
 * Reusable error fallback UI component.
 * Can be used standalone or with ErrorBoundary.
 *
 * @example
 * <ErrorFallback
 *   error={error}
 *   resetError={() => window.location.reload()}
 *   title="Failed to load chat"
 *   message="We couldn't load your conversation. Please try again."
 * />
 */
export default function ErrorFallback({
  error,
  errorInfo,
  resetError,
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try refreshing the page.',
  showDetails = import.meta.env.DEV,
  className,
}: ErrorFallbackProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={
        className ||
        'flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-red-500/20 bg-red-500/5 p-6 text-center'
      }
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
        <svg
          className="h-6 w-6 text-red-500"
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

      <h3 className="mb-2 text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mb-4 max-w-md text-sm text-text-secondary">{message}</p>

      {showDetails && error && (
        <details className="mb-4 w-full max-w-xl text-left">
          <summary className="cursor-pointer text-xs font-medium text-text-primary hover:underline">
            Technical Details
          </summary>
          <div className="mt-2 rounded-md bg-black/5 p-3 dark:bg-white/5">
            <p className="font-mono text-xs text-red-600 dark:text-red-400">{error.toString()}</p>
            {errorInfo?.componentStack && (
              <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap font-mono text-xs text-text-secondary">
                {errorInfo.componentStack}
              </pre>
            )}
          </div>
        </details>
      )}

      {resetError && (
        <button
          onClick={resetError}
          className="rounded-md bg-surface-primary px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-primary-hover focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Try again"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
