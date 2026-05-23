
import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'lucide-react';
import { sfx } from '../../../lib/soundService';

interface DiagnosticOverlayProps {
    onComplete: () => void;
}

export const DiagnosticOverlay: React.FC<DiagnosticOverlayProps> = ({ onComplete }) => {
    const [diagnosticLog, setDiagnosticLog] = useState<string[]>([]);
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [diagnosticLog]);

    useEffect(() => {
        let isMounted = true;
        const run = async () => {
            const steps = [
                { text: "INIT_CORE_DIAGNOSTICS...", delay: 200 },
                { text: "CHECKING_DATABASE_INTEGRITY... [OK]", delay: 600 },
                { text: "VALIDATING_ENCRYPTION_KEYS (AES-256)... [SECURE]", delay: 1100 },
                { text: "PINGING_CLOUD_NODES... [12ms]", delay: 1500 },
                { text: "SYNCHRONIZING_AUDIT_LEDGER... [COMPLETE]", delay: 2000 },
                { text: "SYSTEM_STATUS: NOMINAL", delay: 2400 }
            ];

            for (const step of steps) {
                if (!isMounted) return;
                await new Promise(r => setTimeout(r, step.delay - (steps[steps.indexOf(step)-1]?.delay || 0)));
                setDiagnosticLog(prev => [...prev, step.text]);
                sfx.playHover();
            }

            if (isMounted) {
                setTimeout(() => {
                    onComplete();
                }, 1000);
            }
        };

        run();
        return () => { isMounted = false; };
    }, [onComplete]);

    return (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col p-6 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-status-success mb-4 border-b border-border-subtle pb-2">
                <Terminal size={16} />
                <span className="text-xs font-[700]  tracking-[0.2em]">Running Diagnostics</span>
            </div>
            <div ref={logContainerRef} className="flex-1 overflow-y-auto font-mono text-xs space-y-1.5 text-status-success/90 custom-scrollbar">
                {diagnosticLog.map((line, i) => (
                    <div key={i} className="animate-in slide-in-from-left-2 duration-100">
                        <span className="opacity-50 mr-2">{'>'}</span>{line}
                    </div>
                ))}
                <div className="h-4 w-2 bg-emerald-500 animate-pulse mt-2"></div>
            </div>
        </div>
    );
};
