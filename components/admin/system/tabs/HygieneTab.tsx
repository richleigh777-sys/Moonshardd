
import React, { useMemo, useState } from 'react';
import { 
    Database, Trash2, Search,
    CheckCircle, ShieldAlert, Fingerprint, Activity, Clock
} from 'lucide-react';
import { Card, Button } from '../../../ui/Base';
import { Sale, Note } from '../../../../types';

interface HygieneTabProps {
    sales: Sale[];
    notes: Note[];
    now: number;
}

export const HygieneTab: React.FC<HygieneTabProps> = ({ sales, notes, now }) => {
    const [auditType, setAuditType] = useState<'duplicates' | 'fragmentation' | 'stale'>('duplicates');

    const duplicates = useMemo(() => {
        const phoneMap: Record<string, (Sale | Note)[]> = {};
        
        // Audit both Sales and Leads
        [...sales, ...notes].forEach(item => {
            const phone = item.phone?.replace(/[^0-9]/g, '');
            if (phone && phone.length >= 7) {
                if (!phoneMap[phone]) phoneMap[phone] = [];
                phoneMap[phone].push(item);
            }
        });

        return Object.entries(phoneMap)
            .filter(([_, items]) => items.length > 1)
            .map(([phone, items]) => ({ phone, items }));
    }, [sales, notes]);

    const fragmentation = useMemo(() => {
        return [...sales, ...notes].filter(item => {
            const hasMissingField = !item.phone || (item as Sale).customer === undefined && (item as Note).customerName === undefined;
            return hasMissingField;
        });
    }, [sales, notes]);

    const staleLeads = useMemo(() => {
        const threshold = 48 * 60 * 60 * 1000; // 48 hours
        return notes.filter(n => n.status !== 'Resolved' && (now - n.timestamp) > threshold);
    }, [notes, now]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Audit Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AuditStatCard 
                    label="Duplicate Entities" 
                    count={duplicates.length} 
                    icon={Fingerprint} 
                    color="text-indigo-500" 
                    isActive={auditType === 'duplicates'}
                    onClick={() => setAuditType('duplicates')}
                />
                <AuditStatCard 
                    label="Data Fragmentation" 
                    count={fragmentation.length} 
                    icon={Database} 
                    color="text-amber-500" 
                    isActive={auditType === 'fragmentation'}
                    onClick={() => setAuditType('fragmentation')}
                />
                <AuditStatCard 
                    label="Stale Objectives" 
                    count={staleLeads.length} 
                    icon={Clock} 
                    color="text-red-500" 
                    isActive={auditType === 'stale'}
                    onClick={() => setAuditType('stale')}
                />
            </div>

            {/* Main Audit Display */}
            <Card variant="panel" className="bg-surface-alt/20 border-border-subtle p-0 overflow-hidden min-h-[400px] flex flex-col">
                <div className="p-4 border-b border-border-subtle bg-surface-alt/40 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {auditType === 'duplicates' && <Fingerprint size={16} className="text-indigo-500" />}
                        {auditType === 'fragmentation' && <Database size={16} className="text-amber-500" />}
                        {auditType === 'stale' && <Clock size={16} className="text-red-500" />}
                        <h3 className="text-xs font-black uppercase tracking-widest text-text-primary">
                            {auditType === 'duplicates' ? 'Duplicate Collisions Detected' : 
                             auditType === 'fragmentation' ? 'Missing Identity Keys' : 
                             'Inactive Lead Protocols'}
                        </h3>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {auditType === 'duplicates' && (
                        <div className="space-y-4">
                            {duplicates.map(dup => (
                                <div key={dup.phone} className="p-4 bg-surface-main border border-border-subtle rounded-2xl space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                                <Fingerprint size={14} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-text-muted uppercase tracking-tighter">Phone Collision</p>
                                                <p className="text-xs font-bold text-text-primary">{dup.phone}</p>
                                            </div>
                                        </div>
                                        <Button variant="secondary" className="h-7 px-2 text-[8px] font-black uppercase">
                                            Synthesize Records
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {dup.items.map((item, idx) => (
                                            <div key={idx} className="p-2 border border-border-subtle/50 rounded-xl bg-surface-alt/30 text-[10px]">
                                                <div className="flex justify-between font-bold mb-1">
                                                    <span className="text-text-primary">{(item as Sale).customer || (item as Note).customerName || 'Unnamed'}</span>
                                                    <span className="text-text-muted uppercase text-[8px] opacity-60">
                                                        {(item as Sale).amount ? 'Sale' : 'Lead'}
                                                    </span>
                                                </div>
                                                <p className="text-text-muted italic opacity-80 truncate">
                                                    {(item as Sale).product || (item as Note).content || 'No details'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {duplicates.length === 0 && <EmptyAudit message="No duplicate records detected in the current nexus." />}
                        </div>
                    )}

                    {auditType === 'fragmentation' && (
                        <div className="space-y-3">
                            {fragmentation.map((item, idx) => (
                                <div key={idx} className="p-3 bg-surface-main border border-border-subtle rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                                            <Database size={14} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-text-primary">{(item as Sale).customer || (item as Note).customerName || 'Anonymous Entry'}</p>
                                            <div className="flex gap-2 mt-1">
                                                {!item.phone && <span className="text-[8px] font-black uppercase bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded border border-red-500/20">Missing Phone</span>}
                                                {!(item as Sale).customer && !(item as Note).customerName && <span className="text-[8px] font-black uppercase bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded border border-red-500/20">Missing Name</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="secondary" className="h-7 px-3 text-[8px] font-black uppercase">Fix</Button>
                                </div>
                            ))}
                            {fragmentation.length === 0 && <EmptyAudit icon={CheckCircle} message="Single source of truth confirmed. Data integrity optimal." color="text-emerald-500" />}
                        </div>
                    )}

                    {auditType === 'stale' && (
                        <div className="space-y-3">
                            {staleLeads.map(lead => (
                                <div key={lead.id} className="p-3 bg-surface-main border border-border-subtle rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                                            <Clock size={14} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-text-primary">{lead.customerName || 'Unnamed Lead'}</p>
                                            <p className="text-[9px] font-medium text-text-muted uppercase tracking-widest mt-1">
                                                IDLE FOR {Math.floor((now - lead.timestamp) / (3600000))} HOURS
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="secondary" className="h-7 px-3 text-[8px] font-black uppercase">Reassign</Button>
                                        <button className="p-2 text-text-muted hover:text-status-error transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {staleLeads.length === 0 && <EmptyAudit icon={Activity} message="Active operational rhythm detected. All objectives current." color="text-blue-500" />}
                        </div>
                    )}
                </div>
            </Card>

            {/* Strategic Advice (AI Summary) */}
            <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <ShieldAlert size={60} className="text-indigo-500" />
                </div>
                <div className="flex items-center gap-3 mb-2">
                    <Activity size={18} className="text-indigo-500 animate-pulse" />
                    <h4 className="text-xs font-black uppercase tracking-widest text-text-primary">Auditor Recommendation</h4>
                </div>
                <p className="text-xs font-medium text-text-secondary leading-relaxed max-w-2xl">
                    Our sensors indicate {duplicates.length} synchronization collisions. This fragmentation typically occurs when 
                    operatives bypass standard intake protocols. Recommend immediate "Synthesize" action to consolidate customer LTV 
                    and prevent repeat support narratives.
                </p>
            </div>
        </div>
    );
};

const AuditStatCard = ({ label, count, icon: Icon, color, isActive, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`p-4 rounded-2xl border transition-all text-left group ${
            isActive 
            ? 'bg-surface-main border-accent-primary shadow-lg shadow-accent-primary/10 ring-4 ring-accent-primary/5' 
            : 'bg-surface-alt/40 border-border-subtle hover:bg-surface-main hover:border-border-subtle hover:translate-y-[-2px]'
        }`}
    >
        <div className="flex justify-between items-start mb-3">
            <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-accent-primary text-white' : 'bg-surface-alt text-text-muted group-hover:text-text-primary'}`}>
                <Icon size={18} />
            </div>
            <span className={`text-2xl font-black num-font ${isActive ? 'text-accent-primary' : color}`}>{count}</span>
        </div>
        <p className="text-[10px] font-black uppercase text-text-muted tracking-widest leading-none mb-1">{label}</p>
        <p className="text-[8px] font-bold text-text-muted/60 uppercase">Detections in scope</p>
    </button>
);

const EmptyAudit = ({ message, icon: Icon = Search, color = "text-text-muted" }: any) => (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className={`p-4 rounded-full bg-surface-alt/50 ${color} opacity-40`}>
            <Icon size={32} />
        </div>
        <p className={`text-xs font-medium ${color} max-w-xs italic`}>{message}</p>
    </div>
);
