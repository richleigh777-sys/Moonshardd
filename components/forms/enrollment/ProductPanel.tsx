
import React from 'react';
import { Plus, Command, Package } from 'lucide-react';
import { CartItem, ProductConfig } from '../../../types';
import { sfx } from '../../../lib/soundService';
import { BasketLineItems } from './sectors/BasketLineItems';

interface ProductPanelProps {
    cart: CartItem[];
    setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
    productConfig: ProductConfig;
    notes: string;
    setNotes: (val: string) => void;
}

export const ProductPanel: React.FC<ProductPanelProps> = ({ 
    cart, setCart, productConfig, notes, setNotes 
}) => {
    
    const addLineItem = () => {
        const defaultProd = (productConfig.products || [])[0];
        if (!defaultProd) return;
        sfx.playClick();
        setCart([...cart, { 
          id: crypto.randomUUID(),
          product: defaultProd.name, quantity: '1', dosage: defaultProd.dosages[0] || 'Standard', unitPrice: defaultProd.price
        }]);
    };

    const removeLineItem = (index: number) => {
        if (cart.length === 1) return;
        sfx.playDecline();
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const updateLineItem = (index: number, field: keyof CartItem, value: string) => {
        const newCart = [...cart];
        const item = { ...newCart[index] };
        if (field === 'product') {
          const config = (productConfig.products || []).find(p => p.name === value);
          if (config) {
            item.product = config.name;
            item.unitPrice = config.price; 
            item.dosage = config.dosages[0] || 'Standard';       
            item.quantity = config.quantities?.[0] || '1';
          }
        } else {
          (item as any)[field] = value;
        }
        newCart[index] = item;
        setCart(newCart);
    };

    return (
        <div className="w-full bg-surface-main/40 backdrop-blur-3xl text-text-primary border border-border-subtle rounded-3xl overflow-hidden shadow-panel">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between bg-transparent">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-surface-highlight to-surface-main border border-border-subtle shadow-lg rounded-xl text-status-warning">
                        <Package size={16} className="drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                    </div>
                    <h4 className="text-xs font-[700]  text-text-primary tracking-[0.2em]">Order Manifest</h4>
                </div>

                <button 
                    onClick={addLineItem} 
                    className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-br from-amber-500/20 to-amber-500/5 hover:from-amber-500/30 hover:to-amber-500/10 text-status-warning rounded-xl border border-status-warning/30 transition-all active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.15)] group"
                >
                    <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span className="text-[10px] font-[700]  tracking-widest shadow-none drop-shadow-md">Add</span>
                </button>
            </div>
            
            <div className="p-4 space-y-6">
                <BasketLineItems 
                    cart={cart} 
                    updateLineItem={updateLineItem} 
                    removeLineItem={removeLineItem} 
                    productConfig={productConfig} 
                />
                
                <div className="pt-8 border-t border-border-subtle relative">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
                    <div className="flex items-center gap-3 mb-4">
                        <Command size={16} className="text-status-warning drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]"/>
                        <label className="text-xs font-[700]  text-status-warning/80 tracking-[0.2em]">Deployment Notes</label>
                    </div>
                    <textarea 
                        value={notes} onChange={e => setNotes(e.target.value)}
                        className="w-full h-28 bg-surface-alt/30 border border-border-subtle rounded-2xl p-5 text-sm font-medium text-text-primary placeholder:text-zinc-600 focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 outline-none resize-none transition-all leading-relaxed shadow-inner"
                        placeholder="Add special handling instructions or customer requests..."
                    />
                </div>
            </div>
        </div>
    );
};
