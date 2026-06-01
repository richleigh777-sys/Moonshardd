
import React from 'react';
import { ShieldCheck, Zap, TrendingUp, Target } from 'lucide-react';
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
        <Card className="h-[380px] flex flex-col p-6 bg-surface-main relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-start mb-6 shrink-0 relative z-10">
                <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-1">Performance Details</h3>
                    <p className="text-xs text-text-muted">Earnings and commission breakdown</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-1">Hourly Avg</p>
                    <p className="text-sm font-semibold text-text-primary">${hourlyRate.toFixed(2)}/hr</p>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="flex-1 flex flex-col relative z-10">
                <div className="flex justify-between items-end pb-6 mb-6 border-b border-border-subtle">
                    <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-2 flex items-center gap-1.5">
                            <ShieldCheck size={14} className="text-accent-primary" /> Verified Earnings
                        </p>
                        <h2 className="text-4xl font-light text-text-primary flex items-baseline tracking-tight">
                            <span className="text-xl text-text-muted font-normal mr-1">$</span>
                            {totalEarnings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </h2>
                    </div>
                    {pending > 0 && (
                        <div className="text-right">
                            <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-1">Pending Approval</p>
                            <p className="text-sm font-medium text-amber-500 flex items-center justify-end gap-1.5">
                                <TrendingUp size={14} /> +${pending.toLocaleString(undefined, {maximumFractionDigits:0})}
                            </p>
                        </div>
                    )}
                </div>

                {/* Breakdown Rows */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            <span className="text-xs font-medium text-text-secondary">Base Commission</span>
                        </div>
                        <span className="text-sm font-medium text-text-primary">${commission.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center px-2">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                            <span className="text-xs font-medium text-text-secondary flex items-center gap-1.5">
                                Performance Bonuses <Zap size={14} className="text-amber-500 fill-current opacity-70" />
                            </span>
                        </div>
                        <span className="text-sm font-medium text-text-primary">${spiffs.toLocaleString()}</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-auto pt-6">
                    <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider mb-3 text-text-muted">
                        <span className="flex items-center gap-1.5"><Target size={12} /> Next Target</span>
                        <span className="text-text-primary">${nextMilestone}</span>
                    </div>
                    <div className="h-2 w-full bg-surface-alt rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-accent-primary transition-all duration-1000 ease-out" 
                            style={{ width: `${Math.min(100, progressToMilestone)}%` }}
                        />
                    </div>
                </div>
            </div>
        </Card>
    );
};

