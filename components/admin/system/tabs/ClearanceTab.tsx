import React from 'react';
import { Lock, UserCheck, Check, Briefcase, ShieldAlert, KeyRound, Ban, ShieldCheck } from 'lucide-react';
import { SectionHeader } from '../SectionHeader';
import { SystemConfig } from '../../../../types';
import { sfx } from '../../../../lib/soundService';
import { useSystem } from '../../../../hooks/useSystem';

interface ClearanceTabProps {
    config: SystemConfig;
    onChange: (field: keyof SystemConfig, value: any) => void;
    isSuperAdmin: boolean;
}

const AGENT_WORKSPACES = [
    { id: 'dash', label: 'Dashboard' },
    { id: 'dialer', label: 'Dialer System' },
    { id: 'comms', label: 'Chat Uplink' },
    { id: 'enrollment', label: 'Order Entry' },
    { id: 'pipeline', label: 'Pipeline' },
    { id: 'recovery', label: 'Care Ops' },
    { id: 'callbacks', label: 'Lead Hub' },
    
    { id: 'rhythm', label: 'Daily Rhythm' },
    { id: 'ledger', label: 'Sales Ledger' },
    { id: 'payouts', label: 'Commission' },
    { id: 'standings', label: 'Leaderboard' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'scripts', label: 'Script Hub' },
];

const MANAGER_WORKSPACES = [
    { id: 'overview', label: 'Overview' },
    { id: 'nexus', label: 'Main Settings' },
    { id: 'enrollment', label: 'Order Entry' },
    { id: 'pipeline', label: 'Pipeline' },
    { id: 'sales_pool', label: 'Sales Pool' },
    { id: 'ledger', label: 'Master Ledger' },
    { id: 'payroll', label: 'Payroll Ops' },
    { id: 'retention', label: 'Retention' },
    { id: 'roster', label: 'Roster' },
    { id: 'standings', label: 'Leaderboard' },
    { id: 'intel', label: 'Analytics' },
    { id: 'comms', label: 'Chat Uplink' },
    { id: 'scripts', label: 'Scripts' },
    { id: 'audit', label: 'Security' },
    { id: 'catalog', label: 'Products' },
    { id: 'system', label: 'Config' },
];

export const ClearanceTab: React.FC<ClearanceTabProps> = ({ config, onChange, isSuperAdmin }) => {
    const { setToast } = useSystem();
    
    const togglePermission = (role: 'agent' | 'manager', tabId: string) => {
        if (!isSuperAdmin) {
            sfx.playError();
            setToast({ title: 'Access Denied', message: 'Clearance modifications require Level 10 Admin authorization.', type: 'error' });
            return;
        }
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

    const setLevelClearance = (e: React.MouseEvent, tabId: string, level: number) => {
        e.stopPropagation();
        if (!isSuperAdmin) {
            sfx.playError();
            setToast({ title: 'Access Denied', message: 'Clearance modifications require Level 10 Admin authorization.', type: 'error' });
            return;
        }
        sfx.playClick();
        
        const newClearances = {
            ...(config.adminLevelClearances || {})
        };
        newClearances[tabId] = level;
        
        onChange('adminLevelClearances', newClearances);
    };

    const toggleRbac = (role: string, action: keyof import('../../../../types').PermissionSet) => {
        if (!isSuperAdmin) {
            sfx.playError();
            setToast({ title: 'Access Denied', message: 'Clearance modifications require Level 10 Admin authorization.', type: 'error' });
            return;
        }
        sfx.playClick();
        
        const currentMatrix = config.rbacMatrix || { 
            admin: { viewLeads: true, editLeads: true, deleteLeads: true, exportLeads: true, processSales: true, viewReports: true },
            agent: { viewLeads: true, editLeads: true, deleteLeads: false, exportLeads: false, processSales: true, viewReports: false }
        };
        
        const rolePerms = currentMatrix[role] || {};
        
        const newMatrix = {
            ...currentMatrix,
            [role]: {
                ...rolePerms,
                [action]: !rolePerms[action]
            }
        };
        
        onChange('rbacMatrix', newMatrix);
    };

    const RBAC_ACTIONS: { id: keyof import('../../../../types').PermissionSet; label: string }[] = [
        { id: 'viewLeads', label: 'View Leads' },
        { id: 'editLeads', label: 'Edit Leads' },
        { id: 'deleteLeads', label: 'Delete Leads' },
        { id: 'exportLeads', label: 'Export Leads' },
        { id: 'processSales', label: 'Process Sales' },
        { id: 'viewReports', label: 'View Reports' },
    ];

    return (
        <section className="space-y-6">
            <SectionHeader 
                icon={Lock} 
                title="Clearance & Access Control" 
                sub="Interface Visibility Policies & Identity Safeguards" 
                color="text-status-warning" 
            />

            <p className="text-sm text-text-muted leading-relaxed">
                Configure role clearances to limit interface cognitive surface area. Each checked module grants permission for that specific operative tear. In alignment with System Security rules, external authentication schemes are permanently hard-locked.
            </p>

            {/* IDENTITY POLICY MONITOR (AGENTS.md Compliance) */}
            <div className="p-4 bg-surface-main border border-border-subtle rounded-xl space-y-4 shadow-sm">
                <div className="flex items-center gap-2 pb-2 border-b border-border-subtle/50">
                    <KeyRound size={16} className="text-accent-primary" />
                    <h4 className="text-sm font-bold uppercase text-text-primary tracking-wider font-mono">Administrative Identity & Credential Decisional Policy</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Exclusions */}
                    <div className="p-4 bg-surface-alt/40 border border-border-subtle rounded-xl flex items-start gap-3">
                        <Ban size={18} className="text-status-error shrink-0 mt-0.5" />
                        <div>
                            <span className="text-sm font-bold text-text-primary block">External Auth Blockade (Active)</span>
                            <span className="text-sm text-text-muted mt-1 block leading-normal">
                                Standard OAuth flows (Google & Microsoft) are strictly disabled to guard client data vectors. Operatives are provisioned solely by Level 10 Admins.
                            </span>
                            <div className="flex flex-wrap gap-2 mt-2 font-mono text-sm uppercase font-bold">
                                <span className="bg-status-error/10 text-status-error px-2 py-0.5 rounded border border-status-error/20 inline-block">Google Sign-In: BLOCKED</span>
                                <span className="bg-status-error/10 text-status-error px-2 py-0.5 rounded border border-status-error/20 inline-block">Microsoft Auth: BLOCKED</span>
                            </div>
                        </div>
                    </div>

                    {/* Inclusions */}
                    <div className="p-4 bg-surface-alt/40 border border-border-subtle rounded-xl flex items-start gap-3">
                        <ShieldCheck size={18} className="text-status-success shrink-0 mt-0.5" />
                        <div>
                            <span className="text-sm font-bold text-text-primary block">Level 10 Admin Custody Chain (Active)</span>
                            <span className="text-sm text-text-muted mt-1 block leading-normal">
                                Self-registration portals are closed. Credentials are generated internally via systemic ledger records for total perimeter shielding.
                            </span>
                            <div className="flex flex-wrap gap-2 mt-2 font-mono text-sm uppercase font-bold">
                                <span className="bg-status-success/10 text-status-success px-2 py-0.5 rounded border border-status-success/20 inline-block">Internal Provision: MANDATORY</span>
                                <span className="bg-status-success/10 text-status-success px-2 py-0.5 rounded border border-status-success/20 inline-block">MFA Tokenizer: ACTIVE</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* AGENT PERMISSIONS */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border-subtle">
                    <UserCheck size={16} className="text-accent-primary"/>
                    <h5 className="text-sm font-bold uppercase tracking-wider text-text-primary font-mono">Agent Cleared Views</h5>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {AGENT_WORKSPACES.map(term => {
                        const isChecked = config.permissions?.agent?.includes(term.id);
                        return (
                            <div 
                                key={term.id} 
                                onClick={() => togglePermission('agent', term.id)} 
                                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${
                                    isChecked 
                                    ? 'bg-surface-main border-accent-primary/50 shadow-md scale-[1.02]' 
                                    : 'bg-surface-alt/40 border-border-subtle opacity-60 hover:opacity-100 hover:border-border-strong'
                                }`}
                            >
                                <span className="text-sm font-extrabold text-text-primary">{term.label}</span>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                    isChecked 
                                    ? 'bg-accent-primary border-accent-primary scale-110 shadow-sm' 
                                    : 'border-border-strong bg-surface-main'
                                }`}>
                                    {isChecked && <Check size={10} className="text-white font-bold stroke-[3px]" />}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* MANAGER PERMISSIONS */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border-subtle">
                    <Briefcase size={16} className="text-accent-secondary"/>
                    <h5 className="text-sm font-bold uppercase tracking-wider text-text-primary font-mono">Manager Cleared Views</h5>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {MANAGER_WORKSPACES.map(term => {
                        const isChecked = config.permissions?.manager?.includes(term.id);
                        const requiredLevel = config.adminLevelClearances?.[term.id] || 1;
                        return (
                            <div 
                                key={term.id} 
                                onClick={() => togglePermission('manager', term.id)} 
                                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between group ${
                                    isChecked 
                                    ? 'bg-surface-main border-accent-secondary/50 shadow-md scale-[1.02]' 
                                    : 'bg-surface-alt/40 border-border-subtle opacity-60 hover:opacity-100 hover:border-border-strong'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-extrabold text-text-primary">{term.label}</span>
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                        isChecked 
                                        ? 'bg-accent-secondary border-accent-secondary scale-110 shadow-sm' 
                                        : 'border-border-strong bg-surface-main'
                                    }`}>
                                        {isChecked && <Check size={10} className="text-white font-bold stroke-[3px]" />}
                                    </div>
                                </div>
                                {isChecked && (
                                    <div className="flex items-center gap-2 mt-auto pt-2 border-t border-border-subtle/50" onClick={e => e.stopPropagation()}>
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Min Level</span>
                                        <select 
                                            value={requiredLevel} 
                                            onChange={(e) => setLevelClearance(e as any, term.id, parseInt(e.target.value))}
                                            className="bg-surface-alt border border-border-subtle rounded text-xs px-1 py-0.5 font-bold text-text-primary focus:outline-none focus:border-accent-secondary"
                                        >
                                            {[1,2,3,4,5,6,7,8,9,10].map(lvl => (
                                                <option key={lvl} value={lvl}>L{lvl}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {/* FUNCTIONAL RBAC MATRIX */}
            <div className="space-y-4 pt-6 border-t border-border-subtle">
                <div className="flex items-center gap-2 pb-2 border-b border-border-subtle">
                    <ShieldAlert size={16} className="text-status-warning"/>
                    <h5 className="text-sm font-bold uppercase tracking-wider text-text-primary font-mono">Functional Actions (RBAC Matrix)</h5>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-border-subtle text-text-muted font-bold tracking-wide uppercase">
                                <th className="py-3 px-4">Action</th>
                                <th className="py-3 px-4 text-center">Agent Rank</th>
                                <th className="py-3 px-4 text-center">Admin Rank</th>
                            </tr>
                        </thead>
                        <tbody>
                            {RBAC_ACTIONS.map(action => {
                                const agentChecked = config.rbacMatrix?.agent?.[action.id] ?? (['viewLeads', 'editLeads', 'processSales'].includes(action.id));
                                const adminChecked = config.rbacMatrix?.admin?.[action.id] ?? true;
                                
                                return (
                                    <tr key={action.id} className="border-b border-border-subtle/50 hover:bg-surface-alt/20 transition-colors">
                                        <td className="py-3 px-4 font-bold text-text-primary">{action.label}</td>
                                        
                                        <td className="py-3 px-4">
                                            <button 
                                                onClick={() => toggleRbac('agent', action.id)}
                                                className={`w-full py-1.5 rounded-lg border font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                                                    agentChecked 
                                                    ? 'bg-status-success/10 border-status-success/30 text-status-success hover:bg-status-success/20' 
                                                    : 'bg-surface-alt border-border-subtle text-text-muted hover:border-text-muted'
                                                }`}
                                            >
                                                {agentChecked ? <Check size={14} /> : <Ban size={14} />}
                                                {agentChecked ? 'GRANTED' : 'DENIED'}
                                            </button>
                                        </td>
                                        
                                        <td className="py-3 px-4">
                                            <button 
                                                onClick={() => toggleRbac('admin', action.id)}
                                                className={`w-full py-1.5 rounded-lg border font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                                                    adminChecked 
                                                    ? 'bg-status-success/10 border-status-success/30 text-status-success hover:bg-status-success/20' 
                                                    : 'bg-surface-alt border-border-subtle text-text-muted hover:border-text-muted'
                                                }`}
                                            >
                                                {adminChecked ? <Check size={14} /> : <Ban size={14} />}
                                                {adminChecked ? 'GRANTED' : 'DENIED'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3">
                <ShieldAlert size={18} className="text-status-warning shrink-0 mt-0.5"/>
                <div>
                    <h6 className="text-sm font-bold uppercase font-mono text-status-warning tracking-wider mb-1">Clearance Propagation Advisory</h6>
                    <p className="text-sm text-amber-600/90 leading-relaxed font-bold">
                        Adjustments to routing clearances cascade across active tunnels in &lt;50ms. Currently active agents do not need to restart their browsers; modifications stream via WebSockets in live cycles.
                    </p>
                </div>
            </div>
        </section>
    );
};
