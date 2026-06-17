import React, { useState } from 'react';
import { useCRM } from '../../hooks/useCRM';
import { SystemHealth, SystemConfig } from '../../types';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { usePresence } from '../../hooks/usePresence';

// NEW IMPORTS
import { CompanyHealthScorecard } from './dashboard/CompanyHealthScorecard';
import { DashboardLiveOpsBoard } from './dashboard/DashboardLiveOpsBoard';
import { DashboardApprovalPanel } from './dashboard/DashboardApprovalPanel';
import { DashboardAgentSupportPanel } from './dashboard/DashboardAgentSupportPanel';
import { DashboardRevenueOptimization } from './dashboard/DashboardRevenueOptimization';
import { DashboardStrategicAnalytics } from './dashboard/DashboardStrategicAnalytics';
import { DashboardTerminalZone } from './dashboard/financials/DashboardTerminalZone';
import { ScenarioPlanner } from './tools/ScenarioPlanner';
import { AuditExplorer } from './tools/AuditExplorer';
import { PredictiveAlerts } from './tools/PredictiveAlerts';
import { SystemConfigPanel } from './SystemConfigPanel';

interface AdminDashboardProps {
  onToggleTerminals?: () => void;
  areTerminalsOpen?: boolean;
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
  onToggleTerminals,
  areTerminalsOpen,
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
  const { sales, users, notes, auditLogs, systemConfig: crmSystemConfig, updateSaleStatus } = useCRM();
  const [activeTab, setActiveTab] = useState<'overview' | 'operations' | 'analytics' | 'tools'>('overview');

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
        onToggleTerminals={onToggleTerminals}
        areTerminalsOpen={areTerminalsOpen}
      />

      <DashboardTerminalZone
          areTerminalsOpen={areTerminalsOpen || false}
          onBroadcast={onBroadcast}
          health={health}
          onRunDiagnostics={onRunDiagnostics}
          onTestUplink={onTestUplink}
      />

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-slate-800 rounded-lg p-2 border border-slate-700">
        {([
          { id: 'overview', label: 'Home' },
          { id: 'operations', label: 'Company' },
          { id: 'analytics', label: 'Progress' },
          { id: 'tools', label: 'Extra Tools' }
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 rounded font-semibold text-sm transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Health Scorecard */}
          <CompanyHealthScorecard sales={sales} users={users} notes={notes} />

          {/* Quick Panels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Approvals */}
            <DashboardApprovalPanel
              sales={sales}
              users={users}
              onApprove={handleApproveSale}
              onDecline={handleDeclineSale}
            />

            {/* Agent Support */}
            <DashboardAgentSupportPanel
              sales={sales}
              users={users}
              systemConfig={systemConfig}
              onSendMessage={handleSendMessage}
            />
          </div>

          {/* Revenue Opportunities */}
          <DashboardRevenueOptimization sales={sales} users={users} />
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
      {activeTab === 'tools' && (
        <div className="space-y-4">
          
          {/* System Configuration */}
          <div className="mb-6 h-[700px] border border-border-strong rounded-xl overflow-hidden shadow-sm">
            <SystemConfigPanel 
              config={systemConfig} 
              onUpdate={async (newConfig) => {
                // If updateSystemConfig is not available directly on the dashboard props,
                // we might need to rely on the side-effects in useCRM or pass it as a prop.
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
  );
};
