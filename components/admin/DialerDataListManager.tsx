import React, { useMemo } from 'react';
import { Database, Download, Cloud, Activity, ListFilter, Users, FileSpreadsheet } from 'lucide-react';
import { PanelFrame } from '../ui/PanelFrame';
import { useCRM } from '../../hooks/useCRM';
import { DialerUploadWidget } from '../widgets/telephony/DialerUploadWidget';

export const DialerDataListManager: React.FC = () => {
    const { dialerLists } = useCRM();

    const stats = useMemo(() => {
        if (!dialerLists) return { totalLists: 0, totalRows: 0, activeLists: 0, uniqueAgents: 0 };
        return {
            totalLists: dialerLists.length,
            totalRows: dialerLists.reduce((sum, list) => sum + (list.rowCount || 0), 0),
            activeLists: dialerLists.filter(l => l.status === 'Active').length,
            uniqueAgents: new Set(dialerLists.map(l => l.uploadedBy)).size
        };
    }, [dialerLists]);
    
    return (
        <div className="w-full h-full p-6 flex flex-col gap-6 overflow-y-auto">
            {/* Top Dashboard Metrics */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-[#15151e]/80 border border-border-subtle p-4 rounded-xl flex items-center justify-between group hover:border-accent-primary/30 transition-colors">
                    <div>
                        <div className="text-[10px]  font-bold text-text-muted mb-1 flex items-center gap-1.5">
                            <Database size={12} className="text-accent-primary" /> Total Uploads
                        </div>
                        <div className="text-2xl font-bold font-mono">{stats.totalLists}</div>
                    </div>
                    <div className="p-3 bg-surface-alt rounded-lg group-hover:bg-accent-primary/10 transition-colors">
                        <Activity size={20} className="text-text-muted group-hover:text-accent-primary" />
                    </div>
                </div>

                <div className="bg-[#15151e]/80 border border-border-subtle p-4 rounded-xl flex items-center justify-between group hover:border-accent-secondary/30 transition-colors">
                    <div>
                        <div className="text-[10px]  font-bold text-text-muted mb-1 flex items-center gap-1.5">
                            <ListFilter size={12} className="text-accent-secondary" /> Total Leads (Rows)
                        </div>
                        <div className="text-2xl font-bold font-mono text-white">{stats.totalRows.toLocaleString()}</div>
                    </div>
                    <div className="p-3 bg-surface-alt rounded-lg group-hover:bg-accent-secondary/10 transition-colors">
                        <Database size={20} className="text-text-muted group-hover:text-accent-secondary" />
                    </div>
                </div>

                <div className="bg-[#15151e]/80 border border-border-subtle p-4 rounded-xl flex items-center justify-between group hover:border-status-success/30 transition-colors">
                    <div>
                        <div className="text-[10px]  font-bold text-text-muted mb-1 flex items-center gap-1.5">
                            <Activity size={12} className="text-status-success" /> Active Tunnels
                        </div>
                        <div className="text-2xl font-bold font-mono text-white">{stats.activeLists}</div>
                    </div>
                    <div className="p-3 bg-surface-alt rounded-lg group-hover:bg-emerald-500/10 transition-colors">
                        <Cloud size={20} className="text-text-muted group-hover:text-status-success" />
                    </div>
                </div>

                <div className="bg-[#15151e]/80 border border-border-subtle p-4 rounded-xl flex items-center justify-between group hover:border-status-warning/30 transition-colors">
                    <div>
                        <div className="text-[10px]  font-bold text-text-muted mb-1 flex items-center gap-1.5">
                            <Users size={12} className="text-status-warning" /> Contributing Agents
                        </div>
                        <div className="text-2xl font-bold font-mono text-white">{stats.uniqueAgents}</div>
                    </div>
                    <div className="p-3 bg-surface-alt rounded-lg group-hover:bg-amber-500/10 transition-colors">
                        <Users size={20} className="text-text-muted group-hover:text-status-warning" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <PanelFrame title="Central Intelligence: Dialer Data Warehouse">
                        <div className="w-full text-left overflow-auto max-h-[500px]">
                            <table className="w-full border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-border-subtle  tracking-widest text-[#8a8a93] bg-[#0a0a0f]/80 backdrop-blur-sm sticky top-0 z-10">
                                        <th className="p-4 text-left font-bold">List Name / Content</th>
                                        <th className="p-4 text-left font-bold">Rows</th>
                                        <th className="p-4 text-center font-bold">Status</th>
                                        <th className="p-4 text-right font-bold w-24">Extract</th>
                                    </tr>
                                </thead>
                                <tbody className="text-text-primary">
                                    {!dialerLists || dialerLists.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-16 text-center text-text-muted">
                                                <div className="flex flex-col items-center justify-center p-8 border border-border-subtle rounded-xl bg-surface-alt/30 max-w-sm mx-auto">
                                                    <Cloud size={48} className="mb-4 opacity-20" />
                                                    <div className="text-sm font-bold text-white mb-2  tracking-wider">No Data Lists Found</div>
                                                    <div className="text-xs opacity-60 leading-relaxed max-w-xs px-4">
                                                        Dialer warehouse is empty. Upload CSV targets using the module to the right.
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        dialerLists.sort((a, b) => b.uploadedAt - a.uploadedAt).map((list) => (
                                            <tr key={list.id} className="border-b border-border-subtle hover:bg-white/[0.02] transition-colors group">
                                                <td className="p-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded bg-surface-alt flex items-center justify-center border border-border-subtle">
                                                            <FileSpreadsheet size={14} className="text-accent-secondary" />
                                                        </div>
                                                        <div className="font-mono text-[11px] group-hover:text-accent-secondary transition-colors truncate max-w-[150px]" title={list.name}>
                                                            {list.name}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="font-mono font-bold text-accent-primary bg-accent-primary/10 px-2 py-1 rounded text-[11px] border border-accent-primary/20">
                                                        {list.rowCount?.toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px]  tracking-wider font-bold border ${        
                                                        list.status === 'Active' 
                                                        ? 'bg-emerald-500/10 text-status-success border-emerald-500/20' 
                                                        : 'bg-surface-alt text-text-muted border-border-subtle'
                                                    }`}>
                                                        {list.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                                                        {list.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    {list.dataUrl ? (
                                                        <button 
                                                            className="p-2 hover:bg-accent-primary hover:text-white bg-surface-alt rounded border border-border-subtle transition-all text-text-muted group/btn relative overflow-hidden" 
                                                            title="Extract Payload"
                                                            onClick={() => {
                                                                const blob = new Blob([decodeURIComponent(escape(atob(list.dataUrl!)))], { type: 'text/csv' });
                                                                const url = URL.createObjectURL(blob);
                                                                const a = document.createElement('a');
                                                                a.href = url;
                                                                a.download = list.name;
                                                                a.click();
                                                                URL.revokeObjectURL(url);
                                                            }}
                                                        >
                                                            <Download size={14} className="relative z-10" />
                                                            <div className="absolute inset-0 bg-accent-primary opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                                        </button>
                                                    ) : (
                                                        <span className="text-[10px]  opacity-40 font-bold block w-full text-center">No Data</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </PanelFrame>
                </div>
                
                <div>
                    <DialerUploadWidget />
                </div>
            </div>
        </div>
    );
};
