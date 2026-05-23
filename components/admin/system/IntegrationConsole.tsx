
import React, { useEffect, useRef } from 'react';
import { Terminal, Activity, CheckCircle, XCircle } from 'lucide-react';

interface IntegrationConsoleProps {
    logs: string[];
}

export const IntegrationConsole: React.FC<IntegrationConsoleProps> = ({ logs }) => {
    const bottomRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => { 
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); 
    }, [logs]);

    const getLogStyle = (log: string) => {
        if (log.includes('[OK]') || log.includes('SUCCESS') || log.includes('ESTABLISHED')) return 'text-status-success';
        if (log.includes('WARN') || log.includes('LATENCY')) return 'text-amber-600 dark:text-status-warning';
        if (log.includes('FAIL') || log.includes('ERROR')) return 'text-red-600 dark:text-status-error';
        return 'text-indigo-600 dark:text-indigo-300'; // Default data stream color
    };

    const getIcon = (log: string) => {
        if (log.includes('[OK]')) return <CheckCircle size={14} />;
        if (log.includes('FAIL')) return <XCircle size={14} />;
        return <Activity size={14} />;
    };

    return (
        <div className="bg-surface-main/90 text-text-primary dark:text-white rounded-[1.25rem] border border-border-subtle overflow-hidden shadow-panel relative group animate-in slide-in-from-bottom-4 duration-500 backdrop-blur-3xl">
            {/* Background Grid & Glow */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-50"></div>
            <div className="absolute -inset-px bg-gradient-to-br from-indigo-500/5 via-transparent to-accent-primary/5 dark:from-indigo-500/10 dark:to-accent-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

            {/* Header */}
            <div className="px-4 py-3 bg-surface-alt border-b border-border-subtle flex justify-between items-center relative z-10 shrink-0 backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                    <div className="px-2.5 py-1 rounded-md text-[10px] font-[700]  tracking-[0.2em] border border-accent-secondary/20 bg-indigo-50 text-indigo-600 dark:bg-accent-secondary/10 dark:text-accent-secondary flex items-center gap-1.5 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                        <Terminal size={14} /> UPLINK
                    </div>
                </div>
                <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-white/20"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-white/20"></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.2)] dark:shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
                </div>
            </div>

            {/* Terminal Body */}
            <div className="p-4 font-mono text-[11px] h-56 overflow-y-auto custom-scrollbar relative z-10 bg-transparent">
                {logs.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-text-muted opacity-70 dark:opacity-50 select-none tracking-widest ">
                        <Activity size={24} className="mb-3 animate-pulse opacity-50"/>
                        <span>AWAITING SIGNAL...</span>
                    </div>
                )}
                <div className="space-y-1.5">
                    {logs.map((l, i) => (
                        <div key={i} className={`flex items-start gap-2 animate-in slide-in-from-left-2 duration-300 ${getLogStyle(l)}`}>
                            <span className="opacity-50 select-none mt-[1px]">{getIcon(l)}</span>
                            <span className="opacity-40 mr-1 select-none text-text-muted dark:text-current">[{new Date().toLocaleTimeString([], {hour12:false, hour:'2-digit', minute:'2-digit', second:'2-digit'})}]</span>
                            <span className="break-all font-semibold drop-shadow-sm">{l}</span>
                        </div>
                    ))}
                </div>
                <div ref={bottomRef} />
                
                {/* Typing Cursor */}
                <div className="mt-3 flex items-center gap-2 text-indigo-600 dark:text-accent-secondary animate-pulse drop-shadow-md">
                    <span className="font-bold">{'>'}</span>
                    <span className="w-1.5 h-3.5 bg-indigo-600 dark:bg-indigo-400 block shadow-[0_0_8px_currentColor]"></span>
                </div>
            </div>
        </div>
    );
};
