import React from 'react';
import { Trophy, Activity } from 'lucide-react';
import { useCRM } from '../../hooks/useCRM';
import { useLeaderboard } from './leaderboard/useLeaderboard';
import { Card } from '../ui/Base';

export const MiniLeaderboard = () => {
    const { sales, users, attendance, systemConfig } = useCRM();
    const { leaderData, monthName } = useLeaderboard(
        sales, users, attendance, systemConfig, new Date(), 'All', '', false
    );

    const topLeaders = leaderData.slice(0, 5);

    return (
        <Card className="flex flex-col h-full bg-surface-main border-border-subtle shadow-sm rounded-xl p-0 overflow-hidden group hover:border-accent-primary/30 transition-all">
            <div className="p-4 border-b border-border-subtle bg-surface-alt/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Trophy size={16} className="text-status-success" />
                    <h3 className="text-sm font-bold text-text-primary tracking-tight">Team Rankings</h3>
                </div>
                <div className="text-[10px] font-[700]  text-text-muted bg-surface-main px-2 py-1 rounded shadow-inner">
                    {monthName}
                </div>
            </div>
            
            <div className="p-4 flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar">
                {topLeaders.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-xs text-text-muted">
                        No ranking data available.
                    </div>
                ) : (
                    topLeaders.map((user, idx) => (
                        <div key={user.agentId} className="relative overflow-hidden flex items-center justify-between p-3 rounded-xl border border-border-subtle bg-surface-alt hover:bg-surface-highlight transition-all duration-300 group/row hover:-translate-y-0.5">
                            {/* Proportional visual telemetry backing bar */}
                            <div 
                                className="absolute left-0 bottom-0 top-0 bg-accent-primary/[0.04] border-r-2 border-accent-primary/10 pointer-events-none transition-all duration-500 rounded-l-xl" 
                                style={{ width: `${topLeaders[0].totalRevenue > 0 ? (user.totalRevenue / topLeaders[0].totalRevenue) * 100 : 0}%` }}
                            />
                            
                            <div className="flex items-center gap-3 relative z-10">
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black font-mono
                                    ${idx === 0 ? 'bg-amber-500/10 text-status-warning border border-amber-500/25 shadow-[0_0_8px_rgba(245,158,11,0.25)]' : 
                                    idx === 1 ? 'bg-slate-300/10 text-slate-300 border border-slate-300/25' :
                                    idx === 2 ? 'bg-amber-700/10 text-amber-600 border border-amber-700/25' : 
                                    'bg-surface-main text-text-muted border border-border-subtle'}
                                `}>
                                    {idx + 1}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-black text-text-primary group-hover/row:text-accent-primary transition-colors truncate max-w-[120px]">{user.agentName}</span>
                                    <span className="text-[10px] text-text-muted font-bold font-mono tracking-tight">{user.team} Unit</span>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-end relative z-10">
                                <span className="text-xs font-black text-status-success font-mono tracking-tight leading-none mb-1">
                                    ${user.totalRevenue.toLocaleString()}
                                </span>
                                <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider flex items-center gap-1">
                                    <Activity size={10} className="text-accent-primary" /> {user.dealCount} deals
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
};
