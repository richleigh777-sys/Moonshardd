import React, { useMemo } from 'react';
import { Activity, Server, ShieldCheck, Zap } from 'lucide-react';
import { Card } from '../ui/Base';
import { useSystem } from '../../hooks/useSystem';
import { motion } from 'motion/react';

export const SystemStatusWidget: React.FC = () => {
    const { activeServer, systemLoad } = useSystem();

    const statusColor = useMemo(() => {
        if (systemLoad > 80) return 'text-rose-500';
        if (systemLoad > 50) return 'text-status-warning';
        return 'text-status-success';
    }, [systemLoad]);

    const statusBg = useMemo(() => {
        if (systemLoad > 80) return 'bg-rose-500/10 border-rose-500/20';
        if (systemLoad > 50) return 'bg-amber-500/10 border-amber-500/20';
        return 'bg-emerald-500/10 border-emerald-500/20';
    }, [systemLoad]);

    return (
        <Card className="p-4 bg-surface-widget backdrop-blur-md border-border-subtle/40 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-700" />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-xl text-status-success border border-emerald-500/20">
                        <Activity size={16} strokeWidth={2} />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-text-primary">System Status</h3>
                        <p className="text-xs text-text-muted">Live metrics</p>
                    </div>
                </div>
                <div className={`px-2 py-1 rounded-md ${statusBg} ${statusColor} text-xs font-semibold flex items-center gap-1.5`}>
                    <Zap size={14} /> Stable
                </div>
            </div>

            <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between p-2 bg-surface-main rounded-lg border border-border-subtle">
                    <div className="flex items-center gap-2">
                        <Server size={14} className="text-text-muted" />
                        <span className="text-xs font-medium text-text-secondary">Active Server</span>
                    </div>
                    <span className="text-xs font-semibold text-text-primary pr-2">{activeServer?.name || 'Local'}</span>
                </div>

                <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-end">
                        <span className="text-xs font-medium text-text-muted">Resource Usage</span>
                        <span className={`text-xs font-semibold num-font ${statusColor}`}>{systemLoad}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-highlight rounded-full overflow-hidden border border-border-subtle">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${systemLoad}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full rounded-full ${systemLoad > 80 ? 'bg-rose-500' : systemLoad > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between opacity-80">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-text-muted">Connected</span>
                </div>
                <span className="text-[10px] text-text-muted font-mono">v2.4.0</span>
            </div>
        </Card>
    );
};
