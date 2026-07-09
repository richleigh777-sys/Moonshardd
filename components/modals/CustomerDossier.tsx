
import React, { useState, useMemo, useEffect } from 'react';
import { CustomerProfile } from '../../utils/intelligence';
import { X, Trophy, Calendar, DollarSign, Package, Phone, Mail, MapPin, ShieldCheck, Briefcase, FileText, CheckCircle2, MessageSquare, Send, PhoneOff } from 'lucide-react';
import { Card } from '../ui/Base';
import { useCRM } from '../../hooks/useCRM';

interface CustomerDossierProps {
  profile: CustomerProfile | null;
  onClose: () => void;
}

type TabMode = 'overview' | 'timeline' | 'financials';
type CommsMode = 'none' | 'call' | 'sms' | 'email';

export const CustomerDossier: React.FC<CustomerDossierProps> = ({ profile, onClose }) => {
  const { notes, auditLogs, addNote } = useCRM();
  const [activeTab, setActiveTab] = useState<TabMode>('overview');
  const [commsMode, setCommsMode] = useState<CommsMode>('none');
  const [commsText, setCommsText] = useState('');
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let timer: any;
    if (commsMode === 'call') {
      timer = setInterval(() => setCallDuration(p => p + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [commsMode]);

  const handleSendComms = async () => {
    if (!profile) return;
    
    let content = '';
    let reason = '';
    
    if (commsMode === 'sms') {
      if (!commsText.trim()) return;
      reason = 'Outbound SMS';
      content = `Message Sent: "${commsText}"`;
    } else if (commsMode === 'email') {
      if (!commsText.trim()) return;
      reason = 'Outbound Email';
      content = `Email Sent:\n\n${commsText}`;
    } else if (commsMode === 'call') {
      reason = 'Outbound Call';
      const m = Math.floor(callDuration / 60).toString().padStart(2, '0');
      const s = (callDuration % 60).toString().padStart(2, '0');
      content = `Call completed. Duration: ${m}:${s}`;
    }

    await addNote({
      type: 'note',
      priority: 'Low',
      customerName: profile.name,
      phone: profile.phone,
      content,
      reason
    } as any);

    setCommsMode('none');
    setCommsText('');
    setActiveTab('timeline'); // Auto switch to timeline to see the log
  };

  // --- SINGLE SOURCE OF TRUTH AGGREGATION ---
  const timelineEvents = useMemo(() => {
    if (!profile) return [];

    // 1. Sales
    const salesEvents = profile.salesHistory.map(s => ({
        id: s.id,
        type: 'sale',
        timestamp: s.timestamp,
        icon: DollarSign,
        title: `Order: ${s.product}`,
        details: `${s.status} - $${s.amount}`,
        color: s.status === 'Approved' ? 'text-status-success' : 'text-status-error'
    }));

    // 2. Notes / Interactions
    // Note: In a real app, match by customer ID. Here using fuzzy name match from context.
    const relevantNotes = notes.filter(n => n.customerName === profile.name || n.phone === profile.phone);
    const noteEvents = relevantNotes.map(n => ({
        id: n.id,
        type: 'note',
        timestamp: n.timestamp,
        icon: FileText,
        title: n.reason || 'Agent Note',
        details: n.content,
        color: 'text-accent-secondary'
    }));

    // 3. System Audits (Filtered for this customer context)
    const relevantAudits = auditLogs.filter(a => a.details.includes(profile.name));
    const auditEvents = relevantAudits.map(a => ({
        id: a.id,
        type: 'audit',
        timestamp: a.timestamp,
        icon: ShieldCheck,
        title: 'System Event',
        details: a.action,
        color: 'text-text-muted'
    }));

    return [...salesEvents, ...noteEvents, ...auditEvents].sort((a, b) => b.timestamp - a.timestamp);
  }, [profile, notes, auditLogs]);

  if (!profile) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-end p-0 bg-black/20 animate-in fade-in duration-300 pointer-events-auto">
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="bg-surface-main w-full max-w-5xl h-full overflow-hidden shadow-[-20px_0_40px_rgba(0,0,0,0.3)] border-l border-border-subtle flex flex-col relative z-10 animate-in slide-in-from-right duration-300">
        
        {/* HERO HEADER */}
        <div className="p-5 border-b border-border-subtle flex justify-between items-start bg-surface-alt/50  relative overflow-hidden shrink-0">
            <div className={`absolute top-0 right-0 w-96 h-96 blur-[100px] rounded-full opacity-20 pointer-events-none ${
                profile.status === 'VIP' ? 'bg-indigo-500' : 
                profile.status === 'At Risk' ? 'bg-red-500' : 'bg-emerald-500'
            }`}></div>

            <div className="relative z-10 flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-surface-highlight to-surface-alt flex items-center justify-center border border-border-subtle shadow-lg">
                    <span className="text-lg font-medium text-text-primary">{(profile.name || 'C').charAt(0)}</span>
                </div>
                <div>
                    <h2 className="text-xl font-medium  italic text-text-primary tracking-tighter flex items-center gap-3">
                        {profile.name}
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium  tracking-wide border ${
                            profile.status === 'VIP' ? 'bg-accent-secondary/10 text-accent-secondary border-indigo-500/30' :
                            profile.status === 'At Risk' ? 'bg-red-500/10 text-status-error border-status-error/30' : 
                            'bg-emerald-500/10 text-status-success border-status-success/30'
                        }`}>
                            {profile.status}
                        </span>
                    </h2>
                    
                    <div className="flex flex-wrap gap-4 text-xs font-bold text-text-secondary  tracking-wide mt-2">
                        {profile.email && <span className="flex items-center gap-2 hover:text-accent-primary cursor-pointer"><Mail size={16}/> {profile.email}</span>}
                        {profile.phone && <span className="flex items-center gap-2 hover:text-accent-primary cursor-pointer"><Phone size={16}/> {profile.phone}</span>}
                        <span className="flex items-center gap-2 text-text-muted"><Briefcase size={16}/> {profile.orderCount} Orders</span>
                    </div>
                </div>
            </div>
            
            <div className="relative z-20 flex items-center gap-3">
                <div className="flex bg-surface-main rounded-xl p-1 border border-border-subtle shadow-sm mr-4">
                    <button onClick={() => setCommsMode('call')} className={`px-4 py-2 rounded-lg text-xs font-medium tracking-wide flex items-center gap-2 transition-all ${commsMode === 'call' ? 'bg-accent-primary text-white' : 'text-text-secondary hover:text-text-primary hover:bg-surface-alt'}`}>
                        <Phone size={14} /> Call
                    </button>
                    <button onClick={() => setCommsMode('sms')} className={`px-4 py-2 rounded-lg text-xs font-medium tracking-wide flex items-center gap-2 transition-all ${commsMode === 'sms' ? 'bg-accent-primary text-white' : 'text-text-secondary hover:text-text-primary hover:bg-surface-alt'}`}>
                        <MessageSquare size={14} /> Text
                    </button>
                    <button onClick={() => setCommsMode('email')} className={`px-4 py-2 rounded-lg text-xs font-medium tracking-wide flex items-center gap-2 transition-all ${commsMode === 'email' ? 'bg-accent-primary text-white' : 'text-text-secondary hover:text-text-primary hover:bg-surface-alt'}`}>
                        <Mail size={14} /> Email
                    </button>
                </div>
                <button onClick={onClose} className="p-3 bg-surface-highlight hover:bg-surface-alt text-text-muted hover:text-text-primary rounded-xl transition-all border border-transparent hover:border-border-subtle z-20">
                    <X size={24} />
                </button>
            </div>
        </div>

        {/* TABS */}
        <div className="px-8 flex items-center gap-4 border-b border-border-subtle bg-surface-main shrink-0">
            {['overview', 'timeline', 'financials'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as TabMode)}
                    className={`py-4 text-xs font-medium  tracking-wide border-b-2 transition-all ${
                        activeTab === tab ? 'border-accent-primary text-accent-primary' : 'border-transparent text-text-muted hover:text-text-primary'
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>

        {/* COMMS COMPOSER */}
        {commsMode !== 'none' && (
            <div className="bg-surface-main p-4 border-b border-border-subtle shrink-0 animate-in slide-in-from-top-2 duration-200">
                <div className="flex gap-4 items-start">
                    {commsMode === 'call' && (
                        <div className="flex-1 flex items-center justify-between bg-surface-alt p-4 rounded-xl border border-accent-primary/50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-accent-primary/20 flex items-center justify-center text-accent-primary animate-pulse">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-text-primary tracking-wide">Ongoing Call with {profile.name}</p>
                                    <p className="text-xs text-text-secondary mt-1">{profile.phone || 'No phone number available'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-lg font-mono text-text-primary bg-surface-main px-4 py-2 rounded-lg border border-border-subtle tracking-wide">
                                    {Math.floor(callDuration / 60).toString().padStart(2, '0')}:{(callDuration % 60).toString().padStart(2, '0')}
                                </span>
                                <button onClick={handleSendComms} className="bg-status-error hover:bg-red-600 text-white px-4 py-3 rounded-lg text-xs font-medium tracking-wide flex items-center gap-2 transition-all">
                                    <PhoneOff size={16} /> End & Log Call
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {commsMode === 'sms' && (
                        <div className="flex-1 flex gap-3">
                            <textarea
                                value={commsText}
                                onChange={(e) => setCommsText(e.target.value)}
                                placeholder="Write your text message here..."
                                className="flex-1 bg-surface-alt border border-border-subtle rounded-xl p-4 text-sm resize-none h-24 focus:border-accent-primary outline-none transition-colors"
                            />
                            <div className="flex flex-col gap-2">
                                <button onClick={handleSendComms} disabled={!commsText.trim()} className="bg-accent-primary hover:bg-accent-secondary disabled:opacity-50 text-white px-4 h-full rounded-xl text-xs font-medium tracking-wide flex flex-col items-center justify-center gap-2 transition-all">
                                    <Send size={18} />
                                    <span>Send SMS</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {commsMode === 'email' && (
                        <div className="flex-1 flex gap-3">
                            <textarea
                                value={commsText}
                                onChange={(e) => setCommsText(e.target.value)}
                                placeholder="Write your email body here..."
                                className="flex-1 bg-surface-alt border border-border-subtle rounded-xl p-4 text-sm resize-none h-32 focus:border-accent-primary outline-none transition-colors"
                            />
                            <div className="flex flex-col gap-2">
                                <button onClick={handleSendComms} disabled={!commsText.trim()} className="bg-accent-primary hover:bg-accent-secondary disabled:opacity-50 text-white px-4 h-full rounded-xl text-xs font-medium tracking-wide flex flex-col items-center justify-center gap-2 transition-all">
                                    <Send size={18} />
                                    <span>Send Email</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-surface-alt/10">
            {activeTab === 'overview' && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="p-5 flex flex-col justify-between group hover:border-status-success/30 border border-border-subtle">
                            <div className="flex justify-between mb-2 text-status-success"><DollarSign size={24} strokeWidth={2.5} /></div>
                            <p className="text-xs font-medium  text-text-muted tracking-wide">Lifetime Value</p>
                            <p className="text-lg font-medium text-text-primary num-font group-hover:text-status-success transition-colors">${profile.totalSpent.toLocaleString()}</p>
                        </Card>
                        <Card className="p-5 flex flex-col justify-between group hover:border-indigo-500/30 border border-border-subtle">
                            <div className="flex justify-between mb-2 text-accent-secondary"><Package size={24} strokeWidth={2.5} /></div>
                            <p className="text-xs font-medium  text-text-muted tracking-wide">Orders</p>
                            <p className="text-lg font-medium text-text-primary num-font group-hover:text-accent-secondary transition-colors">{profile.orderCount}</p>
                        </Card>
                        <Card className="p-5 flex flex-col justify-between group hover:border-status-warning/30 border border-border-subtle">
                            <div className="flex justify-between mb-2 text-status-warning"><Trophy size={24} strokeWidth={2.5} /></div>
                            <p className="text-xs font-medium  text-text-muted tracking-wide">Top SKU</p>
                            <p className="text-lg font-medium text-text-primary leading-tight truncate group-hover:text-status-warning transition-colors">{profile.favoriteProduct || 'N/A'}</p>
                        </Card>
                        <Card className="p-5 flex flex-col justify-between group hover:border-purple-500/30 border border-border-subtle">
                            <div className="flex justify-between mb-2 text-purple-500"><Calendar size={24} strokeWidth={2.5} /></div>
                            <p className="text-xs font-medium  text-text-muted tracking-wide">Last Active</p>
                            <p className="text-xl font-medium text-text-primary num-font group-hover:text-purple-400 transition-colors">{new Date(profile.lastPurchaseDate).toLocaleDateString()}</p>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-surface-main p-4 rounded-xl border border-border-subtle">
                             <h4 className="text-xs font-medium  text-text-primary tracking-wide mb-4 flex items-center gap-2"><MapPin size={16} className="text-accent-primary"/> Location Intel</h4>
                             <p className="text-sm font-medium text-text-secondary">{profile.address || 'No Address on File'}</p>
                        </div>
                        <div className="bg-surface-main p-4 rounded-xl border border-border-subtle">
                             <h4 className="text-xs font-medium  text-text-primary tracking-wide mb-4 flex items-center gap-2"><ShieldCheck size={16} className="text-status-success"/> Behavioral Tags</h4>
                             <div className="flex flex-wrap gap-2">
                                {profile.tags.length > 0 ? profile.tags.map(t => (
                                    <span key={t} className="px-3 py-1 bg-surface-alt border border-border-subtle rounded-lg text-xs font-bold  text-text-secondary">{t}</span>
                                )) : <span className="text-text-muted text-xs italic">No tags assigned.</span>}
                             </div>
                        </div>
                    </div>

                    {profile.customFields && Object.keys(profile.customFields).length > 0 && (
                        <div className="bg-surface-main p-4 rounded-xl border border-border-subtle">
                            <h4 className="text-xs font-medium  text-text-primary tracking-wide mb-4 flex items-center gap-2"><FileText size={16} className="text-accent-secondary"/> Custom Data Fields</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {Object.entries(profile.customFields).map(([key, val]) => (
                                    <div key={key} className="bg-surface-alt p-3 rounded-lg border border-border-subtle/50">
                                        <p className="text-[10px] uppercase font-bold text-text-muted mb-1 tracking-wider">{key.replace('supp_', '').replace(/([A-Z])/g, ' $1').trim()}</p>
                                        <p className="text-sm font-semibold text-text-primary">{val?.toString() || 'N/A'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'timeline' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-medium  text-text-primary tracking-wide">Unified Activity Feed</h4>
                        <span className="text-xs font-bold text-text-muted  tracking-wide bg-surface-main px-3 py-1 rounded border border-border-subtle">All Sources</span>
                    </div>

                    <div className="relative pl-4 border-l-2 border-border-subtle space-y-8">
                        {timelineEvents.map((event, idx) => (
                            <div key={idx} className="relative pl-6">
                                <div className={`absolute -left-[21px] top-1 w-10 h-10 rounded-xl border-4 border-surface-alt flex items-center justify-center bg-surface-main ${event.color}`}>
                                    <event.icon size={16} strokeWidth={2.5}/>
                                </div>
                                <div className="bg-surface-main p-4 rounded-xl border border-border-subtle hover:border-accent-primary/30 transition-all shadow-sm">
                                    <div className="flex justify-between items-start mb-1">
                                        <h5 className="text-sm font-bold text-text-primary">{event.title}</h5>
                                        <span className="text-xs font-mono text-text-muted">{new Date(event.timestamp).toLocaleString()}</span>
                                    </div>
                                    <p className="text-xs text-text-secondary leading-relaxed">{event.details}</p>
                                </div>
                            </div>
                        ))}
                        {timelineEvents.length === 0 && (
                            <div className="text-center py-10 text-text-muted italic opacity-50 text-xs">No activity recorded on this timeline.</div>
                        )}
                    </div>
                </div>
            )}

            {/* Financials Tab Placeholder - Could be expanded with credit cards / billing history */}
            {activeTab === 'financials' && (
                <div className="flex flex-col items-center justify-center h-64 opacity-40 text-text-muted gap-3 animate-in slide-in-from-right-4 duration-300">
                    <ShieldCheck size={48} strokeWidth={1} />
                    <p className="text-xs font-medium  tracking-wide">Secure Ledger Access Required</p>
                </div>
            )}
        </div>
        
        {/* FOOTER */}
        <div className="p-4 border-t border-border-subtle bg-surface-main text-center shrink-0">
             <div className="flex justify-center items-center gap-2 text-xs font-medium  text-text-muted tracking-wide opacity-60">
                <CheckCircle2 size={16}/> Verified Truth Source
             </div>
        </div>
      </div>
    </div>
  );
};
