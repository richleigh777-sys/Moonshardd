
import { useMemo } from 'react';
import { Sale, User, SystemConfig } from '../../../types';
import { calculateWinRate, getCycleBoundaries, calculateSalePayout } from '../../../views/utils/crmLogic';

export const useAgentStats = (sales: Sale[], user: User | null, config: SystemConfig) => {
    return useMemo(() => {
        if (!user) return null;

        const mySales = sales.filter(s => s.agentId === user.id);
        const approved = mySales.filter(s => s.status === 'Approved');
        const declined = mySales.filter(s => s.status === 'Declined');
        const pending = mySales.filter(s => s.status === 'Pending');

        const boundaries = getCycleBoundaries(config);

        // Financial Calculation
        let totalCommission = 0;
        let totalSpiffs = 0;
        let totalRevenue = 0;

        // Calculate Earnings
        approved.forEach(sale => {
            totalRevenue += Number(sale.amount);
            // Defaulting to 8 hours for estimation if precise daily hours aren't passed
            const payout = calculateSalePayout(sale, 8, config, user.commissionRate);
            totalCommission += payout.commission;
            totalSpiffs += payout.spiff;
        });

        // Daily Logic
        const todayStart = new Date().setHours(0,0,0,0);
        const dailySales = approved.filter(s => s.timestamp >= todayStart);
        const dailyRev = dailySales.reduce((acc, s) => acc + Number(s.amount), 0);

        // Cycle Logic
        const c1Sales = approved.filter(s => s.timestamp >= boundaries.cycle1Start && s.timestamp <= boundaries.cycle1End);
        const c1Revenue = c1Sales.reduce((acc, s) => acc + Number(s.amount), 0);

        const c2Sales = approved.filter(s => s.timestamp >= boundaries.cycle2Start && s.timestamp <= boundaries.cycle2End);
        const c2Revenue = c2Sales.reduce((acc, s) => acc + Number(s.amount), 0);

        const winRate = calculateWinRate(approved.length, declined.length);

        // Pending Projection
        const estPendingComm = pending.reduce((acc, s) => {
            const amt = Number(s.amount);
            const rate = (user.commissionRate || 15) / 100;
            // Weighted by winrate probability
            return acc + (amt * rate * (winRate / 100));
        }, 0);

        return {
            mySales,
            totalRevenue,
            dailyRev,
            dailyCount: dailySales.length,
            c1Revenue,
            c1Count: c1Sales.length,
            c2Revenue,
            c2Count: c2Sales.length,
            totalCommission,
            totalSpiffs,
            estCommission: totalCommission + totalSpiffs,
            estPendingComm,
            winRate,
            approvedCount: approved.length
        };
    }, [sales, user, config]);
};
