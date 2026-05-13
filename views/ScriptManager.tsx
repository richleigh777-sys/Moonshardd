
import React, { useState } from 'react';
import { BookOpen, Plus, Database } from 'lucide-react';
import { useCRM } from '../hooks/useCRM';
import { Card, Button } from '../components/ui/Base';
import { ScriptItem, ScriptType } from '../types';
import { sfx } from '../lib/soundService';
import { ScriptLibrary } from '../components/admin/scripts/ScriptLibrary';
import { ScriptEditor } from '../components/admin/scripts/ScriptEditor';

export const ScriptManager: React.FC = () => {
    const { scripts, addScript, updateScript, deleteScript } = useCRM();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<ScriptType | 'All'>('All');
    const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);
    
    // Editor State
    const [editorForm, setEditorForm] = useState<Partial<ScriptItem>>({
        type: 'Sales',
        title: '',
        content: '',
        active: true
    });

    const handleSelectScript = (script: ScriptItem) => {
        setSelectedScriptId(script.id);
        setEditorForm({ ...script });
    };

    const handleCreateNew = () => {
        sfx.playClick();
        setSelectedScriptId('new');
        setEditorForm({
            type: 'Sales',
            title: '',
            content: '',
            active: true
        });
    };

    const handleDuplicate = async (script: ScriptItem) => {
        sfx.playSubmit();
        const newScript: Partial<ScriptItem> = {
            ...script,
            id: undefined, // Let backend assign
            title: `${script.title} (Copy)`,
            lastUpdated: Date.now(),
            usageCount: 0
        };
        await addScript(newScript);
        // Do not auto-select, let it appear in list
    };

    const handleSave = async () => {
        if (!editorForm.title || !editorForm.content) return;
        try {
            if (selectedScriptId && selectedScriptId !== 'new') {
                await updateScript(selectedScriptId, { ...editorForm, lastUpdated: Date.now() });
            } else {
                await addScript({
                    ...editorForm,
                    usageCount: 0,
                    lastUpdated: Date.now()
                });
            }
            sfx.playConfirm();
            setSelectedScriptId(null);
        } catch {
            sfx.playError();
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Purge this protocol from the database? This action is irreversible.")) {
            sfx.playDecline();
            await deleteScript(id);
            if (selectedScriptId === id) {
                setSelectedScriptId(null);
            }
        }
    };

    return (
        <div className="h-full flex flex-col animate-in fade-in duration-500 gap-4">
            
            {/* HEADER */}
            <Card variant="panel" className="shrink-0 p-4 border-border-subtle bg-surface-main flex justify-between items-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/10 to-transparent pointer-events-none opacity-20"></div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="p-3 bg-accent-primary/10 rounded-xl text-accent-primary border border-accent-primary/20 shadow-sm">
                        <BookOpen size={24} strokeWidth={2.5}/>
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-text-primary uppercase tracking-tighter">Protocol <span className="text-accent-primary">Library</span></h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest bg-surface-alt px-2 py-0.5 rounded border border-border-subtle">
                                {scripts.length} Active Scripts
                            </span>
                            <span className="text-[9px] font-mono text-emerald-500 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                LIVE SYNC
                            </span>
                        </div>
                    </div>
                </div>
                
                <Button onClick={handleCreateNew} variant="primary" className="relative z-10 h-10 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-accent-primary/20">
                    <Plus size={14} className="mr-2"/> New Protocol
                </Button>
            </Card>

            <div className="flex-1 flex gap-4 min-h-0">
                
                <ScriptLibrary 
                    scripts={scripts}
                    selectedId={selectedScriptId}
                    onSelect={handleSelectScript}
                    onDuplicate={handleDuplicate}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filterType={filterType}
                    setFilterType={setFilterType}
                />

                {selectedScriptId ? (
                    <ScriptEditor 
                        form={editorForm}
                        onChange={(updates) => setEditorForm(prev => ({ ...prev, ...updates }))}
                        onSave={handleSave}
                        onDelete={handleDelete}
                        onClose={() => setSelectedScriptId(null)}
                        isNew={selectedScriptId === 'new'}
                    />
                ) : (
                    <Card variant="panel" className="flex-1 flex flex-col p-0 border-border-subtle bg-surface-main relative overflow-hidden">
                        <div className="flex-1 flex flex-col items-center justify-center text-text-muted opacity-50 p-12 text-center">
                            <div className="w-24 h-24 bg-surface-alt rounded-full flex items-center justify-center mb-6 animate-pulse border border-border-subtle">
                                <Database size={48} strokeWidth={1} />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-[0.2em] text-text-secondary">System Ready</h3>
                            <p className="text-xs font-medium mt-2">Select a protocol from the databank or initialize a new entry.</p>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};
