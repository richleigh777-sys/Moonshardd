import React from 'react';
import { Home, MapPin, CheckCircle2 } from 'lucide-react';

interface AddressSectionProps {
  formData: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  useShippingForBilling: boolean;
  onToggleBilling: (val: boolean) => void;
}

const inputClass = "w-full px-4 py-2.5 bg-slate-900/50 border border-border-subtle rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all shadow-inner";

export const AddressSection: React.FC<AddressSectionProps> = ({ formData, onChange, useShippingForBilling, onToggleBilling }) => {
  return (
    <div className="bg-slate-800 rounded-xl border border-border-subtle shadow-sm overflow-hidden">
      <div className="border-b border-border-subtle/50 bg-slate-800/80 px-4 py-4 flex items-center gap-3">
        <div className="p-2 bg-emerald-500/10 rounded-md">
          <Home size={18} className="text-emerald-400" />
        </div>
        <h3 className="font-bold text-white text-lg tracking-tight">Location & Address</h3>
      </div>
      
      <div className="p-4 space-y-5">
        {/* Shipping Address Container */}
        <div className="space-y-4">
          <label className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <MapPin size={14} className="text-text-muted"/> Shipping Address
          </label>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <input type="text" name="shippingAddress" value={formData.shippingAddress || ''} onChange={onChange} placeholder="Street Address" className={inputClass} />
            </div>
            <div className="w-1/3">
              <input type="text" name="shippingApt" value={formData.shippingApt || ''} onChange={onChange} placeholder="Apt / Suite (Optional)" className={inputClass} />
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <input type="text" name="shippingCity" value={formData.shippingCity || ''} onChange={onChange} placeholder="City" className={inputClass} />
            </div>
            <div className="w-1/3">
              <input type="text" name="shippingState" value={formData.shippingState || ''} onChange={onChange} placeholder="State" className={inputClass} />
            </div>
            <div className="w-1/3">
              <input type="text" name="shippingZip" value={formData.shippingZip || ''} onChange={onChange} placeholder="Zip Code" className={inputClass} />
            </div>
          </div>
        </div>
        
        <div className="pt-2">
          <label className="flex items-center gap-3 p-3 bg-surface-alt rounded-lg border border-border-subtle/50 cursor-pointer hover:bg-slate-900/50 transition-colors">
            <div className={`flex items-center justify-center w-5 h-5 rounded border ${useShippingForBilling ? 'bg-blue-500 border-blue-500' : 'bg-slate-800 border-slate-600'}`}>
              {useShippingForBilling && <CheckCircle2 size={14} className="text-white" />}
            </div>
            <input type="checkbox" checked={useShippingForBilling} onChange={(e) => onToggleBilling(e.target.checked)} className="hidden" />
            <span className="text-sm font-medium text-text-primary">Billing address matches shipping address</span>
          </label>
        </div>

        {!useShippingForBilling && (
          <div className="pt-4 border-t border-border-subtle/50 animate-in slide-in-from-top-4 duration-300 space-y-4">
            <label className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <MapPin size={14} className="text-text-muted"/> Billing Address
            </label>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <input type="text" name="billingAddress" value={formData.billingAddress || ''} onChange={onChange} placeholder="Street Address" className={inputClass} />
              </div>
              <div className="w-1/3">
                <input type="text" name="billingApt" value={formData.billingApt || ''} onChange={onChange} placeholder="Apt / Suite (Optional)" className={inputClass} />
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <input type="text" name="billingCity" value={formData.billingCity || ''} onChange={onChange} placeholder="City" className={inputClass} />
              </div>
              <div className="w-1/3">
                <input type="text" name="billingState" value={formData.billingState || ''} onChange={onChange} placeholder="State" className={inputClass} />
              </div>
              <div className="w-1/3">
                <input type="text" name="billingZip" value={formData.billingZip || ''} onChange={onChange} placeholder="Zip Code" className={inputClass} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
