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

    private subscriberCallbacks: Record<string, Set<{ user: any; callback: (data: any) => void }>> = {};
    private batchQueue: Set<string> = new Set();
    private debounceTimeout: any = null;
    private globalIntervalId: any = null;
    private wsUnsubscribe: (() => void) | null = null;

    constructor() {
        console.log("[Nexus] Postgres Generic Document Storage Active");
        this.startGlobalInterval();
        this.setupRealtimeSubscription();
    }

    private setupRealtimeSubscription() {
        if (typeof window === 'undefined') return;
        try {
            import('../../lib/realtimeClient').then(({ realtimeClient }) => {
                this.wsUnsubscribe = realtimeClient.subscribe((event: any) => {
                    if (event && event.type === 'COLLECTION_MUTATED') {
                        const col = event.collectionName;
                        if (col && this.subscriberCallbacks[col]) {
                            console.log(`[Realtime Sync] Push notification received for collection: ${col}. Triggering fetch.`);
                            this.enqueueBatchFetch(col);
                        }
                    }
                });
            });
        } catch (err) {
            console.error('[Realtime Sync] Failed to register websocket subscriber:', err);
        }
    }

    private startGlobalInterval() {
        if (this.globalIntervalId) return;
        this.globalIntervalId = setInterval(() => {
            this.enqueueBatchFetch();
        }, 30000); // Poll all active subscriptions as a single batch every 30 seconds
    }

    public enqueueBatchFetch(collectionName?: string) {
        if (collectionName) {
            this.batchQueue.add(collectionName);
        } else {
            Object.keys(this.subscriberCallbacks).forEach(col => this.batchQueue.add(col));
        }

        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }

        this.debounceTimeout = setTimeout(async () => {
            const collectionsToFetch = Array.from(this.batchQueue);
            this.batchQueue.clear();
            if (collectionsToFetch.length === 0) return;

            await this.performBatchFetch(collectionsToFetch);
        }, 60);
    }

    private async performBatchFetch(collections: string[]) {
        try {
            const namesParam = encodeURIComponent(collections.join(','));
            const res = await fetch(`/api/collections/batch?names=${namesParam}`);
            
            if (!res.ok) {
                const txt = await res.text();
                if (res.status === 429) {
                    throw new Error("RATE_LIMIT_EXCEEDED");
                }
                throw new Error(`Failed to fetch batch collections: ${res.status} ${txt}`);
            }

            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error(`Expected JSON in batch but received ${contentType || 'no content-type'}`);
            }

            const batchData = await res.json();

            for (const col of collections) {
                const rawData = batchData[col] || [];
                
                try {
                    localStorage.setItem(`crm_cache_${col}`, JSON.stringify(rawData));
                } catch (e) {
                    console.warn(`Failed to store cache for ${col}`, e);
                }

                const subs = this.subscriberCallbacks[col];
                if (subs) {
                    subs.forEach(({ user, callback }) => {
                        let filtered = rawData;
                        if (user && col !== 'servers') {
                            if (user.level < 5) {
                                if (col === 'sales') filtered = rawData.filter((d: any) => d.agentId === user.id);
                                if (col === 'notes') filtered = rawData.filter((d: any) => d.agentId === user.id);
                                if (col === 'tasks') filtered = rawData.filter((d: any) => d.targetAgentId === user.id);
                            } else if (user.level >= 5 && user.level < 10) {
                                const team = user.team || 'Alpha';
                                if (col === 'users') filtered = rawData.filter((d: any) => d.team === team);
                                if (col === 'sales') filtered = rawData.filter((d: any) => d.team === team);
                                if (col === 'customers') filtered = rawData.filter((d: any) => d.team === team);
                                if (col === 'notes') filtered = rawData.filter((d: any) => d.team === team);
                                if (col === 'audit') filtered = rawData.filter((d: any) => d.team === team);
                            }
                        }
                        this.cache[col] = filtered;
                        callback(filtered);
                    });
                }
            }
        } catch (error: any) {
            if (error.message === "RATE_LIMIT_EXCEEDED") {
                // Silently fallback to cache due to API platform rate limits
            } else if (error.name !== 'TypeError' || !error.message.includes('fetch')) {
                console.error("[Postgres API] Batch polling error, utilizing local persistence cache:", error);
            }
            
            for (const col of collections) {
                const localData = localStorage.getItem(`crm_cache_${col}`);
                if (localData) {
                    try {
                        const parsed = JSON.parse(localData);
                        this.cache[col] = parsed;
                        
                        const subs = this.subscriberCallbacks[col];
                        if (subs) {
                            subs.forEach(({ user, callback }) => {
                                let filtered = parsed;
                                if (user && col !== 'servers') {
                                    if (user.level < 5) {
                                        if (col === 'sales') filtered = parsed.filter((d: any) => d.agentId === user.id);
                                        if (col === 'notes') filtered = parsed.filter((d: any) => d.agentId === user.id);
                                        if (col === 'tasks') filtered = parsed.filter((d: any) => d.targetAgentId === user.id);
                                    } else if (user.level >= 5 && user.level < 10) {
                                        const team = user.team || 'Alpha';
                                        if (col === 'users') filtered = parsed.filter((d: any) => d.team === team);
                                        if (col === 'sales') filtered = parsed.filter((d: any) => d.team === team);
                                        if (col === 'customers') filtered = parsed.filter((d: any) => d.team === team);
                                        if (col === 'notes') filtered = parsed.filter((d: any) => d.team === team);
                                        if (col === 'audit') filtered = parsed.filter((d: any) => d.team === team);
                                    }
                                }
                                callback(filtered);
                            });
                        }
                    } catch (e: any) {
                        console.warn(`Local storage parse error for ${col}`, e);
                    }
                }
            }
        }
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
        if (!this.subscriberCallbacks[collectionName]) {
            this.subscriberCallbacks[collectionName] = new Set();
        }

        const subObj = { user: _user, callback };
        this.subscriberCallbacks[collectionName].add(subObj);

        this.fetchers[collectionName] = () => {
            this.enqueueBatchFetch(collectionName);
        };

        this.enqueueBatchFetch(collectionName);

        return () => {
            const subs = this.subscriberCallbacks[collectionName];
            if (subs) {
                subs.delete(subObj);
                if (subs.size === 0) {
                    delete this.subscriberCallbacks[collectionName];
                }
            }
        };
    }

    public getData(collectionName: string) {
        return this.cache[collectionName] || [];
    }

    public async get(collectionName: string): Promise<any[]> {
        try {
            const res = await fetch(`/api/collections/${collectionName}`);
            if (!res.ok) {
               console.error("GET error", await res.text());
               return [];
            }
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await res.json();
            }
            return [];
        } catch (e) {
            console.error("BaseRepository get error:", e);
            return [];
        }
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
