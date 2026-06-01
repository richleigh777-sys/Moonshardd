import React, { useState, useEffect } from 'react';
import { User, Clipboard, CheckCircle, AlertTriangle, Clock, MapPin, Smartphone, Phone, Plus } from 'lucide-react';
import { Card } from '../../../ui/Base';
import { ModernDatePicker } from '../../../ui/ModernDatePicker';
import { areaCodeData } from '../../../../utils/areaCodeData';

interface IdentityProps {
  formData: any;
  handleIdentityChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleAgeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDobChange: (e: React.ChangeEvent<HTMLInputElement> | string) => void;
  useShippingForBilling: boolean;
  setUseShippingForBilling: (value: boolean) => void;
  onPasteParse?: () => Promise<void>;
}

export const IdentitySection: React.FC<IdentityProps> = ({
  formData,
  handleIdentityChange,
  handleAgeChange,
  handleDobChange,
  useShippingForBilling,
  setUseShippingForBilling,
  onPasteParse,
}) => {
  const [localTimeStr, setLocalTimeStr] = useState<string>('');
  const [locationStr, setLocationStr] = useState<string>('');
  const [showAlternatePhone, setShowAlternatePhone] = useState<boolean>(false);
  const [phoneTypeStr, setPhoneTypeStr] = useState<string>('');
  const [isLookingUpPhone, setIsLookingUpPhone] = useState<boolean>(false);
  const [isValidatingAddress, setIsValidatingAddress] = useState<boolean>(false);
  const [addressValidationResult, setAddressValidationResult] = useState<{isValid: boolean, message?: string} | null>(null);

  const handleVerifyAddress = async () => {
    if (!formData.shippingAddress) return;
    setIsValidatingAddress(true);
    setAddressValidationResult(null);

    try {
      const res = await fetch('/api/address/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          addressLines: [formData.shippingAddress, formData.shippingApt].filter(Boolean),
          locality: formData.shippingCity,
          regionCode: formData.shippingState,
          postalCode: formData.shippingZip
        })
      });
      const data = await res.json();
      
      if (data.success && data.validation) {
        setAddressValidationResult({
          isValid: data.validation.isValid,
          message: data.mocked ? "Mocked: Valid Address" : "Verified via Google"
        });
      } else {
        setAddressValidationResult({ isValid: false, message: "Validation failed" });
      }
    } catch (_err) {
      setAddressValidationResult({ isValid: false, message: "Error validating address" });
    } finally {
      setIsValidatingAddress(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (formData.phone) {
      const digits = formData.phone.replace(/\D/g, '');
      if (digits.length >= 3) {
        const info = areaCodeData[digits.substring(0, 3)];
        if (info) {
          setLocationStr(`${info.city ? info.city + ', ' : ''}${info.state}`);
          
          const updateTime = () => {
            try {
              const str = new Date().toLocaleTimeString('en-US', { timeZone: info.timezone, hour: 'numeric', minute: '2-digit', hour12: true });
              setLocalTimeStr(str);
            } catch (_e) {
              setLocalTimeStr('');
            }
          };
          
          updateTime();
          interval = setInterval(updateTime, 60000);
        } else {
          setLocationStr('');
          setLocalTimeStr('');
        }
      } else {
        setLocationStr('');
        setLocalTimeStr('');
      }

      if (digits.length >= 10) {
        // Use the backend API to lookup Line Type Intelligence via Twilio
        setIsLookingUpPhone(true);
        fetch('/api/phone/lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: digits })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.lookup) {
            setPhoneTypeStr(data.lookup.type);
            const isMobile = data.lookup.type === 'Mobile';
            if (formData.isMobile !== isMobile) {
               handleIdentityChange({
                 target: { 
                    name: 'isMobile', 
                    type: 'checkbox', 
                    checked: isMobile,
                    value: isMobile ? 'on' : ''
                 }
               } as any);
            }
          }
        })
        .catch(err => console.error("Phone lookup failed", err))
        .finally(() => setIsLookingUpPhone(false));
      } else {
        setPhoneTypeStr('');
      }
    } else {
      setLocationStr('');
      setLocalTimeStr('');
      setPhoneTypeStr('');
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [formData.phone, formData.isMobile, handleIdentityChange]);

  return (
    <Card variant="refraction" className="shrink-0 p-5 border-border-subtle shadow-md flex flex-col bg-surface-main relative overflow-hidden rounded-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent pointer-events-none"></div>

      <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500 shadow-sm border border-indigo-500/20">
            <User size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-text-primary tracking-wide">CUSTOMER IDENTITY</h3>
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Primary Profile Information</p>
          </div>
        </div>
        {onPasteParse && (
          <button
            type="button"
            onClick={onPasteParse}
            className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-3 py-1.5 rounded-lg hover:bg-indigo-500/20 hover:text-indigo-400 border border-indigo-500/20 transition-all flex items-center shadow-sm"
          >
            <Clipboard size={14} className="mr-1.5" /> Quick Paste Focus
          </button>
        )}
      </div>

      <div className="space-y-4 relative z-10">
        {/* Full Name */}
        <div>
          <div className="relative">
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleIdentityChange}
              placeholder="Full Name *"
              className={`w-full bg-surface-alt/70 border rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:ring-4 focus:bg-surface-main transition-all ${
                formData.fullName.length === 0 
                  ? 'border-border-subtle focus:border-indigo-500/50 focus:ring-indigo-500/10' 
                  : formData.fullName.length < 2 
                  ? 'border-status-error focus:border-status-error/50 focus:ring-status-error/10 bg-status-error/5' 
                  : 'border-status-success focus:border-status-success/50 focus:ring-status-success/10 bg-status-success/5'
              }`}
              autoComplete="new-password"
            />
            {formData.fullName.length > 0 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {formData.fullName.length >= 2 ? (
                  <CheckCircle size={18} className="text-status-success" />
                ) : (
                  <AlertTriangle size={18} className="text-status-error" />
                )}
              </div>
            )}
          </div>
          {formData.fullName.length > 0 && formData.fullName.length < 2 && (
            <p className="text-xs text-status-error mt-1">Name too short (min 2 chars)</p>
          )}
        </div>

          {/* Contact Info (Row) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <div className="relative">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleIdentityChange}
                placeholder="Phone *"
                className={`w-full bg-surface-alt/70 border rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:ring-4 focus:bg-surface-main transition-all font-mono ${
                  formData.phone.length === 0 
                    ? 'border-border-subtle focus:border-indigo-500/50 focus:ring-indigo-500/10' 
                    : formData.phone.replace(/\D/g, '').length < 10 
                    ? 'border-status-error focus:border-status-error/50 focus:ring-status-error/10 bg-status-error/5' 
                    : 'border-status-success focus:border-status-success/50 focus:ring-status-success/10 bg-status-success/5'
                }`}
                autoComplete="new-password"
              />
              {formData.phone.length > 0 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {formData.phone.replace(/\D/g, '').length >= 10 ? (
                    <CheckCircle size={18} className="text-status-success" />
                  ) : (
                    <AlertTriangle size={18} className="text-status-error" />
                  )}
                </div>
              )}
            </div>
            {locationStr && localTimeStr && (
              <div className="flex items-center gap-3 mt-1 px-1 animate-in fade-in slide-in-from-top-1 text-xs font-semibold text-text-muted">
                <span className="flex items-center gap-1.5"><MapPin size={12} className="text-indigo-400" /> {locationStr}</span>
                <span className="flex items-center gap-1.5"><Clock size={12} className="text-emerald-400" /> {localTimeStr} local time</span>
              </div>
            )}
            {isLookingUpPhone ? (
               <div className="flex items-center gap-1.5 mt-1 px-1 text-xs font-semibold text-text-muted/60 animate-pulse">
                 <Smartphone size={12} /> Looking up device type...
               </div>
            ) : phoneTypeStr ? (
              <div className="flex items-center gap-1.5 mt-1 px-1 animate-in fade-in slide-in-from-top-1 text-[11px] font-bold text-text-muted tracking-widest uppercase">
                 {formData.isMobile ? <Smartphone size={12} className="text-indigo-400" /> : <Phone size={12} className="text-emerald-400" />}
                 <span className={formData.isMobile ? 'text-indigo-400' : 'text-emerald-400'}>{phoneTypeStr}</span>
              </div>
            ) : null}
            {(!showAlternatePhone && !formData.alternatePhone) ? (
              <button
                type="button"
                onClick={() => setShowAlternatePhone(true)}
                className="flex items-center gap-1.5 mt-2 px-2 py-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider"
              >
                <Plus size={14} />
                Add Alternate Phone
              </button>
            ) : (
              <div className="flex gap-2 mt-2 animate-in fade-in slide-in-from-top-1">
                 <select 
                   name="alternatePhoneType"
                   value={formData.alternatePhoneType || 'Mobile'}
                   onChange={handleIdentityChange as any}
                   className="w-1/3 bg-surface-alt/70 border border-border-subtle rounded-xl px-2 text-xs font-bold text-text-primary outline-none focus:border-indigo-500/50 appearance-none text-center"
                 >
                   <option value="Mobile">Mobile</option>
                   <option value="Home">Home</option>
                   <option value="Work">Work</option>
                 </select>
                 <input
                   type="tel"
                   name="alternatePhone"
                   value={formData.alternatePhone || ''}
                   onChange={handleIdentityChange}
                   placeholder="Alternate Phone"
                   className={`w-2/3 bg-surface-alt/70 border rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:ring-4 focus:bg-surface-main transition-all font-mono ${
                     !formData.alternatePhone 
                       ? 'border-border-subtle focus:border-indigo-500/50 focus:ring-indigo-500/10' 
                       : formData.alternatePhone.replace(/\D/g, '').length < 10 
                       ? 'border-status-warning focus:border-status-warning/50 focus:ring-status-warning/10 bg-status-warning/5' 
                       : 'border-status-success focus:border-status-success/50 focus:ring-status-success/10 bg-status-success/5'
                   }`}
                   autoComplete="new-password"
                 />
              </div>
            )}
          </div>
          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleIdentityChange}
              placeholder="Email Address"
              className="w-full bg-surface-alt/70 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 focus:bg-surface-main transition-all"
              autoComplete="new-password"
            />
          </div>
        </div>

        {/* Age & DOB */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="number"
              value={formData.age}
              onChange={handleAgeChange}
              placeholder="Age"
              min="18"
              max="120"
              className="w-full bg-surface-alt/70 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 focus:bg-surface-main transition-all"
              autoComplete="new-password"
            />
          </div>
          <div>
            <ModernDatePicker
              date={formData.dob}
              onChange={handleDobChange}
              calculatedYear={formData.age && !isNaN(parseInt(formData.age)) ? new Date().getFullYear() - parseInt(formData.age) : undefined}
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border-subtle/50 mt-4 pt-4 mb-2">
          <div className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
            Primary Address
            {addressValidationResult && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${addressValidationResult.isValid ? 'bg-status-success/20 text-status-success' : 'bg-status-error/20 text-status-error'}`}>
                {addressValidationResult.message || (addressValidationResult.isValid ? 'Verified' : 'Invalid')}
              </span>
            )}
          </div>
          <button 
            type="button"
            onClick={handleVerifyAddress}
            className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded hover:bg-indigo-500/20 transition-colors uppercase tracking-wider disabled:opacity-50 flex items-center gap-1"
            disabled={!formData.shippingAddress || !formData.shippingZip || isValidatingAddress}
            title="Google Address Validation API mapping point"
          >
            {isValidatingAddress ? 'Validating...' : 'Verify Address'}
          </button>
        </div>
        <div>
          <div className="grid grid-cols-4 gap-2 mb-2">
            <div className="col-span-3">
              <input
                type="text"
                name="shippingAddress"
                value={formData.shippingAddress}
                onChange={handleIdentityChange}
                placeholder="Shipping Street Address"
                className="w-full bg-surface-alt/70 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 focus:bg-surface-main transition-all"
                autoComplete="new-password"
              />
            </div>
            <div className="col-span-1">
              <input
                type="text"
                name="shippingApt"
                value={formData.shippingApt || ''}
                onChange={handleIdentityChange}
                placeholder="Apt/Unit"
                className="w-full bg-surface-alt/70 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 focus:bg-surface-main transition-all"
                autoComplete="new-password"
              />
            </div>
          </div>
          <div className="grid grid-cols-6 gap-2">
            <div className="col-span-3">
              <input
                type="text"
                name="shippingCity"
                value={formData.shippingCity || ''}
                onChange={handleIdentityChange}
                placeholder="City"
                className="w-full bg-surface-alt/70 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 focus:bg-surface-main transition-all"
                autoComplete="off"
              />
            </div>
            <div className="col-span-1">
              <select
                name="shippingState"
                value={formData.shippingState || ''}
                onChange={handleIdentityChange as any}
                className="w-full bg-surface-alt/70 border border-border-subtle rounded-xl px-2 py-3 text-sm font-bold text-text-primary outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 focus:bg-surface-main transition-all appearance-none text-center"
              >
                <option value="" disabled>ST</option>
                {['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'].map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <input
                type="text"
                name="shippingZip"
                value={formData.shippingZip || ''}
                onChange={handleIdentityChange}
                placeholder="ZIP Code"
                className="w-full bg-surface-alt/70 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 focus:bg-surface-main transition-all"
                autoComplete="off"
              />
            </div>
          </div>
        </div>

        {/* Use Shipping for Billing */}
        <div className="flex items-center gap-3 py-2 bg-surface-alt/30 px-4 rounded-xl border border-border-subtle/50 my-4">
          <input
            type="checkbox"
            id="useSameBilling"
            checked={useShippingForBilling}
            onChange={(e) => setUseShippingForBilling(e.target.checked)}
            className="w-4 h-4 rounded border-border-subtle cursor-pointer text-indigo-500 focus:ring-indigo-500/30 bg-surface-alt"
          />
          <label htmlFor="useSameBilling" className="text-xs font-bold text-text-primary cursor-pointer flex-1 py-2">
            Billing Address is same as Shipping Address
          </label>
        </div>

        {/* Billing Address */}
        {!useShippingForBilling && (
          <div className="animate-in slide-in-from-top-2 fade-in duration-300">
            <div className="grid grid-cols-4 gap-2 mb-2">
              <div className="col-span-3">
                <input
                  type="text"
                  name="billingAddress"
                  value={formData.billingAddress}
                  onChange={handleIdentityChange}
                  placeholder="Billing Street Address"
                  className="w-full bg-surface-alt/70 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 focus:bg-surface-main transition-all"
                  autoComplete="new-password"
                />
              </div>
              <div className="col-span-1">
                <input
                  type="text"
                  name="billingApt"
                  value={formData.billingApt || ''}
                  onChange={handleIdentityChange}
                  placeholder="Apt/Unit"
                  className="w-full bg-surface-alt/70 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 focus:bg-surface-main transition-all"
                  autoComplete="new-password"
                />
              </div>
            </div>
            <div className="grid grid-cols-6 gap-2">
              <div className="col-span-3">
                <input
                  type="text"
                  name="billingCity"
                  value={formData.billingCity || ''}
                  onChange={handleIdentityChange}
                  placeholder="City"
                  className="w-full bg-surface-alt/70 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 focus:bg-surface-main transition-all"
                  autoComplete="off"
                />
              </div>
              <div className="col-span-1">
                <select
                  name="billingState"
                  value={formData.billingState || ''}
                  onChange={handleIdentityChange as any}
                  className="w-full bg-surface-alt/70 border border-border-subtle rounded-xl px-2 py-3 text-sm font-bold text-text-primary outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 focus:bg-surface-main transition-all appearance-none text-center"
                >
                  <option value="" disabled>ST</option>
                  {['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'].map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <input
                  type="text"
                  name="billingZip"
                  value={formData.billingZip || ''}
                  onChange={handleIdentityChange}
                  placeholder="ZIP Code"
                  className="w-full bg-surface-alt/70 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 focus:bg-surface-main transition-all"
                  autoComplete="off"
                />
              </div>
            </div>
          </div>
        )}

        {/* Height & Weight */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <input
              type="text"
              name="height"
              value={formData.height}
              onChange={handleIdentityChange}
              placeholder="Height (e.g. 5'10&quot;)"
              className="w-full bg-surface-alt/70 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 focus:bg-surface-main transition-all"
            />
          </div>
          <div>
            <input
              type="text"
              name="weight"
              value={formData.weight}
              onChange={handleIdentityChange}
              placeholder="Weight (e.g. 180 lbs)"
              className="w-full bg-surface-alt/70 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 focus:bg-surface-main transition-all"
            />
          </div>
        </div>

        {/* Profile Enrichment */}
        <div className="pt-4 border-t border-border-subtle/50 mt-4">
          <div className="text-xs font-bold text-text-muted mb-3 uppercase tracking-wider flex items-center gap-2">
            Profile Enrichment
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <select
                name="leadSource"
                value={formData.leadSource || ''}
                onChange={handleIdentityChange as any}
                className="w-full bg-surface-alt/70 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 focus:bg-surface-main transition-all appearance-none"
              >
                <option value="" disabled>Lead Source</option>
                <option value="Organic Search">Organic Search</option>
                <option value="Social Media">Social Media</option>
                <option value="Referral">Referral</option>
                <option value="Direct Mail">Direct Mail</option>
                <option value="Advertisement">Advertisement</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <select
                name="communicationPreferences"
                value={formData.communicationPreferences || ''}
                onChange={handleIdentityChange as any}
                className="w-full bg-surface-alt/70 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 focus:bg-surface-main transition-all appearance-none"
              >
                <option value="" disabled>Comm. Preference</option>
                <option value="Email">Email</option>
                <option value="Phone">Phone</option>
                <option value="SMS">SMS</option>
                <option value="Any">Any</option>
              </select>
            </div>
            <div className="col-span-1 md:col-span-2">
              <input
                type="text"
                name="goals"
                value={formData.goals || ''}
                onChange={handleIdentityChange}
                placeholder="Health / Fitness / Purchase Goals"
                className="w-full bg-surface-alt/70 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 focus:bg-surface-main transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
