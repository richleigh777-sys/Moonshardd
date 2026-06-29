import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

const CleanProductSelector = ({ products = [], presets = [], cart = [], onAdd, onRemove }: any) => {
    return (
        <div className="space-y-12">
            <div>
                <h4 className="text-text-muted text-sm uppercase tracking-wide font-semibold mb-6">Core Treatments</h4>
                <div className="grid grid-cols-2 gap-4">
                    {products.map((p: any) => {
                        const count = cart.filter((c:any)=>c.product===p.name).length;
                        return (
                            <div key={p.id} className="p-5 flex items-center justify-between rounded-xl bg-surface-main border border-border-subtle hover:border-accent-primary/50 transition-all cursor-default">
                                <div>
                                    <div className="text-text-primary font-medium text-lg">{p.name}</div>
                                    <div className="text-accent-primary font-mono mt-1">${p.price.toFixed(2)}</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {count > 0 && (
                                        <button onClick={() => onRemove(cart.find((c:any)=>c.product===p.name)?.id)} className="w-10 h-10 rounded-full bg-surface-alt border border-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444] hover:text-white flex items-center justify-center font-mono text-xl transition-all shadow-sm">-</button>
                                    )}
                                    {count > 0 && <span className="font-mono text-text-primary text-lg w-6 text-center">{count}</span>}
                                    <button onClick={() => onAdd({ id:crypto.randomUUID(), product: p.name, quantity:1, unitPrice: p.price, dosage:'' })} className="w-10 h-10 rounded-full bg-accent-primary/10 text-accent-primary border border-accent-primary/20 hover:bg-accent-primary hover:text-black flex items-center justify-center font-mono text-xl transition-all shadow-sm">+</button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            {presets?.length > 0 && (
                <div>
                    <h4 className="text-text-muted text-sm uppercase tracking-wide font-semibold mb-6">Care Bundles</h4>
                    <div className="grid grid-cols-2 gap-4">
                         {presets.map((preset: any) => (
                             <div key={preset.id} className="p-5 rounded-xl bg-surface-alt border border-accent-primary/20 flex items-center justify-between">
                                 <div>
                                     <div className="text-text-primary font-medium text-lg">{preset.name}</div>
                                     <div className="text-text-muted text-sm mt-1">{preset.items.map((i:any)=>i.product).join(' + ')}</div>
                                 </div>
                                 <button onClick={() => {
                                      const newItems = preset.items.map((pi:any) => ({ id: crypto.randomUUID(), product: pi.product, quantity: pi.quantity, unitPrice: products.find((p:any)=>p.name===pi.product)?.price || 0 }));
                                      newItems.forEach((i:any) => onAdd(i));
                                 }} className="px-5 py-2.5 rounded-full bg-accent-primary text-black font-bold text-sm tracking-wide uppercase flex items-center gap-2 hover:shadow-sm transition-all">Add Bundle</button>
                             </div>
                         ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export function Stage2Products({ cart, setCart, productConfig, onNext, onCallback, onBack }: any) {
    const { products: activeProducts = [], presets: activePresets = [] } = productConfig || {};
    const runningTotal = cart.reduce((sum: number, item: any) => sum + (parseInt(item.quantity) || 1) * (item.unitPrice || 0), 0);
    const hasItems = cart.length > 0;

    const recommendedAddons = [
        { name: 'Priority Handling', price: 9.99 },
        { name: 'Extended Care Plan', price: 29.99 }
    ];

    const handleAddon = (addon: any) => {
        setCart([...cart, { id: crypto.randomUUID(), product: addon.name, quantity: 1, unitPrice: addon.price, dosage: '' }]);
    };

    return (
        <div className="w-full h-full flex items-start justify-center p-8 overflow-y-auto custom-scrollbar">
            <div className="w-full max-w-[1400px] flex flex-col md:flex-row gap-12 pb-24">
                
                 <div className="w-full md:w-[65%] flex flex-col bg-surface-alt border border-border-subtle rounded-xl shadow-2xl overflow-hidden min-h-[600px] h-fit">
                     <div className="p-8 border-b border-border-subtle shrink-0 flex items-center justify-between">
                         <h2 className="text-text-primary font-medium text-2xl tracking-wide flex items-center gap-3">
                           <span className="text-accent-primary">03.</span> Product Catalog
                         </h2>
                         <button onClick={onBack} className="text-text-muted hover:text-white transition-colors text-sm uppercase tracking-wide">← Back to Profile</button>
                     </div>
                     <div className="flex-1 p-8">
                         <CleanProductSelector 
                             products={activeProducts}
                             presets={activePresets}
                             cart={cart}
                             onAdd={(item: any) => setCart((prev:any)=>[...prev, item])}
                             onRemove={(id: string) => setCart((prev:any)=>prev.filter((c:any) => c.id !== id))}
                         />
                     </div>
                 </div>

                 <div className="w-full md:w-[35%] flex flex-col gap-8 h-fit">
                     
                     <div className="bg-surface-main border border-border-subtle rounded-xl p-6 shadow-xl">
                          <h3 className="text-accent-primary font-semibold text-sm tracking-wide uppercase flex items-center gap-2 mb-4">
                              <Sparkles size={16} /> Recommended Add-ons
                          </h3>
                          <div className="space-y-3">
                              {recommendedAddons.map(addon => {
                                  const inCart = cart.some((c:any) => c.product === addon.name);
                                  return (
                                      <div key={addon.name} className="flex items-center justify-between p-4 rounded-xl border border-border-subtle bg-surface-alt">
                                          <div className="font-medium text-text-primary">{addon.name} <span className="text-text-muted text-sm ml-2">${addon.price.toFixed(2)}</span></div>
                                          {!inCart ? (
                                              <button onClick={() => handleAddon(addon)} className="text-accent-primary hover:text-white transition-colors bg-accent-primary/10 p-2 rounded-lg font-mono leading-none">
                                                  +
                                              </button>
                                          ) : (
                                              <span className="text-emerald-500 text-sm font-semibold">Added</span>
                                          )}
                                      </div>
                                  );
                              })}
                          </div>
                     </div>

                     <div className="flex-1 bg-surface-alt border border-border-subtle rounded-xl p-8 shadow-2xl flex flex-col min-h-[350px]">
                         <h3 className="text-text-primary font-medium text-xl tracking-wide mb-6">Current Order</h3>
                         <div className="flex-1 overflow-y-auto mb-6 pr-2 space-y-4 font-mono text-sm">
                             {cart.map((item: any) => (
                                 <div key={item.id} className="flex justify-between text-text-muted pb-2 border-b border-border-subtle">
                                     <div>{item.product} {item.quantity > 1 ? `(x${item.quantity})` : ''}</div>
                                     <div className="text-text-primary">${(item.unitPrice * (item.quantity || 1)).toFixed(2)}</div>
                                 </div>
                             ))}
                             {cart.length === 0 && <div className="text-text-muted/50 text-center py-10">No items selected</div>}
                         </div>
                         <div className="shrink-0 space-y-6">
                             <div className="flex justify-between items-center text-2xl font-medium tracking-wide border-t border-border-strong pt-6">
                                 <span className="text-text-primary">Total</span>
                                 <span className="text-accent-primary">${runningTotal.toFixed(2)}</span>
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                 <button onClick={onCallback} className="py-4 rounded-xl border border-border-strong text-text-muted font-semibold uppercase tracking-wider text-sm hover:text-white hover:bg-surface-hover transition-all">
                                     Save Callback
                                 </button>
                                 <button onClick={onNext} disabled={!hasItems} className="py-4 rounded-xl bg-gradient-to-r from-amber-400 to-[#C4A470] text-black font-bold uppercase tracking-wider text-sm shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                     Checkout <ArrowRight size={16} />
                                 </button>
                             </div>
                         </div>
                     </div>

                 </div>
            </div>
        </div>
    );
}
