
import React, { Component, ErrorInfo, ReactNode } from "react";
import { RefreshCw, Trash2, ShieldAlert } from "lucide-react";
import { Card, Button } from "./Base";

interface GlobalErrorBoundaryProps {
  children: ReactNode;
}

interface GlobalErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * BRAVEHEART COMMAND: GLOBAL ERROR BOUNDARY
 * 
 * Intercepts runtime exceptions across the application architecture 
 * and provides a secure, branded recovery terminal for the mission-critical CRM.
 */
export class GlobalErrorBoundary extends Component<GlobalErrorBoundaryProps, GlobalErrorBoundaryState> {
  // Fix: Explicitly defining props and state for the class instance to resolve 'Property does not exist' errors in strict environments.
  public props: GlobalErrorBoundaryProps;
  public state: GlobalErrorBoundaryState;

  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): GlobalErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Application Error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleHardReset = () => {
    if (window.confirm("Are you sure you want to reset? This will clear local data and reload the app.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

    public render() {
    if (this.state.hasError) {
      let displayMessage = (this.state.error?.message?.toString()) || 'An unexpected error occurred.';
      let operationType = '';
      let path = '';

      // Attempt to parse Firestore JSON error
      try {
        if (typeof displayMessage === 'string' && displayMessage.startsWith('{')) {
          const parsed = JSON.parse(displayMessage);
          displayMessage = parsed.error || displayMessage;
          operationType = parsed.operationType || '';
          path = parsed.path || '';
        }
      } catch {
        // Fallback to raw message
      }

      const isChunkError = displayMessage.toLowerCase().includes('failed to fetch dynamically imported module');
      if (isChunkError) {
        setTimeout(() => window.location.reload(), 3000);
      }

      return (
        <div className="fixed inset-0 z-[9999] h-screen w-screen bg-surface-main flex items-center justify-center p-6 font-sans overflow-hidden">
            
            <Card className="max-w-md w-full p-8 shadow-xl">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
                        <ShieldAlert size={24} />
                    </div>
                    <h1 className="text-xl font-bold text-text-primary mb-1">
                      {isChunkError ? 'System Update' : 'Application Error'}
                    </h1>
                    <p className="text-sm text-text-secondary">
                      {isChunkError ? 'Refreshing to load new version...' : 'Something went wrong.'}
                    </p>
                </div>

                <div className="bg-surface-alt rounded-lg p-4 mb-6 font-mono text-xs text-text-secondary overflow-auto max-h-48 border border-border-subtle custom-scrollbar">
                    <p className="font-semibold text-text-primary mb-1">{this.state.error?.name || 'Error'}</p>
                    <p className="leading-relaxed opacity-80 break-words">
                      {isChunkError 
                        ? "A new version has been deployed. Reloading session..." 
                        : displayMessage}
                    </p>
                    {operationType && (
                        <div className="mt-3 text-xs opacity-70">
                            <p>Operation: {operationType}</p>
                            {path && <p>Path: {path}</p>}
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <Button 
                        onClick={this.handleReload} 
                        className="w-full flex justify-center py-2 text-sm font-medium"
                    >
                        <RefreshCw size={16} className="mr-2" /> Reload Application
                    </Button>
                    
                    <button 
                        onClick={this.handleHardReset} 
                        className="w-full py-2 text-sm text-text-muted hover:text-text-primary transition-colors flex items-center justify-center"
                    >
                        <Trash2 size={14} className="mr-2" /> Clear local data
                    </button>
                </div>
            </Card>
        </div>
      );
    }

    return this.props.children;
  }
}