import { useEffect, useState } from 'react';
import { Package, Pill, CalendarClock, Plus, Check } from 'lucide-react';
import { sfx } from '../../../lib/soundService';
import { Product, ProductPreset, CartItem } from '../../../types';
import { Card } from '../../ui/Base';
import { getQuantityMultiplier } from '../../../utils/quantityUtils';

interface Props {
  products: Product[];
  presets?: ProductPreset[];
  quantities: string[];
  onAdd: (item: CartItem) => void;
  onQuickAdd: (preset: ProductPreset) => void;
}

export function ProductQuickSelector({ products, presets, quantities, onAdd, onQuickAdd }: Props) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState<string>(quantities[0] || '30 Day Supply');
  const [selectedDosage, setSelectedDosage] = useState<string>('');

  useEffect(() => {
    if (selectedProduct && selectedProduct.dosages && selectedProduct.dosages.length > 0) {
      if (!selectedProduct.dosages.includes(selectedDosage)) {
        setSelectedDosage(selectedProduct.dosages[0]);
      }
    } else {
      setSelectedDosage('');
    }
  }, [selectedProduct, selectedDosage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        if (e.key === '1' && presets?.[0]) {
          e.preventDefault();
          onQuickAdd(presets[0]);
          sfx.playSuccess();
        }
        if (e.key === '2' && presets?.[1]) {
          e.preventDefault();
          onQuickAdd(presets[1]);
          sfx.playSuccess();
        }
        if (e.key === '3' && presets?.[2]) {
          e.preventDefault();
          onQuickAdd(presets[2]);
          sfx.playSuccess();
        }
        if (e.key.toLowerCase() === 'a') {
          e.preventDefault();
          document.getElementById('manual-add-product-btn')?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [presets, onQuickAdd]);

  const handleAdd = () => {
    if (!selectedProduct) return;
    onAdd({
      id: crypto.randomUUID(),
      product: selectedProduct.name,
      quantity: selectedQuantity,
      dosage: selectedDosage,
      unitPrice: selectedProduct.price,
    });
    sfx.playSuccess();
    // Reset selection after adding
    setSelectedProduct(null);
  };

  const canAdd = selectedProduct && (!selectedProduct.dosages?.length || selectedDosage);

  return (
    <div className="flex flex-col gap-4">
      {/* Presets */}
      {presets && presets.length > 0 && (
        <Card variant="refraction" className="p-4 bg-surface-main border-border-subtle shadow-sm">
          <h4 className="text-xs font-black text-text-muted mb-3 uppercase tracking-widest flex items-center gap-2">
            <Package size={14} className="text-indigo-400" /> Quick Add Presets
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {presets.map((preset, index) => (
              <button
                key={preset.id}
                onClick={() => {
                  onQuickAdd(preset);
                  sfx.playSuccess();
                }}
                className="group relative flex flex-col items-start p-3 rounded-xl border border-border-subtle bg-surface-alt/50 hover:bg-surface-alt hover:border-indigo-500/50 hover:scale-[1.02] transition-all text-left shadow-sm"
                aria-label={`Add preset ${preset.name}`}
              >
                <div className="flex justify-between items-center w-full mb-1">
                  <span className="font-bold text-sm text-text-primary group-hover:text-indigo-400 transition-colors">{preset.name}</span>
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded font-bold">Alt+{index+1}</span>
                </div>
                <p className="text-xs text-text-muted line-clamp-1">{preset.description}</p>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Manual Selection */}
      <Card variant="refraction" className="p-4 bg-surface-main border-border-subtle shadow-sm flex flex-col gap-5">
        <h4 className="text-xs font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
          <Package size={14} className="text-indigo-400" /> Manual Selection
        </h4>

        {/* Product Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">1. Select Product</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {products.map((p) => {
              const isSelected = selectedProduct?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedProduct(p);
                    sfx.playClick();
                  }}
                  className={`relative p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02] shadow-sm'
                      : 'border-border-subtle bg-surface-alt hover:border-indigo-500/50 hover:bg-surface-alt/80'
                  }`}
                  aria-label={`Select product ${p.name}`}
                >
                  <span className={`font-bold text-sm ${isSelected ? 'text-indigo-400' : 'text-text-primary'}`}>
                    {p.name}
                  </span>
                  <span className="text-xs text-text-muted font-mono">${p.price.toFixed(2)}</span>
                  {isSelected && (
                    <div className="absolute top-2 right-2 text-indigo-500">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Supply Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
             <CalendarClock size={12} /> 2. Supply Duration
          </label>
          <div className="flex flex-wrap gap-2">
            {quantities.map((q) => {
              const isSelected = selectedQuantity === q;
              const multiplier = getQuantityMultiplier(q);
              return (
                <button
                  key={q}
                  onClick={() => {
                    setSelectedQuantity(q);
                    sfx.playClick();
                  }}
                  className={`group relative px-4 py-2 rounded-xl border font-bold text-sm transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-sm scale-[1.02]'
                      : 'border-border-subtle bg-surface-alt text-text-primary hover:border-emerald-500/50 hover:bg-surface-alt/80'
                  }`}
                  title={`${multiplier}x price multiplier`}
                  aria-label={`Select quantity ${q}`}
                >
                  {q}
                  {multiplier > 1 && (
                     <span className={`text-[10px] px-1.5 py-0.5 rounded leading-none ${isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-surface-main text-text-muted group-hover:text-emerald-400'}`}>
                        {multiplier}x
                     </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dosage Selection (Conditional) */}
        {selectedProduct?.dosages && selectedProduct.dosages.length > 0 && (
          <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
               <Pill size={12} /> 3. Select Dosage
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedProduct.dosages.map((d) => {
                const isSelected = selectedDosage === d;
                return (
                  <button
                    key={d}
                    onClick={() => {
                      setSelectedDosage(d);
                      sfx.playClick();
                    }}
                    className={`px-4 py-2 rounded-xl border font-bold text-sm transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400 shadow-sm scale-[1.02]'
                        : 'border-border-subtle bg-surface-alt text-text-primary hover:border-amber-500/50 hover:bg-surface-alt/80'
                    }`}
                    aria-label={`Select dosage ${d}`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Add Button */}
        <div className="pt-2">
           <button
             id="manual-add-product-btn"
             onClick={handleAdd}
             disabled={!canAdd}
             className={`w-full py-3 rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-md focus:ring-4 focus:outline-none ${
               canAdd 
                 ? 'bg-status-success text-white hover:bg-status-success/90 border border-status-success/50 focus:ring-status-success/20 active:scale-[0.98]'
                 : 'bg-surface-alt text-text-muted border border-border-subtle cursor-not-allowed opacity-50'
             }`}
             aria-label="Add product to cart"
           >
             <Plus size={18} strokeWidth={3} /> ADD TO ORDER (Alt+A)
           </button>
        </div>
      </Card>
    </div>
  );
}
