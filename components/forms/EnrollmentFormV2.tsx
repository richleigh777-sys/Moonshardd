
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCRM } from '../../hooks/useCRM';
import { AlertTriangle, RefreshCw, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Base';
import { ResizableFrame } from '../ui/ResizableFrame';
import { SalesFormData } from '../../types';
import { useEnrollment } from './enrollment/hooks/useEnrollment';
import { EnrollmentHeader } from './enrollment/EnrollmentHeader';
import { ValidationSummary } from './enrollment/ValidationSummary';
import { CallbackProtocol } from './enrollment/CallbackProtocol';
import { SubjectIntelligence } from './enrollment/SubjectIntelligence';
import { PackageConfiguration } from './enrollment/PackageConfiguration';
import { FinancialVault } from './enrollment/FinancialVault';

import { usePresence } from '../../hooks/usePresence';
import { PresenceIndicator } from '../ui/PresenceIndicator';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
  isPreview?: boolean;
  customerData?: SalesFormData;
}

export default function EnrollmentFormV2({ onSuccess, onCancel, customerData }: Props) {
  const { currentUser } = useAuth();
  const { addNote } = useCRM();

  const { 
      mode, setMode, loading, error, collision, formData, handleIdentityChange, handleDobChange, handleAgeChange,
      financials, setFinancials, handleCardInput, cardStatus, cart, setCart, notes, setNotes,
      selectedConditions, setSelectedConditions, useShippingForBilling, setUseShippingForBilling,
      customerTime, grandTotal, productConfig, handleSubmit, activeConditions
  } = useEnrollment(onSuccess, customerData);

  // Track presence based on phone number (as customer resource)
  usePresence(formData.phone ? `cust-${formData.phone.replace(/\D/g, '')}` : '', 'customer', 'editing');

  // Handle external lead loading events (from Next Call or Dashboard)
  React.useEffect(() => {
    const handleLoadLead = (e: any) => {
        const lead = e.detail;
        if (lead) {
            handleIdentityChange({ target: { name: 'fullName', value: lead.customerName || '' } } as any);
            handleIdentityChange({ target: { name: 'phone', value: lead.phone || '' } } as any);
            if (lead.medicalConditions) setSelectedConditions(lead.medicalConditions);
            setMode('order');
        }
    };
    window.addEventListener('LOAD_LEAD', handleLoadLead);
    return () => window.removeEventListener('LOAD_LEAD', handleLoadLead);
  }, [handleIdentityChange, setSelectedConditions, setMode]);

  if (mode === 'callback') {
      return (
          <CallbackProtocol 
            setMode={setMode}
            addNote={addNote}
            onCancel={onCancel}
            currentUser={currentUser!}
            formData={formData}
            selectedConditions={selectedConditions}
          />
      );
  }

  return (
    <ResizableFrame 
        className="mx-auto rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 relative group border border-white/5 bg-[#09090b] text-white"
        defaultHeight="90vh"
        defaultWidth="100%"
        direction="both"
    >
        <div className="w-full h-full flex flex-col relative z-10 bg-[#09090b]">
            <EnrollmentHeader 
                grandTotal={grandTotal}
                customerTime={customerTime}
                mode={mode}
                setMode={setMode}
                onCancel={onCancel}
            />

            {collision && (
                <div className={`px-6 py-2 border-b flex items-center justify-between transition-all duration-500 animate-in slide-in-from-top-2 ${
                    collision.type === 'sale' ? 'bg-red-500/10 border-red-500/20' : 
                    collision.type === 'mine' ? 'bg-emerald-500/10 border-emerald-500/20' : 
                    'bg-amber-500/10 border-amber-500/20'
                }`}>
                    <div className="flex items-center gap-3">
                        <AlertTriangle size={14} className={
                            collision.type === 'sale' ? 'text-red-500' : 
                            collision.type === 'mine' ? 'text-emerald-500' : 
                            'text-amber-500'
                        } />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/90">
                            {collision.type === 'sale' ? `TERMINAL WARNING: Customer SOLD by ${collision.agent}` : 
                             collision.type === 'mine' ? `REDUNDANCY ALERT: Customer already in YOUR pipeline` : 
                             `COMPETITION DETECTED: Agent ${collision.agent} has an active callback`}
                        </span>
                    </div>
                    <span className="text-[9px] font-bold text-white/40 uppercase">
                        Record Timestamp: {new Date(collision.date).toLocaleDateString()}
                    </span>
                </div>
            )}
            
            {formData.phone && (
                <div className="px-6 py-2 bg-indigo-500/5 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Live Collaboration Active</span>
                    </div>
                    <PresenceIndicator resourceId={`cust-${formData.phone.replace(/\D/g, '')}`} />
                </div>
            )}

            <div className="flex-1 overflow-hidden relative z-10 flex flex-col xl:flex-row divide-y xl:divide-y-0 xl:divide-x divide-white/5">
                {/* LEFT COLUMN: Data Entry (Scrollable) */}
                <div className="flex-1 flex flex-col xl:overflow-y-auto custom-scrollbar bg-[#09090b]">
                    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto w-full pb-32">
                        <SubjectIntelligence 
                            formData={formData}
                            handleIdentityChange={handleIdentityChange}
                            handleDobChange={handleDobChange}
                            handleAgeChange={handleAgeChange}
                            useShippingForBilling={useShippingForBilling}
                            setUseShippingForBilling={setUseShippingForBilling}
                            selectedConditions={selectedConditions}
                            setSelectedConditions={setSelectedConditions}
                            activeConditions={activeConditions}
                        />

                        <PackageConfiguration 
                            cart={cart}
                            setCart={setCart}
                            productConfig={productConfig}
                            notes={notes}
                            setNotes={setNotes}
                        />
                    </div>
                </div>

                {/* RIGHT COLUMN: Command Center (Sticky) */}
                <div className="xl:w-[400px] shrink-0 flex flex-col bg-[#121214] text-white z-20 border-l border-white/5 h-full">
                    <div className="p-6 border-b border-white/5 bg-[#121214]">
                        <ValidationSummary 
                            formData={formData}
                            financials={financials}
                            cart={cart}
                            cardStatus={cardStatus}
                        />
                    </div>

                    <FinancialVault 
                        financials={financials}
                        setFinancials={setFinancials}
                        handleCardInput={handleCardInput}
                        cardStatus={cardStatus}
                        fullName={formData.fullName}
                    />

                    <div className="p-6 border-t border-white/5 bg-[#121214] mt-auto sticky bottom-0 z-30">
                        <Button 
                            onClick={handleSubmit} 
                            disabled={loading} 
                            variant="primary"
                            className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-200 active:scale-[0.98]"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2 text-sm"><RefreshCw size={16} className="animate-spin"/> Processing...</div>
                            ) : (
                                <div className="flex items-center gap-2 text-sm relative z-10">
                                    <ShieldCheck size={18} strokeWidth={2.5} />
                                    Submit Order
                                </div>
                            )}
                        </Button>
                        <p className="text-[10px] text-center text-zinc-500 mt-3 font-medium">Secure 256-bit SSL Encrypted Transaction</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-red-500/90 backdrop-blur text-white px-4 py-3 rounded-xl flex items-center gap-3 shadow-xl border border-red-400/20 animate-in slide-in-from-bottom-4 z-50">
                    <AlertTriangle size={18}/>
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}
        </div>
    </ResizableFrame>
  );
}

