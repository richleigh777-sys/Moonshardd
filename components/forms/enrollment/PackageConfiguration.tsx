import React from 'react';
import { Zap } from 'lucide-react';
import { ProductPanel } from './ProductPanel';
import { CartItem, ProductConfig } from '../../../types';

interface PackageConfigurationProps {
    cart: CartItem[];
    setCart: (cart: CartItem[]) => void;
    productConfig: ProductConfig;
    notes: string;
    setNotes: (notes: string) => void;
}

export const PackageConfiguration: React.FC<PackageConfigurationProps> = ({
    cart, setCart, productConfig, notes, setNotes
}) => (
    <div className="space-y-4">
        <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Zap size={16} className="text-amber-500" />
            </div>
            <div>
                <h3 className="text-sm font-bold text-white">Order Items</h3>
                <p className="text-xs text-zinc-500">Configure products and notes</p>
            </div>
        </div>
        
        <ProductPanel 
            cart={cart} 
            setCart={setCart} 
            productConfig={productConfig}
            notes={notes}
            setNotes={setNotes}
        />
    </div>
);
