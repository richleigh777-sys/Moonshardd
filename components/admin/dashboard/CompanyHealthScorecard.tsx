import React, { useMemo } from 'react';
import { Sale, User, Note } from '../../../types';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Zap } from 'lucide-react';

interface CompanyHealthScorecardProps {
  sales: Sale[];
  users: User[];
  notes: Note[];
}

export const CompanyHealthScorecard: React.FC<CompanyHealthScorecardProps> = ({
  sales,
  users,
  notes,
}) => {
  const metrics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();

    // Revenue metrics
    const todaySales = sales.filter((s) => s.timestamp >= todayMs);
    const approvedToday = todaySales.filter((s) => s.status === 'Approved');
    const todayRevenue = approvedToday.reduce((sum, s) => sum + s.amount, 0);

    // Yesterday comparison
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayMs = yesterday.getTime();
    const yesterdaySales = sales.filter(
      (s) => s.timestamp >= yesterdayMs && s.timestamp < todayMs
    );
    const yesterdayRevenue = yesterdaySales
      .filter((s) => s.status === 'Approved')
      .reduce((sum, s) => sum + s.amount, 0);

    const revenueTrend = yesterdayRevenue > 0
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
      : 0;

    // Agent efficiency
    const agents = users.filter((u) => u.role === 'agent');
    const onlineAgents = agents.filter((u) => u.currentStatus === 'online').length;
    const agentEfficiency = agents.length > 0 ? (onlineAgents / agents.length) * 100 : 0;

    // Win rate (last 7 days)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weekSales = sales.filter((s) => s.timestamp >= sevenDaysAgo.getTime());
    const weekApproved = weekSales.filter((s) => s.status === 'Approved').length;
    const winRate = weekSales.length > 0 ? (weekApproved / weekSales.length) * 100 : 0;

    // Pending callbacks
    const pendingCallbacks = notes.filter(
      (n) => n.type === 'callback' && n.status === 'Pending'
    ).length;

    // Customer satisfaction (based on reorders)
    const reorders = sales.filter((s) => s.isReorder && s.status === 'Approved').length;
    const totalApproved = sales.filter((s) => s.status === 'Approved').length;
    const satisfactionScore = totalApproved > 0 ? (reorders / totalApproved) * 100 : 0;

    // Churn detection (customers not contacted in 30+ days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const churnRisk = sales.filter(
      (s) => s.status === 'Approved' && s.timestamp < thirtyDaysAgo
    ).length;

    // Calculate overall health score (0-100)
    let healthScore = 100;

    // Deduct for low revenue
    if (todayRevenue < 1000) healthScore -= 20;
    else if (todayRevenue < 2000) healthScore -= 10;

    // Deduct for low agent efficiency
    if (agentEfficiency < 50) healthScore -= 15;
    else if (agentEfficiency < 70) healthScore -= 8;

    // Deduct for low win rate
    if (winRate < 30) healthScore -= 15;
    else if (winRate < 50) healthScore -= 8;

    // Deduct for pending callbacks
    if (pendingCallbacks > 10) healthScore -= 10;
    else if (pendingCallbacks > 5) healthScore -= 5;

    // Bonus for good satisfaction
    if (satisfactionScore > 40) healthScore += 5;

    // Deduct for churn risk
    if (churnRisk > 20) healthScore -= 10;
    else if (churnRisk > 10) healthScore -= 5;

    return {
      healthScore: Math.max(0, Math.min(100, healthScore)),
      todayRevenue,
      revenueTrend,
      agentEfficiency,
      onlineAgents,
      totalAgents: agents.length,
      winRate,
      satisfactionScore,
      pendingCallbacks,
      churnRisk,
      yesterdayRevenue,
    };
  }, [sales, users, notes]);

  const getHealthStatus = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'bg-green-900', textColor: 'text-green-400', icon: '🟢' };
    if (score >= 60) return { label: 'Good', color: 'bg-blue-900', textColor: 'text-blue-400', icon: '🔵' };
    if (score >= 40) return { label: 'Fair', color: 'bg-yellow-900', textColor: 'text-yellow-400', icon: '🟡' };
    return { label: 'Poor', color: 'bg-red-900', textColor: 'text-red-400', icon: '🔴' };
  };

  const status = getHealthStatus(metrics.healthScore);

  return (
    <div className="space-y-4">
      {/* Main Health Card */}
      <div className={`${status.color} border border-opacity-50 rounded-xl p-4 shadow-lg`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Business Health</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xl font-bold text-white">{Math.round(metrics.healthScore)}</span>
              <div className="flex flex-col">
                <span className={`text-xl font-bold ${status.textColor}`}>{status.label}</span>
                <p className="text-sm text-slate-400">Overall Status</p>
              </div>
            </div>
          </div>
          <div className="text-xl">{status.icon}</div>
        </div>

        {/* Health Bar */}
        <div className="w-full bg-black bg-opacity-30 rounded-full h-2 mb-3">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              metrics.healthScore >= 80
                ? 'bg-green-500'
                : metrics.healthScore >= 60
                ? 'bg-blue-500'
                : metrics.healthScore >= 40
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${metrics.healthScore}%` }}
          />
        </div>

        {/* Trend */}
        <div className="flex items-center gap-2">
          {metrics.revenueTrend >= 0 ? (
            <TrendingUp className="text-green-400" size={16} />
          ) : (
            <TrendingDown className="text-red-400" size={16} />
          )}
          <span className={`font-semibold ${metrics.revenueTrend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {metrics.revenueTrend >= 0 ? '+' : ''}{metrics.revenueTrend.toFixed(1)}%
          </span>
          <span className="text-slate-400 text-sm">vs yesterday</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Revenue */}
        <div className="bg-emerald-900 bg-opacity-40 border border-emerald-700 rounded-lg p-3">
          <p className="text-sm font-semibold text-emerald-300 uppercase tracking-wider mb-1">Revenue Today</p>
          <p className="text-xl font-bold text-white">${(metrics.todayRevenue / 1000).toFixed(1)}k</p>
          <p className="text-sm text-slate-400 mt-1">Yesterday: ${(metrics.yesterdayRevenue / 1000).toFixed(1)}k</p>
        </div>

        {/* Agent Efficiency */}
        <div className="bg-indigo-900 bg-opacity-40 border border-indigo-700 rounded-lg p-3">
          <p className="text-sm font-semibold text-indigo-300 uppercase tracking-wider mb-1">Agent Efficiency</p>
          <p className="text-xl font-bold text-white">{Math.round(metrics.agentEfficiency)}%</p>
          <p className="text-sm text-slate-400 mt-1">
            {metrics.onlineAgents}/{metrics.totalAgents} online
          </p>
        </div>

        {/* Win Rate */}
        <div className="bg-amber-900 bg-opacity-40 border border-amber-700 rounded-lg p-3">
          <p className="text-sm font-semibold text-amber-300 uppercase tracking-wider mb-1">Win Rate (7d)</p>
          <p className="text-xl font-bold text-white">{Math.round(metrics.winRate)}%</p>
          <p className="text-sm text-slate-400 mt-1">Approval efficiency</p>
        </div>

        {/* Satisfaction */}
        <div className="bg-purple-900 bg-opacity-40 border border-purple-700 rounded-lg p-3">
          <p className="text-sm font-semibold text-purple-300 uppercase tracking-wider mb-1">Satisfaction</p>
          <p className="text-xl font-bold text-white">{Math.round(metrics.satisfactionScore)}%</p>
          <p className="text-sm text-slate-400 mt-1">Reorder rate</p>
        </div>
      </div>

      {/* Alerts */}
      {(metrics.pendingCallbacks > 5 || metrics.churnRisk > 10) && (
        <div className="bg-red-900 bg-opacity-30 border border-red-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-400 flex-shrink-0 mt-1" size={20} />
            <div className="flex-1">
              <p className="font-semibold text-red-300 mb-2">⚠️ Alerts ({[metrics.pendingCallbacks > 5, metrics.churnRisk > 10].filter(Boolean).length})</p>
              <ul className="space-y-1 text-sm text-red-200">
                {metrics.pendingCallbacks > 5 && (
                  <li>• {metrics.pendingCallbacks} callbacks pending (may indicate bottleneck)</li>
                )}
                {metrics.churnRisk > 10 && (
                  <li>• {metrics.churnRisk} customers at churn risk (not contacted in 30 days)</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Good Signs */}
      {metrics.satisfactionScore > 30 && metrics.winRate > 50 && (
        <div className="bg-green-900 bg-opacity-30 border border-green-700 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle2 className="text-green-400 flex-shrink-0 mt-1" size={20} />
          <div className="flex-1">
            <p className="font-semibold text-green-300">✅ Performance Highlights</p>
            <ul className="space-y-1 text-sm text-green-200 mt-1">
              {metrics.satisfactionScore > 30 && (
                <li>• High customer satisfaction (reorder rate: {Math.round(metrics.satisfactionScore)}%)</li>
              )}
              {metrics.winRate > 50 && (
                <li>• Strong approval efficiency ({Math.round(metrics.winRate)}% win rate)</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
