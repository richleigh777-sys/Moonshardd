
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { Card } from '../ui/Base';
import { Sale } from '../../types';
import { Layers, Activity } from 'lucide-react';
import { ChartFrame } from '../ui/ChartFrame';

export const PipelineVelocityChart: React.FC<{ sales: Sale[] }> = ({ sales }) => {
  const data = React.useMemo(() => {
    const counts: Record<string, number> = {};
    sales.forEach(s => {
      const date = new Date(s.timestamp).toLocaleDateString(undefined, { weekday: 'short' });
      counts[date] = (counts[date] || 0) + 1;
    });
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return Object.entries(counts)
        .sort((a, b) => days.indexOf(a[0]) - days.indexOf(b[0]))
        .map(([name, value]) => ({ name, value }));
  }, [sales]);

  return (
    <Card variant="panel" className="h-full p-6 border-border-subtle bg-surface-main shadow-soft flex flex-col relative overflow-hidden group">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-subtle relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500 border border-indigo-500/20 shadow-sm">
                <Layers size={18} strokeWidth={2.5}/>
            </div>
            <div>
                <h3 className="text-xs font-black uppercase text-text-primary tracking-widest">Pipeline Velocity</h3>
                <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider mt-0.5">Throughput by Day</p>
            </div>
          </div>
          <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1 bg-indigo-500/5 px-2 py-1 rounded border border-indigo-500/10">
              <Activity size={10} className="animate-pulse"/> Live
          </div>
      </div>

      <div className="flex-1 w-full min-h-[180px] relative z-10">
        <ChartFrame minHeight={180} children={() => (
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} opacity={0.3} />
                <XAxis 
                    dataKey="name" 
                    fontSize={10} 
                    axisLine={false} 
                    tickLine={false} 
                    stroke="var(--color-text-muted)" 
                    fontWeight={700}
                    tickMargin={10}
                />
                <Tooltip 
                    cursor={{fill: 'var(--color-surface-alt)', opacity: 0.4}}
                    content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                            return (
                                <div className="bg-surface-main border border-border-subtle px-3 py-2 rounded-xl shadow-xl flex flex-col items-center">
                                    <span className="text-[9px] font-black uppercase text-text-muted tracking-widest mb-1">{label}</span>
                                    <span className="text-lg font-black text-indigo-500 num-font">{payload[0].value} <span className="text-[9px] text-text-secondary">Deals</span></span>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={1000}>
                    {data.map((entry, index) => (
                        <Cell 
                            key={`cell-${index}`} 
                            fill={index === data.length - 1 ? '#6366F1' : '#A5B4FC'} 
                            className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                        />
                    ))}
                </Bar>
            </BarChart>
            </ResponsiveContainer>
        )} />
      </div>
    </Card>
  );
};
