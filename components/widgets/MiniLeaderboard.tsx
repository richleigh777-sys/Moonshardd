import React from 'react';
import { Trophy, ArrowUp, ArrowDown, Activity } from 'lucide-react';
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
        <Card className="flex flex-col h-full bg-surface-main border-border-subtle shadow-sm rounded-2xl p-0 overflow-hidden group hover:border-accent-primary/30 transition-all">
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
                        <div key={user.agentId} className="flex items-center justify-between p-2 rounded-xl border border-border-subtle bg-surface-alt hover:bg-surface-highlight transition-colors group/row">
                            <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-[700]
                                    ${idx === 0 ? 'bg-amber-500/10 text-status-warning border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 
                                    idx === 1 ? 'bg-slate-300/10 text-slate-300 border border-slate-300/20' :
                                    idx === 2 ? 'bg-amber-700/10 text-amber-600 border border-amber-700/20' : 
                                    'bg-surface-main text-text-muted border-border-subtle'}
                                `}>
                                    {idx + 1}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-text-primary truncate max-w-[100px]">{user.agentName}</span>
                                    <span className="text-[10px] text-text-muted font-mono">{user.team} Unit</span>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-bold text-status-success font-mono tracking-tighter">
                                    ${user.totalRevenue.toLocaleString()}
                                </span>
                                <span className="text-[10px] text-text-muted  tracking-wider flex items-center gap-1">
                                    <Activity size={10} /> {user.dealCount} deals
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
};
