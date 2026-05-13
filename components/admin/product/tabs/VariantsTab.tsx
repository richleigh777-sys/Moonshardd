
import React, { useState } from 'react';
import { Layers, Package, Plus, GripHorizontal, X } from 'lucide-react';
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
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-text-muted tracking-widest ml-1 flex items-center gap-2">
                    <Layers size={12}/> Dosage Configurations
                </label>
                <div className="flex gap-2">
                    <input 
                        className="flex-1 bg-surface-alt/50 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-accent-primary transition-all shadow-inner" 
                        placeholder="Add dosage (e.g. 50mg)" 
                        value={newDosage} 
                        onChange={e => setNewDosage(e.target.value)} 
                        onKeyDown={e => e.key === 'Enter' && addDosage()} 
                    />
                    <Button onClick={addDosage} variant="secondary" className="px-4"><Plus size={18}/></Button>
                </div>
                <div className="flex flex-wrap gap-2 p-4 bg-surface-alt/20 rounded-2xl border border-border-subtle min-h-[80px] content-start">
                    {formData.dosages?.map((d, i) => (
                        <span key={i} className="px-3 py-1.5 bg-surface-main border border-border-subtle rounded-lg text-xs font-bold text-text-secondary flex items-center gap-2 shadow-sm group hover:border-accent-primary/30 transition-all cursor-default">
                            <GripHorizontal size={12} className="text-text-muted"/>
                            {d}
                            <button onClick={() => removeDosage(i)} className="text-text-muted hover:text-status-error transition-colors ml-1"><X size={12}/></button>
                        </span>
                    ))}
                    {(!formData.dosages || formData.dosages.length === 0) && <span className="text-xs text-text-muted italic opacity-50 w-full text-center py-2">No dosages defined.</span>}
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-text-muted tracking-widest ml-1 flex items-center gap-2">
                    <Package size={12}/> Quantity Bundles
                </label>
                <div className="flex gap-2">
                    <input 
                        className="flex-1 bg-surface-alt/50 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-accent-primary transition-all shadow-inner" 
                        placeholder="Add bundle (e.g. 30 Day Supply)" 
                        value={newQuantity} 
                        onChange={e => setNewQuantity(e.target.value)} 
                        onKeyDown={e => e.key === 'Enter' && addQuantity()} 
                    />
                    <Button onClick={addQuantity} variant="secondary" className="px-4"><Plus size={18}/></Button>
                </div>
                <div className="flex flex-wrap gap-2 p-4 bg-surface-alt/20 rounded-2xl border border-border-subtle min-h-[80px] content-start">
                    {formData.quantities?.map((q, i) => (
                        <span key={i} className="px-3 py-1.5 bg-surface-main border border-border-subtle rounded-lg text-xs font-bold text-text-secondary flex items-center gap-2 shadow-sm group hover:border-accent-primary/30 transition-all cursor-default">
                            <GripHorizontal size={12} className="text-text-muted"/>
                            {q}
                            <button onClick={() => removeQuantity(i)} className="text-text-muted hover:text-status-error transition-colors ml-1"><X size={12}/></button>
                        </span>
                    ))}
                    {(!formData.quantities || formData.quantities.length === 0) && <span className="text-xs text-text-muted italic opacity-50 w-full text-center py-2">No bundles defined.</span>}
                </div>
            </div>
        </div>
    );
};
