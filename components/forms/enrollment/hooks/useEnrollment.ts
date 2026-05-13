
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useCRM } from '../../../../hooks/useCRM';
import { useAuth } from '../../../../hooks/useAuth';
import { sfx } from '../../../../lib/soundService';
import { 
    formatCardNumber, 
    validateLuhn, getRequiredCardLength, 
    getPhoneTime 
} from '../../../../views/utils/crmLogic';
import { normalizePhone } from '../../../../views/utils/dataSanitizer';
import { CartItem } from '../../../../types';
import { MEDICAL_CONDITIONS } from '../../../../constants';
import { formatUSAPhone } from '../../../../views/utils/formatters';

export const useEnrollment = (onSuccess: () => void, customerData?: any) => {
    const { addSale, sales, notes: allNotes, productConfig, systemConfig, drafts, updateDraft, clearDraft } = useCRM();
    const { currentUser } = useAuth();
    
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'order' | 'callback'>('order');
    const [error, setError] = useState('');
    const [collision, setCollision] = useState<{ type: 'sale' | 'lead' | 'mine', agent: string, date: number } | null>(null);

    // Initialize state from drafts if available, otherwise defaults
    const savedDraft = drafts['enrollment'] || {};

    const [formData, setFormData] = useState({
        fullName: savedDraft.formData?.fullName || '', 
        phone: savedDraft.formData?.phone || '', 
        email: savedDraft.formData?.email || '', 
        dob: savedDraft.formData?.dob || '', 
        age: savedDraft.formData?.age || '',
        shippingAddress: savedDraft.formData?.shippingAddress || '', 
        billingAddress: savedDraft.formData?.billingAddress || '', 
        spouseName: savedDraft.formData?.spouseName || ''
    });
    
    const [financials, setFinancials] = useState({
        bankName: savedDraft.financials?.bankName || '', 
        cardType: savedDraft.financials?.cardType || 'Visa', 
        cardNumber: savedDraft.financials?.cardNumber || '', 
        cardExpiry: savedDraft.financials?.cardExpiry || '', 
        cardCvv: savedDraft.financials?.cardCvv || ''
    });
    
    const [cart, setCart] = useState<CartItem[]>(savedDraft.cart || []);
    const [notes, setNotes] = useState(savedDraft.notes || '');
    const [selectedConditions, setSelectedConditions] = useState<string[]>(savedDraft.selectedConditions || []);
    const [useShippingForBilling, setUseShippingForBilling] = useState(savedDraft.useShippingForBilling ?? true);
    const [cardStatus, setCardStatus] = useState<'neutral' | 'valid' | 'invalid'>('neutral');
    const [customerTime, setCustomerTime] = useState<string | null>(null);

    // Collision Detection Logic
    useEffect(() => {
        const cleanPhone = normalizePhone(formData.phone);
        if (cleanPhone.length < 10) {
            setCollision(null);
            return;
        }

        // Check for personal pipeline first
        const myExisting = allNotes.find(n => normalizePhone(n.phone || '') === cleanPhone && n.agentId === currentUser?.id);
        if (myExisting) {
            setCollision({ type: 'mine', agent: 'YOU', date: myExisting.timestamp });
            return;
        }

        // Check for global sales (Hard Collision)
        const existingSale = sales.find(s => normalizePhone(s.phone) === cleanPhone);
        if (existingSale) {
            setCollision({ 
                type: 'sale', 
                agent: existingSale.agentId === currentUser?.id ? 'YOU' : existingSale.agent, 
                date: existingSale.timestamp 
            });
            return;
        }

        // Check for others' pipelines (Soft Collision)
        const otherLead = allNotes.find(n => normalizePhone(n.phone || '') === cleanPhone && n.agentId !== currentUser?.id);
        if (otherLead) {
             setCollision({ 
                type: 'lead', 
                agent: otherLead.agentName || 'Unknown Agent', 
                date: otherLead.timestamp 
            });
        } else {
            setCollision(null);
        }
    }, [formData.phone, sales, allNotes, currentUser?.id]);

    // Persist to draft on change
    useEffect(() => {
        const timeout = setTimeout(() => {
            updateDraft('enrollment', {
                formData, financials, cart, notes, selectedConditions, useShippingForBilling
            });
        }, 500); // Debounce
        return () => clearTimeout(timeout);
    }, [formData, financials, cart, notes, selectedConditions, useShippingForBilling, updateDraft]);

    // Initial load sync from props (overrides draft if provided)
    useEffect(() => {
        if (customerData) {
            setFormData(prev => ({
                ...prev,
                fullName: customerData.fullName || prev.fullName,
                phone: formatUSAPhone(customerData.phone || prev.phone),
                email: customerData.email || prev.email,
                shippingAddress: customerData.shippingAddress || prev.shippingAddress,
                billingAddress: customerData.billingAddress || prev.billingAddress,
                dob: customerData.dob || prev.dob,
                age: customerData.age?.toString() || prev.age,
                spouseName: customerData.spouseName || prev.spouseName
            }));
            if (customerData.medicalConditions) setSelectedConditions(customerData.medicalConditions);
        }
    }, [customerData]);

    const grandTotal = useMemo(() => {
        return cart.reduce((acc, item) => acc + ((parseInt(item.quantity) || 1) * item.unitPrice), 0);
    }, [cart]);

    const activeConditions = useMemo(() => {
        return systemConfig.medicalConditions && systemConfig.medicalConditions.length > 0 
            ? systemConfig.medicalConditions 
            : MEDICAL_CONDITIONS;
    }, [systemConfig.medicalConditions]);

    const handleIdentityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let finalValue = value;
        if (name === 'phone') {
            finalValue = formatUSAPhone(value);
            setCustomerTime(getPhoneTime(finalValue));
        }
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    }, []);

    const handleDobChange = useCallback((val: string) => {
        setFormData(prev => {
            const next = { ...prev, dob: val };
            if (val) {
                const birth = new Date(val);
                const now = new Date();
                let age = now.getFullYear() - birth.getFullYear();
                const m = now.getMonth() - birth.getMonth();
                if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
                next.age = age.toString();
            }
            return next;
        });
        sfx.playHover();
    }, []);

    const handleAgeChange = useCallback((val: string) => {
        setFormData(prev => {
            const next = { ...prev, age: val };
            if (val && !isNaN(parseInt(val))) {
                const estYear = new Date().getFullYear() - parseInt(val);
                next.dob = `${estYear}-01-01`;
            }
            return next;
        });
    }, []);

    const handleCardInput = useCallback((val: string) => {
        const raw = val.replace(/\D/g, '');
        let cardType = financials.cardType;
        
        if (raw.startsWith('4')) cardType = 'Visa';
        else if (raw.startsWith('5')) cardType = 'Mastercard';
        else if (raw.startsWith('3')) cardType = 'Amex';
        else if (raw.startsWith('6')) cardType = 'Discover';

        const formatted = formatCardNumber(raw, cardType);
        const reqLen = getRequiredCardLength(cardType);
        const isValid = raw.length === reqLen && validateLuhn(raw);

        setFinancials(prev => ({ ...prev, cardNumber: formatted, cardType }));
        setCardStatus(isValid ? 'valid' : raw.length > 0 ? 'invalid' : 'neutral');
    }, [financials.cardType]);

    const handleSubmit = async () => {
        setError('');
        if (!formData.fullName || !formData.phone || cardStatus !== 'valid') {
            setError('System Check: Identity or Vault verification incomplete.');
            sfx.playError();
            return;
        }

        setLoading(true);
        try {
            await addSale({
                agentId: currentUser?.id,
                customer: formData.fullName,
                phone: normalizePhone(formData.phone),
                email: formData.email,
                address: formData.shippingAddress,
                billingAddress: useShippingForBilling ? formData.shippingAddress : formData.billingAddress,
                dob: formData.dob,
                age: parseInt(formData.age),
                spouseName: formData.spouseName,
                bankName: financials.bankName,
                cardNumber: financials.cardNumber,
                cardExpiry: financials.cardExpiry,
                cardCvv: financials.cardCvv,
                cardProvider: financials.cardType,
                amount: grandTotal,
                medicalConditions: selectedConditions,
                callSummary: notes,
                status: 'Pending',
                pipelineStatus: 'New'
            });
            sfx.playSuccess();
            clearDraft('enrollment');
            onSuccess();
        } catch {
            setError('Uplink Interrupted: Critical database error.');
            sfx.playError();
        } finally {
            setLoading(false);
        }
    };

    return {
        mode, setMode, loading, error, collision,
        formData, setFormData, handleIdentityChange, handleDobChange, handleAgeChange,
        financials, setFinancials, handleCardInput, cardStatus,
        cart, setCart, notes, setNotes, selectedConditions, setSelectedConditions,
        useShippingForBilling, setUseShippingForBilling,
        customerTime, grandTotal, productConfig, handleSubmit, activeConditions
    };
};
