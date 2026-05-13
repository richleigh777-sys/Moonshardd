
import { useState, useMemo } from 'react';
import { User, Sale } from '../../../../types';

export type SortMode = 'revenue' | 'winRate' | 'status' | 'name' | 'tenure';
export type ViewMode = 'list' | 'grid';
export type RankFilter = 'All' | 'Visionary' | 'Catalyst' | 'Builder' | 'Emerging';

const getRank = (revenue: number) => {
    if (revenue >= 50000) return 'Visionary';
    if (revenue >= 25000) return 'Catalyst';
    if (revenue >= 10000) return 'Builder';
    return 'Emerging';
};

export const useRosterLogic = (users: User[], sales: Sale[]) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTeam, setFilterTeam] = useState('All');
    const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Inactive'>('All');
    const [filterRank, setFilterRank] = useState<RankFilter>('All');
    const [sortMode, setSortMode] = useState<SortMode>('revenue');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

    const [now] = useState(() => Date.now());

    const uniqueTeams = useMemo(() => Array.from(new Set(users.map(u => u.team || 'General'))), [users]);

    // --- PARTNER IMPACT ANALYTICS ---
    const agentAnalytics = useMemo(() => {
        const stats: Record<string, { revenue: number, dailyRevenue: number, count: number, winRate: number, trend: number[], rank: string }> = {};
        
        users.forEach(u => {
            const agentSales = sales.filter(s => s.agentId === u.id);
            const approved = agentSales.filter(s => s.status === 'Approved');
            const declined = agentSales.filter(s => s.status === 'Declined');
            
            const totalRev = approved.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
            const winRate = agentSales.length > 0 ? (approved.length / (approved.length + declined.length)) * 100 : 0;

            // Generate 7-point smooth trend data
            const trend = Array(7).fill(0);
            // const now = Date.now(); // Used from state
            approved.forEach(s => {
                const daysAgo = Math.floor((now - s.timestamp) / (1000 * 60 * 60 * 24));
                if (daysAgo < 7) {
                    trend[6 - daysAgo] += Number(s.amount);
                }
            });

            const todayStart = new Date().setHours(0,0,0,0);
            const dailyRev = approved
                .filter(s => s.timestamp >= todayStart)
                .reduce((acc, s) => acc + (Number(s.amount) || 0), 0);

            stats[u.id] = {
                revenue: totalRev,
                dailyRevenue: dailyRev,
                count: approved.length,
                winRate: Math.round(winRate),
                trend,
                rank: getRank(totalRev)
            };
        });
        return stats;
    }, [sales, users, now]);

    const globalMaxRevenue = useMemo(() => {
        const revs = (Object.values(agentAnalytics) as { revenue: number }[]).map(a => a.revenue);
        return Math.max(...revs, 1);
    }, [agentAnalytics]);

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const stats = agentAnalytics[u.id] || { rank: 'Emerging' };
            
            const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesTeam = filterTeam === 'All' || u.team === filterTeam;
            const matchesStatus = filterStatus === 'Active' ? u.active : filterStatus === 'Inactive' ? !u.active : true;
            const matchesRank = filterRank === 'All' || stats.rank === filterRank;

            return matchesSearch && matchesTeam && matchesStatus && matchesRank;
        }).sort((a, b) => {
            const statA = agentAnalytics[a.id] || { revenue: 0, winRate: 0 };
            const statB = agentAnalytics[b.id] || { revenue: 0, winRate: 0 };

            if (sortMode === 'revenue') return statB.revenue - statA.revenue;
            if (sortMode === 'winRate') return statB.winRate - statA.winRate;
            if (sortMode === 'name') return a.name.localeCompare(b.name);
            if (sortMode === 'status') {
                const statusWeight: Record<string, number> = { online: 3, break: 2, busy: 1, offline: 0 };
                return (statusWeight[b.currentStatus || 'offline'] || 0) - (statusWeight[a.currentStatus || 'offline'] || 0);
            }
            return 0;
        });
    }, [users, searchTerm, filterTeam, agentAnalytics, filterStatus, sortMode, filterRank]);

    return {
        searchTerm, setSearchTerm,
        filterTeam, setFilterTeam,
        filterStatus, setFilterStatus,
        filterRank, setFilterRank,
        sortMode, setSortMode,
        viewMode, setViewMode,
        uniqueTeams,
        agentAnalytics,
        globalMaxRevenue,
        filteredUsers
    };
};
