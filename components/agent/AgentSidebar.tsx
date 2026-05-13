
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
        <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em] leading-none">
            My Workspace
        </p>
      </div>
      
      {isAllowed('dash') && (
        <TabTrigger value="dash" icon={<LayoutDashboard size={14}/>}>My Home</TabTrigger>
      )}
      {isAllowed('enrollment') && (
        <TabTrigger value="enrollment" icon={<Heart size={14}/>} className="text-emerald-400 font-black tracking-widest uppercase">Submit Deal</TabTrigger>
      )}
      {isAllowed('rhythm') && (
        <TabTrigger value="rhythm" icon={<Sparkles size={14} className="text-accent-primary group-hover:animate-pulse" />}>Daily Tasks</TabTrigger>
      )}
      {isAllowed('comms') && (
        <TabTrigger value="comms" icon={<MessageCircle size={14}/>}>Team Chat</TabTrigger>
      )}

      {/* SECTOR 2: WORKFLOW & PIPELINE */}
      <div className="px-3 py-1 mt-1 mb-0 border-t border-white/5 pt-1.5 leading-none">
        <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em] leading-none">My Customers</p>
      </div>

      {isAllowed('pipeline') && (
        <TabTrigger value="pipeline" icon={<Map size={14}/>}>My Pipeline</TabTrigger>
      )}
      {isAllowed('callbacks') && (
        <TabTrigger value="callbacks" icon={<History size={14}/>}>Needs Call</TabTrigger>
      )}
      {isAllowed('contacts') && (
        <TabTrigger value="contacts" icon={<Users size={14}/>}>Directory</TabTrigger>
      )}
      {isAllowed('recovery') && (
        <TabTrigger value="recovery" icon={<ShieldAlert size={14} className="text-rose-400"/>}>Rescues</TabTrigger>
      )}

      {/* SECTOR 3: GROWTH & ANALYTICS */}
      <div className="px-3 py-1 mt-1 mb-0 border-t border-white/5 pt-1.5 leading-none">
        <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em] leading-none">My Stats</p>
      </div>

      {isAllowed('ledger') && (
        <TabTrigger value="ledger" icon={<FileText size={14}/>}>My Sales</TabTrigger>
      )}
      {isAllowed('payouts') && (
        <TabTrigger value="payouts" icon={<DollarSign size={14}/>}>My Earnings</TabTrigger>
      )}
      {isAllowed('standings') && (
        <TabTrigger value="standings" icon={<Trophy size={14}/>}>Leaderboard</TabTrigger>
      )}
      {isAllowed('analytics') && (
        <TabTrigger value="analytics" icon={<BarChart3 size={14}/>}>My Metrics</TabTrigger>
      )}
      {isAllowed('scripts') && (
        <TabTrigger value="scripts" icon={<BookOpen size={14}/>}>Scripts & Guides</TabTrigger>
      )}
    </TabList>
  );
};
