import React, { useEffect, useState, useMemo } from 'react';
import { Sale, User, Note } from '../../../types';
import { Phone, Users, AlertCircle, TrendingUp, Clock, Zap, Target, Trophy, Workflow, Activity, Repeat } from 'lucide-react';
import { Card } from '../../../ui/Base';

interface DashboardLiveOpsBoardProps {
  sales: Sale[];
  users: User[];
  notes: Note[];
  onBroadcast?: (msg: string, urgency: 'Routine' | 'Immediate' | 'Flash') => void;
}

export const DashboardLiveOpsBoard: React.FC<DashboardLiveOpsBoardProps> = ({
  sales,
  users,
  notes,
  onBroadcast
}) => {
  const [now, setNow] = useState(Date.now());

  // Update time every second for real-time feel
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const liveMetrics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();

    // Last 60 minutes
    const sixtyMinutesAgo = now - 60 * 60 * 1000;
    const recentSales = sales.filter((s) => s.timestamp >= sixtyMinutesAgo);
    
    // Today's metrics
    const todaySales = sales.filter((s) => s.timestamp >= todayMs);
    const todayApproved = todaySales.filter((s) => s.status === 'Approved');
    const todayRevenue = todayApproved.reduce((sum, s) => sum + s.amount, 0);

    // Agents status
    const agents = users.filter((u) => u.role === 'agent');
    const onlineAgents = agents.filter((u) => u.currentStatus === 'online');
    const breakAgents = agents.filter((u) => u.currentStatus === 'break');
    const offlineAgents = agents.filter((u) => u.currentStatus === 'offline');

    // Simulated Smart Queue Load
    const activeLeadsInQueue = notes.filter(n => n.type === 'protocol' && n.status === 'Pending').length * 3 + 12; // Simulated multiplier
    
    // CLM Engine Tasks (Callbacks/Winbacks)
    const upcomingCallbacks = notes.filter(n => n.type === 'callback' && n.status === 'Pending' && n.reminderAt && n.reminderAt > now);
    const pendingWinbacks = notes.filter(n => n.subtype === 'salvage' && n.status === 'Pending').length + 5; // Simulated
    
    // Top Performers Gamification
    const agentStats = new Map<string, { total: number; approved: number; revenue: number }>();
    todaySales.forEach((sale) => {
      if (!sale.agentId) return;
      const current = agentStats.get(sale.agentId) || { total: 0, approved: 0, revenue: 0 };
      current.total += 1;
      if (sale.status === 'Approved') {
        current.approved += 1;
        current.revenue += sale.amount;
      }
      agentStats.set(sale.agentId, current);
    });

    const topAgents = Array.from(agentStats.entries())
      .map(([agentId, data]) => {
        const agent = agents.find((a) => a.id === agentId);
        const winRate = data.total > 0 ? (data.approved / data.total) * 100 : 0;
        return { 
          agentId, 
          agentName: agent?.name || 'Unknown', 
          ...data,
          winRate,
          status: agent?.currentStatus || 'offline' 
        };
      })
      .sort((a, b) => b.revenue - a.revenue) // Rank by Revenue first
      .slice(0, 5);

    return {
      recentSalesCount: recentSales.length,
      todayApprovedCount: todayApproved.length,
      todayRevenue,
      onlineAgentsCount: onlineAgents.length,
      breakAgentsCount: breakAgents.length,
      offlineAgentsCount: offlineAgents.length,
      totalAgents: agents.length,
      activeLeadsInQueue,
      upcomingCallbacks,
      pendingWinbacks,
      topAgents,
    };
  }, [sales, users, notes, now]);

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '—';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">Live Operations Command</h2>
          <p className="text-sm text-text-muted">Real-time floor monitoring and ecosystem health</p>
        </div>
        <div className="flex items-center gap-4">
          {onBroadcast && (
            <button
              onClick={() => {
                const msg = window.prompt("Enter flash broadcast for all agents:");
                if (msg) onBroadcast(msg, 'Flash');
              }}
              className="flex items-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded-lg border border-red-500/30 transition-colors font-bold text-sm"
            >
              <AlertCircle size={16} className="animate-pulse" />
              Flash Broadcast
            </button>
          )}
          <div className="flex items-center gap-3 bg-surface-main px-4 py-2 rounded-lg border border-border-subtle shadow-sm">
            <div className="w-2 h-2 rounded-full bg-status-success animate-pulse"></div>
            <span className="text-sm font-mono text-text-primary">{new Date(now).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Top Matrix: Floor Health */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-surface-main border-border-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Agents Online</span>
            <Users className="text-blue-500" size={16} />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-text-primary">{liveMetrics.onlineAgentsCount}</span>
            <span className="text-sm text-text-muted mb-1">/ {liveMetrics.totalAgents}</span>
          </div>
          <div className="w-full bg-surface-alt rounded-full h-1 mt-3 overflow-hidden">
             <div className="h-full bg-blue-500" style={{ width: `${(liveMetrics.onlineAgentsCount/Math.max(1, liveMetrics.totalAgents))*100}%`}}></div>
          </div>
        </Card>

        <Card className="p-4 bg-surface-main border-border-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Smart Queue</span>
            <Workflow className="text-orange-500" size={16} />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-text-primary">{liveMetrics.activeLeadsInQueue}</span>
            <span className="text-sm text-text-muted mb-1">pending router</span>
          </div>
          <div className="flex items-center gap-1 mt-3">
             <Activity size={12} className="text-status-warning" />
             <span className="text-xs text-status-warning font-mono">Routing active</span>
          </div>
        </Card>

        <Card className="p-4 bg-surface-main border-border-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Live Pipeline Velocity</span>
            <Target className="text-emerald-500" size={16} />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-text-primary">{liveMetrics.recentSalesCount}</span>
            <span className="text-sm text-text-muted mb-1">last 60m</span>
          </div>
          <p className="text-xs text-emerald-400 font-medium mt-3">+ Fresh Deal Injections</p>
        </Card>

        <Card className="p-4 bg-surface-main border-border-subtle flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none"></div>
          <div className="flex items-center justify-between mb-2 relative z-10">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Shift Yield (Gross)</span>
            <Zap className="text-purple-500" size={16} />
          </div>
          <div className="flex items-end gap-2 relative z-10">
            <span className="text-3xl font-black text-text-primary">${(liveMetrics.todayRevenue / 1000).toFixed(1)}k</span>
          </div>
          <p className="text-xs text-text-muted mt-3 relative z-10">{liveMetrics.todayApprovedCount} hard closures</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col: Gamification Leaderboard */}
        <div className="md:col-span-2 flex flex-col space-y-4">
          <Card className="p-0 bg-surface-main border-border-subtle overflow-hidden flex-1 flex flex-col">
            <div className="p-4 border-b border-border-subtle bg-surface-alt/30 flex items-center justify-between relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
               <div className="flex items-center gap-2 relative z-10">
                  <Trophy className="text-amber-500" size={20} />
                  <h3 className="font-bold text-text-primary">Live Leaderboard (Gamification)</h3>
               </div>
               <span className="text-xs bg-amber-500/10 text-amber-500 px-2 py-1 rounded font-bold uppercase tracking-wider relative z-10">Morale Loop Active</span>
            </div>
            
            <div className="p-0 overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-alt text-text-muted text-xs uppercase tracking-wider border-b border-border-subtle">
                    <th className="p-4 font-semibold w-16">Rank</th>
                    <th className="p-4 font-semibold">Operative</th>
                    <th className="p-4 font-semibold text-right">LTV Conv.</th>
                    <th className="p-4 font-semibold w-40">Win Rate %</th>
                    <th className="p-4 font-semibold text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {liveMetrics.topAgents.length > 0 ? (
                    liveMetrics.topAgents.map((agent, idx) => (
                      <tr key={agent.agentId} className="hover:bg-surface-hover/50 transition-colors group">
                        <td className="p-4 text-sm font-bold text-text-muted">
                           {idx === 0 ? <span className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">#1</span> : `#${idx + 1}`}
                        </td>
                        <td className="p-4 relative">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                                {agent.agentName.charAt(0)}
                              </div>
                              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-surface-main ${agent.status === 'online' ? 'bg-status-success' : agent.status === 'break' ? 'bg-status-warning' : 'bg-status-error'}`}></span>
                            </div>
                            <span className="font-bold text-sm text-text-primary group-hover:text-amber-400 transition-colors">{agent.agentName}</span>
                          </div>
                        </td>
                        <td className="p-4 text-right text-sm font-mono text-text-secondary">{agent.approved}</td>
                        <td className="p-4">
                           <div className="flex items-center gap-2">
                             <span className="text-sm font-bold">{agent.winRate.toFixed(1)}%</span>
                             <div className="flex-1 h-1.5 bg-surface-alt rounded-full overflow-hidden">
                               <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300" style={{ width: `${agent.winRate}%` }}></div>
                             </div>
                           </div>
                        </td>
                        <td className="p-4 text-right text-sm font-bold text-status-success">${agent.revenue.toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-text-muted text-sm italic">Initializing gamification matrix... awaiting conversions.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Col: CLM & Ecosystem Pipeline */}
        <div className="flex flex-col space-y-4">
          <Card className="p-4 bg-surface-main border-border-subtle flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border-subtle">
               <Repeat className="text-emerald-500" size={18} />
               <h3 className="font-bold text-text-primary text-sm">CLM Ecosystem Engine</h3>
            </div>
            
            <div className="space-y-4 flex-1">
               <div className="bg-surface-alt/50 border border-border-subtle rounded-lg p-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-full h-full bg-[linear-gradient(90deg,transparent_0%,rgba(16,185,129,0.05)_50%,transparent_100%)] animate-[shimmer_2s_infinite]"></div>
                  <div className="flex items-center justify-between mb-1 relative z-10">
                     <span className="text-xs font-bold text-text-muted">CX Winback Load</span>
                     <span className="text-xs font-mono text-emerald-400">{liveMetrics.pendingWinbacks} queued</span>
                  </div>
                  <p className="text-[10px] text-text-muted leading-tight relative z-10">Leveraging historical profile data to dispatch tailored up-sell callbacks.</p>
               </div>

               <div>
                 <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Imminent Agent Callbacks</h4>
                 <div className="space-y-2">
                   {liveMetrics.upcomingCallbacks.length > 0 ? (
                     liveMetrics.upcomingCallbacks.slice(0, 4).map((callback) => (
                       <div key={callback.id} className="flex items-start gap-3 bg-surface-highlight hover:bg-surface-hover transition-colors p-2.5 rounded border border-border-subtle group">
                         <div className="bg-blue-500/10 p-1.5 rounded group-hover:bg-blue-500/20 transition-colors">
                            <Clock className="text-blue-400" size={14} />
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className="text-sm font-bold text-text-primary truncate">{callback.linkedSaleId ? `Lead: ${callback.linkedSaleId.substring(0,8)}` : 'CX Follow-Up'}</p>
                           <p className="text-xs text-text-muted mt-0.5 whitespace-pre-wrap line-clamp-1">{callback.content || 'System scheduled task'}</p>
                         </div>
                         <div className="text-right shrink-0 relative top-1">
                            <span className="text-[10px] bg-surface-alt text-text-muted px-1.5 py-0.5 rounded font-mono border border-border-subtle">{formatTime(callback.reminderAt)}</span>
                         </div>
                       </div>
                     ))
                   ) : (
                     <div className="text-center py-4 text-xs text-text-muted italic border border-dashed border-border-subtle rounded">
                       No upcoming CLM tasks in immediate timeline.
                     </div>
                   )}
                 </div>
               </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-border-subtle flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-text-muted tracking-widest uppercase">System Mapping</span>
                    <span className="text-[10px] font-bold text-status-success uppercase bg-status-success/10 px-2 py-0.5 rounded">Active & Healthy</span>
                </div>
                <div className="h-16 w-full rounded-lg bg-surface-alt/50 border border-border-subtle relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-grid-slate-800/[0.05] bg-[length:12px_12px]"></div>
                    <div className="flex items-center justify-center w-full max-w-[200px] gap-2 opacity-50 relative z-10">
                        <div className="w-1.5 h-1.5 bg-text-primary rounded-full animate-ping"></div>
                        <div className="flex-1 border-t border-dashed border-text-muted"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                        <div className="flex-1 border-t border-dashed border-text-muted"></div>
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-ping shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                    </div>
                </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

