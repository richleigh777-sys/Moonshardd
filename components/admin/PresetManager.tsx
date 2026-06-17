import { useSystem } from '../../hooks/useSystem';
import React, { useState } from 'react';
import { Package, Plus, Trash2, Edit2, GripVertical, CheckCircle2, Search, Settings } from 'lucide-react';
import { ProductPreset, ProductConfig } from '../../types';
import { Card, Button } from '../ui/Base';
import { getQuantityMultiplier } from '../../utils/quantityUtils';

interface Props {
  productConfig: ProductConfig;
  onUpdateConfig: (newConfig: ProductConfig) => void;
}

export function PresetManager({ productConfig, onUpdateConfig }: Props) {
    const { setToast } = useSystem();
  const [presets, setPresets] = useState<ProductPreset[]>(productConfig.presets || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Package');
  const [items, setItems] = useState<{product: string, quantity: string, dosage?: string}[]>([]);

  const filteredPresets = presets.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSave = () => {
    if (!name.trim()) return setToast({ title: "Alert", message: "Preset name is required", type: "warning" });
    if (items.length === 0) return setToast({ title: "Alert", message: "At least one product must be included", type: "warning" });

    const newPreset: ProductPreset = {
      id: editingId || crypto.randomUUID(),
      name,
      description,
      icon,
      items
    };

    const newPresets = editingId 
      ? presets.map(p => p.id === editingId ? newPreset : p)
      : [...presets, newPreset];

    setPresets(newPresets);
    onUpdateConfig({ ...productConfig, presets: newPresets });
    
    // Reset Form
    setEditingId(null);
    setName('');
    setDescription('');
    setItems([]);
  };

  const handleEdit = (preset: ProductPreset) => {
    setEditingId(preset.id);
    setName(preset.name);
    setDescription(preset.description);
    setIcon(preset.icon);
    setItems(preset.items);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this preset?")) {
      const newPresets = presets.filter(p => p.id !== id);
      setPresets(newPresets);
      onUpdateConfig({ ...productConfig, presets: newPresets });
    }
  };

  const addPresetItem = () => {
    if (!productConfig.products.length) return;
    const defaultProduct = productConfig.products[0];
    setItems([
      ...items,
      { 
        product: defaultProduct.name, 
        quantity: productConfig.quantities[0] || '30 Day Supply',
        dosage: defaultProduct.dosages?.[0] || ''
      }
    ]);
  };

  const updatePresetItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    // Handle dosage reset if product changes
    if (field === 'product') {
      const selectedProductDef = productConfig.products.find(p => p.name === value);
      newItems[index].dosage = selectedProductDef?.dosages?.[0] || undefined;
    }
    setItems(newItems);
  };

  const removePresetItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Live total preview computation
  const liveTotal = items.reduce((sum, item) => {
    const pDef = productConfig.products.find((p) => p.name === item.product);
    if (pDef) {
       return sum + pDef.price * getQuantityMultiplier(item.quantity);
    }
    return sum;
  }, 0);

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 h-full max-w-7xl mx-auto">
      {/* List Panel */}
      <Card className="flex-1 overflow-hidden flex flex-col bg-surface-main">
        <div className="p-4 border-b border-border-subtle flex justify-between items-center bg-surface-alt/30">
           <h3 className="font-bold flex items-center gap-2">
              <Package size={18} className="text-indigo-400" /> Pre-Configured Bundles
           </h3>
           <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search presets..."
                className="bg-surface-alt border border-border-subtle rounded-lg pl-9 pr-4 py-1.5 text-sm"
              />
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
           {filteredPresets.length === 0 ? (
             <div className="text-center py-12 text-text-muted">
                No presets found. Create one to help agents sell faster.
             </div>
           ) : (
             filteredPresets.map((preset, index) => (
               <div 
                 key={preset.id} 
                 draggable
                 onDragStart={(e) => e.dataTransfer.setData('presetIndex', index.toString())}
                 onDragOver={(e) => e.preventDefault()}
                 onDrop={(e) => {
                   e.preventDefault();
                   const fromIndex = parseInt(e.dataTransfer.getData('presetIndex'), 10);
                   const toIndex = index;
                   if (fromIndex === toIndex || isNaN(fromIndex)) return;
                   
                   const newPresets = [...presets];
                   const [moved] = newPresets.splice(fromIndex, 1);
                   newPresets.splice(toIndex, 0, moved);
                   setPresets(newPresets);
                   onUpdateConfig({ ...productConfig, presets: newPresets });
                 }}
                 className="border border-border-subtle rounded-xl p-4 bg-surface-alt/50 hover:bg-surface-alt transition-colors group flex items-start justify-between cursor-move"
               >
                 <div className="flex gap-3">
                   <GripVertical size={16} className="text-border-subtle mt-1 opacity-0 group-hover:opacity-100" />
                   <div>
                     <h4 className="font-bold text-text-primary text-sm">{preset.name}</h4>
                     <p className="text-sm text-text-muted mt-1 max-w-sm">{preset.description}</p>
                     <div className="mt-3 flex flex-wrap gap-2">
                       {preset.items.map((item, idx) => (
                         <div key={idx} className="bg-surface-main border border-border-subtle rounded px-2 py-1 text-sm font-bold text-text-secondary flex items-center gap-1">
                            <Package size={10} /> {item.product} ({item.quantity})
                         </div>
                       ))}
                     </div>
                   </div>
                 </div>
                 <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => handleEdit(preset)} className="p-2 bg-surface-main hover:bg-indigo-500/10 text-indigo-400 rounded-lg border border-border-subtle shadow-sm transition-colors">
                     <Edit2 size={16} />
                   </button>
                   <button onClick={() => handleDelete(preset.id)} className="p-2 bg-surface-main hover:bg-status-error/10 text-status-error rounded-lg border border-border-subtle shadow-sm transition-colors">
                     <Trash2 size={16} />
                   </button>
                 </div>
               </div>
             ))
           )}
        </div>
      </Card>

      {/* Editor Panel */}
      <Card className="w-full lg:w-[450px] shrink-0 bg-surface-main border-border-subtle overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border-subtle bg-indigo-500/10 flex items-center justify-between">
           <h3 className="font-bold text-indigo-400 flex items-center gap-2">
              <Settings size={18} /> {editingId ? 'Edit Preset' : 'New Preset'}
           </h3>
           {editingId && (
             <button onClick={() => {
                setEditingId(null);
                setName('');
                setDescription('');
                setItems([]);
             }} className="text-sm text-text-muted hover:text-text-primary underline">
                Cancel Edit
             </button>
           )}
        </div>
        
        <div className="p-5 flex-1 overflow-y-auto space-y-5">
           <div>
             <label className="text-sm font-bold text-text-muted mb-1.5 block">PRESET NAME *</label>
             <input
               value={name}
               onChange={e => setName(e.target.value)}
               placeholder="e.g. 90-Day Starter Pack"
               className="w-full bg-surface-alt border border-border-subtle rounded-lg px-3 py-2 text-sm focus:border-indigo-500 transition-colors"
             />
           </div>
           
           <div>
             <label className="text-sm font-bold text-text-muted mb-1.5 block">DESCRIPTION</label>
             <textarea
               value={description}
               onChange={e => setDescription(e.target.value)}
               placeholder="Internal description for agents..."
               className="w-full bg-surface-alt border border-border-subtle rounded-lg px-3 py-2 text-sm min-h-[80px] focus:border-indigo-500 transition-colors"
             />
           </div>
           
            <div>
             <div className="flex justify-between items-center mb-2">
               <label className="text-sm font-bold text-text-muted">PRODUCTS IN BUNDLE *</label>
               <button onClick={addPresetItem} className="text-sm bg-indigo-500 text-white px-2 py-1 rounded font-bold hover:bg-indigo-600 transition-colors flex items-center gap-1">
                 <Plus size={12} /> ADD
               </button>
             </div>
             
             <div className="space-y-3 mb-4">
               {items.length === 0 ? (
                 <div className="border border-dashed border-border-subtle rounded-lg p-4 text-center text-sm text-text-muted">
                    No products added. Click Add to include products in this preset.
                 </div>
               ) : (
                 items.map((item, index) => (
                   <div 
                     key={index} 
                     draggable
                     onDragStart={(e) => e.dataTransfer.setData('text/plain', index.toString())}
                     onDragOver={(e) => e.preventDefault()}
                     onDrop={(e) => {
                       e.preventDefault();
                       const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
                       const toIndex = index;
                       if (fromIndex === toIndex || isNaN(fromIndex)) return;
                       
                       const newItems = [...items];
                       const [movedItem] = newItems.splice(fromIndex, 1);
                       newItems.splice(toIndex, 0, movedItem);
                       setItems(newItems);
                     }}
                     className="flex gap-2 items-start border border-border-subtle rounded-lg p-3 bg-surface-alt/50 cursor-move"
                   >
                     <GripVertical size={16} className="text-border-subtle shrink-0 mt-2" />
                     <div className="flex-1 space-y-2">
                        <select 
                          value={item.product}
                          onChange={(e) => updatePresetItem(index, 'product', e.target.value)}
                          className="w-full bg-surface-main border border-border-subtle rounded px-2 py-1 text-sm"
                        >
                           {productConfig.products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                        </select>
                        <div className="flex gap-2">
                          <select 
                            value={item.quantity}
                            onChange={(e) => updatePresetItem(index, 'quantity', e.target.value)}
                            className="flex-1 bg-surface-main border border-border-subtle rounded px-2 py-1 text-sm"
                          >
                             {productConfig.quantities.map(q => <option key={q} value={q}>{q}</option>)}
                          </select>
                          
                          {productConfig.products.find(p => p.name === item.product)?.dosages?.length ? (
                            <select 
                              value={item.dosage || ''}
                              onChange={(e) => updatePresetItem(index, 'dosage', e.target.value)}
                              className="flex-1 bg-surface-main border border-border-subtle rounded px-2 py-1 text-sm"
                            >
                               {productConfig.products.find(p => p.name === item.product)?.dosages?.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          ) : null}
                        </div>
                     </div>
                     <button onClick={() => removePresetItem(index)} className="p-1.5 text-status-error/50 hover:text-status-error hover:bg-status-error/10 rounded mt-0.5">
                       <Trash2 size={14} />
                     </button>
                   </div>
                 ))
               )}
             </div>

             {/* Live Bundle Preview */}
             {items.length > 0 && (
               <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex justify-between items-center shadow-inner">
                  <div className="flex flex-col">
                     <span className="text-sm font-bold text-emerald-600/80 uppercase tracking-widest">Live Total Preview</span>
                     <span className="text-sm text-text-muted mt-0.5">{items.length} items bundled</span>
                  </div>
                  <span className="text-lg font-black text-emerald-500">${liveTotal.toFixed(2)}</span>
               </div>
             )}
           </div>
        </div>
        
        <div className="p-4 border-t border-border-subtle bg-surface-main shrink-0">
           <Button onClick={handleSave} className="w-full font-bold flex justify-center gap-2 items-center" variant="primary">
             <CheckCircle2 size={16} /> SAVE PRESET
           </Button>
        </div>
      </Card>
    </div>
  );
}
