import React from 'react';
import { Hexagon } from 'lucide-react';
import { IdentityPanel } from './IdentityPanel';
import { SalesFormData } from '../../../types';

interface SubjectIntelligenceProps {
    formData: SalesFormData;
    handleIdentityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDobChange: (val: string) => void;
    handleAgeChange: (val: string) => void;
    useShippingForBilling: boolean;
    setUseShippingForBilling: (val: boolean) => void;
}

export const SubjectIntelligence: React.FC<SubjectIntelligenceProps> = ({
    formData, handleIdentityChange, handleDobChange, handleAgeChange,
    useShippingForBilling, setUseShippingForBilling
}) => (
    <div className="space-y-4">
        <div className="flex items-center gap-4 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <Hexagon size={18} className="text-accent-secondary drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
            </div>
            <div>
                <h3 className="text-xs font-[700]  tracking-[0.2em] text-text-primary">Subject Details</h3>
                <p className="text-xs text-text-muted mt-0.5">Personal and shipping information</p>
            </div>
        </div>
        
        <IdentityPanel 
            formData={formData} 
            handleIdentityChange={handleIdentityChange}
            handleDobChange={handleDobChange}
            handleAgeChange={handleAgeChange}
            useShippingForBilling={useShippingForBilling}
            setUseShippingForBilling={setUseShippingForBilling}
            autoFillFromCustomer={() => {}}
        />
    </div>
);
