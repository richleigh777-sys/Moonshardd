
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
                <p className="text-xs font-bold  tracking-widest">Insufficient Data</p>
            </Card>
        );
    }

    return (
        <Card variant="panel" className="h-full p-4 lg:p-6 flex flex-col border border-border-subtle hover:border-accent-primary/20 transition-all bg-surface-main/30 backdrop-blur-3xl shadow-panel rounded-2xl md:rounded-3xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 via-transparent to-transparent opacity-50 z-0"></div>
            <div className="flex items-center justify-between mb-4 relative z-10 border-b border-border-subtle pb-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent-primary/10 rounded-2xl text-accent-primary border border-accent-primary/20 shadow-inner group-hover:scale-110 transition-transform">
                        <Target size={24} strokeWidth={2.5}/>
                    </div>
                    <div>
                        <h3 className="text-xs font-[700]  text-text-primary tracking-[0.2em]">Skill Matrix</h3>
                        <p className="text-[10px] text-text-muted font-bold  tracking-widest mt-1 opacity-80">Performance Distribution</p>
                    </div>
                </div>
                <Crosshair size={20} className="text-accent-primary opacity-50 animate-[spin_4s_linear_infinite]"/>
            </div>
            
            <div className="flex-1 min-h-[200px] relative z-10 -ml-4">
                <ChartFrame minHeight={200} children={() => (
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                            <defs>
                                <filter id="radarGlow">
                                    <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                                    <feMerge>
                                        <feMergeNode in="coloredBlur"/>
                                        <feMergeNode in="SourceGraphic"/>
                                    </feMerge>
                                </filter>
                            </defs>
                            <PolarGrid stroke="var(--color-border-strong)" strokeOpacity={0.8} />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-text-secondary)', fontSize: 10, fontWeight: 900, fontFamily: 'var(--font-mono)' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                                name="Performance"
                                dataKey="A"
                                stroke="var(--color-accent-primary)"
                                strokeWidth={3}
                                fill="var(--color-accent-primary)"
                                fillOpacity={0.25}
                                style={{ filter: 'url(#radarGlow)' }}
                                animationDuration={1500}
                            />
                            <Tooltip 
                                cursor={{ stroke: 'var(--color-text-muted)', strokeWidth: 1 }}
                                contentStyle={{ 
                                    backgroundColor: 'var(--color-surface-alt)', 
                                    borderRadius: '12px', 
                                    border: '1px solid var(--color-border-strong)',
                                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.8)',
                                    color: 'var(--color-text-primary)',
                                    padding: '12px',
                                }}
                                itemStyle={{ color: 'var(--color-accent-primary)', fontSize: '14px', fontWeight: '900', fontFamily: 'var(--font-mono)' }}
                                labelStyle={{ color: 'var(--color-text-muted)', fontSize: '10px', textTransform: '', letterSpacing: '0.1em', marginBottom: '4px' }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                )} />
            </div>

            <div className="pt-4 border-t border-border-subtle relative z-10 text-center">
                <p className="text-[10px] font-bold text-text-secondary bg-surface-alt/80 px-4 py-2 rounded-xl border border-border-strong shadow-inner inline-block backdrop-blur-md  tracking-widest">
                    <span className="font-[700] text-accent-primary tracking-[0.2em] mr-2">INSIGHT:</span> {insight}
                </p>
            </div>
        </Card>
    );
};
