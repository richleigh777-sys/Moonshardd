
import React from 'react';
import { RefreshCw } from 'lucide-react';

interface CellProps {
    value: any;
    isEditing: boolean;
    onChange: (val: any) => void;
}

export const RecurringCell: React.FC<CellProps> = ({ value, isEditing, onChange }) => {
    if (isEditing) {
        return (
            <div className="flex items-center gap-2">
                <input 
                    type="checkbox" 
                    checked={!!value} 
                    onChange={e => onChange(e.target.checked)} 
                    className="w-4 h-4 accent-accent-primary cursor-pointer"
                />
                <span className="text-[10px] text-text-muted">Is Recurring?</span>
            </div>
        );
    }
    return value ? (
        <span className="text-[8px] font-black uppercase text-accent-primary bg-accent-primary/10 px-1.5 py-0.5 rounded border border-accent-primary/20 flex items-center gap-1 w-fit">
            <RefreshCw size={8} className="animate-spin-slow"/> Auto-Ship
        </span>
    ) : <span className="text-text-muted opacity-20">-</span>;
};
