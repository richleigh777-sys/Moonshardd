import React, { useState, lazy, Suspense } from 'react';
import { useCRM } from '../../hooks/useCRM';
import { SystemHealth, SystemConfig } from '../../types';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { usePresence } from '../../hooks/usePresence';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { DashboardTerminalZone } from './dashboard/financials/DashboardTerminalZone';
import { DashboardLiveMetrics } from './dashboard/DashboardLiveMetrics';

// Lazy loaded components for code splitting optimization
const CompanyHealthScorecard = lazy(() => import('./dashboard/CompanyHealthScorecard').then(m => ({ default: m.CompanyHealthScorecard })));
const DashboardLiveOpsBoard = lazy(() => import('./dashboard/DashboardLiveOpsBoard').then(m => ({ default: m.DashboardLiveOpsBoard })));
const DashboardApprovalPanel = lazy(() => import('./dashboard/DashboardApprovalPanel').then(m => ({ default: m.DashboardApprovalPanel })));
const DashboardAgentSupportPanel = lazy(() => import('./dashboard/DashboardAgentSupportPanel').then(m => ({ default: m.DashboardAgentSupportPanel })));
const DashboardRevenueOptimization = lazy(() => import('./dashboard/DashboardRevenueOptimization').then(m => ({ default: m.DashboardRevenueOptimization })));
const DashboardStrategicAnalytics = lazy(() => import('./dashboard/DashboardStrategicAnalytics').then(m => ({ default: m.DashboardStrategicAnalytics })));
const ScenarioPlanner = lazy(() => import('./tools/ScenarioPlanner').then(m => ({ default: m.ScenarioPlanner })));
const AuditExplorer = lazy(() => import('./tools/AuditExplorer').then(m => ({ default: m.AuditExplorer })));
const PredictiveAlerts = lazy(() => import('./tools/PredictiveAlerts').then(m => ({ default: m.PredictiveAlerts })));
const SystemConfigPanel = lazy(() => import('./SystemConfigPanel').then(m => ({ default: m.SystemConfigPanel })));

const ComponentLoader = () => (
    <div className="w-full h-32 flex flex-col items-center justify-center text-text-muted">
        <Loader2 className="w-6 h-6 animate-spin text-accent-primary" />
    </div>
);

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
  const { sales, users, notes, auditLogs, systemConfig: crmSystemConfig, updateSaleStatus, customers } = useCRM();
  const [activeTab, setActiveTab] = useState<'overview' | 'operations' | 'analytics' | 'tools'>('overview');
  const [showHealthScorecard, setShowHealthScorecard] = useState(false);
  const [showRevenueOptimization, setShowRevenueOptimization] = useState(false);

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
      <div className="flex gap-2 bg-surface-alt rounded-lg p-2 border border-border-subtle">
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
                ? 'bg-accent-primary text-black'
                : 'text-text-muted hover:text-text-primary hover:bg-surface-main'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Suspense fallback={<ComponentLoader />}>
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            
            <DashboardLiveMetrics sales={sales} customers={customers} />
            
            {/* Quick Panels Grid (Prioritized High-Priority Tasks) */}
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
        {activeTab === 'tools' && (
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
      </Suspense>
    </div>
  );
};
