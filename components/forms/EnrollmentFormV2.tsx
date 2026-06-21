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
        <div className={`flex items-center gap-2 ${isActive ? 'text-[#FDFDFD]' : isCompleted ? 'text-[#C4A470]' : 'text-[#A0A0A0]/50'} transition-colors`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold border ${isActive ? 'bg-[#C4A470] text-black border-[#C4A470]' : isCompleted ? 'border-[#C4A470]' : 'border-[#A0A0A0]/50'}`}>
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
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="absolute inset-0 z-50 flex items-center justify-center bg-[#0A0A0A]/90 p-4 font-sans select-none  rounded-xl">
                 <div className="bg-[#141414] border border-[#8BA888]/30 rounded-xl p-12 max-w-lg w-full text-center shadow-2xl space-y-6">
                     <div className="w-24 h-24 bg-[#8BA888]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                         <CheckCircle2 className="text-[#8BA888]" size={48} />
                     </div>
                     <h2 className="text-3xl font-bold text-[#FDFDFD]">Order Confirmed</h2>
                     <p className="text-[#A0A0A0] text-lg">Transaction successfully processed.</p>
                     <div className="bg-[#1A1A1A] rounded-xl p-6 font-mono text-sm space-y-3 border border-white/5 text-left mb-8">
                         <div className="flex justify-between"><span className="text-[#A0A0A0]">Order ID:</span> <span className="text-[#FDFDFD]">{lastOrder?.id?.substring(0,8).toUpperCase()}</span></div>
                         <div className="flex justify-between"><span className="text-[#A0A0A0]">Total:</span> <span className="text-[#C4A470]">${lastOrder.totalAmount?.toFixed(2)}</span></div>
                     </div>
                     <button onClick={onSuccess} className="w-full py-4 bg-gradient-to-r from-[#E6C280] to-[#C4A470] text-black font-bold uppercase tracking-wide rounded-xl hover:shadow-sm transition-all">Return to Dashboard</button>
                 </div>
            </motion.div>
        );
    }

    return (
        <div className="flex flex-col bg-[#0A0A0A] font-sans select-none rounded-xl border border-white/5 relative isolate">
            <style>{`
              .custom-datepicker-wrapper .react-datepicker-wrapper { width: 100%; }
              .react-datepicker { background-color: #141414 !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 12px !important; color: #FDFDFD !important; font-family: inherit !important; }
              .react-datepicker__header { background-color: #1A1A1A !important; border-bottom: 1px solid rgba(255,255,255,0.1) !important; border-top-left-radius: 12px !important; border-top-right-radius: 12px !important; padding-top:12px; }
              .react-datepicker__current-month { color: #FDFDFD !important; font-weight:600;}
              .react-datepicker__day-name { color: #A0A0A0 !important; }
              .react-datepicker__day { color: #FDFDFD !important; }
              .react-datepicker__day:hover { background-color: rgba(196, 164, 112, 0.2) !important; color: #C4A470 !important; }
              .react-datepicker__day--selected { background-color: #C4A470 !important; color: black !important; font-weight: bold; }
              .react-datepicker__triangle { display: none !important; }
              .custom-scrollbar::-webkit-scrollbar { width: 6px; }
              .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(196,164,112,0.5); }
            `}</style>
            
            <header className="sticky top-0 z-[100] h-20 border-b border-white/5 flex items-center justify-between px-10 shrink-0 bg-[#141414]/90 ">
                <div className="flex items-center gap-6">
                    <div className="text-[#C4A470] font-bold text-xl tracking-wide uppercase">Secure Enrollment</div>
                    <div className="h-8 w-[1px] bg-white/10 mx-2"></div>
                    <div className="flex items-center gap-4">
                        <StepIndicator step={wizardStep} current={1} label="Profile" />
                        <div className="w-8 h-[1px] bg-white/10" />
                        <StepIndicator step={wizardStep} current={2} label="Products" />
                        <div className="w-8 h-[1px] bg-white/10" />
                        <StepIndicator step={wizardStep} current={3} label="Checkout" />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => { handleClear(); }} className="px-5 py-2.5 border border-rose-500/50 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 hover:border-rose-500 rounded-xl font-bold tracking-wider transition-all uppercase text-sm shadow-sm" title="Clear or Reset Form Data">
                        Clear Form
                    </button>
                    <button onClick={onCancel} className="px-5 py-2.5 border border-[#C4A470]/50 bg-[#C4A470]/20 text-[#C4A470] hover:bg-[#C4A470]/30 hover:border-[#C4A470] rounded-xl font-bold tracking-wider transition-all uppercase text-sm shadow-sm">
                        Cancel & Return
                    </button>
                </div>
            </header>

            <div className="flex flex-col items-center">
                
                <div className="w-full shrink-0 min-h-[800px] relative isolate">
                    {error && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1A1A1A] border border-rose-500/50 text-rose-400 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3">
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
