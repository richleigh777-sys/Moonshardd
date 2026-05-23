
import React, { useState } from 'react';
import { RotateCcw, Calendar, User, Tag, Filter, Bookmark, Search, Layers } from 'lucide-react';
import { sfx } from '../../../lib/soundService';

interface FilterPanelProps {
    filters: any;
    setFilters: (f: any) => void;
    agents: string[];
    products: string[];
    onReset: () => void;
}

const PRESETS = [
    { label: 'My High Value', filters: { status: 'Approved', product: 'All', agent: 'All' } }, // Logic would ideally filter by amt > 500
    { label: 'Pending Review', filters: { status: 'Pending', product: 'All', agent: 'All' } },
    { label: 'Rescue Ops', filters: { status: 'Declined', product: 'All', agent: 'All' } },
];

const DATE_RANGES = [
    { label: 'Today', days: 0 },
    { label: '7 Days', days: 7 },
    { label: '30 Days', days: 30 },
];

export const FilterPanel: React.FC<FilterPanelProps> = React.memo(({ filters, setFilters, agents, products, onReset }) => {
    const [activePreset, setActivePreset] = useState<string | null>(null);

    const applyPreset = (preset: typeof PRESETS[0]) => {
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

    return (
        <div className="p-5 bg-surface-main/95 backdrop-blur-2xl border border-border-subtle rounded-3xl shadow-2xl animate-in slide-in-from-top-4 relative overflow-hidden group">
            {/* Ambient Glow */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent-primary/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-accent-primary/20 transition-all duration-1000"></div>

            <div className="flex flex-col gap-6 relative z-10">
                
                {/* TOP ROW: Presets & Reset */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-subtle/50 pb-4">
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide w-full sm:w-auto">
                        <span className="text-xs font-[700]  text-text-muted tracking-widest mr-2 flex items-center gap-1.5 shrink-0">
                            <Bookmark size={16} className="text-accent-primary"/> Smart Views
                        </span>
                        {PRESETS.map(preset => (
                            <button
                                key={preset.label}
                                onClick={() => applyPreset(preset)}
                                className={`
                                    px-3 py-1.5 rounded-lg text-xs font-bold  tracking-wide border transition-all whitespace-nowrap
                                    ${activePreset === preset.label 
                                        ? 'bg-accent-primary text-white border-accent-primary shadow-lg shadow-accent-primary/20' 
                                        : 'bg-surface-alt text-text-muted border-border-subtle hover:text-text-primary hover:border-accent-primary/30'}
                                `}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                    
                    <button 
                        onClick={() => { onReset(); setActivePreset(null); }}
                        className="flex items-center gap-2 text-xs font-[700]  text-text-muted hover:text-status-error transition-colors px-3 py-1.5 hover:bg-surface-alt rounded-lg"
                    >
                        <RotateCcw size={16}/> Reset Filters
                    </button>
                </div>

                {/* MIDDLE ROW: Core Filters */}
                <div className="flex flex-col gap-6">
                    
                    {/* SECTION 1: Time & Value Data */}
                    <div className="bg-surface-alt/20 p-4 rounded-2xl border border-border-subtle/50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Date Range */}
                        <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-xs font-[700] text-text-muted tracking-widest ml-1 flex items-center gap-1.5">
                                <Calendar size={16}/> Timeline
                            </label>
                            <div className="flex gap-3">
                                 <div className="flex-1 relative">
                                    <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                        type="date" 
                                        value={filters.startDate} 
                                        onChange={e => handleChange('startDate', e.target.value)}
                                        className="w-full bg-surface-main border border-border-subtle rounded-xl px-3 py-2.5 text-xs font-bold text-text-primary outline-none focus:border-accent-primary transition-all shadow-sm"
                                    />
                                 </div>
                                 <div className="flex-1 relative">
                                    <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                        type="date" 
                                        value={filters.endDate} 
                                        onChange={e => handleChange('endDate', e.target.value)}
                                        className="w-full bg-surface-main border border-border-subtle rounded-xl px-3 py-2.5 text-xs font-bold text-text-primary outline-none focus:border-accent-primary transition-all shadow-sm"
                                    />
                                 </div>
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-[700] text-text-muted tracking-widest ml-1 flex items-center gap-1.5">
                                <Tag size={16}/> Value Range
                            </label>
                            <div className="flex gap-2">
                                 <div className="flex-1 relative">
                                    <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                        type="number" 
                                        placeholder="Min"
                                        value={filters.minAmount} 
                                        onChange={e => handleChange('minAmount', e.target.value)}
                                        className="w-full bg-surface-main border border-border-subtle rounded-xl px-3 py-2.5 text-xs font-bold text-text-primary outline-none focus:border-accent-primary transition-all [&::-webkit-inner-spin-button]:appearance-none shadow-sm"
                                    />
                                 </div>
                                 <div className="flex-1 relative">
                                    <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                        type="number"
                                        placeholder="Max" 
                                        value={filters.maxAmount} 
                                        onChange={e => handleChange('maxAmount', e.target.value)}
                                        className="w-full bg-surface-main border border-border-subtle rounded-xl px-3 py-2.5 text-xs font-bold text-text-primary outline-none focus:border-accent-primary transition-all [&::-webkit-inner-spin-button]:appearance-none shadow-sm"
                                    />
                                 </div>
                            </div>
                        </div>

                        {/* Reorder Amount */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-[700] text-text-muted tracking-widest ml-1 flex items-center gap-1.5">
                                <RotateCcw size={16}/> Frequency
                            </label>
                            <div className="relative group">
                                <select 
                                    value={filters.reorderCount} 
                                    onChange={e => handleChange('reorderCount', e.target.value)}
                                    className="w-full bg-surface-main border border-border-subtle rounded-xl px-3 py-2.5 text-xs font-bold text-text-primary outline-none focus:border-accent-primary transition-all appearance-none cursor-pointer hover:bg-surface-alt shadow-sm"
                                >
                                    <option value="All">Any Frequency</option>
                                    <option value="1+">Multiple Times</option>
                                    <option value="2+">3+ Orders</option>
                                    <option value="3+">4+ Orders</option>
                                </select>
                                <Filter size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none group-hover:text-accent-primary transition-colors"/>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Classifications */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Status */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-[700] text-text-muted tracking-widest ml-1 flex items-center gap-1.5">
                                <Layers size={16}/> Status
                            </label>
                            <div className="relative group">
                                <select 
                                    value={filters.status} 
                                    onChange={e => handleChange('status', e.target.value)}
                                    className="w-full bg-surface-alt/50 border border-border-subtle rounded-xl px-3 py-2.5 text-xs font-bold text-text-primary outline-none focus:border-accent-primary transition-all appearance-none cursor-pointer hover:bg-surface-alt"
                                >
                                    <option value="All">Global View</option>
                                    <option value="Approved">Verified Wins</option>
                                    <option value="Pending">Processing</option>
                                    <option value="Declined">Rejected</option>
                                    <option value="Cancelled">Voided</option>
                                </select>
                                <Filter size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none group-hover:text-accent-primary transition-colors"/>
                            </div>
                        </div>

                        {/* Agent */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-[700] text-text-muted tracking-widest ml-1 flex items-center gap-1.5">
                                <User size={16}/> Operator
                            </label>
                            <div className="relative group">
                                <select 
                                    value={filters.agent} 
                                    onChange={e => handleChange('agent', e.target.value)}
                                    className="w-full bg-surface-alt/50 border border-border-subtle rounded-xl px-3 py-2.5 text-xs font-bold text-text-primary outline-none focus:border-accent-primary transition-all appearance-none cursor-pointer hover:bg-surface-alt"
                                >
                                    <option value="All">All Personnel</option>
                                    {agents.map((a: string) => <option key={a} value={a}>{a}</option>)}
                                </select>
                                <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none group-hover:text-accent-primary transition-colors"/>
                            </div>
                        </div>

                        {/* Product */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-[700] text-text-muted tracking-widest ml-1 flex items-center gap-1.5">
                                <Tag size={16}/> Asset Class
                            </label>
                            <div className="relative group">
                                <select 
                                    value={filters.product} 
                                    onChange={e => handleChange('product', e.target.value)}
                                    className="w-full bg-surface-alt/50 border border-border-subtle rounded-xl px-3 py-2.5 text-xs font-bold text-text-primary outline-none focus:border-accent-primary transition-all appearance-none cursor-pointer hover:bg-surface-alt"
                                >
                                    <option value="All">Entire Catalog</option>
                                    {products.map((p: string) => <option key={p} value={p}>{p}</option>)}
                                </select>
                                <Filter size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none group-hover:text-accent-primary transition-colors"/>
                            </div>
                        </div>
                        
                        {/* Win Back */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-[700] text-text-muted tracking-widest ml-1 flex items-center gap-1.5">
                                <Bookmark size={16}/> Opportunity Mode
                            </label>
                            <div className="relative group">
                                <select 
                                    value={filters.winback} 
                                    onChange={e => handleChange('winback', e.target.value)}
                                    className="w-full bg-surface-alt/50 border border-border-subtle rounded-xl px-3 py-2.5 text-xs font-bold text-text-primary outline-none focus:border-accent-primary transition-all appearance-none cursor-pointer hover:bg-surface-alt"
                                >
                                    <option value="All">All Leads</option>
                                    <option value="True">Win Back (Inactive {">"}45 Days)</option>
                                </select>
                                <Filter size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none group-hover:text-accent-primary transition-colors"/>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* BOTTOM ROW: Quick Dates */}
                <div className="flex items-center gap-2 pt-2">
                     {DATE_RANGES.map(dr => (
                         <button 
                            key={dr.label}
                            onClick={() => applyDateRange(dr.days)}
                            className="px-3 py-1.5 bg-surface-alt/30 hover:bg-surface-alt border border-border-subtle rounded text-xs font-mono font-bold text-text-muted hover:text-text-primary transition-all"
                         >
                             {dr.label}
                         </button>
                     ))}
                </div>

            </div>
        </div>
    );
});
