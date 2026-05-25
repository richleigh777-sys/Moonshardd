import React, { useState, useMemo } from 'react';
import { AuditEntry } from '../../../types';
import { Search, Clock, Shield } from 'lucide-react';

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

  const getModuleColor = (module: string) => {
    switch (module) {
      case 'AUTH':
        return 'bg-red-900 text-red-300';
      case 'SALE':
        return 'bg-green-900 text-green-300';
      case 'SYSTEM':
        return 'bg-blue-900 text-blue-300';
      case 'COMM':
        return 'bg-purple-900 text-purple-300';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 space-y-3">
        <div>
          <label className="text-sm font-semibold text-white mb-2 block">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search action, agent, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Module Filter */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-2 block uppercase">Module</label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Modules</option>
              <option value="AUTH">Authentication</option>
              <option value="SALE">Sales</option>
              <option value="SYSTEM">System</option>
              <option value="COMM">Commission</option>
            </select>
          </div>

          {/* Time Filter */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-2 block uppercase">Time Range</label>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
            >
              <option value="1">Last Hour</option>
              <option value="24">Last 24 Hours</option>
              <option value="168">Last Week</option>
              <option value="720">Last Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        {filteredLogs.length > 0 ? (
          <div className="divide-y divide-slate-700">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-700 transition-colors">
                <div className="flex items-start gap-3">
                  <Shield className="text-slate-400 flex-shrink-0 mt-1" size={18} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${getModuleColor((log as any).module || 'SYSTEM')}`}>
                        {(log as any).module || 'SYSTEM'}
                      </span>
                      <span className="font-semibold text-white">{log.action}</span>
                    </div>
                    <p className="text-sm text-slate-300 mb-2">{log.details}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock size={14} />
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                      <span>•</span>
                      <span>{log.agentName || log.agentId}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Search className="mx-auto text-slate-600 mb-3" size={32} />
            <p className="text-slate-400">No audit logs matching criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};
