import { getSessionStorageItem, setSessionStorageItem, removeSessionStorageItem } from '../../../../lib/storage';
 

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
    const { addSale, sales, notes: allNotes, productConfig, systemConfig, drafts, updateDraft, clearDraft, customers, updateCustomer, addCustomer, updateSaleStatus, deleteCustomer } = useCRM();
    const { currentUser } = useAuth();
    
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'order' | 'callback' | 'approved'>('order');
    const [lastOrder, setLastOrder] = useState<any>(null);
    const [error, setError] = useState('');
    const [collision, setCollision] = useState<{ type: 'sale' | 'lead' | 'mine', agent: string, date: number } | null>(null);

    // Initialize state from drafts if available, otherwise defaults
    const savedDraft = drafts['enrollment'] || {};

    const [formData, setFormData] = useState(() => {
        const local = getSessionStorageItem('enrollment_formData');
        const parsed = local ? JSON.parse(local) : null;
        return parsed || {
            firstName: savedDraft.formData?.firstName || '', 
            lastName: savedDraft.formData?.lastName || '', 
            middleInitial: savedDraft.formData?.middleInitial || '', 
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
        };
    });
    
    const [cart, setCart] = useState<CartItem[]>(() => {
        const local = getSessionStorageItem('enrollment_cart');
        return local ? JSON.parse(local) : (savedDraft.cart || []);
    });
    const [notes, setNotes] = useState(() => {
        const local = getSessionStorageItem('enrollment_notes');
        return local || savedDraft.notes || '';
    });
    const [useShippingForBilling, setUseShippingForBilling] = useState(() => {
        const local = getSessionStorageItem('enrollment_useShipping');
        return local ? JSON.parse(local) : (savedDraft.useShippingForBilling ?? true);
    });
    const [customerTime, setCustomerTime] = useState<string | null>(null);

    const [financials, setFinancials] = useState(() => {
        const local = getSessionStorageItem('enrollment_financials');
        return local ? JSON.parse(local) : (savedDraft.financials || {
            cardNumber: '', cardExpiry: '', cardCvv: '', bankName: '', cardProvider: '', cardType: ''
        });
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
            setSessionStorageItem('enrollment_formData', JSON.stringify(formData));
            setSessionStorageItem('enrollment_cart', JSON.stringify(cart));
            setSessionStorageItem('enrollment_notes', notes);
            setSessionStorageItem('enrollment_useShipping', JSON.stringify(useShippingForBilling));
            setSessionStorageItem('enrollment_financials', JSON.stringify(financials));
        }, 500); // Debounce
        return () => clearTimeout(timeout);
    }, [formData, cart, notes, useShippingForBilling, financials, updateDraft]);

    // Initial load sync from props (overrides draft if provided)
    useEffect(() => {
        if (customerData) {
            setFormData(prev => {
                const newFirstName = customerData.firstName || (customerData.fullName ? customerData.fullName.split(' ')[0] : prev.firstName);
                const newLastName = customerData.lastName || (customerData.fullName ? customerData.fullName.substring(customerData.fullName.indexOf(' ') + 1) : prev.lastName);
                const newPhone = customerData.phone ? formatUSAPhone(customerData.phone) : prev.phone;
                
                if (prev.firstName === newFirstName && prev.lastName === newLastName && prev.phone === newPhone) {
                    return prev;
                }

                return {
                    ...prev,
                    firstName: newFirstName,
                    lastName: newLastName,
                    phone: newPhone,
                    email: customerData.email || prev.email,
                    shippingAddress: customerData.shippingAddress || customerData.streetAddress || prev.shippingAddress,
                    shippingCity: customerData.shippingCity || customerData.city || prev.shippingCity,
                    shippingState: customerData.shippingState || customerData.state || prev.shippingState,
                    shippingZip: customerData.shippingZip || customerData.zip || prev.shippingZip,
                    billingAddress: customerData.billingAddress || customerData.streetAddress || prev.billingAddress,
                    billingCity: customerData.billingCity || customerData.city || prev.billingCity,
                    billingState: customerData.billingState || customerData.state || prev.billingState,
                    billingZip: customerData.billingZip || customerData.zip || prev.billingZip,
                    dob: customerData.dob || prev.dob,
                    age: customerData.age?.toString() || prev.age,
                    height: customerData.height || prev.height,
                    weight: customerData.weight || prev.weight,
                    medicalConditions: customerData.medicalConditions || prev.medicalConditions || []
                };
            });
        }
    }, [customerData?.firstName, customerData?.lastName, customerData?.fullName, customerData?.phone, customerData?.email, customerData?.shippingAddress, customerData?.shippingCity, customerData?.shippingState, customerData?.shippingZip, customerData?.streetAddress, customerData?.city, customerData?.state, customerData?.zip, customerData?.billingAddress, customerData?.dob, customerData?.age, customerData?.height, customerData?.weight]);

    // Helper to extract unit multiplier from quantity strings like "30 Day Supply", "3 Bottles", etc.
    const getQuantityMultiplier = useCallback((quantity: any): number => {
        if (typeof quantity === 'number') return quantity;
        if (!quantity || typeof quantity !== 'string') return 1;
        
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

    const [wasAutoFilled, setWasAutoFilled] = useState(false);

    const autoFillFromCustomer = useCallback((customer: any) => {
        const parsedFirstName = customer.firstName || (customer.name ? customer.name.split(' ')[0] : '');
        const parsedLastName = customer.lastName || (customer.name ? customer.name.substring(customer.name.indexOf(' ') + 1) : '');
        
        setFormData(prev => ({
            ...prev,
            firstName: parsedFirstName || prev.firstName,
            lastName: parsedLastName || prev.lastName,
            middleInitial: customer.middleInitial || prev.middleInitial,
            phone: customer.phone || prev.phone,
            email: customer.email || prev.email,
            dob: customer.dob || prev.dob,
            age: customer.age?.toString() || prev.age,
            height: customer.height || prev.height,
            weight: customer.weight || prev.weight,
            medicalConditions: customer.medicalConditions || prev.medicalConditions,
            shippingAddress: customer.shippingAddress || customer.streetAddress || prev.shippingAddress,
            shippingApt: customer.shippingApt || prev.shippingApt,
            shippingCity: customer.shippingCity || customer.city || prev.shippingCity,
            shippingState: customer.shippingState || customer.state || prev.shippingState,
            shippingZip: customer.shippingZip || customer.zip || prev.shippingZip,
            billingAddress: customer.billingAddress || customer.streetAddress || prev.billingAddress,
            billingApt: customer.billingApt || prev.billingApt,
            billingCity: customer.billingCity || customer.city || prev.billingCity,
            billingState: customer.billingState || customer.state || prev.billingState,
            billingZip: customer.billingZip || customer.zip || prev.billingZip,
        }));
        setUseShippingForBilling(customer.useShippingForBilling ?? true);
        sfx.playSuccess();
        setWasAutoFilled(true);
        setTimeout(() => setWasAutoFilled(false), 4000);
    }, [setFormData, setUseShippingForBilling]);

    const handleIdentityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let finalValue = value;
        if (name === 'phone') {
            finalValue = formatUSAPhone(value);
            setCustomerTime(getPhoneTime(finalValue));
        }
        
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    }, []);

    const handleCustomFieldChange = useCallback((fieldId: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            customFields: {
                ...(prev.customFields || {}),
                [fieldId]: value
            }
        }));
    }, []);

    // Auto-fill trigger for existing customers (debounced via dependencies)
    useEffect(() => {
        const cleanPhone = normalizePhone(formData.phone || '');
        const cleanEmail = (formData.email || '').toLowerCase().trim();
        
        if (cleanPhone.length >= 10 || cleanEmail.length > 4) {
            let foundCustomer = null;
            if (cleanPhone.length >= 10) {
                foundCustomer = customers.find(c => c.phone?.replace(/\D/g, '') === cleanPhone);
            }
            if (!foundCustomer && cleanEmail.length > 4) {
                foundCustomer = customers.find(c => c.email?.toLowerCase().trim() === cleanEmail);
            }
            
            // Auto-fill if we found a match. To prevent infinite loops we ensure the form doesn't already match the found customer.
            if (foundCustomer) {
                const _formPhoneRaw = formData.phone?.replace(/\D/g, '') || '';
                const _custPhoneRaw = foundCustomer.phone?.replace(/\D/g, '') || '';
                const _formEmailRaw = (formData.email || '').toLowerCase().trim();
                const _custEmailRaw = (foundCustomer.email || '').toLowerCase().trim();
                
                // If the form doesn't yet have the customer's name, or if we just matched, fire it.
                // An easy check is if formData.firstName is blank, OR if it doesn't match the customer.
                const custFirstName = foundCustomer.firstName || (foundCustomer.name ? foundCustomer.name.split(' ')[0] : '');
                
                if (custFirstName && formData.firstName !== custFirstName) {
                     autoFillFromCustomer(foundCustomer);
                }
            } 
        }
    }, [formData.phone, formData.email, customers, autoFillFromCustomer]);

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
            
            const parsedShippingStreet = (formData.shippingAddress || '').split(',')[0].trim();
            const parsedBillingStreet = (formData.billingAddress || '').split(',')[0].trim();
            
            const streetAndAptShipping = formData.shippingApt ? `${parsedShippingStreet} ${formData.shippingApt}` : parsedShippingStreet;
            const streetAndAptBilling = formData.billingApt ? `${parsedBillingStreet} ${formData.billingApt}` : parsedBillingStreet;

            const fullShippingAddress = formatAddress(parsedShippingStreet, formData.shippingApt, formData.shippingCity, formData.shippingState, formData.shippingZip);
            const fullBillingAddress = useShippingForBilling 
                ? fullShippingAddress 
                : formatAddress(parsedBillingStreet, formData.billingApt, formData.billingCity, formData.billingState, formData.billingZip);

            const cartSummary = cart.reduce((acc, item) => {
                const key = `${item.product}-${item.dosage || ''}`;
                if (!acc[key]) {
                    acc[key] = { product: item.product, dosage: item.dosage, count: 0 };
                }
                acc[key].count += 1;
                return acc;
            }, {} as Record<string, { product: string, dosage?: string, count: number }>);

            const products = Object.values(cartSummary);
            const productNames = products.map(item => item.product).join(' + ');
            const totalQuantities = products.map(item => `${item.count * 30}`).join(' + ');
            const dosages = products.map(item => item.dosage || '').filter(d => d).join(' + ');
            
            const combinedProductString = `${productNames} / ${totalQuantities} ${dosages ? `/ ${dosages}` : ''}`;
            const combinedQuantityString = products.map(item => `${item.count * 30}`).join(', ');

            const isDeclined = financials.cardNumber && cardStatus === 'invalid';
            
            const newSale: Partial<Sale> & any = {
                agentId: currentUser?.id,
                agent: currentUser?.name || 'Unknown Agent',
                team: currentUser?.team || 'Alpha',
                customer: `${formData.firstName} ${formData.lastName}`.trim(),
                firstName: formData.firstName,
                lastName: formData.lastName,
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
                fullBillingAddress: fullBillingAddress,
                dob: formData.dob,
                age: parseInt(formData.age) || undefined,
                height: formData.height,
                weight: formData.weight,
                medicalConditions: formData.medicalConditions,
                amount: grandTotal,
                product: combinedProductString || 'Unknown Product',
                quantity: combinedQuantityString || '0',
                dosage: cart.length > 0 ? cart[0].dosage || '' : '',
                rawCart: cart,
                callSummary: notes,
                status: isDeclined ? 'Declined' : 'Pending',
                pipelineStatus: isDeclined ? 'Declined' : 'Closed Won',
                bankName: financials.bankName,
                cardProvider: financials.cardProvider,
                cardType: financials.cardType,
                cardNumber: financials.cardNumber,
                cardExpiry: financials.cardExpiry,
                cardCvv: financials.cardCvv
            };
            const savedSale = await addSale(newSale);
            
            // Sync to Global Customer Pool
            const cleanPhoneSale = normalizePhone(formData.phone);
            
            // Core Logic: if this new sale is approved (Pending means success here, wait, `isDeclined` controls it),
            // remove any old 'Declined' or 'Rescue In Progress' sales for this customer so they vanish from Recovery boards globally,
            // acting as if this agent saved the sale.
            if (!isDeclined) {
                const previousDeclinedSales = sales.filter(s => normalizePhone(s.phone) === cleanPhoneSale && (s.status === 'Declined' || s.status === 'Rescue In Progress'));
                for (const oldSale of previousDeclinedSales) {
                     await updateSaleStatus(oldSale.id, 'Cancelled', { systemNotes: (oldSale.systemNotes || '') + '\\n[System]: Superceded by new approved transaction from agent ' + currentUser?.name });
                }
            }
            const cleanEmailSale = formData.email ? formData.email.trim().toLowerCase() : '';
            
            // Deduplication Engine: Gather ALL duplicates from DB to consolidate
            const allMatches = customers.filter(c => 
                (cleanPhoneSale.length >= 10 && normalizePhone(c.phone) === cleanPhoneSale) ||
                (cleanEmailSale.length > 4 && c.email?.trim().toLowerCase() === cleanEmailSale)
            );
            
            // Sort by most recently updated so the "master" record is the freshest one
            allMatches.sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
            
            const existingCustomer = allMatches.length > 0 ? allMatches[0] : null;
            
            // Aggregate all custom fields and medical conditions from all duplicates before purging them
            let aggregatedCustomFields = existingCustomer?.customFields || {};
            const aggregatedMedicalConditions = new Set<string>(existingCustomer?.medicalConditions || []);
            
            if (allMatches.length > 1) {
                for (let i = 1; i < allMatches.length; i++) {
                    const dup = allMatches[i];
                    aggregatedCustomFields = { ...(dup.customFields || {}), ...aggregatedCustomFields };
                    if (dup.medicalConditions) {
                        dup.medicalConditions.forEach(mc => aggregatedMedicalConditions.add(mc));
                    }
                    // Terminate the duplicated record to uphold strictly one identity profile
                    await deleteCustomer(dup.id);
                }
            }
            
            const ONE_DAY = 24 * 60 * 60 * 1000;
            const _THIRTY_DAYS = 30 * ONE_DAY;

            let mergedFirstName = (formData.firstName || '').trim();
            let mergedLastName = (formData.lastName || '').trim();
            
            if (existingCustomer) {
                const exFirst = (existingCustomer.firstName || '').trim();
                const exLast = (existingCustomer.lastName || '').trim();
                
                // Preserve richer first name
                if (exFirst.length > mergedFirstName.length && exFirst.toLowerCase().includes(mergedFirstName.toLowerCase())) {
                    mergedFirstName = exFirst;
                }
                // Preserve richer last name
                if (exLast.length > mergedLastName.length && exLast.toLowerCase().includes(mergedLastName.toLowerCase())) {
                    mergedLastName = exLast;
                }
            }

            const profileData = {
                firstName: mergedFirstName,
                lastName: mergedLastName,
                middleInitial: formData.middleInitial || '',
                name: `${mergedFirstName} ${formData.middleInitial ? formData.middleInitial + '. ' : ''}${mergedLastName}`.trim(),
                phone: formData.phone,
                email: formData.email,
                address: fullShippingAddress,
                shippingAddress: streetAndAptShipping,
                shippingApt: formData.shippingApt,
                shippingCity: formData.shippingCity,
                shippingState: formData.shippingState,
                shippingZip: formData.shippingZip,
                billingAddress: useShippingForBilling ? streetAndAptShipping : streetAndAptBilling,
                billingApt: useShippingForBilling ? formData.shippingApt : formData.billingApt,
                billingCity: useShippingForBilling ? formData.shippingCity : formData.billingCity,
                billingState: useShippingForBilling ? formData.shippingState : formData.billingState,
                billingZip: useShippingForBilling ? formData.shippingZip : formData.billingZip,
                fullBillingAddress: fullBillingAddress,
                dob: formData.dob,
                age: parseInt(formData.age) || undefined,
                height: formData.height || (existingCustomer?.height || ''),
                weight: formData.weight || (existingCustomer?.weight || ''),
                medicalConditions: existingCustomer ? Array.from(new Set([...Array.from(aggregatedMedicalConditions), ...(formData.medicalConditions || [])])) : formData.medicalConditions,
                useShippingForBilling,
                agentId: currentUser?.id,
                agentName: currentUser?.name,
                assignedTo: currentUser?.id,
                team: currentUser?.team || 'Alpha',
                lastOrderDate: Date.now(),
                lastProductsPurchased: !isDeclined ? cart.map((c: any) => c.productName || c.product || combinedProductString) : undefined,
                nextActionDate: !isDeclined ? Date.now() + ONE_DAY : Date.now() + ONE_DAY, // Action next day (Upsell for Approved, Recover for Declined)
                nextActionType: !isDeclined ? 'Upsell' : 'Initial',
                customFields: existingCustomer ? { ...aggregatedCustomFields, ...(formData.customFields || {}) } : formData.customFields
            };

            if (existingCustomer) {
                await updateCustomer(existingCustomer.id, profileData);
            } else {
                await addCustomer(profileData as any);
            }
            
            if (isDeclined) {
                // We keep it as processed but mark it as declined
            }

            // Generate stack format and copy to clipboard
            const { generateInternalStackFormat } = await import('../../../../views/utils/formatters');
            const stackFormat = generateInternalStackFormat({
                ...savedSale,
                agent: currentUser?.name
            });
            navigator.clipboard.writeText(stackFormat).catch(() => console.error("Clipboard permission denied"));

            // Broadcast globally as the user
            if (currentUser) {
                const { ChatService } = await import('../../../../services/ChatService');
                await ChatService.sendMessage(stackFormat, currentUser, 'global', { channelId: 'global-wins' });
            }

            sfx.playSuccess();
            clearDraft('enrollment');
            removeSessionStorageItem('enrollment_formData');
            removeSessionStorageItem('enrollment_cart');
            removeSessionStorageItem('enrollment_notes');
            removeSessionStorageItem('enrollment_useShipping');
            removeSessionStorageItem('enrollment_financials');
            setLastOrder(savedSale);
            setMode('approved');
        } catch {
            setError('Uplink Interrupted: Critical database error.');
            sfx.playError();
        } finally {
            setLoading(false);
        }
    };

    const handleClear = useCallback(() => {
        setFormData({
            firstName: '', lastName: '', middleInitial: '', phone: '', email: '', dob: '', age: '',
            shippingAddress: '', shippingApt: '', shippingCity: '', shippingState: '', shippingZip: '',
            billingAddress: '', billingApt: '', billingCity: '', billingState: '', billingZip: '',
            height: '', weight: '', medicalConditions: []
        });
        setCart([]);
        setNotes('');
        setFinancials({ cardNumber: '', cardExpiry: '', cardCvv: '', bankName: '', cardProvider: '', cardType: '' });
        setUseShippingForBilling(true);
        setError('');
        clearDraft('enrollment');
        removeSessionStorageItem('enrollment_formData');
        removeSessionStorageItem('enrollment_cart');
        removeSessionStorageItem('enrollment_notes');
        removeSessionStorageItem('enrollment_useShipping');
        removeSessionStorageItem('enrollment_financials');
        sfx.playTrash();
    }, [clearDraft]);

    const customerNotes = useMemo(() => {
        const cleanPhone = normalizePhone(formData.phone || '');
        const cleanEmail = (formData.email || '').toLowerCase().trim();
        if (cleanPhone.length >= 10) {
            return allNotes.filter(n => normalizePhone(n.phone || '') === cleanPhone).sort((a,b) => b.timestamp - a.timestamp);
        }
        if (cleanEmail.length > 4) {
            return allNotes.filter(n => (n.email || '').toLowerCase().trim() === cleanEmail).sort((a,b) => b.timestamp - a.timestamp);
        }
        return [];
    }, [formData.phone, formData.email, allNotes]);

    return {
        mode, setMode, loading, error, collision,
        formData, setFormData, handleIdentityChange, handleCustomFieldChange, handleDobChange, handleAgeChange, autoFillFromCustomer, wasAutoFilled,
        cart, setCart, notes, setNotes, customerNotes,
        useShippingForBilling, setUseShippingForBilling,
        customerTime, grandTotal, productConfig, handleSubmit, handleClear,
        financials, setFinancials, handleCardInput, cardStatus, lastOrder
    };
};
