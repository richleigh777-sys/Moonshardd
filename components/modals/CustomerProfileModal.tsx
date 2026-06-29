
import React, { useMemo, useState, useEffect } from 'react';
import { User, ShoppingBag, Clock, Shield, Mail, Phone, MapPin, TrendingUp, Award, Calendar, Activity, AlertTriangle, ArrowUpRight, Zap, Link, Eye, EyeOff, UserIcon, FileText, ChevronDown, ChevronRight, CheckCircle2, Ticket, MessageSquare, PhoneOff, Tag, Copy, HeartPulse, Network, Layers } from 'lucide-react';
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

type CommsMode = 'note' | 'call' | 'sms' | 'email';

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({ 
    isOpen, onClose, phone, allSales, onLoadToWorkspace, role 
}) => {
    const { currentUser } = useAuth();
    const { customers, notes, addNote } = useCRM();
    const [now] = React.useState(() => Date.now());
    
    // Privacy constraints
    const isSuperAdmin = (currentUser?.level || 0) >= 10;
    const [isRevealed, setIsRevealed] = useState(isSuperAdmin);
    
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [newNote, setNewNote] = useState('');
    const [commsMode, setCommsMode] = useState<CommsMode>('note');
    const [callDuration, setCallDuration] = useState(0);

    useEffect(() => {
        let timer: any;
        if (commsMode === 'call') {
            timer = setInterval(() => setCallDuration(p => p + 1), 1000);
        } else {
            setCallDuration(0);
        }
        return () => clearInterval(timer);
    }, [commsMode]);

    const handleSendComms = async () => {
        if (!currentUser) return;
        
        let content = '';
        let reason = '';
        
        if (commsMode === 'note') {
            if (!newNote.trim()) return;
            reason = 'Agent Note';
            content = newNote.trim();
        } else if (commsMode === 'sms') {
            if (!newNote.trim()) return;
            reason = 'Outbound SMS';
            content = `Message Sent: "${newNote.trim()}"`;
        } else if (commsMode === 'email') {
            if (!newNote.trim()) return;
            reason = 'Outbound Email';
            content = `Email Sent:\n\n${newNote.trim()}`;
        } else if (commsMode === 'call') {
            reason = 'Outbound Call';
            const m = Math.floor(callDuration / 60).toString().padStart(2, '0');
            const s = (callDuration % 60).toString().padStart(2, '0');
            content = `Call completed. Duration: ${m}:${s}`;
        }

        await addNote({
            agentId: currentUser.id,
            agentName: currentUser.name,
            content,
            type: 'note',
            priority: 'Low',
            phone: phone,
            customerName: displayName,
            reason
        } as any);

        setCommsMode('note');
        setNewNote('');
    };

    const toggleRow = (id: string) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

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
            ).sort((a, b) => b.timestamp - a.timestamp).slice(0, 3);
        }

        return rawHistory.sort((a, b) => b.timestamp - a.timestamp);
    }, [allSales, customerProfile, phone, role, currentUser?.id]);

    const extractDisplayName = () => {
        if (customerProfile) {
            if (customerProfile.firstName || customerProfile.lastName) {
                return `${customerProfile.firstName || ''} ${customerProfile.lastName || ''}`.trim();
            }
            return (customerProfile.name || customerProfile.fullName || 'Unknown Customer');
        } else if (customerHistory.length > 0) {
            const h = customerHistory[0];
            if (h.firstName || h.lastName) return `${h.firstName || ''} ${h.lastName || ''}`.trim();
            return h.customer || 'Unknown Customer';
        }
        return 'Unknown Customer';
    };
    const displayName = extractDisplayName();
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
            tierColor = 'text-cyan-400 border-cyan-400 shadow-sm bg-cyan-950/30'; 
        } else if (totalSpent > 5000 || orderCount >= 5) { 
            tier = 'Platinum'; 
            tierColor = 'text-accent-secondary border-indigo-400 shadow-sm bg-indigo-950/30'; 
        } else if (totalSpent > 1000 || orderCount >= 2) { 
            tier = 'Gold'; 
            tierColor = 'text-status-warning border-amber-400 shadow-sm bg-amber-950/30'; 
        }

        const declineRate = customerHistory.length > 0 ? declined.length / customerHistory.length : 0;
        const riskLevel = declineRate > 0.3 ? 'High' : declineRate > 0.1 ? 'Moderate' : 'Low';

        return { totalSpent, orderCount, avgOrderValue, daysSinceLastActive, tier, tierColor, riskLevel };
    }, [customerHistory, now]);

    const customerNotes = useMemo(() => {
        const cleanPhone = normalizePhone(phone);
        return notes.filter(n => normalizePhone(n.phone || '') === cleanPhone).sort((a, b) => b.timestamp - a.timestamp);
    }, [notes, phone]);

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
                <div className="relative overflow-hidden rounded-xl glass-panel p-4 group">
                    <div className="absolute top-0 right-0 p-12 opacity-5 transform group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                        <User size={180} />
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-start justify-between gap-4 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-xl bg-surface-main flex items-center justify-center border border-border-subtle shadow-2xl relative overflow-hidden shrink-0">
                                <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/20 to-transparent"></div>
                                <span className="text-xl font-medium text-accent-primary drop-shadow-lg">
                                    {displayName.charAt(0)}
                                </span>
                            </div>
                            
                            <div className="min-w-0">
                                <div className="flex items-center gap-3 mb-1 flex-wrap">
                                    <h2 className="text-lg font-medium text-text-primary tracking-tight truncate">
                                        {isRevealed ? displayName : maskPII(displayName, 'text')}
                                    </h2>
                                    {isSuperAdmin && (
                                        <button 
                                            onClick={() => setIsRevealed(!isRevealed)}
                                            className="p-1 px-2 flex items-center gap-1.5 rounded-lg bg-surface-alt/50 hover:bg-surface-alt text-xs font-medium tracking-wide text-text-muted hover:text-accent-primary transition-all border border-border-subtle"
                                        >
                                            {isRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                                            {isRevealed ? 'Hide PII' : 'Reveal PII'}
                                        </button>
                                    )}
                                    <span className={`px-2.5 py-1 rounded text-xs font-medium  tracking-wide border ${metrics.tierColor}`}>
                                        {metrics.tier} Member
                                    </span>
                                    {customerProfile && (
                                        <span className="px-2.5 py-1 rounded text-xs font-medium  tracking-wide border border-status-success/30 text-status-success bg-status-success/10 flex items-center gap-1">
                                            <Shield size={16} /> Verified
                                        </span>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-1 gap-y-2 text-sm">
                                     <div className="flex items-center gap-4 flex-wrap">
                                         <div className="flex items-center gap-2 text-text-secondary group/link cursor-pointer hover:text-accent-primary transition-colors">
                                            <Phone size={16} className="text-text-muted group-hover/link:text-accent-primary"/> 
                                            <span className="font-mono">{isRevealed ? phone : maskPII(phone, 'phone')}</span>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(phone); }}
                                                className="p-1 hover:bg-surface-highlight text-text-muted hover:text-accent-primary rounded transition-colors"
                                                title="Copy to clipboard"
                                            >
                                                <Copy size={14} />
                                            </button>
                                            {customerProfile && customerProfile.phones && customerProfile.phones.length > 1 && (
                                                <span className="text-xs bg-surface-alt px-1.5 rounded text-text-muted border border-border-subtle">
                                                    +{customerProfile.phones.length - 1} Alt
                                                </span>
                                            )}
                                         </div>
                                         {(displayAge || displayDob) && (
                                             <div className="flex items-center gap-2 text-text-secondary">
                                                 <Calendar size={16} className="text-text-muted"/>
                                                 <span className="font-mono">
                                                     {displayAge ? `${displayAge} Yrs` : ''} 
                                                     {displayAge && displayDob ? ' • ' : ''}
                                                     {displayDob ? `Born ${isRevealed ? displayDob : maskPII(displayDob)}` : ''}
                                                 </span>
                                             </div>
                                         )}
                                     </div>
                                     <div className="flex items-center gap-2 text-text-secondary truncate">
                                        <Mail size={16} className="text-text-muted"/> {isRevealed ? displayEmail : maskPII(displayEmail, 'email')}
                                     </div>
                                     <div className="flex items-center gap-2 text-text-muted text-xs mt-1">
                                        <MapPin size={16} className="shrink-0"/> 
                                        <span className="truncate">{isRevealed ? displayAddress : maskPII(displayAddress)}</span>
                                     </div>
                                </div>
                            </div>
                        </div>

                        {/* ENGAGE BUTTON */}
                        {role === 'agent' && onLoadToWorkspace && (
                            <Button 
                                onClick={handleEngage}
                                className="h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-medium  tracking-wide shadow-lg shadow-emerald-500/30 border border-emerald-400/50 animate-in slide-in-from-right-4"
                            >
                                <Zap size={18} className="mr-2 fill-current" />
                                Initialize Reorder
                            </Button>
                        )}
                    </div>
                </div>

                {/* METRICS GRID */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="p-4 glass-panel rounded-xl hover:bg-surface-highlight/10 transition-colors group">
                        <p className="text-[10px] uppercase font-bold text-text-muted flex items-center gap-2 mb-2 tracking-wide">
                            <Award size={14} /> Liftetime Value
                        </p>
                        <p className="text-lg font-medium text-text-primary num-font group-hover:text-status-success transition-colors">
                            ${metrics.totalSpent.toLocaleString()}
                        </p>
                    </div>
                    <div className="p-4 glass-panel rounded-xl hover:bg-surface-highlight/10 transition-colors group">
                        <p className="text-[10px] uppercase font-bold text-text-muted flex items-center gap-2 mb-2 tracking-wide">
                            <TrendingUp size={14} /> Avg Order
                        </p>
                        <p className="text-lg font-medium text-text-primary num-font">
                            ${metrics.avgOrderValue.toFixed(0)}
                        </p>
                    </div>
                    <div className="p-4 glass-panel rounded-xl hover:bg-surface-highlight/10 transition-colors group">
                        <p className="text-[10px] uppercase font-bold text-text-muted flex items-center gap-2 mb-2 tracking-wide">
                            <ShoppingBag size={14} /> Approved
                        </p>
                        <p className="text-lg font-medium text-text-primary num-font focus-expand">
                            {metrics.orderCount} <span className="text-xs text-text-muted font-bold font-sans tracking-tight">Orders</span>
                        </p>
                    </div>
                    <div className="p-4 glass-panel rounded-xl hover:bg-surface-highlight/10 transition-colors group">
                        <p className="text-[10px] uppercase font-bold text-status-error flex items-center gap-2 mb-2 tracking-wide">
                            <AlertTriangle size={14} /> Declined
                        </p>
                        <p className="text-lg font-medium text-status-error num-font focus-expand">
                            {customerHistory.filter(s => s.status === 'Declined' || s.status === 'Cancelled').length} <span className="text-xs text-text-muted font-bold font-sans tracking-tight">Orders</span>
                        </p>
                    </div>
                    <div className="p-4 glass-panel rounded-xl hover:bg-surface-highlight/10 transition-colors group col-span-2 md:col-span-1">
                        <p className="text-[10px] uppercase font-bold text-text-muted flex items-center gap-2 mb-2 tracking-wide">
                            <Clock size={14} /> Since Last Order
                        </p>
                        <p className={`text-lg font-medium num-font focus-expand ${metrics.daysSinceLastActive > 60 ? 'text-status-warning' : 'text-text-primary'}`}>
                            {metrics.daysSinceLastActive} <span className="text-xs text-text-muted font-bold font-sans tracking-tight">Days Ago</span>
                        </p>
                    </div>
                </div>

                {/* INTELLIGENCE & TAGS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                         <h4 className="text-[10px] uppercase font-medium text-text-primary flex items-center gap-2 tracking-wide">
                            <Activity size={12} className="text-accent-primary"/> Behavioral Signals
                         </h4>
                         <div className="p-4 glass-panel rounded-xl space-y-3 shadow-inner">
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
                        <h4 className="text-[10px] uppercase font-medium text-text-primary flex items-center gap-2 tracking-wide">
                            <Shield size={12} className="text-accent-primary"/> Medical Context
                        </h4>
                        <div className="p-4 glass-panel rounded-xl min-h-[88px] flex flex-wrap content-start gap-2 shadow-inner">
                            {customerHistory.length > 0 && customerHistory[0].medicalConditions && customerHistory[0].medicalConditions.length > 0 ? (
                                customerHistory[0].medicalConditions.map((c, i) => (
                                    <span key={i} className="px-3 py-1 bg-rose-500/10 rounded border border-rose-500/20 text-[11px] font-medium tracking-wide text-rose-500 flex items-center gap-1.5">
                                        <div className="w-1 h-1 rounded-full bg-rose-500"></div>
                                        {c}
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs text-text-muted italic flex items-center gap-2 opacity-60">
                                    <HeartPulse size={12}/> No conditions.
                                </span>
                            )}
                        </div>
                    </div>
                    
                    <div className="space-y-3 md:col-span-2">
                        <h4 className="text-[10px] uppercase font-medium text-text-primary flex items-center gap-2 tracking-wide">
                            <Tag size={12} className="text-purple-500"/> Global CRM Tags & Pipeline Data
                        </h4>
                        <div className="p-4 glass-panel rounded-xl min-h-[88px] flex flex-wrap content-start gap-2 shadow-inner">
                            {customerProfile && customerProfile.crmTags && customerProfile.crmTags.length > 0 ? (
                                customerProfile.crmTags.map((c, i) => (
                                    <span key={i} className="px-3 py-1 bg-purple-500/10 rounded border border-purple-500/20 text-[11px] font-medium tracking-wide text-purple-400 flex items-center gap-1.5">
                                        <Tag size={10}/>
                                        {c}
                                    </span>
                                ))
                            ) : null}
                            
                            {customerProfile && customerProfile.leadSources && customerProfile.leadSources.length > 0 ? (
                                customerProfile.leadSources.map((c, i) => (
                                    <span key={i} className="px-3 py-1 bg-blue-500/10 rounded border border-blue-500/20 text-[11px] font-medium tracking-wide text-blue-400 flex items-center gap-1.5">
                                        <Network size={10}/>
                                        {c}
                                    </span>
                                ))
                            ) : null}
                            
                            {customerProfile && customerProfile.pipelineStages && customerProfile.pipelineStages.length > 0 ? (
                                customerProfile.pipelineStages.map((c, i) => (
                                    <span key={i} className="px-3 py-1 bg-amber-500/10 rounded border border-amber-500/20 text-[11px] font-medium tracking-wide text-amber-400 flex items-center gap-1.5">
                                        <Layers size={10}/>
                                        {c}
                                    </span>
                                ))
                            ) : null}

                            {(!customerProfile?.crmTags?.length && !customerProfile?.leadSources?.length && !customerProfile?.pipelineStages?.length) ? (
                                <span className="text-xs text-text-muted italic flex items-center gap-2 opacity-60">
                                    <AlertTriangle size={12}/> No CRM tags assigned.
                                </span>
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* STITCHED LOCATION HISTORY */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <h4 className="text-[10px] uppercase font-medium text-text-primary flex items-center gap-2 tracking-wide">
                            <MapPin size={12} className="text-accent-primary"/> Billing & Shipping Profile
                        </h4>
                        <div className="p-4 glass-panel rounded-xl space-y-4 shadow-inner text-xs">
                            <div className="space-y-1">
                                <span className="text-text-muted font-bold block uppercase tracking-wider text-[9px]">Current Shipping Address</span>
                                <p className="text-text-primary font-medium">
                                    {customerProfile ? (
                                        [
                                            customerProfile.shippingAddress || customerProfile.address,
                                            customerProfile.shippingCity,
                                            customerProfile.shippingState,
                                            customerProfile.shippingZip
                                        ].filter(Boolean).join(', ') || 'None listed'
                                    ) : (
                                        'No verified profile'
                                    )}
                                </p>
                            </div>
                            <div className="space-y-1 pt-2 border-t border-border-subtle/50">
                                <span className="text-text-muted font-bold block uppercase tracking-wider text-[9px]">Current Billing Address</span>
                                <p className="text-text-primary font-medium">
                                    {customerProfile ? (
                                        [
                                            customerProfile.billingAddress,
                                            customerProfile.billingCity,
                                            customerProfile.billingState,
                                            customerProfile.billingZip
                                        ].filter(Boolean).join(', ') || 'Same as shipping'
                                    ) : (
                                        'No verified profile'
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-[10px] uppercase font-medium text-status-success flex items-center gap-2 tracking-wide">
                            <Link size={12} className="text-status-success"/> Auto-Stitched Address Registry
                        </h4>
                        <div className="p-4 glass-panel rounded-xl space-y-3 shadow-inner text-xs min-h-[114px] max-h-[170px] overflow-y-auto custom-scrollbar">
                            {customerProfile && (
                                ((customerProfile.pastShippingAddresses && customerProfile.pastShippingAddresses.length > 0) ||
                                (customerProfile.pastBillingAddresses && customerProfile.pastBillingAddresses.length > 0))
                            ) ? (
                                <div className="space-y-3">
                                    {customerProfile.pastShippingAddresses && customerProfile.pastShippingAddresses.length > 0 && (
                                        <div>
                                            <span className="text-text-muted font-bold block uppercase tracking-wider text-[9px] mb-1">Stitched Shipping Locations</span>
                                            <ul className="space-y-1 list-disc pl-4 text-text-secondary">
                                                {customerProfile.pastShippingAddresses.map((addr: string, i: number) => (
                                                    <li key={i} className="truncate" title={isRevealed ? addr : maskPII(addr, 'text')}>
                                                        {isRevealed ? addr : maskPII(addr, 'text')}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {customerProfile.pastBillingAddresses && customerProfile.pastBillingAddresses.length > 0 && (
                                        <div className="pt-2 border-t border-border-subtle/30">
                                            <span className="text-text-muted font-bold block uppercase tracking-wider text-[9px] mb-1">Stitched Billing Locations</span>
                                            <ul className="space-y-1 list-disc pl-4 text-text-secondary">
                                                {customerProfile.pastBillingAddresses.map((addr: string, i: number) => (
                                                    <li key={i} className="truncate" title={isRevealed ? addr : maskPII(addr, 'text')}>
                                                        {isRevealed ? addr : maskPII(addr, 'text')}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <span className="text-xs text-text-muted italic flex items-center gap-2 opacity-60 h-full py-2">
                                    <CheckCircle2 className="text-status-success shrink-0" size={16}/> Address registry clean. No duplicate modifications needed.
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* CUSTOMER NOTES & ACTIVITY */}
                <div className="space-y-3">
                    <h4 className="text-[10px] uppercase font-medium text-text-primary flex items-center gap-2 tracking-wide">
                        <FileText size={12} className="text-accent-primary"/> CRM Activity Log
                    </h4>
                    <div className="glass-panel rounded-xl overflow-hidden shadow-inner flex flex-col h-[280px]">
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                            {customerNotes.length === 0 ? (
                                <div className="text-center py-8 text-text-muted italic text-xs">
                                    No notes or activity logged for this customer.
                                </div>
                            ) : (
                                customerNotes.map(note => (
                                    <div key={note.id} className="bg-surface-alt/50 border border-border-subtle rounded-lg p-3">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-accent-primary/20 flex items-center justify-center text-[10px] font-bold text-accent-primary border border-accent-primary/30">
                                                    {note.agentName?.charAt(0) || '?'}
                                                </div>
                                                <span className="text-xs font-bold text-text-secondary">{note.agentName}</span>
                                            </div>
                                            <span className="text-[10px] text-text-muted font-mono">{new Date(note.timestamp).toLocaleString()}</span>
                                        </div>
                                        <p className="text-xs text-text-primary leading-relaxed whitespace-pre-wrap pl-7">{note.content}</p>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        {/* UNIFIED COMMS CENTER */}
                        <div className="bg-surface-alt border-t border-border-subtle p-3 flex flex-col gap-2 relative transition-all">
                            <div className="flex gap-2 mb-1">
                                <button onClick={() => setCommsMode('note')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] uppercase font-semibold tracking-wide transition-colors ${commsMode === 'note' ? 'bg-surface-main border border-border-subtle text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}>
                                    <FileText size={14} /> Note
                                </button>
                                <button onClick={() => setCommsMode('call')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] uppercase font-semibold tracking-wide transition-colors ${commsMode === 'call' ? 'bg-indigo-500/20 border border-indigo-500/50 text-indigo-400 shadow-sm' : 'text-text-muted hover:text-text-primary'}`}>
                                    <Phone size={14} /> Call
                                </button>
                                <button onClick={() => setCommsMode('sms')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] uppercase font-semibold tracking-wide transition-colors ${commsMode === 'sms' ? 'bg-accent-primary/20 border border-accent-primary/50 text-accent-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}>
                                    <MessageSquare size={14} /> SMS
                                </button>
                                <button onClick={() => setCommsMode('email')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] uppercase font-semibold tracking-wide transition-colors ${commsMode === 'email' ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 shadow-sm' : 'text-text-muted hover:text-text-primary'}`}>
                                    <Mail size={14} /> Email
                                </button>
                            </div>

                            {commsMode === 'call' ? (
                                <div className="flex items-center justify-between bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 animate-pulse">
                                            <Phone size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium tracking-wide text-indigo-300">Call In Progress</p>
                                            <p className="text-[10px] text-text-muted mt-0.5">{isRevealed ? phone : maskPII(phone, 'phone')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xl font-mono text-indigo-400 tracking-wide bg-surface-main px-3 py-1.5 rounded shadow-inner">
                                            {Math.floor(callDuration / 60).toString().padStart(2, '0')}:{(callDuration % 60).toString().padStart(2, '0')}
                                        </span>
                                        <Button variant="danger" className="text-xs font-medium tracking-wide" onClick={handleSendComms}>
                                            <PhoneOff size={14} className="mr-1" /> End Call
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <textarea
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendComms())}
                                        placeholder={
                                            commsMode === 'sms' ? "Type SMS message..." :
                                            commsMode === 'email' ? "Type email body..." :
                                            "Add a secure internal note..."
                                        }
                                        className={`flex-1 bg-surface-main border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary focus:border-accent-primary outline-none transition-all resize-none shadow-inner ${
                                            commsMode !== 'note' ? 'min-h-[80px]' : 'h-10'
                                        }`}
                                    />
                                    <Button 
                                        variant="primary" 
                                        className="px-4 text-xs font-bold tracking-wider" 
                                        onClick={handleSendComms}
                                        disabled={!newNote.trim()}
                                    >
                                        {commsMode === 'sms' ? 'Send SMS' : commsMode === 'email' ? 'Send Email' : 'Log Note'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* TRANSACTION HISTORY */}
                <div className="space-y-3 flex-1 flex flex-col min-h-0">
                    <h4 className="text-[10px] uppercase font-medium text-text-primary flex items-center gap-2 tracking-wide">
                        <Calendar size={12} className="text-accent-primary"/> Transaction Ledger
                    </h4>
                    <div className="border border-border-subtle rounded-xl overflow-hidden shadow-sm flex-1 bg-surface-main">
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left bg-surface-main relative">
                                <thead className="bg-surface-alt/90  text-[10px] uppercase font-bold text-text-muted tracking-wide border-b border-border-subtle sticky top-0 z-10">
                                    <tr>
                                        <th className="p-3 pl-4 w-8"></th>
                                        <th className="p-3">Order Details</th>
                                        <th className="p-3">Attribution</th>
                                        <th className="p-3 text-right">Value</th>
                                        <th className="p-3 text-right">Status</th>
                                        {role === 'agent' && onLoadToWorkspace && <th className="p-3 text-right pr-4">Action</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-subtle text-xs">
                                    {customerHistory.length === 0 ? (
                                        <tr><td colSpan={6} className="p-5 text-center text-text-muted italic">No transaction history found for this profile.</td></tr>
                                    ) : customerHistory.map(sale => {
                                        const matchType = getMatchReason(sale);
                                        const isExpanded = expandedRows.has(sale.id);
                                        return (
                                            <React.Fragment key={sale.id}>
                                                <tr 
                                                    className="hover:bg-surface-highlight/30 transition-colors group cursor-pointer"
                                                    onClick={() => toggleRow(sale.id)}
                                                >
                                                    <td className="p-3 pl-4 text-text-muted">
                                                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} className="group-hover:text-accent-primary transition-colors"/>}
                                                    </td>
                                                    <td className="p-3 align-middle">
                                                        <div className="flex flex-col">
                                                            <div className="font-bold text-text-primary flex items-center gap-2">
                                                                {sale.product}
                                                                <span className="text-[10px] text-text-muted font-normal bg-surface-alt px-1.5 rounded">x{sale.quantity}</span>
                                                            </div>
                                                            <div className="text-[10px] font-mono text-text-muted mt-0.5 flex items-center gap-1.5 tracking-tight">
                                                                <span>{new Date(sale.timestamp).toLocaleDateString()}</span>
                                                                {sale.orderId && <span className="opacity-70">| #{sale.orderId}</span>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 align-middle">
                                                        <div className="flex flex-col gap-0.5">
                                                            <div className="flex items-center gap-1.5 text-xs font-bold text-text-secondary">
                                                                <UserIcon size={12} className="text-text-muted"/> {sale.agent || 'Unknown'}
                                                            </div>
                                                            <div className="flex items-center gap-1 text-[10px] font-bold text-text-muted">
                                                                <Link size={10} className={matchType === 'Email' ? 'text-accent-secondary' : matchType === 'Phone' ? 'text-status-success' : 'text-text-muted'}/>
                                                                Matched: {matchType}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-right font-mono font-bold text-text-primary align-middle text-sm tracking-tight">${Number(sale.amount).toFixed(2)}</td>
                                                    <td className="p-3 text-right align-middle"><Badge status={sale.status} className="scale-90 origin-right inline-flex">{sale.status}</Badge></td>
                                                    {role === 'agent' && onLoadToWorkspace && (
                                                        <td className="p-3 text-right pr-4 align-middle">
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onLoadToWorkspace(sale);
                                                                    onClose();
                                                                }}
                                                                className="p-1.5 bg-accent-primary/10 hover:bg-accent-primary text-accent-primary hover:text-white rounded-lg transition-all"
                                                                title="Load Record"
                                                            >
                                                                <ArrowUpRight size={16} />
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                                {isExpanded && (
                                                    <tr className="bg-surface-alt/20">
                                                        <td colSpan={6} className="p-4 pl-12">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface-main p-4 rounded-xl border border-border-subtle shadow-inner">
                                                                <div className="space-y-3">
                                                                    <div className="text-[10px] uppercase font-bold text-text-muted tracking-wide flex items-center gap-1.5">
                                                                        <FileText size={12}/> Order Summary
                                                                    </div>
                                                                    <div className="text-xs text-text-secondary leading-relaxed p-3 bg-surface-alt rounded-lg border border-border-subtle/50">
                                                                        {sale.callSummary || <span className="italic opacity-50">No summary notes provided for this transaction.</span>}
                                                                        {(sale.status === 'Declined' || sale.status === 'Cancelled') && sale.declineReason && (
                                                                            <div className="mt-3 pt-3 border-t border-border-subtle">
                                                                                <div className="text-[10px] uppercase font-bold text-status-error mb-1 tracking-wide">Reason</div>
                                                                                <div className="text-status-error font-medium">{sale.declineReason}</div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-3">
                                                                     <div className="text-[10px] uppercase font-bold text-text-muted tracking-wide flex items-center gap-1.5">
                                                                        <Ticket size={12}/> Logistic & Financial Details
                                                                    </div>
                                                                    <div className="text-xs grid grid-cols-2 gap-y-2 gap-x-4">
                                                                        <div className="text-text-muted">Account Number</div>
                                                                        <div className="font-mono text-text-primary text-right">{isRevealed ? (sale.cardNumber || 'N/A') : maskPII(sale.cardNumber || 'N/A')}</div>

                                                                        <div className="text-text-muted">Valid Thru</div>
                                                                        <div className="font-mono text-text-primary text-right">{isRevealed ? (sale.cardExpiry || 'N/A') : maskPII(sale.cardExpiry || 'N/A')}</div>

                                                                        <div className="text-text-muted">Sec Code</div>
                                                                        <div className="font-mono text-text-primary text-right">{isRevealed ? (sale.cardCvv || 'N/A') : '•••'}</div>

                                                                        <div className="text-text-muted">Billing Address</div>
                                                                        <div className="text-text-primary text-right truncate" title={isRevealed ? sale.billingAddress : maskPII(sale.billingAddress || '')}>{isRevealed ? (sale.billingAddress || 'Same as primary') : maskPII(sale.billingAddress || 'Same as primary')}</div>
                                                                        
                                                                        <div className="text-text-muted">Tracking ID</div>
                                                                        <div className="font-mono text-text-primary text-right">{sale.trackingId || 'Pending Fulfillment'}</div>
                                                                        
                                                                        <div className="text-text-muted">Probability Status</div>
                                                                        <div className="text-text-primary text-right">{sale.probability ? `${sale.probability}%` : 'Firm'}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div className="pt-2">
                    <Button variant="ghost" onClick={onClose} className="w-full h-10 tracking-wide font-bold text-xs hover:bg-surface-alt border border-transparent hover:border-border-subtle">
                        Dismiss Profile
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

