
import { useMemo, useState } from 'react';
import { useCRM } from '../../hooks/useCRM';
import { SystemHealth } from '../../types';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { DashboardKPIGrid } from './dashboard/DashboardKPIGrid';
import { DashboardMainCharts } from './dashboard/DashboardMainCharts';
import { DashboardTerminalZone } from './dashboard/DashboardTerminalZone';
import { GlobalPerformanceSummary } from './dashboard/GlobalPerformanceSummary';
import { nexusGateway } from '../../nexus/adapters/DataGateway';

import { usePresence } from '../../hooks/usePresence';
import { PresenceIndicator } from '../ui/PresenceIndicator';

interface AdminDashboardProps {
    onToggleTerminals?: () => void;
    areTerminalsOpen?: boolean;
    onBroadcast?: (msg: string, urgency: 'Routine' | 'Immediate' | 'Flash') => Promise<void>;
    health?: SystemHealth;
    onRunDiagnostics?: () => void;
    onTestUplink?: () => Promise<boolean>;
}

import { StrategicInsightCard } from './dashboard/StrategicInsightCard';
import { LeadHealthWidget } from './dashboard/LeadHealthWidget';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    onToggleTerminals, 
    areTerminalsOpen,
    onBroadcast,
    health,
    onRunDiagnostics,
    onTestUplink
}) => {
  const { sales, callLogs, users, notes } = useCRM();
  const [now] = useState(() => Date.now());
  
  // Track presence on the dashboard
  usePresence('dashboard', 'dashboard', 'viewing');

  const hasSales = useMemo(() => sales.some(s => s.status === 'Approved'), [sales]);

  const agentStats = useMemo(() => {
      const agents = users.filter(u => u.role === 'agent');
      const online = agents.filter(u => u.currentStatus === 'online').length;
      const breakCount = agents.filter(u => u.currentStatus === 'break').length;
      const total = agents.length;
      return { online, breakCount, total };
  }, [users]);

  const totalRevenue = useMemo(() => 
    sales.filter(s => s.status === 'Approved').reduce((acc, s) => acc + Number(s.amount), 0),
  [sales]);

  return (
    <div className="space-y-2 animate-in fade-in duration-700 h-full flex flex-col overflow-y-auto custom-scrollbar pr-2 pb-2">
      <DashboardHeader 
        health={health} 
        onToggleTerminals={onToggleTerminals} 
        areTerminalsOpen={areTerminalsOpen} 
      />

      <div className="flex items-center justify-between bg-surface-main border border-border-subtle rounded-xl px-2.5 py-1 shadow-sm">
          <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[8px] font-black text-text-primary uppercase tracking-widest">Portal Presence</span>
          </div>
          <PresenceIndicator resourceId="dashboard" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2.5">
          <div className="lg:col-span-2">
              <DashboardKPIGrid 
                totalRevenue={totalRevenue} 
                agentStats={agentStats} 
                callLogsCount={callLogs.length} 
                hasSales={hasSales} 
              />
          </div>
          <LeadHealthWidget notes={notes} now={now} />
          <StrategicInsightCard 
            sales={sales} 
            users={users} 
            notes={notes} 
            serverId={nexusGateway.activeServerId} 
          />
      </div>

      <GlobalPerformanceSummary sales={sales} users={users} />

      <DashboardMainCharts 
        sales={sales} 
        hasSales={hasSales} 
      />

      <DashboardTerminalZone 
        areTerminalsOpen={!!areTerminalsOpen} 
        onBroadcast={onBroadcast} 
        health={health} 
        onRunDiagnostics={onRunDiagnostics} 
        onTestUplink={onTestUplink} 
      />
    </div>
  );
};


