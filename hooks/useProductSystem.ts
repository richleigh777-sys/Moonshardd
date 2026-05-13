
import { useState, useMemo, useCallback } from 'react';
import { Product, ProductConfig, Sale } from '../types';
import { getProductPerformance, calculateMargin } from '../utils/productMath';

export type SortOption = 'name' | 'price-high' | 'price-low' | 'stock-low' | 'margin-high';

export const useProductSystem = (config: ProductConfig, sales: Sale[], onUpdate: (c: ProductConfig) => void) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [sortMode, setSortMode] = useState<SortOption>('name');

    // Mapped performance metrics for current products
    const metrics = useMemo(() => {
        const map: Record<string, { revenue: number, volume: number }> = {};
        config.products.forEach(p => {
            map[p.id] = getProductPerformance(p.name, sales);
        });
        return map;
    }, [config.products, sales]);

    // Filtering & Sorting logic
    const filteredProducts = useMemo(() => {
        const prods = config.products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
            return matchesSearch && matchesCategory;
        });

        return prods.sort((a, b) => {
            switch (sortMode) {
                case 'price-high': return b.price - a.price;
                case 'price-low': return a.price - b.price;
                case 'stock-low': return (a.stock || 0) - (b.stock || 0);
                case 'margin-high': {
                    const marginA = calculateMargin(a.price, a.cost || 0);
                    const marginB = calculateMargin(b.price, b.cost || 0);
                    return marginB - marginA;
                }
                default: return a.name.localeCompare(b.name);
            }
        });
    }, [config.products, searchTerm, activeCategory, sortMode]);

    // Supply Chain Intelligence
    const stats = useMemo(() => {
        const totalValue = config.products.reduce((acc, p) => acc + (p.price * (p.stock || 0)), 0);
        const lowStockCount = config.products.filter(p => (p.stock || 0) <= (p.minStock || 10)).length;
        const avgMargin = config.products.length > 0 
            ? Math.round(config.products.reduce((acc, p) => acc + calculateMargin(p.price, p.cost || 0), 0) / config.products.length)
            : 0;
        return { totalValue, lowStockCount, avgMargin };
    }, [config.products]);

    // Bulk price adjustment
    const adjustGlobalPrices = useCallback((percentage: number) => {
        const factor = 1 + (percentage / 100);
        const updated = config.products.map(p => ({
            ...p,
            price: Math.round(p.price * factor * 100) / 100
        }));
        onUpdate({ ...config, products: updated });
    }, [config, onUpdate]);

    // Single SKU toggle
    const toggleProductActive = useCallback((id: string) => {
        const updated = config.products.map(p => 
            p.id === id ? { ...p, active: !p.active } : p
        );
        onUpdate({ ...config, products: updated });
    }, [config, onUpdate]);

    // Duplicate Product
    const duplicateProduct = useCallback((product: Product) => {
        const newProduct = {
            ...product,
            id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: `${product.name} (Copy)`,
            sku: `${product.sku}-COPY`
        };
        onUpdate({ ...config, products: [...config.products, newProduct] });
    }, [config, onUpdate]);

    return {
        searchTerm, setSearchTerm,
        activeCategory, setActiveCategory,
        sortMode, setSortMode,
        filteredProducts,
        metrics,
        stats,
        adjustGlobalPrices,
        toggleProductActive,
        duplicateProduct
    };
};
