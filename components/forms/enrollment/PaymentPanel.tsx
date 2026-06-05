
import React, { useState, useEffect } from 'react';
import { Shield, Server, CreditCard, Lock, Calendar, Eye, EyeOff, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { TOP_US_BANKS, CARD_PROVIDERS } from '../../../constants';
import { formatExpiry } from '../../../views/utils/crmLogic';

interface PaymentPanelProps {
    financials: any;
    setFinancials: (data: any) => void;
    handleCardInput: (val: string) => void;
    cardStatus: 'neutral' | 'valid' | 'invalid';
    cardHolderName?: string;
}

// Simple BIN checker simulation
const detectBIN = (pan: string) => {
    const cleanNumber = pan.replace(/\D/g, '');
    let network = '';
    let bank = '';

    // Network
    if (cleanNumber.match(/^4/)) network = 'Visa';
    else if (cleanNumber.match(/^(5[1-5]|2[2-7])/)) network = 'Mastercard';
    else if (cleanNumber.match(/^3[47]/)) network = 'Amex';
    else if (cleanNumber.match(/^(60|64|65)/)) network = 'Discover';

    // Bank (simulated)
    if (cleanNumber.startsWith('4147')) bank = 'JPMorgan Chase';
    else if (cleanNumber.startsWith('4737')) bank = 'Bank of America';
    else if (cleanNumber.startsWith('4313')) bank = 'Wells Fargo';
    else if (cleanNumber.startsWith('5424')) bank = 'Citigroup';
    else if (cleanNumber.startsWith('5100')) bank = 'Capital One';
    else if (cleanNumber.startsWith('6011')) bank = 'Discover Bank';
    else if (cleanNumber.length >= 6) {
        // Fallback for length > 6
        bank = 'Other / Credit Union';
    }

    return { network, bank };
};

export const PaymentPanel: React.FC<PaymentPanelProps> = ({ 
    financials, setFinancials, handleCardInput, cardStatus, cardHolderName 
}) => {
    const [showCardNumber, setShowCardNumber] = useState(false);
    const [isEditingDetails, setIsEditingDetails] = useState(false);
    
    // Auto-detect BIN on card number change
    useEffect(() => {
        if (financials.cardNumber && financials.cardNumber.length >= 4) {
            const { network, bank } = detectBIN(financials.cardNumber);
            setFinancials((prev: any) => ({
                ...prev,
                ...(network && { cardType: network }),
                ...(bank && { bankName: bank })
            }));
        }
    }, [financials.cardNumber, setFinancials]);

    const handleFinancialChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFinancials((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleEnhancedCardInput = (val: string) => {
        handleCardInput(val);
    };

    return (
        <div className="space-y-6">
            
            {/* Payment Type Selection (Debit/Credit) */}
            <div className="flex gap-4 mb-4">
                <button
                    type="button"
                    onClick={() => setFinancials((prev: any) => ({...prev, fundingType: 'Credit'}))}
                    className={`flex-1 py-3 px-4 rounded-xl border font-bold text-sm transition-all focus:outline-none ${financials.fundingType === 'Credit' ? 'bg-accent-primary/10 border-accent-primary text-accent-primary' : 'bg-surface-main/60 border-border-subtle text-text-muted hover:border-text-primary'}`}
                >
                    Credit Card
                </button>
                <button
                    type="button"
                    onClick={() => setFinancials((prev: any) => ({...prev, fundingType: 'Debit'}))}
                    className={`flex-1 py-3 px-4 rounded-xl border font-bold text-sm transition-all focus:outline-none ${financials.fundingType === 'Debit' ? 'bg-accent-primary/10 border-accent-primary text-accent-primary' : 'bg-surface-main/60 border-border-subtle text-text-muted hover:border-text-primary'}`}
                >
                    Debit Card
                </button>
            </div>

            {/* Expander Toggle */}
            <button 
                type="button"
                onClick={() => setIsEditingDetails(!isEditingDetails)}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-surface-main border border-border-subtle hover:border-text-muted transition-colors font-semibold text-text-primary text-sm shadow-sm"
            >
                <span className="flex items-center gap-2">
                    <Lock size={16} className="text-status-success"/>
                    {financials.cardNumber ? 'Edit Encrypted Details' : 'Enter Card Details'}
                </span>
                {isEditingDetails ? <ChevronUp size={20} className="text-text-muted" /> : <ChevronDown size={20} className="text-text-muted" />}
            </button>

            {/* 1. Core Card Data (Hidden by default) */}
            {isEditingDetails && (
                <div className="space-y-4 animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-text-muted tracking-wide pl-1">Account Number</label>
                            <button 
                                type="button" 
                                onClick={() => setShowCardNumber(!showCardNumber)}
                                className="text-xs font-bold text-accent-primary flex items-center gap-1 transition-colors hover:text-accent-primary/80"
                            >
                                {showCardNumber ? <><EyeOff size={14} /> Hide</> : <><Eye size={14} /> Show</>}
                            </button>
                        </div>
                        <div className="relative group">
                            <input 
                                name="cardNumber"
                                autoComplete="cc-number"
                                value={financials.cardNumber}
                                onChange={(e) => handleEnhancedCardInput(e.target.value)}
                                type={showCardNumber ? "tel" : "password"}
                                inputMode="numeric"
                                placeholder="Card Number"
                                maxLength={19}
                                className={`w-full bg-surface-main border rounded-xl px-4 py-3 text-sm font-medium text-text-primary outline-none transition-all shadow-sm pl-12 focus:ring-1 focus:border-accent-primary/60 focus:ring-accent-primary/20 ${cardStatus === 'invalid' ? 'border-status-error focus:border-status-error focus:ring-status-error' : 'border-border-subtle'}`}
                            />
                            <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/60 pointer-events-none group-focus-within:text-accent-primary transition-colors"/>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-[700]  text-text-muted/80 tracking-[0.2em] pl-1 drop-shadow-sm">Valid Thru</label>
                            <div className="relative group">
                                <input 
                                    name="cardExpiry" 
                                    autoComplete="cc-exp"
                                    value={financials.cardExpiry} 
                                    onChange={(e) => setFinancials((p: any) => ({...p, cardExpiry: formatExpiry(e.target.value)}))} 
                                    type="tel"
                                    placeholder="MM/YY" 
                                    maxLength={5} 
                                    className="w-full bg-surface-main border border-border-subtle rounded-xl px-4 py-3 text-sm font-medium text-text-primary outline-none focus:border-accent-primary/60 focus:ring-1 focus:ring-accent-primary/20 transition-all shadow-sm pl-12"
                                />
                                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/60 pointer-events-none group-focus-within:text-accent-primary transition-colors"/>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-[700]  text-text-muted/80 tracking-[0.2em] pl-1 drop-shadow-sm">Sec Code</label>
                            <div className="relative group">
                                <input 
                                    name="cardCvv" 
                                    autoComplete="cc-csc"
                                    value={financials.cardCvv} 
                                    onChange={(e) => setFinancials((p: any) => ({...p, cardCvv: e.target.value}))} 
                                    type="password"
                                    placeholder="CVC" 
                                    maxLength={4}
                                    className="w-full bg-surface-main border border-border-subtle rounded-xl px-4 py-3 text-sm font-medium text-text-primary outline-none focus:border-accent-primary/60 focus:ring-1 focus:ring-accent-primary/20 transition-all shadow-sm pl-12"
                                />
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/60 pointer-events-none group-focus-within:text-accent-primary transition-colors"/>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Metadata Grid (Auto-detected but visible) */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-[700]  text-text-muted/80 tracking-[0.2em] pl-1 drop-shadow-sm">Banking Inst.</label>
                    <div className="relative group">
                        <select 
                            name="bankName" 
                            value={financials.bankName} 
                            onChange={handleFinancialChange}
                            className="w-full bg-surface-main border border-border-subtle rounded-2xl px-4 py-3 text-xs font-[700] text-text-primary  tracking-wider outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/20 transition-all appearance-none cursor-pointer shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                            disabled={!!financials.bankName && typeof financials.cardNumber === 'string' && financials.cardNumber.length >= 6}
                        >
                            <option value="">Detecting...</option>
                            <option value="Other / Credit Union">Other / Credit Union</option>
                            {TOP_US_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                            {financials.bankName && !TOP_US_BANKS.includes(financials.bankName) && financials.bankName !== 'Other / Credit Union' && (
                                <option value={financials.bankName}>{financials.bankName}</option>
                            )}
                        </select>
                        {financials.bankName && financials.cardNumber?.length >= 4 ? (
                            <CheckCircle2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-status-success pointer-events-none" />
                        ) : (
                            <Server size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"/>
                        )}
                    </div>
                </div>
                
                <div className="space-y-2">
                    <label className="text-[10px] font-[700]  text-text-muted/80 tracking-[0.2em] pl-1 drop-shadow-sm">Network</label>
                    <div className="relative group">
                        <select 
                            name="cardType" 
                            value={financials.cardType} 
                            onChange={handleFinancialChange}
                            className="w-full bg-surface-main border border-border-subtle rounded-2xl px-4 py-3 text-xs font-[700] text-text-primary  tracking-wider outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/20 transition-all appearance-none cursor-pointer shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                            disabled={!!financials.cardType && typeof financials.cardNumber === 'string' && financials.cardNumber.length >= 2}
                        >
                            <option value="">Detecting...</option>
                            {CARD_PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        {financials.cardType && financials.cardNumber?.length >= 2 ? (
                            <CheckCircle2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-status-success pointer-events-none" />
                        ) : (
                            <CreditCard size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"/>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. Security Badge */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 backdrop-blur-md relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 rounded-xl text-status-success shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <Shield size={18} className="drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                </div>
                <div>
                    <p className="text-[10px] font-[700]  text-status-success tracking-[0.2em]">256-Bit Encrypted</p>
                    <p className="text-[10px] text-text-muted mt-0.5 tracking-wide font-bold ">Data is tokenized upon entry.</p>
                </div>
            </div>
        </div>
    );
};
