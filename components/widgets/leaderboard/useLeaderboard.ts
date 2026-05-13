
import { useMemo } from 'react';
import { User, Sale, AttendanceRecord, SystemConfig } from '../../../types';
import { calculateSalePayout, getDailyHours, calculateWinRate } from '../../../views/utils/crmLogic';
import { getAgentAvatar } from '../../../constants';

export const useLeaderboard = (
    sales: Sale[],
    users: User[],
    attendance: AttendanceRecord[],
    systemConfig: SystemConfig,
    viewDate: Date,
    selectedTeam: string,
    searchQuery: string,
    hideInactive: boolean
) => {
    const selectedMonth = viewDate.getMonth();
    const selectedYear = viewDate.getFullYear();
    const monthName = viewDate.toLocaleString('default', { month: 'long' }).toUpperCase();

    const processedData = useMemo(() => {
        const startOfMonth = new Date(selectedYear, selectedMonth, 1).getTime();
        const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59).getTime();
        
        const cutoff1Day = systemConfig.cutoffDay1;
        const cutoff1End = new Date(selectedYear, selectedMonth, cutoff1Day, 23, 59, 59).getTime();
        const cutoff2Start = new Date(selectedYear, selectedMonth, cutoff1Day + 1).getTime();

        let agents = users.filter(u => u.role === 'agent');
        
        // 1. Filter Agents
        if (selectedTeam !== 'All') {
            agents = agents.filter(u => (u.team || 'Unassigned') === selectedTeam);
        }
        if (searchQuery) {
            const lowerQ = searchQuery.toLowerCase();
            agents = agents.filter(u => u.name.toLowerCase().includes(lowerQ));
        }

        // 2. Calculate Metrics per Agent
        let stats = agents.map(agent => {
            const agentSales = sales.filter(s => 
                s.agentId === agent.id && 
                s.timestamp >= startOfMonth && 
                s.timestamp <= endOfMonth
            );
            
            const approved = agentSales.filter(s => s.status === 'Approved');
            const declined = agentSales.filter(s => s.status === 'Declined');

            // Detailed Payout Calculation (Heavy Op)
            let totalEarnings = 0;
            const manifest = approved.map(sale => {
                const dailyHours = getDailyHours(agent.id, sale.timestamp, attendance);
                const payout = calculateSalePayout(sale, dailyHours, systemConfig, agent.commissionRate);
                totalEarnings += payout.net;
                return { ...sale, payout, hours: dailyHours };
            }).sort((a, b) => b.timestamp - a.timestamp);

            const totalRevenue = approved.reduce((acc, s) => acc + Number(s.amount), 0);
            const revenue1st = approved.filter(s => s.timestamp <= cutoff1End).reduce((acc, s) => acc + Number(s.amount), 0);
            const revenue2nd = approved.filter(s => s.timestamp >= cutoff2Start).reduce((acc, s) => acc + Number(s.amount), 0);
            const winRate = calculateWinRate(approved.length, declined.length);

            return {
                agentId: agent.id,
                agentName: agent.name,
                team: agent.team || 'Unassigned',
                avatar: getAgentAvatar(agent.id),
                totalRevenue,
                totalEarnings,
                revenue1st,
                revenue2nd,
                dealCount: approved.length,
                status: agent.currentStatus || 'offline',
                sales: agentSales,
                approvedSales: approved,
                manifest, // Enriched sales with payout info
                commissionRate: agent.commissionRate,
                winRate
            };
        });

        // 3. Filter Inactive
        if (hideInactive) {
            stats = stats.filter(s => s.totalRevenue > 0);
        }

        // 4. Sort and Rank
        return stats.sort((a, b) => b.totalRevenue - a.totalRevenue).map((s, i) => ({
            ...s, 
            rank: i + 1,
            isTopPerformer: i < 3 && s.totalRevenue > 0
        }));

    }, [sales, users, attendance, systemConfig, selectedMonth, selectedYear, selectedTeam, searchQuery, hideInactive]);

    const periodTotal = useMemo(() => processedData.reduce((acc, curr) => acc + curr.totalRevenue, 0), [processedData]);
    const uniqueTeams = useMemo(() => Array.from(new Set(users.filter(u => u.role === 'agent').map(u => u.team || 'Alpha'))), [users]);

    return {
        leaderData: processedData,
        periodTotal,
        uniqueTeams,
        monthName,
        selectedYear
    };
};
