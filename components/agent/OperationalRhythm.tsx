
import React, { useMemo, useState } from 'react';
import { 
    Activity, Clock, RotateCcw, MessageSquare, 
    ShieldAlert, Sparkles, ChevronRight, PhoneCall, 
    CheckCircle2, AlertCircle, ShoppingCart, Info, Plus
} from 'lucide-react';
import { Card, Button, Input } from '../ui/Base';
import { Note, User } from '../../types';
import { sfx } from '../../lib/soundService';
import { useCRM } from '../../hooks/useCRM';

interface OperationalRhythmProps {
    notes: Note[];
    currentUser: User;
    onLoadLead: (note: Note) => void;
}

export const OperationalRhythm: React.FC<OperationalRhythmProps> = ({ notes, currentUser, onLoadLead }) => {
    const { addNote } = useCRM();
    const [showIntake, setShowIntake] = useState(false);
    const [intakeData, setIntakeData] = useState({ name: '', phone: '', reason: '' });
    
    const handleSubmitIntake = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!intakeData.name || !intakeData.phone) return;
        
        await addNote({
            agentId: currentUser.id,
            agentName: currentUser.name,
            customerName: intakeData.name,
            phone: intakeData.phone,
            type: 'callback',
            priority: 'Mid',
            content: intakeData.reason || 'Manual Lead Intake',
            status: 'Pending',
            timestamp: Date.now(),
            createdAt: Date.now()
        });
        
        sfx.playSuccess();
        setShowIntake(false);
        setIntakeData({ name: '', phone: '', reason: '' });
    };

    const myProtocols = useMemo(() => {
        return notes
            .filter(n => n.agentId === currentUser.id && n.status !== 'Resolved' && n.status !== 'Ignored')
            .sort((a, b) => (a.reminderAt || a.timestamp) - (b.reminderAt || b.timestamp));
    }, [notes, currentUser.id]);

    const stats = useMemo(() => {
        return {
            urgent: myProtocols.filter(p => p.priority === 'High').length,
            reorders: myProtocols.filter(p => p.subtype === 'reorder').length,
            feedback: myProtocols.filter(p => p.subtype === 'feedback').length,
            salvage: myProtocols.filter(p => p.subtype === 'salvage').length,
        };
    }, [myProtocols]);

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Rhythm Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-text-primary tracking-tighter flex items-center gap-2">
                        <Activity className="text-accent-primary animate-pulse" size={20} />
                        Personal Operational Rhythm
                    </h2>
                    <p className="text-xs text-text-muted font-medium uppercase tracking-widest mt-1 opacity-70">
                        Intelligent Priority Vectoring
                    </p>
                </div>
                <div className="flex gap-2">
                     <Button 
                        onClick={() => { setShowIntake(true); sfx.playClick(); }}
                        variant="secondary"
                        className="px-4 py-1.5 bg-accent-primary/10 hover:bg-accent-primary/20 border-accent-primary/20 text-accent-primary rounded-xl flex items-center gap-2 group transition-all"
                     >
                        <Plus size={14} className="group-hover:rotate-90 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Manual Intake</span>
                     </Button>

                     <div className="px-3 py-1.5 bg-surface-main border border-border-subtle rounded-xl flex items-center gap-3">
                         <div className="flex items-center gap-1.5">
                             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                             <span className="text-[10px] font-black uppercase text-text-primary">{stats.urgent} Urgent</span>
                         </div>
                         <div className="w-px h-3 bg-border-subtle" />
                         <div className="flex items-center gap-1.5">
                             <div className="w-2 h-2 rounded-full bg-indigo-500" />
                             <span className="text-[10px] font-black uppercase text-text-primary text-opacity-60">{stats.reorders} Reorders</span>
                         </div>
                     </div>
                </div>
            </div>

            {/* Quick Intake Modal */}
            {showIntake && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowIntake(false)}></div>
                    <Card variant="panel" className="relative w-full max-w-md bg-surface-main border-accent-primary/30 shadow-2xl p-8 space-y-6">
                        <div>
                            <h3 className="text-xl font-black text-text-primary tracking-tight">Lead Infiltration</h3>
                            <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1 italic">Assigning new target to your personal sector</p>
                        </div>

                        <form onSubmit={handleSubmitIntake} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Full Name</label>
                                <Input 
                                    className="h-12 bg-surface-alt/50 border-white/5 rounded-xl font-bold" 
                                    placeholder="Enter Customer Name"
                                    value={intakeData.name}
                                    onChange={(e) => setIntakeData({...intakeData, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Phone Vector</label>
                                <Input 
                                    className="h-12 bg-surface-alt/50 border-white/5 rounded-xl font-bold num-font" 
                                    placeholder="Enter Phone Number"
                                    value={intakeData.phone}
                                    onChange={(e) => setIntakeData({...intakeData, phone: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Engagement Reason</label>
                                <textarea 
                                    className="w-full h-24 bg-surface-alt/50 border border-white/5 rounded-xl p-4 text-sm font-bold text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:ring-1 ring-accent-primary/40" 
                                    placeholder="Why are you contacting them?"
                                    value={intakeData.reason}
                                    onChange={(e) => setIntakeData({...intakeData, reason: e.target.value})}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button 
                                    type="button"
                                    onClick={() => setShowIntake(false)}
                                    variant="secondary"
                                    className="flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-border-subtle"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit"
                                    className="flex-1 bg-accent-primary text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-accent-primary/20"
                                >
                                    Deploy Lead
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Next Engagement Card */}
            {myProtocols.length > 0 ? (
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-primary to-indigo-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                    <Card variant="panel" className="relative p-8 bg-surface-main border-accent-primary/20 flex flex-col md:flex-row items-center gap-8 overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Sparkles size={120} className="text-accent-primary" />
                        </div>
                        
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-accent-primary to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-accent-primary/20 relative">
                             {myProtocols[0].subtype === 'reorder' ? <RotateCcw size={32} /> : 
                              myProtocols[0].subtype === 'feedback' ? <MessageSquare size={32} /> : 
                              myProtocols[0].subtype === 'salvage' ? <ShieldAlert size={32} /> : 
                              <PhoneCall size={32} />}
                             <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white flex items-center justify-center text-accent-primary border-2 border-surface-main shadow-lg">
                                 <Clock size={14} className="animate-spin-slow" />
                             </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                    myProtocols[0].priority === 'High' ? 'bg-red-500 text-white' : 'bg-indigo-500/10 text-indigo-500'
                                }`}>
                                    {myProtocols[0].priority} Priority
                                </span>
                                <span className="px-2 py-0.5 rounded bg-surface-alt text-text-muted text-[8px] font-black uppercase tracking-widest border border-border-subtle">
                                    {myProtocols[0].subtype || 'Manual'} Protocol
                                </span>
                            </div>
                            <h3 className="text-2xl font-black text-text-primary tracking-tight mb-2">
                                {myProtocols[0].customerName}
                            </h3>
                            <p className="text-sm text-text-secondary leading-relaxed max-w-xl">
                                {myProtocols[0].content}
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 min-w-[180px]">
                            <Button 
                                onClick={() => { onLoadLead(myProtocols[0]); sfx.playSubmit(); }}
                                className="w-full bg-accent-primary hover:bg-accent-secondary text-white border-none py-6 rounded-2xl flex items-center justify-center gap-2 group/btn shadow-lg shadow-accent-primary/20"
                            >
                                <span className="font-black uppercase tracking-widest text-[11px]">Initiate Intake</span>
                                <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                            <Button 
                                variant="secondary" 
                                className="w-full bg-surface-alt border-border-subtle text-text-muted hover:text-text-primary py-3 rounded-xl text-[9px] font-black uppercase tracking-widest"
                                onClick={() => sfx.playClick()}
                            >
                                Snoop Record
                             </Button>
                        </div>
                    </Card>
                </div>
            ) : (
                <Card variant="panel" className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-surface-alt flex items-center justify-center text-text-muted/20">
                        <CheckCircle2 size={32} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-lg font-bold text-text-primary">Rhythm Satiated</p>
                        <p className="text-xs text-text-muted max-w-xs">All automated objectives have been processed. The nexus is silent.</p>
                    </div>
                </Card>
            )}

            {/* Rhythm Queue */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Protocols */}
                <Card variant="panel" className="bg-surface-main/30 border-border-subtle p-0 overflow-hidden flex flex-col min-h-[400px]">
                    <div className="p-4 border-b border-border-subtle bg-surface-alt/20 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <ShoppingCart size={16} className="text-indigo-500" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-primary">Engagement Pipeline</h3>
                        </div>
                        <span className="text-[10px] font-bold text-text-muted">{myProtocols.slice(1).length} Upcoming</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                        <div className="space-y-1">
                            {myProtocols.slice(1).map((p) => (
                                <div key={p.id} className="p-3 hover:bg-surface-alt/50 rounded-xl transition-all cursor-pointer group flex items-center justify-between border border-transparent hover:border-border-subtle">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                                            p.subtype === 'reorder' ? 'bg-emerald-500/10 text-emerald-500' : 
                                            p.subtype === 'feedback' ? 'bg-blue-500/10 text-blue-500' : 
                                            p.subtype === 'salvage' ? 'bg-red-500/10 text-red-500' : 
                                            'bg-surface-alt text-text-muted'
                                        }`}>
                                            {p.subtype === 'reorder' ? 'R' : p.subtype === 'feedback' ? 'F' : p.subtype === 'salvage' ? 'S' : 'M'}
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-text-primary group-hover:text-accent-primary transition-colors">{p.customerName}</p>
                                            <p className="text-[9px] text-text-muted font-medium truncate max-w-[180px] opacity-60 italic mt-0.5">{p.content}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-text-primary opacity-40 uppercase tracking-tighter">Due</p>
                                            <p className="text-[10px] font-bold text-text-primary">
                                                {new Date(p.reminderAt || p.timestamp).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => onLoadLead(p)}
                                            className="p-2 bg-surface-alt rounded-lg text-text-muted hover:bg-accent-primary hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {myProtocols.length <= 1 && (
                                <div className="py-20 flex flex-col items-center justify-center text-center opacity-40 grayscale">
                                    <Info size={32} className="mb-2" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Queue Empty</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Tactical Tips / AI Briefing */}
                <div className="space-y-6">
                    <Card variant="panel" className="bg-gradient-to-br from-indigo-500/10 via-surface-main to-surface-main border-indigo-500/20 p-6 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20">
                                <Sparkles size={18} />
                            </div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-text-primary">Conversion Catalyst</h3>
                        </div>
                        <div className="space-y-4">
                            <p className="text-sm font-medium text-text-secondary leading-relaxed">
                                {myProtocols.length > 0 && myProtocols[0].subtype === 'reorder' ? 
                                    `Tip: When calling ${myProtocols[0].customerName}, lead with "Restocking your supply". Don't say "Selling more". Highlight the routine benefits they've already experienced.` : 
                                 myProtocols[0]?.subtype === 'feedback' ? 
                                    `Strategy: User ${myProtocols[0].customerName} just completed their first 48 hours. Build trust first. A happy customer reorders 3x more often.` :
                                 `Intake Focus: Your pipeline is currently balanced. Focus on clearing pending callbacks before the end of the shift to maintain velocity.`
                                }
                            </p>
                            <div className="flex gap-2">
                                <div className="flex-1 p-3 bg-surface-alt/40 border border-border-subtle rounded-xl">
                                    <p className="text-[8px] font-black text-text-muted uppercase mb-1">Success Rate</p>
                                    <p className="text-lg font-black text-emerald-500">+12%</p>
                                </div>
                                <div className="flex-1 p-3 bg-surface-alt/40 border border-border-subtle rounded-xl">
                                    <p className="text-[8px] font-black text-text-muted uppercase mb-1">Velocity</p>
                                    <p className="text-lg font-black text-indigo-500">Optimum</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card variant="panel" className="border-border-subtle bg-surface-main/30 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle size={18} className="text-amber-500" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-text-primary">System Integrity</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-text-muted font-bold uppercase">Protocols Active</span>
                                <span className="text-text-primary font-black">OPERATIONAL</span>
                            </div>
                            <div className="w-full h-1 bg-surface-alt rounded-full overflow-hidden">
                                <div className="w-full h-full bg-indigo-500 transition-all duration-1000" />
                            </div>
                            <p className="text-[9px] text-text-muted italic opacity-60 leading-tight">
                                Automated follow-ups are being generated based on approved sale cycles (48h/25d).
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
