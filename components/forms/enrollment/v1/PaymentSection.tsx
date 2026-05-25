import React from 'react';
import { Lock, CreditCard, Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card } from '../../../ui/Base';

interface PaymentSectionProps {
  financials: any;
  handleFinancialChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  cardStatus: 'neutral' | 'valid' | 'invalid';
  showCvv: boolean;
  setShowCvv: (value: boolean) => void;
  bankOptions: string[];
  cardProviders: string[];
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({
  financials,
  handleFinancialChange,
  cardStatus,
  showCvv,
  setShowCvv,
  bankOptions,
  cardProviders,
}) => {
  return (
    <Card
      variant="panel"
      className="shrink-0 p-5 border-border-subtle shadow-md flex flex-col bg-surface-main h-auto relative group overflow-hidden rounded-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent pointer-events-none"></div>

      <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-5 shrink-0 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-xl text-status-success shadow-sm border border-emerald-500/20">
            <Lock size={18} strokeWidth={2.5} />
          </div>
          <div>
             <h3 className="text-sm font-black text-text-primary tracking-wide">CARD INFORMATION</h3>
             <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Secure Agent Entry</p>
          </div>
        </div>
        {cardStatus === 'valid' && (
          <span className="text-xs font-bold text-status-success bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 flex items-center gap-1.5 shadow-sm">
            <CheckCircle size={14} /> VALID FORMAT
          </span>
        )}
      </div>

      <div className="space-y-4 relative z-10">
        {/* Bank & Card Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-text-muted tracking-widest mb-1.5 block">ISSUING BANK</label>
            <select
              name="bankName"
              value={financials.bankName}
              onChange={handleFinancialChange}
              className="w-full bg-surface-alt/70 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 focus:bg-surface-main transition-all cursor-pointer"
            >
              <option value="">Select Bank...</option>
              {bankOptions.map((bank) => (
                <option key={bank} value={bank}>
                  {bank}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-text-muted tracking-widest mb-1.5 block">CARD NETWORK</label>
            <select
              name="cardType"
              value={financials.cardType}
              onChange={handleFinancialChange}
              className="w-full bg-surface-alt/70 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 focus:bg-surface-main transition-all cursor-pointer"
            >
              <option value="">Select Type...</option>
              {cardProviders.map((provider) => (
                <option key={provider} value={provider}>
                  {provider}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Card Number */}
        <div>
          <label className="text-[11px] font-bold text-text-muted tracking-widest mb-1.5 flex justify-between">
            <span>CARD NUMBER</span>
            {cardStatus === 'invalid' && <span className="text-status-error text-[10px]">INVALID LENGTH</span>}
          </label>
          <div className="relative group">
            <CreditCard
              className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${cardStatus === 'valid' ? 'text-status-success' : 'text-text-muted group-focus-within:text-emerald-500'}`}
              size={18}
            />
            <input
              type="text"
              name="cardNumber"
              value={financials.cardNumber}
              onChange={handleFinancialChange}
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              className={`w-full bg-surface-alt/70 border rounded-xl pl-11 pr-10 py-3 text-sm font-mono tracking-widest outline-none transition-all shadow-inner ${
                cardStatus === 'valid'
                  ? 'border-status-success/50 focus:border-status-success focus:ring-4 focus:ring-status-success/10 focus:bg-surface-main text-text-primary'
                  : cardStatus === 'invalid'
                  ? 'border-status-error/50 focus:border-status-error focus:ring-4 focus:ring-status-error/10 focus:bg-surface-main text-text-primary'
                  : 'border-border-subtle focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 focus:bg-surface-main text-text-primary'
              }`}
            />
            {cardStatus === 'valid' && (
              <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-status-success" size={16} />
            )}
            {cardStatus === 'invalid' && (
              <AlertTriangle className="absolute right-4 top-1/2 -translate-y-1/2 text-status-error" size={16} />
            )}
          </div>
        </div>

        {/* Expiry & CVV */}
        <div className="grid grid-cols-2 lg:grid-cols-[2fr_1fr] gap-4">
          <div>
            <label className="text-[11px] font-bold text-text-muted tracking-widest mb-1.5 block">EXPIRY (MM/YY)</label>
            <input
              type="text"
              name="cardExpiry"
              value={financials.cardExpiry}
              onChange={handleFinancialChange}
              placeholder="MM/YY"
              maxLength={5}
              className="w-full bg-surface-alt/70 border border-border-subtle rounded-xl px-4 py-3 text-sm font-mono text-center outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 focus:bg-surface-main transition-all"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-text-muted tracking-widest mb-1.5 flex justify-between items-center">
              <span>CVV</span>
              <button
                type="button"
                onClick={() => setShowCvv(!showCvv)}
                className="text-[10px] text-emerald-500 hover:text-emerald-400 font-bold uppercase transition-colors"
              >
                {showCvv ? 'HIDE' : 'SHOW'}
              </button>
            </label>
            <div className="relative">
              <input
                type={showCvv ? 'text' : 'password'}
                name="cardCvv"
                value={financials.cardCvv}
                onChange={handleFinancialChange}
                placeholder="***"
                maxLength={4}
                className="w-full bg-surface-alt/70 border border-border-subtle rounded-xl px-4 py-3 text-sm font-mono text-center outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 focus:bg-surface-main transition-all"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border-subtle flex items-start gap-2 text-text-muted bg-surface-alt/40 p-3 rounded-xl border border-border-subtle/50">
          <div className="p-1 rounded-full bg-surface-main text-text-muted">
            <Lock size={12}/>
          </div>
          <p className="text-xs leading-relaxed font-medium">
            Details remain encrypted locally. Admin personnel will review and process payment through terminal.
          </p>
        </div>
      </div>
    </Card>
  );
};
