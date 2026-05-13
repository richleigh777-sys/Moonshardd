import React from 'react';
import { Database, User, FileText, Settings, Activity } from 'lucide-react';

interface MemoryBlockProps {
    id: string;
    label: string;
    data: any;
    size: number;
    integrity: number;
    type: string;
    active: boolean;
    isDefragging: boolean;
    onClick: () => void;
}

const getIcon = (id: string) => {
    switch(id) {
        case 'sales': return Database;
        case 'users': return User;
        case 'audit': return FileText;
        case 'config': return Settings;
        default: return Activity;
    }
};

export const MemoryBlock: React.FC<MemoryBlockProps> = ({ 
    id, label, size, integrity, active, isDefragging, onClick 
}) => {
    const icon = getIcon(id);

    return (
        <div 
            onClick={onClick}
            className={`
                relative p-4 rounded-xl border transition-all cursor-pointer overflow-hidden group
                ${active ? 'bg-accent-primary/10 border-accent-primary shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'bg-surface-alt/50 border-border-subtle hover:border-text-muted/30'}
                ${isDefragging ? 'animate-pulse' : ''}
            `}
        >
            <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${active ? 'bg-accent-primary text-white' : 'bg-surface-main text-text-muted'}`}>
                        {React.createElement(icon, { size: 18 })}
                    </div>
                    <div>
                        <h4 className={`text-xs font-black uppercase tracking-wider ${active ? 'text-accent-primary' : 'text-text-primary'}`}>{label}</h4>
                        <p className="text-[9px] font-mono text-text-muted mt-0.5">{(size / 1024).toFixed(2)} KB</p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${integrity > 90 ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {integrity}% Health
                    </span>
                    <div className="w-16 h-1 bg-surface-main rounded-full mt-1 overflow-hidden">
                        <div 
                            className={`h-full ${integrity > 90 ? 'bg-emerald-500' : 'bg-amber-500'} transition-all duration-500`}
                            style={{ width: `${integrity}%` }}
                        ></div>
                    </div>
                </div>
            </div>
            
            {/* Active Indicator */}
            {active && (
                <div className="absolute inset-0 bg-accent-primary/5 pointer-events-none"></div>
            )}
        </div>
    );
};
