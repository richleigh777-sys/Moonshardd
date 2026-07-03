import React from 'react';
import { Zap, Banknote, ShieldCheck } from 'lucide-react';
import { TabTrigger, TabList } from '../ui/Tabs';

interface AdminSidebarContentProps {
    isAllowed: (id: string) => boolean;
}

export const AdminSidebarContent: React.FC<AdminSidebarContentProps> = ({ _isAllowed }) => (
    <div className="pb-4 pt-2">
        <TabList className="flex flex-col gap-2 border-none mb-3">
            <TabTrigger value="action" icon={<Zap size={22}/>}>Action</TabTrigger>
            <TabTrigger value="money" icon={<Banknote size={22}/>}>Money</TabTrigger>
            <TabTrigger value="oversight" icon={<ShieldCheck size={22}/>}>Oversight</TabTrigger>
        </TabList>
    </div>
);
