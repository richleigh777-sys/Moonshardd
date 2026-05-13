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
    selectedConditions: string[];
    setSelectedConditions: (val: string[]) => void;
    activeConditions: string[];
}

export const SubjectIntelligence: React.FC<SubjectIntelligenceProps> = ({
    formData, handleIdentityChange, handleDobChange, handleAgeChange,
    useShippingForBilling, setUseShippingForBilling, selectedConditions,
    setSelectedConditions, activeConditions
}) => (
    <div className="space-y-4">
        <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Hexagon size={16} className="text-indigo-500" />
            </div>
            <div>
                <h3 className="text-sm font-bold text-white">Subject Details</h3>
                <p className="text-xs text-zinc-500">Personal and medical information</p>
            </div>
        </div>
        
        <IdentityPanel 
            formData={formData} 
            handleIdentityChange={handleIdentityChange}
            handleDobChange={handleDobChange}
            handleAgeChange={handleAgeChange}
            useShippingForBilling={useShippingForBilling}
            setUseShippingForBilling={setUseShippingForBilling}
            selectedConditions={selectedConditions}
            setSelectedConditions={setSelectedConditions}
            activeConditions={activeConditions}
        />
    </div>
);
