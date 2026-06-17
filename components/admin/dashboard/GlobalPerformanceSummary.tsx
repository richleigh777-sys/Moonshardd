import React, { useMemo } from 'react';
import { TrendingUp, Users, Target, BarChart3 } from 'lucide-react';
import { Card } from '../../ui/Base';
import { Sale, User } from '../../../types';

interface GlobalPerformanceSummaryProps {
    sales: Sale[];
    users: User[];
}

export const GlobalPerformanceSummary: React.FC<GlobalPerformanceSummaryProps> = ({ sales, users }) => {
    const stats = useMemo(() => {
        const approvedSales = sales.filter(s => s.status === 'Approved');
        const totalRev = approvedSales.reduce((acc, s) => acc + Number(s.amount), 0);
        const avgDeal = approvedSales.length > 0 ? totalRev / approvedSales.length : 0;
        
        const activeAgents = users.filter(u => u.role === 'agent' && u.currentStatus === 'online').length;
        const revPerAgent = activeAgents > 0 ? totalRev / activeAgents : totalRev;

        return { totalRev, avgDeal, activeAgents, revPerAgent };
    }, [sales, users]);

    return (
        <Card variant="panel" className="p-4 bg-surface-main/30 backdrop-blur-3xl shadow-panel border border-border-subtle relative overflow-hidden group hover:border-border-subtle transition-all rounded-xl min-h-[160px] flex flex-col justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-0"></div>
            <div className="absolute top-0 right-0 bottom-0 w-[2px] bg-gradient-to-b from-indigo-500/50 to-transparent opacity-30 z-0"></div>
            <div className="flex items-center gap-3 mb-8 relative z-10">
                <div className="p-4 bg-gradient-to-br from-surface-highlight to-surface-main border border-border-subtle rounded-xl text-accent-secondary group-hover:scale-110 transition-transform shadow-lg">
                    <BarChart3 size={24} strokeWidth={2} className="group-hover:animate-pulse drop-shadow-[0_0_12px_rgba(129,140,248,0.5)]" />
                </div>
                <div>
                    <h3 className="text-sm font-[700]  tracking-[0.2em] text-text-primary">Global Performance</h3>
                    <p className="text-sm font-bold text-text-muted  tracking-widest mt-1 opacity-80">Aggregate Intelligence Overview</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-3 relative z-10 w-full">
                <div className="space-y-4 p-4 rounded-xl bg-surface-main/40 border border-border-subtle shadow-inner relative overflow-hidden group/item hover:bg-surface-main/60 transition-colors">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-secondary/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover/item:scale-150 transition-transform duration-700"></div>
                    <div className="flex items-center gap-3 text-text-secondary relative z-10">
                        <TrendingUp size={16} className="text-accent-secondary" />
                        <span className="text-sm font-[700]  tracking-[0.2em]">Avg. Deal Size</span>
                    </div>
                    <div className="flex items-baseline gap-3 relative z-10">
                        <span className="text-lg font-display font-[700] text-text-primary tracking-tighter">${Math.round(stats.avgDeal).toLocaleString()}</span>
                        <span className="text-sm font-[700] text-accent-secondary bg-accent-secondary/10 px-2.5 py-1 rounded-lg border border-accent-secondary/20">+5.2%</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-alt/50 rounded-full overflow-hidden relative z-10 border border-border-subtle">
                        <div className="h-full w-[65%] bg-accent-secondary rounded-full shadow-[0_0_12px_var(--color-accent-secondary)]" />
                    </div>
                </div>

                <div className="space-y-4 p-4 rounded-xl bg-surface-main/40 border border-border-subtle shadow-inner relative overflow-hidden group/item hover:bg-surface-main/60 transition-colors">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-status-success/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover/item:scale-150 transition-transform duration-700"></div>
                    <div className="flex items-center gap-3 text-text-secondary relative z-10">
                        <Users size={16} className="text-status-success" />
                        <span className="text-sm font-[700]  tracking-[0.2em]">Rev. Per Agent</span>
                    </div>
                    <div className="flex items-baseline gap-3 relative z-10">
                        <span className="text-lg font-display font-[700] text-text-primary tracking-tighter">${Math.round(stats.revPerAgent).toLocaleString()}</span>
                        <span className="text-sm font-[700] text-status-success bg-status-success/10 px-2.5 py-1 rounded-lg border border-status-success/20">+12.8%</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-alt/50 rounded-full overflow-hidden relative z-10 border border-border-subtle">
                        <div className="h-full w-[82%] bg-status-success rounded-full shadow-[0_0_12px_var(--color-status-success)]" />
                    </div>
                </div>

                <div className="space-y-4 p-4 rounded-xl bg-surface-main/40 border border-border-subtle shadow-inner relative overflow-hidden group/item hover:bg-surface-main/60 transition-colors">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-status-warning/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover/item:scale-150 transition-transform duration-700"></div>
                    <div className="flex items-center gap-3 text-text-secondary relative z-10">
                        <Target size={16} className="text-status-warning" />
                        <span className="text-sm font-[700]  tracking-[0.2em]">Quota Attainment</span>
                    </div>
                    <div className="flex items-baseline gap-3 relative z-10">
                        <span className="text-lg font-display font-[700] text-text-primary tracking-tighter">94.2%</span>
                        <span className="text-sm font-[700] text-status-warning bg-status-warning/10 px-2.5 py-1 rounded-lg border border-status-warning/20 shadow-[0_0_10px_var(--color-status-warning)] animate-pulse">On Track</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-alt/50 rounded-full overflow-hidden relative z-10 border border-border-subtle">
                        <div className="h-full w-[94%] bg-status-warning rounded-full shadow-[0_0_12px_var(--color-status-warning)]" />
                    </div>
                </div>
            </div>
        </Card>
    );
};
