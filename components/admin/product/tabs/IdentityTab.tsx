
import React from 'react';
import { Tag } from 'lucide-react';
import { Input } from '../../../ui/Base';
import { Product } from '../../../../types';

interface IdentityTabProps {
    formData: Partial<Product>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<Product>>>;
}

export const IdentityTab: React.FC<IdentityTabProps> = ({ formData, setFormData }) => {
    return (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <div className="bg-surface-alt/20 p-6 rounded-3xl border border-border-subtle space-y-6">
                <Input 
                    label="Product Name" 
                    value={formData.name || ''} 
                    onChange={e => setFormData(prev => ({...prev, name: e.target.value}))}
                    placeholder="e.g. Neuro-Link Alpha"
                    className="text-lg font-bold"
                />
                <div className="grid grid-cols-2 gap-6">
                    <Input 
                        label="SKU Code" 
                        value={formData.sku || ''} 
                        onChange={e => setFormData(prev => ({...prev, sku: e.target.value}))}
                        placeholder="PROD-001"
                        className="font-mono text-sm"
                    />
                    <Input 
                        label="Category Tag" 
                        value={formData.category || ''} 
                        onChange={e => setFormData(prev => ({...prev, category: e.target.value}))}
                        placeholder="Wellness / Tech"
                    />
                </div>
            </div>

            <div 
                className="flex items-center gap-4 p-4 bg-surface-alt/30 rounded-2xl border border-border-subtle cursor-pointer hover:border-accent-primary/30 transition-all group" 
                onClick={() => setFormData(prev => ({...prev, active: !prev.active}))}
            >
                <div className={`p-3 rounded-xl transition-colors ${formData.active ? 'bg-emerald-500/10 text-status-success' : 'bg-surface-alt text-text-muted'}`}>
                    <Tag size={20}/>
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-bold text-text-primary group-hover:text-accent-primary transition-colors">Active Status</h4>
                    <p className="text-xs text-text-muted  tracking-wider">Visible in Agent Terminal</p>
                </div>
                <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.active ? 'bg-emerald-500' : 'bg-slate-500/30'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${formData.active ? 'left-7' : 'left-1'}`}></div>
                </div>
            </div>
        </div>
    );
};
