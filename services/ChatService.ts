
import { nexusGateway } from '../nexus/adapters/DataGateway';
import { ChatMessage, User } from '../types';

export interface ChatUser {
  id: string;
  name: string;
  avatarUrl?: string;
  isOnline: boolean;
}

export interface Conversation {
  id: string; // Combined ID: "user1_user2"
  peerId: string;
  peerName: string;
  peerAvatar?: string;
  peerIsOnline: boolean;
  peerStatus: 'online' | 'break' | 'offline' | 'busy';
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
  isPinned?: boolean;
  isArchived?: boolean;
  draft?: string;
  wallpaper?: string;
}

// Internal interface for the conversations map stored on User objects
interface UserConversationData {
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
  isPinned?: boolean;
  isArchived?: boolean;
  draft?: string;
  wallpaper?: string;
}

export const ChatService = {
  // 1. Listen for Conversations (The Sidebar Data)
  subscribeToConversations: (currentUser: User, users: User[], messages: ChatMessage[], callback: (convos: Conversation[]) => void) => {
    // Check Panopticon clearance (Level 10)
    const isPanopticon = (currentUser.level || 0) >= 10;
    
    let convos: Conversation[] = [];

    if (isPanopticon) {
        // Panopticon Mode: See ALL DMs that exist
        const uniqueChannels = new Set(messages.map(m => m.channelId).filter(id => id.includes('_')));
        
        uniqueChannels.forEach(channelId => {
            const userIds = channelId.split('_');
            // Ensure both users exist (skip if one was deleted)
            const peer1 = users.find(u => u.id === userIds[0]);
            const peer2 = users.find(u => u.id === userIds[1]);

            if (peer1 && peer2) {
                const peerMessages = messages.filter(m => m.channelId === channelId);
                const lastMsg = peerMessages.length > 0 ? peerMessages[peerMessages.length - 1] : null;
                
                // Show it as "UserA <-> UserB"
                convos.push({
                    id: channelId,
                    peerId: `${peer1.id}_${peer2.id}`, // Mock peer ID
                    peerName: `[INT] ${peer1.name} & ${peer2.name}`,
                    peerAvatar: undefined,
                    peerIsOnline: peer1.currentStatus === 'online' || peer2.currentStatus === 'online',
                    peerStatus: 'online',
                    lastMessage: lastMsg ? `${lastMsg.senderName}: ${lastMsg.text}` : '',
                    lastMessageTime: lastMsg ? lastMsg.timestamp : 0,
                    unreadCount: 0,
                    isPinned: false,
                    isArchived: false,
                    draft: '',
                    wallpaper: ''
                });
            }
        });
    } else {
        // Standard Behavior
        const operatives = users.filter(u => u.id !== currentUser.id && u.active);
        
        convos = operatives.map(peer => {
          const channelId = [currentUser.id, peer.id].sort().join('_');
          
          // Access the specific conversation data stored on the current user's profile
          const myConversations = (currentUser as any).conversations || {};
          const convoData: UserConversationData = myConversations[peer.id] || {
            lastMessage: "Open secure line...",
            lastMessageTime: 0,
            unreadCount: 0,
            isPinned: false,
            isArchived: false,
            draft: ''
          };

          // Fallback to real-time message filter if persistent data isn't initialized yet
          const peerMessages = messages.filter(m => m.channelId === channelId);
          const lastMsg = peerMessages.length > 0 ? peerMessages[peerMessages.length - 1] : null;
          
          return {
            id: channelId,
            peerId: peer.id,
            peerName: peer.name,
            peerAvatar: peer.avatar,
            peerIsOnline: peer.currentStatus === 'online',
            peerStatus: peer.currentStatus || 'offline',
            lastMessage: lastMsg ? lastMsg.text : convoData.lastMessage,
            lastMessageTime: lastMsg ? lastMsg.timestamp : convoData.lastMessageTime,
            unreadCount: convoData.unreadCount,
            isPinned: convoData.isPinned || false,
            isArchived: convoData.isArchived || false,
            draft: convoData.draft || '',
            wallpaper: convoData.wallpaper || ''
          };
        });
    }
    
    // Add Global Channel Logic
    const globalMessages = messages.filter(m => m.channelId === 'global-wins');
    const lastGlobalMsg = globalMessages.length > 0 ? globalMessages[globalMessages.length - 1] : null;
    const globalUnread = ((currentUser as any).conversations?.['global']?.unreadCount) || 0;
    
    convos.push({
        id: 'global-wins',
        peerId: 'global',
        peerName: '# Global Lobby & Wins',
        peerAvatar: undefined,
        peerIsOnline: true,
        peerStatus: 'online',
        lastMessage: lastGlobalMsg ? `${lastGlobalMsg.senderName}: ${lastGlobalMsg.text}` : 'Welcome to the global channel.',
        lastMessageTime: lastGlobalMsg ? lastGlobalMsg.timestamp : 0,
        unreadCount: globalUnread,
        isPinned: true, // Always pin global channel
        isArchived: false,
        draft: '',
        wallpaper: ''
    });

    convos.sort((a, b) => {
        // Sort Priority: Pinned > Date
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.lastMessageTime - a.lastMessageTime;
    });

    callback(convos);
  },

  // 2. Send Message (Handles "Unread" Logic for Recipient)
  sendMessage: async (text: string, sender: User, receiverId: string, extras?: Partial<ChatMessage>) => {
    if (!text.trim() && !extras?.attachments && !extras?.poll && !extras?.location) return;
    const channelId = extras?.channelId || [sender.id, receiverId].sort().join('_');
    const timestamp = Date.now();

    // A. Add the actual message to the global store
    await nexusGateway.add('messages', {
      channelId,
      text,
      senderId: sender.id,
      senderName: sender.name,
      senderRole: sender.role,
      timestamp,
      readBy: [sender.id],
      isRead: false, // explicitly track read status for checkmarks
      ...extras
    });

    // B. Update Recipient's Inbox (Increment Badge & Set Last Message)
    const allUsers = await nexusGateway.get('users');
    const receiver = allUsers.find(u => u.id === receiverId);
    if (receiver) {
      const conversations = { ...(receiver as any).conversations || {} };
      const prevData = conversations[sender.id] || { unreadCount: 0 };
      
      conversations[sender.id] = {
        ...prevData,
        lastMessage: text || (extras?.poll ? '📊 Poll' : extras?.location ? '📍 Location' : '📎 Attachment'),
        lastMessageTime: timestamp,
        unreadCount: (prevData.unreadCount || 0) + 1,
        isArchived: false // Unarchive on new message
      };
      
      await nexusGateway.update('users', receiverId, { conversations });
    }

    // C. Update Sender's Inbox (Just Set Last Message, Reset my own unread)
    const myRef = allUsers.find(u => u.id === sender.id);
    if (myRef) {
      const conversations = { ...(myRef as any).conversations || {} };
      const prevData = conversations[receiverId] || {};
      conversations[receiverId] = {
        ...prevData,
        lastMessage: "You: " + (text || (extras?.poll ? 'Poll' : extras?.location ? 'Location' : 'Attachment')),
        lastMessageTime: timestamp,
        unreadCount: 0,
        draft: '' // Clear draft on send
      };
      await nexusGateway.update('users', sender.id, { conversations });
    }
  },

  // 3. Mark Read (Clears Badge & Updates Message Status)
  markAsRead: async (convoId: string, currentUserId: string, peerId: string) => {
    // Clear the unread badge on the current user's profile
    const allUsers = await nexusGateway.get('users');
    const me = allUsers.find(u => u.id === currentUserId);
    
    if (me) {
      const conversations = { ...(me as any).conversations || {} };
      if (conversations[peerId]) {
        conversations[peerId].unreadCount = 0;
        await nexusGateway.update('users', currentUserId, { conversations });
      }
    }

    // Mark all incoming messages in this conversation as read
    const allMessages = await nexusGateway.get('messages') as any[];
    const unreadMessages = allMessages.filter(m => 
      m.channelId === convoId && 
      m.senderId === peerId && 
      !m.isRead
    );

    for (const msg of unreadMessages) {
      await nexusGateway.update('messages', msg.id, { isRead: true });
    }
  },

  // 4. Update Conversation Settings (Pin, Archive, Draft)
  updateConversationSettings: async (currentUser: User, peerId: string, settings: Partial<UserConversationData>) => {
      const allUsers = await nexusGateway.get('users');
      const me = allUsers.find(u => u.id === currentUser.id);
      if (me) {
          const conversations = { ...(me as any).conversations || {} };
          const existing = conversations[peerId] || {};
          conversations[peerId] = { ...existing, ...settings };
          await nexusGateway.update('users', currentUser.id, { conversations });
      }
  },
  
  // 5. Send System Message
  sendSystemMessage: async (text: string, channelId: string) => {
    await nexusGateway.add('messages', {
      channelId,
      text,
      senderId: 'system',
      senderName: 'SYSTEM',
      timestamp: Date.now(),
      readBy: [],
      isRead: true
    });
  }
};
