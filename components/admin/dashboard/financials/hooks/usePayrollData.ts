
import { useState, useMemo } from 'react';
import { useCRM } from '../../../../../hooks/useCRM';
import { usePayoutHistory } from '../../../../widgets/payouts/usePayoutHistory';
import { getDailyHours, calculateSalePayout } from '../../../../../views/utils/crmLogic';

export const usePayrollData = () => {
    const { sales, attendance, systemConfig, users } = useCRM();
    const agents = useMemo(() => users.filter(u => u.role === 'agent'), [users]);
    
    const [selectedAgentId, setSelectedAgentId] = useState<string>('All');
    const [adjustments, setAdjustments] = useState<Record<string, number>>({});
    
    // Base Timeline Generation
    const baseTimeline = usePayoutHistory(sales, attendance, systemConfig, agents[0] || null);

    // Core Calculation Logic
    const payrollData = useMemo(() => {
        return baseTimeline.map(cycle => {
            const agentPayouts = agents.map(agent => {
                const adjKey = `${cycle.id}_${agent.id}`;
                const manualAdj = adjustments[adjKey] || 0;

                const agentSales = sales.filter(s => 
                    s.agentId === agent.id && 
                    s.status === 'Approved' && 
                    s.timestamp >= cycle.startDate.getTime() && 
                    s.timestamp <= cycle.endDate.getTime()
                );

                const enrichedSales = agentSales.map(s => {
                    const hours = getDailyHours(agent.id, s.timestamp, attendance);
                    const payout = calculateSalePayout(s, hours, systemConfig, agent.commissionRate);
                    return { sale: s, payout };
                });

                const totalVol = enrichedSales.reduce((acc, s) => acc + Number(s.sale.amount), 0);
                const comm = enrichedSales.reduce((acc, s) => acc + s.payout.commission, 0);
                const spiff = enrichedSales.reduce((acc, s) => acc + s.payout.spiff, 0);
                const deduction = enrichedSales.reduce((acc, s) => acc + s.payout.shippingDeduction, 0);
                
                const net = comm + spiff - deduction + manualAdj;

                return {
                    agent,
                    volume: totalVol,
                    commission: comm,
                    spiff,
                    deduction,
                    manualAdj,
                    salesCount: agentSales.length,
                    netPayout: net,
                    enrichedSales
                };
            }).filter(p => p.volume > 0 || p.manualAdj !== 0).sort((a, b) => b.netPayout - a.netPayout);

            const totalLiability = agentPayouts.reduce((acc, p) => acc + p.netPayout, 0);
            const totalRevenue = agentPayouts.reduce((acc, p) => acc + p.volume, 0);

            return {
                ...cycle,
                agentPayouts,
                totalLiability,
                totalRevenue,
                costOfSale: totalRevenue > 0 ? (totalLiability / totalRevenue) * 100 : 0
            };
        });
    }, [baseTimeline, agents, sales, systemConfig, adjustments, attendance]);

    // Filtering
    const filteredPayroll = useMemo(() => {
        if (selectedAgentId === 'All') return payrollData;
        return payrollData.map(cycle => ({
            ...cycle,
            agentPayouts: cycle.agentPayouts.filter(p => p.agent.id === selectedAgentId),
            totalLiability: cycle.agentPayouts.filter(p => p.agent.id === selectedAgentId).reduce((acc, p) => acc + p.netPayout, 0)
        })).filter(c => c.agentPayouts.length > 0);
    }, [payrollData, selectedAgentId]);

    // Metrics HUD
    const metrics = useMemo(() => {
        const openCycles = payrollData.filter(c => c.status === 'Open' || c.status === 'Processing');
        const paidCycles = payrollData.filter(c => c.status === 'Paid');
        
        const pendingLiability = openCycles.reduce((acc, c) => acc + c.totalLiability, 0);
        const lastPayout = paidCycles.length > 0 ? paidCycles[0].totalLiability : 0;
        const currentCycle = openCycles[0];
        const activeEarners = currentCycle ? currentCycle.agentPayouts.length : 0;
        const avgCostOfSale = payrollData.length > 0 ? payrollData.reduce((acc, c) => acc + c.costOfSale, 0) / payrollData.length : 0;
        
        let topEarner = { name: 'None', amount: 0 };
        if (currentCycle && currentCycle.agentPayouts.length > 0) {
            const top = currentCycle.agentPayouts[0]; 
            topEarner = { name: top.agent.name, amount: top.netPayout };
        }

        return { pendingLiability, lastPayout, activeEarners, topEarner, avgCostOfSale };
    }, [payrollData]);

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
        setAdjustment
    };
};
