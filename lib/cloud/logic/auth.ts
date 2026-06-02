import { User, Server } from '../../../types.ts';
import { SYSTEM_ADMIN_ID } from '../../../constants.ts';

export const authenticateUser = async (
    users: User[], 
    servers: Server[], 
    userId: string, 
    userPass: string, 
    companyId: string, 
    companyPass: string,
    currentActiveServerId: string,
    setActiveServer: (id: string) => void
) => {
    const server = servers.find(s => s.id === companyId);
    if (!server) throw new Error('Company/Server not found');
    if (server.accessKey !== companyPass) throw new Error('Invalid Company Password');

    const user = users.find(u => u.id === userId && u.serverId === companyId);
    if (!user) throw new Error('User not found on this server');
    if (user.passwordHash !== userPass) throw new Error('Invalid User Password');
    if (!user.active) throw new Error('User account is disabled');

    if (currentActiveServerId !== companyId) {
        setActiveServer(companyId);
    }

    return user;
};

export const authenticateRootUser = async (
    users: User[], 
    userId: string, 
    userPass: string
) => {
    const user = users.find(u => u.id === userId && u.id === SYSTEM_ADMIN_ID);
    if (!user) throw new Error('Root user not found');
    if (user.passwordHash !== userPass) throw new Error('Invalid Root Password');

    // Root can access any server, but we stay on current or default
    return user;
};

export const verifyUserSession = async (
    users: User[], 
    userId: string,
    currentActiveServerId: string,
    setActiveServer: (id: string) => void
) => {
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('Session invalid: User not found');
    
    if (user.role !== 'admin' && user.serverId !== currentActiveServerId) {
        setActiveServer(user.serverId);
    }

    return user;
};
