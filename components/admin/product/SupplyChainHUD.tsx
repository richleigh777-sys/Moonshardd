
import React from 'react';
import { DollarSign, BarChart3, TrendingUp, AlertCircle, Box } from 'lucide-react';
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0 mb-4">
            <Card variant="panel" className="p-5 flex flex-col justify-between bg-surface-main relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    <DollarSign size={80} strokeWidth={1} />
                </div>
                <div className="flex justify-between items-start relative z-10 mb-4">
                    <p className="text-[12px] font-bold text-text-muted uppercase tracking-widest">Asset Valuation</p>
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-status-success border border-emerald-500/20">
                        <DollarSign size={16} strokeWidth={2.5}/>
                    </div>
                </div>
                <p className="text-3xl font-medium text-text-primary num-font tracking-tight relative z-10">
                    ${stats.totalValue.toLocaleString()}
                </p>
                <div className="mt-2 text-xs font-bold text-status-success flex items-center gap-1 relative z-10 bg-emerald-500/10 w-fit px-2 py-1 rounded">
                    <TrendingUp size={12} /> +2.4% MoM
                </div>
            </Card>

            <Card variant="panel" className="p-5 flex flex-col justify-between bg-surface-main relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    <BarChart3 size={80} strokeWidth={1} />
                </div>
                <div className="flex justify-between items-start relative z-10 mb-4">
                    <p className="text-[12px] font-bold text-text-muted uppercase tracking-widest">Avg Portfolio Margin</p>
                    <div className="p-2 bg-accent-primary/10 rounded-lg text-accent-primary border border-accent-primary/20">
                        <BarChart3 size={16} strokeWidth={2.5}/>
                    </div>
                </div>
                <p className="text-3xl font-medium text-text-primary num-font tracking-tight relative z-10">
                    {stats.avgMargin}%
                </p>
                <div className="mt-2 text-xs font-bold text-text-muted flex items-center gap-1 relative z-10">
                    Healthy Distribution
                </div>
            </Card>

            <Card variant="panel" className="p-5 flex flex-col justify-between bg-surface-main relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    <Box size={80} strokeWidth={1} />
                </div>
                <div className="flex justify-between items-start relative z-10 mb-4">
                    <p className="text-[12px] font-bold text-text-muted uppercase tracking-widest">Total Active SKUs</p>
                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500 border border-indigo-500/20">
                        <Box size={16} strokeWidth={2.5}/>
                    </div>
                </div>
                <p className="text-3xl font-medium text-text-primary num-font tracking-tight relative z-10">
                    {stats.totalValue > 0 ? "70" : "0"} {/* Mocked total items */}
                </p>
                <div className="mt-2 text-xs font-bold text-text-muted flex items-center gap-1 relative z-10">
                    Across 5 Categories
                </div>
            </Card>
            
            <Card variant="panel" className="p-5 flex flex-col justify-between bg-surface-main border-status-error/30 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    <AlertCircle size={80} strokeWidth={1} />
                </div>
                <div className="flex justify-between items-start relative z-10 mb-4">
                    <p className="text-[12px] font-bold text-status-error uppercase tracking-widest">Low Stock Alerts</p>
                    <div className="p-2 bg-red-500/10 rounded-lg text-status-error border border-red-500/20">
                        <AlertCircle size={16} strokeWidth={2.5}/>
                    </div>
                </div>
                <p className="text-3xl font-medium text-status-error num-font tracking-tight relative z-10">
                    {stats.lowStockCount}
                </p>
                <div className="mt-2 text-xs font-bold text-status-error flex items-center gap-1 relative z-10 bg-red-500/10 w-fit px-2 py-1 rounded">
                    Requires Attention
                </div>
            </Card>
        </div>
    );
};
