
import React from 'react';
import { Shield, Server, CreditCard, Lock, Calendar } from 'lucide-react';
import { TOP_US_BANKS, CARD_PROVIDERS } from '../../../constants';
import { formatExpiry } from '../../../views/utils/crmLogic';

interface PaymentPanelProps {
    financials: any;
    setFinancials: (data: any) => void;
    handleCardInput: (val: string) => void;
    cardStatus: 'neutral' | 'valid' | 'invalid';
    cardHolderName?: string;
}

export const PaymentPanel: React.FC<PaymentPanelProps> = ({ 
    financials, setFinancials, handleCardInput, cardStatus, cardHolderName 
}) => {
    
    const [randomNames] = React.useState(() => ({
        pan: `fld_${Math.random().toString(36).substring(7)}`,
        exp: `fld_${Math.random().toString(36).substring(7)}`,
        sec: `fld_${Math.random().toString(36).substring(7)}`
    }));

    const handleFinancialChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFinancials((prev: any) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-6">
            
            {/* 1. Core Card Data */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-[700]  text-text-muted/80 tracking-[0.2em] pl-1 drop-shadow-sm">Account Number</label>
                    <div className="relative group">
                        <input autoComplete="new-password" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                            name={randomNames.pan}
                            value={financials.cardNumber}
                            onChange={(e) => handleCardInput(e.target.value)}
                            type="text"
                            placeholder="Data Entry"
                            maxLength={19}
                            className={`w-full bg-surface-alt/30 border rounded-2xl px-4 py-3 text-sm font-mono font-bold text-text-primary outline-none transition-all shadow-inner pl-10 focus:ring-1 focus:border-status-success/50 focus:ring-emerald-500/50 ${cardStatus === 'invalid' ? 'border-status-error focus:border-status-error focus:ring-status-error' : 'border-border-subtle'}`}
                        />
                        <CreditCard size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none group-focus-within:text-status-success transition-colors"/>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-[700]  text-text-muted/80 tracking-[0.2em] pl-1 drop-shadow-sm">Valid Thru</label>
                        <div className="relative group">
                            <input autoComplete="new-password" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                name={randomNames.exp} 
                                value={financials.cardExpiry} 
                                onChange={(e) => setFinancials((p: any) => ({...p, cardExpiry: formatExpiry(e.target.value)}))} 
                                placeholder="--/--" 
                                maxLength={5} 
                                className="w-full bg-surface-alt/30 border border-border-subtle rounded-2xl px-4 py-3 text-sm font-mono font-bold text-text-primary outline-none focus:border-status-success/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner pl-10"
                            />
                            <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none group-focus-within:text-status-success transition-colors"/>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-[700]  text-text-muted/80 tracking-[0.2em] pl-1 drop-shadow-sm">Sec Code</label>
                        <div className="relative group">
                            <input autoComplete="new-password" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                name={randomNames.sec} 
                                value={financials.cardCvv} 
                                onChange={(e) => setFinancials((p: any) => ({...p, cardCvv: e.target.value}))} 
                                type="text"
                                placeholder="..." 
                                maxLength={4}
                                className="w-full bg-surface-alt/30 border border-border-subtle rounded-2xl px-4 py-3 text-sm font-mono font-bold text-text-primary outline-none focus:border-status-success/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner pl-10"
                            />
                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none group-focus-within:text-status-success transition-colors"/>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Metadata Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-[700]  text-text-muted/80 tracking-[0.2em] pl-1 drop-shadow-sm">Banking Inst.</label>
                    <div className="relative group">
                        <select 
                            name="bankName" 
                            value={financials.bankName} 
                            onChange={handleFinancialChange}
                            className="w-full bg-surface-alt/30 border border-border-subtle rounded-2xl px-4 py-3.5 text-xs font-[700] text-text-primary  tracking-wider outline-none focus:border-status-success/50 focus:ring-1 focus:ring-emerald-500/50 hover:bg-surface-alt/80 transition-all appearance-none cursor-pointer shadow-inner"
                        >
                            <option value="">Select Bank...</option>
                            {TOP_US_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <Server size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none group-hover:text-status-success transition-colors"/>
                    </div>
                </div>
                
                <div className="space-y-2">
                    <label className="text-[10px] font-[700]  text-text-muted/80 tracking-[0.2em] pl-1 drop-shadow-sm">Network</label>
                    <div className="relative group">
                        <select 
                            name="cardType" 
                            value={financials.cardType} 
                            onChange={handleFinancialChange}
                            className="w-full bg-surface-alt/30 border border-border-subtle rounded-2xl px-4 py-3.5 text-xs font-[700] text-text-primary  tracking-wider outline-none focus:border-status-success/50 focus:ring-1 focus:ring-emerald-500/50 hover:bg-surface-alt/80 transition-all appearance-none cursor-pointer shadow-inner"
                        >
                            {CARD_PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <CreditCard size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none group-hover:text-status-success transition-colors"/>
                    </div>
                </div>
            </div>

            {/* 3. Security Badge */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 backdrop-blur-md relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 rounded-xl text-status-success shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <Shield size={18} className="drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                </div>
                <div>
                    <p className="text-[10px] font-[700]  text-status-success tracking-[0.2em]">256-Bit Encrypted</p>
                    <p className="text-[10px] text-text-muted mt-0.5 tracking-wide font-bold ">Data is tokenized upon entry.</p>
                </div>
            </div>
        </div>
    );
};
