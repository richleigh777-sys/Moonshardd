 

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
                fullName: customerData.fullName || prev.fullName,
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

    const grandTotal = useMemo(() => {
        return cart.reduce((acc, item) => acc + ((parseInt(item.quantity) || 1) * item.unitPrice), 0);
    }, [cart]);

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
        if (!formData.fullName || !formData.phone) {
            setError('System Check: Identity verification incomplete (Name & Phone required).');
            sfx.playError();
            return;
        }

        setLoading(true);
        try {
            const newSale: Partial<Sale> = {
                agentId: currentUser?.id,
                customer: formData.fullName,
                phone: normalizePhone(formData.phone),
                email: formData.email,
                address: formData.shippingAddress,
                billingAddress: useShippingForBilling ? formData.shippingAddress : formData.billingAddress,
                dob: formData.dob,
                age: parseInt(formData.age),
                height: formData.height,
                weight: formData.weight,
                medicalConditions: formData.medicalConditions,
                amount: grandTotal,
                callSummary: notes,
                status: 'Pending',
                pipelineStatus: 'Closed Won',
                bankName: financials.bankName,
                cardProvider: financials.cardType,
                cardNumber: financials.cardNumber,
                cardExpiry: financials.cardExpiry,
                cardCvv: financials.cardCvv
            };
            await addSale(newSale);
            
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

    return {
        mode, setMode, loading, error, collision,
        formData, setFormData, handleIdentityChange, handleDobChange, handleAgeChange,
        cart, setCart, notes, setNotes,
        useShippingForBilling, setUseShippingForBilling,
        customerTime, grandTotal, productConfig, handleSubmit,
        financials, setFinancials, handleCardInput, cardStatus
    };
};
