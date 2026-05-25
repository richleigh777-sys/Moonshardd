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
  const logic = useEnrollmentLogic(onSuccess, initialData);
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [isDispositionOpen, setIsDispositionOpen] = useState(false);
  const [lookupQuery, setLookupQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  return (
    <div id="enrollment-form-container" className="w-full h-full animate-in fade-in duration-500 overflow-hidden flex flex-col bg-surface-main relative">
      {/* Header */}
      <EnrollmentHeader
        manualAmount={logic.manualAmount}
        customerTime={logic.customerTime}
        onClear={() => setShowClearConfirm(true)}
      />

      {/* Main Content */}
      <div className="flex-1 min-h-0 p-4 lg:p-6 overflow-y-auto custom-scrollbar bg-surface-alt/10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 pb-20 items-start">
          
          {/* LEFT COLUMN: Identity & Medical */}
          <div className="w-full lg:w-7/12 flex flex-col gap-6 relative order-2 lg:order-1">
            
            {/* Minimalist Progress Stepper */}
            <div className="sticky top-0 z-20 bg-surface-main/80 backdrop-blur-md rounded-xl p-3 border border-border-subtle shadow-sm mb-2 items-center justify-between">
               {/* Desktop Stepper */}
               <div className="hidden lg:flex items-center justify-between w-full">
                 <div className="flex items-center gap-2">
                   <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${logic.formData.fullName ? 'bg-indigo-500 text-white' : 'bg-surface-alt text-text-muted border border-border-subtle'}`}>1</div>
                   <span className={`text-[11px] font-bold tracking-widest ${logic.formData.fullName ? 'text-indigo-400' : 'text-text-muted'}`}>IDENTITY</span>
                 </div>
                 <div className="h-px bg-border-subtle flex-1 mx-4"></div>
                 <div className="flex items-center gap-2">
                   <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${logic.formData.medicalConditions?.length ? 'bg-indigo-500 text-white' : 'bg-surface-alt text-text-muted border border-border-subtle'}`}>2</div>
                   <span className={`text-[11px] font-bold tracking-widest ${logic.formData.medicalConditions?.length ? 'text-indigo-400' : 'text-text-muted'}`}>MEDICAL</span>
                 </div>
                 <div className="h-px bg-border-subtle flex-1 mx-4"></div>
                 <div className="flex items-center gap-2">
                   <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${logic.financials.cardNumber ? 'bg-indigo-500 text-white' : 'bg-surface-alt text-text-muted border border-border-subtle'}`}>3</div>
                   <span className={`text-[11px] font-bold tracking-widest ${logic.financials.cardNumber ? 'text-indigo-400' : 'text-text-muted'}`}>PAYMENT</span>
                 </div>
               </div>
               
               {/* Mobile Stepper */}
               <div className="lg:hidden flex items-center justify-between gap-1 w-full">
                  <div className={`flex-1 h-1.5 rounded-full ${logic.formData.fullName ? 'bg-indigo-500' : 'bg-border-subtle'}`}></div>
                  <div className={`flex-1 h-1.5 rounded-full ${logic.formData.medicalConditions?.length ? 'bg-indigo-500' : 'bg-border-subtle'}`}></div>
                  <div className={`flex-1 h-1.5 rounded-full ${logic.financials.cardNumber ? 'bg-indigo-500' : 'bg-border-subtle'}`}></div>
               </div>
            </div>

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
                    <p className="text-[11px] text-text-muted mt-0.5 font-medium">Search history to auto-fill identity & cards</p>
                  </div>
               </div>
               <div className="hidden sm:flex text-[10px] font-bold text-text-muted bg-surface-main px-3 py-1.5 rounded-lg border border-border-subtle uppercase tracking-widest group-hover:border-indigo-500/30 group-hover:text-indigo-400 transition-colors shadow-sm">
                 Quick Lookup
               </div>
            </div>

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

            {/* Payment */}
            <PaymentSection
              financials={logic.financials}
              handleFinancialChange={logic.handleFinancialChange}
              cardStatus={logic.cardStatus as any}
              showCvv={logic.showCvv}
              setShowCvv={logic.setShowCvv}
              bankOptions={TOP_US_BANKS}
              cardProviders={CARD_PROVIDERS}
            />
          </div>

          {/* RIGHT COLUMN: Products & Amount */}
          <div className="w-full lg:w-5/12 flex flex-col gap-6 lg:sticky lg:top-6 order-1 lg:order-2 h-fit">
            {/* Products */}
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

            {/* Amount & Submit */}
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
              <div className="flex gap-3 relative z-10 w-full flex-wrap sm:flex-nowrap">
                <button
                  onClick={() => setIsDispositionOpen(true)}
                  className="flex-1 sm:w-1/4 rounded-xl bg-surface-alt border border-border-subtle text-xs font-bold text-text-muted hover:text-indigo-500 hover:border-indigo-500/30 transition-all flex flex-col items-center justify-center p-2 min-h-[48px] gap-1"
                >
                  <MessageSquare size={14} /> Handle Unfinished
                </button>
                <div className="flex flex-col gap-2 flex-1 sm:w-1/4">
                    <button
                      onClick={() => logic.handleClear()}
                      className="flex-1 rounded-xl bg-surface-alt border border-border-subtle text-xs font-bold text-text-muted hover:text-status-error hover:border-status-error/30 transition-all flex items-center justify-center"
                    >
                      Reset Form
                    </button>
                    <button
                      onClick={onCancel}
                      className="flex-1 rounded-xl bg-surface-alt border border-border-subtle text-xs font-bold text-text-muted hover:text-text-primary hover:border-text-muted transition-all flex items-center justify-center"
                    >
                      Cancel
                    </button>
                </div>
                <button
                  disabled={logic.loading}
                  onClick={(e) => {
                    if (logic.handleValidation(e as any)) {
                      logic.setShowReview(true);
                    }
                  }}
                  className={`flex-[2] sm:w-1/2 min-w-[200px] rounded-xl bg-emerald-600 text-white text-base font-black shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 border border-emerald-500/20 active:scale-[0.98] ${
                    logic.loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-500'
                  }`}
                >
                  {logic.loading ? (
                    <>
                      <Loader size={20} className="animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <Check size={20} strokeWidth={3} /> Review & Submit
                    </>
                  )}
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in">
          <div className="bg-surface-main w-full max-w-md rounded-3xl border border-border-subtle shadow-2xl p-12 text-center flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-status-success/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_#10B981] animate-bounce">
              <Check size={48} className="text-status-success" strokeWidth={3} />
            </div>
            <h2 className="text-4xl font-bold text-text-primary tracking-tight mb-2">Order Logged</h2>
            <p className="text-text-muted font-medium mb-8 text-lg">Admin will process this order</p>
            <Button
              variant="primary"
              onClick={() => {
                logic.setShowSuccess(false);
                logic.handleClear();
                onSuccess();
              }}
              className="w-full h-12 text-sm font-bold"
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
