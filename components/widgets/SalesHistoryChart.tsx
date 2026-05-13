
import React, { useId, useState, useMemo } from 'react';
import { 
    AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, 
    ReferenceLine
} from 'recharts';
import { Card } from '../ui/Base';
import { Sale } from '../../types';
import { ChartFrame } from '../ui/ChartFrame';
import { TrendingUp, BarChart2, ArrowUpRight } from 'lucide-react';

export const SalesHistoryChart: React.FC<{ sales: Sale[] }> = ({ sales }) => {
    const gradientId = useId();
    const [viewMode, setViewMode] = useState<'daily' | 'cumulative'>('daily');
    
    const data = useMemo(() => {
        if (sales.length === 0) return [];

        const approved = sales.filter(s => s.status === 'Approved');
        if (approved.length === 0) return [];

        // 1. Sort sales by date to find range
        const sorted = [...approved].sort((a, b) => a.timestamp - b.timestamp);
        
        // 2. Determine date range (Start from first sale, end at Today)
        const firstDate = new Date(sorted[0].timestamp);
        firstDate.setHours(0,0,0,0);
        const lastDate = new Date(); 
        lastDate.setHours(0,0,0,0);

        // 3. Map actual sales to dates
        const map = new Map<string, { revenue: number, count: number }>();
        sorted.forEach(s => {
            const d = new Date(s.timestamp).toLocaleDateString();
            const curr = map.get(d) || { revenue: 0, count: 0 };
            map.set(d, { revenue: curr.revenue + Number(s.amount), count: curr.count + 1 });
        });

        // 4. Fill gaps linearly
        const result = [];
        let cumulative = 0;
        
        // Safety break: limit to 365 iterations to prevent infinite loops if dates are corrupt
        let safety = 0;
        for (let d = new Date(firstDate); d <= lastDate && safety < 365; d.setDate(d.getDate() + 1)) {
            safety++;
            const dateStr = d.toLocaleDateString();
            const dateLabel = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            const dayData = map.get(dateStr) || { revenue: 0, count: 0 };
            
            cumulative += dayData.revenue;
            
            result.push({
                date: dateLabel,
                fullDate: dateStr,
                timestamp: d.getTime(),
                revenue: dayData.revenue,
                count: dayData.count,
                cumulative: cumulative,
                aov: dayData.count > 0 ? dayData.revenue / dayData.count : 0
            });
        }
        
        return result; 
    }, [sales]);

    // Derived Metrics
    const peakDay = useMemo(() => [...data].sort((a, b) => b.revenue - a.revenue)[0], [data]);
    const averageDaily = data.length > 0 ? data.reduce((a, b) => a + b.revenue, 0) / data.length : 0;

    return (
        <Card variant="panel" className="h-full p-0 flex flex-col relative overflow-hidden group border-border-subtle bg-surface-main shadow-soft">
            {/* Header */}
            <div className="p-5 border-b border-border-subtle flex justify-between items-start bg-surface-alt/20 backdrop-blur-md relative z-10">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl border transition-colors ${viewMode === 'daily' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'}`}>
                        {viewMode === 'daily' ? <BarChart2 size={20} /> : <TrendingUp size={20} />}
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase text-text-primary tracking-widest flex items-center gap-2">
                            Revenue Manifest
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                {data.length} Day Horizon
                            </span>
                            {peakDay && peakDay.revenue > 0 && (
                                <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                                    <ArrowUpRight size={8} /> High: ${peakDay.revenue.toLocaleString()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex bg-surface-main p-1 rounded-xl border border-border-subtle shadow-sm">
                    <button 
                        onClick={() => setViewMode('daily')}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                            viewMode === 'daily' ? 'bg-surface-alt text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'
                        }`}
                    >
                        Daily
                    </button>
                    <button 
                        onClick={() => setViewMode('cumulative')}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                            viewMode === 'cumulative' ? 'bg-indigo-500 text-white shadow-md' : 'text-text-muted hover:text-text-primary'
                        }`}
                    >
                        Growth
                    </button>
                </div>
            </div>

            {/* Chart Area */}
            <div className="flex-1 w-full min-h-[180px] relative z-10 px-2 pt-4">
                <ChartFrame minHeight={180} children={() => (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id={`colorRev-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={viewMode === 'daily' ? '#10B981' : '#6366F1'} stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor={viewMode === 'daily' ? '#10B981' : '#6366F1'} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} opacity={0.4} />
                            <XAxis 
                                dataKey="date" 
                                fontSize={10} 
                                axisLine={false} 
                                tickLine={false} 
                                stroke="var(--color-text-muted)" 
                                fontWeight={700}
                                tickMargin={10}
                                minTickGap={30}
                            />
                            <YAxis 
                                hide={false}
                                fontSize={10}
                                axisLine={false}
                                tickLine={false}
                                stroke="var(--color-text-muted)" 
                                fontWeight={700}
                                tickFormatter={(val) => `$${val >= 1000 ? (val/1000).toFixed(1) + 'k' : val}`}
                                width={35}
                            />
                            <Tooltip 
                                cursor={{stroke: 'var(--color-text-muted)', strokeWidth: 1, strokeDasharray: '4 4'}}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const point = payload[0].payload;
                                        return (
                                            <div className="bg-surface-main/95 backdrop-blur-xl border border-border-subtle p-3 rounded-xl shadow-2xl min-w-[140px]">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 pb-2 border-b border-border-subtle">{point.fullDate}</p>
                                                
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] font-bold text-text-secondary">Revenue</span>
                                                        <span className="text-xs font-black text-text-primary num-font">${point.revenue.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] font-bold text-text-secondary">Transactions</span>
                                                        <span className="text-xs font-black text-indigo-500 num-font">{point.count}</span>
                                                    </div>
                                                    {point.count > 0 && (
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[10px] font-bold text-text-secondary">Avg Order</span>
                                                            <span className="text-xs font-black text-amber-500 num-font">${Math.round(point.aov).toLocaleString()}</span>
                                                        </div>
                                                    )}
                                                    {viewMode === 'cumulative' && (
                                                        <div className="pt-2 mt-1 border-t border-border-subtle/50 flex justify-between items-center">
                                                            <span className="text-[10px] font-black uppercase text-text-muted">Total</span>
                                                            <span className="text-xs font-black text-emerald-500 num-font">${point.cumulative.toLocaleString()}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            {viewMode === 'daily' && averageDaily > 0 && (
                                <ReferenceLine 
                                    y={averageDaily} 
                                    stroke="var(--color-text-muted)" 
                                    strokeDasharray="3 3" 
                                    opacity={0.5}
                                    label={{ position: 'insideRight', value: 'AVG', fill: 'var(--color-text-muted)', fontSize: 9, fontWeight: 800 }} 
                                />
                            )}
                            <Area 
                                type="monotone" 
                                dataKey={viewMode === 'daily' ? 'revenue' : 'cumulative'} 
                                stroke={viewMode === 'daily' ? '#10B981' : '#6366F1'} 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill={`url(#colorRev-${gradientId})`}
                                activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                                animationDuration={1000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )} />
            </div>
        </Card>
    );
};
