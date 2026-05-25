import React, { useState } from 'react';
import { ShoppingCart, Edit3, ChevronDown, ChevronUp, PackageOpen } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(cart.length === 0); // Open by default if empty

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
      <Card 
        className="bg-surface-main border-border-subtle shadow-sm cursor-pointer hover:border-indigo-500/30 transition-colors overflow-hidden relative"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-lg ${cart.length > 0 ? 'bg-status-success/20 text-status-success' : 'bg-surface-alt text-text-muted'}`}>
                <ShoppingCart size={20} />
             </div>
             <div>
               <h3 className="font-black text-sm tracking-widest text-text-primary">
                 ORDER DESK
               </h3>
               {cart.length > 0 && (
                 <p className="text-xs text-text-muted mt-0.5">
                   {cart.length} {cart.length === 1 ? 'item' : 'items'} in cart
                 </p>
               )}
             </div>
          </div>
          <div className="flex items-center gap-4">
             {cart.length > 0 && !isExpanded && (
               <div className="text-right mr-2">
                 <span className="block text-[10px] uppercase font-bold text-text-muted tracking-wide">Total</span>
                 <span className="block font-black text-emerald-400">${calculatedTotal.toFixed(2)}</span>
               </div>
             )}
             <button className="text-text-muted hover:text-indigo-400 transition-colors p-1 relative">
                {notes && <span className="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-full" />}
                {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
             </button>
          </div>
        </div>
        
        {/* Progress bar visual tied to cart status */}
        <div className="h-1 w-full bg-surface-alt">
          <div 
             className={`h-full transition-all duration-1000 ${cart.length > 0 ? 'bg-status-success w-full' : 'w-0'}`} 
          />
        </div>
      </Card>

      {/* Expanded Content View */}
      {isExpanded && (
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

          <Card className="p-4 bg-surface-main border-border-subtle shadow-sm flex flex-col gap-3">
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
      )}
    </div>
  );
}
