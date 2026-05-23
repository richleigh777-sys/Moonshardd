
import React from 'react';
import { Clock, ListTodo, Copy, Eraser, CheckSquare, Save, Hash, Terminal, Ghost } from 'lucide-react';

interface ScratchpadEditorProps {
    content: string;
    onChange: (text: string) => void;
    isGhostMode: boolean;
    macros: { label: string, text: string }[];
    onInsert: (text: string) => void;
    onTimestamp: () => void;
    onChecklist: () => void;
    onCopy: () => void;
    onClear: () => void;
    onToTask: () => void;
    onSaveNote: () => void;
    isSaving: boolean;
    textareaRef: React.RefObject<HTMLTextAreaElement>;
}

export const ScratchpadEditor: React.FC<ScratchpadEditorProps> = ({
    content, onChange, isGhostMode, macros, onInsert, onTimestamp, onChecklist, onCopy, onClear, onToTask, onSaveNote, isSaving, textareaRef
}) => {
    return (
        <div className="flex-1 flex flex-col min-w-0 bg-transparent relative z-10 transition-all duration-300 h-full">
            {/* Toolbar */}
            <div className={`px-2 py-2 border-b border-border-subtle flex items-center justify-between gap-1 overflow-x-auto scrollbar-hide shrink-0 transition-colors ${isGhostMode ? 'bg-surface-main/40' : 'bg-surface-main'}`}>
                <div className="flex gap-1">
                    <button onClick={onTimestamp} className="p-2 hover:bg-surface-alt rounded-xl text-text-muted hover:text-accent-primary transition-all" title="Insert Time">
                        <Clock size={16}/>
                    </button>
                    <button onClick={onChecklist} className="p-2 hover:bg-surface-alt rounded-xl text-text-muted hover:text-accent-primary transition-all" title="Add Checklist Item">
                        <ListTodo size={16}/>
                    </button>
                    <button onClick={onCopy} className="p-2 hover:bg-surface-alt rounded-xl text-text-muted hover:text-accent-primary transition-all" title="Copy All">
                        <Copy size={16}/>
                    </button>
                    <button onClick={onClear} className="p-2 hover:bg-surface-alt rounded-xl text-text-muted hover:text-status-error transition-all" title="Clear">
                        <Eraser size={16}/>
                    </button>
                </div>
                <div className="h-5 w-px bg-border-subtle mx-1"></div>
                <div className="flex gap-1">
                    <button onClick={onToTask} className="flex items-center gap-2 px-3 py-1.5 bg-accent-secondary/10 hover:bg-indigo-500 hover:text-white text-accent-secondary text-xs font-bold  rounded-xl transition-all" title="Create Task">
                        <CheckSquare size={16}/> To Task
                    </button>
                    <button onClick={onSaveNote} disabled={isSaving} className="flex items-center gap-2 px-3 py-1.5 bg-accent-primary/10 hover:bg-accent-primary hover:text-white text-accent-primary text-xs font-[700]  rounded-xl transition-all shadow-sm" title="Save to CRM">
                        <Save size={16}/> Save
                    </button>
                </div>
            </div>

            {/* Macros Bar */}
            <div className={`px-3 py-2 border-b border-border-subtle overflow-x-auto scrollbar-hide flex gap-2 shrink-0 transition-colors ${isGhostMode ? 'bg-surface-alt/20' : 'bg-surface-alt/30'}`}>
                {macros.map(m => (
                    <button 
                        key={m.label} 
                        onClick={() => onInsert(m.text)}
                        className={`px-3 py-1.5 border border-border-subtle rounded-xl text-xs font-bold  tracking-wider text-text-secondary hover:text-accent-primary hover:border-accent-primary/30 hover:shadow-md transition-all whitespace-nowrap active:scale-95 flex items-center gap-1.5 group ${isGhostMode ? 'bg-surface-main/60' : 'bg-surface-main'}`}
                    >
                        <Hash size={16} className="text-text-muted group-hover:text-accent-primary/50"/>
                        {m.label}
                    </button>
                ))}
            </div>

            {/* Editor Input */}
            <div className="flex-1 relative">
                <textarea 
                    ref={textareaRef}
                    className={`w-full h-full p-6 text-sm font-mono font-medium text-text-primary resize-none outline-none placeholder:text-text-muted/30 leading-relaxed custom-scrollbar selection:bg-accent-primary/20 ${isGhostMode ? 'bg-transparent' : 'bg-surface-main'}`}
                    placeholder="Type notes here... (Auto-saved locally)"
                    value={content}
                    onChange={(e) => onChange(e.target.value)}
                    autoFocus
                />
            </div>
            
            {/* Footer Status */}
            <div className={`px-4 py-2 border-t border-border-subtle flex justify-between items-center shrink-0 transition-colors ${isGhostMode ? 'bg-surface-alt/30' : 'bg-surface-alt/50'}`}>
                <div className="flex items-center gap-2">
                    <Terminal size={16} className="text-accent-primary opacity-50"/>
                    <span className="text-xs font-mono text-text-muted font-bold">{content.length} chars</span>
                </div>
                <span className="text-xs font-[700]  tracking-widest text-status-success opacity-80 flex items-center gap-1.5">
                    <Ghost size={16} className={isGhostMode ? 'opacity-100' : 'opacity-20'}/> {isGhostMode ? 'Ghost Active' : 'Solid Mode'}
                </span>
            </div>
        </div>
    );
};
