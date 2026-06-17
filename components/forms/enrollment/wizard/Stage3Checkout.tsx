import React, { useState } from 'react';
import { CreditCard, Lock, CheckCircle2, ChevronLeft, MapPin, Search } from 'lucide-react';
import { InputField } from './InputFields';
import { motion, AnimatePresence } from 'motion/react';

export function Stage3Checkout({ cart, formData, handleIdentityChange, useShippingForBilling, setUseShippingForBilling, financials, setFinancials, handleCardInput, cardStatus, onSubmit, loading, onBack }: any) {
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
                     <button onClick={onBack} className="text-[#A0A0A0] hover:text-white transition-colors text-sm uppercase tracking-wide">← Back to Configuration</button>
                     
                     <div className="bg-[#141414] border border-white/5 rounded-[24px] p-8 shadow-2xl">
                         <h2 className="text-[#FDFDFD] font-medium text-2xl tracking-wide flex items-center gap-3 mb-8">
                            <span className="text-[#C4A470]">04.</span> Quality Check
                         </h2>
                         <div className="space-y-4 font-mono">
                             {cart.map((item: any) => (
                                 <div key={item.id} className="flex justify-between items-center text-[#FDFDFD] pb-4 border-b border-white/5">
                                     <div className="flex flex-col">
                                         <span className="text-lg">{item.product}</span>
                                         {item.quantity > 1 && <span className="text-sm text-[#A0A0A0]">Quantity: {item.quantity}</span>}
                                     </div>
                                     <div className="text-[#C4A470] text-xl">${(item.unitPrice * (item.quantity || 1)).toFixed(2)}</div>
                                 </div>
                             ))}
                             <div className="flex justify-between items-center text-3xl font-medium tracking-wide pt-4">
                                 <span className="text-[#FDFDFD] font-sans">Grand Total</span>
                                 <span className="text-[#C4A470]">${runningTotal.toFixed(2)}</span>
                             </div>
                         </div>
                     </div>

                     <div className="bg-[#141414] border border-white/5 rounded-[24px] p-8 shadow-2xl">
                          <div className="flex items-center justify-between mb-6">
                              <h3 className="text-[#FDFDFD] font-medium text-xl tracking-wide">Billing Details</h3>
                              <label className="flex items-center gap-3 cursor-pointer">
                                  <span className="text-[#A0A0A0] text-sm uppercase tracking-widest font-semibold">Same as Shipping</span>
                                  <div className="relative inline-flex items-center">
                                      <input type="checkbox" className="sr-only peer" checked={useShippingForBilling} onChange={(e) => setUseShippingForBilling(e.target.checked)} />
                                      <div className="w-11 h-6 bg-[#1A1A1A] border border-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C4A470] peer-checked:border-[#C4A470]"></div>
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

                <div className="bg-[#141414] border border-white/5 rounded-[24px] p-8 shadow-2xl flex flex-col h-fit relative isolate overflow-hidden mt-12 lg:mt-0 lg:sticky lg:top-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#C4A470]/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
                    
                    <h2 className="text-[#FDFDFD] font-medium text-2xl tracking-wide flex items-center gap-3 mb-8">
                       <span className="text-[#C4A470]">05.</span> Secure Checkout
                    </h2>
                    
                    <div className="flex bg-[#1A1A1A] p-1.5 rounded-xl mb-8 border border-white/5">
                        <button onClick={() => setCardTypeLabel('Credit')} className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider rounded-lg transition-all ${cardTypeLabel === 'Credit' ? 'bg-[#C4A470] text-black shadow-md' : 'text-[#A0A0A0] hover:text-white'}`}>Credit Card</button>
                        <button onClick={() => setCardTypeLabel('Debit')} className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider rounded-lg transition-all ${cardTypeLabel === 'Debit' ? 'bg-[#C4A470] text-black shadow-md' : 'text-[#A0A0A0] hover:text-white'}`}>Debit Card</button>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-2">
                             <label className="text-sm font-semibold text-[#A0A0A0] px-1 flex justify-between items-center">
                                 {cardTypeLabel} Card Number
                                 <span className="text-[#8BA888] text-sm font-normal italic">(Ask: 'What is the full card number?')</span>
                             </label>
                             <div className="relative">
                                 <input 
                                     value={financials.cardNumber || ''}
                                     onChange={handleCCChange}
                                     placeholder="0000 0000 0000 0000"
                                     className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl pl-12 pr-12 py-4 text-xl font-mono text-[#FDFDFD] placeholder-[#A0A0A0]/30 outline-none transition-all focus:border-[#C4A470] focus:ring-1 focus:ring-[#C4A470] shadow-sm"
                                 />
                                 <CreditCard className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${brand ? 'text-[#C4A470]' : 'text-[#A0A0A0]'}`} size={24} />
                                 <AnimatePresence>
                                     {brand && (
                                         <motion.div 
                                             initial={{ opacity: 0, scale: 0.8, x: 10 }}
                                             animate={{ opacity: 1, scale: 1, x: 0 }}
                                             exit={{ opacity: 0, scale: 0.8, x: 10 }}
                                             className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-[#141414] border border-[#C4A470]/30 px-3 py-1 rounded-full shadow-lg"
                                         >
                                             <div className={`w-2 h-2 rounded-full ${brand === 'VISA' ? 'bg-blue-500' : brand === 'MASTERCARD' ? 'bg-orange-500' : brand === 'AMEX' ? 'bg-cyan-500' : 'bg-[#C4A470]'} animate-pulse`} />
                                             <span className="text-[#C4A470] font-bold tracking-widest text-sm uppercase">{brand}</span>
                                         </motion.div>
                                     )}
                                 </AnimatePresence>
                             </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                             <div className="space-y-2">
                                  <label className="text-sm font-semibold text-[#A0A0A0] px-1 flex justify-between items-center">
                                      Expiration
                                  </label>
                                  <input 
                                      value={financials.cardExpiry || ''}
                                      onChange={(e) => setFinancials({...financials, cardExpiry: e.target.value})}
                                      placeholder="MM/YY"
                                      maxLength={5}
                                      className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-5 py-4 text-xl font-mono text-[#FDFDFD] placeholder-[#A0A0A0]/30 outline-none transition-all focus:border-[#C4A470] focus:ring-1 focus:ring-[#C4A470] shadow-sm text-center"
                                  />
                             </div>

                             <div className="space-y-2">
                                  <label className="text-sm font-semibold text-[#A0A0A0] px-1 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                      CVV
                                      <span className="text-[#8BA888] text-sm sm:text-sm font-normal italic">(Ask: '3 digits on back?')</span>
                                  </label>
                                  <input 
                                      value={financials.cardCvv || ''}
                                      onChange={(e) => setFinancials({...financials, cardCvv: e.target.value})}
                                      placeholder="123"
                                      type="password"
                                      maxLength={4}
                                      className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-5 py-4 text-xl font-mono text-[#FDFDFD] placeholder-[#A0A0A0]/30 outline-none transition-all focus:border-[#C4A470] focus:ring-1 focus:ring-[#C4A470] shadow-sm text-center"
                                  />
                             </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/5">
                        <button 
                            onClick={() => setShowPreview(true)} 
                            disabled={!isReady || loading}
                            className="w-full py-5 bg-gradient-to-r from-[#E6C280] to-[#C4A470] text-black font-bold text-xl rounded-xl hover:shadow-[0_0_40px_rgba(196,164,112,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed uppercase tracking-widest"
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
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }} 
                            exit={{ scale: 0.95, opacity: 0, y: 20 }} 
                            className="bg-[#141414] border border-[#C4A470]/30 rounded-[24px] p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
                        >
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <h2 className="text-[#FDFDFD] font-medium text-2xl tracking-wide flex items-center gap-3">
                                    <Search className="text-[#C4A470]" /> Order Preview
                                </h2>
                                <button onClick={() => setShowPreview(false)} className="text-[#A0A0A0] hover:text-white transition-colors">
                                    <ChevronLeft size={24} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Customer Info */}
                                <div className="space-y-2">
                                    <h3 className="text-[#C4A470] text-sm uppercase tracking-widest font-bold">Customer Details</h3>
                                    <div className="bg-[#1A1A1A] rounded-xl p-4 border border-white/5 space-y-2 text-sm text-[#FDFDFD]">
                                        <p><span className="text-[#A0A0A0]">Name:</span> {formData.firstName} {formData.lastName}</p>
                                        <p><span className="text-[#A0A0A0]">Email:</span> {formData.email}</p>
                                        <p><span className="text-[#A0A0A0]">Phone:</span> {formData.phone}</p>
                                    </div>
                                </div>

                                {/* Addresses */}
                                <div className="space-y-2">
                                    <h3 className="text-[#C4A470] text-sm uppercase tracking-widest font-bold">Logistics & Billing</h3>
                                    <div className="bg-[#1A1A1A] rounded-xl p-4 border border-white/5 space-y-3 text-sm text-[#FDFDFD]">
                                        <div>
                                            <span className="text-[#A0A0A0] block text-sm mb-1">Shipping Address:</span>
                                            <p>{formData.shippingAddress} {formData.shippingApt ? `Apt ${formData.shippingApt}` : ''}</p>
                                            <p>{formData.shippingCity}, {formData.shippingState} {formData.shippingZip}</p>
                                        </div>
                                        <div>
                                            <span className="text-[#A0A0A0] block text-sm mb-1">Billing Address:</span>
                                            {useShippingForBilling ? (
                                                <p className="italic text-[#8BA888]">Same as Shipping</p>
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
                                    <h3 className="text-[#C4A470] text-sm uppercase tracking-widest font-bold">Order Summary</h3>
                                    <div className="bg-[#1A1A1A] rounded-xl p-4 border border-white/5 space-y-3 text-sm text-[#FDFDFD]">
                                        {cart.map((item: any) => (
                                            <div key={item.id} className="flex justify-between items-center text-[#FDFDFD] pb-3 border-b border-white/5 last:border-0 last:pb-0">
                                                <span>{item.product} {item.quantity > 1 ? `x${item.quantity}` : ''}</span>
                                                <span className="text-[#C4A470] font-mono">${(item.unitPrice * (item.quantity || 1)).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Payment Method summary */}
                                <div className="space-y-2">
                                    <h3 className="text-[#C4A470] text-sm uppercase tracking-widest font-bold">Payment Method</h3>
                                    <div className="bg-[#1A1A1A] rounded-xl p-4 border border-white/5 flex items-center justify-between text-[#FDFDFD]">
                                        <div className="flex items-center gap-3">
                                            <CreditCard className={brand ? "text-[#C4A470]" : "text-[#A0A0A0]"} size={20} />
                                            <span>{brand || 'Card'} ending in <span className="font-mono">{financials.cardNumber?.replace(/\s/g, '').slice(-4) || '****'}</span></span>
                                        </div>
                                        <span className="text-xl text-[#C4A470] font-mono font-bold">${runningTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-white/5">
                                <button 
                                    onClick={() => setShowPreview(false)}
                                    disabled={loading}
                                    className="flex-1 py-4 bg-[#1A1A1A] text-[#FDFDFD] border border-white/10 font-bold uppercase tracking-widest rounded-xl hover:bg-white/5 transition-colors disabled:opacity-50"
                                >
                                    Edit Order
                                </button>
                                <button 
                                    onClick={() => {
                                        setShowPreview(false);
                                        onSubmit();
                                    }} 
                                    disabled={loading}
                                    className="flex-[2] py-4 bg-gradient-to-r from-[#8BA888] to-[#5C7D59] text-white font-bold rounded-xl hover:shadow-[0_0_30px_rgba(139,168,136,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-widest"
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
