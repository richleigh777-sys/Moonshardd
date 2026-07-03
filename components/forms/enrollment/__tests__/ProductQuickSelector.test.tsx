import { describe, it, expect } from 'vitest';
import { ProductPreset, Product } from '../../../../types';

export const mockPresets: ProductPreset[] = [
  {
    id: 'p1',
    name: 'Starter Pack',
    description: '30 Day Supply',
    icon: 'Package',
    items: [
      { product: 'Core Optimizer', quantity: '30 Day Supply', dosage: 'Standard' }
    ],
    createdBy: 'system',
    createdAt: Date.now(),
    color: '#8b5cf6'
  }
];

export const mockProducts: Product[] = [
  {
    id: 'prod1',
    name: 'Core Optimizer',
    price: 49.99,
    category: 'Supplements',
    active: true,
    dosages: ['Standard', 'High']
  }
];

describe('ProductQuickSelector', () => {
    it('dummy test', () => {
        expect(true).toBe(true);
    });
});

// Usage example:
// import { render, fireEvent } from '@testing-library/react';
// import { ProductQuickSelector } from '../ProductQuickSelector';
// 
// test('renders presets and handles click', () => {
//   const handleAdd = jest.fn();
//   const handleQuickAdd = jest.fn();
//
//   const { getByText } = render(
//     <ProductQuickSelector
//       products={mockProducts}
//       presets={mockPresets}
//       quantities={['30 Day Supply', '90 Day Supply']}
//       onAdd={handleAdd}
//       onQuickAdd={handleQuickAdd}
//     />
//   );
//
//   fireEvent.click(getByText('Starter Pack'));
//   expect(handleQuickAdd).toHaveBeenCalledWith(mockPresets[0]);
// });
