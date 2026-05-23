import { useState, useCallback } from 'react';
import { useCRM } from './useCRM';
import { Customer } from '../types';
import { sfx } from '../lib/soundService';
import { useSystem } from './useSystem';

export const useLeadRouter = (currentUserId: string) => {
    const { customers, updateCustomer, sales } = useCRM();
    const { setToast } = useSystem();
    const [isRouting, setIsRouting] = useState(false);

    const pullNextLead = useCallback(async (): Promise<Customer | null> => {
        if (!currentUserId) return null;
        setIsRouting(true);
        sfx.playHover();
        
        // Find unassigned and non-closed leads
        // 1. Get all customer IDs that have a closed Sale
        const closedCustomerIds = new Set(
            sales.filter(s => s.status === 'Approved').map(s => s.customerId).filter(Boolean)
        );

        // 2. Find customers not closed, and not currently locked by another active agent recently
        // Simple unassigned routing logic: Find a customer unassigned (firstSource = 'System Generated' or similar)
        // or just pick any customer that isn't assigned to anyone else
        const unassignedLeads = customers.filter(c => 
            !closedCustomerIds.has(c.id) &&
            (!c.agentId || c.agentId === currentUserId) // No agent, or already mine
        );

        // Simulated processing time for "routing"
        await new Promise(resolve => setTimeout(resolve, 800));

        if (unassignedLeads.length > 0) {
            // "Bulletproof" routing picks the lead with lowest touch-count or timestamp
            const nextLead = unassignedLeads.sort((a,b) => (a.updatedAt || 0) - (b.updatedAt || 0))[0];
            
            // Lock the lead
            await updateCustomer(nextLead.id, { agentId: currentUserId, updatedAt: Date.now() });
            
            sfx.playSuccess();
            setToast({ title: 'Target Acquired', message: `Lead Routed: ${nextLead.fullName}`, type: 'success' });
            setIsRouting(false);
            return nextLead;
        }

        sfx.playError();
        setToast({ title: 'Queue Empty', message: 'No available leads in routing queue.', type: 'info' });
        setIsRouting(false);
        return null;
    }, [currentUserId, customers, sales, updateCustomer, setToast]);

    return { pullNextLead, isRouting };
};
