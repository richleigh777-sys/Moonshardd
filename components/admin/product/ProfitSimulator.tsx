
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
        <div className="pt-4 border-t border-border-subtle/50">
            <div className="flex justify-between text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">
                <span>Profit Margin</span>
                <span className={currentMargin < 20 ? 'text-red-500' : 'text-emerald-500'}>{currentMargin}%</span>
            </div>
            <div className="h-2 w-full bg-surface-alt rounded-full overflow-hidden mb-2">
                <div 
                    className={`h-full transition-all duration-500 ${currentMargin < 20 ? 'bg-red-500' : currentMargin < 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${Math.min(100, Math.max(0, currentMargin))}%` }}
                ></div>
            </div>
            <p className="text-xs font-black text-text-primary text-right flex items-center justify-end gap-1">
                <TrendingUp size={12} className="text-accent-primary"/> +${profitPerUnit.toFixed(2)} / unit
            </p>
        </div>
    );
};
