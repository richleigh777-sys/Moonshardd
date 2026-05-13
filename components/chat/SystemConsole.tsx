
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal } from 'lucide-react';

interface ConsoleLog {
    id: string;
    text: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: number;
}

export const SystemConsole: React.FC<{ events: any[] }> = ({ events }) => {
    const [logs, setLogs] = useState<ConsoleLog[]>([]);

    useEffect(() => {
        if (events.length > 0) {
            const lastEvent = events[events.length - 1];
            const newLog: ConsoleLog = {
                id: Math.random().toString(36).substr(2, 9),
                text: lastEvent.text,
                type: lastEvent.type || 'info',
                timestamp: Date.now()
            };
            setTimeout(() => {
                setLogs(prev => [...prev.slice(-4), newLog]);
            }, 0);
        }
    }, [events]);

    return (
        <div className="absolute top-24 left-10 z-20 pointer-events-none hidden lg:block">
            <div className="flex flex-col gap-1.5">
                <AnimatePresence mode="popLayout">
                    {logs.map((log) => (
                        <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/5 px-2.5 py-1 rounded-md"
                        >
                            <Terminal size={10} className={
                                log.type === 'success' ? 'text-emerald-500' :
                                log.type === 'error' ? 'text-red-500' :
                                log.type === 'warning' ? 'text-amber-500' : 'text-indigo-400'
                            } />
                            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                                {log.text}
                            </span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};
