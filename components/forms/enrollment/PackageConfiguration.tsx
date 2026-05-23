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
        <div className="flex items-center gap-4 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-status-warning/30 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <Zap size={18} className="text-status-warning drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
            </div>
            <div>
                <h3 className="text-xs font-[700]  tracking-[0.2em] text-text-primary">Order Items</h3>
                <p className="text-xs text-text-muted mt-0.5">Configure products and notes</p>
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
