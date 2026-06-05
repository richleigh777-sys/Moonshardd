
import React, { useState, useEffect, useMemo } from 'react';
import { 
    ShieldCheck, Heart, AlertTriangle, Clock, Activity, 
    Calendar, X, Archive, CheckCircle, HelpCircle, Network
} from 'lucide-react';
import { Sale, ObjectionType } from '../../types';
import { RESCUE_SCRIPTS as DEFAULT_SCRIPTS, OBJECTION_METADATA } from '../../constants';
import { Button, Card } from '../ui/Base';
import { sfx } from '../../lib/soundService';
import { useCRM } from '../../hooks/useCRM';
import { CallbackForm } from '../forms/CallbackForm';
import { useSystem } from '../../hooks/useSystem';
import { MaskedData } from '../ui/MaskedData';

interface Props {
  sales: Sale[];
  onAction: (sale: Sale, action: string) => void;
}

// --- LOGIC HOOK ---
const useRecoveryLogic = (sales: Sale[]) => {
    const [now] = useState(() => Date.now());
    return useMemo(() => {
        return sales
            .filter(s => s.status === 'Declined' || s.status === 'Rescue In Progress')
            .map(s => {
                const timeDiff = now - (s.declineTimestamp || s.timestamp);
                const hoursOld = timeDiff / (1000 * 60 * 60);
                
                // Calculate Win Probability
                let probability = 100;
                probability -= (hoursOld * 0.5); 
                if (s.amount > 500) probability += 10; 
                if (s.amount < 100) probability -= 10; 
                if (s.adminLabel === 'High Risk') probability -= 40;
                
                return { 
                    ...s, 
                    metrics: {
                        hoursOld,
                        probability: Math.max(0, Math.min(99, Math.round(probability)))
                    }
                };
            })
            .sort((a, b) => b.metrics.probability - a.metrics.probability);
    }, [sales, now]);
};

export const RecoveryEngine = ({ sales, onAction }: Props) => {
  const { scripts, addNote, currentUser, logScriptUsage } = useCRM();
  const { setToast } = useSystem();
  
  const [viewMode, setViewMode] = useState<'console' | 'schedule'>('console');
  const [activeObjection, setActiveObjection] = useState<ObjectionType | null>(null);
  const [showLogicGuide, setShowLogicGuide] = useState(false);
  
  const rescueOps = useRecoveryLogic(sales);
  
  const [selectedOpId, setSelectedOpId] = useState<string | null>(null);
  const [dismissId, setDismissId] = useState<string | null>(null);

  // Auto-select first item
  useEffect(() => {
      if (rescueOps.length > 0 && !selectedOpId) {
          setTimeout(() => setSelectedOpId(rescueOps[0].id), 0);
      }
  }, [rescueOps, selectedOpId]);

  const activeOp = useMemo(() => rescueOps.find(op => op.id === selectedOpId), [rescueOps, selectedOpId]);

  // Determine which script to show
  const activeScript = useMemo(() => {
      if (!activeOp) return null;
      const reason = activeObjection || activeOp.declineReason || activeOp.objectionType || 'Bank Security Hold';
      const lastName = (activeOp.customer || 'Customer').split(' ').pop();
      
      const found = scripts.find(s => s.title.toLowerCase().includes(reason.toLowerCase()));
      const rawContent = found ? found.content : (DEFAULT_SCRIPTS[reason] || DEFAULT_SCRIPTS['Bank Security Hold']);
      
      const scriptText = rawContent.replace('[Name]', `Mr./Ms. ${lastName}`);
      const parts = scriptText.split('<br/><br/>');
      
      return {
          reason,
          scriptId: found?.id,
          hook: parts[0] || "<b>[Partner]:</b> Connecting...",
          fix: parts[1] || "<b>[Solution]:</b> Stand by...",
          isFresh: activeOp.metrics.probability > 80
      };
  }, [activeOp, scripts, activeObjection]);

  const handleScheduleSubmit = async (note: any) => {
      await addNote(note);
      setToast({ title: 'Recovery', message: "Care Call Scheduled", type: 'success' });
      setViewMode('console');
      if (activeOp && activeOp.status !== 'Rescue In Progress') {
          onAction(activeOp, 'resurrect');
      }
  };

  if (rescueOps.length === 0) {
      return (
        <Card variant="panel" className="h-full flex flex-col items-center justify-center p-8 opacity-50 border-dashed border-border-subtle bg-surface-alt/10">
            <div className="w-20 h-20 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20 shadow-sm">
                <CheckCircle size={40} className="text-status-success" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-[700] text-text-primary  tracking-[0.25em]">Peace of Mind</h3>
            <p className="text-text-muted text-xs font-bold  mt-1">Everyone is looked after.</p>
        </Card>
      );
  }

  return (
    <Card variant="panel" className="flex flex-col h-full overflow-hidden p-0 relative border-border-subtle bg-surface-main">
        <div className="flex h-full">
            
            {/* LEFT SIDEBAR: LIST */}
            <div className="w-96 border-r border-border-subtle flex flex-col bg-surface-alt/10 shrink-0">
                <div className="p-5 border-b border-border-subtle bg-surface-main/20 backdrop-blur-md sticky top-0 z-10 flex justify-between items-center">
                    <div>
                        <h3 className="text-sm font-[700]  text-accent-primary tracking-widest flex items-center gap-2">
                            <Heart size={16} className="animate-pulse" fill="currentColor" /> Customer Care
                        </h3>
                        <p className="text-xs font-bold text-text-muted  tracking-wider mt-0.5">{rescueOps.length} Need Support</p>
                    </div>
                    <button
                        onClick={() => { setShowLogicGuide(true); sfx.playClick(); }}
                        className="p-2 hover:bg-surface-alt rounded-xl text-border-strong hover:text-accent-secondary transition-colors"
                        title="CRM Routing & Lead Judgment Rules"
                    >
                        <HelpCircle size={18} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {rescueOps.map(op => {
                        const isSelected = op.id === selectedOpId;
                        const isFresh = op.metrics.probability > 80;
                        return (
                            <button
                                key={op.id}
                                onClick={() => { setSelectedOpId(op.id); sfx.playClick(); setViewMode('console'); }}
                                className={`w-full text-left p-4 border-b border-border-subtle/50 transition-all hover:bg-surface-alt group relative ${isSelected ? 'bg-surface-main border-l-4 border-l-accent-primary shadow-inner' : 'border-l-4 border-l-transparent opacity-70 hover:opacity-100'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="min-w-0 pr-2">
                                        <span className={`font-bold text-sm block truncate ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}>{op.customer}</span>
                                        <div className="text-xs font-mono text-text-muted block mt-0.5" onClick={(e) => e.stopPropagation()}>
                                            <MaskedData value={op.phone} type="phone" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end shrink-0">
                                        <span className={`text-xs font-[700]  px-2.5 py-1 rounded-lg border mb-1 ${isFresh ? 'text-status-success border-status-success/30 bg-emerald-500/10' : 'text-status-warning border-status-warning/30 bg-amber-500/10'}`}>
                                            {op.metrics.probability}% Chance
                                        </span>
                                    </div>
                                </div>
                                <div className={`flex justify-between items-center p-2 rounded-xl border border-border-subtle/50 ${op.adminLabel === 'High Risk' ? 'bg-status-error/5 border-status-error/20' : 'bg-surface-alt/40'}`}>
                                    <span className="text-xs font-bold  max-w-[120px] truncate flex items-center gap-1.5 text-text-muted">
                                        <AlertTriangle size={16}/> {op.declineReason || 'Needs Check-in'}
                                    </span>
                                    <span className="text-xs font-mono font-bold text-text-primary tracking-tight">${Number(op.amount).toLocaleString()}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* RIGHT PANEL: ACTION CONSOLE */}
            <div className="flex-1 flex flex-col relative bg-surface-main min-w-0">
                {activeOp && activeScript ? (
                    <>
                        <div className="p-6 border-b border-border-subtle flex justify-between items-start bg-gradient-to-r from-surface-alt/10 to-transparent">
                            <div className="min-w-0 pr-4">
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <h2 className="text-3xl font-[700] text-text-primary  tracking-tighter italic truncate">{activeOp.customer}</h2>
                                    <div className={`w-3 h-3 rounded-full ${activeScript.isFresh ? 'bg-emerald-500 shadow-[0_0_10px_#10B981]' : 'bg-amber-500'} animate-pulse`}></div>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-bold text-text-muted flex-wrap">
                                    <span className="flex items-center gap-1.5 text-text-primary bg-surface-alt/40 px-3 py-1 rounded-xl border border-border-subtle">
                                        <ShieldCheck size={16}/> {activeScript.reason} Guide
                                    </span>
                                    <span className="flex items-center gap-1.5 font-mono">
                                        <Clock size={16}/> {Math.round(activeOp.metrics.hoursOld)}H ELAPSED
                                    </span>
                                </div>
                            </div>
                        </div>

                        {viewMode === 'schedule' ? (
                            <div className="flex-1 p-8 bg-surface-main">
                                <div className="max-w-2xl mx-auto h-full flex flex-col">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                                            <Calendar size={20} className="text-accent-primary"/> Schedule Check-in Call
                                        </h3>
                                        <button onClick={() => setViewMode('console')} className="p-2 hover:bg-surface-alt rounded-full text-text-muted hover:text-text-primary transition-colors">
                                            <X size={20}/>
                                        </button>
                                    </div>
                                    <div className="flex-1 bg-surface-alt/20 rounded-[2rem] border border-border-subtle overflow-hidden shadow-inner">
                                        <CallbackForm 
                                            currentUser={currentUser!} 
                                            onAddNote={handleScheduleSubmit} 
                                            initialData={{ name: activeOp.customer, phone: activeOp.phone, address: activeOp.address, medicalConditions: activeOp.medicalConditions }} 
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col min-h-0 relative">
                                {/* Objection Tabs */}
                                <div className="px-6 py-4 border-b border-border-subtle overflow-x-auto scrollbar-hide flex gap-3 shrink-0 bg-surface-alt/10">
                                    {Object.entries(OBJECTION_METADATA).slice(0, 10).map(([id, meta]) => (
                                        <button
                                            key={id}
                                            onClick={() => { setActiveObjection(id as ObjectionType === activeObjection ? null : id as ObjectionType); sfx.playClick(); }}
                                            className={`px-4 py-2.5 rounded-2xl border flex items-center gap-2 text-xs font-[700]  tracking-wider transition-all whitespace-nowrap ${
                                                activeObjection === id 
                                                ? `bg-accent-primary text-white border-accent-primary shadow-lg scale-105` 
                                                : `bg-surface-main border-border-subtle text-text-muted hover:text-text-primary hover:bg-surface-alt`
                                            }`}
                                        >
                                            <meta.icon size={16} className={activeObjection === id ? 'text-white' : meta.color} />
                                            {meta.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                    <div className="max-w-4xl mx-auto space-y-8">
                                        <div className="p-6 bg-surface-alt/30 rounded-[2rem] border border-border-subtle relative group hover:border-accent-primary/20 transition-all shadow-sm">
                                            <div className="absolute -left-3 top-6 w-7 h-7 bg-surface-main border-2 border-accent-primary rounded-full flex items-center justify-center text-sm font-[700] text-accent-primary shadow-md z-10">1</div>
                                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border-subtle/50">
                                                <Activity size={16} className="text-accent-primary"/>
                                                <span className="text-xs font-[700]  tracking-[0.2em] text-accent-primary">Empathy & Care</span>
                                            </div>
                                            <div className="text-lg md:text-xl font-medium text-text-primary leading-relaxed tracking-wide" dangerouslySetInnerHTML={{__html: activeScript.hook}}></div>
                                        </div>

                                        <div className="p-6 bg-surface-alt/30 rounded-[2rem] border border-border-subtle relative group hover:border-emerald-500/20 transition-all shadow-sm">
                                            <div className="absolute -left-3 top-6 w-7 h-7 bg-surface-main border-2 border-emerald-500 rounded-full flex items-center justify-center text-sm font-[700] text-status-success shadow-md z-10">2</div>
                                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border-subtle/50">
                                                <Activity size={16} className="text-status-success"/>
                                                <span className="text-xs font-[700]  tracking-[0.2em] text-status-success">The Solution</span>
                                            </div>
                                            <div className="text-lg md:text-xl font-medium text-text-primary leading-relaxed tracking-wide" dangerouslySetInnerHTML={{__html: activeScript.fix}}></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="p-6 border-t border-border-subtle bg-surface-alt/30 flex gap-4 shrink-0 backdrop-blur-xl">
                                    {dismissId === activeOp.id ? (
                                        <div className="flex-1 flex items-center justify-between bg-surface-main border border-border-subtle rounded-2xl px-6 animate-in slide-in-from-bottom-2 fade-in">
                                            <span className="text-xs font-[700] text-text-muted  tracking-wider">Close this file?</span>
                                            <div className="flex gap-3">
                                                <Button variant="secondary" onClick={() => setDismissId(null)} className="h-10 text-xs">Back</Button>
                                                <Button variant="danger" onClick={() => { onAction(activeOp, 'delete'); setDismissId(null); setSelectedOpId(null); }} className="h-10 text-xs">Confirm</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <Button variant="secondary" onClick={() => setDismissId(activeOp.id)} className="w-32 h-14 text-xs font-[700]  tracking-widest text-text-muted">
                                                <Archive size={18} className="mr-2"/> Archive
                                            </Button>
                                            <Button variant="secondary" onClick={() => { setViewMode('schedule'); sfx.playClick(); }} className="w-40 h-14 text-xs font-[700]  tracking-widest text-amber-600 border-amber-500/20">
                                                <Calendar size={18} className="mr-2"/> Schedule
                                            </Button>
                                            <Button variant="primary" onClick={() => { onAction(activeOp, 'resurrect'); if (activeScript.scriptId) logScriptUsage(activeScript.scriptId, 'win', Number(activeOp.amount)); }} className="flex-1 h-14 text-sm font-[700]  tracking-[0.25em] shadow-xl shadow-accent-primary/20 bg-accent-primary">
                                                <Heart size={20} className="mr-3" fill="currentColor" /> Friendly Re-Link
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-text-muted opacity-40">
                        <Heart size={48} strokeWidth={1} className="mb-4" />
                        <p className="text-xs font-bold ">Select a profile to begin helping.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Lead Routing Protocol Overlay Modal */}
        {showLogicGuide && (
            <div className="absolute inset-0 bg-neutral-950/85 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
                <div className="bg-surface-main border border-border-subtle rounded-3xl p-8 max-w-4xl w-full max-h-[90%] overflow-y-auto shadow-2xl relative flex flex-col">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-500/10 text-accent-secondary rounded-2xl border border-indigo-500/15">
                                <Network size={22} className="animate-pulse text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-extrabold text-white tracking-tight">CRM Lead Judgment & Routing Protocol</h3>
                                <p className="text-xs text-text-muted mt-0.5">Automated dispositioning engine for inbound calls, background pushes & manual submissions</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => { setShowLogicGuide(false); sfx.playClick(); }}
                            className="p-2 hover:bg-surface-alt rounded-full text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Diagram Stages */}
                    <div className="space-y-6">
                        
                        {/* Phase 1 */}
                        <div className="bg-surface-alt/40 border border-border-subtle p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-start text-left">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">1</div>
                            <div className="flex-1 space-y-2">
                                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                    Lead Acquisition & Auto-Ingestion
                                </h4>
                                <p className="text-xs text-text-muted leading-relaxed">
                                    When an agent receives or initiates a call inside the integrated dialer, ViciDial triggers a secure web gateway sync.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                                    <div className="bg-surface-main/30 border border-border-subtle p-3 rounded-xl">
                                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">ViciDial Push (Autodialer)</span>
                                        <p className="text-[11px] text-text-muted">
                                            Logs customer contact automatically in the background. Duplicate checker verifies existing phones to prevent overwriting. Saved strictly to Super Admin <b>Unique Customer Profile</b>.
                                        </p>
                                    </div>
                                    <div className="bg-surface-main/30 border border-border-subtle p-3 rounded-xl">
                                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">Manual Agent Form</span>
                                        <p className="text-[11px] text-text-muted">
                                            Agent directly inputs data and submits. Saves real-time customer and active transaction records immediately.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Phase 2 */}
                        <div className="bg-surface-alt/40 border border-border-subtle p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-start text-left">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm shrink-0">2</div>
                            <div className="flex-1 space-y-2">
                                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                    Workspace Privacy Isolation Rules (No Overwrite)
                                </h4>
                                <p className="text-xs text-text-muted leading-relaxed font-semibold">
                                    Customers entered silently via the background autodialer are strictly isolated by credential status:
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                                    <div className="bg-indigo-950/20 border border-indigo-500/20 p-3 rounded-xl">
                                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">Super Admin Panel (Level 10)</span>
                                        <p className="text-[11px] text-text-muted">
                                            Full unrestricted visibility into all auto-ingested leads and deduplicated customers in the <b>Unique Sales Pool</b>.
                                        </p>
                                    </div>
                                    <div className="bg-rose-950/20 border border-rose-500/20 p-3 rounded-xl">
                                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-1">Agent Portal (Level &lt; 10)</span>
                                        <p className="text-[11px] text-text-muted">
                                            Zero background noise. Agents only manage profiles they submit manually via the Order/Callback desk, preventing confusion or premature data modifications.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Phase 3 */}
                        <div className="bg-surface-alt/40 border border-border-subtle p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-start text-left">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">3</div>
                            <div className="flex-1 space-y-2">
                                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                    Transaction-Based Desk Redirection
                                </h4>
                                <p className="text-xs text-text-muted leading-relaxed">
                                    The moment a manual customer order transaction result is received, the CRM automatically categorizes it:
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                                    <div className="bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-xl">
                                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">Approved Pay</span>
                                        <p className="text-[11px] text-text-muted">
                                            Placed in Approved Ledgers. Leaderboard credit and payouts synced.
                                        </p>
                                    </div>
                                    <div className="bg-rose-950/20 border border-rose-500/20 p-3 rounded-xl">
                                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-1">Declined Pay</span>
                                        <p className="text-[11px] text-text-muted">
                                            Immediately redirected to the <b>Need Help / Recovery Console</b> allowing the agent to save the client.
                                        </p>
                                    </div>
                                    <div className="bg-amber-950/20 border border-amber-500/20 p-3 rounded-xl">
                                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block mb-1">Callback / Save</span>
                                        <p className="text-[11px] text-text-muted">
                                            Timed alerts set and placed in <b>To Call Back</b> rhythm schedule.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Footer confirmation */}
                    <div className="mt-8 pt-4 border-t border-border-subtle flex justify-end">
                        <Button variant="primary" onClick={() => { setShowLogicGuide(false); sfx.playConfirm(); }} className="px-6 h-11 text-xs font-bold tracking-widest uppercase">
                            Understood Protocols
                        </Button>
                    </div>

                </div>
            </div>
        )}
    </Card>
  );
};
