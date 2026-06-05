
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCRM } from '../../hooks/useCRM';
import { AlertTriangle, RefreshCw, ShieldCheck, Lock, MessageSquare, Send, Phone, Mail } from 'lucide-react';
import { Button, Card } from '../ui/Base';
import { ResizableFrame } from '../ui/ResizableFrame';
import { SalesFormData } from '../../types';
import { useEnrollment } from './enrollment/hooks/useEnrollment';
import { EnrollmentHeader } from './enrollment/EnrollmentHeader';
import { ValidationSummary } from './enrollment/ValidationSummary';
import { CallbackProtocol } from './enrollment/CallbackProtocol';
import { SubjectIntelligence } from './enrollment/SubjectIntelligence';
import { PackageConfiguration } from './enrollment/PackageConfiguration';
import { CheckoutModal } from './enrollment/CheckoutModal';
import { ReviewModal } from './enrollment/ReviewModal';

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

  const [commsMode, setCommsMode] = useState<'none' | 'call' | 'sms' | 'email'>('none');
  const [commsText, setCommsText] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showPaymentPanel, setShowPaymentPanel] = useState(false);

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
          content = `Message Sent: "${commsText.trim()}"`;
      } else if (commsMode === 'email') {
          if (!commsText.trim()) return;
          reason = 'Outbound Email';
          content = `Email Sent:\n\n${commsText.trim()}`;
      } else if (commsMode === 'call') {
          reason = 'Outbound Call';
          const m = Math.floor(callDuration / 60).toString().padStart(2, '0');
          const s = (callDuration % 60).toString().padStart(2, '0');
          content = `Call completed. Duration: ${m}:${s}`;
      }

      await addNote({
          agentId: currentUser.id,
          agentName: currentUser.name,
          content,
          type: 'note',
          priority: 'Low',
          phone: formData.phone,
          customerName: `${formData.firstName} ${formData.lastName}`.trim(),
          reason
      } as any);

      setCommsMode('none');
      setCommsText('');
  };

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
            handleIdentityChange({ target: { name: 'firstName', value: (lead.customerName || lead.customer || '').split(' ')[0] } } as any);
            handleIdentityChange({ target: { name: 'lastName', value: (lead.customerName || lead.customer || '').split(' ').slice(1).join(' ') } } as any);
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
  }, [handleIdentityChange, handleDobChange, setMode]);

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
    <div className="relative mx-auto rounded-3xl w-full h-[95vh] flex flex-col font-sans transition-all duration-500 overflow-hidden bg-surface-main text-text-primary shadow-xl border border-border-subtle animate-in zoom-in-95">
        <EnrollmentHeader 
            grandTotal={grandTotal}
            customerTime={customerTime}
            mode={mode}
            setMode={setMode}
            onCancel={onCancel}
        />

        {collision && (
            <div className={`px-8 py-4 flex items-center justify-between border-b border-border-subtle ${
                collision.type === 'sale' ? 'bg-status-error/10 text-status-error' : 
                collision.type === 'mine' ? 'bg-status-success/10 text-status-success' : 
                'bg-status-warning/10 text-status-warning'
            }`}>
                <div className="flex items-center gap-3">
                    <AlertTriangle size={20} />
                    <span className="text-sm font-bold tracking-wide">
                        {collision.type === 'sale' ? `SYSTEM WARNING: Customer SOLD by ${collision.agent}` : 
                         collision.type === 'mine' ? `REDUNDANCY ALERT: Customer already in YOUR pipeline` : 
                         `COMPETITION DETECTED: Agent ${collision.agent} has an active callback`}
                    </span>
                </div>
                <span className="text-xs font-semibold opacity-80">
                    Record Timestamp: {new Date(collision.date).toLocaleDateString()}
                </span>
            </div>
        )}
        
        {formData.phone && (
            <div className="px-8 py-3 bg-surface-alt border-b border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent-primary animate-pulse"></div>
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Live Collaboration Active</span>
                </div>
                <PresenceIndicator resourceId={`cust-${formData.phone.replace(/\D/g, '')}`} />
            </div>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 bg-surface-alt/50">
            <div className="w-full mx-auto space-y-6 pb-24">
                
                {/* Interactions Panel */}
                <section className="bg-surface-main border border-border-subtle rounded-2xl p-5 shadow-sm">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold tracking-wider text-text-muted uppercase">Communicate:</span>
                            <button 
                                onClick={() => setCommsMode(commsMode === 'call' ? 'none' : 'call')} 
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${commsMode === 'call' ? 'bg-accent-primary text-white' : 'bg-surface-alt hover:bg-border-subtle'}`}
                            >
                                <Phone size={16} /> Call
                            </button>
                            <button 
                                onClick={() => setCommsMode(commsMode === 'sms' ? 'none' : 'sms')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${commsMode === 'sms' ? 'bg-accent-primary text-white' : 'bg-surface-alt hover:bg-border-subtle'}`}
                            >
                                <MessageSquare size={16} /> Text
                            </button>
                            <button 
                                onClick={() => setCommsMode(commsMode === 'email' ? 'none' : 'email')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${commsMode === 'email' ? 'bg-accent-primary text-white' : 'bg-surface-alt hover:bg-border-subtle'}`}
                            >
                                <Mail size={16} /> Email
                            </button>
                        </div>
                    </div>

                    {commsMode === 'call' && (
                        <div className="mt-6 bg-surface-alt border border-border-subtle rounded-2xl p-6 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-accent-primary/10 flex items-center justify-center text-accent-primary animate-pulse">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-text-primary">Call In Progress with {formData.firstName} {formData.lastName}</p>
                                    <p className="text-sm font-medium text-text-muted">{formData.phone || 'No phone number'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className="text-2xl font-mono text-accent-primary tracking-wider font-semibold">
                                    {Math.floor(callDuration / 60).toString().padStart(2, '0')}:{(callDuration % 60).toString().padStart(2, '0')}
                                </span>
                                <button className="px-6 py-3 bg-status-error text-white font-bold rounded-xl flex items-center gap-2" onClick={handleSendComms}>
                                    <PhoneOff size={18} /> End Call
                                </button>
                            </div>
                        </div>
                    )}

                    {(commsMode === 'sms' || commsMode === 'email') && (
                        <div className="mt-6 flex flex-col sm:flex-row gap-4">
                            <textarea
                                value={commsText}
                                onChange={(e) => setCommsText(e.target.value)}
                                placeholder={`Type your ${commsMode === 'sms' ? 'text message' : 'email'} here...`}
                                className="flex-1 bg-surface-main border border-border-strong rounded-2xl p-4 text-[15px] focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all resize-none h-32"
                            />
                            <button 
                                className="bg-accent-primary hover:bg-accent-primary/90 disabled:opacity-50 text-white px-8 h-32 rounded-2xl text-sm font-bold tracking-wide flex flex-col items-center justify-center gap-2 transition-all"
                                onClick={handleSendComms}
                                disabled={!commsText.trim() || !formData.phone}
                            >
                                <Send size={24} />
                                <span>Send</span>
                            </button>
                        </div>
                    )}
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Left Column: Form Details */}
                    <div className="space-y-4">
                        {/* Profile/Identity */}
                        <section className="bg-surface-main rounded-xl p-5 border border-border-subtle shadow-sm h-max">
                            <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3 border-b border-border-subtle pb-2">Customer Details</h2>
                            <SubjectIntelligence 
                                formData={formData}
                                handleIdentityChange={handleIdentityChange}
                                handleDobChange={handleDobChange}
                                handleAgeChange={handleAgeChange}
                                useShippingForBilling={useShippingForBilling}
                                setUseShippingForBilling={setUseShippingForBilling}
                            />
                        </section>
                    </div>

                    {/* Middle Column: Order & Cart */}
                    <div className="space-y-4">
                        <section className="bg-surface-main rounded-xl p-5 border border-border-subtle shadow-sm h-max">
                             <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3 border-b border-border-subtle pb-2">Order Configuration</h2>
                             <PackageConfiguration 
                                cart={cart}
                                setCart={setCart}
                                productConfig={productConfig}
                                notes={notes}
                                setNotes={setNotes}
                            />
                        </section>
                    </div>
                </div>
            </div>
        </div>

        {/* Floating Checkout Button */}
        {cart.length > 0 && !showPaymentPanel && (
            <div className="absolute bottom-8 right-8 z-40 animate-in slide-in-from-bottom-8 fade-in duration-300">
                <button
                    onClick={() => setShowPaymentPanel(true)}
                    className="h-16 px-8 bg-indigo-500 hover:bg-indigo-600 text-white font-black text-sm uppercase tracking-widest rounded-full shadow-[0_10px_40px_-10px_rgba(99,102,241,0.8)] hover:shadow-[0_10px_50px_-10px_rgba(99,102,241,0.9)] hover:-translate-y-1 transition-all active:scale-[0.98] flex items-center justify-center gap-3 border border-indigo-400/50"
                >
                    Proceed to Log Sale <ShieldCheck size={20} />
                </button>
            </div>
        )}

        {error && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-status-error text-white px-6 py-4 rounded-xl flex items-center gap-3 shadow-float animate-in slide-in-from-bottom-4 z-[100]">
                <AlertTriangle size={20}/>
                <span className="font-semibold">{error}</span>
            </div>
        )}

        <CheckoutModal
            show={showPaymentPanel}
            onClose={() => setShowPaymentPanel(false)}
            onReview={() => {
                setShowPaymentPanel(false);
                setShowReviewModal(true);
            }}
            financials={financials}
            setFinancials={setFinancials}
            handleCardInput={handleCardInput}
            cardStatus={cardStatus}
            formData={formData}
            cart={cart}
        />

        <ReviewModal
            show={showReviewModal}
            onClose={() => setShowReviewModal(false)}
            onSubmit={() => {
                setShowReviewModal(false);
                handleSubmit();
            }}
            loading={loading}
            formData={formData}
            financials={financials}
            cart={cart}
            selectedConditions={formData.medicalConditions || []}
            grandTotal={grandTotal}
            useShippingForBilling={useShippingForBilling}
            customerTime={customerTime}
            notes={notes}
        />
    </div>
  );
}

