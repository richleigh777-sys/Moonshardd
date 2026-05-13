
import { useMemo, useState } from 'react';
import { 
    Clock, DollarSign, 
    Wallet, ChevronRight, 
    Activity, AlertCircle, CheckCircle
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
}

type ViewMode = 'Month' | 'Cycle 1' | 'Cycle 2';

export const AgentTimeSheet: React.FC<Props> = ({ isOpen, onClose, currentUser, attendance, sales }) => {
    const { systemConfig } = useCRM();
    const { shiftDuration } = usePerformance();
    const [viewDate, setViewDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('Month');
    const [expandedDay, setExpandedDay] = useState<string | null>(null);

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

    const getEfficiencyColor = (e: number) => {
        if (e > 500) return 'text-emerald-500';
        if (e > 250) return 'text-emerald-400';
        if (e > 100) return 'text-amber-500';
        return 'text-text-muted';
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={`${currentUser.name}'s Daily Ops Log`}
            size="xl" 
            footer={
                <div className="w-full flex justify-between items-center">
                    <div className="text-[10px] font-mono text-text-muted flex items-center gap-1 opacity-60">
                        <ShieldCheck size={12} />
                        VERIFIED_LEDGER_UPLINK
                    </div>
                    <Button onClick={onClose} variant="secondary">Close Interface</Button>
                </div>
            }
        >
            <div className="space-y-6">
                
                {/* 1. CONTROLS */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-alt/50 p-2 rounded-2xl border border-border-subtle">
                    <div className="flex items-center gap-1 w-full sm:w-auto justify-between sm:justify-start">
                        <button onClick={() => handleMonthChange(-1)} className="p-2 hover:bg-surface-main rounded-xl text-text-muted hover:text-text-primary transition-colors">←</button>
                        <div className="px-4 text-center min-w-[140px]">
                            <span className="text-sm font-black uppercase tracking-widest text-text-primary block">{monthName}</span>
                            <span className="text-[10px] font-mono text-text-muted">{year}</span>
                        </div>
                        <button onClick={() => handleMonthChange(1)} className="p-2 hover:bg-surface-main rounded-xl text-text-muted hover:text-text-primary transition-colors">→</button>
                    </div>

                    <div className="flex bg-surface-main p-1 rounded-xl border border-border-subtle shadow-sm w-full sm:w-auto">
                        {(['Month', 'Cycle 1', 'Cycle 2'] as ViewMode[]).map(mode => (
                            <button
                                key={mode}
                                onClick={() => { setViewMode(mode); sfx.playClick(); }}
                                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
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

                {/* 2. AGGREGATE CARDS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card className="p-4 bg-surface-main border border-border-subtle rounded-2xl shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 text-blue-500"><Clock size={40}/></div>
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest relative z-10">Logged Time</p>
                        <p className="text-2xl font-black text-text-primary mt-1 num-font relative z-10">{formatDuration(totals.hours)}</p>
                    </Card>
                    <Card className="p-4 bg-surface-main border border-border-subtle rounded-2xl shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 text-emerald-500"><DollarSign size={40}/></div>
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest relative z-10">Gross Revenue</p>
                        <p className="text-2xl font-black text-text-primary mt-1 num-font relative z-10">${totals.revenue.toLocaleString()}</p>
                        <div className="mt-1 text-[9px] font-bold text-emerald-500">{totals.approvedCount} Wins</div>
                    </Card>
                    <Card className="p-4 bg-surface-main border border-border-subtle rounded-2xl shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 text-red-500"><AlertCircle size={40}/></div>
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest relative z-10">Lost Opportunity</p>
                        <p className="text-2xl font-black text-text-secondary mt-1 num-font relative z-10 group-hover:text-red-500 transition-colors">${totals.declined.toLocaleString()}</p>
                        <div className="mt-1 text-[9px] font-bold text-red-500">{totals.declinedCount} Declines</div>
                    </Card>
                    <Card className="p-4 bg-emerald-50 border border-emerald-500/30 rounded-2xl shadow-sm dark:bg-emerald-950/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-10 text-emerald-300"><Wallet size={40}/></div>
                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest relative z-10">Net Payout</p>
                        <p className="text-2xl font-black text-emerald-600 mt-1 num-font relative z-10">${totals.earnings.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                    </Card>
                </div>

                {/* 3. DAILY BREAKDOWN LIST */}
                <div className="bg-surface-main border border-border-subtle rounded-2xl overflow-hidden shadow-sm flex-1 flex flex-col min-h-[300px]">
                    <div className="px-6 py-3 border-b border-border-subtle bg-surface-alt/40 flex justify-between items-center text-[9px] font-black uppercase text-text-muted tracking-widest sticky top-0 z-10">
                        <span className="w-24">Date</span>
                        <span className="w-20 text-center">Hours</span>
                        <span className="w-24 text-right">Efficiency</span>
                        <span className="w-24 text-right">Yield</span>
                        <span className="w-8"></span>
                    </div>
                    
                    <div className="overflow-y-auto custom-scrollbar flex-1 max-h-[400px]">
                        {dailyData.filter(d => d.hasActivity).map((day) => (
                            <div key={day.dateKey} className="border-b border-border-subtle/50 group">
                                {/* Day Summary Row */}
                                <div onClick={() => toggleDay(day.dateKey)} className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-surface-alt/20 transition-colors">
                                    <div className="w-24">
                                        <span className="text-xs font-bold text-text-primary block flex items-center gap-2">
                                            {day.date.toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                                            {day.dateKey === todayKey && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                                        </span>
                                        <span className="text-[9px] text-text-muted font-mono">{day.date.toLocaleDateString(undefined, {weekday:'short'})}</span>
                                    </div>
                                    <div className="w-20 text-center">
                                        <span className={`px-2 py-1 rounded text-[10px] font-mono font-bold border ${day.hours > 0 ? 'bg-surface-alt border-border-subtle text-text-primary' : 'bg-transparent border-transparent text-text-muted opacity-50'}`}>
                                            {formatDuration(day.hours)}
                                        </span>
                                    </div>
                                    <div className="w-24 text-right">
                                        <span className={`text-[10px] font-bold ${getEfficiencyColor(day.efficiency)}`}>
                                            ${day.efficiency.toFixed(0)}/hr
                                        </span>
                                    </div>
                                    <div className="w-24 text-right">
                                        <span className="text-xs font-black text-emerald-500 num-font">${day.revenue.toLocaleString()}</span>
                                        {day.declinedRevenue > 0 && <span className="block text-[8px] font-bold text-red-400">-${day.declinedRevenue.toLocaleString()}</span>}
                                    </div>
                                    <div className="w-8 flex justify-end">
                                        <ChevronRight size={16} className={`text-text-muted transition-transform ${expandedDay === day.dateKey ? 'rotate-90' : ''}`}/>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedDay === day.dateKey && (
                                    <div className="bg-surface-alt/30 p-4 border-t border-border-subtle/50 animate-in slide-in-from-top-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        
                                        {/* Left: Session Timeline */}
                                        <div className="space-y-3">
                                            <h5 className="text-[9px] font-black uppercase text-text-muted tracking-widest flex items-center gap-2">
                                                <Activity size={10} /> Session Log
                                            </h5>
                                            <div className="space-y-2">
                                                {day.daySessions.length > 0 ? day.daySessions.map((session, i) => (
                                                    <div key={i} className="flex items-center justify-between text-[10px] bg-surface-main p-2 rounded-lg border border-border-subtle">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${session.type === 'CLOCK_IN' ? 'bg-emerald-500' : session.type === 'CLOCK_OUT' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                                                            <span className="font-bold text-text-secondary">{session.type.replace('_', ' ')}</span>
                                                        </div>
                                                        <span className="font-mono text-text-muted">{new Date(session.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                                    </div>
                                                )) : <span className="text-[10px] text-text-muted italic">No specific logs found.</span>}
                                            </div>
                                        </div>

                                        {/* Right: Sales Manifest */}
                                        <div className="space-y-3">
                                            <h5 className="text-[9px] font-black uppercase text-text-muted tracking-widest flex items-center gap-2">
                                                <DollarSign size={10} /> Production Manifest
                                            </h5>
                                            <div className="space-y-1.5">
                                                {day.approvedSales.map(s => (
                                                    <div key={s.id} className="flex justify-between items-center p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle size={10} className="text-emerald-500"/>
                                                            <span className="text-[10px] font-bold text-text-primary">{s.customer}</span>
                                                        </div>
                                                        <span className="text-[10px] font-mono font-bold text-emerald-600">${Number(s.amount).toLocaleString()}</span>
                                                    </div>
                                                ))}
                                                {day.declinedSales.map(s => (
                                                    <div key={s.id} className="flex justify-between items-center p-2 bg-red-500/5 border border-red-500/10 rounded-lg">
                                                        <div className="flex items-center gap-2">
                                                            <AlertCircle size={10} className="text-red-500"/>
                                                            <span className="text-[10px] font-bold text-text-secondary">{s.customer}</span>
                                                        </div>
                                                        <span className="text-[10px] font-mono font-bold text-red-400 line-through">${Number(s.amount).toLocaleString()}</span>
                                                    </div>
                                                ))}
                                                {day.approvedSales.length === 0 && day.declinedSales.length === 0 && (
                                                    <span className="text-[10px] text-text-muted italic">No transactions recorded.</span>
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
        </Modal>
    );
};
