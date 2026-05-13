import React, { memo } from 'react';
import { Heart, Activity, Target, Wallet, List, TrendingUp, Pin } from 'lucide-react';
import { Sale } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useCRM } from '../hooks/useCRM';
import { useSystem } from '../hooks/useSystem';
import { Card, Badge } from '../components/ui/Base';
import { VisualEngine } from '../components/widgets/VisualEngine';
import { ActionCenter } from '../components/widgets/ActionCenter';
import { SmartSuggestions } from '../components/widgets/SmartSuggestions';
import { useAgentStats } from '../components/agent/hooks/useAgentStats';

const StatCard = memo(({ label, value, subLabel, icon: Icon, trend }: any) => (
    <Card className="p-4 flex flex-col justify-between group overflow-hidden border-border-subtle/80 bg-surface-main/80 backdrop-blur-md hover:border-accent-primary/30 transition-all duration-500 relative shadow-sm">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent-primary/5 rounded-full blur-3xl group-hover:bg-accent-primary/15 transition-all duration-700" />
        
        <div className="flex justify-between items-start relative z-10">
            <div className={`p-2 rounded-xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-accent-primary/5`}>
                <Icon size={16} strokeWidth={2.5} />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-[8px] font-black uppercase tracking-widest`}>
                    <TrendingUp size={8} /> {trend}%
                </div>
            )}
        </div>

        <div className="mt-4 relative z-10">
            <p className="text-[9px] font-black text-text-muted mb-1 uppercase tracking-[0.15em] opacity-80">{label}</p>
            <div className="flex items-baseline gap-2">
                <h3 className="text-xl font-black text-text-primary num-font tracking-tighter leading-none">{value}</h3>
            </div>
            <p className="text-[9px] font-bold text-text-secondary opacity-60 uppercase tracking-tight mt-1.5 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-accent-primary/40" />
                {subLabel}
            </p>
        </div>
    </Card>
));

import { SystemStatusWidget } from '../components/widgets/SystemStatusWidget';
import { WidgetContainer } from '../components/agent/WidgetContainer';

export const DashView: React.FC<{ sales: Sale[], onEngage?: (data: any) => void }> = ({ sales, onEngage }) => {
  const { currentUser } = useAuth();
  const { systemConfig } = useCRM();
  const { theme } = useSystem();
  const stats = useAgentStats(sales, currentUser, systemConfig);

  const pinnedWidgets = currentUser?.widgetPreferences?.pinnedWidgets || [];

  if (!stats) return null;

  const widgets = {
      'kpi_revenue': (
          <StatCard 
            label="Daily Revenue" 
            value={`$${stats.dailyRev.toLocaleString()}`} 
            subLabel={`${stats.dailyCount} Wins Today`} 
            icon={Heart} 
            trend={12.5} 
          />
      ),
      'kpi_winrate': (
          <StatCard 
            label="Win Rate" 
            value={`${stats.winRate}%`} 
            subLabel="Success Ratio" 
            icon={Activity} 
            trend={4.2} 
          />
      ),
      'kpi_goal': (
          <StatCard 
            label="Monthly Goal" 
            value={`$${stats.totalRevenue.toLocaleString()}`} 
            subLabel="Production Pace" 
            icon={Target} 
          />
      ),
      'kpi_earnings': (
          <StatCard 
            label="My Earnings" 
            value={`$${stats.estCommission.toLocaleString()}`} 
            subLabel="Current Period" 
            icon={Wallet} 
          />
      ),
      'visual_engine': (
          <Card variant="panel" className="h-[320px] overflow-hidden p-0 border-border-subtle/40 bg-surface-main/40 backdrop-blur-md shadow-2xl relative group focus-within:ring-2 ring-accent-primary/20 w-full">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <VisualEngine sales={stats.mySales} theme={theme} />
          </Card>
      ),
      'activity_table': (
          <Card variant="panel" className="flex-1 min-h-[350px] overflow-hidden flex flex-col p-0 border-border-subtle/40 bg-surface-main/40 backdrop-blur-md shadow-lg w-full">
              <div className="px-5 py-3 border-b border-border-subtle/50 flex justify-between items-center bg-surface-highlight/20">
                  <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-accent-primary/10 rounded-lg text-accent-primary">
                          <List size={14} strokeWidth={2.5}/>
                      </div>
                      <div>
                          <h3 className="text-xs font-black uppercase tracking-[0.12em] text-text-primary">Recent Activity</h3>
                          <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest mt-0.5">Live Stream</p>
                      </div>
                  </div>
              </div>
              <div className="flex-1 overflow-auto custom-scrollbar">
                  <table className="w-full text-left">
                      <thead className="bg-surface-highlight/40 text-[9px] font-black text-text-muted border-b border-border-subtle/50 sticky top-0 z-10 uppercase tracking-[0.2em]">
                          <tr>
                              <th className="p-3 pl-6">Time</th>
                              <th className="p-3">Customer</th>
                              <th className="p-3">Product</th>
                              <th className="p-3 text-right">Value</th>
                              <th className="p-3 text-right pr-6">Status</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle/30">
                          {stats.mySales.slice(0, 10).map((sale) => (
                              <tr key={sale.id} className="hover:bg-surface-highlight/30 transition-all duration-300 group">
                                  <td className="p-3 pl-6 text-[9px] text-text-muted font-mono opacity-60 group-hover:opacity-100">{new Date(sale.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                                  <td className="p-3">
                                      <div className="flex flex-col">
                                          <span className="font-black text-[11px] text-text-primary uppercase tracking-tight group-hover:text-accent-primary transition-colors">{sale.customer}</span>
                                          <span className="text-[8px] text-text-muted uppercase font-bold tracking-widest">ID: {sale.id.slice(-6)}</span>
                                      </div>
                                  </td>
                                  <td className="p-3">
                                      <Badge status="default" className="text-[9px] py-0.5 px-1.5 bg-surface-highlight/50 border-border-subtle/50 text-text-muted">
                                          {sale.product}
                                      </Badge>
                                  </td>
                                  <td className="p-3 text-right">
                                      <span className="font-black text-xs text-text-primary num-font tracking-tighter">${Number(sale.amount).toLocaleString()}</span>
                                  </td>
                                  <td className="p-3 text-right pr-6">
                                      <Badge status={sale.status} className="shadow-sm scale-90" />
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </Card>
      ),
      'system_status': <SystemStatusWidget />,
      'action_center': (
          <div className="h-[380px] w-full">
              <ActionCenter onEngage={onEngage} />
          </div>
      ),
      'smart_suggestions': (
           <div className="h-[300px] w-full">
                <SmartSuggestions sales={sales} notes={[]} currentUser={currentUser!} />
           </div>
      )
  };

  const renderWidget = (id: string) => (
      <WidgetContainer key={id} id={id} isPinned={pinnedWidgets.includes(id)}>
          {widgets[id as keyof typeof widgets]}
      </WidgetContainer>
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
        
        {/* WELCOME HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 px-1">
            <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-accent-primary mb-0.5">
                    <div className="w-6 h-px bg-accent-primary/30" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em]">Operational Dashboard</span>
                </div>
                <h1 className="text-3xl font-black text-text-primary tracking-tighter flex items-center gap-2">
                    Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-text-primary to-text-primary/40 italic">{currentUser?.name.split(' ')[0]}</span>
                </h1>
                <p className="text-sm text-text-muted font-medium max-w-md leading-relaxed">
                    System status is <span className="text-emerald-500 font-bold">OPTIMAL</span>. You have <span className="text-text-primary font-bold">{stats.dailyCount} wins</span> today.
                </p>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => {
                        window.dispatchEvent(new CustomEvent('NAVIGATE', { detail: 'enrollment' }));
                    }}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all group"
                >
                    <Heart size={16} className="group-hover:scale-110 transition-transform" />
                    New Sale
                </button>
                <div className="flex items-center gap-3 bg-surface-alt/40 p-2 rounded-2xl border border-border-subtle/50 backdrop-blur-sm hidden md:flex">
                    <div className="flex flex-col items-end px-3">
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Current Shift</span>
                        <span className="text-xs font-bold text-text-primary num-font">08:42:15</span>
                    </div>
                    <div className="w-px h-8 bg-border-subtle/50" />
                    <div className="flex items-center gap-2 px-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-neon-emerald" />
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live Uplink</span>
                    </div>
                </div>
            </div>
        </div>

        {/* PINNED AREA */}
        {pinnedWidgets.length > 0 && (
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Pin size={14} className="text-accent-primary" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-primary">Pinned Command Center</h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-accent-primary/20 to-transparent ml-2" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {pinnedWidgets.map(id => (
                        <div key={id} className={id.startsWith('kpi') ? 'col-span-1' : 'col-span-1 md:col-span-2 lg:col-span-4'}>
                             {renderWidget(id)}
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* KPI ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {!pinnedWidgets.includes('kpi_revenue') && renderWidget('kpi_revenue')}
            {!pinnedWidgets.includes('kpi_winrate') && renderWidget('kpi_winrate')}
            {!pinnedWidgets.includes('kpi_goal') && renderWidget('kpi_goal')}
            {!pinnedWidgets.includes('kpi_earnings') && renderWidget('kpi_earnings')}
        </div>

        {/* MAIN WORKSPACE GRID */}
        <div className="grid grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN */}
            <div className="col-span-12 xl:col-span-8 flex flex-col gap-6">
                {!pinnedWidgets.includes('visual_engine') && renderWidget('visual_engine')}
                {!pinnedWidgets.includes('activity_table') && renderWidget('activity_table')}
            </div>

            {/* RIGHT COLUMN */}
            <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">
                {!pinnedWidgets.includes('system_status') && renderWidget('system_status')}
                {!pinnedWidgets.includes('action_center') && renderWidget('action_center')}
                {!pinnedWidgets.includes('smart_suggestions') && renderWidget('smart_suggestions')}
            </div>
        </div>
    </div>
  );
};
