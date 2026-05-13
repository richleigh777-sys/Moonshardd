
import { useState, useRef, useEffect } from 'react';
import { 
    Phone, Video, Layout, 
    Search, Bell, BellOff, MoreVertical, Pin, 
    Users, X, Palette, ChevronDown, Check,
    Maximize2, Minimize2
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
            case 'online': return { text: 'Uplink Established', color: 'text-emerald-400', bg: 'bg-emerald-500' };
            case 'break': return { text: 'Away', color: 'text-amber-400', bg: 'bg-amber-500' };
            case 'busy': return { text: 'Do Not Disturb', color: 'text-red-400', bg: 'bg-red-500' };
            default: return { text: 'Signal Lost', color: 'text-slate-500', bg: 'bg-slate-500' };
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
        <div className="absolute top-2 left-0 right-0 z-40 flex justify-center pointer-events-none px-4">
            <div className={`pointer-events-auto bg-slate-950/60 backdrop-blur-3xl border border-white/10 px-4 py-1.5 shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex items-center justify-between w-full ${isMaximized ? 'max-w-full mx-2' : 'max-w-4xl'} rounded-xl transition-all animate-in slide-in-from-top-6 duration-700 hover:border-white/20`}>
                
                {/* Identity */}
                <div className="flex items-center gap-3 cursor-pointer group" ref={controlsRef}>
                     <div className="relative" onClick={onViewProfileImage}>
                        <div className="h-8 w-8 bg-slate-800 rounded-lg border-2 border-white/10 overflow-hidden shadow-xl group-hover:border-accent-primary/50 transition-all group-hover:scale-105">
                             {conversation.peerAvatar ? (
                                 <img src={conversation.peerAvatar} className="h-full w-full object-cover" />
                             ) : (
                                 <div className="h-full w-full flex items-center justify-center bg-accent-primary/10 text-accent-primary font-black text-xs">{conversation.peerName.charAt(0)}</div>
                             )}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-[#09090b] rounded-full ${statusMeta.bg} shadow-lg`}></div>
                     </div>

                     <div onClick={() => setShowControls(!showControls)} className="flex flex-col">
                        <h3 className="text-[12px] font-black text-white uppercase tracking-tight flex items-center gap-1.5 group-hover:text-accent-primary transition-colors">
                            {conversation.peerName}
                            <ChevronDown size={10} className={`text-slate-500 transition-transform duration-300 ${showControls ? 'rotate-180' : ''}`} />
                            {conversation.isPinned && <Pin size={10} className="text-accent-primary fill-current rotate-45 animate-pulse"/>}
                        </h3>
                        <div className="flex items-center gap-2">
                             {typingNow.length > 0 ? (
                                 <span className="text-[9px] font-black text-accent-primary uppercase tracking-[0.2em] animate-pulse">Active...</span>
                             ) : (
                                 <span className={`text-[9px] font-bold uppercase tracking-[0.15em] ${statusMeta.color} flex items-center gap-1.5 opacity-80`}>
                                     <span className={`w-1 h-1 rounded-full ${statusMeta.bg} animate-pulse`}></span>
                                     {statusMeta.text}
                                 </span>
                             )}
                        </div>
                     </div>

                     {/* DROP DOWN MENU - Attached to name */}
                     {showControls && (
                        <div className="absolute top-full left-0 mt-4 w-64 bg-slate-900/95 backdrop-blur-3xl border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] rounded-3xl p-2 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-300 z-50">
                            <button onClick={(e) => { e.stopPropagation(); onMute(); setShowControls(false); }} className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl text-[13px] font-bold text-slate-300 hover:text-white transition-all">
                                {isMuted ? <Bell size={16} className="text-red-400"/> : <BellOff size={16}/>}
                                <span>{isMuted ? 'Enable Alerts' : 'Silence Feed'}</span>
                            </button>
                            <button onClick={toggleSearch} className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl text-[13px] font-bold text-slate-300 hover:text-white transition-all">
                                <Search size={16}/> Find Protocol
                            </button>
                            <div className="h-px bg-white/10 mx-4 my-1.5"></div>
                            <button onClick={(e) => { e.stopPropagation(); setShowWallpaperPicker(!showWallpaperPicker); }} className="flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl text-[13px] font-bold text-slate-300 hover:text-white transition-all">
                                <div className="flex items-center gap-4"><Palette size={16}/> Visuals</div>
                                <ChevronDown size={14} className={showWallpaperPicker ? 'rotate-180' : ''}/>
                            </button>
                            {showWallpaperPicker && (
                                <div className="grid grid-cols-5 gap-2.5 p-4 bg-white/5 mt-1 rounded-2xl mx-1">
                                    {WALLPAPERS.map(wp => (
                                        <button key={wp.id} onClick={(e) => { e.stopPropagation(); onChangeWallpaper(wp.bg); }} className="w-9 h-9 rounded-xl border border-white/20 relative hover:scale-110 transition-all overflow-hidden shadow-lg" style={{ background: wp.bg ? `url(${wp.bg}) center/cover` : '#1a1a1a' }}>
                                            {conversation.wallpaper === wp.bg && <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[1px]"><Check size={14} className="text-white"/></div>}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                     )}
                </div>

                {/* SEARCH BAR INJECTION */}
                {showSearch ? (
                    <div className="flex-1 mx-8 relative animate-in fade-in slide-in-from-right-4">
                        <input 
                            ref={searchInputRef}
                            value={searchQuery}
                            onChange={(e) => onSearch(e.target.value)}
                            placeholder="Scanning logs..."
                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-2.5 pl-5 pr-12 text-[13px] font-mono text-white outline-none focus:border-accent-primary transition-all shadow-inner"
                            onKeyDown={(e) => e.key === 'Escape' && toggleSearch(e as any)}
                        />
                        <button onClick={toggleSearch} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-xl text-slate-500 hover:text-white transition-colors"><X size={14}/></button>
                    </div>
                ) : (
                    <div className="flex-1 flex justify-center">
                         <PresenceIndicator resourceId={conversation.id} />
                    </div>
                )}

                {/* ACTIONS */}
                <div className="flex items-center gap-1.5">
                    <button onClick={() => onStartCall('audio')} className="p-2 bg-white/5 hover:bg-emerald-500/20 rounded-lg text-slate-400 hover:text-emerald-400 transition-all border border-transparent hover:border-emerald-500/30 shadow-lg hover:scale-105 active:scale-95" title="Audio Link">
                        <Phone size={14} />
                    </button>
                    <button onClick={() => onStartCall('video')} className="p-2 bg-white/5 hover:bg-indigo-500/20 rounded-lg text-slate-400 hover:text-indigo-400 transition-all border border-transparent hover:border-indigo-500/30 shadow-lg hover:scale-105 active:scale-95" title="Video Link">
                        <Video size={14} />
                    </button>
                    <div className="w-px h-5 bg-white/10 mx-1"></div>
                    <button onClick={toggleMediaSidebar} className={`p-2 rounded-lg transition-all shadow-lg hover:scale-105 active:scale-95 ${showMediaSidebar ? 'bg-accent-primary text-white shadow-accent-primary/40' : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'}`}>
                        <Layout size={14} />
                    </button>

                    <button onClick={toggleMaximize} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all shadow-lg hover:scale-105 active:scale-95" title={isMaximized ? "Minimize" : "Maximize"}>
                        {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>
                    
                    <div className="relative" ref={menuRef}>
                        <button onClick={() => setShowMenu(!showMenu)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all shadow-lg hover:scale-105 active:scale-95">
                            <MoreVertical size={14} />
                        </button>
                        {showMenu && (
                            <div className="absolute top-full right-0 mt-4 w-56 bg-slate-900/95 backdrop-blur-3xl border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] rounded-3xl p-2 z-50 animate-in fade-in zoom-in-95 duration-300">
                                <button onClick={() => { onTogglePin(); setShowMenu(false); }} className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl text-[13px] font-bold text-slate-300 hover:text-white transition-all w-full text-left">
                                    <Pin size={16}/> {conversation.isPinned ? 'Unpin' : 'Pin Priority'}
                                </button>
                                <button onClick={() => { onCreateGroup(); setShowMenu(false); }} className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl text-[13px] font-bold text-slate-300 hover:text-white transition-all w-full text-left">
                                    <Users size={16}/> Invite Others
                                </button>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
