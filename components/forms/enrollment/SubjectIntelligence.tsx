import React from 'react';
import { IdentityPanel } from './IdentityPanel';
import { SalesFormData } from '../../../types';

interface SubjectIntelligenceProps {
    formData: SalesFormData;
    handleIdentityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDobChange: (val: string) => void;
    handleAgeChange: (val: string) => void;
    useShippingForBilling: boolean;
    setUseShippingForBilling: (val: boolean) => void;
    autoFillFromCustomer: (customer: any) => void;
}

export const SubjectIntelligence: React.FC<SubjectIntelligenceProps> = ({
    formData, handleIdentityChange, handleDobChange, handleAgeChange,
    useShippingForBilling, setUseShippingForBilling, autoFillFromCustomer
}) => (
    <div className="space-y-4">
        <IdentityPanel 
            formData={formData} 
            handleIdentityChange={handleIdentityChange}
            handleDobChange={handleDobChange}
            handleAgeChange={handleAgeChange}
            useShippingForBilling={useShippingForBilling}
            setUseShippingForBilling={setUseShippingForBilling}
            autoFillFromCustomer={autoFillFromCustomer}
        />
    </div>
);
