import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { Customer } from '../../../types';
import { useCRMData } from '../../../hooks/useCRMData';
import { useSystem } from '../../../hooks/useSystem';
import { useAuth } from '../../../hooks/useAuth';
import { sfx } from '../../../lib/soundService';

interface AddCustomerModalProps {
    isAddOpen: boolean;
    setIsAddOpen: (isOpen: boolean) => void;
    uniqueCustomers: Customer[];
}

export function AddCustomerModal({ isAddOpen, setIsAddOpen, uniqueCustomers }: AddCustomerModalProps) {
    const { currentUser } = useAuth();
    const { addCustomer, logAudit } = useCRMData(currentUser);
    const { setToast } = useSystem();
    const playClick = () => sfx.playClick();
    const playConfirm = () => sfx.playConfirm();
    const playSuccess = () => sfx.playSuccess();
    const playDecline = () => sfx.playDecline();

    const [newCustForm, setNewCustForm] = React.useState({
        firstName: '',
        lastName: '',
        middleInitial: '',
        phone: '',
        alternatePhone: '',
        email: '',
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
        age: '',
        dob: '',
        height: '',
        weight: '',
        medicalConditions: '',
        crmTags: '',
        pipelineStages: '',
        leadSources: ''
    } as any);

    const handleAddCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCustForm.firstName || !newCustForm.phone) {
            setToast({
                title: 'Required Fields Missing',
                message: 'First Name and Phone Number are required fields to establish a customer record.',
                type: 'warning'
            });
            return;
        }

        const phoneClean = newCustForm.phone.replace(/\D/g, '');
        const exists = uniqueCustomers.some(c => (c.phone || '').replace(/\D/g, '') === phoneClean);
        if (exists) {
            setToast({
                title: 'Profile Already Exists',
                message: `A unique profile with direct phone number ${newCustForm.phone} already exists in the central system.`,
                type: 'warning'
            });
            playDecline();
            return;
        }

        playConfirm();

        try {
            const id = 'cust_' + Date.now() + Math.random().toString(36).substr(2, 5);
            const medConds = newCustForm.medicalConditions
                ? newCustForm.medicalConditions.split(',').map((s: string) => s.trim()).filter(Boolean)
                : [];
            const crmConds = (newCustForm as any).crmTags
                ? (newCustForm as any).crmTags.split(',').map((s: string) => s.trim()).filter(Boolean)
                : [];
            const pipeConds = (newCustForm as any).pipelineStages
                ? (newCustForm as any).pipelineStages.split(',').map((s: string) => s.trim()).filter(Boolean)
                : [];
            const leadConds = (newCustForm as any).leadSources
                ? (newCustForm as any).leadSources.split(',').map((s: string) => s.trim()).filter(Boolean)
                : [];

            const fullName = `${newCustForm.firstName} ${newCustForm.lastName}`.trim();
            const customerPayload: Partial<Customer> = {
                id,
                firstName: newCustForm.firstName,
                lastName: newCustForm.lastName,
                fullName,
                name: fullName,
                middleInitial: newCustForm.middleInitial,
                phone: newCustForm.phone,
                alternatePhone: newCustForm.alternatePhone,
                email: newCustForm.email,
                shippingAddress: newCustForm.shippingAddress,
                shippingApt: newCustForm.shippingApt,
                shippingCity: newCustForm.shippingCity,
                shippingState: newCustForm.shippingState,
                shippingZip: newCustForm.shippingZip,
                billingAddress: newCustForm.billingAddress,
                billingApt: newCustForm.billingApt,
                billingCity: newCustForm.billingCity,
                billingState: newCustForm.billingState,
                billingZip: newCustForm.billingZip,
                age: newCustForm.age ? Number(newCustForm.age) : undefined,
                dob: newCustForm.dob,
                height: newCustForm.height,
                weight: newCustForm.weight,
                medicalConditions: medConds,
                crmTags: crmConds,
                pipelineStages: pipeConds,
                leadSources: leadConds,
                status: 'Active',
                ltv: 0,
                orderCount: 0,
                declineCount: 0,
                lastOrderDate: 0,
                firstSource: 'Manual Admin',
                tags: [],
                salesHistory: [],
                phones: [newCustForm.phone],
                emails: [newCustForm.email].filter(Boolean),
                createdAt: Date.now(),
                updatedAt: Date.now()
            };

            await addCustomer(customerPayload);
            setIsAddOpen(false);
            setNewCustForm({
                firstName: '', lastName: '', middleInitial: '', phone: '', alternatePhone: '', email: '',
                shippingAddress: '', shippingApt: '', shippingCity: '', shippingState: '', shippingZip: '',
                billingAddress: '', billingApt: '', billingCity: '', billingState: '', billingZip: '',
                age: '', dob: '', height: '', weight: '', medicalConditions: '', crmTags: '', pipelineStages: '', leadSources: ''
            });
            setToast({
                title: 'Unified Profile Added',
                message: `Client ${fullName} was successfully provisioned in the unique sales directory.`,
                type: 'success'
            });
            await logAudit({
                action: 'ADD',
                details: `Added new unified profile for ${fullName}.`,
                module: 'CRM'
            });
            playSuccess();
        } catch (error) {
            console.error('Failed to add unique customer:', error);
            setToast({
                title: 'Provisioning Failed',
                message: 'Failed to save new unique customer profile to the system database.',
                type: 'error'
            });
            playDecline();
        }
    };

    const syncBillingWithShipping = (_editing: boolean = false) => {
        playClick();
        setNewCustForm({
            ...newCustForm,
            billingAddress: newCustForm.shippingAddress,
            billingApt: newCustForm.shippingApt,
            billingCity: newCustForm.shippingCity,
            billingState: newCustForm.shippingState,
            billingZip: newCustForm.shippingZip
        });
        setToast({
            title: 'Addresses Synced',
            message: 'Billing address fields overwritten with shipping address.',
            type: 'info'
        });
    };

    return (
        <AnimatePresence>
            {isAddOpen && (
                <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="w-full max-w-2xl bg-surface-main border border-border-subtle rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
                        id="add-customer-modal"
                    >
                        {/* Modal Header */}
                        <div className="p-4 border-b border-border-subtle bg-surface-alt/50 flex justify-between items-center">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-accent-primary/10 rounded-xl text-accent-primary">
                                    <Plus size={18} />
                                </div>
                                <h2 className="text-base font-bold text-text-primary tracking-tight">Add New Unique Customer</h2>
                            </div>
                            <button 
                                onClick={() => { playClick(); setIsAddOpen(false); }}
                                className="p-2 border border-border-subtle hover:bg-surface-alt rounded-lg text-text-muted hover:text-text-primary transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleAddCustomer} className="flex-1 overflow-y-auto p-4 space-y-5">
                            <div className="grid grid-cols-12 gap-3">
                                <div className="col-span-5 relative">
                                    <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">First Name *</div>
                                    <input 
                                        required
                                        type="text"
                                        value={newCustForm.firstName}
                                        onChange={(e) => setNewCustForm({ ...newCustForm, firstName: e.target.value })}
                                        className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary"
                                    />
                                </div>
                                <div className="col-span-2 relative">
                                    <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">MI</div>
                                    <input 
                                        maxLength={1}
                                        type="text"
                                        value={newCustForm.middleInitial}
                                        onChange={(e) => setNewCustForm({ ...newCustForm, middleInitial: e.target.value.toUpperCase() })}
                                        className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary text-center"
                                    />
                                </div>
                                <div className="col-span-5 relative">
                                    <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">Last Name</div>
                                    <input 
                                        type="text"
                                        value={newCustForm.lastName}
                                        onChange={(e) => setNewCustForm({ ...newCustForm, lastName: e.target.value })}
                                        className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary"
                                    />
                                </div>

                                <div className="col-span-6 relative">
                                    <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">Direct Phone *</div>
                                    <input 
                                        required
                                        type="text"
                                        value={newCustForm.phone}
                                        onChange={(e) => setNewCustForm({ ...newCustForm, phone: e.target.value })}
                                        placeholder="123-456-7890"
                                        className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm font-mono text-text-primary outline-none focus:border-accent-primary font-bold"
                                    />
                                </div>
                                <div className="col-span-6 relative">
                                    <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">Alternate Phone</div>
                                    <input 
                                        type="text"
                                        value={newCustForm.alternatePhone}
                                        onChange={(e) => setNewCustForm({ ...newCustForm, alternatePhone: e.target.value })}
                                        className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm font-mono text-text-primary outline-none focus:border-accent-primary"
                                    />
                                </div>

                                <div className="col-span-12 relative">
                                    <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">Email Address</div>
                                    <input 
                                        type="email"
                                        value={newCustForm.email}
                                        onChange={(e) => setNewCustForm({ ...newCustForm, email: e.target.value })}
                                        placeholder="name@domain.com"
                                        className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary"
                                    />
                                </div>
                            </div>

                            {/* Medical and Vitals Box */}
                            <div className="border border-border-subtle p-4 rounded-xl bg-surface-alt/30 space-y-4">
                                <h4 className="text-sm font-bold tracking-wider text-text-muted uppercase flex items-center gap-1">Vitals & Declarations</h4>
                                <div className="grid grid-cols-4 gap-3">
                                    <div className="relative">
                                        <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">Age</div>
                                        <input 
                                            type="number"
                                            value={newCustForm.age}
                                            onChange={(e) => setNewCustForm({ ...newCustForm, age: e.target.value })}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-bold"
                                        />
                                    </div>
                                    <div className="relative col-span-1">
                                        <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">Height</div>
                                        <input 
                                            type="text"
                                            value={newCustForm.height}
                                            onChange={(e) => setNewCustForm({ ...newCustForm, height: e.target.value })}
                                            placeholder="5'10"
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary"
                                        />
                                    </div>
                                    <div className="relative col-span-1">
                                        <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">Weight</div>
                                        <input 
                                            type="text"
                                            value={newCustForm.weight}
                                            onChange={(e) => setNewCustForm({ ...newCustForm, weight: e.target.value })}
                                            placeholder="180 lbs"
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary"
                                        />
                                    </div>
                                    <div className="relative col-span-1">
                                        <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">DOB</div>
                                        <input 
                                            type="text"
                                            value={newCustForm.dob}
                                            onChange={(e) => setNewCustForm({ ...newCustForm, dob: e.target.value })}
                                            placeholder="MM/DD/YYYY"
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm font-mono text-text-primary outline-none focus:border-accent-primary font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">Medical Conditions (Comma Separated)</div>
                                    <input 
                                        type="text"
                                        value={newCustForm.medicalConditions}
                                        onChange={(e) => setNewCustForm({ ...newCustForm, medicalConditions: e.target.value })}
                                        placeholder="e.g. Asthma, High Blood Pressure"
                                        className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="relative">
                                        <div className="absolute top-2 left-3 text-[10px] font-bold tracking-wide text-purple-500 uppercase z-10">CRM Tags</div>
                                        <input 
                                            type="text"
                                            value={(newCustForm as any).crmTags || ''}
                                            onChange={(e) => setNewCustForm({ ...newCustForm, crmTags: e.target.value } as any)}
                                            placeholder="VIP, Follow Up"
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-purple-500"
                                        />
                                    </div>
                                    <div className="relative">
                                        <div className="absolute top-2 left-3 text-[10px] font-bold tracking-wide text-blue-500 uppercase z-10">Lead Sources</div>
                                        <input 
                                            type="text"
                                            value={(newCustForm as any).leadSources || ''}
                                            onChange={(e) => setNewCustForm({ ...newCustForm, leadSources: e.target.value } as any)}
                                            placeholder="Organic Search"
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="relative">
                                        <div className="absolute top-2 left-3 text-[10px] font-bold tracking-wide text-amber-500 uppercase z-10">Pipeline Stages</div>
                                        <input 
                                            type="text"
                                            value={(newCustForm as any).pipelineStages || ''}
                                            onChange={(e) => setNewCustForm({ ...newCustForm, pipelineStages: e.target.value } as any)}
                                            placeholder="Qualified"
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-amber-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Blocks */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold tracking-wider text-text-muted uppercase">Shipping Information</h4>
                                <div className="grid grid-cols-12 gap-3">
                                    <div className="col-span-9 relative">
                                        <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">Shipping Address</div>
                                        <input 
                                            type="text"
                                            value={newCustForm.shippingAddress}
                                            onChange={(e) => setNewCustForm({ ...newCustForm, shippingAddress: e.target.value })}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary"
                                        />
                                    </div>
                                    <div className="col-span-3 relative">
                                        <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">Apt/Unit</div>
                                        <input 
                                            type="text"
                                            value={newCustForm.shippingApt}
                                            onChange={(e) => setNewCustForm({ ...newCustForm, shippingApt: e.target.value })}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary"
                                        />
                                    </div>
                                    <div className="col-span-4 relative">
                                        <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">City</div>
                                        <input 
                                            type="text"
                                            value={newCustForm.shippingCity}
                                            onChange={(e) => setNewCustForm({ ...newCustForm, shippingCity: e.target.value })}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary"
                                        />
                                    </div>
                                    <div className="col-span-4 relative">
                                        <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">State</div>
                                        <input 
                                            type="text"
                                            value={newCustForm.shippingState}
                                            onChange={(e) => setNewCustForm({ ...newCustForm, shippingState: e.target.value })}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-semibold"
                                        />
                                    </div>
                                    <div className="col-span-4 relative">
                                        <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">ZIP Code</div>
                                        <input 
                                            type="text"
                                            value={newCustForm.shippingZip}
                                            onChange={(e) => setNewCustForm({ ...newCustForm, shippingZip: e.target.value })}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm font-mono text-text-primary outline-none focus:border-accent-primary"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Billing Blocks */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold tracking-wider text-text-muted uppercase">Billing Information</h4>
                                    <button 
                                        type="button" 
                                        onClick={() => syncBillingWithShipping(false)}
                                        className="text-sm font-bold uppercase text-accent-primary hover:underline"
                                    >
                                        Copy Shipping
                                    </button>
                                </div>
                                <div className="grid grid-cols-12 gap-3">
                                    <div className="col-span-9 relative">
                                        <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">Billing Address</div>
                                        <input 
                                            type="text"
                                            value={newCustForm.billingAddress}
                                            onChange={(e) => setNewCustForm({ ...newCustForm, billingAddress: e.target.value })}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary"
                                        />
                                    </div>
                                    <div className="col-span-3 relative">
                                        <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">Apt/Unit</div>
                                        <input 
                                            type="text"
                                            value={newCustForm.billingApt}
                                            onChange={(e) => setNewCustForm({ ...newCustForm, billingApt: e.target.value })}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary"
                                        />
                                    </div>
                                    <div className="col-span-4 relative">
                                        <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">City</div>
                                        <input 
                                            type="text"
                                            value={newCustForm.billingCity}
                                            onChange={(e) => setNewCustForm({ ...newCustForm, billingCity: e.target.value })}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary"
                                        />
                                    </div>
                                    <div className="col-span-4 relative">
                                        <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">State</div>
                                        <input 
                                            type="text"
                                            value={newCustForm.billingState}
                                            onChange={(e) => setNewCustForm({ ...newCustForm, billingState: e.target.value })}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-semibold"
                                        />
                                    </div>
                                    <div className="col-span-4 relative">
                                        <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">ZIP Code</div>
                                        <input 
                                            type="text"
                                            value={newCustForm.billingZip}
                                            onChange={(e) => setNewCustForm({ ...newCustForm, billingZip: e.target.value })}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm font-mono text-text-primary outline-none focus:border-accent-primary"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer buttons */}
                            <div className="pt-4 border-t border-border-subtle flex items-center gap-3">
                                <button 
                                    type="button"
                                    onClick={() => { playClick(); setIsAddOpen(false); }}
                                    className="flex-1 py-3 border border-border-subtle rounded-xl text-sm font-bold tracking-wider uppercase hover:bg-surface-alt/50 text-text-secondary transition-colors"
                                >
                                    Dismiss
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-[2] py-3 bg-accent-primary text-white rounded-xl text-sm font-bold tracking-wider uppercase hover:bg-accent-primary/95 transition-colors shadow-lg shadow-accent-primary/15"
                                >
                                    Create Contact Entry
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
