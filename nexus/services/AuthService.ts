import { getStorageItem } from '../../lib/storage';
import { User } from '../../types';
import { BaseRepository } from '../repositories/BaseRepository';
import { RPCClient } from '../rpc';

export class AuthService {
    constructor(private repository: BaseRepository) {}

    public async verifySession(userId: string, _role: string, _level: number, sig: string): Promise<User | null> {
        try {
            if (!sig) {
                console.warn("[Nexus] Session verification failed: No signature provided.");
                return null;
            }
            const localData = getStorageItem('nexus_session_user');
            if (!localData) {
                console.warn("[Nexus] Session verification failed: Local storage empty.");
                return null;
            }

            try {
                const decoded = atob(sig);
                const parts = decoded.split(':');
                if (parts.length >= 3) {
                    const timestamp = parts.pop();
                    const serverId = parts.pop();
                    const id = parts.join(':');
                    
                    if (id !== userId) {
                        console.warn(`[Nexus] Session verification failed: ID mismatch. Expected ${userId}, got ${id}`);
                        return null;
                    }

                    const sessionAge = Date.now() - parseInt(timestamp || "0");
                    if (sessionAge > (12 * 60 * 60 * 1000)) {
                        console.warn("[Nexus] Session expired");
                        return null;
                    }

                    const effectiveServerId = serverId === 'sys_root' ? this.repository.activeServerId : serverId;
                    if (effectiveServerId && effectiveServerId !== this.repository.activeServerId) {
                        this.repository.setActiveServer(effectiveServerId);
                    }
                }
            } catch (e) {
                console.warn("[Nexus] Signature was not base64 but data exists, proceeding:", e);
                // Allow proceeding if parsing fails but localData exists 
            }

            return JSON.parse(localData);
        } catch (err: any) {
            console.error("[Nexus] Session verification logic error:", err);
            return null;
        }
    }

    public async authenticate(userId: string, userPass: string, companyId: string, _companyPass: string) {
        // --- Simulated Login for Dev Mode ---
        if (userId.startsWith('admin-srv-') && userPass === 'admin123') {
            const sig = btoa(`${userId}:${companyId}:${Date.now()}`);
            const authUser = {
               id: userId,
               serverId: companyId,
               role: 'admin',
               level: 8,
               name: `${userId.split('-').slice(-1)[0] === '1' ? 'Admin 1' : 'Admin 2'} (Simulated)`,
               passwordHash: '',
               status: 'active',
               accessLevel: 8,
               commissionRate: 0,
               active: true,
               team: 'Management',
               currentStatus: 'online'
            } as User;
            this.repository.setActiveServer(companyId);
            return { user: authUser, sig };
        }
        if (userId.startsWith('agent-srv-') && userPass === 'agent123') {
            const sig = btoa(`${userId}:${companyId}:${Date.now()}`);
            const authUser = {
               id: userId,
               serverId: companyId,
               role: 'agent',
               level: 1,
               name: `Agent ${userId.split('-').slice(-1)[0]} (Simulated)`,
               passwordHash: '',
               status: 'active',
               accessLevel: 1,
               commissionRate: 10,
               active: true,
               team: 'Alpha',
               currentStatus: 'online'
            } as User;
            this.repository.setActiveServer(companyId);
            return { user: authUser, sig };
        }

        try {
            // Check Postgres database API via Unified RPC
            const data = await RPCClient.post<{ user?: any, error?: string }>('/auth/login', { 
                email: userId, 
                password: userPass 
            });

            this.repository.setActiveServer(companyId);
            const sig = btoa(`${userId}:${companyId}:${Date.now()}`); // Mock JWT signature
            
            const authUser = { 
               id: userId, 
               serverId: companyId, 
               role: data.user?.role || 'agent', 
               level: data.user?.clearance || 1,
               name: userId,
               passwordHash: '',
               status: 'active',
               accessLevel: data.user?.clearance || 1,
               commissionRate: 15,
               active: true,
               team: data.user?.team || 'Alpha',
               currentStatus: 'online'
            } as User;
            return { user: authUser, sig };
        } catch (err: any) {
            console.error(`[Nexus] Postgres API Auth failed`, err);
            return { error: err.message || "Authentication failed." };
        }
    }

    public async authenticateRoot(userId: string, userPass: string, onRootCreated: () => Promise<void>) {
        try {
            // Always allow dummy root simulation if they type the correct master pass
            if (userId === "sys_root" && userPass === "root123") {
                const sid = 'srv-001';
                this.repository.setActiveServer(sid);
                const sig = btoa(`sys_root:${sid}:${Date.now()}`);
                const authUser = { 
                   id: 'sys_root', 
                   serverId: sid, 
                   role: 'admin', 
                   level: 10,
                   name: 'System Root',
                   passwordHash: '',
                   status: 'active',
                   accessLevel: 10,
                   commissionRate: 0,
                   active: true,
                   team: 'Admin',
                   currentStatus: 'online'
                } as User;
                
                await onRootCreated();

                return { user: authUser, sig };
            }

            // Otherwise, route to Postgres login
            return this.authenticate(userId, userPass, 'srv-001', '');
        } catch (err: any) {
            console.error(`[Nexus] Root Auth failed`, err);
            return { error: err.message || "Root Authentication failed." };
        }
    }
}
