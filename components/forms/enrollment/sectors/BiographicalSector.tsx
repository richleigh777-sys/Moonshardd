import React from 'react';
import { User, Phone, Mail, Calendar, Activity, Heart } from 'lucide-react';
import { FormInput, FormLabel } from '../shared/FormComponents';
import { useSystem } from '../../../../hooks/useSystem';
import { useCRM } from '../../../../hooks/useCRM';

interface Props {
    formData: any;
    handleIdentityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDobChange: (val: string) => void;
    handleAgeChange: (val: string) => void;
}

export const BiographicalSector: React.FC<Props> = ({ formData, handleIdentityChange, handleDobChange, handleAgeChange }) => {
    const { initiateCall } = useSystem();
    const { systemConfig } = useCRM();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
            <div className="space-y-3">
                <div className="space-y-1">
                    <FormLabel icon={User}>Designation</FormLabel>
                    <FormInput 
                        name="fullName" 
                        value={formData.fullName} 
                        onChange={handleIdentityChange} 
                        placeholder="Legal Identity..." 
                        className="text-xs font-black h-9"
                        status={formData.fullName.length > 3 ? 'valid' : 'default'}
                    />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <FormLabel icon={Phone}>Comms</FormLabel>
                            {systemConfig.telephonyEnabled && formData.phone.length >= 10 && (
                                <button 
                                    onClick={() => initiateCall(formData.phone)}
                                    className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded hover:bg-emerald-500/20 transition-colors uppercase tracking-wider"
                                >
                                    DIAL
                                </button>
                            )}
                        </div>
                        <FormInput 
                            name="phone" 
                            value={formData.phone} 
                            onChange={handleIdentityChange} 
                            placeholder="(000) 000-0000" 
                            className="font-mono h-9 tracking-tight"
                            status={formData.phone.length >= 14 ? 'valid' : 'default'}
                        />
                    </div>
                    <div className="space-y-1">
                        <FormLabel icon={Calendar}>Origin</FormLabel>
                        <FormInput 
                            type="date" 
                            name="dob" 
                            value={formData.dob} 
                            onChange={(e) => handleDobChange(e.target.value)} 
                            className="h-9 font-mono text-[9px]"
                            status={formData.dob ? 'valid' : 'default'}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <div className="space-y-1">
                    <FormLabel icon={Mail}>Secure Dispatch</FormLabel>
                    <FormInput 
                        name="email" 
                        value={formData.email} 
                        onChange={handleIdentityChange} 
                        placeholder="member@nexus.com"
                        className="h-9 font-bold"
                        status={formData.email.includes('@') ? 'valid' : 'default'}
                    />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <FormLabel icon={Activity}>Bio Age</FormLabel>
                        <FormInput 
                            name="age" 
                            value={formData.age} 
                            onChange={(e) => handleAgeChange(e.target.value)} 
                            className="h-9 text-center font-black text-sm" 
                            placeholder="--" 
                            status={formData.age ? 'valid' : 'default'}
                        />
                    </div>
                    <div className="space-y-1">
                        <FormLabel icon={Heart}>Spouse</FormLabel>
                        <FormInput 
                            name="spouseName" 
                            value={formData.spouseName} 
                            onChange={handleIdentityChange} 
                            className="h-9" 
                            placeholder="Optional..." 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};