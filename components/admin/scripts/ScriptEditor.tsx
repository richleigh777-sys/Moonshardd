
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
        <Card variant="panel" className="flex-1 flex flex-col p-0 border-border-subtle bg-surface-main relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]"></div>

            {/* Header */}
            <div className="p-6 border-b border-border-subtle bg-surface-alt/30 flex justify-between items-start relative z-10 backdrop-blur-md">
                <div className="flex-1 mr-4 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="relative group flex-1">
                            <label className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 block">Protocol Identifier</label>
                            <input 
                                value={form.title || ''}
                                onChange={e => onChange({ title: e.target.value })}
                                className="w-full bg-transparent text-2xl font-black text-text-primary outline-none placeholder:text-text-muted/40 uppercase tracking-tight border-b border-transparent focus:border-accent-primary transition-colors"
                                placeholder="UNTITLED PROTOCOL"
                                autoFocus={isNew}
                            />
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 bg-surface-main border border-border-subtle p-1 rounded-lg shadow-sm">
                        <select 
                            value={form.type}
                            onChange={e => onChange({ type: e.target.value as any })}
                            className="bg-transparent text-[10px] font-bold text-text-primary uppercase outline-none cursor-pointer px-2 py-1 hover:text-accent-primary transition-colors"
                        >
                            <option value="Sales">Sales Script</option>
                            <option value="Rebuttal">Rebuttal</option>
                            <option value="Rescue">Rescue Ops</option>
                            <option value="FollowUp">Follow Up</option>
                            <option value="Template">Email/Text Template</option>
                        </select>
                    </div>
                    
                    <div className="flex gap-2">
                        {!isNew && form.id && (
                            <button 
                                onClick={() => onDelete(form.id!)}
                                className="p-2 hover:bg-red-500/10 text-text-muted hover:text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                                title="Purge Protocol"
                            >
                                <Trash2 size={16}/>
                            </button>
                        )}
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-surface-highlight text-text-muted hover:text-text-primary rounded-lg transition-colors"
                            title="Close Editor"
                        >
                            <X size={16}/>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 relative z-10 flex flex-col min-h-0">
                
                <ScriptEditorToolbar 
                    onInsertVariable={insertVariable}
                    onTestPrompter={() => setShowPrompter(true)}
                    charCount={form.content?.length || 0}
                />

                <div className="flex-1 bg-surface-alt/20 rounded-2xl border border-border-subtle p-4 relative group focus-within:border-accent-primary/50 transition-colors shadow-inner flex flex-col">
                    <div className="flex justify-between items-center mb-2 pb-2 border-b border-border-subtle">
                        <span className="text-[9px] font-sans font-bold text-text-muted flex items-center gap-2 uppercase tracking-wide">
                            <Terminal size={10}/> Script Source
                        </span>
                        <button 
                            onClick={handleCopyAll} 
                            className={`text-[9px] font-bold uppercase flex items-center gap-1 transition-colors ${copied ? 'text-emerald-500' : 'text-text-muted hover:text-text-primary'}`}
                        >
                            {copied ? <Check size={10}/> : <Copy size={10}/>} Copy
                        </button>
                    </div>
                    <textarea 
                        ref={textareaRef}
                        value={form.content || ''}
                        onChange={e => onChange({ content: e.target.value })}
                        className="flex-1 w-full bg-transparent text-sm font-medium text-text-primary leading-relaxed outline-none resize-none custom-scrollbar placeholder:text-text-muted/30 font-sans"
                        placeholder="// Enter script dialogue here... Use {{Variables}} for dynamic data."
                        spellCheck={false}
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border-subtle bg-surface-alt/30 relative z-10 flex justify-end gap-3">
                <Button variant="secondary" onClick={onClose} className="h-10 text-[10px] uppercase font-bold px-6">
                    Cancel
                </Button>
                <Button variant="primary" onClick={onSave} className="h-10 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-500 border-emerald-500/50 px-8">
                    <Save size={14} className="mr-2"/> Commit Changes
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
