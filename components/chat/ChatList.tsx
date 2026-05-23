
import React, { useState, useCallback } from 'react';
import { Search, Pin, Archive, Inbox, Activity, Signal, Lock } from 'lucide-react';
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
        case 'online': return 'bg-emerald-500';
        case 'break': return 'bg-amber-500';
        case 'busy': return 'bg-red-500';
        default: return 'bg-slate-500';
    }
};

// --- LIST ITEM COMPONENT ---
const ChatListItem = React.memo(({ chat, isActive, onClick, onAction }: { chat: Conversation, isActive: boolean, onClick: () => void, onAction: (e: React.MouseEvent, action: 'pin' | 'archive' | 'unarchive') => void }) => {
    return (
        <div 
            onClick={onClick}
            className={`
                group relative flex items-center gap-3 p-3 cursor-pointer rounded-lg mx-2 transition-all duration-200
                ${isActive 
                    ? "bg-surface-alt text-text-primary" 
                    : "hover:bg-surface-alt/50 text-text-primary"
                }
            `}
        >
            <div className="relative shrink-0">
                <div className={`h-11 w-11 rounded-full overflow-hidden transition-all duration-300 ${isActive ? 'ring-2 ring-indigo-500/50' : ''}`}>
                    {chat.peerAvatar ? (
                        <img src={chat.peerAvatar} className="h-full w-full object-cover" alt={chat.peerName} />
                    ) : (
                        <div className={`h-full w-full flex items-center justify-center font-bold text-sm ${isActive ? 'bg-indigo-500/20 text-indigo-300' : 'bg-surface-alt text-text-muted'}`}>
                            {chat.peerName.charAt(0)}
                        </div>
                    )}
                </div>
                <div className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-border-subtle ${getStatusColor(chat.peerStatus)}`}></div>
            </div>

            <div className="flex-1 min-w-0 pr-2">
                <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className={`text-sm font-semibold truncate flex items-center gap-1.5 ${isActive ? 'text-text-primary' : 'text-text-primary'}`}>
                        {chat.peerName.startsWith('[INT]') ? <span className="text-status-error flex items-center gap-1"><Lock size={12}/>{chat.peerName.replace('[INT] ', '')}</span> : chat.peerName}
                        {chat.isPinned && <Pin size={14} className="text-text-muted" />}
                    </h3>
                    {chat.lastMessageTime > 0 && (
                        <span className="text-xs font-medium text-text-muted">
                            {getRelativeTime(chat.lastMessageTime)}
                        </span>
                    )}
                </div>
                
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 overflow-hidden">
                        {chat.draft ? (
                            <span className="text-xs font-medium text-status-error italic">Draft: <span className="text-text-muted not-italic">{chat.draft}</span></span>
                        ) : (
                            <p className="text-xs truncate max-w-[180px] text-text-muted" style={{ fontFamily: EMOJI_FONT }}>
                                {chat.peerId === 'me' ? <span className="opacity-70">You: </span> : ''}{chat.lastMessage}
                            </p>
                        )}
                    </div>
                    
                    {chat.unreadCount > 0 && (
                        <span className="min-w-[18px] h-[18px] px-1 text-[10px] font-bold flex items-center justify-center rounded-full bg-indigo-500 text-text-primary">
                            {chat.unreadCount}
                        </span>
                    )}
                </div>
            </div>

            {/* Hover Actions */}
            <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={(e) => onAction(e, 'pin')}
                    className="p-1.5 hover:bg-gray-700/50 rounded-md text-text-muted hover:text-text-primary transition-colors"
                >
                    <Pin size={14} className={chat.isPinned ? "fill-current" : ""} />
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
      <div className="px-4 py-3 shrink-0">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted group-focus-within:text-accent-secondary transition-colors" />
          <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
            type="text"
            placeholder="Search..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-main border-none text-text-primary pl-9 pr-3 py-1.5 rounded-md text-sm outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-text-muted"
          />
        </div>
      </div>

      {/* List Stream */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-2 space-y-0.5">
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
            <div className="flex flex-col items-center justify-center h-32 text-text-muted">
                <p className="text-xs font-semibold">No active channels</p>
            </div>
        )}
      </div>
    </div>
  );
};
