
import React from 'react';
import { HeartPulse, Fingerprint } from 'lucide-react';
import { FormLabel } from './shared/FormComponents';
import { BiographicalSector } from './sectors/BiographicalSector';
import { LogisticsSector } from './sectors/LogisticsSector';

interface IdentityPanelProps {
    formData: any;
    handleIdentityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDobChange: (val: string) => void;
    handleAgeChange: (val: string) => void;
    useShippingForBilling: boolean;
    setUseShippingForBilling: (val: boolean) => void;
    selectedConditions: string[];
    setSelectedConditions: React.Dispatch<React.SetStateAction<string[]>>;
    activeConditions: string[];
}

export const IdentityPanel: React.FC<IdentityPanelProps> = ({ 
    formData, handleIdentityChange, handleDobChange, handleAgeChange,
    useShippingForBilling, setUseShippingForBilling,
    selectedConditions, setSelectedConditions, activeConditions
}) => {
    return (
        <div className="w-full bg-[#121214] text-white border border-white/5 rounded-2xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                        <Fingerprint size={16} />
                    </div>
                    <h4 className="text-xs font-bold uppercase text-white tracking-wider">Identity Matrix</h4>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* 1. Bio & Contact */}
                <div className="relative pl-4 border-l-2 border-indigo-500/30">
                    <BiographicalSector 
                        formData={formData} 
                        handleIdentityChange={handleIdentityChange} 
                        handleDobChange={handleDobChange} 
                        handleAgeChange={handleAgeChange} 
                    />
                </div>

                {/* 2. Logistics */}
                <div className="relative pl-4 border-l-2 border-emerald-500/30">
                    <LogisticsSector 
                        formData={formData} 
                        handleIdentityChange={handleIdentityChange} 
                        useShippingForBilling={useShippingForBilling} 
                        setUseShippingForBilling={setUseShippingForBilling} 
                    />
                </div>

                {/* 3. Medical Context Tags */}
                <div className="bg-black/20 p-5 rounded-xl border border-white/5">
                    <FormLabel icon={HeartPulse} className="mb-3 text-rose-500">Medical Context</FormLabel>
                    <div className="flex flex-wrap gap-2">
                        {activeConditions.map(c => {
                            const isSelected = selectedConditions.includes(c);
                            return (
                                <button
                                    key={c}
                                    onClick={() => setSelectedConditions(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c])}
                                    className={`
                                        h-7 px-3 rounded-md text-[10px] font-bold uppercase border transition-all duration-200 flex items-center gap-2 select-none
                                        ${isSelected 
                                            ? 'bg-rose-500 text-white border-rose-600 shadow-sm' 
                                            : 'bg-white/5 text-zinc-500 border-white/5 hover:bg-white/10 hover:text-zinc-300'}
                                    `}
                                >
                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                    {c}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
