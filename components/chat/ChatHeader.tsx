
import { useState, useRef, useEffect } from 'react';
import { 
    Phone, Video, Layout, 
    Search, Bell, BellOff, MoreVertical, Pin, 
    Users, X, Palette, ChevronDown, Check,
    Maximize2, Minimize2, Lock,
    Hash
} from 'lucide-react';
import { Conversation } from '../../services/ChatService';
import { sfx } from '../../lib/soundService';

import { PresenceIndicator } from '../ui/PresenceIndicator';

interface ChatHeaderProps {
    conversation: Conversation;
    typingNow: string[];
    isMaximized: boolean;
    toggleMaximize: () => void;
    onStartCall: (type: 'audio' | 'video') => void;
    showMediaSidebar: boolean;
    toggleMediaSidebar: () => void;
    onViewProfileImage: () => void;
    onSearch: (query: string) => void;
    searchQuery: string;
    onTogglePin: () => void;
    onChangeWallpaper: (bg: string) => void;
    onCreateGroup: () => void;
    onMute: () => void;
    isMuted?: boolean;
}

const WALLPAPERS = [
    { id: 'default', bg: '', label: 'Clean' },
    { id: 'gradient1', bg: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=1000', label: 'Aurora' },
    { id: 'gradient2', bg: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1000', label: 'Neon' },
    { id: 'dark', bg: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000', label: 'Noir' },
    { id: 'nature', bg: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&q=80&w=1000', label: 'Zen' },
];

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
    conversation, typingNow, isMaximized, toggleMaximize, 
    onStartCall, showMediaSidebar, toggleMediaSidebar, onViewProfileImage,
    onSearch, searchQuery, onTogglePin, onChangeWallpaper, onCreateGroup, onMute, isMuted
}) => {
    const [showControls, setShowControls] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showWallpaperPicker, setShowWallpaperPicker] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    
    const searchInputRef = useRef<HTMLInputElement>(null);
    const controlsRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (showSearch) setTimeout(() => searchInputRef.current?.focus(), 100);
    }, [showSearch]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (controlsRef.current && !controlsRef.current.contains(event.target as Node)) {
                setShowControls(false);
                setShowWallpaperPicker(false);
            }
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const statusMeta = (() => {
        switch(conversation.peerStatus) {
            case 'online': return { text: 'Online', color: 'text-status-success', bg: 'bg-emerald-500' };
            case 'break': return { text: 'Away', color: 'text-status-warning', bg: 'bg-amber-500' };
            case 'busy': return { text: 'Do Not Disturb', color: 'text-status-error', bg: 'bg-red-500' };
            default: return { text: 'Offline', color: 'text-text-muted', bg: 'bg-gray-500' };
        }
    })();

    const toggleSearch = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (showSearch) onSearch('');
        setShowSearch(!showSearch);
        setShowControls(false);
        sfx.playClick();
    };

    return (
        <div className="flex items-center justify-between px-4 py-3 bg-surface-main border-b border-border-subtle z-40 w-full shadow-sm">
            
            {/* Identity */}
            <div className="flex items-center gap-3 cursor-pointer group" ref={controlsRef}>
                 <div className="relative" onClick={onViewProfileImage}>
                    <div className="h-9 w-9 bg-surface-alt rounded-full overflow-hidden transition-all group-hover:ring-2 ring-indigo-500/50">
                         {conversation.peerAvatar ? (
                             <img src={conversation.peerAvatar} className="h-full w-full object-cover" />
                         ) : (
                             <div className="h-full w-full flex items-center justify-center bg-accent-secondary/10 text-accent-secondary font-bold text-sm"><Hash size={16}/></div>
                         )}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-border-subtle rounded-full ${statusMeta.bg}`}></div>
                 </div>

                 <div onClick={() => setShowControls(!showControls)} className="flex flex-col">
                    <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5 hover:text-accent-secondary transition-colors">
                        {conversation.peerName.startsWith('[INT]') && <Lock size={14} className="text-status-error" />}
                        {conversation.peerName.replace('[INT] ', '')}
                        <ChevronDown size={14} className={`text-text-muted transition-transform duration-300 ${showControls ? 'rotate-180' : ''}`} />
                        {conversation.isPinned && <Pin size={14} className="text-text-muted transform rotate-45"/>}
                    </h3>
                    <div className="flex items-center gap-2">
                         {typingNow.length > 0 ? (
                             <span className="text-sm font-semibold text-accent-secondary">Typing...</span>
                         ) : (
                             <span className={`text-sm font-medium ${statusMeta.color} flex items-center gap-1.5 opacity-80`}>
                                 {statusMeta.text}
                             </span>
                         )}
                    </div>
                 </div>

                 {/* DROP DOWN MENU */}
                 {showControls && (
                    <div className="absolute top-14 left-4 w-60 bg-surface-alt border border-border-subtle shadow-xl rounded-lg py-2 flex flex-col animate-in fade-in zoom-in-95 duration-200 z-50">
                        <button onClick={(e) => { e.stopPropagation(); onMute(); setShowControls(false); }} className="flex items-center gap-3 px-4 py-2 hover:bg-surface-highlight text-sm font-medium text-text-primary transition-all text-left">
                            {isMuted ? <Bell size={16} className="text-status-error"/> : <BellOff size={16}/>}
                            <span>{isMuted ? 'Unmute Channel' : 'Mute Channel'}</span>
                        </button>
                        <button onClick={toggleSearch} className="flex items-center gap-3 px-4 py-2 hover:bg-surface-highlight text-sm font-medium text-text-primary transition-all text-left">
                            <Search size={16}/> Search
                        </button>
                        <div className="h-px bg-border-subtle my-1"></div>
                        <button onClick={(e) => { e.stopPropagation(); setShowWallpaperPicker(!showWallpaperPicker); }} className="flex items-center justify-between px-4 py-2 hover:bg-surface-highlight text-sm font-medium text-text-primary transition-all text-left w-full">
                            <div className="flex items-center gap-3"><Palette size={16}/> Theme</div>
                            <ChevronDown size={16} className={showWallpaperPicker ? 'rotate-180' : ''}/>
                        </button>
                        {showWallpaperPicker && (
                            <div className="grid grid-cols-5 gap-2 p-3 bg-surface-main mt-1 mx-2 rounded-md">
                                {WALLPAPERS.map(wp => (
                                    <button key={wp.id} onClick={(e) => { e.stopPropagation(); onChangeWallpaper(wp.bg); }} className="w-8 h-8 rounded-full border border-border-subtle relative hover:ring-2 ring-accent-secondary overflow-hidden" style={{ background: wp.bg ? `url(${wp.bg}) center/cover` : 'var(--color-surface-alt)' }}>
                                        {conversation.wallpaper === wp.bg && <div className="absolute inset-0 flex items-center justify-center bg-surface-alt"><Check size={14} className="text-text-primary"/></div>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                 )}
            </div>

            {/* SEARCH */}
            {showSearch ? (
                <div className="flex-1 max-w-md mx-4 relative animate-in fade-in slide-in-from-right-4">
                    <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                        ref={searchInputRef}
                        value={searchQuery}
                        onChange={(e) => onSearch(e.target.value)}
                        placeholder="Search..."
                        className="w-full bg-surface-main border border-border-subtle rounded-md py-1.5 pl-3 pr-8 text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent-secondary/50 transition-all"
                        onKeyDown={(e) => e.key === 'Escape' && toggleSearch(e as any)}
                    />
                    <button onClick={toggleSearch} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-primary transition-colors"><X size={14}/></button>
                </div>
            ) : (
                <div className="flex-1 flex justify-center">
                     <PresenceIndicator resourceId={conversation.id} />
                </div>
            )}

            {/* ACTIONS */}
            <div className="flex items-center gap-1.5">
                <button onClick={() => onStartCall('audio')} className="p-2 hover:bg-surface-alt rounded-md text-text-muted hover:text-text-primary transition-all" title="Audio Call">
                    <Phone size={18} />
                </button>
                <button onClick={() => onStartCall('video')} className="p-2 hover:bg-surface-alt rounded-md text-text-muted hover:text-text-primary transition-all" title="Video Call">
                    <Video size={18} />
                </button>
                
                <div className="w-px h-6 bg-border-subtle mx-1"></div>
                
                <button onClick={toggleMediaSidebar} className={`p-2 rounded-md transition-all ${showMediaSidebar ? 'bg-accent-secondary/15 text-accent-secondary' : 'hover:bg-surface-alt text-text-muted hover:text-text-primary'}`}>
                    <Layout size={18} />
                </button>

                <button onClick={toggleMaximize} className="p-2 hover:bg-surface-alt rounded-md text-text-muted hover:text-text-primary transition-all" title={isMaximized ? "Minimize" : "Maximize"}>
                    {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                
                <div className="relative" ref={menuRef}>
                    <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-surface-alt rounded-md text-text-muted hover:text-text-primary transition-all">
                        <MoreVertical size={18} />
                    </button>
                    {showMenu && (
                        <div className="absolute top-10 right-0 w-48 bg-surface-alt border border-border-subtle shadow-xl rounded-lg py-2 z-50 animate-in fade-in duration-200">
                            <button onClick={() => { onTogglePin(); setShowMenu(false); }} className="flex items-center gap-3 px-4 py-2 hover:bg-surface-highlight text-sm font-medium text-text-primary transition-all w-full text-left">
                                <Pin size={16}/> {conversation.isPinned ? 'Unpin' : 'Pin Channel'}
                            </button>
                            <button onClick={() => { onCreateGroup(); setShowMenu(false); }} className="flex items-center gap-3 px-4 py-2 hover:bg-surface-highlight text-sm font-medium text-text-primary transition-all w-full text-left">
                                <Users size={16}/> Add Members
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
