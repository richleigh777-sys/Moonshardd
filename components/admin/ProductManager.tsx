
import React, { useState, useMemo } from 'react';
import { ShieldCheck, Activity, PackageOpen, Layers } from 'lucide-react';
import { ProductConfig, Product } from '../../types';
import { sfx } from '../../lib/soundService';
import { useCRM } from '../../hooks/useCRM';
import { useSystem } from '../../hooks/useSystem';
import { useProductSystem } from '../../hooks/useProductSystem';
import { ProductSKUCard } from './product/ProductSKUCard';
import { BulkActions } from './product/BulkActions';
import { ProductConfigModal } from './product/ProductConfigModal';
import { SupplyChainHUD } from './product/SupplyChainHUD';
import { CatalogToolbar } from './product/CatalogToolbar';
import { PresetManager } from './PresetManager';

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
    const [activeTab, setActiveTab] = useState<'catalog' | 'presets'>('catalog');
    
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
        // if (confirm("Are you sure you want to purge this SKU? This action cannot be undone.")) {
            sfx.playDecline();
            const newProds = configForm.products.filter(p => p.id !== id);
            const newConfig = { ...configForm, products: newProds };
            setConfigForm(newConfig);
            onSave(newConfig);
            setToast({ title: 'Catalog', message: "SKU Purged from Database", type: "info" });
        // }
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

        // const confirmed = window.confirm(`Confirm catalog update for ${updatedProduct.name}?`);
        // if (!confirmed) return;

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
        <div className="flex flex-col h-full gap-4 animate-in fade-in duration-700 w-full overflow-hidden pb-4">
            
            <div className="flex items-center justify-between items-end border-b border-border-subtle pb-4">
                <div className="flex bg-surface-alt/80 border border-border-subtle rounded-lg p-1">
                    <button 
                      onClick={() => { setActiveTab('catalog'); sfx.playClick(); }}
                      className={`flex items-center justify-center gap-2 px-6 py-2 text-sm font-bold rounded-md transition-all ${
                        activeTab === 'catalog' 
                          ? 'bg-surface-main text-text-primary shadow-sm border border-border-subtle' 
                          : 'text-text-muted hover:text-text-primary'
                      }`}
                    >
                      <PackageOpen size={16} /> Catalog & Inventory
                    </button>
                    <button 
                      onClick={() => { setActiveTab('presets'); sfx.playClick(); }}
                      className={`flex items-center justify-center gap-2 px-6 py-2 text-sm font-bold rounded-md transition-all ${
                        activeTab === 'presets' 
                          ? 'bg-surface-main text-text-primary shadow-sm border border-border-subtle' 
                          : 'text-text-muted hover:text-text-primary'
                      }`}
                    >
                      <Layers size={16} /> Fulfillment Presets
                    </button>
                </div>
            </div>

            {activeTab === 'catalog' ? (
                <div className="flex flex-col flex-1 overflow-hidden min-h-0">
                    <SupplyChainHUD stats={productLogic.stats} />

                    <div className="flex flex-col flex-1 overflow-hidden rounded-xl border border-border-subtle bg-surface-main relative min-h-0">
                        
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

                        <div className={`flex-1 overflow-y-auto custom-scrollbar p-5 bg-surface-alt/10 ${viewMode === 'list' ? 'px-3' : ''}`}>
                            <div className={viewMode === 'grid' 
                                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4" 
                                : "flex flex-col gap-2"
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

                        <div className="p-3 border-t border-border-subtle bg-surface-main shrink-0 flex justify-between items-center px-5">
                            <div className="flex items-center gap-5">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={14} className="text-status-success" />
                                    <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Verified</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Activity size={14} className="text-accent-primary" />
                                    <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Optimal</span>
                                </div>
                            </div>
                            <span className="text-[10px] font-mono text-text-muted opacity-50 uppercase tracking-widest">Product Module v4.5</span>
                        </div>

                        <ProductConfigModal 
                            isOpen={isEditModalOpen} 
                            onClose={() => setIsEditModalOpen(false)} 
                            product={editingProduct} 
                            onSave={handleSaveProduct} 
                        />
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-hidden">
                    <PresetManager productConfig={configForm} onUpdateConfig={onSave} />
                </div>
            )}
        </div>
    );
};
