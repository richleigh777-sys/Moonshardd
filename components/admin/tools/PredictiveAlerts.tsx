import { useSystem } from '../../../hooks/useSystem';
import React, { useMemo } from 'react';
import { Sale, User, Note } from '../../../types';
import { AlertTriangle, TrendingDown, Users, Zap } from 'lucide-react';
import { Card } from '../../../ui/Base';

interface PredictiveAlertsProps {
  sales: Sale[];
  users: User[];
  notes: Note[];
}

export const PredictiveAlerts: React.FC<PredictiveAlertsProps> = ({ 
  sales,
  users,
  notes,
}) => {
    const { setToast } = useSystem();
  const alerts = useMemo(() => {
    const allAlerts: Array<{
      type: string;
      severity: 'high' | 'medium' | 'low';
      title: string;
      description: string;
      action: string;
    }> = [];

    // Agent churn prediction
    const agents = users.filter((u) => u.role === 'agent' && u.active);
    agents.forEach((agent) => {
      const agentSales = sales.filter((s) => s.agentId === agent.id && s.status === 'Approved');
      const avgSales = agentSales.length / 7; // Assuming 7 days

      if (avgSales < 2) {
        allAlerts.push({
          type: 'churn',
          severity: 'high',
          title: `${agent.name} at churn risk`,
          description: `Only ${avgSales.toFixed(1)} sales/day (below average). High dropout probability.`,
          action: 'Schedule check-in call',
        });
      }
    });

    // Revenue dip prediction
    const last7Days = sales.filter((s) => s.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000);
    const last14Days = sales.filter((s) => s.timestamp > Date.now() - 14 * 24 * 60 * 60 * 1000 && s.timestamp <= Date.now() - 7 * 24 * 60 * 60 * 1000);

    const last7Revenue = last7Days.filter((s) => s.status === 'Approved').reduce((sum, s) => sum + s.amount, 0);
    const last14Revenue = last14Days.filter((s) => s.status === 'Approved').reduce((sum, s) => sum + s.amount, 0);

    if (last14Revenue > 0 && last7Revenue < last14Revenue * 0.7) {
      allAlerts.push({
        type: 'revenue',
        severity: 'high',
        title: 'Revenue decline detected',
        description: `This week's revenue down 30%+ vs last week. Seasonal or systemic issue?`,
        action: 'Analyze decline trends',
      });
    }

    // System capacity alert
    const onlineAgents = agents.filter((a) => a.currentStatus === 'online').length;
    if (agents.length > 0 && onlineAgents < Math.ceil(agents.length * 0.5)) {
      allAlerts.push({
        type: 'capacity',
        severity: 'medium',
        title: 'Low agent capacity',
        description: `Only ${onlineAgents}/${agents.length} agents online. May impact revenue.`,
        action: 'Check schedule',
      });
    }

    // Customer satisfaction alert
    const reorders = sales.filter((s) => s.isReorder && s.status === 'Approved').length;
    const totalApproved = sales.filter((s) => s.status === 'Approved').length;
    const satisfactionRate = totalApproved > 0 ? (reorders / totalApproved) * 100 : 0;

    if (satisfactionRate < 20 && totalApproved > 0) {
      allAlerts.push({
        type: 'satisfaction',
        severity: 'medium',
        title: 'Low customer satisfaction',
        description: `Only ${satisfactionRate.toFixed(1)}% reorder rate. May indicate quality issues.`,
        action: 'Review customer feedback',
      });
    }

    return allAlerts.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }, [sales, users, notes]);

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-status-error/10 border-status-error/30';
      case 'medium':
        return 'bg-status-warning/10 border-status-warning/30';
      case 'low':
        return 'bg-accent-primary/10 border-accent-primary/30';
      default:
        return 'bg-surface-alt border-border-subtle';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="text-status-error" size={20} />;
      case 'medium':
        return <Zap className="text-status-warning" size={20} />;
      case 'low':
        return <TrendingDown className="text-accent-primary" size={20} />;
      default:
        return <Users className="text-text-muted" size={20} />;
    }
  };

  return (
    <Card className="p-4 bg-surface-main border-border-subtle">
      <div className="space-y-3">
        {alerts.length > 0 ? (
          alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`rounded-lg p-4 border ${getSeverityStyle(alert.severity)}`}
            >
              <div className="flex items-start gap-3">
                {getSeverityIcon(alert.severity)}
                <div className="flex-1">
                  <h4 className="font-bold text-text-primary">{alert.title}</h4>
                  <p className="text-sm text-text-secondary mt-1">{alert.description}</p>
                  <button 
                    className="mt-2 text-sm font-bold text-text-primary hover:underline group-hover:text-amber-400"
                    onClick={() => setToast({ title: "System Notification", message: "Action executed.", type: "info" })}
                  >
                    → {alert.action}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-surface-alt rounded-lg p-6 border border-border-subtle text-center">
            <Zap className="mx-auto text-status-success mb-3" size={32} />
            <p className="font-bold text-text-primary">No Alerts</p>
            <p className="text-sm text-text-muted mt-1">Ecosystem metrics within healthy parameters.</p>
          </div>
        )}
      </div>
    </Card>
  );
};
