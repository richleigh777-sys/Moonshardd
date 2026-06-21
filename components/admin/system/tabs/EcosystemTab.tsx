import React, { useState } from 'react';
import { Network, Users, Globe, Database, Activity, GitCommit, Bot, ShieldCheck, Mail, Workflow, Zap, AlertTriangle, Lightbulb, TrendingDown, Target, Scale, ZapOff, Repeat, RefreshCw, Briefcase, Share2, Server, MonitorSmartphone, Settings, Heart, TrendingUp, Trophy } from 'lucide-react';
import { Card } from '../../../../ui/Base';
import { SectionHeader } from '../SectionHeader';
import { motion, AnimatePresence } from 'motion/react';

export const EcosystemTab: React.FC = () => {
    const [activeNode, setActiveNode] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'core' | 'sustainability' | 'actor' | 'cld' | 'sna' | 'terminals' | 'approved_flow' | 'clm_loop' | 'cx_growth' | 'gamification'>('core');

    const coreNodes = [
        { id: 'admin', label: 'Command Deck', type: 'actor', icon: ShieldCheck, color: 'text-[#C084FC]', bg: 'bg-[#C084FC]/10', border: 'border-[#C084FC]/30', x: 50, y: 20 },
        { id: 'agents', label: 'Operatives', type: 'actor', icon: Users, color: 'text-[#60A5FA]', bg: 'bg-[#60A5FA]/10', border: 'border-[#60A5FA]/30', x: 25, y: 45 },
        { id: 'customers', label: 'Customers', type: 'actor', icon: Globe, color: 'text-[#34D399]', bg: 'bg-[#34D399]/10', border: 'border-[#34D399]/30', x: 75, y: 45 },
        
        { id: 'crm', label: 'Core DB', type: 'resource', icon: Database, color: 'text-[#22D3EE]', bg: 'bg-[#22D3EE]/10', border: 'border-[#22D3EE]/30', x: 50, y: 55 },
        { id: 'ai', label: 'Gemini AI', type: 'resource', icon: Bot, color: 'text-[#F472B6]', bg: 'bg-[#F472B6]/10', border: 'border-[#F472B6]/30', x: 25, y: 75 },
        { id: 'payment', label: 'Payment API', type: 'resource', icon: Zap, color: 'text-[#FBBF24]', bg: 'bg-[#FBBF24]/10', border: 'border-[#FBBF24]/30', x: 75, y: 75 },

        { id: 'playbooks', label: 'Playbook Engine', type: 'process', icon: Workflow, color: 'text-[#FBBF24]', bg: 'bg-[#FBBF24]/10', border: 'border-[#FBBF24]/30', x: 35, y: 35 },
        { id: 'enrollment', label: 'Enrollment', type: 'process', icon: GitCommit, color: 'text-[#FB923C]', bg: 'bg-[#FB923C]/10', border: 'border-[#FB923C]/30', x: 65, y: 60 },
    ];

    const sustainNodes = [
        { id: 'burnout', label: 'Agent Burnout', type: 'pressure', icon: TrendingDown, color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10', border: 'border-[#EF4444]/50', x: 10, y: 30 },
        { id: 'compliance', label: 'Regulation', type: 'pressure', icon: Scale, color: 'text-[#059669]', bg: 'bg-[#059669]/10', border: 'border-[#059669]/50', x: 90, y: 30 },
        
        { id: 'retention', label: 'Wellness Focus', type: 'intervention', icon: Lightbulb, color: 'text-[#FDE047]', bg: 'bg-[#FDE047]/10', border: 'border-[#FDE047]/50', x: 20, y: 15 },
        { id: 'automation', label: 'Auto-Triage', type: 'intervention', icon: Target, color: 'text-[#67E8F9]', bg: 'bg-[#67E8F9]/10', border: 'border-[#67E8F9]/50', x: 80, y: 15 },
        { id: 'feedback', label: 'Feedback Loop', type: 'leverage_point', icon: Activity, color: 'text-[#F472B6]', bg: 'bg-[#F472B6]/10', border: 'border-[#F472B6]/50', x: 50, y: 85 },
    ];

    const cldNodes = [
        { id: 'sales_pressure', label: 'Sales Pressure', type: 'variable', icon: Target, color: 'text-[#F87171]', bg: 'bg-[#EF4444]/10', border: 'border-[#EF4444]/50', x: 20, y: 30 },
        { id: 'agent_effort', label: 'Agent Effort', type: 'variable', icon: Activity, color: 'text-[#60A5FA]', bg: 'bg-[#3B82F6]/10', border: 'border-[#3B82F6]/50', x: 50, y: 20 },
        { id: 'customer_satisfaction', label: 'Customer Satisfaction', type: 'variable', icon: Globe, color: 'text-[#34D399]', bg: 'bg-[#10B981]/10', border: 'border-[#10B981]/50', x: 80, y: 30 },
        { id: 'revenue', label: 'Revenue/Acquisitions', type: 'variable', icon: Zap, color: 'text-[#4ADE80]', bg: 'bg-[#22C55E]/10', border: 'border-[#22C55E]/50', x: 80, y: 70 },
        { id: 'attrition', label: 'Agent Attrition', type: 'variable', icon: TrendingDown, color: 'text-[#C084FC]', bg: 'bg-[#A855F7]/10', border: 'border-[#A855F7]/50', x: 20, y: 70 },
        { id: 'training_cost', label: 'Training Cost', type: 'variable', icon: Briefcase, color: 'text-[#FB923C]', bg: 'bg-[#F97316]/10', border: 'border-[#F97316]/50', x: 50, y: 85 },
        { id: 'reinforcing_loop', label: 'Burnout Loop (R)', type: 'loop', icon: Repeat, color: 'text-[#FCA5A5]', bg: 'bg-[#EF4444]/20', border: 'border-[#EF4444]/60', x: 35, y: 50 },
        { id: 'balancing_loop', label: 'Sales Loop (B)', type: 'loop', icon: RefreshCw, color: 'text-[#6EE7B7]', bg: 'bg-[#10B981]/20', border: 'border-[#10B981]/60', x: 65, y: 50 },
    ];

    const snaNodes = [
        { id: 'admin1', label: 'Lead Admin', type: 'central_node', icon: ShieldCheck, color: 'text-[#C084FC]', bg: 'bg-[#A855F7]/10', border: 'border-[#A855F7]/50', x: 50, y: 50 },
        { id: 'team_alpha', label: 'Team Alpha', type: 'cluster', icon: Users, color: 'text-[#60A5FA]', bg: 'bg-[#3B82F6]/10', border: 'border-[#3B82F6]/50', x: 25, y: 25 },
        { id: 'team_beta', label: 'Team Beta', type: 'cluster', icon: Users, color: 'text-[#22D3EE]', bg: 'bg-[#06B6D4]/10', border: 'border-[#06B6D4]/50', x: 75, y: 25 },
        { id: 'external_vendors', label: 'Vendors', type: 'cluster', icon: Briefcase, color: 'text-[#FB923C]', bg: 'bg-[#F97316]/10', border: 'border-[#F97316]/50', x: 75, y: 75 },
        { id: 'qa_team', label: 'QA / Compliance', type: 'cluster', icon: Target, color: 'text-[#F472B6]', bg: 'bg-[#EC4899]/10', border: 'border-[#EC4899]/50', x: 25, y: 75 },
    ];

    const terminalNodes = [
        { id: 'admin_root', label: 'Admin Portal', type: 'terminal', icon: ShieldCheck, color: 'text-[#C084FC]', bg: 'bg-[#A855F7]/10', border: 'border-[#A855F7]/50', x: 15, y: 50 },
        { id: 'sys_config', label: 'System Config', type: 'component', icon: Settings, color: 'text-[#D8B4FE]', bg: 'bg-[#A855F7]/10', border: 'border-[#A855F7]/30', x: 35, y: 20 },
        { id: 'roster_mgr', label: 'Roster Manager', type: 'component', icon: Users, color: 'text-[#D8B4FE]', bg: 'bg-[#A855F7]/10', border: 'border-[#A855F7]/30', x: 35, y: 40 },
        { id: 'audit_dash', label: 'Audit Log', type: 'component', icon: Activity, color: 'text-[#D8B4FE]', bg: 'bg-[#A855F7]/10', border: 'border-[#A855F7]/30', x: 35, y: 60 },
        { id: 'ledger_admin', label: 'Sales Ledger', type: 'component', icon: Database, color: 'text-[#D8B4FE]', bg: 'bg-[#A855F7]/10', border: 'border-[#A855F7]/30', x: 35, y: 80 },
        
        { id: 'state_bus', label: 'Global State (CRM)', type: 'state', icon: Server, color: 'text-[#34D399]', bg: 'bg-[#10B981]/10', border: 'border-[#10B981]/50', x: 50, y: 50 },
        
        { id: 'agent_root', label: 'Agent Portal', type: 'terminal', icon: MonitorSmartphone, color: 'text-[#60A5FA]', bg: 'bg-[#3B82F6]/10', border: 'border-[#3B82F6]/50', x: 85, y: 50 },
        { id: 'agent_dash', label: 'Agent Metrics Dash', type: 'component', icon: Activity, color: 'text-[#93C5FD]', bg: 'bg-[#3B82F6]/10', border: 'border-[#3B82F6]/30', x: 65, y: 20 },
        { id: 'smart_queue', label: 'Smart Queue', type: 'component', icon: Workflow, color: 'text-[#93C5FD]', bg: 'bg-[#3B82F6]/10', border: 'border-[#3B82F6]/30', x: 65, y: 40 },
        { id: 'enrollment', label: 'Enrollment Form', type: 'component', icon: GitCommit, color: 'text-[#93C5FD]', bg: 'bg-[#3B82F6]/10', border: 'border-[#3B82F6]/30', x: 65, y: 60 },
        { id: 'disposition', label: 'Disposition', type: 'component', icon: GitCommit, color: 'text-[#FB923C]', bg: 'bg-[#F97316]/10', border: 'border-[#F97316]/30', x: 65, y: 80 },
    ];

    const approvedFlowNodes = [
        { id: 'pending_sale', label: 'Agent Submits Sale', type: 'event', icon: GitCommit, color: 'text-[#94A3B8]', bg: 'bg-surface-main shadow-inner', border: 'border-border-subtle', x: 50, y: 15 },
        { id: 'admin_approves', label: 'Admin Approves (Terminal)', type: 'event', icon: ShieldCheck, color: 'text-[#34D399]', bg: 'bg-[#10B981]/10', border: 'border-[#10B981]/50', x: 50, y: 35 },
        { id: 'crm_update', label: 'CRM Sync (Status = Approved)', type: 'state', icon: Server, color: 'text-[#60A5FA]', bg: 'bg-[#3B82F6]/10', border: 'border-[#3B82F6]/50', x: 50, y: 55 },
        
        { id: 'admin_dash_rev', label: 'Admin Revenue KPI', type: 'component', icon: Zap, color: 'text-[#4ADE80]', bg: 'bg-[#22C55E]/10', border: 'border-[#22C55E]/50', x: 20, y: 85 },
        { id: 'admin_health', label: 'Health Scorecard', type: 'component', icon: Activity, color: 'text-[#F472B6]', bg: 'bg-[#EC4899]/10', border: 'border-[#EC4899]/50', x: 50, y: 85 },
        { id: 'admin_audit', label: 'Audit / Ledger', type: 'component', icon: Database, color: 'text-[#C084FC]', bg: 'bg-[#A855F7]/10', border: 'border-[#A855F7]/50', x: 80, y: 85 },

        { id: 'agent_metrics', label: 'Agent Dash Metrics', type: 'component', icon: Users, color: 'text-[#22D3EE]', bg: 'bg-[#06B6D4]/10', border: 'border-[#06B6D4]/50', x: 15, y: 55 },
        { id: 'smart_queue_adv', label: 'Queue Advances', type: 'component', icon: Workflow, color: 'text-[#FB923C]', bg: 'bg-[#F97316]/10', border: 'border-[#F97316]/50', x: 85, y: 55 },
    ];

    const clmNodes = [
        { id: 'approved_event', label: 'Sale Approved', type: 'event', icon: Zap, color: 'text-[#4ADE80]', bg: 'bg-[#22C55E]/10', border: 'border-[#22C55E]/30', x: 50, y: 20 },
        { id: 'clm_engine', label: 'CRM Lifecycle Engine', type: 'process', icon: Server, color: 'text-[#34D399]', bg: 'bg-[#10B981]/10', border: 'border-[#10B981]/30', x: 50, y: 40 },
        { id: 'agent_queue', label: 'Agent Notification Queue', type: 'component', icon: Workflow, color: 'text-[#60A5FA]', bg: 'bg-[#3B82F6]/10', border: 'border-[#3B82F6]/30', x: 50, y: 60 },
        
        { id: 'feedback_call', label: 'Follow Up / Feedback', type: 'event', icon: Activity, color: 'text-[#F472B6]', bg: 'bg-[#EC4899]/10', border: 'border-[#EC4899]/30', x: 20, y: 80 },
        { id: 'upsell_call', label: 'Cross/Up-Sell Offer', type: 'event', icon: Target, color: 'text-[#FB923C]', bg: 'bg-[#F97316]/10', border: 'border-[#F97316]/30', x: 50, y: 80 },
        { id: 'reorder_call', label: 'Reorder / Winback', type: 'event', icon: RefreshCw, color: 'text-[#C084FC]', bg: 'bg-[#A855F7]/10', border: 'border-[#A855F7]/30', x: 80, y: 80 },
        { id: 'repeat_cycle', label: 'Revenue Loop (Cycle)', type: 'loop', icon: Repeat, color: 'text-[#6EE7B7]', bg: 'bg-[#10B981]/20', border: 'border-[#10B981]/60', x: 80, y: 40 },
    ];

    const cxNodes = [
        { id: 'customer_profile', label: 'Customers Feel Known', type: 'state', icon: Heart, color: 'text-[#F472B6]', bg: 'bg-[#EC4899]/10', border: 'border-[#EC4899]/30', x: 25, y: 30 },
        { id: 'service_interaction', label: 'Service Interactions', type: 'event', icon: Workflow, color: 'text-[#60A5FA]', bg: 'bg-[#3B82F6]/10', border: 'border-[#3B82F6]/30', x: 50, y: 30 },
        { id: 'retention_rate', label: 'Stay Longer (Retention)', type: 'variable', icon: ShieldCheck, color: 'text-[#34D399]', bg: 'bg-[#10B981]/10', border: 'border-[#10B981]/30', x: 25, y: 70 },
        { id: 'order_value', label: 'Higher Order Value', type: 'variable', icon: TrendingUp, color: 'text-[#C084FC]', bg: 'bg-[#A855F7]/10', border: 'border-[#A855F7]/30', x: 75, y: 70 },
        { id: 'growth_engine', label: 'CX Growth Engine', type: 'loop', icon: Zap, color: 'text-[#4ADE80]', bg: 'bg-[#22C55E]/20', border: 'border-[#22C55E]/60', x: 50, y: 85 },
    ];

    const gamificationNodes = [
        { id: 'leaderboard', label: 'Clear Leaderboards', type: 'component', icon: Trophy, color: 'text-[#FBBF24]', bg: 'bg-[#F59E0B]/10', border: 'border-[#F59E0B]/30', x: 50, y: 30 },
        { id: 'peer_competition', label: 'Intra-team Competition', type: 'event', icon: Users, color: 'text-[#60A5FA]', bg: 'bg-[#3B82F6]/10', border: 'border-[#3B82F6]/30', x: 25, y: 55 },
        { id: 'morale', label: 'High Morale', type: 'variable', icon: Heart, color: 'text-[#F472B6]', bg: 'bg-[#EC4899]/10', border: 'border-[#EC4899]/30', x: 50, y: 80 },
        { id: 'agent_effort_gamified', label: 'Sustained Effort', type: 'variable', icon: Activity, color: 'text-[#34D399]', bg: 'bg-[#10B981]/10', border: 'border-[#10B981]/30', x: 75, y: 55 },
        { id: 'sales_volume_gamified', label: 'Sales Volume', type: 'variable', icon: Zap, color: 'text-[#4ADE80]', bg: 'bg-[#22C55E]/10', border: 'border-[#22C55E]/30', x: 50, y: 55 },
    ];

    const getNodesByMode = () => {
        switch(viewMode) {
            case 'sustainability': return [...coreNodes, ...sustainNodes];
            case 'actor': return coreNodes;
            case 'cld': return cldNodes;
            case 'sna': return snaNodes;
            case 'terminals': return terminalNodes;
            case 'approved_flow': return approvedFlowNodes;
            case 'clm_loop': return clmNodes;
            case 'cx_growth': return cxNodes;
            case 'gamification': return gamificationNodes;
            case 'core':
            default: return coreNodes;
        }
    };

    const nodes = getNodesByMode();

    const coreEdges = [
        { source: 'admin', target: 'playbooks', type: 'configures', pulse: false, strokeDasharray: "" },
        { source: 'agents', target: 'playbooks', type: 'executes', pulse: true, strokeDasharray: "" },
        { source: 'agents', target: 'crm', type: 'reads/writes', pulse: true, strokeDasharray: "" },
        { source: 'customers', target: 'enrollment', type: 'enters', pulse: true, strokeDasharray: "" },
        { source: 'playbooks', target: 'crm', type: 'updates', pulse: true, strokeDasharray: "" },
        { source: 'enrollment', target: 'crm', type: 'writes', pulse: true, strokeDasharray: "" },
        { source: 'enrollment', target: 'payment', type: 'triggers', pulse: true, strokeDasharray: "" },
        { source: 'ai', target: 'playbooks', type: 'suggests', pulse: true, strokeDasharray: "" },
        { source: 'ai', target: 'crm', type: 'analyzes', pulse: false, strokeDasharray: "" },
    ];

    const sustainEdges = [
        { source: 'burnout', target: 'agents', type: 'degrades', pulse: false, strokeDasharray: "4 4" },
        { source: 'compliance', target: 'enrollment', type: 'constrains', pulse: false, strokeDasharray: "4 4" },
        { source: 'retention', target: 'burnout', type: 'mitigates', pulse: true, strokeDasharray: "" },
        { source: 'automation', target: 'enrollment', type: 'streamlines', pulse: true, strokeDasharray: "" },
        { source: 'customers', target: 'feedback', type: 'signals', pulse: true, strokeDasharray: "4 4" },
        { source: 'feedback', target: 'playbooks', type: 'evolves', pulse: true, strokeDasharray: "" },
        { source: 'feedback', target: 'retention', type: 'informs', pulse: false, strokeDasharray: "4 4" },
    ];

    const cldEdges = [
        { source: 'sales_pressure', target: 'agent_effort', type: '+ increases', pulse: true, strokeDasharray: "" },
        { source: 'agent_effort', target: 'customer_satisfaction', type: '+ increases', pulse: true, strokeDasharray: "" },
        { source: 'agent_effort', target: 'revenue', type: '+ increases', pulse: true, strokeDasharray: "" },
        { source: 'agent_effort', target: 'burnout', type: '+ increases', pulse: false, strokeDasharray: "" },
        { source: 'burnout', target: 'attrition', type: '+ increases', pulse: false, strokeDasharray: "" },
        { source: 'attrition', target: 'agent_effort', type: '- decreases', pulse: false, strokeDasharray: "4 4" },
        { source: 'attrition', target: 'training_cost', type: '+ increases', pulse: false, strokeDasharray: "" },
        { source: 'training_cost', target: 'sales_pressure', type: '+ increases', pulse: true, strokeDasharray: "" },
        { source: 'customer_satisfaction', target: 'revenue', type: '+ increases', pulse: true, strokeDasharray: "" },
        { source: 'revenue', target: 'sales_pressure', type: '- decreases', pulse: false, strokeDasharray: "4 4" },
    ];

    const snaEdges = [
        { source: 'admin1', target: 'team_alpha', type: 'manages', pulse: true, strokeDasharray: "" },
        { source: 'admin1', target: 'team_beta', type: 'manages', pulse: true, strokeDasharray: "" },
        { source: 'admin1', target: 'qa_team', type: 'oversees', pulse: false, strokeDasharray: "4 4" },
        { source: 'admin1', target: 'external_vendors', type: 'contracts', pulse: false, strokeDasharray: "4 4" },
        { source: 'team_alpha', target: 'team_beta', type: 'collaborates', pulse: true, strokeDasharray: "4 4" },
        { source: 'qa_team', target: 'team_alpha', type: 'audits', pulse: true, strokeDasharray: "" },
        { source: 'qa_team', target: 'team_beta', type: 'audits', pulse: true, strokeDasharray: "" },
        { source: 'team_alpha', target: 'external_vendors', type: 'consults', pulse: true, strokeDasharray: "4 4" },
    ];

    const terminalEdges = [
        { source: 'admin_root', target: 'sys_config', type: 'accesses', pulse: false, strokeDasharray: "" },
        { source: 'admin_root', target: 'roster_mgr', type: 'accesses', pulse: false, strokeDasharray: "" },
        { source: 'admin_root', target: 'audit_dash', type: 'accesses', pulse: false, strokeDasharray: "" },
        { source: 'admin_root', target: 'ledger_admin', type: 'accesses', pulse: false, strokeDasharray: "" },

        { source: 'sys_config', target: 'state_bus', type: 'publishes config', pulse: true, strokeDasharray: "" },
        { source: 'roster_mgr', target: 'state_bus', type: 'updates users', pulse: true, strokeDasharray: "" },
        { source: 'state_bus', target: 'audit_dash', type: 'feeds logs', pulse: true, strokeDasharray: "4 4" },
        { source: 'state_bus', target: 'ledger_admin', type: 'feeds sales', pulse: true, strokeDasharray: "4 4" },

        { source: 'state_bus', target: 'agent_dash', type: 'dictates UI', pulse: true, strokeDasharray: "4 4" },
        { source: 'state_bus', target: 'smart_queue', type: 'routes leads', pulse: true, strokeDasharray: "4 4" },
        { source: 'state_bus', target: 'enrollment', type: 'enforces rules', pulse: false, strokeDasharray: "4 4" },

        { source: 'agent_dash', target: 'agent_root', type: 'renders', pulse: false, strokeDasharray: "" },
        { source: 'smart_queue', target: 'agent_root', type: 'renders', pulse: false, strokeDasharray: "" },
        { source: 'enrollment', target: 'agent_root', type: 'renders', pulse: false, strokeDasharray: "" },
        { source: 'disposition', target: 'agent_root', type: 'renders', pulse: false, strokeDasharray: "" },
        
        { source: 'agent_root', target: 'disposition', type: 'inputs data', pulse: true, strokeDasharray: "" },
        { source: 'agent_root', target: 'enrollment', type: 'submits', pulse: true, strokeDasharray: "" },
        { source: 'disposition', target: 'state_bus', type: 'updates state', pulse: true, strokeDasharray: "" },
        { source: 'enrollment', target: 'state_bus', type: 'writes sale', pulse: true, strokeDasharray: "" },
    ];

    const approvedFlowEdges = [
        { source: 'pending_sale', target: 'admin_approves', type: 'awaits approval', pulse: true, strokeDasharray: "4 4" },
        { source: 'admin_approves', target: 'crm_update', type: 'triggers dispatch', pulse: true, strokeDasharray: "" },
        
        { source: 'crm_update', target: 'admin_dash_rev', type: 'sum(amount)', pulse: true, strokeDasharray: "" },
        { source: 'crm_update', target: 'admin_health', type: 'approved++', pulse: true, strokeDasharray: "" },
        { source: 'crm_update', target: 'admin_audit', type: 'appends journal log', pulse: false, strokeDasharray: "4 4" },

        { source: 'crm_update', target: 'agent_metrics', type: 'commissions++', pulse: true, strokeDasharray: "" },
        { source: 'crm_update', target: 'smart_queue_adv', type: 'clears pending', pulse: true, strokeDasharray: "4 4" },
    ];

    const clmEdges = [
        { source: 'approved_event', target: 'clm_engine', type: 'activates timeline', pulse: true, strokeDasharray: "" },
        { source: 'clm_engine', target: 'agent_queue', type: 'auto-schedules lead', pulse: true, strokeDasharray: "4 4" },
        
        { source: 'agent_queue', target: 'feedback_call', type: 'Agent Call (Day 7)', pulse: true, strokeDasharray: "" },
        { source: 'feedback_call', target: 'upsell_call', type: 'Agent Call (Day 30)', pulse: true, strokeDasharray: "" },
        { source: 'upsell_call', target: 'reorder_call', type: 'Agent Call (Day 60)', pulse: true, strokeDasharray: "" },
        
        { source: 'reorder_call', target: 'repeat_cycle', type: 'creates reorder', pulse: true, strokeDasharray: "4 4" },
        { source: 'repeat_cycle', target: 'admin_dash_rev', type: 'revenue++', pulse: true, strokeDasharray: "4 4" },
        { source: 'repeat_cycle', target: 'clm_engine', type: 're-enters CLM', pulse: true, strokeDasharray: "" },
    ];

    const cxEdges = [
        { source: 'customer_profile', target: 'service_interaction', type: 'personalizes', pulse: true, strokeDasharray: "" },
        { source: 'service_interaction', target: 'retention_rate', type: 'builds trust', pulse: true, strokeDasharray: "4 4" },
        { source: 'service_interaction', target: 'order_value', type: 'uncovers needs', pulse: true, strokeDasharray: "4 4" },
        { source: 'retention_rate', target: 'growth_engine', type: 'compounds value', pulse: true, strokeDasharray: "" },
        { source: 'order_value', target: 'growth_engine', type: 'multiplies impact', pulse: true, strokeDasharray: "" },
        { source: 'growth_engine', target: 'customer_profile', type: 'enriches data', pulse: true, strokeDasharray: "4 4" },
    ];

    const gamificationEdges = [
        { source: 'leaderboard', target: 'peer_competition', type: 'fosters', pulse: true, strokeDasharray: "4 4" },
        { source: 'peer_competition', target: 'morale', type: 'keeps high', pulse: false, strokeDasharray: "" },
        { source: 'morale', target: 'agent_effort_gamified', type: 'sustains', pulse: true, strokeDasharray: "4 4" },
        { source: 'agent_effort_gamified', target: 'sales_volume_gamified', type: 'increases', pulse: true, strokeDasharray: "" },
        { source: 'sales_volume_gamified', target: 'leaderboard', type: 'updates rank', pulse: true, strokeDasharray: "" },
    ];

    const getEdgesByMode = () => {
        switch(viewMode) {
            case 'sustainability': return [...coreEdges, ...sustainEdges];
            case 'actor': return coreEdges.filter(e => e.source === 'admin' || e.source === 'agents' || e.target === 'agents' || e.target === 'admin' || e.source === 'customers' || e.target === 'customers');
            case 'cld': return cldEdges;
            case 'sna': return snaEdges;
            case 'terminals': return terminalEdges;
            case 'approved_flow': return approvedFlowEdges;
            case 'clm_loop': return clmEdges;
            case 'cx_growth': return cxEdges;
            case 'gamification': return gamificationEdges;
            case 'core':
            default: return coreEdges;
        }
    };

    const edges = getEdgesByMode();

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <SectionHeader icon={Network} title="Ecosystem Mapping" sub="System Architecture & Service Relationships" color="text-[#22D3EE]" />
            
            <p className="text-base text-text-muted leading-relaxed max-w-3xl font-medium">
                Visualize the relationships, components, feedback loops, and patterns inside the platform ecosystem. 
                Instead of treating a problem as a simple sequence of steps, this map helps you see how different 
                actors, processes, resources, and pressures influence one another in real-time.
            </p>

            <div className="flex flex-wrap items-center gap-3 border-b border-border-subtle pb-6">
                {[
                    { id: 'core', label: 'Core Services', color: 'bg-[#3B82F6]' },
                    { id: 'sustainability', label: 'Sustainability', color: 'bg-[#F59E0B]' },
                    { id: 'actor', label: 'Actor Mapping', color: 'bg-[#3B82F6]' },
                    { id: 'cld', label: 'Causal Loop (CLD)', color: 'bg-[#10B981]' },
                    { id: 'sna', label: 'Network Analysis (SNA)', color: 'bg-[#A855F7]' },
                    { id: 'terminals', label: 'User Views', color: 'bg-[#6366F1]' },
                    { id: 'approved_flow', label: 'Sale Approved Matrix', color: 'bg-[#10B981]' },
                    { id: 'clm_loop', label: 'Customer Lifecycle', color: 'bg-[#F97316]' },
                    { id: 'cx_growth', label: 'CX as Growth Engine', color: 'bg-[#EC4899]' },
                    { id: 'gamification', label: 'Gamification & Morale', color: 'bg-[#F59E0B]' },
                ].map(mode => (
                    <button 
                        key={mode.id}
                        onClick={() => setViewMode(mode.id as any)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide transition-all duration-300 ${viewMode === mode.id ? `${mode.color} text-white shadow-lg border border-white/20` : 'bg-surface-main text-text-muted hover:text-text-primary border border-border-subtle hover:border-border-strong'}`}
                    >
                        {mode.label}
                    </button>
                ))}
            </div>

            <div className="min-h-[550px] bg-surface-main overflow-hidden relative border border-border-subtle rounded-xl group shadow-inner">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 max-w-full h-full pointer-events-none opacity-30" style={{ backgroundImage: 'radial-gradient(var(--border-strong) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                <svg className="w-full h-full absolute inset-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {edges.map((edge, i) => {
                        const sourceNode = nodes.find(n => n.id === edge.source);
                        const targetNode = nodes.find(n => n.id === edge.target);
                        if (!sourceNode || !targetNode) return null;
                        
                        const isActive = activeNode === null || activeNode === edge.source || activeNode === edge.target;
                        
                        return (
                            <g key={i} className={`transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-[0.15]'}`}>
                                <path 
                                    d={`M ${sourceNode.x} ${sourceNode.y} Q ${(sourceNode.x + targetNode.x) / 2 + 10} ${(sourceNode.y + targetNode.y) / 2 - 10} ${targetNode.x} ${targetNode.y}`}
                                    fill="none" 
                                    stroke="var(--border-strong)" 
                                    strokeWidth="0.4"
                                    strokeDasharray={edge.strokeDasharray}
                                    className="drop-shadow-md opacity-50"
                                />
                                {edge.pulse && isActive && (
                                    <circle r="0.6" fill="#3B82F6" className="animate-[dash_3s_linear_infinite] shadow-sm">
                                        <animateMotion dur="3s" repeatCount="indefinite" path={`M ${sourceNode.x} ${sourceNode.y} Q ${(sourceNode.x + targetNode.x) / 2 + 10} ${(sourceNode.y + targetNode.y) / 2 - 10} ${targetNode.x} ${targetNode.y}`} />
                                    </circle>
                                )}
                            </g>
                        );
                    })}
                </svg>

                <div className="w-full h-full absolute inset-0">
                    <AnimatePresence>
                        {nodes.map(node => (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: activeNode === node.id || activeNode === null ? 1 : 0.9 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                key={node.id}
                                className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${activeNode === node.id || activeNode === null ? 'z-20' : 'opacity-40 z-10'}`}
                                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                                onMouseEnter={() => setActiveNode(node.id)}
                                onMouseLeave={() => setActiveNode(null)}
                            >
                                <div className={`p-4 rounded-lg border border-white/5 ${node.bg} shadow-sm  relative transition-all group-hover:scale-105`}>
                                    <node.icon className={`w-8 h-8 ${node.color}`} strokeWidth={1.5} />
                                    <div className={`absolute -inset-2 rounded-xl border border-dashed ${node.border} animate-[spin_10s_linear_infinite] opacity-50`} />
                                </div>
                                <div className="text-center bg-surface-main/90 backdrop-blur-2xl px-4 py-2 rounded-xl border border-border-subtle shadow-xl">
                                    <p className={`text-xs font-bold whitespace-nowrap ${node.color} tracking-wide`}>{node.label}</p>
                                    <p className="text-[10px] uppercase font-bold text-text-muted tracking-wide mt-0.5">{node.type}</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Edge tooltips when active */}
                <AnimatePresence>
                    {activeNode && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-6 left-6 right-6 bg-surface-main/95 backdrop-blur-2xl border border-border-subtle p-5 rounded-xl shadow-2xl flex gap-6 overflow-x-auto custom-scrollbar pointer-events-auto z-30"
                        >
                            <div className="shrink-0 flex items-center gap-4 pr-6 border-r border-border-subtle">
                                {(() => {
                                    const activeData = nodes.find(n => n.id === activeNode);
                                    return activeData ? (
                                        <>
                                            <div className={`p-3 rounded-xl border border-white/5 ${activeData.bg} shadow-inner`}><activeData.icon className={`w-6 h-6 ${activeData.color}`} /></div>
                                            <div>
                                                <p className="text-sm font-bold text-text-primary tracking-wide">{activeData.label}</p>
                                                <p className="text-xs font-bold text-text-muted uppercase tracking-wide mt-1">{activeData.type} Node</p>
                                            </div>
                                        </>
                                    ) : null;
                                })()}
                            </div>
                            <div className="flex flex-wrap gap-5 items-center">
                                {edges.filter(e => e.source === activeNode).map(e => {
                                    const target = nodes.find(n => n.id === e.target);
                                    return (
                                        <div key={e.target} className="flex flex-col text-sm space-y-1.5 font-medium">
                                            <span className="text-text-muted uppercase tracking-wide text-xs font-bold">Outbound: <span className="font-bold text-text-primary ml-1">{e.type}</span></span>
                                            <span className="font-bold border border-border-strong px-3 py-1.5 rounded-lg bg-surface-alt text-text-primary shadow-inner">{target?.label}</span>
                                        </div>
                                    )
                                })}
                                {edges.filter(e => e.target === activeNode).map(e => {
                                    const source = nodes.find(n => n.id === e.source);
                                    return (
                                        <div key={e.source} className="flex flex-col text-sm space-y-1.5 font-medium">
                                            <span className="text-text-muted uppercase tracking-wide text-xs font-bold">Inbound: <span className="font-bold text-text-primary ml-1">{e.type}</span></span>
                                            <span className="font-bold border border-border-strong px-3 py-1.5 rounded-lg bg-surface-alt text-text-primary shadow-inner">{source?.label}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className={`grid gap-5 mt-8 grid-cols-2 lg:grid-cols-4`}>
                {(viewMode === 'core' || viewMode === 'sustainability' || viewMode === 'actor') && (
                    <div className="p-6 bg-surface-main/50 border border-border-subtle rounded-xl shadow-inner">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-[#3B82F6]/10 rounded-lg"><Users className="text-[#60A5FA] w-4 h-4" /></div>
                            <h4 className="font-bold text-sm text-text-primary tracking-wide">Actors</h4>
                        </div>
                        <p className="text-sm text-text-muted font-medium leading-relaxed">Participants triggering events (Admins, Agents, Leads).</p>
                    </div>
                )}
                {(viewMode === 'core' || viewMode === 'sustainability') && (
                    <>
                        <div className="p-6 bg-surface-main/50 border border-border-subtle rounded-xl shadow-inner">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-[#F97316]/10 rounded-lg"><Workflow className="text-[#FB923C] w-4 h-4" /></div>
                                <h4 className="font-bold text-sm text-text-primary tracking-wide">Processes</h4>
                            </div>
                            <p className="text-sm text-text-muted font-medium leading-relaxed">Orchestrated sequences (Enrollment, Automation, Telemetry).</p>
                        </div>
                        <div className="p-6 bg-surface-main/50 border border-border-subtle rounded-xl shadow-inner">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-[#06B6D4]/10 rounded-lg"><Database className="text-[#22D3EE] w-4 h-4" /></div>
                                <h4 className="font-bold text-sm text-text-primary tracking-wide">Resources</h4>
                            </div>
                            <p className="text-sm text-text-muted font-medium leading-relaxed">Infrastructure, data stores, API gateways.</p>
                        </div>
                    </>
                )}
                {viewMode === 'sustainability' && (
                    <>
                        <div className="p-6 bg-surface-main/50 border border-border-subtle rounded-xl shadow-inner">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-[#EF4444]/10 rounded-lg"><TrendingDown className="text-[#EF4444] w-4 h-4" /></div>
                                <h4 className="font-bold text-sm text-text-primary tracking-wide">Pressures</h4>
                            </div>
                            <p className="text-sm text-text-muted font-medium leading-relaxed">External or systemic forces that degrade ecosystem health over time.</p>
                        </div>
                        <div className="p-6 bg-surface-main/50 border border-border-subtle rounded-xl shadow-inner">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-[#06B6D4]/10 rounded-lg"><Target className="text-[#67E8F9] w-4 h-4" /></div>
                                <h4 className="font-bold text-sm text-text-primary tracking-wide">Interventions</h4>
                            </div>
                            <p className="text-sm text-text-muted font-medium leading-relaxed">Strategic leverage points designed to mitigate pressures and restore balance.</p>
                        </div>
                    </>
                )}
                {viewMode === 'cld' && (
                    <>
                        <div className="p-6 bg-surface-main/50 border border-border-subtle rounded-xl shadow-inner">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-[#3B82F6]/10 rounded-lg"><Activity className="text-[#60A5FA] w-4 h-4" /></div>
                                <h4 className="font-bold text-sm text-text-primary tracking-wide">Variables</h4>
                            </div>
                            <p className="text-sm text-text-muted font-medium leading-relaxed">Measurable factors within the system that interact.</p>
                        </div>
                        <div className="p-6 bg-surface-main/50 border border-border-subtle rounded-xl shadow-inner">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-[#EF4444]/10 rounded-lg"><Repeat className="text-[#F87171] w-4 h-4" /></div>
                                <h4 className="font-bold text-sm text-text-primary tracking-wide">Reinforcing Loop</h4>
                            </div>
                            <p className="text-sm text-text-muted font-medium leading-relaxed">A loop that amplifies change (e.g., Burnout → Attrition → More Burnout).</p>
                        </div>
                        <div className="p-6 bg-surface-main/50 border border-border-subtle rounded-xl shadow-inner">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-[#10B981]/10 rounded-lg"><RefreshCw className="text-[#34D399] w-4 h-4" /></div>
                                <h4 className="font-bold text-sm text-text-primary tracking-wide">Balancing Loop</h4>
                            </div>
                            <p className="text-sm text-text-muted font-medium leading-relaxed">A loop that counters change and creates stability in the system.</p>
                        </div>
                    </>
                )}
                {viewMode === 'sna' && (
                    <>
                        <div className="p-6 bg-surface-main/50 border border-border-subtle rounded-xl shadow-inner">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-[#A855F7]/10 rounded-lg"><ShieldCheck className="text-[#C084FC] w-4 h-4" /></div>
                                <h4 className="font-bold text-sm text-text-primary tracking-wide">Central Nodes</h4>
                            </div>
                            <p className="text-sm text-text-muted font-medium leading-relaxed">Highly connected individuals with significant influence over the network.</p>
                        </div>
                        <div className="p-6 bg-surface-main/50 border border-border-subtle rounded-xl shadow-inner">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-[#3B82F6]/10 rounded-lg"><Users className="text-[#60A5FA] w-4 h-4" /></div>
                                <h4 className="font-bold text-sm text-text-primary tracking-wide">Clusters</h4>
                            </div>
                            <p className="text-sm text-text-muted font-medium leading-relaxed">Tightly knit groups or sub-teams that operate with overlapping ties.</p>
                        </div>
                        <div className="p-6 bg-surface-main/50 border border-border-subtle rounded-xl shadow-inner">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-[#10B981]/10 rounded-lg"><Share2 className="text-[#34D399] w-4 h-4" /></div>
                                <h4 className="font-bold text-sm text-text-primary tracking-wide">Bridges</h4>
                            </div>
                            <p className="text-sm text-text-muted font-medium leading-relaxed">Entities facilitating communication between disconnected clusters.</p>
                        </div>
                    </>
                )}
                {viewMode === 'terminals' && (
                    <>
                        <div className="p-6 bg-surface-main/50 border border-border-subtle rounded-xl shadow-inner">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-[#3B82F6]/10 rounded-lg"><MonitorSmartphone className="text-[#60A5FA] w-4 h-4" /></div>
                                <h4 className="font-bold text-sm text-text-primary tracking-wide">Interfaces</h4>
                            </div>
                            <p className="text-sm text-text-muted font-medium leading-relaxed">The core root interfaces for each type of system actor.</p>
                        </div>
                        <div className="p-6 bg-surface-main/50 border border-border-subtle rounded-xl shadow-inner">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-[#F97316]/10 rounded-lg"><GitCommit className="text-[#FB923C] w-4 h-4" /></div>
                                <h4 className="font-bold text-sm text-text-primary tracking-wide">Input/Output</h4>
                            </div>
                            <p className="text-sm text-text-muted font-medium leading-relaxed">Components reacting to and gathering explicit data inputs from users.</p>
                        </div>
                        <div className="p-6 bg-surface-main/50 border border-border-subtle rounded-xl shadow-inner">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-[#10B981]/10 rounded-lg"><Server className="text-[#34D399] w-4 h-4" /></div>
                                <h4 className="font-bold text-sm text-text-primary tracking-wide">State Engine</h4>
                            </div>
                            <p className="text-sm text-text-muted font-medium leading-relaxed">The central sync engine adjusting UI based on live Admin toggles.</p>
                        </div>
                    </>
                )}
            </div>
        </motion.div>
    );
};
