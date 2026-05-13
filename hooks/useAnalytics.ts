
import { useMemo, useState } from 'react';
import { Sale } from '../types';

export type TimeRange = 'Today' | 'Week' | 'Month' | 'All';

export const useAnalytics = (sales: Sale[]) => {
    const [timeRange, setTimeRange] = useState<TimeRange>('Month');

    const filteredSales = useMemo(() => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        
        // Start of Week (Sunday)
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0,0,0,0);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

        return sales.filter(s => {
            if (timeRange === 'Today') return s.timestamp >= startOfDay;
            if (timeRange === 'Week') return s.timestamp >= startOfWeek.getTime();
            if (timeRange === 'Month') return s.timestamp >= startOfMonth;
            return true;
        });
    }, [sales, timeRange]);

    const metrics = useMemo(() => {
        const safeSales = filteredSales || [];
        const approved = safeSales.filter(s => s.status === 'Approved');
        const declined = safeSales.filter(s => s.status === 'Declined');
        
        const totalRevenue = approved.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
        
        // Calculate Conversion Rate
        const resolvedCount = approved.length + declined.length;
        const conversionRate = resolvedCount > 0 ? (approved.length / resolvedCount) * 100 : 0;
        
        // Product Mix Analysis
        const productCounts: Record<string, number> = {};
        approved.forEach(s => {
            const p = (s.product || 'Unknown').split('+')[0].trim(); // Primary product only
            productCounts[p] = (productCounts[p] || 0) + 1;
        });
        
        const pieData = Object.entries(productCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a,b) => b.value - a.value)
            .slice(0, 5); // Top 5

        // Heatmap Data (Day of Week vs Time of Day)
        // 7 Days x 4 Time Blocks (0-6, 6-12, 12-18, 18-24)
        const heatMap = Array(7).fill(0).map(() => Array(4).fill(0)); 
        
        approved.forEach(s => {
            const d = new Date(s.timestamp);
            const day = d.getDay(); // 0 (Sun) - 6 (Sat)
            const hour = d.getHours();
            
            let block = 0; // Night (0-6)
            if (hour >= 6 && hour < 12) block = 1; // Morning
            else if (hour >= 12 && hour < 18) block = 2; // Afternoon
            else if (hour >= 18) block = 3; // Evening
            
            heatMap[day][block] += Number(s.amount || 0);
        });

        const uniqueAgents = new Set(safeSales.map(s => s.agentId));

        // --- SPARKLINE GENERATOR ---
        // Splits the current dataset into 7 chunks to simulate a trend line
        const generateSparkline = (dataSrc: Sale[], valueExtractor: (s: Sale) => number) => {
            if (dataSrc.length < 7) return [0,0,0,0,0,0,0];
            const sorted = [...dataSrc].sort((a,b) => a.timestamp - b.timestamp);
            const chunkSize = Math.ceil(sorted.length / 7);
            const points = [];
            for (let i = 0; i < 7; i++) {
                const chunk = sorted.slice(i * chunkSize, (i + 1) * chunkSize);
                const val = chunk.reduce((acc, curr) => acc + valueExtractor(curr), 0);
                points.push(val);
            }
            return points;
        };

        const revenueTrend = generateSparkline(approved, (s) => Number(s.amount));
        const volumeTrend = generateSparkline(approved, () => 1);

        return { 
            totalRevenue, 
            conversionRate, 
            pieData,
            heatMap,
            dealCount: approved.length, 
            activeAgentCount: uniqueAgents.size,
            trends: {
                revenue: revenueTrend,
                volume: volumeTrend
            }
        };
    }, [filteredSales]);

    return {
        timeRange,
        setTimeRange,
        filteredSales,
        metrics
    };
};
