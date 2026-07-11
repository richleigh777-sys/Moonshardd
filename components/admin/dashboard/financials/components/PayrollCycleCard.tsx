
import React from 'react';
import { Calendar, Clock, Lock, CheckCircle2, Download, ChevronRight } from 'lucide-react';
import { Button } from '../../../../../components/ui/Base';
import { User } from '../../../../../types';
import { PayoutCycle } from '../../../../widgets/payouts/usePayoutHistory';
import { exportToCSV } from '../../../../../views/utils/crmLogic';
import { sfx } from '../../../../../lib/soundService';
import { useCRM } from '../../../../../hooks/useCRM';

interface PayrollCycleCardProps {
    cycle: PayoutCycle & { agentPayouts: any[] };
    onInspect: (data: { cycle: PayoutCycle, agent: User, sales: any[] }) => void;
    onAdjust: (data: { cycleId: string, agentId: string, currentVal: number }) => void;
}

export const PayrollCycleCard: React.FC<PayrollCycleCardProps> = ({ cycle, onInspect, onAdjust }) => {
    const { currentUser } = useCRM();
    const isSuperAdmin = (currentUser?.level || currentUser?.accessLevel || 0) >= 10;
    
    // Safely parse date objects
    const parsedStartDate = React.useMemo(() => new Date(cycle.startDate), [cycle.startDate]);
    const parsedEndDate = React.useMemo(() => new Date(cycle.endDate), [cycle.endDate]);
    const parsedPayDate = React.useMemo(() => new Date(cycle.payDate), [cycle.payDate]);

    // Progress Calculation
    const [now] = React.useState(() => Date.now());
    const totalDays = (parsedEndDate.getTime() - parsedStartDate.getTime()) / 86400000;
    const daysPassed = (now - parsedStartDate.getTime()) / 86400000;
    const progress = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));

    const getStatusPill = (status: string) => {
        const styles = {
            Paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-status-success',
            Processing: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-status-warning',
            Open: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
        }[status] || 'bg-surface-alt text-text-muted';
        
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-sm font-semibold ${styles}`}>
                {status}
            </span>
        );
    };

    const handleMasterExport = () => {
        sfx.playSubmit();
        const csvData = cycle.agentPayouts.map((p: any) => ({
            AgentID: p.agent.id,
            Name: p.agent.name,
            Bank: p.agent.bankName,
            Account: p.agent.bankAccount,
            Volume: p.volume,
            Deals: p.salesCount,
            BaseCommission: p.commission,
            Spiffs: p.spiff,
            Deductions: p.deduction,
            ManualAdj: p.manualAdj,
            NetPayout: p.netPayout.toFixed(2)
        }));
        exportToCSV(csvData, `Master_Payroll_${cycle.id}`);
    };

    return (
        <div className="bg-surface-main rounded-xl shadow-panel overflow-hidden transition-all hover:shadow-md">
            
            {/* Cycle Header */}
            <div className="p-4 border-b border-border-subtle flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 bg-surface-alt/20">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-surface-alt rounded-xl border border-border-subtle shadow-sm">
                        <Calendar size={24} className="text-text-muted" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-bold text-text-primary">{cycle.label}</h3>
                            {getStatusPill(cycle.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm font-medium text-text-muted">
                            <span>{parsedStartDate.toLocaleDateString()} - {parsedEndDate.toLocaleDateString()}</span>
                            <span className="w-1 h-1 rounded-full bg-border-subtle"></span>
                            <span className="flex items-center gap-1"><Clock size={16}/> Pay Date: {parsedPayDate.toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
                    <div className="text-right">
                        <p className="text-sm font-medium text-text-muted mb-1  tracking-wider">Cycle Liability</p>
                        <p className="text-lg font-bold text-text-primary tracking-tight">
                            ${(cycle as any).totalLiability.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {cycle.status !== 'Paid' && (
                            <Button variant="secondary" className="h-10 text-sm font-bold text-text-muted border-border-subtle hover:bg-surface-highlight transition-all">
                                {cycle.status === 'Open' ? <Lock size={16} className="mr-2"/> : <CheckCircle2 size={16} className="mr-2"/>}
                                {cycle.status === 'Open' ? 'Lock' : 'Finalize'}
                            </Button>
                        )}
                        {isSuperAdmin && (
                            <Button onClick={handleMasterExport} className="h-10 px-4 bg-text-primary hover:bg-text-secondary text-surface-main rounded-xl shadow-lg text-sm font-bold  tracking-wide transition-all">
                                <Download size={16} className="mr-2"/> Export File
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Progress Bar (Only for Open) */}
            {cycle.status === 'Open' && (
                <div className="h-1 w-full bg-surface-alt">
                    <div className="h-full bg-blue-500 rounded-r-full" style={{ width: `${progress}%` }}></div>
                </div>
            )}

            {/* Data Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-surface-alt/50 text-text-muted font-medium border-b border-border-subtle">
                        <tr>
                            <th className="py-3 pl-6 font-medium w-16">#</th>
                            <th className="py-3 font-medium">Partner</th>
                            <th className="py-3 font-medium text-right">Volume</th>
                            <th className="py-3 font-medium text-right text-status-success">Comm.</th>
                            <th className="py-3 font-medium text-right text-status-warning">Bonus</th>
                            <th className="py-3 font-medium text-right">Adjust</th>
                            <th className="py-3 font-medium text-right pr-6">Payout</th>
                            <th className="py-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle text-text-secondary">
                        {cycle.agentPayouts.map((p: any, idx: number) => (
                            <tr 
                                key={p.agent.id} 
                                className="hover:bg-surface-alt/30 transition-colors cursor-pointer group"
                                onClick={() => onInspect({ cycle, agent: p.agent, sales: p.enrichedSales })}
                            >
                                <td className="py-4 pl-6 text-text-muted/60">{idx + 1}</td>
                                <td className="py-4 font-semibold text-text-primary">
                                    <div className="flex flex-col">
                                        <span>{p.agent.name}</span>
                                        <span className="text-sm font-normal text-text-muted/60">{p.salesCount} Deals • {p.agent.bankName}</span>
                                    </div>
                                </td>
                                <td className="py-4 text-right font-mono text-text-muted">
                                    ${p.volume.toLocaleString()}
                                </td>
                                <td className="py-4 text-right font-mono font-medium text-status-success">
                                    ${p.commission.toLocaleString()}
                                </td>
                                <td className="py-4 text-right font-mono font-medium text-status-warning">
                                    ${p.spiff.toLocaleString()}
                                </td>
                                <td className="py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                    <button 
                                        onClick={() => onAdjust({ cycleId: cycle.id, agentId: p.agent.id, currentVal: p.manualAdj })}
                                        className={`px-3 py-1 rounded-full text-sm font-medium border transition-all ${p.manualAdj !== 0 ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-transparent border-transparent text-text-muted hover:bg-surface-highlight hover:border-border-subtle'}`}
                                    >
                                        {p.manualAdj > 0 ? '+' : ''}{p.manualAdj === 0 ? 'Add' : p.manualAdj}
                                    </button>
                                </td>
                                <td className="py-4 text-right pr-6 font-bold text-text-primary text-base">
                                    ${p.netPayout.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                </td>
                                <td className="py-4 pr-4 text-text-muted/30 group-hover:text-blue-500 transition-colors">
                                    <ChevronRight size={18} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
