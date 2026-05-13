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
        <div className="space-y-2">
            {cart.map((item, index) => {
                const totalLine = ((parseInt(item.quantity)||1)*item.unitPrice);
                
                return (
                    <div key={item.id || index} className="group relative bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 rounded-xl p-3 transition-all animate-in slide-in-from-right-4 duration-500 shadow-sm hover:bg-white/[0.06]">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 grid grid-cols-12 gap-3 items-end">
                                <div className="col-span-12 lg:col-span-5 flex flex-col gap-1">
                                    <label className="text-[7px] font-black uppercase text-indigo-400/70 tracking-[0.2em] ml-1 flex items-center gap-1">
                                        <Heart size={7}/> Identifier
                                    </label>
                                    <select 
                                        value={item.product}
                                        onChange={(e) => updateLineItem(index, 'product', e.target.value)}
                                        className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 font-black text-[11px] text-white outline-none cursor-pointer focus:ring-1 focus:ring-indigo-500/30 transition-all appearance-none tracking-tight"
                                    >
                                        {(productConfig.products || []).map(p => <option key={p.id} value={p.name} className="bg-[#0c0c0e] text-white">{p.name}</option>)}
                                    </select>
                                </div>

                                <div className="col-span-12 lg:col-span-4 grid grid-cols-2 gap-2">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[7px] font-black uppercase text-gray-500 tracking-[0.2em] text-center">Qty</label>
                                        <select 
                                            value={item.quantity} 
                                            onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                                            className="w-full bg-black/40 border border-white/5 rounded-lg px-1 py-1.5 text-[9px] font-black text-center text-white outline-none cursor-pointer hover:bg-white/10 transition-all"
                                        >
                                            {['1','2','3','4','5','10'].map(q => <option key={q} value={q} className="bg-[#0c0c0e] text-white">{q} BTLS</option>)}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[7px] font-black uppercase text-gray-500 tracking-[0.2em] text-center">Dose</label>
                                        <select 
                                            value={item.dosage} 
                                            onChange={(e) => updateLineItem(index, 'dosage', e.target.value)}
                                            className="w-full bg-black/40 border border-white/5 rounded-lg px-1 py-1.5 text-[9px] font-black text-center text-white outline-none cursor-pointer hover:bg-white/10 transition-all"
                                        >
                                            {productConfig.products?.find(p => p.name === item.product)?.dosages.map(d => <option key={d} value={d} className="bg-[#0c0c0e] text-white">{d}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="col-span-12 lg:col-span-3 flex flex-col items-end gap-1">
                                    <label className="text-[7px] font-black uppercase text-emerald-500/60 tracking-[0.2em] mr-1">Yield</label>
                                    <div className="bg-emerald-500/[0.05] border border-emerald-500/10 px-3 py-1.5 rounded-lg w-full text-right flex items-center justify-between group-hover:border-emerald-500/30 transition-all">
                                        <ChevronRight size={10} className="text-emerald-500/50 group-hover:translate-x-0.5 transition-transform" />
                                        <span className="font-mono font-black text-emerald-400 text-sm tracking-tight drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                                            ${totalLine.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {cart.length > 1 && (
                                <button 
                                    onClick={() => removeLineItem(index)}
                                    className="p-2 bg-white/[0.03] border border-white/10 text-gray-600 hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/40 rounded-lg transition-all active:scale-90 shrink-0"
                                >
                                    <Trash2 size={14} strokeWidth={2.5}/>
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};