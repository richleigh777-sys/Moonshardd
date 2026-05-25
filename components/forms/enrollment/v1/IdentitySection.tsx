import React from 'react';
import { User, Clipboard, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card } from '../../../ui/Base';

interface IdentityProps {
  formData: any;
  handleIdentityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAgeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDobChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  useShippingForBilling: boolean;
  setUseShippingForBilling: (value: boolean) => void;
  onPasteParse?: () => Promise<void>;
}

export const IdentitySection: React.FC<IdentityProps> = ({
  formData,
  handleIdentityChange,
  handleAgeChange,
  handleDobChange,
  useShippingForBilling,
  setUseShippingForBilling,
  onPasteParse,
}) => {
  return (
    <Card variant="panel" className="shrink-0 p-5 border-border-subtle shadow-md flex flex-col bg-surface-main relative overflow-hidden rounded-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent pointer-events-none"></div>

      <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500 shadow-sm border border-indigo-500/20">
            <User size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-text-primary tracking-wide">CUSTOMER IDENTITY</h3>
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Primary Profile Information</p>
          </div>
        </div>
        {onPasteParse && (
          <button
            type="button"
            onClick={onPasteParse}
            className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-3 py-1.5 rounded-lg hover:bg-indigo-500/20 hover:text-indigo-400 border border-indigo-500/20 transition-all flex items-center shadow-sm"
          >
            <Clipboard size={14} className="mr-1.5" /> Quick Paste Focus
          </button>
        )}
      </div>

      <div className="space-y-4 relative z-10">
        {/* Full Name */}
        <div>
          <label className="text-[11px] font-bold text-text-muted tracking-widest mb-1.5 block">FULL NAME *</label>
          <div className="relative">
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleIdentityChange}
              placeholder="e.g. John Smith"
              className={`w-full bg-surface-alt/70 border rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:ring-4 focus:bg-surface-main transition-all ${
                formData.fullName.length === 0 
                  ? 'border-border-subtle focus:border-indigo-500/50 focus:ring-indigo-500/10' 
                  : formData.fullName.length < 2 
                  ? 'border-status-error focus:border-status-error/50 focus:ring-status-error/10 bg-status-error/5' 
                  : 'border-status-success focus:border-status-success/50 focus:ring-status-success/10 bg-status-success/5'
              }`}
              autoComplete="off"
            />
            {formData.fullName.length > 0 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {formData.fullName.length >= 2 ? (
                  <CheckCircle size={18} className="text-status-success" />
                ) : (
                  <AlertTriangle size={18} className="text-status-error" />
                )}
              </div>
            )}
          </div>
          {formData.fullName.length > 0 && formData.fullName.length < 2 && (
            <p className="text-xs text-status-error mt-1">Name too short (min 2 chars)</p>
          )}
        </div>

        {/* Contact Info (Row) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-text-muted tracking-widest mb-1.5 block">PHONE *</label>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleIdentityChange}
                placeholder="(555) 123-4567"
                className={`w-full bg-surface-alt/70 border rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:ring-4 focus:bg-surface-main transition-all font-mono ${
                  formData.phone.length === 0 
                    ? 'border-border-subtle focus:border-indigo-500/50 focus:ring-indigo-500/10' 
                    : formData.phone.replace(/\\D/g, '').length < 10 
                    ? 'border-status-error focus:border-status-error/50 focus:ring-status-error/10 bg-status-error/5' 
                    : 'border-status-success focus:border-status-success/50 focus:ring-status-success/10 bg-status-success/5'
                }`}
                autoComplete="off"
              />
              {formData.phone.length > 0 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {formData.phone.replace(/\\D/g, '').length >= 10 ? (
                    <CheckCircle size={18} className="text-status-success" />
                  ) : (
                    <AlertTriangle size={18} className="text-status-error" />
                  )}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold text-text-muted tracking-widest mb-1.5 block">EMAIL ADDRESS</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleIdentityChange}
              placeholder="john@example.com"
              className="w-full bg-surface-alt/70 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 focus:bg-surface-main transition-all"
              autoComplete="off"
            />
          </div>
        </div>

        {/* Age & DOB */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-text-muted tracking-widest mb-1.5 block">AGE</label>
            <input
              type="number"
              value={formData.age}
              onChange={handleAgeChange}
              placeholder="e.g. 35"
              min="18"
              max="120"
              className="w-full bg-surface-alt/70 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 focus:bg-surface-main transition-all"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-text-muted tracking-widest mb-1.5 block">DATE OF BIRTH</label>
            <input
              type="date"
              value={formData.dob}
              onChange={(e) => handleDobChange(e)}
              className="w-full bg-surface-alt/70 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 focus:bg-surface-main transition-all uppercase"
            />
          </div>
        </div>

        <div className="my-4 border-t border-border-subtle"></div>

        {/* Addresses */}
        <div>
          <label className="text-[11px] font-bold text-text-muted tracking-widest mb-1.5 block">SHIPPING ADDRESS</label>
          <input
            type="text"
            name="shippingAddress"
            value={formData.shippingAddress}
            onChange={handleIdentityChange}
            placeholder="123 Main St, City, State 12345"
            className="w-full bg-surface-alt/70 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 focus:bg-surface-main transition-all"
            autoComplete="off"
          />
        </div>

        {/* Use Shipping for Billing */}
        <div className="flex items-center gap-3 py-2 bg-surface-alt/30 px-4 rounded-xl border border-border-subtle/50">
          <input
            type="checkbox"
            id="useSameBilling"
            checked={useShippingForBilling}
            onChange={(e) => setUseShippingForBilling(e.target.checked)}
            className="w-4 h-4 rounded border-border-subtle cursor-pointer text-indigo-500 focus:ring-indigo-500/30 bg-surface-alt"
          />
          <label htmlFor="useSameBilling" className="text-xs font-bold text-text-primary cursor-pointer flex-1 py-2">
            Billing Address is same as Shipping Address
          </label>
        </div>

        {/* Billing Address */}
        {!useShippingForBilling && (
          <div className="animate-in slide-in-from-top-2 fade-in duration-300">
            <label className="text-[11px] font-bold text-text-muted tracking-widest mb-1.5 block">BILLING ADDRESS</label>
            <input
              type="text"
              name="billingAddress"
              value={formData.billingAddress}
              onChange={handleIdentityChange}
              placeholder="456 Oak Ave, City, State 67890"
              className="w-full bg-surface-alt/70 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 focus:bg-surface-main transition-all"
              autoComplete="off"
            />
          </div>
        )}

        {/* Height & Weight */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <label className="text-[11px] font-bold text-text-muted tracking-widest mb-1.5 block">HEIGHT</label>
            <input
              type="text"
              name="height"
              value={formData.height}
              onChange={handleIdentityChange}
              placeholder="5'10&quot;"
              className="w-full bg-surface-alt/70 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 focus:bg-surface-main transition-all"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-text-muted tracking-widest mb-1.5 block">WEIGHT</label>
            <input
              type="text"
              name="weight"
              value={formData.weight}
              onChange={handleIdentityChange}
              placeholder="180 lbs"
              className="w-full bg-surface-alt/70 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 focus:bg-surface-main transition-all"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
