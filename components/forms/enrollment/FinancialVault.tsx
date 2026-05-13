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
    <div className="p-6 space-y-6 xl:flex-1 xl:overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-2 mb-2">
            <Lock size={12} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Financial Vault Active</span>
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
