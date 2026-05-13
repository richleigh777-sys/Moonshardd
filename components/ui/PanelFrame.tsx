
import React from 'react';
import { Minus, X, Activity, Wifi } from 'lucide-react';

interface TerminalWindowProps {
    title: string;
    subTitle?: string;
    children: React.ReactNode;
    status?: 'IDLE' | 'ACTIVE' | 'ERROR' | 'OFFLINE';
    latency?: number;
    className?: string;
    onClose?: () => void;
    onMinimize?: () => void;
    headerAction?: React.ReactNode;
}

export const PanelFrame: React.FC<TerminalWindowProps> = ({ 
    title, subTitle, children, status = 'IDLE', latency = 24, className = "", 
    onClose, onMinimize, headerAction 
}) => {
    
    const getStatusColor = () => {
        switch(status) {
            case 'ACTIVE': return 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10';
            case 'ERROR': return 'text-rose-500 bg-rose-500/5 border-rose-500/10';
            case 'OFFLINE': return 'text-slate-500 bg-slate-500/5 border-slate-500/10';
            default: return 'text-amber-500 bg-amber-500/5 border-amber-500/10';
        }
    };

    return (
        <div className={`flex flex-col h-full bg-surface-main border border-border-subtle rounded-[1.25rem] overflow-hidden shadow-panel relative group ${className}`}>
            {/* Soft Glow Effect */}
            <div className="absolute -inset-px bg-gradient-to-br from-accent-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            
            {/* Header */}
            <div className="flex justify-between items-center px-3 py-2 border-b border-border-subtle bg-surface-alt/30 backdrop-blur-md relative z-10 shrink-0">
                <div className="flex items-center gap-2">
                    <div className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border flex items-center gap-1 ${getStatusColor()}`}>
                        <Activity size={8} className={status === 'ACTIVE' ? 'animate-pulse' : ''}/>
                        {status}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-text-primary uppercase tracking-tight leading-none">{title}</span>
                        {subTitle && <span className="text-[7px] font-mono text-text-muted uppercase tracking-wider mt-0.5">{subTitle}</span>}
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    {headerAction}
                    <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-surface-main/50 rounded-md border border-border-subtle text-[8px] font-mono text-text-muted">
                        <Wifi size={8} className="text-accent-primary/60"/> {latency}ms
                    </div>
                    {(onClose || onMinimize) && (
                        <div className="flex gap-1 ml-1">
                            {onMinimize && <button onClick={onMinimize} className="p-1 hover:bg-surface-highlight rounded-md text-text-muted transition-colors"><Minus size={10}/></button>}
                            {onClose && <button onClick={onClose} className="p-1 hover:bg-rose-500/10 hover:text-rose-500 rounded-md text-text-muted transition-colors"><X size={10}/></button>}
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 relative z-10 overflow-hidden flex flex-col min-h-0 bg-transparent">
                {children}
            </div>
        </div>
    );
};
