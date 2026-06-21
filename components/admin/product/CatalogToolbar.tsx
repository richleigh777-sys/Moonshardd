
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
        <div className="flex flex-col border-b border-border-subtle bg-surface-alt/30  sticky top-0 z-20">
            <div className="p-5 flex flex-col xl:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-5 w-full xl:w-auto">
                    <div className="p-3 bg-accent-primary/10 rounded-xl text-accent-primary border border-accent-primary/20 shadow-neon">
                        <Package size={24} strokeWidth={2.5}/>
                    </div>
                    <div>
                        <h3 className="text-xl font-medium  italic text-text-primary">Master <span className="text-accent-primary">Catalog</span></h3>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm font-medium text-text-muted  tracking-wide">{totalItems} SKUs Active</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    <div className="relative group flex-1 xl:flex-none xl:min-w-[240px]">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-primary transition-colors" />
                        <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                            value={searchTerm}
                            onChange={e => onSearchChange(e.target.value)}
                            placeholder="Search SKU..." 
                            className="w-full bg-surface-main border border-border-subtle rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold outline-none focus:border-accent-primary transition-all shadow-inner"
                        />
                    </div>
                    
                    <div className="flex bg-surface-main p-1 rounded-xl border border-border-subtle shadow-inner">
                        <button 
                            onClick={() => onViewModeChange('grid')} 
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-surface-alt text-accent-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                        >
                            <LayoutGrid size={16}/>
                        </button>
                        <button 
                            onClick={() => onViewModeChange('list')} 
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-surface-alt text-accent-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                        >
                            <List size={16}/>
                        </button>
                    </div>

                    <div className="h-8 w-px bg-border-subtle mx-1"></div>

                    <select 
                        value={sortMode}
                        onChange={(e) => onSortChange(e.target.value as SortOption)}
                        className="h-11 bg-surface-main border border-border-subtle rounded-xl px-3 text-sm font-medium  outline-none focus:border-accent-primary cursor-pointer hover:bg-surface-alt transition-colors"
                    >
                        <option value="name">Name (A-Z)</option>
                        <option value="price-high">Price (High)</option>
                        <option value="price-low">Price (Low)</option>
                        <option value="stock-low">Stock (Low)</option>
                        <option value="margin-high">Margin (High)</option>
                    </select>

                    <Button onClick={onToggleBulk} variant="secondary" className="h-11 px-4" title="Bulk Actions"><SlidersHorizontal size={18}/></Button>
                    <Button onClick={onAddProduct} variant="primary" className="h-11 px-4 text-sm font-medium  tracking-wide shadow-lg shadow-accent-primary/20">
                        <Plus size={16} className="mr-2"/> New SKU
                    </Button>
                </div>
            </div>

            {/* Tactical Rail */}
            <div className="px-5 pb-4 flex items-center gap-2 overflow-x-auto scrollbar-hide">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => onCategoryChange(cat)}
                        className={`
                            px-4 py-1.5 rounded-lg text-sm font-medium  tracking-wider border transition-all whitespace-nowrap
                            ${activeCategory === cat 
                                ? 'bg-accent-primary text-white border-accent-primary shadow-md' 
                                : 'bg-surface-main text-text-muted border-border-subtle hover:text-text-primary hover:border-accent-primary/30'}
                        `}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
    );
};
