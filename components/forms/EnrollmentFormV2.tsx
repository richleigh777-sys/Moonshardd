
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCRM } from '../../hooks/useCRM';
import { AlertTriangle, RefreshCw, ShieldCheck, Lock, PhoneOff, UserMinus, UserX } from 'lucide-react';
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
import { sfx } from '../../lib/soundService';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
  isPreview?: boolean;
  customerData?: SalesFormData & { id?: string };
}

export default function EnrollmentFormV2({ onSuccess, onCancel, customerData }: Props) {
  const { currentUser } = useAuth();
  const { addNote, customers, updateCustomer, addCustomer } = useCRM();
  const [activeLeadId, setActiveLeadId] = useState<string | null>(customerData?.id || null);

  const { 
      mode, setMode, loading, error, collision, formData, handleIdentityChange, handleDobChange, handleAgeChange,
      cart, setCart, notes, setNotes,
      useShippingForBilling, setUseShippingForBilling,
      customerTime, grandTotal, productConfig, handleSubmit,
      financials, setFinancials, handleCardInput, cardStatus
  } = useEnrollment(onSuccess, customerData);

  // Track presence based on phone number (as customer resource)
  usePresence(formData.phone ? `cust-${formData.phone.replace(/\D/g, '')}` : '', 'customer', 'editing');

  // Handle external lead loading events (from Next Call or Dashboard)
  React.useEffect(() => {
    const handleLoadLead = (e: any) => {
        const lead = e.detail;
        if (lead) {
            if (lead.id) setActiveLeadId(lead.id);
            handleIdentityChange({ target: { name: 'fullName', value: lead.customerName || lead.customer || '' } } as any);
            handleIdentityChange({ target: { name: 'phone', value: lead.phone || '' } } as any);
            if (lead.email) handleIdentityChange({ target: { name: 'email', value: lead.email || '' } } as any);
            if (lead.shippingAddress || lead.address) handleIdentityChange({ target: { name: 'shippingAddress', value: (lead.shippingAddress || lead.address || '') } } as any);
            if (lead.billingAddress) handleIdentityChange({ target: { name: 'billingAddress', value: lead.billingAddress || '' } } as any);
            if (lead.dob) handleDobChange(lead.dob);
            setMode('order');
        }
    };
    window.addEventListener('LOAD_LEAD', handleLoadLead);
    return () => window.removeEventListener('LOAD_LEAD', handleLoadLead);
  }, [handleIdentityChange, setMode]);

  const handleDisposition = async (status: string) => {
      sfx.playClick();
      
      const phoneClean = formData.phone.replace(/\D/g, '');
      if (!phoneClean) {
          onCancel();
          return;
      }

      // Try mapping to an existing customer if activeLeadId is null
      let targetId = activeLeadId;
      if (!targetId) {
          const match = customers?.find(c => c.phone.replace(/\D/g, '') === phoneClean);
          if (match) targetId = match.id;
      }

      if (targetId) {
          await updateCustomer(targetId, {
              status,
              updatedAt: Date.now()
          });
      } else {
          await addCustomer({
              firstName: formData.fullName?.split(' ')[0] || 'Unknown',
              lastName: formData.fullName?.split(' ').slice(1).join(' ') || 'Lead',
              fullName: formData.fullName || 'Unknown Lead',
              phone: formData.phone,
              email: formData.email,
              address: formData.shippingAddress || '',
              status,
              normalizedPhone: formData.phone.replace(/\D/g, ''),
              normalizedEmail: formData.email.toLowerCase(),
              addressFingerprint: '',
              ltv: 0,
              orderCount: 0,
              lastOrderDate: 0,
              firstSource: 'Outbound',
              salesHistory: [],
              phones: [formData.phone],
              emails: [formData.email]
          });
      }

      // Also log disposition as a quick note for audit trail
      await addNote({
          customerName: formData.fullName || 'Unknown Lead',
          phone: formData.phone,
          content: `Disposition Applied: ${status}`,
          type: 'note',
          subtype: 'manual',
          agentId: currentUser?.id,
          agentName: currentUser?.name
      });
      
      onCancel(); // Move on to next lead
  };

  if (mode === 'callback') {
      return (
          <CallbackProtocol 
            setMode={setMode}
            addNote={addNote}
            onCancel={onCancel}
            currentUser={currentUser!}
            formData={formData}
            selectedConditions={[]}
          />
      );
  }

  return (
    <ResizableFrame 
        className="mx-auto rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 relative group border border-border-subtle bg-surface-alt text-text-primary"
        defaultHeight="90vh"
        defaultWidth="100%"
        direction="both"
    >
        <div className="w-full h-full flex flex-col relative z-10 bg-transparent">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-secondary/10 rounded-full blur-[100px] pointer-events-none -mr-40 -mt-40 z-0"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none -ml-40 -mb-40 z-0"></div>

            <div className="relative z-10">
                <EnrollmentHeader 
                    grandTotal={grandTotal}
                    customerTime={customerTime}
                    mode={mode}
                    setMode={setMode}
                    onCancel={onCancel}
                />
            </div>

            {collision && (
                <div className={`px-6 py-3 border-b flex items-center justify-between transition-all duration-500 animate-in slide-in-from-top-2 relative z-10 ${
                    collision.type === 'sale' ? 'bg-red-500/10 border-red-500/20 backdrop-blur-md' : 
                    collision.type === 'mine' ? 'bg-emerald-500/10 border-emerald-500/20 backdrop-blur-md' : 
                    'bg-amber-500/10 border-amber-500/20 backdrop-blur-md'
                }`}>
                    <div className="flex items-center gap-3">
                        <AlertTriangle size={18} className={
                            collision.type === 'sale' ? 'text-status-error drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 
                            collision.type === 'mine' ? 'text-status-success drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                            'text-status-warning drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                        } />
                        <span className="text-xs font-[700]  tracking-[0.2em] text-text-primary">
                            {collision.type === 'sale' ? `TERMINAL WARNING: Customer SOLD by ${collision.agent}` : 
                             collision.type === 'mine' ? `REDUNDANCY ALERT: Customer already in YOUR pipeline` : 
                             `COMPETITION DETECTED: Agent ${collision.agent} has an active callback`}
                        </span>
                    </div>
                    <span className="text-[10px] font-bold text-text-muted  tracking-widest bg-surface-main/50 px-2 py-1 rounded">
                        Record Timestamp: {new Date(collision.date).toLocaleDateString()}
                    </span>
                </div>
            )}
            
            {formData.phone && (
                <div className="px-6 py-2.5 bg-accent-secondary/10 border-b border-accent-secondary/20 flex items-center justify-between relative z-10 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)] animate-pulse"></div>
                        <span className="text-[10px] font-[700] text-accent-secondary  tracking-[0.2em]">Live Collaboration Active</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-surface-main/30 px-2 py-0.5 rounded-full border border-border-subtle">
                            <PresenceIndicator resourceId={`cust-${formData.phone.replace(/\D/g, '')}`} />
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-hidden relative z-10 flex flex-col backdrop-blur-3xl p-4 md:p-6 pb-28 xl:pb-6 bg-surface-main/20">
                {/* Quick Dispositions Action Bar */}
                <div className="mb-6 w-full relative z-10">
                    <div className="bg-surface-main/80 backdrop-blur-md border border-border-subtle rounded-2xl p-3 flex flex-wrap justify-center md:justify-start items-center gap-3">
                        <span className="text-[10px] font-[700]  tracking-widest text-text-muted mr-2">Dispo:</span>
                        <button onClick={() => handleDisposition('Disconnected')} className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-status-warning hover:bg-amber-500 hover:text-text-primary rounded-xl text-[10px] md:text-xs font-bold  tracking-widest transition-all flex items-center gap-2">
                            <PhoneOff size={14} /> Disconnected
                        </button>
                        <button onClick={() => handleDisposition('Not Interested')} className="px-4 py-2 bg-text-muted/10 border border-text-muted/20 text-text-muted hover:bg-text-muted hover:text-text-primary rounded-xl text-[10px] md:text-xs font-bold  tracking-widest transition-all flex items-center gap-2">
                            <UserMinus size={14} /> Not Interested
                        </button>
                        <button onClick={() => handleDisposition('DNC')} className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-status-error hover:bg-red-500 hover:text-text-primary rounded-xl text-[10px] md:text-xs font-bold  tracking-widest transition-all flex items-center gap-2">
                            <UserX size={14} /> DNC
                        </button>
                    </div>
                </div>

                {/* 3 Column Grid for Speed Entry */}
                <div className="flex-1 overflow-y-auto custom-scrollbar w-full relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 h-full pb-44 xl:pb-6">
                        
                        {/* Column 1: Client Identity & Conditions */}
                        <div className="flex flex-col gap-6">
                            <SubjectIntelligence 
                                formData={formData}
                                handleIdentityChange={handleIdentityChange}
                                handleDobChange={handleDobChange}
                                handleAgeChange={handleAgeChange}
                                useShippingForBilling={useShippingForBilling}
                                setUseShippingForBilling={setUseShippingForBilling}
                            />

                            <div className="bg-surface-main/60 border border-border-subtle rounded-3xl overflow-hidden shadow-panel p-4 flex flex-col relative">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
                                        <ShieldCheck size={16} />
                                    </div>
                                    <h3 className="text-xs font-[700] tracking-widest text-text-primary">Medical Eligibility</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {["Diabetes", "High Blood Pressure", "Heart Disease", "Cancer", "Asthma", "Allergies", "Arthritis", "Thyroid", "Cholesterol"].map(c => {
                                        const isSelected = formData.medicalConditions?.includes(c);
                                        return (
                                            <button
                                                key={c}
                                                onClick={() => {
                                                    const newConditions = isSelected 
                                                        ? (formData.medicalConditions || []).filter((item: string) => item !== c)
                                                        : [...(formData.medicalConditions || []), c];
                                                    // Pass pseudo-event to handleIdentityChange or handle it manually. Since handleIdentityChange expects an event, doing a direct update via handleIdentityChange won't work well contextually because it wants e.target.name/value. But wait, handleIdentityChange handles name/value.
                                                    handleIdentityChange({ target: { name: 'medicalConditions', value: newConditions } } as any);
                                                }}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${isSelected ? 'bg-rose-500/10 border-rose-500 text-rose-500 shadow-sm' : 'bg-surface-alt border-border-subtle text-text-muted hover:border-text-muted uppercase'}`}
                                            >
                                                {c}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Cart & Packages */}
                        <div className="flex flex-col gap-6">
                            <PackageConfiguration 
                                cart={cart}
                                setCart={setCart}
                                productConfig={productConfig}
                                notes={notes}
                                setNotes={setNotes}
                            />
                            
                            <div className="bg-surface-main/60 border border-border-subtle rounded-3xl overflow-hidden shadow-panel">
                                <FinancialVault
                                    financials={financials}
                                    setFinancials={setFinancials}
                                    handleCardInput={handleCardInput}
                                    cardStatus={cardStatus}
                                    fullName={formData.fullName}
                                />
                            </div>
                        </div>

                        {/* Column 3: Order Summary */}
                        <div className="flex flex-col gap-6">
                            <div className="w-full bg-surface-main/60 border border-border-subtle rounded-3xl overflow-hidden shadow-panel">
                                <div className="p-6 border-border-subtle">
                                    <ValidationSummary 
                                        formData={formData}
                                        cart={cart}
                                    />
                                    
                                    <div className="mt-6">
                                        <Button 
                                            onClick={handleSubmit} 
                                            disabled={loading} 
                                            variant="primary"
                                            className="w-full h-16 bg-gradient-to-r from-accent-primary to-indigo-500 hover:from-accent-primary/90 hover:to-indigo-500/90 text-surface-alt font-[700]  tracking-widest rounded-2xl shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.4)] transition-all duration-300 active:scale-[0.98] border border-border-subtle"
                                        >
                                            {loading ? (
                                                <div className="flex items-center justify-center gap-3 text-sm w-full"><RefreshCw size={18} className="animate-spin"/> Processing...</div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-3 text-sm w-full relative z-10">
                                                    <ShieldCheck size={20} strokeWidth={2.5} />
                                                    Submit Order
                                                </div>
                                            )}
                                        </Button>
                                        <div className="flex items-center justify-center gap-2 mt-4 opacity-60">
                                            <Lock size={12} className="text-text-muted" />
                                            <p className="text-[10px]  tracking-widest text-text-muted font-bold">Secure 256-bit SSL Encrypted</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {error && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-red-500/90 backdrop-blur text-text-primary px-4 py-3 rounded-xl flex items-center gap-3 shadow-xl border border-red-400/20 animate-in slide-in-from-bottom-4 z-50">
                    <AlertTriangle size={18}/>
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}
        </div>
    </ResizableFrame>
  );
}

