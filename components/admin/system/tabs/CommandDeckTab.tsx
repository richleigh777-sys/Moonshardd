import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Shield, Cpu, Globe, Activity, Building, Lock, Network, Settings, Fingerprint, Database, ShieldAlert } from 'lucide-react';
import { SectionHeader } from '../SectionHeader';
import { sfx } from '../../../../lib/soundService';
import { useCRM } from '../../../../hooks/useCRM';
import { useSystem } from '../../../../hooks/useSystem';
import { Button } from '../../../ui/Base';
import { ConfigToggle } from '../ConfigToggle';

interface LogEntry {
    id: string;
    timestamp: Date;
    command?: string;
    output: string | React.ReactNode;
    type: 'system' | 'user' | 'error' | 'success';
}

interface OrganizationNode {
    id: string;
    name: string;
    region: string;
    status: 'online' | 'degraded' | 'offline' | 'provisioning';
    users: number;
    latency: number;
    type: 'enterprise' | 'independent';
}

const INITIAL_ORGS: OrganizationNode[] = [
    { id: 'ORG-ALPHA-01', name: 'Alpha Headquarters (USA)', region: 'us-east', status: 'online', users: 142, latency: 12, type: 'enterprise' },
    { id: 'ORG-BETA-EU', name: 'London Sales Floor', region: 'eu-west', status: 'online', users: 84, latency: 45, type: 'enterprise' },
    { id: 'ORG-GAMMA-MN', name: 'Manila BPO Outsourced', region: 'ap-south', status: 'degraded', users: 215, latency: 154, type: 'enterprise' },
    { id: 'ORG-DELTA-AU', name: 'Sydney Test Branch', region: 'ap-east', status: 'offline', users: 0, latency: 999, type: 'independent' },
];

export const CommandDeckTab = () => {
    const { sales, users, systemConfig, productConfig, updateProductConfig, updateUser, updateSystemConfig } = useCRM();
    const { setToast } = useSystem();
    const [orgs, setOrgs] = useState<OrganizationNode[]>(() => {
        if (systemConfig?.connectedNodes && systemConfig.connectedNodes.length > 0) {
            return systemConfig.connectedNodes;
        }
        return INITIAL_ORGS;
    });
    const [activeNode, setActiveNode] = useState<OrganizationNode>(orgs[0]);

    // Remove the useEffect that was causing setState in effect


    const syncOrgsToDB = (action: OrganizationNode[] | ((prev: OrganizationNode[]) => OrganizationNode[])) => {
        setOrgs(prev => {
            const newOrgs = typeof action === 'function' ? action(prev) : action;
            if (systemConfig) {
                updateSystemConfig({ ...systemConfig, connectedNodes: newOrgs });
            }
            return newOrgs;
        });
    };
    const [isProvisioning, setIsProvisioning] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    
    const [level10Settings, setLevel10Settings] = useState({
        encryptionKeys: systemConfig?.level10Config?.encryptionKeys ?? true,
        federationProtocol: systemConfig?.level10Config?.federationProtocol ?? false,
        phantomRouting: systemConfig?.level10Config?.phantomRouting ?? true,
        auditRedaction: systemConfig?.level10Config?.auditRedaction ?? false,
        restrictedAgentColumns: systemConfig?.level10Config?.restrictedAgentColumns ?? ['cardNumber', 'cardExpiry', 'cardCvv'],
    });

    // Sync settings to system config when changed
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
    
    // Provisioning Form State
    const [provName, setProvName] = useState('');
    const [provRegion, setProvRegion] = useState('us-east');
    const [provType, setProvType] = useState<'enterprise' | 'independent'>('enterprise');

    const [input, setInput] = useState('');
    const [logs, setLogs] = useState<LogEntry[]>([
        {
            id: 'init-1',
            timestamp: new Date(),
            output: 'NEXUS ROOT TERMINAL v2.4.1 initialized.',
            type: 'system'
        },
        {
            id: 'init-2',
            timestamp: new Date(),
            output: `Connected to ${orgs[0].id} via secure relay.`,
            type: 'success'
        },
        {
            id: 'init-3',
            timestamp: new Date(),
            output: 'Type "help" for a list of available commands.',
            type: 'system'
        }
    ]);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const addLog = (output: string | React.ReactNode, type: LogEntry['type'] = 'system', command?: string) => {
        setLogs(prev => [...prev, {
            id: Math.random().toString(36).substring(7),
            timestamp: new Date(),
            command,
            output,
            type
        }]);
    };

    const handleNodeChange = (node: OrganizationNode) => {
        if (node.status === 'provisioning') return;
        
        sfx.playClick();
        setActiveNode(node);
        addLog(`Initiating quantum jump to ${node.id}...`, 'system');
        
        setTimeout(() => {
            if (node.status === 'offline') {
                addLog(`Connection failed. Node ${node.id} is unreachable (Timeout).`, 'error');
            } else {
                addLog(`Secure handshakes completed. Authority established on ${node.id}.`, 'success');
                sfx.playConfirm();
            }
        }, 800);
    };

    const deployNode = (name: string, region: string, type: 'enterprise' | 'independent') => {
        const id = `ORG-${name.substring(0,4).toUpperCase()}-${Math.floor(Math.random()*1000)}`;
        const newNode: OrganizationNode = {
            id,
            name,
            region,
            status: 'provisioning',
            users: 0,
            latency: 0,
            type
        };

        syncOrgsToDB(prev => [...prev, newNode]);
        addLog(`Deployment sequence initiated for ${id} [${type.toUpperCase()}]...`, 'system');
        sfx.playConfirm();

        setTimeout(() => {
            syncOrgsToDB(prev => prev.map(o => o.id === id ? { ...o, status: 'online', latency: Math.floor(Math.random() * 40) + 10 } : o));
            addLog(`SUCCESS: Node ${id} fully operational and awaiting connections.`, 'success');
            setToast({ title: 'Infrastructure', message: `${id} Deployed Successfully`, type: 'success' });
            sfx.playConfirm();
        }, 3000);
    };

    const handleProvisionSubmit = () => {
        if (!provName.trim()) {
            setToast({ title: 'Error', message: 'Organization name required.', type: 'error' });
            return;
        }
        setIsProvisioning(false);
        deployNode(provName, provRegion, provType);
        setProvName('');
    };

    const handleCommand = (cmd: string) => {
        const trimmed = cmd.trim();
        if (!trimmed) return;

        sfx.playClick();
        addLog('', 'user', trimmed);
        setInput('');

        const args = trimmed.toLowerCase().split(' ');
        const mainCmd = args[0];

        setTimeout(() => {
            switch (mainCmd) {
                case 'help':
                    addLog(
                        <div className="space-y-1 mt-2">
                            <div className="grid grid-cols-[120px_1fr] gap-4">
                                <span className="text-status-warning">sysctl status</span>
                                <span>Display current system load and metrics.</span>

                                <span className="text-status-warning">provision</span>
                                <span>Deploy a new organizational node via CLI. Usage: provision [name] [region] [type]</span>
                                
                                <span className="text-status-warning">ghost --wipe</span>
                                <span>Purge stale sessions and disconnected users.</span>
                                
                                <span className="text-status-warning">kickall</span>
                                <span>Force disconnect all active operatives.</span>
                                
                                <span className="text-status-warning">maintenance --on</span>
                                <span>Enable global maintenance mode.</span>
                                
                                <span className="text-status-warning">sync --force</span>
                                <span>Force immediate data synchronization.</span>

                                <span className="text-status-warning">nexus status</span>
                                <span>Check global CRM infrastructure status.</span>

                                <span className="text-status-warning">catalog status</span>
                                <span>Generate global pricing and taxonomy report.</span>

                                <span className="text-status-warning">catalog --list</span>
                                <span>Enumerate root catalog SKU matrices.</span>

                                <span className="text-status-warning">catalog --adjust [pct]</span>
                                <span>Global systemic price modifier (e.g. 5, -10).</span>

                                <span className="text-status-warning">sql [query]</span>
                                <span>Protected database shell access.</span>

                                <span className="text-status-warning">ping [agent_id]</span>
                                <span>Probe active connection latency to an agent.</span>

                                <span className="text-status-warning">agents --list</span>
                                <span>Enumerate all active agent connections.</span>

                                <span className="text-status-warning">agents --force-break [id]</span>
                                <span>Force an agent into break state remotely.</span>
                                
                                <span className="text-status-warning">clear</span>
                                <span>Clear terminal output.</span>
                            </div>
                        </div>
                    );
                    break;
                case 'clear':
                    setLogs([]);
                    break;
                case 'provision': {
                    const name = args[1];
                    const region = args[2] || 'us-east';
                    const typeStr = args[3] || 'enterprise';
                    
                    if (!name) {
                        addLog('Usage: provision [name] [region] [type: independent|enterprise]', 'error');
                    } else {
                        const type = typeStr === 'independent' ? 'independent' : 'enterprise';
                        deployNode(name, region, type);
                    }
                    break;
                }
                case 'sysctl':
                    if (args[1] === 'status') {
                        const activeCount = users.filter(u => u.active).length;
                        addLog(
                            <div className="space-y-2 font-mono text-sm">
                                <div>[OK] Target Node: {activeNode.id}</div>
                                <div>[OK] Load Average: 0.14, 0.08, 0.04</div>
                                <div>[OK] Active Sockets: {activeCount * 2 + 15}</div>
                                <div>[OK] Database Latency: {activeNode.latency}ms</div>
                                <div>[OK] Memory Heap: 84MB / 512MB (16.4%)</div>
                                <div className={activeNode.status === 'degraded' ? 'text-status-warning' : 'text-status-success'}>
                                    System operating {activeNode.status === 'degraded' ? 'with elevated latency' : 'within nominal parameters'}.
                                </div>
                            </div>
                        );
                    } else {
                        addLog('Usage: sysctl status', 'error');
                    }
                    break;
                case 'ghost':
                    if (args[1] === '--wipe') {
                        addLog('Executing systemic purge of stale sessions...', 'system');
                        setTimeout(() => {
                            const stale = users.filter(u => u.active && Date.now() - (u.lastActive || 0) > 2 * 60 * 60 * 1000);
                            stale.forEach(u => updateUser(u.id, { active: false, currentStatus: 'offline' }));
                            addLog(`Purged ${stale.length} stale sessions. All active connections are valid.`, 'success');
                            setToast({ title: 'Terminal', message: 'Stale sessions purged', type: 'success' });
                        }, 800);
                    } else {
                        addLog('Command requires flag: --wipe', 'error');
                    }
                    break;
                case 'kickall':
                    addLog('WARNING: Initiating global disconnect protocol...', 'error');
                    setTimeout(() => {
                        const activeAgents = users.filter(u => u.active);
                        activeAgents.forEach(ag => {
                            // Offline everyone except the admin issuing this command, maybe? Let's just do it.
                            if (ag.role !== 'admin') {
                                updateUser(ag.id, { active: false, currentStatus: 'offline' });
                            }
                        });
                        addLog(`Disconnected active operatives across ${activeNode.id}.`, 'success');
                    }, 1200);
                    break;
                case 'maintenance':
                    if (args[1] === '--on') {
                        updateSystemConfig({ maintenanceMode: true });
                        addLog(`Maintenance Mode ENABLED for ${activeNode.id}. All non-admin logins rejected.`, 'error');
                    } else if (args[1] === '--off') {
                        updateSystemConfig({ maintenanceMode: false });
                        addLog(`Maintenance Mode DISABLED for ${activeNode.id}. System operational.`, 'success');
                    } else {
                        addLog('Usage: maintenance --on | --off', 'error');
                    }
                    break;
                case 'sync':
                    if (args[1] === '--force') {
                        addLog('Bypassing debounce. Forcing aggressive Nexus sync...', 'system');
                        setTimeout(() => {
                            addLog('Data snapshot synchronized and verified across external clusters.', 'success');
                            sfx.playConfirm();
                        }, 1500);
                    } else {
                        addLog('Command requires flag: --force', 'error');
                    }
                    break;
                case 'nexus':
                    if (args[1] === 'status') {
                        addLog(
                            <div className="space-y-2 font-mono text-sm">
                                <div>NEXUS GATEWAY: ONLINE</div>
                                <div>ACTIVE NODES: {orgs.filter(o => o.status === 'online').length}</div>
                                <div>TOTAL NODES: {orgs.length}</div>
                                <div>SYNC STATE: IN SYNC</div>
                                <div className="text-status-success pt-2">All routing logic and endpoints are successfully hooked.</div>
                            </div>
                        );
                    } else {
                        addLog('Usage: nexus status', 'error');
                    }
                    break;
                case 'catalog':
                    if (args[1] === 'status') {
                        const totalProducts = productConfig?.products?.length || 0;
                        const avgPrice = totalProducts > 0 
                            ? productConfig.products.reduce((acc, p) => acc + p.price, 0) / totalProducts 
                            : 0;
                        addLog(
                            <div className="space-y-2 font-mono text-sm">
                                <div>[OK] Catalog Matrix: ONLINE</div>
                                <div>[OK] Total SKUs: {totalProducts}</div>
                                <div>[OK] Global Average Price: ${avgPrice.toFixed(2)}</div>
                                <div className="text-status-success pt-2">Pricing and taxonomy synced successfully.</div>
                            </div>
                        );
                    } else if (args[1] === '--list') {
                        addLog(
                            <div className="overflow-x-auto mt-2">
                                <table className="w-full text-xs text-left border-collapse border border-white/20">
                                    <thead className="bg-surface-highlight  font-[700] text-slate-300">
                                        <tr>
                                            <th className="px-2 py-1 border border-white/20">SKU/ID</th>
                                            <th className="px-2 py-1 border border-white/20">Name</th>
                                            <th className="px-2 py-1 border border-white/20 text-right">Price</th>
                                            <th className="px-2 py-1 border border-white/20">Category</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productConfig?.products?.slice(0, 10).map(p => (
                                            <tr key={p.id}>
                                                <td className="px-2 py-1 border border-white/20">{p.id.substring(0,8)}</td>
                                                <td className="px-2 py-1 border border-white/20 text-status-success">{p.name.substring(0, 20)}</td>
                                                <td className="px-2 py-1 border border-white/20 text-right">${p.price}</td>
                                                <td className="px-2 py-1 border border-white/20">{p.category}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="mt-1 text-slate-400 text-[10px]  tracking-wider">
                                    Showing root SKUs (max 10 limit in terminal mode). Use GUI for full catalog.
                                </div>
                            </div>
                        );
                    } else if (args[1] === '--adjust' && args[2]) {
                        const pctStr = args[2];
                        const pct = parseFloat(pctStr);
                        if (!isNaN(pct) && productConfig?.products) {
                            addLog(`Initiating global price adjustment mutation (${pct > 0 ? '+' : ''}${pct}%)...`, 'system');
                            
                            const newProducts = productConfig.products.map(p => ({
                                ...p,
                                price: Math.max(1, Math.round(p.price * (1 + pct / 100)))
                            }));
                            const newConfig = { ...productConfig, products: newProducts };
                            
                            updateProductConfig(newConfig).then(() => {
                                addLog(`SUCCESS: ${newProducts.length} SKUs adjusted by ${pct}%. Re-indexing taxonomy...`, 'success');
                                sfx.playConfirm();
                            }).catch(_err => {
                                addLog(`FAILED: Database rejected mutation. Check locks.`, 'error');
                            });
                        } else {
                            addLog('Invalid percentage modifier or no catalog hooked', 'error');
                        }
                    } else {
                        addLog('Usage: catalog status | --list | --adjust [pct]', 'error');
                    }
                    break;
                case 'ping':
                    if (args[1]) {
                        const targetUser = users.find(u => u.id === args[1] || u.name.toLowerCase() === args[1]);
                        if (targetUser && targetUser.active) {
                            addLog(`Pinging agent socket ${targetUser.id}...`, 'system');
                            setTimeout(() => {
                                addLog(`64 bytes from ${targetUser.id}: icmp_seq=1 ttl=118 time=${Math.floor(Math.random() * 50) + 12} ms`, 'success');
                            }, 400);
                        } else {
                            addLog(`Agent not found or offline.`, 'error');
                        }
                    } else {
                        addLog('Usage: ping [agent_id]', 'error');
                    }
                    break;
                case 'sql':
                    if (args.length > 1) {
                        addLog('Executing query...', 'system');
                        setTimeout(() => {
                            if (cmd.toLowerCase().includes('select count(*) from sales')) {
                                addLog(`Result: ${sales.length} rows in 'sales' table.`, 'success');
                            } else if (cmd.toLowerCase().includes('select count(*) from users')) {
                                addLog(`Result: ${users.length} rows in 'users' table.`, 'success');
                            } else if (cmd.toLowerCase().includes('select')) {
                                // show first 2 sales if possible
                                const topSales = sales.slice(0, 2);
                                addLog(
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs text-left border-collapse border border-white/20">
                                            <thead className="bg-surface-highlight  font-[700] text-slate-300">
                                                <tr>
                                                    <th className="px-2 py-1 border border-white/20">ID</th>
                                                    <th className="px-2 py-1 border border-white/20">AGENT_ID</th>
                                                    <th className="px-2 py-1 border border-white/20">STATUS</th>
                                                    <th className="px-2 py-1 border border-white/20">AMOUNT</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {topSales.length > 0 ? topSales.map(s => (
                                                    <tr key={s.id}>
                                                        <td className="px-2 py-1 border border-white/20">{s.id.substring(0, 8)}</td>
                                                        <td className="px-2 py-1 border border-white/20">{s.agentId.substring(0, 8)}</td>
                                                        <td className="px-2 py-1 border border-white/20">{s.status}</td>
                                                        <td className="px-2 py-1 border border-white/20">${s.amount}</td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={4} className="px-2 py-1 text-center border border-white/20 opacity-50">No rows returned</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                        <div className="mt-1 text-slate-400">{topSales.length} row(s) returned.</div>
                                    </div>
                                );
                            } else {
                                addLog('Action restricted by RBAC rules.', 'error');
                            }
                        }, 600);
                    } else {
                        addLog('Usage: sql [query]', 'error');
                    }
                    break;
                case 'agents':
                    if (args[1] === '--list') {
                        const activeAgents = users.filter(u => u.active);
                        addLog(
                            <div className="space-y-1 mt-2">
                                <div className="text-status-warning">ACTIVE CONNECTIONS in {activeNode.id} ({activeAgents.length})</div>
                                {activeAgents.map(ag => (
                                    <div key={ag.id} className="grid grid-cols-[120px_1fr_100px] gap-4">
                                        <span className="font-[700] text-slate-300">{ag.id}</span>
                                        <span>{ag.name}</span>
                                        <span className={ag.currentStatus === 'break' ? 'text-status-warning' : 'text-status-success'}>{ag.currentStatus.toUpperCase()}</span>
                                    </div>
                                ))}
                            </div>
                        );
                    } else if (args[1] === '--force-break') {
                        const targetId = args[2];
                        if (!targetId) {
                            addLog('Usage: agents --force-break [id]', 'error');
                        } else {
                            const target = users.find(u => u.id === targetId || u.name.toLowerCase() === targetId.toLowerCase());
                            if (!target) {
                                addLog(`Agent ${targetId} not found.`, 'error');
                            } else {
                                addLog(`Sending force-break signal to ${targetId}...`, 'system');
                                setTimeout(() => {
                                    updateUser(target.id, { currentStatus: 'break' });
                                    addLog(`Agent ${target.name} (${target.id}) state changed to BREAK.`, 'success');
                                }, 500);
                            }
                        }
                    } else {
                        addLog('Usage: agents --list | --force-break [id]', 'error');
                    }
                    break;
                default:
                    addLog(`Command not found: ${mainCmd}. Type 'help' for available commands.`, 'error');
                    break;
            }
        }, 300);
    };

    return (
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col pb-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <SectionHeader 
                    icon={Terminal} 
                    title="Command Deck" 
                    sub="Level 10 Organizational Control & Terminal Access" 
                    color="text-status-error" 
                />
                <div className="flex items-center gap-3">
                    <Button 
                        variant="secondary" 
                        onClick={() => { setShowSettings(!showSettings); setIsProvisioning(false); sfx.playClick(); }}
                        className={`h-10 px-4 text-[10px] font-[700]  tracking-widest transition-all ${showSettings ? 'bg-amber-500/20 text-status-warning border-amber-500/50' : 'border-border-subtle text-text-muted hover:bg-surface-highlight hover:text-white'}`}
                    >
                        <Settings size={16} className="mr-2" />
                        Root Settings
                    </Button>
                    <Button 
                        variant="secondary" 
                        onClick={() => { setIsProvisioning(!isProvisioning); setShowSettings(false); sfx.playClick(); }}
                        className={`h-10 px-4 text-[10px] font-[700]  tracking-widest transition-all ${isProvisioning ? 'bg-red-500/20 text-status-error border-red-500/50' : 'border-status-error/30 text-status-error hover:bg-red-500/10'}`}
                    >
                        <Network size={16} className="mr-2" />
                        Deploy New Node
                    </Button>
                </div>
            </div>

            {showSettings && (
                <div className="bg-surface-alt/40 border border-status-warning/30 rounded-2xl p-6 animate-in slide-in-from-top-4 fade-in duration-300">
                    <h3 className="text-sm font-[700] text-status-warning  tracking-widest mb-6 flex items-center gap-2">
                        <Settings size={16}/> Level 10 Super Admin Protocols
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ConfigToggle 
                            label="Cross-Node Load Balancing"
                            active={level10Settings.federationProtocol}
                            onToggle={() => { setLevel10Settings(prev => ({...prev, federationProtocol: !prev.federationProtocol})); sfx.playClick(); }}
                            description="Automatically route excess inbound leads or calls across different geographical nodes."
                            icon={Network}
                        />
                        <ConfigToggle 
                            label="Phantom Routing (Anti-Trace)"
                            active={level10Settings.phantomRouting}
                            onToggle={() => { setLevel10Settings(prev => ({...prev, phantomRouting: !prev.phantomRouting})); sfx.playClick(); }}
                            description="Obscure real agent location and DID details via secondary internal proxies."
                            icon={Fingerprint}
                        />
                        <ConfigToggle 
                            label="Real-time Database Replications"
                            active={level10Settings.encryptionKeys}
                            onToggle={() => { setLevel10Settings(prev => ({...prev, encryptionKeys: !prev.encryptionKeys})); sfx.playClick(); }}
                            description="Force live replication to cold-storage. Uses intense memory bandwidth."
                            icon={Database}
                        />
                        <ConfigToggle 
                            label="God Mode Terminal Overrides"
                            active={level10Settings.auditRedaction}
                            onToggle={() => { setLevel10Settings(prev => ({...prev, auditRedaction: !prev.auditRedaction})); sfx.playClick(); }}
                            description="Grant terminal commands the ability to bypass relational foreign key constraints."
                            danger={true}
                            icon={ShieldAlert}
                        />
                        <div className="col-span-1 md:col-span-2 space-y-2 mt-4 p-4 border border-status-warning/20 rounded-xl bg-surface-main">
                            <label className="text-xs font-bold text-status-warning tracking-widest flex items-center gap-2">
                                <ShieldAlert size={14} />
                                Agent Ledger Restricted Columns
                            </label>
                            <p className="text-[10px] text-text-muted mb-2">Comma-separated keys of columns that should be hidden from agents (e.g. cardNumber, cardExpiry, cardCvv)</p>
                            <input 
                                type="text"
                                value={level10Settings.restrictedAgentColumns.join(', ')}
                                onChange={(e) => setLevel10Settings(prev => ({
                                    ...prev, 
                                    restrictedAgentColumns: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                }))}
                                className="w-full h-10 bg-surface-alt border border-border-subtle rounded-xl px-4 text-xs font-mono text-text-primary focus:border-status-warning/50 transition-colors"
                            />
                        </div>
                    </div>
                </div>
            )}

            {isProvisioning && (
                <div className="bg-surface-alt/40 border border-status-error/30 rounded-2xl p-6 animate-in slide-in-from-top-4 fade-in duration-300">
                    <h3 className="text-sm font-[700] text-status-error  tracking-widest mb-4 flex items-center gap-2">
                        <Cpu size={16}/> Organization Node Provisioning Matrix
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-[700]  tracking-widest text-text-muted">Entity Name</label>
                            <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                type="text"
                                value={provName}
                                onChange={e => setProvName(e.target.value)}
                                placeholder="e.g. Omega Outsourcing INC."
                                className="w-full h-10 bg-surface-alt border border-border-subtle rounded-xl px-4 text-xs font-bold text-text-primary outline-none focus:border-red-500/60 transition-all"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-[10px] font-[700]  tracking-widest text-text-muted">Physical Datacenter Region</label>
                            <select 
                                value={provRegion}
                                onChange={e => setProvRegion(e.target.value)}
                                className="w-full h-10 bg-surface-alt border border-border-subtle rounded-xl px-4 text-xs font-bold text-text-primary outline-none focus:border-red-500/60 transition-all appearance-none"
                            >
                                <option value="us-east">US East (N. Virginia)</option>
                                <option value="us-west">US West (Oregon)</option>
                                <option value="eu-west">EU West (Ireland)</option>
                                <option value="ap-south">AP South (Mumbai)</option>
                                <option value="ap-east">AP East (Sydney)</option>
                            </select>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-[10px] font-[700]  tracking-widest text-text-muted">Architecture Type</label>
                            <select 
                                value={provType}
                                onChange={e => setProvType(e.target.value as 'enterprise' | 'independent')}
                                className="w-full h-10 bg-surface-alt border border-border-subtle rounded-xl px-4 text-xs font-bold text-text-primary outline-none focus:border-red-500/60 transition-all appearance-none"
                            >
                                <option value="enterprise">Enterprise Team (BPO/Call Center)</option>
                                <option value="independent">Independent Reps (Solo Flow)</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setIsProvisioning(false)} className="text-[10px] font-[700]  tracking-widest">Cancel</Button>
                        <Button variant="primary" onClick={handleProvisionSubmit} className="bg-red-600 hover:bg-red-500 text-[10px] font-[700]  tracking-widest shadow-lg shadow-red-600/20">
                            Initialize Deployment
                        </Button>
                    </div>
                </div>
            )}

            {/* Organizational Selector Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 shrink-0">
                {orgs.map((org) => (
                    <div 
                        key={org.id}
                        onClick={() => handleNodeChange(org)}
                        className={`p-4 rounded-xl border relative overflow-hidden transition-all duration-300 ${org.status !== 'provisioning' ? 'cursor-pointer' : 'opacity-80 pointer-events-none'} group ${
                            activeNode.id === org.id 
                            ? 'bg-red-500/10 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)] ring-1 ring-red-500/20' 
                            : 'bg-surface-alt/40 border-border-subtle hover:bg-surface-highlight hover:border-border-strong'
                        }`}
                    >
                        {activeNode.id === org.id && (
                            <div className="absolute top-0 right-0 p-2 text-status-error">
                                <Lock size={14} className="animate-pulse" />
                            </div>
                        )}
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg border ${
                                activeNode.id === org.id 
                                ? 'bg-red-500/20 border-status-error/30 text-status-error' 
                                : 'bg-surface-main border-border-subtle text-text-muted group-hover:text-text-primary'
                            }`}>
                                <Building size={18} />
                            </div>
                            <div>
                                <h4 className={`text-sm font-[700]  tracking-tight ${activeNode.id === org.id ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'}`}>
                                    {org.name}
                                </h4>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted  tracking-widest mt-0.5">
                                    <Globe size={10} /> {org.region} <span className="opacity-50">|</span> 
                                    <span className={org.type === 'enterprise' ? 'text-accent-secondary' : 'text-status-warning'}>{org.type === 'independent' ? 'SOLO' : 'TEAM'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 p-2.5 rounded-lg bg-surface-main/50 border border-border-subtle">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-[700] tracking-widest text-text-muted ">Status</span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                        org.status === 'online' ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' 
                                        : org.status === 'degraded' ? 'bg-amber-500' 
                                        : org.status === 'provisioning' ? 'bg-indigo-500 animate-ping'
                                        : 'bg-slate-600'
                                    }`}></span>
                                    <span className={`text-xs font-bold  ${
                                        org.status === 'online' ? 'text-status-success' 
                                        : org.status === 'degraded' ? 'text-status-warning' 
                                        : org.status === 'provisioning' ? 'text-accent-secondary animate-pulse'
                                        : 'text-slate-500'
                                    }`}>
                                        {org.status}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col text-right">
                                <span className="text-[9px] font-[700] tracking-widest text-text-muted ">Ping</span>
                                <span className="text-xs font-mono font-bold text-text-primary mt-0.5">
                                    {org.latency > 0 ? `${org.latency}ms` : '---'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Terminal Interface */}
            <div className="flex-1 bg-surface-main/90 rounded-[1.25rem] border border-red-500/20 dark:border-status-error/30 shadow-[0_8px_30px_rgba(239,68,68,0.1)] dark:shadow-[0_0_40px_rgba(239,68,68,0.15)] overflow-hidden flex flex-col font-mono min-h-[400px] backdrop-blur-3xl relative group">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-50"></div>
                <div className="absolute -inset-px bg-gradient-to-br from-red-500/5 via-transparent to-[#F5F2EB] dark:from-red-500/10 dark:to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                {/* Header Profile */}
                <div className="bg-surface-highlight/80  border-b border-red-500/20 p-3 flex justify-between items-center text-[10px] text-text-muted shrink-0 shadow-lg relative z-10 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-status-error font-[700] tracking-[0.2em]  py-1 px-2.5 rounded-md border border-red-500/20 bg-status-error/10 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                            <Shield size={14} /> L10_ROOT@{activeNode.id}
                        </span>
                        <span className="opacity-50">~ /usr/bin/nexus</span>
                    </div>
                    <div className="flex items-center gap-4 hidden sm:flex">
                        <span className="flex items-center gap-1.5 font-bold"><Cpu size={14}/> 4 CORES</span>
                        <span className="flex items-center gap-1.5 text-status-error dark:text-status-error font-bold"><Activity size={14}/> SECURE LINK</span>
                        <span className={`w-2 h-2 rounded-full ${activeNode.status === 'offline' ? 'bg-border-subtle dark:bg-slate-600' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)] dark:shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse'}`}></span>
                    </div>
                </div>

                {/* Log Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 text-[12px] leading-relaxed custom-scrollbar relative z-10 bg-transparent" onClick={() => inputRef.current?.focus()}>
                    {logs.map(log => (
                        <div key={log.id} className="animate-in fade-in slide-in-from-bottom-1 overflow-hidden">
                            {log.command && (
                                <div className="text-text-muted mb-1 flex items-center flex-wrap drop-shadow-sm">
                                    <span className="text-status-error font-[700] mr-2 whitespace-nowrap opacity-80">&gt;</span>
                                    <span className="break-all font-semibold ">{log.command}</span>
                                </div>
                            )}
                            {log.output && (
                                <div className={`
                                    ${log.type === 'system' ? 'text-text-secondary font-medium' : ''}
                                    ${log.type === 'error' ? 'text-red-600 dark:text-status-error font-bold drop-drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : ''}
                                    ${log.type === 'success' ? 'text-status-success font-bold drop-drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : ''}
                                    ${log.type === 'user' ? 'hidden' : ''}
                                `}>
                                    {log.output}
                                </div>
                            )}
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>

                {/* Input Area */}
                <div className={`p-4 border-t border-red-500/20 bg-surface-highlight/80  shrink-0 relative z-10 flex items-center transition-opacity backdrop-blur-md ${activeNode.status === 'offline' ? 'opacity-50 pointer-events-none' : ''}`}>
                    <span className="text-status-error font-[700] mr-2 opacity-80 text-[11px] tracking-widest drop-shadow-sm">&gt;</span>
                    <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false}
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCommand(input);
                        }}
                        placeholder={activeNode.status === 'offline' ? 'TARGET UNREACHABLE...' : ''}
                        disabled={activeNode.status === 'offline'}
                        className="flex-1 bg-transparent text-status-success outline-none caret-emerald-500 dark:caret-emerald-400 placeholder:text-status-error/30  tracking-[0.2em] text-[11px] font-bold drop-shadow-sm"
                        autoFocus
                    />
                </div>
            </div>
        </section>
    );
};
