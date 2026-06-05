/// <reference types="@types/google.maps" />
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ShieldCheck, Globe, Check, Sparkles } from 'lucide-react';
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

    const { customers } = useCRM();

    const places = useMapsLibrary('places');
    const shippingInputRef = useRef<HTMLInputElement>(null);
    const billingInputRef = useRef<HTMLInputElement>(null);

    const handlePlaceSelection = (place: google.maps.places.PlaceResult, type: 'shipping' | 'billing') => {
        if (!place.address_components) return;
        
        let streetNumber = '';
        let route = '';
        let city = '';
        let state = '';
        let zip = '';

        place.address_components.forEach(component => {
            const types = component.types;
            if (types.includes('street_number')) streetNumber = component.long_name;
            if (types.includes('route')) route = component.short_name || component.long_name;
            if (types.includes('locality') || types.includes('sublocality_level_1')) city = component.long_name;
            if (types.includes('administrative_area_level_1')) state = component.short_name;
            if (types.includes('postal_code')) zip = component.long_name;
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
        const autocomplete = new places.Autocomplete(shippingInputRef.current, {
            fields: ['address_components', 'formatted_address'],
            types: ['address']
        });
        const listener = autocomplete.addListener('place_changed', () => handlePlaceSelection(autocomplete.getPlace(), 'shipping'));
        return () => google.maps.event.removeListener(listener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [places]);

    useEffect(() => {
        if (!places || !billingInputRef.current) return;
        const autocomplete = new places.Autocomplete(billingInputRef.current, {
            fields: ['address_components', 'formatted_address'],
            types: ['address']
        });
        const listener = autocomplete.addListener('place_changed', () => handlePlaceSelection(autocomplete.getPlace(), 'billing'));
        return () => google.maps.event.removeListener(listener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [places]);

    const toTitleCase = (str: string) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

    const parseAddress = (input: string) => {
        const text = input.replace(/\r?\n/g, ', ').replace(/\s+/g, ' ').trim();
        if (!text) return null;

        let street = text, city = '', state = '', zip = '';
        const parts = text.split(',').map(s => s.trim()).filter(Boolean);
        if (parts.length >= 2) {
            street = toTitleCase(parts[0]);
            if (parts.length >= 3) {
                 city = toTitleCase(parts[1]);
                 const stateZip = parts[2].split(' ');
                 if (stateZip.length >= 2) {
                     zip = stateZip.pop() || '';
                     state = stateZip.join(' ').toUpperCase();
                 } else { state = stateZip[0].toUpperCase(); }
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
               zip = words.pop() || ''; state = (words.pop() || '').toUpperCase();
               city = toTitleCase(words.pop() || ''); street = toTitleCase(words.join(' '));
            } else { street = toTitleCase(text); }
        }

        if (city || state || zip) return { street, city, state, zip };
        return { street: toTitleCase(input), city: '', state: '', zip: '' };
    };

    const findCustomerAddress = (query: string, type: 'shipping' | 'billing') => {
        const q = query.toLowerCase().trim();
        if (!q || q.length < 5) return null;
        
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

    const handleStreetBlur = async (e: React.FocusEvent<HTMLInputElement>, type: 'shipping' | 'billing') => {
        const val = e.target.value;
        if (!val || val.length < 5) return;
        
        const localMatch = findCustomerAddress(val, type);
        if (localMatch) {
            if (localMatch.street) handleIdentityChange({ target: { name: `${type}Address`, value: localMatch.street } } as any);
            if (localMatch.city) handleIdentityChange({ target: { name: `${type}City`, value: localMatch.city } } as any);
            if (localMatch.state) handleIdentityChange({ target: { name: `${type}State`, value: localMatch.state } } as any);
            if (localMatch.zip) handleIdentityChange({ target: { name: `${type}Zip`, value: localMatch.zip } } as any);
            if (type === 'shipping') {
                setSuggestedShipping(null);
            } else {
                setSuggestedBilling(null);
            }
            return;
        }

        const parsed = parseAddress(val);
        if (parsed) {
            handleIdentityChange({ target: { name: `${type}Address`, value: parsed.street } } as any);
            if (parsed.city) handleIdentityChange({ target: { name: `${type}City`, value: parsed.city } } as any);
            if (parsed.state) handleIdentityChange({ target: { name: `${type}State`, value: parsed.state } } as any);
            if (parsed.zip) handleIdentityChange({ target: { name: `${type}Zip`, value: parsed.zip } } as any);
            if (type === 'shipping') {
                setSuggestedShipping(null);
            } else {
                setSuggestedBilling(null);
            }
        }
    };

    const handleStreetChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'shipping' | 'billing') => {
        handleIdentityChange(e);
        const parsed = parseAddress(e.target.value);
        if (type === 'shipping') {
            setSuggestedShipping(parsed);
        } else {
            setSuggestedBilling(parsed);
        }
    };

    return (
        <div className="p-5 bg-surface-alt/40 rounded-xl border border-border-subtle relative overflow-visible shadow-sm">
            <div className="flex items-center justify-between mb-5 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-500/10 rounded-lg text-accent-primary border border-indigo-500/20">
                        <MapPin size={16} strokeWidth={2.5}/>
                    </div>
                    <h4 className="text-xs font-[700] text-text-primary tracking-wide uppercase">Shipping & Billing</h4>
                </div>
                <button 
                    onClick={() => setUseShippingForBilling(!useShippingForBilling)} 
                    className={`
                        text-xs font-bold px-3 py-1.5 rounded-lg border transition-all duration-300 flex items-center gap-1.5
                        ${useShippingForBilling 
                            ? 'bg-status-success/10 text-status-success border-status-success/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                            : 'bg-surface-main text-text-muted border-border-subtle hover:text-text-primary'}
                    `}
                >
                    {useShippingForBilling ? <ShieldCheck size={14} strokeWidth={2.5}/> : <Globe size={14}/>}
                    Same as Shipping
                </button>
            </div>

            <div className="space-y-6 relative z-10">
                <AddressBlock 
                    type="shipping" 
                    title="Delivery Address" 
                    icon={MapPin} 
                    inputRef={shippingInputRef}
                    suggestion={suggestedShipping}
                    formData={formData}
                    handleIdentityChange={handleIdentityChange}
                    handleStreetChange={handleStreetChange}
                    handleStreetBlur={handleStreetBlur}
                    onApplySuggestion={(s: any) => {
                        if (s.street) handleIdentityChange({ target: { name: `shippingAddress`, value: s.street } } as any);
                        if (s.city) handleIdentityChange({ target: { name: `shippingCity`, value: s.city } } as any);
                        if (s.state) handleIdentityChange({ target: { name: `shippingState`, value: s.state } } as any);
                        if (s.zip) handleIdentityChange({ target: { name: `shippingZip`, value: s.zip } } as any);
                        setSuggestedShipping(null);
                    }}
                />

                {!useShippingForBilling && (
                    <AddressBlock 
                        type="billing" 
                        title="Billing Details" 
                        icon={Globe} 
                        inputRef={billingInputRef}
                        suggestion={suggestedBilling}
                        formData={formData}
                        handleIdentityChange={handleIdentityChange}
                        handleStreetChange={handleStreetChange}
                        handleStreetBlur={handleStreetBlur}
                        onApplySuggestion={(s: any) => {
                            if (s.street) handleIdentityChange({ target: { name: `billingAddress`, value: s.street } } as any);
                            if (s.city) handleIdentityChange({ target: { name: `billingCity`, value: s.city } } as any);
                            if (s.state) handleIdentityChange({ target: { name: `billingState`, value: s.state } } as any);
                            if (s.zip) handleIdentityChange({ target: { name: `billingZip`, value: s.zip } } as any);
                            setSuggestedBilling(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

interface AddressBlockProps {
    type: 'shipping' | 'billing';
    title: string;
    icon: React.ComponentType<any>;
    inputRef: React.RefObject<HTMLInputElement>;
    suggestion: any;
    formData: any;
    handleIdentityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleStreetChange: (e: React.ChangeEvent<HTMLInputElement>, type: 'shipping' | 'billing') => void;
    handleStreetBlur: (e: React.FocusEvent<HTMLInputElement>, type: 'shipping' | 'billing') => void;
    onApplySuggestion: (suggestion: any) => void;
}

const AddressBlock: React.FC<AddressBlockProps> = ({ 
    type, title, icon: Icon, inputRef, suggestion, formData, handleIdentityChange, handleStreetChange, handleStreetBlur, onApplySuggestion
}) => {
    const pfx = type; // 'shipping' or 'billing'
    const address = formData[`${pfx}Address`] || '';
    const apt = formData[`${pfx}Apt`] || '';
    const city = formData[`${pfx}City`] || '';
    const state = formData[`${pfx}State`] || '';
    const zip = formData[`${pfx}Zip`] || '';

    return (
        <div className="space-y-4 relative group/section animate-in fade-in duration-300">
            <div className="flex items-center text-xs font-bold uppercase tracking-wider text-text-muted gap-2 pl-1 border-b border-border-subtle pb-2">
                <Icon size={14} className="text-accent-primary" />
                {title}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-12 relative">
                    <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10 pointer-events-none">Street Address</div>
                    <input 
                        ref={inputRef}
                        name={`${pfx}Address`}
                        value={address}
                        onChange={(e) => handleStreetChange(e, type)}
                        onBlur={(e) => handleStreetBlur(e, type)}
                        placeholder="123 Main St"
                        className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-all font-medium"
                        autoComplete="street-address" // Allows browser smart autocomplete or Maps Autocomplete
                    />
                </div>

                <div className="md:col-span-4 relative">
                    <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10 pointer-events-none">Apt / Unit</div>
                    <input 
                        name={`${pfx}Apt`}
                        value={apt}
                        onChange={handleIdentityChange}
                        placeholder="No."
                        className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-all font-medium"
                        autoComplete="address-line2"
                    />
                </div>

                <div className="md:col-span-8 relative">
                    <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10 pointer-events-none">City</div>
                    <input 
                        name={`${pfx}City`}
                        value={city}
                        onChange={handleIdentityChange}
                        placeholder="City"
                        className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-all font-medium"
                        autoComplete="address-level2"
                    />
                </div>

                <div className="md:col-span-6 relative">
                    <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10 pointer-events-none">State</div>
                    <select 
                        name={`${pfx}State`}
                        value={state}
                        onChange={handleIdentityChange as any}
                        autoComplete="address-level1"
                        className={`w-full bg-surface-alt border rounded-lg px-3 pt-6 pb-2 text-sm outline-none transition-all font-bold cursor-pointer appearance-none ${state ? 'border-status-success/50 focus:border-status-success text-status-success' : 'border-border-strong focus:border-accent-primary text-text-primary'} bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.2em_1.2em] bg-no-repeat bg-[currentColor]`}
                        style={{ backgroundPosition: 'right 0.75rem center' }}
                    >
                        <option value="" className="text-text-muted/40">Select</option>
                        {US_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                </div>

                <div className="md:col-span-6 relative">
                    <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10 pointer-events-none">ZIP Code</div>
                    <input 
                        name={`${pfx}Zip`}
                        value={zip}
                        onChange={handleIdentityChange}
                        placeholder="12345"
                        className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-all font-medium"
                        autoComplete="postal-code"
                    />
                </div>
            </div>

            {suggestion && (
                <div 
                    onClick={() => onApplySuggestion(suggestion)}
                    className="absolute top-[4rem] left-0 right-0 z-50 bg-accent-primary text-white p-4 rounded-xl shadow-2xl cursor-pointer hover:bg-accent-primary/90 transition-transform hover:scale-[1.01] flex items-center justify-between group"
                >
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold tracking-widest flex items-center gap-1.5 opacity-90"><Sparkles size={14}/> AUTO-DETECT SUGGESTION</span>
                        <span className="text-sm font-semibold mt-1">{suggestion.street}, {suggestion.city}, {suggestion.state} {suggestion.zip}</span>
                    </div>
                    <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                        <Check size={18} />
                    </div>
                </div>
            )}
        </div>
    );
};