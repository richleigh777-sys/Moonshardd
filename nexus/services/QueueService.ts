/**
 * NEXT-LEVEL SOLUTION 6: Server-Authoritative Queue & Lock Engine
 * 
 * Flaw Addressed: Previous logic relied on agents randomly picking rows from CSV files 
 * downloaded to their browsers (AgentPortal.tsx). This caused massive race conditions, 
 * duplicate dials, and leaked memory on massive CSV files.
 * 
 * Solution: A strict server-side semaphore mechanism. The frontend only requests the 
 * next lead, and the backend guarantees an exclusive atomic lock via RPC.
 */
import { RPCClient } from '../rpc';
import { Customer } from '../../types';

export class QueueService {
    /**
     * Pops the absolute next best lead based on the server's algorithmic priority
     * (e.g., Callbacks > Hot Leads > Orphaned). Guarantees No Collisions.
     */
    static async acquireNextLead(): Promise<Customer | null> {
        return RPCClient.request<Customer>('/queue/pop', { method: 'POST' });
    }

    /**
     * Secures a temporary lock on a lead so others cannot view/dial it simultaneously.
     */
    static async secureLock(leadId: string): Promise<boolean> {
        try {
            const res = await RPCClient.request<{ locked: boolean }>(`/queue/lock/${leadId}`, { method: 'POST' });
            return res.locked;
        } catch (_e) {
            console.warn(`[QueueEngine] Failed to secure lock on ${leadId}`);
            return false;
        }
    }

    /**
     * Releases the lock when the agent navigates away or disposes the call.
     */
    static async releaseLock(leadId: string): Promise<void> {
        await RPCClient.request(`/queue/lock/${leadId}`, { method: 'DELETE' }).catch(console.error);
    }
}
