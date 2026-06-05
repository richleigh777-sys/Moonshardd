import React, { useState } from 'react';
import { Activity, Plus, X } from 'lucide-react';

const COMMON_CONDITIONS = [
    'Hypertension', 'Type 2 Diabetes', 'High Cholesterol', 
    'Asthma', 'Heart Disease', 'Arthritis', 'None'
];

interface Props {
    formData: any;
    handleIdentityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const MedicalSector: React.FC<Props> = ({ formData, handleIdentityChange }) => {
    const currentConditions = Array.isArray(formData.medicalBackground) ? formData.medicalBackground : [];
    const [customCondition, setCustomCondition] = useState('');

    const toggleCondition = (condition: string) => {
        let newConditions = [...currentConditions];
        if (condition === 'None') {
            newConditions = ['None'];
        } else {
            if (newConditions.includes('None')) {
                newConditions = newConditions.filter(c => c !== 'None');
            }
            if (newConditions.includes(condition)) {
                newConditions = newConditions.filter(c => c !== condition);
            } else {
                newConditions.push(condition);
            }
        }
        handleIdentityChange({ target: { name: 'medicalBackground', value: newConditions } } as any);
    };

    const addCustomCondition = () => {
        if (!customCondition.trim()) return;
        let newConditions = [...currentConditions];
        if (newConditions.includes('None')) {
            newConditions = newConditions.filter(c => c !== 'None');
        }
        if (!newConditions.includes(customCondition.trim())) {
            newConditions.push(customCondition.trim());
        }
        handleIdentityChange({ target: { name: 'medicalBackground', value: newConditions } } as any);
        setCustomCondition('');
    };

    return (
        <div className="p-5 bg-surface-alt/40 rounded-xl border border-border-subtle shadow-sm animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-rose-500/10 rounded-lg text-rose-500 border border-rose-500/20">
                    <Activity size={16} strokeWidth={2.5}/>
                </div>
                <h4 className="text-xs font-[700] text-text-primary tracking-wide uppercase">Medical Background</h4>
            </div>

            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    {COMMON_CONDITIONS.map(condition => {
                        const isSelected = currentConditions.includes(condition);
                        return (
                            <button
                                key={condition}
                                onClick={(e) => { e.preventDefault(); toggleCondition(condition); }}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${isSelected ? 'bg-rose-500 text-white border-rose-600 shadow-md transform scale-105' : 'bg-surface-main text-text-muted border-border-strong hover:border-text-primary/30'}`}
                            >
                                {condition}
                            </button>
                        );
                    })}
                    {currentConditions.filter(c => !COMMON_CONDITIONS.includes(c)).map(condition => (
                        <div key={condition} className="px-3 py-1.5 rounded-full text-xs font-bold border bg-rose-500/20 text-rose-400 border-rose-500/30 flex items-center gap-1.5">
                            {condition}
                            <button onClick={(e) => { e.preventDefault(); toggleCondition(condition); }} className="hover:text-rose-200"><X size={12}/></button>
                        </div>
                    ))}
                </div>

                <div className="relative flex items-center">
                    <div className="absolute left-3 text-[9px] font-black tracking-widest text-text-muted uppercase pointer-events-none">Other Condition</div>
                    <input 
                        value={customCondition}
                        onChange={(e) => setCustomCondition(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomCondition())}
                        className="w-full bg-surface-main border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all font-medium"
                    />
                    <button 
                        onClick={(e) => { e.preventDefault(); addCustomCondition(); }}
                        className="absolute right-2 p-1.5 bg-surface-alt hover:bg-rose-500/20 hover:text-rose-400 rounded-md transition-colors text-text-muted"
                    >
                        <Plus size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
