import React, { useMemo, useState } from 'react';
import { Sale, User } from '../../../types';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Users } from 'lucide-react';

interface DashboardStrategicAnalyticsProps {
  sales: Sale[];
  users: User[];
}

export const DashboardStrategicAnalytics: React.FC<DashboardStrategicAnalyticsProps> = ({
  sales,
  users,
}) => {
  const [activeTab, setActiveTab] = useState<'cohort' | 'attribution' | 'churn' | 'bottleneck'>(
    'cohort'
  );

  // Cohort Analysis
  const cohortData = useMemo(() => {
    const agents = users.filter((u) => u.role === 'agent');
    const cohorts = new Map<number, { sales: number; agents: number }>();

    agents.forEach((agent) => {
      const weeksActive = Math.floor((Date.now() - (agent.created || Date.now())) / (7 * 24 * 60 * 60 * 1000));
      const key = Math.max(0, weeksActive);

      const agentSales = sales.filter((s) => s.agentId === agent.id && s.status === 'Approved').length;

      if (!cohorts.has(key)) {
        cohorts.set(key, { sales: 0, agents: 0 });
      }

      const current = cohorts.get(key)!;
      current.sales += agentSales;
      current.agents += 1;
    });

    return Array.from(cohorts.entries())
      .map(([week, data]) => ({
        week: `Week ${week + 1}`,
        avgSales: Math.round(data.sales / data.agents),
        agentCount: data.agents,
        retention: 100 - (week * 12), // Simulated retention curve
      }))
      .sort((a, b) => parseInt(a.week.split(' ')[1]) - parseInt(b.week.split(' ')[1]))
      .slice(0, 6);
  }, [users, sales]);

  // Attribution Analysis
  const attributionData = useMemo(() => {
    const sources = new Map<string, { revenue: number; count: number; approved: number }>();

    sales.forEach((sale) => {
      const source = (sale as any).sourceType || 'Direct';
      if (!sources.has(source)) {
        sources.set(source, { revenue: 0, count: 0, approved: 0 });
      }

      const current = sources.get(source)!;
      current.revenue += sale.amount || 0;
      current.count += 1;
      if (sale.status === 'Approved') {
        current.approved += 1;
      }
    });

    return Array.from(sources.entries())
      .map(([source, data]) => ({
        source,
        revenue: data.revenue,
        count: data.count,
        winRate: ((data.approved / data.count) * 100).toFixed(1),
        ltv: Math.round(data.revenue / data.count),
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [sales]);

  // Churn Analysis
  const churnData = useMemo(() => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const sixtyDaysAgo = Date.now() - 60 * 24 * 60 * 60 * 1000;

    const highRisk = sales.filter(
      (s) => s.status === 'Approved' && s.timestamp < thirtyDaysAgo && !s.isReorder
    ).length;

    const mediumRisk = sales.filter(
      (s) => s.status === 'Approved' && s.timestamp < sixtyDaysAgo && s.timestamp >= thirtyDaysAgo && !s.isReorder
    ).length;

    const recentReorders = sales.filter((s) => s.isReorder && s.status === 'Approved').length;

    return {
      highRisk,
      mediumRisk,
      safe: Math.max(0, sales.filter((s) => s.status === 'Approved').length - highRisk - mediumRisk),
      reorderRate: recentReorders,
    };
  }, [sales]);

  // Bottleneck Analysis
  const bottleneckData = useMemo(() => {
    const stages: Record<string, number> = {
      'New': 0,
      'Contacted': 0,
      'Interested': 0,
      'Sale': 0,
      'Approved': 0,
    };

    sales.forEach((sale) => {
      if (sale.status === 'Pending' || sale.status === 'Declined') {
        stages['New'] += 1;
      } else if (sale.status === 'Rescue In Progress') {
        stages['Contacted'] += 1;
      } else if ((sale as any).dealStage === 'Interested') {
        stages['Interested'] += 1;
      } else if (sale.status === 'Approved') {
        stages['Approved'] += 1;
      }
    });

    const total = Object.values(stages).reduce((a, b) => a + b, 0);

    return Object.entries(stages).map(([stage, count]) => ({
      stage,
      count,
      percentage: total > 0 ? ((count / total) * 100).toFixed(1) : '0.0',
    }));
  }, [sales]);

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 bg-slate-800 rounded-lg p-2 border border-slate-700">
        {(['cohort', 'attribution', 'churn', 'bottleneck'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded font-semibold text-sm transition-colors ${
              activeTab === tab
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        {activeTab === 'cohort' && (
          <div>
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 size={20} />
              Agent Cohort Performance
            </h3>
            <div className="space-y-3">
              {cohortData.map((cohort) => (
                <div key={cohort.week}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-white">{cohort.week}</span>
                    <span className="text-sm text-slate-400">
                      {cohort.avgSales} sales/agent • {cohort.agentCount} agents
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${(cohort.retention / 100) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'attribution' && (
          <div>
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <PieChartIcon size={20} />
              Channel Attribution
            </h3>
            <div className="space-y-3">
              {attributionData.map((source) => (
                <div key={source.source} className="bg-slate-700 rounded p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-white">{source.source}</span>
                    <span className="text-emerald-400 font-bold">${Math.round(source.revenue / 1000)}k</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-300">
                    <div>Sales: {source.count}</div>
                    <div>Win Rate: {source.winRate}%</div>
                    <div>LTV: ${source.ltv}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'churn' && (
          <div>
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={20} />
              Churn Risk Analysis
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-red-900 bg-opacity-40 border border-red-700 rounded p-4 text-center">
                <p className="text-2xl font-black text-red-400">{churnData.highRisk}</p>
                <p className="text-xs text-red-300 mt-2">High Risk (30+ days)</p>
              </div>
              <div className="bg-yellow-900 bg-opacity-40 border border-yellow-700 rounded p-4 text-center">
                <p className="text-2xl font-black text-yellow-400">{churnData.mediumRisk}</p>
                <p className="text-xs text-yellow-300 mt-2">Medium Risk (30-60 days)</p>
              </div>
              <div className="bg-green-900 bg-opacity-40 border border-green-700 rounded p-4 text-center">
                <p className="text-2xl font-black text-green-400">{churnData.safe}</p>
                <p className="text-xs text-green-300 mt-2">Safe (Recent)</p>
              </div>
            </div>
            <div className="bg-slate-700 rounded p-4">
              <p className="font-semibold text-white mb-2">Reorder Rate: {churnData.reorderRate}</p>
              <p className="text-sm text-slate-400">
                High reorder rate = good retention. Low rate = churn risk.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'bottleneck' && (
          <div>
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Users size={20} />
              Pipeline Bottleneck Analysis
            </h3>
            <div className="space-y-3">
              {bottleneckData.map((stage) => (
                <div key={stage.stage}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-white">{stage.stage}</span>
                    <span className="text-sm text-slate-400">
                      {stage.count} ({stage.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-purple-500"
                      style={{ width: `${parseFloat(stage.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-900 bg-opacity-30 border border-blue-700 rounded">
              <p className="text-sm text-blue-200">
                💡 Insight: Biggest drop appears to be at 'Contacted' stage. Consider improving objection handling scripts.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
