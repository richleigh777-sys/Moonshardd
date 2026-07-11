import React, { useState } from 'react';
import { Layout, ShieldCheck, Save, RefreshCw, Info } from 'lucide-react';
import { Card } from '../../../../ui/Base';
import { SectionHeader } from '../SectionHeader';
import { motion } from 'motion/react';

interface WorkspacesConfigTabProps { config?: any; onChange?: any; isSuperAdmin?: boolean; }
export const WorkspacesConfigTab: React.FC<WorkspacesConfigTabProps> = ({ config, onChange, isSuperAdmin }) => {
    const [isSaving, setIsSaving] = useState(false);
    
    // Config state
    const [localWorkspaceConfig, setLocalWorkspaceConfig] = useState(() => {
        const base = config?.workspaceConfig || {};
        const views = base.workspaceViews || {};
        return {
            ...base,
            workspaceViews: {
                agentConsole: views.agentConsole || 'SALES_MODERN',
                salesPoolView: views.salesPoolView || 'POOL_DETAILED',
                salesLedgerView: views.salesLedgerView || 'LEDGER_CLASSIC'
            }
        };
    });

    const handleSave = () => {
        setIsSaving(true);
        if(onChange) onChange('workspaceConfig', localWorkspaceConfig);
        setTimeout(() => setIsSaving(false), 1500);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 pb-10"
        >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <SectionHeader 
                    icon={Layout} 
                    title="Workspaces UI" 
                    sub="Global interface configuration" 
                    color="text-[#3B82F6]" 
                />
                <button 
                    onClick={handleSave}
                    className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 bg-surface-main hover:bg-surface-alt border border-border-strong text-text-primary rounded-xl text-xs font-bold uppercase tracking-wide transition-all shadow-inner"
                >
                    {isSaving ? (
                        <><RefreshCw size={14} className="animate-spin text-[#3B82F6]" /> Saving...</>
                    ) : (
                        <><Save size={14} className="text-[#3B82F6]" /> Deploy Settings</>
                    )}
                </button>
            </div>

            <div className="p-4 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl flex items-start gap-4">
                <div className="p-2 bg-[#10B981]/20 rounded-xl shrink-0"><ShieldCheck className="text-[#34D399]" /></div>
                <div>
                    <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">Workspace Interface Custody</h3>
                    <p className="text-sm text-text-muted mt-1 font-medium leading-relaxed max-w-3xl">
                        Interface modifications are strictly controlled at the Level 10 Super Admin tier. Layouts configured here will sync across all active Agent Workspaces and Admin Modals in the cluster.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 bg-surface-main border-border-subtle shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Layout size={100} /></div>
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="p-2 bg-[#3B82F6]/10 rounded-xl text-[#60A5FA]"><RefreshCw size={18} /></div>
                        <div>
                            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Workspace UI Protocol</h3>
                            <p className="text-sm text-text-muted tracking-wide uppercase mt-0.5">Global UI State</p>
                        </div>
                    </div>

                    <div className="space-y-5 relative z-10">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Workspace Base Layout (Agent Modal)</label>
                                <div className="group relative">
                                    <Info size={14} className="text-text-muted cursor-help hover:text-[#3B82F6]" />
                                    <div className="absolute bottom-full left-0 mb-2 w-72 p-3 bg-surface-alt border border-border-strong rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-xs text-text-primary">
                                        <div className="font-bold mb-2 text-[#3B82F6]">Layout Explanations</div>
                                        <div className="space-y-2 text-text-muted">
                                            <p><strong className="text-text-primary">Hyper-Focus Modern:</strong> Standard, streamlined view for high-velocity sales.</p>
                                            <p><strong className="text-text-primary">Split Console View:</strong> Data-dense layout showing context side-by-side.</p>
                                            <p><strong className="text-text-primary">Minimalist HUD:</strong> Stripped down interface focusing only on core actions.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <select 
                                value={localWorkspaceConfig.workspaceViews.agentConsole}
                                onChange={e => setLocalWorkspaceConfig({...localWorkspaceConfig, workspaceViews: {...localWorkspaceConfig.workspaceViews, agentConsole: e.target.value}})}
                                className="w-full bg-surface-main border border-border-subtle rounded-xl px-4 py-3 text-sm font-semibold text-text-primary focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/30 outline-none"
                            >
                                <option value="SALES_MODERN">Hyper-Focus Modern (Standard)</option>
                                <option value="SPLIT_VIEW">Split Console View (Data Heavy)</option>
                                <option value="MINIMAL_HUD">Minimalist HUD</option>
                            </select>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Sales Pool Workspace View</label>
                            </div>
                            <select 
                                value={localWorkspaceConfig.workspaceViews.salesPoolView || 'POOL_DETAILED'}
                                onChange={e => setLocalWorkspaceConfig({...localWorkspaceConfig, workspaceViews: {...localWorkspaceConfig.workspaceViews, salesPoolView: e.target.value}})}
                                className="w-full bg-surface-main border border-border-subtle rounded-xl px-4 py-3 text-sm font-semibold text-text-primary focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/30 outline-none"
                            >
                                <option value="POOL_DETAILED">Traditional Ledger Rows (Standard)</option>
                                <option value="POOL_TILES">Bento Visual Cards (Dashboard Layout)</option>
                                <option value="POOL_COMPACT">High Density Stream (Compact Layout)</option>
                            </select>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Sales Ledger Workspace View</label>
                            </div>
                            <select 
                                value={localWorkspaceConfig.workspaceViews.salesLedgerView || 'LEDGER_CLASSIC'}
                                onChange={e => setLocalWorkspaceConfig({...localWorkspaceConfig, workspaceViews: {...localWorkspaceConfig.workspaceViews, salesLedgerView: e.target.value}})}
                                className="w-full bg-surface-main border border-border-subtle rounded-xl px-4 py-3 text-sm font-semibold text-text-primary focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/30 outline-none"
                            >
                                <option value="LEDGER_CLASSIC">Standard Financial Ledger (Classic)</option>
                                <option value="LEDGER_COMPACT">Ultra High Density Table (Compact)</option>
                            </select>
                        </div>
                    </div>
                </Card>
            </div>
        </motion.div>
    );
};
