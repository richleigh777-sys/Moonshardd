 

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useCRM } from '../../../../hooks/useCRM';
import { useAuth } from '../../../../hooks/useAuth';
import { sfx } from '../../../../lib/soundService';
import { 
    getPhoneTime 
} from '../../../../views/utils/crmLogic';
import { normalizePhone } from '../../../../views/utils/dataSanitizer';
import { CartItem, Sale } from '../../../../types';
import { formatUSAPhone } from '../../../../views/utils/formatters';

export const useEnrollment = (onSuccess: () => void, customerData?: any) => {
    const { addSale, sales, notes: allNotes, productConfig, systemConfig, drafts, updateDraft, clearDraft, customers, updateCustomer, addCustomer } = useCRM();
    const { currentUser } = useAuth();
    
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'order' | 'callback'>('order');
    const [error, setError] = useState('');
    const [collision, setCollision] = useState<{ type: 'sale' | 'lead' | 'mine', agent: string, date: number } | null>(null);

    // Initialize state from drafts if available, otherwise defaults
    const savedDraft = drafts['enrollment'] || {};

    const [formData, setFormData] = useState({
        firstName: savedDraft.formData?.firstName || '', 
        lastName: savedDraft.formData?.lastName || '', 
        phone: savedDraft.formData?.phone || '', 
        email: savedDraft.formData?.email || '', 
        dob: savedDraft.formData?.dob || '', 
        age: savedDraft.formData?.age || '',
        shippingAddress: savedDraft.formData?.shippingAddress || '', 
        shippingApt: savedDraft.formData?.shippingApt || '',
        shippingCity: savedDraft.formData?.shippingCity || '',
        shippingState: savedDraft.formData?.shippingState || '',
        shippingZip: savedDraft.formData?.shippingZip || '',
        billingAddress: savedDraft.formData?.billingAddress || '', 
        billingApt: savedDraft.formData?.billingApt || '',
        billingCity: savedDraft.formData?.billingCity || '',
        billingState: savedDraft.formData?.billingState || '',
        billingZip: savedDraft.formData?.billingZip || '',
        height: savedDraft.formData?.height || '',
        weight: savedDraft.formData?.weight || '',
        medicalConditions: savedDraft.formData?.medicalConditions || []
    });
    
    const [cart, setCart] = useState<CartItem[]>(savedDraft.cart || []);
    const [notes, setNotes] = useState(savedDraft.notes || '');
    const [useShippingForBilling, setUseShippingForBilling] = useState(savedDraft.useShippingForBilling ?? true);
    const [customerTime, setCustomerTime] = useState<string | null>(null);

    const [financials, setFinancials] = useState(savedDraft.financials || {
        cardNumber: '', cardExpiry: '', cardCvv: '', bankName: '', cardType: ''
    });

    const handleCardInput = useCallback((val: string) => {
        const cleaned = val.replace(/\D/g, '');
        const match = cleaned.match(/.{1,4}/g);
        const formatted = match ? match.join(' ') : cleaned;
        setFinancials((prev: any) => ({ ...prev, cardNumber: formatted.substring(0, 19) }));
    }, []);

    const cardStatus = useMemo<'neutral' | 'valid' | 'invalid'>(() => {
        const len = financials.cardNumber.replace(/\D/g, '').length;
        if (len === 0) return 'neutral';
        return len === 15 || len === 16 ? 'valid' : 'invalid';
    }, [financials.cardNumber]);

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
                formData, cart, notes, useShippingForBilling, financials
            });
        }, 500); // Debounce
        return () => clearTimeout(timeout);
    }, [formData, cart, notes, useShippingForBilling, financials, updateDraft]);

    // Initial load sync from props (overrides draft if provided)
    useEffect(() => {
        if (customerData) {
            setFormData(prev => ({
                ...prev,
                firstName: customerData.firstName || (customerData.fullName ? customerData.fullName.split(' ')[0] : prev.firstName),
                lastName: customerData.lastName || (customerData.fullName ? customerData.fullName.substring(customerData.fullName.indexOf(' ') + 1) : prev.lastName),
                phone: formatUSAPhone(customerData.phone || prev.phone),
                email: customerData.email || prev.email,
                shippingAddress: customerData.shippingAddress || prev.shippingAddress,
                billingAddress: customerData.billingAddress || prev.billingAddress,
                dob: customerData.dob || prev.dob,
                age: customerData.age?.toString() || prev.age,
                height: customerData.height || prev.height,
                weight: customerData.weight || prev.weight,
                medicalConditions: customerData.medicalConditions || prev.medicalConditions || []
            }));
        }
    }, [customerData]);

    // Helper to extract unit multiplier from quantity strings like "30 Day Supply", "3 Bottles", etc.
    const getQuantityMultiplier = useCallback((quantity: string): number => {
        const q = quantity.toLowerCase();
        if (q.includes('90')) return 3;
        if (q.includes('180')) return 6;
        if (q.includes('365') || q.includes('1 year')) return 12;
        // Basic number extraction if specific words aren't matched
        const match = q.match(/^(\d+)/);
        if (match && !q.includes('day')) {
            return parseInt(match[1], 10) || 1;
        }
        return 1;
    }, []);

    const grandTotal = useMemo(() => {
        return cart.reduce((acc, item) => acc + (getQuantityMultiplier(item.quantity) * item.unitPrice), 0);
    }, [cart, getQuantityMultiplier]);

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

    const handleSubmit = async () => {
        setError('');
        
        // --- Strict Point-of-Entry Data Validation ---
        const missingFields: string[] = [];
        
        if (!formData.firstName || !formData.lastName || !formData.phone) {
            missingFields.push('Identity Verification (Name & Phone)');
        }
        if (!formData.shippingAddress || !formData.shippingCity || !formData.shippingState || !formData.shippingZip) {
            missingFields.push('Complete Shipping Address');
        }
        if (!useShippingForBilling && (!formData.billingAddress || !formData.billingCity || !formData.billingState || !formData.billingZip)) {
            missingFields.push('Complete Billing Address');
        }
        if (cart.length === 0) {
            missingFields.push('Product Selection');
        }
        if (!financials.cardNumber || !financials.cardExpiry || !financials.cardCvv) {
            missingFields.push('Complete Payment Information');
        }
        if (!formData.dob || !formData.height || !formData.weight) {
            missingFields.push('Medical Profile (DOB, Height, Weight)');
        }

        if (missingFields.length > 0) {
            setError(`Validation Failed. Missing required fields: ${missingFields.join(', ')}`);
            sfx.playError();
            return;
        }
        // --- End Validation ---

        setLoading(true);
        try {
            const formatAddress = (street: string, apt?: string, city?: string, state?: string, zip?: string) => {
                const streetWithApt = apt ? `${street} ${apt}` : street;
                return [streetWithApt, city, state, zip].filter(Boolean).join(', ');
            };
            
            const parsedShippingStreet = formData.shippingAddress.split(',')[0].trim();
            const parsedBillingStreet = formData.billingAddress.split(',')[0].trim();
            
            const streetAndAptShipping = formData.shippingApt ? `${parsedShippingStreet} ${formData.shippingApt}` : parsedShippingStreet;
            const streetAndAptBilling = formData.billingApt ? `${parsedBillingStreet} ${formData.billingApt}` : parsedBillingStreet;

            const isDeclined = financials.cardNumber && cardStatus === 'invalid';
            const firstCartItem = cart.length > 0 ? cart[0] : { product: 'Unknown Product', quantity: '1', dosage: '' };
            
            const newSale: Partial<Sale> & any = {
                agentId: currentUser?.id,
                agent: currentUser?.name || 'Unknown Agent',
                team: currentUser?.team || 'Alpha',
                customer: `${formData.firstName} ${formData.lastName}`.trim(),
                phone: normalizePhone(formData.phone),
                email: formData.email,
                address: streetAndAptShipping,
                city: formData.shippingCity,
                state: formData.shippingState,
                zip: formData.shippingZip,
                shippingAddress: streetAndAptShipping,
                shippingCity: formData.shippingCity,
                shippingState: formData.shippingState,
                shippingZip: formData.shippingZip,
                billingAddress: useShippingForBilling ? streetAndAptShipping : streetAndAptBilling,
                billingCity: useShippingForBilling ? formData.shippingCity : formData.billingCity,
                billingState: useShippingForBilling ? formData.shippingState : formData.billingState,
                billingZip: useShippingForBilling ? formData.shippingZip : formData.billingZip,
                dob: formData.dob,
                age: parseInt(formData.age) || undefined,
                height: formData.height,
                weight: formData.weight,
                medicalConditions: formData.medicalConditions,
                amount: grandTotal,
                product: firstCartItem.product,
                quantity: firstCartItem.quantity,
                dosage: firstCartItem.dosage || '',
                rawCart: cart,
                callSummary: notes,
                status: isDeclined ? 'Declined' : 'Pending',
                pipelineStatus: isDeclined ? 'Declined' : 'Closed Won',
                bankName: financials.bankName,
                cardProvider: financials.cardType,
                cardNumber: financials.cardNumber,
                cardExpiry: financials.cardExpiry,
                cardCvv: financials.cardCvv
            };
            await addSale(newSale);
            
            if (isDeclined) {
                setError('Transaction Declined: Invalid card verification.');
                sfx.playError();
                setLoading(false);
                return;
            }

            // Generate stack format and copy to clipboard
            const { generateInternalStackFormat } = await import('../../../../views/utils/formatters');
            const stackFormat = generateInternalStackFormat({
                ...newSale,
                agent: currentUser?.name
            });
            navigator.clipboard.writeText(stackFormat).catch(() => console.error("Clipboard permission denied"));

            // Broadcast globally as the user
            if (currentUser) {
                const { ChatService } = await import('../../../../services/ChatService');
                await ChatService.sendMessage(stackFormat, currentUser, 'global', { channelId: 'global-wins' });
            }

            // Push to Microsoft Teams if configured
            if (systemConfig.teamsWebhookEnabled && systemConfig.teamsWebhookUrl) {
                try {
                    await fetch(systemConfig.teamsWebhookUrl, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ text: stackFormat }),
                    });
                } catch (err) {
                    console.error('Failed to dispatch Teams Webhook payload:', err);
                }
            }

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

    const autoFillFromCustomer = useCallback((customer: any) => {
        setFormData(prev => ({
            ...prev,
            firstName: customer.firstName || prev.firstName,
            lastName: customer.lastName || prev.lastName,
            phone: customer.phone || prev.phone,
            email: customer.email || prev.email,
            dob: customer.dob || prev.dob,
            age: customer.age?.toString() || prev.age,
            height: customer.height || prev.height,
            weight: customer.weight || prev.weight,
            medicalConditions: customer.medicalConditions || prev.medicalConditions,
            shippingAddress: customer.shippingAddress || prev.shippingAddress,
            shippingApt: customer.shippingApt || prev.shippingApt,
            shippingCity: customer.shippingCity || prev.shippingCity,
            shippingState: customer.shippingState || prev.shippingState,
            shippingZip: customer.shippingZip || prev.shippingZip,
            billingAddress: customer.billingAddress || prev.billingAddress,
            billingApt: customer.billingApt || prev.billingApt,
            billingCity: customer.billingCity || prev.billingCity,
            billingState: customer.billingState || prev.billingState,
            billingZip: customer.billingZip || prev.billingZip,
        }));
        setUseShippingForBilling(customer.useShippingForBilling ?? true);
        sfx.playSuccess();
    }, [setFormData, setUseShippingForBilling]);

    return {
        mode, setMode, loading, error, collision,
        formData, setFormData, handleIdentityChange, handleDobChange, handleAgeChange, autoFillFromCustomer,
        cart, setCart, notes, setNotes,
        useShippingForBilling, setUseShippingForBilling,
        customerTime, grandTotal, productConfig, handleSubmit,
        financials, setFinancials, handleCardInput, cardStatus
    };
};
