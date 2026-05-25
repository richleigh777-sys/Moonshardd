import React from 'react';
import { ShoppingCart, Trash2, CheckCircle2 } from 'lucide-react';
import { sfx } from '../../../lib/soundService';
import { CartItem } from '../../../types';
import { Card } from '../../ui/Base';

interface Props {
  cart: CartItem[];
  onRemove: (id: string) => void;
  calculatedTotal: number;
}

export function CartPreview({ cart, onRemove, calculatedTotal }: Props) {
  const getQuantityMultiplier = (qty: string): number => {
    const q = qty.toLowerCase();
    if (q.includes('90')) return 3;
    if (q.includes('180')) return 6;
    if (q.includes('365') || q.includes('1 year')) return 12;
    const match = q.match(/^(\d+)/);
    if (match && !q.includes('day')) {
      return parseInt(match[1], 10) || 1;
    }
    return 1;
  };

  const handleRemove = (id: string, isLast: boolean) => {
    if (isLast) {
      if (confirm('Remove the last item from your cart?')) {
        onRemove(id);
        sfx.playClick();
      }
    } else {
      onRemove(id);
      sfx.playClick();
    }
  };

  // Only show first 4 items in compact preview
  const MAX_VISIBLE = 4;
  const visibleItems = cart.slice(0, MAX_VISIBLE);
  const hiddenCount = cart.length - MAX_VISIBLE;

  return (
    <Card className="flex flex-col overflow-hidden border-border-subtle shadow-md bg-surface-main">
      {/* Summary Header */}
      <div className="bg-gradient-to-r from-emerald-600/90 to-emerald-500/90 p-3 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <ShoppingCart size={18} />
          <span className="font-bold text-sm tracking-wide">ORDER SUMMARY</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs bg-black/20 px-2 py-1 rounded-md font-medium">
             <span className="opacity-80">Items:</span>
             <span className="font-bold">{cart.length}</span>
          </div>
          <div className="bg-white/10 px-3 py-1 rounded-lg border border-white/20">
             <span className="font-black">${calculatedTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {cart.length === 0 ? (
          <div className="text-center py-6 px-4 bg-surface-alt/30 rounded-xl border border-dashed border-border-subtle">
            <ShoppingCart size={32} className="mx-auto text-text-muted/30 mb-2" />
            <p className="text-sm font-bold text-text-muted">Cart is empty</p>
            <p className="text-xs text-text-muted/70 mt-1">Add items using the selector above</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {visibleItems.map((item, index) => {
              const multiplier = getQuantityMultiplier(item.quantity);
              const isLast = cart.length === 1;
              return (
                <div 
                   key={item.id || index} 
                   className="group bg-surface-alt/60 rounded-xl p-3 border border-border-subtle/50 hover:border-emerald-500/30 transition-colors shadow-sm flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-text-primary truncate">{item.product}</span>
                      {item.dosage && (
                        <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold shrink-0">
                          {item.dosage}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-text-muted">{item.quantity}</span>
                      <span className="text-border-subtle">•</span>
                      <span className="text-text-muted font-mono">${item.unitPrice.toFixed(2)}</span>
                      {multiplier > 1 && (
                         <>
                           <span className="text-border-subtle">•</span>
                           <span className="font-bold text-emerald-400">{multiplier}x qty</span>
                         </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                       <span className="block font-black text-status-success text-sm">
                         ${(item.unitPrice * multiplier).toFixed(2)}
                       </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id || '', isLast)}
                      className="p-1.5 text-status-error/50 hover:bg-status-error/10 hover:text-status-error rounded-md transition-colors border border-transparent opacity-0 group-hover:opacity-100 focus:opacity-100"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
            
            {hiddenCount > 0 && (
              <div className="py-2 text-center text-xs font-bold text-text-muted bg-surface-alt/30 rounded-xl border border-dashed border-border-subtle">
                 + {hiddenCount} more {hiddenCount === 1 ? 'item' : 'items'}
              </div>
            )}
            
            {/* Checklist */}
            {cart.length > 0 && (
              <div className="mt-2 pt-3 border-t border-border-subtle">
                 <div className="flex items-center gap-2 text-xs text-text-muted font-medium">
                    <CheckCircle2 size={14} className="text-status-success" />
                    <span>Calculated total matches customer expectations</span>
                 </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
