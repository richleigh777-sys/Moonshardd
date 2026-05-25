import React from 'react';
import { HeartPulse, Check } from 'lucide-react';

interface HealthSectionProps {
  conditions: string[];
  availableConditions: string[];
  onToggle: (cond: string) => void;
}

export const HealthSection: React.FC<HealthSectionProps> = ({ conditions, availableConditions, onToggle }) => {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm overflow-hidden">
      <div className="border-b border-slate-700/50 bg-slate-800/80 px-6 py-4 flex items-center gap-3">
        <div className="p-2 bg-red-500/10 rounded-md">
          <HeartPulse size={18} className="text-red-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-white text-lg tracking-tight">Medical History</h3>
          <p className="text-xs text-slate-400 mt-0.5">Select any that apply to the customer.</p>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {availableConditions.map(cond => {
            const isSelected = conditions.includes(cond);
            return (
              <label 
                key={cond} 
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'bg-blue-900/20 border-blue-500/50 text-white shadow-sm' 
                    : 'bg-slate-900/30 border-slate-700/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-600'
                }`}
              >
                <div className={`flex flex-shrink-0 items-center justify-center w-5 h-5 rounded border ${
                    isSelected ? 'bg-blue-500 border-blue-500' : 'bg-slate-800 border-slate-500'
                  }`}
                >
                  {isSelected && <Check size={12} className="text-white" />}
                </div>
                <input type="checkbox" checked={isSelected} onChange={() => onToggle(cond)} className="hidden" />
                <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>{cond}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};
