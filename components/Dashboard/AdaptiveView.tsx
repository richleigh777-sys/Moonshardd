import React, { useState, useMemo } from 'react';
import { useCRM } from '../../hooks/useCRM';
import { useTodayStats } from '../../hooks/useTodayStats';
import { useAuth } from '../../hooks/useAuth';
import { 
    Activity, CircleDashed, Users, CheckCircle2, Search, ArrowUpRight, 
    TrendingUp, Award, Calendar, DollarSign, Info, ShieldAlert, 
    HelpCircle, Network, Clock, Sparkles, Filter, Phone, CheckSquare, Zap
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
        
        return customers.filter(c => {
            const matchesQuery = 
                (c.name || '').toLowerCase().includes(query) ||
                (c.phone || '').includes(query) ||
                (c.email || '').toLowerCase().includes(query);

            if (!matchesQuery) return false;

            // Restrict background ViciDial leads from agent view
            if (c.isBackgroundViciLead) {
                const hasSale = sales?.some(s => s.customerPhone === c.phone && s.agentId === currentUser?.id);
                const hasNote = notes?.some(n => n.customerPhone === c.phone && n.agentId === currentUser?.id);
                return hasSale || hasNote;
            }

            return true;
        }).slice(0, 5);
    }, [customers, sales, notes, currentUser, searchTerm]);

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
        <div className="min-h-full bg-surface-alt font-sans text-text-primary p-4 md:p-5 space-y-8 select-none">
            
            {/* Top Operational Status Gateway Panel */}
            <div className="bg-surface-main border border-border-subtle rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-lg font-black tracking-tight flex flex-wrap items-center gap-2 text-text-primary">
                        Welcome, {currentUser?.name || 'Agent'} 
                        <span className="text-sm bg-accent-primary/10 text-accent-primary border border-accent-primary/20 px-3 py-1 rounded-full font-extrabold tracking-wider uppercase">
                            Level {currentUser?.level || 1} CRM View
                        </span>
                    </h1>
                    <p className="text-sm md:text-sm text-text-secondary mt-1 font-medium">
                        Central Command Console Active. All customer communications and lead dispatches are synced to the active server gateway.
                    </p>
                </div>
                
                {/* Health Monitoring Telemetry Lights */}
                <div className="flex flex-wrap items-center gap-4 text-sm font-mono font-bold bg-surface-alt p-3 rounded-xl border border-border-strong shadow-inner">
                    <div className="flex items-center gap-1.5 text-status-success">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_var(--color-status-success)] animate-pulse"></span>
                        DB LINKED
                    </div>
                    <div className="text-border-strong text-opacity-40">|</div>
                    <div className="flex items-center gap-1.5 text-status-success">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_var(--color-status-success)] animate-pulse"></span>
                        REAL-TIME SYNC
                    </div>
                    <div className="text-border-strong text-opacity-40">|</div>
                    <div className="flex items-center gap-1.5 text-accent-primary">
                        <span className="h-2 w-2 rounded-full bg-accent-primary shadow-[0_0_8px_var(--color-accent-primary)] animate-pulse"></span>
                        VOIP READY
                    </div>
                </div>
            </div>

            {/* Non-Technical Direct Onboarding Shortcut for the ViciDial Auto Dialer */}
            <div className="bg-gradient-to-r from-accent-primary/10 via-accent-secondary/5 to-transparent border border-accent-primary/30 rounded-xl p-4 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative overflow-hidden transition-all hover:border-accent-primary/50">
                <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-accent-primary/20 text-accent-primary text-sm font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider border border-accent-primary/30">Auto Call System</span>
                        <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-sm font-black uppercase px-2.5 py-0.5 rounded-full tracking-tight border border-emerald-500/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            DIALER TUNNEL ACTIVE
                        </div>
                    </div>
                    <h3 className="text-base font-black text-text-primary tracking-tight">Need to launch ViciDial auto-comms now?</h3>
                    <p className="text-sm text-text-secondary leading-relaxed max-w-4xl font-medium">
                        Setup is automated. Navigate to the <span className="text-accent-primary font-bold underline cursor-pointer hover:text-accent-secondary transition-colors" onClick={() => window.dispatchEvent(new Event('OPEN_DIALER'))}>ViciDial Auto Dialer</span> screen to lock in your Agent credentials and sync real-time phone calls directly inside your workspace browser without running any manual configuration scripts.
                    </p>
                </div>
                <button 
                    onClick={() => {
                        sfx.playConfirm();
                        window.dispatchEvent(new Event('OPEN_DIALER'));
                    }}
                    className="w-full lg:w-auto px-4 py-3.5 bg-gradient-to-r from-accent-primary to-accent-secondary hover:from-accent-primary/95 hover:to-accent-secondary/95 text-white text-sm font-black rounded-xl shadow-lg shadow-accent-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap border border-accent-primary/30"
                >
                    <Phone size={14} className="animate-pulse" />
                    <span>Launch Dialer Console</span>
                </button>
            </div>

            {/* Main Stats Panel with Commissions Estimator */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6">
                
                {/* Metric 1 */}
                <div className="bg-surface-main border border-border-subtle rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                        <CheckCircle2 size={80} strokeWidth={1} />
                    </div>
                    <div className="relative z-10 space-y-4">
                        <div className="flex justify-between items-start">
                            <span className="text-sm font-[800] text-text-muted uppercase tracking-[0.2em] leading-none">Approved Operations</span>
                            <span className="p-2.5 rounded-xl bg-accent-primary/10 text-accent-primary border border-accent-primary/20 shadow-sm transition-transform group-hover:rotate-12 group-hover:scale-110">
                                <CheckCircle2 size={16} />
                            </span>
                        </div>
                        <p className="text-3xl font-[800] text-text-primary font-mono tracking-tighter leading-none">
                            {mySales.filter(s => s.status === 'Approved').length} <span className="text-sm text-text-muted font-[600] font-sans ml-1">/ {mySales.length} total</span>
                        </p>
                    </div>
                    <div className="text-sm text-text-secondary font-[700] mt-6 pt-4 border-t border-border-subtle/50 flex justify-between relative z-10 transition-colors group-hover:border-accent-primary/30">
                        <span className="text-text-muted uppercase tracking-widest text-sm">Verified Deck</span>
                        <span className="text-accent-primary font-mono bg-accent-primary/10 px-2 py-0.5 rounded shadow-inner">{mySales.length} Entries</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-primary/20 via-accent-primary/80 to-accent-primary/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
                </div>

                {/* Metric 2 */}
                <div className="bg-surface-main border border-border-subtle rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                        <DollarSign size={80} strokeWidth={1} />
                    </div>
                    <div className="relative z-10 space-y-4">
                        <div className="flex justify-between items-start">
                            <span className="text-sm font-[800] text-emerald-500/80 uppercase tracking-[0.2em] leading-none">Net Realized Value</span>
                            <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm transition-transform group-hover:-rotate-12 group-hover:scale-110">
                                <DollarSign size={16} />
                            </span>
                        </div>
                        <p className="text-3xl font-[800] text-emerald-400 font-mono tracking-tighter leading-none">
                            ${totalCommissionsEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="text-sm text-text-secondary font-[700] mt-6 pt-4 border-t border-border-subtle/50 flex justify-between relative z-10 transition-colors group-hover:border-emerald-500/30">
                        <span className="text-text-muted uppercase tracking-widest text-sm">Calculated Commission</span>
                        <span className="text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded shadow-inner">{baseRate}% Return</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/20 via-emerald-400/80 to-emerald-500/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
                </div>

                {/* Metric 3 */}
                <div className="bg-surface-main border border-border-subtle rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                        <TrendingUp size={80} strokeWidth={1} />
                    </div>
                    <div className="relative z-10 space-y-4">
                        <div className="flex justify-between items-start">
                            <span className="text-sm font-[800] text-accent-secondary/80 uppercase tracking-[0.2em] leading-none">Pipeline Projection</span>
                            <span className="p-2.5 rounded-xl bg-accent-secondary/10 text-accent-secondary border border-accent-secondary/20 shadow-sm transition-transform group-hover:rotate-12 group-hover:scale-110">
                                <TrendingUp size={16} />
                            </span>
                        </div>
                        <p className="text-3xl font-[800] text-accent-secondary font-mono tracking-tighter leading-none drop-shadow-[0_0_10px_rgba(var(--color-accent-secondary),0.3)]">
                            ${estimatedPendingCommissions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="text-sm text-text-secondary font-[700] mt-6 pt-4 border-t border-border-subtle/50 flex justify-between relative z-10 transition-colors group-hover:border-accent-secondary/30">
                        <span className="text-text-muted uppercase tracking-widest text-sm">Unsettled Balance</span>
                        <span className="text-accent-secondary font-mono bg-accent-secondary/10 px-2 py-0.5 rounded shadow-inner">{mySales.filter(s => s.status === 'Pending').length} Pending</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-secondary/20 via-accent-secondary/80 to-accent-secondary/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
                </div>

                {/* Metric 4 */}
                <div className="bg-surface-main border border-border-subtle rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                        <Clock size={80} strokeWidth={1} />
                    </div>
                    <div className="relative z-10 space-y-4">
                        <div className="flex justify-between items-start">
                            <span className="text-sm font-[800] text-amber-500/80 uppercase tracking-[0.2em] leading-none">Critical Contingencies</span>
                            <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm transition-transform group-hover:-rotate-12 group-hover:scale-110">
                                <Clock size={16} className="animate-spin-slow" />
                            </span>
                        </div>
                        <p className="text-3xl font-[800] text-amber-500 font-mono tracking-tighter leading-none">
                            {notes.filter(n => n.agentId === currentUser?.id && n.reason?.includes('Callback')).length}
                        </p>
                    </div>
                    <div className="text-sm text-text-secondary font-[700] mt-6 pt-4 border-t border-border-subtle/50 flex justify-between relative z-10 transition-colors group-hover:border-amber-500/30">
                        <span className="text-text-muted uppercase tracking-widest text-sm">Urgent Alarms</span>
                        <span className="text-amber-500 font-mono bg-amber-500/10 px-2 py-0.5 rounded shadow-inner animate-pulse">{pendingCallbacks.length} Priority</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/20 via-amber-400/80 to-amber-500/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
                </div>

            </div>

            {/* Dashboard Workspace Segment */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-6">
                
                {/* LEFT BLOCK: Customer Search & Interactive History Lookup */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* Customer Lookup and History Finder Card */}
                    <div className="bg-surface-main border border-border-subtle rounded-[24px] p-6 shadow-sm space-y-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-[800] text-text-primary tracking-tight">Global Directory Hub</h3>
                                <p className="text-[13px] text-text-secondary mt-1 font-[500]">Lookup full profile records and historic acquisitions.</p>
                            </div>
                            
                            {/* Fast Search input */}
                            <div className="relative group w-full sm:w-80">
                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-primary opacity-50 group-focus-within:opacity-100 transition-all" />
                                <input 
                                    type="text" 
                                    className="w-full bg-surface-alt border border-border-strong rounded-[16px] py-3.5 pl-12 pr-4 text-sm font-[800] outline-none focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10 transition-all text-text-primary placeholder:text-text-muted/65 shadow-inner"
                                    placeholder="Search customer matrix..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent-primary animate-pulse"></div>
                                )}
                            </div>
                        </div>

                        {/* Search Results / Customer Previews */}
                        {searchTerm.trim() !== '' && (
                            <div className="bg-surface-alt/50 border border-accent-primary/20 rounded-[16px] p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <span className="text-sm font-[800] text-text-primary uppercase tracking-[0.2em] pl-1">Matching Directory Profiles</span>
                                {filteredSearchCustomers.length === 0 ? (
                                    <div className="p-6 text-center text-sm text-text-secondary font-[600]">No registered profiles match the query parameters.</div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1 relative z-20">
                                        {filteredSearchCustomers.map(cust => (
                                            <div 
                                                key={cust.id}
                                                onClick={() => handleOpenProfile(cust.phone)}
                                                className="bg-surface-main hover:bg-surface-highlight border border-border-subtle rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all hover:-translate-y-1 shadow-sm hover:shadow-md group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-accent-primary/10 text-accent-primary flex items-center justify-center font-[800] text-sm shadow-inner group-hover:bg-accent-primary group-hover:text-white transition-colors">
                                                        {cust.name?.charAt(0) || 'C'}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-[800] text-text-primary group-hover:text-accent-primary transition-colors">{cust.name}</h4>
                                                        <p className="text-sm text-text-secondary font-mono mt-0.5">{cust.phone}</p>
                                                    </div>
                                                </div>
                                                <div className="flex bg-surface-alt p-2 rounded-lg group-hover:bg-accent-primary/10 transition-colors border border-border-subtle">
                                                    <ArrowUpRight size={16} className="text-text-muted group-hover:text-accent-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Automatic Commission Accrual table for Personal Agents */}
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                                <h4 className="text-sm font-[800] text-text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                                    <TrendingUp size={16} className="text-status-success" /> Live Personal Ledger
                                </h4>
                                <span className="text-sm font-[800] text-accent-primary bg-accent-primary/10 px-3 py-1 rounded-[8px] uppercase tracking-wider">Computed Standard Rate</span>
                            </div>

                            {mySales.length === 0 ? (
                                <div className="p-8 text-center text-sm text-text-secondary font-[600] bg-surface-alt/30 border border-dashed border-border-strong rounded-2xl mt-1">
                                    No logged sales yet under your profile credentials. Procure assets to begin logging.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-3 mt-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                                    {mySales.map(sale => {
                                        const commAmount = sale.amount * (baseRate / 100);
                                        return (
                                            <div 
                                                key={sale.id}
                                                onClick={() => handleOpenProfile(sale.phone)}
                                                className="bg-surface-alt hover:bg-surface-highlight border border-border-subtle rounded-[16px] p-4 flex items-center justify-between transition-all cursor-pointer group hover:shadow-sm"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <div className={`w-3.5 h-3.5 rounded-full ${sale.status === 'Approved' ? 'bg-status-success' : sale.status === 'Declined' ? 'bg-status-error' : 'bg-amber-500'} shadow-sm`} />
                                                        <div className={`absolute inset-0 rounded-full animate-ping opacity-25 ${sale.status === 'Approved' ? 'bg-status-success' : sale.status === 'Declined' ? 'bg-status-error' : 'bg-amber-500'}`} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-sm font-[800] text-text-primary group-hover:text-accent-primary transition-colors">{sale.customer}</span>
                                                            <span className="text-sm px-2 py-0.5 rounded-md bg-surface-main text-text-secondary border border-border-strong font-mono font-[800] uppercase tracking-wider shadow-inner">
                                                                {sale.product}
                                                            </span>
                                                        </div>
                                                        <span className="text-sm text-text-secondary font-[600] flex items-center gap-1.5 mt-1">
                                                            Contract Vol: <span className="text-text-primary font-mono font-[800] drop-shadow-sm">${sale.amount.toLocaleString()}</span>
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="text-right flex flex-col items-end gap-1">
                                                    <p className="text-[13px] font-mono font-[900] text-status-success bg-status-success/10 px-3 py-1 rounded-lg border border-status-success/20 shadow-inner">+${commAmount.toFixed(2)}</p>
                                                    <p className={`text-sm font-[800] uppercase tracking-[0.2em] ${sale.status === 'Approved' ? 'text-emerald-400' : sale.status === 'Declined' ? 'text-status-error' : 'text-amber-500'}`}>
                                                        {sale.status}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Timeline Log */}
                    <div className="bg-surface-main border border-border-subtle rounded-[24px] p-6 shadow-sm space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                            <Activity size={120} strokeWidth={1} />
                        </div>
                        <h3 className="text-sm font-[800] text-text-primary uppercase tracking-[0.2em] flex items-center gap-2 border-b border-border-subtle pb-3 relative z-10">
                            <Activity size={16} className="text-accent-primary" />
                            Synchronized Activity Stream
                        </h3>
                        
                        {activities.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-16 bg-surface-alt/30 rounded-2xl border border-dashed border-border-subtle relative z-10">
                                <CircleDashed className="text-text-muted animate-spin mb-4" size={40} />
                                <p className="text-text-secondary font-[600] text-sm">Waiting for operational sequence updates...</p>
                            </div>
                        ) : (
                            <div className="space-y-4 relative z-10 before:absolute before:inset-0 before:ml-[1.15rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border-subtle before:to-transparent">
                                {activities.map((act, i) => (
                                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mt-2">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border-subtle bg-surface-main shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_10px_rgba(0,0,0,0.2)] relative z-10 group-hover:scale-110 transition-transform duration-300">
                                            <act.icon size={16} className={act.color} />
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-surface-alt hover:bg-surface-highlight border border-border-subtle p-4 rounded-[16px] shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-[800] text-[13px] text-text-primary">{act.title}</span>
                                                <span className="text-sm font-mono text-text-muted font-[800] bg-surface-main px-2 py-0.5 rounded border border-border-solid">{new Date(act.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>
                                            <span className="text-[12px] text-text-secondary mt-1 block font-[500] leading-relaxed">{act.detail}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                {/* RIGHT BLOCK: Dynamic Callback Alerts & System Gateway Decision Tree Rule Check */}
                <div className="lg:col-span-4 space-y-8">
                    
                    {/* Alarms and Callbacks */}
                    <div className="bg-surface-main border border-border-subtle rounded-[24px] p-6 shadow-sm space-y-5">
                        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                            <h3 className="text-sm font-[800] uppercase text-text-primary tracking-[0.2em] flex items-center gap-2">
                                <Clock size={16} className="text-amber-500 animate-spin-slow" /> Callback Alarms
                            </h3>
                            <span className="text-sm font-[800] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full tracking-widest shadow-inner">AUTO-PRIORITY</span>
                        </div>

                        {pendingCallbacks.length === 0 ? (
                            <div className="p-8 bg-surface-alt/45 border border-dashed border-border-strong rounded-2xl text-center shadow-inner">
                                <p className="text-sm text-text-secondary font-[600]">No pending priority callbacks scheduled for this run.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 relative before:absolute before:inset-0 before:ml-[1.12rem] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-amber-500/50 before:to-transparent">
                                {pendingCallbacks.map(n => (
                                    <div 
                                        key={n.id} 
                                        onClick={() => handleOpenProfile(n.phone)}
                                        className="bg-surface-alt border border-border-subtle rounded-[16px] p-4 hover:border-amber-400 cursor-pointer transition-all hover:bg-surface-highlight shadow-sm hover:-translate-y-1 hover:shadow-md relative pl-12 group"
                                    >
                                        <div className="absolute left-[-1.5px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-surface-main border border-amber-500/40 shadow-[0_0_10px_rgba(var(--color-amber-500),0.2)] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                            <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping"></div>
                                        </div>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-sm font-[800] text-text-primary tracking-tight">{n.customerName || 'Customer'}</span>
                                            <span className="text-sm font-mono bg-amber-500/10 text-amber-500 border border-amber-500/20 font-[800] px-2 py-0.5 rounded shadow-inner tracking-widest">URGENT</span>
                                        </div>
                                        <p className="text-[12px] text-text-secondary italic font-[500] leading-relaxed">"{n.content?.substring(0, 60)}..."</p>
                                        <div className="mt-4 flex items-center justify-between text-sm text-text-primary font-mono bg-surface-main p-2.5 rounded-lg border border-border-subtle shadow-sm group-hover:border-amber-500/30 transition-colors">
                                            <span className="font-[800] text-text-muted group-hover:text-amber-500 transition-colors">DIAL: {n.phone}</span>
                                            <span className="text-accent-primary font-[800] flex items-center gap-1 group-hover:translate-x-1 transition-transform">Dial Card <ArrowUpRight size={12} /></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
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
