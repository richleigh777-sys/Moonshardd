import React, { useState, useMemo } from 'react';
import { AuditEntry } from '../../../types';
import { Search, Clock, Shield } from 'lucide-react';
import { Card } from '../../../ui/Base';

interface AuditExplorerProps {
  auditLogs: AuditEntry[];
}

export const AuditExplorer: React.FC<AuditExplorerProps> = ({ auditLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<'all' | 'AUTH' | 'SALE' | 'SYSTEM' | 'COMM'>('all');
  const [timeFilter, setTimeFilter] = useState<number>(24); // hours

  const filteredLogs = useMemo(() => {
    const now = Date.now();
    const timeMs = timeFilter * 60 * 60 * 1000;

    return auditLogs
      .filter((log) => {
        if (now - log.timestamp > timeMs) return false;
        if (selectedModule !== 'all' && (log as any).module !== selectedModule) return false;
        if (
          searchTerm &&
          !log.action.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !(log as any).agentName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !log.details.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 50);
  }, [auditLogs, searchTerm, selectedModule, timeFilter]);

  const getModuleStyle = (module: string) => {
    switch (module) {
      case 'AUTH':
        return 'bg-status-error/10 text-status-error';
      case 'SALE':
        return 'bg-status-success/10 text-status-success';
      case 'SYSTEM':
        return 'bg-accent-primary/10 text-accent-primary';
      case 'COMM':
        return 'bg-purple-500/10 text-purple-400';
      default:
        return 'bg-surface-alt text-text-secondary';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="bg-surface-main p-4 border border-border-subtle space-y-3">
        <div>
          <label className="text-sm font-bold text-text-primary mb-2 block">Search Action History</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search action, operative, or transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-alt border border-border-subtle rounded text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Module Filter */}
          <div>
            <label className="text-sm font-bold text-text-secondary mb-2 block uppercase">Ecosystem Module</label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value as any)}
              className="w-full px-3 py-2 bg-surface-alt border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
            >
              <option value="all">All Modules</option>
              <option value="AUTH">Authentication / Login</option>
              <option value="SALE">Sales / CRM Engine</option>
              <option value="SYSTEM">System Settings / Deck</option>
              <option value="COMM">Commissions / Economics</option>
            </select>
          </div>

          {/* Time Filter */}
          <div>
            <label className="text-sm font-bold text-text-secondary mb-2 block uppercase">Time Range</label>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-surface-alt border border-border-subtle rounded text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
            >
              <option value="1">Last Hour (Live Ops)</option>
              <option value="24">Last 24 Hours (Current Shift)</option>
              <option value="168">Last Week (Strategic)</option>
              <option value="720">Last Month (Historical)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Audit Logs */}
      <Card className="bg-surface-main border-border-subtle overflow-hidden p-0">
        {filteredLogs.length > 0 ? (
          <div className="divide-y divide-border-subtle max-h-[500px] overflow-y-auto w-full">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-surface-hover/30 transition-colors">
                <div className="flex items-start gap-3">
                  <Shield className="text-text-muted flex-shrink-0 mt-1" size={18} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getModuleStyle((log as any).module || 'SYSTEM')}`}>
                        {(log as any).module || 'SYSTEM'}
                      </span>
                      <span className="font-bold text-sm text-text-primary truncate">{log.action}</span>
                    </div>
                    <p className="text-sm text-text-secondary mb-2 whitespace-pre-wrap">{log.details}</p>
                    <div className="flex items-center gap-2 text-sm font-mono text-text-muted bg-surface-alt px-2 py-1 rounded inline-flex">
                      <Clock size={12} />
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                      <span>•</span>
                      <span className="font-bold">{log.agentName || log.agentId || 'SYSTEM'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center border-t border-border-subtle">
            <Search className="mx-auto text-text-muted mb-4 opacity-50" size={32} />
            <p className="text-text-secondary font-medium">No system events logged matching current criteria</p>
            <p className="text-sm text-text-muted mt-1">Adjust filters or search string to widen matrix</p>
          </div>
        )}
      </Card>
    </div>
  );
};
