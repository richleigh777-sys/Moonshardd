import { handleFirestoreError, OperationType } from '../../lib/firebaseUtils';
import { Server, Presence } from '../../types';

export class ConflictError extends Error {
    constructor(public currentData: any, public conflicts?: string[]) {
        super('Conflict detected: The record has been modified by another user.');
        this.name = 'ConflictError';
    }
}

export const removeUndefinedFields = (obj: any): any => {
    if (obj == null || typeof obj !== 'object' || obj instanceof Date) return obj;
    if (Array.isArray(obj)) return obj.map(removeUndefinedFields);
    const newObj: any = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (obj[key] !== undefined) {
                newObj[key] = removeUndefinedFields(obj[key]);
            }
        }
    }
    return newObj;
};

import { createServer as generateServer } from '../../lib/cloud/logic/crud';

export class BaseRepository {
    public activeServerId: string = localStorage.getItem('nexus_server_id') || 'srv-001';
    protected listeners: Record<string, any> = {};
    protected cache: Record<string, any[]> = {};
    protected fetchers: Record<string, () => void> = {};

    constructor() {
        console.log("[Nexus] Postgres Generic Document Storage Active");
    }

    public setActiveServer(id: string) {
        this.activeServerId = id;
        localStorage.setItem('nexus_server_id', id);
        window.dispatchEvent(new CustomEvent('nexus_server_changed', { detail: id }));
    }

    public getPath(collectionName: string, id?: string) {
        return id ? `/api/collections/${collectionName}/${id}` : `/api/collections/${collectionName}`;
    }

    public subscribe(collectionName: string, _user: any, callback: (data: any) => void) {
        if (this.listeners[collectionName]) {
            clearInterval(this.listeners[collectionName]);
        }

        const fetchLatest = async () => {
            try {
                // Add jitter to avoid batch 429 rate limit
                await new Promise(r => setTimeout(r, Math.random() * 10000));
                
                const res = await fetch(`/api/collections/${collectionName}`);
                if (!res.ok) {
                    const txt = await res.text();
                    throw new Error(`Failed to fetch ${collectionName}: ${res.status} ${txt}`);
                }
                const data = await res.json();
                
                // Do simple filtering based on user role just as before
                let filtered = data;
                if (_user && collectionName !== 'servers') {
                    if (_user.level < 5) {
                        if (collectionName === 'sales') filtered = data.filter((d:any) => d.agentId === _user.id);
                        if (collectionName === 'notes') filtered = data.filter((d:any) => d.agentId === _user.id);
                        if (collectionName === 'tasks') filtered = data.filter((d:any) => d.targetAgentId === _user.id);
                    } else if (_user.level >= 5 && _user.level < 10) {
                        const team = _user.team || 'Alpha';
                        if (collectionName === 'users') filtered = data.filter((d:any) => d.team === team);
                        if (collectionName === 'sales') filtered = data.filter((d:any) => d.team === team);
                        if (collectionName === 'customers') filtered = data.filter((d:any) => d.team === team);
                        if (collectionName === 'notes') filtered = data.filter((d:any) => d.team === team);
                        if (collectionName === 'audit') filtered = data.filter((d:any) => d.team === team);
                    }
                }
                
                this.cache[collectionName] = filtered;
                callback(filtered);
            } catch (error: any) {
                if (error.name !== 'TypeError' || !error.message.includes('fetch')) {
                    console.error("[Postgres API] Polling error", error);
                }
                
                            // Fallback to local storage if API is disconnected so it doesn't break everything at once
                const localData = localStorage.getItem(`crm_cache_${collectionName}`);
                if (localData) {
                    try {
                        const parsed = JSON.parse(localData);
                        this.cache[collectionName] = parsed;
                        callback(parsed);
                    } catch (e: any) {
                        console.warn('Local storage parse error', e);
                    }
                }
            }
        };

        this.fetchers[collectionName] = () => {
            setTimeout(fetchLatest, 200);
        };

        fetchLatest();
        const intervalId = setInterval(fetchLatest, 120000); // 120s poll
        this.listeners[collectionName] = intervalId;

        return () => clearInterval(intervalId);
    }

    public getData(collectionName: string) {
        return this.cache[collectionName] || [];
    }

    public async get(collectionName: string): Promise<any[]> {
        const res = await fetch(`/api/collections/${collectionName}`);
        if (!res.ok) {
           console.error("GET error", await res.text());
           return [];
        }
        return res.json();
    }

    public async getPaginated(collectionName: string, _queryConditions: any[] = [], limitCount: number = 50, _lastDoc?: any) {
        const data = await this.get(collectionName);
        return { data: data.slice(0, limitCount), lastDoc: null };
    }

    public async getGlobalUsers() {
        return this.getData('users');
    }

    public async getPaginatedSales(
        _page: number = 1, 
        pageSize: number = 100,
        filters?: { team?: string; agentId?: string; status?: string },
        _lastDoc?: any
    ) {
        let data = await this.get('sales');
        if (filters?.team) data = data.filter(d => d.team === filters.team);
        if (filters?.agentId) data = data.filter(d => d.agentId === filters.agentId);
        if (filters?.status) data = data.filter(d => d.status === filters.status);
        return { data: data.slice(0, pageSize), lastDoc: null };
    }

    public async verifyServerCredentials(_serverId: string, _accessKey: string): Promise<Server | null> {
        return null;
    }

    public async createServer(name: string, region: string) {
        const { newServer, newConfig, newSystemConfig } = await generateServer(name, region);
        
        const saveCollectionConfig = async (collection: string, data: any) => {
            const payload = JSON.parse(JSON.stringify(data));
            await fetch(`/api/collections/${collection}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        };
        
        await saveCollectionConfig('servers', newServer);
        await saveCollectionConfig('config', newConfig);
        await saveCollectionConfig('systemConfig', newSystemConfig);
        
        return newServer;
    }

    public async updateServer(serverId: string, data: Partial<Server>) {
        await fetch(`/api/collections/servers/${serverId}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    }

    public async deleteServer(serverId: string) {
        // We will remove it from 'servers' col
        await fetch(`/api/collections/servers/${serverId}`, {
            method: 'DELETE'
        });
        
        // Also fire off deletions of data for this server if we can
        // In a real app we might want to wipe data for this serverId
    }
    public async updateServerConfig(_serverId: string, _organizationalId: string, _accessKey: string) { return true; }

    public async add(collectionName: string, data: any) {
        const id = data.id || `${collectionName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const payload = removeUndefinedFields({
            ...(data && typeof data === 'object' ? data : {}),
            id,
            serverId: this.activeServerId,
            updatedAt: Date.now(),
            createdAt: (data as any)?.createdAt || Date.now()
        });

        try {
            await fetch(`/api/collections/${collectionName}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            // Also stash locally for resilience
            const localList = JSON.parse(localStorage.getItem(`crm_cache_${collectionName}`) || '[]');
            localList.push(payload);
            localStorage.setItem(`crm_cache_${collectionName}`, JSON.stringify(localList));

            if (this.fetchers[collectionName]) this.fetchers[collectionName]();

            return payload;
        } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, collectionName);
        }
    }

    public async update(collectionName: string, id: string, updates: any, expectedUpdatedAt?: number, originalData?: any) {
        try {
            const finalUpdates = removeUndefinedFields({
                ...(updates as object),
                updatedAt: Date.now()
            });
            
            await fetch(`/api/collections/${collectionName}/${id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalUpdates)
            });

            // Make optimistic update to local resilience cache
            const cacheKey = `crm_cache_${collectionName}`;
            const localList = JSON.parse(localStorage.getItem(cacheKey) || '[]');
            const idx = localList.findIndex((item:any) => item.id === id);
            if (idx !== -1) {
                localList[idx] = { ...localList[idx], ...finalUpdates };
                localStorage.setItem(cacheKey, JSON.stringify(localList));
            }

            if (this.fetchers[collectionName]) this.fetchers[collectionName]();

            return { id, ...(originalData || {}), ...finalUpdates };
        } catch (error) {
            if (error instanceof ConflictError) throw error;
            handleFirestoreError(error, OperationType.UPDATE, collectionName);
        }
    }

    public async delete(collectionName: string, id: string) {
        try {
            await fetch(`/api/collections/${collectionName}/${id}`, { method: 'DELETE' });
            // Local resilience clear
            const cacheKey = `crm_cache_${collectionName}`;
            const localList = JSON.parse(localStorage.getItem(cacheKey) || '[]');
            localStorage.setItem(cacheKey, JSON.stringify(localList.filter((item:any) => item.id !== id)));
            
            if (this.fetchers[collectionName]) this.fetchers[collectionName]();
        } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, collectionName);
        }
    }

    public async deleteBulk(collectionName: string, ids: string[]) {
        for (const id of ids) {
            await this.delete(collectionName, id);
        }
    }

    public async addBulk(collectionName: string, items: any[]): Promise<number> {
        let count = 0;
        for (const item of items) {
            await this.add(collectionName, item);
            count++;
        }
        return count;
    }

    public async updateBulk(collectionName: string, ids: string[], updates: any) {
        for (const id of ids) {
            await this.update(collectionName, id, updates);
        }
    }

    public async updatePresence(presence: Partial<Presence>) {
        if (!presence.userId || !presence.resourceId) return;
        const id = `${presence.userId}:${presence.resourceId}`;
        await this.add('presence', { ...presence, id });
    }

    public async clearPresence(userId: string, resourceId?: string) {
        if (resourceId) {
            const id = `${userId}:${resourceId}`;
            await this.delete('presence', id);
        }
    }
}
