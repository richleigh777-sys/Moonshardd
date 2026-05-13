
import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Base';
import { Check, RotateCcw, Eye, EyeOff, LayoutTemplate } from 'lucide-react';
import { GLOBAL_REGISTRY, DEFAULT_COLUMN_ORDER } from '../../../lib/registry';
import { sfx } from '../../../lib/soundService';

interface ColumnConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentOrder: string[];
    currentVisibility: Record<string, boolean>;
    onSave: (order: string[], visibility: Record<string, boolean>) => void;
}

export const ColumnConfigModal: React.FC<ColumnConfigModalProps> = ({ isOpen, onClose, currentOrder, currentVisibility, onSave }) => {
    const [order, setOrder] = useState<string[]>(currentOrder);
    const [visibility, setVisibility] = useState<Record<string, boolean>>(currentVisibility);

    useEffect(() => {
        if (isOpen) {
            // Ensure any new registry fields not in currentOrder are appended at the end
            const allRegistryKeys = GLOBAL_REGISTRY.map(f => f.key);
            const missingKeys = allRegistryKeys.filter(k => !currentOrder.includes(k));
            
            if (missingKeys.length > 0) {
                const fullOrder = [...currentOrder, ...missingKeys];
                setTimeout(() => setOrder(fullOrder), 0);
                
                // Ensure visibility map has keys for new fields (defaulting to false if not present)
                const fullVisibility = { ...currentVisibility };
                let changed = false;
                missingKeys.forEach(k => {
                    if (fullVisibility[k] === undefined) {
                        fullVisibility[k] = false;
                        changed = true;
                    }
                });
                if (changed) setTimeout(() => setVisibility(fullVisibility), 0);
            } else {
                 // Sync if props changed and we are opening
                 // This might still be redundant if state is already synced, but safer
                 setTimeout(() => {
                     setOrder(currentOrder);
                     setVisibility(currentVisibility);
                 }, 0);
            }
        }
    }, [isOpen, currentOrder, currentVisibility]);

    const toggleVisibility = (key: string) => {
        sfx.playClick();
        setVisibility(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleReset = () => {
        sfx.playDecline();
        const defaultVis: Record<string, boolean> = {};
        DEFAULT_COLUMN_ORDER.forEach(k => defaultVis[k] = true);
        
        const allKeys = GLOBAL_REGISTRY.map(f => f.key);
        const restKeys = allKeys.filter(k => !DEFAULT_COLUMN_ORDER.includes(k));
        const newOrder = [...DEFAULT_COLUMN_ORDER, ...restKeys];
        
        restKeys.forEach(k => defaultVis[k] = false);

        setOrder(newOrder);
        setVisibility(defaultVis);
    };

    const handleSave = () => {
        sfx.playConfirm();
        onSave(order, visibility);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Table Layout Config" size="md">
            <div className="flex flex-col h-[60vh]">
                <div className="p-4 bg-surface-alt/50 rounded-2xl border border-border-subtle mb-4 shrink-0 flex items-start gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                        <LayoutTemplate size={16} />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-text-primary mb-1">Customize Columns</h4>
                        <p className="text-[10px] text-text-secondary leading-relaxed">
                            Toggle visibility using the eye icon. 
                            <span className="block mt-1 text-accent-primary font-medium">
                                Tip: Drag and drop column headers directly in the table to reorder them.
                            </span>
                        </p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar border border-border-subtle rounded-2xl bg-surface-main">
                    {order.map((key) => {
                        const field = GLOBAL_REGISTRY.find(f => f.key === key);
                        if (!field) return null;
                        const isVisible = visibility[key];

                        return (
                            <div key={key} className={`flex items-center justify-between p-3 border-b border-border-subtle last:border-0 transition-all ${isVisible ? 'bg-surface-main' : 'bg-surface-alt/40 opacity-60'}`}>
                                <div 
                                    className="flex items-center gap-3 cursor-pointer group flex-1"
                                    onClick={() => toggleVisibility(key)}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${isVisible ? 'bg-accent-primary/10 border-accent-primary/20 text-accent-primary' : 'bg-surface-alt border-border-subtle text-text-muted'}`}>
                                        {field.icon ? <field.icon size={14}/> : <Check size={14}/>}
                                    </div>
                                    <div>
                                        <p className={`text-xs font-bold uppercase tracking-wide ${isVisible ? 'text-text-primary' : 'text-text-muted'}`}>{field.label}</p>
                                        <p className="text-[9px] font-mono text-text-muted opacity-60">{field.key}</p>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => toggleVisibility(key)}
                                    className={`p-2 rounded-xl transition-all ${isVisible ? 'text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20' : 'text-text-muted hover:text-text-primary hover:bg-surface-alt'}`}
                                >
                                    {isVisible ? <Eye size={16}/> : <EyeOff size={16}/>}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="pt-4 mt-4 border-t border-border-subtle flex justify-between items-center shrink-0">
                    <button onClick={handleReset} className="text-[10px] font-bold uppercase text-text-muted hover:text-status-error flex items-center gap-2 transition-colors">
                        <RotateCcw size={12}/> Reset Default
                    </button>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={onClose} className="h-10 text-[10px] font-bold">Cancel</Button>
                        <Button variant="primary" onClick={handleSave} className="h-10 text-[10px] font-black uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20">
                            <Check size={14} className="mr-2"/> Apply Changes
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
