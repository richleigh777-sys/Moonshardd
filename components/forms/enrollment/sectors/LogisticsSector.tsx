/// <reference types="@types/google.maps" />
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, ShieldCheck, Globe, Crosshair, Check, Sparkles } from 'lucide-react';
import { FormInput, FormLabel, FormSelect } from '../shared/FormComponents';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { useCRM } from '../../../../hooks/useCRM';

const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

interface Props {
    formData: any;
    handleIdentityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    useShippingForBilling: boolean;
    setUseShippingForBilling: (val: boolean) => void;
}

export const LogisticsSector: React.FC<Props> = ({ formData, handleIdentityChange, useShippingForBilling, setUseShippingForBilling }) => {
    const [suggestedShipping, setSuggestedShipping] = useState<{street: string, city: string, state: string, zip: string} | null>(null);
    const [suggestedBilling, setSuggestedBilling] = useState<{street: string, city: string, state: string, zip: string} | null>(null);
    const [showShippingDetails, setShowShippingDetails] = useState(false);
    const [showBillingDetails, setShowBillingDetails] = useState(false);

    const { customers } = useCRM();

    const places = useMapsLibrary('places');
    const shippingInputRef = useRef<HTMLInputElement>(null);
    const billingInputRef = useRef<HTMLInputElement>(null);
    const shippingAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const billingAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    const handlePlaceSelection = (place: google.maps.places.PlaceResult, type: 'shipping' | 'billing') => {
        if (!place.address_components) return;
        
        let streetNumber = '';
        let route = '';
        let city = '';
        let state = '';
        let zip = '';

        place.address_components.forEach(component => {
            const types = component.types;
            if (types.includes('street_number')) {
                streetNumber = component.long_name;
            }
            if (types.includes('route')) {
                route = component.short_name || component.long_name;
            }
            if (types.includes('locality') || types.includes('sublocality_level_1')) {
                city = component.long_name;
            }
            if (types.includes('administrative_area_level_1')) {
                state = component.short_name;
            }
            if (types.includes('postal_code')) {
                zip = component.long_name;
            }
        });

        const address = `${streetNumber} ${route}`.trim();
        const prefix = type === 'shipping' ? 'shipping' : 'billing';
        
        if (address) handleIdentityChange({ target: { name: `${prefix}Address`, value: address } } as any);
        if (city) handleIdentityChange({ target: { name: `${prefix}City`, value: city } } as any);
        if (state) handleIdentityChange({ target: { name: `${prefix}State`, value: state } } as any);
        if (zip) handleIdentityChange({ target: { name: `${prefix}Zip`, value: zip } } as any);
        
        if (type === 'shipping') setSuggestedShipping(null);
        if (type === 'billing') setSuggestedBilling(null);
    };

    useEffect(() => {
        if (!places || !shippingInputRef.current) return;
        const options = {
            fields: ['address_components', 'formatted_address'],
            types: ['address']
        };
        const autocomplete = new places.Autocomplete(shippingInputRef.current, options);
        shippingAutocompleteRef.current = autocomplete;
        const listener = autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            handlePlaceSelection(place, 'shipping');
        });
        return () => {
            google.maps.event.removeListener(listener);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [places]);

    useEffect(() => {
        if (!places || !billingInputRef.current) return;
        const options = {
            fields: ['address_components', 'formatted_address'],
            types: ['address']
        };
        const autocomplete = new places.Autocomplete(billingInputRef.current, options);
        billingAutocompleteRef.current = autocomplete;
        const listener = autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            handlePlaceSelection(place, 'billing');
        });
        return () => {
            google.maps.event.removeListener(listener);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [places]);

    const toTitleCase = (str: string) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

    const parseAddress = (input: string) => {
        const text = input.replace(/\r?\n/g, ', ').replace(/\s+/g, ' ').trim();
        if (!text) return null;

        let street = text;
        let city = '';
        let state = '';
        let zip = '';

        const parts = text.split(',').map(s => s.trim()).filter(Boolean);
        if (parts.length >= 2) {
            street = toTitleCase(parts[0]);
            if (parts.length >= 3) {
                 city = toTitleCase(parts[1]);
                 const stateZip = parts[2].split(' ');
                 if (stateZip.length >= 2) {
                     zip = stateZip.pop() || '';
                     state = stateZip.join(' ').toUpperCase();
                 } else {
                     state = stateZip[0].toUpperCase();
                 }
            } else {
                 const stateZip = parts[1].split(' ');
                 if (stateZip.length >= 3) {
                     city = toTitleCase(stateZip.slice(0, -2).join(' '));
                     zip = stateZip.pop() || '';
                     state = stateZip.pop()?.toUpperCase() || '';
                 } else if (stateZip.length >= 2) {
                     zip = stateZip.pop() || '';
                     state = stateZip.join(' ').toUpperCase();
                 }
            }
        } else {
            const words = text.split(' ');
            if (words.length >= 4) {
               zip = words.pop() || '';
               state = (words.pop() || '').toUpperCase();
               city = toTitleCase(words.pop() || '');
               street = toTitleCase(words.join(' '));
            } else {
               street = toTitleCase(text);
            }
        }

        if (city || state || zip) {
            return { street, city, state, zip };
        }
        return { street: toTitleCase(input), city: '', state: '', zip: '' };
    };

    const [isValidatingApi, setIsValidatingApi] = useState(false);

    const validateWithAPI = async (rawString: string) => {
        try {
            setIsValidatingApi(true);
            const res = await fetch('/api/address/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ addressLines: [rawString] })
            });
            const data = await res.json();
            if (data.success && data.validation && data.validation.components) {
                return {
                    components: data.validation.components,
                    standardized: data.validation.standardized
                };
            }
        } catch (e) {
            console.error('Validation API error', e);
        } finally {
            setIsValidatingApi(false);
        }
        return null;
    };

    const findCustomerAddress = (query: string, type: 'shipping' | 'billing') => {
        const q = query.toLowerCase().trim();
        if (!q || q.length < 5) return null;
        
        const phone = formData.phone?.replace(/\D/g, '');
        if (phone && phone.length >= 10) {
            const customer = customers.find(c => c.phone?.replace(/\D/g, '') === phone);
            if (customer) {
                const addr = type === 'shipping' ? customer.shippingAddress : customer.billingAddress;
                if (addr && addr.toLowerCase().startsWith(q)) {
                    return {
                        street: addr,
                        city: type === 'shipping' ? customer.shippingCity : customer.billingCity,
                        state: type === 'shipping' ? customer.shippingState : customer.billingState,
                        zip: type === 'shipping' ? customer.shippingZip : customer.billingZip,
                    };
                }
            }
        }
        
        for (const customer of customers) {
            const addr = type === 'shipping' ? customer.shippingAddress : customer.billingAddress;
            if (addr && addr.toLowerCase().startsWith(q)) {
                return {
                    street: addr,
                    city: type === 'shipping' ? customer.shippingCity : customer.billingCity,
                    state: type === 'shipping' ? customer.shippingState : customer.billingState,
                    zip: type === 'shipping' ? customer.shippingZip : customer.billingZip,
                };
            }
        }
        return null;
    };

    const handleStreetShippingBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (!val || val.length < 5) return;
        
        // 1. Check local database first
        const localMatch = findCustomerAddress(val, 'shipping');
        if (localMatch) {
            if (localMatch.street) handleIdentityChange({ target: { name: 'shippingAddress', value: localMatch.street } } as any);
            if (localMatch.city) handleIdentityChange({ target: { name: 'shippingCity', value: localMatch.city } } as any);
            if (localMatch.state) handleIdentityChange({ target: { name: 'shippingState', value: localMatch.state } } as any);
            if (localMatch.zip) handleIdentityChange({ target: { name: 'shippingZip', value: localMatch.zip } } as any);
            setSuggestedShipping(null);
            return;
        }

        // 2. Validate with external API
        const apiResponse = await validateWithAPI(val);
        
        if (apiResponse && apiResponse.components && (apiResponse.components.city || apiResponse.components.state || apiResponse.components.zip)) {
            // API returned structured data
            if (apiResponse.standardized || apiResponse.components.street) handleIdentityChange({ target: { name: 'shippingAddress', value: apiResponse.standardized || apiResponse.components.street } } as any);
            if (apiResponse.components.city) handleIdentityChange({ target: { name: 'shippingCity', value: apiResponse.components.city } } as any);
            if (apiResponse.components.state) handleIdentityChange({ target: { name: 'shippingState', value: apiResponse.components.state } } as any);
            if (apiResponse.components.zip) handleIdentityChange({ target: { name: 'shippingZip', value: apiResponse.components.zip } } as any);
            setSuggestedShipping(null);
        } else {
            // Fallback to local parsing if API fails
            const parsed = parseAddress(val);
            if (parsed) {
                handleIdentityChange({ target: { name: 'shippingAddress', value: parsed.street } } as any);
                if (parsed.city) handleIdentityChange({ target: { name: 'shippingCity', value: parsed.city } } as any);
                if (parsed.state) handleIdentityChange({ target: { name: 'shippingState', value: parsed.state } } as any);
                if (parsed.zip) handleIdentityChange({ target: { name: 'shippingZip', value: parsed.zip } } as any);
                setSuggestedShipping(null);
            }
        }
    };

    const handleStreetBillingBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (!val || val.length < 5) return;
        
        // 1. Check local database first
        const localMatch = findCustomerAddress(val, 'billing');
        if (localMatch) {
            if (localMatch.street) handleIdentityChange({ target: { name: 'billingAddress', value: localMatch.street } } as any);
            if (localMatch.city) handleIdentityChange({ target: { name: 'billingCity', value: localMatch.city } } as any);
            if (localMatch.state) handleIdentityChange({ target: { name: 'billingState', value: localMatch.state } } as any);
            if (localMatch.zip) handleIdentityChange({ target: { name: 'billingZip', value: localMatch.zip } } as any);
            setSuggestedBilling(null);
            return;
        }

        // 2. Validate with external API
        const apiResponse = await validateWithAPI(val);
        
        if (apiResponse && apiResponse.components && (apiResponse.components.city || apiResponse.components.state || apiResponse.components.zip)) {
            if (apiResponse.standardized || apiResponse.components.street) handleIdentityChange({ target: { name: 'billingAddress', value: apiResponse.standardized || apiResponse.components.street } } as any);
            if (apiResponse.components.city) handleIdentityChange({ target: { name: 'billingCity', value: apiResponse.components.city } } as any);
            if (apiResponse.components.state) handleIdentityChange({ target: { name: 'billingState', value: apiResponse.components.state } } as any);
            if (apiResponse.components.zip) handleIdentityChange({ target: { name: 'billingZip', value: apiResponse.components.zip } } as any);
            setSuggestedBilling(null);
        } else {
            const parsed = parseAddress(val);
            if (parsed) {
                handleIdentityChange({ target: { name: 'billingAddress', value: parsed.street } } as any);
                if (parsed.city) handleIdentityChange({ target: { name: 'billingCity', value: parsed.city } } as any);
                if (parsed.state) handleIdentityChange({ target: { name: 'billingState', value: parsed.state } } as any);
                if (parsed.zip) handleIdentityChange({ target: { name: 'billingZip', value: parsed.zip } } as any);
                setSuggestedBilling(null);
            }
        }
    };

    const handleStreetShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        handleIdentityChange(e);
        const parsed = parseAddress(val);
        if (parsed) {
            setSuggestedShipping(parsed);
        } else {
            setSuggestedShipping(null);
        }
    };

    const applyShippingSuggestion = () => {
        if (!suggestedShipping) return;
        handleIdentityChange({ target: { name: 'shippingAddress', value: suggestedShipping.street } } as any);
        handleIdentityChange({ target: { name: 'shippingCity', value: suggestedShipping.city } } as any);
        handleIdentityChange({ target: { name: 'shippingState', value: suggestedShipping.state } } as any);
        handleIdentityChange({ target: { name: 'shippingZip', value: suggestedShipping.zip } } as any);
        setSuggestedShipping(null);
    };

    const handleStreetBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        handleIdentityChange(e);
        const parsed = parseAddress(val);
        if (parsed) {
            setSuggestedBilling(parsed);
        } else {
            setSuggestedBilling(null);
        }
    };

    const applyBillingSuggestion = () => {
        if (!suggestedBilling) return;
        handleIdentityChange({ target: { name: 'billingAddress', value: suggestedBilling.street } } as any);
        handleIdentityChange({ target: { name: 'billingCity', value: suggestedBilling.city } } as any);
        handleIdentityChange({ target: { name: 'billingState', value: suggestedBilling.state } } as any);
        handleIdentityChange({ target: { name: 'billingZip', value: suggestedBilling.zip } } as any);
        setSuggestedBilling(null);
    };

    return (
        <div className="group/logistics relative p-4 bg-surface-alt/40 rounded-xl border border-border-subtle shadow-inner overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/[0.02] to-transparent pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-500/20 rounded-lg text-accent-secondary border border-indigo-500/30">
                        <MapPin size={16} strokeWidth={2.5}/>
                    </div>
                    <div>
                        <h4 className="text-xs font-[700]  text-indigo-300 tracking-[0.15em] italic leading-none">Logistics</h4>
                    </div>
                </div>
                <button 
                    onClick={() => setUseShippingForBilling(!useShippingForBilling)} 
                    className={`
                        text-sm font-[700]  px-3 py-1 rounded-lg border transition-all duration-500 flex items-center gap-1.5
                        ${useShippingForBilling 
                            ? 'bg-emerald-500/20 text-status-success border-status-success/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                            : 'bg-surface-highlight text-text-muted border-border-subtle hover:text-text-primary hover:border-border-strong'}
                    `}
                >
                    {useShippingForBilling ? <ShieldCheck size={16} strokeWidth={3}/> : <Globe size={16}/>}
                    Unified
                </button>
            </div>

            <div className="space-y-4 relative z-10">
                <div className="space-y-2 relative border border-transparent hover:border-border-subtle p-2 -mx-2 rounded-lg transition-colors group/section">
                    <div className="flex items-center justify-between">
                        <FormLabel icon={Crosshair} className="mb-0">Shipping Address</FormLabel>
                        <button 
                            type="button" 
                            onClick={() => setShowShippingDetails(!showShippingDetails)}
                            className="text-[10px] text-text-muted hover:text-accent-primary opacity-0 group-hover/section:opacity-100 transition-opacity"
                        >
                            {showShippingDetails ? 'Hide Details' : 'Edit Details'}
                        </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                         <div className="col-span-3">
                            <FormInput 
                                ref={shippingInputRef}
                                name="shippingAddress" 
                                value={formData.shippingAddress} 
                                onChange={handleStreetShippingChange} 
                                onBlur={handleStreetShippingBlur}
                                placeholder="Address 1" 
                                className="h-9 text-xs font-bold bg-surface-alt/40"
                                status={formData.shippingAddress?.length > 10 ? 'valid' : 'default'}
                            />
                         </div>
                         <div className="col-span-1">
                             <FormInput name="shippingApt" value={formData.shippingApt || ''} onChange={handleIdentityChange} placeholder="Apt/Unit" className="h-9 text-xs font-bold bg-surface-alt/40" />
                         </div>
                    </div>
                    
                    {showShippingDetails && (
                        <div className="grid grid-cols-3 gap-2 animate-in slide-in-from-top-1 fadeIn">
                            <div className="col-span-1">
                                <FormInput name="shippingCity" value={formData.shippingCity || ''} onChange={handleIdentityChange} placeholder="City" className="h-9 text-xs font-bold bg-surface-alt/40" />
                            </div>
                            <div className="col-span-1">
                                <FormSelect name="shippingState" value={formData.shippingState || ''} onChange={handleIdentityChange as any} className="h-9 text-xs font-bold bg-surface-alt/40">
                                    <option value="">State</option>
                                    {US_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                                </FormSelect>
                            </div>
                            <div className="col-span-1">
                                <FormInput name="shippingZip" value={formData.shippingZip || ''} onChange={handleIdentityChange} placeholder="Zip Code" className="h-9 text-xs font-bold bg-surface-alt/40" />
                            </div>
                        </div>
                    )}
                    
                    {suggestedShipping && (
                        <div 
                            onClick={applyShippingSuggestion}
                            className="absolute top-16 left-0 right-0 z-50 bg-indigo-900/90 backdrop-blur-md border border-indigo-500/50 p-2 inset-x-0 rounded-lg shadow-xl cursor-pointer hover:bg-indigo-800 transition-colors flex items-center justify-between group"
                        >
                            <div className="flex flex-col">
                                <span className="text-[10px] text-indigo-300 font-bold tracking-widest flex items-center gap-1"><Sparkles size={12}/> Auto-Detect Found:</span>
                                <span className="text-xs text-white font-mono mt-0.5">{suggestedShipping.street}, {suggestedShipping.city}, {suggestedShipping.state} {suggestedShipping.zip}</span>
                            </div>
                            <div className="p-1 bg-emerald-500/20 border border-emerald-500 text-emerald-400 rounded group-hover:scale-110 transition-transform">
                                <Check size={14} />
                            </div>
                        </div>
                    )}
                </div>

                {!useShippingForBilling && (
                    <div className="space-y-2 relative animate-in slide-in-from-top-2 duration-300 border border-transparent hover:border-border-subtle p-2 -mx-2 rounded-lg transition-colors group/section">
                        <div className="flex items-center justify-between">
                            <FormLabel icon={ShieldCheck} className="mb-0">Billing Address</FormLabel>
                            <button 
                                type="button" 
                                onClick={() => setShowBillingDetails(!showBillingDetails)}
                                className="text-[10px] text-text-muted hover:text-accent-primary opacity-0 group-hover/section:opacity-100 transition-opacity"
                            >
                                {showBillingDetails ? 'Hide Details' : 'Edit Details'}
                            </button>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                             <div className="col-span-3">
                                <FormInput 
                                    ref={billingInputRef}
                                    name="billingAddress" 
                                    value={formData.billingAddress} 
                                    onChange={handleStreetBillingChange} 
                                    onBlur={handleStreetBillingBlur}
                                    placeholder="Address 1" 
                                    className="h-9 text-xs font-bold bg-surface-alt/40"
                                />
                             </div>
                             <div className="col-span-1">
                                 <FormInput name="billingApt" value={formData.billingApt || ''} onChange={handleIdentityChange} placeholder="Apt/Unit" className="h-9 text-xs font-bold bg-surface-alt/40" />
                             </div>
                        </div>
                        
                        {showBillingDetails && (
                            <div className="grid grid-cols-3 gap-2 animate-in slide-in-from-top-1 fadeIn">
                                <div className="col-span-1">
                                    <FormInput name="billingCity" value={formData.billingCity || ''} onChange={handleIdentityChange} placeholder="City" className="h-9 text-xs font-bold bg-surface-alt/40" />
                                </div>
                                <div className="col-span-1">
                                    <FormSelect name="billingState" value={formData.billingState || ''} onChange={handleIdentityChange as any} className="h-9 text-xs font-bold bg-surface-alt/40">
                                        <option value="">State</option>
                                        {US_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                                    </FormSelect>
                                </div>
                                <div className="col-span-1">
                                    <FormInput name="billingZip" value={formData.billingZip || ''} onChange={handleIdentityChange} placeholder="Zip Code" className="h-9 text-xs font-bold bg-surface-alt/40" />
                                </div>
                            </div>
                        )}
                        
                        {suggestedBilling && (
                            <div 
                                onClick={applyBillingSuggestion}
                                className="absolute top-16 left-0 right-0 z-50 bg-indigo-900/90 backdrop-blur-md border border-indigo-500/50 p-2 inset-x-0 rounded-lg shadow-xl cursor-pointer hover:bg-indigo-800 transition-colors flex items-center justify-between group"
                            >
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-indigo-300 font-bold tracking-widest flex items-center gap-1"><Sparkles size={12}/> Auto-Detect Found:</span>
                                    <span className="text-xs text-white font-mono mt-0.5">{suggestedBilling.street}, {suggestedBilling.city}, {suggestedBilling.state} {suggestedBilling.zip}</span>
                                </div>
                                <div className="p-1 bg-emerald-500/20 border border-emerald-500 text-emerald-400 rounded group-hover:scale-110 transition-transform">
                                    <Check size={14} />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};