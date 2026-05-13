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
        <Card variant="panel" className="p-3 bg-surface-main/40 backdrop-blur-md border-border-subtle/40 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1 px-1.5 bg-indigo-500/10 rounded-lg text-indigo-500 border border-indigo-500/10 shadow-neon-indigo">
                    <BarChart3 size={12} strokeWidth={2.5} />
                </div>
                <div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-text-primary">Global Performance</h3>
                    <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">Aggregate Intelligence</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-text-muted">
                        <TrendingUp size={10} />
                        <span className="text-[8px] font-black uppercase tracking-widest">Avg. Deal Size</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-black text-text-primary num-font">${Math.round(stats.avgDeal).toLocaleString()}</span>
                        <span className="text-[8px] font-bold text-emerald-500">+5.2%</span>
                    </div>
                    <div className="h-0.5 w-full bg-surface-highlight rounded-full overflow-hidden">
                        <div className="h-full w-[65%] bg-indigo-500 rounded-full" />
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-text-muted">
                        <Users size={10} />
                        <span className="text-[8px] font-black uppercase tracking-widest">Rev. Per Agent</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-black text-text-primary num-font">${Math.round(stats.revPerAgent).toLocaleString()}</span>
                        <span className="text-[8px] font-bold text-emerald-500">+12.8%</span>
                    </div>
                    <div className="h-0.5 w-full bg-surface-highlight rounded-full overflow-hidden">
                        <div className="h-full w-[82%] bg-emerald-500 rounded-full" />
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-text-muted">
                        <Target size={10} />
                        <span className="text-[8px] font-black uppercase tracking-widest">Quota Attainment</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-black text-text-primary num-font">94.2%</span>
                        <span className="text-[8px] font-bold text-amber-500">On Track</span>
                    </div>
                    <div className="h-0.5 w-full bg-surface-highlight rounded-full overflow-hidden">
                        <div className="h-full w-[94%] bg-amber-500 rounded-full" />
                    </div>
                </div>
            </div>
        </Card>
    );
};
