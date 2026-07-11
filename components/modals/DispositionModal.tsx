import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getStorageItem } from '../../lib/storage';
import { Modal } from '../ui/Modal';
import { 
  PhoneMissed, PhoneOff, CalendarClock, Ban, Check, X, 
  Calendar, Clock, DollarSign, Save, Plus, Trash2, Settings, ChevronDown, Edit2
} from 'lucide-react';
import { EnrollmentState } from '../../hooks/useEnrollmentLogic';

interface DispositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (disposition: any) => void;
  formData: EnrollmentState;
}

export const DispositionModal: React.FC<DispositionModalProps> = ({ isOpen, onClose, onSave, formData }) => {
  const { currentUser } = useAuth();
  const [outcome, setOutcome] = useState<'busy' | 'not_interested' | 'disconnected' | 'callback' | 'hold_order'>('busy');
  const [callbackDate, setCallbackDate] = useState('');
  const [callbackTime, setCallbackTime] = useState('');
  const [notes, setNotes] = useState('');

  // Configurable Decline/Un-Converted Reasons persisting in localStorage
  const [reasons, setReasons] = useState<{id: string, reason: string}[]>([]);
   

  React.useEffect(() => {
    if (isOpen) {
      const tenantId = getStorageItem('nexus_server_id') || currentUser?.serverId || 'srv-001';
      fetch('/api/collections/disposition_reasons', {
        headers: { 'X-Tenant-ID': tenantId }
      })
      .then(r => r.ok ? r.json() : null)
      .then((data: any) => {
        if (data && data.data) {
          setReasons(data.data.map((d: any) => d.data || d));
        }
      })
      .catch(console.error)
      ;
    }
  }, [isOpen, currentUser]);

  const [selectedReason, setSelectedReason] = useState<string>('');
  const [showConfig, setShowConfig] = useState(false);
  const [newReasonText, setNewReasonText] = useState('');
  
  // Inline editing states for drop-down reasons
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>('');

  const outcomes = [
    { id: 'busy', label: 'Customer Busy', icon: PhoneMissed, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { id: 'not_interested', label: 'Not Interested', icon: Ban, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
    { id: 'disconnected', label: 'Disconnected', icon: PhoneOff, color: 'text-text-secondary', bg: 'bg-surface-alt', border: 'border-border-subtle' },
    { id: 'callback', label: 'Set Callback (Lead)', icon: CalendarClock, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
    { id: 'hold_order', label: 'Hold / Schedule Charge', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  ];

  const quickNoteTags = [
    "Left a voicemail",
    "No answer / Ringing",
    "Line busy",
    "Not interested anymore",
    "Needs to think about it",
    "Wants callback next week",
    "Spoke with spouse",
    "Bad timing - call later"
  ];

  const handleAddReason = async () => {
    const clean = newReasonText.trim();
    if (!clean) return;
    if (reasons.some(r => r.reason === clean)) {
      setNewReasonText('');
      return;
    }
    
    const newReason = { id: 'reason_' + Date.now(), reason: clean };
    const updated = [...reasons, newReason];
    setReasons(updated);
    
    const tenantId = getStorageItem('nexus_server_id') || currentUser?.serverId || 'srv-001';
    
    try {
      await fetch('/api/collections/disposition_reasons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': tenantId },
        body: JSON.stringify(newReason)
      });
    } catch (err) {
      console.error(err);
    }
    
    setNewReasonText('');
  };

  const handleDeleteReason = async (idToDelete: string) => {
    const updated = reasons.filter(r => r.id !== idToDelete);
    setReasons(updated);
    const tenantId = getStorageItem('nexus_server_id') || currentUser?.serverId || 'srv-001';
    
    try {
      await fetch(`/api/collections/disposition_reasons/${idToDelete}`, {
        method: 'DELETE',
        headers: { 'X-Tenant-ID': tenantId }
      });
    } catch (err) {
      console.error(err);
    }
    
    const deletingItem = reasons.find(r => r.id === idToDelete);
    if (deletingItem && selectedReason === deletingItem.reason) {
      setSelectedReason('');
    }
  };

  const handleStartEdit = (idx: number, text: string) => {
    setEditingIndex(idx);
    setEditingText(text);
  };

  const handleSaveEdit = async (idx: number) => {
    const clean = editingText.trim();
    if (!clean) return;
    const updated = [...reasons];
    const oldVal = updated[idx];
    
    // Create new object with updated reason text
    const updatedReason = { ...oldVal, reason: clean };
    updated[idx] = updatedReason;
    
    setReasons(updated);
    const tenantId = getStorageItem('nexus_server_id') || currentUser?.serverId || 'srv-001';
    
    try {
      await fetch('/api/collections/disposition_reasons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': tenantId },
        body: JSON.stringify(updatedReason)
      });
    } catch (err) {
      console.error(err);
    }
    
    if (selectedReason === oldVal.id) {
      setSelectedReason(updatedReason.id);
    }
    setEditingIndex(null);
    setEditingText('');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingText('');
  };

  // Compounding quick offset timers
  const addTimeOffset = (type: 'hour' | 'day' | 'week') => {
    let baseDate = new Date();
    if (callbackDate) {
      try {
        const [y, m, d] = callbackDate.split('-').map(Number);
        const [h, min] = (callbackTime || '12:00').split(':').map(Number);
        const parsed = new Date(y, m - 1, d, h, min, 0);
        if (!isNaN(parsed.getTime())) {
          baseDate = parsed;
        }
      } catch (err) {
        console.warn("Failed parsing date components:", err);
      }
    }
    
    let offset = 0;
    if (type === 'hour') offset = 60 * 60 * 1000;
    else if (type === 'day') offset = 24 * 60 * 60 * 1000;
    else if (type === 'week') offset = 7 * 24 * 60 * 60 * 1000;
    
    const newDate = new Date(baseDate.getTime() + offset);
    
    // Format YYYY-MM-DD
    const yyyy = newDate.getFullYear();
    const mm = String(newDate.getMonth() + 1).padStart(2, '0');
    const dd = String(newDate.getDate()).padStart(2, '0');
    setCallbackDate(`${yyyy}-${mm}-${dd}`);
    
    // Format HH:MM
    const hh = String(newDate.getHours()).padStart(2, '0');
    const min = String(newDate.getMinutes()).padStart(2, '0');
    setCallbackTime(`${hh}:${min}`);
  };

  const handleSave = () => {
    let cbTimestamp = undefined;
    if ((outcome === 'callback' || outcome === 'hold_order') && callbackDate) {
       const dateStr = `${callbackDate}T${callbackTime || '12:00'}:00`;
       cbTimestamp = new Date(dateStr).getTime();
    }
    
    // Dynamic decline notes prefix
    let finalNotes = notes.trim();
    if (selectedReason) {
      finalNotes = `[${selectedReason}] ${finalNotes}`.trim();
    }
    
    onSave({
      outcome,
      notes: finalNotes || `${outcome.toUpperCase()} disposition logged`,
      callbackTimestamp: cbTimestamp
    });
    
    // Reset state
    setOutcome('busy');
    setNotes('');
    setCallbackDate('');
    setCallbackTime('');
    setSelectedReason('');
    setShowConfig(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Call Disposition" size="md">
      <div className="space-y-4 pb-2">
        <div>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Select Call Outcome</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {outcomes.map(o => {
              const Icon = o.icon;
              const isSelected = outcome === o.id;
              return (
                <button
                  key={o.id}
                  onClick={() => {
                    setOutcome(o.id as any);
                    // Autofill first reason if unconverted outcome
                    if ((o.id === 'not_interested' || o.id === 'callback') && reasons.length > 0 && !selectedReason) {
                      setSelectedReason(reasons[0].id);
                    }
                  }}
                  className={`flex flex-col items-center justify-center gap-2 p-2.5 rounded-xl border transition-all ${isSelected ? `bg-surface-main ${o.border} shadow-sm ring-1 ring-indigo-500/30` : 'bg-surface-alt border-border-subtle hover:border-text-muted'}`}
                >
                  <Icon size={20} className={`${isSelected ? o.color : 'text-text-muted'}`} />
                  <span className={`text-[10px] font-bold text-center leading-tight ${isSelected ? 'text-text-primary' : 'text-text-muted'}`}>{o.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic & Editable Decline / Unconverted Reasons Selector */}
        {(outcome === 'not_interested' || outcome === 'callback' || outcome === 'busy' || outcome === 'disconnected') && (
          <div className="bg-surface-alt/40 border border-border-subtle p-3.5 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider">Un-Converted Reason Dropdown</p>
              <button 
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                className="text-text-muted hover:text-indigo-400 text-[10px] items-center gap-1.5 font-bold flex bg-surface-main/60 px-2 py-1 rounded border border-border-subtle"
              >
                <Settings size={12} className={showConfig ? 'text-indigo-400 animate-spin' : ''} /> {showConfig ? 'Close Editor' : 'Configure Reasons'}
              </button>
            </div>

            {showConfig ? (
              <div className="bg-surface-main border border-border-subtle rounded-lg p-3 space-y-2 animate-in fade-in duration-200">
                <p className="text-[10px] font-bold text-text-muted">Manage Custom Reasons (Saved Across Shifts)</p>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {reasons.map((r, i) => (
                    <div key={i} className="flex items-center justify-between gap-2.5 text-xs bg-surface-alt py-1.5 px-2.5 rounded border border-border-subtle/40">
                      {editingIndex === i ? (
                        <div className="flex items-center gap-1.5 w-full">
                          <input
                            type="text"
                            value={editingText}
                            onChange={e => setEditingText(e.target.value)}
                            className="flex-1 bg-surface-main text-xs px-1.5 py-0.5 rounded border border-border-subtle focus:border-indigo-500 outline-none font-semibold text-text-primary"
                            autoFocus
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSaveEdit(i);
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(i)}
                            className="text-emerald-500 hover:text-emerald-400 p-0.5 transition-colors shrink-0"
                            title="Save"
                          >
                            <Check size={12} strokeWidth={2.5} />
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="text-text-muted hover:text-text-primary p-0.5 transition-colors shrink-0"
                            title="Cancel"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="font-semibold text-text-secondary truncate flex-1">{r.reason}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(i, r.reason)}
                              className="text-text-muted hover:text-indigo-400 p-1 rounded hover:bg-surface-main/85 transition-colors"
                              title="Edit reason"
                            >
                              <Edit2 size={11} />
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleDeleteReason(r.id)}
                              className="text-text-muted hover:text-rose-500 p-1 rounded hover:bg-surface-main/85 transition-colors"
                              title="Delete reason"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  {reasons.length === 0 && (
                    <p className="text-[10px] text-text-muted text-center py-2">No reasons configured yet.</p>
                  )}
                </div>
                <div className="flex gap-2 pt-1 border-t border-border-subtle">
                  <input 
                    type="text"
                    value={newReasonText}
                    onChange={e => setNewReasonText(e.target.value)}
                    placeholder="New custom reason..."
                    className="flex-1 bg-surface-alt text-xs px-2 py-1.5 rounded border border-border-subtle focus:border-indigo-500 outline-none"
                    onKeyDown={e => e.key === 'Enter' && handleAddReason()}
                  />
                  <button 
                    type="button" 
                    onClick={handleAddReason}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white rounded p-1.5 text-xs font-bold"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <select 
                  value={selectedReason}
                  onChange={e => setSelectedReason(e.target.value)}
                  className="w-full bg-surface-main border border-border-subtle rounded-lg px-3 py-2 text-xs font-semibold text-text-primary outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                >
                  <option value="">-- Choose pre-configured reason (Optional) --</option>
                  {reasons.map((r) => (
                    <option key={r.id} value={r.reason}>{r.reason}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              </div>
            )}
          </div>
        )}

        {/* Compounding Callback Schedule System with Timers */}
        {(outcome === 'callback' || outcome === 'hold_order') && (
          <div className="bg-surface-alt/50 border border-border-subtle p-4 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Schedule Callback Target</p>
              
              {/* Compounding offset buttons */}
              <div className="flex items-center gap-1">
                <button 
                  type="button" 
                  onClick={() => addTimeOffset('hour')}
                  className="px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500 hover:text-white border border-indigo-500/20 text-indigo-400 font-extrabold text-[9px] rounded transition-all active:scale-95"
                >
                  +1 Hour
                </button>
                <button 
                  type="button" 
                  onClick={() => addTimeOffset('day')}
                  className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 text-emerald-400 font-extrabold text-[9px] rounded transition-all active:scale-95"
                >
                  +1 Day
                </button>
                <button 
                  type="button" 
                  onClick={() => addTimeOffset('week')}
                  className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500 hover:text-white border border-amber-500/20 text-amber-400 font-extrabold text-[9px] rounded transition-all active:scale-95"
                >
                  +1 Week
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input 
                  type="date" 
                  value={callbackDate}
                  onChange={e => setCallbackDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-surface-main border border-border-subtle rounded-lg text-xs font-semibold text-text-primary focus:border-indigo-500 outline-none"
                />
              </div>
              <div className="relative">
                <Clock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input 
                  type="time" 
                  value={callbackTime}
                  onChange={e => setCallbackTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-surface-main border border-border-subtle rounded-lg text-xs font-semibold text-text-primary focus:border-indigo-500 outline-none"
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

        {/* Quick Clickable Notes Tags / Templated Text Accumulation */}
        <div>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Click Quick-Notes Options (No typing needed)</p>
          <div className="flex flex-wrap gap-1.5 mb-2.5 max-h-24 overflow-y-auto p-0.5 bg-surface-alt/20 border border-border-subtle/50 rounded-xl">
            {quickNoteTags.map((tag, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setNotes(prev => prev ? `${prev} | ${tag}` : tag)}
                className="px-2 py-1.5 rounded-lg border border-border-subtle bg-surface-alt/70 hover:bg-surface-main hover:border-indigo-400 text-text-secondary text-[10px] font-semibold transition-all active:scale-95 whitespace-nowrap cursor-pointer"
              >
                + {tag}
              </button>
            ))}
          </div>

          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Disposition Notes</p>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="E.g., Customer requested call back next week regarding pricing..."
            className="w-full h-20 p-3 bg-surface-alt border border-border-subtle rounded-xl text-xs text-text-primary resize-none focus:border-indigo-500 outline-none placeholder:text-text-muted/50"
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
