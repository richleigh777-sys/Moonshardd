
import React from 'react';
import { Delete } from 'lucide-react';

interface DialPadProps {
    value: string;
    onChange: (val: string) => void;
    onCall: () => void;
    onCancel: () => void;
}

export const DialPad: React.FC<DialPadProps> = ({ value, onChange, onCall, onCancel }) => {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

    const handlePress = (k: string) => {
        if (value.length < 15) onChange(value + k);
    };

    const handleDelete = () => {
        onChange(value.slice(0, -1));
    };

    return (
        <div className="flex flex-col h-full animate-in slide-in-from-bottom-4 duration-300">
            {/* Display Screen */}
            <div className="flex items-center gap-2 mb-4 bg-surface-alt/50 p-4 rounded-2xl border border-border-subtle shadow-inner">
                <span className="flex-1 text-2xl font-mono text-center tracking-widest font-[700] text-text-primary h-8 flex items-center justify-center overflow-hidden">
                    {value}
                    <span className="animate-pulse text-status-success">_</span>
                </span>
                <button 
                    onClick={handleDelete} 
                    className="p-2 text-text-muted hover:text-status-error transition-colors"
                    disabled={!value}
                >
                    <Delete size={20}/>
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-3 gap-3 flex-1 mb-4">
                {keys.map(k => (
                    <button
                        key={k}
                        onClick={() => handlePress(k)}
                        className="
                            h-12 w-full rounded-xl bg-surface-alt border border-border-subtle 
                            hover:bg-surface-highlight hover:border-status-success/50 hover:text-status-success hover:shadow-md
                            transition-all font-mono font-bold text-lg text-text-primary active:scale-95 flex items-center justify-center
                        "
                    >
                        {k}
                    </button>
                ))}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 mt-auto">
                <button 
                    onClick={onCancel} 
                    className="h-12 rounded-xl bg-surface-alt hover:bg-surface-highlight text-xs font-[700]  tracking-widest text-text-muted hover:text-text-primary transition-all border border-border-subtle"
                >
                    Cancel
                </button>
                <button 
                    onClick={onCall} 
                    disabled={value.length < 3} 
                    className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-[700]  tracking-widest shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Initiate
                </button>
            </div>
        </div>
    );
};
