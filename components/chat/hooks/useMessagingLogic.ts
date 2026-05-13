import { useState, useEffect, useMemo } from 'react';
import { Conversation, ChatService } from '../../../services/ChatService';
import { useCRM } from '../../../hooks/useCRM';
import { useChat } from '../../../hooks/useChat';

export const useMessagingLogic = () => {
    const { currentUser, users } = useCRM();
    const { 
        messages, allChannels, activeChannelId, setActiveChannelId, setTyping,
        sendMessage, editMessage, deleteMessage, togglePin, addReaction, votePoll,
        isOffline, msgSearch, setMsgSearch
    } = useChat(currentUser);

    const [convos, setConvos] = useState<Conversation[]>([]);
    const [showNewGroup, setShowNewGroup] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
    const [now] = useState(() => Date.now());

    useEffect(() => {
        if (currentUser && users.length > 0) {
            ChatService.subscribeToConversations(currentUser, users, messages, setConvos);
        }
    }, [currentUser, users, messages]);

    const activeConversation = useMemo(() => {
        const existing = convos.find(c => c.id === activeChannelId);
        if (existing) return existing;

        if (activeChannelId.includes('_')) {
            const parts = activeChannelId.split('_');
            const peerId = parts.find(id => id !== currentUser?.id);
            const peer = users.find(u => u.id === peerId);
            
            if (peer && currentUser) {
                return {
                    id: activeChannelId,
                    peerId: peer.id,
                    peerName: peer.name,
                    peerAvatar: peer.avatar,
                    peerIsOnline: peer.currentStatus === 'online',
                    peerStatus: peer.currentStatus || 'offline',
                    lastMessage: '',
                    lastMessageTime: now,
                    unreadCount: 0
                } as Conversation;
            }
        }
        return null;
    }, [convos, activeChannelId, users, currentUser, now]);

    const activeTypingUsers = useMemo(() => {
        if (!activeConversation) return [];
        const channel = allChannels.find(c => c.id === activeConversation.id);
        return (channel?.typingUsers || []).filter(id => id !== currentUser?.id).map(id => users.find(u => u.id === id)?.name || "Agent");
    }, [allChannels, activeConversation, currentUser, users]);

    return {
        currentUser, users, messages, activeChannelId, setActiveChannelId, setTyping,
        sendMessage, editMessage, deleteMessage, togglePin, addReaction, votePoll,
        isOffline, msgSearch, setMsgSearch, convos, showNewGroup, setShowNewGroup,
        isMaximized, setIsMaximized, searchQuery, setSearchQuery, mobileView, setMobileView,
        activeConversation, activeTypingUsers
    };
};
