
import { useMemo } from 'react';
import { Sale, SystemConfig, User, AttendanceRecord } from '../../../types';
import { calculateSalePayout, getDailyHours } from '../../../views/utils/crmLogic';

export interface PayoutDetails {
    net: number;
    commission: number;
    commissionableBasis: number;
    grossAmount: number;
    spiff: number;
    missedSpiff: number;
    shippingDeduction: number;
    rateUsed: number;
    qualifiedForSpiff: boolean;
    dailyHoursAtTimeOfSale: number;
}

export interface EnrichedSale {
    sale: Sale;
    payout: PayoutDetails;
}

export interface PayoutCycle {
    id: string;
    label: string;
    startDate: Date;
    endDate: Date;
    payDate: Date;
    status: 'Open' | 'Processing' | 'Paid';
    volume: number;
    commission: number;
    spiffs: number;
    deductions: number;
    netPayout: number;
    salesCount: number;
    sales: EnrichedSale[];
}

export const usePayoutHistory = (
    sales: Sale[], 
    attendance: AttendanceRecord[],
    config: SystemConfig, 
    user: User | null
) => {
    return useMemo(() => {
        if (!user) return [];

        const cycles: PayoutCycle[] = [];
        const now = new Date();
        
        // Generate last 6 months of cycles
        for (let i = 0; i < 6; i++) {
            const cursorDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const year = cursorDate.getFullYear();
            const month = cursorDate.getMonth();
            const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

            // CYCLE 1: 1st to Cutoff (Default 15th)
            const c1EndDay = config.cutoffDay1 || 15;
            const c1Start = new Date(year, month, 1);
            const c1End = new Date(year, month, c1EndDay, 23, 59, 59);
            const c1Pay = new Date(year, month, 20); // Pays on 20th

            // CYCLE 2: Cutoff+1 to End of Month
            const c2Start = new Date(year, month, c1EndDay + 1);
            const c2End = new Date(year, month, lastDayOfMonth, 23, 59, 59);
            const c2Pay = new Date(year, month + 1, 5); // Pays on 5th of next month

            [ { s: c1Start, e: c1End, p: c1Pay, l: 'Cycle 1' }, { s: c2Start, e: c2End, p: c2Pay, l: 'Cycle 2' } ].forEach(cycle => {
                // Filter Sales
                const cycleSales = sales.filter(s => 
                    s.agentId === user.id && 
                    s.status === 'Approved' && 
                    s.timestamp >= cycle.s.getTime() && 
                    s.timestamp <= cycle.e.getTime()
                );

                let vol = 0;
                let comm = 0;
                let spiff = 0;
                let ded = 0;

                const enrichedSales: EnrichedSale[] = cycleSales.map(sale => {
                    const hours = getDailyHours(user.id, sale.timestamp, attendance);
                    const payout = calculateSalePayout(sale, hours, config, user.commissionRate, user.shippingDeductionOverride);
                    
                    vol += Number(sale.amount);
                    comm += payout.commission;
                    spiff += payout.spiff;
                    ded += payout.shippingDeduction;

                    return { sale, payout };
                });

                // Determine Status
                let status: PayoutCycle['status'] = 'Open';
                if (now > cycle.p) status = 'Paid';
                else if (now > cycle.e) status = 'Processing';

                cycles.push({
                    id: `${year}-${month}-${cycle.l.replace(' ', '')}`,
                    label: `${cycle.l} (${cycle.s.toLocaleDateString(undefined, {month:'short'})})`,
                    startDate: cycle.s,
                    endDate: cycle.e,
                    payDate: cycle.p,
                    status,
                    volume: vol,
                    commission: comm,
                    spiffs: spiff,
                    deductions: ded,
                    netPayout: comm + spiff, // Deductions are typically pre-calculated in base, but if they are separate line items:
                    // Note: calculateSalePayout returns 'net' which is comm + spiff. 
                    // Deductions like shipping usually reduce the BASIS, not the final payout directly, 
                    // unless they are 'clawbacks'. The current logic in crmLogic puts deduction before commission calc.
                    // So netPayout here should probably just be the sum of individual nets.
                    salesCount: cycleSales.length,
                    sales: enrichedSales.sort((a, b) => b.sale.timestamp - a.sale.timestamp)
                });
            });
        }

        // Recalculate netPayout based on sum of enriched sales to be exact
        cycles.forEach(c => {
            c.netPayout = c.sales.reduce((acc, s) => acc + s.payout.net, 0);
        });

        // Sort by date descending (newest first)
        return cycles.sort((a, b) => b.endDate.getTime() - a.endDate.getTime());

    }, [sales, attendance, config, user]);
};
