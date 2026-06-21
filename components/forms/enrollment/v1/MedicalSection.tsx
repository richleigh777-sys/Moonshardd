import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Card } from '../../../ui/Base';

interface MedicalSectionProps {
  selectedConditions: string[];
  toggleCondition: (condition: string) => void;
  activeMedicalConditions: string[];
}

export const MedicalSection: React.FC<MedicalSectionProps> = ({
  selectedConditions,
  toggleCondition,
  activeMedicalConditions,
}) => {
  return (
    <Card variant="refraction" className="shrink-0 p-5 border-border-subtle shadow-md flex flex-col bg-surface-main relative overflow-hidden rounded-xl">
      <div className="absolute inset-0 bg-gradient-to-l from-rose-500/5 to-transparent pointer-events-none"></div>
      
      <div className="flex items-center gap-3 border-b border-border-subtle pb-4 mb-5 relative z-10">
        <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500 shadow-sm border border-rose-500/20">
          <ShieldAlert size={18} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-text-primary tracking-wide">MEDICAL CONDITIONS</h3>
          <p className="text-sm text-text-muted uppercase tracking-wider font-semibold">Select relevant conditions</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5 relative z-10">
        {activeMedicalConditions.map((condition) => {
          const isSelected = selectedConditions.includes(condition);
          return (
            <button
              key={condition}
              type="button"
              onClick={() => toggleCondition(condition)}
              className={`px-3 py-2 text-sm font-bold rounded-lg border transition-all duration-200 ${
                isSelected
                  ? 'bg-rose-500/10 border-rose-500/50 text-rose-500 shadow-sm ring-1 ring-rose-500/20'
                  : 'bg-surface-alt border-border-subtle text-text-muted hover:border-text-muted hover:bg-surface-alt/80 uppercase'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"></span>}
                {condition}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
};
