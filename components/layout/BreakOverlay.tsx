import React from 'react';
import { Coffee, Play } from 'lucide-react';
import { useAuth, useTimer } from '../../hooks/useAuth';
import { useCRM } from '../../hooks/useCRM';
import { formatTimer } from '../../views/utils/crmLogic';
import { sfx } from '../../lib/soundService';

export const BreakOverlay: React.FC = () => {
    const { currentUser } = useAuth();
    const { onToggleBreak, currentBreakDuration, breakReason } = useTimer();
    const { logAttendance } = useCRM();

    const handleEndBreak = () => {
        sfx.playConfirm();
        if (currentUser) {
            logAttendance('BREAK_END');
        }
        onToggleBreak();
    };

    return (
        <div className="fixed inset-0 z-[200] bg-surface-alt/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
            <div className="w-full max-w-md text-center space-y-10">
                <div className="flex justify-center mb-4">
                    <div className="w-28 h-28 bg-amber-500/5 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(245,158,11,0.1)] border border-amber-500/10 relative">
                        <div className="absolute inset-0 rounded-full border-4 border-amber-500/5 animate-ping"></div>
                        <Coffee size={56} className="text-status-warning relative z-10" />
                    </div>
                </div>
                
                <div className="space-y-3">
                    <h1 className="text-lg font-[700] text-text-primary tracking-tight">
                        {breakReason || 'Time to Recharge'}
                    </h1>
                    <p className="text-text-muted font-medium text-lg opacity-80">
                        Rest is essential for excellence. Enjoy your break.
                    </p>
                </div>

                <div className="bg-surface-main p-10 rounded-[2.5rem] border border-border-subtle shadow-float max-w-sm mx-auto">
                    <div className="text-center mb-10">
                        <div className="text-sm font-[700] text-text-muted  tracking-[0.2em] mb-3 opacity-60">Break Duration</div>
                        <div className="text-6xl font-mono font-[700] text-status-warning tabular-nums tracking-tighter">
                            {formatTimer(Math.floor(currentBreakDuration / 1000))}
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleEndBreak}
                        className="w-full py-5 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-xl font-[700]  tracking-[0.15em] shadow-lg shadow-accent-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                        <Play size={20} fill="currentColor" />
                        Resume Work
                    </button>
                </div>
            </div>
        </div>
    );
};
