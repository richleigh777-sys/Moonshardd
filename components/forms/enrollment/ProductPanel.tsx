
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
        <div className="w-full bg-[#121214] text-white border border-white/5 rounded-2xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                        <Package size={16} />
                    </div>
                    <h4 className="text-xs font-bold uppercase text-white tracking-wider">Order Manifest</h4>
                </div>

                <button 
                    onClick={addLineItem} 
                    className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-lg border border-amber-500/20 transition-all active:scale-95"
                >
                    <Plus size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wide">Add Product</span>
                </button>
            </div>
            
            <div className="p-6 space-y-6">
                <BasketLineItems 
                    cart={cart} 
                    updateLineItem={updateLineItem} 
                    removeLineItem={removeLineItem} 
                    productConfig={productConfig} 
                />
                
                <div className="pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                        <Command size={14} className="text-zinc-500"/>
                        <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Deployment Notes</label>
                    </div>
                    <textarea 
                        value={notes} onChange={e => setNotes(e.target.value)}
                        className="w-full h-24 bg-black/20 border border-white/10 rounded-xl p-4 text-xs font-medium text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 outline-none resize-none transition-all leading-relaxed"
                        placeholder="Add special handling instructions or customer requests..."
                    />
                </div>
            </div>
        </div>
    );
};
