import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-surface-main text-text-primary p-6">
          <div className="bg-surface-alt p-8 rounded-3xl shadow-xl max-w-lg w-full text-center border border-red-500/20">
            <div className="bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
               <AlertTriangle className="text-red-500" size={40} />
            </div>
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="text-text-muted mb-6">
              The application encountered an unexpected error. Please refresh the page.
            </p>
            <div className="bg-surface-main p-4 rounded-xl text-left text-sm font-mono text-red-400 overflow-x-auto mb-8 border border-border-subtle">
                {this.state.error?.message}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-accent-primary text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 mx-auto"
            >
              <RefreshCcw size={18} />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
