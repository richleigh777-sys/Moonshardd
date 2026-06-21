
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
    const health = getInventoryHealth(product);
    const margin = calculateMargin(product.price, product.cost || 0);

    // --- LIST VIEW ---
    if (viewMode === 'list') {
        return (
            <div className={`group flex items-center justify-between p-4 rounded-xl border transition-all hover:bg-surface-alt/40 ${product.active ? 'bg-surface-main border-border-subtle' : 'bg-surface-alt/20 border-dashed border-border-subtle opacity-60'}`}>
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner ${product.active ? 'bg-accent-primary/10 border-accent-primary/20 text-accent-primary' : 'bg-surface-alt text-text-muted border-border-subtle'}`}>
                        <Package size={18} strokeWidth={2.5}/>
                    </div>
                    <div>
                        <h5 className="font-bold text-sm text-text-primary  tracking-tight">{product.name}</h5>
                        <p className="text-sm font-medium  text-text-muted tracking-wide">{product.category || 'GENERAL'} • {product.sku || 'NO-SKU'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-5">
                    <div className="text-right">
                        <p className="text-sm font-medium  text-text-muted tracking-wide mb-0.5">Price</p>
                        <p className="text-sm font-medium num-font text-text-primary">${product.price}</p>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium  text-text-muted tracking-wide mb-0.5">Margin</p>
                        <p className="text-sm font-medium num-font text-status-success">{margin}%</p>
                    </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onDuplicate(product)} className="p-2 hover:bg-blue-500/10 hover:text-blue-500 rounded-lg text-text-muted transition-colors"><Copy size={16}/></button>
                    <button onClick={() => onEdit(product)} className="p-2 hover:bg-accent-primary/10 hover:text-accent-primary rounded-lg text-text-muted transition-colors"><Edit3 size={16}/></button>
                    <button onClick={() => onToggle(product.id)} className={`p-2 rounded-lg transition-colors ${product.active ? 'hover:bg-amber-500/10 hover:text-status-warning text-text-muted' : 'text-text-muted hover:text-status-success'}`}><Power size={16}/></button>
                    <div className="w-px h-4 bg-border-subtle mx-1"></div>
                    <button onClick={() => onDelete(product.id)} className="p-2 hover:bg-red-500/10 hover:text-status-error rounded-lg text-text-muted transition-colors"><Trash2 size={16}/></button>
                </div>
            </div>
        );
    }

    // --- GRID VIEW ---
    return (
        <div className={`group relative bg-surface-main border rounded-[1.8rem] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden flex flex-col ${
            product.active ? 'border-border-subtle hover:border-accent-primary/40' : 'border-dashed opacity-60 bg-surface-alt/20'
        }`}>
            {/* Hover Actions */}
            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-20 translate-x-2 group-hover:translate-x-0">
                <button onClick={() => onDuplicate(product)} className="p-2 rounded-xl bg-surface-alt hover:bg-blue-500/10 text-text-muted hover:text-blue-500 border border-border-subtle shadow-sm transition-all" title="Clone SKU">
                    <Copy size={16}/>
                </button>
                <button onClick={() => onToggle(product.id)} className="p-2 rounded-xl bg-surface-alt hover:bg-amber-500/10 text-text-muted hover:text-status-warning border border-border-subtle shadow-sm transition-all" title={product.active ? 'Deactivate' : 'Activate'}>
                    <Power size={16}/>
                </button>
                <button onClick={() => onEdit(product)} className="p-2 bg-surface-alt hover:bg-accent-primary/10 rounded-xl text-text-muted hover:text-accent-primary border border-border-subtle shadow-sm transition-all" title="Edit SKU">
                    <Edit3 size={16}/>
                </button>
                <button onClick={() => onDelete(product.id)} className="p-2 bg-surface-alt hover:bg-red-500/10 rounded-xl text-text-muted hover:text-status-error border border-border-subtle shadow-sm transition-all" title="Delete SKU">
                    <Trash2 size={16}/>
                </button>
            </div>

            <div className="flex-1 space-y-4 relative z-10">
                <div className="flex justify-between items-start">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner transition-transform group-hover:scale-110 ${product.active ? 'bg-accent-primary/10 border-accent-primary/20 text-accent-primary' : 'bg-surface-alt text-text-muted'}`}>
                        <Package size={18} strokeWidth={2.5}/>
                    </div>
                </div>

                <div>
                    <p className="text-sm font-medium  text-text-muted tracking-wide mb-1 truncate opacity-70">{product.category || 'GENERAL'}</p>
                    <h5 className="font-medium text-text-primary text-base  tracking-tight italic truncate pr-8 leading-tight">{product.name}</h5>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-xl font-medium text-text-primary num-font">${product.price}</span>
                        <span className={`text-sm font-bold  px-3 py-1.5 rounded border ${margin > 50 ? 'bg-emerald-500/10 text-status-success border-emerald-500/20' : margin < 20 ? 'bg-red-500/10 text-status-error border-red-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                            {margin}% Margin
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
