import React from 'react';
import { PaymentPanel } from './PaymentPanel';

export const FinancialVault = ({
    financials, setFinancials, handleCardInput, cardStatus, error
}: any) => (
    <PaymentPanel 
        financials={financials}
        setFinancials={setFinancials}
        handleCardInput={handleCardInput}
        cardStatus={cardStatus}
        error={error}
    />
);