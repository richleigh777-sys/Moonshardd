import React from 'react';
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
        <div className="h-full flex flex-col">
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
