
import React from 'react';
import { X, Wallet, Download, Users, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { PayoutCycle } from '../../../../widgets/payouts/usePayoutHistory';
import { User } from '../../../../../types';
import { Button } from '../../../../../components/ui/Base';
import { exportToCSV } from '../../../../../views/utils/crmLogic';
import { useCRM } from '../../../../../hooks/useCRM';

interface PayStubDrawerProps {
    cycle: PayoutCycle;
    agent: User;
    sales: any[];
    adjustments: number;
    onClose: () => void;
}

export const PayStubDrawer: React.FC<PayStubDrawerProps> = ({ cycle, agent, sales, adjustments, onClose }) => {
    const { currentUser } = useCRM();
    const isSuperAdmin = (currentUser?.level || currentUser?.accessLevel || 0) >= 10;
    const totalComm = sales.reduce((acc, s) => acc + s.payout.commission, 0);
    const totalSpiff = sales.reduce((acc, s) => acc + s.payout.spiff, 0);
    const totalDed = sales.reduce((acc, s) => acc + s.payout.shippingDeduction, 0);
    const net = totalComm + totalSpiff - totalDed + adjustments;
    const [expandedItem, setExpandedItem] = React.useState<number | null>(null);

    return (
        <div className="fixed inset-y-0 right-0 w-[480px] bg-surface-main border-l border-border-subtle shadow-2xl z-[100] animate-in slide-in-from-right duration-300 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-border-subtle flex justify-between items-center bg-surface-alt/40">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-surface-alt border border-border-subtle overflow-hidden">
                        {agent.avatar ? <img src={agent.avatar} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-text-muted"><Users size={20}/></div>}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-text-primary">{agent.name}</h3>
                        <p className="text-xs text-text-muted font-medium">{cycle.label} Statement</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-surface-highlight rounded-full text-text-muted transition-colors"><X size={20}/></button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                
                {/* Net Pay Hero */}
                <div className="bg-text-primary  text-surface-main dark:text-text-primary p-6 rounded-2xl mb-8 shadow-xl shadow-black/5 dark:shadow-none relative overflow-hidden ring-1 ring-white/10">
                    <div className="relative z-10">
                        <p className="text-text-muted/60 dark:text-text-muted text-xs font-medium  tracking-wide mb-1">Net Payout</p>
                        <p className="text-4xl font-bold tracking-tight">${net.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                    </div>
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Wallet size={80} />
                    </div>
                </div>

                {/* Summary Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-surface-alt rounded-xl border border-border-subtle">
                        <p className="text-xs text-text-muted mb-1">Sales Volume</p>
                        <p className="text-lg font-bold text-text-primary">
                            ${sales.reduce((acc,s) => acc + Number(s.sale.amount), 0).toLocaleString()}
                        </p>
                    </div>
                    <div className="p-4 bg-surface-alt rounded-xl border border-border-subtle">
                        <p className="text-xs text-text-muted mb-1">Commission</p>
                        <p className="text-lg font-bold text-status-success">
                            ${totalComm.toLocaleString()}
                        </p>
                    </div>
                    {totalSpiff > 0 && (
                        <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 col-span-2">
                            <p className="text-xs text-status-warning mb-1">Performance Bonuses</p>
                            <p className="text-lg font-bold text-status-warning">
                                +${totalSpiff.toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>

                {/* Adjustments Section */}
                {adjustments !== 0 && (
                    <div className="mb-8 p-4 border border-dashed border-border-subtle rounded-xl flex justify-between items-center bg-surface-alt/20">
                        <span className="text-sm font-medium text-text-secondary">Manual Adjustment</span>
                        <span className={`font-bold font-mono ${adjustments > 0 ? 'text-status-success' : 'text-status-error'}`}>
                            {adjustments > 0 ? '+' : ''}{adjustments.toLocaleString()}
                        </span>
                    </div>
                )}

                {/* Transaction List */}
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Line Items</h4>
                    <div className="space-y-3">
                        {sales.map((item, i) => {
                            const isExpanded = expandedItem === i;
                            return (
                                <div key={i} className="bg-surface-alt/30 border border-border-subtle rounded-xl overflow-hidden transition-all">
                                    <div 
                                        className="flex justify-between items-start p-3 cursor-pointer hover:bg-surface-highlight transition-colors"
                                        onClick={() => setExpandedItem(isExpanded ? null : i)}
                                    >
                                        <div>
                                            <p className="font-medium text-text-primary flex items-center gap-2">
                                                {item.sale.customer}
                                            </p>
                                            <p className="text-xs text-text-muted mt-0.5">{new Date(item.timestamp).toLocaleDateString()} • {item.sale.product}</p>
                                            <div className="flex flex-wrap gap-1 mt-1.5">
                                                <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 bg-surface-main border border-border-subtle rounded text-text-muted">{item.payout.rateUsed}% Rate</span>
                                                {item.payout.spiff > 0 && <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-status-warning rounded">+{item.payout.spiff} Bonus</span>}
                                                {item.payout.missedSpiff > 0 && <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 bg-red-500/10 border border-red-500/20 text-status-error rounded flex items-center gap-1"><AlertCircle size={10}/> Missed Bonus</span>}
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <p className="font-bold text-text-primary flex items-center gap-1">
                                                ${item.payout.net.toFixed(2)}
                                                {isExpanded ? <ChevronUp size={16} className="text-text-muted"/> : <ChevronDown size={16} className="text-text-muted"/>}
                                            </p>
                                            <p className="text-xs text-text-muted/60 mt-0.5">Gross: ${item.sale.amount}</p>
                                        </div>
                                    </div>
                                    
                                    {isExpanded && (
                                        <div className="px-4 py-3 bg-surface-main/50 border-t border-border-subtle text-xs space-y-2">
                                            <div className="flex justify-between text-text-secondary">
                                                <span>Gross Volume</span>
                                                <span>${item.payout.grossAmount.toFixed(2)}</span>
                                            </div>
                                            {item.payout.shippingDeduction > 0 && (
                                                <div className="flex justify-between text-status-error">
                                                    <span>Base / Shipping Deduction</span>
                                                    <span>-${item.payout.shippingDeduction.toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-text-secondary font-medium pt-1 border-t border-border-subtle/50">
                                                <span>Commissionable Basis</span>
                                                <span>${item.payout.commissionableBasis.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-status-success">
                                                <span>Base Commission ({item.payout.rateUsed}%)</span>
                                                <span>${item.payout.commission.toFixed(2)}</span>
                                            </div>
                                            
                                            {item.payout.spiff > 0 && (
                                                <div className="flex justify-between text-status-warning pt-1">
                                                    <span className="flex items-center gap-1">
                                                        Performance Bonus
                                                        {item.payout.activeSpiffRule && <span className="opacity-60 text-[10px] ml-1">({item.payout.activeSpiffRule.name || 'Tier Reached'})</span>}
                                                    </span>
                                                    <span>+${item.payout.spiff.toFixed(2)}</span>
                                                </div>
                                            )}

                                            {item.payout.missedSpiff > 0 && (
                                                <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-status-error flex items-start gap-2">
                                                    <AlertCircle size={14} className="mt-0.5 shrink-0"/>
                                                    <div>
                                                        <span className="font-bold block">Missed Bonus: ${item.payout.missedSpiff}</span>
                                                        <span className="opacity-80">Agent only logged {item.payout.dailyHoursAtTimeOfSale} hours on this day. Didn't meet minimum requirement for the bonus.</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border-subtle bg-surface-main">
                <div className="flex gap-4">
                    <Button variant="secondary" className="flex-1 h-12 text-sm font-bold" onClick={onClose}>
                        Close
                    </Button>
                    {isSuperAdmin && (
                        <Button className="flex-1 h-12 text-sm font-bold bg-text-primary hover:bg-text-secondary text-surface-main rounded-xl shadow-lg transition-all" onClick={() => exportToCSV(sales.map(s => ({...s.sale, ...s.payout})), `PayStub_${agent.name}`)}>
                            <Download size={16} className="mr-2"/> PDF
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
