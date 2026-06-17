
import React, { useState, useEffect } from 'react';
import { LayoutTemplate, Lock, X, Timer, Eraser } from 'lucide-react';
import { sfx } from '../../../lib/soundService';

interface EnrollmentHeaderProps {
    grandTotal: number;
    customerTime: string | null;
    mode: 'order' | 'callback' | 'approved';
    setMode: (m: 'order' | 'callback' | 'approved') => void;
    onCancel: () => void;
    onClear: () => void;
    onShowHistory?: () => void;
}

export const EnrollmentHeader: React.FC<EnrollmentHeaderProps> = ({ 
    grandTotal, customerTime, mode, setMode, onCancel, onClear, onShowHistory: _onShowHistory 
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
        <div className="bg-surface-main/80 backdrop-blur-xl text-text-primary px-8 py-5 flex justify-between items-center border-b border-border-subtle shrink-0 z-20 sticky top-0 shadow-sm">
            
            <div className="flex items-center gap-5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#6366F1]/20 to-[#818CF8]/10 text-accent-primary rounded-xl flex items-center justify-center border border-accent-primary/30 shadow-inner">
                        <LayoutTemplate size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-[800] tracking-tight">Deployment Console</h2>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-status-success/10 border border-status-success/20 text-sm font-bold text-status-success tracking-widest uppercase shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></div>
                                SECURE LINK
                            </div>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-sm font-[600] text-text-muted uppercase tracking-wider">
                            <span className="flex items-center gap-1.5 text-accent-primary">
                                <Lock size={10} /> 256-bit AES
                            </span>
                            {customerTime && (
                                <span className="border-l border-border-strong pl-3 flex items-center gap-1.5 drop-shadow">
                                    <Timer size={10} /> {customerTime} LOCAL
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Mode Switcher */}
                <div className="bg-surface-hover p-1 rounded-xl flex gap-1 border border-border-strong hidden sm:flex shadow-inner">
                    <button 
                        onClick={() => { setMode('order'); sfx.playClick(); }}
                        className={`px-5 py-1.5 rounded-lg text-sm tracking-widest uppercase font-[800] transition-all ${mode === 'order' ? 'bg-[#27272A] text-text-primary shadow border border-[#52525B]' : 'text-text-muted hover:text-text-primary'}`}
                    >
                        Order
                    </button>
                    <button 
                        onClick={() => { setMode('callback'); sfx.playClick(); }}
                        className={`px-5 py-1.5 rounded-lg text-sm tracking-widest uppercase font-[800] transition-all ${mode === 'callback' ? 'bg-[#27272A] text-text-primary shadow border border-[#52525B]' : 'text-text-muted hover:text-text-primary'}`}
                    >
                        Callback
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Session Timer */}
                <div className="hidden xl:flex flex-col items-end">
                    <span className="text-sm font-[800] text-text-secondary tracking-widest uppercase mb-1 flex items-center gap-1">
                        Session Time
                    </span>
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-mono tracking-wider font-[800] drop-shadow ${seconds > 300 ? 'text-status-error' : 'text-accent-primary'}`}>{formatTime(seconds)}</span>
                    </div>
                </div>

                <div className="w-px h-8 bg-[#3F3F46] mx-2 hidden xl:block"></div>

                {/* Total Display */}
                <div className="flex flex-col items-end border-l border-border-strong pl-6">
                    <span className="text-sm font-[800] text-text-secondary tracking-widest uppercase mb-1">Total Amount</span>
                    <div className="flex items-baseline gap-1 relative group">
                        <span className="text-sm font-black text-accent-primary absolute -left-3 top-1">$</span>
                        <p className="text-xl font-black text-text-primary tracking-tighter tabular-nums leading-none drop-shadow">
                            {grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </p>
                    </div>
                </div>

                <div className="w-px h-10 bg-[#3F3F46] mx-1"></div>

                <div className="flex items-center gap-2">
                    <button onClick={onClear} className="h-10 px-3 flex items-center justify-center gap-1.5 bg-surface-hover hover:bg-[#27272A] border border-transparent hover:border-border-strong rounded-xl text-text-muted hover:text-text-primary transition-all text-sm font-[800] uppercase tracking-widest shadow-inner">
                        <Eraser size={16} />
                        <span className="hidden lg:inline">Clear</span>
                    </button>
                    <button onClick={onCancel} className="w-10 h-10 flex items-center justify-center bg-surface-hover hover:bg-status-error/20 hover:text-status-error hover:border-status-error/30 border border-transparent rounded-xl text-text-muted transition-all shadow-inner" title="Discard and Close">
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>
            </div>
        </div>
    );
};
