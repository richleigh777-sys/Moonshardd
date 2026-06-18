
import React, { useState, useEffect } from 'react';
import { RotateCcw, Calendar, User, Tag, Filter, Bookmark, Search, Layers, Save, Trash2 } from 'lucide-react';
import { sfx } from '../../../lib/soundService';

interface FilterPanelProps {
    filters: any;
    setFilters: (f: any) => void;
    agents: string[];
    products: string[];
    onReset: () => void;
    activePreset: string | null;
    setActivePreset: (preset: string | null) => void;
}

const DEFAULT_PRESETS = [
    { label: 'High Value (>$500)', filters: { status: 'All', minAmount: '500' } },
    { label: 'Action Required', filters: { status: 'Pending' } },
    { label: 'Rescue Ops', filters: { status: 'Declined' } },
    { label: 'VIP Repeaters', filters: { reorderCount: '2+' } },
    { label: 'Win-Back Leads', filters: { winback: 'True' } },
    { label: 'Today\'s Wins', filters: { status: 'Approved' } },
];

const DATE_RANGES = [
    { label: 'Today', days: 0 },
    { label: '7 Days', days: 7 },
    { label: '30 Days', days: 30 },
];

export const FilterPanel: React.FC<FilterPanelProps> = React.memo(({ filters, setFilters, agents, products, onReset, activePreset, setActivePreset }) => {
    const [customPresets, setCustomPresets] = useState<{label: string, filters: any}[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('nexus_custom_filters');
        if (saved) {
            try {
                setCustomPresets(JSON.parse(saved));
            } catch (e) {
                // ignore
            }
        }
    }, []);

    const saveCustomPreset = () => {
        // const name = prompt("Name this Smart View:");
        const name = "Custom View " + Math.floor(Math.random() * 1000);
        if (!name) return;
        const newPreset = { label: name, filters: { ...filters } };
        const updated = [...customPresets, newPreset];
        setCustomPresets(updated);
        localStorage.setItem('nexus_custom_filters', JSON.stringify(updated));
        setActivePreset(name);
        sfx.playConfirm();
    };

    const deleteCustomPreset = (label: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = customPresets.filter(p => p.label !== label);
        setCustomPresets(updated);
        localStorage.setItem('nexus_custom_filters', JSON.stringify(updated));
        if (activePreset === label) setActivePreset(null);
        sfx.playDecline();
    };

    const applyPreset = (preset: {label: string, filters: any}) => {
        sfx.playClick();
        setFilters({ ...filters, ...preset.filters });
        setActivePreset(preset.label);
    };

    const applyDateRange = (days: number) => {
        sfx.playClick();
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days);
        setFilters({
            ...filters,
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0]
        });
        setActivePreset(null);
    };

    const handleChange = (key: string, val: string) => {
        setFilters({ ...filters, [key]: val });
        setActivePreset(null);
    };

    const allPresets = [...DEFAULT_PRESETS, ...customPresets];

    return (
        <div className="p-3 bg-surface-main/95 backdrop-blur-2xl border-b border-border-subtle shadow-md animate-in slide-in-from-top-4 relative group">
            {/* Ambient Glow */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent-primary/10 blur-[80px] rounded-full pointer-events-none transition-all duration-1000"></div>

            <div className="flex flex-col gap-3 relative z-10 w-full max-w-[1400px] mx-auto">
                
                {/* TOP ROW: Presets & Reset */}
                <div className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
                        <span className="text-[10px] font-bold text-text-muted tracking-widest mr-2 flex items-center gap-1 shrink-0 uppercase">
                            <Bookmark size={12} className="text-accent-primary"/> Smart Views
                        </span>
                        {allPresets.map(preset => {
                            const isCustom = customPresets.some(p => p.label === preset.label);
                            return (
                            <button
                                key={preset.label}
                                onClick={() => applyPreset(preset)}
                                className={`
                                    px-2 py-1 rounded bg-surface-alt border transition-all whitespace-nowrap flex items-center gap-1 group/btn text-[10px] font-bold tracking-wide
                                    ${activePreset === preset.label 
                                        ? 'bg-accent-primary text-white border-accent-primary shadow shadow-accent-primary/20' 
                                        : 'text-text-muted border-border-subtle hover:text-text-primary hover:border-accent-primary/30'}
                                `}
                            >
                                {preset.label}
                                {isCustom && (
                                    <Trash2 size={10} className="opacity-0 group-hover/btn:opacity-100 hover:text-status-error transition-opacity" onClick={(e) => deleteCustomPreset(preset.label, e)}/>
                                )}
                            </button>
                        )})}
                    </div>
                    
                    <div className="flex gap-2 shrink-0">
                        <button 
                            onClick={saveCustomPreset}
                            className="flex items-center gap-1 text-[10px] font-bold text-accent-primary hover:text-accent-secondary transition-colors px-2 py-1 hover:bg-surface-alt rounded"
                        >
                            <Save size={12}/> Save View
                        </button>
                        <button 
                            onClick={() => { onReset(); setActivePreset(null); }}
                            className="flex items-center gap-1 text-[10px] font-bold text-text-muted hover:text-status-error transition-colors px-2 py-1 hover:bg-surface-alt rounded"
                        >
                            <RotateCcw size={12}/> Reset Filters
                        </button>
                    </div>
                </div>

                {/* MIDDLE ROW: Core Filters */}
                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2">
                    
                    {/* Date Range Start */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-muted tracking-widest uppercase flex items-center gap-1">
                            <Calendar size={10}/> Start
                        </label>
                        <input type="date" value={filters.startDate} onChange={e => handleChange('startDate', e.target.value)}
                            className="w-full bg-surface-main border border-border-subtle rounded px-2 py-1 text-[10px] font-bold text-text-primary outline-none focus:border-accent-primary transition-all shadow-sm h-6"
                        />
                    </div>
                    
                    {/* Date Range End */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-muted tracking-widest uppercase flex items-center gap-1">
                            <Calendar size={10}/> End
                        </label>
                        <input type="date" value={filters.endDate} onChange={e => handleChange('endDate', e.target.value)}
                            className="w-full bg-surface-main border border-border-subtle rounded px-2 py-1 text-[10px] font-bold text-text-primary outline-none focus:border-accent-primary transition-all shadow-sm h-6"
                        />
                    </div>

                    {/* Amount Min */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-muted tracking-widest uppercase flex items-center gap-1">
                            <Tag size={10}/> Min $
                        </label>
                        <input type="number" placeholder="Min" value={filters.minAmount} onChange={e => handleChange('minAmount', e.target.value)}
                            className="w-full bg-surface-main border border-border-subtle rounded px-2 py-1 text-[10px] font-bold text-text-primary outline-none focus:border-accent-primary transition-all [&::-webkit-inner-spin-button]:appearance-none shadow-sm h-6"
                        />
                    </div>

                    {/* Amount Max */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-muted tracking-widest uppercase flex items-center gap-1">
                            <Tag size={10}/> Max $
                        </label>
                        <input type="number" placeholder="Max" value={filters.maxAmount} onChange={e => handleChange('maxAmount', e.target.value)}
                            className="w-full bg-surface-main border border-border-subtle rounded px-2 py-1 text-[10px] font-bold text-text-primary outline-none focus:border-accent-primary transition-all [&::-webkit-inner-spin-button]:appearance-none shadow-sm h-6"
                        />
                    </div>

                    {/* Frequency */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-muted tracking-widest uppercase flex items-center gap-1">
                            <RotateCcw size={10}/> Freq
                        </label>
                        <select value={filters.reorderCount} onChange={e => handleChange('reorderCount', e.target.value)}
                            className="w-full bg-surface-main border border-border-subtle rounded px-1.5 py-1 text-[10px] font-bold text-text-primary outline-none focus:border-accent-primary transition-all cursor-pointer h-6"
                        >
                            <option value="All">Any Frequency</option>
                            <option value="1+">Multiple Times</option>
                            <option value="2+">3+ Orders</option>
                            <option value="3+">4+ Orders</option>
                        </select>
                    </div>

                    {/* Status */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-muted tracking-widest uppercase flex items-center gap-1">
                            <Layers size={10}/> Status
                        </label>
                        <select value={filters.status} onChange={e => handleChange('status', e.target.value)}
                            className="w-full bg-surface-main border border-border-subtle rounded px-1.5 py-1 text-[10px] font-bold text-text-primary outline-none focus:border-accent-primary transition-all cursor-pointer h-6"
                        >
                            <option value="All">Global View</option>
                            <option value="Approved">Verified Wins</option>
                            <option value="Pending">Processing</option>
                            <option value="Declined">Rejected</option>
                            <option value="Cancelled">Voided</option>
                        </select>
                    </div>

                    {/* Agent */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-muted tracking-widest uppercase flex items-center gap-1">
                            <User size={10}/> Operator
                        </label>
                        <select value={filters.agent} onChange={e => handleChange('agent', e.target.value)}
                            className="w-full bg-surface-main border border-border-subtle rounded px-1.5 py-1 text-[10px] font-bold text-text-primary outline-none focus:border-accent-primary transition-all cursor-pointer h-6"
                        >
                            <option value="All">All Personnel</option>
                            {agents.map((a: string) => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>

                    {/* Product */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-muted tracking-widest uppercase flex items-center gap-1">
                            <Tag size={10}/> Asset
                        </label>
                        <select value={filters.product} onChange={e => handleChange('product', e.target.value)}
                            className="w-full bg-surface-main border border-border-subtle rounded px-1.5 py-1 text-[10px] font-bold text-text-primary outline-none focus:border-accent-primary transition-all cursor-pointer h-6"
                        >
                            <option value="All">Entire Catalog</option>
                            {products.map((p: string) => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
});
