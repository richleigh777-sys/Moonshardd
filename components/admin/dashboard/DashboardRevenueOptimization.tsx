import React, { useMemo } from 'react';
import { Sale, User } from '../../../types';
import { TrendingUp, Target, Zap } from 'lucide-react';

interface DashboardRevenueOptimizationProps {
  sales: Sale[];
  users: User[];
}

export const DashboardRevenueOptimization: React.FC<DashboardRevenueOptimizationProps> = ({
  sales,
  users,
}) => {
  const opportunities = useMemo(() => {
    const allOpportunities: Array<{
      type: string;
      title: string;
      description: string;
      potential: number;
      action: string;
      color: string;
      priority: number;
    }> = [];

    // 1. Recovery Sales
    const declinedSales = sales.filter((s) => s.status === 'Declined');
    const recoverableSales = declinedSales.filter(
      (s) =>
        s.declineReason &&
        [
          'Bank Security Hold',
          'Insufficient Funds',
          'Price',
          'Trust/Scam Fear',
        ].includes(s.declineReason)
    );
    const recoveryPotential = recoverableSales.reduce((sum, s) => sum + s.amount, 0);

    if (recoverableSales.length > 0) {
      allOpportunities.push({
        type: 'recovery',
        title: 'Recovery Sales Campaign',
        description: `${recoverableSales.length} declined sales recoverable (Bank holds, price concerns, etc.)`,
        potential: recoveryPotential,
        action: 'Start Recovery Campaign',
        color: 'bg-red-900',
        priority: 1,
      });
    }

    // 2. Early Upsell Campaigns (1-7 days ago)
    const approvedSales = sales.filter((s) => s.status === 'Approved');
    const upsellCandidates = approvedSales.filter((s) => {
      const daysSince = (Date.now() - s.timestamp) / (24 * 60 * 60 * 1000);
      return daysSince >= 1 && daysSince <= 7 && !s.isReorder;
    });
    
    if (upsellCandidates.length > 0) {
      allOpportunities.push({
        type: 'upsell',
        title: '24h Early Upsell Campaign',
        description: `${upsellCandidates.length} recent customers (check delivery & upsell packages)`,
        potential: upsellCandidates.length * 300,
        action: 'Distribute Upsell Leads',
        color: 'bg-amber-900',
        priority: 2,
      });
    }

    // 3. Reorder Potential (30-60 days)
    const reorderCandidates = approvedSales.filter((s) => {
      const daysSince = (Date.now() - s.timestamp) / (24 * 60 * 60 * 1000);
      return daysSince >= 25 && daysSince <= 60 && !s.isReorder;
    });

    if (reorderCandidates.length > 0) {
      allOpportunities.push({
        type: 'reorder',
        title: '30-Day Reorder Push',
        description: `${reorderCandidates.length} customers ready for product restock`,
        potential: reorderCandidates.length * 500, // Average value
        action: 'Launch Reorder Push',
        color: 'bg-emerald-900',
        priority: 1,
      });
    }

    // 3.5 Winback Campaigns (90+ Days)
    const winbackCandidates = approvedSales.filter((s) => {
      const daysSince = (Date.now() - s.timestamp) / (24 * 60 * 60 * 1000);
      return daysSince >= 90;
    });
    
    if (winbackCandidates.length > 0) {
      allOpportunities.push({
        type: 'winback',
        title: '90-Day Winback Campaign',
        description: `${winbackCandidates.length} cold customers. Time for a high-discount winback offer!`,
        potential: winbackCandidates.length * 200,
        action: 'Assign to Closers',
        color: 'bg-rose-900', // Rose color for urgency
        priority: 3,
      });
    }

    // 3. Underperforming Agents
    const agents = users.filter((u) => u.role === 'agent');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const underperformers = agents.filter((agent) => {
      const agentSales = sales.filter(
        (s) => s.agentId === agent.id && s.timestamp >= today.getTime() && s.status === 'Approved'
      );
      return agentSales.length < 2;
    });

    if (underperformers.length > 0) {
      allOpportunities.push({
        type: 'agents',
        title: 'Support Underperforming Agents',
        description: `${underperformers.length} agents below daily quota - potential productivity gain`,
        potential: underperformers.length * 500, // Potential per agent
        action: 'Send Support Messages',
        color: 'bg-yellow-900',
        priority: 2,
      });
    }

    // 4. High-Value Callbacks
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
    const nextSixHours = Date.now() + 6 * 60 * 60 * 1000;
    const highValueCallbacks = sales
      .filter(
        (s) =>
          s.status === 'Pending' &&
          s.amount > 800 &&
          s.callbackTime &&
          s.callbackTime > thirtyMinutesAgo &&
          s.callbackTime < nextSixHours
      )
      .sort((a, b) => (b.amount || 0) - (a.amount || 0))
      .slice(0, 5);
    const callbackPotential = highValueCallbacks.reduce((sum, s) => sum + s.amount, 0);

    if (highValueCallbacks.length > 0) {
      allOpportunities.push({
        type: 'callbacks',
        title: 'High-Value Callbacks (Next 6h)',
        description: `${highValueCallbacks.length} callbacks worth $${Math.round(callbackPotential / 1000)}k due soon`,
        potential: callbackPotential,
        action: 'Prioritize Queue',
        color: 'bg-emerald-900',
        priority: 1,
      });
    }

    return allOpportunities.sort((a, b) => b.priority - a.priority);
  }, [sales, users]);

  const totalPotential = opportunities.reduce((sum, o) => sum + o.potential, 0);

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-900 to-green-800 p-4 border-b border-green-700">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="text-green-300" size={20} />
          <div>
            <h3 className="font-bold text-white">Revenue Opportunities</h3>
            <p className="text-sm text-green-200">
              Potential: ${Math.round(totalPotential / 1000)}k this week
            </p>
          </div>
        </div>
      </div>

      {/* Opportunities List */}
      {opportunities.length > 0 ? (
        <div className="divide-y divide-slate-700">
          {opportunities.map((opp, idx) => (
            <div key={idx} className={`${opp.color} bg-opacity-20 p-4 border-l-4 border-opacity-50`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-bold text-white">{opp.title}</h4>
                  <p className="text-sm text-slate-300 mt-1">{opp.description}</p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-lg font-black text-emerald-400">
                    ${Math.round(opp.potential / 1000)}k
                  </div>
                  <p className="text-sm text-slate-400">potential</p>
                </div>
              </div>

              <button className="w-full mt-3 bg-white bg-opacity-10 hover:bg-opacity-20 text-white font-semibold py-2 rounded transition-colors flex items-center justify-center gap-2">
                <Zap size={16} />
                {opp.action}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center">
          <Target className="mx-auto text-slate-600 mb-3" size={32} />
          <p className="text-slate-400">No immediate opportunities identified</p>
        </div>
      )}
    </div>
  );
};
