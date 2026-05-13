
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const BOOT_LOGS = [
    "INITIALIZING SECURE UPLINK...",
    "ESTABLISHING NEURAL HANDSHAKE...",
    "LOADING ENCRYPTION MODULES [AES-256]...",
    "SYNCING WITH BRAVEHEART CORE...",
    "BYPASSING FIREWALLS...",
    "PROTOCOL V6.0 ACTIVE.",
    "TERMINAL READY."
];

export const TerminalBoot: React.FC = () => {
    const [visibleLogs, setVisibleLogs] = useState<string[]>([]);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        let current = 0;
        const interval = setInterval(() => {
            if (current < BOOT_LOGS.length) {
                setVisibleLogs(prev => [...prev, BOOT_LOGS[current]]);
                current++;
            } else {
                clearInterval(interval);
                setTimeout(() => setIsComplete(true), 1000);
            }
        }, 150);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="font-mono text-[10px] text-emerald-500/80 space-y-1 text-left w-full max-w-xs mx-auto bg-black/40 p-4 border border-emerald-500/20 rounded-lg shadow-[0_0_30px_rgba(16,185,129,0.1)]">
            <AnimatePresence mode="popLayout">
                {visibleLogs.map((log, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-2"
                    >
                        <span className="opacity-40">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                        <span className={i === BOOT_LOGS.length - 1 ? "text-emerald-400 font-bold" : ""}>
                            {log}
                        </span>
                    </motion.div>
                ))}
            </AnimatePresence>
            {isComplete && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="w-2 h-4 bg-emerald-500 inline-block ml-1 align-middle"
                />
            )}
        </div>
    );
};
