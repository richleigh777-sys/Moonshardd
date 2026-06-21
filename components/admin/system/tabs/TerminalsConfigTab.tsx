import React, { useState } from 'react';
import { Terminal, Code, Workflow, ShieldCheck, Zap, Database, Server, Settings, Save, RefreshCw, GitCommit, CheckSquare, Layers, Lock } from 'lucide-react';
import { Card } from '../../../../ui/Base';
import { SectionHeader } from '../SectionHeader';
import { motion } from 'motion/react';

interface TerminalsConfigTabProps { config?: any; onChange?: any; isSuperAdmin?: boolean; }
export const TerminalsConfigTab: React.FC<TerminalsConfigTabProps> = ({ config, onChange, isSuperAdmin }) => {
    const [isSaving, setIsSaving] = useState(false);
    
    // Salesforce-esque architecture state
    const [localTerminalConfig, setLocalTerminalConfig] = useState(config?.terminalConfig || {
        terminalSyncSyncMode: 'REALTIME_WEBSOCKET',
        apexTriggersEnabled: true,
        strictValidationRules: true,
        omniChannelRouting: 'SKILL_BASED',
        headlessApiAccess: false,
        level10Override: true,
        terminalViews: {
            agentConsole: 'SALES_MODERN',
            dashboard: 'EXECUTIVE_SUMMARY',
            scratchpad: 'PERSISTENT_MODAL'
        }
    });

    const handleSave = () => {
        setIsSaving(true);
        if(onChange) onChange('terminalConfig', localTerminalConfig);
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
                    icon={Terminal} 
                    title="Terminals & Functions Configuration" 
                    sub="Global Sync Engine, Terminal Modals, and Action Triggers" 
                    color="text-[#3B82F6]" 
                />
                <button 
                    onClick={handleSave}
                    className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 bg-surface-main hover:bg-surface-alt border border-border-strong text-text-primary rounded-xl text-xs font-bold uppercase tracking-wide transition-all shadow-inner"
                >
                    {isSaving ? (
                        <><RefreshCw size={14} className="animate-spin text-[#3B82F6]" /> Syncing Metadata...</>
                    ) : (
                        <><Save size={14} className="text-[#3B82F6]" /> Deploy to Edge</>
                    )}
                </button>
            </div>

            <div className="p-4 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl flex items-start gap-4">
                <div className="p-2 bg-[#10B981]/20 rounded-xl shrink-0"><ShieldCheck className="text-[#34D399]" /></div>
                <div>
                    <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">Super Admin Level 10 Custody</h3>
                    <p className="text-sm text-text-muted mt-1 font-medium leading-relaxed max-w-3xl">
                        Architect Directive: All terminal modifications, custom object workflows, and function executions are strictly controlled at the Level 10 Super Admin tier. Layouts, triggers, and WebSocket dispatch rules configured here will instantly hot-sync across all active Agent Terminals and Admin Modals in the cluster.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 bg-surface-main border-border-subtle shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Server size={100} /></div>
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="p-2 bg-[#3B82F6]/10 rounded-xl text-[#60A5FA]"><RefreshCw size={18} /></div>
                        <div>
                            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Terminal Sync Engine</h3>
                            <p className="text-sm text-text-muted tracking-wide uppercase mt-0.5">Global UI State Propagation</p>
                        </div>
                    </div>

                    <div className="space-y-5 relative z-10">
                        <div>
                            <label className="text-xs font-bold text-text-muted block mb-2 uppercase tracking-wide">Data Sync Protocol</label>
                            <select 
                                value={localTerminalConfig.terminalSyncSyncMode}
                                onChange={e => setLocalTerminalConfig({...localTerminalConfig, terminalSyncSyncMode: e.target.value})}
                                className="w-full bg-surface-main border border-border-subtle rounded-xl px-4 py-3 text-sm font-semibold text-text-primary focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/30 outline-none"
                            >
                                <option value="REALTIME_WEBSOCKET">Real-Time (WebSocket Push)</option>
                                <option value="POLLING_LONG">Long Polling (Legacy Fallback)</option>
                                <option value="POLLING_STANDARD">Standard Polling (30s interval)</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="text-xs font-bold text-text-muted block mb-2 uppercase tracking-wide">Terminal Base Layout (Agent Modal)</label>
                            <select 
                                value={localTerminalConfig.terminalViews.agentConsole}
                                onChange={e => setLocalTerminalConfig({...localTerminalConfig, terminalViews: {...localTerminalConfig.terminalViews, agentConsole: e.target.value}})}
                                className="w-full bg-surface-main border border-border-subtle rounded-xl px-4 py-3 text-sm font-semibold text-text-primary focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/30 outline-none"
                            >
                                <option value="SALES_MODERN">Hyper-Focus Modern (Standard)</option>
                                <option value="SPLIT_VIEW">Split Console View (Data Heavy)</option>
                                <option value="MINIMAL_HUD">Minimalist HUD</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-text-muted block mb-2 uppercase tracking-wide">Omni-Channel Routing Strategy</label>
                            <select 
                                value={localTerminalConfig.omniChannelRouting}
                                onChange={e => setLocalTerminalConfig({...localTerminalConfig, omniChannelRouting: e.target.value})}
                                className="w-full bg-surface-main border border-border-subtle rounded-xl px-4 py-3 text-sm font-semibold text-text-primary focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/30 outline-none"
                            >
                                <option value="SKILL_BASED">Skill-Based Routing (AI Matched)</option>
                                <option value="ROUND_ROBIN">Strict Round Robin</option>
                                <option value="LOAD_BALANCED">Load Balanced (Capacity limits)</option>
                            </select>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-surface-main border-border-subtle shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Code size={100} /></div>
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="p-2 bg-[#F59E0B]/10 rounded-xl text-[#FBBF24]"><Workflow size={18} /></div>
                        <div>
                            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Function Triggers & Logic</h3>
                            <p className="text-sm text-text-muted tracking-wide uppercase mt-0.5">Execution & Validations</p>
                        </div>
                    </div>

                    <div className="space-y-4 relative z-10">
                        {[
                            { id: 'apexTriggersEnabled', label: 'Custom Lifecycle Triggers', desc: 'Enable pre/post save pipeline execution.' },
                            { id: 'strictValidationRules', label: 'Strict Validation Rules', desc: 'Enforce database-level schema constraints before sync.' },
                            { id: 'headlessApiAccess', label: 'Headless API Dispatch', desc: 'Allow background jobs to execute functions without UI.' },
                            { id: 'level10Override', label: 'Level 10 Priority Override', desc: 'Super Admins bypass standard lock rules.' },
                        ].map(toggle => (
                            <div key={toggle.id} className="flex items-start justify-between p-4 bg-surface-main/50 border border-border-subtle rounded-xl hover:bg-surface-main transition-colors">
                                <div>
                                    <h4 className="text-sm font-bold text-text-primary">{toggle.label}</h4>
                                    <p className="text-sm font-medium text-text-muted mt-1">{toggle.desc}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={(localTerminalConfig as any)[toggle.id]}
                                        onChange={(e) => setLocalTerminalConfig({...localTerminalConfig, [toggle.id]: e.target.checked})}
                                    />
                                    <div className="w-11 h-6 bg-surface-alt rounded-full peer peer-focus:ring-2 peer-focus:ring-[#3B82F6]/30 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B82F6]"></div>
                                </label>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <div className="mt-6">
                <h3 className="text-sm font-bold text-text-primary mb-4 uppercase tracking-wide flex items-center gap-3">
                    <Database size={16} className="text-[#A855F7]" />
                    <span className="text-text-muted">Object Model:</span> Active Sub-Routines
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { name: 'Lead Assignment', status: 'Active', latency: '42ms', icon: GitCommit },
                        { name: 'Enrichment Trigger', status: 'Active', latency: '120ms', icon: Zap },
                        { name: 'Dedupe Validation', status: 'Strict', latency: '8ms', icon: CheckSquare },
                        { name: 'Oauth Sync (Level 10)', status: 'Hard-Locked', latency: '-', icon: Lock },
                    ].map((routine, i) => (
                        <div key={i} className="p-4 bg-surface-main border border-border-subtle rounded-xl flex flex-col gap-3 shadow-inner group hover:border-border-strong hover:bg-surface-main transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="p-1.5 bg-[#A855F7]/10 rounded-lg text-[#C084FC] group-hover:scale-110 transition-transform"><routine.icon size={14} /></div>
                                <span className={`text-sm font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${routine.status === 'Active' ? 'bg-[#10B981]/10 text-[#34D399]' : routine.status === 'Strict' ? 'bg-[#F59E0B]/10 text-[#FBBF24]' : 'bg-[#EF4444]/10 text-[#F87171]'}`}>{routine.status}</span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-text-primary">{routine.name}</p>
                                <p className="text-sm font-mono text-text-muted mt-1">Avg Execution: <span className="text-[#E4E4E7] font-bold">{routine.latency}</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </motion.div>
    );
};
