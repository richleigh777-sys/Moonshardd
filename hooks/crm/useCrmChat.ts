import { useCallback } from 'react';
import { ChatMessage, ChatChannel } from '../../types';
import { nexusGateway } from '../../nexus/adapters/DataGateway';

export const useCrmChat = (
    messages: ChatMessage[],
    channels: ChatChannel[]
) => {
    const sendMessage = useCallback(async (msg: any) => await nexusGateway.add('messages', msg), []);
    const updateMessage = useCallback(async (id: string, upd: any) => await nexusGateway.update('messages', id, upd), []);
    const deleteMessage = useCallback(async (id: string) => await nexusGateway.update('messages', id, { isDeleted: true, text: 'Message deleted' }), []);
    
    const markMessageAsSeen = useCallback(async (id: string, uid: string) => {
        const msg = messages.find(m => m.id === id);
        if (msg && !msg.readBy?.includes(uid)) {
            await nexusGateway.update('messages', id, { readBy: [...(msg.readBy || []), uid] });
        }
    }, [messages]);
    
    const updateChannel = useCallback(async (id: string, d: any) => await nexusGateway.update('channels', id, d), []);
    
    const createChannel = useCallback(async (name: string, type: any, members: string[] = []) => {
        await nexusGateway.add('channels', { name, type, memberIds: members, timestamp: Date.now() });
    }, []);
    
    const leaveChannel = useCallback(async (cid: string, uid: string) => {
        const c = channels.find(c => c.id === cid);
        if (c) {
            await nexusGateway.update('channels', cid, { memberIds: c.memberIds.filter((m: string) => m !== uid) });
        }
    }, [channels]);
    
    const addToChannel = useCallback(async (cid: string, uid: string) => {
        const c = channels.find(c => c.id === cid);
        if (c && !c.memberIds.includes(uid)) {
            await nexusGateway.update('channels', cid, { memberIds: [...c.memberIds, uid] });
        }
    }, [channels]);

    return {
        sendMessage,
        updateMessage,
        deleteMessage,
        markMessageAsSeen,
        updateChannel,
        createChannel,
        leaveChannel,
        addToChannel
    };
};
