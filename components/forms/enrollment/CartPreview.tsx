import React from 'react';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { getQuantityMultiplier } from '../../../utils/quantityUtils';

export function CartPreview({ cart, onRemove, _calculatedTotal }: any) {
    const groupedCart: any[] = [];
    cart.forEach((item: any) => {
      const key = `${item.product}-${item.dosage || ''}`;
      const existing = groupedCart.find(g => g.productKey === key);
      const mult = getQuantityMultiplier(item.quantity) || 1;
      
      if (existing) {
        existing.count += 1;
        existing.quantityMultipliers += mult;
        existing.totalPrice += (item.unitPrice * mult);
        existing.ids.push(item.id || '');
      } else {
        groupedCart.push({
          productKey: key,
          product: item.product,
          dosage: item.dosage,
          quantityMultipliers: mult,
          basePrice: item.unitPrice,
          count: 1,
          totalPrice: item.unitPrice * mult,
          ids: [item.id || '']
        });
      }
    });

  return (
    <div className="flex flex-col overflow-hidden bg-surface-main rounded-xl border border-border-subtle shadow-inner">
      <div className="p-4 flex flex-col gap-3">
        {cart.length === 0 ? (
          <div className="text-center py-6 px-4 bg-surface-alt/20 rounded-[16px] border border-dashed border-border-strong">
            <ShoppingCart size={32} className="mx-auto text-text-muted/30 mb-2" />
            <p className="text-sm font-semibold text-text-muted">No items selected</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {groupedCart.map((group, index) => {
              const handleRemoveOne = () => {
                const idToRemove = group.ids[group.ids.length - 1]; 
                if(idToRemove) onRemove(idToRemove);
              };

              return (
                <div key={index} className="flex justify-between items-center bg-surface-alt/50 border border-border-subtle rounded-xl p-3 pr-4 group transition-all">
                  <div className="flex items-center gap-3 w-full">
                    <div className="bg-surface-hover text-white/50 border border-border-strong rounded-lg p-2 flex items-center justify-center shrink-0">
                      <ShoppingCart size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="truncate font-semibold text-sm text-white">
                            {group.product}
                        </div>
                        {group.count > 1 && (
                            <span className="bg-emerald-500/20 text-emerald-400 text-sm font-bold px-2 py-0.5 rounded-full">
                                x{group.count}
                            </span>
                        )}
                      </div>
                      {(group.dosage || group.quantityMultipliers > 1) && (
                        <div className="text-sm font-medium text-text-muted flex gap-2 mt-0.5">
                            {group.dosage && <span>{group.dosage}</span>}
                            {group.quantityMultipliers > 1 && <span>{group.quantityMultipliers} MO Supply</span>}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 pl-4 border-l border-border-subtle">
                        <div className="text-emerald-400 font-bold text-sm">
                            $${group.totalPrice.toFixed(2)}
                        </div>
                        <button 
                            type="button"
                            onClick={handleRemoveOne} 
                            className="bg-black/20 hover:bg-rose-500/20 text-text-muted hover:text-rose-400 p-2 rounded-lg transition-colors"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}