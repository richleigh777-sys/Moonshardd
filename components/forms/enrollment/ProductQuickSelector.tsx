import { useEffect } from 'react';
import { Package, Pill, CalendarClock, Plus, Check } from 'lucide-react';
import { sfx } from '../../../lib/soundService';
import { Product, ProductPreset, CartItem } from '../../../types';
import { Card } from '../../ui/Base';
import { getQuantityMultiplier } from '../../../utils/quantityUtils';

export function ProductQuickSelector({ products, presets, quantities, onAdd, onQuickAdd, cart = [], onRemove }: any) {
  useEffect(() => {
    // Keyboard shortcuts ignored for simplicity in new design
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Target Product Selection */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-white tracking-wide uppercase">Available Treatments</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((p: any) => {
                const thisProductItems = cart.filter((item: any) => item.product === p.name);
                const qtyInCart = thisProductItems.length;

                const handleIncrement = () => {
                    onAdd({
                    id: crypto.randomUUID(),
                    product: p.name,
                    quantity: quantities[0] || '30 Day Supply',
                    dosage: '',
                    unitPrice: p.price,
                    });
                    sfx.playSuccess();
                };

                const handleDecrement = () => {
                    if (qtyInCart > 0 && onRemove) {
                    const itemToRemove = thisProductItems[thisProductItems.length - 1];
                    if (itemToRemove && itemToRemove.id) {
                        onRemove(itemToRemove.id, false);
                    }
                    }
                };

                return (
                    <div key={p.id} className="flex items-center justify-between p-4 rounded-[16px] bg-surface-alt/50 border border-border-subtle hover:border-white/20 transition-all shadow-sm">
                        <div className="flex flex-col gap-1">
                            <div className="font-semibold text-base text-white">{p.name}</div>
                            <div className="text-sm text-emerald-400 font-medium">
                                $${qtyInCart > 0 ? (p.price * qtyInCart).toFixed(2) : p.price.toFixed(2)} {qtyInCart > 1 ? `(${qtyInCart} Units)` : ''}
                            </div>
                        </div>
                        <div className="flex items-center bg-surface-main border border-border-strong rounded-xl overflow-hidden h-10 shadow-inner">
                            <button 
                            type="button" 
                            onClick={handleDecrement}
                            className="px-4 h-full flex items-center justify-center text-text-secondary hover:text-white hover:bg-border-subtle transition-colors"
                            >
                            <span className="font-bold text-lg select-none">-</span>
                            </button>
                            <div className="w-8 text-center font-bold text-sm text-white select-none">{qtyInCart}</div>
                            <button 
                            type="button" 
                            onClick={handleIncrement}
                            className="px-4 h-full flex items-center justify-center text-text-secondary hover:text-white hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors"
                            >
                            <span className="font-bold text-lg select-none">+</span>
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
      
      {/* Bundles */}
      {presets && presets.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-border-subtle mt-2">
            <h4 className="text-sm font-bold text-white tracking-wide uppercase mt-2">Care Bundles</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {presets.map((preset: any, idx: number) => (
                    <div key={preset.id} className="p-4 bg-surface-alt/50 border border-border-subtle rounded-[16px] flex justify-between items-center group hover:border-white/20 transition-all shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/20">
                                <Package size={20} />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <div className="font-semibold text-base text-white">{preset.name}</div>
                                <div className="text-sm text-text-muted font-medium line-clamp-1">{preset.items.map((i:any)=>i.product).join(' + ')}</div>
                            </div>
                        </div>
                        <button 
                            onClick={() => { onQuickAdd(preset); sfx.playSuccess(); }}
                            className="h-10 px-4 flex items-center gap-2 bg-surface-main hover:bg-surface-highlight text-text-secondary hover:text-text-primary rounded-xl font-bold text-sm uppercase tracking-wide transition-all shadow-inner border border-border-strong"
                        >
                            <Plus size={14} /> Add Bundle
                        </button>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}