export const STORAGE_KEY = 'nexus-crm-storage-v2';
export const DEFAULT_SERVER_ID = 'srv-default-001';

export const delay = (ms: number = 50): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

export const getDmChannelId = (userId1: string, userId2: string): string => {
    const sortedIds = [userId1, userId2].sort();
    return `dm-${sortedIds[0]}-${sortedIds[1]}`;
};
