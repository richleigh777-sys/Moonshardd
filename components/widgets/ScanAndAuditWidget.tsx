import React, { useMemo } from 'react';
import { ShieldAlert, TrendingDown, AlertTriangle, ArrowRight } from 'lucide-react';
import { useCRM } from '../../hooks/useCRM';
import { Card } from '../ui/Base';

interface Props {
    onGhostAgent?: (userId: string) => void;
}

export const ScanAndAuditWidget: React.FC<Props> = ({ onGhostAgent }) => {
    const { users, sales } = useCRM();

    const auditResults = useMemo(() => {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

        const activeAgents = users.filter(u => u.role === 'agent' && u.active);
        
        const insights = activeAgents.map(agent => {
            // Calculate today's revenue
            const todaysSales = sales.filter(s => 
                s.agentId === agent.id && 
                s.status === 'Approved' && 
                s.timestamp >= startOfDay
            );
            const dailyRevenue = todaysSales.reduce((sum, s) => sum + (s.amount || 0), 0);

            // Calculate hours worked (using loginTimeToday or defaulting to 1 if unknown to avoid div by 0 just for rough metrics)
            const hoursLoggedToday = (today.getTime() - (agent.loginTimeToday || startOfDay)) / (1000 * 60 * 60);
            const effectiveHours = Math.max(0.5, hoursLoggedToday); // Assume at least 30m

            const efficiency = dailyRevenue / effectiveHours;
            
            let riskLevel: 'high' | 'medium' | 'low' = 'low';
            let riskReason = '';

            // 1. Efficiency Check (B2C Outbound standard: below $50/hr is bad)
            if (hoursLoggedToday > 2 && efficiency < 20) {
                riskLevel = 'high';
                riskReason = `Critical yield (${efficiency.toFixed(0)}/hr)`;
            } else if (hoursLoggedToday > 2 && efficiency < 40) {
                riskLevel = 'medium';
                riskReason = `Low yield (${efficiency.toFixed(0)}/hr)`;
            }

            // 2. Dead Time Check (Logged in but no sales in 3 hours)
            if (hoursLoggedToday > 3 && todaysSales.length === 0) {
                riskLevel = 'high';
                riskReason = `Zero production >3h`;
            }

            const nowMs = today.getTime();

            // 3. Status check
            if (agent.currentStatus === 'break' && (agent.lastActive || 0) < nowMs - (60 * 60 * 1000)) {
                riskLevel = 'medium';
                riskReason = `Extended Break (>1h)`;
            }

            return {
                agent,
                dailyRevenue,
                effectiveHours,
                efficiency,
                riskLevel,
                riskReason
            };
        });

        return insights.filter(i => i.riskLevel !== 'low').sort((a, b) => {
            if (a.riskLevel === 'high' && b.riskLevel !== 'high') return -1;
            if (b.riskLevel === 'high' && a.riskLevel !== 'high') return 1;
            return a.efficiency - b.efficiency;
        }).slice(0, 5); // Top 5 critical items

    }, [users, sales]);

    return (
        <Card className="flex flex-col h-full bg-surface-main border-border-subtle shadow-sm rounded-xl p-0 overflow-hidden group">
            <div className="p-4 border-b border-border-subtle bg-red-500/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <ShieldAlert size={16} className="text-status-error" />
                    <h3 className="text-sm font-bold text-text-primary tracking-tight">Active Scan & Audit</h3>
                </div>
                <div className="text-[10px] font-[700]  text-text-muted bg-surface-main px-2 py-1 rounded border border-border-subtle shadow-inner">
                    {auditResults.length} Flags
                </div>
            </div>
            
            <div className="p-4 flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar">
                {auditResults.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                            <ShieldAlert size={24} className="text-status-success opacity-50" />
                        </div>
                        <p className="text-xs font-bold text-text-secondary  tracking-widest">All Clear</p>
                        <p className="text-[10px] text-text-muted mt-1">No critical discrepancies detected in active floor.</p>
                    </div>
                ) : (
                    auditResults.map((flag, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-3 rounded-xl border border-border-subtle bg-surface-alt hover:bg-surface-highlight transition-colors">
                            <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${flag.riskLevel === 'high' ? 'bg-red-500/10 text-status-error border border-red-500/20' : 'bg-amber-500/10 text-status-warning border border-amber-500/20'}`}>
                                {flag.riskLevel === 'high' ? <TrendingDown size={14} /> : <AlertTriangle size={14} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-text-primary truncate">{flag.agent.name}</span>
                                    {onGhostAgent && (
                                        <button 
                                            onClick={() => onGhostAgent(flag.agent.id)}
                                            className="text-[10px] font-bold text-accent-primary hover:text-white  tracking-wider flex items-center gap-1 group/btn"
                                        >
                                            Inspect <ArrowRight size={10} className="group-hover/btn:translate-x-0.5 transition-transform"/>
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs text-text-muted">{flag.riskReason}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
};
