
import React, { useState } from 'react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart } from 'lucide-react';
import { Card } from '../../ui/Base';
import { ChartFrame } from '../../ui/ChartFrame';

interface ProductMixChartProps {
    data: { name: string; value: number }[];
}

export const ProductMixChart: React.FC<ProductMixChartProps> = ({ data }) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const COLORS = ['#10B981', '#6366F1', '#F59E0B', '#EC4899', '#8B5CF6'];

    const total = data.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <Card variant="panel" className="p-0 flex flex-col bg-surface-main/30 backdrop-blur-3xl border border-border-subtle hover:border-accent-primary/20 overflow-hidden rounded-xl md:rounded-xl shadow-panel transition-all group min-h-[320px] relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full z-0 pointer-events-none"></div>
            
            <div className="p-4 lg:p-4 border-b border-border-subtle flex justify-between items-center bg-surface-main/60 backdrop-blur-sm shrink-0 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/10 rounded-xl text-status-warning border border-amber-500/20 shadow-inner group-hover:scale-110 transition-transform">
                        <PieChart size={24} strokeWidth={2.5}/>
                    </div>
                    <div>
                        <h4 className="text-xs font-[700]  text-text-primary tracking-[0.2em] flex items-center gap-2">Product Mix</h4>
                        <p className="text-[10px] text-text-muted font-bold  tracking-widest mt-1 opacity-80">Volume Distribution</p>
                    </div>
                </div>
            </div>
            
            <div className="flex-1 p-4 lg:p-4 min-h-0 relative flex flex-col md:flex-row items-center gap-4 z-10">
                <div className="flex-1 h-full w-full min-h-[220px] relative">
                    <ChartFrame children={() => (
                        data.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <defs>
                                        <filter id="pieGlow">
                                            <feGaussianBlur stdDeviation="3" result="blur" />
                                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                        </filter>
                                    </defs>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={95}
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="var(--color-surface-main)"
                                        strokeWidth={2}
                                        onMouseEnter={(_, index) => setActiveIndex(index)}
                                        onMouseLeave={() => setActiveIndex(null)}
                                        animationDuration={1500}
                                        animationEasing="ease-out"
                                    >
                                        {data.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={COLORS[index % COLORS.length]} 
                                                className="transition-all duration-300 outline-none"
                                                style={{
                                                    filter: activeIndex === index ? 'url(#pieGlow)' : 'none',
                                                    opacity: activeIndex !== null && activeIndex !== index ? 0.4 : 1,
                                                    transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                                                    transformOrigin: '50% 50%'
                                                }}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'var(--color-surface-alt)', borderColor: 'var(--color-border-strong)', borderRadius: '12px', padding: '12px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.8)' }}
                                        itemStyle={{ color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: '900', fontFamily: 'var(--font-mono)' }}
                                    />
                                </RePieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-text-muted opacity-40">
                                <PieChart size={32} className="mb-2"/>
                                <p className="text-[10px] font-[700]  tracking-[0.2em]">Data Insufficient</p>
                            </div>
                        )
                    )} />
                </div>

                {/* Side Legend */}
                <div className="w-full md:w-56 flex flex-col justify-center gap-2 pr-2">
                    {data.map((item, index) => {
                        const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
                        const isActive = activeIndex === index;
                        
                        return (
                            <div 
                                key={item.name}
                                className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-surface-main border border-border-strong shadow-[0_0_20px_rgba(0,0,0,0.4)] scale-[1.02] ring-1 ring-white/5' : 'hover:bg-surface-main/50 border border-transparent'}`}
                                onMouseEnter={() => setActiveIndex(index)}
                                onMouseLeave={() => setActiveIndex(null)}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-inner" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className={`text-[10px] font-[700]  truncate tracking-widest ${isActive ? 'text-text-primary' : 'text-text-secondary'}`}>
                                        {item.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-mono font-bold text-text-muted opacity-80">{percent}%</span>
                                    <span className={`text-sm font-[700] font-display tracking-tight ${isActive ? 'text-text-primary' : 'text-text-secondary'}`}>{item.value}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Card>
    );
};
