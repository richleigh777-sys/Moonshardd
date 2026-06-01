import React, { useState } from 'react';
import { DollarSign, Check, Search, AlertTriangle, MessageSquare, Loader, ShoppingCart } from 'lucide-react';
import { useEnrollmentLogic } from '../../hooks/useEnrollmentLogic';
import { TOP_US_BANKS, CARD_PROVIDERS } from '../../constants';
import { Button, Card } from '../ui/Base';
import { EnrollmentHeader } from './enrollment/v1/EnrollmentHeader';
import { IdentitySection } from './enrollment/v1/IdentitySection';
import { MedicalSection } from './enrollment/v1/MedicalSection';
import { PaymentSection } from './enrollment/v1/PaymentSection';
import { ProductBasketEnhanced } from './enrollment/v1/ProductBasketEnhanced';
import { CartPreview } from './enrollment/CartPreview';
import { ReviewModal } from './enrollment/v1/ReviewModal';
import { CustomerLookup } from './enrollment/v1/CustomerLookup';
import { DispositionModal } from '../modals/DispositionModal';
import { useAuth } from '../../hooks/useAuth';
import { sfx } from '../../lib/soundService';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any;
}

export default function EnrollmentForm({
  onSuccess,
  onCancel,
  initialData,
}: Props) {
  const { currentUser } = useAuth();
  const logic = useEnrollmentLogic(onSuccess, initialData);
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [isDispositionOpen, setIsDispositionOpen] = useState(false);
  const [lookupQuery, setLookupQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Partial validation for Step 1
  const handleProceedToPayment = () => {
    if (!logic.formData.fullName || logic.formData.fullName.trim().length < 2) {
      logic.setError('Customer name is required before payment');
      sfx.playDecline();
      return;
    }
    if (!logic.formData.phone || logic.formData.phone.replace(/\D/g, '').length < 10) {
      logic.setError('Valid phone number is required before payment');
      sfx.playDecline();
      return;
    }
    if (logic.cart.length === 0) {
      logic.setError('Please add at least one product to the order');
      sfx.playDecline();
      return;
    }
    logic.setError('');
    sfx.playClick();
    setShowPaymentModal(true);
  };

  return (
    <div id="enrollment-form-container" className="w-full h-full animate-in fade-in duration-500 overflow-hidden flex flex-col bg-surface-main relative">
      {/* Header */}
      <EnrollmentHeader
        manualAmount={logic.manualAmount || String(logic.calculatedTotal)}
        customerTime={logic.customerTime}
        onClear={() => setShowClearConfirm(true)}
      />

      {/* Main Content */}
      <div className="flex-1 min-h-0 p-4 lg:p-6 overflow-y-auto custom-scrollbar bg-surface-alt/10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 pb-20 items-start">
          
            {/* LEFT COLUMN: Identity & Medical */}
            <div className="w-full lg:w-7/12 flex flex-col gap-6 relative order-2 lg:order-1">
              {/* Customer Search Bar (Triggers Lookup) */}
              <div 
                onClick={() => {
                  setIsLookupOpen(true);
                  sfx.playClick();
                }}
                className="w-full bg-surface-alt/50 border border-border-subtle/50 hover:border-indigo-500/50 hover:bg-surface-alt rounded-2xl p-4 flex items-center justify-between cursor-pointer group transition-all shadow-sm"
              >
                 <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-500 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all shadow-sm border border-indigo-500/20">
                       <Search size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-text-primary tracking-wide group-hover:text-indigo-400 transition-colors">Find Existing Customer</h3>
                      <p className="text-[11px] text-text-muted mt-0.5 font-medium">Search history to auto-fill identity & medical info</p>
                    </div>
                 </div>
                 <div className="hidden sm:flex text-[10px] font-bold text-text-muted bg-surface-main px-3 py-1.5 rounded-lg border border-border-subtle uppercase tracking-widest group-hover:border-indigo-500/30 group-hover:text-indigo-400 transition-colors shadow-sm">
                   Quick Lookup
                 </div>
              </div>

              {/* Dynamic Intel Recovery Glance Alert for Un-Converted / Declined clients */}
              {logic.lastDecline && (
                <div id="hot-lead-alert-glance" className="w-full bg-rose-500/10 border border-rose-500/30 rounded-2xl p-5 text-left relative overflow-hidden shadow-md animate-in slide-in-from-top-4 duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none"></div>
                  
                  <div className="flex items-start gap-3.5 relative z-10">
                    <div className="p-2.5 bg-rose-500/20 rounded-xl text-rose-400 border border-rose-500/30 animate-pulse mt-1 shrink-0">
                      <AlertTriangle size={20} strokeWidth={2.5} />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <span className="inline-block bg-rose-500/25 text-rose-400 font-extrabold text-[9px] tracking-widest px-2.5 py-1 rounded-md uppercase border border-rose-500/30">
                            🔴 HOT RECOVERY LEAD
                          </span>
                          <h4 className="text-sm font-black text-text-primary tracking-wide mt-1.5 flex items-center gap-1.5">
                            Prior Decline: <span className="text-rose-400">{logic.lastDecline.declineReason || 'Unknown Bank Decline'}</span>
                          </h4>
                        </div>
                        
                        <button
                          onClick={() => {
                            logic.handleRestoreLastDecline();
                          }}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-lg hover:shadow-rose-600/30 cursor-pointer transition-all active:scale-95 whitespace-nowrap border border-rose-500/30 ml-auto sm:ml-0"
                        >
                          ⚡ Restore Cart & Card
                        </button>
                      </div>

                      <p className="text-xs text-text-muted mt-2 font-medium">
                        Processed on {new Date(logic.lastDecline.timestamp).toLocaleDateString()} for <strong className="text-rose-400">${Number(logic.lastDecline.amount).toFixed(2)}</strong>.
                      </p>
                      
                      {logic.lastDecline.callSummary && (
                        <div className="mt-3 bg-surface-main/60 border border-border-subtle p-3 rounded-xl text-xs leading-relaxed text-text-secondary">
                          <span className="font-bold text-[10px] text-text-muted tracking-wider uppercase block mb-1">Last Interaction Notes:</span>
                          "{logic.lastDecline.callSummary}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {logic.lastActiveDelivery && (
                <div id="undelivered-package-warning" className="w-full bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 text-left relative overflow-hidden shadow-md animate-in slide-in-from-top-4 duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
                  
                  <div className="flex items-start gap-3.5 relative z-10">
                    <div className="p-2.5 bg-amber-500/20 rounded-xl text-status-warning border border-amber-500/30 mt-1 shrink-0">
                      <AlertTriangle size={20} strokeWidth={2.5} />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div>
                        <span className="inline-block bg-amber-500/25 text-status-warning font-extrabold text-[9px] tracking-widest px-2.5 py-1 rounded-md uppercase border border-amber-500/30">
                          ⚠️ ACTIVE UNDELIVERED TRANSACTION
                        </span>
                        <h4 className="text-sm font-black text-text-primary tracking-wide mt-1.5 flex items-center gap-1.5">
                          Previous Package Status: <span className="text-status-warning">{logic.lastActiveDelivery.deliveryStatus || 'Processing / In-Transit'}</span>
                        </h4>
                      </div>

                      <p className="text-xs text-text-muted mt-2 font-medium">
                        An approved order for <strong className="text-status-warning">{logic.lastActiveDelivery.product}</strong> was submitted on {new Date(logic.lastActiveDelivery.timestamp).toLocaleDateString()}, and has NOT been marked as delivered yet. 
                      </p>
                      
                      <div className="mt-3 bg-surface-main/60 border border-border-subtle p-3 rounded-xl text-xs leading-relaxed text-text-secondary">
                        <span className="font-extrabold text-[10px] text-text-muted tracking-wider uppercase block mb-1">⚠️ TEAM COMPLIANCE POLICY GUIDELINE:</span>
                        "1-Time Ship per Transaction." To prevent user confusion and double-billing doubt, we do NOT ship any additional packages/upsells until they have received their previous package. Please verify with the customer if they have already received their order before completing a new sale.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Identity */}
              <IdentitySection
                formData={logic.formData}
                handleIdentityChange={logic.handleIdentityChange}
                handleAgeChange={logic.handleAgeChange}
                handleDobChange={logic.handleDobChange}
                useShippingForBilling={logic.useShippingForBilling}
                setUseShippingForBilling={logic.setUseShippingForBilling}
                onPasteParse={logic.handlePasteParse}
              />

              {/* Medical */}
              <MedicalSection
                selectedConditions={logic.formData.medicalConditions || []}
                toggleCondition={logic.toggleCondition}
                activeMedicalConditions={logic.activeMedicalConditions}
              />
            </div>

            {/* RIGHT COLUMN: Products & Payment Prep */}
            <div className="w-full lg:w-5/12 flex flex-col gap-6 h-fit order-1 lg:order-2 lg:sticky lg:top-6">
              <ProductBasketEnhanced
                cart={logic.cart}
                setCart={logic.setCart}
                activeProducts={logic.activeProducts}
                activePresets={logic.activePresets}
                quantities={logic.productConfig.quantities}
                notes={logic.notes}
                setNotes={logic.setNotes}
                calculatedTotal={logic.calculatedTotal}
              />

              <Card variant="panel" className="p-5 bg-surface-main border-border-subtle shadow-md shrink-0 rounded-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent pointer-events-none"></div>

                {/* Cart Preview in Submit Panel */}
                <div className="mb-5 relative z-10 w-full">
                  <div className="flex items-center gap-2 mb-2">
                     <ShoppingCart size={14} className="text-emerald-500" />
                     <label className="text-[11px] font-bold text-emerald-500 tracking-widest block uppercase">
                       Ready to Process
                     </label>
                  </div>
                  {logic.cart.length > 0 ? (
                    <CartPreview 
                      cart={logic.cart} 
                      onRemove={(id) => logic.setCart(prev => prev.filter(c => c.id !== id))} 
                      calculatedTotal={logic.calculatedTotal} 
                    />
                  ) : (
                    <div className="p-3 text-center border border-dashed border-border-subtle rounded-xl bg-surface-alt/50 text-xs text-text-muted">
                       Add products to order
                    </div>
                  )}
                </div>

                {/* Manual Amount Input */}
                <div className="mb-5 relative z-10 w-full pt-4 border-t border-border-subtle">
                  <label className="text-[11px] font-bold text-text-muted tracking-widest mb-1.5 block">
                    FINAL ORDER AMOUNT *
                  </label>
                  
                  {/* Show calculated total first */}
                  <div className="mb-2 p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-text-muted">Calculated from cart:</span>
                      <span className="text-sm font-bold text-indigo-400">${logic.calculatedTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mb-2">
                    <p className="text-xs text-text-muted mb-2">
                      💡 <strong className="text-indigo-400">Override calculation:</strong> You can enter any custom amount you explicitly negotiated or needed to charge the customer.
                    </p>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-xl text-status-success/80 pointer-events-none">$</div>
                      <input
                        type="number"
                        value={logic.manualAmount}
                        onChange={(e) => {
                          if (logic.handleManualAmountChange) {
                            logic.handleManualAmountChange(e.target.value);
                          } else {
                            logic.setManualAmount(e.target.value);
                          }
                        }}
                        placeholder="0.00"
                        step="0.01"
                        className="w-full bg-surface-alt/70 border border-border-subtle rounded-xl py-4 pl-9 pr-5 text-2xl font-black num-font text-right outline-none ring-offset-surface-main focus:border-status-success/50 focus:ring-4 focus:ring-status-success/10 focus:bg-surface-main transition-all shadow-inner text-text-primary"
                      />
                    </div>
                  </div>

                  {logic.manualAmountError && (
                    <p className="text-xs text-status-error mt-2">
                      {logic.manualAmountError}
                    </p>
                  )}
                  
                  {!logic.manualAmountError && parseFloat(logic.manualAmount) !== logic.calculatedTotal && logic.manualAmount !== '' && (
                    <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <p className="text-xs text-amber-400">
                        ⚠️ Override amount differs from cart calculation
                      </p>
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {logic.error && (
                  <div className="text-sm text-status-error font-bold text-center animate-pulse flex items-center justify-center gap-2 bg-status-error/10 py-3 px-4 rounded-xl mb-4 border border-status-error/20 relative z-10">
                    <AlertTriangle size={18} /> {logic.error}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 relative z-10 w-full flex-col sm:flex-row">
                  <div className="flex gap-2 w-full sm:w-1/2">
                    <button
                      onClick={() => setIsDispositionOpen(true)}
                      className="flex-1 rounded-xl bg-surface-alt border border-border-subtle text-[11px] font-bold text-text-muted hover:text-indigo-500 hover:border-indigo-500/30 transition-all flex flex-col items-center justify-center p-2 min-h-[48px] gap-1"
                    >
                      <MessageSquare size={14} /> Unfinished
                    </button>
                    <button
                      onClick={() => logic.handleClear()}
                      className="flex-1 rounded-xl bg-surface-alt border border-border-subtle text-[11px] font-bold text-text-muted hover:text-status-error hover:border-status-error/30 transition-all flex flex-col items-center justify-center gap-1"
                    >
                       Reset
                    </button>
                  </div>
                  <button
                    onClick={handleProceedToPayment}
                    className="w-full sm:w-1/2 rounded-xl bg-indigo-600 text-white text-sm font-black shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 border border-indigo-500/20 active:scale-[0.98] hover:bg-indigo-500"
                  >
                    Confirm Details & Payment <Check size={18} strokeWidth={3} />
                  </button>
                </div>
              </Card>
            </div>
        </div>
      </div>

      {/* Modals */}
      <DispositionModal
        isOpen={isDispositionOpen}
        onClose={() => setIsDispositionOpen(false)}
        onSave={(dispo) => {
           logic.handleDisposition(dispo);
           setIsDispositionOpen(false);
        }}
        formData={logic.formData}
      />
      
      {/* Payment Information Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 sm:p-6 overflow-y-auto">
          <div className="bg-surface-main w-full max-w-lg rounded-3xl border border-border-subtle shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border-subtle shrink-0">
               <div>
                  <h2 className="text-xl font-bold text-text-primary tracking-tight">Payment Information</h2>
                  <p className="text-sm text-text-muted mt-1">Enter credit/debit card to process ${Number(logic.manualAmount || logic.calculatedTotal).toFixed(2)}</p>
               </div>
               <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-alt text-text-muted hover:text-text-primary hover:bg-surface-highlight transition-all"
               >
                  ✕
               </button>
            </div>
            
            <div className="px-5 sm:px-6 py-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
              <PaymentSection
                financials={logic.financials}
                handleFinancialChange={logic.handleFinancialChange}
                cardStatus={logic.cardStatus as any}
                showCvv={logic.showCvv}
                setShowCvv={logic.setShowCvv}
                bankOptions={TOP_US_BANKS}
                cardProviders={CARD_PROVIDERS}
              />

              {/* Error Message inside Payment Modal */}
              {logic.error && (
                <div className="text-sm text-status-error font-bold text-center animate-pulse flex items-center justify-center gap-2 bg-status-error/10 py-3 px-4 rounded-xl mt-4 border border-status-error/20">
                  <AlertTriangle size={18} /> {logic.error}
                </div>
              )}
            </div>

            <div className="p-5 sm:p-6 border-t border-border-subtle bg-surface-alt/30 shrink-0">
               <button
                  disabled={logic.loading}
                  onClick={(e) => {
                    const valid = logic.handleValidation(e as any);
                    if (valid) {
                      setShowPaymentModal(false);
                      logic.setShowReview(true);
                    }
                  }}
                  className={`w-full rounded-xl bg-emerald-600 text-white text-base font-black shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 border border-emerald-500/20 h-14 active:scale-[0.98] ${
                    logic.loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-500'
                  }`}
                >
                  {logic.loading ? (
                    <>
                      <Loader size={20} className="animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <Check size={20} strokeWidth={3} /> Review & Submit Order
                    </>
                  )}
              </button>
            </div>
          </div>
        </div>
      )}
      <ReviewModal
        show={logic.showReview}
        onClose={() => logic.setShowReview(false)}
        onSubmit={logic.handleFinalSubmit}
        loading={logic.loading}
        formData={logic.formData}
        financials={logic.financials}
        cart={logic.cart}
        manualAmount={logic.manualAmount}
      />

      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-surface-main rounded-2xl p-6 max-w-sm shadow-xl m-4 border border-border-subtle">
            <h3 className="text-lg font-bold text-text-primary mb-2">Clear Form?</h3>
            <p className="text-sm text-text-muted mb-6">
              All entered data will be lost. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 border border-border-subtle rounded-lg hover:bg-surface-alt transition text-text-primary text-sm font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  logic.handleClear(true);
                  setShowClearConfirm(false);
                }}
                className="flex-1 px-4 py-2 bg-status-error text-white rounded-lg hover:bg-status-error/90 transition text-sm font-bold shadow-md"
              >
                Clear Everything
              </button>
            </div>
          </div>
        </div>
      )}

      <CustomerLookup
        isOpen={isLookupOpen}
        onClose={() => {
          setIsLookupOpen(false);
          setLookupQuery('');
        }}
        customers={logic.uniqueCustomers || []}
        allSales={logic.allSales || []}
        onSelectCustomer={(customer) => {
          logic.selectCustomer(customer);
          setIsLookupOpen(false);
          sfx.playSuccess();
        }}
      />

      {/* Success State */}
      {logic.showSuccess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6 animate-in fade-in">
          <div className="bg-surface-main w-full max-w-lg rounded-3xl border border-border-subtle shadow-2xl flex flex-col overflow-hidden">
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 text-center relative overflow-hidden flex flex-col items-center justify-center">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
               
               <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(255,255,255,0.2)] animate-bounce relative z-10">
                 <Check size={40} className="text-white" strokeWidth={3} />
               </div>
               
               <h2 className="text-3xl font-black text-white tracking-tight relative z-10">
                 Order Successfully Submitted!
               </h2>
               <p className="text-emerald-100 font-medium text-sm mt-2 relative z-10">
                 Transaction processing has been successfully handed off.
               </p>
            </div>
            
            <div className="p-8 text-center bg-surface-main">
               <div className="bg-surface-alt/50 border border-border-subtle rounded-2xl p-6 mb-6">
                 <p className="text-text-muted text-sm font-bold uppercase tracking-widest mb-1">TOTAL TRANSACTION</p>
                 <p className="text-4xl font-black text-status-success tracking-tighter mb-4">${Number(logic.manualAmount || logic.calculatedTotal).toFixed(2)}</p>
                 
                 <div className="h-px w-full bg-border-subtle my-4"></div>
                 
                 <div className="text-left text-sm text-text-secondary space-y-2">
                   <div className="flex justify-between items-center">
                     <span className="font-medium">Customer:</span>
                     <span className="font-bold text-text-primary">{logic.formData.fullName}</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="font-medium">Products:</span>
                     <span className="font-bold text-text-primary text-right max-w-[200px] truncate">{logic.cart.map(c => c.product).join(', ')}</span>
                   </div>
                 </div>
               </div>

               <div className="mb-8">
                  <h3 className="text-xl font-black text-indigo-400">Great Job, {currentUser?.name?.split(' ')[0] || 'Team'}! 🎉</h3>
                  <p className="text-text-secondary text-sm mt-1">You're crushing it today! Keep up the incredible momentum.</p>
               </div>

               <button
                 onClick={() => {
                   logic.setShowSuccess(false);
                   logic.handleClear();
                   onSuccess();
                 }}
                 className="w-full h-14 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-base transition-all active:scale-[0.98] shadow-lg shadow-indigo-600/20"
               >
                 Close & Start Next Lead
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
