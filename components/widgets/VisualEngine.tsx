
import React, { useMemo, useId } from 'react';
import { Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ComposedChart, Line } from 'recharts';
import { Sale, Theme } from '../../types';
import { TrendingUp, Calendar, Activity } from 'lucide-react';
import { ChartFrame } from '../ui/ChartFrame';
import { preciseRound } from '../../views/utils/crmLogic';

interface VisualEngineProps {
  sales: Sale[];
  theme: Theme;
}

export const VisualEngine: React.FC<VisualEngineProps> = ({ sales, theme }) => {
  const isDark = theme === 'dark';
  const gradientId = useId();

  const chartData = useMemo(() => {
    const data: Record<string, number> = {};
    const safeSales = sales || [];
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Generate last 7 days keys
    const keys = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        data[key] = 0;
        keys.push(key);
    }
    
    safeSales.forEach(s => {
      if (s.status === 'Approved') {
          const date = new Date(s.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          if (data[date] !== undefined) {
              data[date] = preciseRound(data[date] + Number(s.amount));
          }
      }
    });

    // Prediction Logic: Simple moving average of last 3 days
    const result = keys.map((key, i) => {
        return {
            date: key,
            actual: data[key],
            projected: i === keys.length - 1 ? null : undefined // Only project from today onwards in a real app, here we just show historical
        };
    });

    // Append tomorrow for projection
    const last3Days = result.slice(-3).map(r => r.actual);
    const avg = last3Days.reduce((a,b) => a+b, 0) / 3;
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    result.push({
        date: tomorrow.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' (Est)',
        actual: 0, // No actual data for tomorrow
        projected: preciseRound(avg * 1.1) // Optimistic 10% growth
    });
    
    // Connect the line: set last actual point as starting point for projection
    // result[result.length - 2].projected = result[result.length - 2].actual;

    return result;
  }, [sales]);

  const avgRevenue = useMemo(() => {
      const actuals = chartData.filter(d => d.actual !== undefined && d.actual > 0).map(d => d.actual);
      if (actuals.length === 0) return 0;
      return preciseRound(actuals.reduce((a, b) => a + b, 0) / actuals.length);
  }, [chartData]);

  const colors = useMemo(() => ({
      primary: isDark ? '#A78BFA' : '#7C3AED',
      prediction: '#F59E0B', // Amber
      grid: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
      text: isDark ? '#A1A1AA' : '#71717A'
  }), [isDark]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-main/95 backdrop-blur-xl border border-border-subtle p-4 rounded-2xl shadow-2xl min-w-[150px]">
          <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 border-b border-border-subtle pb-2">{label}</p>
          <div className="space-y-1">
              {payload.map((entry: any, i: number) => (
                  entry.value > 0 && (
                    <div key={i} className="flex items-center justify-between gap-4">
                        <span className="text-xs font-bold text-text-secondary capitalize flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: entry.color}}></div>
                            {entry.dataKey === 'actual' ? 'Revenue' : 'Forecast'}
                        </span>
                        <span className={`text-sm font-black num-font ${entry.dataKey === 'projected' ? 'text-amber-500' : 'text-text-primary'}`}>
                            ${entry.value.toLocaleString()}
                        </span>
                    </div>
                  )
              ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const hasData = chartData.some(d => d.actual > 0);

  return (
    <div className="w-full h-full flex flex-col relative bg-surface-main group overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-2 border-b border-border-subtle/30 z-10 relative">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-accent-primary/10 rounded-2xl text-accent-primary border border-accent-primary/20 shadow-neon">
                    <TrendingUp size={20} strokeWidth={2.5}/>
                </div>
                <div>
                    <h3 className="text-base font-black text-text-primary flex items-center gap-2 tracking-tight uppercase">
                        Revenue Velocity
                    </h3>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5 flex items-center gap-1">
                        <Calendar size={10} /> 7 Day Trajectory with AI Forecast
                    </p>
                </div>
            </div>
            {hasData && (
                <div className="flex gap-2">
                    <div className="px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 bg-surface-alt border-border-subtle text-text-muted">
                        <span className="w-2 h-2 rounded-full bg-accent-primary"></span> Actual
                    </div>
                    <div className="px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 bg-amber-500/5 border-amber-500/20 text-amber-600">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Projected
                    </div>
                </div>
            )}
        </div>
        
        {/* Chart */}
        <div className="flex-1 w-full min-h-[220px] relative px-2 pb-2 pt-6 z-10">
            <ChartFrame minHeight={220} children={() => (
                hasData ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id={`colorRev-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={colors.primary} stopOpacity={0.25}/>
                                    <stop offset="95%" stopColor={colors.primary} stopOpacity={0}/>
                                </linearGradient>
                                <pattern id="pattern-stripes" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                                    <rect width="4" height="8" transform="translate(0,0)" fill="rgba(245, 158, 11, 0.1)"></rect>
                                </pattern>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                            <XAxis 
                                dataKey="date" 
                                stroke={colors.text} 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false} 
                                tickMargin={15} 
                                fontWeight={700}
                                opacity={0.7}
                            />
                            <YAxis 
                                stroke={colors.text} 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false} 
                                tickFormatter={(val) => val >= 1000 ? `$${(val / 1000).toFixed(1)}k` : `$${val}`} 
                                fontWeight={700}
                                tickMargin={10}
                                opacity={0.7}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: colors.text, strokeWidth: 1, strokeDasharray: '4 4' }} />
                            
                            {avgRevenue > 0 && (
                                <ReferenceLine 
                                    y={avgRevenue} 
                                    stroke={colors.text} 
                                    strokeDasharray="3 3" 
                                    strokeOpacity={0.3}
                                    label={{ position: 'insideRight', value: 'AVG', fill: colors.text, fontSize: 9, fontWeight: 800 }} 
                                />
                            )}
                            
                            <Area 
                                type="monotone" 
                                dataKey="actual" 
                                stroke={colors.primary} 
                                strokeWidth={3} 
                                fill={`url(#colorRev-${gradientId})`}
                                activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                                animationDuration={1500}
                            />
                            {/* Forecast Line */}
                            <Line 
                                type="monotone" 
                                dataKey="projected" 
                                stroke={colors.prediction} 
                                strokeWidth={3} 
                                strokeDasharray="5 5"
                                dot={{ r: 4, fill: colors.prediction, strokeWidth: 0 }}
                                animationDuration={1500}
                                animationBegin={1000}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-text-muted opacity-40">
                        <div className="p-4 rounded-[2rem] bg-surface-alt mb-4 border border-border-subtle shadow-inner">
                            <Activity size={32} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Awaiting transaction data</p>
                    </div>
                )
            )} />
        </div>
    </div>
  );
};
