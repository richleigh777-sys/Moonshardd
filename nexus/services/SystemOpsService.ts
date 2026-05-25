import { db } from '../../lib/firebase';
import { doc, writeBatch, collection, getDocs, updateDoc, getDoc } from 'firebase/firestore';
import { User } from '../../types';
import { seedInfrastructure } from '../../lib/cloud/data/seeder';
import { BaseRepository, removeUndefinedFields } from '../repositories/BaseRepository';

export class SystemOpsService {
    constructor(private repository: BaseRepository) {}

    public async seed() {
        const { memoryStore } = seedInfrastructure();
        const batch = writeBatch(db);

        memoryStore.servers.forEach((s: any) => {
            batch.set(doc(db, 'servers', s.id), s);
        });

        memoryStore.users.forEach((u: any) => {
            batch.set(doc(db, `servers/${u.serverId}/users`, u.id), u);
        });

        memoryStore.systemConfig.forEach((cfg: any) => {
            batch.set(doc(db, `servers/${cfg.serverId}/systemConfig`, cfg.id || 'CORE_CONFIG'), cfg);
        });

        memoryStore.channels.forEach((c: any) => {
            batch.set(doc(db, `servers/${c.serverId}/channels`, c.id), c);
        });

        batch.commit().catch(e => console.warn("[Nexus] Seed commit error/offline:", e));
        console.log("[Nexus] Firestore Seed Fired (Async)");
    }

    public async simulateHighLoadTest() {
        console.warn("[Nexus] INITIATING STRESS TEST / HIGH LOAD SIMULATION...");
        
        const usersRef = collection(db, `servers/${this.repository.activeServerId}/users`);
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
                
                const salePath = this.repository.getPath('sales', saleId);
                batch.set(doc(db, salePath), removeUndefinedFields({
                    id: saleId,
                    serverId: this.repository.activeServerId,
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
                    timestamp: Date.now() - (Math.random() * 1000 * 60 * 60 * 24 * 7),
                    declineReason: status === 'Declined' ? 'Insufficient Funds' : undefined
                }));
                batchCount++;
                await commitBatchIfNeeded();

                const custPath = this.repository.getPath('customers', custId);
                batch.set(doc(db, custPath), removeUndefinedFields({
                    id: custId,
                    serverId: this.repository.activeServerId,
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

            for (let i = 0; i < 5; i++) await createSale('Approved', i);
            for (let i = 0; i < 3; i++) await createSale('Declined', i);
            for (let i = 0; i < 2; i++) await createSale('Pending', i);
        }

        if (batchCount > 0) {
            await batch.commit();
        }

        console.warn("[Nexus] STRESS TEST DATA INJECTED.");
        return true;
    }

    public async logScriptUsage(scriptId: string, outcome: 'win' | 'loss', amount: number) {
        const path = this.repository.getPath('scripts', scriptId);
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
        const path = this.repository.getPath('users', id);
        const snap = await getDoc(doc(db, path));
        return snap.exists() ? snap.data() : null;
    }
}
