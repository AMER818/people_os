import { Component, ErrorInfo, ReactNode } from 'react';
import { AppError, logError } from '../utils/errorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch and handle React errors gracefully
 *
 * @example
 * ```tsx
 * <ErrorBoundary fallback={<ErrorFallback />}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error
    const appError =
      error instanceof AppError
        ? error
        : new AppError(error.message, 'REACT_ERROR', 500, { stack: error.stack });

    logError(appError, 'ErrorBoundary');

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-8">
          <div role="alert" aria-label="Error" className="max-w-md w-full bg-card rounded-[2rem] border border-border shadow-2xl p-12 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-destructive"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h1 className="text-2xl font-black text-foreground mb-4 uppercase tracking-tight">
              Something Went Wrong
            </h1>

            <p className="text-muted-foreground text-sm mb-8">
              {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
            </p>

            <button
              onClick={this.handleReset}
              className="w-full bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-primary-hover transition-all shadow-lg"
            >
              Try Again
            </button>

            <button
              onClick={() => (window.location.href = '/')}
              className="w-full mt-4 bg-secondary text-secondary-foreground px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-secondary/80 transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
