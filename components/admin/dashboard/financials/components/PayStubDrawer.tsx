
import { X, Wallet, Download, Users } from 'lucide-react';
import { PayoutCycle } from '../../../../widgets/payouts/usePayoutHistory';
import { User } from '../../../../../types';
import { Button } from '../../../../../components/ui/Base';
import { exportToCSV } from '../../../../../views/utils/crmLogic';

interface PayStubDrawerProps {
    cycle: PayoutCycle;
    agent: User;
    sales: any[];
    adjustments: number;
    onClose: () => void;
}

export const PayStubDrawer: React.FC<PayStubDrawerProps> = ({ cycle, agent, sales, adjustments, onClose }) => {
    const totalComm = sales.reduce((acc, s) => acc + s.payout.commission, 0);
    const totalSpiff = sales.reduce((acc, s) => acc + s.payout.spiff, 0);
    const totalDed = sales.reduce((acc, s) => acc + s.payout.shippingDeduction, 0);
    const net = totalComm + totalSpiff - totalDed + adjustments;

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
                <div className="bg-text-primary dark:bg-surface-alt text-surface-main dark:text-text-primary p-6 rounded-2xl mb-8 shadow-xl shadow-black/5 dark:shadow-none relative overflow-hidden ring-1 ring-white/10">
                    <div className="relative z-10">
                        <p className="text-text-muted/60 dark:text-text-muted text-xs font-medium uppercase tracking-wide mb-1">Net Payout</p>
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
                        <p className="text-lg font-bold text-emerald-500">
                            ${totalComm.toLocaleString()}
                        </p>
                    </div>
                    {totalSpiff > 0 && (
                        <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 col-span-2">
                            <p className="text-xs text-amber-500 mb-1">Performance Bonuses</p>
                            <p className="text-lg font-bold text-amber-500">
                                +${totalSpiff.toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>

                {/* Adjustments Section */}
                {adjustments !== 0 && (
                    <div className="mb-8 p-4 border border-dashed border-border-subtle rounded-xl flex justify-between items-center bg-surface-alt/20">
                        <span className="text-sm font-medium text-text-secondary">Manual Adjustment</span>
                        <span className={`font-bold font-mono ${adjustments > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {adjustments > 0 ? '+' : ''}{adjustments.toLocaleString()}
                        </span>
                    </div>
                )}

                {/* Transaction List */}
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Line Items</h4>
                    <div className="space-y-3">
                        {sales.map((item, i) => (
                            <div key={i} className="flex justify-between items-start text-sm">
                                <div>
                                    <p className="font-medium text-text-primary">{item.sale.customer}</p>
                                    <p className="text-xs text-text-muted">{new Date(item.timestamp).toLocaleDateString()} • {item.sale.product}</p>
                                    {item.payout.spiff > 0 && <span className="text-[10px] bg-amber-500/10 text-amber-500 px-1.5 rounded-sm mt-1 inline-block border border-amber-500/20">Bonus Applied</span>}
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-text-primary">${item.payout.net.toFixed(2)}</p>
                                    <p className="text-xs text-text-muted/60">Vol: ${item.sale.amount}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border-subtle bg-surface-main">
                <Button className="w-full h-12 text-sm font-bold bg-text-primary hover:bg-text-secondary text-surface-main rounded-xl shadow-lg transition-all" onClick={() => exportToCSV(sales.map(s => ({...s.sale, ...s.payout})), `PayStub_${agent.name}`)}>
                    <Download size={16} className="mr-2"/> Download Official PDF
                </Button>
            </div>
        </div>
    );
};
