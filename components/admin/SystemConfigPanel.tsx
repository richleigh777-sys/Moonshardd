 

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, DollarSign, Save, Lock, Globe, Database,
    RefreshCw, Terminal, LayoutGrid, Server, Zap
} from 'lucide-react';
import { Button } from '../ui/Base';
import { SystemConfig, Sale, Note } from '../../types';
import { sfx } from '../../lib/soundService';
import { useSystem } from '../../hooks/useSystem';
import { useAuth } from '../../hooks/useAuth';

// Standard Imports
import { OperationsTab } from './system/tabs/OperationsTab';
import { FinancialsTab } from './system/FinancialsTab';
import { ClearanceTab } from './system/tabs/ClearanceTab';
import { IntegrationsTab } from './system/tabs/IntegrationsTab';
import { CRMConfigTab } from './system/tabs/CRMConfigTab';
import { TerminalsConfigTab } from './system/tabs/TerminalsConfigTab';

interface SystemConfigPanelProps {
    config: SystemConfig;
    onUpdate: (newConfig: SystemConfig) => Promise<void>;
    sales: Sale[];
    notes: Note[];
}

type ConfigTab = 'operations' | 'financials' | 'crm' | 'clearance' | 'integrations' | 'taxonomy' | 'experience' | 'system' | 'command' | 'hygiene' | 'snapshots' | 'playbooks' | 'audit' | 'ecosystem' | 'terminals' | 'extensions';

export const SystemConfigPanel = ({ config, onUpdate, _sales, _notes }: SystemConfigPanelProps) => {
    const { currentUser } = useAuth();
    const { setToast } = useSystem();
    const [localConfig, setLocalConfig] = useState<SystemConfig>(config);
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [_now] = useState(() => Date.now());
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
        setIsSaving(true);
        try {
            sfx.playConfirm();
            await onUpdate(localConfig);
            setToast({ title: 'System Config', message: "Settings Saved", type: "success" });
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
            group: "Settings",
            icon: LayoutGrid,
            items: [
                { id: 'operations', label: 'Operations', icon: Clock, color: 'text-blue-500' },
                { id: 'financials', label: 'Financials', icon: DollarSign, color: 'text-emerald-500' },
            ]
        },
        {
            group: "Database",
            icon: Database,
            items: [
                { id: 'crm', label: 'CRM Config', icon: Database, color: 'text-emerald-500' },
            ]
        },
        {
            group: "Infrastructure",
            icon: Server,
            items: [
                { id: 'integrations', label: 'Integrations', icon: Globe, color: 'text-indigo-400' },
            ]
        },
        {
            group: "Admin",
            icon: Lock,
            hidden: !isSuperAdmin,
            items: [
                { id: 'clearance', label: 'Clearance', icon: Lock, color: 'text-amber-500' },
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
            <div className="flex flex-col h-full w-full max-w-7xl mx-auto rounded-xl bg-surface-main border border-border-subtle shadow-sm overflow-hidden">
                
                {/* Header */}
                <header className="px-8 py-5 border-b border-border-subtle bg-surface-alt/80 backdrop-blur-3xl flex justify-between items-center relative z-20 shrink-0">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-surface-main border border-border-subtle shadow-sm">
                            <Zap size={24} className="text-accent-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-text-primary tracking-tight">System Settings</h2>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-sm font-semibold uppercase tracking-wide text-text-muted">Configuration Panel</span>
                                <div className="h-3 w-px bg-border-strong"></div>
                                {isDirty ? (
                                    <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wide flex items-center gap-1.5 shadow-inner">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> pending changes
                                    </span>
                                ) : (
                                    <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-status-success border border-emerald-500/20 uppercase tracking-wide flex items-center gap-1.5 shadow-inner">
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
                                    className="px-5 py-2.5 rounded-xl text-sm font-semibold tracking-wide uppercase text-text-muted hover:text-text-primary hover:bg-surface-alt transition-colors flex items-center gap-2 border border-transparent hover:border-border-subtle"
                                >
                                    <RefreshCw size={14} /> Revert
                                </motion.button>
                            )}
                        </AnimatePresence>
                        <Button 
                            onClick={handleSave} 
                            disabled={!isDirty || isSaving}
                            isLoading={isSaving}
                            className={`px-8 py-3 rounded-xl text-sm font-semibold tracking-wide uppercase transition-all duration-300 flex items-center gap-2
                                ${isDirty ? 'bg-accent-primary text-white shadow-sm hover:-translate-y-0.5 hover:shadow-sm' : 'bg-surface-alt text-text-muted border border-border-strong opacity-80'}`}
                        >
                            <Save size={16} /> Save Changes
                        </Button>
                    </div>
                </header>

                {/* Main Body - Split Pane Design */}
                <div className="flex flex-1 overflow-hidden relative z-10 bg-surface-main">
                    
                    {/* Left: Navigation Menu */}
                    <nav className="w-[300px] bg-surface-alt/30 border-r border-border-subtle p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar shrink-0">
                        {NAV_GROUPS.map((group, gIdx) => (
                            <div key={gIdx} className="flex flex-col gap-2">
                                <h3 className="text-sm font-semibold tracking-[0.25em] uppercase text-text-muted ml-3 mb-1 flex items-center gap-2">
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
                                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent-primary rounded-r-full shadow-sm"
                                                        transition={{ duration: 0.3, ease: easing as any }}
                                                    />
                                                )}
                                                <div className={`p-2 rounded-xl transition-colors duration-200 ${isActive ? 'bg-accent-primary/10 text-accent-primary' : 'bg-surface-main border border-border-subtle text-text-muted group-hover:text-text-primary'}`}>
                                                    <item.icon size={16} />
                                                </div>
                                                <span className={`text-[13px] font-semibold transition-colors duration-200 ${isActive ? 'text-text-primary tracking-tight' : 'text-text-secondary group-hover:text-text-primary'}`}>
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
                                        {activeTab === 'crm' && <CRMConfigTab config={localConfig} onChange={handleChange} />}
                                        {activeTab === 'financials' && <FinancialsTab config={localConfig} onChange={handleChange} />}
                                        {activeTab === 'clearance' && <ClearanceTab config={localConfig} onChange={handleChange} isSuperAdmin={isSuperAdmin} />}
                                        {activeTab === 'integrations' && <IntegrationsTab config={localConfig} onChange={handleChange} />}
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
