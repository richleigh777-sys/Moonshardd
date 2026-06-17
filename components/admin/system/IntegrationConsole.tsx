
import React, { useEffect, useRef } from 'react';
import { Activity, CheckCircle, XCircle, FileText } from 'lucide-react';

interface IntegrationConsoleProps {
    logs: string[];
}

export const IntegrationConsole: React.FC<IntegrationConsoleProps> = ({ logs }) => {
    const bottomRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => { 
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); 
    }, [logs]);

    const getLogStyle = (log: string) => {
        if (log.includes('[OK]') || log.includes('SUCCESS') || log.includes('ESTABLISHED')) return 'text-emerald-600 dark:text-emerald-400';
        if (log.includes('WARN') || log.includes('LATENCY')) return 'text-amber-600 dark:text-amber-400';
        if (log.includes('FAIL') || log.includes('ERROR')) return 'text-rose-600 dark:text-rose-400';
        return 'text-text-primary';
    };

    const getIcon = (log: string) => {
        if (log.includes('[OK]')) return <CheckCircle size={14} />;
        if (log.includes('FAIL')) return <XCircle size={14} />;
        return <Activity size={14} />;
    };

    return (
        <div className="bg-surface-main text-text-primary rounded-xl border border-border-subtle overflow-hidden shadow-sm relative flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 bg-surface-alt border-b border-border-subtle flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <FileText size={16} className="text-text-muted" />
                    <span className="text-sm font-semibold">Event Log</span>
                </div>
            </div>

            {/* Event List */}
            <div className="p-4 text-sm h-56 overflow-y-auto custom-scrollbar">
                {logs.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-text-muted text-sm space-y-2">
                        <Activity size={24} className="opacity-50" />
                        <span>Waiting for events...</span>
                    </div>
                )}
                <div className="space-y-2">
                    {logs.map((l, i) => (
                        <div key={i} className={`flex items-start gap-2 ${getLogStyle(l)}`}>
                            <span className="opacity-70 mt-0.5 shrink-0">{getIcon(l)}</span>
                            <span className="opacity-50 shrink-0 text-text-muted">[{new Date().toLocaleTimeString([], {hour12:false, hour:'2-digit', minute:'2-digit', second:'2-digit'})}]</span>
                            <span className="break-all">{l}</span>
                        </div>
                    ))}
                </div>
                <div ref={bottomRef} />
            </div>
        </div>
    );
};
