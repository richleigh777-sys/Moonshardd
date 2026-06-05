import React from 'react';
import { ShieldCheck, Lock, X, CreditCard, Receipt } from 'lucide-react';
import { FinancialVault } from './FinancialVault';
import { ValidationSummary } from './ValidationSummary';

interface CheckoutModalProps {
    show: boolean;
    onClose: () => void;
    onReview: () => void;
    financials: any;
    setFinancials: any;
    handleCardInput: any;
    cardStatus: string;
    formData: any;
    cart: any[];
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
    show, onClose, onReview, financials, setFinancials, handleCardInput, cardStatus, formData, cart
}) => {
    if (!show) return null;

    return (
        <div className="absolute inset-0 z-50 bg-surface-alt/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-surface-main w-full max-w-[1000px] rounded-[2.5rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.6)] border border-border-subtle flex flex-col relative overflow-hidden">
                {/* Header */}
                <div className="px-8 py-5 flex items-center justify-between border-b border-border-subtle bg-surface-alt/30 relative">
                   <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/5 to-transparent pointer-events-none"></div>
                   <div className="flex items-center gap-4 relative z-10">
                       <div className="p-2.5 bg-accent-primary/10 rounded-xl text-accent-primary">
                           <ShieldCheck size={20} />
                       </div>
                       <div>
                           <h2 className="text-xl font-black tracking-tight text-text-primary">Log Sale Entry</h2>
                           <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mt-0.5">CRM Sales Statistics Link</p>
                       </div>
                   </div>
                   <button onClick={onClose} className="p-2.5 bg-surface-main hover:bg-status-error/10 border border-border-subtle hover:text-status-error hover:border-status-error/30 transition-all rounded-xl text-text-muted relative z-10 group">
                       <X size={20} strokeWidth={2.5} className="group-hover:scale-110 transition-transform"/>
                   </button>
                </div>
                
                {/* Content */}
                <div className="p-8 overflow-y-auto max-h-[75vh] custom-scrollbar bg-surface-alt/10">
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                       {/* Left: Payment Method */}
                       <div className="flex flex-col">
                           <div className="flex items-center gap-2 mb-4 text-xs font-black uppercase tracking-widest text-text-muted">
                               <CreditCard size={14} className="text-accent-secondary" />
                               Financial Information Log
                           </div>
                           <div className="flex-1 bg-surface-main p-6 rounded-[2rem] border border-border-subtle shadow-sm relative overflow-hidden">
                               <FinancialVault 
                                   financials={financials}
                                   setFinancials={setFinancials}
                                   handleCardInput={handleCardInput}
                                   cardStatus={cardStatus}
                                   fullName={`${formData.firstName} ${formData.lastName}`.trim()}
                               />
                           </div>
                       </div>
                       
                       {/* Right: Order Summary */}
                       <div className="flex flex-col">
                           <div className="flex items-center gap-2 mb-4 text-xs font-black uppercase tracking-widest text-text-muted">
                               <Receipt size={14} className="text-accent-primary" />
                               Order Overview
                           </div>
                           <div className="flex-1 bg-surface-main p-6 rounded-[2rem] border border-border-subtle shadow-sm flex flex-col justify-between relative overflow-hidden">
                               <div className="relative z-10">
                                   <ValidationSummary formData={formData} cart={cart} />
                               </div>
                               
                               <div className="mt-8 pt-6 border-t border-border-subtle relative z-10">
                                   <button 
                                       onClick={onReview} 
                                       className="w-full h-14 bg-indigo-500 hover:bg-indigo-400 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden group"
                                   >
                                       <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none"></div>
                                       <ShieldCheck size={20} /> Review Order
                                   </button>
                                   <div className="flex items-center justify-center gap-2 mt-4 text-text-muted">
                                       <Lock size={12} className="text-status-success" />
                                       <p className="text-[9px] font-black uppercase tracking-widest text-text-muted/80">Secure 256-bit SSL Encrypted</p>
                                   </div>
                               </div>
                           </div>
                       </div>
                   </div>
                </div>
            </div>
        </div>
    );
};
