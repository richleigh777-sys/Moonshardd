
import { 
  LayoutDashboard, MessageCircle, Heart, Map, History, 
  FileText, DollarSign, Trophy, BookOpen, BarChart3, 
  ShieldAlert, Users, Sparkles
} from 'lucide-react';
import { TabList, TabTrigger } from '../../components/ui/Tabs';

interface AgentSidebarProps {
  isAllowed: (id: string) => boolean;
}

export const AgentSidebar: React.FC<AgentSidebarProps> = ({ isAllowed }) => {
  return (
    <TabList className="gap-0.5 border-none pb-2">
      
      {/* SECTOR 1: CORE OPERATIONS */}
      <div className="px-3 py-1 mt-0.5 mb-0">
        <p className="text-xs font-bold text-text-muted tracking-wider uppercase leading-none mb-2 mt-2 opacity-60">
            Welcome
        </p>
      </div>
      
      {isAllowed('dash') && (
        <TabTrigger value="dash" icon={<LayoutDashboard size={16}/>}>My Home</TabTrigger>
      )}
      {isAllowed('enrollment') && (
        <TabTrigger value="enrollment" icon={<Heart size={16}/>} className="text-status-success font-bold">Help a Customer</TabTrigger>
      )}
      {isAllowed('rhythm') && (
        <TabTrigger value="rhythm" icon={<Sparkles size={16} className="text-accent-primary group-hover:animate-pulse" />}>My Day</TabTrigger>
      )}
      {isAllowed('comms') && (
        <TabTrigger value="comms" icon={<MessageCircle size={16}/>}>Messages</TabTrigger>
      )}
      {isAllowed('dialer') && (
        <TabTrigger value="dialer" icon={<MessageCircle size={16}/>}>Dialer Hub (Ready)</TabTrigger>
      )}

      {/* SECTOR 2: WORKFLOW & PIPELINE */}
      <div className="px-3 py-1 mt-3 mb-0 border-t border-border-subtle pt-3 leading-none">
        <p className="text-xs font-bold text-text-muted tracking-wider uppercase leading-none mb-2 opacity-60">Customers</p>
      </div>

      {isAllowed('pipeline') && (
        <TabTrigger value="pipeline" icon={<Map size={16}/>}>Following Up</TabTrigger>
      )}
      {isAllowed('callbacks') && (
        <TabTrigger value="callbacks" icon={<History size={16}/>}>To Call Back</TabTrigger>
      )}
      {isAllowed('contacts') && (
        <TabTrigger value="contacts" icon={<Users size={16}/>}>People</TabTrigger>
      )}
      {isAllowed('recovery') && (
        <TabTrigger value="recovery" icon={<ShieldAlert size={16} className="text-rose-400"/>}>Need Help Queue</TabTrigger>
      )}

      {/* SECTOR 3: GROWTH & ANALYTICS */}
      <div className="px-3 py-1 mt-3 mb-0 border-t border-border-subtle pt-3 leading-none">
        <p className="text-xs font-bold text-text-muted tracking-wider uppercase leading-none mb-2 opacity-60">My Progress</p>
      </div>

      {isAllowed('ledger') && (
        <TabTrigger value="ledger" icon={<FileText size={16}/>}>My Records</TabTrigger>
      )}
      {isAllowed('payouts') && (
        <TabTrigger value="payouts" icon={<DollarSign size={16}/>}>My Earnings</TabTrigger>
      )}
      {isAllowed('standings') && (
        <TabTrigger value="standings" icon={<Trophy size={16}/>}>Team Board</TabTrigger>
      )}
      {isAllowed('analytics') && (
        <TabTrigger value="analytics" icon={<BarChart3 size={16}/>}>My Insights</TabTrigger>
      )}
      {isAllowed('scripts') && (
        <TabTrigger value="scripts" icon={<BookOpen size={16}/>}>Helpful Guides</TabTrigger>
      )}
    </TabList>
  );
};

