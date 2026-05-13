
import React, { useState, useMemo } from 'react';
import { ShieldCheck, Activity } from 'lucide-react';
import { ProductConfig, Product } from '../../types';
import { Card } from '../ui/Base';
import { sfx } from '../../lib/soundService';
import { useCRM } from '../../hooks/useCRM';
import { useSystem } from '../../hooks/useSystem';
import { useProductSystem } from '../../hooks/useProductSystem';
import { ProductSKUCard } from './product/ProductSKUCard';
import { BulkActions } from './product/BulkActions';
import { ProductConfigModal } from './product/ProductConfigModal';
import { SupplyChainHUD } from './product/SupplyChainHUD';
import { CatalogToolbar } from './product/CatalogToolbar';

interface Props {
    configForm: ProductConfig;
    setConfigForm: (c: ProductConfig) => void;
    onSave: (c: ProductConfig) => void; 
}

export const ProductManager: React.FC<Props> = ({ configForm, setConfigForm, onSave }) => {
    const { sales } = useCRM();
    const { setToast } = useSystem();
    const [isBulkOpen, setIsBulkOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    
    // Editor State
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const productLogic = useProductSystem(configForm, sales, setConfigForm);

    const categories = useMemo(() => {
        const cats = new Set(configForm.products.map(p => p.category || 'General'));
        return ['All', ...Array.from(cats).sort()];
    }, [configForm.products]);

    const handleEdit = (p: Product) => {
        sfx.playClick();
        if (Object.keys(p).length === 0) {
            // New Product
            setEditingProduct({
                id: `prod-${Date.now()}`,
                name: '',
                price: 0,
                cost: 0,
                category: 'Wellness',
                dosages: ['Standard'],
                quantities: ['30 Day Supply'],
                stock: 100,
                active: true
            });
        } else {
            setEditingProduct({ ...p });
        }
        setIsEditModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to purge this SKU? This action cannot be undone.")) {
            sfx.playDecline();
            const newProds = configForm.products.filter(p => p.id !== id);
            const newConfig = { ...configForm, products: newProds };
            setConfigForm(newConfig);
            onSave(newConfig);
            setToast({ title: 'Catalog', message: "SKU Purged from Database", type: "info" });
        }
    };

    const handleDuplicate = (p: Product) => {
        sfx.playSubmit();
        productLogic.duplicateProduct(p);
        setTimeout(() => onSave({ ...configForm, products: [...configForm.products] }), 100); 
        setToast({ title: 'Catalog', message: "SKU Cloned Successfully", type: "success" });
    };

    const handleSaveProduct = (updatedProduct: Partial<Product>) => {
        if (!updatedProduct.name || !updatedProduct.price) {
            sfx.playError();
            setToast({ title: 'Validation Error', message: "Name and Price required.", type: "error" });
            return;
        }

        const confirmed = window.confirm(`Confirm catalog update for ${updatedProduct.name}?`);
        if (!confirmed) return;

        const newProds = [...configForm.products];
        const index = newProds.findIndex(p => p.id === updatedProduct.id);
        
        if (index >= 0) {
            newProds[index] = updatedProduct as Product;
        } else {
            newProds.push(updatedProduct as Product);
        }

        const newConfig = { ...configForm, products: newProds };
        setConfigForm(newConfig);
        onSave(newConfig);

        sfx.playSuccess();
        setIsEditModalOpen(false);
        setToast({ title: 'Catalog', message: "Catalog Updated & Persisted", type: "success" });
    };

    return (
        <div className="flex flex-col h-full gap-3 animate-in fade-in duration-700 w-full overflow-visible pb-4">
            
            <SupplyChainHUD stats={productLogic.stats} />

            <Card variant="panel" className="flex-1 flex flex-col overflow-hidden rounded-2xl p-0 border-white/5 bg-surface-main shadow-2xl relative">
                
                <CatalogToolbar 
                    totalItems={configForm.products.length}
                    searchTerm={productLogic.searchTerm}
                    onSearchChange={productLogic.setSearchTerm}
                    sortMode={productLogic.sortMode}
                    onSortChange={productLogic.setSortMode}
                    categories={categories}
                    activeCategory={productLogic.activeCategory}
                    onCategoryChange={(cat) => { productLogic.setActiveCategory(cat); sfx.playClick(); }}
                    onToggleBulk={() => setIsBulkOpen(!isBulkOpen)}
                    onAddProduct={() => handleEdit({} as any)}
                    viewMode={viewMode}
                    onViewModeChange={(m) => { setViewMode(m); sfx.playClick(); }}
                />

                {isBulkOpen && (
                    <BulkActions 
                        onAdjust={(pct) => {
                            productLogic.adjustGlobalPrices(pct);
                            setTimeout(() => onSave(configForm), 100);
                        }} 
                        onClose={() => setIsBulkOpen(false)} 
                    />
                )}

                <div className={`flex-1 overflow-y-auto custom-scrollbar p-3 bg-surface-alt/5 ${viewMode === 'grid' ? '' : 'px-2'}`}>
                    <div className={viewMode === 'grid' 
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3" 
                        : "flex flex-col gap-1.5"
                    }>
                        {productLogic.filteredProducts.map(p => (
                            <ProductSKUCard 
                                key={p.id}
                                product={p}
                                revenue={productLogic.metrics[p.id]?.revenue || 0}
                                volume={productLogic.metrics[p.id]?.volume || 0}
                                onToggle={(id) => {
                                    productLogic.toggleProductActive(id);
                                    setTimeout(() => onSave(configForm), 100);
                                }}
                                onEdit={handleEdit}
                                onDuplicate={handleDuplicate}
                                onDelete={handleDelete}
                                viewMode={viewMode}
                            />
                        ))}
                    </div>
                </div>

                <div className="p-2.5 border-t border-border-subtle bg-surface-alt/50 shrink-0 backdrop-blur-md flex justify-between items-center px-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <ShieldCheck size={12} className="text-emerald-500" />
                            <span className="text-[8px] font-black uppercase text-text-muted tracking-widest leading-none">Security: Verified</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Activity size={12} className="text-indigo-500" />
                            <span className="text-[8px] font-black uppercase text-text-muted tracking-widest leading-none">Load: Optimal</span>
                        </div>
                    </div>
                    <span className="text-[7px] font-mono text-text-muted opacity-40 uppercase tracking-[0.2em]">Product Module v4.1</span>
                </div>

                <ProductConfigModal 
                    isOpen={isEditModalOpen} 
                    onClose={() => setIsEditModalOpen(false)} 
                    product={editingProduct} 
                    onSave={handleSaveProduct} 
                />
            </Card>
        </div>
    );
};
