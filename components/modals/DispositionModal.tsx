import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { PhoneMissed, PhoneOff, CalendarClock, Ban, Check, X, Calendar, Clock, DollarSign, Save } from 'lucide-react';
import { EnrollmentState } from '../../types';

interface DispositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (disposition: any) => void;
  formData: EnrollmentState;
}

export const DispositionModal: React.FC<DispositionModalProps> = ({ isOpen, onClose, onSave, formData }) => {
  const [outcome, setOutcome] = useState<'busy' | 'not_interested' | 'disconnected' | 'callback' | 'hold_order'>('busy');
  const [callbackDate, setCallbackDate] = useState('');
  const [callbackTime, setCallbackTime] = useState('');
  const [notes, setNotes] = useState('');

  const outcomes = [
    { id: 'busy', label: 'Customer Busy', icon: PhoneMissed, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { id: 'not_interested', label: 'Not Interested', icon: Ban, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
    { id: 'disconnected', label: 'Disconnected', icon: PhoneOff, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
    { id: 'callback', label: 'Set Callback (Lead)', icon: CalendarClock, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
    { id: 'hold_order', label: 'Hold / Schedule Charge', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  ];

  const handleSave = () => {
    let cbTimestamp = undefined;
    if ((outcome === 'callback' || outcome === 'hold_order') && callbackDate) {
       const dateStr = `${callbackDate}T${callbackTime || '12:00'}:00`;
       cbTimestamp = new Date(dateStr).getTime();
    }
    
    onSave({
      outcome,
      notes,
      callbackTimestamp: cbTimestamp
    });
    
    // Reset internal state
    setOutcome('busy');
    setNotes('');
    setCallbackDate('');
    setCallbackTime('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Call Disposition" size="md">
      <div className="space-y-4 pb-2">
        <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Select Call Outcome</p>
            <div className="grid grid-cols-2 gap-2">
            {outcomes.map(o => {
                const Icon = o.icon;
                const isSelected = outcome === o.id;
                return (
                <button
                    key={o.id}
                    onClick={() => setOutcome(o.id as any)}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${isSelected ? `bg-surface-main ${o.border} shadow-sm ring-1 ring-${o.color.split('-')[1]}-500/50` : 'bg-surface-alt border-border-subtle hover:border-text-muted'}`}
                >
                    <Icon size={24} className={`${isSelected ? o.color : 'text-text-muted'}`} />
                    <span className={`text-[11px] font-bold text-center ${isSelected ? 'text-text-primary' : 'text-text-muted'}`}>{o.label}</span>
                </button>
                );
            })}
            </div>
        </div>

        {(outcome === 'callback' || outcome === 'hold_order') && (
            <div className="bg-surface-alt/50 border border-border-subtle p-4 rounded-xl space-y-3">
               <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Schedule Time</p>
               <div className="grid grid-cols-2 gap-3">
                   <div className="relative">
                      <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input 
                        type="date" 
                        value={callbackDate}
                        onChange={e => setCallbackDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-surface-main border border-border-subtle rounded-lg text-sm text-text-primary focus:border-indigo-500 outline-none"
                      />
                   </div>
                   <div className="relative">
                      <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input 
                        type="time" 
                        value={callbackTime}
                        onChange={e => setCallbackTime(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-surface-main border border-border-subtle rounded-lg text-sm text-text-primary focus:border-indigo-500 outline-none"
                      />
                   </div>
               </div>
               {outcome === 'hold_order' && (
                 <p className="text-[10px] text-text-muted">
                   <span className="text-emerald-500 font-bold">Hold Order:</span> This will save the current cart and payment details. You will be reminded on this date to re-submit this order for processing.
                 </p>
               )}
            </div>
        )}

        <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Disposition Notes</p>
            <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="E.g., Customer requested call back next week regarding pricing..."
                className="w-full h-24 p-3 bg-surface-alt border border-border-subtle rounded-xl text-sm text-text-primary resize-none focus:border-indigo-500 outline-none placeholder:text-text-muted/50"
            />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border-subtle">
           <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-text-muted hover:text-text-primary transition-colors">
              Cancel
           </button>
           <button 
             disabled={((outcome === 'callback' || outcome === 'hold_order') && !callbackDate)}
             onClick={handleSave} 
             className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-2"
           >
              <Save size={14} /> Save Disposition & Clear Form
           </button>
        </div>
      </div>
    </Modal>
  );
};
