import React, { useState, useMemo } from 'react';
import { useCRM } from '../../hooks/useCRM';
import { useTodayStats } from '../../hooks/useTodayStats';
import { useAuth } from '../../hooks/useAuth';
import { 
    Activity, CircleDashed, Users, CheckCircle2, Search, ArrowUpRight, 
    TrendingUp, Award, Calendar, DollarSign, Info, ShieldAlert, 
    HelpCircle, Network, Clock, Sparkles, Filter, Phone, CheckSquare
} from 'lucide-react';
import { CustomerProfileModal } from '../modals/CustomerProfileModal';
import { sfx } from '../../lib/soundService';

export const AdaptiveView: React.FC = () => {
    const stats = useTodayStats();
    const { sales, notes, customers, systemConfig } = useCRM();
    const { currentUser } = useAuth();

    // CRM Configuration
    const baseRate = systemConfig?.baseCommission || 15;

    // Search & History lookup state
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Filtered customer profiles
    const filteredSearchCustomers = useMemo(() => {
        if (!searchTerm.trim()) return [];
        const query = searchTerm.toLowerCase();
        // Since customers might not have phones populated cleanly, normalize
        return customers.filter(c => 
            (c.name || '').toLowerCase().includes(query) ||
            (c.phone || '').includes(query) ||
            (c.email || '').toLowerCase().includes(query)
        ).slice(0, 5);
    }, [customers, searchTerm]);

    // Gather Agent Specific Sales
    const mySales = useMemo(() => {
        return sales.filter(s => s.agentId === currentUser?.id);
    }, [sales, currentUser]);

    // Active Pending Callbacks for quick priority highlights
    const pendingCallbacks = useMemo(() => {
        return notes
            .filter(n => n.agentId === currentUser?.id && n.reason?.includes('Callback') && n.priority === 'High')
            .slice(0, 3);
    }, [notes, currentUser]);

    // Automatic real-time commission metrics
    const totalCommissionsEarned = useMemo(() => {
        return mySales
            .filter(s => s.status === 'Approved')
            .reduce((sum, s) => sum + (s.amount * (baseRate / 100)), 0);
    }, [mySales, baseRate]);

    const estimatedPendingCommissions = useMemo(() => {
        return mySales
            .filter(s => s.status === 'Pending')
            .reduce((sum, s) => sum + (s.amount * (baseRate / 100)), 0);
    }, [mySales, baseRate]);

    // Create a feeds list combining agent stats and activities
    const activities = useMemo(() => {
        const list = [
            ...mySales.map(s => ({ 
                type: 'sale', 
                title: `Submitted Order for ${s.customer}`, 
                status: s.status,
                detail: `${s.product} - $${s.amount.toLocaleString()} (Est. Payout: $${(s.amount * (baseRate / 100)).toFixed(2)})`,
                time: s.timestamp, 
                icon: CheckCircle2, 
                color: s.status === 'Approved' ? 'text-status-success' : s.status === 'Declined' ? 'text-status-error' : 'text-neutral-400' 
            })),
            ...notes.filter(n => n.agentId === currentUser?.id).map(n => ({ 
                type: 'note', 
                title: `Logged Note: ${n.reason || 'Lead Diary'}`, 
                status: 'General',
                detail: `Regarding ${n.customerName || 'Customer'}: "${n.content?.substring(0, 60)}${n.content && n.content.length > 60 ? '...' : ''}"`,
                time: n.timestamp, 
                icon: Activity, 
                color: 'text-indigo-400' 
            }))
        ];
        return list.sort((a, b) => b.time - a.time).slice(0, 8);
    }, [mySales, notes, currentUser, baseRate]);

    const handleOpenProfile = (phone: string) => {
        setSelectedPhone(phone);
        setIsProfileOpen(true);
        sfx.playClick();
    };

    return (
        <div className="min-h-full bg-surface-alt font-sans text-text-primary p-4 md:p-8 space-y-8 select-none">
            
            {/* Top Operational Status Gateway Panel */}
            <div className="bg-surface-main border border-border-subtle rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                        Welcome and Ready, {currentUser?.name || 'Agent'} <span className="text-xs bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full font-bold">Level {currentUser?.level || 1} CRM View</span>
                    </h1>
                    <p className="text-xs text-text-muted mt-1 font-semibold">
                        System Online & Synced. Your personal records are securely locked to the central database workspace. 
                    </p>
                </div>
                
                {/* Health Monitoring Telemetry Lights */}
                <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono font-bold bg-surface-alt/50 p-2.5 rounded-xl border border-border-subtle">
                    <div className="flex items-center gap-1.5 text-status-success">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        DB LINKED
                    </div>
                    <div className="text-border-strong">|</div>
                    <div className="flex items-center gap-1.5 text-status-success">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        REAL-TIME SYNC
                    </div>
                    <div className="text-border-strong">|</div>
                    <div className="flex items-center gap-1.5 text-indigo-400">
                        <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        VOIP READY
                    </div>
                </div>
            </div>

            {/* Main Stats Panel with Commissions Estimator */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* Metric 1 */}
                <div className="bg-surface-main rounded-2xl p-6 border border-border-subtle shadow-sm flex flex-col justify-between">
                    <div>
                        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">My Approved Sales</span>
                        <p className="text-3xl font-black text-text-primary mt-1">
                            {mySales.filter(s => s.status === 'Approved').length} / {mySales.length}
                        </p>
                    </div>
                    <div className="text-[10px] text-text-muted font-bold mt-4 pt-2 border-t border-border-subtle flex justify-between">
                        <span>Total Submitted Count:</span>
                        <span className="text-text-primary">{mySales.length} Sales</span>
                    </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-surface-main rounded-2xl p-6 border border-border-subtle shadow-sm flex flex-col justify-between">
                    <div>
                        <span className="text-[11px] font-bold text-status-success uppercase tracking-wider flex items-center gap-1">
                            <DollarSign size={12} /> Live Payout Accrued
                        </span>
                        <p className="text-3xl font-black text-status-success mt-1">
                            ${totalCommissionsEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="text-[10px] text-text-muted font-bold mt-4 pt-2 border-t border-border-subtle flex justify-between">
                        <span>Current Payout Rate:</span>
                        <span className="text-status-success">{baseRate}% Tier</span>
                    </div>
                </div>

                {/* Metric 3 */}
                <div className="bg-surface-main rounded-2xl p-6 border border-border-subtle shadow-sm flex flex-col justify-between">
                    <div>
                        <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Unapproved / Pending Comms</span>
                        <p className="text-3xl font-black text-indigo-400 mt-1">
                            ${estimatedPendingCommissions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="text-[10px] text-text-muted font-bold mt-4 pt-2 border-t border-border-subtle flex justify-between">
                        <span>Pending Orders Count:</span>
                        <span className="text-indigo-400">{mySales.filter(s => s.status === 'Pending').length} Pending</span>
                    </div>
                </div>

                {/* Metric 4 */}
                <div className="bg-surface-main rounded-2xl p-6 border border-border-subtle shadow-sm flex flex-col justify-between">
                    <div>
                        <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">Active Callback Alarms</span>
                        <p className="text-3xl font-black text-amber-500 mt-1">
                            {notes.filter(n => n.agentId === currentUser?.id && n.reason?.includes('Callback')).length}
                        </p>
                    </div>
                    <div className="text-[10px] text-text-muted font-bold mt-4 pt-2 border-t border-border-subtle flex justify-between">
                        <span>Priority Callbacks:</span>
                        <span className="text-amber-500">{pendingCallbacks.length} Outstanding</span>
                    </div>
                </div>

            </div>

            {/* Dashboard Workspace Segment */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT BLOCK: Customer Search & Interactive History Lookup */}
                <div className="lg:col-span-8 space-y-6">
                    
                    {/* Customer Lookup and History Finder Card */}
                    <div className="bg-surface-main border border-border-subtle rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-base font-black text-text-primary">Global Customer Directory & History Hub</h3>
                                <p className="text-xs text-text-muted">Lookup customer profiles and view their multi-sale transaction history instantly.</p>
                            </div>
                            
                            {/* Fast Search input */}
                            <div className="relative group w-full md:w-72">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-primary transition-colors" />
                                <input 
                                    type="text" 
                                    className="w-full bg-surface-alt border border-border-subtle rounded-xl py-2 pl-9 pr-4 text-xs font-bold outline-none focus:border-accent-primary transition-all shadow-inner"
                                    placeholder="Search customer by name or phone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Search Results / Customer Previews */}
                        {searchTerm.trim() !== '' && (
                            <div className="bg-surface-alt/75 border border-border-subtle rounded-xl p-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest pl-1">Matching Directory Profiles</span>
                                {filteredSearchCustomers.length === 0 ? (
                                    <div className="p-4 text-center text-xs text-text-muted font-bold">No registered matching customer profile found.</div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-1.5 mt-1">
                                        {filteredSearchCustomers.map(cust => (
                                            <div 
                                                key={cust.id}
                                                onClick={() => handleOpenProfile(cust.phone)}
                                                className="bg-surface-main hover:bg-surface-highlight border border-border-subtle rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all hover:-translate-y-0.5 group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-black text-xs">
                                                        {cust.name?.charAt(0) || 'C'}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-black text-text-primary group-hover:text-indigo-400 transition-colors">{cust.name}</h4>
                                                        <p className="text-[10px] text-text-muted font-mono">{cust.phone}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full">
                                                        View Sales History ({cust.salesHistory?.length || 0})
                                                    </span>
                                                    <ArrowUpRight size={14} className="text-text-muted group-hover:translate-x-0.5 transition-transform" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Automatic Commission Accrual table for Personal Agents */}
                        <div>
                            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                                <h4 className="text-xs font-black text-text-primary uppercase tracking-wide flex items-center gap-1.5">
                                    <TrendingUp size={14} className="text-status-success" /> Live Personal Ledger & Comm-Model
                                </h4>
                                <span className="text-[9px] font-bold text-text-muted uppercase">Autocomputed based on system scale</span>
                            </div>

                            {mySales.length === 0 ? (
                                <div className="p-8 text-center text-xs text-text-muted font-semibold bg-surface-alt/30 border border-dashed border-border-subtle rounded-xl mt-3">
                                    No sales registered yet under your profile. Use the "Help a Customer" form to submit your first sale.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-2 mt-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                                    {mySales.map(sale => {
                                        const commAmount = sale.amount * (baseRate / 100);
                                        return (
                                            <div 
                                                key={sale.id}
                                                onClick={() => handleOpenProfile(sale.phone)}
                                                className="bg-surface-alt/45 hover:bg-surface-highlight/70 border border-border-subtle rounded-xl p-3 flex items-center justify-between transition-all cursor-pointer group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2.5 h-2.5 rounded-full ${sale.status === 'Approved' ? 'bg-status-success' : sale.status === 'Declined' ? 'bg-status-error' : 'bg-amber-500'}`} />
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-extrabold text-text-primary group-hover:text-indigo-400 transition-colors">{sale.customer}</span>
                                                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-main text-text-muted border border-border-subtle font-mono">{sale.product}</span>
                                                        </div>
                                                        <span className="text-[10px] text-text-muted font-semibold flex items-center gap-1.5 mt-0.5">
                                                            Order Value: <span className="text-text-primary font-mono">${sale.amount.toLocaleString()}</span>
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-xs font-mono font-black text-status-success">+${commAmount.toFixed(2)}</p>
                                                    <p className="text-[9px] text-text-muted font-bold capitalize">{sale.status} Payout</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Timeline Log */}
                    <div className="bg-surface-main border border-border-subtle rounded-2xl p-6 shadow-sm space-y-4">
                        <h3 className="text-base font-black text-text-primary">Personal Rhythm Feed</h3>
                        {activities.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 bg-surface-alt/30 rounded-2xl border border-dashed border-border-subtle">
                                <CircleDashed className="text-text-muted animate-spin mb-4" size={32} />
                                <p className="text-text-muted font-medium text-xs">Awaiting operational inputs...</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {activities.map((act, i) => (
                                    <div key={i} className="flex gap-4 group">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full bg-surface-alt border border-border-subtle flex items-center justify-center shadow-sm">
                                                <act.icon size={14} className={act.color} />
                                            </div>
                                            {i !== activities.length - 1 && <div className="w-0.5 h-full bg-border-subtle/60 mt-1"></div>}
                                        </div>
                                        
                                        <div className="flex-1 bg-surface-alt/45 rounded-xl p-4 border border-border-subtle hover:-translate-y-0.5 transition-transform">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="font-extrabold text-xs text-text-primary block">{act.title}</span>
                                                    <span className="text-[11px] text-text-muted mt-1 block font-medium">{act.detail}</span>
                                                </div>
                                                <span className="text-[9px] font-mono text-text-muted whitespace-nowrap ml-4">
                                                    {new Date(act.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                {/* RIGHT BLOCK: Dynamic Callback Alerts & System Gateway Decision Tree Rule Check */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* Alarms and Callbacks */}
                    <div className="bg-surface-main border border-border-subtle rounded-2xl p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase text-amber-500 tracking-wider flex items-center gap-1.5">
                                <Clock size={14} className="animate-pulse" /> Callback Alarm Alerter
                            </h3>
                            <span className="text-[9px] font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded">AUTO-PRIORITY</span>
                        </div>

                        {pendingCallbacks.length === 0 ? (
                            <div className="p-4 bg-surface-alt/30 border border-border-subtle rounded-xl text-center">
                                <p className="text-[11px] text-text-muted font-bold">No critical callbacks registered for this session.</p>
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                {pendingCallbacks.map(n => (
                                    <div 
                                        key={n.id} 
                                        onClick={() => handleOpenProfile(n.phone)}
                                        className="bg-surface-alt border border-border-subtle rounded-xl p-3 hover:border-amber-400 cursor-pointer transition-colors"
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="text-xs font-black text-text-primary">{n.customerName || 'Customer'}</span>
                                            <span className="text-[9px] font-mono text-amber-500 font-bold">HIGH</span>
                                        </div>
                                        <p className="text-[10px] text-text-muted mt-1 italic">"{n.content?.substring(0, 50)}..."</p>
                                        <div className="mt-3 flex items-center justify-between text-[9px] text-text-muted font-mono bg-surface-main p-1.5 rounded border border-border-subtle">
                                            <span>DIAL BACK: {n.phone}</span>
                                            <span className="text-indigo-400 font-bold flex items-center gap-0.5">Click Card <ArrowUpRight size={10} /></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Highly Professional Decision Guide Diagram (How records Route) */}
                    <div className="bg-surface-main border border-border-subtle rounded-2xl p-5 shadow-sm space-y-4">
                        <h3 className="text-xs font-black uppercase text-text-primary tracking-wider flex items-center gap-1.5 border-b border-border-subtle pb-2">
                            <Network size={14} className="text-indigo-400" /> Operational Routing Logic
                        </h3>
                        
                        <p className="text-[11px] text-text-muted leading-relaxed">
                            How the Moonshardd Operating System processes submitted order profiles and routes tasks automatically:
                        </p>

                        <div className="space-y-3 pt-1">
                            
                            {/* Branch 1 */}
                            <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded bg-amber-500/10 text-amber-500 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</div>
                                <div>
                                    <h4 className="text-[11px] font-black text-text-primary flex items-center gap-1">
                                        Future Callback Timestamps ➔ <Calendar size={10} /> To Call Back Queue
                                    </h4>
                                    <p className="text-[10px] text-text-muted leading-tight mt-0.5">
                                        If notes or call events hold a scheduled time, it lists on the Callback Terminal to protect hot deals.
                                    </p>
                                </div>
                            </div>

                            {/* Branch 2 */}
                            <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</div>
                                <div>
                                    <h4 className="text-[11px] font-black text-text-primary flex items-center gap-1">
                                        Logistics In-Progress ➔ <CheckCircle2 size={10} /> Pipeline / Following Up
                                    </h4>
                                    <p className="text-[10px] text-text-muted leading-tight mt-0.5">
                                        Standard in-progress client transactions instantly go to the Following Up Board for pipeline monitoring.
                                    </p>
                                </div>
                            </div>

                            {/* Branch 3 */}
                            <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded bg-rose-500/10 text-rose-500 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</div>
                                <div>
                                    <h4 className="text-[11px] font-black text-text-primary flex items-center gap-1">
                                        Declined Transaction State ➔ <ShieldAlert size={10} /> Need Help Queue
                                    </h4>
                                    <p className="text-[10px] text-text-muted leading-tight mt-0.5">
                                        If order processing hits payment failures or is marked Declined, it routes to the Recovery Desk.
                                    </p>
                                </div>
                            </div>

                        </div>

                        {/* Summary Footer */}
                        <div className="bg-surface-alt/55 text-text-muted p-3 rounded-xl text-[10px] space-y-1.5 border border-border-subtle leading-normal">
                            <span className="font-extrabold text-indigo-400 block">⚡ SYSTEM DIRECTIVE:</span>
                            No sales actions ever drop off. Built-in logic matches customer profiles dynamically across all system queues.
                        </div>

                    </div>

                </div>

            </div>

            {/* Custom Interactive Profiles Inspector Modal Popup */}
            {selectedPhone && (
                <CustomerProfileModal 
                    isOpen={isProfileOpen}
                    onClose={() => setIsProfileOpen(false)}
                    phone={selectedPhone}
                    allSales={sales}
                    role="agent"
                />
            )}

        </div>
    );
};
