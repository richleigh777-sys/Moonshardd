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
        <div className="flex flex-col gap-3">
            <div className="space-y-3">
                <div className="space-y-1">
                    <FormLabel icon={User}>Full Name</FormLabel>
                    <FormInput 
                        name="fullName" 
                        value={formData.fullName} 
                        onChange={handleIdentityChange} 
                        placeholder="Full Name..." 
                        className="text-xs font-[700] h-9"
                        status={formData.fullName.length > 0 ? (formData.fullName.length >= 2 ? 'valid' : 'invalid') : 'default'}
                    />
                    {formData.fullName.length > 0 && formData.fullName.length < 2 && (
                        <p className="text-[10px] text-status-error mt-0.5 ml-1 font-bold">Name too short (min 2 chars)</p>
                    )}
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