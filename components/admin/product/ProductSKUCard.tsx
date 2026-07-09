
import React from 'react';
import { Package, Power, Edit3, Copy, AlertTriangle, Trash2 } from 'lucide-react';
import { Product } from '../../../types';
import { getInventoryHealth, calculateMargin } from '../../../utils/productMath';

interface Props {
    product: Product;
    revenue: number;
    volume: number;
    onToggle: (id: string) => void;
    onEdit: (p: Product) => void;
    onDuplicate: (p: Product) => void;
    onDelete: (id: string) => void;
    viewMode: 'grid' | 'list';
}

export const ProductSKUCard: React.FC<Props> = ({ product, volume, onToggle, onEdit, onDuplicate, onDelete, viewMode }) => {
    const _health = getInventoryHealth(product);
    const margin = calculateMargin(product.price, product.cost || 0);

    // --- LIST VIEW ---
    if (viewMode === 'list') {
        return (
            <div className={`group flex items-center justify-between p-3 rounded-lg border transition-all hover:shadow-sm ${product.active ? 'bg-surface-main border-border-subtle hover:border-accent-primary/30' : 'bg-surface-alt/40 border-dashed border-border-subtle opacity-70'}`}>
                
                {/* Left Side: Drag Handle & Core Identity */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex flex-col gap-[3px] px-1 opacity-20 cursor-grab hover:opacity-100 transition-opacity">
                        <div className="w-1 h-1 bg-text-primary rounded-full"></div>
                        <div className="w-1 h-1 bg-text-primary rounded-full"></div>
                        <div className="w-1 h-1 bg-text-primary rounded-full"></div>
                    </div>
                    
                    <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 border ${product.active ? 'bg-accent-primary/10 border-accent-primary/20 text-accent-primary' : 'bg-surface-alt text-text-muted border-border-subtle'}`}>
                        <Package size={18} strokeWidth={2.5}/>
                    </div>
                    
                    <div className="flex flex-col min-w-0 pr-4">
                        <div className="flex items-center gap-2 mb-0.5">
                            <h5 className="font-bold text-[14px] text-text-primary tracking-tight truncate">{product.name}</h5>
                            {!product.active && <span className="text-[10px] bg-surface-alt border border-border-subtle px-1.5 py-0.5 rounded font-bold text-text-muted uppercase tracking-wider">Draft</span>}
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="text-[11px] font-bold uppercase tracking-widest text-text-muted bg-surface-alt px-1.5 py-0.5 rounded border border-border-subtle w-fit">
                                {product.category || 'GENERAL'}
                             </div>
                             <span className="text-xs text-text-muted font-mono">{product.sku || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Middle: Economics */}
                <div className="flex items-center gap-8 px-6 border-l border-r border-border-subtle mx-4 shrink-0 hidden lg:flex">
                    <div className="w-24">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Pricing</p>
                        <p className="text-sm font-bold text-text-primary num-font">${product.price.toFixed(2)}</p>
                    </div>
                    <div className="w-24">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Cost</p>
                        <p className="text-sm font-medium text-text-secondary num-font">${product.cost?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="w-24">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Margin</p>
                        <div className="flex items-center gap-1.5">
                            <p className={`text-sm font-bold num-font ${margin > 40 ? 'text-status-success' : 'text-status-warning'}`}>{margin}%</p>
                            <div className={`w-1.5 h-1.5 rounded-full ${margin > 40 ? 'bg-status-success' : 'bg-status-warning'} animate-pulse`}></div>
                        </div>
                    </div>
                    <div className="w-24">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Stock</p>
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-mono text-text-primary">{product.stock || 0}</p>
                            {(product.stock || 0) < 20 && <AlertTriangle size={12} className="text-status-error" />}
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => onToggle(product.id)} className={`p-2 rounded-md border border-transparent transition-all ${product.active ? 'hover:bg-amber-500/10 hover:text-status-warning hover:border-amber-500/20 text-text-muted' : 'text-text-muted hover:text-status-success hover:bg-emerald-500/10 hover:border-emerald-500/20'}`} title={product.active ? 'Deactivate' : 'Publish'}>
                        <Power size={14} strokeWidth={2.5}/>
                    </button>
                    <button onClick={() => onDuplicate(product)} className="p-2 hover:bg-surface-alt border border-transparent hover:border-border-subtle rounded-md text-text-muted transition-colors" title="Duplicate">
                        <Copy size={14} strokeWidth={2.5}/>
                    </button>
                    <button onClick={() => onEdit(product)} className="p-2 hover:bg-accent-primary/10 border border-transparent hover:border-accent-primary/20 rounded-md text-text-muted hover:text-accent-primary transition-colors" title="Edit Configuration">
                        <Edit3 size={14} strokeWidth={2.5}/>
                    </button>
                    <div className="w-px h-4 bg-border-subtle mx-1"></div>
                    <button onClick={() => onDelete(product.id)} className="p-2 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-md text-text-muted hover:text-status-error transition-colors" title="Delete">
                        <Trash2 size={14} strokeWidth={2.5}/>
                    </button>
                </div>
            </div>
        );
    }

    // --- GRID VIEW ---
    return (
        <div className={`group relative bg-surface-main border rounded-xl p-5 transition-all duration-300 hover:shadow-lg overflow-hidden flex flex-col ${
            product.active ? 'border-border-subtle hover:border-accent-primary/40' : 'border-dashed opacity-70 bg-surface-alt/40'
        }`}>
            {/* Hover Actions */}
            <div className="absolute top-4 right-4 flex gap-1 z-20">
                <button onClick={() => onDuplicate(product)} className="opacity-0 group-hover:opacity-100 p-2 rounded-md bg-surface-main hover:bg-surface-alt text-text-muted hover:text-text-primary border border-border-subtle shadow-sm transition-all" title="Clone SKU">
                    <Copy size={14}/>
                </button>
                <button onClick={() => onToggle(product.id)} className={`p-2 rounded-md bg-surface-main border shadow-sm transition-all ${product.active ? 'opacity-0 group-hover:opacity-100 border-border-subtle hover:bg-amber-500/10 hover:text-status-warning hover:border-amber-500/20 text-text-muted' : 'border-status-success/30 bg-emerald-500/10 text-status-success hover:bg-emerald-500/20'}`} title={product.active ? 'Deactivate' : 'Publish'}>
                    <Power size={14}/>
                </button>
                <button onClick={() => onEdit(product)} className="opacity-0 group-hover:opacity-100 p-2 bg-surface-main hover:bg-accent-primary/10 rounded-md text-text-muted hover:text-accent-primary border border-border-subtle hover:border-accent-primary/20 shadow-sm transition-all" title="Edit SKU">
                    <Edit3 size={14}/>
                </button>
            </div>

            <div className="flex-1 space-y-4 relative z-10 w-full">
                <div className="flex justify-between items-start mb-2">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center border shadow-inner transition-transform group-hover:scale-105 ${product.active ? 'bg-accent-primary/5 border-accent-primary/20 text-accent-primary' : 'bg-surface-alt text-text-muted'}`}>
                        <Package size={24} strokeWidth={2}/>
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted bg-surface-alt border border-border-subtle px-1.5 py-0.5 rounded truncate max-w-[60%]">{product.category || 'GENERAL'}</p>
                        <p className="text-xs font-mono text-text-muted truncate">{product.sku || 'N/A'}</p>
                    </div>
                    <h5 className="font-bold text-text-primary text-[15px] tracking-tight truncate pr-2">{product.name}</h5>
                    
                    <div className="mt-4 pt-4 border-t border-border-subtle/50 grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-0.5">Price</p>
                            <p className="text-lg font-bold text-text-primary num-font">${product.price.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-0.5">Margin</p>
                            <p className={`text-lg font-bold num-font ${margin > 40 ? 'text-status-success' : 'text-status-warning'}`}>{margin}%</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <button onClick={() => onDelete(product.id)} className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 p-2 text-text-muted hover:text-status-error hover:bg-red-500/10 rounded-md transition-all z-20">
                <Trash2 size={14}/>
            </button>
        </div>
    );
};
