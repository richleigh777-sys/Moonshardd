const fs = require('fs');

const paymentPanelContent = `import React from 'react';
import { CreditCard, Calendar, LockKeyhole } from 'lucide-react';

export function PaymentPanel({ financials, setFinancials, handleCardInput, cardStatus, error }: any) {
  return (
    <div className="space-y-6">
        <h4 className="text-sm font-bold text-white tracking-wide uppercase">Payment Method</h4>
        
        {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-2xl text-sm font-medium">
                {error}
            </div>
        )}

        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary ml-1">Card Number</label>
                <div className="relative">
                    <input 
                        value={financials.cardNumber}
                        onChange={(e) => handleCardInput(e.target.value)}
                        placeholder="0000 0000 0000 0000"
                        className={\`w-full bg-surface-alt/50 border \${cardStatus === 'invalid' ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : 'border-white/5 focus:border-white focus:ring-white'} rounded-2xl pl-12 pr-5 py-4 text-lg font-medium text-white placeholder-text-muted outline-none transition-all focus:bg-surface-alt focus:ring-1 shadow-sm font-mono\`}
                    />
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary ml-1">Expiration</label>
                    <div className="relative">
                        <input 
                            value={financials.cardExpiry}
                            onChange={(e) => setFinancials({...financials, cardExpiry: e.target.value})}
                            placeholder="MM/YY"
                            className="w-full bg-surface-alt/50 border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-lg font-medium text-white placeholder-text-muted outline-none transition-all focus:border-white focus:bg-surface-alt focus:ring-1 focus:ring-white shadow-sm font-mono"
                        />
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary ml-1">CVV / CVC</label>
                    <div className="relative">
                        <input 
                            value={financials.cardCvv}
                            onChange={(e) => setFinancials({...financials, cardCvv: e.target.value})}
                            placeholder="123"
                            type="password"
                            maxLength={4}
                            className="w-full bg-surface-alt/50 border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-lg font-medium text-white placeholder-text-muted outline-none transition-all focus:border-white focus:bg-surface-alt focus:ring-1 focus:ring-white shadow-sm font-mono"
                        />
                        <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}`;

fs.writeFileSync('./components/forms/enrollment/PaymentPanel.tsx', paymentPanelContent);

const financialVaultContent = `import React from 'react';
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
);`;

fs.writeFileSync('./components/forms/enrollment/FinancialVault.tsx', financialVaultContent);
console.log('Payment done');
