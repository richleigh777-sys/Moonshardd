// NEXUS Data Gateway (v2): Real-time Firebase Firestore implementation.
import { 
    collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, 
    getDocs, getDoc, writeBatch, getDocFromServer
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firebaseUtils';
import { User, Server, Presence } from '../../types';
import { sendToGoogleSheet, testGoogleSheetConnection, validateConfig } from '../../lib/cloud/integrations';
import { seedInfrastructure } from '../../lib/cloud/data/seeder';

export { sendToGoogleSheet, testGoogleSheetConnection, validateConfig };

export class ConflictError extends Error {
    constructor(public currentData: any, public conflicts?: string[]) {
        super('Conflict detected: The record has been modified by another user.');
        this.name = 'ConflictError';
    }
}

const removeUndefinedFields = (obj: any): any => {
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

export class NexusDataGateway {
    public activeServerId: string = localStorage.getItem('nexus_server_id') || 'srv-001';
    private listeners: Record<string, () => void> = {};
    private cache: Record<string, any[]> = {};

    constructor() {
        console.log("[Nexus] Data Gateway Active (Firebase Engine)");
    }

    public setActiveServer(id: string) {
        this.activeServerId = id;
        localStorage.setItem('nexus_server_id', id);
        // Dispatch global event for hooks to re-sync
        window.dispatchEvent(new CustomEvent('nexus_server_changed', { detail: id }));
    }

    private getPath(collectionName: string, id?: string) {
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
            // Level 10 can see all servers. Level 5/1 can only see theirs.
            if (_user?.level < 10) {
                const docRef = doc(db, 'servers', this.activeServerId);
                const unsub = onSnapshot(docRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = [{ ...(docSnap.data() as object), id: docSnap.id }];
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
            q = collection(db, 'servers', this.activeServerId, collectionName);
        }

        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(d => ({ ...(d.data() as object), id: d.id }));
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

    public async get(collectionName: string) {
        let q;
        if (collectionName === 'servers') {
            q = collection(db, 'servers');
        } else {
            q = collection(db, 'servers', this.activeServerId, collectionName);
        }
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ ...(d.data() as object), id: d.id }));
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

    public async update(collectionName: string, id: string, updates: any, _expectedUpdatedAt?: number, _originalData?: any) {
        const path = this.getPath(collectionName, id);
        const ref = doc(db, path);
        
        try {
            const finalUpdates = removeUndefinedFields({
                ...(updates as object),
                updatedAt: Date.now()
            });
            await updateDoc(ref, finalUpdates);
            return { id, ...(updates as any) };
        } catch (error) {
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
        } else {
            // This is harder in Firestore without listing first, but we can just use the user ID as key if we want.
            // For now, let's just clear for the specific resource if provided.
        }
    }

    // Auth specific (Bridge to existing auth logic but with potential Firebase Auth upgrade later)
    public async verifySession(userId: string, _role: string, _level: number, sig: string): Promise<User | null> {
        try {
            if (!sig) return null;
            const decoded = atob(sig);
            const [id, serverId, timestamp] = decoded.split(':');
            
            if (id !== userId) return null;

            // Session TTL check (12 hours)
            const sessionAge = Date.now() - parseInt(timestamp);
            if (sessionAge > (12 * 60 * 60 * 1000)) {
                console.warn("[Nexus] Session expired");
                return null;
            }

            // Sync server context if needed
            const effectiveServerId = serverId === 'sys_root' ? this.activeServerId : serverId;
            if (effectiveServerId && effectiveServerId !== this.activeServerId) {
                this.setActiveServer(effectiveServerId);
            }

            const path = this.getPath('users', userId);
            const snap = await getDoc(doc(db, path));
            return snap.exists() ? (snap.data() as User) : null;
        } catch (err) {
            console.error("[Nexus] Session verification logic error:", err);
            return null;
        }
    }

    public async seed() {
        const { memoryStore } = seedInfrastructure();
        const batch = writeBatch(db);

        // Seed Servers
        memoryStore.servers.forEach((s: any) => {
            batch.set(doc(db, 'servers', s.id), s);
        });

        // Seed Users (scoped by server)
        memoryStore.users.forEach((u: any) => {
            batch.set(doc(db, `servers/${u.serverId}/users`, u.id), u);
        });

        // Seed System Configs
        memoryStore.systemConfig.forEach((cfg: any) => {
            batch.set(doc(db, `servers/${cfg.serverId}/systemConfig`, cfg.id || 'CORE_CONFIG'), cfg);
        });

        // Seed Channels
        memoryStore.channels.forEach((c: any) => {
            batch.set(doc(db, `servers/${c.serverId}/channels`, c.id), c);
        });

        await batch.commit();
        console.log("[Nexus] Firestore Seed Complete");
    }

    public async simulateHighLoadTest() {
        console.warn("[Nexus] INITIATING STRESS TEST / HIGH LOAD SIMULATION...");
        
        // Fetch all active agents
        const usersRef = collection(db, `servers/${this.activeServerId}/users`);
        const usersSnap = await getDocs(usersRef);
        const agents = usersSnap.docs.map(d => d.data() as User).filter(u => u.role === 'agent' && u.active);
        
        let batch = writeBatch(db);
        let batchCount = 0;

        const commitBatchIfNeeded = async () => {
            if (batchCount > 400) {
                await batch.commit();
                batch = writeBatch(db);
                batchCount = 0;
            }
        };

        for (const agent of agents) {
            const createSale = async (status: 'Approved' | 'Declined' | 'Pending', i: number) => {
                const uniqueStr = Math.random().toString(36).substr(2, 9);
                const saleId = `ext-sale-${agent.id}-${status}-${i}-${uniqueStr}`;
                const custId = `ext-cust-${agent.id}-${status}-${i}-${uniqueStr}`;
                
                const customerName = `Mock Client ${status} ${i} (${agent.name})`;
                const phone = `+1555${Math.floor(1000000 + Math.random() * 9000000)}`;
                
                // Add Sale
                const salePath = this.getPath('sales', saleId);
                batch.set(doc(db, salePath), removeUndefinedFields({
                    id: saleId,
                    serverId: this.activeServerId,
                    agentId: agent.id,
                    agent: agent.name,
                    customer: customerName,
                    customerId: custId,
                    phone: phone,
                    address: '123 Test Ave, TX 75001',
                    product: 'Test Product X',
                    quantity: '1',
                    dosage: 'Standard',
                    amount: 500 + Math.round(Math.random() * 2000),
                    status,
                    timestamp: Date.now() - (Math.random() * 1000 * 60 * 60 * 24 * 7), // within last 7 days
                    declineReason: status === 'Declined' ? 'Insufficient Funds' : undefined
                }));
                batchCount++;
                await commitBatchIfNeeded();

                // Add Customer
                const custPath = this.getPath('customers', custId);
                batch.set(doc(db, custPath), removeUndefinedFields({
                    id: custId,
                    serverId: this.activeServerId,
                    firstName: 'Mock',
                    lastName: `Client ${i}`,
                    fullName: customerName,
                    name: customerName,
                    email: `mock${i}@test.com`,
                    phone: phone,
                    address: '123 Test Ave',
                    normalizedPhone: phone,
                    normalizedEmail: `mock${i}@test.com`,
                    addressFingerprint: '123 Test Ave',
                    ltv: status === 'Approved' ? 500 : 0,
                    orderCount: status === 'Approved' ? 1 : 0,
                    lastOrderDate: Date.now(),
                    firstSource: 'System Generated',
                    tags: ['Test'],
                    salesHistory: [],
                    phones: [phone],
                    emails: [`mock${i}@test.com`],
                    updatedAt: Date.now()
                }));
                batchCount++;
                await commitBatchIfNeeded();
            };

            // 5 Approved
            for (let i = 0; i < 5; i++) await createSale('Approved', i);
            // 3 Declined
            for (let i = 0; i < 3; i++) await createSale('Declined', i);
            // 2 Pending
            for (let i = 0; i < 2; i++) await createSale('Pending', i);
        }

        if (batchCount > 0) {
            await batch.commit();
        }

        console.warn("[Nexus] STRESS TEST DATA INJECTED.");
        return true;
    }

    public async authenticate(userId: string, userPass: string, companyId: string, _companyPass: string) {
        // For now, the existing logic uses this.memoryStore. 
        // We need to fetch the user from Firestore.
        const userPath = `servers/${companyId}/users/${userId}`;
        const userRef = doc(db, userPath);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const user = userSnap.data() as User;
            if (user.pass === userPass) {
                this.setActiveServer(companyId);
                const sig = btoa(`${user.id}:${companyId}:${Date.now()}`);
                return { user, sig };
            }
        }
        return { error: "Authentication failed." };
    }

    public async authenticateRoot(userId: string, userPass: string) {
        // Root users might be in srv-001 or any server as level 10
        const servers = ['srv-001', 'srv-002', 'srv-003']; 
        let rootFound = false;

        for (const sid of servers) {
            const ref = doc(db, `servers/${sid}/users`, userId);
            try {
                const snap = await getDocFromServer(ref);
                if (snap.exists()) {
                    rootFound = true;
                    const user = snap.data() as User;
                    if (user.pass === userPass && (user.level === 10 || user.role === 'admin')) {
                        this.setActiveServer(sid);
                        const sig = btoa(`${user.id}:${sid}:${Date.now()}`);
                        return { user, sig };
                    }
                }
            } catch (err: any) { 
                console.error(`[Nexus] Auth failed for ${sid}`, err);
                continue; 
            }
        }

        // If it's root/root and no root user was found at all, auto-seed and try one more time
        if (!rootFound && userId === 'sys_root' && userPass === 'root') {
            console.warn("[Nexus] Root user missing. Auto-triggering seed...");
            try {
                await this.seed();
                // Tail-call attempt after seeding
                return this.authenticateRoot(userId, userPass);
            } catch (seedErr) {
                console.error("[Nexus] Auto-seed failed", seedErr);
                return { error: "System initialization failed. Please contact support." };
            }
        }

        return { error: "Super Admin access denied. If this is a new installation, please wait for initialization." };
    }
    
    public async logScriptUsage(scriptId: string, outcome: 'win' | 'loss', amount: number) {
        const path = this.getPath('scripts', scriptId);
        const ref = doc(db, path);
        const snap = await getDoc(ref);
        if (snap.exists()) {
            const script = snap.data();
            await updateDoc(ref, {
                usageCount: (script.usageCount || 0) + 1,
                successCount: (script.successCount || 0) + (outcome === 'win' ? 1 : 0),
                revenueSaved: (script.revenueSaved || 0) + (outcome === 'win' ? amount : 0)
            });
        }
    }

    public async validateGhostTarget(id: string) {
        const path = this.getPath('users', id);
        const snap = await getDoc(doc(db, path));
        return snap.exists() ? snap.data() : null;
    }
}

export const nexusGateway = new NexusDataGateway();

export const sendMessage = async (message: any) => {
    await nexusGateway.add('messages', message);
};
