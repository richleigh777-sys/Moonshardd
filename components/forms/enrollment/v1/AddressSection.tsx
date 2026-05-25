import React from 'react';
import { Home, MapPin, CheckCircle2 } from 'lucide-react';

interface AddressSectionProps {
  formData: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  useShippingForBilling: boolean;
  onToggleBilling: (val: boolean) => void;
}

const inputClass = "w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all shadow-inner";

export const AddressSection: React.FC<AddressSectionProps> = ({ formData, onChange, useShippingForBilling, onToggleBilling }) => {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm overflow-hidden">
      <div className="border-b border-slate-700/50 bg-slate-800/80 px-6 py-4 flex items-center gap-3">
        <div className="p-2 bg-emerald-500/10 rounded-md">
          <Home size={18} className="text-emerald-400" />
        </div>
        <h3 className="font-bold text-white text-lg tracking-tight">Location & Address</h3>
      </div>
      
      <div className="p-6 space-y-5">
        <div>
          <label className="text-sm font-semibold text-slate-300 mb-1.5 flex items-center gap-2">
            <MapPin size={14} className="text-slate-500"/> Shipping Address
          </label>
          <input type="text" name="shippingAddress" value={formData.shippingAddress} onChange={onChange} placeholder="123 Main St, City, State ZIP"
            className={inputClass} />
        </div>
        
        <div className="pt-2">
          <label className="flex items-center gap-3 p-3 bg-slate-900/30 rounded-lg border border-slate-700/50 cursor-pointer hover:bg-slate-900/50 transition-colors">
            <div className={`flex items-center justify-center w-5 h-5 rounded border ${useShippingForBilling ? 'bg-blue-500 border-blue-500' : 'bg-slate-800 border-slate-600'}`}>
              {useShippingForBilling && <CheckCircle2 size={14} className="text-white" />}
            </div>
            <input type="checkbox" checked={useShippingForBilling} onChange={(e) => onToggleBilling(e.target.checked)} className="hidden" />
            <span className="text-sm font-medium text-slate-200">Billing address matches shipping address</span>
          </label>
        </div>

        {!useShippingForBilling && (
          <div className="pt-4 border-t border-slate-700/50 animate-in slide-in-from-top-4 duration-300">
            <label className="text-sm font-semibold text-slate-300 mb-1.5 flex items-center gap-2">
              <MapPin size={14} className="text-slate-500"/> Billing Address
            </label>
            <input type="text" name="billingAddress" value={formData.billingAddress} onChange={onChange} placeholder="456 Billing Ave, City, State ZIP"
              className={inputClass} />
          </div>
        )}
      </div>
    </div>
  );
};
