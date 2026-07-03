import { useSystem } from '../../hooks/useSystem';
import React, { useState } from 'react';
import { Package, Plus, Trash2, Edit2, GripVertical, CheckCircle2, Search, Settings } from 'lucide-react';
import { ProductPreset, ProductConfig } from '../../types';
import { Button } from '../ui/Base';
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

  const filteredPresets = presets.filter(p => (p.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()));

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
    // if (confirm("Are you sure you want to delete this preset?")) {
      const newPresets = presets.filter(p => p.id !== id);
      setPresets(newPresets);
      onUpdateConfig({ ...productConfig, presets: newPresets });
    // }
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
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* List Panel */}
      <div className="flex-1 overflow-hidden flex flex-col bg-surface-main border border-border-strong rounded-xl relative min-h-0">
        <div className="p-4 border-b border-border-strong flex justify-between items-center bg-surface-alt/80">
           <h3 className="text-[13px] font-bold text-text-primary uppercase tracking-widest flex items-center gap-2">
              <Package size={16} className="text-indigo-400" /> Pre-Configured Bundles
           </h3>
           <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search presets..."
                className="bg-surface-main border border-border-strong rounded-md pl-9 pr-4 py-1.5 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 shadow-sm transition-all"
              />
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 flex flex-col gap-3 bg-surface-alt/10">
           {filteredPresets.length === 0 ? (
             <div className="text-center py-12">
                 <p className="text-sm font-bold text-text-muted uppercase tracking-widest opacity-50">No presets found</p>
                 <p className="text-xs text-text-muted mt-2">Create one to help agents sell faster.</p>
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
                 className="border border-border-strong rounded-md p-4 bg-surface-main hover:border-indigo-500/50 shadow-sm transition-all group flex items-start justify-between cursor-move"
               >
                 <div className="flex gap-3">
                   <GripVertical size={16} className="text-border-strong mt-1 opacity-0 group-hover:opacity-100" />
                   <div>
                     <h4 className="font-bold text-text-primary text-[15px]">{preset.name}</h4>
                     <p className="text-sm text-text-muted mt-1 max-w-sm">{preset.description}</p>
                     <div className="mt-3 flex flex-wrap gap-2">
                       {preset.items.map((item, idx) => (
                         <div key={idx} className="bg-surface-alt/80 border border-border-strong rounded px-2 py-1 text-xs font-bold text-text-primary flex items-center gap-1.5 shadow-sm">
                            <Package size={12} className="text-indigo-400" /> {item.product} ({item.quantity})
                         </div>
                       ))}
                     </div>
                   </div>
                 </div>
                 <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => handleEdit(preset)} className="p-1.5 bg-surface-main hover:bg-surface-alt hover:text-indigo-400 text-text-muted rounded border border-border-strong transition-colors">
                     <Edit2 size={14} />
                   </button>
                   <button onClick={() => handleDelete(preset.id)} className="p-1.5 bg-surface-main hover:bg-status-error/10 hover:border-status-error/30 text-text-muted hover:text-status-error rounded border border-border-strong transition-colors">
                     <Trash2 size={14} />
                   </button>
                 </div>
               </div>
             ))
           )}
        </div>
      </div>

      {/* Editor Panel */}
      <div className="w-full lg:w-[450px] shrink-0 bg-surface-main border border-border-strong rounded-xl overflow-hidden flex flex-col relative min-h-0 shadow-sm">
        <div className="p-4 border-b border-border-strong bg-surface-alt/80 flex items-center justify-between">
           <h3 className="text-[13px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
              <Settings size={16} /> {editingId ? 'Edit Preset' : 'New Preset'}
           </h3>
           {editingId && (
             <button onClick={() => {
                setEditingId(null);
                setName('');
                setDescription('');
                setItems([]);
             }} className="text-[11px] font-bold text-text-muted hover:text-text-primary uppercase tracking-widest px-2 py-1 bg-surface-main border border-border-strong rounded shadow-sm">
                Cancel Edit
             </button>
           )}
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
           <div>
             <label className="text-[11px] font-bold uppercase tracking-widest text-text-primary mb-2 block">Preset Name <span className="text-status-error">*</span></label>
             <input
               value={name}
               onChange={e => setName(e.target.value)}
               placeholder="e.g. 90-Day Starter Pack"
               className="w-full bg-surface-alt/50 border border-border-strong rounded-md px-3 py-2 text-sm font-bold text-text-primary focus:border-indigo-500 focus:bg-surface-main shadow-sm transition-all outline-none"
             />
           </div>
           
           <div>
             <label className="text-[11px] font-bold uppercase tracking-widest text-text-primary mb-2 block">Description</label>
             <textarea
               value={description}
               onChange={e => setDescription(e.target.value)}
               placeholder="Internal description for agents..."
               className="w-full bg-surface-alt/50 border border-border-strong rounded-md px-3 py-2 text-sm text-text-primary min-h-[80px] focus:border-indigo-500 focus:bg-surface-main shadow-sm transition-all outline-none resize-none"
             />
           </div>
           
            <div className="border-t border-border-strong pt-6">
             <div className="flex justify-between items-center mb-4">
               <label className="text-[11px] font-bold uppercase tracking-widest text-text-primary">Products In Bundle <span className="text-status-error">*</span></label>
               <button onClick={addPresetItem} className="text-[10px] bg-surface-main border border-border-strong shadow-sm text-text-primary px-3 py-1.5 rounded font-bold hover:border-indigo-500 hover:text-indigo-400 transition-colors flex items-center gap-1 uppercase tracking-widest">
                 <Plus size={12} /> Add
               </button>
             </div>
             
             <div className="space-y-3 mb-6">
               {items.length === 0 ? (
                 <div className="border border-dashed border-border-strong rounded-md p-6 text-center text-sm font-bold text-text-muted">
                    No products added.
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
                     className="flex gap-3 items-start border border-border-strong rounded-md p-3 bg-surface-alt/50 cursor-move shadow-sm group hover:border-indigo-500/30 transition-all"
                   >
                     <GripVertical size={14} className="text-border-strong shrink-0 mt-3" />
                     <div className="flex-1 space-y-3">
                        <select 
                          value={item.product}
                          onChange={(e) => updatePresetItem(index, 'product', e.target.value)}
                          className="w-full bg-surface-main border border-border-strong rounded px-2 py-1.5 text-sm font-bold text-text-primary shadow-sm outline-none focus:border-indigo-500"
                        >
                           {productConfig.products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                        </select>
                        <div className="flex gap-3">
                          <select 
                            value={item.quantity}
                            onChange={(e) => updatePresetItem(index, 'quantity', e.target.value)}
                            className="flex-1 bg-surface-main border border-border-strong rounded px-2 py-1.5 text-sm font-medium text-text-primary shadow-sm outline-none focus:border-indigo-500"
                          >
                             {productConfig.quantities.map(q => <option key={q} value={q}>{q}</option>)}
                          </select>
                          
                          {productConfig.products.find(p => p.name === item.product)?.dosages?.length ? (
                            <select 
                              value={item.dosage || ''}
                              onChange={(e) => updatePresetItem(index, 'dosage', e.target.value)}
                              className="flex-1 bg-surface-main border border-border-strong rounded px-2 py-1.5 text-sm font-medium text-text-primary shadow-sm outline-none focus:border-indigo-500"
                            >
                               {productConfig.products.find(p => p.name === item.product)?.dosages?.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          ) : null}
                        </div>
                     </div>
                     <button onClick={() => removePresetItem(index)} className="p-1.5 text-text-muted hover:text-status-error hover:bg-status-error/10 rounded mt-1 transition-colors">
                       <Trash2 size={14} />
                     </button>
                   </div>
                 ))
               )}
             </div>

             {/* Live Bundle Preview */}
             {items.length > 0 && (
               <div className="bg-status-success/5 border border-status-success/20 rounded-md p-4 flex justify-between items-center shadow-sm">
                  <div className="flex flex-col">
                     <span className="text-[11px] font-bold text-status-success uppercase tracking-widest">Live Setup Value</span>
                     <span className="text-[10px] text-text-muted mt-1 uppercase tracking-widest">{items.length} SKUs Attached</span>
                  </div>
                  <span className="text-xl font-bold text-status-success num-font">${liveTotal.toFixed(2)}</span>
               </div>
             )}
           </div>
        </div>
        
        <div className="p-4 border-t border-border-strong bg-surface-main shrink-0 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)]">
           <Button onClick={handleSave} className="w-full font-bold flex justify-center gap-2 items-center bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-600 h-10 shadow-sm" variant="primary">
             <CheckCircle2 size={16} /> COMMIT PRESET
           </Button>
        </div>
      </div>
    </div>
  );
}
