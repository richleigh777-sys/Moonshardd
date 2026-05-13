
import React, { useMemo } from 'react';
import { Sale } from '../../../types';
import { calculateUrgencyScore } from '../../../utils/ranking';
import { sfx } from '../../../lib/soundService';
import { ArrowUpRight, Clock, AlertTriangle, Phone } from 'lucide-react';

interface PipelineCardProps {
    sale: Sale;
    onOpen?: (s: Sale) => void;
    onDragStart?: (e: React.DragEvent, id: string) => void;
}

export const PipelineCard = React.memo(({ sale, onOpen, onDragStart }: PipelineCardProps) => {
  const urgency = calculateUrgencyScore(sale);
  const isHighUrgency = urgency > 30;
  
  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
        onDragStart(e, sale.id);
    } else {
        // Fallback for direct DOM usage
        e.dataTransfer.setData('saleId', sale.id);
        e.dataTransfer.effectAllowed = 'move';
        sfx.playHover();
    }
  };

  const [now] = React.useState(() => Date.now());

  const daysInStage = useMemo(() => {
      const diff = now - sale.timestamp;
      return Math.floor(diff / (1000 * 60 * 60 * 24));
  }, [sale.timestamp, now]);

  const isStagnant = daysInStage > 7;

  return (
    <div 
        draggable
        onDragStart={handleDragStart}
        className={`
            relative p-2.5 rounded-xl shadow-sm border cursor-grab active:cursor-grabbing transition-all duration-200 group transform-gpu select-none
            hover:-translate-y-0.5 hover:shadow-md
            ${isHighUrgency ? 'bg-amber-500/5 border-amber-500/30' : 'bg-surface-main border-border-subtle hover:border-accent-primary/40'}
            ${isStagnant && !isHighUrgency ? 'opacity-80' : 'opacity-100'}
        `}
    >
        {/* High Urgency Indicator Strip */}
        {isHighUrgency && (
            <div className="absolute left-0 top-2 bottom-2 w-1 bg-amber-500 rounded-r-full"></div>
        )}

        <div className={`flex flex-col gap-1.5 ${isHighUrgency ? 'pl-1.5' : ''}`}>
            
            {/* Header: Avatar & Name */}
            <div className="flex items-center justify-between mb-0">
                <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black shadow-sm border ${isHighUrgency ? 'bg-amber-500 text-white border-amber-600' : 'bg-surface-alt text-text-secondary border-border-subtle'}`}>
                        {sale.customer.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <span className="font-black text-[11px] text-text-primary truncate block leading-tight tracking-tight">
                            {sale.customer}
                        </span>
                        <span className="text-[8px] text-text-muted font-bold truncate block mt-0 opacity-80">
                            {sale.product}
                        </span>
                    </div>
                </div>
                {isHighUrgency && (
                    <div className="p-1 bg-amber-500/10 text-amber-500 rounded-md animate-pulse" title="High Urgency">
                        <AlertTriangle size={10}/>
                    </div>
                )}
            </div>
            
            {/* Footer: Value & Actions */}
            <div className="flex justify-between items-center border-t border-border-subtle/50 pt-2 mt-0.5 relative">
                <div className="flex flex-col">
                    <span className="text-[7px] font-black text-text-muted uppercase tracking-wider mb-0">Value</span>
                    <span className="font-mono font-black text-xs tracking-tight text-text-primary group-hover:text-accent-primary transition-colors">
                        ${Number(sale.amount).toLocaleString()}
                    </span>
                </div>
                
                <div className="flex items-center gap-1">
                    {/* Stagnation Badge */}
                    {isStagnant && (
                        <div className="flex items-center gap-1 px-1 py-0.5 bg-red-500/10 rounded border border-red-500/20" title={`${daysInStage} days inactive`}>
                            <Clock size={8} className="text-red-500"/>
                            <span className="text-[8px] font-black text-red-500">{daysInStage}d</span>
                        </div>
                    )}
                    
                    {/* Hover Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 bg-surface-main pl-1.5">
                        {sale.phone && (
                            <button className="p-1 rounded-md hover:bg-surface-alt text-text-muted hover:text-emerald-500 border border-transparent hover:border-border-subtle transition-all" title="Call">
                                <Phone size={10}/>
                            </button>
                        )}
                        {onOpen && (
                            <button 
                                onClick={() => { sfx.playClick(); onOpen(sale); }}
                                className="p-1 rounded-md bg-surface-alt text-text-muted hover:bg-accent-primary hover:text-white transition-all shadow-sm border border-border-subtle hover:border-transparent"
                                title="View Details"
                            >
                                <ArrowUpRight size={12} strokeWidth={3} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
});
