import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useEnrollment } from './enrollment/hooks/useEnrollment';
import { CallbackProtocol } from './enrollment/CallbackProtocol';
import { Stage1Profile } from './enrollment/wizard/Stage1Profile';
import { Stage2Products } from './enrollment/wizard/Stage2Products';
import { Stage3Checkout } from './enrollment/wizard/Stage3Checkout';
import { CheckCircle2 } from 'lucide-react';

import { useCRM } from '../../hooks/useCRM';

const StepIndicator = ({ step, current, label }: any) => {
    const isCompleted = step > current;
    const isActive = step === current;
    return (
        <div className={`flex items-center gap-2 ${isActive ? 'text-text-primary' : isCompleted ? 'text-accent-primary' : 'text-text-muted/50'} transition-colors`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold border ${isActive ? 'bg-accent-primary text-black border-accent-primary' : isCompleted ? 'border-accent-primary' : 'border-[#A0A0A0]/50'}`}>
                {isCompleted ? <CheckCircle2 size={14} /> : current}
            </div>
            <span className="text-sm font-semibold tracking-wide uppercase">{label}</span>
        </div>
    );
};

export default function EnrollmentFormV2({ onSuccess, onCancel, prefillPhone }: any) {
    const { addNote, currentUser, customers } = useCRM();
    const initialData = React.useMemo(() => {
        if (!prefillPhone) return undefined;
        // Search the customers registry to find the matching pushed data from vicidial
        const normalizedTarget = prefillPhone.replace(/\D/g, '');
        const matched = customers?.find((c: any) => c.normalizedPhone === normalizedTarget || (c.phone && c.phone.replace(/\D/g, '') === normalizedTarget));
        
        if (matched) {
            return {
                ...matched,
                phone: matched.phone || prefillPhone
            };
        }
        return { phone: prefillPhone };
    }, [prefillPhone, customers]);
    
    const {
        mode, setMode,
        formData, setFormData, handleIdentityChange,
        cart, setCart, productConfig,
        financials, setFinancials, handleCardInput, cardStatus,
        handleDobChange, handleAgeChange,
        handleSubmit, handleClear,
        useShippingForBilling, setUseShippingForBilling,
        loading, error, customerNotes,
        lastOrder, wasAutoFilled
    } = useEnrollment(onSuccess, initialData);

    const [wizardStep, setWizardStep] = useState(1);

    const handleCheckoutSubmit = async () => {
        await handleSubmit();
    };

    if (mode === 'callback') {
        return (
            <CallbackProtocol 
                setMode={setMode}
                addNote={addNote}
                onCancel={onCancel}
                currentUser={currentUser!}
                formData={formData}
                selectedConditions={Array.isArray(formData.medicalConditions) ? formData.medicalConditions : []}
                handleIdentityChange={handleIdentityChange}
            />
        );
    }

    if (mode === 'approved' && lastOrder) {
        return (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="absolute inset-0 z-50 flex items-center justify-center bg-surface-main/90 p-4 font-sans select-none  rounded-xl">
                 <div className="bg-surface-alt border border-emerald-500/30 rounded-xl p-12 max-w-lg w-full text-center shadow-2xl space-y-6">
                     <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                         <CheckCircle2 className="text-emerald-500" size={48} />
                     </div>
                     <h2 className="text-3xl font-bold text-text-primary">Order Confirmed</h2>
                     <p className="text-text-muted text-lg">Transaction successfully processed.</p>
                     <div className="bg-surface-main rounded-xl p-6 font-mono text-sm space-y-3 border border-border-subtle text-left mb-8">
                         <div className="flex justify-between"><span className="text-text-muted">Order ID:</span> <span className="text-text-primary">{lastOrder?.id?.substring(0,8).toUpperCase()}</span></div>
                         <div className="flex justify-between"><span className="text-text-muted">Total:</span> <span className="text-accent-primary">${lastOrder.totalAmount?.toFixed(2)}</span></div>
                     </div>
                     <button onClick={onSuccess} className="w-full py-4 bg-gradient-to-r from-amber-400 to-[#C4A470] text-black font-bold uppercase tracking-wide rounded-xl hover:shadow-sm transition-all">Return to Dashboard</button>
                 </div>
            </motion.div>
        );
    }

    return (
        <div className="flex flex-col bg-surface-main font-sans select-none rounded-xl border border-border-subtle relative isolate">
            <style>{`
              .custom-scrollbar::-webkit-scrollbar { width: 6px; }
              .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-border-subtle); border-radius: 10px; }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--color-border-strong); }
            `}</style>
            
            <header className="sticky top-0 z-[100] h-20 border-b border-border-subtle flex items-center justify-between px-10 shrink-0 bg-surface-alt/90 ">
                <div className="flex items-center gap-6">
                    <div className="text-accent-primary font-bold text-xl tracking-wide uppercase">Secure Enrollment</div>
                    <div className="h-8 w-[1px] bg-border-subtle mx-2"></div>
                    <div className="flex items-center gap-4">
                        <StepIndicator step={wizardStep} current={1} label="Profile" />
                        <div className="w-8 h-[1px] bg-border-subtle" />
                        <StepIndicator step={wizardStep} current={2} label="Products" />
                        <div className="w-8 h-[1px] bg-border-subtle" />
                        <StepIndicator step={wizardStep} current={3} label="Checkout" />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => { handleClear(); }} className="px-5 py-2.5 border border-rose-500/50 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 hover:border-rose-500 rounded-xl font-bold tracking-wider transition-all uppercase text-sm shadow-sm" title="Clear or Reset Form Data">
                        Clear Form
                    </button>
                    <button onClick={onCancel} className="px-5 py-2.5 border border-accent-primary/50 bg-accent-primary/20 text-accent-primary hover:bg-accent-primary/30 hover:border-accent-primary rounded-xl font-bold tracking-wider transition-all uppercase text-sm shadow-sm">
                        Cancel & Return
                    </button>
                </div>
            </header>

            <div className="flex flex-col items-center">
                
                <div className="w-full shrink-0 min-h-[800px] relative isolate">
                    {error && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-surface-main border border-rose-500/50 text-rose-400 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3">
                            <span className="font-semibold text-sm">{error}</span>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {wizardStep === 1 && (
                            <motion.div key="1" initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}} className="h-full">
                                <Stage1Profile 
                                    formData={formData} 
                                    setFormData={setFormData}
                                    handleIdentityChange={handleIdentityChange} 
                                    handleDobChange={handleDobChange} 
                                    handleAgeChange={handleAgeChange}
                                    customerNotes={customerNotes}
                                    productConfig={productConfig}
                                    wasAutoFilled={wasAutoFilled}
                                    useShippingForBilling={useShippingForBilling}
                                    setUseShippingForBilling={setUseShippingForBilling}
                                    onNext={() => setWizardStep(2)} 
                                    onCallback={() => setMode('callback')}
                                />
                            </motion.div>
                        )}
                        {wizardStep === 2 && (
                            <motion.div key="2" initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}} className="h-full">
                                <Stage2Products 
                                    cart={cart} setCart={setCart} 
                                    productConfig={productConfig} 
                                    onNext={() => setWizardStep(3)} 
                                    onCallback={() => setMode('callback')} 
                                    onBack={() => setWizardStep(1)} 
                                />
                            </motion.div>
                        )}
                        {wizardStep === 3 && (
                            <motion.div key="3" initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}} className="h-full">
                                <Stage3Checkout 
                                    cart={cart} 
                                    formData={formData} 
                                    handleIdentityChange={handleIdentityChange}
                                    useShippingForBilling={useShippingForBilling} 
                                    setUseShippingForBilling={setUseShippingForBilling}
                                    financials={financials} setFinancials={setFinancials} 
                                    handleCardInput={handleCardInput} cardStatus={cardStatus}
                                    onSubmit={handleCheckoutSubmit} loading={loading}
                                    onBack={() => setWizardStep(2)} 
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
}
