import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Heart, Activity, Target, Wallet, List, TrendingUp, Pin, ChevronDown, ChevronUp } from 'lucide-react';
import { Sale } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useCRM } from '../hooks/useCRM';
import { useSystem } from '../hooks/useSystem';
import { Card, Badge } from '../components/ui/Base';
import { VisualEngine } from '../components/widgets/VisualEngine';
import { ActionCenter } from '../components/widgets/ActionCenter';
import { MiniLeaderboard } from '../components/widgets/MiniLeaderboard';
import { PersonalMetricCard } from '../components/widgets/PersonalMetricCard';
import { useAgentStats } from '../components/agent/hooks/useAgentStats';
import { WidgetContainer } from '../components/agent/WidgetContainer';

const StreakFlame = ({ streak }: { streak: number }) => {
    if (streak < 3) return null;
    return (
        <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute top-4 right-4 text-red-500 flex items-center gap-1.5 bg-red-500/10 px-3 py-1 rounded-full shadow-sm border border-red-500/20"
            title={'Hot streak! ' + streak + ' in a row!'}
        >
            <Flame size={14} className="fill-red-500" />
            <span className="text-xs font-black tracking-wide">{streak}</span>
        </motion.div>
    );
};

const StatCard = memo(({ label, value, icon: Icon, trend, description, streak, showStreak }: any) => (
    <Card variant="panel" className="relative p-6 flex flex-col justify-between group bg-surface-main border border-border-subtle hover:border-accent-primary/50 transition-all duration-300 rounded-2xl shadow-sm">
        {showStreak && streak > 0 && <StreakFlame streak={streak} />}
        <div className="flex justify-between items-start mb-6">
            <div className="p-3.5 bg-surface-alt rounded-xl text-text-secondary group-hover:text-accent-primary group-hover:bg-accent-primary/10 transition-colors border border-border-subtle shadow-sm">
                <Icon size={22} strokeWidth={2.5} />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-lg ${trend > 0 ? 'bg-status-success/10 text-status-success' : 'bg-status-error/10 text-status-error'}`}>
                    <TrendingUp size={16} className={trend < 0 ? 'rotate-180' : ''} strokeWidth={2.5} /> 
                    {Math.abs(trend)}%
                </div>
            )}
        </div>

        <div>
            <p className="text-sm font-semibold text-text-muted mb-1.5 tracking-tight uppercase">{label}</p>
            <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-extrabold tracking-tight text-text-primary drop-shadow-sm">{value}</h3>
            </div>
            {description && <p className="text-xs text-text-muted mt-2 opacity-80">{description}</p>}
        </div>
    </Card>
));

export const DashView: React.FC<{ sales: Sale[] }> = ({ sales }) => {
  const { currentUser } = useAuth();
  const { systemConfig } = useCRM();
  const { theme } = useSystem();
  const stats = useAgentStats(sales, currentUser, systemConfig);
  const [showSecondaryMetrics, setShowSecondaryMetrics] = useState(false);

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
          <Card variant="panel" className="flex-1 min-h-[400px] overflow-hidden flex flex-col p-0 border-border-subtle bg-surface-main shadow-sm w-full rounded-2xl">
              <div className="px-6 py-5 border-b border-border-subtle flex justify-between items-center bg-surface-alt">
                  <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-surface-main rounded-lg text-text-primary shadow-sm border border-border-subtle">
                          <List size={20} strokeWidth={2.5}/>
                      </div>
                      <div>
                          <h3 className="text-base font-bold text-text-primary tracking-tight">Recent Deal Ledger</h3>
                          <p className="text-xs text-text-muted mt-0.5">Your most recent transaction activity</p>
                      </div>
                  </div>
              </div>
              <div className="flex-1 overflow-auto custom-scrollbar">
                  {stats.mySales.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-text-muted pb-10">
                          <List size={48} strokeWidth={1} className="mb-4 opacity-30" />
                          <p className="text-sm font-medium">No recent deals to display.</p>
                      </div>
                  ) : (
                      <table className="w-full text-left border-collapse">
                          <thead className="bg-surface-alt text-xs font-semibold text-text-muted sticky top-0 z-10 shadow-sm border-b border-border-subtle">
                              <tr>
                                  <th className="p-4 pl-6 uppercase tracking-wider font-bold">Time</th>
                                  <th className="p-4 uppercase tracking-wider font-bold">Customer Info</th>
                                  <th className="p-4 uppercase tracking-wider font-bold">Assigned Product</th>
                                  <th className="p-4 text-right uppercase tracking-wider font-bold">Value</th>
                                  <th className="p-4 text-right pr-6 uppercase tracking-wider font-bold">Approval Status</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-border-subtle/50">
                              {stats.mySales.slice(0, 10).map((sale) => (
                                  <tr key={sale.id} className="hover:bg-surface-highlight/50 cursor-pointer transition-colors group">
                                      <td className="p-4 pl-6 text-sm text-text-muted font-mono whitespace-nowrap align-middle">
                                          {new Date(sale.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                      </td>
                                      <td className="p-4 align-middle">
                                          <div className="flex flex-col">
                                              <span className="font-bold text-sm text-text-primary group-hover:text-accent-primary transition-colors">{sale.customer}</span>
                                              <span className="text-xs text-text-muted mt-1 font-mono">ID: {sale.id.slice(-6).toUpperCase()}</span>
                                          </div>
                                      </td>
                                      <td className="p-4 align-middle">
                                          <div className="text-xs py-1.5 px-3 bg-surface-alt border border-border-subtle rounded-lg text-text-secondary inline-flex font-bold uppercase tracking-wide">
                                              {sale.product}
                                          </div>
                                      </td>
                                      <td className="p-4 text-right align-middle">
                                          <span className="font-extrabold text-sm text-text-primary tracking-tight">${Number(sale.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                      </td>
                                      <td className="p-4 text-right pr-6 align-middle">
                                          <Badge status={sale.status} className="shadow-sm float-right text-xs px-3 py-1.5 font-bold tracking-wide" />
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  )}
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
          <PersonalMetricCard 
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
                    Welcome back, {(currentUser?.name || currentUser?.id || 'Agent').split(' ')[0]}
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

        {/* HIGH PRIORITY TASK VISIBILITY */}
        <div className="w-full">
             {!pinnedWidgets.includes('action_center') && renderWidget('action_center')}
        </div>

        {/* SECONDARY METRICS TOGGLE */}
        <div className="flex items-center gap-2 px-1 mt-2">
            <button 
                onClick={() => setShowSecondaryMetrics(!showSecondaryMetrics)}
                className="flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-text-primary transition-colors"
            >
                {showSecondaryMetrics ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {showSecondaryMetrics ? "Hide Performance Analytics" : "Show Performance Analytics"}
            </button>
            <div className="flex-1 h-px bg-border-subtle ml-2" />
        </div>

        <AnimatePresence>
            {showSecondaryMetrics && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden flex flex-col gap-3"
                >
                    {/* KPI ROW */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-3">
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
                            {!pinnedWidgets.includes('activity_table') && renderWidget('activity_table')}
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="md:col-span-5 xl:col-span-4 flex flex-col gap-3 md:gap-4">
                            {!pinnedWidgets.includes('personal_terminal') && renderWidget('personal_terminal')}
                            {!pinnedWidgets.includes('team_leaderboard') && renderWidget('team_leaderboard')}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

