 
import React, { useState, useEffect, useRef } from 'react';
import { Clock, Bell, Check, Plus, Timer, Calendar, RefreshCw, StickyNote, ChevronDown } from 'lucide-react';
import { Card, Input, Button } from '../../components/ui/Base';
import { formatUSAPhone } from '../../views/utils/crmLogic'; 
import { User, Note } from '../../types';
import { sfx } from '../../lib/soundService';

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

    const [targetTimestamp, setTargetTimestamp] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [countdownText, setCountdownText] = useState<string>('');
    
    const notifiedRef = useRef<boolean>(false);

    // Sync from EnrollmentForm (Auto-write feature)
    useEffect(() => {
        if (initialData) {
            setFormData(prev => {
                const newName = initialData.name || prev.name;
                const newPhone = initialData.phone || prev.phone;
                if (prev.name === newName && prev.phone === newPhone) {
                    return prev;
                }
                return {
                    ...prev,
                    name: newName,
                    phone: newPhone,
                };
            });
        }
    }, [initialData?.name, initialData?.phone]);

    const [hClicks, setHClicks] = useState(0);
    const [dClicks, setDClicks] = useState(0);
    const [wClicks, setWClicks] = useState(0);

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

    const addHours = (h: number) => {
        sfx.playClick();
        setHClicks(prev => prev + h);
        setTargetTimestamp(prev => {
            const base = (prev && prev > Date.now()) ? prev : Date.now();
            return base + (h * 3600000);
        });
    };

    const addDays = (d: number) => {
        sfx.playClick();
        setDClicks(prev => prev + d);
        setTargetTimestamp(prev => {
            const base = (prev && prev > Date.now()) ? prev : Date.now();
            return base + (d * 86400000);
        });
    };

    const addWeeks = (w: number) => {
        sfx.playClick();
        setWClicks(prev => prev + w);
        setTargetTimestamp(prev => {
            const base = (prev && prev > Date.now()) ? prev : Date.now();
            return base + (w * 604800000);
        });
    };

    const clearOffsets = () => {
        sfx.playTrash();
        setHClicks(0);
        setDClicks(0);
        setWClicks(0);
        setTargetTimestamp(null);
    };

    const handleOutcomeClick = (outcome: string) => {
        sfx.playConfirm();
        const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const textToAppend = `[Attempted: ${outcome} @ ${timestampStr}]`;
        
        setFormData(prev => {
            const alreadyLogged = prev.agentNotes.includes(textToAppend);
            const nextNotes = alreadyLogged 
                ? prev.agentNotes 
                : prev.agentNotes 
                    ? `${prev.agentNotes}\n${textToAppend}`
                    : textToAppend;

            return {
                ...prev,
                reason: outcome === 'No Answer' ? 'Disconnected / No Answer' :
                        outcome === 'Busy' ? 'Driving / Busy' :
                        outcome === 'Left a Voicemail' ? 'Left Voicemail' :
                        'Declined Recovery',
                agentNotes: nextNotes
            };
        });
    };

    const reasons = [
        "Package Update", "Driving / Busy", "No Funds Available", "Wants to Think",
        "Spouse Approval", "Researching Competitor", "Disconnected / No Answer", "Declined Recovery", "Left Voicemail"
    ];

    const outcomes = [
        { label: 'No Answer', outcome: 'No Answer', color: 'hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-400' },
        { label: 'Busy', outcome: 'Busy', color: 'hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-400' },
        { label: 'Left a Voicemail', outcome: 'Left a Voicemail', color: 'hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-400' },
        { label: 'Not Interested', outcome: 'Not Interested', color: 'hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400' }
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
            let callbackPriority = 'Mid';
            if (['Package Update', 'Wants to Think', 'Spouse Approval'].includes(formData.reason)) {
                callbackPriority = 'High';
            } else if (['Declined Recovery', 'No Funds Available'].includes(formData.reason)) {
                callbackPriority = 'Low';
            } else if (['Disconnected / No Answer', 'Left Voicemail', 'Driving / Busy'].includes(formData.reason)) {
                callbackPriority = 'Mid';
            }

            await onAddNote({
                agentId: currentUser?.id,
                agentName: currentUser?.name || 'Unknown',
                type: 'callback',
                content: `${formData.reason} | ${formData.agentNotes}`,
                reason: formData.reason,
                customerName: formData.name,
                phone: formData.phone,
                date: targetDate.toLocaleDateString(),
                time: targetDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                timestamp: targetTimestamp,
                createdAt: Date.now(),
                priority: callbackPriority as any
            });
            
            sfx.playSuccess();
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                if (!initialData) {
                    setFormData({ name: '', phone: '', reason: 'Package Update', notes: '', agentNotes: '' });
                    setTargetTimestamp(null);
                    setHClicks(0);
                    setDClicks(0);
                    setWClicks(0);
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
            
            <div className="p-5 border-b border-border-subtle bg-surface-alt/50 flex justify-between items-center shrink-0 ">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/10 rounded-xl text-status-warning border border-amber-500/20 shadow-neon">
                        <Timer size={20} strokeWidth={2.5} className={targetTimestamp ? 'animate-pulse' : ''} />
                    </div>
                    <div>
                        <h3 className="text-base font-medium text-text-primary  tracking-tight italic">Recovery Link</h3>
                        <p className="text-sm text-text-muted font-medium  tracking-[0.25em]">Lead Scheduler v5.0</p>
                    </div>
                </div>
                {countdownText && (
                    <div className="px-3 py-1.5 bg-amber-500 text-black rounded-lg font-medium text-sm  tracking-wide shadow-lg animate-in zoom-in">
                        {countdownText}
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium  text-text-muted tracking-wide ml-1">Client Identity</label>
                        <Input 
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})} 
                            placeholder="Full Name" 
                            className="bg-surface-alt border-border-subtle h-11"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium  text-text-muted tracking-wide ml-1">Phone Line</label>
                        <Input 
                            value={formData.phone} 
                            onChange={e => setFormData({...formData, phone: formatUSAPhone(e.target.value)})} 
                            placeholder="(555) 000-0000" 
                            maxLength={14}
                            className="bg-surface-alt border-border-subtle h-11"
                        />
                    </div>
                </div>

                {/* QUICK OUTCOMES / WHAT HAPPENED SECTION */}
                <div className="space-y-3">
                    <div className="flex flex-col gap-0.5">
                        <label className="text-sm font-medium text-amber-500 tracking-wide ml-1 flex items-center gap-1.5 uppercase">
                            <Check size={16} className="text-emerald-500" /> 1. Auto-Log Current Attempt
                        </label>
                        <p className="text-sm sm:text-sm text-text-muted px-1 leading-snug">
                            Did they answer? Click an outcome below to instantly log what happened. It will auto-fill your agent notes and adjust the Callback Protocol category automatically.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {outcomes.map(item => (
                            <button
                                key={item.label}
                                type="button"
                                onClick={() => handleOutcomeClick(item.outcome)}
                                className={`
                                    py-2 px-3 bg-surface-alt border border-border-subtle rounded-xl 
                                    text-sm font-medium tracking-wider text-text-secondary transition-all 
                                    active:scale-95 shadow-sm text-center truncate ${item.color}
                                `}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* TEMPORAL OFFSET */}
                <div className="space-y-3 mt-2">
                    <div className="flex flex-col gap-0.5">
                        <label className="text-sm font-medium text-amber-500 tracking-wide ml-1 flex items-center gap-2 uppercase">
                            <Clock size={16} className="text-status-warning" /> 2. Set Timer
                        </label>
                        <p className="text-sm sm:text-sm text-text-muted px-1 leading-snug">
                            When should the system remind you to call them back? Click the buttons to add time.
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <button 
                            type="button" 
                            onClick={() => addHours(1)} 
                            className="relative h-12 bg-surface-alt hover:bg-amber-500 hover:text-black border border-border-subtle rounded-xl text-sm font-medium tracking-wide transition-all active:scale-95 shadow-sm overflow-hidden"
                        >
                            <span className="relative z-10 flex flex-col items-center justify-center">
                                <span>+1 HOUR</span>
                                {hClicks > 0 && <span className="text-sm text-amber-900 font-bold opacity-85">({hClicks} added)</span>}
                            </span>
                        </button>
                        <button 
                            type="button" 
                            onClick={() => addDays(1)} 
                            className="relative h-12 bg-surface-alt hover:bg-amber-500 hover:text-black border border-border-subtle rounded-xl text-sm font-medium tracking-wide transition-all active:scale-95 shadow-sm overflow-hidden"
                        >
                            <span className="relative z-10 flex flex-col items-center justify-center">
                                <span>+1 DAY</span>
                                {dClicks > 0 && <span className="text-sm text-amber-900 font-bold opacity-85">({dClicks} added)</span>}
                            </span>
                        </button>
                        <button 
                            type="button" 
                            onClick={() => addWeeks(1)} 
                            className="relative h-12 bg-surface-alt hover:bg-amber-500 hover:text-black border border-border-subtle rounded-xl text-sm font-medium tracking-wide transition-all active:scale-95 shadow-sm overflow-hidden"
                        >
                            <span className="relative z-10 flex flex-col items-center justify-center">
                                <span>+1 WEEK</span>
                                {wClicks > 0 && <span className="text-sm text-amber-900 font-bold opacity-85">({wClicks} added)</span>}
                            </span>
                        </button>
                    </div>

                    {targetTimestamp && (
                        <div className="flex items-center justify-between p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl animate-in slide-in-from-top-1">
                            <div className="flex items-center gap-3">
                                <Calendar size={16} className="text-status-warning" />
                                <div>
                                    <p className="text-sm font-medium text-text-muted  tracking-wide">Scheduled Window (Offset-based)</p>
                                    <p className="text-sm font-bold text-text-primary num-font">
                                        {new Date(targetTimestamp).toLocaleDateString()} @ {new Date(targetTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                            <button 
                                type="button" 
                                onClick={clearOffsets} 
                                className="p-1.5 text-text-muted hover:text-status-error transition-colors"
                                title="Reset offsets"
                            >
                                <Plus size={16} className="rotate-45" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="space-y-5 pt-2 border-t border-border-subtle mt-4">
                    <div className="space-y-2">
                        <div className="flex flex-col gap-0.5">
                            <label className="text-sm font-medium text-amber-500 tracking-wide ml-1 uppercase">
                                3. Callback Protocol Category
                            </label>
                            <p className="text-sm sm:text-sm text-text-muted px-1 leading-snug">
                                This categorizes the reason for the <strong>future callback</strong> in the Recovery Pool. It dictates workflow priority (e.g. Package Update = High Priority). The outcome buttons above may have already selected the right category for you.
                            </p>
                        </div>
                        <div className="relative">
                            <select 
                                className="bg-surface-alt border border-border-subtle text-text-primary px-4 py-3 h-14 text-sm sm:text-base font-bold w-full outline-none rounded-xl focus:border-amber-500 transition-all cursor-pointer shadow-inner appearance-none"
                                value={formData.reason}
                                onChange={e => setFormData({...formData, reason: e.target.value})}
                            >
                                {reasons.map(r => <option key={r} value={r} className="bg-surface-main py-2">{r}</option>)}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <ChevronDown size={20} className="text-text-muted" />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex flex-col gap-0.5">
                            <label className="text-sm font-medium text-amber-500 tracking-wide ml-1 flex items-center gap-1.5 uppercase">
                                <StickyNote size={16} /> 4. Additional Intelligence
                            </label>
                            <p className="text-sm sm:text-sm text-text-muted px-1 leading-snug">
                                Add any extra notes, buying signals, or specific details the agent needs to know for the next call.
                            </p>
                        </div>
                        <textarea 
                            className="bg-surface-alt border border-border-subtle text-text-primary p-4 text-sm font-medium w-full outline-none rounded-xl focus:border-amber-500 transition-all resize-none h-28 shadow-inner"
                            value={formData.agentNotes}
                            onChange={e => setFormData({...formData, agentNotes: e.target.value})}
                            placeholder="Tactical intelligence for the callback..."
                        />
                    </div>
                </div>
            </div>

            <div className="p-5 border-t border-border-subtle bg-surface-alt/30">
                <Button 
                    variant="primary" 
                    onClick={handleSubmit}
                    disabled={isSubmitting || !formData.name || !formData.phone || !targetTimestamp || isSuccess} 
                    className={`w-full h-14 text-sm font-medium  tracking-[0.25em] shadow-lg transition-all duration-300 relative overflow-hidden group/btn ${
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
                    <div className="absolute inset-0 bg-surface-highlight translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none"></div>
                </Button>
            </div>
        </Card>
    );
};