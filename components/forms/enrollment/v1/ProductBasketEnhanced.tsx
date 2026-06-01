import React from 'react';
import { ShoppingCart, Edit3, PackageOpen } from 'lucide-react';
import { CartItem } from '../../../../types';
import { ProductQuickSelector } from '../ProductQuickSelector';
import { CartPreview } from '../CartPreview';
import { Card } from '../../../ui/Base';

interface Props {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  activeProducts: any[];
  activePresets: any[];
  quantities: string[];
  calculatedTotal: number;
}

export function ProductBasketEnhanced({
  cart,
  setCart,
  notes,
  setNotes,
  activeProducts,
  activePresets,
  quantities,
  calculatedTotal
}: Props) {
  const handleAdd = (item: CartItem) => {
    setCart((prev) => [...prev, item]);
  };

  const handleRemove = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleQuickAdd = (preset: any) => {
    const newItems = preset.items.map((presetItem: any) => {
      const productDef = activeProducts.find(p => p.name === presetItem.product);
      return {
        id: crypto.randomUUID(),
        product: presetItem.product,
        quantity: presetItem.quantity,
        dosage: presetItem.dosage || (productDef?.dosages?.[0] || ''),
        unitPrice: productDef?.price || 0
      };
    });
    setCart(prev => [...prev, ...newItems]);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header/Toggle Card */}
      <div 
        className="mb-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-3">
             <div className={`p-2.5 rounded-xl ${cart.length > 0 ? 'bg-status-success/10 text-status-success' : 'bg-surface-alt text-text-muted border border-border-subtle'}`}>
                <ShoppingCart size={20} />
             </div>
             <div>
               <h3 className="font-bold text-lg tracking-tight text-text-primary">
                 Order Contents
               </h3>
               <p className="text-sm text-text-muted mt-0.5">
                 Select the products and configure dosages
               </p>
             </div>
          </div>
          <div className="flex items-center gap-4">
             {cart.length > 0 && (
               <div className="text-right">
                 <span className="block text-xs font-medium text-text-muted tracking-wide">Basket Total</span>
                 <span className="block font-black text-xl tracking-tight text-status-success">${calculatedTotal.toFixed(2)}</span>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Content View */}
      <div className="animate-in slide-in-from-top-4 fade-in duration-300 flex flex-col gap-6">
          <ProductQuickSelector
            products={activeProducts}
            presets={activePresets}
            quantities={quantities}
            onAdd={handleAdd}
            onQuickAdd={handleQuickAdd}
          />
          
          <div className="flex flex-col gap-2">
            <h4 className="text-[11px] font-black text-text-muted tracking-widest uppercase flex items-center gap-2">
              <PackageOpen size={14} /> CURRENT CART
            </h4>
            <CartPreview
              cart={cart}
              onRemove={handleRemove}
              calculatedTotal={calculatedTotal}
            />
          </div>

          <Card variant="refraction" className="p-4 bg-surface-main border-border-subtle shadow-sm flex flex-col gap-3">
             <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-text-muted tracking-widest flex items-center gap-1.5 uppercase">
                   <Edit3 size={14} className="text-indigo-400" /> ORDER NOTES
                </label>
                <span className="text-[10px] font-mono text-text-muted/70">
                   {notes.length.toLocaleString()}/2000
                </span>
             </div>
             <textarea
               value={notes}
               onChange={(e) => setNotes(e.target.value.substring(0, 2000))}
               placeholder="Special instructions, delivery requests, or agent notes to attach to this order..."
               className="w-full bg-surface-alt/50 border border-border-subtle rounded-xl p-3 text-sm text-text-primary outline-none focus:border-indigo-500/50 resize-y min-h-[80px]"
             />
          </Card>
      </div>
    </div>
  );
}
