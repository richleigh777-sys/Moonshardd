
import React from 'react';
import { sfx } from '../../../lib/soundService';

interface ConfigToggleProps {
    label: string;
    active: boolean;
    onToggle: () => void;
    description?: string;
    danger?: boolean;
    icon?: any;
}

export const ConfigToggle: React.FC<ConfigToggleProps> = ({ label, active, onToggle, description, danger = false, icon: Icon }) => (
  <div 
    className={`
        relative group flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden
        ${active 
            ? (danger 
                ? 'bg-red-500/10 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)]' 
                : 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]') 
            : 'bg-surface-main/40 border-border-subtle hover:bg-surface-alt hover:border-border-subtle/80'}
    `} 
    onClick={(e) => { e.preventDefault(); onToggle(); sfx.playClick(); }}
  >
    {/* Active Glow Background */}
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-r ${danger ? 'from-red-500/5' : 'from-emerald-500/5'} to-transparent`} />

    <div className="flex items-start gap-4 relative z-10">
      <div className={`
          p-3 rounded-xl border transition-all duration-300 shadow-inner
          ${active 
            ? (danger ? 'bg-red-500 text-white border-red-400' : 'bg-emerald-500 text-white border-emerald-400') 
            : 'bg-surface-alt text-text-muted border-border-subtle group-hover:text-text-primary'}
      `}>
          {Icon ? <Icon size={18} strokeWidth={2.5} /> : <div className="w-4.5 h-4.5" />}
      </div>
      
      <div className="flex flex-col">
        <span className={`font-black text-xs uppercase tracking-wider transition-colors ${active ? 'text-text-primary' : 'text-text-secondary'}`}>
            {label}
        </span>
        {description && <span className="text-[10px] text-text-muted font-medium mt-1 opacity-80 leading-relaxed max-w-sm">{description}</span>}
      </div>
    </div>
    
    <div className={`
        relative w-12 h-7 rounded-full transition-all duration-300 shrink-0 shadow-inner border
        ${active 
            ? (danger ? 'bg-red-900/50 border-red-500' : 'bg-emerald-900/50 border-emerald-500') 
            : 'bg-surface-alt/50 border-border-subtle'}
    `}>
        <div className={`
            absolute top-1 w-4.5 h-4.5 rounded-full shadow-md transition-all duration-300 flex items-center justify-center
            ${active 
                ? (danger ? 'left-6 bg-red-400' : 'left-6 bg-emerald-400') 
                : 'left-1 bg-text-muted/50'}
        `}>
            {active && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
        </div>
    </div>
  </div>
);
