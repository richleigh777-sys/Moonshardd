
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
    Search, ArrowRight, LayoutDashboard, PlusCircle, 
    MessageSquare, LogOut, Moon, Volume2, VolumeX,
    FileText, RotateCcw
} from 'lucide-react';
import { useSystem } from '../../hooks/useSystem';
import { useAuth } from '../../hooks/useAuth';
import { sfx } from '../../lib/soundService';

export const CommandPalette: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [recentIds, setRecentIds] = useState<string[]>(() => {
        const stored = localStorage.getItem('cmd_palette_recent');
        if (stored) {
            try { return JSON.parse(stored); } catch { return []; }
        }
        return [];
    });
    
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const { setView, toggleTheme, toggleNotifications, notificationsEnabled } = useSystem();
    const { logout, currentUser } = useAuth();



    // Toggle Logic
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Focus Management
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            sfx.playHover();
        } else {
            setTimeout(() => {
                setQuery('');
                setSelectedIndex(0);
            }, 0);
        }
    }, [isOpen]);

    // Save to history helper
    const executeCommand = useCallback((item: any) => {
        // 1. Add to recent list (deduplicated, max 3)
        const newRecents = [item.id, ...recentIds.filter(id => id !== item.id)].slice(0, 3);
        setRecentIds(newRecents);
        localStorage.setItem('cmd_palette_recent', JSON.stringify(newRecents));

        // 2. Execute
        sfx.playSubmit();
        item.action();
        setIsOpen(false);
    }, [recentIds]);

    // Command Definition
    const commands = useMemo(() => {
        const base = [
            { 
                section: 'Navigation', 
                items: [
                    { id: 'nav-dash', label: 'Go to Dashboard', icon: LayoutDashboard, action: () => setView(currentUser?.role === 'admin' ? 'admin_dashboard' : 'agent_dashboard') },
                    // Use event dispatch for internal tab navigation instead of global setView
                    { id: 'nav-msgs', label: 'Open Messages', icon: MessageSquare, action: () => document.dispatchEvent(new CustomEvent('NAVIGATE', { detail: 'comms' })) },
                ]
            },
            {
                section: 'Actions',
                items: [
                    // Use event dispatch for internal tab navigation instead of global setView
                    { id: 'act-new', label: 'New Enrollment', icon: PlusCircle, action: () => document.dispatchEvent(new CustomEvent('NAVIGATE', { detail: 'enrollment' })) },
                    { id: 'act-note', label: 'Scratchpad', icon: FileText, action: () => document.dispatchEvent(new CustomEvent('OPEN_SCRATCHPAD')) }, 
                ]
            },
            {
                section: 'System',
                items: [
                    { id: 'sys-theme', label: 'Toggle Theme', icon: Moon, action: () => toggleTheme() },
                    { id: 'sys-sound', label: notificationsEnabled ? 'Mute System' : 'Unmute System', icon: notificationsEnabled ? VolumeX : Volume2, action: () => toggleNotifications() },
                    { id: 'sys-logout', label: 'End Session', icon: LogOut, action: () => logout() },
                ]
            }
        ];

        // Flatten base to find recents
        const allItems = base.flatMap(s => s.items);
        const recentItems = recentIds.map(id => allItems.find(i => i.id === id)).filter(Boolean);

        const result = [];

        // Insert Recents at top if no query
        if (!query && recentItems.length > 0) {
            result.push({
                section: 'Recent',
                items: recentItems.map((i, idx) => ({ ...i!, icon: RotateCcw, hotkey: idx + 1 })) // Override icon and add hotkey
            });
        }

        if (query) {
            const lowerQ = query.toLowerCase();
            return base.map(section => ({
                ...section,
                items: section.items.filter(item => item.label.toLowerCase().includes(lowerQ))
            })).filter(section => section.items.length > 0);
        } else {
            // Append standard sections
            result.push(...base);
        }

        return result;

    }, [query, currentUser, notificationsEnabled, recentIds, setView, toggleTheme, toggleNotifications, logout]);

    // Flatten for keyboard nav
    const flatItems = useMemo(() => 
        commands.flatMap(s => s.items), 
    [commands]);

    // Keyboard Navigation
    const handleListKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % flatItems.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + flatItems.length) % flatItems.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const item = flatItems[selectedIndex];
            if (item) {
                executeCommand(item);
            }
        } else if (['1', '2', '3'].includes(e.key) && !query) {
            // Quick Launch for Recents
            const idx = parseInt(e.key) - 1;
            const recents = commands.find(c => c.section === 'Recent')?.items;
            if (recents && recents[idx]) {
                e.preventDefault();
                executeCommand(recents[idx]);
            }
        }
    }, [flatItems, selectedIndex, query, commands, executeCommand]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4 font-sans">
            <div className="absolute inset-0 bg-surface-alt dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsOpen(false)}></div>
            
            <div 
                className="w-full max-w-2xl bg-surface-main border border-border-subtle rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-top-4 duration-200 ring-1 ring-white/5"
                onKeyDown={handleListKeyDown}
            >
                {/* Search Bar */}
                <div className="flex items-center px-4 border-b border-border-subtle h-14 shrink-0 bg-surface-main">
                    <Search className="w-5 h-5 text-text-muted mr-3" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                        placeholder="Search commands..."
                        className="flex-1 bg-transparent text-sm font-medium text-text-primary outline-none placeholder:text-text-muted/50"
                        autoComplete="off"
                    />
                    <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-text-muted bg-surface-alt px-3 py-1.5 rounded border border-border-subtle">ESC</span>
                    </div>
                </div>

                {/* Results List */}
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2" ref={listRef}>
                    {commands.length === 0 ? (
                        <div className="p-5 text-center text-text-muted text-sm">
                            No results found
                        </div>
                    ) : (
                        commands.map((section) => (
                            <div key={section.section} className="mb-2">
                                <div className="px-3 py-1.5 text-sm font-semibold text-text-muted  tracking-wider flex items-center gap-2">
                                    {section.section}
                                </div>
                                <div className="space-y-0.5">
                                    {section.items.map((item) => {
                                        // Calculate absolute index for highlighting
                                        const absIndex = flatItems.indexOf(item);
                                        const isActive = absIndex === selectedIndex;

                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => executeCommand(item)}
                                                onMouseEnter={() => setSelectedIndex(absIndex)}
                                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group border ${
                                                    isActive 
                                                    ? 'bg-surface-highlight border-border-subtle text-text-primary' 
                                                    : 'bg-transparent border-transparent text-text-secondary hover:bg-surface-alt/50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <item.icon size={16} className={isActive ? 'text-text-primary' : 'text-text-muted'} />
                                                    <span className={`text-sm font-medium ${isActive ? 'text-text-primary' : 'text-text-secondary'}`}>
                                                        {item.label}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {(item as any).hotkey && !query && (
                                                        <span className={`text-sm font-mono font-medium w-5 h-5 flex items-center justify-center rounded border ${isActive ? 'bg-surface-main border-border-subtle text-text-primary' : 'bg-surface-alt border-border-subtle text-text-muted'}`}>
                                                            {(item as any).hotkey}
                                                        </span>
                                                    )}
                                                    {isActive && <ArrowRight size={16} className="text-text-muted" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="h-9 bg-surface-alt/50 border-t border-border-subtle flex items-center justify-between px-4 text-sm font-medium text-text-muted tracking-tight">
                    <div className="flex items-center gap-2">
                        <span>Command Palette</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">Select <kbd className="bg-surface-alt px-1 rounded border border-border-subtle">↵</kbd></span>
                        <span className="flex items-center gap-1">Navigate <kbd className="bg-surface-alt px-1 rounded border border-border-subtle">↑↓</kbd></span>
                    </div>
                </div>
            </div>
        </div>
    );
};
