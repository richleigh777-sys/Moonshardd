import React, { useState } from 'react';
import { useEnrollmentLogic } from '../../hooks/useEnrollmentLogic';
import { IdentitySection } from '../components/forms/enrollment/v1/IdentitySection';
import { AddressSection } from '../components/forms/enrollment/v1/AddressSection';
import { PaymentSection } from '../components/forms/enrollment/v1/PaymentSection';
import { ProductBasket } from '../components/forms/enrollment/v1/ProductBasket';
import { HealthSection } from '../components/forms/enrollment/v1/HealthSection';
import { CustomerLookup } from '../components/forms/enrollment/v1/CustomerLookup';
import { ReviewModal } from '../components/forms/enrollment/v1/ReviewModal';
import { SuccessScreen } from '../components/forms/enrollment/v1/SuccessScreen';
import { AlertCircle, Zap, ShieldCheck } from 'lucide-react';

interface EnrollmentFormV3UnifiedProps {
  onSuccess?: () => void;
  initialData?: any;
}

export const EnrollmentFormV3Unified: React.FC<EnrollmentFormV3UnifiedProps> = ({
  onSuccess,
  initialData,
}) => {
  const logic = useEnrollmentLogic(onSuccess, initialData);
  const [step, setStep] = useState<'form' | 'review' | 'success'>('form');
  const [showLookup, setShowLookup] = useState(false);

  const errors: Record<string, string> = {};

  if (logic.formData.fullName) {
    const err = logic.validateField('fullName', logic.formData.fullName);
    if (err) errors.fullName = err;
  }

  if (logic.formData.phone) {
    const err = logic.validateField('phone', logic.formData.phone);
    if (err) errors.phone = err;
  }

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (logic.handleValidation(e)) {
      setStep('review');
      logic.setShowReview(true);
    }
  };

  const handleSubmit = async () => {
    await logic.handleFinalSubmit();
    if (logic.showSuccess) {
      setStep('success');
    }
  };

  if (logic.showSuccess || step === 'success') {
    return <SuccessScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
        
        {/* Header Block Minimalist */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Agent Sales Terminal</h1>
            <p className="text-slate-400 mt-1">Manual entry for un-processed offline orders.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg text-sm font-medium">
            <ShieldCheck size={16} /> Data is secured locally awaiting admin labels
          </div>
        </div>

        {logic.error && (
          <div className="mb-6 bg-red-900/30 border border-red-500/30 rounded-lg p-4 flex items-start gap-3 animate-in slide-in-from-top-4">
            <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-bold text-red-300 text-sm">Action Required</p>
              <p className="text-sm text-red-200/90 mt-0.5">{logic.error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleNext} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Main Form Area (Left Column) */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className={`transition-all duration-300 ${showLookup ? 'ring-2 ring-blue-500/50 rounded-xl' : ''}`}>
              {!showLookup ? (
                <button
                   type="button"
                  onClick={() => setShowLookup(true)}
                  className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-blue-400 font-semibold py-3.5 rounded-xl transition-colors shadow-sm"
                >
                  <Zap size={18} />
                  Find Existing Customer Profile
                </button>
              ) : (
                <div className="bg-slate-800 rounded-xl p-1 border border-blue-500/30 shadow-md">
                  <div className="p-2 border-b border-slate-700 flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-300 ml-2">Customer Lookup</span>
                    <button type="button" onClick={() => setShowLookup(false)} className="text-slate-400 hover:text-white px-3 py-1 rounded hover:bg-slate-700 text-sm">Close</button>
                  </div>
                  <CustomerLookup
                    paginator={logic.paginator}
                    currentPage={logic.currentPage}
                    paginatedCustomers={logic.paginatedCustomers}
                    searchQuery={logic.searchQuery}
                    onSearch={logic.searchCustomers}
                    onSelect={(customer: any) => {
                      logic.selectCustomer(customer);
                      setShowLookup(false);
                    }}
                    onNextPage={logic.nextPage}
                    onPreviousPage={logic.previousPage}
                  />
                </div>
              )}
            </div>

            <IdentitySection
              formData={logic.formData}
              onChange={logic.handleIdentityChange}
              errors={errors}
              displayPhone={logic.displayPhone}
            />

            <AddressSection
              formData={logic.formData}
              useShippingForBilling={logic.useShippingForBilling}
              onChange={logic.handleIdentityChange}
              onToggleBilling={(val) => logic.setUseShippingForBilling(val)}
            />

            <HealthSection
              conditions={logic.formData.medicalConditions || []}
              availableConditions={logic.activeMedicalConditions}
              onToggle={logic.toggleCondition}
            />

            <PaymentSection
              financials={logic.financials}
              onChange={logic.handleFinancialChange}
              cardStatus={logic.cardStatus}
              showCvv={logic.showCvv}
              onToggleCvv={(val) => logic.setShowCvv(val)}
              manualAmount={logic.manualAmount}
              onAmountChange={(val) => logic.setManualAmount(val)}
              notes={logic.notes}
              onNotesChange={(val) => logic.setNotes(val)}
            />

          </div>

          {/* Sidebar Area (Right Column) */}
          <div className="lg:col-span-4 space-y-6">
            <ProductBasket cart={logic.cart} total={logic.calculatedTotal} />
            
            {/* Sticky Action Footer purely for actions */}
            <div className="bg-slate-800/80 backdrop-blur-sm p-5 rounded-xl border border-slate-700 shadow-lg sticky top-[calc(100vh-140px)] z-10 flex flex-col gap-3">
               <button
                type="submit"
                disabled={logic.loading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] font-bold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {logic.loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : 'Review & Submit Order'}
              </button>
              
              <button
                type="button"
                onClick={logic.handleClear}
                className="w-full py-2.5 bg-slate-900/50 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold rounded-lg transition-colors text-sm"
              >
                Clear Form
              </button>
            </div>
          </div>
        </form>

        {logic.showReview && (
          <ReviewModal
            formData={logic.formData}
            financials={logic.financials}
            cart={logic.cart}
            manualAmount={logic.manualAmount}
            notes={logic.notes}
            onConfirm={handleSubmit}
            onCancel={() => {
              logic.setShowReview(false);
              setStep('form');
            }}
            loading={logic.loading}
          />
        )}
      </div>
    </div>
  );
};
