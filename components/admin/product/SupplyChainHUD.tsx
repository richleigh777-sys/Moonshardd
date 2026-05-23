
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
            <Card variant="panel" className="p-4 flex items-center justify-between bg-surface-main border-border-subtle hover:border-status-success/30 transition-colors group">
                <div>
                    <p className="text-xs font-[700]  text-text-muted tracking-widest mb-1">Asset Valuation</p>
                    <p className="text-2xl font-[700] text-text-primary num-font tracking-tight group-hover:text-status-success transition-colors">
                        ${stats.totalValue.toLocaleString()}
                    </p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-2xl text-status-success border border-emerald-500/20">
                    <DollarSign size={20} strokeWidth={2.5}/>
                </div>
            </Card>
            
            <Card variant="panel" className="p-4 flex items-center justify-between bg-surface-main border-border-subtle hover:border-status-warning/30 transition-colors group">
                <div>
                    <p className="text-xs font-[700]  text-text-muted tracking-widest mb-1">Portfolio Health</p>
                    <p className="text-2xl font-[700] text-text-primary num-font tracking-tight group-hover:text-status-warning transition-colors">
                        {stats.avgMargin}% <span className="text-xs text-text-muted font-bold">AVG MARGIN</span>
                    </p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-2xl text-status-warning border border-amber-500/20">
                    <BarChart3 size={20} strokeWidth={2.5}/>
                </div>
            </Card>
            
            <Card variant="panel" className="p-4 flex items-center justify-between bg-surface-main border-border-subtle hover:border-status-error/30 transition-colors group">
                <div>
                    <p className="text-xs font-[700]  text-text-muted tracking-widest mb-1">Stock Alerts</p>
                    <p className="text-2xl font-[700] text-text-primary num-font tracking-tight group-hover:text-status-error transition-colors">
                        {stats.lowStockCount} <span className="text-xs text-text-muted font-bold">CRITICAL</span>
                    </p>
                </div>
                <div className="p-3 bg-red-500/10 rounded-2xl text-status-error border border-red-500/20">
                    <AlertTriangle size={20} strokeWidth={2.5}/>
                </div>
            </Card>
        </div>
    );
};
