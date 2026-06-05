
import React from 'react';
import { Fingerprint } from 'lucide-react';
import { BiographicalSector } from './sectors/BiographicalSector';
import { LogisticsSector } from './sectors/LogisticsSector';
import { MedicalSector } from './sectors/MedicalSector';

import { Card } from '../../ui/Base';

interface IdentityPanelProps {
    formData: any;
    handleIdentityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDobChange: (val: string) => void;
    handleAgeChange: (val: string) => void;
    autoFillFromCustomer: (customer: any) => void;
    useShippingForBilling: boolean;
    setUseShippingForBilling: (val: boolean) => void;
}

export const IdentityPanel: React.FC<IdentityPanelProps> = ({ 
    formData, handleIdentityChange, handleDobChange, handleAgeChange, autoFillFromCustomer,
    useShippingForBilling, setUseShippingForBilling
}) => {
    return (
        <Card variant="refraction" className="w-full text-text-primary overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between bg-transparent">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-surface-highlight to-surface-main border border-border-subtle shadow-lg rounded-xl text-accent-secondary">
                        <Fingerprint size={16} className="drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]"/>
                    </div>
                    <h4 className="text-xs font-[700]  text-text-primary tracking-[0.2em]">Identity Matrix</h4>
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* 1. Bio & Contact */}
                <div className="relative pl-4 border-l-2 border-indigo-500/50">
                    <BiographicalSector 
                        formData={formData} 
                        handleIdentityChange={handleIdentityChange} 
                        handleDobChange={handleDobChange} 
                        handleAgeChange={handleAgeChange} 
                        autoFillFromCustomer={autoFillFromCustomer}
                    />
                </div>

                {/* 2. Logistics */}
                <div className="relative pl-4 border-l-2 border-status-success/50">
                    <LogisticsSector 
                        formData={formData} 
                        handleIdentityChange={handleIdentityChange} 
                        useShippingForBilling={useShippingForBilling} 
                        setUseShippingForBilling={setUseShippingForBilling} 
                    />
                </div>

                {/* 3. Medical Background */}
                <div className="relative pl-4 border-l-2 border-rose-500/50">
                    <MedicalSector 
                        formData={formData} 
                        handleIdentityChange={handleIdentityChange} 
                    />
                </div>
            </div>
        </Card>
    );
};
