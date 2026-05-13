
import React from 'react';
import { DollarSign, BarChart3, AlertTriangle } from 'lucide-react';
import { Card } from '../../ui/Base';

interface SupplyChainHUDProps {
    stats: {
        totalValue: number;
        avgMargin: number;
        lowStockCount: number;
    };
}

export const SupplyChainHUD: React.FC<SupplyChainHUDProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
            <Card variant="panel" className="p-4 flex items-center justify-between bg-surface-main border-border-subtle hover:border-emerald-500/30 transition-colors group">
                <div>
                    <p className="text-[10px] font-black uppercase text-text-muted tracking-widest mb-1">Asset Valuation</p>
                    <p className="text-2xl font-black text-text-primary num-font tracking-tight group-hover:text-emerald-500 transition-colors">
                        ${stats.totalValue.toLocaleString()}
                    </p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 border border-emerald-500/20">
                    <DollarSign size={20} strokeWidth={2.5}/>
                </div>
            </Card>
            
            <Card variant="panel" className="p-4 flex items-center justify-between bg-surface-main border-border-subtle hover:border-amber-500/30 transition-colors group">
                <div>
                    <p className="text-[10px] font-black uppercase text-text-muted tracking-widest mb-1">Portfolio Health</p>
                    <p className="text-2xl font-black text-text-primary num-font tracking-tight group-hover:text-amber-500 transition-colors">
                        {stats.avgMargin}% <span className="text-xs text-text-muted font-bold">AVG MARGIN</span>
                    </p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 border border-amber-500/20">
                    <BarChart3 size={20} strokeWidth={2.5}/>
                </div>
            </Card>
            
            <Card variant="panel" className="p-4 flex items-center justify-between bg-surface-main border-border-subtle hover:border-red-500/30 transition-colors group">
                <div>
                    <p className="text-[10px] font-black uppercase text-text-muted tracking-widest mb-1">Stock Alerts</p>
                    <p className="text-2xl font-black text-text-primary num-font tracking-tight group-hover:text-red-500 transition-colors">
                        {stats.lowStockCount} <span className="text-xs text-text-muted font-bold">CRITICAL</span>
                    </p>
                </div>
                <div className="p-3 bg-red-500/10 rounded-2xl text-red-500 border border-red-500/20">
                    <AlertTriangle size={20} strokeWidth={2.5}/>
                </div>
            </Card>
        </div>
    );
};
