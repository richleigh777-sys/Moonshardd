
import React from 'react';
import { Minus, X } from 'lucide-react';

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
    title, subTitle, children, status = 'IDLE', className = "", 
    onClose, onMinimize, headerAction 
}) => {
    
    const getStatusColor = () => {
        switch(status) {
            case 'ACTIVE': return 'bg-emerald-500';
            case 'ERROR': return 'bg-rose-500';
            case 'OFFLINE': return 'bg-slate-400';
            default: return 'bg-amber-500';
        }
    };

    return (
        <div className={`flex flex-col h-full bg-surface-widget border border-border-subtle rounded-xl overflow-hidden shadow-panel relative ${className}`}>
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-border-subtle bg-surface-main relative z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
                             <span className="text-sm font-semibold text-text-primary leading-none">{title}</span>
                        </div>
                        {subTitle && <span className="text-xs text-text-muted mt-1">{subTitle}</span>}
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    {headerAction}
                    {(onClose || onMinimize) && (
                        <div className="flex gap-1">
                            {onMinimize && <button onClick={onMinimize} className="p-1.5 hover:bg-surface-highlight rounded-md text-text-muted transition-colors"><Minus size={14}/></button>}
                            {onClose && <button onClick={onClose} className="p-1.5 hover:bg-rose-500/10 hover:text-rose-500 rounded-md text-text-muted transition-colors"><X size={14}/></button>}
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 relative z-10 overflow-hidden flex flex-col min-h-0">
                {children}
            </div>
        </div>
    );
};

