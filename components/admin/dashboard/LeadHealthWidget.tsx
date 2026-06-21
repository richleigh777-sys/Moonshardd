
import React, { useMemo } from 'react';
import { ShieldCheck, AlertTriangle, Activity, Database } from 'lucide-react';
import { Card } from '../../ui/Base';
import { Note } from '../../../types';

interface LeadHealthWidgetProps {
    notes: Note[];
    now: number;
}

export const LeadHealthWidget: React.FC<LeadHealthWidgetProps> = ({ notes, now }) => {
    const stats = useMemo(() => {
        if (notes.length === 0) return { health: 100, stale: 0, reminderRate: 0, missingFields: 0 };
        
        const staleThreshold = 24 * 60 * 60 * 1000;
        
        const staleLeads = notes.filter(n => n.status !== 'Resolved' && (now - n.timestamp) > staleThreshold).length;
        const leadsWithReminders = notes.filter(n => !!n.reminderAt).length;
        const missingFields = notes.filter(n => !n.phone || !n.customerName || !n.reason).length;
        
        // Calculate health score (0-100)
        // Deduct points for stale leads and missing fields
        let health = 100;
        health -= (staleLeads / notes.length) * 40;
        health -= (missingFields / notes.length) * 40;
        health += (leadsWithReminders / notes.length) * 20;
        
        return {
            health: Math.max(0, Math.min(100, Math.round(health))),
            stale: Math.round((staleLeads / notes.length) * 100),
            reminderRate: Math.round((leadsWithReminders / notes.length) * 100),
            missingFields: Math.round((missingFields / notes.length) * 100)
        };
    }, [notes, now]);

    return (
        <Card variant="panel" className="h-[300px] w-full lg:w-[300px] p-4 md:p-4 bg-surface-main/30 backdrop-blur-3xl relative overflow-hidden group border border-border-strong rounded-xl md:rounded-xl hover:border-accent-primary/20 transition-all shadow-panel">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-0"></div>
            <div className="absolute -top-10 -right-10 p-4 opacity-[0.03] group-hover:opacity-5 group-hover:scale-110 transition-all z-0 blur-[2px]">
                <Database size={140} />
            </div>
            
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl border flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform ${stats.health > 80 ? 'bg-emerald-500/10 text-status-success border-emerald-500/20' : 'bg-amber-500/10 text-status-warning border-amber-500/20'}`}>
                        <ShieldCheck size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium  text-text-primary tracking-wide leading-none drop-shadow-sm">CRM Hygiene</h3>
                        <p className="text-sm font-medium text-text-muted  mt-1 tracking-wide">Data Structure Integrity</p>
                    </div>
                </div>
                <div className="text-right bg-surface-alt/80  px-3 py-1.5 rounded-xl border border-border-strong shadow-inner ring-1 ring-white/5">
                    <span className={`text-lg md:text-xl font-medium font-display tracking-tighter drop-shadow-sm ${stats.health > 80 ? 'text-status-success shadow-emerald-500/20' : 'text-status-warning shadow-amber-500/20'}`}>
                        {stats.health}%
                    </span>
                    <p className="text-sm font-medium text-text-muted  tracking-wide mt-0.5">System Health</p>
                </div>
            </div>

            <div className="space-y-5 relative z-10">
                <MetricRow 
                    label="Automated Follow-ups" 
                    value={`${stats.reminderRate}%`} 
                    sub="Coverage"
                    icon={Activity}
                    color="text-blue-500"
                    glow="shadow-sm"
                    progress={stats.reminderRate}
                    labelStyle={{ height: '15px' }}
                />
                <MetricRow 
                    label="Stale Objectives" 
                    value={`${stats.stale}%`} 
                    sub="> 24h Idle"
                    icon={AlertTriangle}
                    color="text-status-warning"
                    glow="shadow-sm"
                    progress={stats.stale}
                    inverse
                    labelStyle={{ fontSize: '12px' }}
                />
                <MetricRow 
                    label="Fragmented Data" 
                    value={`${stats.missingFields}%`} 
                    sub="Missing Profile Keys"
                    icon={Database}
                    color="text-accent-secondary"
                    glow="shadow-sm"
                    progress={stats.missingFields}
                    inverse
                    containerStyle={{ height: '125px' }}
                />
            </div>

            <div className="mt-8 pt-4 border-t border-border-strong relative z-10">
                <div className="flex items-start gap-3 bg-surface-main/60  p-4 rounded-xl border border-border-strong italic shadow-inner group-hover:border-accent-primary/30 transition-colors">
                    <Activity size={18} className="text-accent-primary animate-pulse shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-text-primary  tracking-wide leading-relaxed opacity-90 font-mono">
                        {stats.health > 85 
                            ? "Organizational protocols are stable. Lead leaks minimized." 
                            : "Quiet leaks detected in follow-up loops. Enforce directive: No lead left idle."}
                    </p>
                </div>
            </div>
        </Card>
    );
};

const MetricRow = ({ label, value, icon: Icon, color, glow, progress, inverse = false, labelStyle, containerStyle }: any) => (
    <div style={containerStyle} className="space-y-2 p-3 bg-surface-main/40 border border-border-strong rounded-xl group-hover:bg-surface-main/60 transition-colors shadow-inner">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg bg-surface-main border border-border-strong shadow-inner ${color}`}>
                    <Icon size={14} className={glow} strokeWidth={2.5}/>
                </div>
                <div>
                    <p style={labelStyle} className="text-sm font-medium text-text-primary  tracking-wide leading-none drop-shadow-sm">{label}</p>
                </div>
            </div>
            <div className={`bg-surface-main px-2 py-1 rounded-[4px] border border-border-strong shadow-inner ring-1 ring-white/5`}>
                <span className={`text-sm font-medium font-display tracking-wide ${color}`}>{value}</span>
            </div>
        </div>
        <div className="h-1.5 bg-surface-alt/80 rounded-full overflow-hidden border border-border-strong shadow-inner">
            <div 
                className={`h-full transition-all duration-1000 ${
                    inverse 
                    ? (progress > 50 ? 'bg-status-error shadow-sm' : progress > 20 ? 'bg-amber-500 shadow-sm' : 'bg-emerald-500 shadow-sm')
                    : (progress > 80 ? 'bg-emerald-500 shadow-sm' : progress > 40 ? 'bg-blue-500 shadow-sm' : 'bg-amber-500 shadow-sm')
                }`}
                style={{ width: `${progress}%` }}
            />
        </div>
    </div>
);
