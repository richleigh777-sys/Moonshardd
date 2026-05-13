
import React, { useState } from 'react';
import { Shield, Server, CreditCard } from 'lucide-react';
import { TOP_US_BANKS, CARD_PROVIDERS } from '../../../constants';
import { formatExpiry } from '../../../views/utils/crmLogic';
import { SpectralRefractionCard } from './sectors/SpectralRefractionCard';

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
    const [showNumbers, setShowNumbers] = useState(false);
    
    const handleFinancialChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFinancials((prev: any) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-6">
            
            {/* 1. Card Visualizer */}
            <div className="relative group">
                <div className={`absolute -inset-1 bg-gradient-to-b ${cardStatus === 'valid' ? 'from-emerald-500/20 to-transparent' : cardStatus === 'invalid' ? 'from-rose-500/20 to-transparent' : 'from-indigo-500/20 to-transparent'} blur-xl opacity-50 transition-colors duration-1000`}></div>
                <SpectralRefractionCard 
                    financials={financials}
                    cardStatus={cardStatus}
                    handleCardInput={handleCardInput}
                    setFinancials={setFinancials}
                    formatExpiry={formatExpiry}
                    cardHolderName={cardHolderName}
                    showNumbers={showNumbers}
                    setShowNumbers={setShowNumbers}
                />
            </div>

            {/* 2. Metadata Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-text-muted/60 tracking-widest pl-1">Banking Inst.</label>
                    <div className="relative group">
                        <select 
                            name="bankName" 
                            value={financials.bankName} 
                            onChange={handleFinancialChange}
                            className="w-full bg-surface-alt/50 border border-border-subtle rounded-xl px-3 py-3 text-[10px] font-black text-text-primary uppercase tracking-wider outline-none focus:border-border-subtle/80 hover:bg-surface-alt transition-all appearance-none cursor-pointer"
                        >
                            <option value="">Select Bank...</option>
                            {TOP_US_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <Server size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"/>
                    </div>
                </div>
                
                <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-text-muted/60 tracking-widest pl-1">Network</label>
                    <div className="relative group">
                        <select 
                            name="cardType" 
                            value={financials.cardType} 
                            onChange={handleFinancialChange}
                            className="w-full bg-surface-alt/50 border border-border-subtle rounded-xl px-3 py-3 text-[10px] font-black text-text-primary uppercase tracking-wider outline-none focus:border-border-subtle/80 hover:bg-surface-alt transition-all appearance-none cursor-pointer"
                        >
                            {CARD_PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <CreditCard size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"/>
                    </div>
                </div>
            </div>

            {/* 3. Security Badge */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-500">
                    <Shield size={14} />
                </div>
                <div>
                    <p className="text-[9px] font-black uppercase text-emerald-500 tracking-widest">256-Bit Encrypted</p>
                    <p className="text-[8px] text-text-muted font-medium">Data is tokenized upon entry.</p>
                </div>
            </div>
        </div>
    );
};
