import React, { useState, useMemo } from 'react';
import { Target, Phone, CheckCircle, ArrowRight, Clock, Box, Rocket, ShieldAlert } from 'lucide-react';
import { Card, Button, Badge } from '../ui/Base';
import { useCRM } from '../../hooks/useCRM';
import { useAuth } from '../../hooks/useAuth';
import { sfx } from '../../lib/soundService';
import { MaskedData } from '../ui/MaskedData';

export const ActionCenter: React.FC<{ onEngage?: (data: any) => void }> = ({ onEngage }) => {
    const { notes, customers, sales, deleteNote } = useCRM();
    const { currentUser } = useAuth();
    const [viewMode, setViewMode] = useState<'callbacks' | 'reorder' | 'inbound' | 'recovery'>('recovery');

    const [now] = useState(() => Date.now());

    // 0. Recovery
    const recoveryList = useMemo(() => {
        if (!currentUser) return [];
        return sales
            .filter(s => s.agentId === currentUser.id && s.status === 'Declined')
            .map(s => ({
                id: s.id,
                customerName: s.customer,
                phone: s.phone,
                amount: s.amount,
                reason: s.declineReason || s.metadata?.qaNotes || 'Admin Declined',
                time: s.timestamp
            }))
            .sort((a,b) => b.time - a.time);
    }, [sales, currentUser]);

    // 1. Hot Callbacks Today
    const hotCallbacks = useMemo(() => {
        if (!currentUser) return [];
        return notes
            .filter(n => n.type === 'callback' && n.agentId === currentUser.id)
            .map(n => ({
                id: n.id,
                customerName: n.customerName || 'Unknown',
                phone: n.phone,
                time: n.timestamp, // Assuming timestamp is the target execution time for the callback
                reason: n.content || n.reason || 'Requested Callback'
            }))
            .sort((a,b) => a.time - b.time);
    }, [notes, currentUser]);

    // 2. Ready for Reorder
    // We compute this by looking at closed sales that are approaching their "Next Reorder Target Date" (simulated by adding default 30 days)
    const reorders = useMemo(() => {
        if (!currentUser) return [];
        const mySales = sales.filter(s => s.agentId === currentUser.id && s.status === 'Approved');
        
        return mySales.map(s => {
            // Pull supply life from sale metadata if configured during closing, fallback to 30
            const supplyDays = s.metadata?.daysSupply || 30; 
            const msPerDay = 24 * 60 * 60 * 1000;
            const reorderDate = s.timestamp + (supplyDays * msPerDay);
            const daysUntil = (reorderDate - now) / msPerDay;

            return {
                id: s.id,
                customerName: s.customer,
                product: s.product,
                phone: s.phone,
                reorderDate,
                daysUntil,
                amount: s.amount
            };
        }).filter(r => r.daysUntil <= 7 && r.daysUntil >= -30) // Expiring within 7 days, or expired up to 30 days ago
        .sort((a,b) => a.daysUntil - b.daysUntil);
    }, [sales, currentUser, now]);

    // 3. New Inbound Leads
    const inbound = useMemo(() => {
        return customers
            .filter(c => {
                // If they have no sales and no notes, they are fresh inbound
                const hasSales = sales.some(s => s.customer === c.name || s.phone === c.phone);
                const hasNotes = notes.some(n => n.customerName === c.name || n.phone === c.phone);
                return !hasSales && !hasNotes;
            })
            .slice(0, 20)
            .map(c => ({
                id: c.id,
                customerName: c.name,
                phone: c.phone,
                addedAt: c.updatedAt || now
            }))
            .sort((a,b) => b.addedAt - a.addedAt);
    }, [customers, sales, notes, now]);

    const handleCall = (person: any) => {
        sfx.playSubmit();
        if (onEngage) onEngage(person);
    };

    const handleClearCallback = async (noteId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        sfx.playSuccess();
        await deleteNote(noteId);
    };

    return (
        <Card variant="panel" className="h-[400px] flex flex-col bg-surface-main border-border-subtle overflow-hidden relative group">
            <div className="absolute -right-12 -top-12 w-40 h-40 bg-accent-primary/10 rounded-full blur-3xl group-hover:bg-accent-primary/20 transition-all duration-500" />
            
            <div className="p-5 border-b border-border-subtle bg-surface-alt flex flex-wrap gap-2 justify-between items-center shrink-0 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-main border border-border-subtle text-accent-primary flex items-center justify-center shadow-sm">
                        <Rocket size={18} strokeWidth={2.5}/>
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-text-primary tracking-tight">1-Call Close Engine</h2>
                        <p className="text-xs font-medium text-text-muted mt-0.5">Automated Lead Workflow</p>
                    </div>
                </div>
            </div>

            <div className="flex bg-surface-highlight border-b border-border-subtle shrink-0 relative z-10 w-full overflow-x-auto scrollbar-hide">
                <button 
                    onClick={() => setViewMode('recovery')}
                    className={`flex-1 overflow-hidden min-w-[70px] py-4 text-xs font-semibold transition-all relative ${viewMode === 'recovery' ? 'text-accent-secondary' : 'text-text-muted hover:text-text-primary'}`}
                >
                    <div className="flex flex-col items-center gap-1">
                        <span className="truncate w-full text-center px-1">Recovery</span>
                        <Badge status="High" className="bg-accent-secondary/10 text-accent-secondary border-indigo-500/30 px-2 py-0.5 mt-0.5 text-[10px] scale-90 md:scale-100">{recoveryList.length}</Badge>
                    </div>
                    {viewMode === 'recovery' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-t-full shadow-[0_-2px_10px_rgba(99,102,241,0.5)]" />}
                </button>
                <div className="w-px bg-border-subtle shrink-0" />
                <button 
                    onClick={() => setViewMode('callbacks')}
                    className={`flex-1 overflow-hidden min-w-[70px] py-4 text-xs font-semibold transition-all relative ${viewMode === 'callbacks' ? 'text-rose-500' : 'text-text-muted hover:text-text-primary'}`}
                >
                    <div className="flex flex-col items-center gap-1">
                        <span className="truncate w-full text-center px-1">Callbacks</span>
                        <Badge status="High" className="bg-rose-500/10 text-rose-500 border-rose-500/30 px-2 py-0.5 mt-0.5 text-[10px] scale-90 md:scale-100">{hotCallbacks.length}</Badge>
                    </div>
                    {viewMode === 'callbacks' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500 rounded-t-full shadow-[0_-2px_10px_rgba(244,63,94,0.5)]" />}
                </button>
                <div className="w-px bg-border-subtle" />
                <button 
                    onClick={() => setViewMode('reorder')}
                    className={`flex-1 overflow-hidden min-w-[70px] py-4 text-xs font-semibold transition-all relative ${viewMode === 'reorder' ? 'text-status-warning' : 'text-text-muted hover:text-text-primary'}`}
                >
                     <div className="flex flex-col items-center gap-1">
                        <span className="truncate w-full text-center px-1">Reorders</span>
                        <Badge status="Mid" className="bg-amber-500/10 text-status-warning border-status-warning/30 px-2 py-0.5 mt-0.5 text-[10px] scale-90 md:scale-100">{reorders.length}</Badge>
                    </div>
                    {viewMode === 'reorder' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 rounded-t-full shadow-[0_-2px_10px_rgba(245,158,11,0.5)]" />}
                </button>
                <div className="w-px bg-border-subtle" />
                <button 
                    onClick={() => setViewMode('inbound')}
                    className={`flex-1 overflow-hidden min-w-[70px] py-4 text-xs font-semibold transition-all relative ${viewMode === 'inbound' ? 'text-status-success' : 'text-text-muted hover:text-text-primary'}`}
                >
                     <div className="flex flex-col items-center gap-1">
                        <span className="truncate w-full text-center px-1">Inbound Queue</span>
                        <Badge status="Low" className="bg-emerald-500/10 text-status-success border-status-success/30 px-2 py-0.5 mt-0.5 text-[10px] scale-90 md:scale-100">{inbound.length}</Badge>
                    </div>
                    {viewMode === 'inbound' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-full shadow-[0_-2px_10px_rgba(16,185,129,0.5)]" />}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 relative z-10">
                {viewMode === 'recovery' && (
                    <>
                        {recoveryList.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-text-muted text-sm font-medium">No declined sales to recover.</div>
                        ) : (
                            recoveryList.map(r => (
                                <div key={r.id} className="p-3 bg-surface-alt border border-border-subtle rounded-xl flex items-center justify-between group hover:border-indigo-500/30 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer" onClick={() => handleCall(r)}>
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="p-2.5 bg-accent-secondary/10 text-accent-secondary rounded-xl">
                                            <ShieldAlert size={18} />
                                        </div>
                                        <div className="truncate">
                                            <p className="text-sm font-bold text-text-primary truncate">{r.customerName} &bull; ${r.amount}</p>
                                            <p className="text-xs text-text-muted flex items-center gap-1.5 mt-1 truncate">
                                                <Target size={12} className="shrink-0"/> <span className="truncate">{r.reason}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <Button variant="primary" className="px-3 md:px-4 py-2 bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20" onClick={(e) => { e.stopPropagation(); handleCall(r); }}>
                                            <Phone size={14} className="mr-1.5"/> Pitch
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </>
                )}

                {viewMode === 'callbacks' && (
                    <>
                        {hotCallbacks.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-text-muted text-sm font-medium">No pending callbacks.</div>
                        ) : (
                            hotCallbacks.map(c => (
                                <div key={c.id} className="p-3 bg-surface-alt border border-border-subtle rounded-xl flex items-center justify-between group hover:border-rose-500/30 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer" onClick={() => handleCall(c)}>
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl">
                                            <Clock size={18} />
                                        </div>
                                        <div className="truncate">
                                            <p className="text-sm font-bold text-text-primary truncate">{c.customerName}</p>
                                            <p className="text-xs text-text-muted flex items-center gap-1.5 mt-1 truncate">
                                                <Target size={12} className="shrink-0"/> <span className="truncate">{c.reason}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <button onClick={(e) => handleClearCallback(c.id, e)} className="p-2 text-text-muted hover:text-status-success bg-surface-main hover:bg-emerald-500/10 border border-border-subtle rounded-lg transition-colors shadow-sm">
                                            <CheckCircle size={16} />
                                        </button>
                                        <Button variant="primary" className="px-3 md:px-4 py-2" onClick={(e) => { e.stopPropagation(); handleCall(c); }}>
                                            <Phone size={14} className="mr-1.5"/> Dial
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </>
                )}

                {viewMode === 'reorder' && (
                    <>
                        {reorders.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-text-muted text-sm font-medium">No reorders needed today.</div>
                        ) : (
                            reorders.map(r => (
                                <div key={r.id} className="p-3 bg-surface-alt border border-border-subtle rounded-xl flex items-center justify-between group hover:border-status-warning/30 transition-all cursor-pointer hover:shadow-lg hover:-translate-y-0.5" onClick={() => handleCall(r)}>
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="p-2.5 bg-amber-500/10 text-status-warning rounded-xl">
                                            <Box size={18} />
                                        </div>
                                        <div className="truncate">
                                            <p className="text-sm font-bold text-text-primary truncate">{r.customerName}</p>
                                            <p className="text-xs text-text-muted flex items-center gap-1.5 mt-1 truncate">
                                                Supply Expiring &bull; LTV: ${r.amount}
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="secondary" className="px-3 md:px-4 py-2 hover:text-status-warning hover:border-status-warning/30 shrink-0" onClick={(e) => { e.stopPropagation(); handleCall(r); }}>
                                        <Phone size={14} className="mr-1.5"/> Pitch
                                    </Button>
                                </div>
                            ))
                        )}
                    </>
                )}

                {viewMode === 'inbound' && (
                    <>
                        {inbound.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-text-muted text-sm font-medium">Queue exhausted.</div>
                        ) : (
                            inbound.map(i => (
                                <div key={i.id} className="p-3 bg-surface-alt border border-border-subtle rounded-xl flex items-center justify-between group hover:border-status-success/30 transition-all cursor-pointer hover:shadow-lg hover:-translate-y-0.5" onClick={() => handleCall(i)}>
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="p-2.5 bg-emerald-500/10 text-status-success rounded-xl">
                                            <Phone size={18} />
                                        </div>
                                        <div className="truncate">
                                            <p className="text-sm font-bold text-text-primary truncate">{i.customerName}</p>
                                            <div className="text-xs font-mono text-text-muted mt-1 truncate" onClick={(e) => e.stopPropagation()}>
                                                {i.phone ? <MaskedData value={i.phone} type="phone" /> : 'No phone data'}
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="primary" className="px-3 md:px-4 py-2 shrink-0 bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" onClick={(e) => { e.stopPropagation(); handleCall(i); }}>
                                        <ArrowRight size={14} className="mr-1.5"/> 1-Call
                                    </Button>
                                </div>
                            ))
                        )}
                    </>
                )}
            </div>
        </Card>
    );
};
