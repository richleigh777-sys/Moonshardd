import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    ShieldAlert, AlertCircle, ShieldCheck, Leaf, Trash2, ServerCrash, 
    Activity, Heart, Cpu, Database, AlertTriangle, Layers
} from 'lucide-react';
import { SectionHeader } from '../SectionHeader';
import { ConfigToggle } from '../ConfigToggle';
import { SystemConfig } from '../../../../types';
import { sfx } from '../../../../lib/soundService';

interface SystemTabProps {
    config: SystemConfig;
    onChange: (field: keyof SystemConfig, value: any) => void;
}

interface TelemetryData {
    status: string;
    uptime: number;
    memory: {
        rss: number;
        heapUsed: number;
        heapTotal: number;
    };
    database: {
        connected: boolean;
        latencyMs: number;
        poolActive: boolean;
    };
    heartbeats: {
        dripCampaignsWorker: { lastRun: number; status: string; error: string | null };
        inactivityCheckWorker: { lastRun: number; status: string; error: string | null };
        queryEngine: { lastPing: number; status: string };
    };
    refractionMetrics: {
        totalRequests: number;
        averageResponseTimeMs: number;
        maxResponseTimeMs: number;
    };
}

export const SystemTab: React.FC<SystemTabProps> = ({ config, onChange }) => {
    const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorCount, setErrorCount] = useState<number>(0);

    // Fetch live system health & refraction telemetry every 2 seconds
    useEffect(() => {
        let active = true;
        const fetchHealth = async () => {
            try {
                const res = await fetch('/api/health', {
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                });
                if (!res.ok) throw new Error('Health check failed');
                const data = await res.json();
                if (active) {
                    setTelemetry(data);
                    setLoading(false);
                    setErrorCount(0);
                }
            } catch (err) {
                console.error('[Watchdog] Error fetching health details:', err);
                if (active) {
                    setErrorCount(prev => prev + 1);
                }
            }
        };

        fetchHealth();
        const interval = setInterval(fetchHealth, 2000);

        return () => {
            active = false;
            clearInterval(interval);
        };
    }, []);

    // Check if latency is breached (>2 seconds / 2000ms) or if critical heartbeats are stalled
    const isLatencyBreached = telemetry && (telemetry.database.latencyMs > 2000 || telemetry.refractionMetrics.averageResponseTimeMs > 2000);
    const isHeartbeatMissed = telemetry && (
        telemetry.heartbeats.dripCampaignsWorker.status !== 'HEALTHY' ||
        telemetry.heartbeats.inactivityCheckWorker.status !== 'HEALTHY' ||
        telemetry.heartbeats.queryEngine.status !== 'HEALTHY'
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    
    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as any } }
    };

    const formatUptime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${hrs}h ${mins}m ${secs}s`;
    };

    return (
        <motion.section 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 pb-12"
        >
            {/* LATENCY OR HEARTBEAT WARNING HEADERS */}
            <AnimatePresence>
                {isLatencyBreached && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0, y: -20 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -20 }}
                        className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 flex items-center gap-4 text-amber-600 shadow-md animate-pulse"
                    >
                        <AlertTriangle size={24} className="shrink-0" />
                        <div>
                            <h4 className="font-bold text-sm uppercase tracking-wide">Sync Latency Breach Detected</h4>
                            <p className="text-xs mt-0.5 opacity-90 leading-relaxed">
                                System response threshold has exceeded 2.0 seconds. Backend database query execution round-trip: <strong className="font-mono">{telemetry?.database.latencyMs}ms</strong>. Refraction API average: <strong className="font-mono">{telemetry?.refractionMetrics.averageResponseTimeMs}ms</strong>.
                            </p>
                        </div>
                    </motion.div>
                )}
                {isHeartbeatMissed && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0, y: -20 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -20 }}
                        className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex items-center gap-4 text-red-600 shadow-md"
                    >
                        <ServerCrash size={24} className="shrink-0" />
                        <div>
                            <h4 className="font-bold text-sm uppercase tracking-wide">Critical Watchdog Heartbeat Failure</h4>
                            <p className="text-xs mt-0.5 opacity-90 leading-relaxed">
                                One or more automated background cron services have stalled. Please check the active health status logs on the right.
                            </p>
                        </div>
                    </motion.div>
                )}
                {errorCount > 2 && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0, y: -20 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -20 }}
                        className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex items-center gap-4 text-red-600 shadow-md"
                    >
                        <ServerCrash size={24} className="shrink-0" />
                        <div>
                            <h4 className="font-bold text-sm uppercase tracking-wide">Watchdog Sync Timeout</h4>
                            <p className="text-xs mt-0.5 opacity-90 leading-relaxed">
                                Unable to establish connection to the backend telemetry monitor. Heartbeat polling has returned multiple network timeouts.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT COLUMN: Controls & System Toggles (8 cols on lg) */}
                <div className="lg:col-span-7 space-y-8">
                    
                    <motion.div variants={itemVariants}>
                        <SectionHeader icon={ShieldAlert} title="Core Infrastructure" sub="Critical System Controls" color="text-status-error" />
                        
                        <div className="flex flex-col gap-5 mt-6">
                            <div className="space-y-5 p-6 bg-surface-main/50 rounded-2xl border border-border-subtle shadow-inner relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000 text-status-error">
                                    <ShieldAlert size={140} />
                                </div>
                                <div className="relative z-10">
                                    <h4 className="text-xs font-bold text-text-primary tracking-wide uppercase flex items-center gap-3 mb-6">
                                        <div className="p-2 rounded-xl bg-status-error/10 text-status-error border border-status-error/30"><ShieldCheck size={16}/></div>
                                        Environment Protocols
                                    </h4>
                                </div>
                                <div className="space-y-4 relative z-10">
                                    <ConfigToggle 
                                        label="Maintenance Protocol" 
                                        active={config.maintenanceMode || false} 
                                        onToggle={() => { 
                                            if(!config.maintenanceMode) sfx.playAlarm(); 
                                            onChange('maintenanceMode', !config.maintenanceMode); 
                                        }}
                                        danger={true}
                                        icon={AlertCircle}
                                        description="Immediate System Lockdown. Only Administrators will retain access."
                                    />
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <ConfigToggle 
                                            label="IP Whitelist Enforcement" 
                                            active={config.strictIPWhitelist || false} 
                                            onToggle={() => onChange('strictIPWhitelist', !config.strictIPWhitelist)}
                                            icon={ShieldCheck}
                                            description="Reject connections from non-verified subnets."
                                        />
                                        <ConfigToggle 
                                            label="Eco-Mode (Low Latency)" 
                                            active={config.ecoMode || false} 
                                            onToggle={() => onChange('ecoMode', !config.ecoMode)}
                                            icon={Leaf}
                                            description="Disable particle effects and heavy animations."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                    
                    {/* EMERGENCY ZONE */}
                    <motion.div variants={itemVariants} className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur-xl opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                        <div className="relative bg-surface-main rounded-2xl p-6 border border-status-error/30 overflow-hidden shadow-sm">
                            {/* Hazard Stripes */}
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-[repeating-linear-gradient(45deg,#b91c1c,#b91c1c_10px,transparent_10px,transparent_20px)] opacity-30"></div>
                            
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20 shadow-sm shrink-0 group-hover:bg-red-500/20 transition-colors duration-500">
                                        <ServerCrash size={26} className="text-status-error animate-pulse"/>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-status-error tracking-tight flex items-center gap-2">
                                            Emergency Flush
                                        </h4>
                                        <p className="text-xs text-status-error/80 font-bold tracking-wide uppercase mt-1">
                                            Local Cache & Session Purge
                                        </p>
                                        <p className="text-xs text-text-muted mt-2 max-w-sm leading-relaxed">
                                            This action forces a hard reload for the current client, clearing all temporary states, layout preferences, and cached session keys. Database records remain intact.
                                        </p>
                                    </div>
                                </div>
                                
                                <button 
                                    className="h-12 px-6 bg-gradient-to-b from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-wide shadow-sm flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] border border-red-400/30 shrink-0 cursor-pointer"
                                    onClick={() => {
                                        sfx.playDecline();
                                        window.location.reload();
                                    }}
                                >
                                    <Trash2 size={14} className="group-hover:rotate-12 transition-transform duration-300"/>
                                    Execute
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* RIGHT COLUMN: Watchdog & Backend Refraction Deck (5 cols on lg) */}
                <div className="lg:col-span-5 space-y-6">
                    <motion.div variants={itemVariants}>
                        <SectionHeader icon={Activity} title="Watchdog Telemetry" sub="Live Backend Refraction Deck" color="text-accent-primary" />
                    </motion.div>

                    {/* Telemetry Loader / Content */}
                    <AnimatePresence mode="wait">
                        {loading && !telemetry ? (
                            <motion.div 
                                key="loader"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="p-8 rounded-2xl bg-surface-main/30 border border-border-subtle flex flex-col items-center justify-center gap-4 text-text-muted text-xs font-semibold animate-pulse"
                            >
                                <div className="w-8 h-8 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
                                Synchronizing Telemetry Waves...
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="metrics"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-6"
                            >
                                {/* Core Telemetry Stats */}
                                <div className="p-6 bg-surface-main/80 backdrop-blur-2xl rounded-2xl border border-border-subtle shadow-sm space-y-5">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
                                            <Cpu size={14} className="text-accent-primary animate-spin-slow" />
                                            Runtime State
                                        </h4>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`w-2 h-2 rounded-full animate-ping ${telemetry?.status === 'HEALTHY' ? 'bg-status-success' : 'bg-status-warning'}`} />
                                            <span className="text-[10px] font-mono font-bold uppercase tracking-wide text-text-muted bg-surface-alt px-2 py-0.5 rounded border border-border-subtle">
                                                {telemetry?.status || 'UNKNOWN'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Stats grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-surface-alt/50 p-3 rounded-xl border border-border-subtle">
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted block">Server Uptime</span>
                                            <span className="text-xs font-mono font-bold text-text-primary mt-1 block">
                                                {telemetry ? formatUptime(telemetry.uptime) : '0s'}
                                            </span>
                                        </div>
                                        <div className="bg-surface-alt/50 p-3 rounded-xl border border-border-subtle">
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted block">RAM RSS / Heap</span>
                                            <span className="text-xs font-mono font-bold text-text-primary mt-1 block">
                                                {telemetry ? `${telemetry.memory.rss}MB / ${telemetry.memory.heapUsed}MB` : '0MB / 0MB'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* DB roundtrip latency */}
                                    <div className="space-y-2 bg-surface-alt/30 p-4 rounded-xl border border-border-subtle">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted flex items-center gap-1.5">
                                                <Database size={12} className="text-emerald-500" /> Database Latency
                                            </span>
                                            <span className={`text-xs font-mono font-bold ${telemetry && telemetry.database.latencyMs > 100 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                {telemetry ? `${telemetry.database.latencyMs}ms` : '0ms'}
                                            </span>
                                        </div>
                                        <div className="w-full bg-border-subtle h-1.5 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    telemetry && telemetry.database.latencyMs > 500 ? 'bg-amber-500' : 'bg-emerald-500'
                                                }`}
                                                style={{ width: `${Math.min(100, ((telemetry?.database.latencyMs || 0) / 2000) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Backend Refraction Metrics */}
                                <div className="p-6 bg-surface-main/80 backdrop-blur-2xl rounded-2xl border border-border-subtle shadow-sm space-y-4">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
                                        <Layers size={14} className="text-indigo-400" />
                                        Refraction Filters
                                    </h4>

                                    <div className="space-y-3.5">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-text-secondary font-medium">Total Waves Processed</span>
                                            <span className="font-mono font-bold text-text-primary bg-surface-alt px-2 py-0.5 rounded border border-border-subtle">
                                                {telemetry?.refractionMetrics.totalRequests || 0} reqs
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-text-secondary font-medium">Average Response Speed</span>
                                            <span className="font-mono font-bold text-text-primary bg-surface-alt px-2 py-0.5 rounded border border-border-subtle">
                                                {telemetry?.refractionMetrics.averageResponseTimeMs || 0} ms
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-text-secondary font-medium">Max Peak Delay</span>
                                            <span className="font-mono font-bold text-text-primary bg-surface-alt px-2 py-0.5 rounded border border-border-subtle">
                                                {telemetry?.refractionMetrics.maxResponseTimeMs || 0} ms
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Active Background Heartbeats */}
                                <div className="p-6 bg-surface-main/80 backdrop-blur-2xl rounded-2xl border border-border-subtle shadow-sm space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
                                            <Heart size={14} className="text-rose-500 fill-rose-500/20 animate-heartbeat" />
                                            Active Heartbeats
                                        </h4>
                                        <span className="text-[9px] uppercase font-bold tracking-wide text-text-muted bg-surface-alt px-1.5 py-0.5 rounded border border-border-subtle">
                                            Interval Checked
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        {/* Inactivity check worker */}
                                        <div className="flex items-center justify-between p-3 bg-surface-alt/30 rounded-xl border border-border-subtle">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-2.5 h-2.5 rounded-full border-2 ${
                                                    telemetry?.heartbeats.inactivityCheckWorker.status === 'HEALTHY' ? 'bg-status-success border-status-success/30' : 'bg-status-error border-status-error/30 animate-pulse'
                                                }`} />
                                                <div>
                                                    <span className="text-xs font-bold text-text-primary block leading-none">Inactivity Reaper</span>
                                                    <span className="text-[9px] text-text-muted block mt-1">90-Day Cold Lead Cleanup</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] font-mono font-bold text-text-secondary block">
                                                    {telemetry ? new Date(telemetry.heartbeats.inactivityCheckWorker.lastRun).toLocaleTimeString() : 'Never'}
                                                </span>
                                                <span className="text-[9px] uppercase font-bold text-text-muted block mt-0.5">Last Check</span>
                                            </div>
                                        </div>

                                        {/* Drip campaigns worker */}
                                        <div className="flex items-center justify-between p-3 bg-surface-alt/30 rounded-xl border border-border-subtle">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-2.5 h-2.5 rounded-full border-2 ${
                                                    telemetry?.heartbeats.dripCampaignsWorker.status === 'HEALTHY' ? 'bg-status-success border-status-success/30' : 'bg-status-error border-status-error/30 animate-pulse'
                                                }`} />
                                                <div>
                                                    <span className="text-xs font-bold text-text-primary block leading-none">Drip Campaign Hub</span>
                                                    <span className="text-[9px] text-text-muted block mt-1">Sms/Email Funnel Router</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] font-mono font-bold text-text-secondary block">
                                                    {telemetry ? new Date(telemetry.heartbeats.dripCampaignsWorker.lastRun).toLocaleTimeString() : 'Never'}
                                                </span>
                                                <span className="text-[9px] uppercase font-bold text-text-muted block mt-0.5">Last Check</span>
                                            </div>
                                        </div>

                                        {/* Postgres Query Engine */}
                                        <div className="flex items-center justify-between p-3 bg-surface-alt/30 rounded-xl border border-border-subtle">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-2.5 h-2.5 rounded-full border-2 ${
                                                    telemetry?.heartbeats.queryEngine.status === 'HEALTHY' ? 'bg-status-success border-status-success/30' : 'bg-status-error border-status-error/30 animate-pulse'
                                                }`} />
                                                <div>
                                                    <span className="text-xs font-bold text-text-primary block leading-none">Query Pipeline</span>
                                                    <span className="text-[9px] text-text-muted block mt-1">Drizzle Connection Broker</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] font-mono font-bold text-text-secondary block">
                                                    {telemetry ? new Date(telemetry.heartbeats.queryEngine.lastPing).toLocaleTimeString() : 'Never'}
                                                </span>
                                                <span className="text-[9px] uppercase font-bold text-text-muted block mt-0.5">Last Active</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </motion.section>
    );
};
