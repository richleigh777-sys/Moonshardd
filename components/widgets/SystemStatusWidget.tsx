import React, { useMemo } from 'react';
import { Activity, Server, ShieldCheck, Zap } from 'lucide-react';
import { Card } from '../ui/Base';
import { useSystem } from '../../hooks/useSystem';
import { motion } from 'motion/react';

export const SystemStatusWidget: React.FC = () => {
    const { activeServer, systemLoad } = useSystem();

    const statusColor = useMemo(() => {
        if (systemLoad > 80) return 'text-rose-500';
        if (systemLoad > 50) return 'text-amber-500';
        return 'text-emerald-500';
    }, [systemLoad]);

    const statusBg = useMemo(() => {
        if (systemLoad > 80) return 'bg-rose-500/10 border-rose-500/20';
        if (systemLoad > 50) return 'bg-amber-500/10 border-amber-500/20';
        return 'bg-emerald-500/10 border-emerald-500/20';
    }, [systemLoad]);

    return (
        <Card className="p-4 bg-surface-main/40 backdrop-blur-md border-border-subtle/40 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-accent-primary/5 rounded-full blur-2xl group-hover:bg-accent-primary/10 transition-all duration-700" />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent-primary/10 rounded-xl text-accent-primary border border-accent-primary/10 shadow-neon">
                        <Activity size={14} strokeWidth={3} />
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black uppercase text-text-primary tracking-[0.15em]">Node Telemetry</h3>
                        <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">Real-time Uplink</p>
                    </div>
                </div>
                <div className={`px-2 py-1 rounded-lg ${statusBg} ${statusColor} text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 animate-pulse`}>
                    <Zap size={10} /> Optimal
                </div>
            </div>

            <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between p-2 bg-surface-highlight/30 rounded-xl border border-border-subtle/50">
                    <div className="flex items-center gap-2">
                        <Server size={12} className="text-text-muted" />
                        <span className="text-[9px] font-black uppercase text-text-secondary tracking-widest">Active Node</span>
                    </div>
                    <span className="text-[10px] font-bold text-text-primary uppercase">{activeServer?.name || 'Nexus Prime'}</span>
                </div>

                <div className="flex items-center justify-between p-2 bg-surface-highlight/30 rounded-xl border border-border-subtle/50">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={12} className="text-text-muted" />
                        <span className="text-[9px] font-black uppercase text-text-secondary tracking-widest">Security Protocol</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-tighter">AES-256-GCM</span>
                </div>

                <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-end">
                        <span className="text-[8px] font-black uppercase text-text-muted tracking-widest">System Load</span>
                        <span className={`text-[10px] font-black num-font ${statusColor}`}>{systemLoad}%</span>
                    </div>
                    <div className="h-1 w-full bg-surface-highlight rounded-full overflow-hidden border border-border-subtle/30">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${systemLoad}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full rounded-full ${systemLoad > 80 ? 'bg-rose-500' : systemLoad > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border-subtle/30 flex items-center justify-between opacity-50 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[7px] font-black uppercase tracking-[0.2em] text-text-muted">Encrypted Stream Active</span>
                </div>
                <span className="text-[7px] font-mono text-text-muted">v2.4.0-STABLE</span>
            </div>
        </Card>
    );
};
