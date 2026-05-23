import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Base';
import { Sale } from '../../../types';
import { CheckCircle, XCircle } from 'lucide-react';

interface Props {
    sale: Sale;
    actionType: 'approve' | 'decline';
    onConfirm: (payload: any) => void;
    onClose: () => void;
}

const DECLINE_REASONS = [
    'Card Declined / Insufficient Funds',
    'Fraud Suspected',
    'Customer Cancelled / Cold Feet',
    'Duplicate Order',
    'Missing / Invalid Information',
    'Out of Stock / Unable to Fulfill',
    'Other Administrative Decline'
];

export const OrderProcessingModal: React.FC<Props> = ({ sale, actionType, onConfirm, onClose }) => {
    const [txnId, setTxnId] = useState('');
    const [reason, setReason] = useState(DECLINE_REASONS[0]);
    const [customReason, setCustomReason] = useState('');
    const [sendToRecovery, setSendToRecovery] = useState(true);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (actionType === 'approve') {
            onConfirm({ txnId });
        } else {
            const finalReason = reason === 'Other Administrative Decline' && customReason ? customReason : reason;
            onConfirm({ reason: finalReason, sendToRecovery });
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={actionType === 'approve' ? 'Approve Order' : 'Decline Order'}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-4 bg-surface-alt/50 rounded-xl border border-border-subtle mb-4">
                    <p className="text-sm font-bold text-text-primary">{sale.customer}</p>
                    <p className="text-xs text-text-muted">{sale.product} - ${sale.amount}</p>
                </div>

                {actionType === 'approve' ? (
                    <div className="space-y-2">
                        <label className="text-xs font-[700]  tracking-widest text-text-muted">Gateway Transaction / Order ID</label>
                        <input
                            type="text"
                            value={txnId}
                            onChange={(e) => setTxnId(e.target.value)}
                            placeholder="Optional: Auto-generated if blank"
                            className="w-full bg-surface-main border border-border-subtle rounded-lg px-4 py-2 text-sm text-text-primary outline-none focus:border-accent-primary"
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-[700]  tracking-widest text-text-muted">Decline Reason</label>
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full bg-surface-main border border-border-subtle rounded-lg px-4 py-2 text-sm text-text-primary outline-none focus:border-accent-primary"
                            >
                                {DECLINE_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            {reason === 'Other Administrative Decline' && (
                                <input
                                    type="text"
                                    value={customReason}
                                    onChange={(e) => setCustomReason(e.target.value)}
                                    placeholder="Enter specific reason..."
                                    required
                                    className="w-full bg-surface-main border border-border-subtle rounded-lg px-4 py-2 text-sm text-text-primary outline-none focus:border-accent-primary mt-2"
                                />
                            )}
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-surface-alt/40 border border-border-subtle rounded-xl cursor-pointer" onClick={() => setSendToRecovery(!sendToRecovery)}>
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${sendToRecovery ? 'bg-accent-primary border-accent-primary text-white' : 'border-border-strong text-transparent'}`}>
                                <CheckCircle size={14} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-text-primary">Send to Recovery Engine</p>
                                <p className="text-xs text-text-muted mt-0.5">Automatically drops this lead into the retention pipeline</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border-subtle">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button 
                        type="submit" 
                        variant="primary" 
                        className={actionType === 'approve' ? '!bg-emerald-500 hover:!bg-emerald-600' : '!bg-rose-500 hover:!bg-rose-600'}
                    >
                        {actionType === 'approve' ? <><CheckCircle size={16}/> Approve</> : <><XCircle size={16}/> Decline</>}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
