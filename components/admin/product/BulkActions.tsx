
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
        <div className="bg-amber-500/5 border-b border-amber-500/20 p-4 flex items-center justify-center gap-4 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 text-amber-600 rounded-lg">
                    <Percent size={18} strokeWidth={2.5}/>
                </div>
                <span className="text-sm font-medium  text-amber-600 tracking-wide">Global Calibration</span>
            </div>
            <div className="flex items-center gap-3">
                <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                    type="number" 
                    value={factor} 
                    onChange={e => setFactor(e.target.value)}
                    className="w-20 bg-surface-main border-2 border-status-warning/30 rounded-xl px-3 py-2 text-sm font-medium text-center outline-none focus:border-amber-500"
                />
                <Button onClick={handleApply} variant="glow" className="h-10 text-sm px-4 bg-amber-500 hover:bg-amber-600 border-amber-600 text-white">Apply Shift</Button>
                <button onClick={onClose} className="text-text-muted hover:text-status-error px-2"><X size={16}/></button>
            </div>
        </div>
    );
};
