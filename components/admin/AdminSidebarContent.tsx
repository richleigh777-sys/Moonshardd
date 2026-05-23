import React from 'react';
import { 
    LayoutDashboard, Database, Contact, Zap, 
    PlusCircle, List, Banknote, RefreshCw, 
    Trophy, BarChart3, MessageSquare, FileText, 
    Package, Settings, Phone, ShieldCheck
} from 'lucide-react';
import { TabTrigger, TabList } from '../ui/Tabs';

const SidebarHeader = ({ children, isCollapsed }: { children?: React.ReactNode, isCollapsed?: boolean }) => {
    if (isCollapsed) return <div className="h-[2px] bg-border-strong my-4 mx-4 opacity-50 rounded-full" />;
    return (
        <div className="px-3 py-1 mt-3 mb-0 border-t border-border-subtle pt-3 leading-none first:border-none first:pt-1 first:mt-0.5">
            <p className="text-xs font-bold text-text-muted tracking-wider uppercase leading-none mb-2 opacity-60">{children}</p>
        </div>
    );
};

interface AdminSidebarContentProps {
    isAllowed: (id: string) => boolean;
}

export const AdminSidebarContent: React.FC<AdminSidebarContentProps> = ({ isAllowed }) => (
    <TabList className="flex flex-col gap-0.5 border-none pb-4">
        <SidebarHeader>Control Center</SidebarHeader>
        {isAllowed('overview') && <TabTrigger value="overview" icon={<LayoutDashboard size={16}/>}>Company Pulse</TabTrigger>}
        {isAllowed('nexus') && <TabTrigger value="nexus" icon={<Zap size={16}/>} className="text-status-warning animate-[pulse_3s_ease-in-out_infinite]">Master Settings</TabTrigger>}
        
        <SidebarHeader>Sales & Agents</SidebarHeader>
        {isAllowed('enrollment') && <TabTrigger value="enrollment" icon={<PlusCircle size={16}/>}>Add Manual Sale</TabTrigger>}
        {isAllowed('pipeline') && <TabTrigger value="pipeline" icon={<List size={16}/>}>Global Pipeline</TabTrigger>}
        {isAllowed('ledger') && <TabTrigger value="ledger" icon={<Database size={16}/>}>All Customer Deals</TabTrigger>}
        {isAllowed('payroll') && <TabTrigger value="payroll" icon={<Banknote size={16}/>}>Agent Payouts</TabTrigger>}
        {isAllowed('retention') && <TabTrigger value="retention" icon={<RefreshCw size={16}/>}>Salvage & Refunds</TabTrigger>}
        {isAllowed('roster') && <TabTrigger value="roster" icon={<Contact size={16}/>}>Agent Management</TabTrigger>}
        
        <SidebarHeader>Performance</SidebarHeader>
        {isAllowed('standings') && <TabTrigger value="standings" icon={<Trophy size={16}/>}>Team Leaderboards</TabTrigger>}
        {isAllowed('intel') && <TabTrigger value="intel" icon={<BarChart3 size={16}/>}>Deep Analytics</TabTrigger>}
        {isAllowed('comms') && <TabTrigger value="comms" icon={<MessageSquare size={16}/>}>Team Chat</TabTrigger>}
        {isAllowed('scripts') && <TabTrigger value="scripts" icon={<FileText size={16}/>}>Sales Scripts</TabTrigger>}
        
        <SidebarHeader>Configuration</SidebarHeader>
        {isAllowed('audit') && <TabTrigger value="audit" icon={<ShieldCheck size={16}/>}>CRM Audits</TabTrigger>}
        {isAllowed('dialer_data') && <TabTrigger value="dialer_data" icon={<Phone size={16}/>}>Upload Data</TabTrigger>}
        {isAllowed('catalog') && <TabTrigger value="catalog" icon={<Package size={16}/>}>Products & Pricing</TabTrigger>}
        {isAllowed('system') && <TabTrigger value="system" icon={<Settings size={16}/>}>Advanced Tooling</TabTrigger>}
    </TabList>
);
