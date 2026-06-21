import React from 'react';
import { Lock, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';
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
  bankOptions: _bankOptions,
  cardProviders: _cardProviders,
}) => {
  return (
    <Card
      variant="refraction"
      className="shrink-0 p-5 border-border-subtle shadow-md flex flex-col bg-surface-main h-auto relative group overflow-hidden rounded-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent pointer-events-none"></div>

      <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-5 shrink-0 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-xl text-status-success shadow-sm border border-emerald-500/20">
            <Lock size={18} strokeWidth={2.5} />
          </div>
          <div>
             <h3 className="text-sm font-bold text-text-primary tracking-wide">CARD INFORMATION</h3>
             <p className="text-sm text-text-muted uppercase tracking-wider font-semibold">Secure Agent Entry</p>
          </div>
        </div>
        {cardStatus === 'valid' && (
          <span className="text-sm font-bold text-status-success bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 flex items-center gap-1.5 shadow-sm">
            <CheckCircle size={14} /> VALID FORMAT
          </span>
        )}
      </div>

      <div className="space-y-4 relative z-10">
        {/* Bank & Card Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              name="bankName"
              readOnly
              value={financials.bankName}
              placeholder="Auto-detected Issuing Bank"
              className="w-full bg-surface-alt/70 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-not-allowed opacity-80"
            />
          </div>

          <div>
            <select
              name="cardType"
              value={financials.cardType}
              onChange={handleFinancialChange}
              className="w-full bg-surface-alt/70 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 focus:bg-surface-main transition-all cursor-pointer"
            >
              <option value="">Select Card Type...</option>
              <option value="Credit">Credit Card</option>
              <option value="Debit">Debit Card</option>
            </select>
          </div>
        </div>

        {/* Card Number */}
        <div>
          <div className="relative group">
            <CreditCard
              className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${cardStatus === 'valid' ? 'text-status-success' : 'text-text-muted group-focus-within:text-emerald-500'}`}
              size={18}
            />
            <input
              type="text"
              name="cardNumber"
              autoComplete="none" data-lpignore="true" data-1p-ignore="true" data-form-type="other"
              value={financials.cardNumber}
              onChange={(e) => {
                const val = e.target.value;
                const digits = val.replace(/\D/g, '');
                const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
                handleFinancialChange({
                  ...e,
                  target: { ...e.target, name: 'cardNumber', value: formatted }
                } as any);
              }}
              placeholder="Card Number"
              maxLength={19}
              className={`w-full bg-surface-alt/70 border rounded-xl pl-11 pr-10 py-3 text-sm font-mono tracking-wide outline-none transition-all shadow-inner ${
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
              <span className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-status-error">
                <span className="text-sm font-bold">INVALID LENGTH</span>
                <AlertTriangle size={16} />
              </span>
            )}
          </div>
        </div>

        {/* Expiry & CVV */}
        <div className="grid grid-cols-2 lg:grid-cols-[2fr_1fr] gap-4 mt-2">
          <div>
            <div className="flex items-center gap-2">
              <select
                name="cardExpMonth"
                autoComplete="none" data-lpignore="true" data-1p-ignore="true" data-form-type="other"
                value={financials.cardExpMonth || ''}
                onChange={handleFinancialChange}
                className="w-1/2 bg-surface-alt/70 border border-border-subtle rounded-xl px-2 py-3 text-sm font-mono text-center outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer"
              >
                <option value="">Month</option>
                {Array.from({length: 12}).map((_, i) => (
                  <option key={i+1} value={(i+1).toString().padStart(2, '0')}>{(i+1).toString().padStart(2, '0')}</option>
                ))}
              </select>
              <span className="text-text-muted font-bold text-lg">/</span>
              <select
                name="cardExpYear"
                autoComplete="none" data-lpignore="true" data-1p-ignore="true" data-form-type="other"
                value={financials.cardExpYear || ''}
                onChange={handleFinancialChange}
                className="w-1/2 bg-surface-alt/70 border border-border-subtle rounded-xl px-2 py-3 text-sm font-mono text-center outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer"
              >
                <option value="">Year</option>
                {Array.from({length: 9}).map((_, i) => (
                  <option key={i} value={(2026 + i).toString()}>{2026 + i}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="relative">
              <input
                type={showCvv ? 'text' : 'password'}
                name="cardCvv"
                autoComplete="none" data-lpignore="true" data-1p-ignore="true" data-form-type="other"
                value={financials.cardCvv}
                onChange={handleFinancialChange}
                placeholder="CVV"
                maxLength={4}
                className="w-full bg-surface-alt/70 border border-border-subtle rounded-xl px-4 py-3 pb-3 text-sm font-mono text-center outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 focus:bg-surface-main transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCvv(!showCvv)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-emerald-500 hover:text-emerald-400 font-bold uppercase transition-colors"
                title="Toggle CVV Visibility"
              >
                {showCvv ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border-subtle flex items-start gap-2 text-text-muted bg-surface-alt/40 p-3 rounded-xl border border-border-subtle/50">
          <div className="p-1 rounded-full bg-surface-main text-text-muted">
            <Lock size={12}/>
          </div>
          <p className="text-sm leading-relaxed font-medium">
            Details remain encrypted locally. Admin personnel will review and process payment through a secure gateway.
          </p>
        </div>
      </div>
    </Card>
  );
};
