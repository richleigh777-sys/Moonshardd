
import React from 'react';
import { Copy, Check, Copy as DuplicateIcon } from 'lucide-react';
import { ScriptItem } from '../../../types';
import { sfx } from '../../../lib/soundService';

interface ScriptCardProps {
    script: ScriptItem;
    isActive: boolean;
    onClick: () => void;
    onDuplicate: () => void;
}

export const ScriptCard = React.memo<ScriptCardProps>(({ script, isActive, onClick, onDuplicate }) => {
    const [copied, setCopied] = React.useState(false);

    const getTypeStyles = (type: string) => {
        switch(type) {
            case 'Sales': return 'text-status-success bg-emerald-500/10 border-emerald-500/20';
            case 'Rebuttal': return 'text-status-error bg-red-500/10 border-red-500/20';
            case 'FollowUp': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            case 'Rescue': return 'text-status-warning bg-amber-500/10 border-amber-500/20';
            default: return 'text-text-muted bg-surface-alt border-border-subtle';
        }
    };

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(script.content);
        setCopied(true);
        sfx.playConfirm();
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDuplicate = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDuplicate();
    };

    const styles = getTypeStyles(script.type);

    return (
        <button
            onClick={onClick}
            className={`
                w-full text-left p-4 rounded-xl border transition-all group relative overflow-hidden flex flex-col gap-3
                ${isActive 
                    ? 'bg-surface-alt border-accent-primary shadow-md' 
                    : 'bg-transparent border-transparent hover:bg-surface-alt/60 hover:border-border-subtle'
                }
            `}
        >
            <div className="flex justify-between items-start w-full relative z-10">
                <span className={`text-sm font-medium  tracking-wide px-2.5 py-1 rounded border ${styles}`}>
                    {script.type}
                </span>
                {isActive && <div className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-pulse shadow-sm"></div>}
            </div>

            <h4 className={`text-sm font-bold truncate w-full relative z-10 ${isActive ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'}`}>
                {script.title}
            </h4>

            <div className="flex items-center justify-between w-full relative z-10">
                <span className="text-sm font-mono text-text-muted opacity-60">
                    Last active: {new Date(script.lastUpdated).toLocaleDateString()}
                </span>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div 
                        onClick={handleDuplicate}
                        className="p-1.5 rounded-lg hover:bg-surface-main border border-transparent hover:border-border-subtle text-text-muted hover:text-text-primary transition-colors"
                        title="Duplicate"
                    >
                        <DuplicateIcon size={16}/>
                    </div>
                    <div 
                        onClick={handleCopy}
                        className={`
                            p-1.5 rounded-lg hover:bg-surface-main border border-transparent hover:border-border-subtle transition-colors
                            ${copied ? 'text-status-success' : 'text-text-muted hover:text-text-primary'}
                        `}
                        title="Quick Copy"
                    >
                        {copied ? <Check size={16}/> : <Copy size={16}/>}
                    </div>
                </div>
            </div>

            {isActive && <div className="absolute inset-0 bg-accent-primary/5 pointer-events-none"></div>}
            {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-primary"></div>}
        </button>
    );
});
