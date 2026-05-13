export const cloud = { addBulk: async (_collection: string, _data: any[]) => {} };
export const getDmChannelId = (userId1: string, userId2: string): string => {
    const sortedIds = [userId1, userId2].sort();
    return `dm-${sortedIds[0]}-${sortedIds[1]}`;
};
export const sendMessage = async (_message: any) => {};
