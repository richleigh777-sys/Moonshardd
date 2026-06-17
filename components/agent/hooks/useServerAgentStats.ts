/**
 * NEXT-LEVEL SOLUTION 8: Web Worker / SSR KPI Offloader
 * 
 * Flaw Addressed: DashView ran heavy array iterations (`useAgentStats`) over every sale 
 * and customer object in the CRM strictly on the UI thread for every React Mount.
 * 
 * Solution: Agent stats computation is offloaded. Instead of pulling massive datasets, 
 * we query a lightweight KPI endpoint that uses PostgreSQL SUM() & COUNT() aggregations natively.
 */
import { useEffect, useState } from 'react';
import { RPCClient } from '../../../nexus/rpc';

export interface KPIPayload {
    dailyRev: number;
    winRate: number;
    totalRevenue: number;
    estCommission: number;
    activeLeads: number;
    conversions: number;
}

export function useServerAgentStats(userId: string) {
    const [stats, setStats] = useState<KPIPayload | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        let isMounted = true;
        
        RPCClient.get<KPIPayload>(`/metrics/agent/${userId}/kpis`)
            .then(data => {
                if (isMounted) {
                    setStats(data);
                    setLoading(false);
                }
            })
            .catch(err => {
                console.error("Failed to fetch optimized KPIs", err);
                if (isMounted) {
                    // Fallback to static for development
                    setStats({
                        dailyRev: 0,
                        winRate: 0,
                        totalRevenue: 0,
                        estCommission: 0,
                        activeLeads: 0,
                        conversions: 0
                    });
                    setLoading(false);
                }
            });

        return () => { isMounted = false; };
    }, [userId]);

    return { stats, loading };
}
