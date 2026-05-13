
import React from 'react';
import { 
    ShieldCheck, User, MapPin, Globe, CreditCard, Shield, 
    Receipt, HeartPulse, RefreshCw, Fingerprint 
} from 'lucide-react';

interface ReviewModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: () => void;
    loading: boolean;
    formData: any;
    financials: any;
    cart: any[];
    selectedConditions: string[];
    grandTotal: number;
    useShippingForBilling: boolean;
    customerTime: string | null;
    notes: string;
}

// --- SUB-COMPONENTS FOR CLEANER RENDER ---

const ReviewSectionHeader = ({ icon: Icon, title, color }: { icon: any, title: string, color: string }) => (
    <h4 className={`text-xs font-black uppercase ${color} tracking-[0.2em] flex items-center gap-2 border-b border-white/5 pb-2 mb-4`}>
        <Icon size={14}/> {title}
    </h4>
);

const ReviewRow = ({ label, value, subValue }: { label: string, value: string, subValue?: string }) => (
    <div className="space-y-1">
        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-70">{label}</p>
        <p className="text-sm font-bold text-text-primary">{value}</p>
        {subValue && <p className="text-[10px] text-text-secondary">{subValue}</p>}
    </div>
);

export const ReviewModal: React.FC<ReviewModalProps> = ({ 
    show, onClose, onSubmit, loading, formData, financials, cart, selectedConditions, grandTotal, useShippingForBilling, customerTime, notes 
}) => {
    if (!show) return null;

    return (
        <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-surface-main/95 backdrop-blur-3xl w-full max-w-4xl max-h-[90vh] rounded-[3rem] border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col relative">
                
                {/* Glossy Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none z-0"></div>

                {/* Header */}
                <div className="p-8 border-b border-white/5 bg-surface-alt/20 flex items-center justify-between shrink-0 relative z-10">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500 border border-emerald-500/20 shadow-neon">
                            <ShieldCheck size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black uppercase tracking-tight text-text-primary italic drop-shadow-sm">Pre-Transmission Check</h3>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.4em] mt-1 flex items-center gap-2">
                                <Shield size={12} className="text-emerald-500"/> Verified Authorization Protocol
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex flex-col items-end mb-2">
                            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">AI Risk Assessment</p>
                            <div className="flex items-center gap-2 bg-surface-main/50 px-3 py-1 rounded-lg border border-white/5">
                                {grandTotal > 2500 ? (
                                    <>
                                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                                        <span className="text-xs font-black text-amber-500 tracking-widest">HIGH VALUE - AUDIT REQUIRED</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-xs font-black text-emerald-500 tracking-widest">LOW RISK (98%)</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Total Settlement</p>
                        <div className="px-4 py-1 bg-surface-main/50 rounded-xl border border-white/10 backdrop-blur-sm">
                            <p className="text-3xl font-black text-text-primary num-font tracking-tight">${grandTotal.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                {/* Content Matrix */}
                <div className="p-10 flex-1 overflow-y-auto custom-scrollbar relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        
                        {/* LEFT COLUMN: IDENTITY & LOGISTICS */}
                        <div className="space-y-8">
                            <div>
                                <ReviewSectionHeader icon={User} title="Identity Sector" color="text-accent-primary" />
                                <div className="grid grid-cols-2 gap-6 bg-surface-alt/10 p-5 rounded-3xl border border-white/5">
                                    <ReviewRow label="Client Name" value={formData.fullName} />
                                    <ReviewRow label="Phone Line" value={formData.phone} />
                                    <ReviewRow label="Email Uplink" value={formData.email || 'None Provided'} />
                                    <ReviewRow label="Temporal Detail" value={formData.dob || '---'} subValue={`Age: ${formData.age || '?'}`} />
                                </div>
                            </div>

                            <div>
                                <ReviewSectionHeader icon={MapPin} title="Logistics Sector" color="text-indigo-500" />
                                <div className="space-y-4 bg-surface-alt/10 p-5 rounded-3xl border border-white/5">
                                    <ReviewRow label="Primary Shipping Manifest" value={formData.shippingAddress} />
                                    {!useShippingForBilling && (
                                        <div className="pt-3 border-t border-white/5 border-dashed">
                                            <ReviewRow label="Alternate Billing Route" value={formData.billingAddress} />
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 pt-2 text-[10px] font-black uppercase text-text-muted tracking-widest bg-indigo-500/5 p-2 rounded-lg border border-indigo-500/10">
                                        <Globe size={12} className="text-indigo-400"/>
                                        Client Local Time: {customerTime || 'Unknown'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: PAYMENT & ORDER */}
                        <div className="space-y-8">
                            <div>
                                <ReviewSectionHeader icon={CreditCard} title="Financial Sector" color="text-emerald-500" />
                                <div className="grid grid-cols-2 gap-6 bg-emerald-500/5 p-5 rounded-3xl border border-emerald-500/10 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]">
                                    <ReviewRow label="Institution" value={financials.bankName} />
                                    <ReviewRow label="Network" value={financials.cardType} />
                                    
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-70">Masked Target</p>
                                        <div className="flex items-center gap-2">
                                            <Shield size={10} className="text-emerald-500" />
                                            <p className="text-sm font-mono font-bold text-text-primary tracking-widest">**** {financials.cardNumber.slice(-4)}</p>
                                        </div>
                                    </div>
                                    
                                    <ReviewRow label="Validity" value={`${financials.cardExpiry} | CVV: ***`} />
                                </div>
                            </div>

                            <div>
                                <ReviewSectionHeader icon={Receipt} title="Order Manifest" color="text-amber-500" />
                                <div className="bg-surface-alt/20 p-6 rounded-3xl border border-white/5 shadow-inner">
                                    <div className="space-y-3 mb-6">
                                        {cart.map((item, i) => (
                                            <div key={i} className="flex justify-between items-center group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-surface-main border border-white/10 flex items-center justify-center font-black text-[10px] text-text-muted shadow-sm">
                                                        {item.quantity.split(' ')[0]}
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-bold text-text-primary uppercase tracking-tight">{item.product}</span>
                                                        <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest opacity-70">{item.dosage}</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-mono font-black text-text-secondary">${item.unitPrice.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {selectedConditions.length > 0 && (
                                        <div className="mb-6 pt-4 border-t border-white/5 border-dashed">
                                            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1">
                                                <HeartPulse size={10} className="text-status-error"/> Clinical Tags
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {selectedConditions.map(c => <span key={c} className="text-[8px] font-black uppercase px-2 py-0.5 bg-surface-main border border-white/10 rounded text-text-secondary shadow-sm">{c}</span>)}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4 pt-4 border-t-2 border-white/5 flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Total Settlement</span>
                                        <span className="text-4xl font-black text-text-primary num-font tracking-tighter drop-shadow-sm">
                                            ${grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* NOTES BOX */}
                    <div className="mt-10 p-5 bg-surface-alt/10 border border-white/5 rounded-3xl italic">
                        <p className="text-[10px] font-black uppercase text-text-muted tracking-widest mb-1 opacity-70">Administrative Notes</p>
                        <p className="text-xs text-text-secondary leading-relaxed">{notes || 'No manual notes appended to record.'}</p>
                    </div>
                </div>

                {/* FOOTER ACTIONS */}
                <div className="p-8 border-t border-white/5 bg-surface-alt/20 flex gap-4 shrink-0 backdrop-blur-md relative z-10">
                    <button 
                        onClick={onClose} 
                        className="flex-1 h-16 rounded-2xl bg-surface-main/50 border border-white/10 text-[11px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-text-primary hover:bg-surface-main transition-all active:scale-95"
                    >
                        Abort / Re-Edit
                    </button>
                    <button 
                        onClick={onSubmit} 
                        disabled={loading} 
                        className="flex-[2] h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] border border-emerald-400/50 text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none"></div>
                        {loading ? (
                            <><RefreshCw size={24} className="animate-spin"/> TRANSMITTING PAYLOAD...</>
                        ) : (
                            <><Fingerprint size={28} strokeWidth={2.5}/> Commit Transaction</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
