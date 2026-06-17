
import { useMemo, useState } from 'react';
import { 
    Clock, DollarSign, 
    Wallet, ChevronRight, 
    Activity, AlertCircle, CheckCircle, User as UserIcon
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { AttendanceRecord, Sale, User } from '../../types';
import { Button } from '../ui/Base';
import { useCRM } from '../../hooks/useCRM';
import { usePerformance } from '../../hooks/usePerformance';
import { ShieldCheck } from 'lucide-react';
import { Card } from '../ui/Base';
import { calculateSalePayout, getDailyHours, formatDuration } from '../../views/utils/crmLogic';
import { sfx } from '../../lib/soundService';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User;
    attendance: AttendanceRecord[];
    sales: Sale[];
    embedded?: boolean;
}

type ViewMode = 'Month' | 'Cycle 1' | 'Cycle 2';

export const AgentTimeSheet: React.FC<Props> = ({ isOpen, onClose, currentUser, attendance, sales, embedded = false }) => {
    const { systemConfig } = useCRM();
    const { shiftDuration } = usePerformance();
    const [viewDate, setViewDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('Month');
    const [expandedDay, setExpandedDay] = useState<string | null>(null);
    const [showProfile, setShowProfile] = useState(false);

    const monthName = viewDate.toLocaleString('default', { month: 'long' });
    const year = viewDate.getFullYear();
    const todayKey = new Date().toLocaleDateString();

    const dateRange = useMemo(() => {
        const y = viewDate.getFullYear();
        const m = viewDate.getMonth();
        const lastDay = new Date(y, m + 1, 0).getDate();
        const cutoff = systemConfig.cutoffDay1 || 15;

        let startDay = 1;
        let endDay = lastDay;

        if (viewMode === 'Cycle 1') {
            endDay = cutoff;
        } else if (viewMode === 'Cycle 2') {
            startDay = cutoff + 1;
        }

        const dates: Date[] = [];
        for (let d = startDay; d <= endDay; d++) {
            if (d <= lastDay) {
                dates.push(new Date(y, m, d));
            }
        }
        return dates.reverse(); 
    }, [viewDate, viewMode, systemConfig]);

    const dailyData = useMemo(() => {
        return dateRange.map(date => {
            const dateKey = date.toLocaleDateString();
            const timestampStart = date.setHours(0,0,0,0);
            const timestampEnd = date.setHours(23,59,59,999);
            const isToday = dateKey === todayKey;

            // Pass active session seconds ONLY if it's today
            const hours = getDailyHours(currentUser.id, timestampStart, attendance, isToday ? shiftDuration : 0);

            // Get Clock In/Out sessions for timeline visualization
            const daySessions = attendance.filter(a => 
                a.agentId === currentUser.id && 
                a.timestamp >= timestampStart && 
                a.timestamp <= timestampEnd
            ).sort((a,b) => a.timestamp - b.timestamp);

            const daysSales = sales.filter(s => 
                s.agentId === currentUser.id && 
                s.timestamp >= timestampStart && 
                s.timestamp <= timestampEnd
            );

            const approvedSales = daysSales.filter(s => s.status === 'Approved');
            const declinedSales = daysSales.filter(s => s.status === 'Declined');

            let dailyRevenue = 0;
            let dailyEarnings = 0;
            let dailySpiffs = 0;

            approvedSales.forEach(sale => {
                const payout = calculateSalePayout(sale, hours, systemConfig, currentUser.commissionRate);
                dailyRevenue += Number(sale.amount);
                dailyEarnings += payout.net;
                dailySpiffs += payout.spiff;
            });

            const totalDeclined = declinedSales.reduce((acc, s) => acc + Number(s.amount), 0);
            
            // Efficiency: Revenue per Hour
            const efficiency = hours > 0 ? dailyRevenue / hours : 0;

            return {
                date,
                dateKey,
                hours,
                daySessions,
                approvedSales,
                declinedSales,
                revenue: dailyRevenue,
                declinedRevenue: totalDeclined,
                earnings: dailyEarnings,
                spiffs: dailySpiffs,
                efficiency,
                hasActivity: hours > 0 || daysSales.length > 0
            };
        });
    }, [dateRange, sales, attendance, currentUser, systemConfig, shiftDuration, todayKey]);

    const totals = useMemo(() => {
        return dailyData.reduce((acc, curr) => ({
            hours: acc.hours + curr.hours,
            revenue: acc.revenue + curr.revenue,
            earnings: acc.earnings + curr.earnings,
            spiffs: acc.spiffs + curr.spiffs,
            declined: acc.declined + curr.declinedRevenue,
            approvedCount: acc.approvedCount + curr.approvedSales.length,
            declinedCount: acc.declinedCount + curr.declinedSales.length
        }), { hours: 0, revenue: 0, earnings: 0, spiffs: 0, declined: 0, approvedCount: 0, declinedCount: 0 });
    }, [dailyData]);

    const toggleDay = (dateKey: string) => {
        sfx.playClick();
        setExpandedDay(prev => prev === dateKey ? null : dateKey);
    };

    const handleMonthChange = (direction: -1 | 1) => {
        sfx.playClick();
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + direction);
        setViewDate(newDate);
        setExpandedDay(null);
    };

    const content = (
        <div className="space-y-6 h-full flex flex-col">
            
            {/* 1. CONTROLS */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-alt/50 p-2 rounded-xl border border-border-subtle shrink-0">
                <div className="flex items-center gap-1 w-full sm:w-auto justify-between sm:justify-start">
                    <button onClick={() => { setShowProfile(!showProfile); sfx.playClick(); }} className={`p-2 rounded-xl transition-colors ${showProfile ? 'bg-accent-secondary/20 text-accent-secondary border border-accent-secondary/30' : 'text-text-muted hover:text-text-primary hover:bg-surface-main'} `} title="View Configured HR Details">
                        <UserIcon size={18} />
                    </button>
                    <div className="w-px h-6 bg-border-subtle mx-2 hidden sm:block"></div>
                    <button onClick={() => handleMonthChange(-1)} className="p-2 hover:bg-surface-main rounded-xl text-text-muted hover:text-text-primary transition-colors">←</button>
                    <div className="px-4 text-center min-w-[140px]">
                        <span className="text-sm font-[700]  tracking-widest text-text-primary block">{monthName}</span>
                        <span className="text-xs font-mono text-text-muted">{year}</span>
                    </div>
                    <button onClick={() => handleMonthChange(1)} className="p-2 hover:bg-surface-main rounded-xl text-text-muted hover:text-text-primary transition-colors">→</button>
                </div>

                <div className="flex bg-surface-main p-1 rounded-xl border border-border-subtle shadow-sm w-full sm:w-auto">
                    {(['Month', 'Cycle 1', 'Cycle 2'] as ViewMode[]).map(mode => (
                        <button
                            key={mode}
                            onClick={() => { setViewMode(mode); sfx.playClick(); }}
                            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-[700]  tracking-wider transition-all ${
                                viewMode === mode 
                                ? 'bg-accent-primary text-white shadow-md' 
                                : 'text-text-muted hover:text-text-primary hover:bg-surface-alt'
                            }`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </div>

            {/* HR DETAILS (COLLAPSIBLE) */}
            {showProfile && (
                <div className="bg-surface-alt/40 border border-border-subtle rounded-xl p-4 animate-in slide-in-from-top-4 shrink-0 flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-3">
                        <h4 className="text-xs font-[700] text-text-muted tracking-widest uppercase flex items-center gap-2">
                            <UserIcon size={14} className="text-accent-secondary" /> Contact Details
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-[10px] text-text-muted uppercase tracking-widest block font-[700]">Email</span>
                                <span className="text-text-primary font-mono">{currentUser.email || '—'}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-text-muted uppercase tracking-widest block font-[700]">Phone</span>
                                <span className="text-text-primary font-mono">{currentUser.phone || '—'}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-[10px] text-text-muted uppercase tracking-widest block font-[700]">Address</span>
                                <span className="text-text-primary">{currentUser.address || '—'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-px bg-border-subtle hidden md:block"></div>
                    <div className="flex-1 space-y-3">
                        <h4 className="text-xs font-[700] text-text-muted tracking-widest uppercase flex items-center gap-2">
                            <Wallet size={14} className="text-status-success" /> Payout Configuration
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-[10px] text-text-muted uppercase tracking-widest block font-[700]">Bank Name</span>
                                <span className="text-text-primary font-bold">{currentUser.bankName || '—'}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-text-muted uppercase tracking-widest block font-[700]">Commission Rate</span>
                                <span className="text-status-success font-bold font-mono">{currentUser.commissionRate || 15}%</span>
                            </div>
                            <div className="col-span-2 pt-2 grid grid-cols-2 gap-3">
                                <div>
                                    <span className="text-[10px] text-text-muted uppercase tracking-widest block font-[700]">Account No.</span>
                                    <span className="text-text-primary font-mono">{currentUser.bankAccount ? '*'.repeat(Math.max(0, currentUser.bankAccount.length - 4)) + currentUser.bankAccount.slice(-4) : '—'}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-text-muted uppercase tracking-widest block font-[700]">Mobile Wallet</span>
                                    <span className="text-text-primary font-mono">{currentUser.gcash || '—'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. AGGREGATE CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
                <Card className="p-4 bg-surface-main border border-border-subtle rounded-xl shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 text-blue-500"><Clock size={40}/></div>
                    <p className="text-xs font-[700] text-text-muted  tracking-widest relative z-10">Logged Time</p>
                    <p className="text-lg font-[700] text-text-primary mt-1 num-font relative z-10">{formatDuration(totals.hours)}</p>
                </Card>
                <Card className="p-4 bg-surface-main border border-border-subtle rounded-xl shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 text-status-success"><DollarSign size={40}/></div>
                    <p className="text-xs font-[700] text-text-muted  tracking-widest relative z-10">Gross Revenue</p>
                    <p className="text-lg font-[700] text-text-primary mt-1 num-font relative z-10">${totals.revenue.toLocaleString()}</p>
                    <div className="mt-1 text-xs font-bold text-status-success">{totals.approvedCount} Wins</div>
                </Card>
                <Card className="p-4 bg-surface-main border border-border-subtle rounded-xl shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 text-status-error"><AlertCircle size={40}/></div>
                    <p className="text-xs font-[700] text-text-muted  tracking-widest relative z-10">Lost Opportunity</p>
                    <p className="text-lg font-[700] text-text-secondary mt-1 num-font relative z-10 group-hover:text-status-error transition-colors">${totals.declined.toLocaleString()}</p>
                    <div className="mt-1 text-xs font-bold text-status-error">{totals.declinedCount} Declines</div>
                </Card>
                <Card className="p-4 bg-emerald-50 border border-status-success/30 rounded-xl shadow-sm dark:bg-emerald-950/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10 text-emerald-300"><Wallet size={40}/></div>
                    <p className="text-xs font-[700] text-emerald-600  tracking-widest relative z-10">Net Payout</p>
                    <p className="text-lg font-[700] text-emerald-600 mt-1 num-font relative z-10">${totals.earnings.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                </Card>
            </div>

            {/* 3. DAILY BREAKDOWN LIST */}
            <div className="bg-surface-main border border-border-subtle rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col min-h-0">
                <div className="px-4 py-3 border-b border-border-subtle bg-surface-alt/40 flex justify-between items-center text-xs font-[700]  text-text-muted tracking-widest sticky top-0 z-10 shrink-0">
                    <span className="w-24">Date</span>
                    <span className="w-20 text-center">Hours</span>
                    <span className="w-24 text-right">Commission</span>
                    <span className="w-24 text-right">Revenue</span>
                    <span className="w-8"></span>
                </div>
                
                <div className="overflow-y-auto custom-scrollbar flex-1 pb-4">
                    {dailyData.filter(d => d.hasActivity).map((day) => (
                        <div key={day.dateKey} className="border-b border-border-subtle/50 group shrink-0">
                            {/* Day Summary Row */}
                            <div onClick={() => toggleDay(day.dateKey)} className="px-4 py-4 flex justify-between items-center cursor-pointer hover:bg-surface-alt/20 transition-colors">
                                <div className="w-24">
                                    <span className="text-xs font-bold text-text-primary block flex items-center gap-2">
                                        {day.date.toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                                        {day.dateKey === todayKey && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                                    </span>
                                    <span className="text-xs text-text-muted font-mono">{day.date.toLocaleDateString(undefined, {weekday:'short'})}</span>
                                </div>
                                <div className="w-20 text-center">
                                    <span className={`px-3 py-1.5 rounded text-xs font-mono font-bold border ${day.hours > 0 ? 'bg-surface-alt border-border-subtle text-text-primary' : 'bg-transparent border-transparent text-text-muted opacity-50'}`}>
                                        {formatDuration(day.hours)}
                                    </span>
                                </div>
                                <div className="w-24 text-right">
                                    <span className="text-xs font-bold text-status-success num-font">
                                        ${day.earnings.toFixed(2)}
                                    </span>
                                    {day.spiffs > 0 && <span className="block text-[10px] font-bold text-status-success mt-0.5">+${day.spiffs} Spiff</span>}
                                </div>
                                <div className="w-24 text-right">
                                    <span className="text-xs font-[700] text-text-primary num-font">${day.revenue.toLocaleString()}</span>
                                    {day.declinedRevenue > 0 && <span className="block text-[10px] font-bold text-status-error leading-tight mt-0.5">-${day.declinedRevenue.toLocaleString()} Ref</span>}
                                </div>
                                <div className="w-8 flex justify-end">
                                    <ChevronRight size={16} className={`text-text-muted transition-transform ${expandedDay === day.dateKey ? 'rotate-90' : ''}`}/>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedDay === day.dateKey && (
                                <div className="bg-surface-alt/30 p-4 border-t border-border-subtle/50 animate-in slide-in-from-top-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    
                                    {/* Left: Session Timeline */}
                                    <div className="space-y-3">
                                        <h5 className="text-xs font-[700]  text-text-muted tracking-widest flex items-center gap-2">
                                            <Activity size={16} /> Session Log
                                        </h5>
                                        <div className="space-y-2">
                                            {day.daySessions.length > 0 ? day.daySessions.map((session, i) => (
                                                <div key={i} className="flex items-center justify-between text-xs bg-surface-main p-2 rounded-lg border border-border-subtle">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${session.type === 'CLOCK_IN' ? 'bg-emerald-500' : session.type === 'CLOCK_OUT' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                                                        <span className="font-bold text-text-secondary">{session.type.replace('_', ' ')}</span>
                                                    </div>
                                                    <span className="font-mono text-text-muted">{new Date(session.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                                </div>
                                            )) : <span className="text-xs text-text-muted italic">No specific logs found.</span>}
                                        </div>
                                    </div>

                                    {/* Right: Sales Manifest */}
                                    <div className="space-y-3">
                                        <h5 className="text-xs font-[700]  text-text-muted tracking-widest flex items-center gap-2">
                                            <DollarSign size={16} /> Production Manifest
                                        </h5>
                                        <div className="space-y-1.5">
                                            {day.approvedSales.map(s => (
                                                <div key={s.id} className="flex justify-between items-center p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle size={16} className="text-status-success"/>
                                                        <span className="text-xs font-bold text-text-primary">{s.customer}</span>
                                                    </div>
                                                    <span className="text-xs font-mono font-bold text-emerald-600">${Number(s.amount).toLocaleString()}</span>
                                                </div>
                                            ))}
                                            {day.declinedSales.map(s => (
                                                <div key={s.id} className="flex justify-between items-center p-2 bg-red-500/5 border border-red-500/10 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <AlertCircle size={16} className="text-status-error"/>
                                                        <span className="text-xs font-bold text-text-secondary">{s.customer}</span>
                                                    </div>
                                                    <span className="text-xs font-mono font-bold text-status-error line-through">${Number(s.amount).toLocaleString()}</span>
                                                </div>
                                            ))}
                                            {day.approvedSales.length === 0 && day.declinedSales.length === 0 && (
                                                <span className="text-xs text-text-muted italic">No transactions recorded.</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    if (embedded) {
        if (!isOpen) return null;
        return <div className="h-full w-full">{content}</div>;
    }

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={`${currentUser.name}'s Daily Ops Log`}
            size="xl" 
            footer={
                <div className="w-full flex justify-between items-center">
                    <div className="text-xs font-mono text-text-muted flex items-center gap-1 opacity-60">
                        <ShieldCheck size={16} />
                        VERIFIED_LEDGER_UPLINK
                    </div>
                    <Button onClick={onClose} variant="secondary">Close Interface</Button>
                </div>
            }
        >
            {content}
        </Modal>
    );
};
