
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
        if (log.includes('[OK]') || log.includes('SUCCESS') || log.includes('ESTABLISHED')) return 'text-emerald-400';
        if (log.includes('WARN') || log.includes('LATENCY')) return 'text-amber-400';
        if (log.includes('FAIL') || log.includes('ERROR')) return 'text-red-400';
        return 'text-blue-300'; // Default data stream color
    };

    const getIcon = (log: string) => {
        if (log.includes('[OK]')) return <CheckCircle size={10} />;
        if (log.includes('FAIL')) return <XCircle size={10} />;
        return <Activity size={10} />;
    };

    return (
        <div className="bg-[#09090b] text-white rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative group animate-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Terminal size={12} className="text-text-muted"/>
                    <span className="text-[9px] font-black uppercase text-text-muted tracking-widest">System Uplink</span>
                </div>
                <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500/20"></div>
                    <div className="w-2 h-2 rounded-full bg-amber-500/20"></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500/50 animate-pulse"></div>
                </div>
            </div>

            {/* Terminal Body */}
            <div className="p-4 font-mono text-[10px] h-48 overflow-y-auto custom-scrollbar relative">
                {logs.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-text-muted opacity-30 select-none">
                        <Activity size={24} className="mb-2 animate-pulse"/>
                        <span>AWAITING SIGNAL...</span>
                    </div>
                )}
                <div className="space-y-1">
                    {logs.map((l, i) => (
                        <div key={i} className={`flex items-start gap-2 animate-in slide-in-from-left-2 duration-300 ${getLogStyle(l)}`}>
                            <span className="opacity-50 select-none mt-0.5">{getIcon(l)}</span>
                            <span className="opacity-50 mr-1 select-none">[{new Date().toLocaleTimeString([], {hour12:false, hour:'2-digit', minute:'2-digit', second:'2-digit'})}]</span>
                            <span className="break-all">{l}</span>
                        </div>
                    ))}
                </div>
                <div ref={bottomRef} />
                
                {/* Typing Cursor */}
                <div className="mt-2 flex items-center gap-2 text-accent-primary animate-pulse">
                    <span className="font-bold">{'>'}</span>
                    <span className="w-2 h-4 bg-accent-primary block"></span>
                </div>
            </div>
        </div>
    );
};
