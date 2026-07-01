
import React from 'react';
import { User, AttendanceRecord } from '../../../types';
import { Badge } from '../../../components/ui/Base';
import { Clock, Zap, FileSpreadsheet, MessageSquare, Ghost, Sliders, Shield } from 'lucide-react';
import { getDailyHours } from '../../../views/utils/crmLogic';
import { getAgentAvatar } from '../../../constants';

interface OperativeRowProps {
    user: User;
    analytics: { revenue: number; count: number; winRate: number };
    globalMaxRevenue: number;
    attendance: AttendanceRecord[];
    currentUser: User | null;
    onOpenLedger: (user: User) => void;
    onChat: (userId: string) => void;
    onGhost: (userId: string) => void;
    onEdit: (user: User) => void;
    style?: React.CSSProperties;
}

const getRank = (revenue: number): { label: string, color: string } => {
    if (revenue >= 50000) return { label: 'S-Class', color: 'text-purple-400' };
    if (revenue >= 25000) return { label: 'A-Class', color: 'text-status-success' };
    if (revenue >= 10000) return { label: 'B-Class', color: 'text-blue-400' };
    return { label: 'C-Class', color: 'text-text-secondary' };
};

export const OperativeRow: React.FC<OperativeRowProps> = React.memo(({ 
    user: u, analytics, globalMaxRevenue, attendance, currentUser, 
    onOpenLedger, onChat, onGhost, onEdit, style 
}) => {
    const [now] = React.useState(() => Date.now());
    const performancePct = (analytics.revenue / (globalMaxRevenue || 1)) * 100;
    const hoursToday = getDailyHours(u.id, now, attendance);
    const isMe = currentUser?.id === u.id;
    const isAdmin = u.role === 'admin';
    const rank = getRank(analytics.revenue);

    return (
        <div 
            style={style}
            className="group grid grid-cols-12 gap-4 items-center px-4 mx-3 rounded-xl border border-transparent hover:border-accent-primary/20 hover:bg-surface-alt/40 transition-all duration-300 bg-surface-main/30 relative overflow-hidden h-[90px]"
        >
            {/* Performance Glow Backdrop */}
            <div 
                className="absolute inset-y-0 left-0 bg-accent-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
                style={{ width: `${Math.max(2, performancePct)}%` }}
            ></div>

            {/* 1. Profile */}
            <div className="col-span-4 flex items-center gap-4 pl-2 relative z-10">
                <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-surface-alt border border-border-subtle overflow-hidden shadow-lg group-hover:scale-105 group-hover:-rotate-2 transition-all">
                        <img src={u.avatar || getAgentAvatar(u.id)} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-[3px] border-surface-main ${
                        u.currentStatus === 'online' ? 'bg-emerald-500 shadow-sm' : 
                        u.currentStatus === 'break' ? 'bg-amber-500' : 
                        'bg-slate-500'
                    }`}></div>
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium  tracking-tight text-text-primary truncate">{u.name}</h4>
                        {isAdmin && <Shield size={16} className="text-accent-secondary fill-indigo-500/20"/>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                        <Badge status="Mid" className="px-1.5 py-0 h-4 text-sm font-medium opacity-80  tracking-wider">{u.team || 'ALPHA'}</Badge>
                        <code className="text-sm font-mono text-text-muted tracking-tighter opacity-70">{u.id}</code>
                    </div>
                </div>
            </div>

            {/* 2. Status */}
            <div className="col-span-2 text-center relative z-10">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium  tracking-wider ${
                    u.currentStatus === 'online' ? 'bg-emerald-500/5 text-status-success border-emerald-500/20' : 
                    u.currentStatus === 'break' ? 'bg-amber-500/5 text-status-warning border-amber-500/20' : 
                    'bg-surface-alt text-text-muted border-border-subtle'
                }`}>
                    {u.currentStatus || 'OFFLINE'}
                </span>
            </div>

            {/* 3. Metrics/Uptime */}
            <div className="col-span-2 relative z-10">
                <div className="flex flex-col gap-1.5 justify-center h-full">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium  text-text-muted tracking-wide flex items-center gap-1"><Clock size={10}/> Uptime</span>
                        <span className="text-sm font-mono font-bold text-text-primary">{hoursToday.toFixed(1)}h</span>
                    </div>
                    {u.dailyQuota ? (
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium  text-text-muted tracking-wide flex items-center gap-1">Quota</span>
                            <span className={`text-sm font-mono font-bold px-1.5 py-0.5 rounded ${analytics.revenue >= u.dailyQuota ? 'bg-emerald-500/10 text-status-success border border-emerald-500/20' : 'bg-surface-alt text-status-warning border border-border-subtle'}`}>
                                {Math.round((analytics.revenue / u.dailyQuota) * 100)}%
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium  text-text-muted tracking-wide opacity-0">Spacer</span>
                            <span className="text-sm font-mono opacity-0">0%</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 4. Performance Metrics */}
            <div className="col-span-2 relative z-10">
                <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-sm font-medium ">
                        <span className="text-text-muted">Revenue</span>
                        <span className="text-status-success font-mono">${analytics.revenue.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-alt rounded-full overflow-hidden border border-border-subtle">
                        <div 
                            className={`h-full bg-gradient-to-r from-indigo-500 to-accent-primary transition-all duration-1000`} 
                            style={{ width: `${Math.max(5, performancePct)}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold text-text-muted ">
                        <span className={rank.color}>{rank.label}</span>
                        <span className="text-status-warning flex items-center gap-0.5"><Zap size={16} fill="currentColor"/> {analytics.winRate}%</span>
                    </div>
                </div>
            </div>

            {/* 5. Actions */}
            <div className="col-span-2 flex justify-end gap-1.5 pr-2 relative z-20">
                <button 
                    onClick={() => onOpenLedger(u)}
                    className="h-8 w-8 flex items-center justify-center bg-surface-alt hover:bg-emerald-500/10 text-text-muted hover:text-status-success border border-border-subtle hover:border-status-success/30 rounded-xl transition-all shadow-sm group/btn"
                    title="View Ledger"
                >
                    <FileSpreadsheet size={16} className="group-hover/btn:scale-110 transition-transform"/>
                </button>
                {!isMe && (
                    <button 
                        onClick={() => onChat(u.id)}
                        className="h-8 w-8 flex items-center justify-center bg-surface-alt hover:bg-accent-secondary/10 text-text-muted hover:text-accent-secondary border border-border-subtle hover:border-accent-secondary/30 rounded-xl transition-all shadow-sm group/btn"
                        title="Message"
                    >
                        <MessageSquare size={16} className="group-hover/btn:scale-110 transition-transform"/>
                    </button>
                )}
                {(currentUser?.level || 0) >= 10 && (
                    <button 
                        onClick={() => onGhost(u.id)} 
                        className="h-8 w-8 flex items-center justify-center bg-surface-alt hover:bg-amber-500/10 text-text-muted hover:text-status-warning border border-border-subtle hover:border-status-warning/30 rounded-xl transition-all shadow-sm group/btn"
                        title="Impersonate User"
                    >
                        <Ghost size={16} className="group-hover/btn:scale-110 transition-transform"/>
                    </button>
                )}
                <button 
                    onClick={() => onEdit(u)} 
                    className="h-8 w-8 flex items-center justify-center bg-surface-alt hover:bg-accent-primary text-text-muted hover:text-white border border-border-subtle rounded-xl transition-all shadow-sm group/btn"
                    title="Manage Unit Profile"
                >
                    <Sliders size={16} className="group-hover/btn:scale-110 transition-transform"/>
                </button>
            </div>
        </div>
    );
});
