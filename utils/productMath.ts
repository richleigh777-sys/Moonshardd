
import { Product, Sale } from '../types';

/**
 * Calculates the percentage of total revenue a product contributes.
 */
export const calculateRevenueShare = (productRevenue: number, totalRevenue: number): number => {
    if (totalRevenue <= 0) return 0;
    return Math.round((productRevenue / totalRevenue) * 100);
};

/**
 * Determines the inventory health score based on stock vs minStock levels.
 */
export const getInventoryHealth = (product: Product): 'CRITICAL' | 'LOW' | 'OPTIMAL' => {
    const stock = product.stock || 0;
    const min = product.minStock || 0;
    
    if (stock <= 0) return 'CRITICAL';
    if (stock <= min) return 'LOW';
    return 'OPTIMAL';
};

/**
 * Calculates profit margin percentage for a single SKU.
 */
export const calculateMargin = (price: number, cost: number): number => {
    if (price <= 0) return 0;
    const profit = price - cost;
    return Math.round((profit / price) * 100);
};

/**
 * Aggregates revenue data from sales for a specific product name.
 */
export const getProductPerformance = (productName: string, sales: Sale[]) => {
    const approved = sales.filter(s => s.status === 'Approved' && (s.product || '').includes(productName));
    return {
        revenue: approved.reduce((acc, s) => acc + Number(s.amount), 0),
        volume: approved.length
    };
};
