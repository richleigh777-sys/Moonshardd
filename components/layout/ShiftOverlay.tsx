import React from 'react';
import { Play, Shield } from 'lucide-react';
import { usePerformance } from '../../hooks/usePerformance';
import { useAuth } from '../../hooks/useAuth';

export const ShiftOverlay: React.FC = () => {
    const { clockIn } = usePerformance();
    const { currentUser } = useAuth();

    if (!currentUser) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-surface-alt/90  flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
            <div className="w-full max-w-md text-center space-y-8">
                <div className="flex justify-center mb-8">
                    <div className="w-24 h-24 bg-surface-main rounded-xl flex items-center justify-center shadow-panel border border-border-subtle relative overflow-hidden group">
                        <div className="absolute inset-0 bg-accent-primary/5 group-hover:bg-accent-primary/10 transition-colors"></div>
                        <Shield size={48} className="text-accent-primary relative z-10" />
                    </div>
                </div>
                
                <div className="space-y-3">
                    <h1 className="text-lg font-medium text-text-primary tracking-tight">
                        Welcome back, {currentUser.name.split(' ')[0]}
                    </h1>
                    <p className="text-text-muted font-medium text-lg">
                        Your workspace is ready. Let's make today great.
                    </p>
                </div>

                <div className="bg-surface-main p-5 rounded-xl border border-border-subtle shadow-float">
                    <div className="flex items-center justify-between mb-8 text-xs font-medium text-text-muted  tracking-wide">
                        <span>Current Time</span>
                        <span className="font-mono text-text-primary bg-surface-highlight px-3 py-1.5 rounded">
                            {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                    
                    <button 
                        onClick={clockIn}
                        className="w-full py-5 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-xl font-medium  tracking-wide shadow-lg shadow-accent-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                        <Play size={20} fill="currentColor" />
                        Start Shift
                    </button>
                    
                    <p className="mt-6 text-xs text-text-muted text-center leading-relaxed opacity-60">
                        By clocking in, you confirm your readiness to support our customers with empathy and excellence.
                    </p>
                </div>
            </div>
        </div>
    );
};
