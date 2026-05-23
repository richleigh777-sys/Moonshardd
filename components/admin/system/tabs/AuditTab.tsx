import React, { useMemo, useState } from 'react';
import { Card } from '../../../ui/Base';
import { ShieldAlert, Search, AlertTriangle, TrendingDown, Activity } from 'lucide-react';
import { useCRM } from '../../../../hooks/useCRM';
import { getDailyHours } from '../../../../views/utils/crmLogic';

export const AuditTab: React.FC = () => {
    const { users, sales, attendance } = useCRM();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterLevel, setFilterLevel] = useState<'all' | 'high' | 'medium' | 'low'>('all');


    const auditResults = useMemo(() => {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

        const activeAgents = users.filter(u => u.role === 'agent' && u.active);
        
        const insights = activeAgents.map(agent => {
            const todaysSales = sales.filter(s => 
                s.agentId === agent.id && 
                s.status === 'Approved' && 
                s.timestamp >= startOfDay
            );
            const dailyRevenue = todaysSales.reduce((sum, s) => sum + (s.amount || 0), 0);

            let hoursLoggedToday = getDailyHours(agent.id, today.getTime(), attendance);
            if (hoursLoggedToday === 0 && agent.loginTimeToday) {
                 hoursLoggedToday = (today.getTime() - agent.loginTimeToday) / (1000 * 60 * 60);
            }
            const effectiveHours = Math.max(0.1, hoursLoggedToday); 

            const efficiency = dailyRevenue / effectiveHours;
            
            let riskLevel: 'high' | 'medium' | 'low' = 'low';
            const riskReasons: string[] = [];

            if (hoursLoggedToday > 2 && efficiency < 20) {
                riskLevel = 'high';
                riskReasons.push(`Critical yield ($${efficiency.toFixed(0)}/hr)`);
            } else if (hoursLoggedToday > 2 && efficiency < 40) {
                riskLevel = 'medium';
                riskReasons.push(`Low yield ($${efficiency.toFixed(0)}/hr)`);
            }

            if (hoursLoggedToday > 3 && todaysSales.length === 0) {
                riskLevel = 'high';
                riskReasons.push(`Zero production >3h`);
            }

            const nowTime = today.getTime();

            if (agent.currentStatus === 'break' && (agent.lastActive || 0) < nowTime - (60 * 60 * 1000)) {
                riskLevel = riskLevel === 'high' ? 'high' : 'medium';
                riskReasons.push(`Extended Break (>1h)`);
            }

            if (agent.lastActive && agent.lastActive < nowTime - (4 * 60 * 60 * 1000) && agent.currentStatus !== 'offline') {
                riskLevel = 'high';
                riskReasons.push(`Ghosted (System disconnect >4h)`);
            }

            return {
                agent,
                dailyRevenue,
                effectiveHours,
                efficiency,
                riskLevel,
                riskReasons
            };
        });

        return insights.filter(i => {
            if (filterLevel !== 'all' && i.riskLevel !== filterLevel) return false;
            if (searchQuery && !i.agent.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            return true;
        }).sort((a, b) => {
            if (a.riskLevel === 'high' && b.riskLevel !== 'high') return -1;
            if (b.riskLevel === 'high' && a.riskLevel !== 'high') return 1;
            if (a.riskLevel === 'medium' && b.riskLevel === 'low') return -1;
            if (a.riskLevel === 'low' && b.riskLevel === 'medium') return 1;
            return a.efficiency - b.efficiency;
        });

    }, [users, sales, searchQuery, filterLevel, attendance]);

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-24 h-full flex flex-col">
            <div className="flex flex-col gap-2 shrink-0">
                <h3 className="text-xl font-[700] italic text-text-primary  tracking-tight flex items-center gap-2">
                    <ShieldAlert size={20} className="text-status-error" />
                    Deep Scan & Audit
                </h3>
                <p className="text-sm text-text-muted">Master diagnostic tool for performance, attendance, and compliance monitoring across all active operatives.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-4 shrink-0">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                        type="text" 
                        placeholder="Search Operative..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-surface-main border border-border-subtle rounded-xl py-2 pl-9 pr-4 text-sm font-bold placeholder:text-text-muted focus:border-accent-primary outline-none transition-colors"
                    />
                </div>
                <div className="flex bg-surface-main p-1 rounded-xl border border-border-subtle">
                    {['all', 'high', 'medium', 'low'].map(level => (
                        <button
                            key={level}
                            onClick={() => setFilterLevel(level as any)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-[700]  tracking-wider transition-all ${
                                filterLevel === level 
                                ? level === 'high' ? 'bg-red-500 text-white shadow-md' 
                                : level === 'medium' ? 'bg-amber-500 text-white shadow-md'
                                : level === 'low' ? 'bg-emerald-500 text-white shadow-md'
                                : 'bg-surface-alt text-text-primary shadow-md'
                                : 'text-text-muted hover:text-text-primary hover:bg-surface-alt'
                            }`}
                        >
                            {level}
                        </button>
                    ))}
                </div>
            </div>

            <Card className="flex-1 overflow-hidden p-0 bg-surface-main rounded-2xl border-border-subtle flex flex-col">
                <div className="overflow-y-auto w-full flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-surface-alt/50 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 border-b border-border-subtle text-xs font-[700]  text-text-muted tracking-widest hidden sm:table-cell">Status</th>
                                <th className="px-6 py-4 border-b border-border-subtle text-xs font-[700]  text-text-muted tracking-widest">Operative</th>
                                <th className="px-6 py-4 border-b border-border-subtle text-xs font-[700]  text-text-muted tracking-widest">Time</th>
                                <th className="px-6 py-4 border-b border-border-subtle text-xs font-[700]  text-text-muted tracking-widest text-right">Yield/hr</th>
                                <th className="px-6 py-4 border-b border-border-subtle text-xs font-[700]  text-text-muted tracking-widest">Flags</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle">
                            {auditResults.length > 0 ? auditResults.map((row, i) => (
                                <tr key={i} className="hover:bg-surface-highlight transition-colors group">
                                    <td className="px-6 py-4 align-top hidden sm:table-cell">
                                        <div className={`p-2 rounded-lg inline-flex ${row.riskLevel === 'high' ? 'bg-red-500/10 text-status-error border border-red-500/20' : row.riskLevel === 'medium' ? 'bg-amber-500/10 text-status-warning border border-amber-500/20' : 'bg-emerald-500/10 text-status-success border border-emerald-500/20'}`}>
                                            {row.riskLevel === 'high' ? <TrendingDown size={16} /> : row.riskLevel === 'medium' ? <AlertTriangle size={16} /> : <Activity size={16} />}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <div className="font-bold text-sm text-text-primary">{row.agent.name}</div>
                                        <div className="text-xs text-text-muted flex items-center gap-1 mt-0.5 font-mono">
                                            {row.agent.team || 'NO TEAM'} | ID: {row.agent.id}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <div className="text-sm font-bold font-mono">{row.effectiveHours.toFixed(1)}h</div>
                                        <div className={`text-[10px] font-bold  tracking-wider mt-1 ${row.agent.currentStatus === 'online' ? 'text-status-success' : row.agent.currentStatus === 'break' ? 'text-status-warning' : 'text-text-muted'}`}>
                                            {row.agent.currentStatus}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right align-top">
                                        <div className={`text-sm font-[700] num-font ${row.efficiency < 20 ? 'text-status-error' : 'text-status-success'}`}>${row.efficiency.toFixed(0)}</div>
                                        <div className="text-xs text-text-muted num-font mt-0.5">${row.dailyRevenue.toLocaleString()} Total</div>
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        {row.riskReasons.length > 0 ? (
                                            <ul className="space-y-1">
                                                {row.riskReasons.map((reason, idx) => (
                                                    <li key={idx} className="text-xs text-text-secondary flex items-start gap-1.5 leading-tight">
                                                        <span className="mt-0.5">•</span> {reason}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span className="text-xs text-status-success font-bold  tracking-wider">No Flags</span>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-text-muted">
                                        <ShieldAlert size={32} className="mx-auto mb-3 opacity-20" />
                                        <p className="text-sm font-bold  tracking-widest">No matching records found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
