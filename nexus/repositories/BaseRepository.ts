import { getStorageItem, setStorageItem, removeStorageItem } from "../../lib/storage";
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
    public activeServerId: string = getStorageItem('nexus_server_id') || 'srv-001';
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
        }, 300000); // Poll all active subscriptions (increased to 5m to save Cloud costs) as a single batch every 30 seconds
    }

    public enqueueBatchFetch(collectionName?: string, immediate: boolean = false) {
        if (collectionName) {
            this.batchQueue.add(collectionName);
        } else {
            Object.keys(this.subscriberCallbacks).forEach(col => this.batchQueue.add(col));
        }
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
        const execute = async () => {
            const collectionsToFetch = Array.from(this.batchQueue);
            this.batchQueue.clear();
            if (collectionsToFetch.length === 0) return;
            await this.performBatchFetch(collectionsToFetch);
        };
        if (immediate) {
            execute();
        } else {
            this.debounceTimeout = setTimeout(execute, 2000);
        }
    }

    private getRequestHeaders(): Record<string, string> {
        let userLevel = '1';
        let userId = 'unknown';
        let userName = 'unknown';
        let userTeam = '';
        let userManagerId = '';
        let ghostAdminId = '';
        let ghostAdminName = '';
        try {
            const localUserStr = getStorageItem('nexus_session_user');
            if (localUserStr) {
                const u = JSON.parse(localUserStr);
                userLevel = String(u.level || '1');
                userId = String(u.id || 'unknown');
                userName = String(u.name || 'unknown');
                userTeam = String(u.team || '');
                userManagerId = String(u.managerId || '');
            }
            const ghostAdminStr = getStorageItem('nexus_ghost_origin');
            if (ghostAdminStr) {
                const ga = JSON.parse(ghostAdminStr);
                ghostAdminId = String(ga.id || '');
                ghostAdminName = String(ga.name || '');
            }
        } catch (err: any) {
            console.warn("[Nexus] Failed to parse request headers:", err.message);
        }

        const headers: Record<string, string> = {
            'X-Tenant-ID': this.activeServerId || 'srv-001',
            'X-User-Level': userLevel,
            'X-User-ID': userId,
            'X-User-Name': userName,
            'X-User-Team': userTeam,
            'X-User-Manager-ID': userManagerId,
            'Content-Type': 'application/json'
        };

        if (ghostAdminId) {
            headers['X-Impersonated-By-Admin-ID'] = ghostAdminId;
            headers['X-Impersonated-By-Admin-Name'] = ghostAdminName;
        }

        return headers;
    }

    private async performBatchFetch(collections: string[]) {
        try {
            const namesParam = encodeURIComponent(collections.join(','));
            const res = await fetch(`/api/collections/batch?names=${namesParam}`, {
                headers: this.getRequestHeaders()
            });
            
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
                    setStorageItem(`crm_cache_${col}`, JSON.stringify(rawData));
                } catch (e) {
                    console.warn(`Failed to store cache for ${col}`, e);
                }

                const subs = this.subscriberCallbacks[col];
                if (subs) {
                    subs.forEach(({ user, callback }) => {
                        let filtered = rawData;
                        if (user && col !== 'servers') {
                            if (user.level < 5) {
                                if (col === 'sales') filtered = rawData.filter((d: any) => d.agentId === user.id || d.agentId === user.email);
                                if (col === 'notes') filtered = rawData.filter((d: any) => d.agentId === user.id || d.agentId === user.email);
                                if (col === 'tasks') filtered = rawData.filter((d: any) => d.targetAgentId === user.id || d.targetAgentId === user.email);
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
            if (error.message === "RATE_LIMIT_EXCEEDED" || error.message?.includes('Expected JSON')) {
                // Silently fallback to cache due to API platform rate limits or Vite dev server HTML fallbacks
            } else if (error.name !== 'TypeError' || !error.message.includes('fetch')) {
                console.error("[Postgres API] Batch polling error, utilizing local persistence cache:", error.message);
            }
            
            for (const col of collections) {
                const localData = getStorageItem(`crm_cache_${col}`);
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
                                        if (col === 'sales') filtered = parsed.filter((d: any) => d.agentId === user.id || d.agentId === user.email);
                                        if (col === 'notes') filtered = parsed.filter((d: any) => d.agentId === user.id || d.agentId === user.email);
                                        if (col === 'tasks') filtered = parsed.filter((d: any) => d.targetAgentId === user.id || d.targetAgentId === user.email);
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
        setStorageItem('nexus_server_id', id);
        
        // Clear caches to prevent old data bleeding over across tenants
        const collectionsToClear = [
            'sales', 'users', 'customers', 'notes', 'audit', 'tasks', 'attendance', 
            'directives', 'messages', 'channels', 'notifications', 'callLogs',
            'scripts', 'sheets', 'presence', 'dialer_lists', 'systemConfig',
            'dataHealthReports', 'config'
        ];
        for (const col of collectionsToClear) {
            this.cache[col] = [];
            removeStorageItem(`crm_cache_${col}`);
            const subs = this.subscriberCallbacks[col];
            if (subs) {
                subs.forEach(({ callback }) => callback([]));
            }
        }

        window.dispatchEvent(new CustomEvent('nexus_server_changed', { detail: id }));
        
        // Immediately fetch the new server's data without debounce
        this.enqueueBatchFetch(undefined, true);
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
            const res = await fetch(`/api/collections/${collectionName}`, {
                headers: this.getRequestHeaders()
            });
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
            const headers = {
                ...this.getRequestHeaders(),
                'Content-Type': 'application/json'
            };
            await fetch(`/api/collections/${collection}`, {
                method: 'POST', headers,
                body: JSON.stringify(payload)
            });
        };
        
        await saveCollectionConfig('servers', newServer);
        await saveCollectionConfig('config', newConfig);
        await saveCollectionConfig('systemConfig', newSystemConfig);
        
        return newServer;
    }

    public async updateServer(serverId: string, data: Partial<Server>) {
        const headers = {
            ...this.getRequestHeaders(),
            'Content-Type': 'application/json'
        };
        await fetch(`/api/collections/servers/${serverId}`, {
            method: 'PUT', headers,
            body: JSON.stringify(data)
        });
    }

    public async deleteServer(serverId: string) {
        // We will remove it from 'servers' col
        await fetch(`/api/collections/servers/${serverId}`, {
            method: 'DELETE',
            headers: this.getRequestHeaders()
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
            const headers = {
                ...this.getRequestHeaders(),
                'Content-Type': 'application/json'
            };
            await fetch(`/api/collections/${collectionName}`, {
                method: 'POST', headers,
                body: JSON.stringify(payload)
            }).catch(e => {
                if (e.message?.includes('Failed to fetch')) {
                    console.warn(`[Nexus] Offline Mode: ${collectionName} cached locally.`);
                } else {
                    throw e;
                }
            });
            
            // Also stash locally for resilience
            const localList = JSON.parse(getStorageItem(`crm_cache_${collectionName}`) || '[]');
            localList.push(payload);
            setStorageItem(`crm_cache_${collectionName}`, JSON.stringify(localList));

            if (this.fetchers[collectionName]) this.fetchers[collectionName]();

            return payload;
        } catch (error: any) {
            if (error.message?.includes('Failed to fetch')) {
                console.warn(`[Nexus] Offline Mode: ${collectionName} cached locally.`);
                return payload;
            }
            console.error(error); throw new Error(`Create failed in ${collectionName}`);
        }
    }

    public async update(collectionName: string, id: string, updates: any, expectedUpdatedAt?: number, originalData?: any) {
        let finalUpdates: any = {};
        try {
            finalUpdates = removeUndefinedFields({
                ...(updates as object),
                updatedAt: Date.now()
            });
            
            const headers = {
                ...this.getRequestHeaders(),
                'Content-Type': 'application/json'
            };
            await fetch(`/api/collections/${collectionName}/${id}`, {
                method: 'PUT', headers,
                body: JSON.stringify(finalUpdates)
            }).catch(e => {
                if (e.message?.includes('Failed to fetch')) console.warn(`[Nexus] Offline Update...`);
                else throw e;
            });

            // Make optimistic update to local resilience cache
            const cacheKey = `crm_cache_${collectionName}`;
            const localList = JSON.parse(getStorageItem(cacheKey) || '[]');
            const idx = localList.findIndex((item:any) => item.id === id);
            if (idx !== -1) {
                localList[idx] = { ...localList[idx], ...finalUpdates };
                setStorageItem(cacheKey, JSON.stringify(localList));
            }

            if (this.fetchers[collectionName]) this.fetchers[collectionName]();

            return { id, ...(originalData || {}), ...finalUpdates };
        } catch (error: any) {
            if (error.message?.includes('Failed to fetch')) return { id, ...finalUpdates };
            if (error instanceof ConflictError) throw error;
            console.error(error); throw new Error(`Update failed in ${collectionName}`);
        }
    }

    public async delete(collectionName: string, id: string) {
        try {
            await fetch(`/api/collections/${collectionName}/${id}`, { 
                method: 'DELETE',
                headers: this.getRequestHeaders()
            }).catch(e => {
                if (e.message?.includes('Failed to fetch')) console.warn(`[Nexus] Offline Delete...`);
                else throw e;
            });
            // Local resilience clear
            const cacheKey = `crm_cache_${collectionName}`;
            const localList = JSON.parse(getStorageItem(cacheKey) || '[]');
            setStorageItem(cacheKey, JSON.stringify(localList.filter((item:any) => item.id !== id)));
            
            if (this.fetchers[collectionName]) this.fetchers[collectionName]();
        } catch (error: any) {
            if (error.message?.includes('Failed to fetch')) return;
            console.error(error); throw new Error(`Delete failed in ${collectionName}`);
        }
    }

    public async deleteBulk(collectionName: string, ids: string[]) {
        if (!ids || ids.length === 0) return;
        try {
            const headers = {
                ...this.getRequestHeaders(),
                'Content-Type': 'application/json'
            };

            const BATCH_LIMIT = 500;
            for (let i = 0; i < ids.length; i += BATCH_LIMIT) {
                const chunk = ids.slice(i, i + BATCH_LIMIT);
                await fetch(`/api/collections/${collectionName}/bulk`, {
                    method: 'DELETE',
                    headers,
                    body: JSON.stringify(chunk)
                }).then(async r => {
                    if (!r.ok) {
                        const text = await r.text();
                        if (!text.includes('Failed to fetch')) throw new Error(text);
                    }
                });
            }

            // Local resilience clear
            const cacheKey = `crm_cache_${collectionName}`;
            const localList = (JSON.parse(getStorageItem(cacheKey) || '[]')).filter((item: any) => !ids.includes(item.id));
            setStorageItem(cacheKey, JSON.stringify(localList));
            
            if (this.fetchers[collectionName]) this.fetchers[collectionName]();
        } catch (error: any) {
            console.error('deleteBulk Error:', error);
            if (error.message?.includes('Failed to fetch')) return;
            console.error(error); throw new Error(`Delete failed in ${collectionName}`);
        }
    }

    public async addBulk(collectionName: string, items: any[]): Promise<number> {
        if (!items || items.length === 0) return 0;
        
        const payloadItems = items.map(data => {
            const id = data.id || `${collectionName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            return removeUndefinedFields({
                ...(data || {}),
                id,
                serverId: this.activeServerId,
                updatedAt: Date.now(),
                createdAt: data?.createdAt || Date.now()
            });
        });

        try {
            const headers = {
                ...this.getRequestHeaders(),
                'Content-Type': 'application/json'
            };
            
            const BATCH_LIMIT = 500;
            let successCount = 0;
            
            for (let i = 0; i < payloadItems.length; i += BATCH_LIMIT) {
                const chunk = payloadItems.slice(i, i + BATCH_LIMIT);
                await fetch(`/api/collections/${collectionName}/bulk`, {
                    method: 'POST', 
                    headers,
                    body: JSON.stringify(chunk)
                }).then(async r => {
                    const text = await r.text();
                    if (!r.ok) {
                       if (text.includes('Failed to fetch')) {
                          console.warn(`[Nexus] Offline bulk mode chunk ${i}`);
                       } else {
                           throw new Error(text);
                       }
                    }
                });
                successCount += chunk.length;
            }

            // Local cache
            const cacheKey = `crm_cache_${collectionName}`;
            const localList: any[] = JSON.parse(getStorageItem(cacheKey) || '[]');
            
            payloadItems.forEach(item => {
                const index = localList.findIndex((i: any) => i.id === item.id);
                if (index > -1) {
                    localList[index] = { ...localList[index], ...item };
                } else {
                    localList.push(item);
                }
            });
            
            setStorageItem(cacheKey, JSON.stringify(localList));

            if (this.fetchers[collectionName]) this.fetchers[collectionName]();

            return successCount;
        } catch (error: any) {
            console.error('addBulk Error:', error);
            if (error.message?.includes('Failed to fetch')) return payloadItems.length;
            console.error(error); throw new Error(`Create failed in ${collectionName}`);
            return 0;
        }
    }

    public async updateBulk(collectionName: string, ids: string[], updates: any) {
        if (!ids.length) return;
        const items = ids.map(id => ({ id, ...updates }));
        await this.addBulk(collectionName, items);
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
