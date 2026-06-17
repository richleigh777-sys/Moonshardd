
import { Clock, CheckCircle2, TrendingUp, Crown } from 'lucide-react';
import { KineticNumber } from '../../../../../components/ui/KineticNumber';

interface MetricCardProps {
    label: string;
    value: React.ReactNode;
    icon: any;
    color: string;
    trend?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon: Icon, color, trend }) => (
    <div className="bg-surface-main p-4 rounded-xl shadow-panel flex items-start justify-between group hover:shadow-md transition-all duration-300">
        <div>
            <p className="text-text-muted text-sm font-medium mb-1  tracking-wide">{label}</p>
            <div className="text-lg font-bold text-text-primary tracking-tight">
                {value}
            </div>
            {trend && <p className="text-sm text-text-muted mt-2">{trend}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color} bg-opacity-10 dark:bg-opacity-20`}>
            <Icon size={20} className={color.replace('bg-', 'text-')} />
        </div>
    </div>
);

interface PayrollMetricsProps {
    metrics: {
        pendingLiability: number;
        lastPayout: number;
        avgCostOfSale: number;
        topEarner: { name: string; amount: number };
    };
}

export const PayrollMetrics: React.FC<PayrollMetricsProps> = ({ metrics }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <MetricCard 
                label="Pending Liability" 
                value={<KineticNumber value={metrics.pendingLiability} prefix="$" />} 
                icon={Clock} 
                color="bg-blue-500" 
            />
            <MetricCard 
                label="Last Disbursement" 
                value={<KineticNumber value={metrics.lastPayout} prefix="$" />} 
                icon={CheckCircle2} 
                color="bg-emerald-500" 
                trend="Paid Successfully"
            />
            <MetricCard 
                label="Cost of Sale" 
                value={`${metrics.avgCostOfSale.toFixed(1)}%`} 
                icon={TrendingUp} 
                color="bg-indigo-500" 
                trend="Target < 25%"
            />
            <MetricCard 
                label="Top Earner" 
                value={metrics.topEarner.name} 
                icon={Crown} 
                color="bg-amber-500" 
                trend={`$${metrics.topEarner.amount.toLocaleString()}`}
            />
        </div>
    );
};
