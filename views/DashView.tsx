import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
const StreakFlame = ({ streak }) => {
    if (streak < 3) return null;
    return (
        <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute top-3 right-3 text-red-500 flex items-center gap-1 bg-red-500/10 px-2 py-1 rounded-full"
            title={'Hot streak! ' + streak + ' in a row!'}
        >
            <Flame size={14} className="fill-red-500" />
            <span className="text-xs font-black">{streak}</span>
        </motion.div>
    );
};
import { Heart, Activity, Target, Wallet, List, TrendingUp, Pin } from 'lucide-react';
import { Sale } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useCRM } from '../hooks/useCRM';
import { useSystem } from '../hooks/useSystem';
import { Card, Badge } from '../components/ui/Base';
import { VisualEngine } from '../components/widgets/VisualEngine';
import { ActionCenter } from '../components/widgets/ActionCenter';
import { MiniLeaderboard } from '../components/widgets/MiniLeaderboard';
import { PersonalMetricTerminal } from '../components/widgets/PersonalMetricTerminal';
import { useAgentStats } from '../components/agent/hooks/useAgentStats';

const StatCard = memo(({ label, value, icon: Icon, trend, description, streak, showStreak }: any) => (
    <Card variant="refraction" className="p-4 flex flex-col justify-between group overflow-hidden border border-border-subtle bg-surface-main hover:border-accent-primary/40 hover:shadow-lg transition-all duration-300 relative rounded-xl cursor-pointer hover:-translate-y-0.5">
        {/* Decorative corner ambient glow */}
        <div className="absolute -right-6 -top-4 w-16 h-16 bg-accent-primary/[0.04] rounded-full blur-xl group-hover:bg-accent-primary/10 transition-all duration-500"></div>
        
        <div className="flex justify-between items-start relative z-10">
            <div className={`p-2 rounded-lg bg-surface-alt border border-border-subtle text-text-primary transition-all duration-300 group-hover:bg-accent-primary/10 group-hover:text-accent-primary group-hover:border-accent-primary/20 shadow-sm group-hover:scale-105`}>
                <Icon size={16} strokeWidth={2.5} />
            </div>
            {trend ? (
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-status-success text-[9px] font-black tracking-tight font-mono shadow-sm`}>
                    <TrendingUp size={10} /> {trend > 0 ? `+${trend}` : trend}%
                </div>
            ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-border-strong opacity-40 group-hover:bg-accent-primary group-hover:opacity-100 transition-all"></span>
            )}
        </div>

        <div className="mt-4 relative z-10">
            <p className="text-[9px] font-black text-text-muted mb-0.5 tracking-wider uppercase opacity-70 leading-none">{label}</p>
            <div className="flex items-baseline gap-1">
                <h3 className="text-xl font-black text-text-primary tracking-tight leading-none font-mono">{value}</h3>
            </div>
            {description && (
                <p className="text-[9px] font-bold text-text-muted/65 mt-1 tracking-tight group-hover:text-text-muted transition-colors leading-tight">
                    {description}
                </p>
            )}
        </div>
        
        {/* Bottom indicator border line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-primary/20 via-accent-secondary/10 to-transparent group-hover:from-accent-primary/60 transition-all duration-300" />
    </Card>
));

import { WidgetContainer } from '../components/agent/WidgetContainer';

export const DashView: React.FC<{ sales: Sale[] }> = ({ sales }) => {
  const { currentUser } = useAuth();
  const { systemConfig } = useCRM();
  const { theme } = useSystem();
  const stats = useAgentStats(sales, currentUser, systemConfig);

  const pinnedWidgets = currentUser?.widgetPreferences?.pinnedWidgets || [];

  if (!stats) return null;

  const widgets = {
      'kpi_revenue': (
          <StatCard 
            label="Today's Sales" 
            value={`$${stats.dailyRev.toLocaleString()}`} 
            icon={Heart} 
            trend={12.5} 
            description="Sum of approved daily deals"
            showStreak={systemConfig?.enableStreakAnimation}
            streak={stats.streak}
          />
      ),
      'kpi_winrate': (
          <StatCard 
            label="Success Rate" 
            value={`${stats.winRate}%`} 
            icon={Activity} 
            trend={4.2} 
            description="Leads qualified vs closed"
          />
      ),
      'kpi_goal': (
          <StatCard 
            label="Target for Month" 
            value={`$${stats.totalRevenue.toLocaleString()}`} 
            icon={Target} 
            description="Month-to-date total targets"
          />
      ),
      'kpi_earnings': (
          <StatCard 
            label="My Earnings" 
            value={`$${stats.estCommission.toLocaleString()}`} 
            icon={Wallet} 
            description="Realized payout cycle accrued"
          />
      ),
      'activity_table': (
          <Card variant="panel" className="flex-1 min-h-[220px] overflow-hidden flex flex-col p-0 border-border-subtle/80 bg-surface-main shadow-sm w-full rounded-xl">
              <div className="px-4 py-4 border-b border-border-subtle flex justify-between items-center bg-surface-main">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-surface-alt rounded-lg text-text-secondary border border-border-subtle shadow-sm">
                          <List size={18} strokeWidth={2}/>
                      </div>
                      <div>
                          <h3 className="text-sm font-bold text-text-primary tracking-tight">What You Have Done Recently</h3>
                      </div>
                  </div>
              </div>
              <div className="flex-1 overflow-auto custom-scrollbar">
                  <table className="w-full text-left">
                      <thead className="bg-surface-alt text-xs font-semibold text-text-muted border-b border-border-subtle sticky top-0 z-10 transition-colors">
                          <tr>
                              <th className="p-4 pl-6  tracking-wider font-medium">Time</th>
                              <th className="p-4  tracking-wider font-medium">Customer</th>
                              <th className="p-4  tracking-wider font-medium">Product</th>
                              <th className="p-4 text-right  tracking-wider font-medium">Value</th>
                              <th className="p-4 text-right pr-6  tracking-wider font-medium">Status</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle">
                          {stats.mySales.slice(0, 10).map((sale) => (
                              <tr key={sale.id} className="hover:bg-surface-highlight hover:shadow-sm cursor-pointer transition-all duration-200 group">
                                  <td className="p-4 pl-6 text-sm text-text-muted font-mono whitespace-nowrap">{new Date(sale.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                                  <td className="p-4">
                                      <div className="flex flex-col">
                                          <span className="font-semibold text-sm text-text-primary group-hover:text-accent-primary transition-colors">{sale.customer}</span>
                                          <span className="text-xs text-text-muted mt-0.5">ID: {sale.id.slice(-6)}</span>
                                      </div>
                                  </td>
                                  <td className="p-4">
                                      <div className="text-xs py-1 px-2.5 bg-surface-alt border border-border-subtle rounded-md text-text-secondary inline-flex font-medium">
                                          {sale.product}
                                      </div>
                                  </td>
                                  <td className="p-4 text-right">
                                      <span className="font-bold text-sm text-text-primary tracking-tight">${Number(sale.amount).toLocaleString()}</span>
                                  </td>
                                  <td className="p-4 text-right pr-6">
                                      <Badge status={sale.status} className="shadow-sm float-right text-xs px-2 py-1" />
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </Card>
      ),
      'revenue_chart': (
          <VisualEngine 
              sales={stats.mySales} 
              theme={theme} 
          />
      ),
      'personal_terminal': (
          <PersonalMetricTerminal 
              revenue={stats.dailyRev}
              winRate={stats.winRate}
              hours={currentUser?.dailyHours || 8}
              commission={stats.totalCommission}
              spiffs={stats.totalSpiffs}
              pending={stats.estPendingComm}
          />
      ),
      'action_center': (
          <ActionCenter 
              onEngage={(item) => {
                  window.dispatchEvent(new CustomEvent('NAVIGATE', { detail: 'enrollment' }));
                  window.dispatchEvent(new CustomEvent('LOAD_LEAD', { 
                    detail: {
                      customerName: item.customerName,
                      phone: item.phone,
                      email: item.email || '',
                      shippingAddress: item.shippingAddress || '',
                      reason: item.reason || ''
                    } 
                  }));
              }}
          />
      ),
      'team_leaderboard': (
           <div className="h-[280px] w-full">
                <MiniLeaderboard />
           </div>
      )
  };

  const renderWidget = (id: string) => (
      <WidgetContainer key={id} id={id} isPinned={pinnedWidgets.includes(id)}>
          {widgets[id as keyof typeof widgets]}
      </WidgetContainer>
  );

  return (
    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-6">
        
        {/* WELCOME HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1 mb-2">
            <div className="space-y-1">
                <h1 className="text-lg font-bold text-text-primary tracking-tight">
                    Welcome back, {currentUser?.name.split(' ')[0]}
                </h1>
                <p className="text-sm text-text-muted font-medium">
                    You have <span className="text-text-primary font-semibold">{stats.dailyCount} wins</span> today.
                </p>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => {
                        window.dispatchEvent(new CustomEvent('NAVIGATE', { detail: 'enrollment' }));
                    }}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-sm"
                >
                    <Heart size={16} />
                    Help a Customer
                </button>
            </div>
        </div>

        {/* PINNED AREA */}
        {pinnedWidgets.length > 0 && (
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Pin size={16} className="text-accent-primary" />
                    <h2 className="text-sm font-semibold text-text-primary">Pinned Widgets</h2>
                    <div className="flex-1 h-px bg-border-subtle ml-2" />
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-start">
            
            {/* LEFT COLUMN */}
            <div className="md:col-span-7 xl:col-span-8 flex flex-col gap-3 md:gap-4">
                {!pinnedWidgets.includes('revenue_chart') && renderWidget('revenue_chart')}
                {!pinnedWidgets.includes('action_center') && renderWidget('action_center')}
                {!pinnedWidgets.includes('activity_table') && renderWidget('activity_table')}
            </div>

            {/* RIGHT COLUMN */}
            <div className="md:col-span-5 xl:col-span-4 flex flex-col gap-3 md:gap-4">
                {!pinnedWidgets.includes('personal_terminal') && renderWidget('personal_terminal')}
                {!pinnedWidgets.includes('team_leaderboard') && renderWidget('team_leaderboard')}
            </div>
        </div>
    </div>
  );
};
