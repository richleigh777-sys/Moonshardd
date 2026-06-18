
import React, { useRef, useState } from 'react';
import { Save, Trash2, X, Copy, Check, Terminal } from 'lucide-react';
import { ScriptItem } from '../../../types';
import { Button, Card } from '../../ui/Base';
import { sfx } from '../../../lib/soundService';
import { TeleprompterOverlay } from './TeleprompterOverlay';
import { ScriptEditorToolbar } from './ScriptEditorToolbar';

interface ScriptEditorProps {
    form: Partial<ScriptItem>;
    onChange: (updates: Partial<ScriptItem>) => void;
    onSave: () => void;
    onDelete: (id: string) => void;
    onClose: () => void;
    isNew: boolean;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({ 
    form, onChange, onSave, onDelete, onClose, isNew 
}) => {
    const [copied, setCopied] = useState(false);
    const [showPrompter, setShowPrompter] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleCopyAll = () => {
        if (form.content) {
            navigator.clipboard.writeText(form.content);
            setCopied(true);
            sfx.playSuccess();
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const insertVariable = (variable: string) => {
        if (!textareaRef.current) return;
        
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const text = form.content || '';
        const newText = text.substring(0, start) + variable + text.substring(end);
        
        onChange({ content: newText });
        
        // Use timeout to ensure state update renders before focusing
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(start + variable.length, start + variable.length);
            }
        }, 0);
    };

    return (
        <Card variant="panel" className="flex-1 flex flex-col p-0 border-border-strong rounded-2xl bg-surface-main relative overflow-hidden shadow-lg group">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>

            {/* Header */}
            <div className="px-6 py-5 border-b border-border-subtle bg-surface-alt/50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 relative z-10 transition-colors">
                <div className="flex-1 mr-4 space-y-3">
                    <div className="flex items-center gap-4">
                        <div className="relative group w-full">
                            <label className="text-xs font-bold text-text-muted tracking-widest uppercase mb-1.5 block">Dialogue Identifier</label>
                            <input autoComplete="off" spellCheck={false} 
                                value={form.title || ''}
                                onChange={e => onChange({ title: e.target.value })}
                                className="w-full bg-transparent text-xl font-bold text-text-primary outline-none placeholder:text-text-muted/40 tracking-tight border-b border-transparent focus:border-accent-primary transition-colors pb-1"
                                placeholder="UNTITLED DIALOGUE..."
                                autoFocus={isNew}
                            />
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                    <div className="flex items-center gap-2 bg-surface-main border border-border-strong px-2 py-1.5 rounded-xl shadow-sm">
                        <select 
                            value={form.type}
                            onChange={e => onChange({ type: e.target.value as any })}
                            className="bg-transparent text-sm font-bold text-text-primary outline-none cursor-pointer px-3 py-1 hover:text-accent-primary transition-colors"
                        >
                            <option value="Sales">Sales Dialogue</option>
                            <option value="Rebuttal">Rebuttal</option>
                            <option value="Rescue">Rescue Script</option>
                            <option value="FollowUp">Follow Up</option>
                        </select>
                    </div>
                    
                    <div className="flex gap-2">
                        {!isNew && form.id && (
                            <button 
                                onClick={() => onDelete(form.id!)}
                                className="p-2.5 hover:bg-status-error/10 text-text-muted hover:text-status-error rounded-xl transition-colors border border-transparent hover:border-status-error/20"
                                title="Purge Dialogue"
                            >
                                <Trash2 size={18}/>
                            </button>
                        )}
                        <button 
                            onClick={onClose}
                            className="p-2.5 bg-surface-alt hover:bg-surface-highlight border border-border-subtle text-text-muted hover:text-text-primary rounded-xl transition-colors shadow-sm"
                            title="Close Editor"
                        >
                            <X size={18}/>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 relative z-10 flex flex-col min-h-0 bg-surface-main/30 gap-4">
                
                <ScriptEditorToolbar 
                    onInsertVariable={insertVariable}
                    onTestPrompter={() => setShowPrompter(true)}
                    charCount={form.content?.length || 0}
                />

                <div className="flex-1 bg-surface-alt border border-border-subtle rounded-2xl p-6 relative group focus-within:border-accent-primary/50 transition-colors shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-border-subtle">
                        <span className="text-sm font-bold text-text-muted flex items-center gap-2 tracking-widest uppercase">
                            <Terminal size={16}/> Dialogue Source
                        </span>
                        <button 
                            onClick={handleCopyAll} 
                            className={`text-sm font-bold flex items-center gap-1.5 transition-colors uppercase tracking-widest ${copied ? 'text-status-success' : 'text-text-muted hover:text-text-primary'}`}
                        >
                            {copied ? <Check size={16}/> : <Copy size={16}/>} Copy Script
                        </button>
                    </div>
                    <textarea 
                        ref={textareaRef}
                        value={form.content || ''}
                        onChange={e => onChange({ content: e.target.value })}
                        className="flex-1 w-full bg-transparent text-base font-medium text-text-primary leading-loose outline-none resize-none custom-scrollbar placeholder:text-text-muted/30 font-sans"
                        placeholder="// Enter script dialogue here... Use {{Variables}} for dynamic replacements."
                        spellCheck={false}
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border-subtle bg-surface-alt/50 relative z-10 flex justify-end gap-3 transition-colors">
                <Button variant="secondary" onClick={onClose} className="h-11 text-sm font-bold px-6 rounded-xl">
                    Cancel
                </Button>
                <Button variant="primary" onClick={onSave} className="h-11 text-sm font-bold tracking-widest rounded-xl bg-accent-primary hover:bg-accent-primary/90 text-white shadow-sm px-8">
                    <Save size={16} className="mr-2"/> Commit Sequence
                </Button>
            </div>

            {showPrompter && form.content && (
                <TeleprompterOverlay 
                    content={form.content} 
                    title={form.title || 'Untitled'} 
                    onClose={() => setShowPrompter(false)} 
                />
            )}
        </Card>
    );
};
