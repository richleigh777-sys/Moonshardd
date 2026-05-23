
import React from 'react';
import { Search, FileText, Trash2, Plus } from 'lucide-react';
import { sfx } from '../../../lib/soundService';

interface ScratchSheet {
    id: string;
    content: string;
    timestamp: number;
}

interface ScratchpadSidebarProps {
    showSidebar: boolean;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    filteredSheets: ScratchSheet[];
    activeSheetId: string;
    setActiveSheetId: (id: string) => void;
    onDelete: (e: React.MouseEvent, id: string) => void;
    onNew: () => void;
}

const getSheetTitle = (content: string) => {
    if (!content.trim()) return "Empty Note";
    const firstLine = content.split('\n')[0].trim();
    return firstLine.length > 25 ? firstLine.substring(0, 25) + '...' : firstLine;
};

const getSheetPreview = (content: string) => {
    if (!content.trim()) return "No content";
    const lines = content.split('\n');
    return lines.length > 1 ? lines[1].trim() : lines[0].substring(0, 30) + '...';
};

export const ScratchpadSidebar: React.FC<ScratchpadSidebarProps> = ({ 
    showSidebar, searchQuery, setSearchQuery, filteredSheets, activeSheetId, setActiveSheetId, onDelete, onNew 
}) => {
    return (
        <div className={`
            absolute inset-y-0 left-0 z-20 bg-surface-alt/95 backdrop-blur-xl border-r border-border-subtle flex flex-col transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]
            ${showSidebar ? 'w-56 translate-x-0' : 'w-56 -translate-x-full'}
        `}>
            <div className="p-3 border-b border-border-subtle">
                <div className="relative">
                    <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                        className="w-full bg-surface-main border border-border-subtle rounded-lg py-2 pl-8 pr-2 text-xs font-bold outline-none focus:border-accent-primary placeholder:text-text-muted/50"
                        placeholder="Search notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {filteredSheets.map(sheet => (
                    <div 
                        key={sheet.id}
                        onClick={() => { setActiveSheetId(sheet.id); sfx.playClick(); }}
                        className={`group flex flex-col p-2.5 rounded-xl cursor-pointer border transition-all ${
                            activeSheetId === sheet.id 
                            ? 'bg-surface-main border-accent-primary/30 shadow-sm' 
                            : 'border-transparent hover:bg-surface-main hover:border-border-subtle'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                                <FileText size={16} className={activeSheetId === sheet.id ? 'text-accent-primary' : 'text-text-muted'} />
                                <p className={`text-xs font-bold truncate ${activeSheetId === sheet.id ? 'text-text-primary' : 'text-text-secondary'}`}>
                                    {getSheetTitle(sheet.content)}
                                </p>
                            </div>
                            <button 
                                onClick={(e) => onDelete(e, sheet.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-status-error/10 text-text-muted hover:text-status-error rounded transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <div className="pl-5">
                            <p className="text-xs text-text-muted/70 truncate">{getSheetPreview(sheet.content)}</p>
                            <p className="text-sm text-text-muted/40 font-mono mt-0.5">
                                {new Date(sheet.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-3 border-t border-border-subtle">
                <button onClick={onNew} className="w-full py-2 bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary text-xs font-bold  rounded-lg border border-accent-primary/20 flex items-center justify-center gap-2 transition-all">
                    <Plus size={16} /> New Note
                </button>
            </div>
        </div>
    );
};
