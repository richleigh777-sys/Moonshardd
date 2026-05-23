
import React, { useState, useEffect, useMemo } from 'react';
import { useCRM } from '../../hooks/useCRM';
import { useAuth } from '../../hooks/useAuth';
import { 
    ShoppingCart, DollarSign, 
    CreditCard, Clock, Eye, CheckCircle, 
    Search, History, AlertTriangle, Check, ArrowLeft, RefreshCw,
    Lock, Hash, ChevronDown, ShieldAlert
} from 'lucide-react';
import { normalizePhone } from '../../views/utils/dataSanitizer';
import { formatCardNumber, formatExpiry, formatUSAPhone, validateLuhn, getPhoneTime, validateExpiry, getRequiredCardLength } from '../../views/utils/crmLogic';
import { TOP_US_BANKS, CARD_PROVIDERS, MEDICAL_CONDITIONS } from '../../constants';
import { sfx } from '../../lib/soundService';
import { Button, Card } from '../../components/ui/Base';
import { Modal } from '../../components/ui/Modal';
import { CallbackForm } from './CallbackForm';
import { Sale, CartItem } from '../../types';
import { ClientProfileSection } from './enrollment/ClientProfileSection';
import { ReviewModal } from './enrollment/ReviewModal';
import { ProductPanel } from './enrollment/ProductPanel';


interface Props {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any;
}

const STORAGE_KEY = 'enrollment_draft_v2';

const getTimeFromState = (address: string) => {
    const stateMap: Record<string, number> = {
        'AL': -6, 'AK': -9, 'AZ': -7, 'AR': -6, 'CA': -8, 'CO': -7, 'CT': -5, 'DE': -5, 'FL': -5, 'GA': -5, 
        'HI': -10, 'ID': -7, 'IL': -6, 'IN': -5, 'IA': -6, 'KS': -6, 'KY': -5, 'LA': -6, 'ME': -5, 'MD': -5, 
        'MA': -5, 'MI': -5, 'MN': -6, 'MS': -6, 'MO': -6, 'MT': -7, 'NE': -6, 'NV': -8, 'NH': -5, 'NJ': -5, 
        'NM': -7, 'NY': -5, 'NC': -5, 'ND': -6, 'OH': -5, 'OK': -6, 'OR': -8, 'PA': -5, 'RI': -5, 'SC': -5, 
        'SD': -6, 'TN': -6, 'TX': -6, 'UT': -7, 'VT': -5, 'VA': -5, 'WA': -8, 'WV': -5, 'WI': -6, 'WY': -7
    };
    const match = address.match(/\b([A-Za-z]{2})\b/g);
    if (!match) return null;
    for (let i = match.length - 1; i >= 0; i--) {
        const code = match[i].toUpperCase();
        if (stateMap[code] !== undefined) {
            const offset = stateMap[code];
            const now = new Date();
            const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
            const targetTime = new Date(utc + (3600000 * offset));
            return targetTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    }
    return null;
};

const FormLabel = ({ icon: Icon, children }: { icon?: any, children?: React.ReactNode }) => (
    <label className="text-xs font-[700]  text-text-muted tracking-widest mb-1.5 flex items-center gap-1.5 ml-1">
        {Icon && <Icon size={16} className="text-accent-primary" />}
        {children}
    </label>
);

const FormInput = ({ icon: Icon, rightElement, status, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: any, rightElement?: React.ReactNode, status?: 'default' | 'valid' | 'invalid' }) => {
    let borderColor = 'border-border-subtle';
    if (status === 'valid') borderColor = 'border-status-success';
    if (status === 'invalid') borderColor = 'border-status-error';

    return (
        <div className="relative group">
            {Icon && (
                <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${status === 'valid' ? 'text-status-success' : status === 'invalid' ? 'text-status-error' : 'text-text-muted group-focus-within:text-accent-primary'}`}>
                    <Icon size={16} />
                </div>
            )}
            <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                {...props}
                className={`w-full bg-surface-alt/40 border rounded-xl ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2.5 text-xs font-bold text-text-primary outline-none focus:bg-surface-main focus:shadow-lg focus:shadow-accent-primary/10 transition-all placeholder:text-text-muted/30 ${borderColor} ${status === 'valid' ? 'focus:border-status-success' : status === 'invalid' ? 'focus:border-status-error' : 'focus:border-accent-primary'} ${className}`}
            />
            {rightElement && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {rightElement}
                </div>
            )}
        </div>
    );
};

const FormSelect = ({ children, icon: Icon, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { icon?: any }) => (
    <div className="relative group">
        {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-primary transition-colors pointer-events-none">
                <Icon size={16} />
            </div>
        )}
        <select 
            {...props}
            className={`w-full bg-surface-alt/40 border border-border-subtle rounded-xl ${Icon ? 'pl-9' : 'pl-3'} pr-8 py-2.5 text-xs font-bold text-text-primary outline-none focus:border-accent-primary focus:bg-surface-main focus:shadow-lg focus:shadow-accent-primary/10 transition-all appearance-none cursor-pointer ${props.className}`}
        >
            {children}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
            <ChevronDown size={16} />
        </div>
    </div>
);

export default function EnrollmentForm({ onSuccess, onCancel: _onCancel, initialData }: Props) {
  const { currentUser } = useAuth();
  const { addSale, addNote, productConfig, sales, systemConfig } = useCRM();
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'order' | 'callback'>('order');
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [lookupQuery, setLookupQuery] = useState('');
  const [showReview, setShowReview] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  // 1. IDENTITY & LOGISTICS
  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: '', dob: '', age: '',
    shippingAddress: '', billingAddress: '', height: '', weight: ''
  });
  const [useShippingForBilling, setUseShippingForBilling] = useState(true);
  const [customerTime, setCustomerTime] = useState<string | null>(null);

  // 2. FINANCIALS
  const [financials, setFinancials] = useState({
    bankName: '', cardType: '', cardNumber: '', cardExpiry: '', cardCvv: ''
  });
  const [showCvv, setShowCvv] = useState(false);
  const [cardStatus, setCardStatus] = useState<'neutral' | 'valid' | 'invalid'>('neutral');

  // 3. MEDICAL & NOTES
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const toggleCondition = (condition: string) => {
    setSelectedConditions(prev => prev.includes(condition) ? prev.filter(c => c !== condition) : [...prev, condition]);
  };
  const [notes, setNotes] = useState('');

  // 4. BASKET STATE
  const [cart, setCart] = useState<CartItem[]>([]);
  const [manualAmount, setManualAmount] = useState<string>('');
  
  const calculatedTotal = useMemo(() => {
      return cart.reduce((sum, item) => {
          let multiplier = 1;
          const qLower = item.quantity.toLowerCase();
          if (qLower.includes('30 day')) multiplier = 1;
          else if (qLower.includes('90 day')) multiplier = 3;
          else if (qLower.includes('180 day')) multiplier = 6;
          else if (qLower.includes('1 year') || qLower.includes('365 day')) multiplier = 12;
          else {
              const parsed = parseInt(item.quantity);
              if (!isNaN(parsed)) multiplier = parsed;
          }
          return sum + (item.unitPrice * multiplier);
      }, 0);
  }, [cart]);

  const uniqueCustomers = useMemo(() => {
    const map = new Map<string, Sale>();
    const sortedSales = [...sales].sort((a, b) => b.timestamp - a.timestamp);
    sortedSales.forEach(s => {
        if (!s.phone) return;
        if (!map.has(s.phone)) map.set(s.phone, s);
    });
    return Array.from(map.values());
  }, [sales]);

  const filteredCustomers = useMemo(() => {
      if (!lookupQuery) return uniqueCustomers.slice(0, 5);
      const q = lookupQuery.toLowerCase();
      return uniqueCustomers.filter(c => c.customer.toLowerCase().includes(q) || c.phone.includes(q)).slice(0, 10);
  }, [uniqueCustomers, lookupQuery]);

  const activeMedicalConditions = useMemo(() => {
      return (systemConfig.medicalConditions && systemConfig.medicalConditions.length > 0) 
        ? systemConfig.medicalConditions 
        : MEDICAL_CONDITIONS;
  }, [systemConfig.medicalConditions]);

  const selectCustomer = (sale: Sale) => {
    setFormData(prev => ({
        ...prev, fullName: sale.customer, phone: sale.phone, email: sale.email || '',
        shippingAddress: sale.address, billingAddress: sale.billingAddress || sale.address,
        dob: sale.dob || prev.dob, age: sale.age?.toString() || prev.age
    }));
    setFinancials(prev => ({
        ...prev, bankName: sale.bankName || '', cardType: sale.cardProvider || '',
        cardNumber: sale.cardNumber || '', cardExpiry: sale.cardExpiry || '', cardCvv: '' 
    }));
    if (sale.medicalConditions) setSelectedConditions(sale.medicalConditions);
    setIsLookupOpen(false);
    setLookupQuery('');
    sfx.playSubmit();
  };

  useEffect(() => {
      if (initialData) {
          setTimeout(() => {
              setFormData(prev => ({
                  ...prev, fullName: initialData.fullName || '', phone: initialData.phone || '',
                  email: initialData.email || '', shippingAddress: initialData.shippingAddress || '',
                  billingAddress: initialData.billingAddress || '', height: initialData.height || '', weight: initialData.weight || '', dob: initialData.dob || '',
              }));
              if (initialData.medicalConditions) setSelectedConditions(initialData.medicalConditions);
              if (initialData.bankName) setFinancials(prev => ({ ...prev, bankName: initialData.bankName }));
              if (initialData.cardProvider) setFinancials(prev => ({ ...prev, cardType: initialData.cardProvider }));
              if (initialData.product) {
                  const conf = productConfig.products?.find(p => p.name === initialData.product);
                  if (conf) {
                      setCart([{ 
                          id: crypto.randomUUID(), 
                          product: conf.name, 
                          quantity: initialData.quantity || '30 Day Supply', 
                          dosage: initialData.dosage || conf.dosages[0], 
                          unitPrice: conf.price 
                      }]);
                  }
              }
          }, 0);
      } else {
          const draft = localStorage.getItem(STORAGE_KEY);
          if (draft) {
              try {
                  const parsed = JSON.parse(draft);
                  setTimeout(() => {
                      setFormData(parsed.formData || {});
                      setFinancials(parsed.financials || {});
                      setSelectedConditions(parsed.selectedConditions || []);
                      setNotes(parsed.notes || '');
                      setCart(parsed.cart || []);
                      setManualAmount(parsed.manualAmount || '');
                      setUseShippingForBilling(parsed.useShippingForBilling ?? true);
                  }, 0);
              } catch (e) {
                  console.error('Failed to load draft', e);
              }
          } else if (productConfig.products?.length > 0) {
              const first = productConfig.products[0];
              setTimeout(() => {
                  setCart([{ 
                      id: crypto.randomUUID(),
                      product: first.name, 
                      quantity: '30 Day Supply', 
                      dosage: first.dosages[0] || 'Standard', 
                      unitPrice: first.price 
                  }]);
              }, 0);
          }
      }
  }, [initialData, productConfig.products]);

  useEffect(() => {
      if (showSuccess) return; 
      const draft = { formData, financials, selectedConditions, notes, cart, manualAmount, useShippingForBilling };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [formData, financials, selectedConditions, notes, cart, manualAmount, useShippingForBilling, showSuccess]);

  const handleClear = () => {
      if(confirm("Confirm reset of all form data?")) {
          localStorage.removeItem(STORAGE_KEY);
          setFormData({ fullName: '', phone: '', email: '', dob: '', age: '', shippingAddress: '', billingAddress: '', height: '', weight: '' });
          setFinancials({ bankName: '', cardType: '', cardNumber: '', cardExpiry: '', cardCvv: '' });
          setSelectedConditions([]);
          setNotes('');
          if (productConfig.products?.length > 0) {
              const first = productConfig.products[0];
              setCart([{ product: first.name, quantity: '30 Day Supply', dosage: first.dosages[0] || 'Standard', unitPrice: first.price }]);
          } else setCart([]);
          setManualAmount('');
          setUseShippingForBilling(true);
          setCardStatus('neutral');
          sfx.playDecline();
      }
  };

  useEffect(() => {
      const newVal = calculatedTotal.toFixed(2);
      setTimeout(() => setManualAmount(newVal), 0);
  }, [calculatedTotal]);

  const handleIdentityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let finalValue = value;
    if (name === 'phone') {
        finalValue = formatUSAPhone(value);
        const phoneTime = getPhoneTime(finalValue);
        if (phoneTime) setCustomerTime(phoneTime);
    }
    if (name === 'shippingAddress') {
        const addressTime = getTimeFromState(value);
        if (addressTime) setCustomerTime(addressTime);
    }
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const ageVal = e.target.value;
      setFormData(prev => {
          const newState = { ...prev, age: ageVal };
          if (ageVal && !isNaN(parseInt(ageVal))) {
              newState.dob = `${new Date().getFullYear() - parseInt(ageVal)}-01-01`;
          }
          return newState;
      });
  };

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const dobVal = e.target.value;
      setFormData(prev => {
          const newState = { ...prev, dob: dobVal };
          if (dobVal) {
              const birthDate = new Date(dobVal);
              const today = new Date();
              let age = today.getFullYear() - birthDate.getFullYear();
              const m = today.getMonth() - birthDate.getMonth();
              if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
              newState.age = age.toString();
          }
          return newState;
      });
  };

  const handleFinancialChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      let finalValue = value;
      if (name === 'cardNumber') {
          finalValue = formatCardNumber(value, financials.cardType);
          const clean = finalValue.replace(/\D/g, '');
          const reqLen = getRequiredCardLength(financials.cardType);
          setCardStatus(clean.length === reqLen ? (validateLuhn(finalValue) ? 'valid' : 'invalid') : (clean.length > 0 ? 'invalid' : 'neutral'));
      }
      if (name === 'cardExpiry') {
          finalValue = formatExpiry(value);
      }
      setFinancials(prev => {
          const newState = { ...prev, [name]: finalValue };
          if (name === 'cardType') {
              newState.cardNumber = formatCardNumber(newState.cardNumber, finalValue);
              const clean = newState.cardNumber.replace(/\D/g, '');
              setCardStatus(clean.length === getRequiredCardLength(finalValue) ? (validateLuhn(newState.cardNumber) ? 'valid' : 'invalid') : (clean.length > 0 ? 'invalid' : 'neutral'));
          }
          return newState;
      });
  };

  const handleValidation = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.fullName || !formData.phone || !financials.cardNumber || !financials.cardCvv) {
        setError('Missing Identity or Payment data.');
        sfx.playDecline();
        return;
    }
    if (financials.cardNumber.replace(/\D/g, '').length !== getRequiredCardLength(financials.cardType)) {
        setError(`Card length error for ${financials.cardType}.`);
        sfx.playDecline();
        return;
    }
    if (!validateLuhn(financials.cardNumber) || !validateExpiry(financials.cardExpiry)) {
        setError('Payment verification failed.');
        sfx.playDecline();
        return;
    }
    sfx.playClick();
    setShowReview(true);
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
        await addSale({
            agentId: currentUser?.id, agent: currentUser?.name, customer: formData.fullName,
            phone: normalizePhone(formData.phone), email: formData.email, dob: formData.dob, age: parseInt(formData.age) || undefined,
            height: formData.height, weight: formData.weight, address: formData.shippingAddress, billingAddress: useShippingForBilling ? formData.shippingAddress : formData.billingAddress,
            bankName: financials.bankName, cardProvider: financials.cardType,
            cardNumber: financials.cardNumber, cardExpiry: financials.cardExpiry, cardCvv: financials.cardCvv,
            amount: parseFloat(manualAmount) || 0, product: cart.map(c => c.product).join(' + '), quantity: cart.map(c => c.quantity).join(' + '),
            dosage: cart.map(c => c.dosage).join(' + '), rawCart: cart.map(c => ({ ...c, price: c.unitPrice.toString() })),
            medicalConditions: selectedConditions, callSummary: notes, status: 'Pending', pipelineStatus: 'New'
        });
        sfx.playSuccess();
        localStorage.removeItem(STORAGE_KEY);
        setShowReview(false);
        setShowSuccess(true);
    } catch (err) {
        console.error("Sale submission failed:", err);
        setError('Transmission failed.');
        sfx.playError();
        setLoading(false);
    }
  };

  const handlePasteParse = async () => {
    try {
        const text = await navigator.clipboard.readText();
        if (!text) return;

        // Simple heuristic parser
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        const newData: any = {};

        lines.forEach(line => {
            if (line.includes('@')) newData.email = line;
            else if (line.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/)) newData.phone = line;
            else if (line.match(/\d+\s+[A-Za-z]+/)) newData.shippingAddress = line; // Very basic address check
            else if (line.split(' ').length >= 2 && !newData.fullName) newData.fullName = line;
        });

        setFormData(prev => ({ ...prev, ...newData }));
        sfx.playSubmit();
    } catch (e) {
        console.error("Paste failed", e);
        sfx.playError();
    }
  };

  if (viewMode === 'callback') {
      return (
          <div className="h-full animate-in slide-in-from-right-4 duration-300">
              <div className="mb-4"><Button variant="secondary" onClick={() => setViewMode('order')} className="h-10 text-xs font-bold  tracking-wide"><ArrowLeft size={16} className="mr-2"/> Return to Order</Button></div>
              <CallbackForm onAddNote={addNote} currentUser={currentUser!} initialData={{ name: formData.fullName, phone: formData.phone, address: formData.shippingAddress, medicalConditions: selectedConditions }} />
          </div>
      );
  }

  if (showSuccess) {
      return (
          <div className="bg-surface-main w-full max-w-xl mx-auto rounded-3xl border border-border-subtle shadow-2xl p-12 text-center flex flex-col items-center justify-center h-[600px] animate-in zoom-in-95">
              <div className="w-24 h-24 bg-status-success/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_#10B981] animate-bounce"><Check size={48} className="text-status-success" strokeWidth={3} /></div>
              <h2 className="text-4xl font-bold text-text-primary tracking-tight mb-2">Order Logged</h2>
              <p className="text-text-muted font-medium mb-8 text-lg">Identity verified and transaction encrypted.</p>
              <div className="flex flex-col gap-3 w-full"><Button variant="primary" className="h-14 text-sm font-bold tracking-wide w-full shadow-lg" onClick={() => { setShowSuccess(false); handleClear(); onSuccess(); }}>Dashboard</Button><Button variant="secondary" className="h-12 w-full" onClick={() => { setShowSuccess(false); handleClear(); }}>New Order</Button></div>
          </div>
      );
  }

    return (
    <div className="w-full h-full animate-in fade-in duration-500 overflow-hidden flex flex-col">
      
      {/* HEADER COMMAND BAR */}
      <div className="bg-surface-main border-b border-border-subtle px-3 py-2 shadow-sm flex items-center justify-between shrink-0 h-12 relative z-20">
          <div className="flex items-center gap-2">
              <div className="p-1.5 bg-accent-primary/10 rounded-lg text-accent-primary border border-accent-primary/20 shadow-neon">
                  <ShoppingCart className="w-3.5 h-3.5" strokeWidth={2.5} />
              </div>
              <div>
                  <h2 className="text-xs font-bold text-text-primary tracking-tight">Enrollment Terminal</h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-semibold text-accent-primary tracking-wide bg-accent-primary/5 px-3 py-1.5 rounded border border-accent-primary/10 flex items-center gap-1">
                        <Lock size={16} /> Secure V4
                    </span>
                    {customerTime && <span className="text-xs font-mono text-text-muted bg-surface-alt px-3 py-1.5 rounded border border-border-subtle flex items-center gap-1 animate-in fade-in"><Clock size={16}/> {customerTime}</span>}
                  </div>
              </div>
          </div>

          <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-surface-alt/50 p-1 rounded-lg border border-border-subtle shadow-inner">
                  <div className="px-2 border-r border-border-subtle">
                      <p className="text-xs font-bold text-text-muted  tracking-wider">Active Total</p>
                      <p className="text-xs font-bold text-status-success num-font">${parseFloat(manualAmount || '0').toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                  </div>
                  <div className="flex gap-0.5">
                    <button onClick={() => setViewMode('order')} className={`px-3 py-1.5 rounded-md text-xs font-bold  tracking-wider transition-all ${(viewMode as string) === 'order' ? 'bg-accent-primary text-text-primary shadow-lg' : 'text-text-muted hover:text-text-primary'}`}>Order</button>
                    <button onClick={() => setViewMode('callback')} className={`px-3 py-1.5 rounded-md text-xs font-bold  tracking-wider transition-all ${(viewMode as string) === 'callback' ? 'bg-accent-primary text-text-primary shadow-lg' : 'text-text-muted hover:text-text-primary'}`}>Callback</button>
                  </div>
              </div>
              <Button onClick={() => setIsLookupOpen(true)} variant="secondary" aria-label="History Lookup" className="h-8 w-8 p-0 flex items-center justify-center border-border-subtle rounded-lg shadow-sm"><History size={16}/></Button>
          </div>
      </div>

      <div className="flex-1 min-h-0 p-2 relative z-10 overflow-hidden">
        <div className="grid grid-cols-12 gap-2 h-full">
            
            {/* LEFT COLUMN: IDENTITY & LOGISTICS (Span 7) */}
            <div className="col-span-12 lg:col-span-7 flex flex-col gap-2 h-full min-h-0">
                <ClientProfileSection 
                    formData={formData}
                    handleIdentityChange={handleIdentityChange}
                    handleAgeChange={handleAgeChange}
                    handleDobChange={handleDobChange}
                    useShippingForBilling={useShippingForBilling}
                    setUseShippingForBilling={setUseShippingForBilling}
                    customerTime={customerTime}
                    onPasteParse={handlePasteParse}
                />

                <Card variant="panel" className="shrink-0 p-2 border-border-subtle flex flex-col bg-surface-main relative">
                    <div className="flex items-center gap-1.5 border-b border-border-subtle pb-1.5 mb-1.5">
                        <div className="p-1 bg-rose-500/10 rounded-md text-rose-500"><ShieldAlert size={16} /></div>
                        <h3 className="text-xs font-[700] text-text-primary tracking-widest">Medical Eligibility</h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {MEDICAL_CONDITIONS.map(c => (
                            <button
                                key={c}
                                onClick={() => toggleCondition(c)}
                                className={`px-2 py-1 text-xs font-bold rounded-lg border transition-all ${selectedConditions.includes(c) ? 'bg-rose-500/10 border-rose-500 text-rose-500 shadow-sm' : 'bg-surface-alt border-border-subtle text-text-muted hover:border-text-muted uppercase'}`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </Card>

                <Card variant="panel" className="shrink-0 p-2 border-border-subtle shadow-lg flex flex-col bg-surface-main h-auto relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none opacity-50"></div>
                    <div className="flex items-center justify-between border-b border-border-subtle pb-1.5 mb-1.5 shrink-0 relative z-10">
                        <div className="flex items-center gap-1.5">
                            <div className="p-1 bg-emerald-500/10 rounded-md text-status-success"><Lock size={16} strokeWidth={2.5}/></div>
                            <h3 className="text-xs font-[700]  text-text-primary tracking-widest">Secure Payment Protocol</h3>
                        </div>
                        {cardStatus === 'valid' && <span className="text-sm font-bold text-status-success bg-emerald-500/10 px-3 py-1.5 rounded flex items-center gap-1"><CheckCircle size={16}/> VERIFIED</span>}
                    </div>
                    <div className="flex-1 flex flex-col justify-center gap-1.5 relative z-10">
                        <div className="grid grid-cols-2 gap-1.5">
                            <div>
                                <FormLabel>Bank Institution</FormLabel>
                                <FormSelect name="bankName" value={financials.bankName} onChange={handleFinancialChange} className="h-7 py-1 text-xs">
                                    <option value="">Select Bank...</option>
                                    {TOP_US_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                                    <option value="Other">Other</option>
                                </FormSelect>
                            </div>
                            <div>
                                <FormLabel>Card Network</FormLabel>
                                <FormSelect name="cardType" value={financials.cardType} onChange={handleFinancialChange} className="h-7 py-1 text-xs">
                                    <option value="">Select Network...</option>
                                    {CARD_PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
                                </FormSelect>
                            </div>
                        </div>
                        <div className="grid grid-cols-[2fr_1fr_1fr] gap-1.5">
                            <div className="relative">
                                <FormLabel>Card Number</FormLabel>
                                <FormInput 
                                    name="pan_field" 
                                    value={financials.cardNumber} 
                                    onChange={(e: any) => handleFinancialChange({ target: { name: 'cardNumber', value: e.target.value } } as any)} 
                                    className={`font-mono tracking-wider h-7 text-xs ${cardStatus === 'valid' ? 'text-status-success' : cardStatus === 'invalid' ? 'text-status-error' : ''}`} 
                                    placeholder="0000 0000 0000 0000" 
                                    maxLength={19} 
                                    icon={CreditCard}
                                    status={cardStatus === 'neutral' ? 'default' : cardStatus}
                                    rightElement={
                                        cardStatus === 'valid' ? <CheckCircle size={16} className="text-status-success" /> :
                                        cardStatus === 'invalid' ? <AlertTriangle size={16} className="text-status-error" /> : null
                                    }
                                />
                            </div>
                            <div>
                                <FormLabel>Expiry</FormLabel>
                                <FormInput name="exp_date" value={financials.cardExpiry} onChange={(e: any) => handleFinancialChange({ target: { name: 'cardExpiry', value: e.target.value } } as any)} className="text-center font-mono h-7 text-xs" placeholder="MM/YY" maxLength={5} />
                            </div>
                            <div className="relative">
                                <FormLabel>CVV</FormLabel>
                                <FormInput type={showCvv ? "text" : "password"} name="sec_code" value={financials.cardCvv} onChange={(e: any) => handleFinancialChange({ target: { name: 'cardCvv', value: e.target.value } } as any)} className="text-center font-mono h-7 text-xs" placeholder="***" maxLength={4} icon={Hash} />
                                <button type="button" onClick={() => setShowCvv(!showCvv)} className="absolute right-2 top-[20px] text-text-muted hover:text-text-primary opacity-50 hover:opacity-100"><Eye size={16}/></button>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* RIGHT COLUMN: PRODUCT BASKET (Span 5) */}
            <div className="col-span-12 lg:col-span-5 h-full min-h-0 flex flex-col gap-2">
                <ProductPanel 
                    cart={cart}
                    setCart={setCart}
                    productConfig={productConfig}
                    notes={notes}
                    setNotes={setNotes}
                />

                <Card variant="panel" className="p-2 bg-surface-main border-border-subtle shadow-lg shrink-0 relative z-20">
                    <div className="relative group mb-2">
                        <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-status-success group-focus-within:text-status-success transition-colors"/>
                        <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                            type="number" 
                            value={manualAmount} 
                            onChange={e => setManualAmount(e.target.value)} 
                            className="w-full bg-surface-alt/50 border-2 border-border-subtle rounded-xl py-2 pl-8 pr-3 text-lg font-[700] num-font text-right outline-none focus:border-status-success focus:bg-surface-main transition-all shadow-inner text-text-primary placeholder:text-text-muted/30"
                            placeholder="0.00"
                        />
                    </div>
                    {error && <div className="text-sm text-status-error font-bold text-center animate-pulse flex items-center justify-center gap-1 bg-status-error/10 py-1 rounded mb-1.5"><AlertTriangle size={16}/> {error}</div>}
                    <div className="grid grid-cols-3 gap-1.5">
                        <button onClick={handleClear} className="h-8 rounded-lg bg-surface-alt border border-border-subtle text-sm font-[700]  text-text-muted hover:text-status-error hover:border-status-error/30 transition-all flex items-center justify-center gap-1">
                            <RefreshCw size={16}/> Reset
                        </button>
                        <button onClick={handleValidation} className="col-span-2 h-8 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-text-primary text-xs font-[700]  shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]">
                            <Check size={16} strokeWidth={3}/> Authorize Transaction
                        </button>
                    </div>
                </Card>
            </div>
        </div>
      </div>

      <Modal isOpen={isLookupOpen} onClose={() => setIsLookupOpen(false)} title="Intelligence Lookup" size="lg">
          <div className="space-y-4">
              <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"/>
                  <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} autoFocus placeholder="Find Identity via Name or Phone..." className="w-full pl-10 pr-4 py-4 bg-surface-alt border border-border-subtle rounded-2xl text-sm font-bold outline-none focus:border-accent-primary shadow-inner" value={lookupQuery} onChange={(e) => setLookupQuery(e.target.value)}/>
              </div>
              <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-2">
                  {filteredCustomers.length === 0 ? <div className="text-center p-8 text-text-muted italic opacity-50">Sector empty...</div> : filteredCustomers.map(c => (
                      <div key={c.id} onClick={() => selectCustomer(c)} className="p-4 border border-border-subtle rounded-2xl hover:bg-surface-alt cursor-pointer transition-all flex justify-between items-center group">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-surface-main border border-border-subtle flex items-center justify-center font-[700] text-accent-primary">{c.customer.charAt(0)}</div>
                              <div><div className="font-bold text-sm text-text-primary group-hover:text-accent-primary">{c.customer}</div><div className="text-xs font-mono text-text-muted">{c.phone}</div></div>
                          </div>
                          <div className="text-right text-xs font-bold  text-text-muted">Last Order: {new Date(c.timestamp).toLocaleDateString()}</div>
                      </div>
                  ))}
              </div>
          </div>
      </Modal>

      <ReviewModal 
          show={showReview}
          onClose={() => setShowReview(false)}
          onSubmit={handleFinalSubmit}
          loading={loading}
          formData={formData}
          financials={financials}
          cart={cart}
          selectedConditions={selectedConditions}
          grandTotal={parseFloat(manualAmount)}
          useShippingForBilling={useShippingForBilling}
          customerTime={customerTime}
          notes={notes}
      />
    </div>
  );
}
