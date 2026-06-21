import { useSystem } from '../../../hooks/useSystem';
import React, { useState, useMemo } from 'react';
import { Sale, SystemConfig, User } from '../../../types';
import { Lightbulb, BarChart3, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '../../../ui/Base';

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
    const { setToast } = useSystem();
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
      <Card className="p-4 bg-surface-main border-border-subtle space-y-6">
        <div>
          <h3 className="font-bold text-text-primary text-lg flex items-center gap-2">
            <Lightbulb className="text-amber-400" size={24} />
            Scenario Planning
          </h3>
          <p className="text-sm text-text-muted mt-1">
            Adjust the sliders below to simulate how changes in commission rates and retention campaign effectiveness would impact overall payroll and profit margins.
          </p>
        </div>

        {/* Commission Increase */}
        <div>
          <label className="text-sm font-bold text-text-primary mb-2 block">
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
            className="w-full accent-amber-500 hover:accent-amber-400 focus:accent-amber-500"
          />
          <p className="text-sm text-text-muted mt-2">Current System Base: {systemConfig.baseCommission}%</p>
        </div>

        {/* Recovery Rate */}
        <div>
          <label className="text-sm font-bold text-text-primary mb-2 block">
            Win-back / CLM Campaign Effectiveness: +{scenario.recoveryRate}%
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
            className="w-full accent-emerald-500"
          />
          <p className="text-sm text-text-muted mt-2">
            Estimated {scenario.recoveryRate}% of pending/stale leads convertible via active CLM Engine pushes
          </p>
        </div>
      </Card>

      {/* Results */}
      <Card className="p-4 bg-surface-main border-border-subtle">
        <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
          <BarChart3 className="text-blue-500" size={20} />
          Impact Analysis Projection
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Current State */}
          <div className="bg-surface-alt rounded-lg p-4 border border-border-subtle">
            <p className="text-sm text-text-muted font-bold uppercase tracking-wider mb-3">Current Pipeline</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-secondary">Expected Revenue:</span>
                <span className="font-bold font-mono text-text-primary">
                  ${(analysis.currentRevenue / 1000).toFixed(0)}k
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-secondary">Estimated Payroll:</span>
                <span className="font-bold font-mono text-text-primary">
                  ${(analysis.currentPayroll / 1000).toFixed(0)}k
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border-subtle">
                <span className="text-sm text-text-secondary">Net Margin:</span>
                <span className="font-bold font-mono text-status-success">
                  {analysis.currentMargin.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Projected State */}
          <div className={`rounded-lg p-4 border transition-colors ${analysis.recommended ? 'bg-status-success/5 border-status-success/30' : 'bg-surface-alt border-border-subtle'}`}>
            <p className="text-sm text-text-muted font-bold uppercase tracking-wider mb-3">Hypothetical Pipeline</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-secondary">Expected Revenue:</span>
                <span className="font-bold font-mono text-text-primary">
                  ${(analysis.estimatedRevenue / 1000).toFixed(0)}k
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-secondary">Estimated Payroll:</span>
                <span className="font-bold font-mono text-text-primary">
                  ${(analysis.newPayroll / 1000).toFixed(0)}k
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border-subtle">
                <span className="text-sm text-text-secondary">Net Margin:</span>
                <span className="font-bold font-mono text-status-success">
                  {analysis.newMargin.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className={`mt-4 p-4 rounded-lg border transition-colors ${
          analysis.recommended
            ? 'bg-status-success/10 border-status-success/30'
            : 'bg-status-warning/10 border-status-warning/30'
        }`}>
          <div className="flex items-start justify-between gap-3">
             <div className="flex items-start gap-3">
                 {analysis.recommended ? (
                 <CheckCircle2 className="text-status-success flex-shrink-0 mt-0.5" size={20} />
                 ) : (
                 <AlertCircle className="text-status-warning flex-shrink-0 mt-0.5" size={20} />
                 )}
                 <div>
                 <p className={`font-bold text-sm ${analysis.recommended ? 'text-status-success' : 'text-status-warning'}`}>
                     {analysis.recommended ? 'SYSTEM RECOMMENDATION: EXECUTE' : 'SYSTEM RECOMMENDATION: REVIEW'}
                 </p>
                 <p className="text-sm text-text-secondary mt-1">
                     {analysis.recommended
                     ? `Productivity gain (${analysis.breakeven}%) outweighs theoretical commission cost increase. ROI Profile: +${analysis.roi}%`
                     : 'Commission increase model exceeds sustainable margin thresholds without a concurrent rise in basic win rate. Avoid.'}
                 </p>
                 </div>
             </div>
             {analysis.recommended && (
                 <button 
                    className="px-4 py-2 bg-status-success hover:bg-emerald-600 text-white rounded-lg text-sm font-bold transition-transform active:scale-95 shadow-md shrink-0"
                    onClick={() => setToast({ title: "System Notification", message: "Action executed.", type: "info" })}
                 >
                    Apply Scenario
                 </button>
             )}
          </div>
        </div>
      </Card>
    </div>
  );
};
