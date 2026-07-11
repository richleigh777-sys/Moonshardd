
import { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { Layers } from 'lucide-react';
import { Card } from '../../ui/Base';
import { ChartFrame } from '../../ui/ChartFrame';
import { Sale } from '../../../types';

interface PipelineHealthWidgetProps {
    sales: Sale[];
    hasSales: boolean;
}

export const PipelineHealthWidget: React.FC<PipelineHealthWidgetProps> = ({ sales, hasSales }) => {

    const pipelineData = useMemo(() => {
        const counts = { 'Prospect': 0, 'Pitched': 0, 'Rebuttal': 0, 'Callback': 0, 'Sale': 0 };
        
        sales.forEach(s => {
            if (s.status === 'Approved' || s.pipelineStatus === 'Closed Won') counts['Sale']++;
            else if (s.pipelineStatus === 'Winback') counts['Callback']++;
            else if (s.pipelineStatus === 'Rebuttal') counts['Rebuttal']++;
            else if (s.pipelineStatus === 'Pitching') counts['Pitched']++;
            else counts['Prospect']++;
        });
  
        return [
            { name: 'Prospects', value: counts['Prospect'] || (hasSales ? 20 : 0), fill: 'var(--color-accent-secondary)' }, 
            { name: 'Pitched', value: counts['Pitched'] || (hasSales ? 15 : 0), fill: 'rgba(52, 211, 153, 0.4)' },
            { name: 'Rebuttals', value: counts['Rebuttal'] || (hasSales ? 10 : 0), fill: 'rgba(52, 211, 153, 0.7)' },
            { name: 'Callbacks', value: counts['Callback'] || (hasSales ? 5 : 0), fill: 'rgba(5, 150, 105, 0.9)' },
            { name: 'Sales', value: counts['Sale'], fill: 'var(--color-accent-primary)' },
        ];
    }, [sales, hasSales]);

    return (
        <Card variant="panel" className="p-0 flex flex-col relative overflow-hidden h-full rounded-xl group border border-border-subtle hover:border-border-subtle transition-all shadow-panel bg-surface-main/30 backdrop-blur-3xl">
            <div className="absolute top-0 right-0 bottom-0 w-[2px] bg-gradient-to-b from-accent-primary/50 via-accent-secondary/50 to-transparent opacity-30 z-0"></div>
            <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-transparent relative z-10">
                <h3 className="text-sm font-medium text-text-primary  tracking-wide flex items-center gap-4">
                    <div className="p-2 bg-gradient-to-br from-surface-highlight to-surface-main border border-border-subtle rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                        <Layers size={16} className="text-accent-secondary shadow-sm"/>
                    </div>
                    Pipeline Health
                </h3>
            </div>
            <div className="flex-1 w-full min-h-[160px] relative z-10 p-4 pt-8">
                <ChartFrame minHeight={200} children={() => (
                    hasSales ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={pipelineData}
                                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                            >
                                <defs>
                                    {pipelineData.map((entry, index) => (
                                        <linearGradient key={`grad-${index}`} id={`colorGrad-${index}`} x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor={entry.fill} stopOpacity={0.8}/>
                                            <stop offset="100%" stopColor={entry.fill} stopOpacity={0.3}/>
                                        </linearGradient>
                                    ))}
                                </defs>
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    width={90} 
                                    tick={{fontSize: 10, fontWeight: 900, fill: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)'}} 
                                    axisLine={false} 
                                    tickLine={false} 
                                />
                                <Tooltip 
                                    cursor={{fill: 'var(--color-surface-highlight)'}}
                                    contentStyle={{ backgroundColor: 'var(--color-surface-alt)', borderColor: 'var(--color-border-strong)', borderRadius: '12px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.8)', padding: '12px' }}
                                    itemStyle={{ color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: '900', fontFamily: 'var(--font-mono)' }}
                                    labelStyle={{ color: 'var(--color-text-muted)', fontSize: '10px', textTransform: '', letterSpacing: '0.1em', marginBottom: '4px' }}
                                />
                                <Bar dataKey="value" barSize={16} radius={[0, 4, 4, 0]} animationDuration={1500}>
                                    {pipelineData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={`url(#colorGrad-${index})`} className="drop-shadow-md hover:brightness-125 transition-all" />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-text-muted opacity-30">
                            <Layers size={32} className="mb-2" />
                            <p className="text-sm font-medium  tracking-wide">Pipeline Empty</p>
                        </div>
                    )
                )} />
            </div>
        </Card>
    );
};
