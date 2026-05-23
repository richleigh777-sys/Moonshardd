import React from 'react';
import { ChevronRight, Trash2, Heart } from 'lucide-react';
import { CartItem, ProductConfig } from '../../../../types';

interface Props {
    cart: CartItem[];
    updateLineItem: (index: number, field: keyof CartItem, value: string) => void;
    removeLineItem: (index: number) => void;
    productConfig: ProductConfig;
}

export const BasketLineItems: React.FC<Props> = ({ cart, updateLineItem, removeLineItem, productConfig }) => {
    return (
        <div className="space-y-3">
            {cart.map((item, index) => {
                const totalLine = ((parseInt(item.quantity)||1)*item.unitPrice);
                
                return (
                    <div key={item.id || index} className="group relative bg-surface-alt/30 border border-border-subtle hover:border-status-warning/30 rounded-2xl p-4 transition-all animate-in slide-in-from-right-4 duration-500 shadow-inner hover:bg-surface-alt/80">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="flex-1 grid grid-cols-12 gap-4 items-end">
                                <div className="col-span-12 lg:col-span-6 flex flex-col gap-1.5">
                                    <label className="text-[10px] font-[700]  text-text-muted/80 tracking-[0.2em] ml-1 flex items-center gap-1 drop-shadow-sm">
                                        <Heart size={8} className="text-status-warning/70" /> Identifier
                                    </label>
                                    <select 
                                        value={item.product}
                                        onChange={(e) => updateLineItem(index, 'product', e.target.value)}
                                        className="w-full bg-surface-main/60 border border-border-subtle rounded-xl px-4 py-2.5 font-bold text-sm text-text-primary outline-none cursor-pointer focus:ring-1 focus:ring-amber-500/50 transition-all appearance-none tracking-tight shadow-inset"
                                    >
                                        {(productConfig.products || []).map(p => <option key={p.id} value={p.name} className="bg-[#0c0c0e] text-text-primary">{p.name}</option>)}
                                    </select>
                                </div>

                                <div className="col-span-12 lg:col-span-3 grid grid-cols-2 gap-2">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-[700]  text-text-muted/80 tracking-[0.2em] text-center drop-shadow-sm">Qty</label>
                                        <select 
                                            value={item.quantity} 
                                            onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                                            className="w-full bg-surface-main/60 border border-border-subtle rounded-xl px-2 py-2.5 text-xs font-bold text-center text-text-primary outline-none cursor-pointer hover:bg-surface-main/80 transition-all appearance-none shadow-inset"
                                        >
                                            {['1','2','3','4','5','10'].map(q => <option key={q} value={q} className="bg-[#0c0c0e] text-text-primary">{q} BTLS</option>)}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-[700]  text-text-muted/80 tracking-[0.2em] text-center drop-shadow-sm">Dose</label>
                                        <select 
                                            value={item.dosage} 
                                            onChange={(e) => updateLineItem(index, 'dosage', e.target.value)}
                                            className="w-full bg-surface-main/60 border border-border-subtle rounded-xl px-2 py-2.5 text-xs font-bold text-center text-text-primary outline-none cursor-pointer hover:bg-surface-main/80 transition-all appearance-none shadow-inset"
                                        >
                                            {productConfig.products?.find(p => p.name === item.product)?.dosages.map(d => <option key={d} value={d} className="bg-[#0c0c0e] text-text-primary">{d}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="col-span-12 lg:col-span-3 flex flex-col items-end gap-1.5">
                                    <label className="text-[10px] font-[700]  text-status-success/80 tracking-[0.2em] mr-1 drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]">Yield</label>
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-xl w-full text-right flex items-center justify-between group-hover:border-emerald-500/40 transition-all shadow-inner">
                                        <ChevronRight size={16} className="text-status-success/50 group-hover:translate-x-0.5 transition-transform" />
                                        <span className="font-mono font-[700] text-status-success text-sm tracking-tight drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]">
                                            ${totalLine.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {cart.length > 1 && (
                                <button 
                                    onClick={() => removeLineItem(index)}
                                    className="p-3 bg-surface-main/60 border border-border-subtle text-text-muted hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 rounded-xl transition-all active:scale-95 shrink-0 shadow-sm hover:shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                                >
                                    <Trash2 size={18} strokeWidth={2.5}/>
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};