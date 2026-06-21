
import React from 'react';
import { User, AttendanceRecord } from '../../../types';

import { Clock, Zap, FileText, MessageCircle, Eye, Settings, Activity, Star, User as UserIcon } from 'lucide-react';
import { getDailyHours } from '../../../views/utils/crmLogic';
import { getAgentAvatar } from '../../../constants';
import { ViewMode } from './hooks/useRosterLogic';

interface OperativeItemProps {
    user: User;
    analytics: { revenue: number; dailyRevenue: number; count: number; winRate: number, trend: number[], rank: string };
    globalMaxRevenue: number;
    attendance: AttendanceRecord[];
    currentUser: User | null;
    viewMode: ViewMode;
    onOpenLedger: (user: User) => void;
    onChat: (userId: string) => void;
    onGhost: (userId: string) => void;
    onEdit: (user: User) => void;
    style?: React.CSSProperties;
}

const getRankBadge = (rank: string) => {
    switch (rank) {
        case 'Visionary': return { color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: Star };
        case 'Catalyst': return { color: 'text-status-success', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: Zap };
        case 'Builder': return { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Activity };
        default: return { color: 'text-text-muted', bg: 'bg-surface-alt', border: 'border-border-subtle', icon: UserIcon };
    }
};

// Smooth Bezier Curve Sparkline
const OrganicSparkline = ({ data }: { data: number[] }) => {
    if (!data || data.length < 2) return null;
    const max = Math.max(...data, 1);
    const min = Math.min(...data);
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((val - min) / (max - min || 1)) * 80;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <path 
                d={`M 0 100 L 0 ${100 - ((data[0] - min) / (max - min || 1)) * 80} L ${points.replace(/,/g, ' ')} L 100 100 Z`} 
                className="fill-accent-primary/10" 
            />
            <polyline 
                points={points} 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-accent-primary"
            />
        </svg>
    );
};

export const OperativeItem: React.FC<OperativeItemProps> = React.memo(({ 
    user: u, analytics, attendance, currentUser, viewMode,
    onOpenLedger, onChat, onGhost, onEdit, style 
}) => {
    const [now] = React.useState(() => Date.now());
    const hoursToday = getDailyHours(u.id, now, attendance);
    const isMe = currentUser?.id === u.id;
    const rankStyle = getRankBadge(analytics.rank);

    // --- GRID VIEW (The "Partner Card") ---
    if (viewMode === 'grid') {
        return (
            <div style={style} className="p-2 h-full">
                <div className="group relative bg-surface-main border border-border-subtle rounded-xl p-4 hover:shadow-sm transition-all duration-500 h-full flex flex-col hover:-translate-y-1">
                    
                    {/* Header: Avatar & Status */}
                    <div className="flex justify-between items-start mb-2">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full p-1 bg-surface-alt border border-border-subtle overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-500">
                                <img src={u.avatar || getAgentAvatar(u.id)} className="w-full h-full object-cover rounded-full" alt="" />
                            </div>
                            <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-[2.5px] border-surface-main flex items-center justify-center ${
                                u.currentStatus === 'online' ? 'bg-emerald-400' : 
                                u.currentStatus === 'break' ? 'bg-amber-400' : 
                                'bg-text-muted/40'
                            }`} title={u.currentStatus}>
                                {u.currentStatus === 'online' && <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>}
                            </div>
                        </div>
                        
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                             {!isMe && (
                                 <button onClick={() => onChat(u.id)} className="p-2 rounded-full bg-surface-alt hover:bg-accent-secondary/10 text-text-muted hover:text-accent-secondary transition-colors shadow-sm">
                                     <MessageCircle size={16}/>
                                 </button>
                             )}
                             <button onClick={() => onEdit(u)} className="p-2 rounded-full bg-surface-alt hover:bg-surface-highlight text-text-muted hover:text-text-primary transition-colors shadow-sm">
                                 <Settings size={16}/>
                             </button>
                        </div>
                    </div>

                    {/* Identity */}
                    <div className="mb-3">
                        <h4 className="text-base font-bold text-text-primary leading-tight">{u.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`text-sm font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${rankStyle.bg} ${rankStyle.color} ${rankStyle.border}`}>
                                <rankStyle.icon size={16} /> {analytics.rank}
                            </span>
                            <span className="text-sm font-medium text-text-muted">{u.team}</span>
                        </div>
                    </div>

                    {/* Metrics Graph */}
                    <div className="flex-1 mb-3 relative min-h-[40px]">
                        <div className="flex justify-between items-end mb-1">
                             <div>
                                 <span className="text-sm font-bold text-text-muted  tracking-wide">Daily Production</span>
                                 <p className="text-lg font-bold text-text-primary num-font leading-none">${analytics.dailyRevenue.toLocaleString()}</p>
                                 <p className="text-sm text-text-muted">Total: ${analytics.revenue.toLocaleString()}</p>
                             </div>
                             <div className="h-6 w-20">
                                <OrganicSparkline data={analytics.trend} />
                             </div>
                        </div>
                        <div className="flex gap-3 pt-2 border-t border-border-subtle">
                             <div>
                                 <p className="text-sm text-text-muted font-medium mb-0.5 leading-none">Conn</p>
                                 <p className="text-sm font-bold text-text-primary flex items-center gap-0.5">
                                     <Zap size={16} className="text-status-warning fill-current"/> {analytics.winRate}%
                                 </p>
                             </div>
                             <div>
                                 <p className="text-sm text-text-muted font-medium mb-0.5 leading-none">Focus</p>
                                 <p className="text-sm font-bold text-text-primary flex items-center gap-0.5">
                                     <Clock size={16} className="text-blue-500"/> {hoursToday.toFixed(1)}h
                                 </p>
                             </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                        <button onClick={() => onOpenLedger(u)} className="py-1.5 rounded-lg bg-surface-alt hover:bg-surface-highlight text-sm font-bold text-text-secondary transition-colors flex items-center justify-center gap-1.5 group/btn">
                            <FileText size={16} className="group-hover/btn:text-accent-primary"/> Ledger
                        </button>
                        {(currentUser?.level || 0) >= 10 && (
                            <button onClick={() => onGhost(u.id)} className="py-1.5 rounded-lg bg-surface-alt hover:bg-accent-secondary/10 text-sm font-bold text-text-secondary hover:text-accent-secondary transition-colors flex items-center justify-center gap-1.5 group/btn">
                                <Eye size={16} className="group-hover/btn:text-accent-secondary"/> Assist
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // --- LIST VIEW (The "Clean Row") ---
    return (
        <div style={style} className="px-2.5 py-1">
            <div className="group flex items-center justify-between p-2 rounded-xl bg-surface-main border border-border-subtle hover:shadow-lg transition-all duration-300">
                
                {/* Left: Identity */}
                <div className="flex items-center gap-2.5 w-1/3">
                    <div className="relative">
                        <img src={u.avatar || getAgentAvatar(u.id)} className="w-8 h-8 rounded-full object-cover border border-border-subtle shadow-sm" alt="" />
                        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-surface-main ${
                            u.currentStatus === 'online' ? 'bg-emerald-400' : 'bg-text-muted/40'
                        }`}></div>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-text-primary leading-none">{u.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${rankStyle.bg} ${rankStyle.color}`}>
                                {analytics.rank}
                            </span>
                            <span className="text-sm text-text-muted">{u.team}</span>
                        </div>
                    </div>
                </div>

                {/* Middle: Metrics */}
                <div className="flex items-center gap-4 flex-1 justify-center">
                    <div className="text-center">
                        <span className="block text-sm font-medium text-text-muted  leading-none">Time</span>
                        <span className="text-sm font-bold text-text-primary">{hoursToday.toFixed(1)}h</span>
                    </div>
                    <div className="text-center">
                        <span className="block text-sm font-medium text-text-muted  leading-none">Rate</span>
                        <span className="text-sm font-bold text-text-primary">{analytics.winRate}%</span>
                    </div>
                    <div className="text-right min-w-[70px]">
                         <span className="block text-sm font-medium text-text-muted  leading-none">Contrib</span>
                         <span className="text-sm font-bold text-emerald-600">${analytics.revenue.toLocaleString()}</span>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                    <button onClick={() => onOpenLedger(u)} className="p-1.5 rounded-full hover:bg-surface-alt text-text-muted hover:text-text-primary transition-colors" title="View History"><FileText size={16}/></button>
                    {!isMe && <button onClick={() => onChat(u.id)} className="p-1.5 rounded-full hover:bg-accent-secondary/10 text-text-muted hover:text-accent-secondary transition-colors" title="Message"><MessageCircle size={16}/></button>}
                    {(currentUser?.level || 0) >= 10 && (
                        <button onClick={() => onGhost(u.id)} className="p-1.5 rounded-full hover:bg-amber-500/10 text-text-muted hover:text-status-warning transition-colors" title="Assist Mode"><Eye size={16}/></button>
                    )}
                    <button onClick={() => onEdit(u)} className="p-1.5 rounded-full hover:bg-surface-alt text-text-muted hover:text-text-primary transition-colors" title="Manage Unit Profile"><Settings size={16}/></button>
                </div>
            </div>
        </div>
    );
});
