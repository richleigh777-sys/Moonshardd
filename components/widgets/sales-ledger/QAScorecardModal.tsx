import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Base';
import { Sale } from '../../../types';
import { Star, MessageSquare } from 'lucide-react';

interface Props {
    sale: Sale;
    onSave: (payload: { qaScore: number, qaNotes: string }) => void;
    onClose: () => void;
}

export const QAScorecardModal: React.FC<Props> = ({ sale, onSave, onClose }) => {
    const [score, setScore] = useState(sale.qaScore || 0);
    const [notes, setNotes] = useState(sale.qaNotes || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ qaScore: score, qaNotes: notes });
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="QA & Compliance Scorecard" size="md">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="p-4 bg-surface-alt/50 rounded-xl border border-border-subtle">
                    <p className="text-sm font-bold text-text-primary">{sale.agent} <span className="text-text-muted font-normal text-xs ml-2">Agent</span></p>
                    <p className="text-xs text-text-muted mt-1">{sale.customer} - ${sale.amount}</p>
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-[700]  tracking-widest text-text-muted">Compliance Rating (1-5)</label>
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((val) => (
                            <button
                                key={val}
                                type="button"
                                onClick={() => setScore(val)}
                                className={`p-3 rounded-xl border transition-all ${
                                    score >= val 
                                        ? 'bg-amber-500/10 border-amber-500 text-status-warning scale-110' 
                                        : 'bg-surface-alt border-border-subtle text-text-muted hover:border-amber-500/50'
                                }`}
                            >
                                <Star size={24} fill={score >= val ? 'currentColor' : 'none'} />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-[700]  tracking-widest text-text-muted flex items-center gap-2">
                        <MessageSquare size={14} /> Review Notes
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Enter QA feedback..."
                        className="w-full bg-surface-main border border-border-subtle rounded-lg px-4 py-3 text-sm text-text-primary outline-none focus:border-accent-primary min-h-[100px] resize-none"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="primary" className="shadow-lg shadow-accent-primary/20">Save Scorecard</Button>
                </div>
            </form>
        </Modal>
    );
};
