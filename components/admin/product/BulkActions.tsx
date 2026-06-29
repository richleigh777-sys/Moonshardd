
import React, { useState } from 'react';
import { Percent, X } from 'lucide-react';
import { Button } from '../../ui/Base';
import { sfx } from '../../../lib/soundService';

interface Props {
    onAdjust: (percent: number) => void;
    onClose: () => void;
}

export const BulkActions: React.FC<Props> = ({ onAdjust, onClose }) => {
    const [factor, setFactor] = useState('0');

    const handleApply = () => {
        sfx.playSubmit();
        onAdjust(parseFloat(factor));
    };

    return (
        <div className="bg-surface-alt/80 border-b border-border-strong p-3 flex items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-300 shadow-inner">
            <div className="flex items-center gap-3">
                <div className="p-1.5 bg-status-warning/10 text-status-warning border border-status-warning/20 rounded">
                    <Percent size={14} strokeWidth={2.5}/>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-text-primary">Global Price Calibration</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted font-bold mr-2">+/- %</span>
                <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                    type="number" 
                    value={factor} 
                    onChange={e => setFactor(e.target.value)}
                    className="w-20 bg-surface-main border border-border-strong rounded-md px-3 py-1.5 text-sm font-bold text-center outline-none focus:border-status-warning focus:ring-1 focus:ring-status-warning shadow-sm"
                />
                <Button onClick={handleApply} variant="secondary" className="h-[34px] text-[11px] font-bold uppercase tracking-widest px-4 border-status-warning/30 hover:border-status-warning hover:bg-status-warning/10 hover:text-status-warning transition-all text-text-primary shadow-sm bg-surface-main">Apply Shift</Button>
                <div className="w-px h-6 bg-border-strong mx-1"></div>
                <button onClick={onClose} className="text-text-muted hover:text-status-error px-2 transition-colors"><X size={16}/></button>
            </div>
        </div>
    );
};
