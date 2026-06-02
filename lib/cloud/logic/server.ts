import { User, Sale, Server } from '../../../types.ts';

export const getServerStats = (users: User[], sales: Sale[], serverId: string) => {
    const serverUsers = users.filter(u => u.serverId === serverId);
    const serverSales = sales.filter(s => s.serverId === serverId);
    const approvedSales = serverSales.filter(s => s.status === 'Approved');

    return {
        userCount: serverUsers.length,
        activeUsers: serverUsers.filter(u => u.currentStatus !== 'offline').length,
        totalRevenue: approvedSales.reduce((acc, s) => acc + s.amount, 0),
        saleCount: approvedSales.length,
        pendingCount: serverSales.filter(s => s.status === 'Pending').length,
        declineRate: serverSales.length ? (serverSales.filter(s => s.status === 'Declined').length / serverSales.length) * 100 : 0
    };
};

export const verifyServerCredentials = async (servers: Server[], serverId: string, accessKey: string) => {
    const server = servers.find(s => s.id === serverId);
    if (!server) throw new Error('Server not found');
    if (server.accessKey !== accessKey) throw new Error('Invalid Server Access Key');
    return server;
};
