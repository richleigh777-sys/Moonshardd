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

function ProductRow({ p, quantities, onAdd }: { p: Product; quantities: string[]; onAdd: (item: CartItem) => void }) {
  const [qty, setQty] = useState(quantities[0] || '30 Day Supply');
  const [dosage, setDosage] = useState(p.dosages?.[0] || '');

  const handleAdd = () => {
    onAdd({
      id: crypto.randomUUID(),
      product: p.name,
      quantity: qty,
      dosage: dosage,
      unitPrice: p.price,
    });
    sfx.playSuccess();
  };

  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between p-3 border border-border-subtle rounded-xl bg-surface-alt hover:border-indigo-500/30 transition-colors gap-2 shadow-sm">
      <div className="flex-1">
        <div className="font-bold text-sm text-text-primary">{p.name}</div>
        <div className="text-xs text-text-muted font-mono mt-0.5">${p.price.toFixed(2)}</div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <select 
          value={qty} 
          onChange={(e) => setQty(e.target.value)} 
          className="bg-surface-main border border-border-strong rounded-md px-3 py-1.5 text-xs font-bold text-text-primary outline-none hover:border-indigo-500/30 focus:border-indigo-500/50 appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-no-repeat transition-all"
          style={{ backgroundPosition: 'right 0.5rem center', paddingRight: '2rem' }}
        >
          {quantities.map(q => (
              <option key={q} value={q}>{q} {getQuantityMultiplier(q) > 1 ? `(${getQuantityMultiplier(q)}x)` : ''}</option>
          ))}
        </select>
        
        {p.dosages && p.dosages.length > 0 && (
          <select 
            value={dosage} 
            onChange={(e) => setDosage(e.target.value)} 
            className="bg-surface-main border border-border-strong rounded-md px-3 py-1.5 text-xs font-bold text-text-primary outline-none hover:border-indigo-500/30 focus:border-indigo-500/50 appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-no-repeat transition-all"
            style={{ backgroundPosition: 'right 0.5rem center', paddingRight: '2rem' }}
          >
            {p.dosages.map(d => (
                <option key={d} value={d}>{d}</option>
            ))}
          </select>
        )}
        
        <button 
          onClick={handleAdd}
          className="bg-status-success hover:bg-status-success/90 text-white px-3 py-1 rounded-md text-[11px] uppercase tracking-wider font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
        >
          <Plus size={12} strokeWidth={3} /> Add
        </button>
      </div>
    </div>
  );
}

export function ProductQuickSelector({ products, presets, quantities, onAdd, onQuickAdd }: Props) {
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
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [presets, onQuickAdd]);

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
      <Card variant="refraction" className="p-4 bg-surface-main border-border-subtle shadow-sm flex flex-col gap-3">
        <h4 className="text-xs font-black text-text-muted uppercase tracking-widest flex items-center gap-2 pb-2">
          <Package size={14} className="text-indigo-400" /> Full Product Catalog
        </h4>
        
        <div className="flex flex-col gap-2">
            {products.map(p => (
                <ProductRow key={p.id} p={p} quantities={quantities} onAdd={onAdd} />
            ))}
        </div>
      </Card>
    </div>
  );
}
