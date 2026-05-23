
import React, { useEffect, useRef } from 'react';
import { Activity } from 'lucide-react';
import { Card } from '../ui/Base';
import { useCRM } from '../../hooks/useCRM';

export const ForensicStream = () => {
    const { auditLogs } = useCRM();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            // Smooth scroll to bottom on new log arrival
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [auditLogs]);

    const displayLogs = auditLogs.slice(0, 50).reverse(); 

    return (
        <Card variant="panel" className="flex flex-col h-full border-border-subtle p-0 relative group bg-surface-main overflow-hidden shadow-inner">
            <div className="p-3 border-b border-border-subtle bg-surface-alt/50 flex items-center justify-between shrink-0 backdrop-blur-md relative z-10">
                <div className="flex items-center gap-2">
                    <Activity size={16} className="text-accent-primary" />
                    <span className="text-text-muted  tracking-[0.15em] font-bold text-xs">Community Log</span>
                </div>
                <div className="flex gap-1.5 items-center">
                    <div className="text-sm font-bold text-status-success  tracking-widest mr-1">Live Sync</div>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_#10B981]"></div>
                </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar scroll-smooth relative z-10 font-sans text-xs">
                {displayLogs.map((log) => (
                    <div key={log.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500 group/row">
                        <span className="text-text-muted opacity-40 shrink-0 font-mono text-xs">[{new Date(log.timestamp).toLocaleTimeString([], {hour12: false, hour: '2-digit', minute:'2-digit'})}]</span>
                        <div className="flex-1 min-w-0">
                            <span className={`font-bold tracking-tight ${log.action.includes('FAIL') ? 'text-status-error' : 'text-text-primary'}`}>
                                {log.action.replace(/_/g, ' ')}: <span className="font-normal text-text-secondary break-words">{log.details}</span>
                            </span>
                            <span className="opacity-0 group-hover/row:opacity-100 transition-opacity ml-2 text-accent-primary font-bold">Partner: {log.agentName}</span>
                        </div>
                    </div>
                ))}
                {displayLogs.length === 0 && <span className="text-text-muted opacity-20 animate-pulse  tracking-widest text-xs block text-center py-10">Listening for activity...</span>}
            </div>
        </Card>
    );
};
