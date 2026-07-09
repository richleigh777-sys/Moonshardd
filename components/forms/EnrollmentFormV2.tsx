import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useEnrollment } from './enrollment/hooks/useEnrollment';
import { CallbackProtocol } from './enrollment/CallbackProtocol';
import { Stage1Profile } from './enrollment/wizard/Stage1Profile';
import { Stage2Products } from './enrollment/wizard/Stage2Products';
import { Stage3Checkout } from './enrollment/wizard/Stage3Checkout';
import { CheckCircle2, XCircle } from 'lucide-react';

import { useCRM } from '../../hooks/useCRM';

const StepIndicator = ({ step, current, label }: any) => {
    const isCompleted = step > current;
    const isActive = step === current;
    return (
        <div className={`flex items-center gap-3 ${isActive ? 'text-text-primary' : isCompleted ? 'text-accent-primary' : 'text-text-muted/60'} transition-colors`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-all ${isActive ? 'bg-accent-primary text-white ring-4 ring-accent-primary/20' : isCompleted ? 'bg-accent-primary/10 text-accent-primary' : 'bg-surface-alt text-text-muted border border-border-subtle'}`}>
                {isCompleted ? <CheckCircle2 size={16} /> : current}
            </div>
            <span className="text-sm font-bold tracking-wide">{label}</span>
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
        const compliments = lastOrder.status === 'Declined' ? [
            "Tough break, but you gave it your all!",
            "Dust it off, the next one is yours.",
            "Good effort! Let's get the next one.",
            "Can't win them all. Keep pushing!"
        ] : [
            "Outstanding performance! Another win secured.",
            "You're crushing it! Keep up the great momentum.",
            "Excellent work closing this one.",
            "Top tier effort! You're a true closer.",
            "Boom! Another one on the board.",
            "Fantastic execution. Way to seal the deal!"
        ];
        const randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
        
        return (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="absolute inset-0 z-50 flex items-center justify-center bg-surface-main/90 p-4 font-sans select-none  rounded-xl">
                 <div className={`bg-surface-alt border ${lastOrder.status === 'Declined' ? 'border-red-500/30' : 'border-emerald-500/30'} rounded-xl p-12 max-w-lg w-full text-center shadow-2xl space-y-6`}>
                     <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${lastOrder.status === 'Declined' ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
                         {lastOrder.status === 'Declined' ? (
                             <XCircle className="text-red-500" size={48} />
                         ) : (
                             <CheckCircle2 className="text-emerald-500" size={48} />
                         )}
                     </div>
                     {lastOrder.status === 'Declined' ? (
                         <h2 className="text-3xl font-bold text-status-error">Order Declined</h2>
                     ) : (
                         <h2 className="text-3xl font-bold text-status-success">Order Was Submitted</h2>
                     )}
                     <p className="text-text-muted text-lg">{lastOrder.status === 'Declined' ? 'Transaction processed but declined.' : 'Transaction submitted for processing.'}</p>
                     <div className="bg-surface-main rounded-xl p-6 font-mono text-sm space-y-3 border border-border-subtle text-left mb-6">
                         <div className="flex justify-between"><span className="text-text-muted">Order ID:</span> <span className="text-text-primary">{lastOrder?.id?.toUpperCase() || 'N/A'}</span></div>
                         <div className="flex justify-between"><span className="text-text-muted">Agent:</span> <span className="text-text-primary">{lastOrder?.agent || 'Unknown'}</span></div>
                         <div className="flex justify-between"><span className="text-text-muted">Total:</span> <span className="text-accent-primary">${Number(lastOrder.amount || 0).toFixed(2)}</span></div>
                         <div className="flex justify-between"><span className="text-text-muted">Status:</span> <span className={lastOrder.status === 'Declined' ? "text-status-error" : "text-status-success"}>{lastOrder.status}</span></div>
                     </div>
                     <div className="p-4 bg-accent-primary/10 rounded-xl border border-accent-primary/20 mb-8">
                         <p className="text-accent-primary font-bold">{randomCompliment}</p>
                     </div>
                     <button onClick={onSuccess} className="w-full py-4 bg-gradient-to-r from-amber-400 to-[#C4A470] text-black font-bold uppercase tracking-wide rounded-xl hover:shadow-sm transition-all">Return to Dashboard</button>
                 </div>
            </motion.div>
        );
    }

    return (
        <div className="flex flex-col flex-1 h-full min-h-0 bg-surface-main font-sans select-none rounded-xl border border-border-subtle relative isolate">
            <style>{`
              .custom-scrollbar::-webkit-scrollbar { width: 6px; }
              .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-border-subtle); border-radius: 10px; }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--color-border-strong); }
            `}</style>
            
            <header className="sticky top-0 z-[100] h-24 border-b border-border-subtle flex items-center justify-between px-12 shrink-0 bg-surface-main/90 backdrop-blur-xl">
                <div className="flex items-center gap-8">
                    <div className="text-text-primary font-bold text-2xl tracking-tight">Secure Enrollment</div>
                    <div className="h-8 w-[1px] bg-border-subtle mx-2"></div>
                    <div className="flex items-center gap-6">
                        <StepIndicator step={wizardStep} current={1} label="Profile" />
                        <div className="w-12 h-[2px] bg-surface-alt rounded-full" />
                        <StepIndicator step={wizardStep} current={2} label="Products" />
                        <div className="w-12 h-[2px] bg-surface-alt rounded-full" />
                        <StepIndicator step={wizardStep} current={3} label="Checkout" />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => { handleClear(); }} className="px-6 py-2.5 bg-surface-alt border border-border-subtle hover:bg-surface-highlight text-text-secondary hover:text-text-primary rounded-full font-bold transition-all text-sm shadow-sm" title="Clear or Reset Form Data">
                        Clear Form
                    </button>
                    <button onClick={onCancel} className="px-6 py-2.5 bg-text-primary text-surface-canvas hover:shadow-lg hover:-translate-y-0.5 rounded-full font-bold transition-all text-sm shadow-md">
                        Cancel & Return
                    </button>
                </div>
            </header>

            <div className="flex flex-col flex-1 items-center min-h-0 h-full overflow-hidden">
                
                <div className="w-full h-full relative isolate">
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
