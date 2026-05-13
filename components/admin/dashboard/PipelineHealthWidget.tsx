
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
        const counts = { 'New': 0, 'Contacted': 0, 'Interested': 0, 'Closing': 0, 'Won': 0 };
        
        sales.forEach(s => {
            if (s.status === 'Approved') counts['Won']++;
            else if (s.pipelineStatus?.includes('Interested')) counts['Interested']++;
            else if (s.pipelineStatus?.includes('Contacted')) counts['Contacted']++;
            else if (s.pipelineStatus === 'New' || s.status === 'Pending') counts['New']++;
            else counts['Closing']++;
        });
  
        return [
            { name: 'New Leads', value: counts['New'] || (hasSales ? 20 : 0), fill: 'var(--color-accent-secondary)' }, 
            { name: 'Contacted', value: counts['Contacted'] || (hasSales ? 15 : 0), fill: 'rgba(52, 211, 153, 0.4)' },
            { name: 'Interested', value: counts['Interested'] || (hasSales ? 10 : 0), fill: 'rgba(52, 211, 153, 0.7)' },
            { name: 'Closing', value: counts['Closing'] || (hasSales ? 5 : 0), fill: 'rgba(5, 150, 105, 0.9)' },
            { name: 'Won', value: counts['Won'], fill: 'var(--color-accent-primary)' },
        ];
    }, [sales, hasSales]);

    return (
        <Card variant="panel" className="p-0 flex flex-col relative overflow-hidden h-full">
            <div className="flex items-center justify-between p-2.5 border-b border-border-subtle bg-surface-alt/20 backdrop-blur-sm relative z-10">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wide flex items-center gap-2">
                    <Layers size={14} className="text-indigo-500"/> Pipeline Health
                </h3>
            </div>
            <div className="flex-1 w-full min-h-0 relative z-10 p-2.5">
                <ChartFrame minHeight={160} children={() => (
                    hasSales ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={pipelineData}
                                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                            >
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    width={80} 
                                    tick={{fontSize: 9, fontWeight: 600, fill: 'var(--color-text-secondary)'}} 
                                    axisLine={false} 
                                    tickLine={false} 
                                />
                                <Tooltip 
                                    cursor={{fill: 'var(--color-surface-highlight)'}}
                                    contentStyle={{ backgroundColor: 'var(--color-surface-main)', borderColor: 'var(--color-border-subtle)', borderRadius: '8px' }}
                                    itemStyle={{ color: 'var(--color-text-primary)', fontSize: '10px', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="value" barSize={20} radius={[0, 4, 4, 0]} animationDuration={1500}>
                                    {pipelineData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-text-muted opacity-30">
                            <Layers size={32} className="mb-2" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Pipeline Empty</p>
                        </div>
                    )
                )} />
            </div>
        </Card>
    );
};
