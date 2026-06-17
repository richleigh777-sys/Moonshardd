
import React, { useState, useMemo } from 'react';
import { Search, History, Shield, EyeOff, Package, DollarSign, Activity, X, RotateCcw } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useCRM } from '../../hooks/useCRM';
import { Sale } from '../../types';
import { Badge, Button } from '../ui/Base';

interface TransactionHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect?: (sale: Sale) => void;
}

export const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({ isOpen, onClose, onSelect }) => {
    const { sales } = useCRM();
    const [searchQuery, setSearchQuery] = useState('');
    const [now] = useState(() => Date.now());

    // --- SECURE DATA LOGIC ---
    const secureHistory = useMemo(() => {
        if (!searchQuery || searchQuery.length < 2) return [];

        const lowerQ = searchQuery.toLowerCase();
        const cleanQ = lowerQ.replace(/\D/g, ''); // Numeric only for phone matching
        
        // 1. Find matching sales (Enhanced Fuzzy Match)
        const matches = sales.filter(s => {
            const cleanPhone = s.phone.replace(/\D/g, '');
            return (
                s.customer.toLowerCase().includes(lowerQ) || 
                (s.orderId && s.orderId.toLowerCase().includes(lowerQ)) ||
                (cleanQ.length > 3 && cleanPhone.includes(cleanQ)) || // Match phone segments
                (s.email && s.email.toLowerCase().includes(lowerQ))
            );
        });

        // 2. Group by Unique Identity
        const grouped: Record<string, Sale[]> = {};
        
        matches.forEach(s => {
            // Priority Grouping: Phone > Email > Name
            const key = s.phone || s.email || s.customer;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(s);
        });

        // 3. Format for Display (Sort by date desc, take top 3)
        return Object.values(grouped).map(group => {
            const sorted = group.sort((a, b) => b.timestamp - a.timestamp);
            return {
                identity: sorted[0], // Use latest for profile header
                history: sorted.slice(0, 3) // STRICT LIMIT: Last 3 Transactions
            };
        });

    }, [sales, searchQuery]);

    // Privacy Masker
    const maskPhone = (phone: string) => {
        if (!phone) return 'Unknown';
        const clean = phone.replace(/\D/g, '');
        if (clean.length < 4) return '***-***-****';
        return `(***) ***-${clean.slice(-4)}`;
    };

    const formatRelativeTime = (timestamp: number) => {
        const diff = now - timestamp;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        return `${days} days ago`;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Transaction Archive" size="lg">
            <div className="flex flex-col h-[600px] -m-8 relative overflow-hidden bg-surface-main">
                
                {/* Refraction Ambient Background */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent-primary/5 via-transparent to-surface-alt/10 pointer-events-none" />
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent-primary/10 blur-[80px] rounded-full pointer-events-none" />

                {/* Search Header - Refraction Glass Style */}
                <div className="p-4 border-b border-border-subtle bg-surface-main/70 backdrop-blur-xl shrink-0 space-y-4 relative z-10">
                    <div className="flex items-center gap-2 text-xs font-[700]  text-text-muted tracking-widest opacity-80">
                        <Shield size={16} className="text-status-success" />
                        <span>Search Protocol • Last 3 Transactions</span>
                    </div>
                    <div className="relative group">
                         <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-primary/20 to-indigo-500/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm"></div>
                         <div className="relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-primary transition-colors" />
                            <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search Name, Phone, Email, or Order ID..."
                                className="w-full bg-surface-alt/50 border border-border-subtle rounded-xl py-4 pl-12 pr-4 text-sm font-bold text-text-primary outline-none focus:bg-surface-main focus:border-accent-primary/50 transition-all placeholder:text-text-muted/50 shadow-inner"
                                autoFocus
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-surface-alt rounded-full text-text-muted hover:text-text-primary transition-colors">
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Results Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 relative z-10">
                    {secureHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-text-muted opacity-40">
                            <div className="w-24 h-24 bg-surface-alt rounded-full flex items-center justify-center mb-6 border border-border-subtle">
                                <History size={40} strokeWidth={1.5} />
                            </div>
                            <p className="text-sm font-[700]  tracking-widest">
                                {searchQuery ? 'No Matches Found' : 'Enter Identity to Search'}
                            </p>
                        </div>
                    ) : (
                        <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
                            {secureHistory.map((group, idx) => (
                                <div key={idx} className="group/card relative overflow-hidden rounded-[2rem] border border-border-subtle bg-surface-main/40 hover:bg-surface-main/60 transition-all duration-500 hover:shadow-2xl hover:border-accent-primary/20">
                                    
                                    {/* Glossy sheen on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover/card:opacity-100 transition-opacity pointer-events-none transform -translate-x-full group-hover/card:translate-x-full duration-1000 ease-in-out"></div>
                                    
                                    {/* Customer Header */}
                                    <div className="p-5 border-b border-border-subtle flex justify-between items-center bg-surface-alt/10 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-accent-secondary/20 flex items-center justify-center font-[700] text-lg text-accent-secondary">
                                                {group.identity.customer.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-[700] text-text-primary  tracking-tight">{group.identity.customer}</h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs font-mono font-bold text-text-muted flex items-center gap-1 bg-surface-alt/50 px-2.5 py-1 rounded border border-border-subtle">
                                                        <EyeOff size={16} /> {maskPhone(group.identity.phone)}
                                                    </span>
                                                    {group.history.length > 1 && (
                                                        <span className="text-xs font-bold text-accent-primary flex items-center gap-1">
                                                            <Activity size={16}/> {group.history.length} Matches
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {onSelect && (
                                            <Button 
                                                onClick={() => { onSelect(group.identity); onClose(); }}
                                                variant="secondary"
                                                className="h-9 text-xs  font-[700] tracking-wider bg-surface-main/50 hover:bg-surface-alt border-border-subtle"
                                            >
                                                Select Profile
                                            </Button>
                                        )}
                                    </div>

                                    {/* Recent Transactions Timeline */}
                                    <div className="p-5 relative z-10">
                                        <div className="absolute top-5 bottom-5 left-[29px] w-px bg-border-subtle/30 z-0"></div>
                                        
                                        <div className="space-y-4 relative z-10">
                                            {group.history.map((sale, _i) => (
                                                <div key={sale.id} className="flex gap-4 group/row">
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center bg-surface-main shrink-0 mt-1 z-10 ${sale.status === 'Approved' ? 'border-emerald-500 text-status-success shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'border-amber-500 text-status-warning'}`}>
                                                        <div className={`w-2 h-2 rounded-full ${sale.status === 'Approved' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                                    </div>
                                                    
                                                    <div className="flex-1 bg-surface-alt/20 hover:bg-surface-alt/50 border border-border-subtle rounded-xl p-3 transition-all flex justify-between items-center group-hover/row:border-accent-primary/20 backdrop-blur-sm">
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-xs font-[700]  text-text-secondary">{formatRelativeTime(sale.timestamp)}</span>
                                                                <span className="text-xs text-text-muted opacity-50">•</span>
                                                                <span className="text-xs text-text-muted font-mono">{new Date(sale.timestamp).toLocaleDateString()}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Package size={16} className="text-text-muted"/>
                                                                <span className="text-xs font-bold text-text-primary">{sale.product}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <DollarSign size={16} className="text-text-muted"/>
                                                                <span className="text-xs font-mono font-bold text-text-primary">${Number(sale.amount).toFixed(2)}</span>
                                                                <Badge status={sale.status} className="scale-75 origin-left ml-2" />
                                                            </div>
                                                        </div>

                                                        {onSelect && (
                                                            <button 
                                                                onClick={() => { onSelect(sale); onClose(); }}
                                                                className="flex flex-col items-center gap-1 text-xs font-bold text-text-muted hover:text-accent-primary  tracking-wider group/clone p-2 hover:bg-surface-main/50 rounded-xl transition-all"
                                                                title="Clone This Exact Order"
                                                            >
                                                                <RotateCcw size={16} className="group-hover/clone:-rotate-180 transition-transform duration-500"/>
                                                                Clone
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};
