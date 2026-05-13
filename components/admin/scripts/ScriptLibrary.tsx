
import React, { useMemo } from 'react';
import { Search, FileText } from 'lucide-react';
import { ScriptItem, ScriptType } from '../../../types';
import { Card } from '../../ui/Base';
import { ScriptCard } from './ScriptCard';
import { sfx } from '../../../lib/soundService';

interface ScriptLibraryProps {
    scripts: ScriptItem[];
    selectedId: string | null;
    onSelect: (script: ScriptItem) => void;
    onDuplicate: (script: ScriptItem) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filterType: ScriptType | 'All';
    setFilterType: (type: ScriptType | 'All') => void;
}

export const ScriptLibrary: React.FC<ScriptLibraryProps> = ({ 
    scripts, selectedId, onSelect, onDuplicate,
    searchTerm, setSearchTerm, 
    filterType, setFilterType 
}) => {
    
    const filteredScripts = useMemo(() => {
        return scripts.filter(s => {
            const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 s.content.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'All' || s.type === filterType;
            return matchesSearch && matchesType;
        }).sort((a, b) => b.lastUpdated - a.lastUpdated);
    }, [scripts, searchTerm, filterType]);

    return (
        <Card variant="panel" className="w-1/3 flex flex-col p-0 border-border-subtle bg-surface-main relative overflow-hidden min-w-[320px]">
            <div className="p-4 border-b border-border-subtle bg-surface-alt/30 backdrop-blur-md flex flex-col gap-4 z-10">
                <div className="relative group">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-primary transition-colors"/>
                    <input 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search Knowledge Base..."
                        className="w-full bg-surface-main border border-border-subtle rounded-xl py-2.5 pl-9 pr-4 text-xs font-bold text-text-primary outline-none focus:border-accent-primary transition-all shadow-inner placeholder:text-text-muted/50"
                    />
                </div>
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                    {['All', 'Sales', 'Rebuttal', 'Rescue', 'FollowUp', 'Template'].map(t => (
                        <button
                            key={t}
                            onClick={() => { setFilterType(t as any); sfx.playClick(); }}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all whitespace-nowrap ${
                                filterType === t 
                                ? 'bg-accent-primary text-white border-accent-primary shadow-sm' 
                                : 'text-text-muted border-transparent hover:text-text-primary hover:bg-surface-alt'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1 bg-surface-main/50">
                {filteredScripts.map(script => (
                    <ScriptCard 
                        key={script.id}
                        script={script}
                        isActive={selectedId === script.id}
                        onClick={() => { onSelect(script); sfx.playClick(); }}
                        onDuplicate={() => onDuplicate(script)}
                    />
                ))}
                
                {filteredScripts.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 opacity-40 text-text-muted gap-3">
                        <FileText size={32} strokeWidth={1}/>
                        <p className="text-xs font-black uppercase tracking-widest">No Scripts Found</p>
                    </div>
                )}
            </div>
        </Card>
    );
};
