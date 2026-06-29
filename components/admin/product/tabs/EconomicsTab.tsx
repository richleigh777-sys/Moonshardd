
import React from 'react';
import { DollarSign, List, BarChart2 } from 'lucide-react';
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
            <div className="border border-border-strong bg-surface-main rounded-md shadow-sm overflow-hidden flex flex-col md:flex-row">
                
                <div className="p-6 space-y-6 border-b md:border-b-0 md:border-r border-border-strong flex-1 bg-surface-alt/10">
                    <h4 className="text-[13px] font-bold text-text-primary uppercase tracking-widest flex items-center gap-2 border-b border-border-strong pb-3">
                        <DollarSign size={16} className="text-status-success"/> Pricing Parameters
                    </h4>
                    
                    <div className="space-y-5 pt-2">
                        <Input 
                            label="Retail Price ($)" 
                            type="number"
                            value={formData.price || 0} 
                            onChange={e => setFormData(prev => ({...prev, price: parseFloat(e.target.value)}))}
                            className="text-status-success font-bold text-lg bg-surface-main border-border-strong"
                        />
                        <Input 
                            label="Cost Basis ($)" 
                            type="number"
                            value={formData.cost || 0} 
                            onChange={e => setFormData(prev => ({...prev, cost: parseFloat(e.target.value)}))}
                            className="font-bold text-lg text-text-primary bg-surface-main border-border-strong"
                        />
                         <Input 
                            label="Initial Inventory Stock" 
                            type="number"
                            value={formData.stock || 0} 
                            onChange={e => setFormData(prev => ({...prev, stock: parseFloat(e.target.value)}))}
                            className="font-bold text-text-primary bg-surface-main border-border-strong"
                        />
                    </div>
                </div>

                <div className="flex-1 bg-surface-main">
                    <div className="px-6 py-4 bg-surface-alt border-b border-border-strong">
                         <h4 className="text-[13px] font-bold text-text-primary uppercase tracking-widest flex items-center gap-2">
                            <BarChart2 size={16} className="text-accent-primary"/> Economics Engine
                        </h4>
                    </div>
                    <div className="p-6">
                        <ProfitSimulator price={formData.price || 0} cost={formData.cost || 0} />
                    </div>
                </div>
                
            </div>
        </div>
    );
};
