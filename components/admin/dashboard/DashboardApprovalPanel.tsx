import React, { useMemo, useState } from 'react';
import { Sale, User } from '../../../types';
import { CheckCircle2, XCircle, Eye, Clock } from 'lucide-react';

interface DashboardApprovalPanelProps {
  sales: Sale[];
  users: User[];
  onApprove: (saleId: string) => void;
  onDecline: (saleId: string) => void;
}

export const DashboardApprovalPanel: React.FC<DashboardApprovalPanelProps> = ({
  sales,
  users,
  onApprove,
  onDecline,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 text-center">
        <CheckCircle2 className="mx-auto text-green-400 mb-3" size={32} />
        <p className="font-semibold text-white mb-1">All Caught Up!</p>
        <p className="text-sm text-slate-400">No pending sales requiring approval</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-4 border-b border-blue-700">
        <div className="flex items-center gap-2">
          <Clock className="text-blue-300" size={20} />
          <div>
            <h3 className="font-bold text-white">Pending Approvals</h3>
            <p className="text-xs text-blue-200">{pendingSales.length} sales awaiting decision</p>
          </div>
        </div>
      </div>

      {/* Sales List */}
      <div className="divide-y divide-slate-700">
        {pendingSales.map((sale, idx) => (
          <div key={sale.id} className="p-4 hover:bg-slate-700 transition-colors">
            {/* Main Row */}
            <div
              className="flex items-start justify-between cursor-pointer"
              onClick={() => setExpandedId(expandedId === sale.id ? null : sale.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-400">#{idx + 1}</span>
                  <div>
                    <p className="font-semibold text-white truncate">{sale.customer}</p>
                    <p className="text-xs text-slate-400">
                      Agent: {getAgentName(sale.agentId!)} • {getTimeAgo(sale.timestamp)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 ml-4">
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-400">${sale.amount}</p>
                  <p className="text-xs text-slate-400">{sale.product}</p>
                </div>
                <Eye className="text-slate-400 flex-shrink-0" size={18} />
              </div>
            </div>

            {/* Expanded Details */}
            {expandedId === sale.id && (
              <div className="mt-4 pt-4 border-t border-slate-700 space-y-3">
                {sale.declineReason && (
                  <div className="bg-yellow-900 bg-opacity-30 rounded p-2 border border-yellow-700">
                    <p className="text-xs font-semibold text-yellow-300 mb-1">Issue:</p>
                    <p className="text-sm text-yellow-100">{sale.declineReason}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                    <p className="font-mono text-white">{sale.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Email</p>
                    <p className="font-mono text-white truncate">{sale.email || '—'}</p>
                  </div>
                </div>

                {sale.callSummary && (
                  <div className="bg-slate-700 rounded p-2">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Notes</p>
                    <p className="text-sm text-slate-200">{sale.callSummary}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => onApprove(sale.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition-colors"
                  >
                    <CheckCircle2 size={18} />
                    Approve
                  </button>
                  <button
                    onClick={() => onDecline(sale.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded transition-colors"
                  >
                    <XCircle size={18} />
                    Decline
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
