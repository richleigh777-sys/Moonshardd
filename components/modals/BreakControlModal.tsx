import React from 'react';
import { Utensils, Zap, Clock, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Base';
import { useAuth, useTimer } from '../../hooks/useAuth';
import { useCRM } from '../../hooks/useCRM';
import { sfx } from '../../lib/soundService';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const BREAK_TYPES = [
    { id: 'lunch', label: 'Lunch Break', icon: Utensils, duration: '60m', color: 'text-status-success', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { id: 'bio', label: 'Bio Break', icon: Zap, duration: '15m', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { id: 'meeting', label: 'Team Meeting', icon: Clock, duration: '30m', color: 'text-status-warning', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { id: 'other', label: 'Personal / Other', icon: AlertCircle, duration: '?', color: 'text-text-muted', bg: 'bg-surface-alt', border: 'border-border-subtle' },
];

export const BreakControlModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const { currentUser } = useAuth();
    const { onToggleBreak } = useTimer();
    const { logAttendance } = useCRM();

    const handleStartBreak = (reason: string) => {
        sfx.playClick();
        if (currentUser) {
            logAttendance('BREAK_START', reason);
        }
        onToggleBreak(reason);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Select Break Type"
            size="sm"
        >
            <div className="space-y-3">
                <p className="text-xs text-text-muted mb-4">
                    Please select a reason for stepping away. Your status will be updated to "Away".
                </p>
                
                <div className="grid grid-cols-1 gap-3">
                    {BREAK_TYPES.map((type) => {
                        const Icon = type.icon;
                        return (
                            <button
                                key={type.id}
                                onClick={() => handleStartBreak(type.label)}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:scale-[1.02] active:scale-[0.98] ${type.bg} ${type.border} group`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg bg-surface-main ${type.color}`}>
                                        <Icon size={20} />
                                    </div>
                                    <div className="text-left">
                                        <span className="block text-sm font-bold text-text-primary group-hover:text-status-success transition-colors">
                                            {type.label}
                                        </span>
                                        <span className="text-xs font-mono text-text-muted opacity-70">
                                            Standard Duration: {type.duration}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="pt-4 border-t border-border-subtle mt-4">
                    <Button onClick={onClose} variant="secondary" className="w-full">
                        Cancel
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
