import React, { useState } from 'react';
import { Database, Plus, X, ListFilter, Type, Hash, Calendar as CalendarIcon, ToggleLeft, GripVertical } from 'lucide-react';
import { SectionHeader } from '../SectionHeader';
import { Button } from '../../../ui/Base';
import { SystemConfig, CustomFieldConfig } from '../../../../types';
import { sfx } from '../../../../lib/soundService';

interface ExtensionsTabProps {
    config: SystemConfig;
    onChange: (field: keyof SystemConfig, value: any) => void;
}

export const ExtensionsTab: React.FC<ExtensionsTabProps> = ({ config, onChange }) => {
    const fields = config.customFieldsConfig || [];

    const [isAdding, setIsAdding] = useState(false);
    const [newField, setNewField] = useState<Partial<CustomFieldConfig>>({
        id: '',
        label: '',
        type: 'text',
        options: []
    });

    const [newOptionStr, setNewOptionStr] = useState('');

    const handleAddOption = () => {
        if (!newOptionStr.trim()) return;
        setNewField(prev => ({ ...prev, options: [...(prev.options || []), newOptionStr.trim()] }));
        setNewOptionStr('');
        sfx.playClick();
    };

    const handleRemoveOption = (opt: string) => {
        setNewField(prev => ({ ...prev, options: prev.options?.filter(o => o !== opt) }));
        sfx.playClick();
    };

    const handleSaveField = () => {
        if (!newField.id || !newField.label) {
            sfx.playError();
            return;
        }

        const formattedId = newField.id.trim().replace(/\s+/g, '_').toLowerCase();

        const newConfig: CustomFieldConfig = {
            id: formattedId.startsWith('ext_') ? formattedId : `ext_${formattedId}`,
            label: newField.label.trim(),
            type: newField.type as any,
            options: newField.options,
            required: newField.required,
            order: fields.length
        };

        const list = [...fields];
        list.push(newConfig);
        onChange('customFieldsConfig', list);
        sfx.playSuccess();
        setIsAdding(false);
        setNewField({ id: '', label: '', type: 'text', options: [] });
    };

    const handleRemoveField = (id: string) => {
        sfx.playDecline();
        const list = fields.filter(f => f.id !== id);
        onChange('customFieldsConfig', list);
    };

    return (
        <section className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <SectionHeader icon={Database} title="Dynamic Customer Intelligence Extensions" sub="Add custom data points directly to the CRM Profiles" color="text-accent-secondary" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Visualizer / Existing Fields */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fields.map((field) => (
                            <div key={field.id} className="bg-surface-main p-4 rounded-xl border border-border-subtle group hover:border-accent-secondary transition-colors relative flex flex-col justify-between max-h-[250px]">
                                <div className="space-y-3 pr-8 flex-1 overflow-y-auto custom-scrollbar">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-bold text-text-primary tracking-wide flex items-center gap-2">
                                            {field.type === 'text' && <Type size={14} className="text-accent-secondary" />}
                                            {field.type === 'number' && <Hash size={14} className="text-accent-secondary" />}
                                            {field.type === 'select' && <ListFilter size={14} className="text-accent-secondary" />}
                                            {field.type === 'date' && <CalendarIcon size={14} className="text-accent-secondary" />}
                                            {field.type === 'boolean' && <ToggleLeft size={14} className="text-accent-secondary" />}
                                            {field.label}
                                        </h4>
                                    </div>
                                    <p className="text-[10px] font-mono p-1 px-2 border border-border-subtle/50 rounded-md bg-surface-alt/50 inline-block text-text-muted">{field.id}</p>
                                    
                                    {field.type === 'select' && field.options && field.options.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {field.options.map(opt => (
                                                <span key={opt} className="text-[10px] uppercase font-bold tracking-wide bg-accent-secondary/10 text-accent-secondary px-2 py-0.5 rounded-lg border border-accent-secondary/20 truncate max-w-[120px]">{opt}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button 
                                    onClick={() => handleRemoveField(field.id)}
                                    className="absolute top-4 right-4 text-text-muted hover:text-status-error opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-surface-alt rounded-lg"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}

                        {fields.length === 0 && !isAdding && (
                            <div className="md:col-span-2 py-16 flex flex-col items-center justify-center text-text-muted border-2 border-dashed border-border-subtle rounded-xl">
                                <ListFilter size={48} className="mb-4 opacity-20" />
                                <p className="text-lg font-bold tracking-wider text-text-primary mb-2">No Extension Data Fields</p>
                                <p className="text-sm max-w-sm text-center">Add dynamic data points here. They will appear natively across the sales application, Customer Dossiers, and CRM.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Form Add */}
                <div className="lg:col-span-4">
                    {!isAdding ? (
                        <div onClick={() => { sfx.playClick(); setIsAdding(true); }} className="h-[200px] bg-surface-alt/40 border-2 border-dashed border-border-subtle hover:border-accent-secondary/50 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors group">
                            <Plus size={32} className="text-text-muted group-hover:text-accent-secondary transition-colors mb-2" />
                            <p className="text-sm font-bold tracking-wide text-text-muted group-hover:text-text-primary uppercase">Create Datapoint</p>
                        </div>
                    ) : (
                        <div className="bg-surface-alt/40 border border-border-subtle rounded-xl p-5 space-y-5 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">New Data Field</h3>
                                <button onClick={() => { sfx.playClick(); setIsAdding(false); }} className="text-text-muted hover:text-text-primary p-1 rounded-lg">
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wide ml-1">Unique Identifier</label>
                                    <input 
                                        type="text" 
                                        autoComplete="off" data-lpignore="true" data-prevent-autofill="true"
                                        placeholder="E.g., supp_primaryFocus"
                                        value={newField.id}
                                        onChange={e => setNewField({...newField, id: e.target.value.replace(/\s+/g, '_').toLowerCase()})}
                                        className="w-full bg-surface-main border border-border-subtle rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-accent-secondary font-mono"
                                    />
                                    <p className="text-[10px] text-text-muted ml-1">Must be unique, letters, numbers, and underscores only</p>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wide ml-1">Display Label</label>
                                    <input 
                                        type="text" 
                                        autoComplete="off" data-lpignore="true" data-prevent-autofill="true"
                                        placeholder="E.g., Primary Health Focus"
                                        value={newField.label}
                                        onChange={e => setNewField({...newField, label: e.target.value})}
                                        className="w-full bg-surface-main border border-border-subtle rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-accent-secondary"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wide ml-1">Input Field Type</label>
                                    <select
                                        value={newField.type}
                                        onChange={e => setNewField({...newField, type: e.target.value as any})}
                                        className="w-full bg-surface-main border border-border-subtle rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-accent-secondary appearance-none cursor-pointer"
                                    >
                                        <option value="text">Text (String)</option>
                                        <option value="number">Number</option>
                                        <option value="date">Date</option>
                                        <option value="boolean">Checkbox (Boolean)</option>
                                        <option value="select">Dropdown List (Select)</option>
                                    </select>
                                </div>

                                {newField.type === 'select' && (
                                    <div className="space-y-3 bg-surface-main p-4 rounded-xl border border-border-subtle/50">
                                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Dropdown Choices</label>
                                        <div className="flex gap-2">
                                            <input 
                                                autoComplete="off" data-lpignore="true" data-prevent-autofill="true"
                                                value={newOptionStr}
                                                onChange={e => setNewOptionStr(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleAddOption()}
                                                placeholder="Add selection item..."
                                                className="flex-1 bg-surface-alt border border-border-subtle rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-accent-secondary text-text-primary"
                                            />
                                            <Button onClick={handleAddOption} variant="primary" className="h-[38px] px-3 bg-accent-secondary hover:bg-accent-secondary/90 shadow-sm border-none">
                                                <Plus size={16}/>
                                            </Button>
                                        </div>
                                        {newField.options && newField.options.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                {newField.options.map((opt) => (
                                                    <div key={opt} className="bg-surface-alt border border-border-subtle px-2.5 py-1.5 rounded-lg text-xs font-bold text-text-primary flex items-center gap-2 group shadow-sm transition-all hover:border-accent-secondary/50">
                                                        <span>{opt}</span>
                                                        <button onClick={() => handleRemoveOption(opt)} className="text-text-muted hover:text-status-error ml-1 focus:outline-none">
                                                            <X size={14}/>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="pt-2">
                                    <Button onClick={handleSaveField} variant="primary" className="w-full py-3 bg-accent-secondary hover:bg-accent-secondary/90 shadow-lg shadow-accent-secondary/15 border-none text-white tracking-wide font-bold uppercase shadow-inner shadow-white/20">
                                        Publish To Schema
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};
