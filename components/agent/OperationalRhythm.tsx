
import React, { useMemo, useState } from 'react';
import { 
    Activity, Clock, RotateCcw, MessageSquare, 
    ShieldAlert, Sparkles, ChevronRight, PhoneCall, 
    CheckCircle2, AlertCircle, ShoppingCart, Info, Plus, DollarSign
} from 'lucide-react';
import { Card, Button, Input } from '../ui/Base';
import { Note, User, Sale } from '../../types';
import { sfx } from '../../lib/soundService';
import { useCRM } from '../../hooks/useCRM';
import { useAgentStats } from './hooks/useAgentStats';
import { useLeadRouter } from '../../hooks/useLeadRouter';
import { IntelligentTerminalMap } from './IntelligentTerminalMap';

interface OperationalRhythmProps {
    notes: Note[];
    sales: Sale[];
    currentUser: User;
    onLoadLead: (lead: any) => void;
}

export const OperationalRhythm: React.FC<OperationalRhythmProps> = ({ notes, sales, currentUser, onLoadLead }) => {
    const { addNote, systemConfig } = useCRM();
    const [showIntake, setShowIntake] = useState(false);
    const [intakeData, setIntakeData] = useState({ name: '', phone: '', reason: '' });
    
    const { pullNextLead, isRouting } = useLeadRouter(currentUser.id);

    // Connect stats to Live Commission Calculation
    const statsInfo = useAgentStats(sales, currentUser, systemConfig);

    // Extract top AI predicted lead based on SmartQueue scoring logic
    const topPredictedLead = useMemo(() => {
        const nowMs = new Date().getTime();
        const scoredLeads = sales
            .filter(s => s.status !== 'Approved' && s.status !== 'Declined' && s.pipelineStatus !== 'Closed Won' && s.pipelineStatus !== 'Closed Lost')
            .map(s => {
                let score = 50;
                let reason = "Standard Pipeline";
                let urgency: 'high' | 'medium' | 'low' = 'low';
                
                if (s.pipelineStatus === 'Retention') { score += 30; reason = "Approaching Churn"; urgency = 'high'; }
                else if (s.pipelineStatus === 'Reorder') { score += 25; reason = "Supply Empty"; urgency = 'high'; }
                else if (s.pipelineStatus === 'Rebuttal') { score += 20; reason = "In-progress Negotiation"; urgency = 'medium'; }
                else if (s.pipelineStatus === 'Referral') { score += 15; reason = "Warm Lead"; urgency = 'medium'; }

                const elapsedDays = (nowMs - s.timestamp) / (1000 * 60 * 60 * 24);
                if (elapsedDays < 1) {
                    score += 20;
                    urgency = 'high';
                    if (reason === "Standard Pipeline") reason = "Fresh Lead < 24h";
                } else if (elapsedDays > 30) score -= 20;

                if (s.callSummary) score += 10;
                if (s.age && s.age > 45) score += 5;
                if (s.medicalConditions && s.medicalConditions.length > 0) score += 10;
                if (s.height && s.weight) score += 5;

                score = Math.min(99, Math.max(1, score));
                return { ...s, score, reason, urgency };
            })
            .sort((a, b) => b.score - a.score);

        return scoredLeads.length > 0 ? scoredLeads[0] : null;
    }, [sales]);

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
                    <h2 className="text-xl font-[700] text-text-primary tracking-tighter flex items-center gap-2">
                        <Activity className="text-accent-primary animate-pulse" size={20} />
                        Personal Operational Rhythm
                    </h2>
                    <p className="text-xs text-text-muted font-medium  tracking-widest mt-1 opacity-70">
                        Intelligent Priority Vectoring
                    </p>
                </div>
                <div className="flex gap-2">
                     <Button 
                        onClick={async () => {
                            const lead = await pullNextLead();
                            if (lead) onLoadLead(lead);
                        }}
                        disabled={isRouting}
                        variant="primary"
                        className={`px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 border-none text-white rounded-xl flex items-center gap-2 transition-all ${isRouting ? 'opacity-50 cursor-not-allowed' : 'shadow-lg shadow-indigo-500/30'}`}
                     >
                        <RotateCcw size={16} className={isRouting ? 'animate-spin' : ''} />
                        <span className="text-xs font-[700]  tracking-widest">{isRouting ? 'Routing...' : 'Pull Next Lead'}</span>
                     </Button>

                     <Button 
                        onClick={() => { setShowIntake(true); sfx.playClick(); }}
                        variant="secondary"
                        className="px-4 py-1.5 bg-accent-primary/10 hover:bg-accent-primary/20 border-accent-primary/20 text-accent-primary rounded-xl flex items-center gap-2 group transition-all"
                     >
                        <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                        <span className="text-xs font-[700]  tracking-widest">Manual Intake</span>
                     </Button>

                     <div className="px-3 py-1.5 bg-surface-main border border-border-subtle rounded-xl flex items-center gap-3">
                         <div className="flex items-center gap-1.5">
                             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                             <span className="text-xs font-[700]  text-text-primary">{stats.urgent} Urgent</span>
                         </div>
                         <div className="w-px h-3 bg-border-subtle" />
                         <div className="flex items-center gap-1.5">
                             <div className="w-2 h-2 rounded-full bg-indigo-500" />
                             <span className="text-xs font-[700]  text-text-primary text-opacity-60">{stats.reorders} Reorders</span>
                         </div>
                     </div>
                </div>
            </div>

            {/* Quick Intake Modal */}
            {showIntake && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-surface-alt backdrop-blur-sm" onClick={() => setShowIntake(false)}></div>
                    <Card variant="panel" className="relative w-full max-w-md bg-surface-main border-accent-primary/30 shadow-2xl p-8 space-y-6">
                        <div>
                            <h3 className="text-xl font-[700] text-text-primary tracking-tight">Lead Infiltration</h3>
                            <p className="text-xs text-text-muted font-[700]  tracking-widest mt-1 italic">Assigning new target to your personal sector</p>
                        </div>

                        <form onSubmit={handleSubmitIntake} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-[700] text-text-muted  tracking-[0.2em] ml-1">Full Name</label>
                                <Input 
                                    className="h-12 bg-surface-alt/50 border-border-subtle rounded-xl font-bold" 
                                    placeholder="Enter Customer Name"
                                    value={intakeData.name}
                                    onChange={(e) => setIntakeData({...intakeData, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-[700] text-text-muted  tracking-[0.2em] ml-1">Phone Vector</label>
                                <Input 
                                    className="h-12 bg-surface-alt/50 border-border-subtle rounded-xl font-bold num-font" 
                                    placeholder="Enter Phone Number"
                                    value={intakeData.phone}
                                    onChange={(e) => setIntakeData({...intakeData, phone: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-[700] text-text-muted  tracking-[0.2em] ml-1">Engagement Reason</label>
                                <textarea 
                                    className="w-full h-24 bg-surface-alt/50 border border-border-subtle rounded-xl p-4 text-sm font-bold text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:ring-1 ring-accent-primary/40" 
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
                                    className="flex-1 py-4 rounded-xl text-xs font-[700]  tracking-widest border-border-subtle"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit"
                                    className="flex-1 bg-accent-primary text-white py-4 rounded-xl text-xs font-[700]  tracking-widest shadow-lg shadow-accent-primary/20"
                                >
                                    Deploy Lead
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Priority Leads - AI Recommended */}
            {topPredictedLead && (
                <div className="relative group mt-6">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-status-success/30 to-emerald-500/30 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                    <Card variant="panel" className="relative p-6 md:p-8 bg-surface-main/90 border-emerald-500/30 flex flex-col md:flex-row items-center gap-6 overflow-hidden">
                        <div className="absolute -left-10 -top-10 p-8 opacity-5">
                            <Activity size={180} className="text-emerald-500" />
                        </div>
                        
                        <div className="w-16 h-16 shrink-0 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-status-success relative">
                            <Sparkles size={28} />
                            {topPredictedLead.score >= 80 && (
                                <div className="absolute -top-2 -right-2">
                                    <span className="flex h-4 w-4 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-error opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-4 w-4 bg-status-error flex items-center justify-center">
                                            <ShieldAlert size={8} className="text-white" />
                                        </span>
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 text-center md:text-left z-10">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-[800] tracking-widest ${
                                    topPredictedLead.urgency === 'high' ? 'bg-status-error/10 border border-status-error/20 text-status-error' : 'bg-status-success/10 border border-status-success/20 text-status-success'
                                }`}>
                                    Score: {topPredictedLead.score}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-surface-alt/50 text-text-secondary text-[10px] uppercase font-[800] tracking-widest border border-border-subtle">
                                    {topPredictedLead.pipelineStatus || 'New Lead'}
                                </span>
                            </div>
                            <h3 className="text-xl font-[700] text-text-primary tracking-tight mb-1">
                                {topPredictedLead.customer}
                            </h3>
                            <p className="text-xs text-text-muted">
                                <span className="font-bold text-text-secondary">AI Prediction:</span> {topPredictedLead.reason}
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 min-w-[200px] z-10 w-full md:w-auto mt-4 md:mt-0">
                            <Button 
                                onClick={() => { onLoadLead(topPredictedLead); sfx.playSubmit(); }}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white border-none py-4 rounded-xl flex items-center justify-center gap-2 group/btn shadow-lg shadow-emerald-500/20"
                            >
                                <span className="font-[700] tracking-widest text-xs uppercase">Claim Recommended Deal</span>
                                <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Next Engagement Card (Manual Protocols) */}
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
                                 <Clock size={16} className="animate-spin-slow" />
                             </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                                <span className={`px-2.5 py-1 rounded text-sm font-[700]  tracking-widest ${
                                    myProtocols[0].priority === 'High' ? 'bg-red-500 text-white' : 'bg-accent-secondary/10 text-accent-secondary'
                                }`}>
                                    {myProtocols[0].priority} Priority
                                </span>
                                <span className="px-2.5 py-1 rounded bg-surface-alt text-text-muted text-sm font-[700]  tracking-widest border border-border-subtle">
                                    {myProtocols[0].subtype || 'Manual'} Protocol
                                </span>
                            </div>
                            <h3 className="text-2xl font-[700] text-text-primary tracking-tight mb-2">
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
                                <span className="font-[700]  tracking-widest text-sm">Initiate Intake</span>
                                <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                            <Button 
                                variant="secondary" 
                                className="w-full bg-surface-alt border-border-subtle text-text-muted hover:text-text-primary py-3 rounded-xl text-xs font-[700]  tracking-widest"
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

            {/* Intelligent Terminal Routing & Diagnostic Gateway */}
            <IntelligentTerminalMap 
                sales={sales} 
                notes={notes} 
                currentUser={currentUser} 
                onLoadLead={onLoadLead} 
            />

            {/* Rhythm Queue */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Protocols */}
                <Card variant="panel" className="bg-surface-main/30 border-border-subtle p-0 overflow-hidden flex flex-col min-h-[400px]">
                    <div className="p-4 border-b border-border-subtle bg-surface-alt/20 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <ShoppingCart size={16} className="text-accent-secondary" />
                            <h3 className="text-xs font-[700]  tracking-[0.2em] text-text-primary">Engagement Pipeline</h3>
                        </div>
                        <span className="text-xs font-bold text-text-muted">{myProtocols.slice(1).length} Upcoming</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                        <div className="space-y-1">
                            {myProtocols.slice(1).map((p) => (
                                <div key={p.id} className="p-3 hover:bg-surface-alt/50 rounded-xl transition-all cursor-pointer group flex items-center justify-between border border-transparent hover:border-border-subtle">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                                            p.subtype === 'reorder' ? 'bg-emerald-500/10 text-status-success' : 
                                            p.subtype === 'feedback' ? 'bg-blue-500/10 text-blue-500' : 
                                            p.subtype === 'salvage' ? 'bg-red-500/10 text-status-error' : 
                                            'bg-surface-alt text-text-muted'
                                        }`}>
                                            {p.subtype === 'reorder' ? 'R' : p.subtype === 'feedback' ? 'F' : p.subtype === 'salvage' ? 'S' : 'M'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-text-primary group-hover:text-accent-primary transition-colors">{p.customerName}</p>
                                            <p className="text-xs text-text-muted font-medium truncate max-w-[180px] opacity-60 italic mt-0.5">{p.content}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-xs font-[700] text-text-primary opacity-40  tracking-tighter">Due</p>
                                            <p className="text-xs font-bold text-text-primary">
                                                {new Date(p.reminderAt || p.timestamp).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => onLoadLead(p)}
                                            className="p-2 bg-surface-alt rounded-lg text-text-muted hover:bg-accent-primary hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {myProtocols.length <= 1 && (
                                <div className="py-20 flex flex-col items-center justify-center text-center opacity-40 grayscale">
                                    <Info size={32} className="mb-2" />
                                    <p className="text-xs font-[700]  tracking-widest text-text-muted">Queue Empty</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Tactical Tips & Live Commission */}
                <div className="space-y-6">
                    {/* Live Commission Calculator Widget */}
                    <Card variant="panel" className="relative p-6 overflow-hidden bg-surface-main/30 border-green-500/20 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent opacity-50" />
                        
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20">
                                    <DollarSign size={18} />
                                </div>
                                <div>
                                    <h3 className="text-xs font-[700]  tracking-widest text-text-primary flex items-center gap-2">
                                        Real-Time Commission <span className="flex h-2 w-2 relative rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span></span>
                                    </h3>
                                    <p className="text-[10px]  font-bold text-text-muted mt-0.5">Calculated from closed won & approved status</p>
                                </div>
                            </div>
                            
                            <div className="flex items-baseline gap-2 py-2">
                                <span className="text-4xl font-[700] text-text-primary tracking-tight">
                                    ${statsInfo?.estCommission?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                </span>
                                <span className="text-sm font-bold text-status-success">+{statsInfo?.dailyCount || 0} Deals Today</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-2">
                                <div className="p-3 bg-surface-alt/50 rounded-xl border border-border-subtle">
                                    <p className="text-[10px] font-[700]  text-text-muted text-center tracking-widest mb-1">Win Rate</p>
                                    <p className="text-base font-[700] text-text-primary text-center">{statsInfo?.winRate || 0}%</p>
                                </div>
                                <div className="p-3 bg-surface-alt/50 rounded-xl border border-border-subtle">
                                    <p className="text-[10px] font-[700]  text-text-muted text-center tracking-widest mb-1">Total Revenue</p>
                                    <p className="text-base font-[700] text-text-primary text-center">${statsInfo?.totalRevenue?.toLocaleString() || '0'}</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card variant="panel" className="bg-gradient-to-br from-indigo-500/10 via-surface-main to-surface-main border-accent-secondary/20 p-6 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20">
                                <Sparkles size={18} />
                            </div>
                            <h3 className="text-xs font-[700]  tracking-widest text-text-primary">Conversion Catalyst</h3>
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
                        </div>
                    </Card>

                    <Card variant="panel" className="border-border-subtle bg-surface-main/30 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle size={18} className="text-status-warning" />
                            <h3 className="text-xs font-[700]  tracking-widest text-text-primary">System Integrity</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-text-muted font-bold ">Protocols Active</span>
                                <span className="text-text-primary font-[700]">OPERATIONAL</span>
                            </div>
                            <div className="w-full h-1 bg-surface-alt rounded-full overflow-hidden">
                                <div className="w-full h-full bg-indigo-500 transition-all duration-1000" />
                            </div>
                            <p className="text-xs text-text-muted italic opacity-60 leading-tight">
                                Automated follow-ups are being generated based on approved sale cycles.
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
