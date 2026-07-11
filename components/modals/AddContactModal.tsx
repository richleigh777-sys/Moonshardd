import { getStorageItem } from "../../lib/storage";

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Base';
import { useCRM } from '../../hooks/useCRM';
import { sfx } from '../../lib/soundService';
import { User, Phone, Mail, MapPin } from 'lucide-react';

interface AddContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({ isOpen, onClose }) => {
    const { addCustomer, currentUser } = useCRM();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.phone) return;

        await addCustomer({
            ...formData,
            id: `cust-${Date.now()}`,
            serverId: getStorageItem('nexus_server_id') || currentUser?.serverId || 'global',
            firstName: formData.name.split(' ')[0],
            lastName: formData.name.split(' ').slice(1).join(' '),
            fullName: formData.name,
            normalizedPhone: formData.phone.replace(/\D/g, ''),
            normalizedEmail: formData.email.toLowerCase(),
            addressFingerprint: formData.address.replace(/\s/g, '').toLowerCase(),
            tags: ['New'],
            salesHistory: [],
            phones: [formData.phone],
            emails: formData.email ? [formData.email] : [],
            ltv: 0,
            orderCount: 0,
            lastOrderDate: 0,
            firstSource: 'Manual Entry'
        });

        sfx.playSuccess();
        onClose();
        setFormData({ name: '', phone: '', email: '', address: '' });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Contact">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold  text-text-muted">Full Name</label>
                    <div className="relative">
                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"/>
                        <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-surface-alt border border-border-subtle rounded-xl py-2 pl-10 pr-4 text-sm focus:border-accent-primary outline-none"
                            placeholder="John Doe"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold  text-text-muted">Phone Number</label>
                    <div className="relative">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"/>
                        <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                            value={formData.phone}
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                            className="w-full bg-surface-alt border border-border-subtle rounded-xl py-2 pl-10 pr-4 text-sm focus:border-accent-primary outline-none"
                            placeholder="+1 (555) 000-0000"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold  text-text-muted">Email Address</label>
                    <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"/>
                        <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            className="w-full bg-surface-alt border border-border-subtle rounded-xl py-2 pl-10 pr-4 text-sm focus:border-accent-primary outline-none"
                            placeholder="john@example.com"
                            type="email"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold  text-text-muted">Address</label>
                    <div className="relative">
                        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"/>
                        <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                            value={formData.address}
                            onChange={e => setFormData({...formData, address: e.target.value})}
                            className="w-full bg-surface-alt border border-border-subtle rounded-xl py-2 pl-10 pr-4 text-sm focus:border-accent-primary outline-none"
                            placeholder="123 Main St, City, State"
                        />
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="primary">Create Contact</Button>
                </div>
            </form>
        </Modal>
    );
};
