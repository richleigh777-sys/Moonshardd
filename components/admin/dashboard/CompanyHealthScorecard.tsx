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
    if (score >= 80) return { label: 'Excellent', color: 'bg-emerald-50 border-emerald-200/50', textColor: 'text-emerald-600', icon: '🟢' };
    if (score >= 60) return { label: 'Good', color: 'bg-blue-50 border-blue-200/50', textColor: 'text-blue-600', icon: '🔵' };
    if (score >= 40) return { label: 'Fair', color: 'bg-amber-50 border-amber-200/50', textColor: 'text-amber-600', icon: '🟡' };
    return { label: 'Poor', color: 'bg-rose-50 border-rose-200/50', textColor: 'text-rose-600', icon: '🔴' };
  };

  const status = getHealthStatus(metrics.healthScore);

  return (
    <div className="space-y-4">
      {/* Main Health Card */}
      <div className={`${status.color} bg-surface-main/60 dark:bg-surface-main/40 backdrop-blur-2xl rounded-[32px] border shadow-panel hover:shadow-float transition-all p-6`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-text-muted font-bold uppercase tracking-wider mb-2">Business Health</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-4xl font-extrabold text-text-primary tracking-tight">{Math.round(metrics.healthScore)}</span>
              <div className="flex flex-col">
                <span className={`text-xl font-bold ${status.textColor}`}>{status.label}</span>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Overall Status</p>
              </div>
            </div>
          </div>
          <div className="text-xl">{status.icon}</div>
        </div>

        {/* Health Bar */}
        <div className="w-full bg-surface-alt rounded-full h-2 mb-3">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              metrics.healthScore >= 80
                ? 'bg-emerald-500'
                : metrics.healthScore >= 60
                ? 'bg-blue-500'
                : metrics.healthScore >= 40
                ? 'bg-amber-500'
                : 'bg-rose-500'
            }`}
            style={{ width: `${metrics.healthScore}%` }}
          />
        </div>

        {/* Trend */}
        <div className="flex items-center gap-2">
          {metrics.revenueTrend >= 0 ? (
            <TrendingUp className="text-emerald-600" size={16} />
          ) : (
            <TrendingDown className="text-rose-600" size={16} />
          )}
          <span className={`font-semibold ${metrics.revenueTrend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {metrics.revenueTrend >= 0 ? '+' : ''}{metrics.revenueTrend.toFixed(1)}%
          </span>
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">vs yesterday</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Revenue */}
        <div className="bg-surface-main/60 dark:bg-surface-main/40 backdrop-blur-2xl border border-border-subtle/60 dark:border-border-subtle/20 shadow-panel rounded-2xl p-4">
          <p className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Revenue Today</p>
          <p className="text-4xl font-extrabold text-text-primary tracking-tight">${(metrics.todayRevenue / 1000).toFixed(1)}k</p>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mt-1">Yesterday: ${(metrics.yesterdayRevenue / 1000).toFixed(1)}k</p>
        </div>

        {/* Agent Efficiency */}
        <div className="bg-surface-main/60 dark:bg-surface-main/40 backdrop-blur-2xl border border-border-subtle/60 dark:border-border-subtle/20 shadow-panel rounded-2xl p-4">
          <p className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Agent Efficiency</p>
          <p className="text-4xl font-extrabold text-text-primary tracking-tight">{Math.round(metrics.agentEfficiency)}%</p>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mt-1">
            {metrics.onlineAgents}/{metrics.totalAgents} online
          </p>
        </div>

        {/* Win Rate */}
        <div className="bg-surface-main/60 dark:bg-surface-main/40 backdrop-blur-2xl border border-border-subtle/60 dark:border-border-subtle/20 shadow-panel rounded-2xl p-4">
          <p className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Win Rate (7d)</p>
          <p className="text-4xl font-extrabold text-text-primary tracking-tight">{Math.round(metrics.winRate)}%</p>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mt-1">Approval efficiency</p>
        </div>

        {/* Satisfaction */}
        <div className="bg-surface-main/60 dark:bg-surface-main/40 backdrop-blur-2xl border border-border-subtle/60 dark:border-border-subtle/20 shadow-panel rounded-2xl p-4">
          <p className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Satisfaction</p>
          <p className="text-4xl font-extrabold text-text-primary tracking-tight">{Math.round(metrics.satisfactionScore)}%</p>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mt-1">Reorder rate</p>
        </div>
      </div>

      {/* Alerts */}
      {(metrics.pendingCallbacks > 5 || metrics.churnRisk > 10) && (
        <div className="bg-rose-50/50 backdrop-blur-2xl border border-rose-200/50 shadow-panel rounded-[32px] p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-rose-600 flex-shrink-0 mt-1" size={20} />
            <div className="flex-1">
              <p className="font-semibold text-rose-600 mb-2">⚠️ Alerts ({[metrics.pendingCallbacks > 5, metrics.churnRisk > 10].filter(Boolean).length})</p>
              <ul className="space-y-1 text-sm text-rose-600 font-medium">
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
        <div className="bg-emerald-50/50 backdrop-blur-2xl border border-emerald-200/50 shadow-panel rounded-[32px] p-6 flex items-start gap-3">
          <CheckCircle2 className="text-emerald-600 flex-shrink-0 mt-1" size={20} />
          <div className="flex-1">
            <p className="font-semibold text-emerald-700">✅ Performance Highlights</p>
            <ul className="space-y-1 text-sm text-emerald-600 font-medium mt-1">
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
