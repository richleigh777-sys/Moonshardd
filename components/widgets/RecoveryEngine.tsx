
import React, { useState, useEffect, useMemo } from 'react';
import { 
    ShieldCheck, Heart, AlertTriangle, Clock, Activity, 
    Calendar, X, Archive, CheckCircle
} from 'lucide-react';
import { Sale, ObjectionType } from '../../types';
import { RESCUE_SCRIPTS as DEFAULT_SCRIPTS, OBJECTION_METADATA } from '../../constants';
import { Button, Card } from '../ui/Base';
import { sfx } from '../../lib/soundService';
import { useCRM } from '../../hooks/useCRM';
import { CallbackForm } from '../forms/CallbackForm';
import { useSystem } from '../../hooks/useSystem';

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
                <CheckCircle size={40} className="text-emerald-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-black text-text-primary uppercase tracking-[0.25em]">Peace of Mind</h3>
            <p className="text-text-muted text-xs font-bold uppercase mt-1">Everyone is looked after.</p>
        </Card>
      );
  }

  return (
    <Card variant="panel" className="flex flex-col h-full overflow-hidden p-0 relative border-white/5 bg-surface-main">
        <div className="flex h-full">
            
            {/* LEFT SIDEBAR: LIST */}
            <div className="w-96 border-r border-border-subtle flex flex-col bg-surface-alt/10 shrink-0">
                <div className="p-5 border-b border-border-subtle bg-surface-main/20 backdrop-blur-md sticky top-0 z-10 flex justify-between items-center">
                    <div>
                        <h3 className="text-sm font-black uppercase text-accent-primary tracking-widest flex items-center gap-2">
                            <Heart size={16} className="animate-pulse" fill="currentColor" /> Customer Care
                        </h3>
                        <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mt-0.5">{rescueOps.length} Need Support</p>
                    </div>
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
                                        <span className="text-[10px] font-mono text-text-muted block">{op.phone}</span>
                                    </div>
                                    <div className="flex flex-col items-end shrink-0">
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border mb-1 ${isFresh ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10' : 'text-amber-500 border-amber-500/30 bg-amber-500/10'}`}>
                                            {op.metrics.probability}% Chance
                                        </span>
                                    </div>
                                </div>
                                <div className={`flex justify-between items-center p-2 rounded-xl border border-border-subtle/50 ${op.adminLabel === 'High Risk' ? 'bg-status-error/5 border-status-error/20' : 'bg-surface-alt/40'}`}>
                                    <span className="text-[9px] font-bold uppercase max-w-[120px] truncate flex items-center gap-1.5 text-text-muted">
                                        <AlertTriangle size={10}/> {op.declineReason || 'Needs Check-in'}
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
                                    <h2 className="text-3xl font-black text-text-primary uppercase tracking-tighter italic truncate">{activeOp.customer}</h2>
                                    <div className={`w-3 h-3 rounded-full ${activeScript.isFresh ? 'bg-emerald-500 shadow-[0_0_10px_#10B981]' : 'bg-amber-500'} animate-pulse`}></div>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-bold text-text-muted flex-wrap">
                                    <span className="flex items-center gap-1.5 text-text-primary bg-surface-alt/40 px-3 py-1 rounded-xl border border-border-subtle">
                                        <ShieldCheck size={14}/> {activeScript.reason} Guide
                                    </span>
                                    <span className="flex items-center gap-1.5 font-mono">
                                        <Clock size={14}/> {Math.round(activeOp.metrics.hoursOld)}H ELAPSED
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
                                            className={`px-4 py-2.5 rounded-2xl border flex items-center gap-2 text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                                                activeObjection === id 
                                                ? `bg-accent-primary text-white border-accent-primary shadow-lg scale-105` 
                                                : `bg-surface-main border-border-subtle text-text-muted hover:text-text-primary hover:bg-surface-alt`
                                            }`}
                                        >
                                            <meta.icon size={12} className={activeObjection === id ? 'text-white' : meta.color} />
                                            {meta.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                    <div className="max-w-4xl mx-auto space-y-8">
                                        <div className="p-6 bg-surface-alt/30 rounded-[2rem] border border-border-subtle relative group hover:border-accent-primary/20 transition-all shadow-sm">
                                            <div className="absolute -left-3 top-6 w-7 h-7 bg-surface-main border-2 border-accent-primary rounded-full flex items-center justify-center text-[11px] font-black text-accent-primary shadow-md z-10">1</div>
                                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border-subtle/50">
                                                <Activity size={14} className="text-accent-primary"/>
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-primary">Empathy & Care</span>
                                            </div>
                                            <div className="text-lg md:text-xl font-medium text-text-primary leading-relaxed tracking-wide" dangerouslySetInnerHTML={{__html: activeScript.hook}}></div>
                                        </div>

                                        <div className="p-6 bg-surface-alt/30 rounded-[2rem] border border-border-subtle relative group hover:border-emerald-500/20 transition-all shadow-sm">
                                            <div className="absolute -left-3 top-6 w-7 h-7 bg-surface-main border-2 border-emerald-500 rounded-full flex items-center justify-center text-[11px] font-black text-emerald-500 shadow-md z-10">2</div>
                                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border-subtle/50">
                                                <Activity size={14} className="text-emerald-500"/>
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">The Solution</span>
                                            </div>
                                            <div className="text-lg md:text-xl font-medium text-text-primary leading-relaxed tracking-wide" dangerouslySetInnerHTML={{__html: activeScript.fix}}></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="p-6 border-t border-border-subtle bg-surface-alt/30 flex gap-4 shrink-0 backdrop-blur-xl">
                                    {dismissId === activeOp.id ? (
                                        <div className="flex-1 flex items-center justify-between bg-surface-main border border-border-subtle rounded-2xl px-6 animate-in slide-in-from-bottom-2 fade-in">
                                            <span className="text-xs font-black text-text-muted uppercase tracking-wider">Close this file?</span>
                                            <div className="flex gap-3">
                                                <Button variant="secondary" onClick={() => setDismissId(null)} className="h-10 text-[10px]">Back</Button>
                                                <Button variant="danger" onClick={() => { onAction(activeOp, 'delete'); setDismissId(null); setSelectedOpId(null); }} className="h-10 text-[10px]">Confirm</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <Button variant="secondary" onClick={() => setDismissId(activeOp.id)} className="w-32 h-14 text-xs font-black uppercase tracking-widest text-text-muted">
                                                <Archive size={18} className="mr-2"/> Archive
                                            </Button>
                                            <Button variant="secondary" onClick={() => { setViewMode('schedule'); sfx.playClick(); }} className="w-40 h-14 text-xs font-black uppercase tracking-widest text-amber-600 border-amber-500/20">
                                                <Calendar size={18} className="mr-2"/> Schedule
                                            </Button>
                                            <Button variant="primary" onClick={() => { onAction(activeOp, 'resurrect'); if (activeScript.scriptId) logScriptUsage(activeScript.scriptId, 'win', Number(activeOp.amount)); }} className="flex-1 h-14 text-sm font-black uppercase tracking-[0.25em] shadow-xl shadow-accent-primary/20 bg-accent-primary">
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
                        <p className="text-xs font-bold uppercase">Select a profile to begin helping.</p>
                    </div>
                )}
            </div>
        </div>
    </Card>
  );
};
