import React, { useMemo, useState } from 'react';
import { Sale, User, SystemConfig } from '../../../types';
import { AlertTriangle, Send, BarChart3, Zap, Clock, Activity, Target } from 'lucide-react';

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
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const agentsNeedingSupport = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();

    const agents = users.filter((u) => u.role === 'agent' && u.active);
    const dailyGoal = 5; // Hardcoded for now, could be in config

    return agents
      .map((agent) => {
        const todaysSales = sales.filter(
          (s) => s.agentId === agent.id && s.timestamp >= todayMs
        );
        const approvedCount = todaysSales.filter((s) => s.status === 'Approved').length;
        const totalCount = todaysSales.length;
        
        // Calculate basic stats for the expansion panel
        const pendingCount = todaysSales.filter((s) => s.status === 'Pending').length;
        const declinedCount = todaysSales.filter((s) => s.status === 'Declined' || s.status === 'Cancelled').length;
        
        const isBelow = approvedCount < dailyGoal;
        const deficit = dailyGoal - approvedCount;

        return {
          agent,
          todaysSales: approvedCount,
          totalCount,
          pendingCount,
          declinedCount,
          deficit,
          isBelow,
          revenue: todaysSales.filter(s => s.status === 'Approved').reduce((sum, s) => sum + s.amount, 0),
          performance: (approvedCount / dailyGoal) * 100,
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

  const handleSendMessage = (agentId: string, message: string) => {
    onSendMessage(agentId, message);
    setToastMessage("Direct encouragement message dispatched to agent console.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (agentsNeedingSupport.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 text-center">
        <Zap className="mx-auto text-green-400 mb-3" size={32} />
        <p className="font-semibold text-white mb-1">All Agents on Track!</p>
        <p className="text-sm text-slate-400">Everyone is meeting or exceeding their goals</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden relative">
      {/* Internal Toast Overlay */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500/90 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2">
          <Send size={14} />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-900 to-orange-800 p-4 border-b border-orange-700">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-orange-300" size={20} />
          <div>
            <h3 className="font-bold text-white">Agent Support Needed</h3>
            <p className="text-sm text-orange-200">{agentsNeedingSupport.length} agents below daily target</p>
          </div>
        </div>
      </div>

      {/* Agents List */}
      <div className="divide-y divide-slate-700 max-h-[300px] overflow-y-auto">
        {agentsNeedingSupport.map(({ agent, todaysSales, totalCount, pendingCount, declinedCount, deficit, revenue, performance }) => (
          <div key={agent.id} className="p-4 flex flex-col gap-3 transition-colors hover:bg-slate-700/30">
            {/* Header Row */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white">{agent.name}</p>
                  <span className={`w-2 h-2 rounded-full ${agent.currentStatus === 'online' ? 'bg-green-500' : 'bg-slate-500'}`}></span>
                </div>
                <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                  <span>{todaysSales}/5 sales</span>
                  <span className="opacity-50">•</span>
                  <span className="text-emerald-400">${revenue.toLocaleString()} rev</span>
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-orange-400 leading-none">{deficit}</div>
                <p className="text-sm text-slate-400 uppercase tracking-wide mt-1">gap</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-orange-500 transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(100, performance)}%` }}
              />
            </div>

            {/* Suggestion */}
            <div className="bg-slate-750 border border-slate-700/50 rounded p-2.5">
              <p className="text-sm text-slate-300 flex items-start gap-2">
                <Activity size={14} className="text-blue-400 shrink-0 mt-0.5" />
                {getSuggestion(agent, deficit, revenue)}
              </p>
            </div>

            {/* Expanded Stats Section */}
            {expandedAgentId === agent.id && (
              <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-slate-900/50 rounded p-2 text-center border border-slate-700 text-sm">
                    <p className="text-slate-400 mb-1">Total</p>
                    <p className="text-white font-mono font-bold">{totalCount}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded p-2 text-center border border-slate-700 text-sm">
                     <p className="text-slate-400 mb-1">Pending</p>
                     <p className="text-yellow-400 font-mono font-bold">{pendingCount}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded p-2 text-center border border-slate-700 text-sm">
                     <p className="text-slate-400 mb-1">Dropped</p>
                     <p className="text-red-400 font-mono font-bold">{declinedCount}</p>
                  </div>
                </div>
                {declinedCount > pendingCount && (
                  <p className="text-sm text-red-300 bg-red-900/20 p-2 rounded mb-3 border border-red-900/50">
                     <AlertTriangle size={12} className="inline mr-1 relative -top-[1px]"/>
                     High drop rate detected today. Check recent script compliance.
                  </p>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex gap-2 mt-1">
              <button
                onClick={() =>
                  handleSendMessage(
                    agent.id,
                    `Hey ${agent.name}! You're ${deficit} sales away from quota. Let's push hard! 💪`
                  )
                }
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600/90 hover:bg-blue-600 text-white text-sm py-2 px-3 rounded-md transition-colors border border-blue-500/50"
              >
                <Send size={14} />
                Encourage
              </button>
              <button 
                onClick={() => setExpandedAgentId(expandedAgentId === agent.id ? null : agent.id)}
                className={`flex-1 flex items-center justify-center gap-2 text-sm py-2 px-3 rounded-md transition-colors border ${
                  expandedAgentId === agent.id 
                    ? 'bg-slate-700 text-white border-slate-600' 
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <BarChart3 size={14} />
                {expandedAgentId === agent.id ? 'Hide Stats' : 'View Stats'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
