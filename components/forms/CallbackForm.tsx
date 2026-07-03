 
import React, { useState, useEffect, useRef } from 'react';
import { Clock, Bell, Check, Plus, Timer, RefreshCw, StickyNote, ChevronDown, Phone, User as UserIcon } from 'lucide-react';
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

    useEffect(() => {
        if (initialData) {
            setFormData(prev => {
                const newName = initialData.name || prev.name;
                const newPhone = initialData.phone || prev.phone;
                if (prev.name === newName && prev.phone === newPhone) return prev;
                return { ...prev, name: newName, phone: newPhone };
            });
        }
    }, [initialData?.name, initialData?.phone]);

    const [hClicks, setHClicks] = useState(0);
    const [dClicks, setDClicks] = useState(0);
    const [wClicks, setWClicks] = useState(0);

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

            if (diff <= 300000 && diff > 290000 && !notifiedRef.current) {
                notifiedRef.current = true;
                sfx.playPhoneRing();
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

        return () => clearInterval(interval);
    }, [targetTimestamp]);

    const addTime = (h: number, d: number, w: number) => {
        sfx.playClick();
        if (h) setHClicks(p => p + h);
        if (d) setDClicks(p => p + d);
        if (w) setWClicks(p => p + w);
        setTargetTimestamp(prev => {
            const base = (prev && prev > Date.now()) ? prev : Date.now();
            return base + (h * 3600000) + (d * 86400000) + (w * 604800000);
        });
    };

    const clearOffsets = () => {
        sfx.playTrash();
        setHClicks(0); setDClicks(0); setWClicks(0);
        setTargetTimestamp(null);
    };

    const handleOutcomeClick = (outcome: string) => {
        sfx.playConfirm();
        const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const noteAdd = `[${outcome} @ ${ts}]`;
        
        setFormData(prev => {
            const nextNotes = prev.agentNotes.includes(noteAdd) ? prev.agentNotes : (prev.agentNotes ? `${prev.agentNotes}\n${noteAdd}` : noteAdd);
            const reasonMap: Record<string, string> = {
                'No Answer': 'Disconnected / No Answer',
                'Busy': 'Driving / Busy',
                'Left Voicemail': 'Left Voicemail',
                'Not Interested': 'Declined Recovery'
            };
            return {
                ...prev,
                reason: reasonMap[outcome] || 'Package Update',
                agentNotes: nextNotes
            };
        });
    };

    const reasons = ["Package Update", "Driving / Busy", "No Funds Available", "Wants to Think", "Spouse Approval", "Researching Competitor", "Disconnected / No Answer", "Declined Recovery", "Left Voicemail"];

    const outcomes = [
        { label: 'No Answer', outcome: 'No Answer', color: 'hover:bg-amber-500/10 text-amber-500 border-amber-500/20 hover:border-amber-500/50' },
        { label: 'Busy', outcome: 'Busy', color: 'hover:bg-indigo-500/10 text-indigo-500 border-indigo-500/20 hover:border-indigo-500/50' },
        { label: 'Voicemail', outcome: 'Left Voicemail', color: 'hover:bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:border-emerald-500/50' },
        { label: 'Declined', outcome: 'Not Interested', color: 'hover:bg-red-500/10 text-red-500 border-red-500/20 hover:border-red-500/50' }
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
            let priority = 'Mid';
            if (['Package Update', 'Wants to Think', 'Spouse Approval'].includes(formData.reason)) priority = 'High';
            else if (['Declined Recovery', 'No Funds Available'].includes(formData.reason)) priority = 'Low';

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
                priority: priority as any
            });
            
            sfx.playSuccess();
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                if (!initialData) {
                    setFormData({ name: '', phone: '', reason: 'Package Update', notes: '', agentNotes: '' });
                    clearOffsets();
                }
                notifiedRef.current = false;
            }, 2500);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="flex flex-col h-full bg-surface-main border border-border-subtle shadow-2xl overflow-hidden p-0">
            {/* Header */}
            <div className="px-4 py-2.5 border-b border-border-subtle bg-surface-alt/80 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Timer size={16} className={`text-amber-500 ${targetTimestamp ? 'animate-pulse' : ''}`} />
                    <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Recovery Link</h3>
                </div>
                {countdownText && (
                    <div className="px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded font-mono text-xs font-bold animate-in zoom-in">
                        {countdownText}
                    </div>
                )}
            </div>

            {/* Dashboard Layout */}
            <div className="flex-1 p-3 flex flex-col gap-3">
                {/* Row 1: Identity & Outcomes */}
                <div className="flex gap-3">
                    {/* Client Info */}
                    <div className="flex-1 bg-surface-alt/30 border border-border-subtle rounded-lg p-2 space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="flex-1 relative">
                                <UserIcon size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                                <Input 
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                    placeholder="Client Name" 
                                    className="h-8 pl-8 text-xs bg-surface-main"
                                />
                            </div>
                            <div className="flex-1 relative">
                                <Phone size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                                <Input 
                                    value={formData.phone} 
                                    onChange={e => setFormData({...formData, phone: formatUSAPhone(e.target.value)})} 
                                    placeholder="Phone Line" 
                                    maxLength={14}
                                    className="h-8 pl-8 text-xs bg-surface-main font-mono"
                                />
                            </div>
                        </div>
                    </div>
                    {/* Quick Outcomes */}
                    <div className="flex-[1.5] bg-surface-alt/30 border border-border-subtle rounded-lg p-2 flex items-center justify-center gap-1.5">
                        {outcomes.map(item => (
                            <button
                                key={item.label}
                                type="button"
                                onClick={() => handleOutcomeClick(item.outcome)}
                                className={`flex-1 h-8 bg-surface-main border rounded-md text-[10px] font-bold tracking-wider uppercase transition-all active:scale-95 ${item.color}`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Row 2: Logic & Notes */}
                <div className="flex flex-1 gap-3 min-h-0">
                    {/* Timer & Category */}
                    <div className="flex-1 flex flex-col gap-3">
                        <div className="bg-surface-alt/30 border border-border-subtle rounded-lg p-2 flex-1 flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1"><Clock size={12}/> Set Timer</span>
                                {targetTimestamp && (
                                    <button onClick={clearOffsets} className="text-status-error hover:text-red-400">
                                        <Plus size={14} className="rotate-45" />
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-3 gap-1.5 mb-2">
                                <button type="button" onClick={() => addTime(1, 0, 0)} className="h-9 bg-surface-main hover:bg-amber-500/10 text-text-primary border border-border-subtle hover:border-amber-500/30 rounded text-[10px] font-bold flex flex-col items-center justify-center">
                                    +1 HR {hClicks > 0 && <span className="text-[9px] text-amber-500">({hClicks})</span>}
                                </button>
                                <button type="button" onClick={() => addTime(0, 1, 0)} className="h-9 bg-surface-main hover:bg-amber-500/10 text-text-primary border border-border-subtle hover:border-amber-500/30 rounded text-[10px] font-bold flex flex-col items-center justify-center">
                                    +1 DAY {dClicks > 0 && <span className="text-[9px] text-amber-500">({dClicks})</span>}
                                </button>
                                <button type="button" onClick={() => addTime(0, 0, 1)} className="h-9 bg-surface-main hover:bg-amber-500/10 text-text-primary border border-border-subtle hover:border-amber-500/30 rounded text-[10px] font-bold flex flex-col items-center justify-center">
                                    +1 WK {wClicks > 0 && <span className="text-[9px] text-amber-500">({wClicks})</span>}
                                </button>
                            </div>
                            {targetTimestamp ? (
                                <div className="text-center p-1.5 bg-amber-500/10 rounded border border-amber-500/20">
                                    <p className="text-[10px] text-amber-500 font-mono font-bold">
                                        {new Date(targetTimestamp).toLocaleDateString()} @ {new Date(targetTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center p-1.5 bg-surface-main rounded border border-border-subtle opacity-50">
                                    <p className="text-[10px] text-text-muted font-mono font-bold">NO TIMER SET</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-surface-alt/30 border border-border-subtle rounded-lg p-2">
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 block">Protocol Category</span>
                            <div className="relative">
                                <select 
                                    className="w-full bg-surface-main border border-border-subtle text-text-primary px-3 h-8 text-xs font-medium outline-none rounded focus:border-amber-500 appearance-none cursor-pointer"
                                    value={formData.reason}
                                    onChange={e => setFormData({...formData, reason: e.target.value})}
                                >
                                    {reasons.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="flex-1 bg-surface-alt/30 border border-border-subtle rounded-lg p-2 flex flex-col min-h-0">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 flex items-center gap-1"><StickyNote size={12}/> Intelligence</span>
                        <textarea 
                            className="w-full flex-1 bg-surface-main border border-border-subtle text-text-primary p-2 text-xs outline-none rounded focus:border-amber-500 resize-none font-mono"
                            value={formData.agentNotes}
                            onChange={e => setFormData({...formData, agentNotes: e.target.value})}
                            placeholder="Tactical intelligence..."
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border-subtle bg-surface-alt/50">
                <Button 
                    variant="primary" 
                    onClick={handleSubmit}
                    disabled={isSubmitting || !formData.name || !formData.phone || !targetTimestamp || isSuccess} 
                    className={`w-full h-10 text-xs font-bold tracking-[0.2em] uppercase transition-all ${
                        isSuccess ? 'bg-status-success' : 'bg-amber-600 hover:bg-amber-500 text-white'
                    }`}
                >
                    {isSuccess ? (
                        <div className="flex items-center gap-2"><Check size={16} /> Logged to Pool</div>
                    ) : isSubmitting ? (
                        <div className="flex items-center gap-2"><RefreshCw size={16} className="animate-spin" /> Synchronizing...</div>
                    ) : (
                        <div className="flex items-center gap-2"><Bell size={16} /> Save Callback Protocol</div>
                    )}
                </Button>
            </div>
        </Card>
    );
};
