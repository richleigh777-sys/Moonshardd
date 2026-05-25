import React from 'react';
import { Check, AlertTriangle, Loader } from 'lucide-react';
import { Modal } from '../../../ui/Modal';
import { Button } from '../../../ui/Base';

interface ReviewModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  loading: boolean;
  formData: any;
  financials: any;
  cart: any[];
  manualAmount: string;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  show,
  onClose,
  onSubmit,
  loading,
  formData,
  financials,
  cart,
  manualAmount,
}) => {
  if (!show) return null;

  return (
    <Modal isOpen={show} onClose={onClose} title="Review Order" size="lg">
      <div className="space-y-6">
        {/* Customer Info */}
        <div className="bg-surface-alt rounded-lg p-4">
          <h4 className="text-sm font-bold text-text-primary mb-3">Customer</h4>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-text-muted">Name:</span>{' '}
              <span className="font-bold text-text-primary">{formData.fullName}</span>
            </p>
            <p>
              <span className="text-text-muted">Phone:</span>{' '}
              <span className="font-bold text-text-primary">{formData.phone}</span>
            </p>
            <p>
              <span className="text-text-muted">Address:</span>{' '}
              <span className="font-bold text-text-primary">{formData.shippingAddress}</span>
            </p>
          </div>
        </div>

        {/* Card Info */}
        {financials.cardNumber && (
          <div className="bg-surface-alt rounded-lg p-4">
            <h4 className="text-sm font-bold text-text-primary mb-3">Card Details</h4>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-text-muted">Type:</span>{' '}
                <span className="font-bold text-text-primary">{financials.cardType}</span>
              </p>
              <p>
                <span className="text-text-muted">Last 4:</span>{' '}
                <span className="font-mono font-bold text-text-primary">
                  {financials.cardNumber.slice(-4).padStart(financials.cardNumber.length, '*')}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-surface-alt rounded-lg p-4">
          <h4 className="text-sm font-bold text-text-primary mb-3">Items</h4>
          <div className="space-y-2">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.product}</span>
                <span className="font-bold">${item.unitPrice}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="bg-surface-alt rounded-lg p-4 border border-accent-primary">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-text-muted">TOTAL:</span>
            <span className="text-2xl font-black text-status-success num-font">
              ${parseFloat(manualAmount || '0').toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-500/10 border border-yellow-700 rounded-lg p-4 flex gap-3">
          <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-sm font-bold text-yellow-300">Note</p>
            <p className="text-xs text-yellow-200 mt-1">
              Admin will process payment through third-party terminal and label the transaction result.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            variant="primary"
            onClick={onSubmit}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={16} className="animate-spin" /> Processing...
              </>
            ) : (
              <>
                <Check size={16} /> Submit Order
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
