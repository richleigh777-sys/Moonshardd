
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
            <div className="flex flex-col h-[600px] -m-8">
                {/* Header Tabs */}
                <div className="flex items-center px-8 border-b border-border-subtle bg-surface-alt/30 shrink-0">
                    <button onClick={() => setActiveTab('basics')} className={`py-4 px-4 text-sm font-medium  tracking-wide border-b-2 transition-all flex items-center gap-2 ${activeTab === 'basics' ? 'border-accent-primary text-accent-primary' : 'border-transparent text-text-muted hover:text-text-primary'}`}><Package size={16}/> Identity</button>
                    <button onClick={() => setActiveTab('inventory')} className={`py-4 px-4 text-sm font-medium  tracking-wide border-b-2 transition-all flex items-center gap-2 ${activeTab === 'inventory' ? 'border-accent-primary text-accent-primary' : 'border-transparent text-text-muted hover:text-text-primary'}`}><BarChart3 size={16}/> Economics</button>
                    <button onClick={() => setActiveTab('variants')} className={`py-4 px-4 text-sm font-medium  tracking-wide border-b-2 transition-all flex items-center gap-2 ${activeTab === 'variants' ? 'border-accent-primary text-accent-primary' : 'border-transparent text-text-muted hover:text-text-primary'}`}><Layers size={16}/> Variants</button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 bg-surface-main">
                    {activeTab === 'basics' && <IdentityTab formData={formData} setFormData={setFormData} />}
                    {activeTab === 'inventory' && <EconomicsTab formData={formData} setFormData={setFormData} />}
                    {activeTab === 'variants' && <VariantsTab formData={formData} setFormData={setFormData} />}
                </div>

                <div className="p-4 border-t border-border-subtle bg-surface-main flex justify-end gap-3 shrink-0">
                    <Button variant="secondary" onClick={onClose} className="h-12 px-4 text-sm font-bold">Cancel</Button>
                    <Button variant="primary" onClick={handleSave} className="h-12 px-8 shadow-lg shadow-accent-primary/20 bg-gradient-to-r from-accent-primary to-indigo-600 border border-border-subtle text-sm font-medium  tracking-wide hover:brightness-110">
                        <Save size={16} className="mr-2"/> Save Configuration
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
