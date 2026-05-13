
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
        <div className="bg-[#09090b] text-white px-6 py-4 border-b border-white/5 flex justify-between items-center shrink-0 z-20 relative">
            
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <LayoutTemplate className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white tracking-tight">Nexus Prime</h2>
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-500">
                                <Lock size={10} /> Secure
                            </span>
                            {customerTime && (
                                <span className="text-[10px] text-zinc-500 font-medium border-l border-white/10 pl-2">
                                    {customerTime} Local
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Mode Switcher */}
                <div className="bg-white/5 p-1 rounded-lg flex gap-1">
                    <button 
                        onClick={() => { setMode('order'); sfx.playClick(); }}
                        className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1.5 ${mode === 'order' ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Order
                    </button>
                    <button 
                        onClick={() => { setMode('callback'); sfx.playClick(); }}
                        className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1.5 ${mode === 'callback' ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Callback
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-6">
                {/* Session Timer */}
                <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                    <Timer size={14} className={seconds > 300 ? 'text-amber-500' : 'text-zinc-500'} />
                    <span className={`text-xs font-mono font-medium ${seconds > 300 ? 'text-amber-500' : 'text-zinc-400'}`}>{formatTime(seconds)}</span>
                </div>

                {/* Total Display */}
                <div className="flex flex-col items-end border-l border-white/10 pl-6">
                    <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-0.5">Total Amount</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-sm font-medium text-zinc-500">$</span>
                        <p className="text-2xl font-bold text-white tracking-tight">
                            {grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </p>
                    </div>
                </div>

                <div className="h-8 w-px bg-white/10 mx-2"></div>

                <button onClick={onCancel} className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};
