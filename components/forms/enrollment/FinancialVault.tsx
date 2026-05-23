import React from 'react';
import { Lock } from 'lucide-react';
import { PaymentPanel } from './PaymentPanel';

interface FinancialVaultProps {
    financials: {
        bankName: string;
        cardType: string;
        cardNumber: string;
        cardExpiry: string;
        cardCvv: string;
    };
    setFinancials: (f: any) => void;
    handleCardInput: (val: string) => void;
    cardStatus: 'neutral' | 'valid' | 'invalid';
    fullName: string;
}

export const FinancialVault: React.FC<FinancialVaultProps> = ({
    financials, setFinancials, handleCardInput, cardStatus, fullName
}) => (
    <div className="p-4 space-y-6">
        <div className="flex items-center gap-3 mb-2 bg-gradient-to-r from-emerald-500/10 to-transparent p-3 rounded-2xl border border-emerald-500/20">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <Lock size={16} className="text-status-success drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            </div>
            <div>
                <span className="text-xs font-[700]  text-status-success tracking-[0.2em] block drop-shadow-sm">Financial Vault Active</span>
                <span className="text-[10px] text-text-muted font-bold tracking-widest  mt-0.5 block">Isolated Secure Environment</span>
            </div>
        </div>
        <PaymentPanel 
            financials={financials}
            setFinancials={setFinancials}
            handleCardInput={handleCardInput}
            cardStatus={cardStatus}
            cardHolderName={fullName}
        />
    </div>
);
