import { useSystem } from '../../../../hooks/useSystem';

import React from 'react';
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
    return (
        <section className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <SectionHeader icon={ShieldAlert} title="Core Infrastructure" sub="Critical System Controls" color="text-status-error" />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
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

                <div className="lg:col-span-1">
                    <LoadTester />
                </div>
            </div>
            
            {/* NUCLEAR ZONE */}
            <div className="mt-12 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-[1.6rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-[#0f0a0a] rounded-[1.5rem] p-8 border border-status-error/30 overflow-hidden">
                    {/* Hazard Stripes */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-[repeating-linear-gradient(45deg,#b91c1c,#b91c1c_10px,#000_10px,#000_20px)] opacity-50"></div>
                    <div className="absolute bottom-0 left-0 w-full h-2 bg-[repeating-linear-gradient(45deg,#b91c1c,#b91c1c_10px,#000_10px,#000_20px)] opacity-50"></div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)] shrink-0">
                                <ServerCrash size={32} className="text-status-error animate-pulse"/>
                            </div>
                            <div>
                                <h4 className="text-2xl font-[700] text-status-error  tracking-tighter flex items-center gap-2">
                                    Emergency Flush
                                </h4>
                                <p className="text-xs text-status-error/70 font-bold  tracking-widest mt-1">
                                    Local Cache & Session Purge
                                </p>
                                <p className="text-xs text-zinc-500 mt-2 max-w-md leading-relaxed">
                                    This action forces a hard reload for the current client, clearing all temporary states, layout preferences, and cached session keys. Database records remain intact.
                                </p>
                            </div>
                        </div>
                        
                        <button 
                            className="h-16 px-10 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-[700]  tracking-[0.25em] shadow-lg shadow-red-900/40 flex items-center gap-3 group transition-all hover:scale-[1.02] active:scale-95 border border-red-400/50"
                            onClick={() => {
                                if(confirm("CONFIRM SYSTEM FLUSH? Interface will reload.")) {
                                    sfx.playDecline();
                                    window.location.reload();
                                }
                            }}
                        >
                            <Trash2 size={18} className="group-hover:rotate-12 transition-transform"/>
                            Execute
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-surface-alt/40 border border-border-subtle rounded-[32px] space-y-6">
                <SectionHeader 
                    icon={RefreshCw} 
                    title="Database Control" 
                    sub="Low-level nexus database operations" 
                    color="text-status-error" 
                />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 bg-surface-main border border-border-subtle rounded-2xl space-y-3">
                            <h4 className="text-xs font-[700]  text-text-primary">Cloud Sync Reset</h4>
                            <p className="text-xs font-medium text-text-muted">Purge local cache and re-sync all operatives from Firestore.</p>
                            <Button 
                                variant="secondary" 
                                className="w-full h-10 gap-2"
                                onClick={() => window.location.reload()}
                            >
                                <RefreshCw size={16} /> Soft Reboot
                            </Button>
                        </div>
                        <div className="p-6 bg-surface-main border border-border-subtle rounded-2xl space-y-3">
                            <h4 className="text-xs font-[700]  text-text-primary">Infrastructure Seeding</h4>
                            <p className="text-xs font-medium text-text-muted">Populate Firestore with default server and operative nodes.</p>
                            <Button 
                                variant="secondary" 
                                className="w-full h-10 gap-2 text-status-error hover:bg-red-500/10"
                                onClick={async () => {
                                    if(confirm("Confirm destructive seed? This will overwrite core server configs.")) {
                                        await nexusGateway.seed();
                                        setToast({ title: "Alert", message: "Nexus Seed Successful. Please refresh.", type: "warning" });
                                    }
                                }}
                            >
                                <Database size={16} /> Hard Seed Cloud
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        );
    };
