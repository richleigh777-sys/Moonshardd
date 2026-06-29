
import React from 'react';
import { TrendingUp } from 'lucide-react';
import { calculateMargin } from '../../../utils/productMath';

interface ProfitSimulatorProps {
    price: number;
    cost: number;
}

export const ProfitSimulator: React.FC<ProfitSimulatorProps> = ({ price, cost }) => {
    const currentMargin = calculateMargin(price, cost);
    const profitPerUnit = price - cost;

    return (
        <div className="pt-2">
            <div className="flex justify-between items-end mb-4 border-b border-border-strong pb-4">
                <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-text-muted block mb-1">Target Margin</span>
                    <span className={`text-5xl font-bold num-font tracking-tighter ${currentMargin < 20 ? 'text-status-error' : currentMargin < 40 ? 'text-status-warning' : 'text-status-success'}`}>{currentMargin}%</span>
                </div>
                 <p className="text-sm font-bold text-text-primary text-right flex flex-col justify-end gap-1 pb-1">
                    <span className="text-[10px] uppercase text-text-muted tracking-widest">Theoretical Profit Yield</span>
                    <span className="flex items-center gap-1 text-accent-primary bg-accent-primary/10 px-2 py-1 rounded w-fit self-end">
                       <TrendingUp size={14} className="text-accent-primary"/> +${profitPerUnit.toFixed(2)} / unit
                    </span>
                </p>
            </div>
            
            <div className="space-y-2 mt-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Margin Distribution Tracker</span>
                <div className="h-4 w-full bg-surface-alt rounded-full overflow-hidden border border-border-strong shadow-inner">
                    <div 
                        className={`h-full transition-all duration-1000 ease-out relative ${currentMargin < 20 ? 'bg-red-500' : currentMargin < 40 ? 'bg-amber-500' : 'bg-status-success'}`} 
                        style={{ width: `${Math.min(100, Math.max(0, currentMargin))}%` }}
                    >
                        <div className="absolute inset-0 bg-white/20 -skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
                    </div>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-text-muted font-bold pt-1">
                    <span>0% (Loss)</span>
                    <span>100% (Pure)</span>
                </div>
            </div>
        </div>
    );
};
