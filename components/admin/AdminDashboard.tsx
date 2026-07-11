import React, { useState } from 'react';
import { useCRM } from '../../hooks/useCRM';
import { SystemHealth, SystemConfig } from '../../types';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { usePresence } from '../../hooks/usePresence';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { DashboardWorkspaceZone } from './dashboard/financials/DashboardWorkspaceZone';
import { DashboardLiveMetrics } from './dashboard/DashboardLiveMetrics';
import { DailyVibesWidget } from './dashboard/DailyVibesWidget';

// Standard imports for fast routing
import { CompanyHealthScorecard } from './dashboard/CompanyHealthScorecard';
import { DashboardLiveOpsBoard } from './dashboard/DashboardLiveOpsBoard';
import { DashboardApprovalPanel } from './dashboard/DashboardApprovalPanel';
import { DashboardAgentSupportPanel } from './dashboard/DashboardAgentSupportPanel';
import { DashboardRevenueOptimization } from './dashboard/DashboardRevenueOptimization';
import { DashboardStrategicAnalytics } from './dashboard/DashboardStrategicAnalytics';
import { ScenarioPlanner } from './tools/ScenarioPlanner';
import { AuditExplorer } from './tools/AuditExplorer';
import { PredictiveAlerts } from './tools/PredictiveAlerts';
import { SystemConfigPanel } from './SystemConfigPanel';

interface AdminDashboardProps {
  onToggleControls?: () => void;
  areControlsOpen?: boolean;
  onBroadcast?: (msg: string, urgency: 'Routine' | 'Immediate' | 'Flash') => Promise<void>;
  health?: SystemHealth;
  onRunDiagnostics?: () => void;
  onTestUplink?: () => Promise<boolean>;
  onGhostLogin?: (userId: string) => void;
  systemConfig?: SystemConfig;
  onApproveSale?: (saleId: string) => void;
  onDeclineSale?: (saleId: string) => void;
  onSendMessage?: (agentId: string, message: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onToggleControls,
  areControlsOpen,
  onBroadcast,
  health,
  onRunDiagnostics,
  onTestUplink,
  onGhostLogin,
  systemConfig: propSystemConfig,
  onApproveSale,
  onDeclineSale,
  onSendMessage,
}) => {
  const { sales, users, notes, auditLogs, systemConfig: crmSystemConfig, updateSaleStatus, customers, currentUser } = useCRM();
  const [activeTab, setActiveTab] = useState<'overview' | 'operations' | 'analytics' | 'tools'>('overview');
  const [showHealthScorecard, setShowHealthScorecard] = useState(false);
  const [showRevenueOptimization, setShowRevenueOptimization] = useState(false);

  const isLevel10 = (currentUser?.level || 0) >= 10;

  usePresence('dashboard', 'dashboard', 'viewing');
  
  const systemConfig = propSystemConfig || crmSystemConfig || { baseCommission: 15, shiftStart: '09:00', shiftEnd: '17:00', cutoffDay1: 15, cutoffDay2: 30, breakDurationMinutes: 60 };

  const handleApproveSale = onApproveSale || ((id: string) => updateSaleStatus(id, 'Approved', {}));
  const handleDeclineSale = onDeclineSale || ((id: string, reason: string, status: 'Declined' | 'Cancelled') => updateSaleStatus(id, status, { declineReason: reason }));
  // fallback for testing
  const handleSendMessage = onSendMessage || ((id: string, msg: string) => console.log('Mail to', id, msg));

  return (
    <div className="space-y-4 animate-in fade-in duration-700 h-full flex flex-col overflow-y-auto p-4">
      <DashboardHeader
        health={health}
        onToggleControls={onToggleControls}
        areControlsOpen={areControlsOpen}
      />

      <DashboardWorkspaceZone
          areWorkspacesOpen={areControlsOpen || false}
          onBroadcast={onBroadcast}
          health={health}
          onRunDiagnostics={onRunDiagnostics}
          onTestUplink={onTestUplink}
      />

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-surface-alt rounded-lg p-2 border border-border-subtle">
        {([
          { id: 'overview', label: 'Home' },
          { id: 'operations', label: 'Company' },
          { id: 'analytics', label: 'Progress' },
          ...(isLevel10 ? [{ id: 'tools', label: 'Extra Tools' }] : [])
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 rounded font-semibold text-sm transition-colors ${
              activeTab === tab.id
                ? 'bg-accent-primary text-black'
                : 'text-text-muted hover:text-text-primary hover:bg-surface-main'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content-container">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-4">
              <div className="flex flex-col gap-4">
                <DashboardLiveMetrics sales={sales} customers={customers} />
                <DashboardApprovalPanel
                  sales={sales}
                  users={users}
                  onApprove={handleApproveSale}
                  onDecline={handleDeclineSale}
                />
              </div>
              <div className="flex flex-col gap-4">
                <DailyVibesWidget />
                <DashboardAgentSupportPanel
                  sales={sales}
                  users={users}
                  systemConfig={systemConfig}
                  onSendMessage={handleSendMessage}
                />
              </div>
            </div>

            {/* Health Scorecard (Secondary Metrics) */}
            <div className="border border-border-subtle rounded-xl bg-surface-main overflow-hidden">
                <button 
                    onClick={() => setShowHealthScorecard(!showHealthScorecard)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-surface-alt transition-colors"
                >
                    <div>
                        <h3 className="text-sm font-semibold text-text-primary">Company Health Scorecard</h3>
                        <p className="text-xs text-text-muted mt-1">Overall business metrics and performance</p>
                    </div>
                    {showHealthScorecard ? <ChevronUp className="text-text-muted" /> : <ChevronDown className="text-text-muted" />}
                </button>
                {showHealthScorecard && (
                    <div className="p-4 border-t border-border-subtle bg-surface-alt/50">
                         <CompanyHealthScorecard sales={sales} users={users} notes={notes} />
                    </div>
                )}
            </div>

            {/* Revenue Opportunities (Secondary Metrics) */}
            <div className="border border-border-subtle rounded-xl bg-surface-main overflow-hidden mt-4">
                <button 
                    onClick={() => setShowRevenueOptimization(!showRevenueOptimization)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-surface-alt transition-colors"
                >
                    <div>
                        <h3 className="text-sm font-semibold text-text-primary">Revenue Opportunities</h3>
                        <p className="text-xs text-text-muted mt-1">AI-driven actionable insights for revenue maximization</p>
                    </div>
                    {showRevenueOptimization ? <ChevronUp className="text-text-muted" /> : <ChevronDown className="text-text-muted" />}
                </button>
                {showRevenueOptimization && (
                    <div className="p-4 border-t border-border-subtle bg-surface-alt/50">
                         <DashboardRevenueOptimization sales={sales} users={users} />
                    </div>
                )}
            </div>
          </div>
        )}

        {/* TAB 2: OPERATIONS */}
        {activeTab === 'operations' && (
          <div className="space-y-4">
            <DashboardLiveOpsBoard sales={sales} users={users} notes={notes} onBroadcast={onBroadcast} />
          </div>
        )}

        {/* TAB 3: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-4">
            <DashboardStrategicAnalytics sales={sales} users={users} />
          </div>
        )}

        {/* TAB 4: TOOLS */}
        {activeTab === 'tools' && isLevel10 && (
          <div className="space-y-4">
            
            {/* System Configuration */}
            <div className="mb-6 h-[700px] border border-border-strong rounded-xl overflow-hidden shadow-sm">
              <SystemConfigPanel 
                config={systemConfig} 
                onUpdate={async (newConfig) => {
                  console.log('Update config requested from AdminDashboard', newConfig) 
                }} 
                sales={sales} 
                notes={notes} 
              />
            </div>

            {/* Predictive Alerts */}
            <div>
              <h3 className="text-lg font-bold text-white mb-3">Helpful Alerts</h3>
              <PredictiveAlerts sales={sales} users={users} notes={notes} />
            </div>

            {/* Scenario Planner */}
            <div>
              <h3 className="text-lg font-bold text-white mb-3">Look Ahead</h3>
              <ScenarioPlanner sales={sales} users={users} systemConfig={systemConfig} />
            </div>

            {/* Audit Explorer */}
            <div>
              <h3 className="text-lg font-bold text-white mb-3">Action History</h3>
              <AuditExplorer auditLogs={auditLogs || []} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
