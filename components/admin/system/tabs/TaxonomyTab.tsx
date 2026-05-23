
import React, { useState } from 'react';
import { Tag, Plus, X } from 'lucide-react';
import { SectionHeader } from '../SectionHeader';
import { Button } from '../../../ui/Base';
import { SystemConfig } from '../../../../types';
import { sfx } from '../../../../lib/soundService';

interface TaxonomyTabProps {
    config: SystemConfig;
    onChange: (field: keyof SystemConfig, value: any) => void;
}

export const TaxonomyTab: React.FC<TaxonomyTabProps> = ({ config, onChange }) => {
    const [newCondition, setNewCondition] = useState('');

    const addCondition = () => {
        if (!newCondition.trim()) return;
        sfx.playSubmit();
        const list = [...(config.medicalConditions || [])];
        if (!list.includes(newCondition.trim())) {
            list.push(newCondition.trim());
            onChange('medicalConditions', list);
        }
        setNewCondition('');
    };

    const removeCondition = (cond: string) => {
        sfx.playDecline();
        const list = config.medicalConditions?.filter(c => c !== cond) || [];
        onChange('medicalConditions', list);
    };

    return (
        <section>
            <SectionHeader icon={Tag} title="Data Taxonomy" sub="Classification Tags" color="text-purple-500" />
            <div className="space-y-4">
                <div className="flex gap-2">
                    <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                        value={newCondition} 
                        onChange={e => setNewCondition(e.target.value)} 
                        className="flex-1 bg-surface-alt/50 border border-border-subtle rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-purple-500 transition-all"
                        placeholder="Add Medical Condition Tag..."
                        onKeyDown={e => e.key === 'Enter' && addCondition()}
                    />
                    <Button onClick={addCondition} variant="secondary" className="px-4"><Plus size={18}/></Button>
                </div>
                <div className="flex flex-wrap gap-2 p-4 bg-surface-alt/20 rounded-2xl border border-border-subtle min-h-[100px] content-start">
                    {config.medicalConditions?.map((cond) => (
                        <span key={cond} className="px-3 py-1.5 bg-surface-main border border-border-subtle rounded-xl text-xs font-bold text-text-secondary flex items-center gap-2 shadow-sm group hover:border-purple-500/30 transition-all">
                            {cond}
                            <button onClick={() => removeCondition(cond)} className="text-text-muted hover:text-status-error transition-colors"><X size={16}/></button>
                        </span>
                    ))}
                    {(!config.medicalConditions || config.medicalConditions.length === 0) && (
                        <div className="w-full text-center py-4 text-text-muted opacity-50 italic text-xs">No active tags defined.</div>
                    )}
                </div>
            </div>
        </section>
    );
};
