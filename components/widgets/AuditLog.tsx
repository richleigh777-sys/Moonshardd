
import React, { useState, useMemo } from 'react';
import { Search, Info, Download, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
import { AuditEntry } from '../../types';
import { Card, Button } from '../ui/Base';
import { exportToCSV } from '../../views/utils/crmLogic';

import { useCRM } from '../../hooks/useCRM';

export const AuditLog: React.FC<{ logs: AuditEntry[] }> = ({ logs }) => {
    const { currentUser } = useCRM();
    const isSuperAdmin = (currentUser?.level || currentUser?.accessLevel || 0) >= 10;
    const [searchTerm, setSearchTerm] = useState('');
    const [filterModule, setFilterModule] = useState<'ALL' | 'AUTH' | 'SALE' | 'SYSTEM'>('ALL');
    const [selectedLog, setSelectedLog] = useState<AuditEntry | null>(null);

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesModule = filterModule === 'ALL' || log.module === filterModule;
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = 
                log.action.toLowerCase().includes(searchLower) ||
                log.details.toLowerCase().includes(searchLower) ||
                log.agentName.toLowerCase().includes(searchLower) ||
                log.id.toLowerCase().includes(searchLower);
            
            return matchesModule && matchesSearch;
        }).sort((a, b) => b.timestamp - a.timestamp);
    }, [logs, filterModule, searchTerm]);

    const getSeverityStyles = (action: string) => {
        if (action.includes('FAIL') || action.includes('DECLINE') || action.includes('ERROR')) {
            return { text: 'text-status-error', bg: 'bg-status-error/10', border: 'border-status-error/20', icon: AlertCircle };
        }
        if (action.includes('WARN')) {
            return { text: 'text-status-warning', bg: 'bg-status-warning/10', border: 'border-status-warning/20', icon: AlertCircle };
        }
        return { text: 'text-accent-primary', bg: 'bg-accent-primary/10', border: 'border-accent-primary/20', icon: CheckCircle };
    };

    const handleExport = () => {
        const data = filteredLogs.map(l => ({
            ID: l.id,
            Timestamp: new Date(l.timestamp).toISOString(),
            Partner: l.agentName,
            PartnerID: l.agentId,
            Module: l.module,
            Action: l.action,
            Details: l.details
        }));
        exportToCSV(data, 'community_event_log');
    };

    return (
        <div className="flex h-full gap-4 relative overflow-hidden">
            {/* UPGRADE: Applied variant="panel" for glass effect */}
            <Card variant="panel" className={`flex-1 flex flex-col h-full overflow-hidden p-0 bg-surface-main border border-border-subtle shadow-xl transition-all duration-300 ${selectedLog ? 'w-2/3 mr-[400px] hidden lg:flex' : 'w-full'}`}>
                <div className="p-6 border-b border-border-subtle flex flex-col space-y-4 bg-surface-highlight/10">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-surface-main rounded-xl flex items-center justify-center shadow-sm border border-border-subtle group">
                                <Info size={20} className="text-accent-primary group-hover:scale-110 transition-transform" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold tracking-tight text-text-primary  flex items-center gap-2">
                                    Community Events
                                </h3>
                                <p className="text-xs font-medium text-text-muted  tracking-widest">
                                    Activity Timeline • {filteredLogs.length} Records
                                </p>
                            </div>
                        </div>
                        {isSuperAdmin && (
                            <Button variant="secondary" onClick={handleExport} className="h-8 text-xs  font-bold px-3">
                                <Download size={16} className="mr-2"/> Save Journal
                            </Button>
                        )}
                    </div>

                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1 group">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-primary transition-colors"/>
                            <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                className="w-full pl-9 pr-3 py-2 bg-surface-main border border-border-subtle rounded-xl text-xs font-medium outline-none focus:border-accent-primary transition-all shadow-sm"
                                placeholder="Search by name or note..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-1 bg-surface-alt p-1 rounded-xl border border-border-subtle">
                            {(['ALL', 'AUTH', 'SALE', 'SYSTEM'] as const).map(mod => (
                                <button
                                    key={mod}
                                    onClick={() => setFilterModule(mod)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-[700]  tracking-wider transition-all whitespace-nowrap ${
                                        filterModule === mod 
                                        ? 'bg-accent-primary text-white shadow-md' 
                                        : 'text-text-muted hover:text-text-primary'
                                    }`}
                                >
                                    {mod}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-0 relative custom-scrollbar bg-surface-main">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-surface-alt/95 backdrop-blur-md text-xs font-[700] text-text-muted  tracking-widest border-b border-border-subtle z-10">
                            <tr>
                                <th className="p-4 pl-6 w-32">Time</th>
                                <th className="p-4 w-48">Partner Identity</th>
                                <th className="p-4 w-24">Area</th>
                                <th className="p-4">Event Detail</th>
                                <th className="p-4 text-right pr-6 w-16"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle text-xs">
                            {filteredLogs.length === 0 ? (
                                <tr><td colSpan={5} className="p-20 text-center text-text-muted italic flex flex-col items-center gap-4">
                                    <span className="font-sans text-xs  tracking-widest opacity-50">Nothing new to show.</span>
                                </td></tr>
                            ) : filteredLogs.map(log => {
                                const styles = getSeverityStyles(log.action);
                                const isSelected = selectedLog?.id === log.id;

                                return (
                                    <tr 
                                        key={log.id} 
                                        onClick={() => setSelectedLog(log)}
                                        className={`cursor-pointer transition-all duration-200 border-l-2 ${isSelected ? 'bg-accent-primary/5 border-l-accent-primary' : 'hover:bg-surface-alt/40 border-l-transparent'}`}
                                    >
                                        <td className="p-4 pl-6 text-text-muted font-sans text-xs whitespace-nowrap">
                                            <span className="block text-text-primary font-bold">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            {new Date(log.timestamp).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-surface-highlight flex items-center justify-center text-xs font-bold text-text-secondary border border-border-subtle">
                                                    {log.agentName.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-text-primary truncate max-w-[120px]">{log.agentName}</span>
                                                    <span className="text-xs text-text-muted font-mono tracking-wide opacity-70">UID::{log.agentId}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1.5 rounded text-xs font-bold border  tracking-wider flex items-center gap-1 w-fit ${
                                                log.module === 'SALE' ? 'bg-emerald-500/10 text-status-success border-emerald-500/20' : 
                                                'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                            }`}>
                                                {log.module}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${styles.text.replace('text-', 'bg-')} shrink-0`}></div>
                                                <div>
                                                    <span className={`font-[700]  text-xs mr-2 ${styles.text}`}>
                                                        {log.action.replace(/_/g, ' ')}
                                                    </span>
                                                    <span className="text-text-secondary line-clamp-1">{log.details}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right pr-6">
                                            <ChevronRight size={16} className={`text-text-muted transition-transform ${isSelected ? 'rotate-90 text-accent-primary' : ''}`}/>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
