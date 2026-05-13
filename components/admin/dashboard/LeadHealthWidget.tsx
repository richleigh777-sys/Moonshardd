
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
        <Card variant="panel" className="p-4 bg-surface-main border-border-subtle relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                <Database size={80} />
            </div>
            
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${stats.health > 80 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        <ShieldCheck size={18} />
                    </div>
                    <div>
                        <h3 className="text-xs font-black uppercase text-text-primary tracking-widest leading-none">CRM Hygiene</h3>
                        <p className="text-[9px] font-bold text-text-muted uppercase mt-1">Data Organization Integrity</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className={`text-2xl font-black num-font ${stats.health > 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {stats.health}%
                    </span>
                    <p className="text-[8px] font-bold text-text-muted uppercase tracking-tighter">System Health</p>
                </div>
            </div>

            <div className="space-y-4 relative z-10">
                <MetricRow 
                    label="Automated Follow-ups" 
                    value={`${stats.reminderRate}%`} 
                    sub="Coverage"
                    icon={Activity}
                    color="text-blue-500"
                    progress={stats.reminderRate}
                />
                <MetricRow 
                    label="Stale Objectives" 
                    value={`${stats.stale}%`} 
                    sub="> 24h Idle"
                    icon={AlertTriangle}
                    color="text-amber-500"
                    progress={stats.stale}
                    inverse
                />
                <MetricRow 
                    label="Fragmented Data" 
                    value={`${stats.missingFields}%`} 
                    sub="Missing Profile Keys"
                    icon={Database}
                    color="text-indigo-500"
                    progress={stats.missingFields}
                    inverse
                />
            </div>

            <div className="mt-6 pt-4 border-t border-border-subtle/50 relative z-10">
                <div className="flex items-center gap-2 bg-surface-alt/50 p-2 rounded-xl border border-border-subtle italic">
                    <Activity size={12} className="text-accent-primary animate-pulse" />
                    <p className="text-[10px] font-medium text-text-secondary leading-tight">
                        {stats.health > 85 
                            ? "Organizational protocols are stable. Lead leaks minimized." 
                            : "Quiet leaks detected in follow-up loops. Enforce directive: No lead left idle."}
                    </p>
                </div>
            </div>
        </Card>
    );
};

const MetricRow = ({ label, value, sub, icon: Icon, color, progress, inverse = false }: any) => (
    <div className="space-y-1.5">
        <div className="flex justify-between items-end">
            <div className="flex items-center gap-2">
                <Icon size={12} className={color} />
                <div>
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none">{label}</p>
                    <p className="text-[8px] font-bold text-text-muted/60 uppercase mt-0.5">{sub}</p>
                </div>
            </div>
            <span className={`text-xs font-black num-font ${color}`}>{value}</span>
        </div>
        <div className="h-1 bg-surface-alt rounded-full overflow-hidden">
            <div 
                className={`h-full transition-all duration-1000 ${
                    inverse 
                    ? (progress > 50 ? 'bg-status-error' : progress > 20 ? 'bg-amber-500' : 'bg-emerald-500')
                    : (progress > 80 ? 'bg-emerald-500' : progress > 40 ? 'bg-blue-500' : 'bg-amber-500')
                }`}
                style={{ width: `${progress}%` }}
            />
        </div>
    </div>
);
