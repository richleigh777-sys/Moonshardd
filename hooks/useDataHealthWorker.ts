import { useEffect, useRef } from 'react';
import { useCRM } from './useCRM';
import { DataHealthReport, DataHealthAction, User } from '../types';
import { nexusGateway } from '../nexus/adapters/DataGateway';

export const useDataHealthWorker = (currentUser: User | null) => {
    const { sales, users, customers, dataHealthReports } = useCRM();
    const hasRun = useRef(false);

    useEffect(() => {
        if (!currentUser || currentUser.level < 10) return;
        
        // Only run once per session to avoid heavy loops, or if we need to run every X time, we'd set an interval.
        if (hasRun.current) return;
        hasRun.current = true;

        const runWorker = async () => {
            const now = Date.now();
            
            // Check if there's already a report generated this week
            const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
            const recentReport = dataHealthReports.find(r => r.timestamp > oneWeekAgo);
            
            if (recentReport) return; // Already generated this week

            console.log("[DataHealthWorker] Starting background scan...");
            
            const actions: DataHealthAction[] = [];

            // 1. Flag inactive users
            users.forEach(user => {
                if (user.active && (!user.lastActive || now - user.lastActive > oneWeekAgo)) {
                    actions.push({
                        id: `action_flag_${user.id}`,
                        type: 'flag_user',
                        targetId: user.id,
                        targetName: user.name,
                        metadata: { lastActive: user.lastActive }
                    });
                }
            });

            // 2. Merge exact duplicate contacts (customers with exact same email/phone + name)
            const seenMap = new Map<string, string>(); // 'email|phone' -> customerId
            customers.forEach(customer => {
                const key1 = customer.email ? customer.email.toLowerCase() : '';
                const key2 = customer.phone ? customer.phone : '';
                const key = `${key1}|${key2}`;
                
                if (!key || key === '|') return; // Skip empty
                
                if (seenMap.has(key)) {
                    actions.push({
                        id: `action_merge_${customer.id}_into_${seenMap.get(key)}`,
                        type: 'merge_contact',
                        targetId: customer.id, // the duplicate to be removed
                        targetName: customer.name,
                        metadata: { mergeIntoId: seenMap.get(key), reason: 'Exact Match' }
                    });
                } else {
                    seenMap.set(key, customer.id);
                }
            });

            // 3. Clean trailing stale data (e.g. leads not updated in a long time)
            
            if (actions.length > 0) {
                const newReport: DataHealthReport = {
                    id: `report_${now}`,
                    timestamp: now,
                    status: 'pending',
                    actions,
                    approvedActions: []
                };
                
                // Save report
                await nexusGateway.add('dataHealthReports', newReport);
                console.log("[DataHealthWorker] Generated Data Health Report");
            }
        };

        // Delay execution to not block UI thread immediately
        setTimeout(runWorker, 10000); 

    }, [currentUser, users, customers, sales, dataHealthReports]);
};
