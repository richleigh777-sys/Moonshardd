
import React, { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, PolarRadiusAxis } from 'recharts';
import { Card } from '../ui/Base';
import { Sale } from '../../types';
import { ChartFrame } from '../ui/ChartFrame';
import { Target, AlertTriangle, Crosshair } from 'lucide-react';

interface OpportunityRadarProps {
    sales: Sale[];
    agentId?: string;
}

export const OpportunityRadar: React.FC<OpportunityRadarProps> = ({ sales, agentId }) => {
    
    const data = useMemo(() => {
        const relevantSales = agentId 
            ? sales.filter(s => s.agentId === agentId && s.status === 'Approved') 
            : sales.filter(s => s.status === 'Approved');

        if (relevantSales.length === 0) return [];

        const stats = {
            "Volume": relevantSales.length,
            "Value": relevantSales.reduce((a,b) => a + Number(b.amount), 0),
            "Retention": relevantSales.filter(s => s.isReorder).length,
            "Speed": relevantSales.filter(s => s.pipelineStatus === 'Closed').length, 
            "Upsell": relevantSales.filter(s => s.amount > 100).length
        };

        const maxVol = Math.max(20, stats.Volume * 1.2);
        const maxVal = Math.max(5000, stats.Value * 1.2);
        
        return [
            { subject: 'Volume', A: Math.min(100, (stats.Volume / maxVol) * 100), fullMark: 100 },
            { subject: 'Revenue', A: Math.min(100, (stats.Value / maxVal) * 100), fullMark: 100 },
            { subject: 'Retention', A: Math.min(100, (stats.Retention / (stats.Volume || 1)) * 100), fullMark: 100 },
            { subject: 'Velocity', A: 75, fullMark: 100 },
            { subject: 'Upsell', A: Math.min(100, (stats.Upsell / (stats.Volume || 1)) * 100), fullMark: 100 },
        ];
    }, [sales, agentId]);

    const insight = useMemo(() => {
        if (data.length === 0) return "No data available.";
        const strongest = data.reduce((prev, current) => (prev.A > current.A) ? prev : current);
        const weakest = data.reduce((prev, current) => (prev.A < current.A) ? prev : current);
        return `Strong in ${strongest.subject}. Opportunity in ${weakest.subject}.`;
    }, [data]);

    if (data.length === 0) {
        return (
            <Card variant="panel" className="h-full flex flex-col items-center justify-center p-6 text-text-muted opacity-60 border-dashed border-border-subtle bg-surface-alt/10">
                <AlertTriangle size={32} className="mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest">Insufficient Data</p>
            </Card>
        );
    }

    return (
        <Card variant="panel" className="h-full p-6 flex flex-col border-border-subtle bg-surface-main shadow-soft relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2 relative z-10 border-b border-border-subtle pb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent-primary/10 rounded-xl text-accent-primary border border-accent-primary/20 shadow-sm">
                        <Target size={18} strokeWidth={2.5}/>
                    </div>
                    <div>
                        <h3 className="text-xs font-black uppercase text-text-primary tracking-widest">Skill Matrix</h3>
                        <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider mt-0.5">Performance Distribution</p>
                    </div>
                </div>
                <Crosshair size={16} className="text-accent-primary opacity-50"/>
            </div>
            
            <div className="flex-1 min-h-[180px] relative z-10 -ml-4">
                <ChartFrame minHeight={180} children={() => (
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                            <PolarGrid stroke="var(--color-border-subtle)" strokeOpacity={1} />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-text-secondary)', fontSize: 9, fontWeight: 800 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                                name="Performance"
                                dataKey="A"
                                stroke="var(--color-accent-primary)"
                                strokeWidth={2}
                                fill="var(--color-accent-primary)"
                                fillOpacity={0.2}
                            />
                            <Tooltip 
                                cursor={{ stroke: 'var(--color-text-muted)', strokeWidth: 1 }}
                                contentStyle={{ 
                                    backgroundColor: 'var(--color-surface-main)', 
                                    borderRadius: '12px', 
                                    border: '1px solid var(--color-border-subtle)',
                                    boxShadow: '0 10px 20px -5px rgba(0,0,0,0.1)',
                                    color: 'var(--color-text-primary)',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                }}
                                itemStyle={{ color: 'var(--color-accent-primary)' }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                )} />
            </div>

            <div className="pt-2 border-t border-border-subtle relative z-10 text-center">
                <p className="text-[9px] font-medium text-text-muted bg-surface-alt/50 px-3 py-1.5 rounded-lg border border-border-subtle inline-block">
                    <span className="font-bold text-accent-primary">INSIGHT:</span> {insight}
                </p>
            </div>
        </Card>
    );
};
