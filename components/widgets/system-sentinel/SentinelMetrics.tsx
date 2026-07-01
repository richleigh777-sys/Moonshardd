import React from 'react';
import { Globe, Cpu } from 'lucide-react';
import { LatencyGraph } from './Visuals';

interface SentinelMetricsProps {
    latency: number;
    trafficLoad: number;
}

export const SentinelMetrics: React.FC<SentinelMetricsProps> = ({ latency, trafficLoad }) => {
    
    const getLoadColor = (load: number) => {
        if (load > 80) return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]';
        if (load > 50) return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
        return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
    };

    return (
        <div className="grid grid-cols-2 gap-4 shrink-0">
            <div className="bg-surface-main/50 p-4 rounded-2xl border border-border-subtle flex flex-col justify-center relative overflow-hidden h-24 shadow-inner">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <Globe size={14} className="text-indigo-600 dark:text-accent-secondary drop-drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]"/>
                        <span className="text-[10px] font-[700] text-text-muted  tracking-widest drop-shadow-sm font-mono">Net Latency</span>
                    </div>
                    <p className="text-2xl font-[700] text-text-primary font-mono drop-drop-shadow-md">{latency}<span className="text-sm font-medium text-text-muted ml-1">ms</span></p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-8 opacity-10 dark:opacity-20 pointer-events-none">
                    <LatencyGraph />
                </div>
            </div>
            
            <div className="bg-surface-main/50 p-4 rounded-2xl border border-border-subtle flex flex-col justify-center h-24 shadow-inner relative overflow-hidden">
                <div className="flex items-center gap-2 mb-1 relative z-10">
                    <Cpu size={14} className="text-status-success drop-drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]"/>
                    <span className="text-[10px] font-[700] text-text-muted  tracking-widest drop-shadow-sm font-mono">Node Load</span>
                </div>
                <div className="flex items-end justify-between relative z-10">
                    <p className="text-2xl font-[700] text-text-primary font-mono drop-drop-shadow-md">{trafficLoad}<span className="text-sm font-medium text-text-muted ml-1">%</span></p>
                    <div className="flex gap-[3px] mb-2 h-5 items-end">
                        {[...Array(6)].map((_, i) => (
                            <div 
                                key={i} 
                                className={`w-1.5 rounded-t-sm transition-all duration-700 ${i < (trafficLoad / 16.6) ? getLoadColor(trafficLoad) : 'bg-[#EAE5D9] dark:bg-surface-highlight'}`}
                                style={{ height: i < (trafficLoad / 16.6) ? `${30 + (i * 14)}%` : '20%' }}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};