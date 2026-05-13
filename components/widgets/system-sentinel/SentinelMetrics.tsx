import React from 'react';
import { Globe, Cpu } from 'lucide-react';
import { LatencyGraph } from './Visuals';

interface SentinelMetricsProps {
    latency: number;
    trafficLoad: number;
}

export const SentinelMetrics: React.FC<SentinelMetricsProps> = ({ latency, trafficLoad }) => {
    
    const getLoadColor = (load: number) => {
        if (load > 80) return 'bg-rose-500';
        if (load > 50) return 'bg-amber-500';
        return 'bg-indigo-500';
    };

    return (
        <div className="grid grid-cols-2 gap-4 shrink-0">
            <div className="bg-surface-alt/30 p-4 rounded-2xl border border-border-subtle flex flex-col justify-center relative overflow-hidden h-24">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <Globe size={14} className="text-indigo-500"/>
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Network Latency</span>
                    </div>
                    <p className="text-2xl font-black text-text-primary num-font">{latency}ms</p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-8 opacity-20 pointer-events-none">
                    <LatencyGraph />
                </div>
            </div>
            <div className="bg-surface-alt/30 p-4 rounded-2xl border border-border-subtle flex flex-col justify-center h-24">
                <div className="flex items-center gap-2 mb-1">
                    <Cpu size={14} className="text-purple-500"/>
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Node Load</span>
                </div>
                <div className="flex items-end justify-between">
                    <p className="text-2xl font-black text-text-primary num-font">{trafficLoad}%</p>
                    <div className="flex gap-0.5 mb-1.5 h-4 items-end">
                        {[...Array(5)].map((_, i) => (
                            <div 
                                key={i} 
                                className={`w-1 rounded-full transition-all duration-700 ${i < (trafficLoad / 20) ? getLoadColor(trafficLoad) : 'bg-surface-highlight'}`}
                                style={{ height: i < (trafficLoad / 20) ? `${40 + (i * 15)}%` : '20%' }}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};