
import React, { useMemo } from 'react';
import { Phone, Video, CheckCircle2, XCircle, History } from 'lucide-react';
import { CallLog, User } from '../../types';
import { Card, Badge } from '../ui/Base';

interface CallHistoryProps {
    logs: CallLog[];
    currentUser: User;
}

export const CallHistory: React.FC<CallHistoryProps> = ({ logs, currentUser }) => {
    const sortedLogs = useMemo(() => {
        return [...logs]
            .filter(log => log.agentId === currentUser.id)
            .sort((a, b) => b.startTime - a.startTime);
    }, [logs, currentUser]);

    const formatDuration = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`;
        const mins = Math.floor(seconds / 60);
        const remainingSecs = seconds % 60;
        return `${mins}m ${remainingSecs}s`;
    };

    const getOutcomeStyles = (outcome: string) => {
        switch (outcome) {
            case 'Connected': return 'text-status-success';
            case 'Missed': return 'text-status-warning';
            case 'Rejected': return 'text-status-error';
            default: return 'text-text-muted';
        }
    };

    return (
        <Card variant="panel" className="flex flex-col h-full bg-surface-main overflow-hidden p-0 relative border-border-subtle">
            <div className="p-4 border-b border-border-subtle bg-surface-alt/50 flex justify-between items-center backdrop-blur-md sticky top-0 z-10">
                <div>
                    <h3 className="text-base font-[700]  tracking-tight text-text-primary flex items-center gap-2">
                        <History size={16} className="text-accent-primary"/>
                        Communication Log
                    </h3>
                    <p className="text-xs font-bold text-text-muted  tracking-widest mt-0.5">Call Logs & Durations</p>
                </div>
                <Badge status="Approved">{sortedLogs.length} Total</Badge>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-0 bg-surface-main">
                {sortedLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-text-muted opacity-50 py-20">
                        <Phone size={48} className="mb-4 opacity-20"/>
                        <p className="text-sm font-bold  tracking-widest">No call history recorded</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-surface-alt/80 backdrop-blur-sm text-xs font-[700] text-text-muted  tracking-widest sticky top-0 z-10 border-b border-border-subtle shadow-sm">
                            <tr>
                                <th className="p-3 pl-6">Timestamp</th>
                                <th className="p-3">Agent</th>
                                <th className="p-3">Medium</th>
                                <th className="p-3 text-center">Duration</th>
                                <th className="p-3 text-right pr-6">Result</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle text-xs bg-surface-main">
                            {sortedLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-surface-highlight/30 transition-all group">
                                    <td className="p-3 pl-6 whitespace-nowrap font-mono text-text-muted">
                                        <div className="flex flex-col">
                                            <span className="text-text-primary font-bold">{new Date(log.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            <span className="text-xs opacity-70">{new Date(log.startTime).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-lg bg-surface-alt flex items-center justify-center text-xs font-bold text-text-secondary border border-border-subtle">
                                                {(log.partnerName || 'Unknown').charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-text-primary">{log.partnerName || 'Unknown'}</span>
                                                <span className="text-xs text-text-muted  font-mono tracking-wide">ID::{log.partnerId.slice(-6)}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <span className={`flex items-center gap-1.5 font-bold  text-xs ${log.type === 'video' ? 'text-purple-500' : 'text-blue-500'}`}>
                                            {log.type === 'video' ? <Video size={16}/> : <Phone size={16}/>}
                                            {log.type}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center">
                                        <span className="font-mono font-bold text-text-secondary">{formatDuration(log.duration)}</span>
                                    </td>
                                    <td className="p-3 text-right pr-6">
                                        <div className={`flex items-center justify-end gap-2 font-[700]  tracking-tight text-xs ${getOutcomeStyles(log.outcome)}`}>
                                            {log.outcome === 'Connected' ? <CheckCircle2 size={16}/> : <XCircle size={16}/>}
                                            {log.outcome}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </Card>
    );
};
