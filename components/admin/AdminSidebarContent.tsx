import React from 'react';
import { 
    LayoutDashboard, Database, Contact, Zap, 
    PlusCircle, List, Banknote, RefreshCw, Grid, 
    Trophy, BarChart3, MessageSquare, FileText, 
    Package, Settings 
} from 'lucide-react';
import { TabTrigger, TabList } from '../ui/Tabs';

const SidebarHeader = ({ children, isCollapsed }: { children?: React.ReactNode, isCollapsed?: boolean }) => {
    if (isCollapsed) return <div className="h-px bg-white/10 my-1 mx-4 opacity-50" />;
    return (
        <div className="px-3 py-1 mt-0.5 mb-0 animate-in fade-in slide-in-from-left-2 duration-300">
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-500/60">{children}</p>
        </div>
    );
};

interface AdminSidebarContentProps {
    isAllowed: (id: string) => boolean;
}

export const AdminSidebarContent: React.FC<AdminSidebarContentProps> = ({ isAllowed }) => (
    <TabList className="flex flex-col gap-0 border-none pb-2">
        <SidebarHeader>Control Center</SidebarHeader>
        {isAllowed('overview') && <TabTrigger value="overview" icon={<LayoutDashboard size={14}/>}>Company Pulse</TabTrigger>}
        {isAllowed('nexus') && <TabTrigger value="nexus" icon={<Zap size={14}/>} className="text-amber-500 animate-pulse">Master Settings</TabTrigger>}
        
        <SidebarHeader>Sales & Agents</SidebarHeader>
        {isAllowed('enrollment') && <TabTrigger value="enrollment" icon={<PlusCircle size={14}/>}>Add Manual Sale</TabTrigger>}
        {isAllowed('pipeline') && <TabTrigger value="pipeline" icon={<List size={14}/>}>Global Pipeline</TabTrigger>}
        {isAllowed('ledger') && <TabTrigger value="ledger" icon={<Database size={14}/>}>All Customer Deals</TabTrigger>}
        {isAllowed('payroll') && <TabTrigger value="payroll" icon={<Banknote size={14}/>}>Agent Payouts</TabTrigger>}
        {isAllowed('retention') && <TabTrigger value="retention" icon={<RefreshCw size={14}/>}>Salvage & Refunds</TabTrigger>}
        {isAllowed('sheets') && <TabTrigger value="sheets" icon={<Grid size={14}/>}>Company Sheets</TabTrigger>}
        {isAllowed('roster') && <TabTrigger value="roster" icon={<Contact size={14}/>}>Agent Management</TabTrigger>}
        
        <SidebarHeader>Performance</SidebarHeader>
        {isAllowed('standings') && <TabTrigger value="standings" icon={<Trophy size={14}/>}>Company Leaderboard</TabTrigger>}
        {isAllowed('intel') && <TabTrigger value="intel" icon={<BarChart3 size={14}/>}>Deep Analytics</TabTrigger>}
        {isAllowed('comms') && <TabTrigger value="comms" icon={<MessageSquare size={14}/>}>Team Chat</TabTrigger>}
        {isAllowed('scripts') && <TabTrigger value="scripts" icon={<FileText size={14}/>}>Sales Scripts</TabTrigger>}
        
        <SidebarHeader>Configuration</SidebarHeader>
        {isAllowed('catalog') && <TabTrigger value="catalog" icon={<Package size={14}/>}>Products & Pricing</TabTrigger>}
        {isAllowed('system') && <TabTrigger value="system" icon={<Settings size={14}/>}>Advanced Tooling</TabTrigger>}
    </TabList>
);
