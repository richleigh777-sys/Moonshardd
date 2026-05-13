import React, { useState, useMemo } from 'react';
import { Target, Phone, CheckCircle, Check, ArrowRight, Clock, Activity, FileText, Anchor } from 'lucide-react';
import { Card, Button, Badge } from '../ui/Base';
import { useCRM } from '../../hooks/useCRM';
import { useAuth } from '../../hooks/useAuth';
import { sfx } from '../../lib/soundService';

export const ActionCenter: React.FC<{ onEngage?: (data: any) => void }> = ({ onEngage }) => {
    const { notes, customers, sales, deleteNote } = useCRM();
    const { currentUser } = useAuth();
    const [viewMode, setViewMode] = useState<'focus' | 'list'>('focus');

    // Pipeline Engine: Analyze every customer and touchpoint for "Next Action"
    const activePipeline = useMemo(() => {
        if (!currentUser) return [];
        const now = Date.now();
        
        let actions: any[] = [];

        // 1. Scheduled Callbacks (Targeted Notes)
        const callNotes = notes.filter(n => n.type === 'callback' && n.agentId === currentUser.id);
        callNotes.forEach(n => {
            actions.push({
                id: `note-${n.id}`,
                customerId: n.customerName || 'Unknown',
                customerName: n.customerName || 'Unknown',
                phone: n.phone,
                type: 'URGENT_CALLBACK',
                urgency: 100,
                pipelineStage: 'Direct Engagement',
                lastTouch: n.timestamp,
                lastTouchDesc: 'Scheduled Callback',
                nextAction: 'Initiate Secure Comms',
                details: n.content || n.reason || 'Callback Required',
                icon: Phone,
                color: 'text-red-500',
                rawId: n.id
            });
        });

        // 2. Customer touchpoint analysis
        customers.forEach(customer => {
            const mySales = sales.filter(s => s.customer === customer.name);
            const myNotes = notes.filter(n => n.phone === customer.phone || n.customerName === customer.name);
            
            const lastSale = mySales.sort((a,b) => b.timestamp - a.timestamp)[0];
            const lastNote = myNotes.sort((a,b) => b.timestamp - a.timestamp)[0];

            let latestTouch = Math.max(lastSale?.timestamp || 0, lastNote?.timestamp || 0, customer.updatedAt || 0);
            
            const hoursSinceTouch = (now - latestTouch) / (1000 * 60 * 60);

            // Skip if recently touched (within 24 hours) and no specific call note exists
            if (latestTouch && hoursSinceTouch < 24) return;
            // Skip if we already have an explicit callback action for this customer
            if (actions.some(a => a.phone === customer.phone)) return;

            if (latestTouch === 0) {
                 // Never touched
                 actions.push({
                    id: `new-${customer.id}`,
                    customerId: customer.id,
                    customerName: customer.name,
                    phone: customer.phone,
                    type: 'COLD_START',
                    urgency: 40,
                    pipelineStage: 'Initial Outreach',
                    lastTouch: 0,
                    lastTouchDesc: 'No recorded interactions',
                    nextAction: 'Establish First Contact',
                    details: 'Needs initial pipeline assessment.',
                    icon: Target,
                    color: 'text-amber-500',
                    rawId: customer.id
                });
            } else if (lastSale && lastSale.status === 'Approved' && hoursSinceTouch > 168) { // over a week since sale
                 actions.push({
                    id: `post-sale-${customer.id}`,
                    customerId: customer.id,
                    customerName: customer.name,
                    phone: customer.phone,
                    type: 'POST_SALE_REVIEW',
                    urgency: 70,
                    pipelineStage: 'Retention / Upsell',
                    lastTouch: latestTouch,
                    lastTouchDesc: `Sale: ${lastSale.product}`,
                    nextAction: 'Check-in on Delivery/Satisfaction',
                    details: `Ensure smooth onboarding for ${lastSale.product}. Pitch cross-sell.`,
                    icon: Activity,
                    color: 'text-emerald-500',
                    rawId: customer.id
                });
            } else if (lastSale && lastSale.status === 'Declined' && hoursSinceTouch > 48) {
                actions.push({
                    id: `recovery-${customer.id}`,
                    customerId: customer.id,
                    customerName: customer.name,
                    phone: customer.phone,
                    type: 'RECOVERY_OP',
                    urgency: 85,
                    pipelineStage: 'Salvage Operation',
                    lastTouch: latestTouch,
                    lastTouchDesc: `Declined: ${lastSale.declineReason || 'Unknown'}`,
                    nextAction: 'Deploy Alternate Payment Solution',
                    details: `Previous deal stalled. Re-engage with salvage protocol.`,
                    icon: Anchor,
                    color: 'text-orange-500',
                    rawId: customer.id
                });
            } else if (hoursSinceTouch > 336) { // 2 weeks untouched
                actions.push({
                    id: `stale-${customer.id}`,
                    customerId: customer.id,
                    customerName: customer.name,
                    phone: customer.phone,
                    type: 'STALE_LEAD',
                    urgency: 50,
                    pipelineStage: 'Re-activation',
                    lastTouch: latestTouch,
                    lastTouchDesc: lastNote ? `Note: ${lastNote.type}` : 'System Edit',
                    nextAction: 'Warm Touchpoint Required',
                    details: 'Client has been dark for over 14 days. Re-establish presence.',
                    icon: Clock,
                    color: 'text-indigo-500',
                    rawId: customer.id
                });
            }
        });

        return actions.sort((a, b) => b.urgency - a.urgency).slice(0, 50); // Top 50 actions
    }, [notes, customers, sales, currentUser]);

    const heroTask = activePipeline[0];

    const handleAction = async (task: any, action: 'done' | 'call') => {
        if (action === 'done') {
            sfx.playSuccess();
            if (task.type === 'URGENT_CALLBACK') {
                await deleteNote(task.rawId);
            }
            // In a fuller implementation, 'done' would signify logging a new touchpoint
        } else if (action === 'call') {
            sfx.playSubmit();
            if (onEngage) onEngage(task);
        }
    };

    return (
        <Card variant="panel" className="h-full flex flex-col p-0 overflow-hidden bg-surface-main border-border-subtle shadow-soft relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
            
            <div className="p-4 md:p-5 border-b border-border-subtle/50 bg-surface-alt/50 flex flex-wrap gap-4 justify-between items-center shrink-0 relative z-10 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-accent-primary/10 rounded-xl text-accent-primary border border-accent-primary/20 shadow-sm">
                        <Activity size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="text-xs font-black uppercase text-text-primary tracking-widest leading-tight">Pipeline Intelligence</h3>
                        <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mt-0.5">{activePipeline.length} High-Value Next Actions</p>
                    </div>
                </div>
                
                <div className="flex bg-surface-main p-1 rounded-xl border border-border-subtle shadow-sm">
                    <button onClick={() => setViewMode('focus')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${viewMode === 'focus' ? 'bg-surface-highlight shadow-sm text-accent-primary' : 'text-text-muted hover:text-text-primary'}`}>Focus</button>
                    <button onClick={() => setViewMode('list')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${viewMode === 'list' ? 'bg-surface-highlight shadow-sm text-accent-primary' : 'text-text-muted hover:text-text-primary'}`}>Queue</button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative z-10 bg-surface-alt/10">
                {activePipeline.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-text-muted opacity-40">
                        <div className="p-6 rounded-[2rem] bg-surface-main mb-4 border border-border-subtle shadow-sm">
                            <CheckCircle size={40} className="text-emerald-500" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-text-secondary">Pipeline Cleared</p>
                        <p className="text-[9px] font-mono mt-2">All client touchpoints are current.</p>
                    </div>
                ) : viewMode === 'focus' && heroTask ? (
                    <div className="h-full p-4 md:p-8 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-surface-main border border-border-subtle rounded-[2.5rem] p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden group/card hover:border-accent-primary/40 transition-all duration-500">
                            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-accent-primary/5 rounded-full blur-[60px] group-hover/card:bg-accent-primary/15 transition-all duration-1000 pointer-events-none" />
                            
                            <div className="flex justify-between items-start relative z-10 gap-4">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Badge status={heroTask.urgency > 80 ? 'error' : heroTask.urgency > 60 ? 'warning' : 'info'} className="text-[9px]">
                                            {heroTask.pipelineStage}
                                        </Badge>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black text-text-primary tracking-tighter truncate leading-none mb-2">{heroTask.customerName}</h2>
                                    <p className="font-mono text-xs text-text-muted flex items-center gap-2"><Phone size={12}/> {heroTask.phone || 'No phone registered'}</p>
                                </div>
                                <div className={`p-4 rounded-2xl border flex-shrink-0 ${heroTask.urgency > 80 ? 'bg-status-error/10 text-status-error border-status-error/20' : 'bg-surface-alt/50 text-text-secondary border-border-subtle'}`}>
                                    <heroTask.icon size={24} strokeWidth={2} />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                                <div className="p-4 bg-surface-alt/30 rounded-2xl border border-border-subtle/50 h-full flex flex-col justify-center">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Clock size={10}/> Last Touchpoint</p>
                                    <p className="text-xs font-bold text-text-primary">{heroTask.lastTouchDesc}</p>
                                    <p className="text-[10px] font-mono text-text-muted mt-1">{heroTask.lastTouch > 0 ? new Date(heroTask.lastTouch).toLocaleString() : 'N/A'}</p>
                                </div>
                                <div className="p-4 bg-accent-primary/5 rounded-2xl border border-accent-primary/20 h-full flex flex-col justify-center">
                                    <p className="text-[9px] font-black text-accent-primary uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><ArrowRight size={10}/> Next Action Directive</p>
                                    <p className="text-sm font-black text-text-primary leading-tight">{heroTask.nextAction}</p>
                                </div>
                            </div>

                            <div className="p-4 bg-surface-main rounded-2xl border border-border-subtle relative z-10">
                                <p className="text-[10px] text-text-secondary leading-relaxed font-medium">{heroTask.details}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2 relative z-10">
                                <button onClick={() => handleAction(heroTask, 'done')} className="h-12 rounded-xl border border-border-subtle hover:bg-emerald-500/10 text-text-muted hover:text-emerald-500 hover:border-emerald-500/30 transition-all duration-300 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest group/btn">
                                    <Check size={16} strokeWidth={2.5} className="group-hover/btn:scale-110 transition-transform" /> Acknowledge
                                </button>
                                <Button variant="primary" onClick={() => handleAction(heroTask, 'call')} className="h-12 text-xs flex items-center justify-center font-black uppercase tracking-widest shadow-xl shadow-accent-primary/20 group/btn">
                                    Engage Client <ArrowRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full overflow-y-auto custom-scrollbar p-4 space-y-3">
                        {activePipeline.map((task) => (
                            <div key={task.id} className="p-4 rounded-2xl border border-border-subtle bg-surface-main hover:bg-surface-alt transition-all duration-300 group flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-accent-primary/30 shadow-sm relative overflow-hidden">
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${task.urgency > 80 ? 'bg-status-error' : task.urgency > 60 ? 'bg-status-warning' : 'bg-status-info'}`}></div>
                                
                                <div className="flex items-center gap-4 pl-2">
                                    <div className="w-10 h-10 rounded-xl bg-surface-highlight flex items-center justify-center shrink-0 border border-border-subtle group-hover:border-accent-primary/30 transition-colors">
                                        <task.icon size={16} className={task.color} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h4 className="text-sm font-black text-text-primary tracking-tight truncate">{task.customerName}</h4>
                                            {task.urgency > 80 && <span className="w-1.5 h-1.5 rounded-full bg-status-error animate-pulse"></span>}
                                        </div>
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-wider truncate flex items-center gap-1.5">
                                            <span className={task.color}>{task.pipelineStage}</span>
                                            <span className="opacity-50">&bull;</span> 
                                            {task.nextAction}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 pl-16 sm:pl-0">
                                    <div className="text-right hidden md:block mr-2">
                                        <p className="text-[9px] font-mono text-text-muted">Since Touch</p>
                                        <p className="text-[10px] font-bold text-text-secondary">{task.lastTouch > 0 ? Math.round((Date.now() - task.lastTouch) / 3600000) + 'h ago' : 'Never'}</p>
                                    </div>
                                    <button onClick={() => handleAction(task, 'call')} className="h-9 px-4 rounded-lg bg-surface-highlight hover:bg-accent-primary hover:text-white border border-border-subtle hover:border-accent-primary transition-all duration-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                        Action <ArrowRight size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
};