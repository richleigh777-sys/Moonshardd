
import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: React.ReactNode;
    sub: React.ReactNode;
    icon: any;
    color: string;
    trend?: string;
    trendDir?: 'up' | 'down';
    sparklineData?: number[]; // Array of 7 numbers
}

const Sparkline = ({ data, color }: { data: number[], color: string }) => {
    if (!data || data.length < 2) return null;
    
    const max = Math.max(...data, 1);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    // Normalize to 0-100 coordinate space
    const points = data.map((val, idx) => {
        const x = (idx / (data.length - 1)) * 100;
        const y = 100 - ((val - min) / range) * 80; // Keep some padding at bottom
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible preserve-3d">
            <polyline 
                points={points} 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className={`${color.replace('text-', 'text-')} opacity-30`}
            />
            <path 
                d={`M 0 100 L 0 ${100 - ((data[0] - min) / range) * 80} ${points.split(' ').map((p) => `L ${p}`).join(' ')} L 100 100 Z`} 
                fill="currentColor" 
                className={`${color.replace('text-', 'text-')} opacity-10`}
            />
        </svg>
    );
};

export const StatCard: React.FC<StatCardProps> = ({ title, value, sub, icon: Icon, color, trend, trendDir = 'up', sparklineData }) => (
    <div className="bg-surface-main rounded-xl border border-border-subtle p-5 shadow-soft hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden group hover:-translate-y-1">
        
        {/* Background Sparkline */}
        {sparklineData && (
            <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-0 px-2 pb-2">
                <Sparkline data={sparklineData} color={color} />
            </div>
        )}

        <div className={`absolute -right-6 -top-4 p-5 opacity-[0.03] transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12 ${color.replace('text-', 'bg-')}`}>
            <Icon size={120} />
        </div>
        
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-surface-alt border border-border-subtle ${color} shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon size={20} strokeWidth={2.5}/>
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-[700] px-3 py-1.5 rounded-full border ${trendDir === 'up' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'}`}>
                        {trendDir === 'up' ? <ArrowUpRight size={16}/> : <ArrowDownRight size={16}/>}
                        {trend}
                    </div>
                )}
            </div>
            
            <div>
                <h3 className="text-xl font-[700] text-text-primary num-font tracking-tight mb-1 drop-shadow-sm">{value}</h3>
                <p className="text-xs font-bold text-text-secondary  tracking-widest opacity-80">{title}</p>
            </div>
        </div>

        <div className="relative z-10 mt-4 pt-4 border-t border-border-subtle/50">
            <p className="text-xs text-text-muted font-medium flex items-center gap-1.5">
                {sub}
            </p>
        </div>
    </div>
);
