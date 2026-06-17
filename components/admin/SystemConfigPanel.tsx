 

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Settings, Clock, DollarSign, Save, Lock, Globe, Database,
    Tag, Sparkles, RefreshCw, ChevronRight, ShieldAlert, Package, Target, Network, Terminal, LayoutGrid, Server, Activity, Zap
} from 'lucide-react';
import { Card, Button } from '../ui/Base';
import { SystemConfig, Sale, Note } from '../../types';
import { sfx } from '../../lib/soundService';
import { useSystem } from '../../hooks/useSystem';
import { useAuth } from '../../hooks/useAuth';

// Tabs
import { OperationsTab } from './system/tabs/OperationsTab';
import { FinancialsTab } from './system/FinancialsTab';
import { ClearanceTab } from './system/tabs/ClearanceTab';
import { IntegrationsTab } from './system/tabs/IntegrationsTab';
import { TaxonomyTab } from './system/tabs/TaxonomyTab';
import { ExperienceTab } from './system/tabs/ExperienceTab';
import { SystemTab } from './system/tabs/SystemTab';
import { CommandDeckTab } from './system/tabs/CommandDeckTab';
import { CRMConfigTab } from './system/tabs/CRMConfigTab';
import { HygieneTab } from './system/tabs/HygieneTab';
import { SnapshotsTab } from './system/tabs/SnapshotsTab';
import { PlaybooksTab } from './system/tabs/PlaybooksTab';
import { AuditTab } from './system/tabs/AuditTab';
import { EcosystemTab } from './system/tabs/EcosystemTab';
import { TerminalsConfigTab } from './system/tabs/TerminalsConfigTab';

interface SystemConfigPanelProps {
    config: SystemConfig;
    onUpdate: (newConfig: SystemConfig) => Promise<void>;
    sales: Sale[];
    notes: Note[];
}

type ConfigTab = 'operations' | 'financials' | 'crm' | 'clearance' | 'integrations' | 'taxonomy' | 'experience' | 'system' | 'command' | 'hygiene' | 'snapshots' | 'playbooks' | 'audit' | 'ecosystem' | 'terminals';

export const SystemConfigPanel = ({ config, onUpdate, sales, notes }: SystemConfigPanelProps) => {
    const { currentUser } = useAuth();
    const { setToast } = useSystem();
    const [localConfig, setLocalConfig] = useState<SystemConfig>(config);
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [now] = useState(() => Date.now());
    const [activeTab, setActiveTab] = useState<ConfigTab>('operations');
    
    const isSuperAdmin = (currentUser?.accessLevel || 0) >= 10;

    useEffect(() => {
        if (!isDirty) {
            setLocalConfig(config);
        }
    }, [config, isDirty]);

    const handleChange = useCallback((field: keyof SystemConfig, value: any) => {
        setLocalConfig(prev => {
            const next = { ...prev, [field]: value };
            setIsDirty(JSON.stringify(next) !== JSON.stringify(config));
            return next;
        });
    }, [config]);

    const handleSave = async () => {
        const confirmed = window.confirm("⚠️ SYSTEM OVERRIDE ⚠️\n\nAre you sure you want to commit these system-wide configuration changes?");
        if (!confirmed) return;

        setIsSaving(true);
        try {
            sfx.playConfirm();
            await onUpdate(localConfig);
            setToast({ title: 'System Config', message: "System Parameters Deployed", type: "success" });
            setIsDirty(false);
        } catch {
            sfx.playError();
            setToast({ title: 'System Error', message: "Save Failed", type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setLocalConfig(config);
        setIsDirty(false);
        sfx.playDecline();
    };

    const NAV_GROUPS = [
        {
            group: "Core Logic",
            icon: LayoutGrid,
            items: [
                { id: 'operations', label: 'Operations', icon: Clock, color: 'text-blue-500' },
                { id: 'financials', label: 'Financials', icon: DollarSign, color: 'text-emerald-500' },
                { id: 'playbooks', label: 'Playbooks', icon: Target, color: 'text-indigo-400' },
                { id: 'experience', label: 'UX / Vibe', icon: Sparkles, color: 'text-pink-500' },
            ]
        },
        {
            group: "Data Integrity",
            icon: Database,
            items: [
                { id: 'crm', label: 'CRM State', icon: Database, color: 'text-emerald-500' },
                { id: 'hygiene', label: 'Hygiene', icon: Sparkles, color: 'text-indigo-400' },
                { id: 'audit', label: 'Audit Log', icon: ShieldAlert, color: 'text-rose-500' },
                { id: 'taxonomy', label: 'Taxonomy', icon: Tag, color: 'text-purple-500' },
            ]
        },
        {
            group: "Infrastructure",
            icon: Server,
            items: [
                { id: 'integrations', label: 'Uplinks', icon: Globe, color: 'text-indigo-400' },
                { id: 'snapshots', label: 'Snapshots', icon: Package, color: 'text-indigo-400' },
                { id: 'ecosystem', label: 'Mapping', icon: Network, color: 'text-cyan-500' },
                { id: 'system', label: 'Sys Core', icon: Activity, color: 'text-rose-500' },
            ]
        },
        {
            group: "Level 10 Control",
            icon: Lock,
            hidden: !isSuperAdmin,
            items: [
                { id: 'clearance', label: 'Clearance', icon: Lock, color: 'text-amber-500' },
                { id: 'command', label: 'Command', icon: Settings, color: 'text-rose-500' },
                { id: 'terminals', label: 'Terminals', icon: Terminal, color: 'text-blue-500' },
            ]
        }
    ].filter(g => !g.hidden);

    const easing = [0.16, 1, 0.3, 1] as any;
    
    // Smooth page transitions
    const containerVariants = {
        hidden: { opacity: 0, scale: 0.99 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: easing as any } }
    };

    const tabContentVariants = {
        hidden: { opacity: 0, scale: 0.98, filter: 'blur(8px)' },
        visible: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.4, ease: easing as any } },
        exit: { opacity: 0, scale: 1.02, filter: 'blur(4px)', transition: { duration: 0.2, ease: easing as any } }
    };

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col h-full w-full overflow-hidden p-6"
        >
            <div className="flex flex-col h-full w-full max-w-7xl mx-auto rounded-[32px] bg-surface-main border border-border-subtle shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden">
                
                {/* HUD Header */}
                <header className="px-8 py-5 border-b border-border-subtle bg-surface-alt/80 backdrop-blur-3xl flex justify-between items-center relative z-20 shrink-0">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-surface-main border border-border-subtle shadow-sm">
                            <Zap size={24} className="text-accent-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-[900] text-text-primary tracking-tight">Extra Settings Terminal</h2>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-sm font-[800] uppercase tracking-[0.2em] text-text-muted">System Configuration Hub</span>
                                <div className="h-3 w-px bg-border-strong"></div>
                                {isDirty ? (
                                    <span className="text-sm font-[800] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-widest flex items-center gap-1.5 shadow-inner">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> pending changes
                                    </span>
                                ) : (
                                    <span className="text-sm font-[800] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-status-success border border-emerald-500/20 uppercase tracking-widest flex items-center gap-1.5 shadow-inner">
                                        <span className="w-1.5 h-1.5 rounded-full bg-status-success" /> System Nominal
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <AnimatePresence>
                            {isDirty && (
                                <motion.button 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    onClick={handleReset} 
                                    className="px-5 py-2.5 rounded-xl text-sm font-[800] tracking-widest uppercase text-text-muted hover:text-text-primary hover:bg-surface-alt transition-colors flex items-center gap-2 border border-transparent hover:border-border-subtle"
                                >
                                    <RefreshCw size={14} /> Revert
                                </motion.button>
                            )}
                        </AnimatePresence>
                        <Button 
                            onClick={handleSave} 
                            disabled={!isDirty || isSaving}
                            isLoading={isSaving}
                            className={`px-8 py-3 rounded-xl text-sm font-[900] tracking-[0.2em] uppercase transition-all duration-300 flex items-center gap-2
                                ${isDirty ? 'bg-accent-primary text-white shadow-[0_0_20px_rgba(var(--color-accent-primary),0.4)] hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(var(--color-accent-primary),0.6)]' : 'bg-surface-alt text-text-muted border border-border-strong opacity-80'}`}
                        >
                            <Save size={16} /> Deploy Architecture
                        </Button>
                    </div>
                </header>

                {/* Main Body - Split Pane Design */}
                <div className="flex flex-1 overflow-hidden relative z-10 bg-surface-main">
                    
                    {/* Left: Navigation Menu */}
                    <nav className="w-[300px] bg-surface-alt/30 border-r border-border-subtle p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar shrink-0">
                        {NAV_GROUPS.map((group, gIdx) => (
                            <div key={gIdx} className="flex flex-col gap-2">
                                <h3 className="text-sm font-[900] tracking-[0.25em] uppercase text-text-muted ml-3 mb-1 flex items-center gap-2">
                                    <group.icon size={12} className="opacity-40" /> {group.group}
                                </h3>
                                <div className="flex flex-col gap-1">
                                    {group.items.map(item => {
                                        const isActive = activeTab === item.id as ConfigTab;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => { setActiveTab(item.id as ConfigTab); sfx.playClick(); }}
                                                className={`
                                                    relative px-4 py-3 rounded-[16px] flex items-center gap-4 transition-all duration-200 ease-out text-left group
                                                    ${isActive ? 'bg-surface-main shadow-sm border border-border-subtle' : 'bg-transparent border border-transparent hover:bg-surface-alt/80'}
                                                `}
                                            >
                                                {isActive && (
                                                    <motion.div 
                                                        layoutId="activeTabIndicator" 
                                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent-primary rounded-r-full shadow-[0_0_10px_rgba(var(--color-accent-primary),0.5)]"
                                                        transition={{ duration: 0.3, ease: easing as any }}
                                                    />
                                                )}
                                                <div className={`p-2 rounded-xl transition-colors duration-200 ${isActive ? 'bg-accent-primary/10 text-accent-primary' : 'bg-surface-main border border-border-subtle text-text-muted group-hover:text-text-primary'}`}>
                                                    <item.icon size={16} />
                                                </div>
                                                <span className={`text-[13px] font-[800] transition-colors duration-200 ${isActive ? 'text-text-primary tracking-tight' : 'text-text-secondary group-hover:text-text-primary'}`}>
                                                    {item.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>

                    {/* Right: Dynamic Configuration Container */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-surface-main">
                        <div className="absolute inset-0 bg-gradient-to-br from-surface-alt/20 to-transparent pointer-events-none"></div>
                        <div className="max-w-5xl mx-auto h-full p-10 pb-32 relative z-10 w-full">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    variants={tabContentVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="h-full w-full"
                                >
                                    {activeTab === 'operations' && <OperationsTab config={localConfig} onChange={handleChange} isSuperAdmin={isSuperAdmin} />}
                                    {activeTab === 'playbooks' && <PlaybooksTab config={localConfig} onChange={handleChange} />}
                                    {activeTab === 'crm' && <CRMConfigTab config={localConfig} onChange={handleChange} />}
                                    {activeTab === 'hygiene' && <HygieneTab sales={sales} notes={notes} now={now} />}
                                    {activeTab === 'financials' && <FinancialsTab config={localConfig} onChange={handleChange} />}
                                    {activeTab === 'clearance' && <ClearanceTab config={localConfig} onChange={handleChange} isSuperAdmin={isSuperAdmin} />}
                                    {activeTab === 'integrations' && <IntegrationsTab config={localConfig} onChange={handleChange} />}
                                    {activeTab === 'taxonomy' && <TaxonomyTab config={localConfig} onChange={handleChange} />}
                                    {activeTab === 'experience' && <ExperienceTab config={localConfig} onChange={handleChange} />}
                                    {activeTab === 'snapshots' && <SnapshotsTab />}
                                    {activeTab === 'audit' && <AuditTab />}
                                    {activeTab === 'system' && <SystemTab config={localConfig} onChange={handleChange} />}
                                    {activeTab === 'command' && <CommandDeckTab />}
                                    {activeTab === 'ecosystem' && <EcosystemTab />}
                                    {activeTab === 'terminals' && <TerminalsConfigTab config={localConfig} onChange={handleChange} isSuperAdmin={isSuperAdmin} />}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                </div>
            </div>
        </motion.div>
    );
};
