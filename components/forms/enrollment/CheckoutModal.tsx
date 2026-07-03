import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { FinancialVault } from './FinancialVault';

export const CheckoutModal = ({
    _isOpen, onClose, onSubmit, loading, error, financials, setFinancials, handleCardInput, cardStatus, _formData, cart
}: any) => {
    
    const grandTotal = cart.reduce((sum: number, item: any) => sum + (parseInt(item.quantity) || 0) * (item.unitPrice || 0), 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 ">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-surface-main w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl border border-border-strong flex flex-col max-h-[90vh]"
            >
                <div className="shrink-0 p-6 sm:p-8 border-b border-border-subtle flex items-center justify-between">
                    <button onClick={onClose} className="p-2 -ml-2 rounded-xl text-text-muted hover:text-white hover:bg-surface-hover transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-3">
                        <Lock size={18} className="text-emerald-400" />
                        <span className="font-bold text-white text-lg">Secure Payment</span>
                    </div>
                    <div className="w-10"></div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-8">
                    
                    <div className="bg-surface-alt/50 border border-border-subtle rounded-xl p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-semibold text-text-muted">Total Amount Due</span>
                            <span className="text-3xl font-bold text-white">$${grandTotal.toFixed(2)}</span>
                        </div>
                        <div className="text-sm text-emerald-400 font-medium flex items-center gap-1.5 justify-end">
                            <ShieldCheck size={14} /> End-to-end encrypted
                        </div>
                    </div>

                    <FinancialVault 
                        financials={financials} 
                        setFinancials={setFinancials} 
                        handleCardInput={handleCardInput} 
                        cardStatus={cardStatus} 
                        error={error}
                    />

                </div>

                <div className="shrink-0 p-6 sm:p-8 bg-surface-alt/30 border-t border-border-subtle flex justify-end gap-4">
                    <button 
                        onClick={onClose}
                        className="px-6 py-4 rounded-xl text-text-secondary font-semibold hover:bg-surface-hover transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onSubmit}
                        disabled={loading || cardStatus === 'invalid' || !financials.cardNumber}
                        className="px-12 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2 min-w-[200px]"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : 'Confirm Order'}
                    </button>
                </div>

            </motion.div>
        </div>
    );
}