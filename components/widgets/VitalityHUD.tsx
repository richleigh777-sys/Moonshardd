
import React, { useMemo } from 'react';
import { Activity, HeartPulse, TrendingUp } from 'lucide-react';
import { Card } from '../ui/Base';
import { Sale } from '../../types';

export const VitalityHUD: React.FC<{ sales: Sale[] }> = ({ sales }) => {
    const score = useMemo(() => {
        const approved = sales.filter(s => s.status === 'Approved').length;
        const total = sales.length;
        if (total === 0) return 0;
        return Math.round((approved / total) * 100);
    }, [sales]);

    const getHealthColor = (s: number) => {
        if (s >= 80) return 'text-emerald-500';
        if (s >= 50) return 'text-amber-500';
        return 'text-red-500';
    };

    return (
        <Card variant="panel" className="h-full flex flex-col justify-center items-center p-6 bg-surface-main border-border-subtle relative overflow-hidden group">
            <div className={`absolute inset-0 opacity-10 animate-pulse ${getHealthColor(score).replace('text', 'bg')}`}></div>
            
            <div className="relative z-10 flex flex-col items-center">
                <div className={`p-4 rounded-full border-4 ${getHealthColor(score).replace('text', 'border')} flex items-center justify-center w-24 h-24 mb-4 shadow-lg`}>
                    <Activity size={40} className={getHealthColor(score)} />
                </div>
                
                <h3 className="text-3xl font-black num-font text-text-primary tracking-tighter">{score}%</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mt-1">Vitality Score</p>
                
                <div className="mt-4 flex gap-4">
                    <div className="flex flex-col items-center">
                        <HeartPulse size={16} className="text-accent-primary mb-1"/>
                        <span className="text-[9px] font-bold text-text-secondary">Pulsing</span>
                    </div>
                    <div className="w-px h-8 bg-border-subtle"></div>
                    <div className="flex flex-col items-center">
                        <TrendingUp size={16} className="text-emerald-500 mb-1"/>
                        <span className="text-[9px] font-bold text-text-secondary">Optimal</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};
