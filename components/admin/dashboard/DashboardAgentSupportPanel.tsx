import React, { useMemo } from 'react';
import { Sale, User, SystemConfig } from '../../../types';
import { AlertTriangle, Send, BarChart3, Zap } from 'lucide-react';

interface DashboardAgentSupportPanelProps {
  sales: Sale[];
  users: User[];
  systemConfig: SystemConfig;
  onSendMessage: (agentId: string, message: string) => void;
}

export const DashboardAgentSupportPanel: React.FC<DashboardAgentSupportPanelProps> = ({
  sales,
  users,
  systemConfig,
  onSendMessage,
}) => {
  const agentsNeedingSupport = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();

    const agents = users.filter((u) => u.role === 'agent' && u.active);
    const dailyGoal = 5; // Hardcoded for now, could be in config

    return agents
      .map((agent) => {
        const todaysSales = sales.filter(
          (s) => s.agentId === agent.id && s.timestamp >= todayMs && s.status === 'Approved'
        );
        const count = todaysSales.length;
        const isBelow = count < dailyGoal;
        const deficit = dailyGoal - count;

        return {
          agent,
          todaysSales: count,
          deficit,
          isBelow,
          revenue: todaysSales.reduce((sum, s) => sum + s.amount, 0),
          performance: (count / dailyGoal) * 100,
        };
      })
      .filter((a) => a.isBelow)
      .sort((a, b) => a.performance - b.performance)
      .slice(0, 4);
  }, [sales, users]);

  const getSuggestion = (agent: User, deficit: number, revenue: number) => {
    if (deficit > 3) {
      return `${agent.name} needs support - only ${deficit} sales to quota. Consider pairing with top performer.`;
    } else if (agent.currentStatus !== 'online') {
      return `${agent.name} is ${agent.currentStatus}. Check if they need assistance.`;
    } else {
      return `${agent.name} is close to goal - ${deficit} more sales needed. Send encouragement!`;
    }
  };

  if (agentsNeedingSupport.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 text-center">
        <Zap className="mx-auto text-green-400 mb-3" size={32} />
        <p className="font-semibold text-white mb-1">All Agents on Track!</p>
        <p className="text-sm text-slate-400">Everyone is meeting or exceeding their goals</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-900 to-orange-800 p-4 border-b border-orange-700">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-orange-300" size={20} />
          <div>
            <h3 className="font-bold text-white">Agent Support Needed</h3>
            <p className="text-xs text-orange-200">{agentsNeedingSupport.length} agents below daily target</p>
          </div>
        </div>
      </div>

      {/* Agents List */}
      <div className="divide-y divide-slate-700">
        {agentsNeedingSupport.map(({ agent, todaysSales, deficit, revenue, performance }) => (
          <div key={agent.id} className="p-4">
            {/* Header Row */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-white">{agent.name}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {todaysSales}/5 sales • ${revenue.toLocaleString()} revenue
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-orange-400">{deficit}</div>
                <p className="text-xs text-slate-400">more needed</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-700 rounded-full h-2 mb-3">
              <div
                className="h-2 rounded-full bg-orange-500 transition-all"
                style={{ width: `${Math.min(100, performance)}%` }}
              />
            </div>

            {/* Suggestion */}
            <div className="bg-slate-700 rounded p-2 mb-3">
              <p className="text-xs text-slate-300">{getSuggestion(agent, deficit, revenue)}</p>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <button
                onClick={() =>
                  onSendMessage(
                    agent.id,
                    `Hey ${agent.name}! You're ${deficit} sales away from quota. Let's push hard! 💪`
                  )
                }
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded transition-colors"
              >
                <Send size={16} />
                Encourage
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold py-2 rounded transition-colors">
                <BarChart3 size={16} />
                View Stats
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
