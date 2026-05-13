
import React from 'react';
import { 
    FileText, Download, Wallet, CreditCard, ShieldCheck, 
    Calendar, Clock, CheckCircle2, AlertCircle, 
    Hash, Building 
} from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Base';
import { PayoutCycle } from './usePayoutHistory';
import { User } from '../../../types';
import { exportToCSV } from '../../../views/utils/crmLogic';

interface PayslipModalProps {
    cycle: PayoutCycle | null;
    onClose: () => void;
    currentUser: User | null;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({ cycle, onClose, currentUser }) => {
    if (!cycle || !currentUser) return null;

    const handleExport = () => {
        const data = cycle.sales.map(s => ({
            Date: new Date(s.sale.timestamp).toLocaleDateString(),
            Customer: s.sale.customer,
            Product: s.sale.product,
            Gross: s.payout.grossAmount,
            Deduction: s.payout.shippingDeduction,
            Commission: s.payout.commission,
            Bonus: s.payout.spiff,
            Net: s.payout.net
        }));
        exportToCSV(data, `Statement_${cycle.id}`);
    };

    const getStatusConfig = (status: string) => {
        if (status === 'Paid') return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle2 };
        if (status === 'Processing') return { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Clock };
        return { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: AlertCircle };
    };

    const statusConfig = getStatusConfig(cycle.status);
    const StatusIcon = statusConfig.icon;

    return (
        <Modal isOpen={!!cycle} onClose={onClose} title="Statement of Earnings" size="2xl">
            <div className="flex flex-col h-full -m-8 bg-[#09090b] text-white">
                
                {/* 1. DOCUMENT HEADER */}
                <div className="p-8 border-b border-white/10 bg-surface-alt/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                        <FileText size={120} />
                    </div>
                    
                    <div className="flex justify-between items-start relative z-10">
                        <div className="flex gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 border border-white/10">
                                <Wallet size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                    Settlement
                                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                                        <StatusIcon size={12} strokeWidth={3} /> {cycle.status}
                                    </span>
                                </h2>
                                <div className="flex items-center gap-4 mt-2 text-xs font-medium text-text-muted">
                                    <span className="flex items-center gap-1.5"><Hash size={12}/> ID: {cycle.id.toUpperCase()}</span>
                                    <span className="w-px h-3 bg-white/10"></span>
                                    <span className="flex items-center gap-1.5"><Calendar size={12}/> Period: {cycle.label}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="text-right">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Disbursement Date</p>
                            <p className="text-xl font-mono font-bold text-white">{cycle.payDate.toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {/* 2. FINANCIAL SUMMARY HERO */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-white/5">
                    {/* Net Pay Card */}
                    <div className="md:col-span-2 relative overflow-hidden rounded-3xl bg-surface-main border border-emerald-500/30 p-6 flex flex-col justify-between group shadow-[0_0_30px_rgba(16,185,129,0.05)]">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">Net Payout Authorization</p>
                                <h3 className="text-4xl md:text-5xl font-black text-white num-font tracking-tighter drop-shadow-md">
                                    ${cycle.netPayout.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                </h3>
                            </div>
                            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 border border-emerald-500/20">
                                <ShieldCheck size={24} />
                            </div>
                        </div>
                        <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-wider relative z-10">
                            <span className="bg-surface-alt px-2 py-1 rounded border border-white/5 text-emerald-400">Verified</span>
                            <span>•</span>
                            <span>{cycle.salesCount} Qualified Transactions</span>
                        </div>
                    </div>

                    {/* Account Details */}
                    <div className="rounded-3xl bg-surface-alt/30 border border-white/5 p-6 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 text-white/5 pointer-events-none">
                            <Building size={80} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Recipient Destination</p>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-[9px] text-text-muted uppercase">Bank Name</p>
                                    <p className="text-sm font-bold text-white truncate">{currentUser.bankName || 'Not Configured'}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-text-muted uppercase">Account Number</p>
                                    <div className="flex items-center gap-2 text-sm font-mono font-bold text-white">
                                        <CreditCard size={14} className="text-indigo-400"/>
                                        <span>•••• {currentUser.bankAccount ? currentUser.bankAccount.slice(-4) : '0000'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. WATERFALL BREAKDOWN */}
                <div className="grid grid-cols-4 divide-x divide-white/5 border-b border-white/5 bg-surface-main/50">
                    <div className="p-4 flex flex-col items-center justify-center text-center group hover:bg-white/5 transition-colors">
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Gross Volume</span>
                        <span className="text-lg font-bold text-text-primary group-hover:text-white transition-colors">${cycle.volume.toLocaleString()}</span>
                    </div>
                    <div className="p-4 flex flex-col items-center justify-center text-center group hover:bg-white/5 transition-colors">
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Base Comm.</span>
                        <span className="text-lg font-bold text-blue-400">${cycle.commission.toLocaleString()}</span>
                    </div>
                    <div className="p-4 flex flex-col items-center justify-center text-center group hover:bg-white/5 transition-colors">
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Spiffs</span>
                        <span className="text-lg font-bold text-amber-500">+${cycle.spiffs.toLocaleString()}</span>
                    </div>
                    <div className="p-4 flex flex-col items-center justify-center text-center group hover:bg-white/5 transition-colors">
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Deductions</span>
                        <span className="text-lg font-bold text-rose-400">-${cycle.deductions.toLocaleString()}</span>
                    </div>
                </div>

                {/* 4. LINE ITEMS */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-surface-alt/10">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-[#09090b] z-10 text-[9px] font-black uppercase text-text-muted tracking-widest border-b border-white/10 shadow-sm">
                            <tr>
                                <th className="p-4 pl-8 w-32">Date</th>
                                <th className="p-4">Customer / Product</th>
                                <th className="p-4 text-right text-blue-400/80">Comm.</th>
                                <th className="p-4 text-right text-amber-500/80">Bonus</th>
                                <th className="p-4 text-right text-rose-400/80">Ded.</th>
                                <th className="p-4 text-right pr-8 text-emerald-500/80">Net</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-xs font-medium">
                            {cycle.sales.map((item) => (
                                <tr key={item.sale.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-4 pl-8 font-mono text-text-muted">
                                        {new Date(item.sale.timestamp).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-white mb-0.5">{item.sale.customer}</div>
                                        <div className="text-[10px] text-text-muted">{item.sale.product}</div>
                                    </td>
                                    <td className="p-4 text-right font-mono text-blue-400 group-hover:text-blue-300">
                                        ${item.payout.commission.toLocaleString()}
                                    </td>
                                    <td className="p-4 text-right font-mono text-amber-500 group-hover:text-amber-400">
                                        {item.payout.spiff > 0 ? `+${item.payout.spiff}` : '-'}
                                    </td>
                                    <td className="p-4 text-right font-mono text-rose-400 group-hover:text-rose-300">
                                        {item.payout.shippingDeduction > 0 ? `-${item.payout.shippingDeduction}` : '-'}
                                    </td>
                                    <td className="p-4 pr-8 text-right font-black font-mono text-emerald-500 group-hover:text-emerald-400">
                                        ${item.payout.net.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 5. FOOTER ACTIONS */}
                <div className="p-6 border-t border-white/10 bg-[#09090b] flex justify-between items-center shrink-0">
                    <p className="text-[9px] font-mono text-text-muted/40 uppercase tracking-widest">
                        Generated by Nexus Financial Engine • Secure Protocol
                    </p>
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={onClose} className="h-12 px-6">Close View</Button>
                        <Button 
                            variant="primary" 
                            onClick={handleExport}
                            className="h-12 px-8 bg-white text-black hover:bg-gray-200 border-none shadow-xl font-bold uppercase tracking-wide"
                        >
                            <Download size={16} className="mr-2" /> Download PDF
                        </Button>
                    </div>
                </div>

            </div>
        </Modal>
    );
};
