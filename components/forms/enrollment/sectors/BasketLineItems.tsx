import React from 'react';
import { ChevronRight, Trash2, Heart, Check, Plus, Minus, Package } from 'lucide-react';
import { CartItem, ProductConfig } from '../../../../types';

interface Props {
    cart: CartItem[];
    updateLineItem: (index: number, field: keyof CartItem, value: string) => void;
    removeLineItem: (index: number) => void;
    productConfig: ProductConfig;
}

export const BasketLineItems: React.FC<Props> = ({ cart, updateLineItem, removeLineItem, productConfig }) => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {cart.map((item, index) => {
                const totalLine = ((parseInt(item.quantity)||1)*item.unitPrice);
                
                return (
                    <div key={item.id || index} className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h5 className="text-sm font-bold text-text-primary tracking-widest uppercase flex items-center gap-2">
                                <Package size={14} className="text-accent-primary" /> Item {index + 1}
                            </h5>
                            {cart.length > 1 && (
                                <button 
                                    onClick={() => removeLineItem(index)}
                                    className="flex items-center gap-1 text-sm font-bold tracking-widest text-status-error hover:text-red-400 uppercase transition-colors"
                                >
                                    <Trash2 size={12}/> Remove
                                </button>
                            )}
                        </div>
                        
                        {/* Shopify-like Product Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {(productConfig.products || []).map(p => {
                                const isSelected = item.product === p.name;
                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => updateLineItem(index, 'product', p.name)}
                                        className={`relative p-3 rounded-2xl flex flex-col items-center justify-center text-center gap-2 transition-all border ${isSelected ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)] scale-[1.02]' : 'bg-surface-alt/30 border-border-subtle hover:border-border-strong hover:bg-surface-alt/60'} group`}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSelected ? 'bg-indigo-500 text-white' : 'bg-surface-main border border-border-subtle text-text-muted'} shadow-inner`}>
                                            <Heart size={20} className={isSelected ? 'animate-pulse' : ''} />
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${isSelected ? 'text-text-primary' : 'text-text-muted'} tracking-tight line-clamp-2`}>{p.name}</p>
                                            <p className="text-sm font-mono text-text-muted mt-1">${p.price.toFixed(2)}</p>
                                        </div>
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                                                <Check size={10} strokeWidth={3} />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <div className="bg-surface-alt/20 border border-border-subtle rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 shadow-inner mt-2">
                            <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-3 gap-4">
                                {/* Quantity */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-bold text-text-muted uppercase tracking-widest text-center">Quantity</label>
                                    <div className="flex items-center justify-between bg-surface-main/60 border border-border-subtle rounded-xl p-1 overflow-hidden">
                                        <button 
                                            onClick={() => {
                                                const q = parseInt(item.quantity) || 1;
                                                if (q > 1) updateLineItem(index, 'quantity', (q - 1).toString());
                                            }}
                                            className="w-8 h-8 rounded-lg hover:bg-surface-helper flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="text-sm font-bold w-8 text-center">{item.quantity}</span>
                                        <button 
                                            onClick={() => {
                                                const q = parseInt(item.quantity) || 1;
                                                updateLineItem(index, 'quantity', (q + 1).toString());
                                            }}
                                            className="w-8 h-8 rounded-lg hover:bg-surface-helper flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Dosage / Variant */}
                                <div className="flex flex-col gap-1.5 md:col-span-2">
                                    <label className="text-sm font-bold text-text-muted uppercase tracking-widest">Variant / Dosage</label>
                                    <select 
                                        value={item.dosage} 
                                        onChange={(e) => updateLineItem(index, 'dosage', e.target.value)}
                                        className="w-full bg-surface-main/60 border border-border-subtle rounded-xl px-4 py-3.5 text-sm font-bold text-text-primary outline-none cursor-pointer hover:bg-surface-main/80 transition-all appearance-none"
                                    >
                                        {productConfig.products?.find(p => p.name === item.product)?.dosages.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            </div>
                            
                            {/* Yield */}
                            <div className="w-full md:w-32 flex flex-col items-center md:items-end gap-1.5">
                                <label className="text-sm font-bold text-status-success/80 uppercase tracking-widest">Subtotal</label>
                                <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 w-full rounded-xl text-center md:text-right">
                                    <span className="font-mono font-bold text-status-success text-base drop-shadow-sm">
                                        ${totalLine.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};