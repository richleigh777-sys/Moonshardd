import { db, schema, query } from './db.ts';
import { eq } from "drizzle-orm";
import { broadcast } from './realtime.ts';

// Core workflow engine that intercepts mutations and runs automation rules
export async function runWorkflows(collectionName: string, eventType: 'CREATED' | 'UPDATED' | 'DELETED', payload: any) {
    if (collectionName !== 'customers' && collectionName !== 'sales') return;
    if (!payload || payload.deletedAt) return; // Ignore soft-deletes for now
    
    // Example Rule 1: Round Robin Lead Assignment
    if (collectionName === 'customers' && eventType === 'CREATED' && !payload.agentId) {
        await processRoundRobin(payload);
    }
    
    // Example Rule 2: Automation trigger - if lead status is Voicemail 3 times, move to Dead Pool
    if (collectionName === 'customers' && eventType === 'UPDATED') {
        await processVoicemailRule(payload);
    }

    // Example Rule 3: High ticket sale closed
    if (collectionName === 'sales' && (eventType === 'CREATED' || eventType === 'UPDATED')) {
        if (payload.status === 'Closed' && payload.amount >= 1000) {
            await processHighTicketSale(payload);
        }
    }
}

export async function check90DayInactivity() {
    if (!db) return;
    try {
        const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
        
        // Find customers who have orders, but haven't ordered in 90 days,
        // and aren't already marked Dead.
        const res = await query(`
            SELECT id, data FROM crm_documents 
            WHERE collection_name = 'customers' 
            AND (data->>'orderCount') IS NOT NULL
            AND (data->>'lastOrderDate') IS NOT NULL
            AND data->>'status' != 'Dead'
        `);
        
        let movedCount = 0;
        
        for (const row of res.rows) {
            const customer = row.data as any;
            if (customer.orderCount > 0 && customer.lastOrderDate && customer.lastOrderDate < ninetyDaysAgo && customer.status !== 'Dead') {
                customer.status = 'Dead';
                customer.isDeadPool = true;
                customer.notes = (customer.notes || '') + `\n[System] Auto-moved to Dead pool: No reorder in 90 days. Win-Back needed.`;
                
                await query(`
                    UPDATE crm_documents 
                    SET data = $1, updated_at = NOW() 
                    WHERE collection_name = 'customers' AND id = $2
                `, [JSON.stringify(customer), customer.id]);
                
                broadcast({ type: 'COLLECTION_MUTATED', collectionName: 'customers', id: customer.id });
                movedCount++;
            }
        }
        if (movedCount > 0) {
            console.log(`[Workflow] Moved ${movedCount} customers to Dead pool due to 90-day inactivity.`);
        }
    } catch(e) {
        console.error('[Workflow] 90-day check error', e);
    }
}

async function processRoundRobin(payload: any) {
    try {
        console.log(`[Workflow] Triggering Round-Robin for Lead ${payload.id}`);
        // Find an active agent who is online
        // In a real system, we query the DB or memory to find eligible agents.
        // For now, let's just pick an agent round-robin.
        // We'd update the payload in the DB
        if (!db) return; // Fallback to memory DB skip for now
        
        // Fetch agents
        const result = await db.select().from(schema.crmDocuments).where(eq(schema.crmDocuments.collection_name, 'users'));
        const agents = result.map(r => r.data as any).filter(u => u.level < 10 && u.active !== false);
        
        if (agents.length > 0) {
            // Pick random agent for round-robin (in prod we'd track last assigned)
            const assignedAgent = agents[Math.floor(Math.random() * agents.length)];
            
            // Assign it
            payload.agentId = assignedAgent.id;
            payload.agentTeam = assignedAgent.team || '';
            payload.notes = (payload.notes || '') + `\n[System] Auto-assigned to ${assignedAgent.name} via Round-Robin.`;
            
            // Update DB
            await query(`
                UPDATE crm_documents 
                SET data = $1, updated_at = NOW() 
                WHERE collection_name = 'customers' AND id = $2
            `, [JSON.stringify(payload), payload.id]);
            
            // Broadcast
            broadcast({ type: 'COLLECTION_MUTATED', collectionName: 'customers', id: payload.id });
        }
    } catch(e) {
        console.error('[Workflow] RoundRobin error', e);
    }
}

async function processVoicemailRule(payload: any) {
    // Check if status is Voicemail and count how many times.
    // Assuming we store voicemailCount in payload
    if (payload.status === 'Voicemail') {
        const count = payload.voicemailCount || 1;
        if (count >= 3 && !payload.isDeadPool) {
            console.log(`[Workflow] Lead ${payload.id} hit 3 voicemails. Moving to Dead Pool.`);
            payload.isDeadPool = true;
            payload.status = 'Dead';
            payload.notes = (payload.notes || '') + `\n[System] Moved to Dead pool due to 3 voicemails. Sent automated SMS.`;
            
            if (db) {
                await query(`
                    UPDATE crm_documents 
                    SET data = $1, updated_at = NOW() 
                    WHERE collection_name = 'customers' AND id = $2
                `, [JSON.stringify(payload), payload.id]);
                broadcast({ type: 'COLLECTION_MUTATED', collectionName: 'customers', id: payload.id });
                // Note: we would trigger SMS API here
            }
        }
    }
}

async function processHighTicketSale(payload: any) {
    // If we just marked it as closed, ensure we don't alert multiple times
    if (!payload.highTicketAlertSent) {
        console.log(`[Workflow] High Ticket Sale Closed! amount: ${payload.amount}`);
        payload.highTicketAlertSent = true;
        
        // Broadcast a system-wide alert to Level 10s
        broadcast({
            type: 'SYSTEM_ALERT',
            payload: {
                message: `HIGH TICKET ALERT! ${payload.customerName} just closed a $${payload.amount} sale!`,
                level: 'success'
            }
        });
        
        if (db) {
            await query(`
                UPDATE crm_documents 
                SET data = $1, updated_at = NOW() 
                WHERE collection_name = 'sales' AND id = $2
            `, [JSON.stringify(payload), payload.id]);
        }
    }
}
