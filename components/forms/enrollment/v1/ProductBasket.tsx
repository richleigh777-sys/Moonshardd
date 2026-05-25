import React from 'react';
import { ShoppingCart, Plus, Trash2 } from 'lucide-react';
import { Card } from '../../../ui/Base';
import { CartItem } from '../../../../types';

interface ProductBasketProps {
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  productConfig: any;
  notes: string;
  setNotes: (notes: string) => void;
  calculatedTotal: number;
}

export const ProductBasket: React.FC<ProductBasketProps> = ({
  cart,
  setCart,
  productConfig,
  notes,
  setNotes,
  calculatedTotal,
}) => {
  const addProduct = (product: any) => {
    const newItem: CartItem = {
      id: crypto.randomUUID(),
      product: product.name,
      quantity: '30 Day Supply',
      dosage: product.dosages?.[0] || 'Standard',
      unitPrice: product.price,
    };
    setCart([...cart, newItem]);
  };

  const removeProduct = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const updateCartItem = (id: string, field: keyof CartItem, value: string) => {
    setCart(
      cart.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'product') {
            const config = productConfig.products?.find((p: any) => p.name === value);
            if (config) {
              updated.unitPrice = config.price;
              updated.dosage = config.dosages?.[0] || 'Standard';
            }
          }
          return updated;
        }
        return item;
      })
    );
  };

  return (
    <Card variant="panel" className="shrink-0 p-5 border-border-subtle flex flex-col bg-surface-main relative shadow-md rounded-xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-accent-primary/10 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="flex justify-between items-end border-b border-border-subtle pb-4 mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent-primary/10 rounded-xl text-accent-primary shadow-sm border border-accent-primary/20">
            <ShoppingCart size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-text-primary tracking-wide">ORDER BASKET</h3>
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Active Cart Items</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-text-muted tracking-wider block mb-0.5">SUBTOTAL</span>
          <span className="text-xl font-black text-status-success num-font leading-none flex items-center justify-end gap-1">
             <span className="text-sm text-status-success/70">$</span>
             {calculatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Cart Items */}
      <div className="space-y-3 mb-5 max-h-[250px] overflow-y-auto custom-scrollbar relative z-10">
        {cart.length === 0 ? (
          <div className="py-8 text-center flex flex-col items-center justify-center border-2 border-dashed border-border-subtle rounded-xl bg-surface-alt/20">
             <ShoppingCart size={32} className="text-text-muted/30 mb-2" />
             <p className="text-sm font-bold text-text-muted">Basket is empty</p>
             <p className="text-xs text-text-muted/70 mt-1">Add items below to begin</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="bg-surface-alt/60 rounded-xl p-3 flex justify-between items-start border border-border-subtle/50 hover:border-accent-primary/50 transition-colors shadow-sm">
              <div className="flex-1 min-w-0 space-y-2">
                <select
                  value={item.product}
                  onChange={(e) => updateCartItem(item.id || '', 'product', e.target.value)}
                  className="w-full bg-surface-main border border-border-subtle rounded-lg px-3 py-2 text-sm font-bold text-text-primary outline-none focus:border-accent-primary cursor-pointer shadow-inner"
                >
                  {productConfig.products?.map((p: any) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={item.quantity}
                    onChange={(e) => updateCartItem(item.id || '', 'quantity', e.target.value)}
                    className="bg-surface-main border border-border-subtle rounded-md px-2 py-1 text-xs text-text-secondary font-bold outline-none focus:border-accent-primary cursor-pointer"
                  >
                    <option>30 Day Supply</option>
                    <option>90 Day Supply</option>
                    <option>180 Day Supply</option>
                    <option>1 Year Supply</option>
                  </select>

                  {productConfig.products?.find((p: any) => p.name === item.product)?.dosages && (
                    <select
                      value={item.dosage}
                      onChange={(e) => updateCartItem(item.id || '', 'dosage', e.target.value)}
                      className="bg-surface-main border border-border-subtle rounded-md px-2 py-1 text-xs text-text-secondary font-bold outline-none focus:border-accent-primary cursor-pointer"
                    >
                      {productConfig.products?.find((p: any) => p.name === item.product)?.dosages?.map((d: string) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  )}
                  
                  <div className="ml-auto flex items-center justify-center bg-surface-main border border-status-success/30 px-2 py-1 rounded-md">
                     <span className="text-xs font-black text-status-success">${(item.unitPrice * (item.quantity.includes('90') ? 3 : item.quantity.includes('180') ? 6 : item.quantity.includes('1 Year') ? 12 : 1)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeProduct(item.id || '')}
                className="ml-3 p-2 text-status-error/70 hover:bg-status-error/10 hover:text-status-error rounded-lg transition-colors border border-transparent hover:border-status-error/20"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Product */}
      {productConfig.products && productConfig.products.length > 0 && (
        <div className="mb-5 py-4 border-y border-border-subtle relative z-10 bg-surface-alt/30 -mx-5 px-5">
          <p className="text-[10px] font-bold text-text-muted mb-3 uppercase tracking-wider">Quick Add Product</p>
          <div className="flex flex-wrap gap-2">
            {productConfig.products.map((product: any) => (
              <button
                key={product.id}
                type="button"
                onClick={() => addProduct(product)}
                className="text-xs px-3 py-1.5 bg-surface-main border border-border-subtle hover:border-accent-primary text-text-secondary hover:text-accent-primary rounded-lg transition-all flex items-center gap-1.5 shadow-sm hover:shadow-md"
              >
                <Plus size={14} className="opacity-70" /> <span className="font-semibold">{product.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="relative z-10">
        <label className="text-[11px] font-bold text-text-muted tracking-widest mb-1.5 block">CALL NOTES & INSTRUCTIONS</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter customer notes, objections met, followup instructions..."
          className="w-full bg-surface-alt/70 border border-border-subtle rounded-xl p-4 text-sm font-medium text-text-primary outline-none focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10 focus:bg-surface-main transition-all resize-none shadow-inner"
          rows={3}
        />
      </div>
    </Card>
  );
};
