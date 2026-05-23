
import React, { useState } from 'react';
import { DollarSign, CheckCircle, Clock, Lock, CreditCard, ChevronRight } from 'lucide-react';
import { useCRM } from '../../../hooks/useCRM';
import { useAuth } from '../../../hooks/useAuth';
import { usePayoutHistory, PayoutCycle } from './usePayoutHistory';
import { Card } from '../../ui/Base';
import { PayslipModal } from './PayslipModal';

export const AgentPayouts: React.FC = () => {
    const { sales, attendance, systemConfig } = useCRM();
    const { currentUser } = useAuth();
    const history = usePayoutHistory(sales, attendance, systemConfig, currentUser);
    const [selectedCycle, setSelectedCycle] = useState<PayoutCycle | null>(null);

    const getStatusStyle = (status: string) => {
        if (status === 'Paid') return 'bg-emerald-500/10 text-status-success border-emerald-500/20';
        if (status === 'Processing') return 'bg-amber-500/10 text-status-warning border-amber-500/20';
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    };

    const getStatusIcon = (status: string) => {
        if (status === 'Paid') return <CheckCircle size={16} />;
        if (status === 'Processing') return <Clock size={16} />;
        return <Lock size={16} />;
    };

    return (
        <div className="h-full flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <Card variant="panel" className="p-6 mb-6 bg-surface-main border-border-subtle shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/20 text-white">
                        <CreditCard size={32} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-[700] text-text-primary  tracking-tight">Financial Ledger</h2>
                        <p className="text-xs font-bold text-text-muted  tracking-widest mt-1">
                            Commission History & Upcoming Disbursements
                        </p>
                    </div>
                </div>
            </Card>

            {/* Timeline Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar pb-10 pr-2">
                {history.length === 0 ? (
                     <div className="col-span-full flex flex-col items-center justify-center p-12 text-text-muted opacity-50 border-2 border-dashed border-border-subtle rounded-3xl">
                        <DollarSign size={48} className="mb-4" />
                        <p className="text-sm font-bold  tracking-widest">No Payout History</p>
                        <p className="text-xs mt-2">Sales data will appear here once finalized.</p>
                     </div>
                ) : (
                    history.map((cycle) => (
                        <div 
                            key={cycle.id}
                            onClick={() => setSelectedCycle(cycle)}
                            className={`
                                relative group p-6 rounded-[2rem] border transition-all cursor-pointer overflow-hidden
                                ${cycle.status === 'Open' ? 'bg-surface-main border-accent-primary/30 shadow-lg shadow-accent-primary/5' : 'bg-surface-main border-border-subtle hover:border-status-success/30'}
                            `}
                        >
                            {/* Background Deco */}
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] transform rotate-12 group-hover:scale-110 transition-transform pointer-events-none">
                                <DollarSign size={100} />
                            </div>

                            <div className="relative z-10 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-[700]  tracking-wider border mb-2 ${getStatusStyle(cycle.status)}`}>
                                            {getStatusIcon(cycle.status)} {cycle.status}
                                        </div>
                                        <h3 className="text-lg font-[700] text-text-primary  tracking-tight">{cycle.label}</h3>
                                        <p className="text-xs font-mono text-text-muted mt-1">
                                            Pay Date: {cycle.payDate.toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-surface-alt/50 rounded-xl border border-border-subtle">
                                        <span className="text-xs font-bold text-text-secondary  tracking-wider">Sales Volume</span>
                                        <span className="text-sm font-[700] text-text-primary num-font">${cycle.volume.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-surface-alt/50 rounded-xl border border-border-subtle">
                                        <span className="text-xs font-bold text-text-secondary  tracking-wider">Deals Closed</span>
                                        <span className="text-sm font-[700] text-text-primary num-font">{cycle.salesCount}</span>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-border-subtle/50 flex justify-between items-end">
                                    <div>
                                        <p className="text-xs font-[700] text-emerald-600  tracking-widest mb-1">Net Payout</p>
                                        <p className="text-3xl font-[700] text-text-primary num-font tracking-tighter">${cycle.netPayout.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-surface-alt flex items-center justify-center text-text-muted group-hover:bg-accent-primary group-hover:text-white transition-colors">
                                        <ChevronRight size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Detailed Payslip Modal */}
            <PayslipModal 
                cycle={selectedCycle} 
                onClose={() => setSelectedCycle(null)} 
                currentUser={currentUser}
            />
        </div>
    );
};
