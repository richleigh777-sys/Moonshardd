import React, { useState, useContext } from 'react';
import { CRMContext } from '../../context/CRMContextCore';
import { AuthContext } from '../../context/AuthContextCore';
import { Sale } from '../../types';

interface QuickSaleEntryProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (sale: Sale) => void;
}

export const QuickSaleEntry: React.FC<QuickSaleEntryProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { productConfig, addSale } = useContext(CRMContext)!;
  const { currentUser } = useContext(AuthContext)!;
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [formData, setFormData] = useState({
    customer: '',
    amount: '',
    product: '',
    phone: '',
    email: '',
    address: '',
  });
  const [error, setError] = useState('');

  // const filteredCustomers = customers?.filter((c) =>
  //   c.fullName.toLowerCase().includes(formData.customer.toLowerCase())
  // ) || [];

  const handleQuickSubmit = async () => {
    setError('');

    if (!formData.customer) {
      setError('Customer name is required');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Valid amount is required');
      return;
    }
    if (!formData.product) {
      setError('Product is required');
      return;
    }

    setIsLoading(true);

    try {
      const amount = parseFloat(formData.amount);
      const selectedProduct = productConfig?.products?.find((p: any) => p.id === formData.product);

      const newSale: Partial<Sale> = {
        customer: formData.customer,
        amount,
        product: selectedProduct?.name || formData.product,
        agentId: currentUser?.id || '',
        agent: currentUser?.username || '', // Note: using username
        status: 'Pending',
        timestamp: Date.now(),
      };

      await addSale(newSale as Sale);

      const commission = Math.round(amount * ((currentUser as any).commissionRate || 0.15));
      alert(`✅ Sale created!\n\nCommission: +$${commission}\nTotal today: Keep it going!`);

      setFormData({
        customer: '',
        amount: '',
        product: '',
        phone: '',
        email: '',
        address: '',
      });
      setShowDetails(false);
      onSuccess?.(newSale as Sale);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create sale');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-md w-full border border-slate-700">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">New Sale (30 sec)</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-600 w-8 h-8 rounded flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-white mb-2">Customer *</label>
            <input
              type="text"
              placeholder="John Smith"
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">Amount *</label>
            <input
              type="number"
              placeholder="500"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">Product *</label>
            <select
              value={formData.product}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Select product...</option>
              {productConfig?.products?.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name} (${p.price})
                </option>
              ))}
            </select>
          </div>

          {showDetails && (
            <>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Phone</label>
                <input
                  type="tel"
                  placeholder="+1 555-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Email</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Address</label>
                <input
                  type="text"
                  placeholder="123 Main St..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </>
          )}

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-400 hover:text-blue-300 text-sm font-semibold mt-2"
          >
            {showDetails ? '▼ Hide Details' : '➕ Add Details'}
          </button>
        </div>

        <div className="bg-slate-700 px-6 py-4 flex gap-3 border-t border-slate-600">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white font-bold rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleQuickSubmit}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'CREATE SALE'}
          </button>
        </div>
      </div>
    </div>
  );
};
