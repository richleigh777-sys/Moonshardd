
import React, { useState } from 'react';
import { Activity, Zap, ShieldCheck, Terminal } from 'lucide-react';
import { Card } from '../ui/Base';

interface Props {
    revenue?: number;
    winRate?: number;
    hours?: number;
    commission?: number;
    spiffs?: number;
    pending?: number;
}

export const PersonalMetricTerminal: React.FC<Props> = ({ 
    revenue: _revenue = 0, 
    winRate: _winRate = 0, 
    hours = 0,
    commission = 0,
    spiffs = 0,
    pending = 0
}) => {
    const [terminalId] = useState(() => Math.random().toString(36).substr(2, 6).toUpperCase());
    const totalEarnings = commission + spiffs;
    const hourlyRate = hours > 0 ? totalEarnings / hours : 0;
    
    // Gamification: Next Goal Milestone (Increments of $500)
    const nextMilestone = Math.ceil((totalEarnings + 1) / 500) * 500;
    const progressToMilestone = (totalEarnings / nextMilestone) * 100;

    return (
        <Card variant="panel" className="h-full p-0 flex flex-col border-border-subtle overflow-hidden group shadow-lg relative ring-1 ring-black/5 dark:ring-white/5 bg-surface-main">
            
            {/* Terminal Header */}
            <div className="px-4 py-3 border-b border-border-subtle bg-surface-alt/40 flex justify-between items-center shrink-0 relative overflow-hidden backdrop-blur-md">
                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                        <Terminal size={14} />
                    </div>
                    <div>
                        <h3 className="text-[10px] font-bold uppercase text-text-primary tracking-widest leading-none font-mono">MY_PERFORMANCE</h3>
                        <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest mt-0.5 font-mono">ID: {terminalId}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[8px] font-bold uppercase text-text-muted tracking-widest font-mono">HOURLY_AVG</p>
                    <p className="text-xs font-bold text-emerald-500 font-mono">${hourlyRate.toFixed(2)}/HR</p>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="flex-1 p-5 flex flex-col gap-5 relative z-10">
                {/* Grid Background Effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
                
                {/* Total Earnings Display */}
                <div className="flex justify-between items-end pb-4 border-b border-border-subtle relative z-10">
                    <div>
                        <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-1 flex items-center gap-1 font-mono">
                            <ShieldCheck size={10} className="text-emerald-500"/> VERIFIED_EARNINGS
                        </p>
                        <h2 className="text-3xl font-black text-text-primary font-mono tracking-tighter drop-shadow-sm flex items-baseline gap-1">
                            <span className="text-xl text-text-muted align-top">$</span>
                            {totalEarnings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </h2>
                    </div>
                    {pending > 0 && (
                        <div className="text-right opacity-80">
                            <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest mb-0.5 font-mono">PROJECTED</p>
                            <p className="text-xs font-bold text-amber-500 font-mono flex items-center justify-end gap-1">
                                <Activity size={10} className="animate-pulse"/> +${pending.toLocaleString(undefined, {maximumFractionDigits:0})}
                            </p>
                        </div>
                    )}
                </div>

                {/* Breakdown Rows */}
                <div className="space-y-2 relative z-10">
                    {/* Base Commission */}
                    <div className="flex justify-between items-center p-2 rounded bg-surface-alt border border-border-subtle hover:bg-surface-highlight transition-colors">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wide font-mono">BASE_COMMISSION</span>
                        </div>
                        <span className="text-xs font-bold text-blue-500 font-mono">${commission.toLocaleString()}</span>
                    </div>

                    {/* Spiffs / Bonuses */}
                    <div className="flex justify-between items-center p-2 rounded bg-surface-alt border border-border-subtle hover:bg-surface-highlight transition-colors">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-3 rounded-full bg-amber-500"></div>
                            <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wide flex items-center gap-1 font-mono">
                                BONUSES <Zap size={10} className="text-amber-500 fill-current" />
                            </span>
                        </div>
                        <span className="text-xs font-bold text-amber-500 font-mono">${spiffs.toLocaleString()}</span>
                    </div>
                </div>

                {/* Gamification Bar */}
                <div className="mt-auto relative z-10">
                    <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-wider mb-1.5 font-mono">
                        <span className="text-text-muted">NEXT_GOAL</span>
                        <span className="text-text-secondary">${nextMilestone}</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-alt rounded-sm overflow-hidden border border-border-subtle">
                        <div 
                            className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                            style={{ width: `${Math.min(100, progressToMilestone)}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </Card>
    );
};
