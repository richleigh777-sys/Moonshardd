
import React, { useMemo } from 'react';
import { Card } from '../../ui/Base';
import { Star, DollarSign, Download, Clock, Truck } from 'lucide-react';
import { exportToCSV } from '../../../views/utils/crmLogic';
import { sfx } from '../../../lib/soundService';

interface PayoutManifestProps {
    manifest: any[];
}

export const PayoutManifest: React.FC<PayoutManifestProps> = ({ manifest }) => {
    
    const totals = useMemo(() => {
        return manifest.reduce((acc, curr) => ({
            commission: acc.commission + curr.payout.commission,
            spiff: acc.spiff + curr.payout.spiff,
            net: acc.net + curr.payout.net
        }), { commission: 0, spiff: 0, net: 0 });
    }, [manifest]);

    const handleExport = () => {
        sfx.playSubmit();
        const data = manifest.map(m => ({
            Date: new Date(m.timestamp).toLocaleDateString(),
            Time: new Date(m.timestamp).toLocaleTimeString(),
            Customer: m.sale.customer,
            Product: m.sale.product,
            GrossAmount: m.sale.amount,
            NetBasis: m.payout.commissionableBasis,
            ShippingDeduction: m.payout.shippingDeduction,
            HoursLogged: m.payout.dailyHoursAtTimeOfSale,
            BaseYield: m.payout.commission,
            Incentive: m.payout.spiff,
            Net: m.payout.net
        }));
        exportToCSV(data, 'Financial_Ledger_Export');
    };

    return (
        <div className="animate-in slide-in-from-top-4 duration-500">
            <Card variant="panel" className="p-0 overflow-hidden border-border-subtle bg-surface-main shadow-2xl rounded-[2.5rem]">
                {/* Header */}
                <div className="p-6 border-b border-border-subtle bg-surface-alt/40 flex items-center justify-between backdrop-blur-xl sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 border border-emerald-500/20 shadow-neon">
                            <DollarSign size={24} strokeWidth={2.5}/>
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase italic text-text-primary tracking-tighter">Financial Ledger</h3>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mt-0.5">Authorized Payouts</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-surface-main hover:bg-surface-highlight border border-border-subtle rounded-xl text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-text-primary transition-all shadow-sm group"
                    >
                        <Download size={14} className="group-hover:translate-y-0.5 transition-transform"/> Export
                    </button>
                </div>
                
                {/* Ledger Body */}
                <div className="max-h-[600px] overflow-y-auto custom-scrollbar relative">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-surface-main sticky top-0 z-10 text-[9px] font-black uppercase text-text-muted tracking-[0.15em] border-b border-border-subtle shadow-sm">
                            <tr>
                                <th className="p-5 pl-8">Transaction ID</th>
                                <th className="p-5">Client Identity</th>
                                <th className="p-5 text-right">Net Basis</th>
                                <th className="p-5 text-right">Base Yield</th>
                                <th className="p-5 text-right">Incentive Eligibility</th>
                                <th className="p-5 text-right pr-8">Net Settlement</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle/50 text-xs font-medium">
                            {manifest.map((item, idx) => {
                                const hasSpiff = item.payout.spiff > 0;
                                const missedSpiff = !hasSpiff && item.payout.missedSpiff > 0;
                                
                                return (
                                    <tr key={idx} className="hover:bg-surface-alt/40 transition-colors group">
                                        <td className="p-5 pl-8">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-text-primary font-bold">{new Date(item.timestamp).toLocaleDateString()}</span>
                                                <span className="text-[9px] text-text-muted flex items-center gap-1 opacity-60">
                                                    <Clock size={8}/> {new Date(item.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-surface-alt flex items-center justify-center font-bold text-[10px] text-text-muted border border-border-subtle">
                                                    {item.sale.customer.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-black text-text-primary uppercase tracking-tight">{item.sale.customer}</div>
                                                    <div className="text-[9px] text-text-muted font-bold uppercase mt-0.5 opacity-70">
                                                        {item.sale.product}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="font-mono font-bold text-text-primary">${item.payout.commissionableBasis.toLocaleString()}</span>
                                                {item.payout.shippingDeduction > 0 && (
                                                    <span className="text-[9px] text-amber-500 font-bold flex items-center gap-1">
                                                        <Truck size={8}/> -${item.payout.shippingDeduction} Ship
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-5 text-right font-mono text-text-secondary font-bold">
                                            ${item.payout.commission.toLocaleString()}
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                {hasSpiff ? (
                                                    <span className="text-amber-500 font-black flex items-center justify-end gap-1 bg-amber-500/5 px-2 py-1 rounded-lg border border-amber-500/20 w-fit">
                                                        <Star size={10} fill="currentColor"/> +${item.payout.spiff}
                                                    </span>
                                                ) : missedSpiff ? (
                                                    <span className="text-text-muted/50 text-[9px] font-bold uppercase flex items-center gap-1" title="Thresholds not met for bonus">
                                                        Missed Bonus
                                                    </span>
                                                ) : (
                                                    <span className="text-text-muted opacity-20">-</span>
                                                )}
                                                
                                                <span className={`text-[8px] font-bold uppercase tracking-wider ${hasSpiff ? 'text-emerald-500' : 'text-text-muted/60'}`}>
                                                    Day Hours: {item.payout.dailyHoursAtTimeOfSale.toFixed(1)}h
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-right pr-8">
                                            <span className="font-black num-font text-emerald-500 text-sm tracking-tight drop-shadow-sm">
                                                ${item.payout.net.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {manifest.length === 0 && (
                                <tr><td colSpan={6} className="p-20 text-center text-text-muted italic opacity-40 font-medium">Sector archive empty for this cycle.</td></tr>
                            )}
                        </tbody>
                        
                        {/* Footer Totals */}
                        {manifest.length > 0 && (
                            <tfoot className="sticky bottom-0 z-10 bg-surface-main border-t border-border-subtle shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
                                <tr className="text-xs">
                                    <td colSpan={3} className="p-6 pl-8 text-right text-[10px] font-black uppercase tracking-widest text-text-muted">Cycle Aggregates</td>
                                    <td className="p-6 text-right font-bold text-text-primary">${totals.commission.toLocaleString()}</td>
                                    <td className="p-6 text-right font-bold text-amber-500">+${totals.spiff.toLocaleString()}</td>
                                    <td className="p-6 pr-8 text-right">
                                        <span className="text-xl font-black text-emerald-500 tracking-tighter">${totals.net.toLocaleString()}</span>
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </Card>
        </div>
    );
};
