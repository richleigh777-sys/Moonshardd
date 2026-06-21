
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
        <Card variant="refraction" className="w-full text-text-primary overflow-hidden shadow-sm">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-surface-alt/30">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border border-indigo-500/20 shadow-inner rounded-xl text-indigo-500">
                        <Fingerprint size={16} />
                    </div>
                    <h4 className="text-sm font-semibold text-text-primary tracking-wide uppercase">Customer Information</h4>
                </div>
            </div>

            <div className="p-6 md:p-8 space-y-8 bg-surface-main/40">
                {/* 1. Bio & Contact */}
                <div>
                    <h5 className="text-sm font-bold text-text-muted uppercase tracking-wide mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        Personal Details
                    </h5>
                    <BiographicalSector 
                        formData={formData} 
                        handleIdentityChange={handleIdentityChange} 
                        handleDobChange={handleDobChange} 
                        handleAgeChange={handleAgeChange} 
                        autoFillFromCustomer={autoFillFromCustomer}
                    />
                </div>

                <hr className="border-border-subtle" />

                {/* 2. Medical Background */}
                <div>
                    <MedicalSector 
                        formData={formData} 
                        handleIdentityChange={handleIdentityChange} 
                    />
                </div>

                <hr className="border-border-subtle" />

                {/* 3. Logistics */}
                <div>
                    <LogisticsSector 
                        formData={formData} 
                        handleIdentityChange={handleIdentityChange} 
                        useShippingForBilling={useShippingForBilling} 
                        setUseShippingForBilling={setUseShippingForBilling} 
                    />
                </div>
            </div>
        </Card>
    );
};
