import React, { useState, useEffect, useRef } from 'react';
import { Clock, Bell, Check, Plus, Timer, Calendar, RefreshCw, HeartPulse, StickyNote } from 'lucide-react';
import { Card, Input, Button } from '../../components/ui/Base';
import { formatUSAPhone } from '../../views/utils/crmLogic'; 
import { User, Note } from '../../types';
import { sfx } from '../../lib/soundService';
import { MEDICAL_CONDITIONS } from '../../constants';

interface CallbackFormProps {
    onAddNote: (note: Partial<Note>) => Promise<void>;
    currentUser: User;
    initialData?: { name?: string; phone?: string; address?: string; medicalConditions?: string[] };
}

export const CallbackForm: React.FC<CallbackFormProps> = ({ onAddNote, currentUser, initialData }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        reason: 'Package Update',
        notes: '',
        agentNotes: ''
    });
    const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

    const [targetTimestamp, setTargetTimestamp] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [countdownText, setCountdownText] = useState<string>('');
    
    const notifiedRef = useRef<boolean>(false);

    // Sync from EnrollmentForm (Auto-write feature)
    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                name: initialData.name || prev.name,
                phone: initialData.phone || prev.phone,
            }));
            if (initialData.medicalConditions) {
                setSelectedConditions(initialData.medicalConditions);
            }
        }
    }, [initialData]);

    // Countdown and Alarm Engine (3-second ring 5 mins before)
    useEffect(() => {
        if (!targetTimestamp) {
            setCountdownText('');
            return;
        }

        const interval = setInterval(() => {
            const now = Date.now();
            const diff = targetTimestamp - now;

            if (diff <= 0) {
                setCountdownText('DUE NOW');
                clearInterval(interval);
                return;
            }

            // Alarm logic: 5 mins before (300,000ms)
            if (diff <= 300000 && diff > 290000 && !notifiedRef.current) {
                notifiedRef.current = true;
                sfx.playPhoneRing();
                // Play for 3 seconds approx by repeating or just one long burst
                setTimeout(() => sfx.playPhoneRing(), 1500); 
            }

            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            
            let text = '';
            if (h > 0) text += `${h}h `;
            if (m > 0 || h > 0) text += `${m}m `;
            text += `${s}s`;
            setCountdownText(`T-Minus ${text}`);
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [targetTimestamp]);

    const addTime = (ms: number) => {
        sfx.playClick();
        notifiedRef.current = false;
        setTargetTimestamp(prev => (prev && prev > Date.now() ? prev : Date.now()) + ms);
    };

    const toggleCondition = (condition: string) => {
        setSelectedConditions(prev => 
            prev.includes(condition) ? prev.filter(c => c !== condition) : [...prev, condition]
        );
    };

    const reasons = [
        "Package Update", "Driving / Busy", "No Funds Available", "Wants to Think",
        "Spouse Approval", "Researching Competitor", "Disconnected / No Answer", "Declined Recovery"
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.phone || !targetTimestamp) {
            sfx.playError();
            return;
        }
        
        setIsSubmitting(true);
        const targetDate = new Date(targetTimestamp);

        try {
            await onAddNote({
                agentId: currentUser.id,
                agentName: currentUser.name,
                type: 'callback',
                content: `${formData.reason} | ${formData.agentNotes}`,
                reason: formData.reason,
                customerName: formData.name,
                phone: formData.phone,
                date: targetDate.toLocaleDateString(),
                time: targetDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                timestamp: targetTimestamp,
                createdAt: Date.now(),
                priority: 'High',
                medicalConditions: selectedConditions
            });
            
            sfx.playSuccess();
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                if (!initialData) {
                    setFormData({ name: '', phone: '', reason: 'Package Update', notes: '', agentNotes: '' });
                    setTargetTimestamp(null);
                    setSelectedConditions([]);
                }
                notifiedRef.current = false;
            }, 2500);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="flex flex-col h-full bg-surface-main border border-border-subtle shadow-2xl overflow-hidden p-0 relative group">
            <div className="absolute inset-0 bg-amber-500/[0.02] pointer-events-none"></div>
            
            <div className="p-5 border-b border-border-subtle bg-surface-alt/50 flex justify-between items-center shrink-0 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500 border border-amber-500/20 shadow-neon">
                        <Timer size={20} strokeWidth={2.5} className={targetTimestamp ? 'animate-pulse' : ''} />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-text-primary uppercase tracking-tight italic">Recovery Link</h3>
                        <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.25em]">Lead Scheduler v5.0</p>
                    </div>
                </div>
                {countdownText && (
                    <div className="px-3 py-1.5 bg-amber-500 text-black rounded-lg font-black text-[10px] uppercase tracking-widest shadow-lg animate-in zoom-in">
                        {countdownText}
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-text-muted tracking-widest ml-1">Client Identity</label>
                        <Input 
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})} 
                            placeholder="Full Name" 
                            className="bg-surface-alt border-border-subtle h-11"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-text-muted tracking-widest ml-1">Phone Line</label>
                        <Input 
                            value={formData.phone} 
                            onChange={e => setFormData({...formData, phone: formatUSAPhone(e.target.value)})} 
                            placeholder="(555) 000-0000" 
                            maxLength={14}
                            className="bg-surface-alt border-border-subtle h-11"
                        />
                    </div>
                </div>

                {/* TEMPORAL OFFSET */}
                <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase text-text-muted tracking-widest ml-1 flex items-center gap-2">
                        <Clock size={12} className="text-amber-500" /> Offset Interval (Additive)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        <button type="button" onClick={() => addTime(1800000)} className="h-10 bg-surface-alt hover:bg-amber-500 hover:text-black border border-border-subtle rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm">30m</button>
                        <button type="button" onClick={() => addTime(3600000)} className="h-10 bg-surface-alt hover:bg-amber-500 hover:text-black border border-border-subtle rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm">1h</button>
                        <button type="button" onClick={() => addTime(86400000)} className="h-10 bg-surface-alt hover:bg-amber-500 hover:text-black border border-border-subtle rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm">1d</button>
                        <button type="button" onClick={() => addTime(604800000)} className="h-10 bg-surface-alt hover:bg-amber-500 hover:text-black border border-border-subtle rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm">1w</button>
                    </div>
                    {targetTimestamp && (
                        <div className="flex items-center justify-between p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl animate-in slide-in-from-top-1">
                            <div className="flex items-center gap-3">
                                <Calendar size={16} className="text-amber-500" />
                                <div>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Scheduled Window</p>
                                    <p className="text-xs font-bold text-text-primary num-font">
                                        {new Date(targetTimestamp).toLocaleDateString()} @ {new Date(targetTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setTargetTimestamp(null)} className="p-1.5 text-text-muted hover:text-status-error transition-colors"><Plus size={16} className="rotate-45" /></button>
                        </div>
                    )}
                </div>

                {/* MEDICAL CONDITIONS */}
                <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase text-text-muted tracking-widest ml-1 flex items-center gap-2">
                        <HeartPulse size={12} className="text-status-error" /> Medical Profiling
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {MEDICAL_CONDITIONS.map(condition => (
                            <button
                                key={condition}
                                type="button"
                                onClick={() => toggleCondition(condition)}
                                className={`px-2 py-1 rounded-md text-[9px] font-bold border transition-all ${
                                    selectedConditions.includes(condition)
                                    ? 'bg-status-error/20 border-status-error text-status-error shadow-sm'
                                    : 'bg-surface-alt border-border-subtle text-text-muted hover:border-text-secondary'
                                }`}
                            >
                                {condition}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-text-muted tracking-widest ml-1">Callback Protocol</label>
                        <select 
                            className="bg-surface-alt border border-border-subtle text-text-primary p-3 h-11 text-xs font-bold w-full outline-none rounded-xl focus:border-amber-500 transition-all cursor-pointer shadow-inner"
                            value={formData.reason}
                            onChange={e => setFormData({...formData, reason: e.target.value})}
                        >
                            {reasons.map(r => <option key={r} value={r} className="bg-surface-main">{r}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-text-muted tracking-widest ml-1 flex items-center gap-1.5">
                            <StickyNote size={10} /> Agent Notes
                        </label>
                        <textarea 
                            className="bg-surface-alt border border-border-subtle text-text-primary p-3 text-xs font-medium w-full outline-none rounded-xl focus:border-amber-500 transition-all resize-none h-20 shadow-inner"
                            value={formData.agentNotes}
                            onChange={e => setFormData({...formData, agentNotes: e.target.value})}
                            placeholder="Enter tactical intel for the follow-up..."
                        />
                    </div>
                </div>
            </div>

            <div className="p-5 border-t border-border-subtle bg-surface-alt/30">
                <Button 
                    variant="primary" 
                    onClick={handleSubmit}
                    disabled={isSubmitting || !formData.name || !formData.phone || !targetTimestamp || isSuccess} 
                    className={`w-full h-14 text-[10px] font-black uppercase tracking-[0.25em] shadow-lg transition-all duration-300 relative overflow-hidden group/btn ${
                        isSuccess ? 'bg-status-success' : 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20'
                    }`}
                >
                    {isSuccess ? (
                        <div className="flex items-center justify-center gap-3 animate-in zoom-in duration-300">
                            <Check size={18} strokeWidth={4} /> LOGGED TO LEAD POOL
                        </div>
                    ) : isSubmitting ? (
                        <div className="flex items-center justify-center gap-3 animate-pulse">
                            <RefreshCw size={18} className="animate-spin" /> SYNCHRONIZING...
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-3">
                            <Bell size={16} /> SAVE CALLBACK PROTOCOL
                        </div>
                    )}
                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none"></div>
                </Button>
            </div>
        </Card>
    );
};