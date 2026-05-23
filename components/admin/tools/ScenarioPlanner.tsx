import React, { useState, useMemo } from 'react';
import { Sale, SystemConfig, User } from '../../../types';
import { Lightbulb, BarChart3, CheckCircle2, AlertCircle } from 'lucide-react';

interface ScenarioPlannerProps {
  sales: Sale[];
  users: User[];
  systemConfig: SystemConfig;
}

export const ScenarioPlanner: React.FC<ScenarioPlannerProps> = ({
  sales,
  users,
  systemConfig,
}) => {
  const [scenario, setScenario] = useState<{
    commissionIncrease: number;
    agentBonus: number;
    recoveryRate: number;
  }>({
    commissionIncrease: 0,
    agentBonus: 0,
    recoveryRate: 0,
  });

  const analysis = useMemo(() => {
    const baseCommission = systemConfig.baseCommission || 15;
    const agents = users.filter((u) => u.role === 'agent').length;

    // Current metrics
    const approvedSales = sales.filter((s) => s.status === 'Approved');
    const currentRevenue = approvedSales.reduce((sum, s) => sum + s.amount, 0);
    const currentPayroll = (currentRevenue * (baseCommission + scenario.commissionIncrease)) / 100;
    const currentMargin = ((currentRevenue - currentPayroll) / Math.max(1, currentRevenue)) * 100;

    // Estimated impact
    const productivityGain = 1 + scenario.commissionIncrease * 0.15; // 15% boost per 1% commission
    const estimatedBaseRevenue = currentRevenue * productivityGain;
    const newPayrollBase = (estimatedBaseRevenue * (baseCommission + scenario.commissionIncrease)) / 100;
    const recoveryRevenue = estimatedBaseRevenue * (scenario.recoveryRate / 100);
    const estimatedRevenue = estimatedBaseRevenue + recoveryRevenue;
    
    const newPayroll = newPayrollBase + (recoveryRevenue * 0.5); // Recovery at 50% rate
    const newMargin = ((estimatedRevenue - newPayroll) / Math.max(1, estimatedRevenue)) * 100;

    return {
      baseCommission,
      agents,
      currentRevenue,
      currentPayroll,
      currentMargin,
      estimatedRevenue,
      newPayroll,
      newMargin,
      breakeven: Math.round(((estimatedRevenue / Math.max(1, currentRevenue)) - 1) * 100),
      roi: Math.round(((estimatedRevenue - currentRevenue) / Math.max(1, newPayroll)) * 100),
      recommended: scenario.commissionIncrease > 0 && scenario.commissionIncrease <= 3,
    };
  }, [scenario, sales, users, systemConfig]);

  return (
    <div className="space-y-4">
      {/* Sliders */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 space-y-6">
        <h3 className="font-bold text-white text-lg flex items-center gap-2">
          <Lightbulb className="text-yellow-400" size={24} />
          Scenario Planning
        </h3>

        {/* Commission Increase */}
        <div>
          <label className="text-sm font-semibold text-white mb-2 block">
            Commission Increase: +{scenario.commissionIncrease}%
          </label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={scenario.commissionIncrease}
            onChange={(e) =>
              setScenario({ ...scenario, commissionIncrease: parseFloat(e.target.value) })
            }
            className="w-full"
          />
          <p className="text-xs text-slate-400 mt-2">Current: {systemConfig.baseCommission}%</p>
        </div>

        {/* Recovery Rate */}
        <div>
          <label className="text-sm font-semibold text-white mb-2 block">
            Recovery Campaign Rate: +{scenario.recoveryRate}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={scenario.recoveryRate}
            onChange={(e) =>
              setScenario({ ...scenario, recoveryRate: parseFloat(e.target.value) })
            }
            className="w-full"
          />
          <p className="text-xs text-slate-400 mt-2">
            Estimated {scenario.recoveryRate}% of declined sales recoverable
          </p>
        </div>
      </div>

      {/* Results */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="text-blue-400" size={20} />
          Impact Analysis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Current State */}
          <div className="bg-slate-700 rounded p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Current State</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-300">Revenue:</span>
                <span className="font-bold text-white">
                  ${(analysis.currentRevenue / 1000).toFixed(0)}k
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Payroll:</span>
                <span className="font-bold text-white">
                  ${(analysis.currentPayroll / 1000).toFixed(0)}k
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Margin:</span>
                <span className="font-bold text-emerald-400">
                  {analysis.currentMargin.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Projected State */}
          <div className={`rounded p-4 ${analysis.recommended ? 'bg-green-900 bg-opacity-40 border border-green-700' : 'bg-slate-700'}`}>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Projected Impact</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-300">Revenue:</span>
                <span className="font-bold text-white">
                  ${(analysis.estimatedRevenue / 1000).toFixed(0)}k
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Payroll:</span>
                <span className="font-bold text-white">
                  ${(analysis.newPayroll / 1000).toFixed(0)}k
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Margin:</span>
                <span className="font-bold text-emerald-400">
                  {analysis.newMargin.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className={`mt-4 p-4 rounded border ${
          analysis.recommended
            ? 'bg-green-900 bg-opacity-30 border-green-700'
            : 'bg-yellow-900 bg-opacity-30 border-yellow-700'
        }`}>
          <div className="flex items-start gap-2">
            {analysis.recommended ? (
              <CheckCircle2 className="text-green-400 flex-shrink-0 mt-1" size={20} />
            ) : (
              <AlertCircle className="text-yellow-400 flex-shrink-0 mt-1" size={20} />
            )}
            <div>
              <p className={`font-bold ${analysis.recommended ? 'text-green-300' : 'text-yellow-300'}`}>
                {analysis.recommended ? '✅ Recommended' : '⚠️ Review'}
              </p>
              <p className="text-sm text-slate-300 mt-1">
                {analysis.recommended
                  ? `Productivity gain (${analysis.breakeven}%) outweighs commission cost. ROI: ${analysis.roi}%`
                  : 'Commission increase may exceed margin gains. Consider alternative incentives.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
