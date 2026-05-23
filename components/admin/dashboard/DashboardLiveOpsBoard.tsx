import React, { useEffect, useState, useMemo } from 'react';
import { Sale, User, Note } from '../../../types';
import { Phone, Users, AlertCircle, TrendingUp, Clock, Zap } from 'lucide-react';

interface DashboardLiveOpsBoardProps {
  sales: Sale[];
  users: User[];
  notes: Note[];
}

export const DashboardLiveOpsBoard: React.FC<DashboardLiveOpsBoardProps> = ({
  sales,
  users,
  notes,
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

    // Last 30 minutes
    const thirtyMinutesAgo = now - 30 * 60 * 1000;
    const recentSales = sales.filter((s) => s.timestamp >= thirtyMinutesAgo);
    const recentApproved = recentSales.filter((s) => s.status === 'Approved').length;
    const recentDeclined = recentSales.filter((s) => s.status === 'Declined').length;
    const recentPending = recentSales.filter((s) => s.status === 'Pending').length;

    // Today's metrics
    const todaySales = sales.filter((s) => s.timestamp >= todayMs);
    const todayApproved = todaySales.filter((s) => s.status === 'Approved').length;
    const todayRevenue = todayApproved * 500; // Average

    // Agents status
    const agents = users.filter((u) => u.role === 'agent');
    const onlineAgents = agents.filter((u) => u.currentStatus === 'online').length;
    const breakAgents = agents.filter((u) => u.currentStatus === 'break').length;
    const offlineAgents = agents.filter((u) => u.currentStatus === 'offline').length;

    // Pending callbacks (next 2 hours)
    const twoHoursFromNow = now + 2 * 60 * 60 * 1000;
    const upcomingCallbacks = notes.filter(
      (n) =>
        n.type === 'callback' &&
        n.status === 'Pending' &&
        n.reminderAt &&
        n.reminderAt > now &&
        n.reminderAt < twoHoursFromNow
    );

    // Top current agents (sales in last hour)
    const oneHourAgo = now - 60 * 60 * 1000;
    const topAgentsMap = new Map<string, number>();
    recentSales.forEach((sale) => {
      if (!sale.agentId) return;
      const current = topAgentsMap.get(sale.agentId) || 0;
      topAgentsMap.set(sale.agentId, current + 1);
    });
    const topAgents = Array.from(topAgentsMap.entries())
      .map(([agentId, count]) => {
        const agent = agents.find((a) => a.id === agentId);
        return { agentId, agentName: agent?.name || 'Unknown', count, status: agent?.currentStatus || 'offline' };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      recentSales: recentSales.length,
      recentApproved,
      recentDeclined,
      recentPending,
      todayApproved,
      todayRevenue,
      onlineAgents,
      breakAgents,
      offlineAgents,
      totalAgents: agents.length,
      upcomingCallbacks,
      topAgents,
    };
  }, [sales, users, notes, now]);

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '—';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4 bg-slate-900 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500 bg-opacity-20 rounded-lg">
            <Zap className="text-cyan-400" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Live Operations</h3>
            <p className="text-xs text-slate-400">Real-time activity feed</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-mono text-cyan-400">{new Date(now).toLocaleTimeString()}</p>
          <p className="text-xs text-slate-500">Last 30 minutes</p>
        </div>
      </div>

      {/* Active Calls */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <Phone className="text-blue-400" size={18} />
          <p className="font-semibold text-white">Active Calls: {liveMetrics.recentSales}</p>
        </div>
        <div className="space-y-2">
          {liveMetrics.recentSales > 0 ? (
            <div>
              <div className="text-sm text-slate-300">
                {liveMetrics.recentApproved} approved • {liveMetrics.recentPending} pending • {liveMetrics.recentDeclined} declined
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                <div
                  className="h-2 rounded-full bg-green-500 transition-all"
                  style={{
                    width: `${
                      liveMetrics.recentSales > 0
                        ? (liveMetrics.recentApproved / liveMetrics.recentSales) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No recent activity</p>
          )}
        </div>
      </div>

      {/* Agent Status */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <Users className="text-indigo-400" size={18} />
          <p className="font-semibold text-white">Agent Status</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-900 bg-opacity-40 rounded p-3 border border-green-700">
            <p className="text-2xl font-black text-green-400">{liveMetrics.onlineAgents}</p>
            <p className="text-xs text-slate-300 mt-1">Online</p>
          </div>
          <div className="bg-yellow-900 bg-opacity-40 rounded p-3 border border-yellow-700">
            <p className="text-2xl font-black text-yellow-400">{liveMetrics.breakAgents}</p>
            <p className="text-xs text-slate-300 mt-1">On Break</p>
          </div>
          <div className="bg-red-900 bg-opacity-40 rounded p-3 border border-red-700">
            <p className="text-2xl font-black text-red-400">{liveMetrics.offlineAgents}</p>
            <p className="text-xs text-slate-300 mt-1">Offline</p>
          </div>
        </div>
      </div>

      {/* Top Performers (Live) */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="text-emerald-400" size={18} />
          <p className="font-semibold text-white">Top Performers (Now)</p>
        </div>
        <div className="space-y-2">
          {liveMetrics.topAgents.length > 0 ? (
            liveMetrics.topAgents.map((agent, idx) => (
              <div key={agent.agentId} className="flex items-center justify-between bg-slate-700 rounded p-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-400">#{idx + 1}</span>
                  <span className="text-sm font-semibold text-white">{agent.agentName}</span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      agent.status === 'online'
                        ? 'bg-green-900 text-green-300'
                        : 'bg-slate-600 text-slate-300'
                    }`}
                  >
                    {agent.status}
                  </span>
                </div>
                <span className="text-sm font-bold text-emerald-400">{agent.count} sales</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400 italic">No activity yet</p>
          )}
        </div>
      </div>

      {/* Upcoming Callbacks */}
      {liveMetrics.upcomingCallbacks.length > 0 && (
        <div className="bg-blue-900 bg-opacity-30 rounded-lg p-4 border border-blue-700">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="text-blue-400" size={18} />
            <p className="font-semibold text-white">Upcoming Callbacks ({liveMetrics.upcomingCallbacks.length})</p>
          </div>
          <div className="space-y-2">
            {liveMetrics.upcomingCallbacks.slice(0, 3).map((callback) => (
              <div key={callback.id} className="flex items-start gap-2 bg-slate-800 rounded p-2">
                <Clock className="text-blue-300 flex-shrink-0 mt-0.5" size={14} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{callback.linkedItemName || 'Unknown Customer'}</p>
                  <p className="text-xs text-slate-400">Due: {formatTime(callback.reminderAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Summary */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="text-purple-400" size={18} />
          <p className="font-semibold text-white">Today's Summary</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Approved Sales</p>
            <p className="text-2xl font-black text-emerald-400">{liveMetrics.todayApproved}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Revenue</p>
            <p className="text-2xl font-black text-blue-400">${(liveMetrics.todayRevenue / 1000).toFixed(1)}k</p>
          </div>
        </div>
      </div>
    </div>
  );
};
