
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
        <Card variant="panel" className="h-full p-0 flex flex-col relative overflow-hidden group border border-border-subtle hover:border-accent-primary/20 transition-all bg-surface-widget backdrop-blur-3xl shadow-panel rounded-xl md:rounded-xl">
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-30 z-0 transition-colors duration-500 ${viewMode === 'daily' ? 'from-status-success to-transparent' : 'from-accent-secondary to-transparent'}`}></div>
            
            {/* Header */}
            <div className="p-4 lg:p-4 border-b border-border-subtle flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-main/60 backdrop-blur-sm relative z-10">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl border transition-colors duration-500 shadow-inner group-hover:scale-110 ${viewMode === 'daily' ? 'bg-status-success/10 text-status-success border-status-success/20' : 'bg-accent-secondary/10 text-accent-secondary border-accent-secondary/20'}`}>
                        {viewMode === 'daily' ? <BarChart2 size={24} /> : <TrendingUp size={24} />}
                    </div>
                    <div>
                        <h3 className="text-xs font-[700]  text-text-primary tracking-[0.2em] flex items-center gap-2">
                            Revenue Manifest
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1">
                            <span className="text-[10px] font-bold text-text-muted  tracking-widest opacity-80">
                                {data.length} Day Horizon
                            </span>
                            {peakDay && peakDay.revenue > 0 && (
                                <span className="text-[10px] font-[700] text-status-success bg-status-success/10 px-2 py-1 rounded-lg border border-status-success/20 flex items-center gap-1 shadow-[0_0_10px_var(--color-status-success)]/10">
                                    <ArrowUpRight size={14} /> Peak: ${peakDay.revenue.toLocaleString()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex bg-surface-alt/50 p-1 rounded-xl border border-border-strong shadow-inner">
                    <button 
                        onClick={() => setViewMode('daily')}
                        className={`px-4 py-2 rounded-lg text-[10px] font-[700]  tracking-[0.15em] transition-all ${
                            viewMode === 'daily' ? 'bg-surface-main text-status-success shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-status-success/20 ring-1 ring-status-success/5' : 'text-text-muted hover:text-text-primary hover:bg-surface-highlight'
                        }`}
                    >
                        Daily Sync
                    </button>
                    <button 
                        onClick={() => setViewMode('cumulative')}
                        className={`px-4 py-2 rounded-lg text-[10px] font-[700]  tracking-[0.15em] transition-all ${
                            viewMode === 'cumulative' ? 'bg-accent-secondary/20 text-accent-secondary shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-accent-secondary/30 ring-1 ring-accent-secondary/10' : 'text-text-muted hover:text-text-primary hover:bg-surface-highlight'
                        }`}
                    >
                        Cumul. Growth
                    </button>
                </div>
            </div>

            {/* Chart Area */}
            <div className="flex-1 w-full min-h-[180px] relative z-10 px-4 pt-6 pb-2">
                <ChartFrame minHeight={220} children={() => (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                            <defs>
                                <linearGradient id={`colorRev-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={viewMode === 'daily' ? 'var(--color-status-success)' : 'var(--color-accent-secondary)'} stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor={viewMode === 'daily' ? 'var(--color-status-success)' : 'var(--color-accent-secondary)'} stopOpacity={0}/>
                                </linearGradient>
                                <filter id={`glow-${gradientId}`}>
                                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                                    <feMerge>
                                        <feMergeNode in="coloredBlur"/>
                                        <feMergeNode in="SourceGraphic"/>
                                    </feMerge>
                                </filter>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} opacity={0.5} />
                            <XAxis 
                                dataKey="date" 
                                fontSize={10} 
                                axisLine={false} 
                                tickLine={false} 
                                stroke="var(--color-text-muted)" 
                                fontWeight={900}
                                fontFamily="var(--font-mono)"
                                tickMargin={15}
                                minTickGap={30}
                                style={{ textTransform: '' }}
                            />
                            <YAxis 
                                hide={false}
                                fontSize={10}
                                axisLine={false}
                                tickLine={false}
                                stroke="var(--color-text-muted)" 
                                fontWeight={900}
                                fontFamily="var(--font-mono)"
                                tickFormatter={(val) => `$${val >= 1000 ? (val/1000).toFixed(1) + 'k' : val}`}
                                width={45}
                            />
                            <Tooltip 
                                cursor={{stroke: 'var(--color-accent-primary)', strokeWidth: 1, strokeDasharray: '4 4'}}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const point = payload[0].payload;
                                        return (
                                            <div className="bg-surface-alt/90 backdrop-blur-3xl border border-border-strong p-4 rounded-xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] min-w-[160px] relative overflow-hidden">
                                                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-primary/50 to-transparent"></div>
                                                <p className="text-[10px] font-[700]  tracking-[0.2em] text-text-muted mb-3 pb-2 border-b border-border-subtle/50">{point.fullDate}</p>
                                                
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center gap-4">
                                                        <span className="text-[10px] font-bold text-text-secondary  tracking-widest">Revenue</span>
                                                        <span className="text-sm font-display font-[700] text-text-primary tracking-tighter">${point.revenue.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center gap-4">
                                                        <span className="text-[10px] font-bold text-text-secondary  tracking-widest">Ops</span>
                                                        <span className="text-xs font-mono font-[700] text-accent-secondary">{point.count}</span>
                                                    </div>
                                                    {point.count > 0 && (
                                                        <div className="flex justify-between items-center gap-4">
                                                            <span className="text-[10px] font-bold text-text-secondary  tracking-widest">AOV</span>
                                                            <span className="text-xs font-mono font-[700] text-status-warning">${Math.round(point.aov).toLocaleString()}</span>
                                                        </div>
                                                    )}
                                                    {viewMode === 'cumulative' && (
                                                        <div className="pt-2 mt-2 border-t border-border-subtle/50 flex justify-between items-center gap-4">
                                                            <span className="text-[10px] font-[700]  text-text-primary tracking-[0.2em] opacity-50">Total</span>
                                                            <span className="text-sm font-display font-[700] text-status-success tracking-tighter shadow-sm">${point.cumulative.toLocaleString()}</span>
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
                                    label={{ position: 'insideRight', value: 'AVG', fill: 'var(--color-text-muted)', fontSize: 9, fontWeight: 900, fontFamily: 'var(--font-mono)' }} 
                                />
                            )}
                            <Area 
                                type="monotone" 
                                dataKey={viewMode === 'daily' ? 'revenue' : 'cumulative'} 
                                stroke={viewMode === 'daily' ? 'var(--color-status-success)' : 'var(--color-accent-secondary)'} 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill={`url(#colorRev-${gradientId})`}
                                activeDot={{ r: 6, strokeWidth: 0, fill: '#fff', stroke: viewMode === 'daily' ? 'var(--color-status-success)' : 'var(--color-accent-secondary)' }}
                                animationDuration={1500}
                                style={{ filter: `url(#glow-${gradientId})` }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )} />
            </div>
        </Card>
    );
};
