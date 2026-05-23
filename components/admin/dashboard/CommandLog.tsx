
import React, { useRef, useEffect } from 'react';

export interface LogEntry {
    id: string;
    time: string;
    msg: string;
    urgency: string; // 'Routine' | 'Immediate' | 'Flash'
}

interface CommandLogProps {
    logs: LogEntry[];
    className?: string;
}

export const CommandLog: React.FC<CommandLogProps> = ({ logs, className = "" }) => {
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const getUrgencyColor = (u: string) => {
        switch(u) {
            case 'Flash': return 'text-status-error';
            case 'Immediate': return 'text-status-warning';
            default: return 'text-status-success';
        }
    };

    return (
        <div className={`bg-surface-alt rounded-xl border border-border-subtle p-3 overflow-y-auto custom-scrollbar font-mono text-xs shadow-inner ${className}`}>
            {logs.length === 0 && (
                <div className="h-full flex items-center justify-center text-slate-600 italic opacity-50">
                    System Ready... Awaiting Input
                </div>
            )}
            <div className="flex flex-col gap-1">
                {logs.map((entry) => (
                    <div key={entry.id} className="flex gap-2 animate-in slide-in-from-left-2 duration-300">
                        <span className="text-slate-500 opacity-50 select-none">[{entry.time}]</span>
                        <span className={`font-bold ${getUrgencyColor(entry.urgency)}  tracking-wider min-w-[70px]`}>
                            {entry.urgency}:
                        </span>
                        <span className="text-slate-300 break-words flex-1">{entry.msg}</span>
                    </div>
                ))}
            </div>
            <div ref={endRef} />
        </div>
    );
};
