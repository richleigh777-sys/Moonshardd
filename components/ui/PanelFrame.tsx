
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
            case 'ACTIVE': return 'text-status-success bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]';
            case 'ERROR': return 'text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)]';
            case 'OFFLINE': return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
            default: return 'text-status-warning bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]';
        }
    };

    return (
        <div className={`flex flex-col h-full bg-surface-main/90 border border-border-subtle rounded-[1.25rem] overflow-hidden shadow-panel relative group backdrop-blur-3xl ${className}`}>
            {/* Background Grid & Glow */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-50"></div>
            <div className="absolute -inset-px bg-gradient-to-br from-indigo-500/5 via-transparent to-accent-primary/5 dark:from-indigo-500/10 dark:to-accent-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-border-subtle bg-surface-alt backdrop-blur-md relative z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className={`px-2.5 py-1 rounded-md text-[10px] font-[700]  tracking-[0.2em] border flex items-center gap-1.5 transition-all ${getStatusColor()}`}>
                        <Activity size={14} className={status === 'ACTIVE' ? 'animate-pulse' : ''} />
                        {status}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-[700] text-text-primary  tracking-widest leading-none drop-shadow-md">{title}</span>
                        {subTitle && <span className="text-[10px] font-mono text-text-muted  tracking-wider mt-1">{subTitle}</span>}
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    {headerAction}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-alt rounded-md border border-border-subtle text-[10px] font-mono font-bold text-text-muted">
                        <Wifi size={14} className="text-status-success/80"/> {latency}ms
                    </div>
                    {(onClose || onMinimize) && (
                        <div className="flex gap-1">
                            {onMinimize && <button onClick={onMinimize} className="p-1.5 hover:bg-[#EAE5D9] dark:hover:bg-surface-highlight rounded-md text-text-muted hover:text-text-primary transition-colors"><Minus size={14}/></button>}
                            {onClose && <button onClick={onClose} className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-500/20 hover:text-rose-500 dark:hover:text-rose-400 rounded-md text-text-muted transition-colors"><X size={14}/></button>}
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
