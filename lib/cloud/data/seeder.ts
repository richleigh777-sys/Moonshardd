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
            userCount: 17,
            accessKey: `key-${serverId}`
        });

        // 15 Agents per Server
        for (let j = 1; j <= 15; j++) {
            users.push({
                id: `agent-${serverId}-${j}`,
                serverId: serverId,
                passwordHash: 'agent123',
                name: `Agent ${j} (${companyName})`,
                role: 'agent',
                level: 1,
                commissionRate: 10,
                active: true,
                currentStatus: 'offline'
            });
        }

        // Add 2 Lower Admin Level Accounts per Server
        for (let k = 1; k <= 2; k++) {
            users.push({
                id: `admin-${serverId}-${k}`,
                serverId: serverId,
                passwordHash: 'admin123',
                name: `Admin ${k} (${companyName})`,
                role: 'admin',
                level: 8,
                commissionRate: 0,
                active: true,
                currentStatus: 'offline'
            });
        }

        configs.push({
            ...INITIAL_PRODUCT_CONFIG,
            serverId
        });

        systemConfigs.push({
            id: i === 1 ? 'CORE_CONFIG' : `sys-cfg-${serverId}`,
            serverId,
            rbacMatrix: {
                admin: { viewLeads: true, editLeads: true, deleteLeads: true, exportLeads: true, processSales: true, viewReports: true },
                agent: { viewLeads: true, editLeads: true, deleteLeads: false, exportLeads: false, processSales: true, viewReports: false }
            },
            customFieldsConfig: [
                { id: 'supp_primaryFocus', label: 'Primary Health Focus', type: 'select', options: ['Weight Loss', 'Muscle Gain', 'Joint Health', 'General Wellness', 'Heart Health', 'Brain Health'] },
                { id: 'supp_currentMeds', label: 'Taking Other Medications', type: 'boolean' },
                { id: 'supp_allergies', label: 'Allergies', type: 'text' },
                { id: 'supp_preferredForm', label: 'Preferred Supplement Form', type: 'select', options: ['Capsules', 'Gummies', 'Powders', 'Liquid'] },
                { id: 'supp_activityLevel', label: 'Activity Level', type: 'select', options: ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active'] },
                { id: 'supp_reorderCycleDays', label: 'Reorder Cycle (Days)', type: 'number' },
            ],
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
        passwordHash: 'root123',
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
