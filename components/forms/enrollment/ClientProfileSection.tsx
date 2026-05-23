import React from 'react';
import { User, MapPin, Phone, Mail, Calendar, CheckCircle, Globe, Sparkles } from 'lucide-react';
import { Card } from '../../ui/Base';
import { FormLabel, FormInput } from './shared/FormComponents';

interface ClientProfileSectionProps {
    formData: any;
    handleIdentityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleAgeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDobChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    useShippingForBilling: boolean;
    setUseShippingForBilling: (val: boolean) => void;
    customerTime: string | null;
    onPasteParse?: () => void;
}

export const ClientProfileSection: React.FC<ClientProfileSectionProps> = ({
    formData, handleIdentityChange, handleAgeChange, handleDobChange,
    useShippingForBilling, setUseShippingForBilling, customerTime, onPasteParse
}) => {
    return (
        <div className="flex gap-4 flex-1 min-h-0">
            {/* IDENTITY COLUMN */}
            <Card variant="panel" className="flex-1 p-0 border-border-subtle flex flex-col bg-surface-main overflow-hidden relative group">
                <div className="p-2 border-b border-border-subtle flex items-center justify-between bg-surface-alt/20 shrink-0">
                    <div className="flex items-center gap-1.5">
                        <div className="p-1 bg-accent-primary/10 rounded-md text-accent-primary">
                            <User size={16} />
                        </div>
                        <h3 className="text-xs font-[700]  text-text-primary tracking-widest">Client Identity</h3>
                    </div>
                    {onPasteParse && (
                        <button onClick={onPasteParse} className="text-sm font-bold text-accent-primary hover:bg-accent-primary/10 px-3 py-1.5 rounded transition-all flex items-center gap-1 border border-transparent hover:border-accent-primary/20">
                            <Sparkles size={16} /> AUTO-PARSE
                        </button>
                    )}
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <FormLabel icon={User}>Full Name</FormLabel>
                            <FormInput name="fullName" value={formData.fullName} onChange={handleIdentityChange} placeholder="First Last" className="font-bold h-7 text-xs" />
                        </div>
                        <div>
                            <FormLabel icon={Phone}>Direct Line</FormLabel>
                            <FormInput name="phone" value={formData.phone} onChange={handleIdentityChange} placeholder="(555) 000-0000" className="font-mono tracking-wide h-7 text-xs" />
                        </div>
                    </div>
                    
                    <div>
                        <FormLabel icon={Mail}>Email Uplink</FormLabel>
                        <FormInput name="email" value={formData.email} onChange={handleIdentityChange} placeholder="client@email.com" className="h-7 text-xs" />
                    </div>

                    <div className="grid grid-cols-4 gap-2 p-2 bg-surface-alt/30 rounded-lg border border-border-subtle/50">
                        <div><FormLabel icon={Calendar}>DOB</FormLabel><FormInput type="date" name="dob" value={formData.dob} onChange={handleDobChange} className="text-xs h-7 px-1" /></div>
                        <div><FormLabel icon={User}>Age</FormLabel><FormInput name="age" value={formData.age} onChange={handleAgeChange} className="text-center font-mono h-7 text-xs" placeholder="00" /></div>
                        <div><FormLabel>Height</FormLabel><FormInput name="height" value={formData.height} onChange={handleIdentityChange} placeholder="e.g. 5'10" className="h-7 text-xs" /></div>
                        <div><FormLabel>Weight</FormLabel><FormInput name="weight" value={formData.weight} onChange={handleIdentityChange} placeholder="e.g. 180" className="h-7 text-xs" /></div>
                    </div>
                </div>
            </Card>

            {/* LOGISTICS COLUMN */}
            <Card variant="panel" className="flex-1 p-0 border-border-subtle flex flex-col bg-surface-main overflow-hidden">
                <div className="p-2 border-b border-border-subtle flex items-center justify-between bg-surface-alt/20 shrink-0">
                    <div className="flex items-center gap-1.5">
                        <div className="p-1 bg-accent-secondary/10 rounded-md text-accent-secondary">
                            <MapPin size={16} />
                        </div>
                        <h3 className="text-xs font-[700]  text-text-primary tracking-widest">Logistics</h3>
                    </div>
                    {customerTime && (
                        <span className="text-sm font-mono text-text-muted bg-surface-alt px-3 py-1.5 rounded border border-border-subtle flex items-center gap-1">
                            <Globe size={16}/> {customerTime}
                        </span>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                    <div>
                        <FormLabel>Shipping Manifest</FormLabel>
                        <textarea 
                            name="shippingAddress" 
                            value={formData.shippingAddress} 
                            onChange={handleIdentityChange as any} 
                            placeholder="Street, City, State ZIP" 
                            className="w-full h-14 bg-surface-alt/40 border border-border-subtle rounded-lg p-2 text-xs font-medium text-text-primary outline-none focus:border-accent-primary focus:bg-surface-main transition-all resize-none shadow-inner leading-tight"
                        />
                    </div>

                    <div className="space-y-2">
                        <button 
                            onClick={() => setUseShippingForBilling(!useShippingForBilling)} 
                            className={`w-full py-1.5 px-2 rounded-lg border flex items-center justify-between transition-all ${useShippingForBilling ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600' : 'bg-surface-alt border-border-subtle text-text-muted hover:border-text-muted'}`}
                        >
                            <span className="text-xs font-[700]  tracking-widest flex items-center gap-2">
                                {useShippingForBilling ? <CheckCircle size={16}/> : <div className="w-2.5 h-2.5 rounded-full border border-current"></div>}
                                Billing Matches Shipping
                            </span>
                        </button>

                        {!useShippingForBilling && (
                            <div className="animate-in slide-in-from-top-2 fade-in">
                                <FormLabel>Billing Address</FormLabel>
                                <textarea 
                                    name="billingAddress" 
                                    value={formData.billingAddress} 
                                    onChange={handleIdentityChange as any} 
                                    placeholder="Billing Address..." 
                                    className="w-full h-12 bg-surface-alt/40 border border-border-subtle rounded-lg p-2 text-xs font-medium text-text-primary outline-none focus:border-accent-primary focus:bg-surface-main transition-all resize-none shadow-inner leading-tight"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};
