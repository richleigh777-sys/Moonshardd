import React from 'react';
import { MapPin, ShieldCheck, Globe, Crosshair } from 'lucide-react';
import { FormInput, FormLabel } from '../shared/FormComponents';

interface Props {
    formData: any;
    handleIdentityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    useShippingForBilling: boolean;
    setUseShippingForBilling: (val: boolean) => void;
}

export const LogisticsSector: React.FC<Props> = ({ formData, handleIdentityChange, useShippingForBilling, setUseShippingForBilling }) => {
    return (
        <div className="group/logistics relative p-4 bg-surface-alt/40 rounded-xl border border-border-subtle shadow-inner overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/[0.02] to-transparent pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-500/20 rounded-lg text-accent-secondary border border-indigo-500/30">
                        <MapPin size={16} strokeWidth={2.5}/>
                    </div>
                    <div>
                        <h4 className="text-xs font-[700]  text-indigo-300 tracking-[0.15em] italic leading-none">Logistics</h4>
                    </div>
                </div>
                <button 
                    onClick={() => setUseShippingForBilling(!useShippingForBilling)} 
                    className={`
                        text-sm font-[700]  px-3 py-1 rounded-lg border transition-all duration-500 flex items-center gap-1.5
                        ${useShippingForBilling 
                            ? 'bg-emerald-500/20 text-status-success border-status-success/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                            : 'bg-surface-highlight text-text-muted border-border-subtle hover:text-text-primary hover:border-border-strong'}
                    `}
                >
                    {useShippingForBilling ? <ShieldCheck size={16} strokeWidth={3}/> : <Globe size={16}/>}
                    Unified
                </button>
            </div>

            <div className="space-y-3 relative z-10">
                <div className="space-y-1">
                    <FormLabel icon={Crosshair}>Target</FormLabel>
                    <FormInput 
                        name="shippingAddress" 
                        value={formData.shippingAddress} 
                        onChange={handleIdentityChange} 
                        placeholder="Enter coordinates..." 
                        className="h-9 text-xs font-bold bg-surface-alt/40"
                        status={formData.shippingAddress.length > 10 ? 'valid' : 'default'}
                    />
                </div>
                {!useShippingForBilling && (
                    <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
                        <FormLabel icon={ShieldCheck}>Billing</FormLabel>
                        <FormInput 
                            name="billingAddress" 
                            value={formData.billingAddress} 
                            onChange={handleIdentityChange} 
                            placeholder="Alternate destination..." 
                            className="h-9 text-xs font-bold bg-surface-alt/40"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};