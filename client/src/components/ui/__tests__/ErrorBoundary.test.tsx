import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorBoundary from '../ErrorBoundary';

// Component that throws an error for testing
function ThrowError({ shouldThrow }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
}

// Suppress console.error for these tests since we're intentionally throwing errors
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>,
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('displays custom user message when provided', () => {
    const customMessage = 'Custom error message';
    render(
      <ErrorBoundary userMessage={customMessage}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback UI</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Custom fallback UI')).toBeInTheDocument();
  });

  it('renders function fallback with error details', () => {
    render(
      <ErrorBoundary
        fallback={(error) => (
          <div>
            <h1>Error occurred</h1>
            <p>{error.message}</p>
          </div>
        )}
      >
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Error occurred')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('calls onError callback when error is caught', () => {
    const onError = jest.fn();
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      }),
    );
  });

  it('shows reset button by default', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByLabelText('Try again')).toBeInTheDocument();
  });

  it('hides reset button when showReset is false', () => {
    render(
      <ErrorBoundary showReset={false}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.queryByLabelText('Try again')).not.toBeInTheDocument();
  });

  it('resets error state when reset button is clicked', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();

    const resetButton = screen.getByLabelText('Try again');
    fireEvent.click(resetButton);

    // After reset, the component should try to render children again
    // Since ThrowError still has shouldThrow=true, it will throw again
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
  });

  it('shows reload page button', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByLabelText('Reload page')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-error-class';
    render(
      <ErrorBoundary className={customClass}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    const errorContainer = screen.getByRole('alert');
    expect(errorContainer).toHaveClass(customClass);
  });

  it('shows error details in development mode', () => {
    render(
      <ErrorBoundary showDetails={true}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/Error Details/i)).toBeInTheDocument();
  });

  it('hides error details when showDetails is false', () => {
    render(
      <ErrorBoundary showDetails={false}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.queryByText(/Error Details/i)).not.toBeInTheDocument();
  });

  it('handles onError callback errors gracefully', () => {
    const onError = jest.fn(() => {
      throw new Error('Callback error');
    });

    // Should not crash when onError callback throws
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });
});
