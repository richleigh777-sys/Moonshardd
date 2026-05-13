
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ChatMessage, User, Attachment } from '../types';
import { sfx } from '../lib/soundService';
import { useCRM } from '../hooks/useCRM';
import { ChatService } from '../services/ChatService';

export const useChat = (currentUser: User | null) => {
    const { 
        messages, channels: allChannels, 
        updateMessage, deleteMessage: apiDeleteMessage, 
        updateChannel, markMessageAsSeen
    } = useCRM();

    const [activeChannelId, setActiveChannelId] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [msgSearch, setMsgSearch] = useState('');
    
    // Typing state tracking
    const typingTimeoutRef = useRef<any>(null);
    const systemMsgSentRef = useRef<Record<string, boolean>>({});

    // Watch Connectivity
    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // System Message on Entry
    useEffect(() => {
        if (activeChannelId && !systemMsgSentRef.current[activeChannelId]) {
            ChatService.sendSystemMessage("Secure uplink established. End-to-end encryption active.", activeChannelId);
            systemMsgSentRef.current[activeChannelId] = true;
        }
    }, [activeChannelId]);

    // Automatic Read Marking
    useEffect(() => {
        if (!currentUser || !activeChannelId) return;
        
        const unreadFromOthers = messages.filter(m => 
            m.channelId === activeChannelId && 
            m.senderId !== currentUser.id && 
            (!m.readBy || !m.readBy.includes(currentUser.id))
        );

        if (unreadFromOthers.length > 0) {
            unreadFromOthers.forEach(m => markMessageAsSeen(m.id, currentUser.id));
            
            // Sync read status to conversation service for sidebar updates
            const parts = activeChannelId.split('_');
            if (parts.length === 2) {
                const peerId = parts.find(p => p !== currentUser.id);
                if (peerId) ChatService.markAsRead(activeChannelId, currentUser.id, peerId);
            }
        }
    }, [messages, activeChannelId, currentUser, markMessageAsSeen]);

    // Derived State
    const activeMessages = useMemo(() => {
        return messages
            .filter(m => m.channelId === activeChannelId)
            .sort((a, b) => a.timestamp - b.timestamp);
    }, [messages, activeChannelId]);

    const activeChannel = useMemo(() => 
        allChannels.find(c => c.id === activeChannelId), 
    [allChannels, activeChannelId]);

    // Actions
    const sendMessage = useCallback(async (text: string, attachments: Attachment[] = [], replyTo?: ChatMessage, extras?: any) => {
        if (!currentUser || !activeChannelId) return;
        if (!text.trim() && attachments.length === 0) return;

        // Sound Feedback
        sfx.playSubmit();

        const receiverId = activeChannelId.split('_').find(p => p !== currentUser.id) || 'all';

        await ChatService.sendMessage(text, currentUser, receiverId, {
            channelId: activeChannelId,
            attachments,
            replyToId: replyTo?.id,
            replyToName: replyTo?.senderName,
            replyToText: replyTo?.text,
            ...extras
        });
    }, [currentUser, activeChannelId]);

    const setTyping = useCallback((isTyping: boolean) => {
        if (!currentUser || !activeChannelId) return;
        
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        
        const channel = allChannels.find(c => c.id === activeChannelId);
        if (channel) {
            const currentTypers = channel.typingUsers || [];
            let newTypers = currentTypers;
            
            if (isTyping && !currentTypers.includes(currentUser.id)) {
                newTypers = [...currentTypers, currentUser.id];
                updateChannel(activeChannelId, { typingUsers: newTypers });
            } else if (!isTyping && currentTypers.includes(currentUser.id)) {
                newTypers = currentTypers.filter(id => id !== currentUser.id);
                updateChannel(activeChannelId, { typingUsers: newTypers });
            }

            if (isTyping) {
                // Use a self-referencing timeout handler or just clear it on unmount
                // To avoid linter error about recursion, we don't call setTyping directly here if possible
                // But we need to turn it off.
                // We can use a separate function for the timeout callback
                typingTimeoutRef.current = setTimeout(() => {
                    // Manually turn off typing without calling setTyping recursively if possible, 
                    // or just ignore the linter if we trust it. 
                    // But to fix the error, let's duplicate the logic for false case or use a ref.
                    if (!currentUser || !activeChannelId) return;
                    // We need to fetch the channel again or use functional update? 
                    // updateChannel is stable.
                    // Let's just call the logic directly.
                     const ch = allChannels.find(c => c.id === activeChannelId);
                     if (ch) {
                        const typers = ch.typingUsers || [];
                        if (typers.includes(currentUser.id)) {
                            const nt = typers.filter(id => id !== currentUser.id);
                            updateChannel(activeChannelId, { typingUsers: nt });
                        }
                     }
                }, 2500);
            }
        }
    }, [currentUser, activeChannelId, allChannels, updateChannel]);

    // Added votePoll implementation to resolve scope error for poll interactions
    const votePoll = useCallback(async (msgId: string, optionId: string) => {
        const msg = messages.find(m => m.id === msgId);
        if (!msg || !msg.poll || !currentUser) return;

        const newPoll = { ...msg.poll };
        newPoll.options = newPoll.options.map(opt => {
            const voters = new Set(opt.voters || []);
            if (opt.id === optionId) {
                if (voters.has(currentUser.id)) voters.delete(currentUser.id);
                else voters.add(currentUser.id);
            } else if (!newPoll.allowMultiple) {
                voters.delete(currentUser.id);
            }
            return { ...opt, voters: Array.from(voters), votes: voters.size };
        });

        await updateMessage(msgId, { poll: newPoll });
        sfx.playClick();
    }, [messages, currentUser, updateMessage]);

    return {
        messages: activeMessages,
        allChannels,
        activeChannelId,
        setActiveChannelId,
        searchQuery,
        setSearchQuery,
        sendMessage,
        setTyping,
        editMessage: (id: string, text: string) => updateMessage(id, { text, isEdited: true, editedAt: Date.now() }),
        deleteMessage: apiDeleteMessage,
        togglePin: (id: string) => {
            const msg = messages.find(m => m.id === id);
            if (msg) updateMessage(id, { isPinned: !msg.isPinned });
        },
        addReaction: async (msgId: string, emoji: string) => {
            const msg = messages.find(m => m.id === msgId);
            if (!msg || !currentUser) return;
            const current = msg.reactions || {};
            const userList = current[emoji] || [];
            const next = userList.includes(currentUser.id) 
                ? userList.filter(u => u !== currentUser.id) 
                : [...userList, currentUser.id];
            
            const updatedReactions = { ...current, [emoji]: next };
            if (next.length === 0) delete updatedReactions[emoji];
            updateMessage(msgId, { reactions: updatedReactions });
        },
        votePoll,
        isOffline,
        msgSearch,
        setMsgSearch,
        activeChannel
    };
};