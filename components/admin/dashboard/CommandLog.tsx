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
        <div className={`bg-surface-main rounded-2xl border border-border-subtle p-3 overflow-y-auto custom-scrollbar text-sm shadow-sm ${className}`}>
            {logs.length === 0 && (
                <div className="h-full flex items-center justify-center text-text-muted italic opacity-50">
                    No announcements yet.
                </div>
            )}
            <div className="flex flex-col gap-2">
                {logs.map((entry) => (
                    <div key={entry.id} className="flex gap-2 p-2 rounded-lg bg-surface-alt border border-border-subtle animate-in slide-in-from-left-2 duration-300">
                        <span className="text-text-muted text-xs mt-0.5">{entry.time}</span>
                        <div className="flex flex-col flex-1">
                            <span className={`font-bold text-xs ${getUrgencyColor(entry.urgency)} tracking-wide`}>
                                {entry.urgency.toUpperCase()}
                            </span>
                            <span className="text-text-primary break-words mt-0.5">{entry.msg}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div ref={endRef} />
        </div>
    );
};
