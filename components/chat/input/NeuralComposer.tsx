
import React from 'react';
import { Sparkles, Check, Briefcase, Smile, Zap } from 'lucide-react';

interface NeuralComposerProps {
    show: boolean;
    isThinking: boolean;
    onAction: (mode: 'fix' | 'pro' | 'casual' | 'shorter') => void;
    menuRef: React.RefObject<HTMLDivElement>;
}

export const NeuralComposer: React.FC<NeuralComposerProps> = ({ show, isThinking, onAction, menuRef }) => {
    if (!show) return null;

    return (
        <div ref={menuRef} className="absolute bottom-full left-14 mb-4 w-64 bg-surface-main/95  border border-border-subtle rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-2 zoom-in-95 z-50">
            <div className="p-3 border-b border-border-subtle bg-accent-primary/5 flex items-center justify-between">
                <span className="text-sm font-medium  text-accent-primary tracking-wide flex items-center gap-2">
                    <Sparkles size={16}/> Neural Composer
                </span>
                {isThinking && <div className="w-3 h-3 rounded-full border-2 border-accent-primary border-t-transparent animate-spin"/>}
            </div>
            <div className="p-1 space-y-0.5">
                {[
                    { id: 'fix', icon: Check, label: 'Fix Grammar', color: 'text-status-success' },
                    { id: 'pro', icon: Briefcase, label: 'Make Professional', color: 'text-blue-500' },
                    { id: 'casual', icon: Smile, label: 'Make Friendly', color: 'text-status-warning' },
                    { id: 'shorter', icon: Zap, label: 'Shorten', color: 'text-purple-500' }
                ].map((action) => (
                    <button 
                        key={action.id}
                        onClick={() => onAction(action.id as any)} 
                        className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-text-primary hover:bg-surface-alt flex items-center gap-3 transition-colors group"
                    >
                        <action.icon size={16} className={`${action.color} group-hover:scale-110 transition-transform`}/> 
                        {action.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
