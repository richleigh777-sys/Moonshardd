import React from 'react';
import { Home, MapPin, Check } from 'lucide-react';

const InputBlock = ({ label, name, value, placeholder, isShort, handleIdentityChange }: any) => (
    <div className={`space-y-2 ${isShort ? 'col-span-1' : 'col-span-2 md:col-span-1'}`}>
        <label className="text-sm font-medium text-text-secondary ml-1">{label}</label>
        <input 
            name={name}
            value={value}
            onChange={handleIdentityChange}
            placeholder={placeholder}
            className="w-full bg-surface-alt/50 border border-border-subtle rounded-xl px-5 py-4 text-lg font-medium text-white placeholder-text-muted outline-none transition-all focus:border-white focus:bg-surface-alt focus:ring-1 focus:ring-white shadow-sm"
        />
    </div>
);

export function LogisticsSector({ formData, handleIdentityChange, useShippingForBilling, setUseShippingForBilling }: any) {
    const {
        shippingAddress = '',
        shippingApt = '',
        shippingCity = '',
        shippingState = '',
        shippingZip = '',
        billingAddress = '',
        billingApt = '',
        billingCity = '',
        billingState = '',
        billingZip = '',
    } = formData;

  return (
    <div className="space-y-8">
        <div>
            <h5 className="text-base font-semibold text-white mb-4 flex items-center gap-2"><MapPin size={18} className="text-indigo-400"/> Shipping Address</h5>
            <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                    <InputBlock handleIdentityChange={handleIdentityChange} label="Street Address" name="shippingAddress" value={shippingAddress} placeholder="123 Main St" isShort={false} />
                </div>
                <InputBlock handleIdentityChange={handleIdentityChange} label="Apt / Suite / Unit (Optional)" name="shippingApt" value={shippingApt} placeholder="Apt 4B" isShort={false} />
                <InputBlock handleIdentityChange={handleIdentityChange} label="City" name="shippingCity" value={shippingCity} placeholder="New York" isShort={false} />
                
                <div className="space-y-2 col-span-1">
                    <label className="text-sm font-medium text-text-secondary ml-1">State</label>
                    <select 
                        name="shippingState" 
                        value={shippingState} 
                        onChange={handleIdentityChange}
                        className="w-full bg-surface-alt/50 border border-border-subtle rounded-xl px-5 py-4 text-lg font-medium text-white placeholder-text-muted outline-none transition-all focus:border-white focus:bg-surface-alt focus:ring-1 focus:ring-white shadow-sm appearance-none"
                    >
                        <option value="">Select State</option>
                        {['CA','NY','TX','FL','IL','PA','OH','GA','NC','MI'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <InputBlock handleIdentityChange={handleIdentityChange} label="ZIP Code" name="shippingZip" value={shippingZip} placeholder="10001" isShort={true} />
            </div>
        </div>

        <div className="pt-4 border-t border-border-subtle">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                 <h5 className="text-base font-semibold text-white flex items-center gap-2"><Home size={18} className="text-blue-400"/> Billing Address</h5>
                 <button 
                    onClick={(e) => { e.preventDefault(); setUseShippingForBilling(!useShippingForBilling); }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 border ${useShippingForBilling ? 'bg-blue-500 text-white border-blue-400 shadow-lg shadow-blue-500/20' : 'bg-surface-alt border-border-subtle text-text-secondary hover:text-white hover:border-white/20'}`}
                 >
                     {useShippingForBilling && <Check size={14} />}
                     Use Shipping Address
                 </button>
            </div>

            {!useShippingForBilling && (
                <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4">
                    <div className="col-span-2">
                        <InputBlock handleIdentityChange={handleIdentityChange} label="Street Address" name="billingAddress" value={billingAddress} placeholder="123 Main St" isShort={false} />
                    </div>
                    <InputBlock handleIdentityChange={handleIdentityChange} label="Apt / Suite / Unit (Optional)" name="billingApt" value={billingApt} placeholder="Apt 4B" isShort={false} />
                    <InputBlock handleIdentityChange={handleIdentityChange} label="City" name="billingCity" value={billingCity} placeholder="New York" isShort={false} />
                    
                    <div className="space-y-2 col-span-1">
                        <label className="text-sm font-medium text-text-secondary ml-1">State</label>
                        <select 
                            name="billingState" 
                            value={billingState} 
                            onChange={handleIdentityChange}
                            className="w-full bg-surface-alt/50 border border-border-subtle rounded-xl px-5 py-4 text-lg font-medium text-white placeholder-text-muted outline-none transition-all focus:border-white focus:bg-surface-alt focus:ring-1 focus:ring-white shadow-sm appearance-none"
                        >
                            <option value="">Select State</option>
                            {['CA','NY','TX','FL','IL','PA','OH','GA','NC','MI'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <InputBlock handleIdentityChange={handleIdentityChange} label="ZIP Code" name="billingZip" value={billingZip} placeholder="10001" isShort={true} />
                </div>
            )}
        </div>
    </div>
  );
}