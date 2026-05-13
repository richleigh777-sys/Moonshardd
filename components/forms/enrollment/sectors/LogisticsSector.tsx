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
        <div className="group/logistics relative p-4 bg-black/40 rounded-xl border border-white/5 shadow-inner overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/[0.02] to-transparent pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400 border border-indigo-500/30">
                        <MapPin size={14} strokeWidth={2.5}/>
                    </div>
                    <div>
                        <h4 className="text-[9px] font-black uppercase text-indigo-300 tracking-[0.15em] italic leading-none">Logistics</h4>
                    </div>
                </div>
                <button 
                    onClick={() => setUseShippingForBilling(!useShippingForBilling)} 
                    className={`
                        text-[8px] font-black uppercase px-3 py-1 rounded-lg border transition-all duration-500 flex items-center gap-1.5
                        ${useShippingForBilling 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                            : 'bg-white/5 text-text-muted border-white/5 hover:text-white hover:border-white/20'}
                    `}
                >
                    {useShippingForBilling ? <ShieldCheck size={10} strokeWidth={3}/> : <Globe size={10}/>}
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
                        className="h-9 text-xs font-bold bg-black/40"
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
                            className="h-9 text-xs font-bold bg-black/40"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};