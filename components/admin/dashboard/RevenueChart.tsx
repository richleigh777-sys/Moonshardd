
import { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, Database } from 'lucide-react';
import { Card } from '../../ui/Base';
import { ChartFrame } from '../../ui/ChartFrame';
import { Sale } from '../../../types';

interface RevenueChartProps {
    data: Sale[];
    hasSales: boolean;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, hasSales }) => {
    
    const chartData = useMemo(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dailyData = days.map(day => ({ name: day, revenue: 0, calls: 0 }));

        if (hasSales && data) {
            data.forEach(sale => {
                const dayIndex = new Date(sale.timestamp).getDay();
                dailyData[dayIndex].revenue += sale.amount;
                dailyData[dayIndex].calls += 1;
            });
        }

        return dailyData;
    }, [data, hasSales]);

    return (
        <Card variant="panel" className="p-0 flex flex-col relative overflow-hidden h-full">
            <div className="flex items-center justify-between p-2.5 border-b border-border-subtle bg-surface-alt/20 backdrop-blur-sm relative z-10">
                <h3 className="text-xs font-bold text-text-primary flex items-center gap-2">
                    <TrendingUp size={14} className="text-accent-primary"/> Revenue Trend
                </h3>
                <div className="px-1.5 py-0.5 bg-surface-main rounded text-[10px] font-medium text-text-muted border border-border-subtle flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Live
                </div>
            </div>
            
            <div className="flex-1 w-full min-h-0 relative z-10 p-2.5">
                <ChartFrame minHeight={160} children={() => (
                    hasSales ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-accent-primary)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--color-accent-primary)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} opacity={0.3} />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="var(--color-text-muted)" 
                                    fontSize={9} 
                                    fontWeight={600} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tickMargin={10}
                                />
                                <YAxis 
                                    stroke="var(--color-text-muted)" 
                                    fontSize={9} 
                                    fontWeight={600} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tickFormatter={(value) => `$${value}`} 
                                    width={40}
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'var(--color-surface-main)', borderColor: 'var(--color-border-subtle)', borderRadius: '12px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ color: 'var(--color-text-primary)', fontSize: '11px', fontWeight: 'bold' }}
                                    cursor={{ stroke: 'var(--color-accent-primary)', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="var(--color-accent-primary)" 
                                    strokeWidth={2}
                                    fillOpacity={1} 
                                    fill="url(#colorRev)" 
                                    isAnimationActive={true}
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-text-muted opacity-30">
                            <Database size={32} className="mb-2" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Initial Transaction Data</p>
                        </div>
                    )
                )} />
            </div>
        </Card>
    );
};
