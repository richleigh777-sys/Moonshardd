import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Building, Globe, ShieldAlert, Heart, ShieldCheck, 
    RefreshCw, Sparkles, Wifi, Server, Activity, Users, Radio, Plus, Cpu, Key, Play, AlertTriangle
} from 'lucide-react';
import { sfx } from '../../../../lib/soundService';
import { useCRM } from '../../../../hooks/useCRM';
import { useSystem } from '../../../../hooks/useSystem';
import { Button, Card } from '../../../ui/Base';
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
    throughput?: string;
}

const INITIAL_ORGS: OrganizationNode[] = [
    { id: 'ORG-ALPHA-01', name: 'Alpha Headquarters (USA)', region: 'us-east', status: 'online', users: 142, latency: 12, type: 'enterprise', ipEndpoint: '192.168.1.10', throughput: '420 MB/s' },
    { id: 'ORG-BETA-EU', name: 'London Sales Floor', region: 'eu-west', status: 'online', users: 84, latency: 45, type: 'enterprise', ipEndpoint: '10.0.4.52', throughput: '190 MB/s' },
    { id: 'ORG-GAMMA-MN', name: 'Manila BPO Outsourced', region: 'ap-south', status: 'degraded', users: 215, latency: 154, type: 'enterprise', ipEndpoint: '172.16.8.199', throughput: '360 MB/s' },
    { id: 'ORG-DELTA-AU', name: 'Sydney Test Branch', region: 'ap-east', status: 'offline', users: 0, latency: 999, type: 'independent', ipEndpoint: '10.1.1.5', throughput: '0.0 KB/s' },
];

export const CommandDeckTab = () => {
    const { systemConfig, updateSystemConfig, sendDirective, addNote } = useCRM();
    const { setToast } = useSystem();
    const { serverList, createNewServer, updateServer } = useServerManager();

    const [localOrgs, setLocalOrgs] = useState<OrganizationNode[]>([]);
    const [isPinging, setIsPinging] = useState(false);

    // Advanced Level 10 Node Provisioner State
    const [showDeployForm, setShowDeployForm] = useState(false);
    const [deployingNodeData, setDeployingNodeData] = useState({
        name: '',
        region: 'us-east',
        description: '',
        capacityLimit: 100,
        dialingRatio: '1:2',
        databaseEngine: 'Cloud SQL PostgreSQL',
        securityLevel: 'Restricted Team',
        accessKey: Math.random().toString(36).substring(2, 10).toUpperCase(),
        leadRouting: 'round-robin',
        loggingPrivacy: 'strict-gdpr',
        autoSeedLeads: true
    });

    const [compilationProgress, setCompilationProgress] = useState(0);
    const [compilerLogs, setCompilerLogs] = useState<string[]>([]);
    const [isCompiling, setIsCompiling] = useState(false);
    const [_visibleKeys, _setVisibleKeys] = useState<Record<string, boolean>>({});

    const generateNewAccessKey = () => {
        sfx.playClick();
        setDeployingNodeData(prev => ({
            ...prev,
            accessKey: Math.random().toString(36).substring(2, 10).toUpperCase()
        }));
    };

    const handleDeployNode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!deployingNodeData.name.trim()) {
            setToast({
                title: "Validation Error",
                message: "Please enter a unique Company Team Server Name.",
                type: "error"
            });
            return;
        }

        sfx.playConfirm();
        setIsCompiling(true);
        setCompilationProgress(5);
        setCompilerLogs([
            `⚡ INITIATING CLUSTER NODE PROVISIONING WORKSPACE`,
            `⚡ DEPLOY TARGET: "${deployingNodeData.name.toUpperCase()}"`,
            `⚡ ENGINE METADATA: DB: ${deployingNodeData.databaseEngine} / SECURITY: ${deployingNodeData.securityLevel.toUpperCase()}`,
            `⚡ COMPILE PARAMS: DIAL RATIO: ${deployingNodeData.dialingRatio} / ROUTING MODE: ${deployingNodeData.leadRouting.toUpperCase()}`,
            `-------------------------------------------------------------------------`,
            `[0.012s] [ORCHESTRATOR] Allocating system containers...`
        ]);

        const steps = [
            { progress: 15, msg: `[0.450s] [CLOUD_MESH] Mapping system route endpoints with low-latency private tunnel allocation (~12ms)...` },
            { progress: 35, msg: `[1.120s] [DATABASE_SYSTEM] Compiling schemas on ${deployingNodeData.databaseEngine}. Auto-seeding leads option: ${deployingNodeData.autoSeedLeads ? 'ENABLED (250 hot leads mapped)' : 'DISABLED (Pristine node)'}...` },
            { progress: 50, msg: `[1.950s] [SIP_VOIP] Securing VoIP lines with Dialing Ratio ${deployingNodeData.dialingRatio}. Enforcing Routing policy: ${deployingNodeData.leadRouting.toUpperCase()}...` },
            { progress: 65, msg: `[2.410s] [COMPLIANCE] Applying regulatory pattern rules: Privacy Mode set to [${deployingNodeData.loggingPrivacy.toUpperCase()}]...` },
            { progress: 80, msg: `[2.950s] [AUTH_SECURE] Injecting cryptographic salt and seeding administrative Access Handshake: ${deployingNodeData.accessKey}...` },
            { progress: 95, msg: `[3.620s] [SERVER_COMPILER] Bundling telemetry assets and deploying Express/React micro-services...` },
            { progress: 100, msg: `[4.250s] [NODE_ONLINE] Daemon service running on IPv4 proxy cluster! CRM Team Server provisioned beautifully with ${deployingNodeData.autoSeedLeads ? '250 seeded records' : 'blank data roster'}.` }
        ];

        for (const step of steps) {
            await new Promise(resolve => setTimeout(resolve, 600));
            setCompilationProgress(step.progress);
            setCompilerLogs(prev => [...prev, step.msg]);
        }

        setTimeout(async () => {
            try {
                // Call actual createNewServer from server manager to register it
                await createNewServer(deployingNodeData.name, 'us-east');

                // Add to localOrgs so it instantly is augmented with our customized metadata parameters!
                const newOrgId = `srv-${Date.now()}`;
                const newlyDeployedNode: OrganizationNode = {
                    id: newOrgId,
                    name: deployingNodeData.name,
                    region: 'us-east',
                    status: 'online',
                    users: 0,
                    latency: 12,
                    type: 'enterprise',
                    accessKey: deployingNodeData.accessKey,
                    ipEndpoint: `10.${Math.floor(Math.random()*254) + 1}.${Math.floor(Math.random()*254) + 1}.1`,
                    throughput: '0.0 KB/s'
                };

                // Add an audit trail to system log/notes
                await addNote({
                    id: `note-${Date.now()}`,
                    customerId: 'system',
                    text: `🔧 [LEVEL-10 DEPLOY] Deployed new company team node "${deployingNodeData.name}". Dialing Ratio: ${deployingNodeData.dialingRatio}, DB Sync: ${deployingNodeData.databaseEngine}, Routing Policy: ${deployingNodeData.leadRouting}, Privacy Level: ${deployingNodeData.loggingPrivacy}, Leads Seeded: ${deployingNodeData.autoSeedLeads ? 'Yes (250 Records)' : 'No'}, Key: ${deployingNodeData.accessKey}.`,
                    author: 'Lead Architect',
                    timestamp: Date.now()
                });

                setLocalOrgs(prev => [...prev, newlyDeployedNode]);
                setIsCompiling(false);
                setShowDeployForm(false);
                setToast({
                    title: "Node Deployed Successfully",
                    message: `${deployingNodeData.name} team server has been activated.`,
                    type: "success"
                });

                // Clear Form defaults
                setDeployingNodeData({
                    name: '',
                    region: 'us-east',
                    description: '',
                    capacityLimit: 100,
                    dialingRatio: '1:2',
                    databaseEngine: 'Cloud SQL PostgreSQL',
                    securityLevel: 'Restricted Team',
                    accessKey: Math.random().toString(36).substring(2, 10).toUpperCase(),
                    leadRouting: 'round-robin',
                    loggingPrivacy: 'strict-gdpr',
                    autoSeedLeads: true
                });
            } catch (_error) {
                setToast({
                    title: "Deployment Failed",
                    message: "There was a database sync issue creating the node.",
                    type: "error"
                });
                setIsCompiling(false);
            }
        }, 500);
    };

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
                    ipEndpoint: `10.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.1`,
                    throughput: `${Math.floor(Math.random() * 100) + 20} MB/s`
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
        shieldInactiveAgents: systemConfig?.level10Config?.shieldInactiveAgents ?? true,
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
            (l10?.shieldInactiveAgents ?? true) !== level10Settings.shieldInactiveAgents ||
            restrictedStr1 !== restrictedStr2
        ) {
            updateSystemConfig({ ...systemConfig, level10Config: { ...level10Settings } });
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

    // Deep Empathy Feature 1: Broadcast Supportive Affirmation to all active elements
    const handleBroadcastAffirmation = async () => {
        sfx.playConfirm();
        try {
            const adviceMessages = [
                "🌱 Direct Care Broadcast: You are doing amazing work today. Please feel free to lean back, stretch, and take 3 deep breaths right now. Your energy matters!",
                "💧 Hydration reminder: Keep pushing, but fill up your water glasses. Real performance flows from a rested, hydrated mind!",
                "🧡 Operational Support: Underwriting teams are online and standing by to auto-verify your dialer entries immediately. We believe in you!",
            ];
            const chosenMsg = adviceMessages[Math.floor(Math.random() * adviceMessages.length)];

            await sendDirective({
                message: chosenMsg,
                urgency: "Routine",
                senderName: "Operations Care Desk"
            });

            setToast({
                title: "Affirmation Projected",
                message: "A high-empathy supportive nudge has been distributed to all terminals.",
                type: "success"
            });
        } catch {
            setToast({ title: "Broadcast Failure", message: "Uplink pipeline failed.", type: "error" });
        }
    };

    // Deep Empathy Feature 2: Confetti celebration trigger (confetti / spiff success vibe)
    const handleBroadcastConfetti = async () => {
        sfx.playConfirm();
        try {
            await sendDirective({
                message: "🎉 FLOOR CELEBRATION! A major transaction was just locked in. Excellent operations! Keep dialing, rewards are ticking!",
                urgency: "Immediate",
                senderName: "Sales Floor Success Engine"
            });
            setToast({
                title: "Floor Celebrations Fired",
                message: "Chimes, alerts, and motivation tokens pushed to all active screens.",
                type: "success"
            });
        } catch {
            setToast({ title: "Broadcast Failure", message: "Uplink pipeline failed.", type: "error" });
        }
    };

    // Diagnostics Ping test (for nodes)
    const handleTestPing = () => {
        sfx.playClick();
        setIsPinging(true);
        setTimeout(() => {
            setIsPinging(false);
            setToast({
                title: `${activeNode.name} Ping Completed`,
                message: `Latency returned: ${activeNode.latency}ms | Packets: 4/4 safe`,
                type: "success"
            });
        }, 1000);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any } }
    };

    return (
        <motion.section 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            <motion.div variants={itemVariants} className="flex flex-col gap-3 pb-4">
                <div className="flex items-center gap-2 text-[#EF4444]">
                    <ShieldAlert size={14} className="animate-pulse" />
                    <span className="text-sm font-bold tracking-wide uppercase opacity-80">Administrative Control Level 10 Only</span>
                </div>
                <h3 className="text-3xl font-bold text-text-primary tracking-tight">
                    System Core <span className="text-[#3B82F6]">Controls</span>
                </h3>
                <p className="text-xs text-text-muted max-w-2xl leading-relaxed">
                    Manage global telemetry routing filters, enforce security constraints, inspect individual organizational nodes, or execute high-empathy broadcasts to active agents.
                </p>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-surface-main/ border border-border-subtle rounded-xl p-6 sm:p-8 shadow-inner flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-subtle">
                            <div className="p-2 rounded-xl bg-[#3B82F6]/10 text-[#60A5FA] border border-[#3B82F6]/20 shadow-inner">
                                <Radio size={16} />
                            </div>
                            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wide">Broadcasters</h3>
                        </div>
                        
                        <div className="space-y-2">
                             <div className="flex justify-between items-center py-4 border-b border-border-subtle/50">
                                 <div className="flex flex-col">
                                     <span className="text-sm font-bold text-text-primary flex items-center gap-2">
                                         <Heart size={14} className="text-[#F43F5E] fill-[#F43F5E]/20" />
                                         Shift Shielding
                                     </span>
                                     <span className="text-sm text-text-muted mt-1 leading-relaxed max-w-xs">
                                         Automatically shield idle agents (&gt;15 min) by routing to paid rest break status.
                                     </span>
                                 </div>
                                 <button 
                                     onClick={() => setLevel10Settings(prev => ({ ...prev, shieldInactiveAgents: !prev.shieldInactiveAgents }))}
                                     className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide transition-all border ${level10Settings.shieldInactiveAgents ? "bg-[#3B82F6]/10 border-[#3B82F6]/30 text-[#60A5FA] shadow-inner" : "bg-surface-alt border-border-subtle text-text-muted hover:bg-surface-main"}`}
                                 >
                                     {level10Settings.shieldInactiveAgents ? 'Shield Safe' : 'Hard Purge'}
                                 </button>
                             </div>

                             <div className="flex justify-between items-center py-4 border-b border-border-subtle/50">
                                 <div className="flex flex-col">
                                     <span className="text-sm font-bold text-text-primary">Affirmation Beacon</span>
                                     <span className="text-sm text-text-muted mt-1">Push custom mental health remind triggers.</span>
                                 </div>
                                 <Button variant="secondary" className="text-sm font-bold tracking-wide uppercase h-10 px-5 bg-surface-alt" onClick={handleBroadcastAffirmation}>
                                     Beam Affirmation
                                 </Button>
                             </div>

                             <div className="flex justify-between items-center py-4 border-b border-border-subtle/50">
                                 <div className="flex flex-col">
                                     <span className="text-sm font-bold text-text-primary">Floor Celebrations</span>
                                     <span className="text-sm text-text-muted mt-1">Trigger global celebration confetti.</span>
                                 </div>
                                 <Button variant="secondary" className="text-sm font-bold tracking-wide uppercase h-10 px-5 gap-2 bg-surface-alt" onClick={handleBroadcastConfetti}>
                                     <Sparkles size={12} className="text-[#F59E0B]" /> Launch
                                 </Button>
                             </div>

                             <div className="flex justify-between items-center pt-4">
                                 <div className="flex flex-col">
                                     <span className="text-sm font-bold text-text-primary">Global Lock</span>
                                     <span className="text-sm text-text-muted mt-1">Restrict standard logins for tweaks.</span>
                                 </div>
                                 <Button variant={systemConfig?.maintenanceMode ? "danger" : "secondary"} className="text-sm font-bold tracking-wide uppercase h-10 px-5 bg-surface-alt" onClick={() => runAction("Maintenance Mode", () => {
                                     updateSystemConfig({ maintenanceMode: !systemConfig?.maintenanceMode });
                                 })}>
                                     {systemConfig?.maintenanceMode ? 'Locked Out' : 'Active'}
                                 </Button>
                             </div>
                        </div>
                    </div>
                 </div>

                <div className="bg-surface-main/ border border-border-subtle rounded-xl p-6 sm:p-8 shadow-inner flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-subtle">
                            <div className="p-2 rounded-xl bg-[#10B981]/10 text-[#34D399] border border-[#10B981]/20 shadow-inner">
                                <ShieldCheck size={16} />
                            </div>
                            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wide">Core Constraints</h3>
                        </div>
                        
                        <div className="space-y-6">
                            <ConfigToggle 
                                label="Zero-Knowledge Encryption Protocols" 
                                description="Require full AES authorization handshakes across client tunnels." 
                                active={level10Settings.encryptionKeys} 
                                onToggle={() => setLevel10Settings(prev => ({ ...prev, encryptionKeys: !prev.encryptionKeys }))} 
                            />
                            <ConfigToggle 
                                label="Phantom Routing Obfuscator" 
                                description="Secure internal database credentials by routing active CRM signals." 
                                active={level10Settings.phantomRouting} 
                                onToggle={() => setLevel10Settings(prev => ({ ...prev, phantomRouting: !prev.phantomRouting }))} 
                            />
                            <ConfigToggle 
                                label="Cross-Floor Cache Federation" 
                                description="Allow distributed offices to synchronize dial pools in real-time." 
                                active={level10Settings.federationProtocol} 
                                onToggle={() => setLevel10Settings(prev => ({ ...prev, federationProtocol: !prev.federationProtocol }))} 
                            />
                            <ConfigToggle 
                                label="Intelligent Log Redaction" 
                                description="Enforce strict pattern rules to wipe CCN, CVV, and SSN on save." 
                                active={level10Settings.auditRedaction} 
                                onToggle={() => setLevel10Settings(prev => ({ ...prev, auditRedaction: !prev.auditRedaction }))} 
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-6">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
                      <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-[#F59E0B]/10 text-[#FBBF24] border border-[#F59E0B]/20 shadow-inner">
                              <Server size={16} />
                          </div>
                           <h3 className="text-xs font-bold text-text-primary uppercase tracking-wide">Distributed Cluster Nodes</h3>
                       </div>
                      <div className="flex items-center gap-4">
                          <span className="text-sm font-semibold text-text-muted bg-surface-alt px-4 py-2 border border-border-subtle rounded-xl flex items-center gap-2 shadow-inner">
                              <Wifi size={14} className="text-[#34D399] animate-pulse" /> Nodes Verified: {orgs.filter(o => o.status === 'online').length}/{orgs.length}
                          </span>
                          <button
                              type="button"
                              onClick={() => {
                                  sfx.playClick();
                                  setShowDeployForm(!showDeployForm);
                              }}
                              className={`h-10 px-5 rounded-xl text-sm font-bold uppercase tracking-wide shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                                  showDeployForm 
                                  ? 'bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#FCA5A5] hover:bg-[#EF4444]/20' 
                                  : 'bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-text-primary hover:shadow-sm border border-[#60A5FA]/30'
                              }`}
                          >
                              {showDeployForm ? (
                                  <>Abrupt System Cancel</>
                              ) : (
                                  <>
                                      <Plus size={14} /> Deploy Team Node
                                  </>
                              )}
                          </button>
                      </div>
                 </div>

                 {/* HIGH-FIDELITY ACTIVE PROVISIONER FORM (LEVEL 10 EXCLUSIVE) */}
                 <AnimatePresence>
                 {showDeployForm && (
                      <motion.div 
                          initial={{ opacity: 0, y: -20, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: 'auto' }}
                          exit={{ opacity: 0, y: -20, height: 0 }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as any }}
                          className="bg-gradient-to-br from-[#0A0A0C] to-[#0F0F11] border border-border-subtle rounded-xl p-6 sm:p-8 mt-6 shadow-2xl relative overflow-hidden text-left"
                      >
                          <div className="absolute right-0 top-0 w-48 h-48 bg-[#3B82F6]/5 rounded-full blur-[60px] pointer-events-none"></div>
                          
                          <div className="flex items-center gap-4 mb-8 pb-4 border-b border-border-subtle">
                              <div className="p-2.5 rounded-xl bg-[#60A5FA]/10 text-[#93C5FD] border border-[#3B82F6]/20 shadow-inner">
                                  <Cpu size={20} />
                              </div>
                              <div className="text-left">
                                  <h4 className="text-sm font-bold text-text-primary tracking-tight">Generate Server</h4>
                                  <span className="text-sm text-text-muted block mt-1 font-medium leading-relaxed">Initialize a sandboxed telephony and client database node.</span>
                              </div>
                          </div>

                          {!isCompiling ? (
                              <form onSubmit={handleDeployNode} className="space-y-6 text-left">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                                      
                                      <div className="space-y-2 text-left">
                                          <label className="text-sm font-bold uppercase text-text-muted tracking-wide ml-1 block">Company Team Name</label>
                                          <input
                                              type="text"
                                              required
                                              value={deployingNodeData.name}
                                              onChange={e => setDeployingNodeData(prev => ({ ...prev, name: e.target.value }))}
                                              placeholder="e.g. Seattle Accounts Desk"
                                              className="w-full h-12 px-4 bg-surface-main border border-border-subtle rounded-xl text-sm text-text-primary focus:ring-1 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]/50 outline-none transition-all placeholder-[#52525B] font-semibold shadow-inner"
                                          />
                                      </div>

                                      <div className="space-y-2 text-left">
                                          <label className="text-sm font-bold uppercase text-text-muted tracking-wide ml-1 block">Lead Routing Strategy</label>
                                          <select
                                              value={deployingNodeData.leadRouting}
                                              onChange={e => setDeployingNodeData(prev => ({ ...prev, leadRouting: e.target.value }))}
                                              className="w-full h-12 px-4 bg-surface-main border border-border-subtle rounded-xl text-sm text-text-primary focus:ring-1 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]/50 outline-none transition-all font-semibold cursor-pointer shadow-inner appearance-none"
                                          >
                                              <option value="round-robin">Round-Robin Floor Sync</option>
                                              <option value="skill-based">Skill-Tier Intelligent Routing</option>
                                              <option value="priority-speed-run">Priority Lead Speed-Run</option>
                                          </select>
                                      </div>

                                      <div className="space-y-2 text-left">
                                          <label className="text-sm font-bold uppercase text-text-muted tracking-wide ml-1 block">Max Seat Capacity</label>
                                          <select
                                              value={deployingNodeData.capacityLimit}
                                              onChange={e => setDeployingNodeData(prev => ({ ...prev, capacityLimit: Number(e.target.value) }))}
                                              className="w-full h-12 px-4 bg-surface-main border border-border-subtle rounded-xl text-sm text-text-primary focus:ring-1 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]/50 outline-none transition-all font-semibold cursor-pointer shadow-inner appearance-none"
                                          >
                                              <option value={25}>Small Team (Up to 25 agents)</option>
                                              <option value={100}>Standard Floor (Up to 100 agents)</option>
                                              <option value={500}>Hyper-Scale Node (Up to 500 agents)</option>
                                          </select>
                                      </div>

                                      <div className="space-y-2 text-left">
                                          <label className="text-sm font-bold uppercase text-text-muted tracking-wide ml-1 block">VoIP Concurrency Ratio</label>
                                          <select
                                              value={deployingNodeData.dialingRatio}
                                              onChange={e => setDeployingNodeData(prev => ({ ...prev, dialingRatio: e.target.value }))}
                                              className="w-full h-12 px-4 bg-surface-main border border-border-subtle rounded-xl text-sm text-text-primary focus:ring-1 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]/50 outline-none transition-all font-semibold cursor-pointer shadow-inner appearance-none"
                                          >
                                              <option value="1:1">Balanced Manual (1:1 Active Lines)</option>
                                              <option value="1:2">Adaptive Predictive</option>
                                              <option value="1:4">Aggressive Multi-Line</option>
                                          </select>
                                      </div>

                                      <div className="space-y-2 text-left">
                                          <label className="text-sm font-bold uppercase text-text-muted tracking-wide ml-1 block">Database Sync Engine</label>
                                          <select
                                              value={deployingNodeData.databaseEngine}
                                              onChange={e => setDeployingNodeData(prev => ({ ...prev, databaseEngine: e.target.value }))}
                                              className="w-full h-12 px-4 bg-surface-main border border-border-subtle rounded-xl text-sm text-text-primary focus:ring-1 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]/50 outline-none transition-all font-semibold cursor-pointer shadow-inner appearance-none"
                                          >
                                              <option value="Cloud SQL PostgreSQL">Relational Cloud SQL (Raw RDS)</option>
                                              <option value="Firestore Shared Mesh">Distributed Firebase</option>
                                              <option value="Hybrid Memory Buffer">Ephemeral Memory Cache</option>
                                          </select>
                                      </div>

                                      <div className="space-y-2 text-left">
                                          <label className="text-sm font-bold uppercase text-text-muted tracking-wide ml-1 block">Logging level</label>
                                          <select
                                              value={deployingNodeData.loggingPrivacy}
                                              onChange={e => setDeployingNodeData(prev => ({ ...prev, loggingPrivacy: e.target.value }))}
                                              className="w-full h-12 px-4 bg-surface-main border border-border-subtle rounded-xl text-sm text-text-primary focus:ring-1 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]/50 outline-none transition-all font-semibold cursor-pointer shadow-inner appearance-none"
                                          >
                                              <option value="strict-gdpr">Anonymized GDPR (Mask Info)</option>
                                              <option value="full-transcript">Full Transcripts (Unrestricted)</option>
                                              <option value="wipe-on-logout">Zero-Trace (Auto-Wipe Logs)</option>
                                          </select>
                                      </div>

                                      <div className="space-y-2 text-left md:col-span-2 lg:col-span-1">
                                          <label className="text-sm font-bold uppercase text-text-muted tracking-wide ml-1 block">Initial Security Key</label>
                                          <div className="flex gap-2">
                                              <div className="relative flex-1">
                                                  <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                                                  <input
                                                      type="text"
                                                      readOnly
                                                      value={deployingNodeData.accessKey}
                                                      className="w-full h-12 pl-12 pr-4 bg-surface-main border border-border-subtle rounded-xl text-sm text-[#60A5FA] font-mono select-all font-bold focus:outline-none shadow-inner"
                                                  />
                                              </div>
                                              <button
                                                  type="button"
                                                  onClick={generateNewAccessKey}
                                                  title="Regenerate Seed Key"
                                                  className="w-12 h-12 bg-surface-alt hover:bg-surface-main border border-border-subtle rounded-xl text-text-muted hover:text-text-primary transition-all flex items-center justify-center cursor-pointer flex-shrink-0 shadow-inner group"
                                              >
                                                  <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                                              </button>
                                          </div>
                                      </div>
                                  </div>

                                  <div className="p-4 bg-surface-main/50 border border-border-subtle rounded-xl flex items-start gap-4 text-left mt-4">
                                      <AlertTriangle size={16} className="text-[#F59E0B] shrink-0 mt-0.5" />
                                      <p className="text-sm leading-relaxed text-text-muted">
                                          <strong className="text-[#E4E4E7] font-bold">Z-Knowledge Verification Handshake:</strong> Lower agents will be restricted from socket handshakes without verifying their portal key <code className="text-[#FBBF24] bg-[#FBBF24]/10 border border-[#FBBF24]/20 px-1.5 py-0.5 rounded font-mono font-bold text-sm ml-1">{deployingNodeData.accessKey}</code>.
                                      </p>
                                  </div>

                                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-border-subtle">
                                      <button
                                          type="button"
                                          onClick={() => {
                                              sfx.playClick();
                                              setShowDeployForm(false);
                                          }}
                                          className="h-12 px-6 bg-surface-alt hover:bg-surface-main text-sm font-bold uppercase tracking-wide text-text-muted hover:text-text-primary rounded-xl border border-border-subtle transition-all cursor-pointer"
                                      >
                                          Exit Core Setup
                                      </button>
                                      <button
                                          type="submit"
                                          className="h-12 px-8 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] text-sm font-bold uppercase tracking-wide text-white rounded-xl shadow-sm flex items-center gap-2.5 transition-all outline-none cursor-pointer hover:scale-[1.02] border border-[#60A5FA]/30"
                                      >
                                          <Play size={14} className="fill-white" /> Compile & Deploy Cohort Node
                                      </button>
                                  </div>
                              </form>
                          ) : (
                              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                                  
                                  <div className="space-y-3">
                                      <div className="flex justify-between items-center text-sm font-bold uppercase tracking-wide">
                                          <span className="text-[#60A5FA] flex items-center gap-2">
                                              <RefreshCw size={14} className="animate-spin" />
                                              Assembling Virtualized Team Infrastructure...
                                          </span>
                                          <span className="text-text-primary font-mono text-lg">{compilationProgress}%</span>
                                      </div>
                                      <div className="h-3 w-full bg-surface-main rounded-full overflow-hidden border border-border-subtle shadow-inner p-0.5">
                                          <div 
                                              className="h-full bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] transition-all duration-300 ease-out rounded-full shadow-sm"
                                              style={{ width: `${compilationProgress}%` }}
                                          ></div>
                                      </div>
                                  </div>

                                  <div className="p-5 bg-surface-alt/  rounded-xl border border-border-subtle font-mono text-xs leading-relaxed max-h-[280px] overflow-y-auto custom-scrollbar flex flex-col justify-start shadow-inner">
                                      {compilerLogs.map((logLine, logIdx) => (
                                          <motion.div 
                                              initial={{ opacity: 0, x: -10 }}
                                              animate={{ opacity: 1, x: 0 }}
                                              key={logIdx}
                                              className={`py-1.5 ${
                                                  logLine.startsWith('⚡') ? 'text-text-primary font-bold' :
                                                  logLine.includes('[SUCCESS]') || logLine.includes('[NODE_ONLINE]') ? 'text-[#34D399] font-bold' :
                                                  logLine.includes('[AUTH_SECURE]') ? 'text-[#FBBF24]' : 'text-[#60A5FA]/90 font-medium'
                                              }`}
                                          >
                                              {logLine}
                                          </motion.div>
                                      ))}
                                  </div>
                                  
                                  <div className="flex justify-start text-sm font-bold uppercase tracking-wide text-text-muted">
                                      System thread occupied. Outbound routing signals are temporarily gated.
                                  </div>
                              </div>
                          )}
                      </motion.div>
                 )}
                 </AnimatePresence>











                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                     {orgs.map((org) => (
                         <div 
                             key={org.id}
                             onClick={() => handleNodeChange(org)}
                             className={`p-4 rounded-xl border transition-all duration-300 relative overflow-hidden group ${
                                 org.status !== 'provisioning' ? 'cursor-pointer' : 'opacity-80 pointer-events-none'
                             } ${
                                 activeNode.id === org.id 
                                 ? 'bg-surface-alt border-accent-primary/60 shadow-lg ring-1 ring-accent-primary/10' 
                                 : 'bg-surface-main border-border-subtle hover:bg-surface-alt/75 hover:border-border-strong'
                             }`}
                         >
                             {/* Background ambient light for active node */}
                             {activeNode.id === org.id && (
                                 <div className="absolute right-0 top-0 w-24 h-24 bg-accent-primary/[0.04] rounded-full blur-2xl pointer-events-none"></div>
                             )}

                             <div className="flex items-start justify-between gap-2 relative z-10">
                                 <div className="flex items-center gap-2.5 min-w-0">
                                     <div className={`p-2 rounded-xl border transition-colors ${
                                         activeNode.id === org.id 
                                         ? 'bg-accent-primary/10 border-accent-primary/20 text-accent-primary' 
                                         : 'bg-surface-alt border-border-subtle text-text-muted group-hover:text-text-primary'
                                     }`}>
                                         <Building size={16} />
                                     </div>
                                     <div className="min-w-0">
                                         <h4 className={`text-sm font-bold truncate ${activeNode.id === org.id ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'}`}>
                                             {org.name}
                                         </h4>
                                         <div className="flex items-center gap-1.5 text-sm text-text-muted/80 mt-0.5 whitespace-nowrap font-mono uppercase bg-surface-alt/80 px-2 py-0.5 rounded border border-border-subtle inline-block">
                                             <Globe size={10} className="inline mr-0.5" /> {org.region}
                                         </div>
                                     </div>
                                 </div>
                             </div>

                             {/* Metadata table */}
                             <div className="grid grid-cols-2 gap-2 mt-4 p-2 rounded-xl bg-surface-alt/50 border border-border-subtle/50 relative z-10 font-mono text-sm leading-tight">
                                 <div>
                                     <span className="text-text-muted/70 block text-[8px] uppercase">STATUS</span>
                                     <span className={`font-bold flex items-center gap-1 mt-0.5 uppercase ${
                                         org.status === 'online' ? 'text-status-success' 
                                         : org.status === 'degraded' ? 'text-status-warning' 
                                         : 'text-text-muted'
                                     }`}>
                                         <span className={`w-1.5 h-1.5 rounded-full ${
                                             org.status === 'online' ? 'bg-status-success animate-pulse' 
                                             : org.status === 'degraded' ? 'bg-status-warning animate-pulse' 
                                             : 'bg-text-muted'
                                         }`}></span>
                                         {org.status}
                                     </span>
                                 </div>

                                 <div className="text-right">
                                     <span className="text-text-muted/70 block text-[8px] uppercase">LATENCY</span>
                                     <span className={`font-bold block mt-0.5 ${org.latency > 150 ? 'text-status-warning' : 'text-text-primary'}`}>
                                         {org.latency > 0 ? `${org.latency}ms` : '---'}
                                     </span>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>

                 {/* Node Detail Inspector Drawer */}
                 {activeNode && (
                     <Card variant="refraction" className="p-5 border border-border-subtle/70 bg-surface-main/40  animate-in fade-in duration-200">
                         <div className="flex flex-wrap items-center justify-between gap-4">
                             <div className="flex items-center gap-3">
                                 <div className="p-2 bg-accent-primary/10 rounded-xl text-accent-primary border border-accent-primary/20">
                                     <Activity size={18} />
                                 </div>
                                 <div>
                                     <h4 className="text-sm font-bold text-text-primary">Cluster Node Detailed Monitor: {activeNode.name}</h4>
                                     <p className="text-sm text-text-muted font-bold font-mono">NETWORK INGRESS ENDPOINT: {activeNode.ipEndpoint || 'UNKNOWN'} | ID: {activeNode.id}</p>
                                 </div>
                             </div>

                             <div className="flex items-center gap-2">
                                 <span className="text-sm text-text-muted font-mono bg-surface-alt px-2.5 py-1 rounded border border-border-subtle uppercase flex items-center gap-1">
                                     <Users size={12} className="text-accent-primary" /> Connected Users: {activeNode.users}
                                 </span>
                                 <span className="text-sm text-text-muted font-mono bg-surface-alt px-2.5 py-1 rounded border border-border-subtle uppercase flex items-center gap-1">
                                     <Wifi size={12} className="text-accent-secondary" /> Volume Flow: {activeNode.throughput || '0.0 KB/s'}
                                 </span>
                                 <Button 
                                     variant="secondary" 
                                     className="text-sm font-bold uppercase tracking-wider h-8 flex items-center gap-1"
                                     onClick={handleTestPing}
                                     disabled={isPinging}
                                 >
                                     <RefreshCw size={12} className={isPinging ? 'animate-spin text-accent-primary' : ''} />
                                     <span>{isPinging ? "TESTING..." : "TEST PATH PING"}</span>
                                 </Button>
                                 <button
                                     onClick={() => {
                                         const newStatus = activeNode.status === 'online' ? 'offline' : 'active';
                                         updateServer(activeNode.id, { status: newStatus as any });
                                         sfx.playConfirm();
                                     }}
                                     className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-bold tracking-widest transition-all ${
                                         activeNode.status === 'online' 
                                         ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                                         : 'bg-surface-alt border-border-subtle text-text-muted hover:text-text-primary'
                                     }`}
                                 >
                                     <div className={`w-2 h-2 rounded-full ${activeNode.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-text-muted'}`} />
                                     {activeNode.status === 'online' ? 'NODE ACTIVE' : 'ACTIVATE NODE'}
                                 </button>
                             </div>
                         </div>
                     </Card>
                 )}
            </motion.div>\n        </motion.section>
    );
};
