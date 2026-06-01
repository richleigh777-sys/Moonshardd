import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useCRM } from './useCRM';
import { Sale, CartItem, ProductConfig, Product, ProductPreset } from '../types';
import { 
  formatCardNumber, 
  getRequiredCardLength
} from '../lib/enrollment/validators';
import { validators } from '../lib/enrollment/validators';
import { presetUtils } from '../lib/enrollment/presetUtils';
import { draftService } from '../lib/enrollment/draftService';
import { sfx } from '../lib/soundService';
import { getQuantityMultiplier, validateManualAmount } from '../utils/quantityUtils';
import { normalizePhone, formatPhoneForDisplay } from '../utils/phoneUtils';

export interface EnrollmentState {
  fullName: string;
  phone: string;
  isMobile?: boolean; // New field
  alternatePhone?: string; // New field
  alternatePhoneType?: 'Mobile' | 'Home' | 'Work'; // New field
  email: string;
  dob: string;
  age: string;
  shippingAddress: string;
  shippingApt?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingZip?: string;
  billingAddress: string;
  billingApt?: string;
  billingCity?: string;
  billingState?: string;
  billingZip?: string;
  height?: string;
  weight?: string;
  medicalConditions?: string[];
  leadSource?: string;
  goals?: string;
  communicationPreferences?: string;
}

export interface FinancialState {
  bankName: string;
  cardType: string;
  cardNumber: string;
  cardExpMonth: string;
  cardExpYear: string;
  cardCvv: string;
}

export interface EnrollmentLogicReturn {
  formData: EnrollmentState;
  setFormData: React.Dispatch<React.SetStateAction<EnrollmentState>>;
  financials: FinancialState;
  setFinancials: React.Dispatch<React.SetStateAction<FinancialState>>;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  manualAmount: string;
  setManualAmount: React.Dispatch<React.SetStateAction<string>>;
  useShippingForBilling: boolean;
  setUseShippingForBilling: React.Dispatch<React.SetStateAction<boolean>>;
  showCvv: boolean;
  setShowCvv: React.Dispatch<React.SetStateAction<boolean>>;
  
  calculatedTotal: number;
  cardStatus: 'neutral' | 'valid' | 'invalid';
  displayPhone: string;
  
  customerTime: string | null;
  handleManualAmountChange: (value: string) => void;
  manualAmountError: string;

  loading: boolean;
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
  showReview: boolean;
  setShowReview: React.Dispatch<React.SetStateAction<boolean>>;
  showSuccess: boolean;
  setShowSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  
  handleIdentityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAgeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDobChange: (e: React.ChangeEvent<HTMLInputElement> | string) => void;
  handleFinancialChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleValidation: (e: React.FormEvent) => boolean;
  handleFinalSubmit: () => Promise<void>;
  handleClear: (skipConfirm?: boolean) => void;
  handleDisposition: (dispo: { outcome: string; notes: string; callbackTimestamp?: number }) => Promise<void>;
  selectCustomer: (sale: Sale) => void;
  handlePasteParse: () => Promise<void>;
  toggleCondition: (condition: string) => void;
  validateField: (fieldName: string, value: string, cardType?: string) => string | null;
  activeMedicalConditions: string[];
  productConfig: ProductConfig;
  activeProducts: Product[];
  activePresets: any[];
  currentUser: any;
  uniqueCustomers: Sale[];
  allSales: Sale[];
  lastDecline: Sale | null;
  lastActiveDelivery: Sale | null;
  handleRestoreLastDecline: () => void;
}

const STORAGE_KEY = 'enrollment_agent_form_v3';

export function useEnrollmentLogic(
  onSuccess?: () => void,
  initialData?: any
): EnrollmentLogicReturn {
  const { currentUser } = useAuth();
  const { addSale, addNote, productConfig, sales, systemConfig } = useCRM();

  const [formData, setFormData] = useState<EnrollmentState>({
    fullName: '',
    phone: '',
    isMobile: false,
    alternatePhone: '',
    alternatePhoneType: 'Mobile',
    email: '',
    dob: '',
    age: '',
    shippingAddress: '',
    shippingApt: '',
    shippingCity: '',
    shippingState: '',
    shippingZip: '',
    billingAddress: '',
    billingApt: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    height: '',
    weight: '',
    medicalConditions: [],
    leadSource: '',
    goals: '',
    communicationPreferences: '',
  });

  const [financials, setFinancials] = useState<FinancialState>({
    bankName: '',
    cardType: '',
    cardNumber: '',
    cardExpMonth: '',
    cardExpYear: '',
    cardCvv: '',
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [manualAmount, setManualAmount] = useState<string>('0.00');
  const [manualAmountError, setManualAmountError] = useState('');
  const [notes, setNotes] = useState<string>('');
  const [useShippingForBilling, setUseShippingForBilling] = useState(true);
  const [showCvv, setShowCvv] = useState(false);
  const [cardStatus, setCardStatus] = useState<'neutral' | 'valid' | 'invalid'>('neutral');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReview, setShowReview] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const calculatedTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.unitPrice * getQuantityMultiplier(item.quantity)), 0);
  }, [cart]);

  const handleManualAmountChange = useCallback((value: string) => {
    setManualAmount(value);
    if (value === '') {
      setManualAmountError('');
      return;
    }
    const errorMsg = validateManualAmount(value, calculatedTotal);
    setManualAmountError(errorMsg || '');
  }, [calculatedTotal]);

  const displayPhone = useMemo(() => {
    return formatPhoneForDisplay(formData.phone);
  }, [formData.phone]);

  const activeMedicalConditions = useMemo(() => {
    return systemConfig?.medicalConditions?.length > 0
      ? systemConfig.medicalConditions
      : [
          'Diabetes', 'High Blood Pressure', 'Heart Disease', 'Cancer',
          'Asthma', 'Allergies', 'Arthritis', 'Thyroid', 'Cholesterol',
        ];
  }, [systemConfig]);

  useEffect(() => {
    try {
      if (initialData) {
        setFormData((prev) => ({
          ...prev,
          fullName: initialData.fullName || '',
          phone: initialData.phone || '',
          email: initialData.email || '',
        }));
        return;
      }
      const draft = draftService.load(STORAGE_KEY);
      if (draft) {
        setFormData(draft.formData);
        setFinancials(draft.financials);
        setCart(draft.cart);
        setManualAmount(draft.manualAmount);
        setNotes(draft.notes);
        setUseShippingForBilling(draft.useShippingForBilling);
        return;
      }
      if (productConfig?.products?.length > 0) {
        const first = productConfig.products[0];
        setCart([{
          id: crypto.randomUUID(),
          product: first.name,
          quantity: '30 Day Supply',
          dosage: first.dosages?.[0] || 'Standard',
          unitPrice: first.price,
        }]);
      }
    } catch (_e) {
      // ignore
    }
  }, [initialData, productConfig]);

  useEffect(() => {
    if (showSuccess) return;
    const timer = setTimeout(() => {
      draftService.save(STORAGE_KEY, { formData, financials, cart, manualAmount, notes, useShippingForBilling });
    }, 2000);
    return () => clearTimeout(timer);
  }, [formData, financials, cart, manualAmount, notes, useShippingForBilling, showSuccess]);

  // Handle LOAD_LEAD custom event for seamless agent workflow
  useEffect(() => {
    const handleLoadLead = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const lead = customEvent.detail;
        
        setFormData((prev) => ({
          ...prev,
          fullName: lead.customerName || lead.customer || prev.fullName,
          phone: lead.phone ? formatPhoneForDisplay(lead.phone) : prev.phone,
          email: lead.email || prev.email,
          shippingAddress: lead.shippingAddress || lead.address || prev.shippingAddress,
          billingAddress: lead.billingAddress || lead.shippingAddress || lead.address || prev.billingAddress,
          dob: lead.dob || prev.dob,
          age: lead.age?.toString() || prev.age,
          medicalConditions: lead.medicalConditions || prev.medicalConditions || [],
        }));

        if (lead.bankName || lead.cardNumber) {
          setFinancials((prev) => ({
            ...prev,
            bankName: lead.bankName || prev.bankName,
            cardType: lead.cardProvider || prev.cardType,
            cardNumber: lead.cardNumber || prev.cardNumber,
            cardExpMonth: lead.cardExpiry ? lead.cardExpiry.split('/')[0] : prev.cardExpMonth,
            cardExpYear: lead.cardExpiry ? '20' + lead.cardExpiry.split('/')[1] : prev.cardExpYear,
          }));
        }

        sfx.playSubmit();
      }
    };

    window.addEventListener('LOAD_LEAD', handleLoadLead);
    return () => window.removeEventListener('LOAD_LEAD', handleLoadLead);
  }, []);

  const lastDecline = useMemo(() => {
    if (!formData.phone) return null;
    const cleanPhone = normalizePhone(formData.phone);
    if (cleanPhone.length < 10) return null;
    
    return sales
      .filter((s: Sale) => normalizePhone(s.phone) === cleanPhone && (s.status === 'Declined' || s.status === 'Cancelled' || s.status === 'Rescue In Progress'))
      .sort((a: Sale, b: Sale) => b.timestamp - a.timestamp)[0] || null;
  }, [sales, formData.phone]);

  const handleRestoreLastDecline = useCallback(() => {
    if (!lastDecline) return;
    
    setFinancials({
      bankName: lastDecline.bankName || '',
      cardType: lastDecline.cardProvider || '',
      cardNumber: lastDecline.cardNumber || '',
      cardExpMonth: lastDecline.cardExpiry ? lastDecline.cardExpiry.split('/')[0] : '',
      cardExpYear: lastDecline.cardExpiry ? '20' + lastDecline.cardExpiry.split('/')[1] : '',
      cardCvv: '',
    });

    if (lastDecline.rawCart && lastDecline.rawCart.length > 0) {
      setCart(lastDecline.rawCart.map((c: any) => ({
        id: crypto.randomUUID(),
        product: c.product,
        quantity: c.quantity || '30 Day Supply',
        dosage: c.dosage || 'Standard',
        unitPrice: c.unitPrice,
      })));
    } else if (lastDecline.product) {
      const products = lastDecline.product.split(' | ');
      const dosages = (lastDecline.dosage || 'Standard').split(' | ');
      
      setCart(products.map((p: string, idx: number) => ({
        id: crypto.randomUUID(),
        product: p,
        quantity: '30 Day Supply',
        dosage: dosages[idx] || 'Standard',
        unitPrice: lastDecline.amount || 0,
      })));
    }

    if (lastDecline.amount) {
      setManualAmount(lastDecline.amount.toString());
    }

    setNotes(`[RESCUE SESSION from Decline on ${new Date(lastDecline.timestamp).toLocaleDateString()}] `);
    sfx.playSuccess();
  }, [lastDecline]);

  const activePresets = useMemo(() => {
    return productConfig?.presets?.length ? productConfig.presets : presetUtils.getDefaultPresets();
  }, [productConfig]);

  const activeProducts = useMemo(() => {
    return productConfig?.products || [];
  }, [productConfig]);

  const handleQuickAddPreset = useCallback((preset: ProductPreset) => {
    const newItems = presetUtils.applyPreset(preset, [], productConfig);
    setCart((prev) => [...prev, ...newItems]);
    sfx.playSuccess();
  }, [productConfig]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        if (e.key === '1' && activePresets[0]) {
          e.preventDefault();
          handleQuickAddPreset(activePresets[0]);
        }
        if (e.key === '2' && activePresets[1]) {
          e.preventDefault();
          handleQuickAddPreset(activePresets[1]);
        }
        if (e.key === '3' && activePresets[2]) {
          e.preventDefault();
          handleQuickAddPreset(activePresets[2]);
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activePresets, handleQuickAddPreset]);

  const validateField = useCallback((fieldName: string, value: string, cardType?: string): string | null => {
    switch (fieldName) {
      case 'fullName': return validators.fullName(value);
      case 'phone': return validators.phone(value);
      case 'email': return value ? validators.email(value) : null;
      case 'shippingAddress': return validators.address(value);
      case 'billingAddress': return useShippingForBilling ? null : validators.address(value);
      case 'cardNumber': return value ? validators.cardNumber(value, cardType || '') : null;
      case 'cardExpiry': return value ? validators.expiry(value) : null;
      case 'cardCvv': return value ? validators.cvv(value, cardType || '') : null;
      case 'amount': return validators.amount(value);
      default: return null;
    }
  }, [useShippingForBilling]);

  const handleIdentityChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    let finalValue: string | boolean = type === 'checkbox' ? checked : value;
    if (name === 'phone' || name === 'alternatePhone') {
      const clean = value.replace(/\D/g, '').slice(0,10);
      if (clean.length === 0) {
        finalValue = '';
      } else if (clean.length <= 3) {
        finalValue = `(${clean}`;
      } else if (clean.length <= 6) {
        finalValue = `(${clean.slice(0,3)}) ${clean.slice(3)}`;
      } else {
        finalValue = `(${clean.slice(0,3)}) ${clean.slice(3,6)}-${clean.slice(6)}`;
      }
    }
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  }, []);

  const handleAgeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const ageVal = e.target.value;
    setFormData((prev) => {
      const newState = { ...prev, age: ageVal };
      if (ageVal && !isNaN(parseInt(ageVal))) {
        const age = parseInt(ageVal);
        if (age >= 18 && age <= 120) newState.dob = `${new Date().getFullYear() - age}-01-01`;
      }
      return newState;
    });
  }, []);

  const handleDobChange = useCallback((e: React.ChangeEvent<HTMLInputElement> | string) => {
    const dobVal = typeof e === 'string' ? e : e.target.value;
    setFormData((prev) => {
      const newState = { ...prev, dob: dobVal };
      if (dobVal) {
        const birthDate = new Date(dobVal);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        
        if (age < 18) {
          newState.age = ''; // Clear if under 18
          newState.dob = ''; // Clear DOB too
        } else if (age <= 120) {
          newState.age = age.toString();
        }
      }
      return newState;
    });
  }, []);

  const handleFinancialChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      let finalValue = value;

      if (name === 'cardNumber') {
        const cleaned = finalValue.replace(/\D/g, '');
        // Bin check API: check bank name when we have at least 6 digits
        if (cleaned.length >= 6 && cleaned.length <= 8) {
           const bin = cleaned.slice(0, 8);
           fetch(`https://lookup.binlist.net/${bin}`)
             .then(res => res.json())
             .then(data => {
               if (data.bank && data.bank.name) {
                 setFinancials(prev => ({ ...prev, bankName: data.bank.name, cardType: data.type === 'debit' ? 'Debit' : 'Credit' }));
               }
             }).catch(() => {});
        }
        
        finalValue = formatCardNumber(value, financials.cardType);
        const clean = finalValue.replace(/\D/g, '');
        const reqLen = getRequiredCardLength(financials.cardType);
        if (clean.length === reqLen) {
          setCardStatus('valid');
        } else if (clean.length > 0) {
          setCardStatus('invalid');
        } else {
          setCardStatus('neutral');
        }
      }

      if (name === 'cardExpMonth' || name === 'cardExpYear') {
        finalValue = value.replace(/\D/g, '');
      }

      if (name === 'cardType') {
        setFinancials((prev) => {
          const newState = { ...prev, [name]: finalValue };
          newState.cardNumber = formatCardNumber(newState.cardNumber, finalValue);
          const clean = newState.cardNumber.replace(/\D/g, '');
          const reqLen = getRequiredCardLength(finalValue);
          if (clean.length === reqLen) {
            setCardStatus('valid');
          } else if (clean.length > 0) {
            setCardStatus('invalid');
          } else {
            setCardStatus('neutral');
          }
          return newState;
        });
        return;
      }

      setFinancials((prev) => ({ ...prev, [name]: finalValue }));
    },
    [financials.cardType]
  );

  const validateMinimumFields = useCallback((): boolean => {
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      setError('Customer name is required');
      sfx.playDecline();
      return false;
    }

    if (!formData.phone || formData.phone.replace(/\D/g, '').length < 10) {
      setError('Valid phone number is required');
      sfx.playDecline();
      return false;
    }

    const finalAmount = parseFloat(manualAmount) || calculatedTotal;
    if (finalAmount <= 0) {
      setError('Amount must be greater than $0.00');
      sfx.playDecline();
      return false;
    }

      if (financials.cardNumber && financials.cardNumber.trim() !== '') {
        const clean = financials.cardNumber.replace(/\D/g, '');
        // basic length check
        if (clean.length < 13 || clean.length > 19) {
          setError(`Invalid card number length`);
          sfx.playDecline();
          return false;
        }

      if (!financials.cardExpMonth || !financials.cardExpYear) {
        setError('Card expiration date is incomplete');
        sfx.playDecline();
        return false;
      }
      
      const expDate = new Date(parseInt(financials.cardExpYear), parseInt(financials.cardExpMonth));
      if (expDate <= new Date()) {
         setError('Card is expired');
         sfx.playDecline();
         return false;
      }

      if (!financials.cardCvv) {
        setError('CVV is required');
        sfx.playDecline();
        return false;
      }

      const cvvClean = financials.cardCvv.replace(/\D/g, '');
      if (financials.cardType === 'Amex' && cvvClean.length !== 4) {
        setError('Amex CVV must be 4 digits');
        sfx.playDecline();
        return false;
      }
      if (financials.cardType !== 'Amex' && cvvClean.length !== 3) {
        setError('CVV must be 3 digits');
        sfx.playDecline();
        return false;
      }
    }

    setError('');
    sfx.playClick();
    return true;
  }, [formData, manualAmount, financials, calculatedTotal]);

  const handleValidation = useCallback(
    (e: React.FormEvent): boolean => {
      e.preventDefault();
      return validateMinimumFields();
    },
    [validateMinimumFields]
  );

  const handleFinalSubmit = useCallback(async () => {
    if (!validateMinimumFields()) return;

    const formatAddress = (street: string, apt?: string, city?: string, state?: string, zip?: string) => {
      const streetWithApt = apt ? `${street} ${apt}`.trim() : street;
      return [streetWithApt, city, state, zip].filter(Boolean).join(', ');
    };

    const fullShippingAddress = formatAddress(formData.shippingAddress, formData.shippingApt, formData.shippingCity, formData.shippingState, formData.shippingZip);
    const fullBillingAddress = useShippingForBilling 
      ? fullShippingAddress 
      : formatAddress(formData.billingAddress, formData.billingApt, formData.billingCity, formData.billingState, formData.billingZip);

    setLoading(true);
    try {
      await addSale({
        agentId: currentUser?.id,
        agent: currentUser?.name || 'Admin',
        customer: formData.fullName.trim(),
        phone: normalizePhone(formData.phone),
        email: formData.email || undefined,
        dob: formData.dob || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        height: formData.height || undefined,
        weight: formData.weight || undefined,
        address: fullShippingAddress,
        billingAddress: fullBillingAddress,
        bankName: financials.bankName || undefined,
        cardProvider: financials.cardType || undefined,
        cardNumber: financials.cardNumber || undefined,
        cardExpiry: (financials.cardExpMonth && financials.cardExpYear) ? `${financials.cardExpMonth}/${financials.cardExpYear.slice(-2)}` : undefined,
        cardCvv: financials.cardCvv || undefined,
        amount: parseFloat(manualAmount) || calculatedTotal,
        product: cart.map((c) => c.product).join(' | '),
        quantity: cart.reduce((acc, c) => acc + getQuantityMultiplier(c.quantity), 0).toString(),
        dosage: cart.map((c) => c.dosage).join(' | '),
        rawCart: cart.map((c) => {
          const originalPrice = productConfig.products.find(p => p.name === c.product)?.price || c.unitPrice;
          return { 
            product: c.product,
            quantity: c.quantity,
            dosage: c.dosage,
            unitPrice: c.unitPrice,
            originalPrice: originalPrice,
            discount: originalPrice - c.unitPrice
          };
        }),
        medicalConditions: formData.medicalConditions || [],
        leadSource: formData.leadSource || undefined,
        goals: formData.goals || undefined,
        communicationPreferences: formData.communicationPreferences || undefined,
        callSummary: notes || undefined,
        status: 'Pending',
        pipelineStatus: 'New',
        snapshotTotalDiscount: cart.reduce((acc, c) => acc + ((productConfig.products.find(p => p.name === c.product)?.price || c.unitPrice) - c.unitPrice) * getQuantityMultiplier(c.quantity), 0),
        snapshotOriginalAmount: cart.reduce((acc, c) => acc + (productConfig.products.find(p => p.name === c.product)?.price || c.unitPrice) * getQuantityMultiplier(c.quantity), 0)
      } as Sale);

      sfx.playSuccess();
      draftService.delete(STORAGE_KEY);
      setShowReview(false);
      setShowSuccess(true);

      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err) {
      console.error('Sale submission failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit order. Please try again.');
      sfx.playError();
    } finally {
      setLoading(false);
    }
  }, [validateMinimumFields, addSale, currentUser, formData, financials, cart, manualAmount, notes, useShippingForBilling, onSuccess, calculatedTotal, productConfig.products]);

  const handleClear = useCallback((skipConfirm = false) => {
    if (skipConfirm || confirm('Clear all form data? This cannot be undone.')) {
      draftService.delete(STORAGE_KEY);
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        dob: '',
        age: '',
        shippingAddress: '',
        shippingApt: '',
        shippingCity: '',
        shippingState: '',
        shippingZip: '',
        billingAddress: '',
        billingApt: '',
        billingCity: '',
        billingState: '',
        billingZip: '',
        height: '',
        weight: '',
        medicalConditions: [],
      });
      setFinancials({
        bankName: '',
        cardType: '',
        cardNumber: '',
        cardExpMonth: '',
        cardExpYear: '',
        cardCvv: '',
      });
      setNotes('');
      setManualAmount('0.00');
      setCardStatus('neutral');
      setShowCvv(false);
      setUseShippingForBilling(true);
      setError('');

      if (productConfig?.products?.length > 0) {
        const first = productConfig.products[0];
        setCart([
          {
            id: crypto.randomUUID(),
            product: first.name,
            quantity: '30 Day Supply',
            dosage: first.dosages?.[0] || 'Standard',
            unitPrice: first.price,
          },
        ]);
      }

      sfx.playDecline();
    }
  }, [productConfig]);

  const handleDisposition = useCallback(async (dispo: { outcome: string; notes: string; callbackTimestamp?: number }) => {
    setLoading(true);

    const formatAddress = (street: string, apt?: string, city?: string, state?: string, zip?: string) => {
      const streetWithApt = apt ? `${street} ${apt}`.trim() : street;
      return [streetWithApt, city, state, zip].filter(Boolean).join(', ');
    };

    const fullShippingAddress = formatAddress(formData.shippingAddress, formData.shippingApt, formData.shippingCity, formData.shippingState, formData.shippingZip);
    const fullBillingAddress = useShippingForBilling 
      ? fullShippingAddress 
      : formatAddress(formData.billingAddress, formData.billingApt, formData.billingCity, formData.billingState, formData.billingZip);

    try {
      const summary = dispo.notes ? `[${dispo.outcome.toUpperCase()}] ${dispo.notes}` : `[${dispo.outcome.toUpperCase()}]`;

      if (dispo.outcome === 'callback') {
        const noteId = Date.now().toString();
        await addNote({
           id: noteId,
           agentId: currentUser?.id,
           agentName: currentUser?.name,
           content: dispo.notes || 'Callback requested',
           type: 'callback',
           timestamp: Date.now(),
           reminderAt: dispo.callbackTimestamp || Date.now(),
           priority: 'High',
           customerName: formData.fullName || 'Unknown Customer',
           phone: normalizePhone(formData.phone)
        } as any);

        if (formData.fullName && formData.phone) {
           await addSale({
             agentId: currentUser?.id,
             agent: currentUser?.name,
             customer: formData.fullName.trim(),
             phone: normalizePhone(formData.phone),
             address: fullShippingAddress || '',
             product: cart.map(c => c.product).join(', ') || 'Unknown',
             quantity: cart.reduce((acc, c) => acc + getQuantityMultiplier(c.quantity), 0).toString() || '0',
             dosage: cart[0]?.dosage || 'N/A',
             amount: 0,
             status: 'Pending', // pending callback
             adminLabel: summary
           } as Sale);
        }
      } else if (dispo.outcome === 'hold_order') {
        // Save full order as Pending / Hold with callback time
        const noteId = Date.now().toString();
        await addNote({
           id: noteId,
           agentId: currentUser?.id,
           agentName: currentUser?.name,
           content: `Hold Order. ${dispo.notes}`,
           type: 'callback',
           timestamp: Date.now(),
           reminderAt: dispo.callbackTimestamp || Date.now(),
           priority: 'High',
           customerName: formData.fullName || 'Unknown Customer',
           phone: normalizePhone(formData.phone)
        } as any);

        await addSale({
          agentId: currentUser?.id,
          agent: currentUser?.name,
          customer: formData.fullName.trim() || 'Unknown',
          phone: normalizePhone(formData.phone),
          email: formData.email,
          address: fullShippingAddress,
          billingAddress: fullBillingAddress,
          product: cart.map(c => c.product).join(', '),
          quantity: cart.reduce((acc, c) => acc + getQuantityMultiplier(c.quantity), 0).toString(),
          dosage: cart[0]?.dosage || 'N/A',
          amount: parseFloat(manualAmount) || cart.reduce((acc, c) => acc + c.unitPrice, 0),
          status: 'Pending',
          bankName: financials.bankName,
          cardProvider: financials.cardType,
          cardNumber: financials.cardNumber,
          cardExpiry: (financials.cardExpMonth && financials.cardExpYear) ? `${financials.cardExpMonth}/${financials.cardExpYear.slice(-2)}` : undefined,
          cardCvv: financials.cardCvv,
          dob: formData.dob,
          age: parseInt(formData.age) || undefined,
          callSummary: summary
        } as Sale);

      } else {
        // Declined / Busy / Not Interested
        if (formData.fullName || formData.phone) {
           await addSale({
             agentId: currentUser?.id,
             agent: currentUser?.name,
             customer: formData.fullName.trim() || 'Unknown Customer',
             phone: normalizePhone(formData.phone),
             address: fullShippingAddress || '',
             product: cart.map(c => c.product).join(', ') || 'N/A',
             quantity: '0',
             dosage: 'N/A',
             amount: 0,
             status: 'Declined',
             declineReason: summary,
             callSummary: summary
           } as Sale);
        } else {
           // Just add a note if no name/phone is there
           await addNote({
             id: Date.now().toString(),
             agentId: currentUser?.id,
             agentName: currentUser?.name,
             content: summary,
             type: 'note',
             timestamp: Date.now(),
             priority: 'Low'
           } as any);
        }
      }

      sfx.playSuccess();
      handleClear(true); // force pass through confirm
    } catch (err) {
      console.error('Disposition failed:', err);
      setError('Failed to save disposition.');
      sfx.playError();
    } finally {
      setLoading(false);
    }
  }, [currentUser, formData, financials, cart, manualAmount, addSale, addNote, useShippingForBilling, handleClear]);

  const selectCustomer = useCallback(
    (sale: Sale) => {
      setFormData((prev) => ({
        ...prev,
        fullName: sale.customer,
        phone: sale.phone,
        email: sale.email || '',
        shippingAddress: sale.address,
        billingAddress: sale.billingAddress || sale.address,
        dob: sale.dob || prev.dob,
        age: sale.age?.toString() || prev.age,
        medicalConditions: sale.medicalConditions || [],
      }));
      setFinancials((prev) => ({
        ...prev,
        bankName: sale.bankName || '',
        cardType: sale.cardProvider || '',
        cardNumber: sale.cardNumber || '',
        cardExpMonth: sale.cardExpiry ? sale.cardExpiry.split('/')[0] : '',
        cardExpYear: sale.cardExpiry ? '20' + sale.cardExpiry.split('/')[1] : '',
        cardCvv: '',
      }));
      sfx.playSubmit();
    },
    []
  );

  const handlePasteParse = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;

      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
      const newData: any = {};

      lines.forEach((line) => {
        if (line.includes('@')) newData.email = line;
        else if (line.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/)) newData.phone = line;
        else if (line.match(/\d+\s+[A-Za-z]/)) newData.shippingAddress = line;
        else if (line.split(' ').length >= 2 && !newData.fullName) newData.fullName = line;
      });

      setFormData((prev) => ({ ...prev, ...newData }));
      sfx.playSubmit();
    } catch (e) {
      console.error('Paste failed', e);
      sfx.playError();
    }
  }, []);

  const toggleCondition = useCallback((condition: string) => {
    setFormData((prev) => ({
      ...prev,
      medicalConditions: prev.medicalConditions?.includes(condition)
        ? prev.medicalConditions.filter((c) => c !== condition)
        : [...(prev.medicalConditions || []), condition],
    }));
  }, []);

  // Extra uniqueCustomers variable that isn't exported but is useful 
  const uniqueCustomers = Array.from(new Map(sales.map(s => [s.phone, s])).values()) as Sale[];

  const lastActiveDelivery = useMemo(() => {
    if (!formData.phone) return null;
    const cleanPhone = normalizePhone(formData.phone);
    if (!cleanPhone) return null;
    
    // Find any approved sale for this phone number where delivery is NOT completed/Delivered
    return sales
      .filter(s => s.status === 'Approved' && normalizePhone(s.phone) === cleanPhone && s.deliveryStatus !== 'Delivered')
      .sort((a, b) => b.timestamp - a.timestamp)[0] || null;
  }, [sales, formData.phone]);

  return {
    // Form state
    formData,
    setFormData,
    financials,
    setFinancials,
    cart,
    setCart,
    notes,
    setNotes,
    manualAmount,
    setManualAmount,
    useShippingForBilling,
    setUseShippingForBilling,
    showCvv,
    setShowCvv,

    // Computed values
    calculatedTotal,
    displayPhone,
    customerTime: null,
    cardStatus,

    // State management
    loading,
    error,
    setError,
    showReview,
    setShowReview,
    showSuccess,
    setShowSuccess,

    // Data lookup
    uniqueCustomers,
    allSales: sales,
    lastDecline,
    lastActiveDelivery,
    handleRestoreLastDecline,

    // Handlers
    handleIdentityChange,
    handleAgeChange,
    handleDobChange,
    handleFinancialChange,
    handleValidation,
    handleFinalSubmit,
    handleClear,
    handleDisposition,
    selectCustomer,
    handlePasteParse,
    toggleCondition,
    handleManualAmountChange,
    manualAmountError,

    // Utilities
    validateField,
    activeMedicalConditions,
    activePresets,
    activeProducts,
    productConfig,
    currentUser,
  };
}
