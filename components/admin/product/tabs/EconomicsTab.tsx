
import React from 'react';
import { DollarSign, List } from 'lucide-react';
import { Input } from '../../../ui/Base';
import { Product } from '../../../../types';
import { ProfitSimulator } from '../ProfitSimulator';

interface EconomicsTabProps {
    formData: Partial<Product>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<Product>>>;
}

export const EconomicsTab: React.FC<EconomicsTabProps> = ({ formData, setFormData }) => {
    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="max-w-md p-4 bg-surface-alt/30 rounded-xl border border-border-subtle space-y-5">
                <h4 className="text-sm font-[700] text-text-muted tracking-widest flex items-center gap-2 mb-2">
                    <DollarSign size={16} className="text-status-success"/> Pricing Model
                </h4>
                <Input 
                    label="Retail Price ($)" 
                    type="number"
                    value={formData.price || 0} 
                    onChange={e => setFormData(prev => ({...prev, price: parseFloat(e.target.value)}))}
                    className="text-status-success font-bold text-lg"
                />
                <Input 
                    label="Cost Basis ($)" 
                    type="number"
                    value={formData.cost || 0} 
                    onChange={e => setFormData(prev => ({...prev, cost: parseFloat(e.target.value)}))}
                    className="text-text-secondary"
                />
                
                <ProfitSimulator price={formData.price || 0} cost={formData.cost || 0} />
            </div>
        </div>
    );
};
