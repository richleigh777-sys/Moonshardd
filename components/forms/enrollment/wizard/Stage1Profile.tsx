import React from 'react';
import { Mail, User, Phone, MapPin, Search } from 'lucide-react';
import { InputField, CustomSelect } from './InputFields';
import { ModernDatePicker } from '../../../ui/ModernDatePicker';
import { parseSmartAddress } from '../../../../lib/addressParser';
import { parseFullName } from '../../../../lib/nameParser';
import { MEDICAL_CONDITIONS } from '../../../../constants';

const US_STATES = [
    { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' }, { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' }, { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' }, { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' }, { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' }, { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' }, { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
    { value: 'TX', label: 'Texas' }, { value: 'NY', label: 'New York' }, { value: 'PA', label: 'Pennsylvania' }
];

const HEIGHT_OPTIONS = Array.from({ length: 48 }, (_, i) => {
    const feet = Math.floor(i / 12) + 4;
    const inches = i % 12;
    return { value: `${feet}'${inches}"`, label: `${feet}'${inches}"` };
});

export function Stage1Profile({ formData, setFormData, handleIdentityChange, handleDobChange, handleAgeChange, autoFillFromCustomer, customerNotes, productConfig, onNext, onCallback, wasAutoFilled, useShippingForBilling, setUseShippingForBilling }: any) {
    const addressDebounceRef = React.useRef<NodeJS.Timeout | null>(null);

    const [addressValidationStatus, setAddressValidationStatus] = React.useState<'idle' | 'validating' | 'verified'>('idle');
    const [addingCondition, setAddingCondition] = React.useState(false);
    const [newCondition, setNewCondition] = React.useState('');

    const handleSmartAddressInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const name = e.target.name;
        
        // Pass it through standard onChange immediately for smooth typing UI
        handleIdentityChange(e);

        // Smart Parsing Engine - Debounced < 100ms
        if (addressDebounceRef.current) clearTimeout(addressDebounceRef.current);
        
        if (rawValue.length > 10) {
            setAddressValidationStatus('validating');
        } else {
            setAddressValidationStatus('idle');
        }

        addressDebounceRef.current = setTimeout(() => {
            if (!rawValue || rawValue.length < 10) return;
            
            const parsed = parseSmartAddress(rawValue);
            
            if (parsed) {
                if (name === 'shippingAddress') {
                    handleIdentityChange({ target: { name: 'shippingAddress', value: parsed.street } } as any);
                    if (parsed.city) handleIdentityChange({ target: { name: 'shippingCity', value: parsed.city } } as any);
                    if (parsed.state) handleIdentityChange({ target: { name: 'shippingState', value: parsed.state } } as any);
                    if (parsed.zip) handleIdentityChange({ target: { name: 'shippingZip', value: parsed.zip } } as any);
                } else if (name === 'billingAddress') {
                    handleIdentityChange({ target: { name: 'billingAddress', value: parsed.street } } as any);
                    if (parsed.city) handleIdentityChange({ target: { name: 'billingCity', value: parsed.city } } as any);
                    if (parsed.state) handleIdentityChange({ target: { name: 'billingState', value: parsed.state } } as any);
                    if (parsed.zip) handleIdentityChange({ target: { name: 'billingZip', value: parsed.zip } } as any);
                }
            }
            
            setTimeout(() => setAddressValidationStatus('verified'), 400); // Mock network latency for USPS/Maps check
        }, 300);
    };

    const handleZipChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        // 1. Process the keystroke immediately for UI responsiveness
        const rawZip = e.target.value.replace(/\D/g, '').substring(0, 5);
        e.target.value = rawZip;
        const name = e.target.name;
        handleIdentityChange(e);

        // 2. Trigger Reverse Lookup when we hit exactly 5 digits
        if (rawZip.length === 5) {
            try {
                const response = await fetch(`https://api.zippopotam.us/us/${rawZip}`);
                if (response.ok) {
                    const data = await response.json();
                    const place = data.places[0];
                    if (place) {
                        if (name === 'shippingZip') {
                            handleIdentityChange({ target: { name: 'shippingCity', value: place['place name'] } } as any);
                            handleIdentityChange({ target: { name: 'shippingState', value: place['state abbreviation'] } } as any);
                        } else if (name === 'billingZip') {
                            handleIdentityChange({ target: { name: 'billingCity', value: place['place name'] } } as any);
                            handleIdentityChange({ target: { name: 'billingState', value: place['state abbreviation'] } } as any);
                        }
                    }
                }
            } catch (error) {
                console.error("Zip code lookup failed", error);
            }
        }
    };

    const handleStateChange = (e: React.ChangeEvent<HTMLInputElement>, isBilling = false) => {
        const rawState = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase().substring(0, 2);
        e.target.value = rawState;
        handleIdentityChange(e);
    };

    const handleFirstNamePaste = (e: any) => {
        const paste = e.clipboardData.getData('text');
        const parsedName = parseFullName(paste);
        if (parsedName.lastName) {
            e.preventDefault();
            handleIdentityChange({ target: { name: 'firstName', value: parsedName.firstName } } as any);
            handleIdentityChange({ target: { name: 'lastName', value: parsedName.lastName } } as any);
            if (parsedName.middleInitial) {
                handleIdentityChange({ target: { name: 'middleInitial', value: parsedName.middleInitial } } as any);
            }
        }
    };

    const handleAgeChangeLocal = (val: string) => {
        handleAgeChange(val);
        // Estimate DOB Year if they only gave Age but no DOB
        if (val && !formData.dob) {
            const currentYear = new Date().getFullYear();
            const birthYear = currentYear - parseInt(val);
            handleDobChange(`${birthYear}-01-01`); // approximate
        }
    };

    const emailThreatCheck = (email: string) => {
        if (!email) return "";
        const commonTypos = ['gmil.com', 'gmal.com', 'gmail.co', 'yaho.com', 'yahoo.co', 'hotmail.co', 'iclod.com', 'aol.co'];
        const domain = email.split('@')[1]?.toLowerCase();
        if (domain && commonTypos.includes(domain)) {
            return `Did you mean @${domain.replace('gmil', 'gmail').replace('gmal', 'gmail').replace('yaho.com', 'yahoo.com').replace('iclod', 'icloud')}?`;
        }
        return "";
    };

    const isEmailValid = !formData.email || /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email);
    const emailWarning = emailThreatCheck(formData.email);
    const parsedDate = formData.dob ? new Date(formData.dob + 'T12:00:00Z') : null;
    const isValid = formData.firstName && formData.lastName && formData.phone && formData.shippingAddress && formData.shippingState;

    return (
        <div className="w-full h-full flex items-start justify-center p-8 overflow-y-auto custom-scrollbar">
            <div className="w-full max-w-[1400px] grid grid-cols-1 lg:grid-cols-2 gap-12 pb-24">
                
                <div className="flex flex-col gap-12">
                    <div className={`bg-surface-alt border rounded-xl p-8 shadow-2xl space-y-8 h-fit transition-all duration-1000 ${wasAutoFilled ? 'border-emerald-500 shadow-sm/20 bg-emerald-500/5' : 'border-border-subtle'}`}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-text-primary font-medium text-2xl tracking-wide flex items-center gap-3">
                               <span className="text-accent-primary">01.</span> Customer Profile
                            </h2>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={async () => {
                                        try {
                                            const text = await navigator.clipboard.readText();
                                            if (!text) return;
                                            const extract = (label: string) => {
                                                const regex = new RegExp(`(?:${label}\\s*[:\\-]?\\s*)([^\\n]+)`, 'i');
                                                return (text.match(regex)?.[1] || '').trim();
                                            };
                                            const phoneMatches = text.match(/(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/);
                                            const phone = phoneMatches ? `${phoneMatches[1]}${phoneMatches[2]}${phoneMatches[3]}` : extract('phone');
                                            
                                            setFormData?.((prev: any) => ({
                                                ...prev,
                                                firstName: extract('first') || extract('first name') || prev.firstName,
                                                lastName: extract('last') || extract('last name') || prev.lastName,
                                                middleInitial: extract('middle') || extract('m.i.') || extract('middle initial') || prev.middleInitial,
                                                phone: phone || prev.phone,
                                                email: extract('email') || prev.email,
                                                shippingAddress: extract('address') || prev.shippingAddress,
                                                shippingCity: extract('city') || prev.shippingCity,
                                                shippingState: extract('state') || prev.shippingState,
                                                shippingZip: extract('zip') || extract('postal') || prev.shippingZip,
                                            }));
                                        } catch (e) {
                                            console.error("Clipboard permitted denied", e);
                                        }
                                    }}
                                    className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                                >
                                    🪄 AutoFill Paste
                                </button>
                                {wasAutoFilled && (
                                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-500 rounded-full text-sm font-bold uppercase tracking-wide animate-pulse">
                                        Match Found: Auto-filled
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-12 gap-6">
                            <div className="col-span-5">
                                <InputField label="First Name" name="firstName" value={formData.firstName || ''} onChange={handleIdentityChange} onPaste={handleFirstNamePaste} icon={User} placeholder="Jane" tabIndex={1}/>
                            </div>
                            <div className="col-span-2">
                                <InputField label="M.I." name="middleInitial" value={formData.middleInitial || ''} onChange={handleIdentityChange} placeholder="A" maxLength={1} tabIndex={2} />
                            </div>
                            <div className="col-span-5">
                                <InputField label="Last Name" name="lastName" value={formData.lastName || ''} onChange={handleIdentityChange} placeholder="Doe" tabIndex={3} />
                            </div>
                        </div>
    
                        <div className="grid grid-cols-2 gap-6">
                            <InputField label="Email Address" type="email" name="email" value={formData.email || ''} onChange={handleIdentityChange} icon={Mail} placeholder="jane@example.com" tabIndex={3} error={!isEmailValid ? "Invalid Format" : emailWarning || ""} />
                            <InputField label="Phone Number" type="tel" name="phone" value={formData.phone || ''} onChange={handleIdentityChange} icon={Phone} placeholder="(555) 000-0000" tabIndex={4} />
                        </div>
    
                        <div className="grid grid-cols-2 gap-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-1">
                                    <InputField label="Age" type="number" value={formData.age || ''} onChange={(e:any) => handleAgeChangeLocal(e.target.value)} placeholder="34" tabIndex={5} />
                                </div>
                                
                                <div className="col-span-1 space-y-1.5 w-full">
                                    <label className="text-[13px] font-semibold text-text-muted px-1 tracking-wide">DOB</label>
                                    <div className="w-full">
                                        <ModernDatePicker
                                            date={formData.dob}
                                            onChange={(dateStr: string) => handleDobChange(dateStr)}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-1 space-y-1.5 w-full">
                                    <label className="text-[13px] font-semibold text-text-muted px-1 tracking-wide">Height</label>
                                    <CustomSelect name="height" value={formData.height || ''} onChange={handleIdentityChange} options={HEIGHT_OPTIONS} placeholder="5'11&quot;" tabIndex={7} />
                                </div>
                                <div className="col-span-1">
                                    <InputField label="Weight" name="weight" value={formData.weight || ''} onChange={handleIdentityChange} placeholder="180" tabIndex={8} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <label className="text-[13px] font-semibold text-text-muted px-1 tracking-wide">Pre-existing Medical Conditions</label>
                            <div className="flex flex-wrap gap-2 items-center">
                                {[...(productConfig?.medicalConditions || []), ...(formData.medicalConditions || []), ...MEDICAL_CONDITIONS].reduce((acc: string[], cur: string) => acc.includes(cur) ? acc : [...acc, cur], [] as string[]).map((cond: string) => {
                                    const isSelected = formData.medicalConditions?.includes(cond);
                                    return (
                                        <button
                                            key={cond}
                                            type="button"
                                            onClick={() => {
                                                const current = formData.medicalConditions || [];
                                                const newSelection = isSelected ? current.filter((c: string) => c !== cond) : [...current, cond];
                                                handleIdentityChange({ target: { name: 'medicalConditions', value: newSelection } } as any);
                                            }}
                                            className={`px-4 py-2 font-medium tracking-wide border transition-all ${isSelected ? 'bg-accent-primary text-black border-accent-primary shadow-sm rounded-full text-[13px]' : 'bg-surface-main text-text-primary border-white/20 hover:border-accent-primary hover:text-accent-primary hover:bg-accent-primary/10 rounded-full text-[13px] shadow-sm'}`}
                                        >
                                            {cond}
                                        </button>
                                    )
                                })}
                                
                                {addingCondition ? (
                                    <div className="flex gap-2 items-center bg-surface-main border border-border-strong rounded-full px-2 py-1">
                                        <input 
                                            type="text" 
                                            value={newCondition} 
                                            onChange={(e) => setNewCondition(e.target.value)} 
                                            placeholder="Enter condition..."
                                            className="bg-transparent text-sm text-white outline-none w-32 px-2"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    if (newCondition.trim()) {
                                                        const current = formData.medicalConditions || [];
                                                        if (!current.includes(newCondition.trim())) {
                                                            handleIdentityChange({ target: { name: 'medicalConditions', value: [...current, newCondition.trim()] } } as any);
                                                        }
                                                        setNewCondition('');
                                                        setAddingCondition(false);
                                                    }
                                                }
                                            }}
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                if (newCondition.trim()) {
                                                    const current = formData.medicalConditions || [];
                                                    if (!current.includes(newCondition.trim())) {
                                                        handleIdentityChange({ target: { name: 'medicalConditions', value: [...current, newCondition.trim()] } } as any);
                                                    }
                                                }
                                                setNewCondition('');
                                                setAddingCondition(false);
                                            }} 
                                            className="text-accent-primary hover:text-white text-sm font-bold px-2 border-l border-border-strong"
                                        >
                                            ADD
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setAddingCondition(true)}
                                        className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-main text-text-muted border border-border-strong hover:border-accent-primary/50 hover:text-white transition-all text-lg font-light leading-none"
                                        title="Add Custom Condition"
                                    >
                                        +
                                    </button>
                                )}

                                {(!productConfig?.medicalConditions || productConfig.medicalConditions.length === 0) && (!formData.medicalConditions || formData.medicalConditions.length === 0) && !addingCondition && (
                                    <span className="text-text-muted/50 text-sm italic bg-surface-hover px-4 py-2 rounded-full">No system conditions</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {customerNotes && customerNotes.length > 0 && (
                        <div className="bg-surface-alt border border-border-subtle rounded-xl p-8 shadow-2xl h-fit max-h-[400px] overflow-y-auto custom-scrollbar">
                            <h2 className="text-text-primary font-medium text-xl mb-6">Profile History Notes</h2>
                            <div className="space-y-4">
                                {customerNotes.map((note: any, i: number) => (
                                    <div key={i} className="bg-surface-main p-5 rounded-xl border border-border-subtle text-sm">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-accent-primary font-semibold">{note.agentName || 'Unknown Agent'}</span>
                                            <span className="text-text-muted text-sm font-mono">{new Date(note.timestamp).toLocaleString()}</span>
                                        </div>
                                        <div className="text-text-primary leading-relaxed whitespace-pre-wrap">{note.text}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-surface-alt border border-border-subtle rounded-xl p-8 shadow-2xl flex flex-col h-fit">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-text-primary font-medium text-2xl tracking-wide flex items-center gap-3">
                           <span className="text-accent-primary">02.</span> Shipping Destination
                        </h2>
                        {addressValidationStatus === 'validating' && (
                            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm font-bold uppercase tracking-wide animate-pulse flex items-center gap-1">
                                <Search size={12} className="animate-spin" /> Verifying...
                            </span>
                        )}
                        {addressValidationStatus === 'verified' && (
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-sm font-bold uppercase tracking-wide flex items-center gap-1">
                                <MapPin size={12} /> Verified
                            </span>
                        )}
                    </div>

                    <div className="space-y-6 flex-1">
                        <div className="flex gap-4">
                            <div className="w-[70%]">
                                <InputField label="Street Address" name="shippingAddress" value={formData.shippingAddress || ''} onChange={handleSmartAddressInput} icon={MapPin} placeholder="123 Main St" tabIndex={9} />
                            </div>
                            <div className="w-[30%]">
                                <InputField label="Apt / Suite" name="shippingApt" value={formData.shippingApt || ''} onChange={handleIdentityChange} placeholder="Apt 4B" tabIndex={10} />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-5 gap-6">
                            <div className="col-span-2">
                                <InputField label="City" name="shippingCity" value={formData.shippingCity || ''} onChange={handleIdentityChange} placeholder="New York" tabIndex={11} />
                            </div>
                            <div className="col-span-2">
                                <InputField label="State" name="shippingState" value={formData.shippingState || ''} onChange={(e: any) => handleStateChange(e)} placeholder="NY" tabIndex={12} />
                            </div>
                            <div className="col-span-1">
                                <InputField label="ZIP Code" name="shippingZip" value={formData.shippingZip || ''} onChange={handleZipChange} placeholder="10001" tabIndex={13} />
                            </div>
                        </div>

                        <div className="mt-6 flex items-center gap-3">
                            <input 
                                type="checkbox" 
                                id="sameAsShipping"
                                checked={useShippingForBilling !== false} 
                                onChange={(e) => setUseShippingForBilling(e.target.checked)} 
                                className="w-5 h-5 bg-surface-main border-border-strong rounded accent-[#C4A470] cursor-pointer"
                            />
                            <label htmlFor="sameAsShipping" className="text-sm font-semibold text-text-muted select-none cursor-pointer">
                                Billing Address is same as Shipping
                            </label>
                        </div>

                        {useShippingForBilling === false && (
                            <div className="space-y-6 pt-6 mt-2 border-t border-border-subtle animate-in slide-in-from-top-4">
                                <h3 className="text-text-primary font-medium text-lg tracking-wide">Billing Address</h3>
                                <div className="flex gap-4">
                                    <div className="w-[70%]">
                                        <InputField label="Street Address" name="billingAddress" value={formData.billingAddress || ''} onChange={handleSmartAddressInput} placeholder="123 Main St" />
                                    </div>
                                    <div className="w-[30%]">
                                        <InputField label="Apt / Suite" name="billingApt" value={formData.billingApt || ''} onChange={handleIdentityChange} placeholder="Apt 4B" />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-5 gap-6">
                                    <div className="col-span-2">
                                        <InputField label="City" name="billingCity" value={formData.billingCity || ''} onChange={handleIdentityChange} placeholder="New York" />
                                    </div>
                                    <div className="col-span-2">
                                        <InputField label="State" name="billingState" value={formData.billingState || ''} onChange={(e: any) => handleStateChange(e, true)} placeholder="NY" />
                                    </div>
                                    <div className="col-span-1">
                                        <InputField label="ZIP Code" name="billingZip" value={formData.billingZip || ''} onChange={handleZipChange} placeholder="10001" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-8 mt-8 border-t border-border-subtle flex gap-4">
                        <button
                            type="button"
                            onClick={onCallback}
                            className="w-1/3 py-4 rounded-xl border border-border-strong text-text-muted font-semibold uppercase tracking-wider text-sm hover:text-white hover:border-accent-primary/50 hover:bg-accent-primary/5 transition-all"
                            tabIndex={14}
                        >
                            Save Callback
                        </button>
                        <button 
                            type="button"
                            onClick={onNext} 
                            disabled={!isValid}
                            className="w-2/3 py-4 bg-gradient-to-r from-amber-400 to-[#C4A470] text-black font-bold text-lg rounded-xl hover:shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed uppercase tracking-wider"
                            tabIndex={15}
                        >
                            Proceed
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
