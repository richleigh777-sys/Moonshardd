
import React, { useState, useMemo } from 'react';
import { Activity, RefreshCw, Wifi, ShieldCheck, Clock } from 'lucide-react';
import { SystemHealth } from '../../types';
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
        <div className="flex flex-col h-full w-full relative group bg-transparent">
            {isScanning && <DiagnosticOverlay onComplete={handleDiagnosticComplete} />}

            {/* HEADER */}
            <div className="px-3 py-2 border-b border-border-subtle flex justify-between items-center bg-transparent relative z-10 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="p-1 px-[5px] rounded border border-emerald-500/20 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-status-success shadow-[0_0_15px_rgba(16,185,129,0.15)] relative group-hover:border-status-success/30 transition-colors">
                        <Activity size={14} strokeWidth={2.5} className="animate-pulse" />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-[700] text-text-primary  tracking-[0.2em] drop-shadow-md">System Health</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-bold text-text-muted  tracking-widest flex items-center gap-1 font-mono">
                                <Clock size={9}/> UPTIME:
                            </span>
                            <div className="text-[10px] font-mono text-text-muted"><UptimeDisplay /></div>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={triggerScan}
                    disabled={isScanning}
                    className="p-1.5 bg-surface-alt border border-border-subtle rounded-lg text-text-muted hover:text-status-success hover:border-status-success/50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    title="Run Diagnostics"
                >
                    <RefreshCw size={14} className={isScanning ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* CONTENT */}
            <div className="flex-1 p-3 flex flex-col gap-3 relative z-10 min-h-0 bg-transparent">
                
                <SentinelMetrics latency={health.latency} trafficLoad={trafficLoad} />

                <InfrastructureList onlineCount={onlineCount} cloudSync={health.cloudSync} />

                {/* Uplink Actions */}
                <div className="pt-1 mt-auto">
                    <div className="flex gap-2">
                         <button 
                            onClick={handleUplinkTest}
                            disabled={uplinkStatus === 'testing'}
                            className={`
                                flex-1 py-1.5 rounded border flex items-center justify-center gap-1.5 text-[10px] font-[700]  tracking-[0.2em] transition-all font-mono
                                ${uplinkStatus === 'testing' ? 'bg-status-warning/10 border-status-warning/30 text-status-warning shadow-[0_0_15px_rgba(245,158,11,0.15)]' :
                                  uplinkStatus === 'success' ? 'bg-status-success/10 border-status-success/30 text-status-success shadow-[0_0_15px_rgba(16,185,129,0.15)]' :
                                  uplinkStatus === 'failed' ? 'bg-status-error/10 border-status-error/30 text-status-error shadow-[0_0_15px_rgba(239,68,68,0.15)]' :
                                  'bg-surface-alt border-border-subtle text-text-muted hover:bg-surface-highlight hover:text-text-primary'}
                            `}
                        >
                            {uplinkStatus === 'testing' ? <RefreshCw size={14} className="animate-spin"/> : <Wifi size={14}/>}
                            {uplinkStatus === 'testing' ? 'Pinking...' : uplinkStatus === 'success' ? 'Secure' : uplinkStatus === 'failed' ? 'Failed' : 'Test Uplink'}
                        </button>
                        
                        <div className="flex-1 py-1.5 px-3 bg-surface-alt rounded border border-border-subtle flex items-center justify-between">
                            <span className="text-[10px] font-bold text-text-muted  tracking-widest font-mono">ENC</span>
                            <span className="text-[10px] font-mono font-bold text-status-success flex items-center gap-1 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                                <ShieldCheck size={9}/> AES-256
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
