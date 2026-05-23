
import React from 'react';
import { Braces, Play } from 'lucide-react';
import { sfx } from '../../../lib/soundService';

interface ScriptEditorToolbarProps {
    onInsertVariable: (v: string) => void;
    onTestPrompter: () => void;
    charCount: number;
}

export const ScriptEditorToolbar: React.FC<ScriptEditorToolbarProps> = ({ onInsertVariable, onTestPrompter, charCount }) => {
    
    const handleInsert = (variable: string) => {
        sfx.playClick();
        onInsertVariable(variable);
    };

    const variables = ['Customer', 'Product', 'Price', 'Agent', 'Date'];

    return (
        <div className="flex items-center justify-between gap-4 mb-3 pb-1 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2">
                {variables.map(v => (
                    <button 
                        key={v}
                        onClick={() => handleInsert(`{{${v}}}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-alt border border-border-subtle text-xs font-bold  hover:border-accent-primary/30 hover:text-accent-primary transition-all whitespace-nowrap active:scale-95"
                        title={`Insert ${v} Variable`}
                    >
                        <Braces size={16}/> {v}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-3 shrink-0">
                <div className="h-4 w-px bg-border-subtle"></div>
                <span className="text-xs font-mono text-text-muted">{charCount} CHARS</span>
                <button 
                    onClick={() => { sfx.playSubmit(); onTestPrompter(); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-secondary/10 border border-accent-secondary/20 text-xs font-bold  text-accent-secondary hover:bg-indigo-500 hover:text-white transition-all whitespace-nowrap"
                >
                    <Play size={16} fill="currentColor"/> Test Prompter
                </button>
            </div>
        </div>
    );
};
