
import { 
  Zap, Banknote, Settings
} from 'lucide-react';
import { TabList, TabTrigger } from '../../components/ui/Tabs';

interface AgentSidebarProps {
  isAllowed: (id: string) => boolean;
}

export const AgentSidebar: React.FC<AgentSidebarProps> = ({ isAllowed }) => {
  return (
    <TabList className="flex flex-col gap-2 border-none mt-2 pb-2">
      <TabTrigger value="action" icon={<Zap size={22}/>}>Action</TabTrigger>
      <TabTrigger value="money" icon={<Banknote size={22}/>}>Money</TabTrigger>
          <TabTrigger value="settings" icon={<Settings size={22}/>}>Settings</TabTrigger>
    </TabList>
  );
};


