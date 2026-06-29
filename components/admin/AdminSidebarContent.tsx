import React from 'react';
import { 
    LayoutDashboard, Database, Contact, Zap, Activity, 
    PlusCircle, List, Banknote, RefreshCw, 
    Trophy, BarChart3, MessageSquare, FileText, 
    Package, Settings, Phone, ShieldCheck, Users, Server
} from 'lucide-react';
import { TabTrigger, TabList } from '../ui/Tabs';

const SidebarHeader = ({ children, isCollapsed }: { children?: React.ReactNode, isCollapsed?: boolean }) => {
    if (isCollapsed) return <div className="h-[2px] bg-border-strong my-4 mx-4 opacity-50 rounded-full" />;
    return (
        <div className="px-3 py-1 mt-3 mb-0 border-t border-border-subtle pt-3 leading-none first:border-none first:pt-1 first:mt-0.5">
            <p className="text-sm font-bold text-text-muted tracking-wider uppercase leading-none mb-2 opacity-60">{children}</p>
        </div>
    );
};

interface AdminSidebarContentProps {
    isAllowed: (id: string) => boolean;
}

export const AdminSidebarContent: React.FC<AdminSidebarContentProps> = ({ isAllowed }) => (
    <div className="pb-4">
        <SidebarHeader>Welcome</SidebarHeader>
        <TabList className="flex flex-col gap-1 border-none mb-3">
            {isAllowed('overview') && <TabTrigger value="overview" icon={<LayoutDashboard size={16}/>}>Company Home</TabTrigger>}
            {isAllowed('nexus') && <TabTrigger value="nexus" icon={<Zap size={16}/>} className="text-status-warning animate-[pulse_3s_ease-in-out_infinite]">Main Settings</TabTrigger>}
        </TabList>
        
        <SidebarHeader>Our Team & Sales</SidebarHeader>
        <TabList className="flex flex-col gap-1 border-none mb-3">
            {isAllowed('enrollment') && <TabTrigger value="enrollment" icon={<PlusCircle size={16}/>}>Help a Customer</TabTrigger>}
            {isAllowed('pipeline') && <TabTrigger value="pipeline" icon={<List size={16}/>}>Everyone's Work</TabTrigger>}
            {isAllowed('ledger') && <TabTrigger value="ledger" icon={<Database size={16}/>}>All Customers</TabTrigger>}
            {isAllowed('sales_pool') && <TabTrigger value="sales_pool" icon={<Users size={16}/>}>Sales Pool</TabTrigger>}
            {isAllowed('payroll') && <TabTrigger value="payroll" icon={<Banknote size={16}/>}>Team Earnings</TabTrigger>}
            {isAllowed('retention') && <TabTrigger value="retention" icon={<RefreshCw size={16}/>}>Save a Sale</TabTrigger>}
            {isAllowed('roster') && <TabTrigger value="roster" icon={<Contact size={16}/>}>Manage Team</TabTrigger>}
        </TabList>
        
        <SidebarHeader>Automation</SidebarHeader>
        <TabList className="flex flex-col gap-1 border-none mb-3">
            {isAllowed('campaigns') && <TabTrigger value="campaigns" icon={<Activity size={16}/>}>Drip Campaigns</TabTrigger>}
        </TabList>
        
        <SidebarHeader>How We Are Doing</SidebarHeader>
        <TabList className="flex flex-col gap-1 border-none mb-3">
            {isAllowed('standings') && <TabTrigger value="standings" icon={<Trophy size={16}/>}>Team Standings</TabTrigger>}
            {isAllowed('intel') && <TabTrigger value="intel" icon={<BarChart3 size={16}/>}>Insights</TabTrigger>}
            {isAllowed('comms') && <TabTrigger value="comms" icon={<MessageSquare size={16}/>}>Chat</TabTrigger>}
            {isAllowed('scripts') && <TabTrigger value="scripts" icon={<FileText size={16}/>}>Dialogues</TabTrigger>}
        </TabList>
        
        <SidebarHeader>Setup</SidebarHeader>
        <TabList className="flex flex-col gap-1 border-none mb-3">
            {isAllowed('audit') && <TabTrigger value="audit" icon={<ShieldCheck size={16}/>}>Security</TabTrigger>}
            {isAllowed('catalog') && <TabTrigger value="catalog" icon={<Package size={16}/>}>Products</TabTrigger>}
            {isAllowed('system') && <TabTrigger value="system" icon={<Settings size={16}/>}>Extra Settings</TabTrigger>}
        </TabList>
    </div>
);
