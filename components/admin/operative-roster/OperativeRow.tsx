
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
    if (revenue >= 25000) return { label: 'A-Class', color: 'text-emerald-400' };
    if (revenue >= 10000) return { label: 'B-Class', color: 'text-blue-400' };
    return { label: 'C-Class', color: 'text-slate-400' };
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
            className="group grid grid-cols-12 gap-4 items-center px-4 mx-3 rounded-2xl border border-transparent hover:border-accent-primary/20 hover:bg-surface-alt/40 transition-all duration-300 bg-surface-main/30 relative overflow-hidden h-[90px]"
        >
            {/* Performance Glow Backdrop */}
            <div 
                className="absolute inset-y-0 left-0 bg-accent-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
                style={{ width: `${Math.max(2, performancePct)}%` }}
            ></div>

            {/* 1. Profile */}
            <div className="col-span-4 flex items-center gap-4 pl-2 relative z-10">
                <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-surface-alt border border-border-subtle overflow-hidden shadow-lg group-hover:scale-105 group-hover:-rotate-2 transition-all">
                        <img src={u.avatar || getAgentAvatar(u.id)} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-[3px] border-surface-main ${
                        u.currentStatus === 'online' ? 'bg-emerald-500 shadow-[0_0_10px_#10B981]' : 
                        u.currentStatus === 'break' ? 'bg-amber-500' : 
                        'bg-slate-500'
                    }`}></div>
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black uppercase tracking-tight text-text-primary truncate">{u.name}</h4>
                        {isAdmin && <Shield size={10} className="text-indigo-500 fill-indigo-500/20"/>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                        <Badge status="Mid" className="px-1.5 py-0 h-4 text-[8px] font-black opacity-80 uppercase tracking-wider">{u.team || 'ALPHA'}</Badge>
                        <code className="text-[8px] font-mono text-text-muted tracking-tighter opacity-70">{u.id}</code>
                    </div>
                </div>
            </div>

            {/* 2. Status */}
            <div className="col-span-2 text-center relative z-10">
                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-wider ${
                    u.currentStatus === 'online' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20' : 
                    u.currentStatus === 'break' ? 'bg-amber-500/5 text-amber-500 border-amber-500/20' : 
                    'bg-surface-alt text-text-muted border-border-subtle'
                }`}>
                    {u.currentStatus || 'OFFLINE'}
                </span>
            </div>

            {/* 3. Uptime */}
            <div className="col-span-2 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-surface-alt rounded-lg text-text-muted border border-border-subtle"><Clock size={12}/></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-mono font-bold text-text-primary">{hoursToday.toFixed(1)}h</span>
                        <span className="text-[8px] text-text-muted uppercase tracking-wider opacity-60">Daily</span>
                    </div>
                </div>
            </div>

            {/* 4. Performance Metrics */}
            <div className="col-span-2 relative z-10">
                <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase">
                        <span className="text-text-muted">Revenue</span>
                        <span className="text-emerald-500 font-mono">${analytics.revenue.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-alt rounded-full overflow-hidden border border-white/5">
                        <div 
                            className={`h-full bg-gradient-to-r from-indigo-500 to-accent-primary transition-all duration-1000`} 
                            style={{ width: `${Math.max(5, performancePct)}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between items-center text-[8px] font-bold text-text-muted uppercase">
                        <span className={rank.color}>{rank.label}</span>
                        <span className="text-amber-500 flex items-center gap-0.5"><Zap size={8} fill="currentColor"/> {analytics.winRate}%</span>
                    </div>
                </div>
            </div>

            {/* 5. Actions */}
            <div className="col-span-2 flex justify-end gap-1.5 pr-2 relative z-20">
                <button 
                    onClick={() => onOpenLedger(u)}
                    className="h-8 w-8 flex items-center justify-center bg-surface-alt hover:bg-emerald-500/10 text-text-muted hover:text-emerald-500 border border-border-subtle hover:border-emerald-500/30 rounded-xl transition-all shadow-sm group/btn"
                    title="View Ledger"
                >
                    <FileSpreadsheet size={14} className="group-hover/btn:scale-110 transition-transform"/>
                </button>
                {!isMe && (
                    <button 
                        onClick={() => onChat(u.id)}
                        className="h-8 w-8 flex items-center justify-center bg-surface-alt hover:bg-indigo-500/10 text-text-muted hover:text-indigo-400 border border-border-subtle hover:border-indigo-400/30 rounded-xl transition-all shadow-sm group/btn"
                        title="Message"
                    >
                        <MessageSquare size={14} className="group-hover/btn:scale-110 transition-transform"/>
                    </button>
                )}
                <button 
                    onClick={() => onGhost(u.id)} 
                    className="h-8 w-8 flex items-center justify-center bg-surface-alt hover:bg-amber-500/10 text-text-muted hover:text-amber-500 border border-border-subtle hover:border-amber-500/30 rounded-xl transition-all shadow-sm group/btn"
                    title="Impersonate User"
                >
                    <Ghost size={14} className="group-hover/btn:scale-110 transition-transform"/>
                </button>
                <button 
                    onClick={() => onEdit(u)} 
                    className="h-8 w-8 flex items-center justify-center bg-surface-alt hover:bg-accent-primary text-text-muted hover:text-white border border-border-subtle rounded-xl transition-all shadow-sm group/btn"
                    title="Configure"
                >
                    <Sliders size={14} className="group-hover/btn:scale-110 transition-transform"/>
                </button>
            </div>
        </div>
    );
});
