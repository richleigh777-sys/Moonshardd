import { Server, ProductConfig, SystemConfig, Sale } from '../../../types.ts';
import { INITIAL_PRODUCT_CONFIG } from '../../../constants.ts';
import { generateTransactionFingerprint } from '../../../views/utils/dataSanitizer.ts';

export const createServer = async (name: string, region: string) => {
    const serverId = `srv-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    const newServer: Server = {
        id: serverId,
        name,
        region,
        status: 'active',
        created: Date.now(),
        userCount: 0,
        accessKey: Math.random().toString(36).substr(2, 8)
    };

    const newConfig: ProductConfig = {
        ...INITIAL_PRODUCT_CONFIG,
        serverId
    };

    const newSystemConfig: SystemConfig = {
        serverId,
        shiftStart: '08:00',
        shiftEnd: '17:00',
        cutoffDay1: 15,
        cutoffDay2: 30,
        baseCommission: 10,
        breakDurationMinutes: 60,
        telephonyEnabled: true,
        enableConfetti: true,
        enableSoundFx: true
    };

    return { newServer, newConfig, newSystemConfig };
};

export const deleteServerData = (store: any, serverId: string) => {
    const newStore = { ...store };
    const collections = [
        'users', 'sales', 'customers', 'config', 'systemConfig', 
        'notes', 'tasks', 'audit', 'attendance', 'directives', 
        'messages', 'channels', 'notifications', 'callLogs', 
        'scripts', 'sheets', 'accounts'
    ];

    collections.forEach(col => {
        if (newStore[col]) {
            newStore[col] = newStore[col].filter((item: any) => item.serverId !== serverId);
        }
    });

    newStore.servers = newStore.servers.filter((s: Server) => s.id !== serverId);
    return newStore;
};

export const addSaleWithFingerprint = (current: Sale[], newItem: Sale, serverId: string) => {
    const fingerprint = generateTransactionFingerprint(newItem);
    const isDuplicate = current.some(s => 
        s.serverId === serverId && 
        generateTransactionFingerprint(s) === fingerprint &&
        Math.abs(s.timestamp - newItem.timestamp) < 60000 // 1 minute window
    );

    if (isDuplicate) {
        console.warn("Duplicate sale detected via fingerprint. Blocking.");
        return null;
    }

    return { ...newItem, serverId };
};
