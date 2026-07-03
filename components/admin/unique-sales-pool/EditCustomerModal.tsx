import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, X, Activity, Scale, MapPin, CreditCard, Heart, Layers } from 'lucide-react';
import { Customer } from '../../../types';
import { useCRMData } from '../../../hooks/useCRMData';
import { useSystem } from '../../../hooks/useSystem';
import { useAuth } from '../../../hooks/useAuth';
import { sfx } from '../../../lib/soundService';

interface EditCustomerModalProps {
    editingCustomer: Customer | null;
    setEditingCustomer: (customer: Customer | null) => void;
}

export function EditCustomerModal({ editingCustomer, setEditingCustomer }: EditCustomerModalProps) {
    const { currentUser } = useAuth();
    const { updateCustomer, logAudit } = useCRMData(currentUser);
    const { setToast } = useSystem();
    const playClick = () => sfx.playClick();
    const playConfirm = () => sfx.playConfirm();
    const playSuccess = () => sfx.playSuccess();
    const playDecline = () => sfx.playDecline();

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCustomer) return;
        playConfirm();

        try {
            const medConds = typeof (editingCustomer as any).medicalConditionsString === 'string'
                ? (editingCustomer as any).medicalConditionsString.split(',').map((s: string) => s.trim()).filter(Boolean)
                : editingCustomer.medicalConditions;
            const crmConds = typeof (editingCustomer as any).crmTagsString === 'string'
                ? (editingCustomer as any).crmTagsString.split(',').map((s: string) => s.trim()).filter(Boolean)
                : editingCustomer.crmTags;
            const leadConds = typeof (editingCustomer as any).leadSourcesString === 'string'
                ? (editingCustomer as any).leadSourcesString.split(',').map((s: string) => s.trim()).filter(Boolean)
                : editingCustomer.leadSources;
            const pipeConds = typeof (editingCustomer as any).pipelineStagesString === 'string'
                ? (editingCustomer as any).pipelineStagesString.split(',').map((s: string) => s.trim()).filter(Boolean)
                : editingCustomer.pipelineStages;

            const updates: Partial<Customer> = {
                firstName: editingCustomer.firstName,
                lastName: editingCustomer.lastName,
                middleInitial: (editingCustomer as any).middleInitial || '',
                phone: editingCustomer.phone,
                alternatePhone: (editingCustomer as any).alternatePhone || '',
                email: editingCustomer.email,
                shippingAddress: editingCustomer.shippingAddress,
                shippingApt: editingCustomer.shippingApt,
                shippingCity: editingCustomer.shippingCity,
                shippingState: editingCustomer.shippingState,
                shippingZip: editingCustomer.shippingZip,
                billingAddress: editingCustomer.billingAddress,
                billingApt: editingCustomer.billingApt,
                billingCity: editingCustomer.billingCity,
                billingState: editingCustomer.billingState,
                billingZip: editingCustomer.billingZip,
                age: editingCustomer.age ? Number(editingCustomer.age) : undefined,
                dob: editingCustomer.dob,
                height: editingCustomer.height,
                weight: editingCustomer.weight,
                medicalConditions: medConds,
                crmTags: crmConds,
                leadSources: leadConds,
                pipelineStages: pipeConds,
                name: `${editingCustomer.firstName} ${editingCustomer.lastName}`.trim(),
                fullName: `${editingCustomer.firstName} ${editingCustomer.lastName}`.trim(),
                updatedAt: Date.now()
            };

            await updateCustomer(editingCustomer.id, updates);
            setEditingCustomer(null);
            setToast({
                title: 'Record Updated',
                message: `Client ${updates.fullName}'s unique profile record of UID ${editingCustomer.id} was saved.`,
                type: 'success'
            });
            await logAudit({
                action: 'UPDATE',
                details: `Updated unique profile record for ${updates.fullName} (UID: ${editingCustomer.id}).`,
                module: 'CRM'
            });
            playSuccess();
        } catch (error) {
            console.error('Failed to update customer:', error);
            setToast({
                title: 'Update Failed',
                message: 'Failed to update customer profile in the central database.',
                type: 'error'
            });
            playDecline();
        }
    };

    const syncBillingWithShipping = (_editing: boolean = false) => {
        playClick();
        if (!editingCustomer) return;
        setEditingCustomer({
            ...editingCustomer,
            billingAddress: editingCustomer.shippingAddress,
            billingApt: editingCustomer.shippingApt,
            billingCity: editingCustomer.shippingCity,
            billingState: editingCustomer.shippingState,
            billingZip: editingCustomer.shippingZip
        });
        setToast({
            title: 'Addresses Synced',
            message: 'Billing address fields overwritten with shipping address.',
            type: 'info'
        });
    };

    return (
        <AnimatePresence>
            {editingCustomer && (
                <div className="fixed inset-0 bg-black/60 z-[110] flex justify-end">
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                        className="w-full max-w-xl bg-surface-main border-l border-border-subtle h-full shadow-2xl flex flex-col overflow-hidden"
                        id="edit-customer-panel"
                    >
                        {/* Slide Title */}
                        <div className="p-4 border-b border-border-subtle bg-surface-alt/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-accent-primary/10 border border-accent-primary/20 rounded-xl text-accent-primary">
                                    <Users size={18} />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-text-primary tracking-tight">Edit Unique Record</h2>
                                    <p className="text-sm text-text-muted mt-0.5">UID: {editingCustomer.id}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => { playClick(); setEditingCustomer(null); }}
                                className="p-2 border border-border-subtle bg-surface-main hover:bg-surface-alt rounded-xl text-text-muted hover:text-text-primary transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Slide Contents */}
                        <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-4 space-y-6">
                            {/* Biographical Section */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-2 flex items-center gap-2">
                                    <Activity size={14} className="text-accent-primary" />
                                    1. Biographical Identity
                                </h3>
                                
                                <div className="grid grid-cols-12 gap-3">
                                    <div className="col-span-5 relative">
                                        <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">First Name</div>
                                        <input 
                                            required
                                            type="text" 
                                            value={editingCustomer.firstName || ''}
                                            onChange={(e) => setEditingCustomer({ ...editingCustomer, firstName: e.target.value })}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-medium"
                                        />
                                    </div>
                                    <div className="col-span-2 relative">
                                        <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">MI</div>
                                        <input 
                                            maxLength={1}
                                            type="text" 
                                            value={(editingCustomer as any).middleInitial || ''}
                                            onChange={(e) => setEditingCustomer({ ...editingCustomer, middleInitial: e.target.value.toUpperCase() } as any)}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-medium text-center"
                                        />
                                    </div>
                                    <div className="col-span-5 relative">
                                        <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">Last Name</div>
                                        <input 
                                            required
                                            type="text" 
                                            value={editingCustomer.lastName || ''}
                                            onChange={(e) => setEditingCustomer({ ...editingCustomer, lastName: e.target.value })}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-medium"
                                        />
                                    </div>

                                    <div className="col-span-6 relative">
                                        <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">Direct Phone</div>
                                        <input 
                                            required
                                            type="text" 
                                            value={editingCustomer.phone || ''}
                                            onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm font-mono text-text-primary outline-none focus:border-accent-primary font-bold"
                                        />
                                    </div>
                                    <div className="col-span-6 relative">
                                        <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">Alternate Phone</div>
                                        <input 
                                            type="text" 
                                            value={(editingCustomer as any).alternatePhone || ''}
                                            onChange={(e) => setEditingCustomer({ ...editingCustomer, alternatePhone: e.target.value } as any)}
                                            placeholder="N/A"
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm font-mono text-text-primary outline-none focus:border-accent-primary font-semibold"
                                        />
                                    </div>

                                    <div className="col-span-12 relative">
                                        <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">Contact Email</div>
                                        <input 
                                            type="email" 
                                            value={editingCustomer.email || ''}
                                            onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Vital Statistics / Bio */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-2 flex items-center gap-2">
                                    <Scale size={14} className="text-accent-primary" />
                                    2. Vital Metrics
                                </h3>
                                
                                <div className="grid grid-cols-4 gap-3">
                                    <div className="relative">
                                        <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">Age</div>
                                        <input 
                                            type="number" 
                                            value={editingCustomer.age || ''}
                                            onChange={(e) => setEditingCustomer({ ...editingCustomer, age: e.target.value ? Number(e.target.value) : undefined })}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-bold"
                                        />
                                    </div>
                                    <div className="relative col-span-1">
                                        <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">Height</div>
                                        <input 
                                            type="text" 
                                            value={editingCustomer.height || ''}
                                            onChange={(e) => setEditingCustomer({ ...editingCustomer, height: e.target.value })}
                                            placeholder="5'10"
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-medium"
                                        />
                                    </div>
                                    <div className="relative col-span-1">
                                        <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">Weight</div>
                                        <input 
                                            type="text" 
                                            value={editingCustomer.weight || ''}
                                            onChange={(e) => setEditingCustomer({ ...editingCustomer, weight: e.target.value })}
                                            placeholder="180 lbs"
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-medium"
                                        />
                                    </div>
                                    <div className="relative col-span-1">
                                        <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">DOB</div>
                                        <input 
                                            type="text" 
                                            value={editingCustomer.dob || ''}
                                            onChange={(e) => setEditingCustomer({ ...editingCustomer, dob: e.target.value })}
                                            placeholder="MM/DD/YYYY"
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm font-mono text-text-primary outline-none focus:border-accent-primary font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Logistics Locations */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
                                        <MapPin size={14} className="text-accent-primary" />
                                        3. Shipping Location
                                    </h3>
                                </div>
                                <div className="grid grid-cols-12 gap-3">
                                    <div className="col-span-9 relative">
                                        <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">Shipping Address</div>
                                        <input 
                                            type="text" 
                                            value={editingCustomer.shippingAddress || ''}
                                            onChange={(e) => setEditingCustomer({ ...editingCustomer, shippingAddress: e.target.value })}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-medium"
                                        />
                                    </div>
                                    <div className="col-span-3 relative">
                                        <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">Unit/Apt</div>
                                        <input 
                                            type="text" 
                                            value={editingCustomer.shippingApt || ''}
                                            onChange={(e) => setEditingCustomer({ ...editingCustomer, shippingApt: e.target.value })}
                                            placeholder="None"
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-medium"
                                        />
                                    </div>
                                    <div className="col-span-4 relative">
                                        <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">City</div>
                                        <input 
                                            type="text" 
                                            value={editingCustomer.shippingCity || ''}
                                            onChange={(e) => setEditingCustomer({ ...editingCustomer, shippingCity: e.target.value })}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-medium"
                                        />
                                    </div>
                                    <div className="col-span-4 relative">
                                        <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">State</div>
                                        <input 
                                            type="text" 
                                            value={editingCustomer.shippingState || ''}
                                            onChange={(e) => setEditingCustomer({ ...editingCustomer, shippingState: e.target.value })}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-semibold"
                                        />
                                    </div>
                                    <div className="col-span-4 relative">
                                        <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">ZIP Code</div>
                                        <input 
                                            type="text" 
                                            value={editingCustomer.shippingZip || ''}
                                            onChange={(e) => setEditingCustomer({ ...editingCustomer, shippingZip: e.target.value })}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm font-mono text-text-primary outline-none focus:border-accent-primary font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
                                        <CreditCard size={14} className="text-status-success" />
                                        4. Billing Location
                                    </h3>
                                    <button 
                                        type="button"
                                        onClick={() => syncBillingWithShipping(true)}
                                        className="text-sm font-bold uppercase text-accent-primary tracking-wider hover:underline"
                                    >
                                        Copy Shipping
                                    </button>
                                </div>
                                <div className="grid grid-cols-12 gap-3">
                                    <div className="col-span-9 relative">
                                        <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">Billing Address</div>
                                        <input 
                                            type="text" 
                                            value={editingCustomer.billingAddress || ''}
                                            onChange={(e) => setEditingCustomer({ ...editingCustomer, billingAddress: e.target.value })}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-medium"
                                        />
                                    </div>
                                    <div className="col-span-3 relative">
                                        <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">Unit/Apt</div>
                                        <input 
                                            type="text" 
                                            value={editingCustomer.billingApt || ''}
                                            onChange={(e) => setEditingCustomer({ ...editingCustomer, billingApt: e.target.value })}
                                            placeholder="None"
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-medium"
                                        />
                                    </div>
                                    <div className="col-span-4 relative">
                                        <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">City</div>
                                        <input 
                                            type="text" 
                                            value={editingCustomer.billingCity || ''}
                                            onChange={(e) => setEditingCustomer({ ...editingCustomer, billingCity: e.target.value })}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-medium"
                                        />
                                    </div>
                                    <div className="col-span-4 relative">
                                        <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">State</div>
                                        <input 
                                            type="text" 
                                            value={editingCustomer.billingState || ''}
                                            onChange={(e) => setEditingCustomer({ ...editingCustomer, billingState: e.target.value })}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-semibold"
                                        />
                                    </div>
                                    <div className="col-span-4 relative">
                                        <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">ZIP Code</div>
                                        <input 
                                            type="text" 
                                            value={editingCustomer.billingZip || ''}
                                            onChange={(e) => setEditingCustomer({ ...editingCustomer, billingZip: e.target.value })}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm font-mono text-text-primary outline-none focus:border-accent-primary font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Declarations / Medical */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-2 flex items-center gap-2">
                                    <Heart size={14} className="text-status-error" />
                                    Medical Annotations
                                </h3>
                                
                                <div className="relative">
                                    <div className="absolute top-2 left-3 text-sm font-bold tracking-wide text-text-muted uppercase z-10">Conditions (Comma Separated)</div>
                                    <textarea 
                                        value={(editingCustomer as any).medicalConditionsString || ''}
                                        onChange={(e) => setEditingCustomer({ ...editingCustomer, medicalConditionsString: e.target.value } as any)}
                                        placeholder="Asthma, Diabetes, Heart Murmur"
                                        rows={2}
                                        className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-semibold resize-none"
                                    />
                                </div>
                                
                                <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-2 flex items-center gap-2 mt-6">
                                    <Layers size={14} className="text-purple-500" />
                                    Taxonomy & CRM Variables
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="relative">
                                        <div className="absolute top-2 left-3 text-xs font-bold tracking-wide text-purple-500 uppercase z-10">CRM Tags</div>
                                        <textarea 
                                            value={(editingCustomer as any).crmTagsString || ''}
                                            onChange={(e) => setEditingCustomer({ ...editingCustomer, crmTagsString: e.target.value } as any)}
                                            placeholder="VIP, High Value..."
                                            rows={2}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-purple-500 font-semibold resize-none"
                                        />
                                    </div>
                                    <div className="relative">
                                        <div className="absolute top-2 left-3 text-xs font-bold tracking-wide text-blue-500 uppercase z-10">Lead Sources</div>
                                        <textarea 
                                            value={(editingCustomer as any).leadSourcesString || ''}
                                            onChange={(e) => setEditingCustomer({ ...editingCustomer, leadSourcesString: e.target.value } as any)}
                                            placeholder="Organic, Direct..."
                                            rows={2}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-blue-500 font-semibold resize-none"
                                        />
                                    </div>
                                    <div className="relative">
                                        <div className="absolute top-2 left-3 text-xs font-bold tracking-wide text-amber-500 uppercase z-10">Pipeline Stages</div>
                                        <textarea 
                                            value={(editingCustomer as any).pipelineStagesString || ''}
                                            onChange={(e) => setEditingCustomer({ ...editingCustomer, pipelineStagesString: e.target.value } as any)}
                                            placeholder="New, Qualified..."
                                            rows={2}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-amber-500 font-semibold resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Save Button Footer */}
                            <div className="pt-4 border-t border-border-subtle flex items-center gap-3">
                                <button 
                                    type="button"
                                    onClick={() => { playClick(); setEditingCustomer(null); }}
                                    className="flex-1 py-3 border border-border-subtle rounded-xl text-sm font-bold tracking-wider uppercase hover:bg-surface-alt/50 text-text-secondary transition-colors"
                                >
                                    Dismiss
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-[2] py-3 bg-accent-primary text-white rounded-xl text-sm font-bold tracking-wider uppercase hover:bg-accent-primary/90 transition-colors shadow-lg shadow-accent-primary/15"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
