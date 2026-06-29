import React from 'react';
import { ShoppingCart, Edit3, PackageOpen } from 'lucide-react';
import { CartItem } from '../../../../types';
import { ProductQuickSelector } from '../ProductQuickSelector';
import { CartPreview } from '../CartPreview';

export function ProductBasketEnhanced({
  cart, setCart, notes, setNotes, activeProducts, activePresets, quantities, calculatedTotal
}: any) {
  const handleAdd = (item: CartItem) => setCart((prev) => [...prev, item]);
  const handleRemove = (id: string) => setCart((prev) => prev.filter((item) => item.id !== id));
  const handleQuickAdd = (preset: any) => {
    const newItems = preset.items.map((presetItem: any) => {
      const productDef = activeProducts.find((p: any) => p.name === presetItem.product);
      return {
        id: crypto.randomUUID(),
        product: presetItem.product,
        quantity: presetItem.quantity,
        dosage: presetItem.dosage || (productDef?.dosages?.[0] || ''),
        unitPrice: productDef?.price || 0
      };
    });
    setCart((prev: any[]) => [...prev, ...newItems]);
  };

  return (
    <div className="flex flex-col h-full gap-6">
      {cart.length > 0 && (
        <div className="flex justify-between items-center bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-6 py-4 shrink-0 transition-all shadow-sm">
            <div className="flex items-center gap-3 text-emerald-500">
                <div className="p-2 bg-emerald-500/20 rounded-full"><ShoppingCart size={20} /></div>
                <span className="text-sm font-semibold tracking-wide">Basket Ready</span>
            </div>
            <div className="text-right flex items-center gap-4">
                <span className="text-sm font-semibold text-emerald-500/70 tracking-wide uppercase">Subtotal</span>
                <span className="font-bold text-2xl text-emerald-500">$${calculatedTotal.toFixed(2)}</span>
            </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar border border-border-subtle rounded-xl shadow-sm bg-surface-alt/50">
          <ProductQuickSelector
            products={activeProducts}
            presets={activePresets}
            quantities={quantities}
            onAdd={handleAdd}
            onQuickAdd={handleQuickAdd}
            cart={cart}
            onRemove={handleRemove}
          />
      </div>
      
      <div className="shrink-0 flex flex-col gap-4">
          <div className="flex flex-col gap-3 border border-border-subtle rounded-xl p-5 bg-surface-alt/50 shadow-sm">
            <h4 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
              <PackageOpen size={16} className="text-indigo-400" /> Selected Items
            </h4>
            <div className="max-h-56 overflow-y-auto custom-scrollbar">
               <CartPreview cart={cart} onRemove={handleRemove} calculatedTotal={calculatedTotal} />
            </div>
          </div>

          <div className="p-5 bg-surface-alt/50 border border-border-subtle rounded-xl shadow-sm flex flex-col gap-3">
             <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-white tracking-wide flex items-center gap-2 uppercase">
                   <Edit3 size={16} className="text-indigo-400" /> Order Notes
                </label>
             </div>
             <input
               value={notes}
               onChange={(e) => setNotes(e.target.value)}
               placeholder="Add special instructions or details..."
               className="w-full bg-surface-main border border-border-subtle rounded-xl px-4 py-3 text-sm text-white placeholder-text-muted outline-none transition-all focus:border-white focus:bg-surface-alt focus:ring-1 focus:ring-white shadow-inner"
             />
          </div>
      </div>
    </div>
  );
}