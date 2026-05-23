
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
    contentStyle?: React.CSSProperties;
}

export const SummaryCard: React.FC<SummaryCardProps> = React.memo(({ label, value, sub, icon: Icon, color, trend, progress, onClick, contentStyle }) => {
    
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
                relative overflow-hidden rounded-3xl group transition-all duration-500 
                hover:-translate-y-1 hover:shadow-panel h-28 lg:h-32 cursor-default select-none
                ${onClick ? 'cursor-pointer active:scale-95' : ''}
            `}
        >
            {/* Glass Background */}
            <div className={`absolute inset-0 bg-surface-main/40 backdrop-blur-3xl border border-border-subtle transition-colors z-0 shadow-inner group-hover:border-border-strong`} />
            <div className={`absolute top-0 right-0 w-32 h-32 bg-current opacity-10 blur-3xl -mx-10 -my-10 rounded-full transition-transform group-hover:scale-150 duration-700
                ${color === 'emerald' ? 'text-status-success' : ''}
                ${color === 'indigo' ? 'text-accent-secondary' : ''}
                ${color === 'blue' ? 'text-blue-500' : ''}
                ${color === 'amber' ? 'text-status-warning' : ''}
            `} />
            
            <div style={contentStyle} className="relative z-10 p-5 lg:p-6 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                    <div className="min-w-0 pr-2">
                        <p className="text-[10px] lg:text-xs font-[700] text-text-muted mb-1  tracking-[0.2em] leading-none drop-shadow-sm">{label}</p>
                        <h3 className="text-2xl lg:text-3xl font-display font-[700] text-text-primary tracking-tighter truncate leading-none drop-shadow-sm">{value}</h3>
                    </div>
                    <div className={`
                        p-3 bg-gradient-to-br from-surface-highlight to-surface-main border border-border-subtle rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-500
                        ${color === 'emerald' ? 'text-status-success drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]' : ''}
                        ${color === 'indigo' ? 'text-accent-secondary drop-shadow-[0_0_12px_rgba(129,140,248,0.8)]' : ''}
                        ${color === 'blue' ? 'text-accent-primary drop-shadow-[0_0_12px_rgba(0,229,255,0.8)]' : ''}
                        ${color === 'amber' ? 'text-status-warning drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]' : ''}
                    `}>
                        <Icon size={22} strokeWidth={2}/>
                    </div>
                </div>
                
                <div className="flex items-center justify-between mt-auto">
                    <span className="text-[10px] font-[700] font-mono tracking-[0.2em]  text-text-muted/60">{sub}</span>
                    {trend && (
                        <span className={`text-[10px] lg:text-xs font-[700] flex items-center gap-1 ${color === 'emerald' ? 'text-status-success shadow-emerald-500/20' : 'text-text-muted'}`}>
                            {color === 'emerald' && <TrendingUp size={14} className="animate-pulse" />} {trend}
                        </span>
                    )}
                </div>
            </div>

            {/* Glowing Progress Line */}
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-transparent">
                <div 
                    className={`h-full transition-all duration-1000 ease-out 
                        ${color === 'emerald' ? 'bg-emerald-500 shadow-[0_0_10px_var(--color-status-success)]' : ''}
                        ${color === 'indigo' ? 'bg-indigo-500 shadow-[0_0_10px_var(--color-accent-secondary)]' : ''}
                        ${color === 'blue' ? 'bg-blue-500 shadow-[0_0_10px_var(--color-accent-primary)]' : ''}
                        ${color === 'amber' ? 'bg-amber-500 shadow-[0_0_10px_var(--color-status-warning)]' : ''}
                    `} 
                    style={{ width: `${progress !== undefined ? progress : 60}%` }}
                ></div>
            </div>
        </div>
    );
});

