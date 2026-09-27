import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: (reset: () => void) => ReactNode;
}

export class ErrorBoundary extends Component<Props, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Tool error', error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        this.props.fallback?.(this.reset) ?? (
          <div role="alert" className="card p-6 text-center">
            <p className="font-medium text-slate-900">This tool could not be loaded.</p>
            <p className="mt-1 text-sm text-slate-600">
              Please check your connection and try again.
            </p>
            <button
              type="button"
              className="btn-primary mt-4"
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
