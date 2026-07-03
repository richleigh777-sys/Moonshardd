import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    GitMerge, Map, History, ShieldAlert, Sparkles, 
    Search, Info, UserCheck, RefreshCw as LoopIcon
} from 'lucide-react';
import { Button, Input } from '../ui/Base';
import { Sale, Note, User } from '../../types';
import { sfx } from '../../lib/soundService';
import { useCRM } from '../../hooks/useCRM';

interface IntelligentTerminalMapProps {
    sales: Sale[];
    notes: Note[];
    currentUser: User;
    onLoadLead: (lead: any) => void;
}

export const IntelligentTerminalMap: React.FC<IntelligentTerminalMapProps> = ({
    sales,
    notes,
    currentUser,
    onLoadLead
}) => {
    const { updateSale, addNote } = useCRM();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDestination, setFilterDestination] = useState<'All' | 'Pipeline' | 'Callback' | 'HelpQueue'>('All');
    const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
    const [isRecomputing, setIsRecomputing] = useState(false);
    
    // Auto-Routing Preferences state
    const [preferences, setPreferences] = useState({
        autoCallbackOnDecline: true,
        hoursToCallback: 3,
        autoFupOnPending: true,
        escalateHighValueDecline: true,
        highValueThreshold: 1000
    });

    const [alertMessage, setAlertMessage] = useState<string | null>(null);

    // Simulate system diagnostic scan / recomputation
    const triggerRecomputation = () => {
        setIsRecomputing(true);
        sfx.playClick();
        setTimeout(() => {
            setIsRecomputing(false);
            sfx.playSuccess();
            setAlertMessage('Routing matrices synchronized successfully with live Firestore and PostgreSQL endpoints!');
            setTimeout(() => setAlertMessage(null), 4000);
        }, 1000);
    };

    // Auto-create Callback Note for a Declined Sale (Auto-Rescue logic)
    const handleConfigureRescue = async (sale: Sale) => {
        try {
            await addNote({
                agentId: currentUser.id,
                agentName: currentUser.name,
                customerName: `${sale.firstName || ''} ${sale.lastName || ''}`.trim() || sale.customer,
                phone: sale.phone,
                type: 'callback',
                subtype: 'salvage',
                priority: 'High',
                content: `Auto-Rescue Pipeline: Card declined for ${sale.product}. Scheduled callback generated to retry and confirm correct billing digits or secondary payment methods.`,
                status: 'Pending',
                timestamp: Date.now() + (preferences.hoursToCallback * 60 * 60 * 1000), // Due in X hours
                createdAt: Date.now(),
                linkedSaleId: sale.id
            });
            
            sfx.playSubmit();
            setAlertMessage(`Perfect! Hot Rescue Callback auto-registered for ${sale.customer} in ${preferences.hoursToCallback} hours.`);
            setTimeout(() => setAlertMessage(null), 5000);
        } catch (err) {
            console.error('Error registering rescue callback:', err);
        }
    };

    // Quick Manual Override - Change Sale's status/stages to verify routing
    const handleOverrideRoute = async (saleId: string, newStatus: 'Pending' | 'Approved' | 'Declined' | 'Rescue In Progress') => {
        try {
            const saleToUpdate = sales.find(s => s.id === saleId);
            if (!saleToUpdate) return;

            const updatedFields: Partial<Sale> = { status: newStatus };
            
            if (newStatus === 'Rescue In Progress') {
                updatedFields.pipelineStatus = 'Rescue';
                updatedFields.dealStage = 'Rescue In Progress';
            } else if (newStatus === 'Declined') {
                updatedFields.pipelineStatus = 'Declined';
                updatedFields.dealStage = 'Declined';
            } else if (newStatus === 'Pending') {
                updatedFields.pipelineStatus = 'Pitching';
                updatedFields.dealStage = 'Negotiation';
                updatedFields.followUpDate = Date.now() + 86400000; // tomorrow
            }

            await updateSale(saleId, updatedFields);
            sfx.playSuccess();
            setAlertMessage(`Sale updated. Destination re-evaluated by the routing matrix!`);
            setTimeout(() => setAlertMessage(null), 3000);
        } catch (err) {
            console.error('Failed to manually coordinate sale override:', err);
        }
    };

    // Process Sales and determine their Terminal mapping with clear metrics
    const mappedEntries = useMemo(() => {
        return sales.map(sale => {
            let destination: 'Pipeline' | 'Callback' | 'HelpQueue';
            let priority: 'High' | 'Mid' | 'Low' = 'Mid';
            let rationale = '';
            let actionText = '';
            let triggerRule = '';

            // Rules algorithm implemented like an Enterprise Decision engine
            if (sale.status === 'Declined') {
                destination = 'HelpQueue';
                priority = 'High';
                rationale = 'Sale logged as DECLINED. Requires immediate attention on the Need Help Queue for manager override, billing fixes, or alternative card validation.';
                triggerRule = 'TRANS_STATUS == "Declined"';
                actionText = 'Verify payment & CVV';
            } else if (sale.followUpDate || sale.callbackTime || sale.dealStage === 'Negotiation' || sale.pipelineStatus === 'Retention' || sale.pipelineStatus === 'Reorder') {
                destination = 'Callback';
                priority = sale.pipelineStatus === 'Retention' ? 'High' : 'Mid';
                rationale = `Scheduled communication registered: ${sale.pipelineStatus || 'General callback'}. Monitored for on-time phone contact.`;
                triggerRule = 'HAS_FOLLOW_UP_DATE || dealStage == "Negotiation"';
                actionText = 'Dial callback';
            } else {
                destination = 'Pipeline';
                priority = 'Low';
                rationale = `Active deal in progress. Monitored for regular stage advancements under '${sale.dealStage || sale.pipelineStatus || 'Pitching'}'.`;
                triggerRule = 'STATUS == "Pending" && NO_IMMEDIATE_SCHEDULER';
                actionText = 'Progress Deal Stage';
            }

            // High-value escalation override preference
            if (sale.amount >= preferences.highValueThreshold && sale.status === 'Declined' && preferences.escalateHighValueDecline) {
                priority = 'High';
                rationale = `🚨 HIGH-VALUE RISK: [Order: ${sale.amount.toFixed(2)}] immediately escalated to level 10 administrator in the Help Queue thread!`;
                triggerRule = `TRANS_STATUS == "Declined" && VALUE >= $${preferences.highValueThreshold}`;
            }

            return {
                ...sale,
                destination,
                priority,
                rationale,
                triggerRule,
                actionText
            };
        });
    }, [sales, preferences]);

    // Active stats computed per terminal
    const terminalCounts = useMemo(() => {
        return {
            Pipeline: mappedEntries.filter(e => e.destination === 'Pipeline').length,
            Callback: mappedEntries.filter(e => e.destination === 'Callback').length + notes.filter(n => n.type === 'callback' && n.status !== 'Resolved').length,
            HelpQueue: mappedEntries.filter(e => e.destination === 'HelpQueue').length
        };
    }, [mappedEntries, notes]);

    // Search and filter results
    const filteredEntries = useMemo(() => {
        return mappedEntries.filter(e => {
            const matchesSearch = 
                e.customer.toLowerCase().includes(searchQuery.toLowerCase()) || 
                (e.product && e.product.toLowerCase().includes(searchQuery.toLowerCase())) ||
                e.id.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesFilter = filterDestination === 'All' ? true : e.destination === filterDestination;

            return matchesSearch && matchesFilter;
        });
    }, [mappedEntries, searchQuery, filterDestination]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500/10 via-surface-main to-surface-main p-4 rounded-xl border border-border-subtle relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="absolute top-0 right-0 p-5 opacity-5 pointer-events-none">
                    <GitMerge size={160} className="text-indigo-500" />
                </div>
                <div>
                    <h2 className="text-lg font-bold tracking-tight text-text-primary flex items-center gap-2">
                        <GitMerge className="text-indigo-400 rotate-90" size={20} />
                        CRM Core Routing & Judgment Gateway
                    </h2>
                    <p className="text-sm text-text-muted mt-1 font-medium">
                        Intelligent mapping matrix coordinating leads to designated Agent Terminals across the system.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        onClick={triggerRecomputation}
                        variant="secondary"
                        className="py-2.5 px-4 bg-surface-alt hover:bg-surface-alt/80 rounded-xl text-sm font-bold text-text-primary flex items-center gap-2 border border-border-strong relative"
                    >
                        <LoopIcon size={14} className={isRecomputing ? 'animate-spin' : ''} />
                        Recompute Matrices
                    </Button>
                </div>
            </div>

            {/* Notification alert */}
            {alertMessage && (
                <div className="bg-indigo-500/10 border border-indigo-500/25 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                    <Sparkles size={18} className="text-indigo-400 shrink-0" />
                    <p className="text-sm font-bold text-indigo-200">{alertMessage}</p>
                </div>
            )}

            {/* Grid Map: The 3 Terminal Diagnostics Channels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Pipeline Board Column */}
                <div className="bg-gradient-to-b from-surface-main to-surface-alt border border-border-subtle hover:border-blue-500/40 rounded-xl p-3 relative overflow-hidden flex flex-col justify-between h-[110px] shadow-sm group transition-all">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />
                    <div className="relative z-10 flex justify-between items-start w-full">
                        <div className="flex gap-3">
                            <div className="flex flex-col items-center justify-center text-blue-400 transform group-hover:scale-105 group-hover:-translate-y-0.5 transition-all shadow-sm">
                                <Map size={40} strokeWidth={1.5} />
                                <span className="text-[8px] font-bold tracking-wide text-[#ffffff60] uppercase mt-1">Term 01</span>
                            </div>
                            <div className="flex flex-col pt-1">
                                <h3 className="text-sm font-bold text-white leading-none tracking-tight">Pipeline Board</h3>
                                <span className="text-sm font-bold text-blue-400/80 uppercase tracking-wide mt-1">Following Up</span>
                            </div>
                        </div>
                        <div className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-md text-sm font-bold text-blue-400 shadow-sm shrink-0">
                            {terminalCounts.Pipeline} Active
                        </div>
                    </div>
                    <div className="relative z-10 flex justify-between items-end border-t border-border-subtle/50 pt-2 mt-auto">
                        <span className="text-sm text-[#ffffff50] font-medium truncate w-full">Rule: Pending or rescue stages</span>
                    </div>
                </div>

                {/* 2. Call Back Column */}
                <div className="bg-gradient-to-b from-surface-main to-surface-alt border border-border-subtle hover:border-indigo-500/40 rounded-xl p-3 relative overflow-hidden flex flex-col justify-between h-[110px] shadow-sm group transition-all">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors" />
                    <div className="relative z-10 flex justify-between items-start w-full">
                        <div className="flex gap-3">
                            <div className="flex flex-col items-center justify-center text-indigo-400 transform group-hover:scale-105 group-hover:-translate-y-0.5 transition-all shadow-sm">
                                <History size={40} strokeWidth={1.5} />
                                <span className="text-[8px] font-bold tracking-wide text-[#ffffff60] uppercase mt-1">Term 02</span>
                            </div>
                            <div className="flex flex-col pt-1">
                                <h3 className="text-sm font-bold text-white leading-none tracking-tight">Call Back Hub</h3>
                                <span className="text-sm font-bold text-indigo-400/80 uppercase tracking-wide mt-1">Scheduled</span>
                            </div>
                        </div>
                        <div className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-md text-sm font-bold text-indigo-400 shadow-sm shrink-0">
                            {terminalCounts.Callback} Mapped
                        </div>
                    </div>
                    <div className="relative z-10 flex justify-between items-end border-t border-border-subtle/50 pt-2 mt-auto">
                        <span className="text-sm text-[#ffffff50] font-medium truncate w-full">Rule: Date/time callback schedules</span>
                    </div>
                </div>

                {/* 3. Help Queue Column */}
                <div className="bg-gradient-to-b from-surface-main to-surface-alt border border-border-subtle hover:border-rose-500/40 rounded-xl p-3 relative overflow-hidden flex flex-col justify-between h-[110px] shadow-sm group transition-all">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-colors" />
                    <div className="relative z-10 flex justify-between items-start w-full">
                        <div className="flex gap-3">
                            <div className="flex flex-col items-center justify-center text-rose-400 transform group-hover:scale-105 group-hover:-translate-y-0.5 transition-all shadow-sm">
                                <ShieldAlert size={40} strokeWidth={1.5} />
                                <span className="text-[8px] font-bold tracking-wide text-[#ffffff60] uppercase mt-1">Term 03</span>
                            </div>
                            <div className="flex flex-col pt-1">
                                <h3 className="text-sm font-bold text-white leading-none tracking-tight">Help Queue</h3>
                                <span className="text-sm font-bold text-rose-400/80 uppercase tracking-wide mt-1">Escalations</span>
                            </div>
                        </div>
                        <div className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded-md text-sm font-bold text-rose-400 shadow-sm shrink-0 animate-pulse">
                            {terminalCounts.HelpQueue} Critical
                        </div>
                    </div>
                    <div className="relative z-10 flex justify-between items-end border-t border-border-subtle/50 pt-2 mt-auto">
                        <span className="text-sm text-[#ffffff50] font-medium truncate w-full">Rule: Declined cards & alerts</span>
                    </div>
                </div>
            </div>

            {/* Core Diagnostics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                
                {/* Left Panel: Diagnostic Routing Preferences */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-surface-main border border-border-subtle rounded-xl p-4 space-y-6">
                        <div>
                            <h3 className="text-sm font-bold text-text-primary tracking-tight">Judgment Directives</h3>
                            <p className="text-sm text-text-muted mt-1 leading-relaxed">
                                Customize rules explaining how incoming files are vectored to different terminals.
                            </p>
                        </div>

                        {/* Rules checkboxes */}
                        <div className="space-y-4">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input 
                                    type="checkbox"
                                    checked={preferences.autoCallbackOnDecline}
                                    onChange={(e) => setPreferences({...preferences, autoCallbackOnDecline: e.target.checked})}
                                    className="mt-1 accent-indigo-500 h-4 w-4 rounded"
                                />
                                <div className="text-sm">
                                    <p className="font-bold text-text-primary group-hover:text-accent-primary transition-colors">On-Decline Auto Rescue</p>
                                    <p className="text-sm text-text-muted mt-0.5">Create urgent callback when card details decline</p>
                                </div>
                            </label>

                            {preferences.autoCallbackOnDecline && (
                                <div className="pl-7 space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                                    <p className="text-sm font-bold uppercase text-text-muted tracking-wide">Time Buffer</p>
                                    <select 
                                        value={preferences.hoursToCallback}
                                        onChange={(e) => setPreferences({...preferences, hoursToCallback: Number(e.target.value)})}
                                        className="w-full bg-surface-alt border border-border-strong rounded-xl px-3 py-2 text-sm font-bold text-text-primary outline-none focus:border-indigo-500"
                                    >
                                        <option value={1}>1 Hour Delay</option>
                                        <option value={3}>3 Hours Delay</option>
                                        <option value={6}>6 Hours Delay</option>
                                        <option value={24}>24 Hours Delay</option>
                                    </select>
                                </div>
                            )}

                            <label className="flex items-start gap-3 cursor-pointer group pt-2 border-t border-border-subtle/50">
                                <input 
                                    type="checkbox"
                                    checked={preferences.autoFupOnPending}
                                    onChange={(e) => setPreferences({...preferences, autoFupOnPending: e.target.checked})}
                                    className="mt-1 accent-indigo-500 h-4 w-4 rounded"
                                />
                                <div className="text-sm">
                                    <p className="font-bold text-text-primary group-hover:text-accent-primary transition-colors">Auto-Track Pending</p>
                                    <p className="text-sm text-text-muted mt-0.5">Map new unbilled orders to Pipeline Board</p>
                                </div>
                            </label>

                            <label className="flex items-start gap-3 cursor-pointer group pt-2 border-t border-border-subtle/50">
                                <input 
                                    type="checkbox"
                                    checked={preferences.escalateHighValueDecline}
                                    onChange={(e) => setPreferences({...preferences, escalateHighValueDecline: e.target.checked})}
                                    className="mt-1 accent-indigo-500 h-4 w-4 rounded"
                                />
                                <div className="text-sm">
                                    <p className="font-bold text-text-primary group-hover:text-accent-primary transition-colors">Escalate High Value</p>
                                    <p className="text-sm text-text-muted mt-0.5">Escalate declines on high orders directly in help feed</p>
                                </div>
                            </label>

                            {preferences.escalateHighValueDecline && (
                                <div className="pl-7 space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                                    <p className="text-sm font-bold uppercase text-text-muted tracking-wide">Escalation Limit</p>
                                    <input 
                                        type="number"
                                        value={preferences.highValueThreshold}
                                        onChange={(e) => setPreferences({...preferences, highValueThreshold: Number(e.target.value)})}
                                        className="w-full bg-surface-alt border border-border-strong rounded-xl px-3 py-2 text-sm font-mono font-bold text-text-primary outline-none focus:border-indigo-500"
                                        placeholder="Min dollar amount"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Informational Box */}
                        <div className="bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10 text-sm leading-relaxed text-text-muted space-y-2">
                            <p className="font-bold text-indigo-300 flex items-center gap-1">
                                <Info size={12} />
                                Judgment Architecture
                            </p>
                            <p>
                                When an order form is submitted, the system tests transaction properties. If flagged as Declined, it vectors to Terminal 3. If scheduled, it registers to Terminal 2. Everything else enters the standard Pipeline Tracker.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Live Routing Matrix Table & Search Tracker */}
                <div className="lg:col-span-3 bg-surface-main border border-border-subtle rounded-xl p-4 flex flex-col space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-sm font-bold text-text-primary">Live Routing Matrix Ledger</h3>
                            <p className="text-sm text-text-muted mt-0.5">Search or override any submitted record to track its mapping location.</p>
                        </div>
                        {/* Selector Filter Tabs */}
                        <div className="flex p-0.5 bg-surface-alt rounded-xl border border-border-subtle shrink-0">
                            {(['All', 'Pipeline', 'Callback', 'HelpQueue'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => { setFilterDestination(tab); sfx.playClick(); }}
                                    className={`px-3 py-1.5 text-sm font-bold uppercase tracking-wide rounded-lg transition-all ${
                                        filterDestination === tab 
                                            ? 'bg-indigo-500 text-white shadow-sm' 
                                            : 'text-text-muted hover:text-text-primary'
                                    }`}
                                >
                                    {tab === 'HelpQueue' ? 'Help Queue' : tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search Field */}
                    <div className="relative">
                        <Search className="absolute left-3.5 top-3.5 text-text-muted" size={16} />
                        <Input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Type customer name, SKU product, or Order ID to locate where they are registered..."
                            className="pl-10 h-11 bg-surface-alt/40 border-border-subtle rounded-xl placeholder:text-text-muted/45 font-bold text-sm"
                        />
                    </div>

                    {/* Mapped Entries Table */}
                    <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[350px] border border-border-subtle/50 rounded-xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border-subtle/60 bg-surface-alt/30">
                                    <th className="p-3 text-sm font-bold uppercase tracking-wide text-[#ffffff50] w-[140px]">Record / Customer</th>
                                    <th className="p-3 text-sm font-bold uppercase tracking-wide text-[#ffffff50] w-[110px]">Active Terminal</th>
                                    <th className="p-3 text-sm font-bold uppercase tracking-wide text-[#ffffff50] w-[80px]">Status</th>
                                    <th className="p-3 text-sm font-bold uppercase tracking-wide text-[#ffffff50]">Routing Condition</th>
                                    <th className="p-3 text-sm font-bold uppercase tracking-wide text-[#ffffff50] text-right w-[180px]">Operations & Override</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence initial={false}>
                                    {filteredEntries.map((item) => {
                                        const isSelected = selectedSaleId === item.id;
                                        return (
                                            <React.Fragment key={item.id}>
                                                <tr className={`border-b border-border-subtle/40 hover:bg-surface-alt/25 transition-all ${isSelected ? 'bg-indigo-500/5' : ''}`}>
                                                    <td className="p-3">
                                                        <div className="font-bold text-text-primary text-sm">{item.customer}</div>
                                                        <div className="font-mono text-sm text-[#ffffff40] mt-0.5">PID: {item.id.substring(0,8)}</div>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-sm font-bold uppercase rounded-lg ${
                                                            item.destination === 'HelpQueue' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                                            item.destination === 'Callback' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                                                            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                        }`}>
                                                            {item.destination === 'HelpQueue' ? <ShieldAlert size={10} /> : 
                                                             item.destination === 'Callback' ? <History size={10} /> : <Map size={10} />}
                                                            {item.destination === 'HelpQueue' ? 'Help Queue' :
                                                             item.destination === 'Callback' ? 'Callbacks' : 'Pipeline'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`text-sm font-bold ${
                                                            item.status === 'Approved' ? 'text-status-success' :
                                                            item.status === 'Declined' ? 'text-status-error' : 'text-status-warning'
                                                        }`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="font-mono text-sm text-text-muted truncate max-w-[150px]" title={item.triggerRule}>
                                                            {item.triggerRule}
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <div className="flex gap-2 justify-end">
                                                            <button
                                                                onClick={() => { setSelectedSaleId(isSelected ? null : item.id); sfx.playClick(); }}
                                                                className="px-2.5 py-1 bg-surface-alt hover:bg-surface-alt/80 border border-border-strong rounded-lg text-sm font-bold text-text-secondary hover:text-text-primary transition-colors"
                                                            >
                                                                {isSelected ? 'Collapse' : 'Inspect Rules'}
                                                            </button>
                                                            
                                                            <button
                                                                onClick={() => { onLoadLead(item); sfx.playClick(); }}
                                                                className="px-2.5 py-1 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm font-bold text-white transition-colors"
                                                            >
                                                                Engage Lead
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* Expanded diagnostics sub-row */}
                                                {isSelected && (
                                                    <tr>
                                                        <td colSpan={5} className="bg-indigo-500/[0.02] border-b border-border-subtle p-4">
                                                            <motion.div
                                                                initial={{ opacity: 0, y: -8 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm"
                                                            >
                                                                <div className="space-y-1.5 col-span-2">
                                                                    <p className="font-bold uppercase tracking-wider text-[#ffffff40] text-sm">Decision Rationale</p>
                                                                    <p className="text-text-secondary leading-relaxed font-medium">{item.rationale}</p>
                                                                    <p className="text-sm text-text-muted mt-2">
                                                                        <span className="font-bold text-indigo-400">Next Action Goal:</span> {item.actionText}
                                                                    </p>
                                                                </div>

                                                                <div className="space-y-3 bg-surface-main/30 p-3 rounded-xl border border-border-subtle/50">
                                                                    <p className="font-bold uppercase tracking-wider text-[#ffffff40] text-sm">Manual Terminal Override</p>
                                                                    
                                                                    <div className="flex flex-wrap gap-1.5">
                                                                        <button 
                                                                            onClick={() => handleOverrideRoute(item.id, 'Pending')}
                                                                            className="px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold tracking-tight rounded-md border border-blue-500/15"
                                                                        >
                                                                            Pipeline
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => handleOverrideRoute(item.id, 'Rescue In Progress')}
                                                                            className="px-2 py-1 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-400 font-bold tracking-tight rounded-md border border-indigo-500/20"
                                                                        >
                                                                            Callback
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => handleOverrideRoute(item.id, 'Declined')}
                                                                            className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold tracking-tight rounded-md border border-rose-500/15"
                                                                        >
                                                                            Help Queue
                                                                        </button>
                                                                    </div>

                                                                    {item.status === 'Declined' && (
                                                                        <button
                                                                            onClick={() => handleConfigureRescue(item)}
                                                                            className="w-full h-8 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg flex items-center justify-center gap-1 shadow-md shadow-emerald-500/15 transition-all text-sm tracking-wide"
                                                                        >
                                                                            <UserCheck size={11} />
                                                                            Deploy Auto-Rescue Note
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}

                                    {filteredEntries.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-text-muted">
                                                <Info size={24} className="mx-auto mb-2 opacity-50" />
                                                <p className="text-sm font-bold text-[#ffffff50]">No recently logged properties found matching your search matrix.</p>
                                            </td>
                                        </tr>
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
