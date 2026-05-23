
import React from 'react';
import { Zap } from 'lucide-react';

interface StockReactorProps {
    stock: number;
    volume: number;
    maxStock?: number;
    health: 'CRITICAL' | 'LOW' | 'OPTIMAL';
}

export const StockReactor: React.FC<StockReactorProps> = ({ stock, volume, maxStock = 200, health }) => {
    const stockPercent = Math.min(100, Math.max(0, (stock / maxStock) * 100)); 
    const segments = 10;
    const activeSegments = Math.ceil(stockPercent / 10);

    const getHealthColor = () => {
        if (health === 'CRITICAL') return 'bg-red-500';
        if (health === 'LOW') return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    return (
        <div className="mt-5 pt-4 border-t border-border-subtle/50 relative z-10 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold  tracking-wider">
                <div className="flex flex-col">
                    <span className="text-text-muted mb-0.5">Stock Level</span>
                    <span className={`${stock < 10 ? 'text-status-error' : 'text-text-primary'} font-[700]`}>{stock} Units</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-text-muted mb-0.5">Velocity</span>
                    <span className="text-accent-secondary font-[700] flex items-center gap-1"><Zap size={16} fill="currentColor"/> {volume}</span>
                </div>
            </div>
            
            {/* Segmented Bar */}
            <div className="flex gap-0.5 h-1.5 w-full">
                {[...Array(segments)].map((_, i) => (
                    <div 
                        key={i} 
                        className={`flex-1 rounded-sm transition-all duration-500 ${i < activeSegments ? getHealthColor() : 'bg-surface-alt'}`}
                        style={{ opacity: i < activeSegments ? 1 : 0.3 }}
                    ></div>
                ))}
            </div>
        </div>
    );
};
