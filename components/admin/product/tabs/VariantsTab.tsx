
import React, { useState } from 'react';
import { Layers, Package, Plus, GripVertical, X } from 'lucide-react';
import { Button } from '../../../ui/Base';
import { Product } from '../../../../types';
import { sfx } from '../../../../lib/soundService';

interface VariantsTabProps {
    formData: Partial<Product>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<Product>>>;
}

export const VariantsTab: React.FC<VariantsTabProps> = ({ formData, setFormData }) => {
    const [newDosage, setNewDosage] = useState('');
    const [newQuantity, setNewQuantity] = useState('');

    const addDosage = () => {
        if (!newDosage.trim()) return;
        setFormData(prev => ({ ...prev, dosages: [...(prev.dosages || []), newDosage.trim()] }));
        setNewDosage('');
        sfx.playClick();
    };

    const removeDosage = (idx: number) => {
        setFormData(prev => ({ ...prev, dosages: prev.dosages?.filter((_, i) => i !== idx) }));
        sfx.playDecline();
    };

    const addQuantity = () => {
        if (!newQuantity.trim()) return;
        setFormData(prev => ({ ...prev, quantities: [...(prev.quantities || []), newQuantity.trim()] }));
        setNewQuantity('');
        sfx.playClick();
    };

    const removeQuantity = (idx: number) => {
        setFormData(prev => ({ ...prev, quantities: prev.quantities?.filter((_, i) => i !== idx) }));
        sfx.playDecline();
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="border border-border-strong bg-surface-main rounded-md shadow-sm overflow-hidden">
                <div className="bg-surface-alt px-5 py-3 border-b border-border-strong flex justify-between items-center bg-surface-alt/80">
                    <h3 className="text-[13px] font-bold text-text-primary uppercase tracking-widest flex items-center gap-2">
                         <Layers size={16} className="text-accent-primary"/> Dosage Framework
                    </h3>
                </div>
                <div className="p-6">
                    <div className="flex gap-2 max-w-lg mb-6">
                        <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                            className="flex-1 bg-surface-main border border-border-strong rounded-md px-4 py-2 text-sm font-medium text-text-primary outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all shadow-sm" 
                            placeholder="Add dosage (e.g. 50mg)" 
                            value={newDosage} 
                            onChange={e => setNewDosage(e.target.value)} 
                            onKeyDown={e => e.key === 'Enter' && addDosage()} 
                        />
                        <Button onClick={addDosage} variant="secondary" className="px-4 shadow-sm border-border-strong h-[38px]"><Plus size={16}/></Button>
                    </div>
                    
                    <div className="flex flex-col gap-2 bg-surface-alt/50 rounded-md border border-border-strong min-h-[100px] p-2">
                        {formData.dosages?.map((d, i) => (
                            <div key={i} className="px-3 py-2 bg-surface-main border border-border-strong rounded shadow-sm flex items-center justify-between group transition-all hover:border-accent-primary/50">
                                <div className="flex items-center gap-3">
                                   <GripVertical size={14} className="text-border-strong opacity-50 cursor-grab"/>
                                   <span className="text-sm font-bold text-text-primary">{d}</span>
                                </div>
                                <button onClick={() => removeDosage(i)} className="text-text-muted hover:text-status-error transition-colors p-1 rounded hover:bg-status-error/10"><X size={16}/></button>
                            </div>
                        ))}
                        {(!formData.dosages || formData.dosages.length === 0) && <div className="flex flex-1 items-center justify-center"><span className="text-xs font-bold text-text-muted uppercase tracking-widest opacity-50">No dosages defined</span></div>}
                    </div>
                </div>
            </div>

            <div className="border border-border-strong bg-surface-main rounded-md shadow-sm overflow-hidden">
                <div className="bg-surface-alt px-5 py-3 border-b border-border-strong flex justify-between items-center bg-surface-alt/80">
                    <h3 className="text-[13px] font-bold text-text-primary uppercase tracking-widest flex items-center gap-2">
                         <Package size={16} className="text-indigo-500"/> Volume Bundles
                    </h3>
                </div>
                <div className="p-6">
                    <div className="flex gap-2 max-w-lg mb-6">
                        <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                            className="flex-1 bg-surface-main border border-border-strong rounded-md px-4 py-2 text-sm font-medium text-text-primary outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all shadow-sm" 
                            placeholder="Add bundle (e.g. 30 Day Supply)" 
                            value={newQuantity} 
                            onChange={e => setNewQuantity(e.target.value)} 
                            onKeyDown={e => e.key === 'Enter' && addQuantity()} 
                        />
                        <Button onClick={addQuantity} variant="secondary" className="px-4 shadow-sm border-border-strong h-[38px]"><Plus size={16}/></Button>
                    </div>
                    
                    <div className="flex flex-col gap-2 bg-surface-alt/50 rounded-md border border-border-strong min-h-[100px] p-2">
                        {formData.quantities?.map((q, i) => (
                            <div key={i} className="px-3 py-2 bg-surface-main border border-border-strong rounded shadow-sm flex items-center justify-between group transition-all hover:border-indigo-500/50">
                                <div className="flex items-center gap-3">
                                   <GripVertical size={14} className="text-border-strong opacity-50 cursor-grab"/>
                                   <span className="text-sm font-bold text-text-primary">{q}</span>
                                </div>
                                <button onClick={() => removeQuantity(i)} className="text-text-muted hover:text-status-error transition-colors p-1 rounded hover:bg-status-error/10"><X size={16}/></button>
                            </div>
                        ))}
                        {(!formData.quantities || formData.quantities.length === 0) && <div className="flex flex-1 items-center justify-center"><span className="text-xs font-bold text-text-muted uppercase tracking-widest opacity-50">No bundles defined</span></div>}
                    </div>
                </div>
            </div>
        </div>
    );
};
