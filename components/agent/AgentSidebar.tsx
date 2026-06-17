
import { 
  LayoutDashboard, MessageCircle, Heart, Map, 
  FileText, DollarSign, Users, Calendar, ShieldX, Headphones
} from 'lucide-react';
import { TabList, TabTrigger } from '../../components/ui/Tabs';

interface AgentSidebarProps {
  isAllowed: (id: string) => boolean;
}

export const AgentSidebar: React.FC<AgentSidebarProps> = ({ isAllowed }) => {
  return (
    <TabList className="gap-1 border-none pb-2 mt-2">
      
      {/* CORE OPERATIONS */}
      <div className="px-3 py-2">
        <p className="text-sm font-bold text-text-muted tracking-widest uppercase opacity-70">Workspace</p>
      </div>
      
      {isAllowed('dash') && (
        <TabTrigger value="dash" icon={<LayoutDashboard size={16}/>}>My Home</TabTrigger>
      )}
      {isAllowed('enrollment') && (
        <TabTrigger value="enrollment" icon={<Heart size={16}/>} className="text-status-success font-bold">Help a Customer</TabTrigger>
      )}
      {isAllowed('pipeline') && (
        <TabTrigger value="pipeline" icon={<Map size={16}/>}>Current Pipeline</TabTrigger>
      )}
      {isAllowed('callbacks') && (
        <TabTrigger value="callbacks" icon={<Calendar size={16}/>}>Saved Callbacks</TabTrigger>
      )}
      {isAllowed('recovery') && (
        <TabTrigger value="recovery" icon={<ShieldX size={16}/>}>Declined Sales</TabTrigger>
      )}
      {isAllowed('contacts') && (
        <TabTrigger value="contacts" icon={<Users size={16}/>}>Customers</TabTrigger>
      )}
      {isAllowed('comms') && (
        <TabTrigger value="comms" icon={<MessageCircle size={16}/>}>Messages</TabTrigger>
      )}

      {/* GROWTH & ANALYTICS */}
      <div className="px-3 py-2 mt-4 border-t border-border-subtle pt-4">
        <p className="text-sm font-bold text-text-muted tracking-widest uppercase opacity-70">My Progress</p>
      </div>

      {isAllowed('ledger') && (
        <TabTrigger value="ledger" icon={<FileText size={16}/>}>My Records</TabTrigger>
      )}
      {isAllowed('payouts') && (
        <TabTrigger value="payouts" icon={<DollarSign size={16}/>}>My Earnings</TabTrigger>
      )}
    </TabList>
  );
};

