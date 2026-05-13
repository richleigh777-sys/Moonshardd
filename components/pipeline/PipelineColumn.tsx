
import React from 'react';
import { Sale, PipelineStage } from '../../types';
import { Badge } from '../../components/ui/Base';
import { PipelineCard } from './PipelineCard';
import { User, Calendar, Clock, TrendingUp, RefreshCw, AlertCircle, DollarSign, Layers, ArrowDown } from 'lucide-react';

interface PipelineColumnProps {
    stage: string;
    sales: Sale[];
    totalValue: number;
    focusMode: boolean;
    isDragOver: boolean;
    onDrop: (e: React.DragEvent, stage: PipelineStage) => void;
    onDragOver: (e: React.DragEvent, stage: string) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDragStart: (e: React.DragEvent, id: string) => void;
    onProcessSale?: (sale: Sale) => void;
}

const STAGE_CONFIG: Record<string, { color: string, bg: string, label: string, icon: any, strategy: string, accent: string }> = {
    'New': { color: 'text-blue-400', bg: 'bg-blue-500/10', accent: 'border-blue-500/20', label: 'Fresh Leads', icon: User, strategy: 'Speed: Contact < 5m.' },
    'Callback Scheduled': { color: 'text-amber-400', bg: 'bg-amber-500/10', accent: 'border-amber-500/20', label: 'Scheduled', icon: Calendar, strategy: 'Precision: Be on time.' },
    'Contacted – No Answer': { color: 'text-slate-400', bg: 'bg-slate-500/10', accent: 'border-slate-500/20', label: 'No Contact', icon: Clock, strategy: 'Persistence: Vary times.' },
    'Contacted – Interested': { color: 'text-violet-400', bg: 'bg-violet-500/10', accent: 'border-violet-500/20', label: 'Interested', icon: TrendingUp, strategy: 'Education: Value prop.' },
    'Contacted – Not Now': { color: 'text-slate-500', bg: 'bg-slate-500/10', accent: 'border-slate-500/20', label: 'Paused', icon: Clock, strategy: 'Nurture: Keep warm.' },
    'Reorder Candidate': { color: 'text-emerald-400', bg: 'bg-emerald-500/10', accent: 'border-emerald-500/20', label: 'Renewals', icon: RefreshCw, strategy: 'Growth: Cross-sell.' },
    'Declined': { color: 'text-red-400', bg: 'bg-red-500/10', accent: 'border-red-500/20', label: 'Rescue Ops', icon: AlertCircle, strategy: 'Defense: Secure funds.' },
    'Closed': { color: 'text-indigo-400', bg: 'bg-indigo-500/10', accent: 'border-indigo-500/20', label: 'Closed Won', icon: DollarSign, strategy: 'Support: Relationship.' },
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
};

export const PipelineColumn = React.memo<PipelineColumnProps>(({ 
    stage, sales, totalValue, focusMode, isDragOver, 
    onDrop, onDragOver, onDragLeave, onDragStart, onProcessSale 
}) => {
    
    if (focusMode && sales.length === 0 && !isDragOver) return null;

    const config = STAGE_CONFIG[stage] || STAGE_CONFIG['New'];
    const StageIcon = config.icon;
    const volumeIntensity = Math.min(100, (totalValue / 10000) * 100);

    return (
        <div 
            className={`
                flex-shrink-0 w-72 flex flex-col h-full snap-center rounded-[1.25rem] transform-gpu transition-all duration-200
                ${isDragOver 
                    ? `bg-accent-primary/10 ring-2 ring-accent-primary/50 scale-[1.01] shadow-xl z-20` 
                    : 'bg-surface-main/40 border border-border-subtle hover:bg-surface-main/60'
                }
            `}
            onDrop={(e) => onDrop(e, stage as PipelineStage)}
            onDragOver={(e) => onDragOver(e, stage)}
            onDragLeave={onDragLeave}
        >
            <div className="mb-1.5 p-1.5 sticky top-0 z-20 bg-inherit backdrop-blur-sm rounded-t-[1.25rem]">
                <div className={`p-2.5 rounded-xl border ${config.bg} ${config.accent} backdrop-blur-md shadow-sm relative overflow-hidden transition-all group`}>
                    <div className="flex justify-between items-center mb-1.5 relative z-10">
                        <div className="flex items-center gap-2">
                            <div className={`p-1 rounded-lg bg-surface-main/80 backdrop-blur-sm ${config.color} shadow-sm`}>
                                <StageIcon size={12} strokeWidth={3} />
                            </div>
                            <h3 className={`text-[11px] font-black uppercase tracking-tight ${config.color} truncate max-w-[110px]`}>
                                {stage}
                            </h3>
                        </div>
                        <Badge status="Mid" className="shadow-none bg-surface-main/50 border-transparent text-[10px] font-black px-1.5 py-0 h-auto min-w-[20px] justify-center">
                            {sales.length}
                        </Badge>
                    </div>

                    <div className="flex justify-between items-end relative z-10 pl-0.5">
                        <p className="text-[9px] font-bold text-text-muted/80 truncate max-w-[130px] opacity-80">
                            {config.strategy}
                        </p>
                        <div className="text-[10px] font-black text-text-primary bg-surface-main/40 px-1.5 py-0.5 rounded border border-white/5 num-font">
                            {formatCurrency(totalValue)}
                        </div>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 h-0.5 bg-current opacity-20 w-full">
                        <div 
                            className="h-full bg-current opacity-60 transition-all duration-1000 ease-out" 
                            style={{ width: `${volumeIntensity}%` }}
                        ></div>
                    </div>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2.5 custom-scrollbar min-h-[100px]">
                {sales.map(sale => (
                    <PipelineCard 
                        key={sale.id} 
                        sale={sale} 
                        onOpen={onProcessSale} 
                        onDragStart={onDragStart}
                    />
                ))}
                
                {(sales.length === 0 || isDragOver) && (
                    <div className={`
                        h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-text-muted transition-all duration-300
                        ${isDragOver 
                            ? 'border-accent-primary/50 bg-accent-primary/5 opacity-100 scale-100' 
                            : 'border-border-subtle/40 opacity-40 scale-95'
                        }
                    `}>
                        {isDragOver ? (
                            <div className="flex flex-col items-center animate-bounce">
                                <ArrowDown size={24} className="mb-2 text-accent-primary"/>
                                <span className="text-[9px] font-black uppercase tracking-widest text-accent-primary">Release to Move</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <Layers size={24} className="mb-2 opacity-50"/>
                                <span className="text-[9px] font-black uppercase tracking-widest">No Active Deals</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});
