
import React from 'react';
import { TrendingUp } from 'lucide-react';
import { sfx } from '../../../lib/soundService';

interface SummaryCardProps {
    label: string;
    value: string;
    sub: string;
    icon: any;
    color: string;
    trend?: string;
    progress?: number;
    onClick?: () => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = React.memo(({ label, value, sub, icon: Icon, color, trend, progress, onClick }) => {
    
    const handleClick = () => {
        if (onClick) {
            sfx.playClick();
            onClick();
        }
    };

    return (
        <div 
            onClick={handleClick} 
            className={`
                relative overflow-hidden rounded-xl group transition-all duration-500 
                hover:-translate-y-1 hover:shadow-2xl h-20 cursor-default select-none
                ${onClick ? 'cursor-pointer active:scale-95' : ''}
            `}
        >
            {/* Glass Background */}
            <div className="absolute inset-0 bg-surface-main/60 backdrop-blur-xl border border-border-subtle group-hover:border-accent-primary/20 transition-colors z-0"></div>
            
            {/* Dynamic Glow Blob */}
            <div className={`
                absolute -top-8 -right-8 w-20 h-20 blur-[30px] rounded-full transition-all duration-700 z-0 opacity-0 group-hover:opacity-100
                ${color === 'emerald' ? 'bg-emerald-500/20' : ''}
                ${color === 'indigo' ? 'bg-indigo-500/20' : ''}
                ${color === 'blue' ? 'bg-blue-500/20' : ''}
                ${color === 'amber' ? 'bg-amber-500/20' : ''}
            `}></div>
            
            <div className="relative z-10 p-2.5 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                    <div className="min-w-0">
                        <p className="text-[8px] font-black text-text-primary mb-0 uppercase tracking-widest leading-none">{label}</p>
                        <h3 className="text-base font-black text-text-primary num-font tracking-tighter truncate leading-tight">{value}</h3>
                    </div>
                    <div className={`
                        p-1 bg-surface-main/50 border border-border-subtle rounded-lg shadow-sm group-hover:scale-105 transition-transform duration-500
                        ${color === 'emerald' ? 'text-emerald-500' : ''}
                        ${color === 'indigo' ? 'text-indigo-500' : ''}
                        ${color === 'blue' ? 'text-blue-500' : ''}
                        ${color === 'amber' ? 'text-amber-500' : ''}
                    `}>
                        <Icon size={12} strokeWidth={3}/>
                    </div>
                </div>
                
                <div className="flex items-center justify-between">
                    <span className="text-[8px] font-bold text-text-muted truncate max-w-[120px] uppercase tracking-tight">{sub}</span>
                    {trend && (
                        <span className={`text-[8px] font-black flex items-center gap-0.5 ${color === 'emerald' ? 'text-emerald-500' : 'text-text-muted'}`}>
                            <TrendingUp size={8} /> {trend}
                        </span>
                    )}
                </div>
            </div>

            {/* Progress Line */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-surface-alt">
                <div 
                    className={`h-full transition-all duration-1000 ease-out 
                        ${color === 'emerald' ? 'bg-emerald-500' : ''}
                        ${color === 'indigo' ? 'bg-indigo-500' : ''}
                        ${color === 'blue' ? 'bg-blue-500' : ''}
                        ${color === 'amber' ? 'bg-amber-500' : ''}
                    `} 
                    style={{ width: `${progress !== undefined ? progress : 60}%` }}
                ></div>
            </div>
        </div>
    );
});

