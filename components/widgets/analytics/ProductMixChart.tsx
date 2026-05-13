
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
        <Card variant="panel" className="p-0 flex flex-col bg-surface-main border-border-subtle overflow-hidden shadow-sm min-h-[320px]">
            <div className="p-5 border-b border-border-subtle flex justify-between items-center bg-surface-alt/20 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500">
                        <PieChart size={16} strokeWidth={2.5}/>
                    </div>
                    <div>
                        <h4 className="text-xs font-black uppercase text-text-primary tracking-widest">Product Mix</h4>
                        <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Volume Distribution</p>
                    </div>
                </div>
            </div>
            
            <div className="flex-1 p-4 min-h-0 relative flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1 h-full w-full min-h-[200px]">
                    <ChartFrame children={() => (
                        data.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        onMouseEnter={(_, index) => setActiveIndex(index)}
                                        onMouseLeave={() => setActiveIndex(null)}
                                    >
                                        {data.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={COLORS[index % COLORS.length]} 
                                                stroke="rgba(0,0,0,0)"
                                                className="transition-all duration-300 outline-none"
                                                style={{
                                                    filter: activeIndex === index ? 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' : 'none',
                                                    opacity: activeIndex !== null && activeIndex !== index ? 0.6 : 1
                                                }}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'var(--color-surface-main)', borderColor: 'var(--color-border-subtle)', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                                        itemStyle={{ color: 'var(--color-text-primary)' }}
                                    />
                                </RePieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-text-muted opacity-40">
                                <PieChart size={32} className="mb-2"/>
                                <p className="text-[10px] font-black uppercase tracking-widest">Data Insufficient</p>
                            </div>
                        )
                    )} />
                </div>

                {/* Side Legend */}
                <div className="w-full md:w-48 flex flex-col justify-center gap-2 pr-2">
                    {data.map((item, index) => {
                        const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
                        const isActive = activeIndex === index;
                        
                        return (
                            <div 
                                key={item.name}
                                className={`flex items-center justify-between p-2 rounded-xl transition-all ${isActive ? 'bg-surface-alt border border-border-subtle shadow-sm scale-105' : 'hover:bg-surface-alt/50 border border-transparent'}`}
                                onMouseEnter={() => setActiveIndex(index)}
                                onMouseLeave={() => setActiveIndex(null)}
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className={`text-[10px] font-bold uppercase truncate ${isActive ? 'text-text-primary' : 'text-text-secondary'}`}>
                                        {item.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono text-text-muted">{percent}%</span>
                                    <span className="text-xs font-black num-font text-text-primary">{item.value}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Card>
    );
};
