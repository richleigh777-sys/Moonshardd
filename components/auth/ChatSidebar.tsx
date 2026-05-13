
import React from 'react';
import { Search, Hash, Users, ShieldAlert } from 'lucide-react';
import { ChatChannel, User } from '../../types';
import { sfx } from '../../lib/soundService';

const getDmChannelId = (userId1: string, userId2: string) => {
    return [userId1, userId2].sort().join('_');
};

interface ChatSidebarProps {
    currentUser: User;
    activeChannelId: string;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    filteredChannels: { publicChans: ChatChannel[], dmChans: User[] };
    setActiveChannelId: (id: string) => void;
    setMobileView: (v: 'list' | 'chat') => void;
    mobileView: 'list' | 'chat';
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
    currentUser, activeChannelId, searchQuery, setSearchQuery, 
    filteredChannels, setActiveChannelId, setMobileView, mobileView 
}) => {
    
    // Ensure DM channels only show users from the same server (already handled by filteredChannels via parent, 
    // but explicit filtering here adds depth for display safety)
    const safeDmChannels = filteredChannels.dmChans.filter(u => u.serverId === currentUser.serverId);

    return (
        <div className={`flex-col bg-surface-alt border-r border-border-subtle shrink-0 transition-all ${mobileView === 'list' ? 'flex w-full' : 'hidden md:flex w-80'}`}>
            <div className="p-8 pb-4 flex items-center justify-between">
                <h2 className="text-2xl font-black tracking-tighter uppercase italic text-text-primary">Messages</h2>
            </div>
            <div className="px-6 pb-4">
                <div className="relative group">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-primary transition-colors"/>
                    <input 
                        className="w-full bg-white border border-border-subtle rounded-2xl py-3 pl-10 pr-4 text-xs font-bold outline-none focus:border-accent-primary focus:shadow-lg transition-all" 
                        placeholder="Search..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar">
                <div className="px-4 py-2">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.3em]">Channels</p>
                </div>
                {filteredChannels.publicChans.map(c => (
                    <button 
                        key={c.id} 
                        onClick={() => { setActiveChannelId(c.id); setMobileView('chat'); sfx.playClick(); }} 
                        className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all group ${activeChannelId === c.id ? 'bg-white border border-border-subtle shadow-md' : 'hover:bg-white/40 border border-transparent'}`}
                    >
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${activeChannelId === c.id ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/20' : 'bg-white border border-border-subtle text-text-muted group-hover:text-accent-primary'}`}>
                            {c.type === 'group' ? <Users size={20}/> : c.type === 'private' ? <ShieldAlert size={20}/> : <Hash size={20}/>}
                        </div>
                        <div className="text-left flex-1 truncate">
                            <p className={`text-sm font-black uppercase tracking-tight transition-colors ${activeChannelId === c.id ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'}`}>{c.name}</p>
                            <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-0.5">Active</p>
                        </div>
                        {/* Added unreadCount check which is now supported by updated ChatChannel interface */}
                        {c.unreadCount ? <div className="w-2 h-2 rounded-full bg-accent-primary shadow-sm animate-pulse"></div> : null}
                    </button>
                ))}
                
                <div className="px-4 py-2 mt-6">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.3em]">Direct Messages</p>
                </div>
                {safeDmChannels.map(u => {
                    const dmId = getDmChannelId(currentUser.id, u.id);
                    return (
                        <button 
                            key={u.id} 
                            onClick={() => { setActiveChannelId(dmId); setMobileView('chat'); sfx.playClick(); }} 
                            className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all group ${activeChannelId === dmId ? 'bg-white border border-border-subtle shadow-md' : 'hover:bg-white/40 border border-transparent'}`}
                        >
                            <div className="w-10 h-10 rounded-2xl overflow-hidden bg-white border border-border-subtle relative group-hover:scale-105 transition-transform shadow-sm">
                                {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black text-xs bg-surface-alt text-accent-primary">{u.name.charAt(0)}</div>}
                                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${ 
                                    u.currentStatus === 'online' ? 'bg-status-success' : 
                                    u.currentStatus === 'break' ? 'bg-status-warning' : 
                                    'bg-slate-300'
                                }`}></div>
                            </div>
                            <div className="text-left flex-1 truncate">
                                <p className={`text-sm font-black tracking-tight transition-colors ${activeChannelId === dmId ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'}`}>{u.name}</p>
                                <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-0.5">Status: {u.currentStatus || 'Offline'}</p>
                            </div>
                        </button>
                    );
                })}
            </div>
            <div className="p-6 border-t border-border-subtle bg-white/50">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-accent-primary shadow-lg ring-4 ring-accent-primary/5">
                        <img src={currentUser.avatar} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-text-primary uppercase tracking-tight truncate">{currentUser.name}</p>
                        <p className="text-[9px] font-bold text-accent-primary uppercase tracking-[0.2em] animate-pulse">Updating...</p>
                    </div>
                 </div>
            </div>
        </div>
    );
};
