
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
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="border border-border-strong bg-surface-main rounded-md shadow-sm overflow-hidden">
                <div className="bg-surface-alt px-5 py-3 border-b border-border-strong">
                    <h3 className="text-[13px] font-bold text-text-primary uppercase tracking-widest">Core Identity</h3>
                </div>
                <div className="p-6 space-y-6">
                    <Input 
                        label="Product Name" 
                        value={formData.name || ''} 
                        onChange={e => setFormData(prev => ({...prev, name: e.target.value}))}
                        placeholder="e.g. Neuro-Link Alpha"
                        className="text-base font-bold bg-surface-alt/50 border-border-strong"
                    />
                    <div className="grid grid-cols-2 gap-6">
                        <Input 
                            label="SKU Code" 
                            value={formData.sku || ''} 
                            onChange={e => setFormData(prev => ({...prev, sku: e.target.value}))}
                            placeholder="PROD-001"
                            className="font-mono text-sm uppercase bg-surface-alt/50 border-border-strong"
                        />
                        <Input 
                            label="Category Tag" 
                            value={formData.category || ''} 
                            onChange={e => setFormData(prev => ({...prev, category: e.target.value}))}
                            placeholder="Wellness / Tech"
                            className="bg-surface-alt/50 border-border-strong"
                        />
                    </div>
                </div>
            </div>

            <div 
                className="flex items-center gap-4 p-5 bg-surface-main rounded-md border border-border-strong cursor-pointer hover:border-accent-primary/50 hover:bg-surface-alt/50 transition-all group shadow-sm"
                onClick={() => setFormData(prev => ({...prev, active: !prev.active}))}
            >
                <div className={`p-3 rounded transition-colors ${formData.active ? 'bg-status-success/10 text-status-success border border-status-success/20' : 'bg-surface-alt border border-border-strong text-text-muted'}`}>
                    <Tag size={20}/>
                </div>
                <div className="flex-1">
                    <h4 className="text-[15px] font-bold text-text-primary group-hover:text-accent-primary transition-colors">System Activation Status</h4>
                    <p className="text-sm text-text-muted tracking-wide mt-0.5">Toggle visibility in Agent Workspace systems</p>
                </div>
                <div className={`w-14 h-7 rounded-full p-1 relative transition-colors ${formData.active ? 'bg-status-success' : 'bg-border-strong'}`}>
                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${formData.active ? 'left-8' : 'left-1'}`}></div>
                </div>
            </div>
        </div>
    );
};
