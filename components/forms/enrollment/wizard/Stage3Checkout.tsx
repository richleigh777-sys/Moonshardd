import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { CreditCard, Lock, CheckCircle2, ChevronLeft, Search } from 'lucide-react';
import { InputField } from './InputFields';
import { motion, AnimatePresence } from 'motion/react';

export function Stage3Checkout({ cart, formData, handleIdentityChange, useShippingForBilling, setUseShippingForBilling, financials, setFinancials, handleCardInput, _cardStatus, onSubmit, loading, onBack }: any) {
    const runningTotal = cart.reduce((sum: number, item: any) => sum + (parseInt(item.quantity) || 1) * (item.unitPrice || 0), 0);
    
    const [showPreview, setShowPreview] = useState(false);

    const formatCC = (val: string) => {
        const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) { parts.push(match.substring(i, i + 4)); }
        return parts.length ? parts.join(' ') : val;
    };

    const handleCCChange = (e: any) => {
        const formatted = formatCC(e.target.value);
        setFinancials({ ...financials, cardNumber: formatted });
        if (handleCardInput) handleCardInput(formatted.replace(/\s/g, ''));
    };

    const getCardBrandName = (num: string) => {
        const clean = num.replace(/\D/g, '');
        if (/^4/.test(clean)) return 'VISA';
        if (/^5[1-5]/.test(clean)) return 'MASTERCARD';
        if (/^3[47]/.test(clean)) return 'AMEX';
        if (/^6(?:011|5)/.test(clean)) return 'DISCOVER';
        return '';
    };

    const brand = getCardBrandName(financials.cardNumber || '');
    const isReady = financials.cardNumber?.length >= 15 && financials.cardExpiry?.length >= 4 && financials.cardCvv?.length >= 3;

    return (
        <div className="w-full h-full flex items-start justify-center p-4 sm:p-6 overflow-y-auto custom-scrollbar">
            <div className="w-full max-w-[1400px] grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 pb-24">
                
                <div className="space-y-6 lg:space-y-8">
                     <button onClick={onBack} className="text-text-secondary hover:text-text-primary transition-colors text-sm font-bold bg-surface-alt px-4 py-2 rounded-full border border-border-subtle shadow-sm mb-4">← Back to Configuration</button>
                     
                     <div className="bg-surface-main border border-border-subtle rounded-3xl p-6 sm:p-8 shadow-panel">
                         <h2 className="text-text-primary font-bold text-2xl tracking-tight flex items-center gap-4 mb-6 sm:mb-8">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent-primary/10 text-accent-primary text-sm">4</span> Quality Check
                         </h2>
                         <div className="space-y-4 font-mono font-medium">
                             {cart.map((item: any) => (
                                 <div key={item.id} className="flex justify-between items-center text-text-primary pb-4 border-b border-border-subtle">
                                     <div className="flex flex-col">
                                         <span className="text-lg font-bold">{item.product}</span>
                                         {item.quantity > 1 && <span className="text-sm text-text-muted">Quantity: {item.quantity}</span>}
                                     </div>
                                     <div className="text-accent-primary text-xl font-bold">${(item.unitPrice * (item.quantity || 1)).toFixed(2)}</div>
                                 </div>
                             ))}
                             <div className="flex justify-between items-center text-3xl font-bold tracking-tight pt-4">
                                 <span className="text-text-primary font-sans">Grand Total</span>
                                 <span className="text-accent-primary font-mono">${runningTotal.toFixed(2)}</span>
                             </div>
                         </div>
                     </div>

                     <div className="bg-surface-main border border-border-subtle rounded-3xl p-6 sm:p-8 shadow-panel">
                          <div className="flex items-center justify-between mb-6">
                              <h3 className="text-text-primary font-bold text-xl tracking-tight">Billing Details</h3>
                              <label className="flex items-center gap-3 cursor-pointer">
                                  <span className="text-text-muted text-sm font-semibold">Same as Shipping</span>
                                  <div className="relative inline-flex items-center">
                                      <input type="checkbox" className="sr-only peer" checked={useShippingForBilling} onChange={(e) => setUseShippingForBilling(e.target.checked)} />
                                      <div className="w-11 h-6 bg-surface-alt border border-border-strong peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border-strong after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary peer-checked:border-accent-primary"></div>
                                  </div>
                              </label>
                          </div>
                          <AnimatePresence initial={false}>
                              {!useShippingForBilling && (
                                  <motion.div 
                                      initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                                      animate={{ height: 'auto', opacity: 1, overflow: 'visible' }}
                                      exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                                  >
                                      <div className="space-y-6 pt-2">
                                          <InputField label="Street Address" name="billingAddress" value={formData.billingAddress || ''} onChange={handleIdentityChange} placeholder="123 Billing St" />
                                          <div className="grid grid-cols-2 gap-6">
                                              <InputField label="City" name="billingCity" value={formData.billingCity || ''} onChange={handleIdentityChange} placeholder="City" />
                                              <InputField label="ZIP Code" name="billingZip" value={formData.billingZip || ''} onChange={handleIdentityChange} placeholder="ZIP" />
                                          </div>
                                      </div>
                                  </motion.div>
                              )}
                          </AnimatePresence>
                     </div>
                </div>

                <div className="bg-surface-main border border-border-subtle rounded-3xl p-6 sm:p-8 shadow-panel flex flex-col h-fit relative isolate overflow-hidden mt-8 lg:mt-0 lg:sticky lg:top-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
                    
                    <h2 className="text-text-primary font-bold text-2xl tracking-tight flex items-center gap-4 mb-8">
                       <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent-primary/10 text-accent-primary text-sm">5</span> Secure Checkout
                    </h2>
                    
                    <div className="flex bg-surface-alt p-1.5 rounded-full mb-8 border border-border-subtle">
                        <button onClick={() => setFinancials({...financials, cardType: 'Credit'})} className={`flex-1 py-3 text-sm font-bold tracking-wide rounded-full transition-all ${(financials.cardType !== 'Debit') ? 'bg-surface-main text-text-primary shadow-sm border border-border-subtle' : 'text-text-muted hover:text-text-primary'}`}>Credit Card</button>
                        <button onClick={() => setFinancials({...financials, cardType: 'Debit'})} className={`flex-1 py-3 text-sm font-bold tracking-wide rounded-full transition-all ${(financials.cardType === 'Debit') ? 'bg-surface-main text-text-primary shadow-sm border border-border-subtle' : 'text-text-muted hover:text-text-primary'}`}>Debit Card</button>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-2">
                             <label className="text-sm font-semibold text-text-muted px-1 flex justify-between items-center">
                                 {financials.cardType === 'Debit' ? 'Debit' : 'Credit'} C&#8203;ard Nu&#8203;mber
                                 <span className="text-emerald-500 text-sm font-normal italic">(Ask: 'What is the full card number?')</span>
                             </label>
                             <div className="relative">
                                 <input 
                                     value={financials.cardNumber || ''}
                                     onChange={handleCCChange}
                                     placeholder="0000 0000 0000 0000"
                                     autoComplete="chrome-off" data-lpignore="true" data-1p-ignore="true" data-form-type="other"
                                     name={"fld_" + Math.random().toString(36).substring(2)}
                                     className="w-full bg-surface-main border border-border-strong rounded-xl pl-12 pr-12 py-4 text-xl font-mono text-text-primary placeholder-[#A0A0A0]/30 outline-none transition-all focus:border-accent-primary focus:ring-1 focus:ring-[#C4A470] shadow-sm"
                                 />
                                 <CreditCard className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${brand ? 'text-accent-primary' : 'text-text-muted'}`} size={24} />
                                 <AnimatePresence>
                                     {brand && (
                                         <motion.div 
                                             initial={{ opacity: 0, scale: 0.8, x: 10 }}
                                             animate={{ opacity: 1, scale: 1, x: 0 }}
                                             exit={{ opacity: 0, scale: 0.8, x: 10 }}
                                             className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-surface-alt border border-accent-primary/30 px-3 py-1 rounded-full shadow-lg"
                                         >
                                             <div className={`w-2 h-2 rounded-full ${brand === 'VISA' ? 'bg-blue-500' : brand === 'MASTERCARD' ? 'bg-orange-500' : brand === 'AMEX' ? 'bg-cyan-500' : 'bg-accent-primary'} animate-pulse`} />
                                             <span className="text-accent-primary font-bold tracking-wide text-sm uppercase">{brand}</span>
                                         </motion.div>
                                     )}
                                 </AnimatePresence>
                             </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                             <div className="space-y-2">
                                  <label className="text-sm font-semibold text-text-muted px-1 flex justify-between items-center">
                                      Expi&#8203;ration
                                  </label>
                                  <input 
                                      value={financials.cardExpiry || ''}
                                      onChange={(e) => setFinancials({...financials, cardExpiry: e.target.value})}
                                      placeholder="MM/YY"
                                      autoComplete="chrome-off" data-lpignore="true" data-1p-ignore="true" data-form-type="other"
                                      name={"fld_" + Math.random().toString(36).substring(2)}
                                      maxLength={5}
                                      className="w-full bg-surface-main border border-border-strong rounded-2xl px-5 py-4 text-xl font-mono text-text-primary placeholder-[#A0A0A0]/30 outline-none transition-all focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/20 shadow-sm text-center"
                                  />
                             </div>
                             <div className="space-y-2">
                                  <label className="text-sm font-semibold text-text-muted px-1 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                      CVV
                                      <span className="text-emerald-500 text-sm sm:text-sm font-normal italic">(Ask: '3 digits on back?')</span>
                                  </label>
                                  <input 
                                      value={financials.cardCvv || ''}
                                      onChange={(e) => setFinancials({...financials, cardCvv: e.target.value})}
                                      placeholder="123"
                                      autoComplete="chrome-off" data-lpignore="true" data-1p-ignore="true" data-form-type="other"
                                      name={"fld_" + Math.random().toString(36).substring(2)}
                                      type="text" style={{ WebkitTextSecurity: 'disc' }}
                                      maxLength={4}
                                      className="w-full bg-surface-main border border-border-strong rounded-2xl px-5 py-4 text-xl font-mono text-text-primary placeholder-[#A0A0A0]/30 outline-none transition-all focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/20 shadow-sm text-center"
                                  />
                             </div>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-border-subtle">
                        <button 
                            onClick={() => setShowPreview(true)} 
                            disabled={!isReady || loading}
                            className="w-full py-5 bg-accent-primary text-white font-bold text-xl rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed disabled:transform-none tracking-wide"
                        >
                            {loading ? <Lock size={20} className="animate-pulse" /> : <Lock size={20} />}
                            {loading ? 'Processing...' : `Review Order ($${runningTotal.toFixed(2)})`}
                        </button>
                    </div>
                </div>
            </div>

            
            {/* ORDER PREVIEW MODAL */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {showPreview && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center font-sans">
                            {/* Backdrop */}
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                exit={{ opacity: 0 }} 
                                onClick={() => setShowPreview(false)}
                                className="absolute inset-0 bg-black/80"
                            />
                            {/* Modal */}
                            <motion.div 
                                initial={{ scale: 0.95, opacity: 0, y: 20 }} 
                                animate={{ scale: 1, opacity: 1, y: 0 }} 
                                exit={{ scale: 0.95, opacity: 0, y: 20 }} 
                                className="relative bg-surface-alt border border-accent-primary/30 rounded-xl p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar z-10"
                            >
                                <div className="flex items-center justify-between border-b border-border-strong pb-4">
                                    <h2 className="text-text-primary font-medium text-2xl tracking-wide flex items-center gap-3">
                                        <Search className="text-accent-primary" /> Order Preview
                                    </h2>
                                    <button onClick={() => setShowPreview(false)} className="text-text-muted hover:text-white transition-colors">
                                        <ChevronLeft size={24} />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {/* Customer Info */}
                                    <div className="space-y-2">
                                        <h3 className="text-accent-primary text-sm uppercase tracking-wide font-bold">Customer Details</h3>
                                        <div className="bg-surface-main rounded-xl p-4 border border-border-subtle space-y-2 text-sm text-text-primary">
                                            <p><span className="text-text-muted">Name:</span> {formData.firstName} {formData.lastName}</p>
                                            <p><span className="text-text-muted">Email:</span> {formData.email ? `${formData.email.substring(0, 3)}***@${formData.email.split('@')[1] || 'email.com'}` : <span className="italic text-text-muted">No Email</span>}</p>
                                            <p><span className="text-text-muted">Phone:</span> {formData.phone ? `***-***-${formData.phone.slice(-4)}` : 'No Phone'}</p>
                                        </div>
                                    </div>

                                    {/* Addresses */}
                                    <div className="space-y-2">
                                        <h3 className="text-accent-primary text-sm uppercase tracking-wide font-bold">Logistics & Billing</h3>
                                        <div className="bg-surface-main rounded-xl p-4 border border-border-subtle space-y-3 text-sm text-text-primary">
                                            <div>
                                                <span className="text-text-muted block text-sm mb-1">Shipping Address:</span>
                                                <p>{formData.shippingAddress} {formData.shippingApt ? `Apt ${formData.shippingApt}` : ''}</p>
                                                <p>{formData.shippingCity}, {formData.shippingState} {formData.shippingZip}</p>
                                            </div>
                                            <div>
                                                <span className="text-text-muted block text-sm mb-1">Billing Address:</span>
                                                {useShippingForBilling ? (
                                                    <p className="italic text-emerald-500">Same as Shipping</p>
                                                ) : (
                                                    <>
                                                        <p>{formData.billingAddress}</p>
                                                        <p>{formData.billingCity}, {formData.billingState} {formData.billingZip}</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order summary */}
                                    <div className="space-y-2">
                                        <h3 className="text-accent-primary text-sm uppercase tracking-wide font-bold">Order Summary</h3>
                                        <div className="bg-surface-main rounded-xl p-4 border border-border-subtle space-y-3 text-sm text-text-primary">
                                            {cart.map((item) => (
                                                <div key={item.id} className="flex justify-between items-center text-text-primary pb-3 border-b border-border-subtle last:border-0 last:pb-0">
                                                    <span>{item.product} {item.quantity > 1 ? `x${item.quantity}` : ''}</span>
                                                    <span className="text-accent-primary font-mono">${(item.unitPrice * (item.quantity || 1)).toFixed(2)}</span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between items-center text-text-primary pt-3 border-t border-border-strong mt-3">
                                                <span className="font-bold">Total Amount</span>
                                                <span className="text-xl text-accent-primary font-mono font-bold">${runningTotal.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Method summary */}
                                    <div className="space-y-2">
                                        <h3 className="text-accent-primary text-sm uppercase tracking-wide font-bold">Payment Method</h3>
                                        <div className="bg-surface-main rounded-xl p-4 border border-border-subtle flex items-center justify-between text-text-primary">
                                            <div className="flex items-center gap-3">
                                                <CreditCard className={brand ? "text-accent-primary" : "text-text-muted"} size={20} />
                                                <span>{brand || 'Card'} <span className="font-bold text-accent-primary">{financials.cardType === 'Debit' ? 'Debit' : 'Credit'}</span> ending in <span className="font-mono">{financials.cardNumber?.replace(/\s/g, '').slice(-4) || '****'}</span></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4 border-t border-border-subtle">
                                    <button 
                                        onClick={() => setShowPreview(false)}
                                        disabled={loading}
                                        className="flex-1 py-4 bg-surface-main text-text-primary border border-border-strong font-bold uppercase tracking-wide rounded-xl hover:bg-surface-hover transition-colors disabled:opacity-50"
                                    >
                                        Edit Order
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setShowPreview(false);
                                            onSubmit();
                                        }} 
                                        disabled={loading}
                                        className="flex-[2] py-4 bg-gradient-to-r from-emerald-500 to-[#5C7D59] text-white font-bold rounded-xl hover:shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-wide"
                                    >
                                        {loading ? <Lock size={20} className="animate-pulse" /> : <CheckCircle2 size={20} />}
                                        {loading ? 'Processing...' : 'Confirm & Process'}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
