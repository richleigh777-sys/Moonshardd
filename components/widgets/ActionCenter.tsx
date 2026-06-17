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
    const [viewMode, setViewMode] = useState<'callbacks' | 'reorder' | 'inbound' | 'recovery' | 'upsell' | 'winback'>('callbacks');

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
                time: n.timestamp || Date.now(), 
                reason: n.content || n.reason || 'Requested Callback',
                priority: n.priority || 'Mid'
            }))
            .sort((a,b) => {
                const now = Date.now();
                const aDiff = a.time - now;
                const bDiff = b.time - now;
                
                const aDueOrOverdue = aDiff <= 900000; // 15 mins window
                const bDueOrOverdue = bDiff <= 900000;
                
                if (aDueOrOverdue && !bDueOrOverdue) return -1;
                if (!aDueOrOverdue && bDueOrOverdue) return 1;

                // Priority mapping
                const pMap: Record<string, number> = { 'High': 1, 'Mid': 2, 'Low': 3 };
                const aPri = pMap[a.priority as string] || 2;
                const bPri = pMap[b.priority as string] || 2;

                if (aPri !== bPri) return aPri - bPri;
                return a.time - b.time;
            });
    }, [notes, currentUser]);

    // 2. Ready for Reorder (Based on nextActionType OR Sales algorithm)
    const reorders = useMemo(() => {
        if (!currentUser) return [];
        // Mix closed sales metrics with direct customer CRM assignments
        const mySales = sales.filter(s => s.agentId === currentUser.id && s.status === 'Approved');
        
        const mappedSales = mySales.map(s => {
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
        }).filter(r => r.daysUntil <= 7 && r.daysUntil >= -30);

        // Include CRM triggered reorders
        const directReorders = customers
            .filter(c => c.assignedTo === currentUser.id && c.nextActionType === 'Reorder' && (c.nextActionDate || 0) <= now)
            .map(c => ({
                id: c.id,
                customerName: c.name,
                product: c.lastProductsPurchased?.join(', ') || 'Unknown',
                phone: c.phone,
                reorderDate: c.nextActionDate || now,
                daysUntil: 0,
                amount: 0
            }));
            
        return [...mappedSales, ...directReorders].sort((a,b) => a.daysUntil - b.daysUntil);
    }, [sales, customers, currentUser, now]);

    // 2.5 Upsells (Day 1 post-sale)
    const upsells = useMemo(() => {
        if (!currentUser) return [];
        return customers
            .filter(c => c.assignedTo === currentUser.id && c.nextActionType === 'Upsell' && (c.nextActionDate || 0) <= now)
            .map(c => ({
                id: c.id,
                customerName: c.name,
                phone: c.phone,
                time: c.nextActionDate || now,
                product: c.lastProductsPurchased?.join(', '),
                reason: '24h Feedback & Cross-sell'
            }))
            .sort((a,b) => a.time - b.time);
    }, [customers, currentUser, now]);

    // 2.6 Winbacks (90+ Days)
    const winbacks = useMemo(() => {
        if (!currentUser) return [];
        return customers
            .filter(c => c.assignedTo === currentUser.id && c.nextActionType === 'Winback' && (c.nextActionDate || 0) <= now)
            .map(c => ({
                id: c.id,
                customerName: c.name,
                phone: c.phone,
                time: c.nextActionDate || now,
                reason: '90+ Days Cold Winback'
            }))
            .sort((a,b) => a.time - b.time);
    }, [customers, currentUser, now]);

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

    const handleCall = (person: any, actionType?: string) => {
        sfx.playSubmit();
        
        // Enhance with action context to trigger the SmartPitch overlay
        window.dispatchEvent(new CustomEvent('SMART_PITCH', {
            detail: {
                ...person,
                actionContext: actionType || viewMode,
            }
        }));

        if (onEngage) onEngage(person);
    };

    const handleClearCallback = async (noteId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        sfx.playSuccess();
        await deleteNote(noteId);
    };

    return (
        <Card variant="panel" className="h-[300px] flex flex-col bg-surface-main border-border-subtle overflow-hidden relative group">
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
                    onClick={() => setViewMode('upsell')}
                    className={`flex-1 overflow-hidden min-w-[70px] py-4 text-xs font-semibold transition-all relative ${viewMode === 'upsell' ? 'text-amber-500' : 'text-text-muted hover:text-text-primary'}`}
                >
                     <div className="flex flex-col items-center gap-1">
                        <span className="truncate w-full text-center px-1">Upsell / QA</span>
                        <Badge status="Mid" className="bg-amber-500/10 text-amber-500 border-amber-500/30 px-2 py-0.5 mt-0.5 text-[10px] scale-90 md:scale-100">{upsells.length}</Badge>
                    </div>
                    {viewMode === 'upsell' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 rounded-t-full shadow-[0_-2px_10px_rgba(245,158,11,0.5)]" />}
                </button>
                <div className="w-px bg-border-subtle shrink-0" />
                <button 
                    onClick={() => setViewMode('reorder')}
                    className={`flex-1 overflow-hidden min-w-[70px] py-4 text-xs font-semibold transition-all relative ${viewMode === 'reorder' ? 'text-emerald-500' : 'text-text-muted hover:text-text-primary'}`}
                >
                     <div className="flex flex-col items-center gap-1">
                        <span className="truncate w-full text-center px-1">Reorders</span>
                        <Badge status="Mid" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 px-2 py-0.5 mt-0.5 text-[10px] scale-90 md:scale-100">{reorders.length}</Badge>
                    </div>
                    {viewMode === 'reorder' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-full shadow-[0_-2px_10px_rgba(16,185,129,0.5)]" />}
                </button>
                <div className="w-px bg-border-subtle shrinkage" />
                <button 
                    onClick={() => setViewMode('winback')}
                    className={`flex-1 overflow-hidden min-w-[70px] py-4 text-xs font-semibold transition-all relative ${viewMode === 'winback' ? 'text-purple-500' : 'text-text-muted hover:text-text-primary'}`}
                >
                     <div className="flex flex-col items-center gap-1">
                        <span className="truncate w-full text-center px-1">Winback</span>
                        <Badge status="Low" className="bg-purple-500/10 text-purple-500 border-purple-500/30 px-2 py-0.5 mt-0.5 text-[10px] scale-90 md:scale-100">{winbacks.length}</Badge>
                    </div>
                    {viewMode === 'winback' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500 rounded-t-full shadow-[0_-2px_10px_rgba(168,85,247,0.5)]" />}
                </button>
                <div className="w-px bg-border-subtle" />
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
                                        <div className={`p-2.5 rounded-xl ${c.priority === 'High' ? 'bg-rose-500/20 text-rose-500' : c.priority === 'Low' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-status-warning/10 text-status-warning'}`}>
                                            <Clock size={18} />
                                        </div>
                                        <div className="truncate">
                                            <p className="text-sm font-bold text-text-primary flex items-center gap-2 truncate">
                                                {c.customerName}
                                                <Badge status={c.priority} className="text-[9px] px-1.5 py-0 scale-90" />
                                            </p>
                                            <p className="text-xs text-text-muted flex items-center gap-1.5 mt-1 truncate">
                                                <Target size={12} className="shrink-0"/> <span className="truncate">{c.reason.split(' | ')[0] || c.reason}</span>
                                                <span className="text-text-secondary ml-1">• {new Date(c.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
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

                {viewMode === 'upsell' && (
                    <>
                        {upsells.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-text-muted text-sm font-medium">No active upsell cycles.</div>
                        ) : (
                            upsells.map(u => (
                                <div key={u.id} className="p-3 bg-surface-alt border border-border-subtle rounded-xl flex items-center justify-between group hover:border-amber-500/30 transition-all cursor-pointer hover:shadow-lg hover:-translate-y-0.5" onClick={() => handleCall(u)}>
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
                                            <Target size={18} />
                                        </div>
                                        <div className="truncate">
                                            <p className="text-sm font-bold text-text-primary truncate">{u.customerName}</p>
                                            <p className="text-xs text-text-muted flex items-center gap-1.5 mt-1 truncate">
                                                {u.product ? `Bought: ${u.product.split(',')[0]} • ` : ''} {u.reason}
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="primary" className="px-3 md:px-4 py-2 bg-amber-500 hover:bg-amber-600 shadow-amber-500/20 text-white" onClick={(e) => { e.stopPropagation(); handleCall(u); }}>
                                        <Phone size={14} className="mr-1.5"/> Pitch
                                    </Button>
                                </div>
                            ))
                        )}
                    </>
                )}

                {viewMode === 'winback' && (
                    <>
                        {winbacks.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-text-muted text-sm font-medium">No winbacks due today.</div>
                        ) : (
                            winbacks.map(w => (
                                <div key={w.id} className="p-3 bg-surface-alt border border-border-subtle rounded-xl flex items-center justify-between group hover:border-purple-500/30 transition-all cursor-pointer hover:shadow-lg hover:-translate-y-0.5" onClick={() => handleCall(w)}>
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-xl">
                                            <Target size={18} />
                                        </div>
                                        <div className="truncate">
                                            <p className="text-sm font-bold text-text-primary truncate">{w.customerName}</p>
                                            <p className="text-xs text-text-muted flex items-center gap-1.5 mt-1 truncate">
                                                {w.reason}
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="primary" className="px-3 md:px-4 py-2 bg-purple-500 hover:bg-purple-600 shadow-purple-500/20 text-white" onClick={(e) => { e.stopPropagation(); handleCall(w); }}>
                                        <Phone size={14} className="mr-1.5"/> Pitch
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
