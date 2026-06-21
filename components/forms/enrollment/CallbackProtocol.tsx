import React, { useState } from 'react';
import { ArrowLeft, History, UserCheck, ChevronDown, ChevronUp, MapPin, Activity } from 'lucide-react';
import { Button, Input } from '../../ui/Base';
import { CallbackForm } from '../CallbackForm';
import { sfx } from '../../../lib/soundService';
import { User, SalesFormData, Customer } from '../../../types';
import { useCRM } from '../../../hooks/useCRM';

interface CallbackProtocolProps {
    setMode: (mode: 'order' | 'callback') => void;
    addNote: (note: any) => Promise<void>;
    onCancel: () => void;
    currentUser: User;
    formData: SalesFormData;
    selectedConditions: string[];
    handleIdentityChange: (e: any) => void;
}

export const CallbackProtocol: React.FC<CallbackProtocolProps> = ({
    setMode, addNote, onCancel, currentUser, formData, selectedConditions, handleIdentityChange
}) => {
    const { customers, addCustomer, updateCustomer } = useCRM();
    const [showAudit, setShowAudit] = useState(false);

    return (
    <div className="bg-surface-main/60 w-full max-w-2xl mx-auto rounded-xl border border-border-subtle shadow-float h-[80vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500 backdrop-blur-[40px] relative">
        <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none -mr-32 -mt-32 z-0"></div>
        <div className="p-5 border-b border-border-subtle flex justify-between items-center bg-transparent relative z-10 shrink-0">
            <Button variant="secondary" onClick={() => { setMode('order'); sfx.playClick(); }} className="h-10 px-5 text-sm font-medium  tracking-wide bg-surface-alt/50 border-border-subtle hover:bg-surface-highlight hover:text-text-primary">
                <ArrowLeft size={16} className="mr-2"/> Return
            </Button>
            <h3 className="text-sm font-medium  text-text-primary tracking-[0.3em] flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/20 rounded-xl">
                    <History size={16} className="text-status-warning shadow-sm"/>
                </div>
                Recovery Protocol
            </h3>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
            
            {/* AUDIT / PROFILE EDIT SECTION */}
            <div className="border-b border-border-subtle bg-surface-main">
                <button 
                    onClick={() => setShowAudit(!showAudit)}
                    className="w-full flex items-center justify-between p-4 hover:bg-surface-alt/50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <UserCheck size={18} className={showAudit ? "text-amber-500" : "text-text-muted"} />
                        <div className="text-left">
                            <h4 className="text-sm font-semibold tracking-wide text-text-primary">Customer Profile Sync</h4>
                            <p className="text-sm text-text-muted uppercase tracking-wide mt-0.5">Audit & edit information to be saved to main database</p>
                        </div>
                    </div>
                    {showAudit ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
                </button>
                
                {showAudit && (
                    <div className="p-4 pt-0 space-y-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="p-4 bg-surface-alt/30 border border-border-subtle rounded-xl space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-text-muted uppercase tracking-wide font-bold ml-1 mb-1 block">First Name</label>
                                    <Input name="firstName" value={formData.firstName || ''} onChange={handleIdentityChange} placeholder="First Name" />
                                </div>
                                <div>
                                    <label className="text-sm text-text-muted uppercase tracking-wide font-bold ml-1 mb-1 block">Last Name</label>
                                    <Input name="lastName" value={formData.lastName || ''} onChange={handleIdentityChange} placeholder="Last Name" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-text-muted uppercase tracking-wide font-bold ml-1 mb-1 block">Email Address</label>
                                    <Input name="email" value={formData.email || ''} onChange={handleIdentityChange} placeholder="Email" />
                                </div>
                                <div>
                                    <label className="text-sm text-text-muted uppercase tracking-wide font-bold ml-1 mb-1 block">Phone Number</label>
                                    <Input name="phone" value={formData.phone || ''} onChange={handleIdentityChange} placeholder="Phone" />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-text-muted uppercase tracking-wide font-bold ml-1 mb-1 flex items-center gap-1.5"><MapPin size={12}/> Shipping Address</label>
                                <Input name="shippingAddress" value={formData.shippingAddress || ''} onChange={handleIdentityChange} placeholder="Street Address" className="mb-2" />
                                <div className="grid grid-cols-3 gap-2">
                                    <Input name="shippingCity" value={formData.shippingCity || ''} onChange={handleIdentityChange} placeholder="City" />
                                    <Input name="shippingState" value={formData.shippingState || ''} onChange={handleIdentityChange} placeholder="State" />
                                    <Input name="shippingZip" value={formData.shippingZip || ''} onChange={handleIdentityChange} placeholder="Zip" />
                                </div>
                            </div>

                            {selectedConditions && selectedConditions.length > 0 && (
                                <div>
                                    <label className="text-sm text-text-muted uppercase tracking-wide font-bold ml-1 mb-1 block">Health Information</label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedConditions.map(cond => (
                                            <span key={cond} className="px-2 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded text-sm uppercase font-bold tracking-wider flex items-center gap-1">
                                                {cond} 
                                                <button type="button" onClick={() => {
                                                    const fresh = selectedConditions.filter(c => c !== cond);
                                                    handleIdentityChange({ target: { name: 'medicalConditions', value: fresh } } as any);
                                                }} className="hover:text-amber-200 hover:scale-110 ml-1">&times;</button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex gap-3 text-amber-500/80 text-sm">
                                <Activity size={16} className="shrink-0 mt-0.5" />
                                <p>Saving this callback will automatically merge these details into the central database for this customer using Phone as the unique key.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4">
                <CallbackForm 
                onAddNote={async (n) => { 
                    try {
                        const cleanPhone = (n.phone || '').replace(/\D/g, '');
                        // If they entered a phone, update or create customer
                        if (cleanPhone.length >= 10) {
                            let match = customers.find(c => (c.phone || '').replace(/\D/g, '') === cleanPhone);
                            if (!match && formData.email) {
                                match = customers.find(c => (c.email || '').toLowerCase().trim() === formData.email.toLowerCase().trim());
                            }
                            
                            const parsedShippingStreet = (formData.shippingAddress || '').split(',')[0].trim();
                            const streetAndAptShipping = formData.shippingApt ? `${parsedShippingStreet} ${formData.shippingApt}` : parsedShippingStreet;
                            const fullShippingAddress = [streetAndAptShipping, formData.shippingCity, formData.shippingState, formData.shippingZip].filter(Boolean).join(', ');

                            let mergedFirstName = formData.firstName || (n.customerName ? n.customerName.split(' ')[0] : '');
                            let mergedLastName = formData.lastName || (n.customerName ? n.customerName.substring(n.customerName.indexOf(' ') + 1) : '');
                            
                            if (match) {
                                const exFirst = (match.firstName || '').trim();
                                const exLast = (match.lastName || '').trim();
                                
                                if (exFirst.length > mergedFirstName.length && exFirst.toLowerCase().includes(mergedFirstName.toLowerCase())) {
                                    mergedFirstName = exFirst;
                                }
                                if (exLast.length > mergedLastName.length && exLast.toLowerCase().includes(mergedLastName.toLowerCase())) {
                                    mergedLastName = exLast;
                                }
                            }

                            const customerPayload = {
                                firstName: mergedFirstName,
                                lastName: mergedLastName,
                                name: `${mergedFirstName} ${mergedLastName}`.trim(),
                                phone: n.phone || formData.phone,
                                email: formData.email,
                                dob: formData.dob,
                                age: formData.age ? parseInt(formData.age) : undefined,
                                height: formData.height,
                                weight: formData.weight,
                                address: fullShippingAddress,
                                shippingAddress: streetAndAptShipping,
                                shippingApt: formData.shippingApt,
                                shippingCity: formData.shippingCity,
                                shippingState: formData.shippingState,
                                shippingZip: formData.shippingZip,
                                medicalConditions: selectedConditions,
                                assignedTo: match?.assignedTo || currentUser?.id,
                                team: match?.team || currentUser?.team || 'Alpha',
                                nextActionDate: n.timestamp || Date.now() + 86400000,
                                nextActionType: 'Initial'
                            };

                            if (match) {
                                await updateCustomer(match.id, customerPayload);
                            } else {
                                await addCustomer(customerPayload as any);
                            }
                        }
                    } catch (err) {
                        console.error('Error saving customer on callback:', err);
                    }
                    await addNote(n); 
                    onCancel(); 
                }} 
                currentUser={currentUser} 
                initialData={{
                    name: formData.firstName ? `${formData.firstName} ${formData.lastName}`.trim() : '',
                    phone: formData.phone,
                    address: formData.shippingAddress,
                    medicalConditions: selectedConditions
                }}
            />
        </div>
        </div>
    </div>
    );
};
