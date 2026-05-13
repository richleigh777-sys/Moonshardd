import React from 'react';
import { HeartPulse, CheckCircle } from 'lucide-react';
import { Card } from '../../ui/Base';

interface MedicalPanelProps {
    activeMedicalConditions: string[];
    selectedConditions: string[];
    toggleCondition: (condition: string) => void;
}

export const MedicalPanel: React.FC<MedicalPanelProps> = ({
    activeMedicalConditions, selectedConditions, toggleCondition
}) => {
    return (
        <Card variant="panel" className="flex-1 p-2 border-white/5 flex flex-col bg-surface-main min-h-0 overflow-hidden">
            <div className="flex items-center gap-1.5 border-b border-border-subtle pb-1.5 mb-1.5 shrink-0">
                <HeartPulse size={12} className="text-status-error"/>
                <h3 className="text-[10px] font-black uppercase text-text-primary tracking-widest">Medical Context</h3>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 relative">
                <div className="flex flex-col gap-1 pb-1 content-start">
                    {activeMedicalConditions.map(cond => (
                        <button 
                            key={cond} 
                            type="button" 
                            onClick={() => toggleCondition(cond)} 
                            className={`
                                px-2 py-1.5 rounded-lg text-[9px] font-bold border text-left transition-all w-full truncate flex items-center justify-between
                                ${selectedConditions.includes(cond) 
                                    ? 'bg-status-error/20 border-status-error text-status-error shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
                                    : 'bg-surface-alt/40 border-border-subtle text-text-secondary hover:bg-surface-alt hover:text-text-primary'
                                }
                            `}
                            title={cond}
                        >
                            {cond}
                            {selectedConditions.includes(cond) && <CheckCircle size={10} strokeWidth={3} />}
                        </button>
                    ))}
                </div>
            </div>
        </Card>
    );
};
