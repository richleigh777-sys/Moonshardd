
import React from 'react';
import { ShieldCheck, Zap, Target } from 'lucide-react';
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
    const totalEarnings = commission + spiffs;
    const hourlyRate = hours > 0 ? totalEarnings / hours : 0;
    
    const nextMilestone = Math.ceil((totalEarnings + 1) / 500) * 500;
    const progressToMilestone = (totalEarnings / nextMilestone) * 100;

    return (
        <Card variant="refraction" className="h-[380px] flex flex-col p-4 bg-surface-main relative overflow-hidden group hover:shadow-2xl hover:border-accent-primary/40 transition-all duration-300">
            {/* Architectural accent glow behind */}
            <div className="absolute -right-12 -top-12 w-32 h-32 bg-accent-primary/10 rounded-full blur-2xl group-hover:bg-accent-primary/20 transition-all duration-500"></div>
            
            {/* Header */}
            <div className="flex justify-between items-start mb-5 shrink-0 relative z-10 border-b border-border-subtle pb-4">
                <div>
                    <h3 className="text-xs font-[800] uppercase tracking-wider text-text-muted flex items-center gap-1.5 leading-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-primary shadow-[0_0_8px_var(--color-accent-primary)] animate-pulse"></span>
                        Visual Telemetry Hub
                    </h3>
                    <h2 className="text-base font-black text-text-primary tracking-tight mt-1">Efficacy Performance</h2>
                </div>
                <div className="text-right">
                    <p className="text-[9px] uppercase font-bold tracking-widest text-text-muted mb-1 font-mono">Pacing Rate</p>
                    <p className="text-xs font-black text-accent-primary bg-accent-primary/10 border border-accent-primary/20 px-2 py-0.5 rounded-md font-mono">${hourlyRate.toFixed(2)} / hr</p>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="flex-1 flex flex-col justify-between relative z-10">
                
                {/* Verified vs Pending Grid Row */}
                <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-7">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-1.5 flex items-center gap-1.5">
                            <ShieldCheck size={14} className="text-status-success" /> Cycle Realized
                        </p>
                        <h2 className="text-xl font-black text-text-primary flex items-baseline tracking-tighter num-font">
                            <span className="text-sm text-text-muted font-black mr-1">$</span>
                            {totalEarnings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </h2>
                    </div>
                    
                    <div className="col-span-5 text-right bg-surface-alt/45 border border-border-subtle p-2.5 rounded-xl">
                        <p className="text-[9px] uppercase font-bold tracking-wider text-text-muted mb-0.5 block">Pipeline Est.</p>
                        <p className="text-sm font-black text-amber-500 flex items-center justify-end gap-1 font-mono">
                            <Zap size={12} className="text-amber-500 animate-pulse fill-current" />
                            +${pending.toLocaleString(undefined, {maximumFractionDigits: 0})}
                        </p>
                        <span className="text-[8px] font-bold text-text-muted uppercase tracking-tight block">Awaiting QA</span>
                    </div>
                </div>

                {/* Micro hourly performance stream visualization */}
                <div className="my-3 bg-surface-alt/25 border border-border-subtle p-3 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] font-black uppercase text-text-muted tracking-wider">Hourly Pacing Grid</span>
                        <span className="text-[9px] font-mono font-bold text-status-success bg-emerald-500/10 border border-emerald-500/20 px-1.5 rounded">AUTO-VIGIL ON</span>
                    </div>
                    {/* Circle indicators that show performance trends mock style but dynamic based on win rate/rev */}
                    <div className="flex items-center justify-between gap-1.5 pt-1">
                        {[0, 1, 2, 3, 4, 5].map((idx) => {
                            // First 3 always active, others dynamic based on hours
                            const isActive = hours > idx;
                            const levelColor = _winRate > 60 ? 'bg-emerald-500 shadow-emerald-500/40' : _winRate > 40 ? 'bg-violet-500 shadow-violet-500/40' : 'bg-amber-500 shadow-amber-500/40';
                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                                    <div className={`w-full h-1.5 rounded-full transition-all duration-500 ${
                                        isActive 
                                        ? `${levelColor} shadow-[0_0_6px_currentColor]`
                                        : 'bg-border-subtle/40'
                                    }`} />
                                    <span className="text-[7px] font-bold font-mono text-text-muted">{idx + 1}H</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Sub breakdown details with progress indicators */}
                <div className="space-y-2 pt-1 border-t border-border-subtle/50">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded bg-accent-primary"></span>
                            <span className="text-[11px] font-bold text-text-secondary">Base Commission</span>
                        </div>
                        <span className="text-xs font-extrabold text-text-primary font-mono">${commission.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded bg-accent-secondary"></span>
                            <span className="text-[11px] font-bold text-text-secondary flex items-center gap-1">
                                Performance Spiffs
                            </span>
                        </div>
                        <span className="text-xs font-extrabold text-text-primary font-mono">${spiffs.toLocaleString()}</span>
                    </div>
                </div>

                {/* Next Milestone target indicator */}
                <div className="pt-3">
                    <div className="flex justify-between items-end text-[9px] uppercase font-bold tracking-wider mb-1.5 text-text-muted">
                        <span className="flex items-center gap-1 font-bold text-text-secondary"><Target size={12} className="text-accent-primary" /> Goal Progress ({Math.min(100, Math.round(progressToMilestone))}% completed)</span>
                        <span className="text-text-primary font-mono font-black">${nextMilestone} target</span>
                    </div>
                    <div className="h-2 w-full bg-surface-alt border border-border-subtle rounded-full overflow-hidden p-0.5 relative">
                        <div 
                            className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_var(--color-accent-primary)]" 
                            style={{ width: `${Math.min(100, progressToMilestone)}%` }}
                        />
                    </div>
                </div>

            </div>
        </Card>
    );
};

