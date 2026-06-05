
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
        <div className="bg-surface-main text-text-primary px-8 py-5 flex justify-between items-center border-b border-border-subtle shrink-0 z-20 sticky top-0 shadow-sm">
            
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/10 text-accent-primary rounded-xl flex items-center justify-center border border-accent-primary/20 shadow-inner">
                        <LayoutTemplate size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-black text-text-primary tracking-tight">Checkout</h2>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-status-success/10 border border-status-success/20 text-[9px] font-bold text-status-success tracking-widest uppercase">
                                <div className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse"></div>
                                SECURE LINK
                            </div>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                            <span className="flex items-center gap-1.5 text-accent-primary/80">
                                <Lock size={10} /> 256-bit AES
                            </span>
                            {customerTime && (
                                <span className="border-l border-border-strong pl-3 flex items-center gap-1.5">
                                    <Timer size={10} /> {customerTime} LOCAL
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Mode Switcher */}
                <div className="bg-surface-alt p-1 rounded-xl flex gap-1 border border-border-strong hidden sm:flex shadow-inner">
                    <button 
                        onClick={() => { setMode('order'); sfx.playClick(); }}
                        className={`px-5 py-1.5 rounded-lg text-xs tracking-wide uppercase font-black transition-all ${mode === 'order' ? 'bg-surface-main text-text-primary shadow border border-border-subtle' : 'text-text-muted hover:text-text-primary'}`}
                    >
                        Order
                    </button>
                    <button 
                        onClick={() => { setMode('callback'); sfx.playClick(); }}
                        className={`px-5 py-1.5 rounded-lg text-xs tracking-wide uppercase font-black transition-all ${mode === 'callback' ? 'bg-surface-main text-text-primary shadow border border-border-subtle' : 'text-text-muted hover:text-text-primary'}`}
                    >
                        Callback
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-6">
                {/* Session Timer */}
                <div className="hidden xl:flex flex-col items-end">
                    <span className="text-[9px] font-black text-text-muted/70 tracking-widest uppercase mb-1 flex items-center gap-1">
                        Session Time
                    </span>
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-mono tracking-wider font-bold ${seconds > 300 ? 'text-status-warning' : 'text-accent-primary'}`}>{formatTime(seconds)}</span>
                    </div>
                </div>

                <div className="w-px h-8 bg-border-strong mx-2 hidden xl:block"></div>

                {/* Total Display */}
                <div className="flex flex-col items-end border-l border-border-strong pl-6">
                    <span className="text-[9px] font-black text-text-muted/70 tracking-widest uppercase mb-1">Total Amount</span>
                    <div className="flex items-baseline gap-1 relative group">
                        <span className="text-sm font-black text-accent-primary absolute -left-3 top-1">$</span>
                        <p className="text-3xl font-black text-text-primary tracking-tighter tabular-nums leading-none">
                            {grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </p>
                    </div>
                </div>

                <div className="w-px h-10 bg-border-strong mx-1"></div>

                <button onClick={onCancel} className="w-10 h-10 flex items-center justify-center bg-surface-alt hover:bg-status-error/10 hover:text-status-error hover:border-status-error/30 border border-transparent rounded-xl text-text-muted transition-all">
                    <X size={20} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
};
