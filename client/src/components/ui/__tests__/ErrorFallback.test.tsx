import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorFallback from '../ErrorFallback';

describe('ErrorFallback', () => {
  it('renders with default props', () => {
    render(<ErrorFallback />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('displays custom title and message', () => {
    const title = 'Custom Error Title';
    const message = 'Custom error message';

    render(<ErrorFallback title={title} message={message} />);

    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('shows error details when error prop is provided and showDetails is true', () => {
    const error = new Error('Test error message');

    render(<ErrorFallback error={error} showDetails={true} />);

    expect(screen.getByText(/Technical Details/i)).toBeInTheDocument();
    expect(screen.getByText(error.message)).toBeInTheDocument();
  });

  it('hides error details when showDetails is false', () => {
    const error = new Error('Test error message');

    render(<ErrorFallback error={error} showDetails={false} />);

    expect(screen.queryByText(/Technical Details/i)).not.toBeInTheDocument();
  });

  it('renders reset button when resetError function is provided', () => {
    const resetError = jest.fn();

    render(<ErrorFallback resetError={resetError} />);

    expect(screen.getByLabelText('Try again')).toBeInTheDocument();
  });

  it('does not render reset button when resetError is not provided', () => {
    render(<ErrorFallback />);

    expect(screen.queryByLabelText('Try again')).not.toBeInTheDocument();
  });

  it('calls resetError when reset button is clicked', () => {
    const resetError = jest.fn();

    render(<ErrorFallback resetError={resetError} />);

    const resetButton = screen.getByLabelText('Try again');
    fireEvent.click(resetButton);

    expect(resetError).toHaveBeenCalledTimes(1);
  });

  it('displays component stack when errorInfo is provided', () => {
    const error = new Error('Test error');
    const errorInfo = {
      componentStack: '    at Component (file.tsx:10:5)\n    at Parent (file.tsx:20:3)',
    };

    render(<ErrorFallback error={error} errorInfo={errorInfo} showDetails={true} />);

    expect(screen.getByText(/at Component/)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const customClass = 'custom-error-fallback';

    render(<ErrorFallback className={customClass} />);

    const container = screen.getByRole('alert');
    expect(container).toHaveClass(customClass);
  });

  it('has proper accessibility attributes', () => {
    render(<ErrorFallback />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });

  it('renders error icon', () => {
    render(<ErrorFallback />);

    // The SVG icon should be present and hidden from screen readers
    const icon = screen.getByRole('alert').querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('handles missing error gracefully', () => {
    render(<ErrorFallback showDetails={true} />);

    // Should render without crashing even when error is undefined
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.queryByText(/Technical Details/i)).not.toBeInTheDocument();
  });

  it('handles error without stack trace', () => {
    const error = new Error('Simple error');
    delete error.stack;

    render(<ErrorFallback error={error} showDetails={true} />);

    expect(screen.getByText('Simple error')).toBeInTheDocument();
  });
});
