
import React, { useState, useMemo } from 'react';
import { Activity, RefreshCw, Wifi, ShieldCheck, Clock } from 'lucide-react';
import { SystemHealth } from '../../types';
import { Card } from '../ui/Base';
import { useCRM } from '../../hooks/useCRM';
import { sfx } from '../../lib/soundService';
import { UptimeDisplay } from './system-sentinel/Visuals';
import { DiagnosticOverlay } from './system-sentinel/DiagnosticOverlay';
import { SentinelMetrics } from './system-sentinel/SentinelMetrics';
import { InfrastructureList } from './system-sentinel/InfrastructureList';

interface SystemMonitorProps {
    health: SystemHealth;
    onRunDiagnostics: () => void;
    onTestUplink?: () => Promise<boolean>;
}

export const SystemMonitor: React.FC<SystemMonitorProps> = ({ health, onRunDiagnostics, onTestUplink }) => {
    const { users, sales, auditLogs } = useCRM();
    const [isScanning, setIsScanning] = useState(false);
    const [uplinkStatus, setUplinkStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');

    const triggerScan = () => {
        if (isScanning) return;
        sfx.playClick();
        setIsScanning(true);
    };

    const handleDiagnosticComplete = () => {
        onRunDiagnostics();
        setIsScanning(false);
        sfx.playSuccess();
    };

    const activeNodes = useMemo(() => users.filter(u => u.role === 'agent' && u.active), [users]);
    const onlineCount = activeNodes.filter(u => u.currentStatus === 'online').length;
    
    const [now] = useState(() => Date.now());

    const trafficLoad = useMemo(() => {
        const recentActivity = sales.filter(s => now - s.timestamp < 300000).length + 
                               auditLogs.filter(l => now - l.timestamp < 300000).length;
        return Math.min(100, Math.max(5, recentActivity * 8));
    }, [sales, auditLogs, now]);

    const handleUplinkTest = async () => {
        if (!onTestUplink) return;
        setUplinkStatus('testing');
        sfx.playClick();
        try {
            const success = await onTestUplink();
            setUplinkStatus(success ? 'success' : 'failed');
            if (success) sfx.playSuccess(); else sfx.playError();
            setTimeout(() => setUplinkStatus('idle'), 3000);
        } catch {
            setUplinkStatus('failed');
            sfx.playError();
            setTimeout(() => setUplinkStatus('idle'), 3000);
        }
    };

    return (
        <Card variant="panel" className="flex flex-col h-full rounded-[2rem] overflow-hidden relative group border-white/5 bg-surface-main">
            {isScanning && <DiagnosticOverlay onComplete={handleDiagnosticComplete} />}

            <div className="absolute inset-0 opacity-[0.03] bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none"></div>

            {/* HEADER */}
            <div className="p-3 md:p-4 border-b border-border-subtle flex justify-between items-center bg-surface-alt/20 relative z-10 backdrop-blur-xl shrink-0">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg border border-border-subtle bg-surface-main text-emerald-500 shadow-sm relative group-hover:border-emerald-500/30 transition-colors">
                        <Activity size={16} strokeWidth={2.5} />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-text-primary uppercase tracking-widest">System Health</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                                <Clock size={9}/> Uptime:
                            </span>
                            <UptimeDisplay />
                        </div>
                    </div>
                </div>
                <button 
                    onClick={triggerScan}
                    disabled={isScanning}
                    className="p-1.5 bg-surface-main border border-border-subtle rounded-lg text-text-muted hover:text-accent-primary hover:border-accent-primary/50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    title="Run Diagnostics"
                >
                    <RefreshCw size={14} className={isScanning ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* CONTENT */}
            <div className="flex-1 p-3 md:p-4 flex flex-col gap-2.5 relative z-10 min-h-0">
                
                <SentinelMetrics latency={health.latency} trafficLoad={trafficLoad} />

                <InfrastructureList onlineCount={onlineCount} cloudSync={health.cloudSync} />

                {/* Uplink Actions */}
                <div className="pt-1 mt-auto">
                    <div className="flex gap-2">
                         <button 
                            onClick={handleUplinkTest}
                            disabled={uplinkStatus === 'testing'}
                            className={`
                                flex-1 py-2 rounded-lg border flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-wider transition-all
                                ${uplinkStatus === 'testing' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
                                  uplinkStatus === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' :
                                  uplinkStatus === 'failed' ? 'bg-red-500/10 border-red-500/30 text-red-500' :
                                  'bg-surface-alt/40 border-border-subtle text-text-muted hover:bg-surface-alt hover:text-text-primary'}
                            `}
                        >
                            {uplinkStatus === 'testing' ? <RefreshCw size={10} className="animate-spin"/> : <Wifi size={10}/>}
                            {uplinkStatus === 'testing' ? 'Pinking...' : uplinkStatus === 'success' ? 'Secure' : uplinkStatus === 'failed' ? 'Failed' : 'Test Uplink'}
                        </button>
                        
                        <div className="flex-1 py-2 px-3 bg-surface-alt/20 rounded-lg border border-border-subtle flex items-center justify-between">
                            <span className="text-[8px] font-bold text-text-muted uppercase">Enc</span>
                            <span className="text-[9px] font-mono font-bold text-emerald-500 flex items-center gap-1">
                                <ShieldCheck size={9}/> AES-256
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};
