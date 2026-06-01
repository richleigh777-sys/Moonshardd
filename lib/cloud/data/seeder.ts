import { INITIAL_PRODUCT_CONFIG, SYSTEM_ADMIN_ID } from '../../../constants';

export const seedInfrastructure = () => {
    const servers: any[] = [];
    const users: any[] = [];
    const configs: any[] = [];
    const systemConfigs: any[] = [];
    const channels: any[] = [];

    // Create 10 Default Servers
    for (let i = 1; i <= 10; i++) {
        const serverId = `srv-00${i}`;
        const companyName = `Company ${String.fromCharCode(64 + i)}`;
        
        servers.push({
            id: serverId,
            name: companyName,
            status: 'active',
            region: 'US-EAST-1',
            created: Date.now(),
            userCount: 10,
            accessKey: `key-${serverId}`
        });

        // 10 Agents per Server
        for (let j = 1; j <= 10; j++) {
            users.push({
                id: `agent-${serverId}-${j}`,
                serverId: serverId,
                pass: 'agent123',
                name: `Agent ${j} (${companyName})`,
                role: 'agent',
                level: 1,
                commissionRate: 10,
                active: true,
                currentStatus: 'offline'
            });
        }

        // Add 1 Manager per Server
        users.push({
            id: `admin-${serverId}-1`,
            serverId: serverId,
            pass: 'admin123',
            name: `Manager (${companyName})`,
            role: 'admin',
            level: 5,
            commissionRate: 0,
            active: true,
            currentStatus: 'offline'
        });

        configs.push({
            ...INITIAL_PRODUCT_CONFIG,
            serverId
        });

        systemConfigs.push({
            id: i === 1 ? 'CORE_CONFIG' : `sys-cfg-${serverId}`,
            serverId,
            shiftStart: '08:00',
            shiftEnd: '17:00',
            cutoffDay1: 15,
            cutoffDay2: 30,
            baseCommission: 10,
            breakDurationMinutes: 60,
            telephonyEnabled: true,
            enableConfetti: true,
            enableSoundFx: true,
            ecoMode: false
        });

        channels.push({
            id: `chan-general-${serverId}`,
            serverId: serverId,
            name: 'General',
            type: 'public',
            timestamp: Date.now()
        });
    }

    // Add Root Admin (Global Access)
    users.push({
        id: SYSTEM_ADMIN_ID,
        serverId: servers[0].id, // Default to first server
        pass: 'root123',
        name: 'System Administrator',
        role: 'admin',
        level: 10,
        commissionRate: 0,
        active: true,
        currentStatus: 'online'
    });

    const activeServerId = servers[0].id;
    
    const memoryStore = {
        servers,
        users,
        sales: [],
        customers: [],
        config: configs,
        systemConfig: systemConfigs,
        notes: [],
        tasks: [],
        audit: [],
        attendance: [],
        directives: [],
        messages: [],
        channels,
        notifications: [],
        callLogs: [],
        scripts: [],
        sheets: [],
        accounts: []
    };

    return { memoryStore, activeServerId };
};
