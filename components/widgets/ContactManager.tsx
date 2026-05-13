
import React, { useState, useMemo } from 'react';
import { Search, UserPlus, Phone, Mail, Trash2, ChevronRight } from 'lucide-react';
import { Card, Button, Badge } from '../ui/Base';
import { useCRM } from '../../hooks/useCRM';
import { AddContactModal } from '../modals/AddContactModal';
import { CustomerProfileModal } from '../modals/CustomerProfileModal';
import { sfx } from '../../lib/soundService';
import { maskPII } from '../../utils/security';

export const ContactManager: React.FC = () => {
    const { customers, deleteCustomer, sales } = useCRM();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomerPhone, setSelectedCustomerPhone] = useState<string | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const filteredCustomers = useMemo(() => {
        if (!searchQuery) return customers;
        const q = searchQuery.toLowerCase();
        return customers.filter(c => 
            c.name?.toLowerCase().includes(q) || 
            c.email?.toLowerCase().includes(q) || 
            c.phone?.includes(q)
        );
    }, [customers, searchQuery]);

    const handleViewProfile = (phone: string) => {
        setSelectedCustomerPhone(phone);
        setIsProfileOpen(true);
        sfx.playClick();
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this contact? This cannot be undone.')) {
            await deleteCustomer(id);
            sfx.playTrash();
        }
    };

    return (
        <Card variant="panel" className="h-full flex flex-col bg-surface-main border-border-subtle shadow-xl overflow-hidden">
            {/* HEADER */}
            <div className="p-6 border-b border-border-subtle flex justify-between items-center bg-surface-alt/30 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary border border-accent-primary/20">
                        <UserPlus size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-black uppercase tracking-tight text-text-primary">Contact Directory</h2>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{customers.length} Active Records</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-primary transition-colors"/>
                        <input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search contacts..."
                            className="bg-surface-main border border-border-subtle rounded-xl py-2 pl-9 pr-4 text-xs font-bold outline-none focus:border-accent-primary transition-all w-64 shadow-inner"
                        />
                    </div>
                    {/* Placeholder for Add Contact - could be a modal trigger */}
                    <Button variant="primary" className="h-9 px-4 text-[10px] uppercase tracking-widest gap-2" onClick={() => setIsAddModalOpen(true)}>
                        <UserPlus size={14} /> New Contact
                    </Button>
                </div>
            </div>

            {/* TABLE */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                <div className="grid grid-cols-1 gap-2">
                    {filteredCustomers.length === 0 ? (
                        <div className="text-center py-20 opacity-40">
                            <UserPlus size={48} className="mx-auto mb-4 text-text-muted" />
                            <p className="text-xs font-black uppercase tracking-widest text-text-muted">No contacts found</p>
                        </div>
                    ) : (
                        filteredCustomers.map(customer => (
                            <div 
                                key={customer.id}
                                onClick={() => handleViewProfile(customer.phone)}
                                className="group bg-surface-main hover:bg-surface-highlight border border-border-subtle hover:border-accent-primary/30 rounded-xl p-4 transition-all cursor-pointer flex items-center justify-between shadow-sm hover:shadow-md"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg shrink-0">
                                        {customer.name?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-text-primary group-hover:text-accent-primary transition-colors">{maskPII(customer.name, 'text')}</h3>
                                        <div className="flex items-center gap-4 mt-1 text-xs text-text-secondary">
                                            <span className="flex items-center gap-1.5"><Phone size={12} className="text-text-muted"/> {maskPII(customer.phone, 'phone')}</span>
                                            <span className="flex items-center gap-1.5"><Mail size={12} className="text-text-muted"/> {maskPII(customer.email, 'email')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden md:block">
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Lifetime Value</p>
                                        <p className="text-sm font-mono font-bold text-text-primary">${(customer.ltv || 0).toLocaleString()}</p>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        {customer.tags?.map(tag => (
                                            <Badge key={tag} status="neutral" className="scale-90">{tag}</Badge>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={(e) => handleDelete(customer.id, e)}
                                            className="p-2 hover:bg-status-error/10 text-text-muted hover:text-status-error rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    
                                    <ChevronRight size={16} className="text-text-muted group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* MODAL */}
            {selectedCustomerPhone && (
                <CustomerProfileModal 
                    isOpen={isProfileOpen}
                    onClose={() => setIsProfileOpen(false)}
                    phone={selectedCustomerPhone}
                    allSales={sales}
                    role="agent" // Default to agent view for now
                />
            )}
            
            <AddContactModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
            />
        </Card>
    );
};
