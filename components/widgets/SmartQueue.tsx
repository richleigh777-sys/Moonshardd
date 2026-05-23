import React, { useMemo, useState } from 'react';
import { Sale } from '../../types';
import { Target, Zap, Clock, ShieldAlert, ArrowRight, UserCheck, RefreshCw, Filter } from 'lucide-react';
import { useSystem } from '../../hooks/useSystem';
import { STAGE_STYLES } from '../../constants';
import { sfx } from '../../lib/soundService';

interface SmartQueueProps {
    sales: Sale[];
    onEngage: (sale: Sale) => void;
}

type FilterOption = 'All' | 'High Urgency' | 'Retention' | 'Reorders' | 'Referrals' | 'New Orders';

export const SmartQueue: React.FC<SmartQueueProps> = ({ sales, onEngage }) => {
    const { initiateCall } = useSystem();
    const [filter, setFilter] = useState<FilterOption>('All');

    // Smart ranking logic
    const rankedLeads = useMemo(() => {
        const nowMs = new Date().getTime();
        let scored = sales
            .filter(s => s.status !== 'Approved' && s.status !== 'Declined' && s.pipelineStatus !== 'Closed Won' && s.pipelineStatus !== 'Closed Lost')
            .map(s => {
                let score = 50;
                let reason = "Standard Pipeline";
                let urgency: 'high' | 'medium' | 'low' = 'low';
                
                // Pipeline stage scoring
                if (s.pipelineStatus === 'Retention') {
                    score += 30;
                    reason = "Approaching Churn Window";
                    urgency = 'high';
                } else if (s.pipelineStatus === 'Reorder') {
                    score += 25;
                    reason = "Supply Empty";
                    urgency = 'high';
                } else if (s.pipelineStatus === 'Rebuttal') {
                    score += 20;
                    reason = "In-progress Negotiation";
                    urgency = 'medium';
                } else if (s.pipelineStatus === 'Referral') {
                    score += 15;
                    reason = "Warm Lead via existing client";
                    urgency = 'medium';
                }

                // Time-based scoring
                const elapsedDays = (nowMs - s.timestamp) / (1000 * 60 * 60 * 24);
                if (elapsedDays < 1) {
                    score += 20;
                    urgency = 'high';
                    if (reason === "Standard Pipeline") reason = "Fresh Lead (SLA < 24h)";
                } else if (elapsedDays > 30) {
                    score -= 20;
                }

                return { ...s, score, reason, urgency };
            })
            .sort((a, b) => b.score - a.score);

        if (filter !== 'All') {
            scored = scored.filter(s => {
                if (filter === 'High Urgency') return s.urgency === 'high';
                if (filter === 'Retention') return s.pipelineStatus === 'Retention';
                if (filter === 'Reorders') return s.pipelineStatus === 'Reorder';
                if (filter === 'Referrals') return s.pipelineStatus === 'Referral';
                if (filter === 'New Orders') return s.pipelineStatus === 'New Order' || !s.pipelineStatus;
                return true;
            });
        }

        return scored.slice(0, 50); // Top 50 queue
    }, [sales, filter]);

    return (
        <div className="flex flex-col h-full bg-surface-main/40 border border-border-subtle rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl">
            <div className="p-4 bg-surface-alt/50 border-b border-border-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent-secondary/10 text-accent-secondary rounded-xl">
                        <Zap size={16} />
                    </div>
                    <div>
                        <h3 className="text-xs font-[700]  text-white tracking-widest">Smart Queue</h3>
                        <p className="text-[10px] text-text-muted">Next-Best-Action Engine</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 custom-scrollbar wrap">
                    <Filter size={12} className="text-text-muted shrink-0 mx-1" />
                    {(['All', 'High Urgency', 'Retention', 'Reorders', 'Referrals', 'New Orders'] as FilterOption[]).map(f => (
                        <button
                            key={f}
                            onClick={() => { setFilter(f); sfx.playClick(); }}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-[700]  tracking-wider whitespace-nowrap transition-all ${
                                filter === f 
                                    ? 'bg-indigo-500/20 text-accent-secondary border border-indigo-500/30' 
                                    : 'bg-surface-main/50 text-text-muted border border-border-subtle hover:border-accent-primary/20'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2 relative">
                {rankedLeads.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 opacity-50">
                        <div className="w-16 h-16 rounded-full bg-surface-alt flex items-center justify-center text-text-muted mb-4 border border-border-subtle">
                            <Target size={24} />
                        </div>
                        <h3 className="text-sm font-bold text-white  tracking-widest">Queue Empty</h3>
                        <p className="text-xs text-text-muted mt-2 text-center max-w-xs justify-center">No actionable leads matching your criteria. Keep hunting.</p>
                    </div>
                ) : (
                    rankedLeads.map((lead, idx) => {
                        const style = STAGE_STYLES[lead.pipelineStatus || 'New Order'] || STAGE_STYLES['New Order'];
                        return (
                            <div key={lead.id} className="p-3 bg-surface-main/30 border border-border-subtle hover:border-accent-primary/20 transition-all rounded-2xl group flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between z-10 relative">
                                
                                <div className="flex items-center gap-4 flex-1 w-full">
                                    <div className="w-8 h-8 rounded-full border border-border-strong flex items-center justify-center font-[700] text-xs text-text-muted bg-surface-alt shrink-0">
                                        {idx + 1}
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-white truncate max-w-[150px]">{lead.customer}</span>
                                            {lead.urgency === 'high' && <span className="flex items-center gap-1 text-[9px] font-[700]  bg-red-500/20 text-status-error px-1.5 py-0.5 rounded border border-status-error/30"><ShieldAlert size={10}/> HOT</span>}
                                        </div>
                                        <span className="text-xs font-mono text-status-success">${lead.amount || 0}</span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-4 justify-between w-full sm:w-auto mt-2 sm:mt-0">
                                    <div className="flex flex-col items-start sm:items-end flex-1 sm:flex-none">
                                        <span className={`text-[10px] font-bold  tracking-wider ${style.color}`}>
                                            {style.label}
                                        </span>
                                        <span className="text-[10px] text-text-muted truncate max-w-[120px] pt-1">
                                            {lead.reason}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => onEngage(lead)}
                                            className="h-8 w-8 bg-surface-alt text-text-muted hover:text-white rounded-lg flex items-center justify-center border border-border-subtle hover:border-accent-primary/30 hover:bg-surface-main transition-all"
                                            title="Open Record"
                                        >
                                            <UserCheck size={14} />
                                        </button>
                                        <button 
                                            onClick={() => initiateCall(lead.phone)}
                                            className="h-8 px-3 bg-accent-secondary/10 text-accent-secondary hover:bg-indigo-500 hover:text-white rounded-lg border border-accent-secondary/20 hover:border-accent-secondary flex items-center justify-center gap-1.5 transition-all outline-none"
                                            title="Send to Dialer"
                                        >
                                            <ArrowRight size={14} />
                                            <span className="text-[10px] font-[700]  tracking-wider">Dial</span>
                                        </button>
                                    </div>
                                </div>

                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
