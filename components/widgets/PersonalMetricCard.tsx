
import React from 'react';
import { Target } from 'lucide-react';
import { Card } from '../ui/Base';

interface Props {
    revenue?: number;
    winRate?: number;
    hours?: number;
    commission?: number;
    spiffs?: number;
    pending?: number;
}

export const PersonalMetricCard: React.FC<Props> = ({ 
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
                    <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                        <Target size={16} className="text-accent-primary" />
                        Performance Dashboard
                    </h3>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">Today's earnings trajectory</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] uppercase font-semibold tracking-wider text-text-muted mb-1">Effective Rate</p>
                    <p className="text-sm font-semibold text-accent-primary">${hourlyRate.toFixed(2)} / hr</p>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="flex-1 flex flex-col justify-between relative z-10">
                
                {/* Verified vs Pending Grid Row */}
                <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-7">
                        <p className="text-[11px] font-medium text-text-muted mb-1">Realized Earnings</p>
                        <h2 className="text-2xl font-bold text-text-primary flex items-baseline">
                            <span className="text-base text-text-muted font-semibold mr-1">$</span>
                            {totalEarnings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </h2>
                    </div>
                    
                    <div className="col-span-5 text-right bg-surface-alt/50 border border-border-subtle p-3 rounded-lg">
                        <p className="text-[11px] font-medium text-text-muted mb-1 block">Expected Pipeline</p>
                        <p className="text-base font-bold text-amber-500 flex items-center justify-end gap-1">
                            +${pending.toLocaleString(undefined, {maximumFractionDigits: 0})}
                        </p>
                        <span className="text-[10px] text-text-muted block mt-0.5">Awaiting Review</span>
                    </div>
                </div>

                {/* Micro hourly performance stream visualization */}
                <div className="my-4 bg-surface-main border border-border-subtle p-3.5 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-semibold text-text-secondary">Hourly Activity</span>
                        <span className="text-[10px] font-semibold text-status-success bg-status-success/10 px-2 py-0.5 rounded-md">Live</span>
                    </div>
                    {/* Circle indicators that show performance trends mock style but dynamic based on win rate/rev */}
                    <div className="flex items-center justify-between gap-1.5">
                        {[0, 1, 2, 3, 4, 5].map((idx) => {
                            // First 3 always active, others dynamic based on hours
                            const isActive = hours > idx;
                            const levelColor = _winRate > 60 ? 'bg-status-success' : _winRate > 40 ? 'bg-accent-secondary' : 'bg-status-warning';
                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                                    <div className={`w-full h-1.5 rounded-full transition-all duration-500 ${
                                        isActive 
                                        ? levelColor
                                        : 'bg-border-subtle'
                                    }`} />
                                    <span className="text-[10px] text-text-muted">{idx + 1}h</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Sub breakdown details with progress indicators */}
                <div className="space-y-2.5 pt-2 border-t border-border-subtle">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded bg-accent-primary"></span>
                            <span className="text-xs font-medium text-text-secondary">Base Commission</span>
                        </div>
                        <span className="text-sm font-semibold text-text-primary">${commission.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded bg-accent-secondary"></span>
                            <span className="text-xs font-medium text-text-secondary flex items-center">
                                Performance Details
                            </span>
                        </div>
                        <span className="text-sm font-semibold text-text-primary">${spiffs.toLocaleString()}</span>
                    </div>
                </div>

                {/* Next Milestone target indicator */}
                <div className="pt-4 mt-2">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-medium text-text-secondary">Goal Progress ({Math.min(100, Math.round(progressToMilestone))}%)</span>
                        <span className="text-xs font-semibold text-text-primary">${nextMilestone} Target</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-alt rounded-full overflow-hidden">
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

