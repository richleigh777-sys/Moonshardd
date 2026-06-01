import React, { useState } from 'react';
import { Network, Users, Globe, Database, Activity, GitCommit, Bot, ShieldCheck, Mail, Workflow, Zap, AlertTriangle, Lightbulb, TrendingDown, Target, Scale, ZapOff, Repeat, RefreshCw, Briefcase, Share2, Server, MonitorSmartphone, Settings, Heart, TrendingUp, Trophy } from 'lucide-react';
import { Card } from '../../../../ui/Base';
import { SectionHeader } from '../SectionHeader';

export const EcosystemTab: React.FC = () => {
    const [activeNode, setActiveNode] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'core' | 'sustainability' | 'actor' | 'cld' | 'sna' | 'terminals' | 'approved_flow' | 'clm_loop' | 'cx_growth' | 'gamification'>('core');

    const coreNodes = [
        { id: 'admin', label: 'Command Deck', type: 'actor', icon: ShieldCheck, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', x: 50, y: 20 },
        { id: 'agents', label: 'Operatives', type: 'actor', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', x: 25, y: 45 },
        { id: 'customers', label: 'Customers', type: 'actor', icon: Globe, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', x: 75, y: 45 },
        
        { id: 'crm', label: 'Core DB', type: 'resource', icon: Database, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', x: 50, y: 55 },
        { id: 'ai', label: 'Gemini AI', type: 'resource', icon: Bot, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30', x: 25, y: 75 },
        { id: 'payment', label: 'Payment API', type: 'resource', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', x: 75, y: 75 },

        { id: 'playbooks', label: 'Playbook Engine', type: 'process', icon: Workflow, color: 'text-status-warning', bg: 'bg-status-warning/10', border: 'border-status-warning/30', x: 35, y: 35 },
        { id: 'enrollment', label: 'Enrollment', type: 'process', icon: GitCommit, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', x: 65, y: 60 },
    ];

    const sustainNodes = [
        { id: 'burnout', label: 'Agent Burnout', type: 'pressure', icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/50', x: 10, y: 30 },
        { id: 'compliance', label: 'Regulation', type: 'pressure', icon: Scale, color: 'text-emerald-600', bg: 'bg-emerald-600/10', border: 'border-emerald-600/50', x: 90, y: 30 },
        
        { id: 'retention', label: 'Wellness Focus', type: 'intervention', icon: Lightbulb, color: 'text-yellow-300', bg: 'bg-yellow-300/10', border: 'border-yellow-300/50', x: 20, y: 15 },
        { id: 'automation', label: 'Auto-Triage', type: 'intervention', icon: Target, color: 'text-cyan-300', bg: 'bg-cyan-300/10', border: 'border-cyan-300/50', x: 80, y: 15 },
        { id: 'feedback', label: 'Feedback Loop', type: 'leverage_point', icon: Activity, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/50', x: 50, y: 85 },
    ];

    const cldNodes = [
        { id: 'sales_pressure', label: 'Sales Pressure', type: 'variable', icon: Target, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/50', x: 20, y: 30 },
        { id: 'agent_effort', label: 'Agent Effort', type: 'variable', icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/50', x: 50, y: 20 },
        { id: 'customer_satisfaction', label: 'Customer Satisfaction', type: 'variable', icon: Globe, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/50', x: 80, y: 30 },
        { id: 'revenue', label: 'Revenue/Acquisitions', type: 'variable', icon: Zap, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/50', x: 80, y: 70 },
        { id: 'attrition', label: 'Agent Attrition', type: 'variable', icon: TrendingDown, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/50', x: 20, y: 70 },
        { id: 'training_cost', label: 'Training Cost', type: 'variable', icon: Briefcase, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/50', x: 50, y: 85 },
        { id: 'reinforcing_loop', label: 'Burnout Loop (R)', type: 'loop', icon: Repeat, color: 'text-red-300', bg: 'bg-red-500/20', border: 'border-red-500/60', x: 35, y: 50 },
        { id: 'balancing_loop', label: 'Sales Loop (B)', type: 'loop', icon: RefreshCw, color: 'text-emerald-300', bg: 'bg-emerald-500/20', border: 'border-emerald-500/60', x: 65, y: 50 },
    ];

    const snaNodes = [
        { id: 'admin1', label: 'Lead Admin', type: 'central_node', icon: ShieldCheck, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/50', x: 50, y: 50 },
        { id: 'team_alpha', label: 'Team Alpha', type: 'cluster', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/50', x: 25, y: 25 },
        { id: 'team_beta', label: 'Team Beta', type: 'cluster', icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/50', x: 75, y: 25 },
        { id: 'external_vendors', label: 'Vendors', type: 'cluster', icon: Briefcase, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/50', x: 75, y: 75 },
        { id: 'qa_team', label: 'QA / Compliance', type: 'cluster', icon: Target, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/50', x: 25, y: 75 },
    ];

    const terminalNodes = [
        { id: 'admin_root', label: 'Admin Portal', type: 'terminal', icon: ShieldCheck, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/50', x: 15, y: 50 },
        { id: 'sys_config', label: 'System Config', type: 'component', icon: Settings, color: 'text-purple-300', bg: 'bg-purple-500/10', border: 'border-purple-500/30', x: 35, y: 20 },
        { id: 'roster_mgr', label: 'Roster Manager', type: 'component', icon: Users, color: 'text-purple-300', bg: 'bg-purple-500/10', border: 'border-purple-500/30', x: 35, y: 40 },
        { id: 'audit_dash', label: 'Audit Log', type: 'component', icon: Activity, color: 'text-purple-300', bg: 'bg-purple-500/10', border: 'border-purple-500/30', x: 35, y: 60 },
        { id: 'ledger_admin', label: 'Sales Ledger', type: 'component', icon: Database, color: 'text-purple-300', bg: 'bg-purple-500/10', border: 'border-purple-500/30', x: 35, y: 80 },
        
        { id: 'state_bus', label: 'Global State (CRM)', type: 'state', icon: Server, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/50', x: 50, y: 50 },
        
        { id: 'agent_root', label: 'Agent Portal', type: 'terminal', icon: MonitorSmartphone, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/50', x: 85, y: 50 },
        { id: 'agent_dash', label: 'Agent Metrics Dash', type: 'component', icon: Activity, color: 'text-blue-300', bg: 'bg-blue-500/10', border: 'border-blue-500/30', x: 65, y: 20 },
        { id: 'smart_queue', label: 'Smart Queue', type: 'component', icon: Workflow, color: 'text-blue-300', bg: 'bg-blue-500/10', border: 'border-blue-500/30', x: 65, y: 40 },
        { id: 'enrollment', label: 'Enrollment Form', type: 'component', icon: GitCommit, color: 'text-blue-300', bg: 'bg-blue-500/10', border: 'border-blue-500/30', x: 65, y: 60 },
        { id: 'disposition', label: 'Disposition', type: 'component', icon: GitCommit, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', x: 65, y: 80 },
    ];

    const approvedFlowNodes = [
        { id: 'pending_sale', label: 'Agent Submits Sale', type: 'event', icon: GitCommit, color: 'text-slate-400', bg: 'bg-surface-alt', border: 'border-border-subtle', x: 50, y: 15 },
        { id: 'admin_approves', label: 'Admin Approves (Terminal)', type: 'event', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/50', x: 50, y: 35 },
        { id: 'crm_update', label: 'CRM Sync (Status = Approved)', type: 'state', icon: Server, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/50', x: 50, y: 55 },
        
        { id: 'admin_dash_rev', label: 'Admin Revenue KPI', type: 'component', icon: Zap, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/50', x: 20, y: 85 },
        { id: 'admin_health', label: 'Health Scorecard', type: 'component', icon: Activity, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/50', x: 50, y: 85 },
        { id: 'admin_audit', label: 'Audit / Ledger', type: 'component', icon: Database, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/50', x: 80, y: 85 },

        { id: 'agent_metrics', label: 'Agent Dash Metrics', type: 'component', icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/50', x: 15, y: 55 },
        { id: 'smart_queue_adv', label: 'Queue Advances', type: 'component', icon: Workflow, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/50', x: 85, y: 55 },
    ];

    const clmNodes = [
        { id: 'approved_event', label: 'Sale Approved', type: 'event', icon: Zap, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', x: 50, y: 20 },
        { id: 'clm_engine', label: 'CRM Lifecycle Engine', type: 'process', icon: Server, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', x: 50, y: 40 },
        { id: 'agent_queue', label: 'Agent Notification Queue', type: 'component', icon: Workflow, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', x: 50, y: 60 },
        
        { id: 'feedback_call', label: 'Follow Up / Feedback', type: 'event', icon: Activity, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30', x: 20, y: 80 },
        { id: 'upsell_call', label: 'Cross/Up-Sell Offer', type: 'event', icon: Target, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', x: 50, y: 80 },
        { id: 'reorder_call', label: 'Reorder / Winback', type: 'event', icon: RefreshCw, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', x: 80, y: 80 },
        { id: 'repeat_cycle', label: 'Revenue Loop (Cycle)', type: 'loop', icon: Repeat, color: 'text-emerald-300', bg: 'bg-emerald-500/20', border: 'border-emerald-500/60', x: 80, y: 40 },
    ];

    const cxNodes = [
        { id: 'customer_profile', label: 'Customers Feel Known', type: 'state', icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30', x: 25, y: 30 },
        { id: 'service_interaction', label: 'Service Interactions', type: 'event', icon: Workflow, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', x: 50, y: 30 },
        { id: 'retention_rate', label: 'Stay Longer (Retention)', type: 'variable', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', x: 25, y: 70 },
        { id: 'order_value', label: 'Higher Order Value', type: 'variable', icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', x: 75, y: 70 },
        { id: 'growth_engine', label: 'CX Growth Engine', type: 'loop', icon: Zap, color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/60', x: 50, y: 85 },
    ];

    const gamificationNodes = [
        { id: 'leaderboard', label: 'Clear Leaderboards', type: 'component', icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', x: 50, y: 30 },
        { id: 'peer_competition', label: 'Intra-team Competition', type: 'event', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', x: 25, y: 55 },
        { id: 'morale', label: 'High Morale', type: 'variable', icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30', x: 50, y: 80 },
        { id: 'agent_effort_gamified', label: 'Sustained Effort', type: 'variable', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', x: 75, y: 55 },
        { id: 'sales_volume_gamified', label: 'Sales Volume', type: 'variable', icon: Zap, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', x: 50, y: 55 },
    ];

    const getNodesByMode = () => {
        switch(viewMode) {
            case 'sustainability': return [...coreNodes, ...sustainNodes];
            case 'actor': return coreNodes; // Or a subset, we can just use core for actor mapping generally or emphasize actors.
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
            case 'actor': return coreEdges.filter(e => e.source === 'admin' || e.source === 'agents' || e.target === 'agents' || e.target === 'admin' || e.source === 'customers' || e.target === 'customers'); // Focus mostly on actors. Let's just return coreEdges for now and let the user see the system.
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
        <div className="space-y-6">
            <SectionHeader icon={Network} title="Ecosystem Mapping" sub="System Architecture & Service Relationships" color="text-cyan-400" />
            
            <p className="text-sm text-text-muted leading-relaxed">
                Visualize the relationships, components, feedback loops, and patterns inside the platform ecosystem. 
                Instead of treating a problem as a simple sequence of steps, this map helps you see how different 
                actors, processes, resources, and pressures influence one another in real-time.
            </p>

            <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle pb-4">
                <button 
                    onClick={() => setViewMode('core')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === 'core' ? 'bg-accent-primary text-white' : 'bg-surface-alt text-text-muted hover:text-text-primary'}`}
                >
                    Core Services
                </button>
                <button 
                    onClick={() => setViewMode('sustainability')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === 'sustainability' ? 'bg-amber-500 text-white' : 'bg-surface-alt text-text-muted hover:text-text-primary'}`}
                >
                    Sustainability
                </button>
                <button 
                    onClick={() => setViewMode('actor')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === 'actor' ? 'bg-blue-500 text-white' : 'bg-surface-alt text-text-muted hover:text-text-primary'}`}
                >
                    Actor Mapping
                </button>
                <button 
                    onClick={() => setViewMode('cld')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === 'cld' ? 'bg-emerald-500 text-white' : 'bg-surface-alt text-text-muted hover:text-text-primary'}`}
                >
                    Causal Loop (CLD)
                </button>
                <button 
                    onClick={() => setViewMode('sna')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === 'sna' ? 'bg-purple-500 text-white' : 'bg-surface-alt text-text-muted hover:text-text-primary'}`}
                >
                    Network Analysis (SNA)
                </button>
                <button 
                    onClick={() => setViewMode('terminals')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === 'terminals' ? 'bg-indigo-500 text-white' : 'bg-surface-alt text-text-muted hover:text-text-primary'}`}
                >
                    User Views
                </button>
                <button 
                    onClick={() => setViewMode('approved_flow')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === 'approved_flow' ? 'bg-emerald-400 text-slate-800' : 'bg-surface-alt text-text-muted hover:text-text-primary'}`}
                >
                    Sale Approved Matrix
                </button>
                <button 
                    onClick={() => setViewMode('clm_loop')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === 'clm_loop' ? 'bg-orange-500 text-white' : 'bg-surface-alt text-text-muted hover:text-text-primary'}`}
                >
                    Customer Lifecycle (CLM)
                </button>
                <button 
                    onClick={() => setViewMode('cx_growth')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === 'cx_growth' ? 'bg-pink-500 text-white' : 'bg-surface-alt text-text-muted hover:text-text-primary'}`}
                >
                    CX as Growth Engine
                </button>
                <button 
                    onClick={() => setViewMode('gamification')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === 'gamification' ? 'bg-amber-500 text-slate-900' : 'bg-surface-alt text-text-muted hover:text-text-primary'}`}
                >
                    Gamification & Morale
                </button>
            </div>

            <Card className="p-1 min-h-[500px] bg-surface-alt/20 overflow-hidden relative border-border-subtle group">
                <svg className="w-full h-full absolute inset-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {edges.map((edge, i) => {
                        const sourceNode = nodes.find(n => n.id === edge.source);
                        const targetNode = nodes.find(n => n.id === edge.target);
                        if (!sourceNode || !targetNode) return null;
                        
                        const isActive = activeNode === null || activeNode === edge.source || activeNode === edge.target;
                        
                        return (
                            <g key={i} className={`transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-10'}`}>
                                <path 
                                    d={`M ${sourceNode.x} ${sourceNode.y} Q ${(sourceNode.x + targetNode.x) / 2 + 10} ${(sourceNode.y + targetNode.y) / 2 - 10} ${targetNode.x} ${targetNode.y}`}
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="0.4"
                                    strokeDasharray={edge.strokeDasharray}
                                    className="text-border-strong drop-shadow-md"
                                />
                                {edge.pulse && isActive && (
                                    <circle r="0.6" fill="currentColor" className="text-accent-primary animate-[dash_3s_linear_infinite]">
                                        <animateMotion dur="3s" repeatCount="indefinite" path={`M ${sourceNode.x} ${sourceNode.y} Q ${(sourceNode.x + targetNode.x) / 2 + 10} ${(sourceNode.y + targetNode.y) / 2 - 10} ${targetNode.x} ${targetNode.y}`} />
                                    </circle>
                                )}
                            </g>
                        );
                    })}
                </svg>

                <div className="w-full h-full absolute inset-0">
                    {nodes.map(node => (
                        <div 
                            key={node.id}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer ${activeNode === node.id || activeNode === null ? 'scale-100 opacity-100 z-20' : 'scale-90 opacity-40 z-10'}`}
                            style={{ left: `${node.x}%`, top: `${node.y}%` }}
                            onMouseEnter={() => setActiveNode(node.id)}
                            onMouseLeave={() => setActiveNode(null)}
                        >
                            <div className={`p-4 rounded-full border-2 ${node.bg} ${node.border} shadow-xl backdrop-blur-md relative group-hover:shadow-[0_0_20px_var(--accent-primary)] transition-shadow`}>
                                <node.icon className={`w-8 h-8 ${node.color}`} />
                                <div className="absolute -inset-2 rounded-full border border-dashed border-text-muted/20 animate-[spin_10s_linear_infinite]" />
                            </div>
                            <div className="text-center bg-surface-main/80 backdrop-blur-md px-3 py-1 rounded-full border border-border-subtle shadow-lg">
                                <p className={`text-xs font-bold whitespace-nowrap ${node.color}`}>{node.label}</p>
                                <p className="text-[9px] uppercase font-bold text-text-muted tracking-wider">{node.type}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Edge tooltips when active */}
                {activeNode && (
                    <div className="absolute bottom-4 left-4 right-4 bg-surface-main/80 backdrop-blur-md border border-border-subtle p-4 rounded-xl shadow-xl flex gap-6 overflow-x-auto custom-scrollbar pointer-events-auto z-30">
                        <div className="shrink-0 flex items-center gap-3 pr-4 border-r border-border-subtle">
                            {(() => {
                                const activeData = nodes.find(n => n.id === activeNode);
                                return activeData ? (
                                    <>
                                        <div className={`p-2 rounded-lg ${activeData.bg}`}><activeData.icon className={`w-6 h-6 ${activeData.color}`} /></div>
                                        <div>
                                            <p className="text-sm font-bold text-text-primary">{activeData.label}</p>
                                            <p className="text-xs text-text-muted capitalize">{activeData.type} Node</p>
                                        </div>
                                    </>
                                ) : null;
                            })()}
                        </div>
                        <div className="flex flex-wrap gap-4 items-center">
                            {edges.filter(e => e.source === activeNode).map(e => {
                                const target = nodes.find(n => n.id === e.target);
                                return (
                                    <div key={e.target} className="flex flex-col text-xs space-y-1">
                                        <span className="text-text-muted">Outbound: <span className="font-bold text-text-primary">{e.type}</span></span>
                                        <span className="font-bold border border-border-subtle px-2 py-0.5 rounded-full bg-surface-alt">{target?.label}</span>
                                    </div>
                                )
                            })}
                            {edges.filter(e => e.target === activeNode).map(e => {
                                const source = nodes.find(n => n.id === e.source);
                                return (
                                    <div key={e.source} className="flex flex-col text-xs space-y-1">
                                        <span className="text-text-muted">Inbound: <span className="font-bold text-text-primary">{e.type}</span></span>
                                        <span className="font-bold border border-border-subtle px-2 py-0.5 rounded-full bg-surface-alt">{source?.label}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </Card>

            <div className={`grid gap-4 mt-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4`}>
                {(viewMode === 'core' || viewMode === 'sustainability' || viewMode === 'actor') && (
                    <Card className="p-4 bg-surface-main border-border-subtle">
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="text-blue-400 w-5 h-5" />
                            <h4 className="font-bold text-sm">Actors</h4>
                        </div>
                        <p className="text-xs text-text-muted">Participants triggering events (Admins, Agents, Leads).</p>
                    </Card>
                )}
                {(viewMode === 'core' || viewMode === 'sustainability') && (
                    <>
                        <Card className="p-4 bg-surface-main border-border-subtle">
                            <div className="flex items-center gap-2 mb-2">
                                <Workflow className="text-orange-400 w-5 h-5" />
                                <h4 className="font-bold text-sm">Processes</h4>
                            </div>
                            <p className="text-xs text-text-muted">Orchestrated sequences (Enrollment, Automation, Telemetry).</p>
                        </Card>
                        <Card className="p-4 bg-surface-main border-border-subtle">
                            <div className="flex items-center gap-2 mb-2">
                                <Database className="text-cyan-400 w-5 h-5" />
                                <h4 className="font-bold text-sm">Resources</h4>
                            </div>
                            <p className="text-xs text-text-muted">Infrastructure, data stores, API gateways.</p>
                        </Card>
                    </>
                )}
                {viewMode === 'sustainability' && (
                    <>
                        <Card className="p-4 bg-surface-main border-border-subtle">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingDown className="text-red-500 w-5 h-5" />
                                <h4 className="font-bold text-sm">Pressures</h4>
                            </div>
                            <p className="text-xs text-text-muted">External or systemic forces that degrade ecosystem health over time.</p>
                        </Card>
                        <Card className="p-4 bg-surface-main border-border-subtle">
                            <div className="flex items-center gap-2 mb-2">
                                <Target className="text-cyan-300 w-5 h-5" />
                                <h4 className="font-bold text-sm">Interventions</h4>
                            </div>
                            <p className="text-xs text-text-muted">Strategic leverage points designed to mitigate pressures and restore balance.</p>
                        </Card>
                    </>
                )}
                {viewMode === 'cld' && (
                    <>
                        <Card className="p-4 bg-surface-main border-border-subtle">
                            <div className="flex items-center gap-2 mb-2">
                                <Activity className="text-blue-400 w-5 h-5" />
                                <h4 className="font-bold text-sm">Variables</h4>
                            </div>
                            <p className="text-xs text-text-muted">Measurable factors within the system that interact.</p>
                        </Card>
                        <Card className="p-4 bg-surface-main border-border-subtle">
                            <div className="flex items-center gap-2 mb-2">
                                <Repeat className="text-red-400 w-5 h-5" />
                                <h4 className="font-bold text-sm">Reinforcing Loop (R)</h4>
                            </div>
                            <p className="text-xs text-text-muted">A loop that amplifies change (e.g., Burnout → Attrition → More Burnout).</p>
                        </Card>
                        <Card className="p-4 bg-surface-main border-border-subtle">
                            <div className="flex items-center gap-2 mb-2">
                                <RefreshCw className="text-emerald-400 w-5 h-5" />
                                <h4 className="font-bold text-sm">Balancing Loop (B)</h4>
                            </div>
                            <p className="text-xs text-text-muted">A loop that counters change and creates stability in the system.</p>
                        </Card>
                    </>
                )}
                {viewMode === 'sna' && (
                    <>
                        <Card className="p-4 bg-surface-main border-border-subtle">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck className="text-purple-400 w-5 h-5" />
                                <h4 className="font-bold text-sm">Central Nodes</h4>
                            </div>
                            <p className="text-xs text-text-muted">Highly connected individuals with significant influence over the network.</p>
                        </Card>
                        <Card className="p-4 bg-surface-main border-border-subtle">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="text-blue-400 w-5 h-5" />
                                <h4 className="font-bold text-sm">Clusters</h4>
                            </div>
                            <p className="text-xs text-text-muted">Tightly knit groups or sub-teams that operate with overlapping ties.</p>
                        </Card>
                        <Card className="p-4 bg-surface-main border-border-subtle">
                            <div className="flex items-center gap-2 mb-2">
                                <Share2 className="text-emerald-400 w-5 h-5" />
                                <h4 className="font-bold text-sm">Bridges</h4>
                            </div>
                            <p className="text-xs text-text-muted">Entities facilitating communication between disconnected clusters.</p>
                        </Card>
                    </>
                )}
                {viewMode === 'terminals' && (
                    <>
                        <Card className="p-4 bg-surface-main border-border-subtle">
                            <div className="flex items-center gap-2 mb-2">
                                <MonitorSmartphone className="text-blue-400 w-5 h-5" />
                                <h4 className="font-bold text-sm">Interfaces</h4>
                            </div>
                            <p className="text-xs text-text-muted">The core root interfaces for each type of system actor.</p>
                        </Card>
                        <Card className="p-4 bg-surface-main border-border-subtle">
                            <div className="flex items-center gap-2 mb-2">
                                <GitCommit className="text-orange-400 w-5 h-5" />
                                <h4 className="font-bold text-sm">Input / Output</h4>
                            </div>
                            <p className="text-xs text-text-muted">Components reacting to and gathering explicit data inputs from users.</p>
                        </Card>
                        <Card className="p-4 bg-surface-main border-border-subtle">
                            <div className="flex items-center gap-2 mb-2">
                                <Server className="text-emerald-400 w-5 h-5" />
                                <h4 className="font-bold text-sm">State & Config Bus</h4>
                            </div>
                            <p className="text-xs text-text-muted">The central sync engine adjusting client-side UI based on live Admin toggles.</p>
                        </Card>
                    </>
                )}
                {viewMode === 'approved_flow' && (
                    <>
                        <Card className="p-4 bg-surface-main border-border-subtle">
                            <div className="flex items-center gap-2 mb-2">
                                <MonitorSmartphone className="text-blue-400 w-5 h-5" />
                                <h4 className="font-bold text-sm">Interface Nodes</h4>
                            </div>
                            <p className="text-xs text-text-muted">Agent and Admin interfaces mapping local updates to global states via the central CRM store.</p>
                        </Card>
                        <Card className="p-4 bg-surface-main border-border-subtle">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="text-green-400 w-5 h-5" />
                                <h4 className="font-bold text-sm">Action Dispatches</h4>
                            </div>
                            <p className="text-xs text-text-muted">An update in status filters down to dependent components to trigger sum/count calculations on the frontend.</p>
                        </Card>
                        <Card className="p-4 bg-surface-main border-border-subtle">
                            <div className="flex items-center gap-2 mb-2">
                                <Workflow className="text-orange-400 w-5 h-5" />
                                <h4 className="font-bold text-sm">Feedback Impacts</h4>
                            </div>
                            <p className="text-xs text-text-muted">A closed deal refreshes queues, adds to analytics, and feeds data back into Admin KPI trackers immediately in real-time.</p>
                        </Card>
                    </>
                )}
                {viewMode === 'clm_loop' && (
                    <>
                        <Card className="p-4 bg-surface-main border-border-subtle">
                            <div className="flex items-center gap-2 mb-2">
                                <Server className="text-emerald-400 w-5 h-5" />
                                <h4 className="font-bold text-sm">CLM Engine</h4>
                            </div>
                            <p className="text-xs text-text-muted">Once a sale is approved, the CRM automatically schedules future timelines for this customer profile.</p>
                        </Card>
                        <Card className="p-4 bg-surface-main border-border-subtle">
                            <div className="flex items-center gap-2 mb-2">
                                <Workflow className="text-blue-400 w-5 h-5" />
                                <h4 className="font-bold text-sm">Agent Notification</h4>
                            </div>
                            <p className="text-xs text-text-muted">The system injects timed callback tasks (Feedback, Upsell, Reorder) straight into agent Smart Queues.</p>
                        </Card>
                        <Card className="p-4 bg-surface-main border-border-subtle">
                            <div className="flex items-center gap-2 mb-2">
                                <Repeat className="text-orange-400 w-5 h-5" />
                                <h4 className="font-bold text-sm">Revenue Cycle</h4>
                            </div>
                            <p className="text-xs text-text-muted">A successful win-back or reorder feeds right back into the engine, sustaining lifetime value (LTV).</p>
                        </Card>
                    </>
                )}
                {viewMode === 'cx_growth' && (
                    <>
                        <Card className="p-4 bg-surface-main border-border-subtle">
                            <div className="flex items-center gap-2 mb-2">
                                <Heart className="text-pink-400 w-5 h-5" />
                                <h4 className="font-bold text-sm">Service as Growth</h4>
                            </div>
                            <p className="text-xs text-text-muted">Turning every customer interaction into an opportunity for personalized upselling.</p>
                        </Card>
                        <Card className="p-4 bg-surface-main border-border-subtle">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck className="text-emerald-400 w-5 h-5" />
                                <h4 className="font-bold text-sm">Retention Impact</h4>
                            </div>
                            <p className="text-xs text-text-muted">Customers who feel known and valued predictably stay longer, expanding their lifespan.</p>
                        </Card>
                        <Card className="p-4 bg-surface-main border-border-subtle">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="text-purple-400 w-5 h-5" />
                                <h4 className="font-bold text-sm">Higher Order Value</h4>
                            </div>
                            <p className="text-xs text-text-muted">Trusted relationships allow agents to offer higher-tier solutions tailored to exact needs.</p>
                        </Card>
                    </>
                )}
                {viewMode === 'gamification' && (
                    <>
                        <Card className="p-4 bg-surface-main border-border-subtle">
                            <div className="flex items-center gap-2 mb-2">
                                <Trophy className="text-amber-400 w-5 h-5" />
                                <h4 className="font-bold text-sm">Clear Leaderboards</h4>
                            </div>
                            <p className="text-xs text-text-muted">Real-time ranking of agent performance based on approved sales and LTV contributions.</p>
                        </Card>
                        <Card className="p-4 bg-surface-main border-border-subtle">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="text-blue-400 w-5 h-5" />
                                <h4 className="font-bold text-sm">Intra-team Competition</h4>
                            </div>
                            <p className="text-xs text-text-muted">Fosters healthy peer-to-peer competition and accountability pushing standard volume metrics higher.</p>
                        </Card>
                        <Card className="p-4 bg-surface-main border-border-subtle">
                            <div className="flex items-center gap-2 mb-2">
                                <Heart className="text-pink-400 w-5 h-5" />
                                <h4 className="font-bold text-sm">Morale & Effort Loop</h4>
                            </div>
                            <p className="text-xs text-text-muted">Recognition and friendly rivalry keep morale high, directly sustaining long-term agent call effort.</p>
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
};
