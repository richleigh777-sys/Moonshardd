
import React, { useState, useEffect } from 'react';
import { LayoutTemplate, Lock, X, Timer } from 'lucide-react';
import { sfx } from '../../../lib/soundService';

interface EnrollmentHeaderProps {
    grandTotal: number;
    customerTime: string | null;
    mode: 'order' | 'callback';
    setMode: (m: 'order' | 'callback') => void;
    onCancel: () => void;
    onShowHistory?: () => void;
}

export const EnrollmentHeader: React.FC<EnrollmentHeaderProps> = ({ 
    grandTotal, customerTime, mode, setMode, onCancel, onShowHistory: _onShowHistory 
}) => {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setSeconds(s => s + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-transparent text-text-primary px-6 md:px-8 py-5 flex justify-between items-center shrink-0 z-20 relative">
            
            <div className="flex items-center gap-6 md:gap-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-accent-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-border-strong">
                        <LayoutTemplate className="w-6 h-6 text-text-primary drop-shadow-md" strokeWidth={2} />
                    </div>
                    <div>
                        <h2 className="text-sm font-[700] text-text-primary tracking-[0.2em] ">Nexus Prime</h2>
                        <div className="flex items-center gap-3 mt-1 text-[10px] font-bold  tracking-widest">
                            <span className="flex items-center gap-1.5 text-status-success">
                                <Lock size={12} /> Secure
                            </span>
                            {customerTime && (
                                <span className="text-text-muted border-l border-border-subtle pl-3">
                                    {customerTime} Local
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Mode Switcher */}
                <div className="bg-surface-main/50 backdrop-blur-md p-1.5 rounded-xl flex gap-1 border border-border-subtle shadow-inner">
                    <button 
                        onClick={() => { setMode('order'); sfx.playClick(); }}
                        className={`px-4 py-2 rounded-lg text-xs font-[700]  tracking-widest transition-all flex items-center gap-2 ${mode === 'order' ? 'bg-gradient-to-r from-indigo-500/20 to-accent-primary/20 text-text-primary shadow-[0_0_15px_rgba(99,102,241,0.3)] border border-border-subtle' : 'text-text-muted hover:text-text-primary hover:bg-surface-highlight/50'}`}
                    >
                        Order
                    </button>
                    <button 
                        onClick={() => { setMode('callback'); sfx.playClick(); }}
                        className={`px-4 py-2 rounded-lg text-xs font-[700]  tracking-widest transition-all flex items-center gap-2 ${mode === 'callback' ? 'bg-gradient-to-r from-indigo-500/20 to-accent-primary/20 text-text-primary shadow-[0_0_15px_rgba(99,102,241,0.3)] border border-border-subtle' : 'text-text-muted hover:text-text-primary hover:bg-surface-highlight/50'}`}
                    >
                        Callback
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-6 md:gap-8">
                {/* Session Timer */}
                <div className="hidden xl:flex flex-col items-end">
                    <span className="text-[10px] font-[700] text-text-muted  tracking-[0.2em] mb-1">Session</span>
                    <div className="flex items-center gap-2">
                        <Timer size={14} className={seconds > 300 ? 'text-status-warning' : 'text-accent-secondary'} />
                        <span className={`text-xs font-mono font-bold ${seconds > 300 ? 'text-status-warning max-w-[50px]' : 'text-text-primary'}`}>{formatTime(seconds)}</span>
                    </div>
                </div>

                {/* Total Display */}
                <div className="flex flex-col items-end border-l border-border-subtle pl-6 md:pl-8">
                    <span className="text-[10px] font-[700] text-text-muted  tracking-[0.2em] mb-0.5">Total Amount</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-sm font-bold text-accent-primary">$</span>
                        <p className="text-3xl font-[700] text-text-primary tracking-tighter drop-shadow-sm">
                            {grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </p>
                    </div>
                </div>

                <div className="h-10 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent mx-2"></div>

                <button onClick={onCancel} className="w-12 h-12 flex items-center justify-center hover:bg-red-500/10 hover:border-status-error/30 border border-transparent rounded-2xl text-text-muted hover:text-status-error transition-all group">
                    <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
            </div>
        </div>
    );
};
