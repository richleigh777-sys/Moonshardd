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

    public async injectSampleLeads() {
        console.warn("[Nexus] INJECTING SAMPLE LEADS...");
        
        // Find an active agent to assign these leads to, or fallback to any agent
        const usersRef = collection(db, `servers/${this.repository.activeServerId}/users`);
        const usersSnap = await getDocs(usersRef);
        const agents = usersSnap.docs.map(d => d.data() as User).filter(u => u.role === 'agent');
        const defaultAgent = agents[0] || { id: 'sys', name: 'System' };
        
        let batch = writeBatch(db);
        let batchCount = 0;

        const commitBatchIfNeeded = async () => {
            if (batchCount > 400) {
                await batch.commit();
                batch = writeBatch(db);
                batchCount = 0;
            }
        };

        const products = ['Alpha Formula', 'Sigma Protocol', 'Nexus Core', 'Prime Wellness'];
        const bankNames = ['JPMorgan Chase', 'Bank of America', 'Wells Fargo', 'Citigroup'];
        const medicalConds = ['Hypertension', 'Diabetes', 'Arthritis', 'Asthma', 'None'];

        // Generate exactly 20 highly detailed leads
        for (let i = 0; i < 20; i++) {
            const uniqueStr = Math.random().toString(36).substr(2, 9);
            const statusStr = Math.random() > 0.8 ? 'Pending' : 'Cold Lead';
            const saleId = `sample-lead-${statusStr.toLowerCase().replace(' ', '-')}-${i}-${uniqueStr}`;
            const custId = `sample-cust-${i}-${uniqueStr}`;
            const customerName = `Lead ${i + 1} (Uploaded)`;
            const phone = `+1555${Math.floor(1000000 + Math.random() * 9000000)}`;
            const email = `lead${i+1}_${uniqueStr}@example.com`;
            const product = products[Math.floor(Math.random() * products.length)];
            const bankName = bankNames[Math.floor(Math.random() * bankNames.length)];
            const condition = medicalConds[Math.floor(Math.random() * medicalConds.length)];

            // Sale (Lead) record
            const salePath = this.repository.getPath('sales', saleId);
            batch.set(doc(db, salePath), removeUndefinedFields({
                id: saleId,
                serverId: this.repository.activeServerId,
                agentId: defaultAgent.id,
                agent: defaultAgent.name,
                customer: customerName,
                customerId: custId,
                phone: phone,
                email: email,
                address: `${Math.floor(Math.random() * 9999)} Sample Blvd, ${['NY','CA','TX','FL','IL'][Math.floor(Math.random() * 5)]} ${Math.floor(10000 + Math.random() * 89999)}`,
                billingAddress: `Same as shipping`,
                product: product,
                quantity: ['1 Month', '3 Months', '6 Months'][Math.floor(Math.random() * 3)],
                dosage: 'Standard',
                amount: Math.floor(200 + Math.random() * 800),
                status: statusStr,
                timestamp: Date.now() - (Math.random() * 1000 * 60 * 60 * 24 * 2), // Uploaded in last 2 days
                bankName: bankName,
                cardProvider: ['Visa', 'Mastercard', 'Amex'][Math.floor(Math.random() * 3)],
                medicalConditions: condition !== 'None' ? [condition] : [],
                metadata: { uploadedByTeam: true },
                leadSource: 'Team Upload',
                goals: 'General Wellness',
                communicationPreferences: 'Email/Phone'
            }));
            batchCount++;
            await commitBatchIfNeeded();

            // Customer Profile Record
            const custPath = this.repository.getPath('customers', custId);
            batch.set(doc(db, custPath), removeUndefinedFields({
                id: custId,
                serverId: this.repository.activeServerId,
                firstName: 'Lead',
                lastName: `Sample ${i + 1}`,
                fullName: customerName,
                name: customerName,
                email: email,
                phone: phone,
                address: 'Sample Address',
                normalizedPhone: phone,
                normalizedEmail: email,
                addressFingerprint: 'Sample Address',
                ltv: 0,
                orderCount: 0,
                lastOrderDate: Date.now(),
                firstSource: 'Team Upload',
                tags: ['Uploaded Lead'],
                salesHistory: [],
                phones: [phone],
                emails: [email],
                updatedAt: Date.now(),
                leadSource: 'Team Upload'
            }));
            batchCount++;
            await commitBatchIfNeeded();
        }

        if (batchCount > 0) {
            await batch.commit();
        }

        console.warn("[Nexus] INJECTED 20 DETAILED SAMPLE LEADS.");
        return true;
    }

    public async injectClosedSales() {
        console.warn("[Nexus] INJECTING 10 TEAM AGENTS AND CLOSED SALES...");
        
        let batch = writeBatch(db);
        let batchCount = 0;

        const commitBatchIfNeeded = async () => {
            if (batchCount > 400) {
                await batch.commit();
                batch = writeBatch(db);
                batchCount = 0;
            }
        };

        const products = ['Alpha Formula', 'Sigma Protocol', 'Nexus Core', 'Prime Wellness'];
        const teamName = 'Delta Force';

        for (let i = 0; i < 10; i++) {
            const agentId = `agent-delta-${i+1}`;
            const agentName = `Delta Operative ${i+1}`;
            
            // Create the agent user
            const userPath = this.repository.getPath('users', agentId);
            batch.set(doc(db, userPath), removeUndefinedFields({
                id: agentId,
                serverId: this.repository.activeServerId,
                name: agentName,
                role: 'agent',
                status: 'active',
                currentStatus: 'offline',
                accessLevel: 1,
                team: teamName,
                commissionRate: 15,
                createdAt: Date.now() - 86400000,
                updatedAt: Date.now()
            }));
            batchCount++;
            await commitBatchIfNeeded();

            // Create their ONE closed sale
            const uniqueStr = Math.random().toString(36).substr(2, 9);
            const saleId = `closed-sale-${agentId}-${uniqueStr}`;
            const custId = `closed-cust-${agentId}-${uniqueStr}`;
            const customerName = `Client ${i + 1} (Alpha)`;
            
            const salePath = this.repository.getPath('sales', saleId);
            batch.set(doc(db, salePath), removeUndefinedFields({
                id: saleId,
                serverId: this.repository.activeServerId,
                agentId: agentId,
                agent: agentName,
                team: teamName,
                customer: customerName,
                customerId: custId,
                phone: `+1555000${Math.floor(1000 + Math.random() * 8999)}`,
                email: `demo${i+1}@delta.test`,
                address: `123 Delta Way`,
                billingAddress: `Same as shipping`,
                product: products[Math.floor(Math.random() * products.length)],
                quantity: '3 Months',
                dosage: 'Standard',
                amount: Math.floor(500 + Math.random() * 500),
                status: 'Approved',
                timestamp: Date.now() - Math.floor(Math.random() * 10000000), // Randomly closed recently
                updatedAt: Date.now(),
                leadSource: 'Inbound Call',
                goals: 'Optimization'
            }));
            batchCount++;
            await commitBatchIfNeeded();

            const custPath = this.repository.getPath('customers', custId);
            batch.set(doc(db, custPath), removeUndefinedFields({
                id: custId,
                serverId: this.repository.activeServerId,
                firstName: `Client ${i + 1}`,
                lastName: `(Alpha)`,
                address: `123 Delta Way`,
                city: 'Delta City',
                state: 'DC',
                zip: '00000',
                country: 'US',
                salesHistory: [],
                phones: [`+1555000${Math.floor(1000 + Math.random() * 8999)}`],
                emails: [`demo${i+1}@delta.test`],
                updatedAt: Date.now(),
                leadSource: 'Inbound Call'
            }));
            batchCount++;
            await commitBatchIfNeeded();
        }

        if (batchCount > 0) {
            await batch.commit();
        }

        console.warn("[Nexus] INJECTED 10 AGENTS & CLOSED SALES.");
        return true;
    }

    public async sweepStalledLeads() {
        console.warn("[Nexus] SWEEPING STALLED LEADS...");
        const salesRef = collection(db, `servers/${this.repository.activeServerId}/sales`);
        const salesSnap = await getDocs(salesRef);
        
        let batch = writeBatch(db);
        let batchCount = 0;
        let sweptCount = 0;
        const now = Date.now();
        const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

        const commitBatchIfNeeded = async () => {
            if (batchCount > 400) {
                await batch.commit();
                batch = writeBatch(db);
                batchCount = 0;
            }
        };

        salesSnap.forEach(docSnap => {
            const sale = docSnap.data();
            const isLeaked = sale.status === 'Declined' || sale.pipelineStatus === 'Closed Lost' || sale.status === 'Cancelled';
            const lastUpdate = sale.updatedAt || sale.timestamp || now;
            const isStalled = !isLeaked && (now - lastUpdate > SEVEN_DAYS) && sale.status !== 'Approved' && sale.pipelineStatus !== 'Closed Won';
            
            // Exclude already penalized items
            if (isStalled && sale.pipelineStatus !== 'SLA Breach (Stalled)') {
                batch.update(docSnap.ref, {
                    pipelineStatus: 'SLA Breach (Stalled)',
                    updatedAt: Date.now(),
                    systemNotes: 'Automatically flagged via SLA Enforcer due to 7+ days of inactivity.'
                });
                batchCount++;
                sweptCount++;
            }
        });

        if (batchCount > 0) {
            await batch.commit();
        }

        console.warn(`[Nexus] SWEPT ${sweptCount} STALLED LEADS.`);
        return sweptCount;
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
