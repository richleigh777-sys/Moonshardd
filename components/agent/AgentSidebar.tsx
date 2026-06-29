
import { 
  LayoutDashboard, MessageCircle, Heart, Map, 
  FileText, DollarSign, Users, Calendar, ShieldX, Headphones, Activity, Sparkles
} from 'lucide-react';
import { TabList, TabTrigger } from '../../components/ui/Tabs';

interface AgentSidebarProps {
  isAllowed: (id: string) => boolean;
}

export const AgentSidebar: React.FC<AgentSidebarProps> = ({ isAllowed }) => {
  return (
    <TabList className="gap-1.5 border-none pb-2 mt-2">
      
      {/* CORE OPERATIONS */}
      <div className="px-3 py-2">
        <p className="text-xs font-bold text-text-muted tracking-widest uppercase opacity-70">Workspace</p>
      </div>
      
      {isAllowed('dash') && (
        <TabTrigger value="dash" icon={<LayoutDashboard size={18}/>}>My Home</TabTrigger>
      )}
      {isAllowed('rhythm') && (
        <TabTrigger value="rhythm" icon={<Activity size={18}/>} className="text-accent-primary">Ops Rhythm</TabTrigger>
      )}
      {isAllowed('enrollment') && (
        <TabTrigger value="enrollment" icon={<Heart size={18}/>} className="text-status-success font-medium">Help Customer</TabTrigger>
      )}
      {isAllowed('pipeline') && (
        <TabTrigger value="pipeline" icon={<Map size={18}/>}>Pipeline</TabTrigger>
      )}
      {isAllowed('callbacks') && (
        <TabTrigger value="callbacks" icon={<Calendar size={18}/>}>Callbacks</TabTrigger>
      )}
      {isAllowed('recovery') && (
        <TabTrigger value="recovery" icon={<ShieldX size={18}/>}>Recovery</TabTrigger>
      )}
      {isAllowed('contacts') && (
        <TabTrigger value="contacts" icon={<Users size={18}/>}>Directory</TabTrigger>
      )}
      {isAllowed('comms') && (
        <TabTrigger value="comms" icon={<MessageCircle size={18}/>}>Comms</TabTrigger>
      )}

      {/* GROWTH & ANALYTICS */}
      <div className="px-3 py-2 mt-4 border-t border-border-subtle pt-4">
        <p className="text-xs font-bold text-text-muted tracking-widest uppercase opacity-70">My Progress</p>
      </div>

      {isAllowed('ledger') && (
        <TabTrigger value="ledger" icon={<FileText size={18}/>}>Records</TabTrigger>
      )}
      {isAllowed('payouts') && (
        <TabTrigger value="payouts" icon={<DollarSign size={18}/>}>Earnings</TabTrigger>
      )}
      {isAllowed('standings') && (
        <TabTrigger value="standings" icon={<Sparkles size={18}/>}>Leaderboard</TabTrigger>
      )}
    </TabList>
  );
};


