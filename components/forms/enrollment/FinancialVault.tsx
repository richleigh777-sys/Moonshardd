import React from 'react';
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
    <div className="space-y-4">
        <PaymentPanel 
            financials={financials}
            setFinancials={setFinancials}
            handleCardInput={handleCardInput}
            cardStatus={cardStatus}
            cardHolderName={fullName}
        />
    </div>
);
