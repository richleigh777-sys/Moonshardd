
import React, { useMemo, useState } from 'react';
import { User, ShoppingBag, Clock, Shield, Mail, Phone, MapPin, TrendingUp, Award, Calendar, Activity, AlertTriangle, ArrowUpRight, Zap, Link, Eye, EyeOff } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Sale } from '../../types';
import { Badge, Button } from '../ui/Base';
import { useCRM } from '../../hooks/useCRM';
import { useAuth } from '../../hooks/useAuth';
import { normalizePhone, normalizeEmail } from '../../views/utils/dataSanitizer';
import { maskPII } from '../../utils/security';

interface CustomerProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    phone: string;
    allSales: Sale[];
    onLoadToWorkspace?: (sale: Sale) => void;
    role: 'admin' | 'agent';
}

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({ 
    isOpen, onClose, phone, allSales, onLoadToWorkspace, role 
}) => {
    const { currentUser } = useAuth();
    const { customers } = useCRM();
    const [now] = React.useState(() => Date.now());
    const [isRevealed, setIsRevealed] = useState(false);

    // 1. Resolve Customer Identity via Smart Guard (Multi-Point Lookup)
    const customerProfile = useMemo(() => {
        const cleanPhone = normalizePhone(phone);
        // Safely check phones array existence using optional chaining and includes()
        return customers.find(c => c.phones?.includes(cleanPhone) || c.phone === phone);
    }, [customers, phone]);

    // 2. Fetch History (Intelligence Engine vs Fallback)
    const customerHistory = useMemo(() => {
        let rawHistory: Sale[] = [];
        if (customerProfile && customerProfile.salesHistory && customerProfile.salesHistory.length > 0) {
            rawHistory = [...customerProfile.salesHistory];
        } else {
            const cleanPhone = normalizePhone(phone);
            rawHistory = allSales.filter(s => normalizePhone(s.phone) === cleanPhone);
        }

        // Privacy Filter: Agents only see their own sales OR others' finalized deals
        if (role === 'agent') {
            return rawHistory.filter(s => 
                s.agentId === currentUser?.id || 
                s.status === 'Approved' || 
                s.status === 'Declined' || 
                s.status === 'Cancelled'
            ).sort((a, b) => b.timestamp - a.timestamp);
        }

        return rawHistory.sort((a, b) => b.timestamp - a.timestamp);
    }, [allSales, customerProfile, phone, role, currentUser?.id]);

    const displayName = customerProfile ? (customerProfile.name || customerProfile.fullName) : (customerHistory[0]?.customer || 'Unknown Customer');
    const displayEmail = customerProfile ? customerProfile.email : (customerHistory[0]?.email || 'No Email');
    const displayAddress = customerProfile ? customerProfile.address : (customerHistory[0]?.address || 'No Address');
    
    // Demographic Data extraction
    const displayAge = customerProfile?.age || customerHistory[0]?.age;
    const displayDob = customerProfile?.dob || customerHistory[0]?.dob;

    // Compute Metrics inside useMemo to ensure stability
    const metrics = useMemo(() => {
        const approved = customerHistory.filter(s => s.status === 'Approved');
        const declined = customerHistory.filter(s => s.status === 'Declined');
        
        const totalSpent = approved.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
        const orderCount = approved.length;
        const avgOrderValue = orderCount > 0 ? totalSpent / orderCount : 0;
        
        const lastOrderTime = customerHistory.length > 0 ? customerHistory[0].timestamp : now;
        const daysSinceLastActive = Math.floor((now - lastOrderTime) / (1000 * 60 * 60 * 24));
        
        let tier = 'Standard';
        let tierColor = 'text-text-muted border-text-muted';
        
        if (totalSpent > 10000 || orderCount >= 10) { 
            tier = 'Diamond'; 
            tierColor = 'text-cyan-400 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)] bg-cyan-950/30'; 
        } else if (totalSpent > 5000 || orderCount >= 5) { 
            tier = 'Platinum'; 
            tierColor = 'text-indigo-400 border-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.3)] bg-indigo-950/30'; 
        } else if (totalSpent > 1000 || orderCount >= 2) { 
            tier = 'Gold'; 
            tierColor = 'text-amber-400 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] bg-amber-950/30'; 
        }

        const declineRate = customerHistory.length > 0 ? declined.length / customerHistory.length : 0;
        const riskLevel = declineRate > 0.3 ? 'High' : declineRate > 0.1 ? 'Moderate' : 'Low';

        return { totalSpent, orderCount, avgOrderValue, daysSinceLastActive, tier, tierColor, riskLevel };
    }, [customerHistory, now]);

    const handleEngage = () => {
        if (onLoadToWorkspace) {
            const sourceSale = customerHistory.find(s => s.status === 'Approved') || customerHistory[0];
            if (sourceSale) {
                onLoadToWorkspace(sourceSale);
                onClose();
            }
        }
    };

    const getMatchReason = (sale: Sale) => {
        const cleanInputPhone = normalizePhone(phone);
        const cleanSalePhone = normalizePhone(sale.phone);
        
        if (cleanSalePhone === cleanInputPhone) return 'Phone';
        if (customerProfile && customerProfile.email && normalizeEmail(sale.email || '') === normalizeEmail(customerProfile.email)) return 'Email';
        return 'Linked';
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Customer Profile" size="xl">
            <div className="space-y-6">
                {/* HERO SECTION */}
                <div className="relative overflow-hidden rounded-2xl glass-panel p-6 group">
                    <div className="absolute top-0 right-0 p-12 opacity-5 transform group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                        <User size={180} />
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-start justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-2xl bg-surface-main flex items-center justify-center border border-border-subtle shadow-2xl relative overflow-hidden shrink-0">
                                <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/20 to-transparent"></div>
                                <span className="text-3xl font-black text-accent-primary drop-shadow-lg">
                                    {displayName.charAt(0)}
                                </span>
                            </div>
                            
                            <div className="min-w-0">
                                <div className="flex items-center gap-3 mb-1 flex-wrap">
                                    <h2 className="text-2xl font-black text-text-primary tracking-tight truncate">
                                        {isRevealed ? displayName : maskPII(displayName, 'text')}
                                    </h2>
                                    <button 
                                        onClick={() => setIsRevealed(!isRevealed)}
                                        className="p-1 px-2 flex items-center gap-1.5 rounded-lg bg-surface-alt/50 hover:bg-surface-alt text-[9px] font-black uppercase tracking-widest text-text-muted hover:text-accent-primary transition-all border border-border-subtle"
                                    >
                                        {isRevealed ? <EyeOff size={12} /> : <Eye size={12} />}
                                        {isRevealed ? 'Hide PII' : 'Reveal PII'}
                                    </button>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${metrics.tierColor}`}>
                                        {metrics.tier} Member
                                    </span>
                                    {customerProfile && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border border-status-success/30 text-status-success bg-status-success/10 flex items-center gap-1">
                                            <Shield size={10} /> Verified
                                        </span>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-1 gap-y-2 text-sm">
                                     <div className="flex items-center gap-4 flex-wrap">
                                         <div className="flex items-center gap-2 text-text-secondary group/link cursor-pointer hover:text-accent-primary transition-colors">
                                            <Phone size={14} className="text-text-muted group-hover/link:text-accent-primary"/> 
                                            <span className="font-mono">{isRevealed ? phone : maskPII(phone, 'phone')}</span>
                                            {customerProfile && customerProfile.phones && customerProfile.phones.length > 1 && (
                                                <span className="text-[9px] bg-surface-alt px-1.5 rounded text-text-muted border border-border-subtle">
                                                    +{customerProfile.phones.length - 1} Alt
                                                </span>
                                            )}
                                         </div>
                                         {(displayAge || displayDob) && (
                                             <div className="flex items-center gap-2 text-text-secondary">
                                                 <Calendar size={14} className="text-text-muted"/>
                                                 <span className="font-mono">
                                                     {displayAge ? `${displayAge} Yrs` : ''} 
                                                     {displayAge && displayDob ? ' • ' : ''}
                                                     {displayDob ? `Born ${isRevealed ? displayDob : maskPII(displayDob)}` : ''}
                                                 </span>
                                             </div>
                                         )}
                                     </div>
                                     <div className="flex items-center gap-2 text-text-secondary truncate">
                                        <Mail size={14} className="text-text-muted"/> {isRevealed ? displayEmail : maskPII(displayEmail, 'email')}
                                     </div>
                                     <div className="flex items-center gap-2 text-text-muted text-xs mt-1">
                                        <MapPin size={14} className="shrink-0"/> 
                                        <span className="truncate">{isRevealed ? displayAddress : maskPII(displayAddress)}</span>
                                     </div>
                                </div>
                            </div>
                        </div>

                        {/* ENGAGE BUTTON */}
                        {role === 'agent' && onLoadToWorkspace && (
                            <Button 
                                onClick={handleEngage}
                                className="h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest shadow-lg shadow-emerald-500/30 border border-emerald-400/50 animate-in slide-in-from-right-4"
                            >
                                <Zap size={18} className="mr-2 fill-current" />
                                Initialize Reorder
                            </Button>
                        )}
                    </div>
                </div>

                {/* METRICS GRID */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 glass-panel rounded-xl hover:bg-surface-highlight/10 transition-colors group">
                        <p className="text-[10px] font-bold uppercase text-text-muted flex items-center gap-2 mb-2">
                            <Award size={12} /> Lifetime Value
                        </p>
                        <p className="text-xl font-black text-text-primary num-font group-hover:text-status-success transition-colors">
                            ${metrics.totalSpent.toLocaleString()}
                        </p>
                    </div>
                    <div className="p-4 glass-panel rounded-xl hover:bg-surface-highlight/10 transition-colors group">
                        <p className="text-[10px] font-bold uppercase text-text-muted flex items-center gap-2 mb-2">
                            <TrendingUp size={12} /> Avg Order
                        </p>
                        <p className="text-xl font-black text-text-primary num-font">
                            ${metrics.avgOrderValue.toFixed(0)}
                        </p>
                    </div>
                    <div className="p-4 glass-panel rounded-xl hover:bg-surface-highlight/10 transition-colors group">
                        <p className="text-[10px] font-bold uppercase text-text-muted flex items-center gap-2 mb-2">
                            <ShoppingBag size={12} /> Frequency
                        </p>
                        <p className="text-xl font-black text-text-primary num-font">
                            {metrics.orderCount} <span className="text-xs text-text-muted font-bold">Orders</span>
                        </p>
                    </div>
                    <div className="p-4 glass-panel rounded-xl hover:bg-surface-highlight/10 transition-colors group">
                        <p className="text-[10px] font-bold uppercase text-text-muted flex items-center gap-2 mb-2">
                            <Clock size={12} /> Recency
                        </p>
                        <p className={`text-xl font-black num-font ${metrics.daysSinceLastActive > 60 ? 'text-status-warning' : 'text-text-primary'}`}>
                            {metrics.daysSinceLastActive} <span className="text-xs text-text-muted font-bold">Days Ago</span>
                        </p>
                    </div>
                </div>

                {/* INTELLIGENCE & TAGS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                         <h4 className="text-xs font-black text-text-primary flex items-center gap-2 uppercase tracking-wider">
                            <Activity size={14} className="text-accent-primary"/> Behavioral Signals
                         </h4>
                         <div className="p-4 glass-panel rounded-xl space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-text-muted font-bold">Churn Risk</span>
                                <Badge status={metrics.daysSinceLastActive > 90 ? 'High' : metrics.daysSinceLastActive > 45 ? 'Mid' : 'Low'}>
                                    {metrics.daysSinceLastActive > 90 ? 'Critical' : metrics.daysSinceLastActive > 45 ? 'Watchlist' : 'Stable'}
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-text-muted font-bold">Payment Risk</span>
                                <Badge status={metrics.riskLevel === 'High' ? 'Critical' : metrics.riskLevel === 'Moderate' ? 'High' : 'Low'}>
                                    {metrics.riskLevel}
                                </Badge>
                            </div>
                         </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-xs font-black text-text-primary flex items-center gap-2 uppercase tracking-wider">
                            <Shield size={14} className="text-accent-primary"/> Medical Context
                        </h4>
                        <div className="p-4 glass-panel rounded-xl min-h-[88px] flex flex-wrap content-start gap-1.5">
                            {customerHistory.length > 0 && customerHistory[0].medicalConditions && customerHistory[0].medicalConditions.length > 0 ? (
                                customerHistory[0].medicalConditions.map((c, i) => (
                                    <span key={i} className="px-2 py-1 bg-surface-main/50 rounded-md text-[10px] font-bold text-text-primary border border-border-subtle shadow-sm flex items-center gap-1">
                                        <div className="w-1 h-1 rounded-full bg-accent-primary"></div>
                                        {c}
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs text-text-muted italic flex items-center gap-2 opacity-60">
                                    <AlertTriangle size={12}/> No conditions tagged.
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* TRANSACTION HISTORY */}
                <div className="space-y-3 flex-1 flex flex-col min-h-0">
                    <h4 className="text-xs font-black text-text-primary flex items-center gap-2 uppercase tracking-wider">
                        <Calendar size={14} className="text-accent-primary"/> Transaction Ledger
                    </h4>
                    <div className="border border-border-subtle rounded-xl overflow-hidden shadow-sm flex-1">
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left bg-surface-main relative">
                                <thead className="bg-surface-alt/80 backdrop-blur-sm text-[9px] font-bold text-text-muted uppercase tracking-widest border-b border-border-subtle sticky top-0 z-10">
                                    <tr>
                                        <th className="p-3 pl-4">Date</th>
                                        <th className="p-3">Product Detail</th>
                                        <th className="p-3">Matched By</th>
                                        <th className="p-3 text-right">Value</th>
                                        <th className="p-3 text-right">Result</th>
                                        {role === 'agent' && onLoadToWorkspace && <th className="p-3 text-right pr-4">Action</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-subtle text-xs">
                                    {customerHistory.length === 0 ? (
                                        <tr><td colSpan={6} className="p-8 text-center text-text-muted italic">No history found.</td></tr>
                                    ) : customerHistory.map(sale => {
                                        const matchType = getMatchReason(sale);
                                        return (
                                            <tr key={sale.id} className="hover:bg-surface-alt/50 transition-colors group">
                                                <td className="p-3 pl-4 font-mono text-text-muted whitespace-nowrap align-top">{new Date(sale.timestamp).toLocaleDateString()}</td>
                                                <td className="p-3 align-top">
                                                    <div className="font-bold text-text-primary truncate max-w-[120px]" title={sale.product}>{sale.product}</div>
                                                    <div className="text-[10px] text-text-muted">{sale.quantity}</div>
                                                </td>
                                                <td className="p-3 align-top">
                                                    <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-text-muted">
                                                        <Link size={10} className={matchType === 'Email' ? 'text-indigo-500' : matchType === 'Phone' ? 'text-emerald-500' : 'text-text-muted'}/>
                                                        {matchType}
                                                    </div>
                                                </td>
                                                <td className="p-3 text-right font-mono font-bold text-text-primary align-top">${sale.amount}</td>
                                                <td className="p-3 text-right align-top"><Badge status={sale.status} className="scale-75 origin-right"/></td>
                                                {role === 'agent' && onLoadToWorkspace && (
                                                    <td className="p-3 text-right pr-4 align-top">
                                                        <button 
                                                            onClick={() => {
                                                                onLoadToWorkspace(sale);
                                                                onClose();
                                                            }}
                                                            className="p-1.5 bg-accent-primary/10 hover:bg-accent-primary text-accent-primary hover:text-white rounded-lg transition-all"
                                                            title="Load Record"
                                                        >
                                                            <ArrowUpRight size={14} />
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div className="pt-2">
                    <Button variant="ghost" onClick={onClose} className="w-full h-10 uppercase tracking-widest font-bold text-xs hover:bg-surface-alt border border-transparent hover:border-border-subtle">
                        Dismiss Profile
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
