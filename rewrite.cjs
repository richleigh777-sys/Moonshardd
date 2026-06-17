const fs = require('fs');

const content = `import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../hooks/useAuth';
import { useCRM } from '../../hooks/useCRM';
import { AlertTriangle, RefreshCw, ShieldCheck, Lock, MessageSquare, Send, Phone, PhoneOff, Package, User, Heart, Truck, Check, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Base';
import { SalesFormData } from '../../types';
import { useEnrollment } from './enrollment/hooks/useEnrollment';
import { EnrollmentHeader } from './enrollment/EnrollmentHeader';
import { CallbackProtocol } from './enrollment/CallbackProtocol';
import { BiographicalSector } from './enrollment/sectors/BiographicalSector';
import { MedicalSector } from './enrollment/sectors/MedicalSector';
import { LogisticsSector } from './enrollment/sectors/LogisticsSector';
import { PackageConfiguration } from './enrollment/PackageConfiguration';
import { CheckoutModal } from './enrollment/CheckoutModal';
import { ReviewModal } from './enrollment/ReviewModal';

import { usePresence } from '../../hooks/usePresence';
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

  const [commsMode, setCommsMode] = useState<'none' | 'call' | 'sms' | 'email'>('none');
  const [commsText, setCommsText] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showPaymentPanel, setShowPaymentPanel] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  React.useEffect(() => {
      let timer: any;
      if (commsMode === 'call') {
          timer = setInterval(() => setCallDuration(p => p + 1), 1000);
      } else {
          setCallDuration(0);
      }
      return () => clearInterval(timer);
  }, [commsMode]);

  const handleSendComms = async () => {
      if (!currentUser || !formData.phone) return;
      let content = '';
      let reason = '';
      if (commsMode === 'sms') {
          if (!commsText.trim()) return;
          reason = 'Outbound SMS';
          content = \\\`Message Sent: "\\\${commsText.trim()}"\\\`;
      } else if (commsMode === 'email') {
          if (!commsText.trim()) return;
          reason = 'Outbound Email';
          content = \\\`Email Sent:\\\n\\\n\\\${commsText.trim()}\\\`;
      } else if (commsMode === 'call') {
          reason = 'Outbound Call';
          const m = Math.floor(callDuration / 60).toString().padStart(2, '0');
          const s = (callDuration % 60).toString().padStart(2, '0');
          content = \\\`Call completed. Duration: \\\${m}:\\\${s}\\\`;
      }
      await addNote({
          agentId: currentUser.id,
          agentName: currentUser.name,
          content,
          type: 'note',
          priority: 'Low',
          phone: formData.phone,
          customerName: \\\`\\\${formData.firstName} \\\${formData.lastName}\\\`.trim(),
          reason
      } as any);
      setCommsMode('none');
      setCommsText('');
  };

  const { 
      mode, setMode, loading, error, collision, formData, handleIdentityChange, handleDobChange, handleAgeChange, autoFillFromCustomer,
      cart, setCart, notes, setNotes,
      useShippingForBilling, setUseShippingForBilling,
      customerTime, grandTotal, productConfig, handleSubmit, handleClear,
      financials, setFinancials, handleCardInput, cardStatus, lastOrder
  } = useEnrollment(onSuccess, customerData);

  usePresence(formData.phone ? \\\`cust-\\\${formData.phone.replace(/\\D/g, '')}\\\` : '', 'customer', 'editing');

  const handleCancelAttempt = () => {
      if (formData.phone || formData.firstName || formData.email) {
          setShowClearConfirm(true);
      } else {
          onCancel();
      }
  };

  const handleSaveProfileAndClear = async () => {
        const cleanPhone = formData.phone?.replace(/\\D/g, '');
        const cleanEmail = formData.email?.trim().toLowerCase();
        let existing = null;
        if (cleanPhone?.length >= 10) {
            existing = customers.find(c => c.phone?.replace(/\\D/g, '') === cleanPhone);
        }
        if (!existing && cleanEmail?.length > 4) {
            existing = customers.find(c => c.email?.trim().toLowerCase() === cleanEmail);
        }
        const profileData = {
            ...formData,
            name: \\\`\\\${formData.firstName} \\\${formData.lastName}\\\`.trim(),
            age: parseInt(formData.age) || undefined,
            agentId: currentUser?.id,
            agentName: currentUser?.name
        };
        try {
            if (existing) {
                await updateCustomer(existing.id, profileData);
            } else {
                await addCustomer(profileData as any);
            }
            sfx.playSuccess();
        } catch(e) {
            console.error("Failed to save profile", e);
        }
        setShowClearConfirm(false);
        onCancel();
  };

  React.useEffect(() => {
    const handleLoadLead = (e: any) => {
        const lead = e.detail;
        if (lead) {
            if (lead.id) setActiveLeadId(lead.id);
            autoFillFromCustomer({
                ...lead,
                firstName: lead.firstName || (lead.customerName || lead.customer || lead.name || '').split(' ')[0],
                lastName: lead.lastName || (lead.customerName || lead.customer || lead.name || '').split(' ').slice(1).join(' ')
            });
            setMode('order');
        }
    };
    window.addEventListener('LOAD_LEAD', handleLoadLead);
    return () => window.removeEventListener('LOAD_LEAD', handleLoadLead);
  }, [autoFillFromCustomer, setMode]);

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

  if (mode === 'approved' && lastOrder) {
      return (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-surface-main animate-in zoom-in-95 duration-500 rounded-3xl">
              <div className="max-w-md w-full text-center space-y-8">
                  <div className="w-28 h-28 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto relative shadow-[0_0_80px_rgba(16,185,129,0.15)]">
                     <ShieldCheck size={48} className="text-emerald-500" />
                  </div>
                  <div>
                      <h2 className="text-[28px] font-semibold text-text-primary tracking-tight">Order Confirmed</h2>
                      <p className="text-[15px] text-text-secondary mt-3">
                          Thank you. Order <strong className="text-text-primary px-1">#{lastOrder.id?.split('-')[0].toUpperCase()}</strong> has been successfully processed.
                      </p>
                  </div>
                  
                  <div className="bg-surface-alt border border-border-subtle p-8 rounded-[24px] text-left space-y-5">
                       <div className="flex justify-between items-center border-b border-border-subtle pb-4">
                          <span className="text-sm font-medium text-text-secondary">Amount Charged</span>
                          <span className="text-lg text-emerald-500 font-semibold">$\\\${lastOrder.amount?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-text-secondary">Customer</span>
                          <span className="text-sm font-medium text-text-primary">{lastOrder.customer}</span>
                      </div>
                  </div>

                  <div className="pt-6">
                      <button 
                          onClick={onSuccess}
                          className="w-full py-4 rounded-2xl bg-white hover:bg-gray-100 text-black font-semibold text-[15px] transition-all shadow-lg active:scale-[0.98] flex justify-center items-center gap-2"
                      >
                          <RefreshCw size={18} /> Start New Order
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  const easing = [0.16, 1, 0.3, 1] as any;

  return (
    <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: -10 }}
        transition={{ duration: 0.5, ease: easing }}
        className="relative mx-auto rounded-[32px] w-full h-full flex flex-col overflow-hidden bg-surface-main text-text-primary shadow-2xl border border-border-subtle isolate"
    >
        <div className="relative z-10 flex flex-col h-full bg-gradient-to-b from-surface-alt/50 to-surface-main">
            
            <div className="shrink-0 pt-8 px-10 pb-6 flex items-center justify-between border-b border-white/5">
                <div>
                   <h2 className="text-2xl font-semibold tracking-tight text-white">Secure Enrollment</h2>
                   <p className="text-text-secondary mt-1 text-sm">Complete the profile securely and fast.</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={handleCancelAttempt} className="px-6 py-2.5 rounded-xl bg-surface-alt hover:bg-surface-hover text-white transition-colors font-medium text-sm">Cancel Process</button>
                </div>
            </div>

            <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-10 min-h-0 overflow-y-auto custom-scrollbar relative z-0">
                <div className="w-full h-full flex flex-col gap-10 max-w-[900px] mx-auto pb-40">
                    
                    <div className="grid grid-cols-1 gap-10">
                        <section className="flex flex-col gap-5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                                    <User size={20} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-white">1. Personal Information</h4>
                                    <p className="text-sm text-text-secondary mt-0.5">Please provide your legal name and contact details.</p>
                                </div>
                            </div>
                            <div className="bg-surface-alt/50 rounded-[32px] border border-white/5 p-8 shadow-sm">
                                <BiographicalSector 
                                    formData={formData} 
                                    handleIdentityChange={handleIdentityChange} 
                                    handleDobChange={handleDobChange} 
                                    handleAgeChange={handleAgeChange} 
                                    autoFillFromCustomer={autoFillFromCustomer}
                                />
                            </div>
                        </section>

                        <section className="flex flex-col gap-5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                                    <Heart size={20} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-white">2. Health Details</h4>
                                    <p className="text-sm text-text-secondary mt-0.5">Required for customized care.</p>
                                </div>
                            </div>
                            <div className="bg-surface-alt/50 rounded-[32px] border border-white/5 p-8 shadow-sm">
                                <MedicalSector 
                                    formData={formData} 
                                    handleIdentityChange={handleIdentityChange} 
                                />
                            </div>
                        </section>

                        <section className="flex flex-col gap-5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                                    <Truck size={20} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-white">3. Shipping & Address</h4>
                                    <p className="text-sm text-text-secondary mt-0.5">Where should we send your order?</p>
                                </div>
                            </div>
                            <div className="bg-surface-alt/50 rounded-[32px] border border-white/5 p-8 shadow-sm">
                                <LogisticsSector 
                                    formData={formData} 
                                    handleIdentityChange={handleIdentityChange} 
                                    useShippingForBilling={useShippingForBilling} 
                                    setUseShippingForBilling={setUseShippingForBilling} 
                                />
                            </div>
                        </section>
                        
                        <section className="flex flex-col gap-5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                                    <Package size={20} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-white">4. Select Your Plan</h4>
                                    <p className="text-sm text-text-secondary mt-0.5">Choose the product formulation that fits your needs.</p>
                                </div>
                            </div>
                            <div className="bg-surface-alt/50 rounded-[32px] border border-white/5 p-8 shadow-sm">
                                <PackageConfiguration 
                                    cart={cart}
                                    setCart={setCart}
                                    productConfig={productConfig}
                                />
                            </div>
                        </section>
                    </div>
                </div>
            </div>
            
            {(cart.items.length > 0) && (
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-surface-main via-surface-main/90 to-transparent pointer-events-none flex justify-center z-40">
                    <button
                        onClick={() => setShowPaymentPanel(true)}
                        className="pointer-events-auto h-[64px] px-12 bg-white hover:bg-gray-100 text-black font-semibold text-[16px] rounded-full shadow-[0_10px_40px_rgba(255,255,255,0.15)] transition-all active:scale-[0.98] flex items-center justify-center gap-4 w-full max-w-md ring-4 ring-surface-main/30"
                    >
                        <span>Continue to Payment ($\\\${grandTotal.toLocaleString(undefined, {minimumFractionDigits:2})})</span>
                        <ChevronRight size={20} className="opacity-60" />
                    </button>
                </div>
            )}
            
            <AnimatePresence>
                {showPaymentPanel && (
                    <CheckoutModal 
                        isOpen={showPaymentPanel} 
                        onClose={() => setShowPaymentPanel(false)}
                        cart={cart}
                        formData={formData}
                        financials={financials}
                        setFinancials={setFinancials}
                        handleCardInput={handleCardInput}
                        cardStatus={cardStatus}
                        onSubmit={handleSubmit}
                        loading={loading}
                        error={error}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showClearConfirm && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div 
                            initial={{opacity: 0, scale: 0.95}} 
                            animate={{opacity: 1, scale: 1}} 
                            exit={{opacity: 0, scale: 0.95}}
                            className="bg-surface-main rounded-[32px] max-w-md w-full p-10 shadow-2xl border border-border-subtle"
                        >
                            <h3 className="text-2xl font-semibold text-white mb-3">Save progress?</h3>
                            <p className="text-text-secondary text-base mb-8 leading-relaxed">You have unsaved information. Would you like to save this profile before leaving?</p>
                            
                            <div className="flex flex-col gap-4">
                                <button onClick={handleSaveProfileAndClear} className="w-full py-4 text-base font-semibold rounded-2xl bg-white text-black hover:bg-gray-100 transition-colors shadow-lg">
                                    Save Progress
                                </button>
                                <button onClick={() => { setShowClearConfirm(false); onCancel(); }} className="w-full py-4 text-base font-medium rounded-2xl text-text-muted hover:text-white hover:bg-surface-hover transition-colors">
                                    Discard Unsaved changes
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    </motion.div>
  );
}`;

fs.writeFileSync('./components/forms/EnrollmentFormV2.tsx', content.replace(/\\\\`/g, '`'));
console.log('done');
