import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/Base';
import { ChatList } from './ChatList';
import { Conversation } from '../../services/ChatService';

interface ChatSidebarLayoutProps {
    mobileView: 'list' | 'chat';
    convos: Conversation[];
    activeChannelId: string;
    setActiveChannelId: (id: string) => void;
    setMobileView: (view: 'list' | 'chat') => void;
    setShowNewGroup: (show: boolean) => void;
}

export const ChatSidebarLayout: React.FC<ChatSidebarLayoutProps> = ({
    mobileView, convos, activeChannelId, setActiveChannelId, setMobileView, setShowNewGroup
}) => (
    <div className={`${mobileView === 'list' ? 'flex' : 'hidden md:flex'} w-full md:w-[380px] shrink-0 flex-col h-full border-r border-white/5 bg-slate-950/50 backdrop-blur-xl relative z-20`}>
        <ChatList 
            conversations={convos} 
            onSelectChat={(c) => { setActiveChannelId(c.id); setMobileView('chat'); }} 
            activeConvoId={activeChannelId} 
        />
        <div className="p-4 border-t border-white/5 bg-white/[0.02]">
            <Button onClick={() => setShowNewGroup(true)} variant="secondary" className="w-full text-[10px] font-black uppercase h-12 border border-white/10 hover:border-accent-primary/50 hover:text-accent-primary transition-all group">
                <Plus size={14} className="mr-2 group-hover:rotate-90 transition-transform"/> Initialize Group Protocol
            </Button>
        </div>
    </div>
);
