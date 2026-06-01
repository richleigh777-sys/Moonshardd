import React, { useMemo } from 'react';
import { User, Phone, Mail, Calendar, Activity, Heart, RefreshCw, AlertTriangle } from 'lucide-react';
import { FormInput, FormLabel } from '../shared/FormComponents';
import { useSystem } from '../../../../hooks/useSystem';
import { useCRM } from '../../../../hooks/useCRM';

interface Props {
    formData: any;
    handleIdentityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDobChange: (val: string) => void;
    handleAgeChange: (val: string) => void;
    autoFillFromCustomer: (customer: any) => void;
}

export const BiographicalSector: React.FC<Props> = ({ formData, handleIdentityChange, handleDobChange, handleAgeChange, autoFillFromCustomer }) => {
    const { initiateCall } = useSystem();
    const { systemConfig, customers, sales } = useCRM();

    const matchedCustomer = useMemo(() => {
        const cleanPhone = formData.phone?.replace(/\D/g, '');
        if (cleanPhone?.length >= 10) {
            return customers.find(c => c.phone?.replace(/\D/g, '') === cleanPhone);
        }
        return null;
    }, [formData.phone, customers]);

    const recentPurchase = useMemo(() => {
        if (!matchedCustomer) return null;
        const recentDateLimit = Date.now() - (14 * 24 * 60 * 60 * 1000); // 14 days
        return sales.find(s => 
            s.phone?.replace(/\D/g, '') === matchedCustomer.phone?.replace(/\D/g, '') &&
            s.timestamp > recentDateLimit
        );
    }, [matchedCustomer, sales]);

    const handlePhonePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pastedText = e.clipboardData.getData('text');
        const cleanPhone = pastedText.replace(/\D/g, '');
        if (cleanPhone.length >= 10) {
            const customer = customers.find(c => c.phone?.replace(/\D/g, '') === cleanPhone);
            if (customer) {
                // We use setTimeout to ensure it happens after the paste event's default onChange
                setTimeout(() => {
                    autoFillFromCustomer({ 
                        ...customer, 
                        firstName: customer.firstName || (customer.name || '').split(' ')[0], 
                        lastName: customer.lastName || (customer.name || '').split(' ').slice(1).join(' '),
                        phone: cleanPhone // ensure it populates
                    });
                }, 10);
            }
        }
    };

    return (
        <div className="flex flex-col gap-3">
            {recentPurchase && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl flex items-start gap-2 animate-in slide-in-from-top-2">
                    <AlertTriangle size={16} className="text-amber-500" />
                    <div>
                        <p className="text-xs font-bold text-amber-500">Duplicate Order Warning</p>
                        <p className="text-[10px] text-amber-500/80 mt-0.5">Customer purchased a package {Math.floor((Date.now() - recentPurchase.timestamp) / (24 * 60 * 60 * 1000))} days ago. Verify if this is an intentional reorder.</p>
                    </div>
                </div>
            )}
            {matchedCustomer && (
                <div className="bg-indigo-500/10 border border-indigo-500/30 p-2 rounded-xl flex items-center justify-between animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400">
                            <User size={14} />
                        </div>
                        <div>
                            <p className="text-[10px] text-indigo-300/70 font-semibold tracking-wider">CRM RECORD FOUND</p>
                            <p className="text-xs font-bold text-indigo-300">{matchedCustomer.fullName || matchedCustomer.name}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => autoFillFromCustomer({ ...matchedCustomer, firstName: matchedCustomer.firstName || (matchedCustomer.name || '').split(' ')[0], lastName: matchedCustomer.lastName || (matchedCustomer.name || '').split(' ').slice(1).join(' ') })}
                        className="flex items-center gap-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs px-3 py-1.5 rounded-lg transition-colors font-bold"
                    >
                        <RefreshCw size={12} />
                        Auto-Fill Profile
                    </button>
                </div>
            )}
            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <FormLabel icon={User}>First Name</FormLabel>
                        <FormInput 
                            name="firstName" 
                            value={formData.firstName || ''} 
                            onChange={handleIdentityChange} 
                            placeholder="First Name..." 
                            className="text-xs font-[700] h-9"
                            status={formData.firstName?.length > 0 ? (formData.firstName.length >= 2 ? 'valid' : 'invalid') : 'default'}
                        />
                    </div>
                    <div className="space-y-1">
                        <FormLabel icon={User} className="invisible">Last Name</FormLabel>
                        <FormInput 
                            name="lastName" 
                            value={formData.lastName || ''} 
                            onChange={handleIdentityChange} 
                            placeholder="Last Name..." 
                            className="text-xs font-[700] h-9"
                            status={formData.lastName?.length > 0 ? (formData.lastName.length >= 2 ? 'valid' : 'invalid') : 'default'}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <FormLabel icon={Phone}>Phone Number</FormLabel>
                            {systemConfig.telephonyEnabled && formData.phone.length >= 10 && (
                                <button 
                                    onClick={() => initiateCall(formData.phone)}
                                    className="text-[10px] font-bold text-status-success bg-emerald-500/10 px-2 rounded hover:bg-emerald-500/20 transition-colors  tracking-wider"
                                >
                                    DIAL
                                </button>
                            )}
                        </div>
                        <FormInput 
                            name="phone" 
                            value={formData.phone} 
                            onChange={handleIdentityChange} 
                            onPaste={handlePhonePaste}
                            placeholder="(000) 000-0000" 
                            className="font-mono h-9 tracking-tight text-xs"
                            status={formData.phone.length > 0 ? (formData.phone.replace(/\D/g, '').length === 10 ? 'valid' : 'invalid') : 'default'}
                        />
                        {formData.phone.length > 0 && formData.phone.replace(/\D/g, '').length !== 10 && (
                           <p className="text-[10px] text-status-error mt-0.5 ml-1 font-bold">Must be 10 digits</p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <FormLabel icon={Calendar}>DOB</FormLabel>
                        <FormInput 
                            type="date" 
                            name="dob" 
                            value={formData.dob} 
                            onChange={(e) => handleDobChange(e.target.value)} 
                            className="h-9 font-mono text-xs"
                            status={formData.dob ? 'valid' : 'default'}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <div className="space-y-1">
                    <FormLabel icon={Mail}>Email Address</FormLabel>
                    <FormInput 
                        name="email" 
                        value={formData.email} 
                        onChange={handleIdentityChange} 
                        placeholder="email@example.com"
                        className="h-9 font-bold text-xs"
                        status={formData.email.includes('@') ? 'valid' : 'default'}
                    />
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                        <FormLabel icon={Activity}>Age</FormLabel>
                        <FormInput 
                            name="age" 
                            value={formData.age} 
                            onChange={(e) => handleAgeChange(e.target.value)} 
                            className="h-9 font-[700] text-sm" 
                            placeholder="--" 
                            status={formData.age ? 'valid' : 'default'}
                        />
                    </div>
                    <div className="space-y-1">
                        <FormLabel icon={Activity}>Height</FormLabel>
                        <FormInput 
                            name="height" 
                            value={formData.height || ''} 
                            onChange={handleIdentityChange} 
                            className="h-9 text-xs" 
                            placeholder="5'10" 
                        />
                    </div>
                    <div className="space-y-1">
                        <FormLabel icon={Activity}>Weight</FormLabel>
                        <FormInput 
                            name="weight" 
                            value={formData.weight || ''} 
                            onChange={handleIdentityChange} 
                            className="h-9 text-xs" 
                            placeholder="180 lbs" 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};