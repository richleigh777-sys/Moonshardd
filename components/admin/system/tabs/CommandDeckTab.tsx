import React, { useState, useEffect } from 'react';
import { Building, Globe, ShieldAlert } from 'lucide-react';
import { SectionHeader } from '../SectionHeader';
import { sfx } from '../../../../lib/soundService';
import { useCRM } from '../../../../hooks/useCRM';
import { useSystem } from '../../../../hooks/useSystem';
import { Button } from '../../../ui/Base';
import { ConfigToggle } from '../ConfigToggle';
import { useServerManager } from '../../../../hooks/useServerManager';

interface OrganizationNode {
    id: string;
    name: string;
    region: string;
    status: 'online' | 'degraded' | 'offline' | 'provisioning';
    users: number;
    latency: number;
    type: 'enterprise' | 'independent';
    accessKey?: string;
    ipEndpoint?: string;
}

const INITIAL_ORGS: OrganizationNode[] = [
    { id: 'ORG-ALPHA-01', name: 'Alpha Headquarters (USA)', region: 'us-east', status: 'online', users: 142, latency: 12, type: 'enterprise', ipEndpoint: '192.168.1.10' },
    { id: 'ORG-BETA-EU', name: 'London Sales Floor', region: 'eu-west', status: 'online', users: 84, latency: 45, type: 'enterprise', ipEndpoint: '10.0.4.52' },
    { id: 'ORG-GAMMA-MN', name: 'Manila BPO Outsourced', region: 'ap-south', status: 'degraded', users: 215, latency: 154, type: 'enterprise', ipEndpoint: '172.16.8.199' },
    { id: 'ORG-DELTA-AU', name: 'Sydney Test Branch', region: 'ap-east', status: 'offline', users: 0, latency: 999, type: 'independent', ipEndpoint: '10.1.1.5' },
];

export const CommandDeckTab = () => {
    const { users, systemConfig, updateSystemConfig, updateUser } = useCRM();
    const { setToast } = useSystem();
    const { serverList } = useServerManager();

    const [localOrgs, setLocalOrgs] = useState<OrganizationNode[]>([]);

    const orgs = React.useMemo(() => {
        const merged = [...INITIAL_ORGS];
        serverList.forEach(server => {
            if (!merged.find(m => m.id === server.id)) {
                merged.push({
                    id: server.id,
                    name: server.name,
                    region: server.region,
                    status: server.status === 'active' ? 'online' : server.status as any,
                    users: server.userCount || 0,
                    latency: server.latency || Math.floor(Math.random() * 40) + 10,
                    type: 'enterprise',
                    accessKey: server.accessKey,
                    ipEndpoint: `10.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.1`
                });
            }
        });
        localOrgs.forEach(lo => {
             const idx = merged.findIndex(m => m.id === lo.id);
             if(idx >= 0) { merged[idx] = lo; } 
             else { merged.push(lo); }
        });
        return merged;
    }, [serverList, localOrgs]);

    const [activeNode, setActiveNode] = useState<OrganizationNode>(INITIAL_ORGS[0]);

    useEffect(() => {
        if (!orgs.find(o => o.id === activeNode.id) && orgs.length > 0) {
            setActiveNode(orgs[0]);
        }
    }, [orgs, activeNode]);

    const [level10Settings, setLevel10Settings] = useState({
        encryptionKeys: systemConfig?.level10Config?.encryptionKeys ?? true,
        federationProtocol: systemConfig?.level10Config?.federationProtocol ?? false,
        phantomRouting: systemConfig?.level10Config?.phantomRouting ?? true,
        auditRedaction: systemConfig?.level10Config?.auditRedaction ?? false,
        restrictedAgentColumns: systemConfig?.level10Config?.restrictedAgentColumns ?? ['cardNumber', 'cardExpiry', 'cardCvv'],
    });

    useEffect(() => {
        if (!systemConfig) return;
        const l10 = systemConfig.level10Config;
        const restrictedStr1 = (l10?.restrictedAgentColumns ?? []).join(',');
        const restrictedStr2 = level10Settings.restrictedAgentColumns.join(',');

        if (
            (l10?.encryptionKeys ?? true) !== level10Settings.encryptionKeys ||
            (l10?.federationProtocol ?? false) !== level10Settings.federationProtocol ||
            (l10?.phantomRouting ?? true) !== level10Settings.phantomRouting ||
            (l10?.auditRedaction ?? false) !== level10Settings.auditRedaction ||
            restrictedStr1 !== restrictedStr2
        ) {
            updateSystemConfig({ ...systemConfig, level10Config: level10Settings });
        }
    }, [level10Settings, systemConfig, updateSystemConfig]);

    const handleNodeChange = (node: OrganizationNode) => {
        if (node.status === 'provisioning') return;
        sfx.playClick();
        setActiveNode(node);
    };

    const runAction = (title: string, actionFn: () => void) => {
        sfx.playClick();
        actionFn();
        setToast({ title: 'System Operation', message: `${title} completed successfully`, type: 'success' });
    };

    return (
        <section className="space-y-6">
            <SectionHeader 
                icon={ShieldAlert}
                title="System Administration" 
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Quick Actions */}
                 <div className="bg-surface-main border border-border-subtle rounded-xl p-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-text-primary mb-4">Quick Operations</h3>
                    <div className="space-y-3">
                         <div className="flex justify-between items-center py-2 border-b border-border-subtle">
                             <div className="flex flex-col">
                                 <span className="text-sm font-medium text-text-primary">Purge Stale Sessions</span>
                                 <span className="text-xs text-text-muted">Disconnect inactive users</span>
                             </div>
                             <Button variant="secondary" onClick={() => runAction("Purge Sessions", () => {
                                 const stale = users.filter(u => u.active && Date.now() - (u.lastActive || 0) > 2 * 60 * 60 * 1000);
                                 stale.forEach(u => updateUser(u.id, { active: false, currentStatus: 'offline' }));
                             })}>Execute</Button>
                         </div>
                         <div className="flex justify-between items-center py-2 border-b border-border-subtle">
                             <div className="flex flex-col">
                                 <span className="text-sm font-medium text-text-primary">Global Disconnect</span>
                                 <span className="text-xs text-text-muted">Force disconnect all agents</span>
                             </div>
                             <Button variant="danger" onClick={() => runAction("Global Disconnect", () => {
                                 const activeAgents = users.filter(u => u.active);
                                 activeAgents.forEach(ag => {
                                     if (ag.role !== 'admin') {
                                         updateUser(ag.id, { active: false, currentStatus: 'offline' });
                                     }
                                 });
                             })}>Execute</Button>
                         </div>
                         <div className="flex justify-between items-center py-2">
                             <div className="flex flex-col">
                                 <span className="text-sm font-medium text-text-primary">Maintenance Mode</span>
                                 <span className="text-xs text-text-muted">Toggle system maintenance window</span>
                             </div>
                             <Button variant={systemConfig?.maintenanceMode ? "danger" : "secondary"} onClick={() => runAction("Maintenance Mode", () => {
                                 updateSystemConfig({ maintenanceMode: !systemConfig?.maintenanceMode });
                             })}>
                                 {systemConfig?.maintenanceMode ? 'Disable' : 'Enable'}
                             </Button>
                         </div>
                    </div>
                 </div>

                 {/* Settings Panel */}
                <div className="bg-surface-main border border-border-subtle rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <ShieldAlert size={16} className="text-text-primary" />
                        <h3 className="text-sm font-bold text-text-primary">Core Constraints</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <ConfigToggle 
                            label="Zero-Knowledge Encryption" 
                            description="Require end-to-end encryption for all transfers" 
                            active={level10Settings.encryptionKeys} 
                            onToggle={() => setLevel10Settings(prev => ({ ...prev, encryptionKeys: !prev.encryptionKeys }))} 
                        />
                        <ConfigToggle 
                            label="Phantom Routing" 
                            description="Obfuscate original ingress IPs" 
                            active={level10Settings.phantomRouting} 
                            onToggle={() => setLevel10Settings(prev => ({ ...prev, phantomRouting: !prev.phantomRouting }))} 
                        />
                        <ConfigToggle 
                            label="Cross-Node Federation" 
                            description="Allow nodes to share cache pools" 
                            active={level10Settings.federationProtocol} 
                            onToggle={() => setLevel10Settings(prev => ({ ...prev, federationProtocol: !prev.federationProtocol }))} 
                        />
                        <ConfigToggle 
                            label="Audit Log Redaction" 
                            description="Redact PII from logs automatically" 
                            active={level10Settings.auditRedaction} 
                            onToggle={() => setLevel10Settings(prev => ({ ...prev, auditRedaction: !prev.auditRedaction }))} 
                        />
                    </div>
                </div>
            </div>

            {/* Nodes */}
            <div>
                 <h3 className="text-sm font-semibold text-text-primary mb-4">Organizational Nodes</h3>
                 <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
                     {orgs.map((org) => (
                         <div 
                             key={org.id}
                             onClick={() => handleNodeChange(org)}
                             className={`p-4 rounded-xl border transition-all duration-300 ${org.status !== 'provisioning' ? 'cursor-pointer' : 'opacity-80 pointer-events-none'} group ${
                                 activeNode.id === org.id 
                                 ? 'bg-surface-highlight border-border-strong' 
                                 : 'bg-surface-main border-border-subtle hover:bg-surface-alt hover:border-border-strong'
                             }`}
                         >
                             <div className="flex items-center gap-3 mb-3">
                                 <div className={`p-2 rounded-lg border ${
                                     activeNode.id === org.id 
                                     ? 'bg-accent-primary/20 border-accent-primary/30 text-accent-primary' 
                                     : 'bg-surface-alt border-border-subtle text-text-muted group-hover:text-text-primary'
                                 }`}>
                                     <Building size={18} />
                                 </div>
                                 <div className="min-w-0">
                                     <h4 className={`text-sm font-semibold truncate ${activeNode.id === org.id ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'}`}>
                                         {org.name}
                                     </h4>
                                     <div className="flex items-center gap-1.5 text-xs text-text-muted mt-0.5 whitespace-nowrap">
                                         <Globe size={10} /> {org.region}
                                     </div>
                                 </div>
                             </div>

                             <div className="flex items-center justify-between mt-4 p-2.5 rounded-lg bg-surface-alt border border-border-subtle">
                                 <div className="flex flex-col">
                                     <span className="text-[10px] uppercase font-bold text-text-muted">Status</span>
                                     <div className="flex items-center gap-1.5 mt-0.5">
                                         <span className={`w-2 h-2 rounded-full ${
                                             org.status === 'online' ? 'bg-emerald-500' 
                                             : org.status === 'degraded' ? 'bg-amber-500' 
                                             : org.status === 'provisioning' ? 'bg-blue-500'
                                             : 'bg-slate-400'
                                         }`}></span>
                                         <span className="text-xs font-medium text-text-primary capitalize">
                                             {org.status}
                                         </span>
                                     </div>
                                 </div>

                                 <div className="flex flex-col text-right">
                                     <span className="text-[10px] uppercase font-bold text-text-muted">Latency</span>
                                     <span className="text-xs font-medium text-text-primary mt-0.5">
                                         {org.latency > 0 ? `${org.latency}ms` : '---'}
                                     </span>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
            </div>
        </section>
    );
};
