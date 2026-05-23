import { 
    collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, 
    getDocs, getDoc, writeBatch, query, where,
    orderBy, limit, startAfter
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
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

export class BaseRepository {
    public activeServerId: string = localStorage.getItem('nexus_server_id') || 'srv-001';
    protected listeners: Record<string, () => void> = {};
    protected cache: Record<string, any[]> = {};

    constructor() {
        console.log("[Nexus] Base Repository Active");
    }

    public setActiveServer(id: string) {
        this.activeServerId = id;
        localStorage.setItem('nexus_server_id', id);
        window.dispatchEvent(new CustomEvent('nexus_server_changed', { detail: id }));
    }

    public getPath(collectionName: string, id?: string) {
        if (collectionName === 'servers') return id ? `servers/${id}` : 'servers';
        const basePath = `servers/${this.activeServerId}/${collectionName}`;
        return id ? `${basePath}/${id}` : basePath;
    }

    public subscribe(collectionName: string, _user: any, callback: (data: any) => void) {
        if (this.listeners[collectionName]) {
            this.listeners[collectionName]();
        }

        const path = this.getPath(collectionName);
        let q;
        
        if (collectionName === 'servers') {
            if (_user?.level < 10) {
                const docRef = doc(db, 'servers', this.activeServerId);
                const unsub = onSnapshot(docRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = [{ ...(docSnap.data() as any), id: docSnap.id }];
                        this.cache[collectionName] = data;
                        callback(data);
                    }
                }, (error) => {
                    handleFirestoreError(error, OperationType.GET, `servers/${this.activeServerId}`);
                });
                this.listeners[collectionName] = unsub;
                return unsub;
            }
            q = collection(db, 'servers');
        } else {
            const baseCol = collection(db, 'servers', this.activeServerId, collectionName);
            if (_user && _user.level < 5) {
                if (collectionName === 'sales') {
                    q = query(baseCol, where('agentId', '==', _user.id), orderBy('updatedAt', 'desc'), limit(150));
                } else if (collectionName === 'notes') {
                    q = query(baseCol, where('agentId', '==', _user.id), limit(100));
                } else if (collectionName === 'tasks') {
                    q = query(baseCol, where('targetAgentId', '==', _user.id), limit(50));
                } else if (collectionName === 'customers') {
                    q = query(baseCol, orderBy('updatedAt', 'desc'), limit(100));
                } else {
                    q = baseCol;
                }
            } else if (_user && _user.level >= 5 && _user.level < 10) {
                if (collectionName === 'users') {
                    q = query(baseCol, where('team', '==', _user.team || 'Alpha'));
                } else if (collectionName === 'sales') {
                    q = query(baseCol, where('team', '==', _user.team || 'Alpha'), orderBy('updatedAt', 'desc'), limit(300));
                } else if (collectionName === 'customers') {
                    q = query(baseCol, where('team', '==', _user.team || 'Alpha'), orderBy('updatedAt', 'desc'), limit(200));
                } else if (collectionName === 'notes') {
                    q = query(baseCol, where('team', '==', _user.team || 'Alpha'), limit(150));
                } else if (collectionName === 'audit') {
                    q = query(baseCol, where('team', '==', _user.team || 'Alpha'), orderBy('timestamp', 'desc'), limit(100));
                } else {
                    q = baseCol;
                }
            } else {
                if (collectionName === 'customers') {
                    q = query(baseCol, orderBy('updatedAt', 'desc'), limit(200));
                } else if (collectionName === 'sales') {
                    q = query(baseCol, orderBy('updatedAt', 'desc'), limit(500));
                } else if (collectionName === 'audit') {
                    q = query(baseCol, orderBy('timestamp', 'desc'), limit(300));
                } else {
                    q = baseCol;
                }
            }
        }

        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(d => ({ ...(d.data() as any), id: d.id }));
            this.cache[collectionName] = data;
            callback(data);
        }, (error) => {
            handleFirestoreError(error, OperationType.LIST, path);
        });

        this.listeners[collectionName] = unsub;
        return unsub;
    }

    public getData(collectionName: string) {
        return this.cache[collectionName] || [];
    }

    public async get(collectionName: string): Promise<any[]> {
        let q;
        if (collectionName === 'servers') {
            q = collection(db, 'servers');
        } else {
            q = collection(db, 'servers', this.activeServerId, collectionName);
        }
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ ...(d.data() as any), id: d.id }));
    }

    public async getPaginated(collectionName: string, queryConditions: any[] = [], limitCount: number = 50, lastDoc?: any) {
        const baseCol = collectionName === 'servers' ? collection(db, 'servers') : collection(db, 'servers', this.activeServerId, collectionName);
        let q;
        if (lastDoc) {
            q = query(baseCol, ...queryConditions, limit(limitCount), startAfter(lastDoc));
        } else {
            q = query(baseCol, ...queryConditions, limit(limitCount));
        }
        
        try {
            const snap = await getDocs(q);
            const data = snap.docs.map(d => ({ ...(d.data() as any), id: d.id }));
            const lastVisible = snap.docs[snap.docs.length - 1];
            return { data, lastDoc: lastVisible };
        } catch (error) {
            handleFirestoreError(error, OperationType.GET, collectionName);
            return { data: [], lastDoc: null };
        }
    }

    public async getGlobalUsers() {
        return this.getData('users');
    }

    public async verifyServerCredentials(serverId: string, accessKey: string): Promise<Server | null> {
        const snap = await getDoc(doc(db, 'servers', serverId));
        if (snap.exists()) {
            const server = snap.data() as Server;
            return server.accessKey === accessKey ? server : null;
        }
        return null;
    }

    public async createServer(name: string, region: string) {
        const id = `srv-${Date.now()}`;
        const newServer: Server = {
            id,
            name,
            region,
            status: 'active' as const,
            created: Date.now(),
            userCount: 0,
            accessKey: `key-${id}`
        };
        await setDoc(doc(db, 'servers', id), newServer);
        return newServer;
    }

    public async updateServer(serverId: string, data: Partial<Server>) {
        await updateDoc(doc(db, 'servers', serverId), { ...data, updatedAt: Date.now() });
    }

    public async deleteServer(serverId: string) {
        await deleteDoc(doc(db, 'servers', serverId));
    }

    public async updateServerConfig(serverId: string, organizationalId: string, accessKey: string) {
        const ref = doc(db, 'servers', serverId);
        await updateDoc(ref, { id: organizationalId, accessKey, updatedAt: Date.now() });
        return true;
    }

    public async add(collectionName: string, data: any) {
        const id = data.id || `${collectionName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const path = this.getPath(collectionName, id);
        const ref = doc(db, path);
        
        const payload = removeUndefinedFields({
            ...(data && typeof data === 'object' ? data : {}),
            id,
            serverId: collectionName === 'servers' ? undefined : this.activeServerId,
            updatedAt: Date.now(),
            createdAt: (data as any)?.createdAt || Date.now()
        });

        try {
            await setDoc(ref, payload);
            return payload;
        } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, path);
        }
    }

    public async update(collectionName: string, id: string, updates: any, expectedUpdatedAt?: number, originalData?: any) {
        const path = this.getPath(collectionName, id);
        const ref = doc(db, path);
        
        try {
            if (expectedUpdatedAt) {
                const snap = await getDoc(ref);
                if (snap.exists()) {
                    const currentData = snap.data();
                    if (currentData.updatedAt && currentData.updatedAt !== expectedUpdatedAt) {
                        const conflicts: string[] = [];
                        let hasConflict = false;
                        
                        if (originalData) {
                            for (const key in updates) {
                                if (currentData[key] !== originalData[key] && currentData[key] !== updates[key]) {
                                    conflicts.push(key);
                                    hasConflict = true;
                                }
                            }
                            if (hasConflict) {
                                throw new ConflictError(currentData, conflicts);
                            }
                        } else {
                            throw new ConflictError(currentData);
                        }
                    }
                }
            }

            const finalUpdates = removeUndefinedFields({
                ...(updates as object),
                updatedAt: Date.now()
            });
            await updateDoc(ref, finalUpdates);
            
            const finalSnap = await getDoc(ref);
            return { id, ...(finalSnap.exists() ? finalSnap.data() : finalUpdates) };
        } catch (error) {
            if (error instanceof ConflictError) throw error;
            handleFirestoreError(error, OperationType.UPDATE, path);
        }
    }

    public async delete(collectionName: string, id: string) {
        const path = this.getPath(collectionName, id);
        const ref = doc(db, path);
        try {
            await deleteDoc(ref);
        } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, path);
        }
    }

    public async deleteBulk(collectionName: string, ids: string[]) {
        const batch = writeBatch(db);
        ids.forEach(id => {
            const path = this.getPath(collectionName, id);
            batch.delete(doc(db, path));
        });
        try {
            await batch.commit();
        } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, collectionName);
        }
    }

    public async addBulk(collectionName: string, items: any[]): Promise<number> {
        const batch = writeBatch(db);
        items.forEach(item => {
            const id = item.id || `${collectionName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const path = this.getPath(collectionName, id);
            const payload = removeUndefinedFields({
                ...(item && typeof item === 'object' ? item : {}),
                id,
                serverId: this.activeServerId,
                updatedAt: Date.now()
            });
            batch.set(doc(db, path), payload);
        });
        try {
            await batch.commit();
            return items.length;
        } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, collectionName);
            return 0;
        }
    }

    public async updateBulk(collectionName: string, ids: string[], updates: any) {
        const batch = writeBatch(db);
        const finalUpdates = removeUndefinedFields({ ...(updates as object), updatedAt: Date.now() });
        ids.forEach(id => {
            const path = this.getPath(collectionName, id);
            batch.update(doc(db, path), finalUpdates);
        });
        try {
            await batch.commit();
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, collectionName);
        }
    }

    public async updatePresence(presence: Partial<Presence>) {
        if (!presence.userId || !presence.resourceId) return;
        const id = `${presence.userId}:${presence.resourceId}`;
        const path = this.getPath('presence', id);
        const ref = doc(db, path);
        
        try {
            const payload = removeUndefinedFields({
                ...presence,
                id,
                timestamp: Date.now(),
                serverId: this.activeServerId
            });
            await setDoc(ref, payload, { merge: true });
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, path);
        }
    }

    public async clearPresence(userId: string, resourceId?: string) {
        if (resourceId) {
            const id = `${userId}:${resourceId}`;
            await this.delete('presence', id);
        }
    }
}
