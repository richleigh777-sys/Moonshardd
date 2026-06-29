import React, { useMemo } from 'react';
import { Sale, Customer } from '../../../types';
import { DollarSign, Users, Target, Activity } from 'lucide-react';

interface DashboardLiveMetricsProps {
    sales: Sale[];
    customers: Customer[];
}

export const DashboardLiveMetrics: React.FC<DashboardLiveMetricsProps> = ({ sales, customers }) => {
    const metrics = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayMs = today.getTime();

        const todaySales = sales.filter(s => s.timestamp >= todayMs);
        const approvedToday = todaySales.filter(s => s.status === 'Approved');
        const salesVolume = approvedToday.reduce((sum, s) => sum + (s.amount || 0), 0);

        const activeLeads = customers.filter(c => c.status !== 'Archived' && c.status !== 'Closed Won' && c.status !== 'Closed Lost').length;

        // Pipeline Stages calculation based on sales/customers
        const pipeline = {
            prospecting: customers.filter(c => c.pipelineStages?.some(s => s === 'Cold Lead' || s === 'Referral') || c.status === 'Prospect' || c.status === 'New Lead').length,
            negotiation: customers.filter(c => c.pipelineStages?.some(s => s === 'Pitching' || s === 'Rebuttal') || c.status === 'Pitching' || c.status === 'Negotiation').length,
            closed: sales.filter(s => s.status === 'Approved').length
        };

        return {
            salesVolume,
            salesCount: approvedToday.length,
            activeLeads,
            pipeline
        };
    }, [sales, customers]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-surface-main border border-border-subtle rounded-xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-semibold text-text-muted uppercase tracking-wider">Live Sales Volume</p>
                    <div className="bg-emerald-500/20 p-1.5 rounded-lg text-emerald-400">
                        <DollarSign className="w-5 h-5" />
                    </div>
                </div>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold text-text-primary">
                        ${metrics.salesVolume.toLocaleString()}
                    </h3>
                    <span className="text-xs font-medium text-emerald-400">Today</span>
                </div>
                <p className="text-xs text-text-muted mt-2">{metrics.salesCount} approved deals</p>
            </div>

            <div className="bg-surface-main border border-border-subtle rounded-xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-semibold text-text-muted uppercase tracking-wider">Active Leads</p>
                    <div className="bg-blue-500/20 p-1.5 rounded-lg text-blue-400">
                        <Users className="w-5 h-5" />
                    </div>
                </div>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold text-text-primary">
                        {metrics.activeLeads.toLocaleString()}
                    </h3>
                    <span className="text-xs font-medium text-blue-400">In System</span>
                </div>
                <p className="text-xs text-text-muted mt-2">Real-time DB sync</p>
            </div>

            <div className="bg-surface-main border border-border-subtle rounded-xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden group sm:col-span-2 lg:col-span-2">
                <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-semibold text-text-muted uppercase tracking-wider">Live Pipeline Stages</p>
                    <div className="bg-purple-500/20 p-1.5 rounded-lg text-purple-400 flex items-center gap-1 text-xs font-bold px-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                        SYNCED
                    </div>
                </div>
                <div className="flex items-end justify-between mt-auto gap-4">
                    <div className="flex-1">
                        <p className="text-xs text-text-muted mb-1">Prospecting</p>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-bold text-text-primary">{metrics.pipeline.prospecting}</span>
                        </div>
                        <div className="w-full bg-surface-alt h-1.5 rounded-full mt-2">
                            <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${Math.min(100, (metrics.pipeline.prospecting / 100) * 100)}%` }}></div>
                        </div>
                    </div>
                    <div className="flex-1">
                        <p className="text-xs text-text-muted mb-1">Negotiation</p>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-bold text-text-primary">{metrics.pipeline.negotiation}</span>
                        </div>
                        <div className="w-full bg-surface-alt h-1.5 rounded-full mt-2">
                            <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${Math.min(100, (metrics.pipeline.negotiation / 100) * 100)}%` }}></div>
                        </div>
                    </div>
                    <div className="flex-1">
                        <p className="text-xs text-text-muted mb-1">Closed Won</p>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-bold text-text-primary">{metrics.pipeline.closed}</span>
                        </div>
                        <div className="w-full bg-surface-alt h-1.5 rounded-full mt-2">
                            <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${Math.min(100, (metrics.pipeline.closed / 100) * 100)}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
