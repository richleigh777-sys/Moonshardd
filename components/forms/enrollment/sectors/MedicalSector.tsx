import React from 'react';
import { X } from 'lucide-react';

export function MedicalSector({ formData, handleIdentityChange }: any) {
  const commonConditions = [
      'Hypertension', 'Type 2 Diabetes', 'Asthma', 
      'High Cholesterol', 'Thyroid Disorder', 'Migraines'
  ];

  const toggleCondition = (condition: string) => {
      const current = formData.medicalConditions || [];
      const isSelected = current.includes(condition);
      let next;
      if (isSelected) {
          next = current.filter((c: string) => c !== condition);
      } else {
          next = [...current, condition];
      }
      handleIdentityChange({ target: { name: 'medicalConditions', value: next } });
  };

  const currentConditions = Array.isArray(formData.medicalConditions) ? formData.medicalConditions : [];
  const [customCondition, setCustomCondition] = React.useState('');

  const addCustom = (e: React.FormEvent) => {
      e.preventDefault();
      if (!customCondition.trim()) return;
      if (currentConditions.includes(customCondition.trim())) return;
      handleIdentityChange({ target: { name: 'medicalConditions', value: [...currentConditions, customCondition.trim()] } });
      setCustomCondition('');
  };

  const currentHeightInches = parseInt(formData.height) || 0;
  const feet = currentHeightInches ? Math.floor(currentHeightInches / 12) : 0;
  const inches = currentHeightInches ? currentHeightInches % 12 : 0;

  const handleHeightChange = (e: React.ChangeEvent<HTMLSelectElement>, type: 'feet' | 'inches') => {
      const val = parseInt(e.target.value) || 0;
      let newTotal = 0;
      if (type === 'feet') {
          newTotal = (val * 12) + inches;
      } else {
          newTotal = (feet * 12) + val;
      }
      handleIdentityChange({ target: { name: 'height', value: newTotal.toString() } });
  };

  return (
    <div className="space-y-8">
        <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary ml-1">Height</label>
                <div className="flex gap-2">
                    <select
                        value={feet}
                        onChange={(e) => handleHeightChange(e, 'feet')}
                        className="w-full bg-surface-alt/50 border border-border-subtle rounded-xl px-5 py-4 text-lg font-medium text-white outline-none transition-all focus:border-white focus:bg-surface-alt focus:ring-1 focus:ring-white shadow-sm appearance-none"
                    >
                        <option value={0} disabled>Feet</option>
                        {[3, 4, 5, 6, 7, 8].map(f => (
                            <option key={f} value={f}>{f} ft</option>
                        ))}
                    </select>
                    <select
                        value={inches}
                        onChange={(e) => handleHeightChange(e, 'inches')}
                        className="w-full bg-surface-alt/50 border border-border-subtle rounded-xl px-5 py-4 text-lg font-medium text-white outline-none transition-all focus:border-white focus:bg-surface-alt focus:ring-1 focus:ring-white shadow-sm appearance-none"
                    >
                        <option value={0} disabled>Inches</option>
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i} value={i}>{i} in</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary ml-1">Weight (lbs)</label>
                <input 
                    name="weight"
                    type="number"
                    value={formData.weight}
                    onChange={handleIdentityChange}
                    placeholder="e.g. 180"
                    className="w-full bg-surface-alt/50 border border-border-subtle rounded-xl px-5 py-4 text-lg font-medium text-white placeholder-text-muted outline-none transition-all focus:border-white focus:bg-surface-alt focus:ring-1 focus:ring-white shadow-sm"
                />
            </div>
        </div>

        <div className="space-y-4">
            <label className="text-sm font-medium text-text-secondary ml-1">Pre-existing Conditions</label>
            <div className="flex w-full overflow-x-auto custom-scrollbar pb-3 pt-1 gap-3">
                {commonConditions.map(condition => {
                    const isSelected = currentConditions.includes(condition);
                    return (
                        <button 
                            key={condition} 
                            onClick={(e) => { e.preventDefault(); toggleCondition(condition); }}
                            className={`whitespace-nowrap px-6 py-3 rounded-xl text-base font-medium border transition-all ${isSelected ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/20' : 'bg-surface-alt/50 text-text-secondary border-border-subtle hover:border-white/20 hover:text-white'}`}
                        >
                            {condition}
                        </button>
                    )
                })}
            </div>
            
            <form onSubmit={addCustom} className="relative mt-2">
                <input 
                    value={customCondition}
                    onChange={e => setCustomCondition(e.target.value)}
                    placeholder="Add unlisted condition..."
                    className="w-full bg-surface-alt/50 border border-border-subtle rounded-xl pl-5 pr-14 py-4 text-lg font-medium text-white placeholder-text-muted outline-none transition-all focus:border-white focus:bg-surface-alt focus:ring-1 focus:ring-white shadow-sm"
                />
                <button type="submit" disabled={!customCondition.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-surface-alt text-text-primary hover:bg-surface-highlight rounded-xl transition-all disabled:opacity-50">
                    Add
                </button>
            </form>
            
            {currentConditions.length > 0 && (
                <div className="pt-4 flex flex-wrap gap-3">
                    {currentConditions.map((condition: string) => (
                        <div key={condition} className="px-5 py-2.5 rounded-xl text-sm font-semibold border bg-rose-500/10 border-rose-500/30 text-rose-400 flex items-center gap-2">
                            {condition}
                            <button onClick={(e) => { e.preventDefault(); toggleCondition(condition); }} className="hover:text-white hover:bg-rose-500/40 transition-colors rounded-full p-1"><X size={14} strokeWidth={3}/></button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
}
