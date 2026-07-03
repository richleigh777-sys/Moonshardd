import React, { useState } from 'react';
import { CreditCard, Lock, CheckCircle2, ChevronLeft, Search } from 'lucide-react';
import { InputField } from './InputFields';
import { motion, AnimatePresence } from 'motion/react';

export function Stage3Checkout({ cart, formData, handleIdentityChange, useShippingForBilling, setUseShippingForBilling, financials, setFinancials, handleCardInput, _cardStatus, onSubmit, loading, onBack }: any) {
    const runningTotal = cart.reduce((sum: number, item: any) => sum + (parseInt(item.quantity) || 1) * (item.unitPrice || 0), 0);
    const [cardTypeLabel, setCardTypeLabel] = useState('Credit');
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
        <div className="w-full h-full flex items-start justify-center p-8 overflow-y-auto custom-scrollbar">
            <div className="w-full max-w-[1400px] grid grid-cols-1 lg:grid-cols-2 gap-12 pb-24">
                
                <div className="space-y-8">
                     <button onClick={onBack} className="text-text-muted hover:text-white transition-colors text-sm uppercase tracking-wide">← Back to Configuration</button>
                     
                     <div className="bg-surface-alt border border-border-subtle rounded-xl p-8 shadow-2xl">
                         <h2 className="text-text-primary font-medium text-2xl tracking-wide flex items-center gap-3 mb-8">
                            <span className="text-accent-primary">04.</span> Quality Check
                         </h2>
                         <div className="space-y-4 font-mono">
                             {cart.map((item: any) => (
                                 <div key={item.id} className="flex justify-between items-center text-text-primary pb-4 border-b border-border-subtle">
                                     <div className="flex flex-col">
                                         <span className="text-lg">{item.product}</span>
                                         {item.quantity > 1 && <span className="text-sm text-text-muted">Quantity: {item.quantity}</span>}
                                     </div>
                                     <div className="text-accent-primary text-xl">${(item.unitPrice * (item.quantity || 1)).toFixed(2)}</div>
                                 </div>
                             ))}
                             <div className="flex justify-between items-center text-3xl font-medium tracking-wide pt-4">
                                 <span className="text-text-primary font-sans">Grand Total</span>
                                 <span className="text-accent-primary">${runningTotal.toFixed(2)}</span>
                             </div>
                         </div>
                     </div>

                     <div className="bg-surface-alt border border-border-subtle rounded-xl p-8 shadow-2xl">
                          <div className="flex items-center justify-between mb-6">
                              <h3 className="text-text-primary font-medium text-xl tracking-wide">Billing Details</h3>
                              <label className="flex items-center gap-3 cursor-pointer">
                                  <span className="text-text-muted text-sm uppercase tracking-wide font-semibold">Same as Shipping</span>
                                  <div className="relative inline-flex items-center">
                                      <input type="checkbox" className="sr-only peer" checked={useShippingForBilling} onChange={(e) => setUseShippingForBilling(e.target.checked)} />
                                      <div className="w-11 h-6 bg-surface-main border border-border-strong peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border-strong after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary peer-checked:border-accent-primary"></div>
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

                <div className="bg-surface-alt border border-border-subtle rounded-xl p-8 shadow-2xl flex flex-col h-fit relative isolate overflow-hidden mt-12 lg:mt-0 lg:sticky lg:top-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
                    
                    <h2 className="text-text-primary font-medium text-2xl tracking-wide flex items-center gap-3 mb-8">
                       <span className="text-accent-primary">05.</span> Secure Checkout
                    </h2>
                    
                    <div className="flex bg-surface-main p-1.5 rounded-xl mb-8 border border-border-subtle">
                        <button onClick={() => setCardTypeLabel('Credit')} className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider rounded-lg transition-all ${cardTypeLabel === 'Credit' ? 'bg-accent-primary text-black shadow-md' : 'text-text-muted hover:text-white'}`}>Credit Card</button>
                        <button onClick={() => setCardTypeLabel('Debit')} className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider rounded-lg transition-all ${cardTypeLabel === 'Debit' ? 'bg-accent-primary text-black shadow-md' : 'text-text-muted hover:text-white'}`}>Debit Card</button>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-2">
                             <label className="text-sm font-semibold text-text-muted px-1 flex justify-between items-center">
                                 {cardTypeLabel} Card Number
                                 <span className="text-emerald-500 text-sm font-normal italic">(Ask: 'What is the full card number?')</span>
                             </label>
                             <div className="relative">
                                 <input 
                                     value={financials.cardNumber || ''}
                                     onChange={handleCCChange}
                                     placeholder="0000 0000 0000 0000"
                                     autoComplete="none"
                                     name="rnd_cc_number"
                                     data-lpignore="true" data-1p-ignore="true" data-form-type="other"
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
                                      Expiration
                                  </label>
                                  <input 
                                      value={financials.cardExpiry || ''}
                                      onChange={(e) => setFinancials({...financials, cardExpiry: e.target.value})}
                                      placeholder="MM/YY"
                                      autoComplete="new-password"
                                      name="secure-exp-field"
                                      maxLength={5}
                                      className="w-full bg-surface-main border border-border-strong rounded-xl px-5 py-4 text-xl font-mono text-text-primary placeholder-[#A0A0A0]/30 outline-none transition-all focus:border-accent-primary focus:ring-1 focus:ring-[#C4A470] shadow-sm text-center"
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
                                      autoComplete="new-password"
                                      name="secure-cvv-field"
                                      type="password"
                                      maxLength={4}
                                      className="w-full bg-surface-main border border-border-strong rounded-xl px-5 py-4 text-xl font-mono text-text-primary placeholder-[#A0A0A0]/30 outline-none transition-all focus:border-accent-primary focus:ring-1 focus:ring-[#C4A470] shadow-sm text-center"
                                  />
                             </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-border-subtle">
                        <button 
                            onClick={() => setShowPreview(true)} 
                            disabled={!isReady || loading}
                            className="w-full py-5 bg-gradient-to-r from-amber-400 to-[#C4A470] text-black font-bold text-xl rounded-xl hover:shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed uppercase tracking-wide"
                        >
                            {loading ? <Lock size={20} className="animate-pulse" /> : <Lock size={20} />}
                            {loading ? 'Processing...' : `Review Order ($${runningTotal.toFixed(2)})`}
                        </button>
                    </div>
                </div>
            </div>

            {/* ORDER PREVIEW MODAL */}
            <AnimatePresence>
                {showPreview && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80  p-4 font-sans"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }} 
                            exit={{ scale: 0.95, opacity: 0, y: 20 }} 
                            className="bg-surface-alt border border-accent-primary/30 rounded-xl p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
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
                                        <p><span className="text-text-muted">Email:</span> {formData.email}</p>
                                        <p><span className="text-text-muted">Phone:</span> {formData.phone}</p>
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
                                        {cart.map((item: any) => (
                                            <div key={item.id} className="flex justify-between items-center text-text-primary pb-3 border-b border-border-subtle last:border-0 last:pb-0">
                                                <span>{item.product} {item.quantity > 1 ? `x${item.quantity}` : ''}</span>
                                                <span className="text-accent-primary font-mono">${(item.unitPrice * (item.quantity || 1)).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Payment Method summary */}
                                <div className="space-y-2">
                                    <h3 className="text-accent-primary text-sm uppercase tracking-wide font-bold">Payment Method</h3>
                                    <div className="bg-surface-main rounded-xl p-4 border border-border-subtle flex items-center justify-between text-text-primary">
                                        <div className="flex items-center gap-3">
                                            <CreditCard className={brand ? "text-accent-primary" : "text-text-muted"} size={20} />
                                            <span>{brand || 'Card'} ending in <span className="font-mono">{financials.cardNumber?.replace(/\s/g, '').slice(-4) || '****'}</span></span>
                                        </div>
                                        <span className="text-xl text-accent-primary font-mono font-bold">${runningTotal.toFixed(2)}</span>
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
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
