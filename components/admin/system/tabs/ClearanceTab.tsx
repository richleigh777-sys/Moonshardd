
import React from 'react';
import { Lock, UserCheck, Check, Briefcase, ShieldAlert } from 'lucide-react';
import { SectionHeader } from '../SectionHeader';
import { SystemConfig } from '../../../../types';
import { sfx } from '../../../../lib/soundService';

interface ClearanceTabProps {
    config: SystemConfig;
    onChange: (field: keyof SystemConfig, value: any) => void;
    isSuperAdmin: boolean;
}

const AGENT_TERMINALS = [
    { id: 'dash', label: 'Dashboard' },
    { id: 'comms', label: 'Chat Uplink' },
    { id: 'enrollment', label: 'Order Entry' },
    { id: 'pipeline', label: 'Pipeline' },
    { id: 'recovery', label: 'Care Ops' },
    { id: 'callbacks', label: 'Lead Hub' },
    { id: 'ledger', label: 'Sales Ledger' },
    { id: 'payouts', label: 'Commission' },
    { id: 'standings', label: 'Leaderboard' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'scripts', label: 'Script Hub' },
];

const MANAGER_TERMINALS = [
    { id: 'overview', label: 'Overview' },
    { id: 'enrollment', label: 'Order Entry' },
    { id: 'pipeline', label: 'Pipeline' },
    { id: 'ledger', label: 'Master Ledger' },
    { id: 'payroll', label: 'Payroll Ops' },
    { id: 'retention', label: 'Retention' },
    { id: 'roster', label: 'Roster' },
    { id: 'standings', label: 'Leaderboard' },
    { id: 'intel', label: 'Analytics' },
    { id: 'scripts', label: 'Scripts' },
    { id: 'catalog', label: 'Products' },
    { id: 'system', label: 'Config' },
];

export const ClearanceTab: React.FC<ClearanceTabProps> = ({ config, onChange, isSuperAdmin }) => {
    
    const togglePermission = (role: 'agent' | 'manager', tabId: string) => {
        if (!isSuperAdmin) return;
        sfx.playClick();
        const currentPerms = config.permissions?.[role] || [];
        const newPerms = currentPerms.includes(tabId) 
            ? currentPerms.filter(id => id !== tabId)
            : [...currentPerms, tabId];
        
        const newPermissions = {
            ...(config.permissions || { agent: [], manager: [] }),
            [role]: newPerms
        };
        
        onChange('permissions', newPermissions);
    };

    return (
        <section>
            <SectionHeader icon={Lock} title="Clearance & Access Control" sub="Define Interface Visibility" color="text-status-warning" />
            <div className="space-y-8">
                
                {/* AGENT PERMISSIONS */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-border-subtle">
                        <UserCheck size={16} className="text-text-muted"/>
                        <h5 className="text-xs font-[700]  text-text-primary tracking-widest">Agent Views</h5>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {AGENT_TERMINALS.map(term => (
                            <div key={term.id} onClick={() => togglePermission('agent', term.id)} className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${config.permissions?.agent?.includes(term.id) ? 'bg-surface-main border-accent-primary/30 shadow-sm' : 'bg-surface-alt/40 border-border-subtle opacity-60'}`}>
                                <span className="text-xs font-bold ">{term.label}</span>
                                <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${config.permissions?.agent?.includes(term.id) ? 'bg-accent-primary border-accent-primary' : 'border-text-muted'}`}>
                                    {config.permissions?.agent?.includes(term.id) && <Check size={16} className="text-white"/>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* MANAGER PERMISSIONS */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-border-subtle">
                        <Briefcase size={16} className="text-text-muted"/>
                        <h5 className="text-xs font-[700]  text-text-primary tracking-widest">Manager Views</h5>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {MANAGER_TERMINALS.map(term => (
                            <div key={term.id} onClick={() => togglePermission('manager', term.id)} className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${config.permissions?.manager?.includes(term.id) ? 'bg-surface-main border-indigo-500/30 shadow-sm' : 'bg-surface-alt/40 border-border-subtle opacity-60'}`}>
                                <span className="text-xs font-bold ">{term.label}</span>
                                <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${config.permissions?.manager?.includes(term.id) ? 'bg-indigo-500 border-indigo-500' : 'border-text-muted'}`}>
                                    {config.permissions?.manager?.includes(term.id) && <Check size={16} className="text-white"/>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3">
                    <ShieldAlert size={18} className="text-status-warning shrink-0"/>
                    <div>
                        <p className="text-xs font-bold text-status-warning  tracking-widest mb-1">Security Directive</p>
                        <p className="text-xs text-amber-600/80 leading-relaxed">Changes to Clearance Levels propagate immediately. Active sessions may require a refresh to reflect new interface restrictions.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};
