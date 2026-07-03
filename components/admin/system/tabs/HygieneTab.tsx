import React, { useMemo, useState } from 'react';
import { 
    Database, Trash2, Search,
    CheckCircle, Fingerprint, Activity, Clock, Wrench, ShieldCheck, Sparkles, RefreshCw
} from 'lucide-react';
import { Card, Button } from '../../../ui/Base';
import { Sale, Note, Customer } from '../../../../types';
import { useCRM } from '../../../../hooks/useCRM';
import { useSystem } from '../../../../hooks/useSystem';
import { sfx } from '../../../../lib/soundService';

interface HygieneTabProps {
    sales: Sale[];
    notes: Note[];
    now: number;
}

export const HygieneTab: React.FC<HygieneTabProps> = ({ sales, notes, now }) => {
    const { customers, updateSale, updateNote, deleteNote, addCustomer } = useCRM();
    const { setToast } = useSystem();
    const [auditType, setAuditType] = useState<'duplicates' | 'fragmentation' | 'stale' | 'normalization'>('duplicates');
    const [isBulkCleaning, setIsBulkCleaning] = useState(false);

    const duplicates = useMemo(() => {
        const phoneMap: Record<string, (Sale | Note | Customer)[]> = {};
        
        // Audit Customers, Sales and Leads for overlaps
        [...customers, ...sales, ...notes].forEach(item => {
            const phone = item.phone?.replace(/[^0-9]/g, '');
            if (phone && phone.length >= 7) {
                if (!phoneMap[phone]) phoneMap[phone] = [];
                phoneMap[phone].push(item);
            }
        });

        // Group by phone collision 
        return Object.entries(phoneMap)
            .filter(([_, items]) => {
                // Flag if there are multiple customers with same phone, or if sales/notes are disconnected
                return items.length > 1; 
            })
            .map(([phone, items]) => ({ phone, items }));
    }, [customers, sales, notes]);

    const fragmentation = useMemo(() => {
        return [...sales, ...notes].filter(item => {
            const hasMissingField = !item.phone || ('amount' in item && !item.customer) || ('content' in item && !item.customerName);
            return hasMissingField;
        });
    }, [sales, notes]);

    const staleLeads = useMemo(() => {
        const threshold = 48 * 60 * 60 * 1000; // 48 hours
        return notes.filter(n => n.status !== 'Resolved' && (now - n.timestamp) > threshold);
    }, [notes, now]);

    const normalization = useMemo(() => {
        return [...sales, ...notes].filter(item => {
            const phoneStr = item.phone || '';
            const emailStr = ('email' in item ? item.email : '') || '';
            const needsPhoneFix = phoneStr !== phoneStr.replace(/[^0-9]/g, '');
            const needsEmailFix = emailStr !== emailStr.toLowerCase().trim();
            return needsPhoneFix || needsEmailFix;
        });
    }, [sales, notes]);

    // Calculate Dynamic Hygiene Score
    const hygieneScore = useMemo(() => {
        const totalRecords = sales.length + notes.length;
        if (totalRecords === 0) return 100;
        const totalIssues = duplicates.length + fragmentation.length + staleLeads.length + normalization.length;
        const score = Math.max(0, Math.round(100 - (totalIssues / totalRecords) * 100));
        return score;
    }, [sales, notes, duplicates, fragmentation, staleLeads, normalization]);

    const handleSynthesize = async (dup: { phone: string, items: (Sale | Note | Customer)[] }) => {
        try {
            // Find existing customers in this bucket
            const dupCustomers = dup.items.filter(i => 'accountId' in i && 'ltv' in i) as Customer[];
            
            const masterCustomer = dupCustomers.length > 0 ? dupCustomers[0] : null;
            const masterItem = dup.items.find(i => 'amount' in i) || dup.items[0];
            const masterName = (masterItem as Sale).customer || (masterItem as Note).customerName || (masterItem as Customer).fullName || 'Unknown';
            const masterEmail = (masterItem as Sale).email || (masterItem as Customer).email || '';
            
            if (!masterCustomer) {
                const [firstName, ...rest] = masterName.split(' ');
                /* We don't await returned customer id here since addCustomer may not return it. Let's see. */
                await addCustomer({
                    firstName: firstName || 'Unknown',
                    lastName: rest.join(' ') || 'Unknown',
                    fullName: masterName,
                    phone: dup.phone,
                    normalizedPhone: dup.phone,
                    email: masterEmail,
                    normalizedEmail: masterEmail.toLowerCase().trim(),
                    address: (masterItem as Sale).address || '',
                    ltv: 0,
                    orderCount: 0
                });
            }

            // Bring all items under normalization
            for (const item of dup.items) {
                if ('amount' in item) {
                    await updateSale(item.id, { 
                        customer: masterName, 
                        phone: dup.phone 
                    });
                } else if ('content' in item) {
                    await updateNote(item.id, { 
                        customerName: masterName, 
                        phone: dup.phone 
                    });
                }
            }
            sfx.playSuccess();
            setToast({ title: 'Records Synthesized', message: `Unified records for ${dup.phone}`, type: 'success' });
        } catch {
            setToast({ title: 'Error', message: 'Failed to synthesize records.', type: 'error' });
        }
    };

    const handleFixFragmentation = async (item: Sale | Note) => {
        try {
            if ('amount' in item) {
                await updateSale(item.id, { 
                    customer: item.customer || 'Unknown User',
                    phone: item.phone || '0000000000'
                });
            } else {
                await updateNote(item.id, { 
                    customerName: item.customerName || 'Unknown User',
                    phone: item.phone || '0000000000'
                });
            }
            sfx.playSuccess();
            setToast({ title: 'Record Patched', message: 'Incomplete identity patched with placeholders.', type: 'success' });
        } catch {
             setToast({ title: 'Error', message: 'Failed to patch record.', type: 'error' });
        }
    };

    const handleNormalize = async (item: Sale | Note) => {
        try {
            const cleanPhone = item.phone?.replace(/[^0-9]/g, '') || '';
            const emailStr = ('email' in item ? item.email : '') || '';
            const cleanEmail = emailStr.toLowerCase().trim();
            
            if ('amount' in item) {
                await updateSale(item.id, { phone: cleanPhone, email: cleanEmail });
            } else {
                await updateNote(item.id, { phone: cleanPhone });
            }
            sfx.playSuccess();
            setToast({ title: 'Data Normalized', message: 'Structurally invalid formats have been sanitized.', type: 'success' });
        } catch {
            setToast({ title: 'Error', message: 'Failed to normalize data.', type: 'error' });
        }
    };

    const handleBulkNormalize = async () => {
        sfx.playClick();
        setIsBulkCleaning(true);
        try {
            for (const item of normalization) {
                const cleanPhone = item.phone?.replace(/[^0-9]/g, '') || '';
                const emailStr = ('email' in item ? item.email : '') || '';
                const cleanEmail = emailStr.toLowerCase().trim();
                
                if ('amount' in item) {
                    await updateSale(item.id, { phone: cleanPhone, email: cleanEmail });
                } else {
                    await updateNote(item.id, { phone: cleanPhone });
                }
            }
            sfx.playSuccess();
            setToast({ title: 'Database Cleansed', message: `Normalized ${normalization.length} strings successfully.`, type: 'success' });
        } catch {
            setToast({ title: 'Partial Failure', message: 'Failed to normalize some indices.', type: 'error' });
        } finally {
            setIsBulkCleaning(false);
        }
    };

    const handleResolveStale = async (id: string) => {
        try {
            await deleteNote(id);
            sfx.playSuccess();
            setToast({ title: 'Objective Cleared', message: 'Stale lead has been permanently removed from queue.', type: 'success' });
        } catch {
            setToast({ title: 'Error', message: 'Failed to clear lead.', type: 'error' });
        }
    };

    // Determine Shield Health status text and color
    const shieldStatus = hygieneScore >= 90 ? { text: 'Optimal Secure', color: 'text-status-success bg-emerald-500/10 border-status-success/25' }
                       : hygieneScore >= 70 ? { text: 'Cautionary Action Reqd', color: 'text-status-warning bg-amber-500/10 border-status-warning/25' }
                       : { text: 'Critical Identity Frag', color: 'text-status-error bg-rose-500/10 border-status-error/25' };

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Global Hygiene score shield banner */}
            <div className="p-4 bg-surface-alt/40 border border-border-subtle rounded-xl flex flex-col md:flex-row gap-4 justify-between items-center relative overflow-hidden ">
                <div className="absolute top-0 right-0 p-5 opacity-5 pointer-events-none">
                    <ShieldCheck size={180} />
                </div>
                <div className="flex items-center gap-5 relative z-10 text-left">
                    <div className="relative flex items-center justify-center shrink-0">
                        {/* Percentage circular visual marker */}
                        <div className="w-16 h-16 rounded-full border-4 border-surface-main flex items-center justify-center text-lg font-bold text-white relative font-mono shadow-sm bg-surface-highlight">
                            {hygieneScore}%
                            <div className="absolute inset-0 rounded-full border-2 border-emerald-500/50 animate-ping opacity-25"></div>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-text-primary tracking-wide flex items-center gap-2">
                            Global Hygiene Shield Status
                            <span className={`px-2 py-0.5 rounded text-sm uppercase font-bold border ${shieldStatus.color}`}>
                                {shieldStatus.text}
                            </span>
                        </h4>
                        <p className="text-sm text-text-muted mt-1 max-w-md leading-relaxed">
                            Calculated relative integrity of active dialer rosters and customer attribution keys. A lower score hampers matching rates.
                        </p>
                    </div>
                </div>

                <div className="shrink-0 flex items-center gap-3 w-full md:w-auto">
                    {normalization.length > 0 && (
                        <button
                            type="button"
                            onClick={handleBulkNormalize}
                            disabled={isBulkCleaning}
                            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-surface-main text-sm font-bold uppercase tracking-wider h-10 px-5 rounded-xl transition-all shadow-sm flex items-center gap-2 justify-center w-full md:w-auto"
                        >
                            {isBulkCleaning ? (
                                <RefreshCw size={14} className="animate-spin" />
                            ) : (
                                <Sparkles size={14} />
                            )}
                            Bulk Normalize ({normalization.length})
                        </button>
                    )}
                </div>
            </div>

            {/* Header Audit Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-4">
                <AuditStatCard 
                    label="Duplicate Entities" 
                    count={duplicates.length} 
                    icon={Fingerprint} 
                    color="text-accent-secondary" 
                    isActive={auditType === 'duplicates'}
                    onClick={() => setAuditType('duplicates')}
                />
                <AuditStatCard 
                    label="Incomplete Data" 
                    count={fragmentation.length} 
                    icon={Database} 
                    color="text-status-warning" 
                    isActive={auditType === 'fragmentation'}
                    onClick={() => setAuditType('fragmentation')}
                />
                <AuditStatCard 
                    label="Unnormalized" 
                    count={normalization.length} 
                    icon={Wrench} 
                    color="text-teal-500" 
                    isActive={auditType === 'normalization'}
                    onClick={() => setAuditType('normalization')}
                />
                <AuditStatCard 
                    label="Stale Objectives" 
                    count={staleLeads.length} 
                    icon={Clock} 
                    color="text-status-error" 
                    isActive={auditType === 'stale'}
                    onClick={() => setAuditType('stale')}
                />
            </div>

            {/* Main Audit Display */}
            <Card variant="panel" className="bg-surface-alt/40 border border-border-subtle p-0 overflow-hidden min-h-[300px] flex flex-col rounded-xl shadow-float">
                <div className="p-5 lg:p-4 border-b border-border-subtle bg-surface-main/60 flex justify-between items-center relative overflow-hidden ">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary opacity-30"></div>
                     <div className="flex items-center gap-4 relative z-10">
                         <div className="p-2.5 rounded-xl bg-surface-alt">
                             {auditType === 'duplicates' && <Fingerprint size={20} className="text-accent-secondary" />}
                             {auditType === 'fragmentation' && <Database size={20} className="text-status-warning" />}
                             {auditType === 'normalization' && <Wrench size={20} className="text-teal-500" />}
                             {auditType === 'stale' && <Clock size={20} className="text-status-error" />}
                         </div>
                         <div>
                             <h3 className="text-sm font-bold  tracking-wide text-text-primary">
                                 {auditType === 'duplicates' ? 'Duplicate Collisions Detected' : 
                                 auditType === 'fragmentation' ? 'Missing Identity Keys' : 
                                 auditType === 'normalization' ? 'Structural Irregularities' :
                                 'Inactive Lead Protocols'}
                             </h3>
                             <p className="text-sm font-bold text-text-muted  tracking-wide mt-1">Resolution Queue</p>
                         </div>
                     </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {auditType === 'duplicates' && (
                        <div className="space-y-4">
                            {duplicates.map(dup => (
                                <div key={dup.phone} className="p-4 bg-surface-main border border-border-subtle rounded-xl space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-accent-secondary/10 flex items-center justify-center text-accent-secondary">
                                                <Fingerprint size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-text-muted  tracking-tighter">Phone Collision</p>
                                                <p className="text-sm font-bold text-text-primary">{dup.phone}</p>
                                            </div>
                                        </div>
                                        <Button variant="secondary" onClick={() => handleSynthesize(dup)} className="h-7 px-2 text-sm font-bold ">
                                            Synthesize Records
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {dup.items.map((item, idx) => {
                                            const isCustomer = 'accountId' in item && 'ltv' in item;
                                            const isSale = 'amount' in item;
                                            const name = isSale ? (item as Sale).customer : isCustomer ? (item as Customer).fullName : (item as Note).customerName;
                                            const label = isSale ? 'Sale' : isCustomer ? 'Profile' : 'Lead';
                                            const details = isSale ? (item as Sale).product : isCustomer ? `LTV: ${(item as Customer).ltv}` : (item as Note).content;
                                            return (
                                            <div key={idx} className="p-2 border border-border-subtle/50 rounded-xl bg-surface-alt/30 text-sm">
                                                <div className="flex justify-between font-bold mb-1">
                                                    <span className="text-text-primary">{name || 'Unnamed'}</span>
                                                    <span className="text-text-muted  text-sm opacity-60">
                                                        {label}
                                                    </span>
                                                </div>
                                                <p className="text-text-muted italic opacity-80 truncate">
                                                    {details || 'No details'}
                                                </p>
                                            </div>
                                            );
                                        })}
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
                                        <div className="p-2 bg-amber-500/10 rounded-lg text-status-warning">
                                            <Database size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-text-primary">{('amount' in item ? item.customer : item.customerName) || 'Anonymous Entry'}</p>
                                            <div className="flex gap-2 mt-1">
                                                {!item.phone && <span className="text-sm font-bold  bg-red-500/10 text-status-error px-3 py-1.5 rounded border border-red-500/20">Missing Phone</span>}
                                                {!('amount' in item ? item.customer : item.customerName) && <span className="text-sm font-bold  bg-red-500/10 text-status-error px-3 py-1.5 rounded border border-red-500/20">Missing Name</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="secondary" onClick={() => handleFixFragmentation(item)} className="h-7 px-3 text-sm font-bold ">Fix</Button>
                                </div>
                            ))}
                            {fragmentation.length === 0 && <EmptyAudit icon={CheckCircle} message="Single source of truth confirmed. Data integrity optimal." color="text-status-success" />}
                        </div>
                    )}

                    {auditType === 'normalization' && (
                        <div className="space-y-3">
                            {normalization.map((item, idx) => {
                                const phoneStr = item.phone || '';
                                return (
                                    <div key={item.id || idx} className="p-3 bg-surface-main border border-border-subtle rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-teal-500/10 rounded-lg text-teal-500">
                                                <Wrench size={16} />
                                            </div>
                                            <div>
                                                 <p className="text-sm font-bold text-text-primary">{('amount' in item ? item.customer : item.customerName) || 'Unknown'}</p>
                                                 <div className="flex flex-col gap-1 mt-1 text-sm text-text-muted font-mono">
                                                     <span>Phone: {phoneStr}</span>
                                                     {'amount' in item && item.email && <span>Email: {item.email}</span>}
                                                 </div>
                                            </div>
                                        </div>
                                        <Button variant="secondary" onClick={() => handleNormalize(item)} className="h-7 px-3 text-sm font-bold ">Normalize</Button>
                                    </div>
                                )
                            })}
                            {normalization.length === 0 && <EmptyAudit icon={CheckCircle} message="All data structured to defined schemas." color="text-teal-500" />}
                        </div>
                    )}

                    {auditType === 'stale' && (
                        <div className="space-y-3">
                            {staleLeads.map(lead => (
                                <div key={lead.id} className="p-3 bg-surface-main border border-border-subtle rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-500/10 rounded-lg text-status-error">
                                            <Clock size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-text-primary">{lead.customerName || 'Unnamed Lead'}</p>
                                            <p className="text-sm font-medium text-text-muted  tracking-wide mt-1">
                                                IDLE FOR {Math.floor((now - lead.timestamp) / (3600000))} HOURS
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="secondary" className="h-7 px-3 text-sm font-bold ">Reassign</Button>
                                        <button onClick={() => handleResolveStale(lead.id)} className="p-2 text-text-muted hover:text-status-error transition-colors">
                                            <Trash2 size={16} />
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
            <div className="p-4 bg-indigo-500/5 border border-accent-secondary/20 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <ShieldCheck size={60} className="text-accent-secondary" />
                </div>
                <div className="flex items-center gap-3 mb-2">
                    <Activity size={18} className="text-accent-secondary animate-pulse" />
                    <h4 className="text-sm font-bold  tracking-wide text-text-primary">Auditor Recommendation</h4>
                </div>
                <p className="text-sm font-medium text-text-secondary leading-relaxed max-w-2xl">
                    Our sensors indicate {duplicates.length} synchronization collisions and {normalization.length} unnormalized strings. This fragmentation typically occurs when 
                    operatives bypass standard intake protocols. Recommend immediate "Synthesize" and "Normalize" action to consolidate customer LTV 
                    and prevent repeat support narratives.
                </p>
            </div>
        </div>
    );
};

const AuditStatCard = ({ label, count, icon: Icon, isActive, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`p-5 lg:p-4 rounded-xl border transition-all duration-300 text-left group overflow-hidden relative ${
            isActive 
            ? 'bg-surface-main/80 border-accent-primary shadow-sm ring-1 ring-accent-primary/20  scale-[1.02]' 
            : 'bg-surface-alt/20 border-border-subtle hover:bg-surface-main/50 hover:border-border-strong hover:shadow-lg '
        }`}
    >
        {isActive && <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-transparent z-0"></div>}
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4 lg:mb-6">
                <div className={`p-3 lg:p-4 rounded-xl transition-all duration-500 ${isActive ? 'bg-accent-primary text-surface-alt shadow-lg shadow-accent-primary/30' : 'bg-surface-alt text-text-muted group-hover:text-text-primary group-hover:bg-surface-highlight'}`}>
                    <Icon size={24} strokeWidth={2} />
                </div>
                <span className={`text-lg lg:text-5xl font-display font-bold tracking-tighter ${isActive ? 'text-accent-primary shadow-sm' : 'text-text-primary'}`}>{count}</span>
            </div>
            <p className="text-sm lg:text-sm font-bold  text-text-primary tracking-wide leading-tight mb-1 text-left">{label}</p>
            <p className="text-sm font-bold text-text-muted  tracking-wide text-left opacity-60">Detections</p>
        </div>
    </button>
);

const EmptyAudit = ({ message, icon: Icon = Search, color = "text-text-muted" }: any) => (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className={`p-4 rounded-full bg-surface-alt/50 ${color} opacity-40`}>
            <Icon size={32} />
        </div>
        <p className={`text-sm font-medium ${color} max-w-xs italic`}>{message}</p>
    </div>
);
