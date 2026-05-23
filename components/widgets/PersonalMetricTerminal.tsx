
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
        <Card variant="panel" className="h-[380px] p-0 flex flex-col overflow-hidden group relative bg-surface-main/90 border border-border-subtle shadow-panel backdrop-blur-3xl rounded-[1.25rem]">
            {/* Background Grid & Glow */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-50"></div>
            <div className="absolute -inset-px bg-gradient-to-br from-indigo-500/5 via-transparent to-emerald-500/5 dark:from-indigo-500/10 dark:to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

            {/* Terminal Header */}
            <div className="px-4 py-3 border-b border-border-subtle bg-surface-alt flex justify-between items-center shrink-0 relative z-10 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="px-2.5 py-1 rounded-md text-[10px] font-[700]  tracking-[0.2em] border border-emerald-500/20 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-status-success flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                        <Terminal size={14} className="animate-pulse" /> TX_PERF
                    </div>
                    <div>
                        <h3 className="text-xs font-bold  text-text-primary tracking-widest leading-none font-mono drop-shadow-md">MY_PERFORMANCE</h3>
                        <p className="text-[10px] font-bold text-text-muted  tracking-widest mt-1 font-mono">ID: {terminalId}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold  text-text-muted tracking-widest font-mono">HOURLY_AVG</p>
                    <p className="text-xs font-bold text-status-success font-mono drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">${hourlyRate.toFixed(2)}/HR</p>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="flex-1 p-5 flex flex-col gap-6 relative z-10 bg-transparent">
                {/* Total Earnings Display */}
                <div className="flex justify-between items-end pb-4 border-b border-border-subtle">
                    <div>
                        <p className="text-[10px] font-bold text-text-muted  tracking-widest mb-1.5 flex items-center gap-1.5 font-mono">
                            <ShieldCheck size={14} className="text-status-success"/> VERIFIED_EARNINGS
                        </p>
                        <h2 className="text-4xl font-[700] text-text-primary font-mono tracking-tighter drop-shadow-sm flex items-baseline gap-1">
                            <span className="text-xl text-text-muted align-top mr-1 font-sans font-medium">$</span>
                            {totalEarnings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </h2>
                    </div>
                    {pending > 0 && (
                        <div className="text-right opacity-90">
                            <p className="text-[10px] font-bold text-text-muted  tracking-widest mb-1 font-mono">PROJECTED</p>
                            <p className="text-xs font-bold text-amber-600 dark:text-status-warning font-mono flex items-center justify-end gap-1.5 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                                <Activity size={14} className="animate-pulse"/> +${pending.toLocaleString(undefined, {maximumFractionDigits:0})}
                            </p>
                        </div>
                    )}
                </div>

                {/* Breakdown Rows */}
                <div className="space-y-3">
                    {/* Base Commission */}
                    <div className="flex justify-between items-center p-3 rounded-lg bg-surface-alt border border-border-subtle hover:bg-surface-highlight transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-4 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                            <span className="text-[11px] font-bold text-text-secondary  tracking-widest font-mono">BASE_COMMISSION</span>
                        </div>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">${commission.toLocaleString()}</span>
                    </div>

                    {/* Spiffs / Bonuses */}
                    <div className="flex justify-between items-center p-3 rounded-lg bg-surface-alt border border-border-subtle hover:bg-surface-highlight transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-4 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                            <span className="text-[11px] font-bold text-text-secondary  tracking-widest flex items-center gap-1.5 font-mono">
                                BONUSES <Zap size={14} className="text-status-warning fill-current opacity-80" />
                            </span>
                        </div>
                        <span className="text-xs font-bold text-amber-600 dark:text-status-warning font-mono drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">${spiffs.toLocaleString()}</span>
                    </div>
                </div>

                {/* Gamification Bar */}
                <div className="mt-auto pt-2">
                    <div className="flex justify-between items-center text-[10px] font-bold  tracking-widest mb-2 font-mono">
                        <span className="text-text-muted flex items-center gap-1.5"><Activity size={12}/> NEXT_GOAL</span>
                        <span className="text-status-success drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">${nextMilestone}</span>
                    </div>
                    <div className="h-2 w-full bg-[#EAE5D9]  rounded-full overflow-hidden border border-border-subtle dark:border-border-subtle shadow-inner">
                        <div 
                            className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] dark:shadow-[0_0_15px_rgba(16,185,129,0.8)] rounded-full relative" 
                            style={{ width: `${Math.min(100, progressToMilestone)}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};
