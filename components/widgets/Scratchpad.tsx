 

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
    X, List, Plus, Minimize2, Maximize2, Ghost
} from 'lucide-react';
import { useCRM } from '../../hooks/useCRM';
import { useSystem } from '../../hooks/useSystem';
import { sfx } from '../../lib/soundService';
import { ScratchpadSidebar } from './scratchpad/ScratchpadSidebar';
import { ScratchpadEditor } from './scratchpad/ScratchpadEditor';

interface ScratchpadProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ScratchSheet {
    id: string;
    content: string;
    timestamp: number;
}

const STORAGE_KEY_V2 = 'nexus_scratchpad_v2';
const STORAGE_KEY_V3 = 'nexus_scratchpad_v3';

const MACROS = [
    { label: 'Left VM', text: 'Attempted contact. Left Voicemail.' },
    { label: 'Gatekeeper', text: 'Spoke with receptionist/spouse. Message taken.' },
    { label: 'Callback', text: 'Client requested callback in 1 hour.' },
    { label: 'DNC', text: 'Client requested Do Not Call. Remove from list.' },
    { label: 'Price', text: 'Objection: Price too high. Offered discount.' },
    { label: 'Busy', text: 'Client is driving/busy. Call back later.' },
    { label: 'Sold', text: 'Sale closed. Processing order now.' },
    { label: 'Wrong #', text: 'Number disconnected or wrong person.' }
];

export const Scratchpad: React.FC<ScratchpadProps> = ({ isOpen, onClose }) => {
    const { addNote, addTask, currentUser } = useCRM();
    const { setToast } = useSystem();
    
    // --- STATE ---
    const [sheets, setSheets] = useState<ScratchSheet[]>([]);
    const [activeSheetId, setActiveSheetId] = useState<string>('');
    const [showSidebar, setShowSidebar] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [isSaving, setIsSaving] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [isGhostMode, setIsGhostMode] = useState(false);
    
    // Dragging State
    const [position, setPosition] = useState({ x: window.innerWidth - 650, y: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const startPos = useRef({ x: 0, y: 0 });
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // --- INITIALIZATION & MIGRATION ---
    useEffect(() => {
        const storedV3 = localStorage.getItem(STORAGE_KEY_V3);
        
        if (storedV3) {
            try {
                const parsed = JSON.parse(storedV3);
                setSheets(parsed.sheets || []);
                setActiveSheetId(parsed.activeId || '');
            } catch {
                console.error("Scratchpad V3 Load Error");
            }
        } else {
            // Migrate V2
            const legacyContent = localStorage.getItem(STORAGE_KEY_V2) || '';
            const initialSheet: ScratchSheet = {
                id: 'default',
                content: legacyContent,
                timestamp: Date.now()
            };
            setSheets([initialSheet]);
            setActiveSheetId('default');
        }
    }, []);

    // --- PERSISTENCE ---
    useEffect(() => {
        if (sheets.length > 0) {
            const data = {
                activeId: activeSheetId,
                sheets: sheets
            };
            localStorage.setItem(STORAGE_KEY_V3, JSON.stringify(data));
        }
    }, [sheets, activeSheetId]);

    // Focus on open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => textareaRef.current?.focus(), 100);
        }
    }, [isOpen, activeSheetId]);

    // Drag Logic
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const dx = e.clientX - dragStart.current.x;
            const dy = e.clientY - dragStart.current.y;
            setPosition({
                x: startPos.current.x + dx,
                y: startPos.current.y + dy
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isMaximized) return;
        setIsDragging(true);
        dragStart.current = { x: e.clientX, y: e.clientY };
        startPos.current = { x: position.x, y: position.y };
    };

    // --- SHEET MANAGEMENT ---
    const activeSheet = useMemo(() => 
        sheets.find(s => s.id === activeSheetId) || sheets[0] || { id: 'temp', content: '', timestamp: 0 }, 
    [sheets, activeSheetId]);

    const filteredSheets = useMemo(() => {
        if (!searchQuery) return sheets;
        return sheets.filter(s => s.content.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [sheets, searchQuery]);

    const updateText = (newText: string) => {
        setSheets(prev => prev.map(s => 
            s.id === activeSheet.id 
                ? { ...s, content: newText, timestamp: Date.now() } 
                : s
        ));
    };

    const handleNewSheet = () => {
        sfx.playClick();
        const newId = `sheet-${Date.now()}`;
        const newSheet: ScratchSheet = { id: newId, content: '', timestamp: Date.now() };
        setSheets(prev => [newSheet, ...prev]);
        setActiveSheetId(newId);
        if (!showSidebar) setShowSidebar(true);
        setSearchQuery('');
    };

    const handleDeleteSheet = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        sfx.playDecline();
        if (sheets.length <= 1) {
            setSheets([{ id: 'default', content: '', timestamp: Date.now() }]);
            return;
        }
        const newSheets = sheets.filter(s => s.id !== id);
        setSheets(newSheets);
        if (activeSheetId === id) {
            setActiveSheetId(newSheets[0].id);
        }
    };

    // --- ACTIONS ---
    const handleInsert = (snippet: string) => {
        updateText((activeSheet.content + (activeSheet.content.trim().length > 0 ? '\n' : '') + snippet));
        sfx.playClick();
        textareaRef.current?.focus();
    };

    const handleTimestamp = () => {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        handleInsert(`[${time}] `);
    };

    const handleChecklist = () => {
        handleInsert(`- [ ] `);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(activeSheet.content);
        sfx.playSuccess();
        setToast({ title: 'Scratchpad', message: "Copied active sheet", type: "success" });
    };

    const handleClear = () => {
        if (!activeSheet.content) return;
        sfx.playDecline();
        updateText('');
        setToast({ title: 'Scratchpad', message: "Sheet cleared", type: "info" });
    };

    const handleSaveAsNote = async () => {
        if (!activeSheet.content.trim()) return;
        setIsSaving(true);
        try {
            await addNote({
                agentId: currentUser?.id,
                agentName: currentUser?.name,
                content: activeSheet.content,
                type: 'note',
                timestamp: Date.now(),
                priority: 'Low',
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString()
            });
            sfx.playSuccess();
            setToast({ title: 'Scratchpad', message: "Saved to Notes History", type: "success" });
            updateText(''); 
        } catch {
            sfx.playError();
            setToast({ title: 'Scratchpad Error', message: "Failed to save note", type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleConvertToTask = async () => {
        if (!activeSheet.content.trim()) return;
        setIsSaving(true);
        try {
            await addTask({
                title: activeSheet.content.split('\n')[0].substring(0, 50) + (activeSheet.content.length > 50 ? '...' : ''), 
                status: 'pending',
                timestamp: Date.now(),
                targetAgentId: currentUser?.id
            });
            sfx.playConfirm();
            setToast({ title: 'Scratchpad', message: "Task Created", type: "success" });
            updateText('');
        } catch {
            sfx.playError();
        } finally {
            setIsSaving(false);
        }
    };

    const getSheetTitle = (content: string) => {
        if (!content.trim()) return "Empty Note";
        const firstLine = content.split('\n')[0].trim();
        return firstLine.length > 25 ? firstLine.substring(0, 25) + '...' : firstLine;
    };

    if (!isOpen) return null;

    return (
        <div 
            style={!isMaximized ? { left: position.x, top: position.y, position: 'fixed' } : undefined}
            className={`
                z-[200] flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-border-subtle shadow-2xl bg-surface-main
                ${isMaximized ? 'fixed inset-4 w-auto h-auto m-4 rounded-[2rem]' : 'w-[650px] h-[550px] resize overflow-hidden rounded-[2rem]'}
                ${isGhostMode ? 'bg-surface-glass/40 backdrop-blur-[2px]' : ''}
            `}
        >
            {/* Header - DRAGGABLE */}
            <div 
                onMouseDown={handleMouseDown}
                className={`p-4 border-b border-border-subtle flex justify-between items-center shrink-0 ${isMaximized ? '' : 'cursor-move'} ${isGhostMode ? 'bg-surface-alt/20' : 'bg-surface-alt/50'} backdrop-blur-md select-none transition-colors`}
            >
                <div className="flex items-center gap-3">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setShowSidebar(!showSidebar); sfx.playClick(); }}
                        className={`p-2 rounded-xl border transition-all ${showSidebar ? 'bg-accent-primary text-white border-accent-primary' : `bg-surface-main/50 text-text-secondary border-border-subtle hover:bg-surface-main ${isGhostMode ? 'opacity-80' : ''}`}`}
                    >
                        <List size={16} />
                    </button>
                    <div onMouseDown={(e) => e.stopPropagation()} className="flex flex-col min-w-[120px]">
                        <h3 className="text-sm font-[700]  tracking-widest text-text-primary flex items-center gap-2">
                            {getSheetTitle(activeSheet.content)}
                        </h3>
                        <p className="text-xs font-bold text-text-muted  tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            {sheets.length} Active Sheet{sheets.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
                <div className="flex gap-1" onMouseDown={(e) => e.stopPropagation()}>
                    <button 
                        onClick={() => handleNewSheet()}
                        className="p-2 hover:bg-surface-highlight rounded-xl text-text-muted hover:text-accent-primary transition-colors mr-2"
                        title="New Sheet"
                    >
                        <Plus size={18} />
                    </button>
                    <div className="w-px h-8 bg-border-subtle mx-1"></div>
                    <button 
                        onClick={() => setIsGhostMode(!isGhostMode)}
                        className={`p-2 rounded-xl transition-colors ${isGhostMode ? 'bg-accent-primary text-white' : 'hover:bg-surface-highlight text-text-muted hover:text-text-primary'}`}
                        title="Ghost Mode (Transparency)"
                    >
                        <Ghost size={18} />
                    </button>
                    <button 
                        onClick={() => setIsMaximized(!isMaximized)} 
                        className="p-2 hover:bg-surface-highlight rounded-xl text-text-muted hover:text-text-primary transition-colors"
                        title={isMaximized ? "Restore" : "Maximize"}
                    >
                        {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-status-error/10 rounded-xl text-text-muted hover:text-status-error transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                <ScratchpadSidebar 
                    showSidebar={showSidebar}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    filteredSheets={filteredSheets}
                    activeSheetId={activeSheetId}
                    setActiveSheetId={setActiveSheetId}
                    onDelete={handleDeleteSheet}
                    onNew={handleNewSheet}
                />

                <div className="flex-1 flex flex-col min-w-0 bg-transparent relative z-10 transition-all duration-300" style={{ marginLeft: showSidebar ? '14rem' : '0' }}>
                    <ScratchpadEditor 
                        content={activeSheet.content}
                        onChange={updateText}
                        isGhostMode={isGhostMode}
                        macros={MACROS}
                        onInsert={handleInsert}
                        onTimestamp={handleTimestamp}
                        onChecklist={handleChecklist}
                        onCopy={handleCopy}
                        onClear={handleClear}
                        onToTask={handleConvertToTask}
                        onSaveNote={handleSaveAsNote}
                        isSaving={isSaving}
                        textareaRef={textareaRef}
                    />
                </div>
            </div>
        </div>
    );
};
