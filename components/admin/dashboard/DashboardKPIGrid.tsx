import { Users, DollarSign, Activity, Zap } from 'lucide-react';
import { SummaryCard } from './SummaryCard';

interface DashboardKPIGridProps {
    totalRevenue: number;
    agentStats: { online: number, breakCount: number, total: number };
    callLogsCount: number;
    hasSales: boolean;
}

export const DashboardKPIGrid: React.FC<DashboardKPIGridProps> = ({ totalRevenue, agentStats, callLogsCount, hasSales }) => {
    const revenueGoal = 500000; // Simulated goal
    const revenueProgress = Math.min(100, (totalRevenue / revenueGoal) * 100);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 shrink-0">
            <SummaryCard 
                label="Total Revenue" 
                value={`$${totalRevenue.toLocaleString()}`} 
                sub={`Goal: $${(revenueGoal/1000).toFixed(0)}k`} 
                icon={DollarSign} 
                color="emerald" 
                trend={hasSales ? "+14.2%" : "Flat"} 
                progress={revenueProgress}
            />
            <SummaryCard 
                label="Active Agents" 
                value={`${agentStats.online + agentStats.breakCount}/${agentStats.total}`} 
                sub={`${agentStats.online} Online • ${agentStats.breakCount} Break`} 
                icon={Users} 
                color="indigo" 
                progress={(agentStats.online / Math.max(1, agentStats.total)) * 100}
            />
            <SummaryCard 
                label="Activity Log" 
                value={callLogsCount.toString()} 
                sub="Total Interactions" 
                icon={Activity} 
                color="blue" 
                progress={75}
                contentStyle={{ height: '150px' }}
            />
            <SummaryCard 
                label="Conversion Rate" 
                value={hasSales ? '4.2%' : '0.0%'} 
                sub="Resolution Ratio" 
                icon={Zap} 
                color="amber" 
                progress={42}
            />
        </div>
    );
};

