
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
    // Forensics: Log critical failure telemetry for forensic analysis
    console.error("[System Breach] Critical Disruption:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleHardReset = () => {
    if (window.confirm("⚠️ SYSTEM OVERRIDE: Confirm Hard Reset? This will purge local session state and reload the workspace.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

    public render() {
    if (this.state.hasError) {
      let displayMessage = this.state.error?.message || 'An unhandled exception occurred in the primary processing branch.';
      let operationType = '';
      let path = '';

      // Attempt to parse Firestore JSON error
      try {
        if (displayMessage.startsWith('{')) {
          const parsed = JSON.parse(displayMessage);
          displayMessage = parsed.error || displayMessage;
          operationType = parsed.operationType || '';
          path = parsed.path || '';
        }
      } catch {
        // Fallback to raw message
      }

      return (
        <div className="fixed inset-0 z-[9999] h-screen w-screen bg-[#050505] flex items-center justify-center p-6 font-sans overflow-hidden">
            {/* Atmospheric Background Sub-layers */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.1),transparent_70%)] pointer-events-none animate-pulse duration-[4s]"></div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-20 pointer-events-none"></div>
            
            <Card variant="panel" className="max-w-lg w-full border-red-900/50 bg-[#0f0505]/95 backdrop-blur-2xl shadow-[0_0_100px_rgba(220,38,38,0.3)] p-10 relative overflow-hidden ring-1 ring-red-900/30 rounded-[2.5rem]">
                <div className="flex items-center gap-6 text-red-500 mb-8">
                    <div className="p-5 bg-red-500/10 rounded-2xl border border-red-500/20 shadow-lg shadow-red-500/10">
                        <ShieldAlert size={42} className="animate-pulse" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-red-500 italic leading-none">Core Fault</h1>
                        <p className="text-[10px] font-black text-red-400/60 uppercase tracking-[0.4em] mt-2">Mission Critical Interruption</p>
                    </div>
                </div>

                <div className="bg-black/60 border border-red-900/20 rounded-2xl p-6 mb-8 font-mono text-[11px] text-red-300/80 overflow-auto max-h-48 shadow-inner custom-scrollbar relative">
                    <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_#ef4444]"></div>
                        <p className="text-red-500 font-black uppercase tracking-widest text-[9px]">Forensic Data</p>
                    </div>
                    <p className="mb-2 font-bold text-white uppercase tracking-tight">{this.state.error?.name || 'Protocol Error'}</p>
                    <p className="leading-relaxed opacity-70 italic mb-2">"{displayMessage}"</p>
                    {operationType && (
                        <div className="mt-4 p-2 bg-red-500/5 border border-red-500/10 rounded-lg">
                            <p className="text-[8px] text-red-400 uppercase tracking-widest opacity-50">Operation: {operationType}</p>
                            {path && <p className="text-[8px] text-red-400 uppercase tracking-widest opacity-50">Path: {path}</p>}
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <Button 
                        onClick={this.handleReload} 
                        className="w-full h-16 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-black uppercase tracking-[0.25em] text-xs shadow-lg transition-all active:scale-[0.98]"
                    >
                        <RefreshCw size={18} className="mr-3" /> Attempt Protocol Restart
                    </Button>
                    
                    <button 
                        onClick={this.handleHardReset} 
                        className="w-full py-4 flex items-center justify-center gap-2 text-[10px] font-black text-red-500/40 hover:text-red-500 transition-all uppercase tracking-[0.3em] border border-transparent hover:bg-red-500/5 rounded-2xl"
                    >
                        <Trash2 size={12} /> Force Environment Flush
                    </button>
                </div>
                
                <div className="mt-10 pt-6 border-t border-white/5 text-center">
                    <p className="text-[9px] text-red-900/30 font-mono tracking-widest uppercase">NODE_FAULT_UID: {Date.now().toString(36).toUpperCase()}</p>
                </div>
            </Card>
        </div>
      );
    }

    return this.props.children;
  }
}