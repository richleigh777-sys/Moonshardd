import React, { useMemo, useState } from 'react';
import { Sale, User } from '../../../types';
import { CheckCircle2, XCircle, Eye, Clock, AlertTriangle, PartyPopper } from 'lucide-react';
import { DECLINE_REASONS } from '../../../constants';
import { decryptField, ENCRYPTION_KEY } from '../../../lib/encryption';

interface DashboardApprovalPanelProps {
  sales: Sale[];
  users: User[];
  onApprove: (saleId: string) => void;
  onDecline: (saleId: string, reason: string, status: 'Declined' | 'Cancelled') => void;
}

export const DashboardApprovalPanel: React.FC<DashboardApprovalPanelProps> = ({
  sales,
  users,
  onApprove,
  onDecline,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [declineReason, _setDeclineReason] = useState<string>(DECLINE_REASONS[0]);

  const pendingSales = useMemo(() => {
    return sales
      .filter((s) => s.status === 'Pending')
      .sort((a, b) => (b.amount || 0) - (a.amount || 0))
      .slice(0, 5);
  }, [sales]);

  const getAgentName = (agentId: string) => {
    return users.find((u) => u.id === agentId)?.name || 'Unknown';
  };

  const getTimeAgo = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (pendingSales.length === 0) {
    return (
      <div className="bg-surface-main/60 dark:bg-surface-main/40 backdrop-blur-2xl rounded-[32px] p-8 border border-border-subtle/60 dark:border-border-subtle/20 text-center shadow-panel h-full flex flex-col justify-center items-center group transition-all hover:shadow-float">
        <PartyPopper className="mx-auto text-accent-primary mb-3 transition-transform group-hover:scale-125 duration-500" size={48} />
        <p className="text-xl font-bold text-text-primary mb-1">You're all caught up!</p>
        <p className="text-sm text-text-muted">No pending approvals to worry about. Go have a snack.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-main/60 dark:bg-surface-main/40 backdrop-blur-2xl rounded-[32px] border border-border-subtle/60 dark:border-border-subtle/20 overflow-hidden shadow-panel transition-all hover:shadow-float flex flex-col min-h-[400px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent-primary to-accent-secondary p-5 relative overflow-hidden shrink-0">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-2 bg-white/20 rounded-2xl">
              <Clock className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Deals Waiting on You</h3>
            <p className="text-sm text-white/80 font-medium">{pendingSales.length} {pendingSales.length === 1 ? 'sale needs' : 'sales need'} a quick look</p>
          </div>
        </div>
      </div>

      {/* Sales List */}
      <div className="divide-y divide-border-subtle flex-1 overflow-y-auto">
        {pendingSales.map((sale, idx) => (
          <div key={sale.id} className="p-4 hover:bg-surface-main/80 transition-colors group/item">
            {/* Main Row */}
            <div
              className="flex items-start justify-between cursor-pointer"
              onClick={() => setExpandedId(expandedId === sale.id ? null : sale.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-alt flex items-center justify-center text-xs font-bold text-text-muted group-hover/item:bg-accent-primary/10 group-hover/item:text-accent-primary transition-colors">
                      {idx + 1}
                  </div>
                  <div>
                    <p className="font-bold text-text-primary truncate tracking-tight">{sale.customer}</p>
                    <p className="text-sm font-medium text-text-muted">
                      {getAgentName(sale.agentId!)} • {getTimeAgo(sale.timestamp)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 ml-4">
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-500">${sale.amount}</p>
                  <p className="text-xs font-medium text-text-muted bg-surface-alt px-2 py-0.5 rounded-full inline-block mt-0.5">{sale.product}</p>
                </div>
                <div className={`p-2 rounded-xl transition-colors ${expandedId === sale.id ? 'bg-accent-primary/10 text-accent-primary' : 'bg-surface-alt text-text-muted group-hover/item:bg-surface-main group-hover/item:text-text-primary'}`}>
                    <Eye className="flex-shrink-0" size={18} />
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedId === sale.id && (
              <div className="mt-4 pt-4 border-t border-border-subtle space-y-4 animate-in slide-in-from-top-2 fade-in duration-300">
                {sale.declineReason && (
                  <div className="bg-status-warning/10 rounded-2xl p-3 border border-status-warning/20 flex gap-3">
                    <AlertTriangle className="text-status-warning flex-shrink-0 mt-0.5" size={18} />
                    <div>
                        <p className="text-sm font-bold text-status-warning mb-0.5">Previous Issue:</p>
                        <p className="text-sm font-medium text-status-warning/80">{sale.declineReason}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm bg-surface-main p-4 rounded-2xl border border-border-subtle">
                  <div>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Phone</p>
                    <p className="font-medium text-text-primary">{sale.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">CC #</p>
                    <p className="font-mono text-emerald-500 font-bold bg-emerald-500/10 px-2 py-1 rounded inline-block">{decryptField(sale.cardNumber, ENCRYPTION_KEY) || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">State</p>
                    <p className="font-medium text-text-primary">{sale.state || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">CVV / EXP</p>
                    <p className="font-mono text-emerald-500 font-bold bg-emerald-500/10 px-2 py-1 rounded inline-block">{decryptField(sale.cardCvv, ENCRYPTION_KEY) || '***'} / {sale.cardExpiry || '—'}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); onApprove(sale.id); }}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md hover:shadow-lg"
                  >
                    <CheckCircle2 size={18} /> Approve!
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDecline(sale.id, declineReason, 'Declined'); }}
                    className="flex-1 bg-surface-main border border-border-strong hover:bg-status-error/10 hover:border-status-error hover:text-status-error text-text-primary p-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <XCircle size={18} /> Send Back
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
