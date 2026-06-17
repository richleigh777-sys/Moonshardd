
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
        <Card variant="panel" className="p-0 flex flex-col relative overflow-hidden h-full rounded-xl group border border-border-subtle hover:border-border-subtle transition-all shadow-panel bg-surface-main/30 backdrop-blur-3xl">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent-primary/50 via-accent-secondary/50 to-transparent opacity-30 z-0"></div>
            <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-transparent relative z-10">
                <h3 className="text-sm font-[700] text-text-primary flex items-center gap-4  tracking-[0.2em]">
                    <div className="p-2 bg-gradient-to-br from-surface-highlight to-surface-main border border-border-subtle rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                        <TrendingUp size={16} className="text-accent-primary drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]"/>
                    </div>
                    Revenue Trend
                </h3>
                <div className="px-4 py-2 bg-surface-alt/50 rounded-xl text-sm font-[700]  tracking-widest text-text-primary border border-border-subtle flex items-center gap-3 backdrop-blur-md">
                    <span className="w-2 h-2 bg-status-success rounded-full shadow-[0_0_8px_var(--color-status-success)] animate-pulse"></span> LIQUIDITY SYNC
                </div>
            </div>
            
            <div className="flex-1 w-full min-h-[160px] relative z-10 p-4 pt-8">
                <ChartFrame minHeight={200} children={() => (
                    hasSales ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-accent-primary)" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="var(--color-accent-primary)" stopOpacity={0}/>
                                    </linearGradient>
                                    <filter id="glow">
                                        <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                                        <feMerge>
                                            <feMergeNode in="coloredBlur"/>
                                            <feMergeNode in="SourceGraphic"/>
                                        </feMerge>
                                    </filter>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} opacity={0.5} />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="var(--color-text-muted)" 
                                    fontSize={10} 
                                    fontFamily="var(--font-mono)"
                                    fontWeight={900} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tickMargin={15}
                                    style={{ textTransform: '' }}
                                />
                                <YAxis 
                                    stroke="var(--color-text-muted)" 
                                    fontSize={10} 
                                    fontFamily="var(--font-mono)"
                                    fontWeight={900} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tickFormatter={(value) => `$${value}`} 
                                    width={45}
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'var(--color-surface-alt)', borderColor: 'var(--color-border-strong)', borderRadius: '12px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.8)', padding: '12px' }}
                                    itemStyle={{ color: 'var(--color-accent-primary)', fontSize: '14px', fontWeight: '900', fontFamily: 'var(--font-mono)' }}
                                    labelStyle={{ color: 'var(--color-text-muted)', fontSize: '10px', textTransform: '', letterSpacing: '0.1em', marginBottom: '4px' }}
                                    cursor={{ stroke: 'var(--color-accent-primary)', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="var(--color-accent-primary)" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorRev)" 
                                    isAnimationActive={true}
                                    animationDuration={1500}
                                    style={{ filter: 'url(#glow)' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-text-muted opacity-30">
                            <Database size={32} className="mb-2" />
                            <p className="text-sm font-[700]  tracking-[0.2em]">Awaiting Transaction Data</p>
                        </div>
                    )
                )} />
            </div>
        </Card>
    );
};
