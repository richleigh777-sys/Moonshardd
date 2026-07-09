
import React from 'react';
import { User } from '../../../types';
import { Zap } from 'lucide-react';

interface AutocompleteMenuProps {
    items: any[];
    selectedIndex: number;
    onSelect: (item: any) => void;
}

export const AutocompleteMenu: React.FC<AutocompleteMenuProps> = ({ items, selectedIndex, onSelect }) => {
    if (items.length === 0) return null;

    return (
        <div className="absolute bottom-full left-4 mb-2 w-72 bg-surface-main/95  border border-border-subtle rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 duration-200 z-50">
            <div className="px-3 py-2 bg-surface-alt/50 border-b border-border-subtle flex justify-between items-center text-sm font-medium  text-text-muted tracking-wide">
                <span>Suggestions</span>
                <span>Select ↵</span>
            </div>
            <div className="max-h-48 overflow-y-auto custom-scrollbar p-1">
                {items.map((item, i) => (
                    <button
                        key={i}
                        onClick={() => onSelect(item)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all ${i === selectedIndex ? 'bg-accent-primary text-text-primary shadow-md' : 'text-text-primary hover:bg-surface-alt'}`}
                    >
                        {item.role ? ( // It's a User
                            <>
                                <div className="w-7 h-7 rounded-lg bg-surface-alt/50 flex items-center justify-center text-sm font-medium border border-border-subtle shrink-0">
                                    {((item as User).name || 'U').charAt(0)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="font-bold text-sm truncate">{(item as User).name}</div>
                                    <div className="text-sm opacity-70">{(item as User).role}</div>
                                </div>
                            </>
                        ) : ( // It's a Command / Script
                            <>
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-medium border border-border-subtle shrink-0 ${item.type === 'script' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-surface-alt/50'}`}>
                                    {item.type === 'script' ? <Zap size={16}/> : '/'}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="font-bold font-mono text-sm truncate">{(item as any).label}</div>
                                    <div className="text-sm opacity-70 truncate">{(item as any).desc}</div>
                                </div>
                            </>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};
