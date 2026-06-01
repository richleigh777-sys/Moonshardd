
import React, { useState, useMemo } from 'react';
import { Clock, User, StickyNote, ArrowUpRight, Sparkles, History, Info, Phone, Mail, ShoppingBag, TrendingUp, AlertTriangle, Plus, X, Tag, Target, CheckSquare } from 'lucide-react';
import { Note } from '../../types';
import { Button } from '../ui/Base';
import { getPhoneTime } from '../../views/utils/crmLogic';
import { sfx } from '../../lib/soundService';
import { LeadTimeline } from './LeadTimeline';
import { useCRM } from '../../hooks/useCRM';
import { useAuth } from '../../hooks/useAuth';
import { getCustomerStrategicBriefing, BriefingResponse } from '../../services/aiService';

interface LeadDetailProps {
    activeLead: Note | null;
    onMarkDone?: (id: string) => void;
    onEngage?: (lead: Note) => void;
}

type Tab = 'Briefing' | 'History' | 'Details';

export const LeadDetail: React.FC<LeadDetailProps> = ({ activeLead, onMarkDone, onEngage }) => {
    const { currentUser } = useAuth();
    const { callLogs, notes: rawNotes, customers, updateNote, sales } = useCRM();

    const allNotes = useMemo(() => {
        if (currentUser?.role === 'agent') {
            return rawNotes.filter(n => n.agentId === currentUser.id);
        }
        return rawNotes;
    }, [rawNotes, currentUser]);

    const leadPhone = activeLead?.phone;
    const recentTransactions = useMemo(() => {
        if (!leadPhone) return [];
        return sales
            .filter(s => s.phone === leadPhone)
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 3);
    }, [sales, leadPhone]);
    const [activeTab, setActiveTab] = useState<Tab>('Briefing');
    const [isGenerating, setIsGenerating] = useState(false);
    const [briefing, setBriefing] = useState<BriefingResponse | null>(null);
    const [newTag, setNewTag] = useState('');

    const customerProfile = useMemo(() => {
        if (!activeLead?.phone) return null;
        return customers.find(c => c.phone === activeLead.phone || (c.normalizedPhone && c.normalizedPhone === activeLead.phone)) || null;
    }, [activeLead, customers]);

    const handleGenerateBriefing = async () => {
        if (!activeLead) return;
        setIsGenerating(true);
        sfx.playProcessing();
        
        const historyData = [
            `Current Lead: ${activeLead.reason} - ${activeLead.content}`,
            ...allNotes.filter(n => n.phone === activeLead.phone).map(n => `Note [${new Date(n.timestamp).toLocaleDateString()}]: ${n.content}`),
            ...callLogs.filter(c => c.partnerId === activeLead.phone).map(c => `Call [${new Date(c.startTime).toLocaleDateString()}]: ${c.outcome} in ${c.type}`)
        ];

        const result = await getCustomerStrategicBriefing(activeLead.customerName || 'Prospect', historyData);
        setBriefing(result);
        setIsGenerating(false);
        sfx.playSuccess();
    };

    const handleAddTag = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeLead || !newTag.trim()) return;
        const currentTags = activeLead.tags || [];
        if (!currentTags.includes(newTag.trim())) {
            await updateNote(activeLead.id, { tags: [...currentTags, newTag.trim()] });
            setNewTag('');
            sfx.playConfirm();
        }
    };

    const handleRemoveTag = async (tagName: string) => {
        if (!activeLead) return;
        const currentTags = activeLead.tags || [];
        await updateNote(activeLead.id, { tags: currentTags.filter(t => t !== tagName) });
        sfx.playTrash();
    };

    const handleEngage = () => {
        if (!activeLead) return;
        // Tracking Performance: Response started
        if (!activeLead.contactInitAt) {
            updateNote(activeLead.id, { contactInitAt: Date.now(), status: 'Active' });
        }
        if (onEngage) {
            sfx.playSubmit();
            onEngage(activeLead);
        }
    };

    const handleResolve = async () => {
        if (!activeLead) return;
        await updateNote(activeLead.id, { 
            status: 'Resolved',
            resolvedAt: Date.now()
        });
        sfx.playSuccess();
        if (onMarkDone) onMarkDone(activeLead.id);
    };

    if (!activeLead) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-text-muted opacity-40">
                <Target size={48} strokeWidth={1} className="mb-4" />
                <p className="text-xs font-[700]  tracking-[0.3em]">Select an objective from Nexus</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-surface-main relative">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                <div className="max-w-3xl mx-auto space-y-8">
                    
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-blue-600 flex items-center justify-center text-white font-[700] text-2xl shadow-xl ring-4 ring-indigo-500/10">
                                    {activeLead.customerName?.charAt(0) || '?'}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-[700] text-text-primary  tracking-tight leading-none">{activeLead.customerName}</h2>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs font-bold text-text-muted  bg-surface-alt px-2.5 py-1 rounded-full border border-border-subtle flex items-center gap-1.5">
                                            <Clock size={16} className="text-accent-primary"/> Due: {activeLead.date} @ {activeLead.time}
                                        </span>
                                        <span className="text-xs font-bold text-status-success  bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                                            <User size={16}/> {getPhoneTime(activeLead.phone || '')} Local
                                        </span>
                                        {activeLead.status && (
                                            <span className={`text-xs font-bold  px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                                                activeLead.status === 'Resolved' ? 'bg-emerald-500/10 text-status-success border-emerald-500/20' :
                                                activeLead.status === 'Active' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                'bg-surface-alt text-text-muted border-border-subtle'
                                            }`}>
                                                {activeLead.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-mono font-[700] text-text-primary tracking-wider">{activeLead.phone}</div>
                        </div>
                    </div>

                    {/* Recent Transactions Contextual Banner */}
                    {recentTransactions.length > 0 && (
                        <div className="bg-surface-alt/40 border border-border-subtle rounded-3xl p-5 mb-8">
                            <p className="text-xs font-[700] text-text-muted tracking-widest mb-4 flex items-center gap-2">
                                <ShoppingBag size={16}/> LAST 3 TRANSACTIONS
                            </p>
                            <div className="grid gap-3">
                                {recentTransactions.map((tx, idx) => (
                                    <div key={idx} className="bg-surface-main border border-border-subtle rounded-2xl p-4 flex items-center justify-between gap-4 transition-colors hover:border-text-muted/30">
                                        <div>
                                            <div className="flex items-center gap-2.5 mb-1.5">
                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-widest font-bold ${
                                                    tx.status === 'Approved' ? 'bg-status-success/15 text-status-success border border-status-success/30' :
                                                    tx.status === 'Declined' ? 'bg-status-error/15 text-status-error border border-status-error/30' :
                                                    'bg-status-warning/15 text-status-warning border border-status-warning/30'
                                                }`}>
                                                    {tx.status}
                                                </span>
                                                <span className="text-xs font-bold text-text-primary">{new Date(tx.timestamp).toLocaleDateString()}</span>
                                                <span className="text-[10px] text-text-muted font-bold tracking-widest uppercase break-all">Agent #{tx.agentId} • {tx.product}</span>
                                            </div>
                                            {(tx.status === 'Approved' && tx.deliveryStatus) && (
                                                <p className="text-xs text-text-secondary mt-1 font-medium flex items-center gap-1.5">
                                                    Package Status: <span className="font-bold text-emerald-400">{tx.deliveryStatus}</span>
                                                </p>
                                            )}
                                            {(tx.status === 'Declined' && tx.declineReason) && (
                                                <p className="text-xs text-text-secondary mt-1 font-medium flex items-center gap-1.5 line-clamp-1">
                                                    Decline Reason: <span className="font-bold text-rose-400">{tx.declineReason}</span>
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="text-sm font-bold text-text-primary font-mono">${tx.amount.toFixed(2)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Navigation Tabs */}
                    <div className="flex gap-1 p-1 bg-surface-alt rounded-2xl border border-border-subtle max-w-fit">
                        {(['Briefing', 'History', 'Details'] as Tab[]).map(tab => (
                            <button
                                key={tab}
                                onClick={() => { setActiveTab(tab); sfx.playClick(); }}
                                className={`px-6 py-2 rounded-xl text-xs font-[700]  tracking-widest transition-all ${
                                    activeTab === tab ? 'bg-surface-main text-text-primary shadow-sm border border-border-subtle' : 'text-text-muted hover:text-text-primary'
                                }`}
                            >
                                {tab === 'Briefing' && <Sparkles size={16} className="inline mr-2 -mt-0.5" />}
                                {tab === 'History' && <History size={16} className="inline mr-2 -mt-0.5" />}
                                {tab === 'Details' && <Info size={16} className="inline mr-2 -mt-0.5" />}
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="min-h-[400px]">
                        {activeTab === 'Briefing' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {!briefing && !isGenerating && (
                                    <div className="p-12 border-2 border-dashed border-border-subtle rounded-[32px] text-center space-y-4">
                                        <div className="w-16 h-16 bg-accent-primary/10 rounded-3xl flex items-center justify-center mx-auto text-accent-primary">
                                            <Sparkles size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-[700] text-text-primary  tracking-tight">Intelligence Briefing</h3>
                                            <p className="text-xs text-text-muted font-medium mt-1">Generate a strategic summary of this relationship using AI.</p>
                                        </div>
                                        <Button 
                                            onClick={handleGenerateBriefing}
                                            className="h-12 px-8 bg-text-primary text-surface-main hover:bg-text-secondary rounded-xl font-[700]  text-xs tracking-widest"
                                        >
                                            Synthesize Intelligence
                                        </Button>
                                    </div>
                                )}

                                {isGenerating && (
                                    <div className="p-12 text-center space-y-6">
                                        <div className="relative w-20 h-20 mx-auto">
                                            <div className="absolute inset-0 border-4 border-accent-primary/20 rounded-full"></div>
                                            <div className="absolute inset-0 border-4 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
                                            <Sparkles size={24} className="absolute inset-0 m-auto text-accent-primary animate-pulse" />
                                        </div>
                                        <div className="animate-pulse">
                                            <p className="text-xs font-[700]  tracking-[0.3em] text-text-primary">Scanning Nexus Logs</p>
                                            <p className="text-xs font-bold text-text-muted mt-2">Deducing behavioral patterns and sentiment...</p>
                                        </div>
                                    </div>
                                )}

                                {briefing && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="p-5 bg-surface-alt/40 border border-border-subtle rounded-3xl relative overflow-hidden group">
                                                <TrendingUp size={48} className="absolute -right-4 -bottom-4 text-text-primary/5 group-hover:scale-110 transition-transform" />
                                                <p className="text-xs font-[700] text-text-muted  tracking-widest mb-2">Sentiment</p>
                                                <p className={`text-xl font-[700]  ${
                                                    briefing.sentiment === 'Positive' ? 'text-status-success' :
                                                    briefing.sentiment === 'Frustrated' ? 'text-status-error' : 'text-status-warning'
                                                }`}>
                                                    {briefing.sentiment}
                                                </p>
                                            </div>
                                            <div className="p-5 bg-surface-alt/40 border border-border-subtle rounded-3xl col-span-2">
                                                <p className="text-xs font-[700] text-text-muted  tracking-widest mb-2">Primary Themes</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {briefing.keyThemes.map((t, i) => (
                                                        <span key={i} className="px-3 py-1 bg-surface-main border border-border-subtle rounded-lg text-xs font-bold  text-text-primary">
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-gradient-to-br from-surface-alt to-surface-main border border-border-subtle rounded-[32px] shadow-sm">
                                            <p className="text-xs font-[700] text-accent-primary  tracking-widest mb-3 flex items-center gap-2">
                                                <Sparkles size={16}/> Executive Summary
                                            </p>
                                            <p className="text-sm font-medium text-text-primary leading-relaxed italic">
                                                "{briefing.summary}"
                                            </p>
                                        </div>

                                        <div className="p-6 bg-indigo-500/5 border border-accent-secondary/20 rounded-[32px] ring-1 ring-indigo-500/10">
                                            <p className="text-xs font-[700] text-accent-secondary  tracking-widest mb-3 flex items-center gap-2">
                                                <AlertTriangle size={16}/> Strategic Recommendation
                                            </p>
                                            <p className="text-sm font-bold text-text-primary">
                                                {briefing.recommendation}
                                            </p>
                                        </div>
                                        
                                        <button 
                                            onClick={() => setBriefing(null)} 
                                            className="text-xs font-[700] text-text-muted  tracking-widest hover:text-text-primary transition-colors flex items-center gap-2 mx-auto"
                                        >
                                            <History size={16}/> Refresh Analysis
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'History' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <LeadTimeline 
                                    notes={allNotes} 
                                    callLogs={callLogs} 
                                    phone={activeLead.phone} 
                                />
                            </div>
                        )}

                        {activeTab === 'Details' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Core Data */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 bg-surface-alt/40 border border-border-subtle rounded-3xl">
                                        <p className="text-xs font-[700] text-text-muted  tracking-widest mb-4">Identity Details</p>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-surface-main rounded-xl border border-border-subtle"><Mail size={16} className="text-text-muted"/></div>
                                                <div>
                                                    <p className="text-xs font-[700] text-text-muted ">Email Address</p>
                                                    <p className="text-xs font-bold text-text-primary">{customerProfile?.email || 'Not Provided'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-surface-main rounded-xl border border-border-subtle"><Phone size={16} className="text-text-muted"/></div>
                                                <div>
                                                    <p className="text-xs font-[700] text-text-muted ">Primary Phone</p>
                                                    <p className="text-xs font-bold text-text-primary">{activeLead.phone}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-5 bg-surface-alt/40 border border-border-subtle rounded-3xl">
                                        <p className="text-xs font-[700] text-text-muted  tracking-widest mb-4">Commercial Profile</p>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-surface-main rounded-xl border border-border-subtle"><ShoppingBag size={16} className="text-text-muted"/></div>
                                                    <div>
                                                        <p className="text-xs font-[700] text-text-muted ">Lifetime Orders</p>
                                                        <p className="text-xs font-bold text-text-primary">{customerProfile?.orderCount || 0}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-[700] text-text-muted ">LTV</p>
                                                    <p className="text-xs font-bold text-status-success">${(customerProfile?.ltv || 0).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            {customerProfile?.lastOrderDate && (
                                                <div className="pt-2 border-t border-border-subtle/50">
                                                    <p className="text-xs font-[700] text-text-muted  mb-1">Last Transaction</p>
                                                    <p className="text-xs font-bold text-text-primary">{new Date(customerProfile.lastOrderDate).toLocaleDateString()}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Registry Analysis */}
                                <div className="p-6 bg-surface-alt/40 border border-border-subtle rounded-3xl space-y-4 shadow-sm">
                                    <div className="flex items-center gap-2 pb-2 border-b border-border-subtle/50">
                                        <StickyNote size={16} className="text-accent-primary"/>
                                        <span className="text-xs font-[700]  text-text-muted tracking-widest">Lead Intelligence</span>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="bg-surface-main p-4 rounded-2xl border border-border-subtle">
                                            <p className="text-xs font-bold text-text-muted  mb-1">Callback Reason</p>
                                            <p className="text-sm font-bold text-text-primary">{activeLead.reason}</p>
                                        </div>
                                        <div className="bg-surface-main p-4 rounded-2xl border border-border-subtle">
                                            <p className="text-xs font-bold text-text-muted  mb-1">Raw Context Log</p>
                                            <p className="text-sm font-medium text-text-secondary leading-relaxed italic">"{activeLead.content.split('|')[1]?.trim() || activeLead.content}"</p>
                                        </div>
                                    </div>
                                    
                                    {activeLead.medicalConditions && activeLead.medicalConditions.length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {activeLead.medicalConditions.map(c => (
                                                <span key={c} className="px-3 py-1 bg-surface-main border border-border-subtle rounded-lg text-xs font-bold  text-text-secondary shadow-sm">
                                                    {c}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {/* Tagging System */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-6 bg-surface-alt/40 border border-border-subtle rounded-3xl space-y-4 shadow-sm">
                                            <div className="flex items-center justify-between pb-2 border-b border-border-subtle/50">
                                                <div className="flex items-center gap-2">
                                                    <Tag size={16} className="text-accent-primary"/>
                                                    <span className="text-xs font-[700]  text-text-muted tracking-widest">Metadata Tags</span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-2 min-h-[32px]">
                                                {activeLead.tags?.map(tag => (
                                                    <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-surface-main border border-border-subtle rounded-xl text-xs font-bold  text-text-secondary group/tag overflow-hidden">
                                                        {tag}
                                                        <button onClick={() => handleRemoveTag(tag)} className="p-0.5 hover:bg-surface-alt rounded opacity-0 group-hover/tag:opacity-100 transition-opacity">
                                                            <X size={16} />
                                                        </button>
                                                    </span>
                                                ))}
                                                {(!activeLead.tags || activeLead.tags.length === 0) && (
                                                    <p className="text-xs font-medium text-text-muted italic py-1">No tags assigned</p>
                                                )}
                                            </div>

                                            <form onSubmit={handleAddTag} className="flex gap-2">
                                                <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                                    type="text" 
                                                    value={newTag}
                                                    onChange={e => setNewTag(e.target.value)}
                                                    placeholder="Add tag..." 
                                                    className="flex-1 h-10 px-4 bg-surface-main border border-border-subtle rounded-xl text-xs font-bold placeholder:opacity-50 focus:border-accent-primary transition-colors outline-none"
                                                />
                                                <button type="submit" className="w-10 h-10 bg-surface-main border border-border-subtle rounded-xl flex items-center justify-center hover:bg-surface-alt transition-colors">
                                                    <Plus size={16} className="text-text-primary" />
                                                </button>
                                            </form>
                                        </div>

                                        <div className="p-6 bg-surface-alt/40 border border-border-subtle rounded-3xl space-y-4 shadow-sm">
                                            <div className="flex items-center justify-between pb-2 border-b border-border-subtle/50">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={16} className="text-status-warning"/>
                                                    <span className="text-xs font-[700]  text-text-muted tracking-widest">Follow-up Reminder</span>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {activeLead.reminderAt ? (
                                                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-amber-500/20 rounded-lg text-status-warning"><Clock size={16}/></div>
                                                            <div>
                                                                <p className="text-xs font-[700] text-status-warning  tracking-widest">Active Reminder</p>
                                                                <p className="text-xs font-bold text-text-primary">{new Date(activeLead.reminderAt).toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={async () => {
                                                                await updateNote(activeLead.id, { reminderAt: undefined, reminderDismissed: true });
                                                                sfx.playTrash();
                                                            }}
                                                            className="p-2 hover:bg-amber-500/20 rounded-xl text-amber-600 transition-colors"
                                                        >
                                                            <X size={16}/>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {[
                                                            { label: '30m', val: 30 * 60 * 1000 },
                                                            { label: '1h', val: 60 * 60 * 1000 },
                                                            { label: '4h', val: 4 * 60 * 60 * 1000 },
                                                            { label: '24h', val: 24 * 60 * 60 * 1000 }
                                                        ].map(opt => (
                                                            <button 
                                                                key={opt.label}
                                                                onClick={async () => {
                                                                    await updateNote(activeLead.id, { reminderAt: Date.now() + opt.val, reminderDismissed: false });
                                                                    sfx.playConfirm();
                                                                }}
                                                                className="py-2 bg-surface-main border border-border-subtle rounded-xl text-xs font-[700]  text-text-muted hover:text-accent-primary hover:border-accent-primary transition-all"
                                                            >
                                                                +{opt.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                                <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                                    type="datetime-local" 
                                                    onChange={async (e) => {
                                                        const val = new Date(e.target.value).getTime();
                                                        if (val > 0) {
                                                            await updateNote(activeLead.id, { reminderAt: val, reminderDismissed: false });
                                                            sfx.playConfirm();
                                                        }
                                                    }}
                                                    className="w-full h-10 px-4 bg-surface-main border border-border-subtle rounded-xl text-xs font-[700]  text-text-primary outline-none focus:border-accent-primary transition-colors cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Action Bar */}
            <div className="p-6 border-t border-border-subtle bg-surface-alt/20 backdrop-blur-md flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Button 
                        variant="secondary" 
                        onClick={() => onMarkDone && onMarkDone(activeLead.id)} 
                        className="h-14 px-6 text-text-muted hover:text-status-error transition-all"
                    >
                        Archive
                    </Button>
                    <Button 
                        variant="secondary" 
                        onClick={handleResolve} 
                        disabled={activeLead.status === 'Resolved'}
                        className={`h-14 px-6 transition-all gap-2 ${
                            activeLead.status === 'Resolved' ? 'text-status-success bg-emerald-500/5' : 'text-status-success hover:bg-emerald-500/10'
                        }`}
                    >
                        <CheckSquare size={16} /> {activeLead.status === 'Resolved' ? 'Mission Resolved' : 'Mark Resolved'}
                    </Button>
                </div>
                
                <Button 
                    variant="primary" 
                    onClick={handleEngage} 
                    className="h-14 px-10 text-xs font-[700]  tracking-[0.2em] shadow-xl shadow-accent-primary/20 bg-accent-primary hover:brightness-110 rounded-2xl flex items-center gap-3 group transition-all"
                >
                    Initialize Connection <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
            </div>
        </div>
    );
};
