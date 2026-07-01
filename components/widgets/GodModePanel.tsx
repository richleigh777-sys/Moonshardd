
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
    Database, Radio, Server, FileJson, 
    Zap, ShieldCheck, X, Scan, Info
} from 'lucide-react';
import { Card, Button } from '../ui/Base';
import { useCRM } from '../../hooks/useCRM';
import { sfx } from '../../lib/soundService';
import { MemoryBlock } from './god-mode/MemoryBlock';

export const GodModePanel = () => {
    const { sales, users, auditLogs, systemConfig } = useCRM();
    const [confirmReset, setConfirmReset] = useState(false);
    const [inspectTarget, setInspectTarget] = useState<'sales' | 'users' | 'audit' | 'config' | null>(null);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [uplinkLines, setUplinkLines] = useState<string[]>([]);
    const uplinkRef = useRef<HTMLDivElement>(null);

    const getIntegrity = (data: any) => {
        const str = JSON.stringify(data);
        return Math.max(20, 100 - (str.length % 30));
    };

    const memoryMap = useMemo(() => [
        { id: 'sales', label: 'Sale Journal', data: sales, size: JSON.stringify(sales).length, integrity: getIntegrity(sales), type: 'data' },
        { id: 'users', label: 'Partner Pool', data: users, size: JSON.stringify(users).length, integrity: getIntegrity(users), type: 'core' },
        { id: 'audit', label: 'Event Flow', data: auditLogs, size: JSON.stringify(auditLogs).length, integrity: getIntegrity(auditLogs), type: 'logs' },
        { id: 'config', label: 'Core Params', data: systemConfig, size: JSON.stringify(systemConfig).length, integrity: 99, type: 'core' },
    ], [sales, users, auditLogs, systemConfig]);

    const addToUplink = (text: string) => {
        setUplinkLines(prev => [...prev.slice(-40), `[${new Date().toLocaleTimeString([], {hour12:false})}] ${text}`]);
    };

    useEffect(() => {
        if (uplinkRef.current) {
            uplinkRef.current.scrollTop = uplinkRef.current.scrollHeight;
        }
    }, [uplinkLines]);

    const handleOptimize = async () => {
        if (isOptimizing) return;
        setIsOptimizing(true);
        sfx.playSubmit();
        addToUplink('STARTING SYSTEM CALIBRATION...');
        const steps = ['Refining pointers...', 'Consolidating journals...', 'Cleaning event flows...', 'Updating node cache...', 'SYSTEM HARMONIZED.'];
        for (const step of steps) {
            await new Promise(r => setTimeout(r, 600));
            addToUplink(`- ${step}`);
        }
        sfx.playSuccess();
        setIsOptimizing(false);
    };

    const handleInspect = (id: string) => {
        setInspectTarget(prev => prev === id ? null : id as any);
        sfx.playClick();
    };

    const handleResetToggle = () => {
        setConfirmReset(!confirmReset);
        sfx.playClick();
    };

    const performFactoryReset = () => {
        // if (confirm("Are you sure? This deletes ALL local data.")) {
            sfx.playDecline();
            localStorage.clear();
            window.location.reload();
        // }
    };

    const stats = useMemo(() => [
        { label: 'Safety', val: systemConfig.maintenanceMode ? 'Locked' : 'Secure', icon: ShieldCheck, color: systemConfig.maintenanceMode ? 'text-status-error' : 'text-status-success' },
        { label: 'Cloud Mem', val: `${(memoryMap.reduce((acc, m) => acc + m.size, 0) / 1024).toFixed(0)} KB`, icon: Database, color: 'text-blue-500' },
        { label: 'Connections', val: `${users.filter(u => u.active).length} Active`, icon: Server, color: 'text-purple-500' },
        { label: 'Heartbeat', val: 'Syncing', icon: Radio, color: 'text-status-warning' }
    ], [systemConfig, memoryMap, users]);

    return (
        <div className="flex flex-col h-full gap-4 animate-in fade-in duration-700 overflow-hidden relative p-1">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                {stats.map((stat, i) => (
                    <Card key={i} variant="panel" className="p-3 flex items-center justify-between bg-surface-main group border-border-subtle transition-all">
                        <div>
                            <p className="text-xs font-medium  text-text-muted tracking-wide mb-0.5">{stat.label}</p>
                            <p className={`text-xs font-bold  tracking-tight ${stat.color}`}>{stat.val}</p>
                        </div>
                        <stat.icon size={18} className={`${stat.color} opacity-60 group-hover:scale-110 transition-transform`} />
                    </Card>
                ))}
            </div>

            <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
                {/* Console */}
                <div className="w-full md:w-80 flex flex-col gap-4">
                    <Card variant="refraction" className="flex-1 p-0 overflow-hidden bg-surface-main border-border-subtle shadow-sm flex flex-col font-mono text-xs relative group border border-border-subtle">
                        <div className="p-3 border-b border-border-subtle bg-surface-alt flex items-center justify-between shrink-0 relative z-30">
                            <span className="text-text-primary font-bold ml-1 flex items-center gap-2 uppercase tracking-wide"><Info size={16}/> Operations Log</span>
                        </div>
                        
                        <div ref={uplinkRef} className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-1.5 text-text-secondary font-medium relative z-10 bg-surface-main">
                            {uplinkLines.map((line, i) => (
                                <div key={i} className="flex gap-2 animate-in slide-in-from-left-1 break-all tracking-tight leading-snug">
                                    <span className="text-accent-primary shrink-0 select-none opacity-50">{'>'}</span>
                                    <span>{line}</span>
                                </div>
                            ))}
                            {uplinkLines.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center opacity-30 text-center gap-2 text-text-muted">
                                    <span className="tracking-wide font-medium">No recent operations</span>
                                </div>
                            )}
                        </div>
                    </Card>
                    
                    <Card variant="panel" className="p-4 border-border-subtle bg-surface-main shrink-0 shadow-lg">
                        <div className="flex flex-col gap-3">
                            <Button onClick={handleOptimize} className="h-10 text-xs font-medium  tracking-wide bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"><Zap size={16} className="mr-2"/> Optimize Database</Button>
                            <Button onClick={confirmReset ? performFactoryReset : handleResetToggle} className={`h-10 text-xs font-medium  tracking-wide border transition-all ${confirmReset ? 'bg-status-error text-white' : 'bg-surface-alt text-text-muted border-border-subtle'}`}>
                                {confirmReset ? 'CONFIRM DELETION' : 'Factory Reset'}
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Visualizer */}
                <Card variant="refraction" className="flex-1 p-0 overflow-hidden bg-surface-main border-border-subtle flex flex-col relative shadow-2xl">
                    <div className="p-4 border-b border-border-subtle bg-surface-alt/30 flex justify-between items-center z-20  shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-accent-primary/10 rounded-xl text-accent-primary border border-accent-primary/20">
                                <Scan size={18} strokeWidth={2.5}/>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold  text-text-primary tracking-tight">Data Health</h3>
                                <p className="text-xs text-text-muted font-bold  mt-0.5 tracking-wide">Storage Blocks</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 relative p-4 overflow-y-auto custom-scrollbar">
                        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 transition-all duration-700 ${isOptimizing ? 'scale-95 opacity-40 blur-sm' : ''}`}>
                            {memoryMap.map((mem) => (
                                <MemoryBlock key={mem.id} {...mem} active={inspectTarget === mem.id} isDefragging={isOptimizing} onClick={() => handleInspect(mem.id)} />
                            ))}
                        </div>
                    </div>
                    
                    {/* JSON VIEWER DRAWER */}
                    <div className={`absolute inset-x-0 bottom-0 bg-surface-main border-t border-border-subtle transition-all duration-500 ease-out z-30 flex flex-col shadow-2xl ${inspectTarget ? 'h-[60%]' : 'h-0'}`}>
                        {inspectTarget && (
                            <>
                                <div className="px-4 py-3 border-b border-border-subtle flex justify-between items-center bg-surface-alt/50 ">
                                    <span className="text-xs font-medium text-text-primary  tracking-wide flex items-center gap-2">
                                        <FileJson size={16} className="text-accent-primary" /> {inspectTarget.toUpperCase()}
                                    </span>
                                    <button className="p-1.5 hover:bg-surface-alt text-text-muted hover:text-text-primary transition-colors rounded-lg" onClick={() => setInspectTarget(null)}><X size={16}/></button>
                                </div>
                                <div className="flex-1 overflow-auto custom-scrollbar p-4 font-mono text-xs text-text-secondary bg-surface-main">
                                    <pre className="whitespace-pre-wrap break-all leading-relaxed opacity-90">
                                        {JSON.stringify(memoryMap.find(m => m.id === inspectTarget)?.data, null, 2)}
                                    </pre>
                                </div>
                            </>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};
