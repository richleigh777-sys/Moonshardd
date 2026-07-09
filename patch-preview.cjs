const fs = require('fs');
let code = fs.readFileSync('components/forms/enrollment/wizard/Stage3Checkout.tsx', 'utf8');

// 1. Add createPortal import
if (!code.includes("import { createPortal }")) {
    code = code.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport { createPortal } from 'react-dom';");
}

// 2. Wrap the modal in createPortal
const previewBlockRegex = /\{\/\* ORDER PREVIEW MODAL \*\/\}\s*<AnimatePresence>([\s\S]*?)<\/AnimatePresence>/;

const newModal = `
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
                                            <p><span className="text-text-muted">Email:</span> {formData.email ? \`\${formData.email.substring(0, 3)}***@\${formData.email.split('@')[1] || 'email.com'}\` : <span className="italic text-text-muted">No Email</span>}</p>
                                            <p><span className="text-text-muted">Phone:</span> {formData.phone ? \`***-***-\${formData.phone.slice(-4)}\` : 'No Phone'}</p>
                                        </div>
                                    </div>

                                    {/* Addresses */}
                                    <div className="space-y-2">
                                        <h3 className="text-accent-primary text-sm uppercase tracking-wide font-bold">Logistics & Billing</h3>
                                        <div className="bg-surface-main rounded-xl p-4 border border-border-subtle space-y-3 text-sm text-text-primary">
                                            <div>
                                                <span className="text-text-muted block text-sm mb-1">Shipping Address:</span>
                                                <p>{formData.shippingAddress} {formData.shippingApt ? \`Apt \${formData.shippingApt}\` : ''}</p>
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
                                                    <span>{item.product} {item.quantity > 1 ? \`x\${item.quantity}\` : ''}</span>
                                                    <span className="text-accent-primary font-mono">\${(item.unitPrice * (item.quantity || 1)).toFixed(2)}</span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between items-center text-text-primary pt-3 border-t border-border-strong mt-3">
                                                <span className="font-bold">Total Amount</span>
                                                <span className="text-xl text-accent-primary font-mono font-bold">\${runningTotal.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Method summary */}
                                    <div className="space-y-2">
                                        <h3 className="text-accent-primary text-sm uppercase tracking-wide font-bold">Payment Method</h3>
                                        <div className="bg-surface-main rounded-xl p-4 border border-border-subtle flex items-center justify-between text-text-primary">
                                            <div className="flex items-center gap-3">
                                                <CreditCard className={brand ? "text-accent-primary" : "text-text-muted"} size={20} />
                                                <span>{brand || 'Card'} <span className="font-bold text-accent-primary">{cardTypeLabel}</span> ending in <span className="font-mono">{financials.cardNumber?.replace(/\\s/g, '').slice(-4) || '****'}</span></span>
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
            )}`;

code = code.replace(previewBlockRegex, newModal);
fs.writeFileSync('components/forms/enrollment/wizard/Stage3Checkout.tsx', code);
console.log("Stage 3 Preview Modal patched!");
