import { useSystem } from '../../../../hooks/useSystem';

import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, AlertCircle, ShieldCheck, Leaf, Trash2, ServerCrash, RefreshCw, Database } from 'lucide-react';
import { SectionHeader } from '../SectionHeader';
import { ConfigToggle } from '../ConfigToggle';
import { SystemConfig } from '../../../../types';
import { sfx } from '../../../../lib/soundService';
import { Button } from '../../../ui/Base';
import { nexusGateway } from '../../../../nexus/adapters/DataGateway';

import { LoadTester } from '../LoadTester';

interface SystemTabProps {
    config: SystemConfig;
    onChange: (field: keyof SystemConfig, value: any) => void;
}

export const SystemTab: React.FC<SystemTabProps> = ({ config, onChange }) => {
    const { setToast } = useSystem();
    
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any } }
    };

    return (
        <motion.section 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            <motion.div variants={itemVariants}>
                <SectionHeader icon={ShieldAlert} title="Core Infrastructure" sub="Critical System Controls" color="text-status-error" />
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
                    <div className="lg:col-span-2 space-y-5 p-6 bg-surface-main/50 rounded-[2rem] border border-border-subtle shadow-inner relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000 text-status-error">
                            <ShieldAlert size={140} />
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-xs font-black text-text-primary tracking-widest uppercase flex items-center gap-3 mb-6">
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

                    <div className="lg:col-span-1 flex flex-col">
                        <div className="flex-1 bg-surface-main/50 rounded-[2rem] border border-border-subtle p-5 shadow-inner">
                            <LoadTester />
                        </div>
                    </div>
                </div>
            </motion.div>
            
            {/* NUCLEAR ZONE */}
            <motion.div variants={itemVariants} className="pt-6 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-[2rem] blur-xl opacity-10 group-hover:opacity-30 transition duration-1000"></div>
                <div className="relative bg-[#0f0a0a]/80 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-status-error/30 overflow-hidden shadow-2xl">
                    {/* Hazard Stripes */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-[repeating-linear-gradient(45deg,#b91c1c,#b91c1c_10px,transparent_10px,transparent_20px)] opacity-40"></div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-red-500/10 rounded-[20px] flex items-center justify-center border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.15)] shrink-0 group-hover:bg-red-500/20 transition-colors duration-500">
                                <ServerCrash size={32} className="text-status-error animate-pulse"/>
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-status-error tracking-tight flex items-center gap-2">
                                    Emergency Flush
                                </h4>
                                <p className="text-sm text-status-error/80 font-bold tracking-widest uppercase mt-1">
                                    Local Cache & Session Purge
                                </p>
                                <p className="text-sm text-text-muted mt-2.5 max-w-md leading-relaxed">
                                    This action forces a hard reload for the current client, clearing all temporary states, layout preferences, and cached session keys. Database records remain intact.
                                </p>
                            </div>
                        </div>
                        
                        <button 
                            className="h-14 px-8 bg-gradient-to-b from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-[0_0_30px_rgba(220,38,38,0.3)] flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] border border-red-400/30 shrink-0"
                            onClick={() => {
                                // if(confirm("CONFIRM SYSTEM FLUSH? Interface will reload.")) {
                                    sfx.playDecline();
                                    window.location.reload();
                                // }
                            }}
                        >
                            <Trash2 size={16} className="group-hover:rotate-12 transition-transform duration-300"/>
                            Execute
                        </button>
                    </div>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-6">
                <div className="p-6 sm:p-8 bg-surface-alt border border-border-subtle rounded-[2rem] space-y-6 shadow-inner">
                    <SectionHeader 
                        icon={RefreshCw} 
                        title="Database Control" 
                        sub="Low-level nexus database operations" 
                        color="text-accent-secondary" 
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                        <div className="p-5 bg-surface-main/50 border border-border-subtle rounded-2xl flex flex-col justify-between hover:border-border-strong transition-colors group">
                            <div className="mb-6">
                                <h4 className="text-sm font-black text-text-primary flex items-center gap-2">
                                    <RefreshCw size={16} className="text-accent-secondary" /> Cloud Sync Reset
                                </h4>
                                <p className="text-xs font-medium text-text-muted mt-2 leading-relaxed">Purge local cache and re-sync all operatives directly from the remote Firestore mesh.</p>
                            </div>
                            <Button 
                                variant="secondary" 
                                className="w-full h-12 gap-2 text-sm font-black tracking-wider uppercase bg-surface-main hover:bg-surface-alt border-border-strong text-text-primary"
                                onClick={() => window.location.reload()}
                            >
                                <RefreshCw size={16} className="group-hover:animate-spin" /> Soft Reboot
                            </Button>
                        </div>
                        <div className="p-5 bg-surface-main/50 border border-border-subtle rounded-2xl flex flex-col justify-between hover:border-red-900/30 hover:bg-red-900/10 transition-colors group">
                            <div className="mb-6">
                                <h4 className="text-sm font-black text-text-primary flex items-center gap-2">
                                    <Database size={16} className="text-status-error" /> Infrastructure Seeding
                                </h4>
                                <p className="text-xs font-medium text-text-muted mt-2 leading-relaxed">Populate Firestore with default server and operative nodes. Overwrites existing core architecture.</p>
                            </div>
                            <Button 
                                variant="secondary" 
                                className="w-full h-12 gap-2 text-sm font-black tracking-wider uppercase text-status-error bg-surface-main border-border-strong hover:bg-red-500/20 hover:border-red-500/30"
                                onClick={async () => {
                                // if(confirm("Confirm destructive seed? This will overwrite core server configs.")) {
                                        await nexusGateway.seed();
                                        setToast({ title: "Alert", message: "Nexus Seed Successful. Please refresh.", type: "warning" });
                                // }
                                }}
                            >
                                <Database size={16} className="group-hover:scale-110 transition-transform" /> Hard Seed Cloud
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.section>
    );
};
