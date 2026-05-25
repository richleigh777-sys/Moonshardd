import React from 'react';
import { Zap } from 'lucide-react';
import { ProductBasketEnhanced } from './v1/ProductBasketEnhanced';
import { CartItem, ProductConfig } from '../../../types';

interface PackageConfigurationProps {
    cart: CartItem[];
    setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
    productConfig: ProductConfig;
    notes: string;
    setNotes: React.Dispatch<React.SetStateAction<string>>;
}

export const PackageConfiguration: React.FC<PackageConfigurationProps> = ({
    cart, setCart, productConfig, notes, setNotes
}) => {

    const getQtyMultiplier = (qty: string): number => {
        const q = String(qty || '').toLowerCase();
        if (q.includes('90')) return 3;
        if (q.includes('180') || q.includes('6 mo')) return 6;
        if (q.includes('365') || q.includes('year') || q.includes('12 mo')) return 12;
        return 1;
    };

    const calculatedTotal = cart.reduce((sum, item) => {
        const multi = getQtyMultiplier(item.quantity);
        return sum + (item.unitPrice * multi);
    }, 0);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4 px-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-status-warning/30 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    <Zap size={18} className="text-status-warning drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                </div>
                <div>
                    <h3 className="text-xs font-[700]  tracking-[0.2em] text-text-primary">Order Items</h3>
                    <p className="text-xs text-text-muted mt-0.5">Configure products and notes</p>
                </div>
            </div>
            
            <ProductBasketEnhanced
                cart={cart}
                setCart={setCart}
                notes={notes}
                setNotes={setNotes}
                activeProducts={productConfig.products || []}
                activePresets={productConfig.presets || []}
                quantities={productConfig.quantities || ['30 Day Supply', '90 Day Supply', '180 Day Supply', '1 Year Supply']}
                calculatedTotal={calculatedTotal}
            />
        </div>
    );
};
