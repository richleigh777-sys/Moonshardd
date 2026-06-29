import React, { useState } from 'react';
import { DollarSign, Check, Search, AlertTriangle, MessageSquare, Loader, ShoppingCart, X } from 'lucide-react';
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
    <div id="enrollment-form-container" className="w-full h-full animate-in fade-in duration-500 overflow-hidden flex flex-col bg-gradient-to-b from-surface-main to-surface-alt/50 relative">
      {/* Header */}
      <EnrollmentHeader
        manualAmount={logic.manualAmount || String(logic.calculatedTotal)}
        customerTime={logic.customerTime}
        onClear={() => setShowClearConfirm(true)}
      />

      {/* Main Content - Improved Layout */}
      <div className="flex-1 min-h-0 p-3 sm:p-4 lg:p-4 overflow-y-auto custom-scrollbar bg-surface-alt/10">
        <div className="max-w-8xl mx-auto">
          {/* Responsive Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-4 lg:gap-4 pb-24 lg:pb-8">
            
            {/* LEFT COLUMN: Identity & Medical (7 columns on lg) */}
            <div className="md:col-span-2 lg:col-span-7 flex flex-col gap-4 lg:gap-4">
              {/* Customer Search Card - Enhanced */}
              <div 
                onClick={() => {
                  setIsLookupOpen(true);
                  sfx.playClick();
                }}
                className="w-full bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border border-indigo-500/30 hover:border-indigo-500/60 hover:from-indigo-500/15 hover:to-indigo-500/10 rounded-xl p-4 sm:p-5 flex items-center justify-between cursor-pointer group transition-all shadow-sm hover:shadow-lg"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/30 transition-all shadow-sm border border-indigo-500/30 flex-shrink-0">
                    <Search size={20} strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-bold text-text-primary tracking-wide group-hover:text-indigo-300 transition-colors line-clamp-1">Find Existing Customer</h3>
                    <p className="text-sm sm:text-sm text-text-muted mt-1 font-medium line-clamp-1">Search history to auto-fill identity & medical info</p>
                  </div>
                </div>
                <div className="hidden sm:flex text-sm font-bold text-text-muted bg-surface-main/60 px-3 py-2 rounded-lg border border-border-subtle uppercase tracking-wide group-hover:border-indigo-500/50 flex-shrink-0">
                  Quick Lookup
                </div>
              </div>

              {/* Hot Lead Recovery Alert */}
              {logic.lastDecline && (
                <div className="w-full bg-gradient-to-br from-rose-500/15 to-rose-500/5 border border-rose-500/40 rounded-xl p-4 sm:p-5 text-left relative overflow-hidden shadow-sm animate-in slide-in-from-top duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
                  
                  <div className="flex items-start gap-3 sm:gap-4 relative z-10">
                    <div className="p-2.5 bg-rose-500/25 rounded-xl text-rose-400 border border-rose-500/40 animate-pulse mt-0.5 flex-shrink-0">
                      <AlertTriangle size={20} strokeWidth={2.5} />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                        <div className="flex-1">
                          <span className="inline-block bg-rose-500/30 text-rose-300 font-extrabold text-sm sm:text-sm tracking-wide px-2.5 py-1.5 rounded-md uppercase border border-rose-500/40 mb-2">
                            🔴 HOT RECOVERY LEAD
                          </span>
                          <h4 className="text-sm sm:text-sm font-bold text-text-primary tracking-wide mt-1.5 flex items-center gap-1.5 flex-wrap">
                            Prior Decline: <span className="text-rose-400 font-bold">{logic.lastDecline.declineReason || 'Unknown Bank Decline'}</span>
                          </h4>
                        </div>
                        
                        <button
                          onClick={() => {
                            logic.handleRestoreLastDecline();
                          }}
                          className="px-3 sm:px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm sm:text-sm rounded-xl shadow-lg hover:shadow-rose-600/40 cursor-pointer transition-all active:scale-95 whitespace-nowrap flex-shrink-0"
                        >
                          ⚡ Restore
                        </button>
                      </div>

                      <p className="text-sm text-text-muted mt-2 font-medium">
                        {new Date(logic.lastDecline.timestamp).toLocaleDateString()} • <span className="text-rose-400 font-bold">${Number(logic.lastDecline.amount).toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Undelivered Package Warning */}
              {logic.lastActiveDelivery && (
                <div className="w-full bg-gradient-to-br from-amber-500/15 to-amber-500/5 border border-amber-500/40 rounded-xl p-4 sm:p-5 text-left relative overflow-hidden shadow-sm animate-in slide-in-from-top duration-300 delay-100">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
                  
                  <div className="flex items-start gap-3 sm:gap-4 relative z-10">
                    <div className="p-2.5 bg-amber-500/25 rounded-xl text-status-warning border border-amber-500/40 mt-0.5 flex-shrink-0">
                      <AlertTriangle size={20} strokeWidth={2.5} />
                    </div>
                    <div className="flex-grow min-w-0">
                      <span className="inline-block bg-amber-500/30 text-status-warning font-extrabold text-sm sm:text-sm tracking-wide px-2.5 py-1.5 rounded-md uppercase border border-amber-500/40 mb-2">
                        ⚠️ UNDELIVERED TRANSACTION
                      </span>
                      <h4 className="text-sm sm:text-sm font-bold text-text-primary tracking-wide mt-1.5 flex items-center gap-1.5 flex-wrap">
                        Previous: <span className="text-status-warning font-bold">{logic.lastActiveDelivery.product}</span>
                      </h4>
                      <p className="text-sm text-text-muted mt-2 font-medium line-clamp-2">
                        Order submitted {new Date(logic.lastActiveDelivery.timestamp).toLocaleDateString()} - awaiting delivery
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Identity Section */}
              <div className="relative">
                <IdentitySection
                  formData={logic.formData}
                  handleIdentityChange={logic.handleIdentityChange}
                  handleAgeChange={logic.handleAgeChange}
                  handleDobChange={logic.handleDobChange}
                  useShippingForBilling={logic.useShippingForBilling}
                  setUseShippingForBilling={logic.setUseShippingForBilling}
                  onPasteParse={logic.handlePasteParse}
                />
              </div>

              {/* Medical Section */}
              <div className="relative">
                <MedicalSection
                  selectedConditions={logic.formData.medicalConditions || []}
                  toggleCondition={logic.toggleCondition}
                  activeMedicalConditions={logic.activeMedicalConditions}
                />
              </div>
            </div>

            {/* RIGHT COLUMN: Products & Payment Prep (5 columns on lg) */}
            <div className="md:col-span-1 lg:col-span-5 flex flex-col gap-4 lg:gap-4 h-fit">
              {/* Product Basket */}
              <div className="relative">
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
              </div>

              {/* Submit Panel - Improved Layout */}
              <Card variant="panel" className="p-5 sm:p-4 bg-gradient-to-br from-surface-main to-surface-alt/30 border-border-subtle shadow-lg rounded-xl relative overflow-hidden sticky top-4 lg:top-4">
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none rounded-xl"></div>

                {/* Cart Summary */}
                <div className="mb-5 relative z-10 w-full">
                  <div className="flex items-center gap-2 mb-3">
                    <ShoppingCart size={16} className="text-emerald-500 flex-shrink-0" />
                    <label className="text-sm sm:text-sm font-bold text-emerald-500 tracking-wide block uppercase">
                      Order Summary
                    </label>
                  </div>
                  {logic.cart.length > 0 ? (
                    <CartPreview 
                      cart={logic.cart} 
                      onRemove={(id) => logic.setCart(prev => prev.filter(c => c.id !== id))} 
                      calculatedTotal={logic.calculatedTotal} 
                    />
                  ) : (
                    <div className="p-4 text-center border border-dashed border-border-subtle rounded-xl bg-surface-alt/50 text-sm text-text-muted font-medium">
                      ⬆️ Add products above to get started
                    </div>
                  )}
                </div>

                {/* Amount Section */}
                <div className="mb-5 relative z-10 w-full pt-5 border-t border-border-subtle">
                  <label className="text-sm sm:text-sm font-bold text-text-muted tracking-wide mb-2 block">
                    Final Amount
                  </label>
                  
                  {/* Calculated Total */}
                  <div className="mb-3 p-3 sm:p-4 bg-indigo-500/10 border border-indigo-500/25 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-sm font-bold text-text-muted">Calculated:</span>
                      <span className="text-sm sm:text-base font-bold text-indigo-400">${logic.calculatedTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Manual Override */}
                  <div className="relative group mb-3">
                    <label className="text-sm sm:text-sm text-text-muted font-bold uppercase tracking-wide mb-2 block">Custom Amount (Optional)</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg text-status-success/70 pointer-events-none">$</div>
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
                        className="w-full bg-surface-alt/70 border border-border-subtle rounded-xl py-3 sm:py-4 pl-9 pr-4 sm:pr-5 text-lg sm:text-xl font-bold num-font text-right outline-none ring-offset-surface-main focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  {logic.manualAmountError && (
                    <p className="text-sm text-status-error font-bold mb-3">
                      ❌ {logic.manualAmountError}
                    </p>
                  )}
                  
                  {!logic.manualAmountError && parseFloat(logic.manualAmount) !== logic.calculatedTotal && logic.manualAmount !== '' && (
                    <div className="mb-3 p-3 bg-amber-500/15 border border-amber-500/30 rounded-lg">
                      <p className="text-sm text-amber-300 font-bold flex items-center gap-2">
                        <span>⚠️</span> Override differs from cart
                      </p>
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {logic.error && (
                  <div className="text-sm sm:text-sm text-status-error font-bold text-center animate-pulse flex items-center justify-center gap-2 bg-status-error/15 py-3 px-4 rounded-xl mb-4 border border-status-error/30 relative z-10">
                    <AlertTriangle size={16} strokeWidth={3} className="flex-shrink-0" /> {logic.error}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 sm:gap-3 relative z-10 w-full flex-col sm:flex-row">
                  <button
                    onClick={() => setIsDispositionOpen(true)}
                    className="flex-1 rounded-xl bg-surface-alt/60 border border-border-subtle text-sm sm:text-sm font-bold text-text-muted hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all py-2.5 sm:py-3 px-3 sm:px-4 flex items-center justify-center gap-1.5 flex-shrink-0 min-w-max"
                  >
                    <MessageSquare size={14} /> Unfinished
                  </button>
                  <button
                    onClick={() => logic.handleClear()}
                    className="flex-1 rounded-xl bg-surface-alt/60 border border-border-subtle text-sm sm:text-sm font-bold text-text-muted hover:text-status-error hover:border-status-error/50 hover:bg-status-error/10 transition-all py-2.5 sm:py-3 px-3 sm:px-4 flex items-center justify-center gap-1.5 flex-shrink-0 min-w-max"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleProceedToPayment}
                    className="flex-1 sm:flex-none rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm sm:text-sm font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all flex items-center justify-center gap-2 border border-emerald-500/30 py-2.5 sm:py-3 px-4 sm:px-5 active:scale-95"
                  >
                    <Check size={16} strokeWidth={3} className="flex-shrink-0" />
                    <span className="hidden sm:inline">Proceed to</span> Payment
                  </button>
                </div>
              </Card>
            </div>
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
      
      {/* Payment Modal - Improved Responsive */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/70  flex items-center justify-center z-[60] p-3 sm:p-4 overflow-y-auto">
          <div className="bg-surface-main w-full max-w-lg rounded-xl border border-border-subtle shadow-2xl flex flex-col max-h-[90vh] my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-4 border-b border-border-subtle flex-shrink-0">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight line-clamp-1">Payment Information</h2>
                <p className="text-sm sm:text-sm text-text-muted mt-1">Enter card details to process <span className="font-bold text-indigo-400">${Number(logic.manualAmount || logic.calculatedTotal).toFixed(2)}</span></p>
              </div>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-alt text-text-muted hover:text-text-primary hover:bg-surface-highlight transition-all flex-shrink-0"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="px-4 sm:px-4 py-5 sm:py-4 overflow-y-auto flex-1 custom-scrollbar space-y-6">
              <PaymentSection
                financials={logic.financials}
                handleFinancialChange={logic.handleFinancialChange}
                cardStatus={logic.cardStatus as any}
                showCvv={logic.showCvv}
                setShowCvv={logic.setShowCvv}
                bankOptions={TOP_US_BANKS}
                cardProviders={CARD_PROVIDERS}
              />

              {logic.error && (
                <div className="text-sm sm:text-sm text-status-error font-bold text-center flex items-center justify-center gap-2 bg-status-error/15 py-3 px-4 rounded-xl border border-status-error/30 animate-pulse">
                  <AlertTriangle size={16} strokeWidth={3} /> {logic.error}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-4 border-t border-border-subtle bg-surface-alt/30 flex-shrink-0">
              <button
                disabled={logic.loading}
                onClick={(e) => {
                  const valid = logic.handleValidation(e as any);
                  if (valid) {
                    setShowPaymentModal(false);
                    logic.setShowReview(true);
                  }
                }}
                className={`w-full rounded-xl bg-emerald-600 text-white text-sm sm:text-base font-bold shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 border border-emerald-500/30 py-3 sm:py-4 ${
                  logic.loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-500 active:scale-95'
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

      {/* Review Modal */}
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

      {/* Clear Confirmation */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50  flex items-center justify-center z-[60] p-4">
          <div className="bg-surface-main rounded-xl p-5 sm:p-4 max-w-sm shadow-xl border border-border-subtle animate-in fade-in zoom-in-95">
            <h3 className="text-base sm:text-lg font-bold text-text-primary mb-2">Clear All Data?</h3>
            <p className="text-sm sm:text-sm text-text-muted mb-6">
              All entered information will be lost. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-border-subtle rounded-lg hover:bg-surface-alt transition text-text-primary text-sm sm:text-sm font-bold"
              >
                Keep Data
              </button>
              <button
                onClick={() => {
                  logic.handleClear(true);
                  setShowClearConfirm(false);
                }}
                className="flex-1 px-4 py-2.5 bg-status-error hover:bg-status-error/90 text-white rounded-lg transition text-sm sm:text-sm font-bold shadow-md"
              >
                Clear Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Lookup Modal */}
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
        <div className="fixed inset-0 bg-black/70  flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-surface-main w-full max-w-lg rounded-xl border border-border-subtle shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 my-auto">
            {/* Success Header */}
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-4 sm:p-5 text-center relative overflow-hidden flex flex-col items-center justify-center">
              <div className="absolute inset-0 opacity-10 mix-blend-overlay"></div>
              
              <div className="w-16 sm:w-20 h-16 sm:h-20 bg-white/20  rounded-full flex items-center justify-center mb-4 shadow-sm animate-bounce relative z-10">
                <Check size={32} className="text-white" strokeWidth={3} />
              </div>
              
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight relative z-10">
                Order Submitted!
              </h2>
              <p className="text-emerald-100 font-medium text-sm sm:text-sm mt-2 relative z-10">
                Transaction processing initiated
              </p>
            </div>
            
            {/* Success Details */}
            <div className="p-4 sm:p-5 text-center bg-surface-main">
              {/* Amount Card */}
              <div className="bg-surface-alt/50 border border-border-subtle rounded-xl p-5 sm:p-4 mb-6">
                <p className="text-text-muted text-sm sm:text-sm font-bold uppercase tracking-wide mb-2">Total Transaction</p>
                <p className="text-xl sm:text-lg font-bold text-emerald-500 tracking-tighter mb-4">${Number(logic.manualAmount || logic.calculatedTotal).toFixed(2)}</p>
                
                <div className="h-px w-full bg-border-subtle my-5"></div>
                
                {/* Transaction Details */}
                <div className="text-left text-sm sm:text-sm text-text-secondary space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Customer:</span>
                    <span className="font-bold text-text-primary line-clamp-1">{logic.formData.fullName}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="font-medium">Products:</span>
                    <span className="font-bold text-text-primary text-right max-w-xs line-clamp-2">{logic.cart.map(c => c.product).join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Congratulations */}
              <div className="mb-8">
                <h3 className="text-lg sm:text-xl font-bold text-emerald-400">Excellent Work! 🎉</h3>
                <p className="text-text-secondary text-sm sm:text-sm mt-2 font-medium">You're on fire today. Keep the momentum going!</p>
              </div>

              {/* Continue Button */}
              <button
                onClick={() => {
                  logic.setShowSuccess(false);
                  logic.handleClear();
                  onSuccess();
                }}
                className="w-full h-12 sm:h-14 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-sm sm:text-base transition-all active:scale-95 shadow-lg shadow-emerald-600/30 border border-emerald-500/30"
              >
                Close & Next Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
