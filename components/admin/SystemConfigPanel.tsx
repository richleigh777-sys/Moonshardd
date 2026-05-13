
import React, { useState, useEffect, useCallback } from 'react';
import { 
    Settings, Clock, DollarSign, Save, Lock, Globe, Database,
    Tag, Sparkles, RefreshCw, ChevronRight, ShieldAlert, Terminal
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

interface SystemConfigPanelProps {
    config: SystemConfig;
    onUpdate: (newConfig: SystemConfig) => Promise<void>;
    sales: Sale[];
    notes: Note[];
}

type ConfigTab = 'operations' | 'financials' | 'crm' | 'clearance' | 'integrations' | 'taxonomy' | 'experience' | 'system' | 'command' | 'hygiene';

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

    const NAV_ITEMS = [
        { id: 'operations', label: 'Operations', icon: Clock, color: 'text-blue-500' },
        { id: 'crm', label: 'CRM Logic', icon: Database, color: 'text-emerald-500' },
        { id: 'hygiene', label: 'Data Hygiene', icon: Sparkles, color: 'text-indigo-400' },
        { id: 'financials', label: 'Financials', icon: DollarSign, color: 'text-emerald-500' },
        { id: 'clearance', label: 'Clearance', icon: Lock, color: 'text-amber-500', hidden: !isSuperAdmin },
        { id: 'integrations', label: 'Uplinks', icon: Globe, color: 'text-indigo-500' },
        { id: 'taxonomy', label: 'Taxonomy', icon: Tag, color: 'text-purple-500' },
        { id: 'experience', label: 'UX / Vibe', icon: Sparkles, color: 'text-pink-500' },
        { id: 'system', label: 'System Core', icon: ShieldAlert, color: 'text-red-500' },
        { id: 'command', label: 'Command Deck', icon: Terminal, color: 'text-red-600', hidden: !isSuperAdmin },
    ].filter(item => !item.hidden) as { id: ConfigTab, label: string, icon: any, color: string }[];

    return (
        <div className="flex flex-col h-full gap-2 animate-in fade-in duration-700 w-full overflow-hidden p-1">
            <Card variant="panel" className="flex flex-col h-full relative overflow-hidden rounded-2xl bg-surface-main shadow-2xl border-white/5">
                
                {/* HEADER */}
                <div className="p-3 border-b border-border-subtle bg-surface-alt/40 flex justify-between items-center relative z-20 shrink-0 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-accent-primary/10 rounded-xl text-accent-primary border border-accent-primary/20 shadow-neon">
                            <Settings size={18} strokeWidth={2}/>
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-text-primary italic tracking-tight uppercase leading-none">System <span className="text-accent-primary">Config</span></h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border transition-colors ${isDirty ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 animate-pulse' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'}`}>
                                    {isDirty ? 'Unsaved' : 'Nominal'}
                                </span>
                                {localConfig.maintenanceMode && <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded border bg-red-500/10 border-red-500/30 text-red-500 animate-pulse shadow-red-500/20 shadow-sm">MAINTENANCE</span>}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {isDirty && (
                            <button onClick={handleReset} className="h-8 px-4 rounded-lg border border-border-subtle hover:bg-surface-alt text-[9px] font-bold uppercase text-text-muted hover:text-text-primary transition-all flex items-center gap-2 group">
                                <RefreshCw size={12} className="group-hover:-rotate-180 transition-transform duration-500"/> Revert
                            </button>
                        )}
                        <Button 
                            onClick={handleSave} 
                            variant="primary" 
                            className="h-8 px-6 text-[9px] font-black uppercase tracking-[0.15em] shadow-lg shadow-accent-primary/30 active:scale-95 bg-gradient-to-r from-accent-primary to-indigo-600 hover:brightness-110 border border-white/10 group" 
                            disabled={!isDirty || isSaving}
                            isLoading={isSaving}
                        >
                            <Save size={14} className="mr-1.5 group-hover:scale-110 transition-transform"/> Commit
                        </Button>
                    </div>
                </div>

                {/* BODY */}
                <div className="flex flex-1 overflow-hidden relative z-10">
                    
                    {/* NAVIGATION SIDEBAR */}
                    <div className="w-52 bg-surface-alt/20 border-r border-border-subtle flex flex-col gap-1 p-2 overflow-y-auto custom-scrollbar backdrop-blur-sm">
                        <div className="px-2 py-1.5 text-[9px] font-black text-text-muted uppercase tracking-widest opacity-60">
                            Modules
                        </div>
                        {NAV_ITEMS.map((item) => {
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => { setActiveTab(item.id); sfx.playClick(); }}
                                    className={`
                                        flex items-center justify-between p-2 rounded-xl transition-all duration-300 group relative overflow-hidden
                                        ${isActive ? 'bg-surface-main shadow-lg border border-border-subtle/50' : 'hover:bg-surface-main/60 border border-transparent'}
                                    `}
                                >
                                    {isActive && <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.color.replace('text-', 'bg-')}`}></div>}
                                    
                                    <div className="flex items-center gap-2.5 relative z-10">
                                        <div className={`p-1.5 rounded-lg transition-all duration-300 ${isActive ? item.color.replace('text-', 'bg-') + '/10 ' + item.color : 'bg-surface-alt text-text-muted group-hover:text-text-primary group-hover:bg-white/5'}`}>
                                            <item.icon size={14}/>
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wide ${isActive ? 'text-text-primary' : 'text-text-muted group-hover:text-text-primary'}`}>
                                            {item.label}
                                        </span>
                                    </div>
                                    
                                    {isActive && <ChevronRight size={12} className="text-text-muted relative z-10 animate-in slide-in-from-left-2"/>}
                                </button>
                            );
                        })}
                    </div>

                    {/* CONFIG CONTENT */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-surface-main relative">
                        <div className="max-w-4xl mx-auto min-h-full pb-10">
                            {activeTab === 'operations' && <OperationsTab config={localConfig} onChange={handleChange} />}
                            {activeTab === 'crm' && <CRMConfigTab config={localConfig} onChange={handleChange} />}
                            {activeTab === 'hygiene' && <HygieneTab sales={sales} notes={notes} now={now} />}
                            {activeTab === 'financials' && <FinancialsTab config={localConfig} onChange={handleChange} />}
                            {activeTab === 'clearance' && <ClearanceTab config={localConfig} onChange={handleChange} isSuperAdmin={isSuperAdmin} />}
                            {activeTab === 'integrations' && <IntegrationsTab config={localConfig} onChange={handleChange} />}
                            {activeTab === 'taxonomy' && <TaxonomyTab config={localConfig} onChange={handleChange} />}
                            {activeTab === 'experience' && <ExperienceTab config={localConfig} onChange={handleChange} />}
                            {activeTab === 'system' && <SystemTab config={localConfig} onChange={handleChange} />}
                            {activeTab === 'command' && <CommandDeckTab />}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};
