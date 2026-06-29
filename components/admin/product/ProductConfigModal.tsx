
import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Base';
import { Product } from '../../../types';
import { Package, BarChart3, Layers, Save } from 'lucide-react';
import { IdentityTab } from './tabs/IdentityTab';
import { EconomicsTab } from './tabs/EconomicsTab';
import { VariantsTab } from './tabs/VariantsTab';

interface ProductConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Partial<Product> | null;
    onSave: (p: Partial<Product>) => void;
}

export const ProductConfigModal: React.FC<ProductConfigModalProps> = ({ isOpen, onClose, product, onSave }) => {
    const [formData, setFormData] = useState<Partial<Product>>({});
    const [activeTab, setActiveTab] = useState<'basics' | 'inventory' | 'variants'>('basics');

    useEffect(() => {
        if (product) {
            setTimeout(() => {
                setFormData(prev => {
                    // Simple ID check to prevent infinite loops if product object reference changes
                    if (prev.id === product.id) return prev;
                    return {
                        ...product,
                        dosages: product.dosages || [],
                        quantities: product.quantities || []
                    };
                });
            }, 0);
        }
    }, [product, isOpen]);

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={formData.id ? "Configure SKU" : "Initialize New SKU"} size="lg">
            <div className="flex flex-col h-[650px] -m-8 relative">
                {/* Header Tabs */}
                <div className="flex items-center px-4 pt-2 border-b border-border-strong bg-surface-alt/50 shrink-0 sticky top-0 z-10">
                    <button onClick={() => setActiveTab('basics')} className={`py-4 px-6 text-[13px] font-bold uppercase tracking-widest border-b-[3px] transition-all flex items-center gap-2 ${activeTab === 'basics' ? 'border-accent-primary text-text-primary' : 'border-transparent text-text-muted hover:text-text-primary hover:border-border-strong'}`}><Package size={16} className={activeTab === 'basics' ? 'text-accent-primary' : ''}/> Identity</button>
                    <button onClick={() => setActiveTab('inventory')} className={`py-4 px-6 text-[13px] font-bold uppercase tracking-widest border-b-[3px] transition-all flex items-center gap-2 ${activeTab === 'inventory' ? 'border-status-success text-text-primary' : 'border-transparent text-text-muted hover:text-text-primary hover:border-border-strong'}`}><BarChart3 size={16} className={activeTab === 'inventory' ? 'text-status-success' : ''}/> Economics</button>
                    <button onClick={() => setActiveTab('variants')} className={`py-4 px-6 text-[13px] font-bold uppercase tracking-widest border-b-[3px] transition-all flex items-center gap-2 ${activeTab === 'variants' ? 'border-indigo-500 text-text-primary' : 'border-transparent text-text-muted hover:text-text-primary hover:border-border-strong'}`}><Layers size={16} className={activeTab === 'variants' ? 'text-indigo-500' : ''}/> Variants</button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-surface-alt/10">
                    <div className="max-w-3xl mx-auto">
                        {activeTab === 'basics' && <IdentityTab formData={formData} setFormData={setFormData} />}
                        {activeTab === 'inventory' && <EconomicsTab formData={formData} setFormData={setFormData} />}
                        {activeTab === 'variants' && <VariantsTab formData={formData} setFormData={setFormData} />}
                    </div>
                </div>

                <div className="p-5 border-t border-border-strong bg-surface-main flex justify-between gap-3 shrink-0 rounded-b-xl shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)]">
                    <span className="text-[11px] font-mono text-text-muted uppercase tracking-widest flex items-center pl-2">Session Secure</span>
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={onClose} className="h-10 px-6 text-sm font-bold bg-surface-alt border-border-strong">Cancel</Button>
                        <Button variant="primary" onClick={handleSave} className="h-10 px-6 shadow-md text-sm font-bold tracking-wide rounded hover:-translate-y-0.5 transition-all">
                            <Save size={16} className="mr-2"/> Commit Changes
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
