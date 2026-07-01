
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Info, Download, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
import { AuditEntry } from '../../types';
import { Card, Button } from '../ui/Base';
import { exportToCSV } from '../../views/utils/crmLogic';
import { useVirtualizer } from '@tanstack/react-virtual';

import { useCRM } from '../../hooks/useCRM';
import { useInfiniteCollection } from '../../hooks/useInfiniteCollection';

export const AuditLog: React.FC<{ logs?: AuditEntry[] }> = ({ logs }) => {
    const { currentUser } = useCRM();
    const isSuperAdmin = (currentUser?.level || currentUser?.accessLevel || 0) >= 10;
    const [searchTerm, setSearchTerm] = useState('');
    const [filterModule, setFilterModule] = useState<'ALL' | 'AUTH' | 'SALE' | 'SYSTEM'>('ALL');
    const [selectedLog, setSelectedLog] = useState<AuditEntry | null>(null);

    const { data: serverLogs, loading, hasMore, fetchNextPage } = useInfiniteCollection('audit_logs', {
        action: searchTerm,
        // we can add other params but we'll do memory filter for now
    });

    const activeLogs = serverLogs.length > 0 ? serverLogs : (logs || []);

    const filteredLogs = useMemo(() => {
        return activeLogs.filter(log => {
            const matchesModule = filterModule === 'ALL' || log.module === filterModule;
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = 
                log.action?.toLowerCase().includes(searchLower) ||
                log.details?.toLowerCase().includes(searchLower) ||
                log.agentName?.toLowerCase().includes(searchLower) ||
                log.id?.toLowerCase().includes(searchLower);
            
            return matchesModule && matchesSearch;
        }).sort((a, b) => b.timestamp - a.timestamp);
    }, [activeLogs, filterModule, searchTerm]);

    const parentRef = useRef<HTMLDivElement>(null);
    const rowVirtualizer = useVirtualizer({
        count: hasMore ? filteredLogs.length + 1 : filteredLogs.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 64,
        overscan: 5,
    });

    const virtualItems = rowVirtualizer.getVirtualItems();

    useEffect(() => {
        const lastItem = virtualItems[virtualItems.length - 1];
        if (!lastItem) return;
        
        if (hasMore && lastItem.index >= filteredLogs.length - 1 && !loading) {
            fetchNextPage();
        }
    }, [virtualItems, hasMore, fetchNextPage, loading, filteredLogs.length]);

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
                <div className="p-4 border-b border-border-subtle flex flex-col space-y-4 bg-surface-highlight/10">
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
                
                <div ref={parentRef} className="flex-1 overflow-y-auto p-0 relative custom-scrollbar bg-surface-main">
                    <table className="w-full text-left border-collapse table-fixed">
                        <colgroup>
                            <col className="w-32" />
                            <col className="w-48" />
                            <col className="w-32" />
                            <col />
                            <col className="w-16" />
                        </colgroup>
                        <thead className="sticky top-0 bg-surface-alt/95 backdrop-blur-md text-xs font-[700] text-text-muted  tracking-widest border-b border-border-subtle z-10">
                            <tr>
                                <th className="p-4 pl-6">Time</th>
                                <th className="p-4">Partner Identity</th>
                                <th className="p-4">Area</th>
                                <th className="p-4">Event Detail</th>
                                <th className="p-4 text-right pr-6"></th>
                            </tr>
                        </thead>
                        {virtualItems.length > 0 && (
                            <tbody>
                                <tr style={{ height: `${virtualItems[0]?.start || 0}px` }}>
                                    <td colSpan={5} />
                                </tr>
                            </tbody>
                        )}
                        <tbody className="divide-y divide-border-subtle text-xs">
                            {filteredLogs.length === 0 && !loading ? (
                                <tr><td colSpan={5} className="p-20 text-center text-text-muted italic flex flex-col items-center gap-4">
                                    <span className="font-sans text-xs tracking-widest opacity-50">Nothing new to show.</span>
                                </td></tr>
                            ) : virtualItems.map(virtualRow => {
                                if (loading && filteredLogs.length === 0) {
                                    return (
                                        <tr key={`skel-${virtualRow.index}`} ref={rowVirtualizer.measureElement} data-index={virtualRow.index} className="animate-pulse">
                                            <td colSpan={5} className="p-4"><div className="h-4 bg-surface-alt rounded"></div></td>
                                        </tr>
                                    );
                                }
                                if (virtualRow.index >= filteredLogs.length) {
                                    return (
                                        <tr key={`load-${virtualRow.index}`} ref={rowVirtualizer.measureElement} data-index={virtualRow.index}>
                                            <td colSpan={5} className="p-4 text-center text-text-muted">Loading more...</td>
                                        </tr>
                                    );
                                }

                                const log = filteredLogs[virtualRow.index];
                                const styles = getSeverityStyles(log.action);
                                const isSelected = selectedLog?.id === log.id;

                                return (
                                    <tr 
                                        key={log.id} 
                                        ref={rowVirtualizer.measureElement}
                                        data-index={virtualRow.index}
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
                                                    {log.agentName?.charAt(0) || '?'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-text-primary truncate max-w-[120px]">{log.agentName}</span>
                                                    <span className="text-xs text-text-muted font-mono tracking-wide opacity-70">UID::{log.agentId}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1.5 rounded text-xs font-bold border tracking-wider flex items-center gap-1 w-fit ${
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
                        {virtualItems.length > 0 && (
                            <tbody>
                                <tr style={{ height: `${rowVirtualizer.getTotalSize() - (virtualItems[virtualItems.length - 1]?.end || 0)}px` }}>
                                    <td colSpan={5} />
                                </tr>
                            </tbody>
                        )}
                    </table>
                </div>
            </Card>

            {selectedLog && (
                <Card variant="panel" className="absolute right-0 top-0 bottom-0 w-[400px] flex flex-col bg-surface-main shadow-2xl border-l border-border-subtle transition-transform duration-300 translate-x-0">
                    <div className="p-6 border-b border-border-subtle flex justify-between items-center bg-surface-alt/50">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getSeverityStyles(selectedLog.action).bg} ${getSeverityStyles(selectedLog.action).text}`}>
                                {React.createElement(getSeverityStyles(selectedLog.action).icon, { size: 16 })}
                            </div>
                            <h3 className="text-sm font-bold text-text-primary tracking-tight">Record Details</h3>
                        </div>
                        <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-surface-alt rounded-lg text-text-muted hover:text-text-primary transition-colors">
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-text-muted tracking-widest uppercase">Action</label>
                            <p className="text-sm font-medium text-text-primary">{selectedLog.action.replace(/_/g, ' ')}</p>
                        </div>
                        
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-text-muted tracking-widest uppercase">Agent</label>
                            <p className="text-sm font-medium text-text-primary">{selectedLog.agentName}</p>
                            <p className="text-xs text-text-muted font-mono">{selectedLog.agentId}</p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-text-muted tracking-widest uppercase">Timestamp</label>
                            <p className="text-sm text-text-primary">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-text-muted tracking-widest uppercase">Details</label>
                            <p className="text-sm text-text-secondary">{selectedLog.details}</p>
                        </div>

                        {(selectedLog.oldValue || selectedLog.newValue) && (
                            <div className="pt-4 border-t border-border-subtle space-y-4">
                                <h4 className="text-xs font-bold text-text-muted tracking-widest uppercase">State Changes</h4>
                                
                                {selectedLog.oldValue && (
                                    <div className="space-y-2">
                                        <div className="text-xs font-medium text-status-error flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-status-error" /> Previous State
                                        </div>
                                        <pre className="p-3 bg-status-error/5 border border-status-error/10 rounded-xl text-[10px] font-mono text-text-secondary overflow-x-auto whitespace-pre-wrap break-all">
                                            {JSON.stringify(selectedLog.oldValue, null, 2)}
                                        </pre>
                                    </div>
                                )}

                                {selectedLog.newValue && (
                                    <div className="space-y-2">
                                        <div className="text-xs font-medium text-status-success flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-status-success" /> New State
                                        </div>
                                        <pre className="p-3 bg-status-success/5 border border-status-success/10 rounded-xl text-[10px] font-mono text-text-secondary overflow-x-auto whitespace-pre-wrap break-all">
                                            {JSON.stringify(selectedLog.newValue, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
};
