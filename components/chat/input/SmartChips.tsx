
import React from 'react';
import { Sparkles } from 'lucide-react';

export interface SmartChipData {
    label: string;
    text: string;
}

interface SmartChipsProps {
    chips: SmartChipData[];
    onSelect: (text: string) => void;
}

export const SmartChips: React.FC<SmartChipsProps> = ({ chips, onSelect }) => {
    if (chips.length === 0) return null;

    return (
        <div className="flex gap-2 mb-2 px-2 overflow-x-auto scrollbar-hide animate-in slide-in-from-bottom-2 fade-in duration-300">
            {chips.map((chip, idx) => (
                <button
                    key={idx}
                    onClick={() => onSelect(chip.text)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-alt/50 hover:bg-surface-alt border border-border-subtle hover:border-accent-primary/50 rounded-full text-sm font-bold text-text-secondary hover:text-text-primary transition-all whitespace-nowrap shadow-sm active:scale-95 group"
                >
                    <Sparkles size={16} className="text-accent-primary group-hover:animate-pulse"/> {chip.label}
                </button>
            ))}
        </div>
    );
};
