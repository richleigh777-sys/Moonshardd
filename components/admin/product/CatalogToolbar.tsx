
import React from 'react';
import { Package, Search, SlidersHorizontal, Plus, LayoutGrid, List } from 'lucide-react';
import { Button } from '../../ui/Base';
import { SortOption } from '../../../hooks/useProductSystem';

interface CatalogToolbarProps {
    totalItems: number;
    searchTerm: string;
    onSearchChange: (val: string) => void;
    sortMode: SortOption;
    onSortChange: (val: SortOption) => void;
    categories: string[];
    activeCategory: string;
    onCategoryChange: (cat: string) => void;
    onToggleBulk: () => void;
    onAddProduct: () => void;
    viewMode: 'grid' | 'list';
    onViewModeChange: (mode: 'grid' | 'list') => void;
}

export const CatalogToolbar: React.FC<CatalogToolbarProps> = ({
    totalItems,
    searchTerm,
    onSearchChange,
    sortMode,
    onSortChange,
    categories,
    activeCategory,
    onCategoryChange,
    onToggleBulk,
    onAddProduct,
    viewMode,
    onViewModeChange
}) => {
    return (
        <div className="flex flex-col border-b border-border-subtle bg-surface-main sticky top-0 z-20">
            <div className="p-5 flex flex-col xl:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 w-full xl:w-auto">
                    <div className="flex flex-col">
                        <h3 className="text-xl font-bold text-text-primary tracking-tight">Master Catalog</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-text-muted">{totalItems} SKUs Active</span>
                            <span className="w-1 h-1 rounded-full bg-status-success animate-pulse"></span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    <div className="relative group flex-1 xl:flex-none xl:min-w-[280px]">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-primary transition-colors" />
                        <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                            value={searchTerm}
                            onChange={e => onSearchChange(e.target.value)}
                            placeholder="Search SKU..." 
                            className="w-full bg-surface-main border border-border-strong rounded-md py-2 pl-10 pr-4 text-sm font-medium outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all shadow-sm"
                        />
                    </div>
                    
                    <div className="flex bg-surface-alt p-0.5 rounded-md border border-border-subtle h-[38px]">
                        <button 
                            onClick={() => onViewModeChange('grid')} 
                            className={`px-3 flex items-center justify-center rounded transition-all ${viewMode === 'grid' ? 'bg-surface-main text-text-primary shadow-sm border border-border-subtle' : 'text-text-muted hover:text-text-primary border border-transparent'}`}
                        >
                            <LayoutGrid size={16}/>
                        </button>
                        <button 
                            onClick={() => onViewModeChange('list')} 
                            className={`px-3 flex items-center justify-center rounded transition-all ${viewMode === 'list' ? 'bg-surface-main text-text-primary shadow-sm border border-border-subtle' : 'text-text-muted hover:text-text-primary border border-transparent'}`}
                        >
                            <List size={16}/>
                        </button>
                    </div>

                    <div className="h-8 w-px bg-border-subtle mx-1 hidden sm:block"></div>

                    <select 
                        value={sortMode}
                        onChange={(e) => onSortChange(e.target.value as SortOption)}
                        className="h-[38px] bg-surface-main border border-border-strong rounded-md px-3 text-sm font-medium text-text-primary outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 cursor-pointer hover:bg-surface-alt transition-colors shadow-sm"
                    >
                        <option value="name">Sort by: Name (A-Z)</option>
                        <option value="price-high">Sort by: Price (High)</option>
                        <option value="price-low">Sort by: Price (Low)</option>
                        <option value="stock-low">Sort by: Stock (Low)</option>
                        <option value="margin-high">Sort by: Margin (High)</option>
                    </select>

                    <Button onClick={onToggleBulk} variant="secondary" className="h-[38px] px-3 shadow-sm rounded-md border-border-strong"><SlidersHorizontal size={16}/></Button>
                    <Button onClick={onAddProduct} variant="primary" className="h-[38px] px-4 text-sm font-bold tracking-wide shadow-sm rounded-md">
                        <Plus size={16} className="mr-2"/> New SKU
                    </Button>
                </div>
            </div>

            {/* Tactical Rail */}
            <div className="px-5 pb-3 flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => onCategoryChange(cat)}
                        className={`
                            px-3 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase transition-all whitespace-nowrap
                            ${activeCategory === cat 
                                ? 'bg-text-primary text-surface-main shadow-sm' 
                                : 'bg-surface-alt text-text-muted hover:text-text-primary hover:bg-border-subtle'}
                        `}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
    );
};
