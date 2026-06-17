
import React, { useState, useMemo, useEffect } from 'react';
import { Sale, User, AttendanceRecord } from '../../types';
import { filterSalesByDate, calculateSalePayout, getDailyHours, exportToCSV } from '../../views/utils/crmLogic';
import { 
    Activity, Target, ChevronDown, ChevronRight, Filter, Download, RefreshCw
} from 'lucide-react';
import { useCRM } from '../../hooks/useCRM';
import { KPIGrid } from './performance/KPIGrid';
import { GeoIntelWidget } from './performance/GeoIntelWidget';
import { PayoutManifest } from './performance/PayoutManifest';
import { OpportunityRadar } from './OpportunityRadar';
import { PipelineVelocityChart } from './PipelineVelocityChart';
import { SalesHistoryChart } from './SalesHistoryChart';
import { Card, Button } from '../ui/Base';
import { sfx } from '../../lib/soundService';

interface PerformanceCenterProps {
    sales: Sale[];
    currentUser: User;
    attendance: AttendanceRecord[];
    users?: User[]; 
}

export const PerformanceCenter: React.FC<PerformanceCenterProps> = ({ sales, currentUser, attendance, users = [] }) => {
    const { systemConfig } = useCRM();
    const now = new Date();
    const [selectedMonth] = useState(now.getMonth());
    const [selectedYear] = useState(now.getFullYear());
    const [activePeriod, setActivePeriod] = useState<'Today' | 'Week' | '1' | '2' | 'MTD'>('MTD');
    
    const isSuperAdmin = (currentUser.level || currentUser.accessLevel || 0) >= 10;
    const isAdmin = currentUser.role === 'admin';
    const [selectedTeam, setSelectedTeam] = useState<string>('All');
    const [targetAgentId, setTargetAgentId] = useState<string>(isAdmin ? 'all' : currentUser.id);
    const [showManifest, setShowManifest] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        if (!isAdmin && targetAgentId !== currentUser.id) {
            setTimeout(() => setTargetAgentId(currentUser.id), 0);
        }
    }, [isAdmin, targetAgentId, currentUser.id]);

    const filteredAgents = useMemo(() => {
        if (selectedTeam === 'All') return users.filter(u => u.role === 'agent');
        return users.filter(u => u.role === 'agent' && u.team === selectedTeam);
    }, [users, selectedTeam]);

    const uniqueTeams = useMemo(() => Array.from(new Set(users.filter(u => u.role === 'agent').map(u => u.team || 'Alpha'))), [users]);

    const periodStats = useMemo(() => {
        const now = new Date();
        let periodSales = [];
        
        if (activePeriod === 'Today') {
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            periodSales = sales.filter(s => s.timestamp >= startOfDay);
        } else if (activePeriod === 'Week') {
            const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).setHours(0,0,0,0);
            periodSales = sales.filter(s => s.timestamp >= startOfWeek);
        } else {
            periodSales = filterSalesByDate(sales, selectedMonth, selectedYear, activePeriod as '1'|'2'|'MTD');
        }
        
        if (!isAdmin) {
            periodSales = periodSales.filter(s => s.agentId === currentUser.id);
        } else if (targetAgentId !== 'all') {
            periodSales = periodSales.filter(s => s.agentId === targetAgentId);
        } else if (selectedTeam !== 'All') {
            const teamAgentIds = new Set(filteredAgents.map(u => u.id));
            periodSales = periodSales.filter(s => teamAgentIds.has(s.agentId));
        }

        const approved = periodSales.filter(s => s.status === 'Approved');
        const totalRevenue = approved.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
        
        const manifest = approved.map(sale => {
            const dailyHours = getDailyHours(sale.agentId, sale.timestamp, attendance);
            const payout = calculateSalePayout(sale, dailyHours, systemConfig, users.find(u => u.id === sale.agentId)?.commissionRate);
            return {
                sale,
                payout,
                timestamp: sale.timestamp
            };
        }).sort((a,b) => b.timestamp - a.timestamp);

        const totalEarnings = manifest.reduce((acc, curr) => acc + curr.payout.net, 0);
        const totalSpiffs = manifest.reduce((acc, curr) => acc + curr.payout.spiff, 0);
        const winRate = periodSales.length > 0 ? (approved.length / (approved.length + periodSales.filter(s => s.status === 'Declined').length)) * 100 : 0;
        const avgOrder = approved.length > 0 ? totalRevenue / approved.length : 0;

        return { 
            sales: periodSales, 
            approved, 
            manifest, 
            totalRevenue, 
            totalEarnings, 
            totalSpiffs,
            winRate,
            avgOrder
        };
    }, [sales, selectedMonth, selectedYear, activePeriod, targetAgentId, selectedTeam, filteredAgents, isAdmin, currentUser.id, attendance, systemConfig, users]);

    const geoData = useMemo(() => {
        const stateMap: Record<string, number> = {};
        const cityMap: Record<string, number> = {};
        let totalUniqueLocations = 0;

        periodStats.approved.forEach(sale => {
            const addr = sale.address || sale.billingAddress || '';
            const stateZipRegex = /\b([A-Z]{2})\s+\d{5}\b/;
            const match = addr.match(stateZipRegex);

            if (match) {
                const stateCode = match[1];
                stateMap[stateCode] = (stateMap[stateCode] || 0) + 1;
                const parts = addr.split(stateCode);
                if (parts.length > 0) {
                    const cityPart = parts[0].trim().split(',').pop()?.trim() || 'Unknown';
                    const cityKey = `${cityPart}, ${stateCode}`;
                    cityMap[cityKey] = (cityMap[cityKey] || 0) + 1;
                }
            } else {
                const parts = addr.split(',');
                if (parts.length >= 2) {
                    const statePart = parts[parts.length - 2]?.trim().split(' ')[0];
                    if (statePart && statePart.length === 2) {
                        stateMap[statePart] = (stateMap[statePart] || 0) + 1;
                    }
                }
            }
        });

        totalUniqueLocations = Object.keys(cityMap).length;

        const topStates = Object.entries(stateMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        const topCities = Object.entries(cityMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        return { topStates, topCities, totalUniqueLocations };
    }, [periodStats.approved]);

    const nexusScore = useMemo(() => {
        const normRev = Math.min(periodStats.totalRevenue / 15000, 1) * 45; 
        const normWin = (periodStats.winRate / 100) * 35; 
        const normAOV = Math.min(periodStats.avgOrder / 1200, 1) * 20; 
        return Math.round(normRev + normWin + normAOV);
    }, [periodStats]);

    const getGrade = (score: number) => {
        if (score >= 90) return { label: 'S', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' };
        if (score >= 75) return { label: 'A', color: 'text-status-success', bg: 'bg-emerald-500/10', border: 'border-status-success/30' };
        if (score >= 60) return { label: 'B', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
        if (score >= 40) return { label: 'C', color: 'text-status-warning', bg: 'bg-amber-500/10', border: 'border-status-warning/30' };
        return { label: 'D', color: 'text-status-error', bg: 'bg-red-500/10', border: 'border-status-error/30' };
    };
    
    const grade = getGrade(nexusScore);

    const handleExportReport = () => {
        setIsExporting(true);
        sfx.playSubmit();
        
        const reportData = periodStats.sales.map(s => ({
            Date: new Date(s.timestamp).toLocaleDateString(),
            Time: new Date(s.timestamp).toLocaleTimeString(),
            Agent: s.agent,
            Customer: s.customer,
            Product: s.product,
            Amount: s.amount,
            Status: s.status,
            Pipeline: s.pipelineStatus
        }));

        setTimeout(() => {
            exportToCSV(reportData, `Performance_Report_${activePeriod}_${new Date().toISOString().split('T')[0]}`);
            setIsExporting(false);
            sfx.playSuccess();
        }, 800);
    };

    return (
        <div className="flex flex-col gap-4 animate-in fade-in duration-700 w-full overflow-visible pb-12">
            {/* EXECUTIVE TOOLBAR */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-surface-main p-5 rounded-[2rem] border border-border-subtle shadow-soft relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Activity size={100} />
                </div>

                <div className="flex items-center gap-5 relative z-10">
                    <div className="p-3 bg-surface-alt rounded-xl text-text-primary border border-border-subtle shadow-sm group hover:scale-105 transition-transform duration-300">
                        <Activity size={24} strokeWidth={2} className="text-accent-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-[700] text-text-primary tracking-tight flex items-center gap-2">
                            Performance Intelligence
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs font-bold text-text-muted  tracking-widest flex items-center gap-1.5">
                                Data Source:
                                <span className="text-accent-primary bg-accent-primary/5 px-2.5 py-1 rounded border border-accent-primary/10">
                                    {isAdmin ? (targetAgentId === 'all' ? 'Organization Wide' : 'Agent Focus') : 'Personal Ledger'}
                                </span>
                            </span>
                            <span className="text-xs font-bold text-status-success  tracking-widest flex items-center gap-1 bg-emerald-500/5 px-2.5 py-1 rounded border border-emerald-500/10">
                                <RefreshCw size={16} className="animate-spin-slow"/> Live Sync
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 relative z-10">
                    {isAdmin && (
                        <div className="flex items-center gap-2 bg-surface-alt p-1 rounded-xl border border-border-subtle shadow-inner">
                             <div className="pl-3 pr-2 border-r border-border-subtle">
                                <Filter size={16} className="text-text-muted" />
                             </div>
                            <select 
                                value={selectedTeam} 
                                onChange={(e) => { setSelectedTeam(e.target.value); sfx.playClick(); }} 
                                className="bg-transparent text-xs font-bold  text-text-primary outline-none cursor-pointer py-2 px-2 hover:text-accent-primary transition-colors"
                            >
                                <option value="All">All Squads</option>
                                {uniqueTeams.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <select 
                                value={targetAgentId} 
                                onChange={(e) => { setTargetAgentId(e.target.value); sfx.playClick(); }} 
                                className="bg-transparent text-xs font-bold  text-text-primary outline-none cursor-pointer py-2 px-2 hover:text-accent-primary transition-colors border-l border-border-subtle"
                            >
                                <option value="all">Global</option>
                                {filteredAgents.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                    )}
                    
                    <div className="flex gap-1 bg-surface-alt p-1 rounded-xl border border-border-subtle shadow-inner">
                        {(['Today', 'Week', '1', '2', 'MTD'] as const).map(p => (
                            <button 
                                key={p} 
                                onClick={() => { setActivePeriod(p); sfx.playClick(); }} 
                                className={`px-4 py-2 text-xs font-bold  rounded-lg transition-all whitespace-nowrap ${
                                    activePeriod === p 
                                    ? 'bg-surface-main text-text-primary shadow-sm ring-1 ring-border-subtle' 
                                    : 'text-text-muted hover:text-text-primary hover:bg-surface-main/50'
                                }`}
                            >
                                {p === 'MTD' ? 'Month' : p === '1' ? 'Cycle 1' : p === '2' ? 'Cycle 2' : p}
                            </button>
                        ))}
                    </div>
                    {isSuperAdmin && (
                        <Button 
                            variant="secondary" 
                            onClick={handleExportReport} 
                            isLoading={isExporting}
                            className="h-10 px-4 text-xs  font-[700] tracking-widest border border-border-subtle hover:border-accent-primary/50"
                        >
                            <Download size={16} className="mr-2"/> Export
                        </Button>
                    )}
                </div>
            </div>

            {/* KPI GRID */}
            <KPIGrid nexusScore={nexusScore} grade={grade} periodStats={periodStats} />

            {/* CHARTS ROW */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                
                <div className="xl:col-span-8 flex flex-col gap-4 min-w-0">
                    <div className="h-[360px]">
                        <SalesHistoryChart sales={periodStats.sales} />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[340px]">
                        <OpportunityRadar sales={periodStats.sales} agentId={targetAgentId === 'all' ? undefined : targetAgentId} />
                        <PipelineVelocityChart sales={periodStats.sales} />
                    </div>
                </div>

                <div className="xl:col-span-4 flex flex-col gap-4 min-w-0">
                    <GeoIntelWidget geoData={geoData} />
                    
                    {/* PRODUCTIVITY MATRIX CARD */}
                    <Card variant="panel" className="flex-1 p-4 bg-surface-main border-border-subtle shadow-soft flex flex-col justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none"></div>
                        
                        <div className="flex items-center gap-3 mb-6 border-b border-border-subtle pb-3 relative z-10">
                            <Target size={20} className="text-accent-primary" />
                            <h4 className="text-xs font-[700]  text-text-primary tracking-widest">Efficiency Metrics</h4>
                        </div>
                        <div className="space-y-4 relative z-10">
                            <div className="flex flex-col justify-center items-center bg-surface-alt/40 rounded-xl p-4 border border-border-subtle hover:border-accent-primary/20 transition-colors">
                                <p className="text-xs font-bold text-text-muted  tracking-widest mb-1">Average Order Value</p>
                                <span className="text-lg font-[700] text-text-primary num-font tracking-tighter">${Math.round(periodStats.avgOrder).toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col justify-center items-center bg-surface-alt/40 rounded-xl p-4 border border-border-subtle hover:border-accent-secondary/20 transition-colors">
                                <p className="text-xs font-bold text-text-muted  tracking-widest mb-1">Volume Processed</p>
                                <span className="text-lg font-[700] text-accent-secondary num-font tracking-tighter">{periodStats.sales.length} Deals</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* MANIFEST TOGGLE */}
            <div className="flex justify-center pt-4">
                <button 
                    onClick={() => { setShowManifest(!showManifest); sfx.playClick(); }}
                    className={`flex items-center gap-3 px-8 py-3 rounded-xl text-xs font-bold  tracking-widest transition-all border ${showManifest ? 'bg-surface-main text-accent-primary border-accent-primary/30 shadow-md' : 'bg-surface-alt text-text-muted border-border-subtle hover:text-text-primary hover:bg-surface-main'}`}
                >
                    {showManifest ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                    {showManifest ? 'Hide Ledger' : 'View Financial Ledger'}
                </button>
            </div>

            {/* PAYOUT MANIFEST */}
            {showManifest && (
                <PayoutManifest manifest={periodStats.manifest} />
            )}
        </div>
    );
};
