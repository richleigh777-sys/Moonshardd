import { getStorageItem } from "../../../../../lib/storage";
import { useState, useEffect, useMemo } from 'react';
import { useCRM } from '../../../../../hooks/useCRM';

export const usePayrollData = () => {
    const { currentUser } = useCRM();
    const [agents, setAgents] = useState<any[]>([]);
    const [payrollData, setPayrollData] = useState<any[]>([]);
    const [metrics, setMetrics] = useState<any>({
        pendingLiability: 0,
        lastPayout: 0,
        activeEarners: 0,
        topEarner: { name: 'None', amount: 0 },
        avgCostOfSale: 0
    });
    
    const [selectedAgentId, setSelectedAgentId] = useState<string>('All');
    const [adjustments, setAdjustments] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        const fetchPayroll = async () => {
            try {
                const res = await fetch('/api/financials/payroll', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Tenant-ID': getStorageItem('nexus_server_id') || currentUser?.serverId || 'srv-001',
                        'X-User-Level': String(currentUser?.level || 1),
                        'X-User-ID': String(currentUser?.id || 'unknown'),
                        'X-User-Team': currentUser?.team || 'Alpha'
                    },
                    body: JSON.stringify({ adjustments })
                });

                if (!res.ok) {
                    throw new Error(`Server returned status ${res.status}`);
                }

                const data = await res.json();
                if (data.success && isMounted) {
                    setAgents(data.agents || []);
                    setPayrollData(data.payrollData || []);
                    setMetrics(data.metrics);
                }
            } catch (err) {
                console.error('[CRM:usePayrollData] Failed to fetch server-computed payroll:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchPayroll();

        return () => {
            isMounted = false;
        };
    }, [adjustments, currentUser?.id, currentUser?.serverId, currentUser?.level, currentUser?.team]);

    // Filtering
    const filteredPayroll = useMemo(() => {
        if (selectedAgentId === 'All') return payrollData;
        return payrollData.map(cycle => ({
            ...cycle,
            agentPayouts: (cycle.agentPayouts || []).filter((p: any) => p.agent?.id === selectedAgentId),
            totalLiability: (cycle.agentPayouts || []).filter((p: any) => p.agent?.id === selectedAgentId).reduce((acc: number, p: any) => acc + p.netPayout, 0)
        })).filter(c => c.agentPayouts.length > 0);
    }, [payrollData, selectedAgentId]);

    const setAdjustment = (cycleId: string, agentId: string, amount: number) => {
        const key = `${cycleId}_${agentId}`;
        setAdjustments(prev => ({ ...prev, [key]: amount }));
    };

    return {
        agents,
        filteredPayroll,
        metrics,
        selectedAgentId,
        setSelectedAgentId,
        setAdjustment,
        loading
    };
};
