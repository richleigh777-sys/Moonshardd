
import React from 'react';
import { Sale } from '../../types';
import { 
    DollarSign, Zap, Target, Layers, BarChart3
} from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { KineticNumber } from '../ui/KineticNumber';
import { StatCard } from './analytics/StatCard';
import { TemporalHeatmap } from './analytics/TemporalHeatmap';
import { ProductMixChart } from './analytics/ProductMixChart';

interface AdminAnalyticsProps {
  sales: Sale[];
}

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ sales = [] }) => {
  const { timeRange, setTimeRange, metrics } = useAnalytics(sales);

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-700 w-full overflow-visible pb-4">
        
        {/* Header Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-surface-main/80 backdrop-blur-xl p-3 pr-4 rounded-[2.5rem] border border-border-subtle shadow-lg gap-4 shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent pointer-events-none"></div>
            
            <div className="flex items-center gap-4 px-4 py-2 relative z-10">
                <div className="p-3 bg-accent-secondary/10 rounded-xl text-accent-secondary border border-accent-secondary/20 shadow-neon">
                    <BarChart3 size={24} strokeWidth={2.5} />
                </div>
                <div>
                    <h3 className="text-lg font-[700]  tracking-tighter text-text-primary italic">Admin Intelligence</h3>
                    <p className="text-xs font-bold text-text-muted  tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Live Metrics • {timeRange} View
                    </p>
                </div>
            </div>

            <div className="flex bg-surface-alt p-1.5 rounded-xl border border-border-subtle relative z-10 shadow-inner">
                {(['Today', 'Week', 'Month', 'All'] as const).map(range => (
                    <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-[700]  tracking-widest transition-all ${
                            timeRange === range 
                            ? 'bg-surface-main text-text-primary shadow-md ring-1 ring-border-subtle' 
                            : 'text-text-muted hover:text-text-secondary hover:bg-surface-main/50'
                        }`}
                    >
                        {range}
                    </button>
                ))}
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard 
                title="Total Revenue" 
                value={<KineticNumber value={metrics.totalRevenue} prefix="$" />}
                sub="Gross Volume" 
                icon={DollarSign} 
                color="text-status-success" 
                trend="+12.5%"
                sparklineData={metrics.trends.revenue}
            />
            <StatCard 
                title="Active Deal Flow" 
                value={<KineticNumber value={metrics.dealCount} />} 
                sub={`${metrics.activeAgentCount} Agents Contributing`} 
                icon={Layers} 
                color="text-accent-secondary" 
                sparklineData={metrics.trends.volume}
            />
            <StatCard 
                title="Win Rate" 
                value={`${metrics.conversionRate.toFixed(1)}%`} 
                sub="Approval Efficiency" 
                icon={Zap} 
                color="text-status-warning" 
            />
            <StatCard 
                title="Average Order" 
                value={<KineticNumber value={metrics.dealCount > 0 ? Math.round(metrics.totalRevenue / metrics.dealCount) : 0} prefix="$" />}
                sub="Value Per Transaction" 
                icon={Target} 
                color="text-purple-500" 
            />
        </div>

        {/* Chart Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 auto-rows-fr">
            <TemporalHeatmap data={metrics.heatMap} />
            <ProductMixChart data={metrics.pieData} />
        </div>
    </div>
  );
};
