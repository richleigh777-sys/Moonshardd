
import React, { useState, useCallback } from 'react';
import { Search, Pin, Archive, Inbox, Activity, Signal } from 'lucide-react';
import { Conversation, ChatService } from '../../services/ChatService';
import { useCRM } from '../../hooks/useCRM';
import { sfx } from '../../lib/soundService';
import { EMOJI_FONT } from '../../utils/emojis';

// --- UTILS ---
const getRelativeTime = (timestamp: number) => {
    if (!timestamp) return "";
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return new Date(timestamp).toLocaleDateString(undefined, {month:'short', day:'numeric'});
};

const getStatusColor = (status: string) => {
    switch(status) {
        case 'online': return 'bg-emerald-500 shadow-[0_0_8px_#10B981]';
        case 'break': return 'bg-amber-500 shadow-[0_0_8px_#F59E0B]';
        case 'busy': return 'bg-red-500 shadow-[0_0_8px_#EF4444]';
        default: return 'bg-slate-500 border-2 border-black';
    }
};

// --- LIST ITEM COMPONENT ---
const ChatListItem = React.memo(({ chat, isActive, onClick, onAction }: { chat: Conversation, isActive: boolean, onClick: () => void, onAction: (e: React.MouseEvent, action: 'pin' | 'archive' | 'unarchive') => void }) => {
    return (
        <div 
            onClick={onClick}
            className={`
                group relative flex items-center gap-3 p-2.5 cursor-pointer transition-all duration-300
                ${isActive 
                    ? "bg-accent-primary/10 border border-accent-primary/40 shadow-[inset_0_0_20px_rgba(99,102,241,0.1)]" 
                    : "border border-transparent hover:bg-white/[0.03] hover:border-white/5"
                }
            `}
        >
            {/* Active Indicator Strip */}
            {isActive && <div className="absolute left-0 top-2 bottom-2 w-1 bg-accent-primary shadow-[0_0_10px_#6366f1]"></div>}

            <div className="relative shrink-0">
                <div className={`h-10 w-10 overflow-hidden border-2 transition-all duration-300 group-hover:scale-105 ${isActive ? 'border-accent-primary/50' : 'border-white/10'}`}>
                    {chat.peerAvatar ? (
                        <img src={chat.peerAvatar} className="h-full w-full object-cover" alt={chat.peerName} />
                    ) : (
                        <div className={`h-full w-full flex items-center justify-center font-black text-sm bg-gradient-to-br ${isActive ? 'from-accent-primary to-indigo-700 text-white' : 'from-slate-800 to-slate-900 text-slate-400'}`}>
                            {chat.peerName.charAt(0)}
                        </div>
                    )}
                </div>
                <div className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 border-2 border-[#09090b] ${getStatusColor(chat.peerStatus)}`}></div>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className={`text-sm font-bold truncate flex items-center gap-1.5 ${isActive ? 'text-white' : 'text-slate-200'}`}>
                        {chat.peerName}
                        {chat.isPinned && <Pin size={10} className="text-accent-primary fill-current rotate-45" />}
                    </h3>
                    {chat.lastMessageTime > 0 && (
                        <span className={`text-[9px] font-mono font-medium ${isActive ? 'text-accent-primary' : 'text-slate-500'}`}>
                            {getRelativeTime(chat.lastMessageTime)}
                        </span>
                    )}
                </div>
                
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 overflow-hidden">
                        {chat.draft ? (
                            <span className="text-[10px] font-black text-rose-400 italic">Draft: <span className="font-medium text-slate-400 not-italic">{chat.draft}</span></span>
                        ) : (
                            <p className={`text-xs truncate max-w-[180px] leading-relaxed ${isActive ? 'text-indigo-200' : 'text-slate-500'}`} style={{ fontFamily: EMOJI_FONT }}>
                                {chat.peerId === 'me' ? <span className="opacity-50">You: </span> : ''}{chat.lastMessage}
                            </p>
                        )}
                    </div>
                    
                    {chat.unreadCount > 0 && (
                        <span className="min-w-[18px] h-[18px] text-[9px] font-black flex items-center justify-center rounded-full bg-accent-primary text-white shadow-lg shadow-accent-primary/40 animate-in zoom-in">
                            {chat.unreadCount}
                        </span>
                    )}
                </div>
            </div>

            {/* Hover Actions (Ghost) */}
            <div className="absolute right-2 top-8 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={(e) => onAction(e, 'pin')}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-colors"
                >
                    <Pin size={12} className={chat.isPinned ? "fill-current text-accent-primary" : ""} />
                </button>
            </div>
        </div>
    );
});

export const ChatList: React.FC<{ conversations: Conversation[], onSelectChat: (convo: Conversation) => void, activeConvoId?: string }> = ({ conversations, onSelectChat, activeConvoId }) => {
  const { currentUser } = useCRM();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'active' | 'archived'>('active');

  const handleAction = useCallback(async (e: React.MouseEvent, convo: Conversation, action: 'pin' | 'archive' | 'unarchive') => {
      e.stopPropagation();
      sfx.playClick();
      if (!currentUser) return;
      const updates: any = {};
      if (action === 'pin') updates.isPinned = !convo.isPinned;
      else if (action === 'archive') updates.isArchived = true;
      else if (action === 'unarchive') updates.isArchived = false;
      await ChatService.updateConversationSettings(currentUser, convo.peerId, updates);
  }, [currentUser]);

  const filtered = conversations.filter(c => {
      const matchesSearch = c.peerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesView = viewMode === 'active' ? !c.isArchived : c.isArchived;
      return matchesSearch && matchesView;
  });

  return (
    <div className="flex flex-col h-full w-full relative">
      
      {/* Search Header */}
      <div className="p-4 pb-2 shrink-0">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-white tracking-tighter uppercase italic flex items-center gap-2">
                <Signal size={16} className="text-accent-primary animate-pulse" /> Frequencies
            </h2>
            <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/5">
                <button onClick={() => setViewMode('active')} className={`p-1 rounded-md transition-all ${viewMode === 'active' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}><Inbox size={12}/></button>
                <button onClick={() => setViewMode('archived')} className={`p-1 rounded-md transition-all ${viewMode === 'archived' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}><Archive size={12}/></button>
            </div>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 group-focus-within:text-accent-primary transition-colors" />
          <input 
            type="text"
            placeholder="Search channels..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/10 text-white pl-10 pr-3 py-2.5 text-[11px] font-bold outline-none focus:border-accent-primary/50 focus:bg-white/[0.05] transition-all placeholder:text-slate-600 shadow-inner"
          />
        </div>
      </div>

      {/* List Stream */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
        {filtered.map((chat) => (
            <ChatListItem 
                key={chat.id} 
                chat={chat} 
                isActive={activeConvoId === chat.id} 
                onClick={() => onSelectChat(chat)} 
                onAction={(e, act) => handleAction(e, chat, act)} 
            />
        ))}
        {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 opacity-30 text-slate-500">
                <Activity size={32} className="mb-2" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Signal Lost</p>
            </div>
        )}
      </div>
    </div>
  );
};
