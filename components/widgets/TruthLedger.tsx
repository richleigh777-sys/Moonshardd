
import React from 'react';
import { FileText } from 'lucide-react';
import { AuditEntry } from '../../types';
import { Card } from '../ui/Base';

export const TruthLedger: React.FC<{ logs: AuditEntry[] }> = ({ logs }) => {
    const sortedLogs = [...logs].sort((a, b) => b.timestamp - a.timestamp);

    return (
        <Card variant="panel" className="flex flex-col h-full overflow-hidden border-border-subtle bg-surface-main shadow-2xl rounded-[2rem]">
            <div className="p-6 border-b border-border-subtle bg-surface-alt/40 flex justify-between items-center backdrop-blur-md sticky top-0 z-20">
                <div>
                    <h3 className="text-lg font-bold text-text-primary  tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-accent-primary/10 rounded-xl text-accent-primary border border-accent-primary/20">
                            <FileText size={20} />
                        </div>
                        Audit Log
                    </h3>
                    <p className="text-xs font-bold text-text-muted  tracking-widest mt-1 ml-1">System Events • Confidential</p>
                </div>
                <div className="px-3 py-1 bg-surface-main rounded-full border border-border-subtle shadow-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-mono text-text-muted ">SECURE_CONNECTION</span>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-0 font-mono text-xs custom-scrollbar bg-surface-main/50 relative z-10">
                <table className="w-full text-left">
                    <thead className="sticky top-0 bg-surface-main/95 backdrop-blur-xl text-text-muted font-bold  text-xs tracking-widest border-b border-border-subtle z-10 shadow-sm">
                        <tr>
                            <th className="p-4 pl-6">Time</th>
                            <th className="p-4">User</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Action</th>
                            <th className="p-4 text-right pr-6">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle/50">
                        {sortedLogs.length === 0 ? (
                            <tr><td colSpan={5} className="p-12 text-center font-medium text-text-muted italic opacity-50">No logs found.</td></tr>
                        ) : sortedLogs.map(log => (
                            <tr key={log.id} className="hover:bg-surface-alt/30 transition-colors group">
                                <td className="p-4 pl-6 text-text-secondary whitespace-nowrap">
                                    {new Date(log.timestamp).toLocaleTimeString()}
                                </td>
                                <td className="p-4">
                                    <span className="text-text-primary font-bold">{log.agentName}</span>
                                    <p className="text-sm text-text-muted  tracking-wider opacity-60">ID: {log.agentId}</p>
                                </td>
                                <td className="p-4">
                                    <span className={`px-3 py-1.5 rounded text-xs font-bold border  tracking-wider ${
                                        log.module === 'SALE' ? 'border-status-success/30 text-emerald-600 bg-emerald-500/5' : 
                                        log.module === 'AUTH' ? 'border-purple-500/30 text-purple-600 bg-purple-500/5' :
                                        'border-blue-500/30 text-blue-600 bg-blue-500/5'
                                    }`}>
                                        {log.module}
                                    </span>
                                </td>
                                <td className="p-4 text-text-primary">
                                    <span className="font-bold">{log.action}</span>
                                </td>
                                <td className="p-4 text-right pr-6 text-text-muted">
                                    <p className="text-xs leading-relaxed truncate max-w-[300px] inline-block" title={log.details}>
                                        {log.details}
                                    </p>
                                    <p className="text-sm font-mono opacity-40 mt-0.5">REF: {log.id.slice(-6)}</p>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};
