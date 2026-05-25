import { ProductPreset, CartItem, ProductConfig } from '../../types';

export const presetUtils = {
  // Validate a preset
  validatePreset: (preset: Partial<ProductPreset>): string | null => {
    if (!preset.name || preset.name.trim().length === 0) {
      return 'Preset name is required.';
    }
    if (!preset.items || preset.items.length === 0) {
      return 'Preset must contain at least one product.';
    }
    for (const item of preset.items) {
      if (!item.product) {
        return 'All items must have a product selected.';
      }
      if (!item.quantity) {
        return 'All items must have a quantity selected.';
      }
    }
    return null;
  },

  // Apply a preset to the cart
  applyPreset: (preset: ProductPreset, currentCart: CartItem[], productConfig: ProductConfig): CartItem[] => {
    const newItems = preset.items.map((presetItem) => {
      const productDef = productConfig.products.find(p => p.name === presetItem.product);
      return {
        id: crypto.randomUUID(),
        product: presetItem.product,
        quantity: presetItem.quantity,
        dosage: presetItem.dosage || (productDef?.dosages?.[0] || ''),
        unitPrice: productDef?.price || 0
      };
    });
    
    return [...currentCart, ...newItems];
  },

  // Export presets as JSON string
  exportPresets: (presets: ProductPreset[]): string => {
    return JSON.stringify(presets, null, 2);
  },

  // Import presets from JSON string
  importPresets: (jsonString: string): ProductPreset[] | Error => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        return new Error('Invalid format: Expected an array of presets.');
      }
      
      const validated: ProductPreset[] = [];
      for (const item of parsed) {
        const err = presetUtils.validatePreset(item);
        if (err) {
          return new Error(`Invalid preset format: ${err}`);
        }
        validated.push(item as ProductPreset);
      }
      
      return validated;
    } catch (e: any) {
      return new Error(`Failed to parse JSON: ${e.message}`);
    }
  },

  // Get default presets
  getDefaultPresets: (): ProductPreset[] => {
    return [
      {
        id: crypto.randomUUID(),
        name: 'Starter Setup',
        description: 'Standard 30-day supply with baseline support',
        icon: 'Package',
        items: [
          { product: 'Core Optimizer', quantity: '30 Day Supply' }
        ],
        createdAt: Date.now(),
        createdBy: 'system',
        color: '#8b5cf6'
      },
      {
        id: crypto.randomUUID(),
        name: 'Premium 90-Day',
        description: 'Value pack with 90 days and full support',
        icon: 'Star',
        items: [
          { product: 'Core Optimizer', quantity: '90 Day Supply' },
          { product: 'Cognitive Boost', quantity: '90 Day Supply' }
        ],
        createdAt: Date.now(),
        createdBy: 'system',
        color: '#10b981'
      }
    ];
  }
};
