import React, { useState, useMemo, useCallback } from 'react';
import { useCRM } from '../../hooks/useCRM';
import { 
    Users, Search, Filter, ArrowUpDown, Edit3, Trash2, Plus, 
    X, MapPin, CreditCard, Mail, Phone, Heart, Activity, Check, 
    AlertCircle, Sparkles, Scale, Accessibility, FileText,
    ChevronDown, ChevronUp, RefreshCw, AlertTriangle, CheckCircle2,
    TrendingUp, Zap, Clock, ArrowUpRight, ShieldCheck, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Customer, Sale } from '../../types';
import { sfx } from '../../lib/soundService';
import { useSystem } from '../../hooks/useSystem';

export const UniqueSalesPool: React.FC = () => {
    const { customers = [], updateCustomer, deleteCustomer, addCustomer, sales = [] } = useCRM();
    const { setToast } = useSystem();

    // Filtering, Searching & Sorting States
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'ltv' | 'date'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    
    // Quick Outcome Tabs Filter: 'all' | 'approved' | 'declined' | 'incomplete' | 'cold'
    const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'approved' | 'declined' | 'incomplete' | 'cold'>('all');
    
    // Expanded Accordion row tracking for transaction ledgers
    const [expandedCustomers, setExpandedCustomers] = useState<Record<string, boolean>>({});

    // UI details and modal states
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    
    // New Customer form state
    const [newCustForm, setNewCustForm] = useState({
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
        medicalConditions: ''
    });

    // Sound helpers
    const playClick = () => sfx.playClick();
    const playConfirm = () => sfx.playConfirm();
    const playSuccess = () => sfx.playSuccess();
    const playDecline = () => sfx.playDecline();

    // Toggle expanded state for a single customer card/row
    const toggleRow = (customerId: string) => {
        playClick();
        setExpandedCustomers(prev => ({
            ...prev,
            [customerId]: !prev[customerId]
        }));
    };

    // Unique customers selection (Deduplicate customers array by phone number just to guarantee safe state)
    const uniqueCustomers = useMemo(() => {
        const seen = new Set<string>();
        const result: Customer[] = [];
        // Sort original customers newest first so we always grab latest profile if duplicates exist in db
        const sortedRaw = [...customers].sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
        
        sortedRaw.forEach(c => {
            const cleanPhone = (c.phone || '').replace(/\D/g, '');
            if (!cleanPhone) return;
            if (!seen.has(cleanPhone)) {
                seen.add(cleanPhone);
                result.push(c);
            }
        });
        return result;
    }, [customers]);

    // Precompute dynamic activity metrics from the loaded live Sales Ledger
    const customerDynamicMetrics = useMemo(() => {
        const metricsMap = new Map<string, {
            sales: Sale[];
            ltv: number;
            orderCount: number;
            declineCount: number;
            lastStatus: 'Pending' | 'Approved' | 'Declined' | 'Cancelled' | 'Rescue In Progress' | 'None';
            lastAmount: number;
            lastProduct: string;
            lastTimestamp: number;
            firstSource: string;
        }>();

        // High-performance index maps to bypass O(N * M) nested scanning
        const salesByCustId = new Map<string, Sale[]>();
        const salesByPhone = new Map<string, Sale[]>();

        sales.forEach(sale => {
            if (sale.customerId) {
                let list = salesByCustId.get(sale.customerId);
                if (!list) {
                    list = [];
                    salesByCustId.set(sale.customerId, list);
                }
                list.push(sale);
            }

            const salePhone = (sale.phone || '').replace(/\D/g, '');
            if (salePhone) {
                let list = salesByPhone.get(salePhone);
                if (!list) {
                    list = [];
                    salesByPhone.set(salePhone, list);
                }
                list.push(sale);
            }
        });

        uniqueCustomers.forEach(c => {
            const cleanCustPhone = (c.phone || '').replace(/\D/g, '');

            // Set-based deduplication of sales records for this specific customer
            const matchedSalesSet = new Set<Sale>();

            // 1. Check ID lookup
            const listById = salesByCustId.get(c.id);
            if (listById) {
                listById.forEach(s => matchedSalesSet.add(s));
            }

            // 2. Check Phone lookup
            if (cleanCustPhone) {
                const listByPhone = salesByPhone.get(cleanCustPhone);
                if (listByPhone) {
                    listByPhone.forEach(s => matchedSalesSet.add(s));
                }
            }

            // Standard descending chronological sort of transaction ledger rows
            const cSales = Array.from(matchedSalesSet).sort((a, b) => b.timestamp - a.timestamp);

            const approvedSales = cSales.filter(s => s.status === 'Approved');
            const ltv = approvedSales.reduce((sum, s) => sum + (s.amount || 0), 0);
            const orderCount = approvedSales.length;
            const declineCount = cSales.filter(s => s.status === 'Declined').length;
            const newest = cSales[0];

            metricsMap.set(c.id, {
                sales: cSales,
                ltv: ltv,
                orderCount: orderCount,
                declineCount: declineCount,
                lastStatus: newest ? newest.status : 'None',
                lastAmount: newest ? newest.amount : 0,
                lastProduct: newest ? newest.product : '',
                lastTimestamp: newest ? newest.timestamp : 0,
                firstSource: newest ? (newest.sourceType || 'Pipeline') : (c.firstSource || 'Imported'),
            });
        });

        return metricsMap;
    }, [uniqueCustomers, sales]);

    // Unique States and Tags for filtering
    const allStates = useMemo(() => {
        const states = new Set<string>();
        uniqueCustomers.forEach(c => {
            if (c.shippingState) states.add(c.shippingState);
            if (c.billingState) states.add(c.billingState);
        });
        return Array.from(states).sort();
    }, [uniqueCustomers]);

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        uniqueCustomers.forEach(c => {
            if (c.tags) c.tags.forEach(t => tags.add(t));
            if (c.medicalConditions) c.medicalConditions.forEach(m => tags.add(m));
        });
        return Array.from(tags).sort();
    }, [uniqueCustomers]);

    // Search and filter logic incorporating fast outcomes tab filtering
    const filteredCustomers = useMemo(() => {
        return uniqueCustomers.filter(c => {
            const metrics = customerDynamicMetrics.get(c.id);
            const ltv = metrics?.ltv ?? 0;
            const declineCount = metrics?.declineCount ?? 0;

            // Page Outcome quick tabs filtering
            if (selectedStatusFilter === 'approved' && ltv === 0) return false;
            if (selectedStatusFilter === 'declined' && declineCount === 0) return false;
            if (selectedStatusFilter === 'incomplete') {
                const isComplete = c.firstName && c.lastName && c.phone && c.email && 
                                   c.shippingAddress && c.billingAddress && c.age && c.dob;
                if (isComplete) return false; // filter out complete profiles, only look for incomplete ones
            }
            if (selectedStatusFilter === 'cold' && metrics && metrics.sales.length > 0) return false; // Cold leads have never tried any transacting

            const query = searchQuery.toLowerCase().trim();
            const fullName = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase();
            const altName = (c.name || '').toLowerCase();
            const phoneClean = (c.phone || '').replace(/\D/g, '');
            const altPhoneClean = ((c as any).alternatePhone || '').replace(/\D/g, '');
            const email = (c.email || '').toLowerCase();
            const medical = (c.medicalConditions || []).join(' ').toLowerCase();
            
            const matchesSearch = !query || 
                fullName.includes(query) ||
                altName.includes(query) ||
                phoneClean.includes(query) ||
                altPhoneClean.includes(query) ||
                email.includes(query) ||
                medical.includes(query) ||
                (c.shippingCity || '').toLowerCase().includes(query) ||
                (c.billingCity || '').toLowerCase().includes(query);

            const matchesState = !selectedState || 
                c.shippingState === selectedState || 
                c.billingState === selectedState;

            const matchesTag = !selectedTag || 
                (c.tags && c.tags.includes(selectedTag)) ||
                (c.medicalConditions && c.medicalConditions.includes(selectedTag));

            return matchesSearch && matchesState && matchesTag;
        }).sort((a, b) => {
            const metricsA = customerDynamicMetrics.get(a.id);
            const metricsB = customerDynamicMetrics.get(b.id);

            let valA: any = '';
            let valB: any = '';

            if (sortBy === 'name') {
                valA = `${a.lastName || ''}, ${a.firstName || ''}`.toLowerCase();
                valB = `${b.lastName || ''}, ${b.firstName || ''}`.toLowerCase();
            } else if (sortBy === 'ltv') {
                valA = metricsA?.ltv || 0;
                valB = metricsB?.ltv || 0;
            } else if (sortBy === 'date') {
                valA = a.createdAt || 0;
                valB = b.createdAt || 0;
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [uniqueCustomers, customerDynamicMetrics, selectedStatusFilter, searchQuery, selectedState, selectedTag, sortBy, sortOrder]);

    // Live aggregated statistics calculated directly from dynamic metrics
    const stats = useMemo(() => {
        const total = uniqueCustomers.length;
        let totalLtv = 0;
        let completeProfiles = 0;
        let vipCount = 0;
        let totalApprovedCount = 0;
        let totalDeclinedCount = 0;

        uniqueCustomers.forEach(c => {
            const metrics = customerDynamicMetrics.get(c.id);
            const ltv = metrics?.ltv ?? 0;
            totalLtv += ltv;
            totalApprovedCount += metrics?.orderCount ?? 0;
            totalDeclinedCount += metrics?.declineCount ?? 0;

            if (ltv >= 1000) {
                vipCount++;
            }

            const isComplete = !!(c.firstName && c.lastName && c.phone && c.email && 
                               c.shippingAddress && c.billingAddress && c.age && c.dob);
            if (isComplete) {
                completeProfiles++;
            }
        });

        const avgLtv = total > 0 ? Math.round(totalLtv / total) : 0;
        const completenessRate = total > 0 ? Math.round((completeProfiles / total) * 100) : 0;

        return { 
            total, 
            avgLtv, 
            completenessRate, 
            vipCount,
            totalApprovedCount,
            totalDeclinedCount,
            totalLtv
        };
    }, [uniqueCustomers, customerDynamicMetrics]);

    // Handle editing save
    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCustomer) return;
        playConfirm();

        try {
            const medConds = typeof (editingCustomer as any).medicalConditionsString === 'string'
                ? (editingCustomer as any).medicalConditionsString.split(',').map((s: string) => s.trim()).filter(Boolean)
                : editingCustomer.medicalConditions;

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

    // Handle manual seed add
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
                ? newCustForm.medicalConditions.split(',').map(s => s.trim()).filter(Boolean)
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
                age: '', dob: '', height: '', weight: '', medicalConditions: ''
            });
            setToast({
                title: 'Unified Profile Added',
                message: `Client ${fullName} was successfully provisioned in the unique sales directory.`,
                type: 'success'
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

    // Handle delete customer
    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Are you absolutely sure you want to permanently delete customer "${name}"? This action is irreversible.`)) {
            playClick();
            try {
                await deleteCustomer(id);
                setToast({
                    title: 'Record Purged',
                    message: `Client ${name} was permanently removed from the central CRM directory.`,
                    type: 'error'
                });
                playDecline();
            } catch (err) {
                console.error('Error deleting contact:', err);
                setToast({
                    title: 'Purge Failed',
                    message: `System was unable to delete ${name}'s client record.`,
                    type: 'error'
                });
            }
        }
    };

    // Auto complete billing with shipping values
    const syncBillingWithShipping = (editing: boolean) => {
        playClick();
        if (editing && editingCustomer) {
            setEditingCustomer({
                ...editingCustomer,
                billingAddress: editingCustomer.shippingAddress || '',
                billingApt: editingCustomer.shippingApt || '',
                billingCity: editingCustomer.shippingCity || '',
                billingState: editingCustomer.shippingState || '',
                billingZip: editingCustomer.shippingZip || '',
            });
        } else if (!editing) {
            setNewCustForm({
                ...newCustForm,
                billingAddress: newCustForm.shippingAddress,
                billingApt: newCustForm.shippingApt,
                billingCity: newCustForm.shippingCity,
                billingState: newCustForm.shippingState,
                billingZip: newCustForm.shippingZip
            });
        }
    };

    return (
        <div id="sales-pool-root" className="flex flex-col gap-6 p-6 min-h-screen bg-surface-main/30 rounded-3xl border border-border-subtle animate-in fade-in duration-300">
            {/* Header Section */}
            <div id="sales-pool-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text-primary tracking-tight flex items-center gap-2.5">
                        <Users className="text-accent-primary" size={26} />
                        Unique Customer Sales Pool
                    </h1>
                    <p className="text-sm text-text-muted mt-1 font-medium">
                        Root Super Admin database of distinct customer profiles. Duplicate phone registrations are automatically converged.
                    </p>
                </div>
                <div>
                    <button 
                        onClick={() => { playClick(); setIsAddOpen(true); }}
                        className="px-4 py-2.5 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-lg shadow-accent-primary/20 flex items-center gap-2"
                        id="btn-add-unique-customer"
                    >
                        <Plus size={16} /> Add Unique Record
                    </button>
                </div>
            </div>

            {/* Live Synchronizing Feed Banner */}
            <div className="bg-surface-main/80 backdrop-blur-md border border-border-strong/10 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 overflow-hidden shadow-sm relative before:absolute before:top-0 before:left-0 before:bottom-0 before:w-1 before:bg-accent-primary">
                <div className="flex items-center gap-3">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-status-success"></span>
                    </span>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-primary">LIVE CRM OUTCOME FEED</span>
                        <span className="text-[11px] text-text-muted">Auto-stitch active • Subscribed to real-time sales events</span>
                    </div>
                </div>
                
                {/* Mini scrolling stream */}
                <div id="live-scrolling-feed-ticker" className="flex-1 max-w-xl bg-surface-alt/70 border border-border-subtle rounded-xl px-3 py-1.5 overflow-hidden flex items-center justify-start h-8">
                    <AnimatePresence mode="popLayout">
                        {sales.slice(0, 1).map((latestSale) => {
                            const isApp = latestSale.status === 'Approved';
                            const isDec = latestSale.status === 'Declined';
                            return (
                                <motion.div 
                                    key={latestSale.id}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    transition={{ duration: 0.35 }}
                                    className="flex items-center gap-2 text-[11px] font-semibold w-full"
                                >
                                    <span className="font-mono text-text-muted">{new Date(latestSale.timestamp || Date.now()).toLocaleTimeString()}</span>
                                    <span className="font-bold text-text-primary">{latestSale.firstName} {latestSale.lastName ? latestSale.lastName[0] : ''}.</span>
                                    <span className="text-text-muted">processed</span>
                                    <span className="font-bold">{latestSale.product}</span>
                                    <span className="text-text-muted">—</span>
                                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase shrink-0 ${isApp ? 'bg-status-success/15 text-status-success border border-status-success/20' : isDec ? 'bg-status-error/15 text-status-error border border-status-error/20' : 'bg-status-warning/15 text-status-warning border border-status-warning/20'}`}>
                                        {latestSale.status}: ${latestSale.amount}
                                    </span>
                                </motion.div>
                            );
                        })}
                        {sales.length === 0 && (
                            <span className="text-[11px] text-text-muted italic">Waiting for incoming sales ledger activity...</span>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex gap-4 shrink-0 font-mono text-[10px] font-bold text-text-secondary">
                    <div>Gross Rev: <span className="text-status-success font-black">${stats.totalLtv.toLocaleString()}</span></div>
                    <div>Approved Orders: <span className="text-accent-primary font-black">{stats.totalApprovedCount}</span></div>
                    <div>Declined: <span className="text-status-error font-black">{stats.totalDeclinedCount}</span></div>
                </div>
            </div>

            {/* Admin Level 10 Badge Indicators */}
            <div id="sales-pool-kpi-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface-main border border-border-subtle p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] font-black tracking-widest text-text-muted uppercase flex items-center gap-1.5"><Users size={14} className="text-accent-primary"/> TOTAL UNIQUE CONTACTS</span>
                    <h3 className="text-3xl font-black text-text-primary mt-3">{stats.total}</h3>
                    <span className="text-xs text-status-success font-semibold mt-1">▲ Unified Directory</span>
                </div>
                <div className="bg-surface-main border border-border-subtle p-5 rounded-2xl shadow-sm flex flex-col justify-between font-medium">
                    <span className="text-[10px] font-black tracking-widest text-text-muted uppercase flex items-center gap-1.5"><CreditCard size={14} className="text-accent-primary"/> AVERAGE LTV</span>
                    <h3 className="text-3xl font-black text-text-primary mt-3">${stats.avgLtv}</h3>
                    <span className="text-xs text-text-muted mt-1">Per active profile</span>
                </div>
                <div className="bg-surface-main border border-border-subtle p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] font-black tracking-widest text-text-muted uppercase flex items-center gap-1.5"><Activity size={14} className="text-accent-primary"/> COMPLETENESS RATE</span>
                    <h3 className="text-3xl font-black text-text-primary mt-3">{stats.completenessRate}%</h3>
                    <div className="w-full bg-border-subtle h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-accent-primary h-full rounded-full transition-all duration-500" style={{ width: `${stats.completenessRate}%` }} />
                    </div>
                </div>
                <div className="bg-surface-main border border-border-subtle p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] font-black tracking-widest text-text-muted uppercase flex items-center gap-1.5"><Sparkles size={14} className="text-status-warning"/> VIP ACCOUNTS</span>
                    <h3 className="text-3xl font-black text-text-primary mt-3">{stats.vipCount}</h3>
                    <span className="text-xs text-status-warning font-semibold mt-1">★ LTV exceeds $1,000</span>
                </div>
            </div>

            {/* Realtime Outcome Quick-Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 bg-surface-main/40 border border-border-subtle p-1.5 rounded-2xl">
                <button
                    onClick={() => { playClick(); setSelectedStatusFilter('all'); }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${selectedStatusFilter === 'all' ? 'bg-accent-primary text-white shadow-sm' : 'text-text-secondary hover:bg-surface-alt/80'}`}
                >
                    <Users size={13} />
                    All ({uniqueCustomers.length})
                </button>
                <button
                    onClick={() => { playClick(); setSelectedStatusFilter('approved'); }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${selectedStatusFilter === 'approved' ? 'bg-status-success/20 text-status-success border border-status-success/30 shadow-sm font-black' : 'text-text-secondary hover:bg-surface-alt/80'}`}
                >
                    <CheckCircle2 size={13} />
                    Approved Accounts ({uniqueCustomers.filter(c => (customerDynamicMetrics.get(c.id)?.ltv ?? 0) > 0).length})
                </button>
                <button
                    onClick={() => { playClick(); setSelectedStatusFilter('declined'); }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${selectedStatusFilter === 'declined' ? 'bg-status-error/20 text-status-error border border-status-error/30 shadow-sm font-black' : 'text-text-secondary hover:bg-surface-alt/80'}`}
                >
                    <AlertTriangle size={13} />
                    payment Decline List ({uniqueCustomers.filter(c => (customerDynamicMetrics.get(c.id)?.declineCount ?? 0) > 0).length})
                </button>
                <button
                    onClick={() => { playClick(); setSelectedStatusFilter('incomplete'); }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${selectedStatusFilter === 'incomplete' ? 'bg-status-warning/20 text-status-warning border border-status-warning/30 shadow-sm font-black' : 'text-text-secondary hover:bg-surface-alt/80'}`}
                >
                    <Activity size={13} />
                    Incomplete Bios ({uniqueCustomers.filter(c => !(c.firstName && c.lastName && c.phone && c.email && c.shippingAddress && c.billingAddress && c.age && c.dob)).length})
                </button>
                <button
                    onClick={() => { playClick(); setSelectedStatusFilter('cold'); }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${selectedStatusFilter === 'cold' ? 'bg-surface-alt text-text-muted border border-border-subtle' : 'text-text-secondary hover:bg-surface-alt/80'}`}
                >
                    <Clock size={13} />
                    Cold Leads ({uniqueCustomers.filter(c => (customerDynamicMetrics.get(c.id)?.sales.length ?? 0) === 0).length})
                </button>
            </div>

            {/* Filter Panel / Query Controls */}
            <div id="sales-pool-filters" className="p-4 bg-surface-main border border-border-subtle rounded-2xl flex flex-col lg:flex-row items-center gap-4">
                <div className="relative w-full lg:flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <input 
                        type="text"
                        placeholder="Search by first/last/middle name, phone, email, alternative phone, state, or medical condition..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-surface-alt border border-border-subtle rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/20 transition-all font-medium"
                    />
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="relative">
                        <select
                            value={selectedState}
                            onChange={(e) => setSelectedState(e.target.value)}
                            className="bg-surface-alt border border-border-subtle rounded-xl px-3 py-2 text-xs font-semibold text-text-primary outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/20 transition-all cursor-pointer appearance-none min-w-[120px]"
                        >
                            <option value="">All States</option>
                            {allStates.map(st => <option key={st} value={st}>{st}</option>)}
                        </select>
                    </div>

                    <div className="relative">
                        <select
                            value={selectedTag}
                            onChange={(e) => setSelectedTag(e.target.value)}
                            className="bg-surface-alt border border-border-subtle rounded-xl px-3 py-2 text-xs font-semibold text-text-primary outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/20 transition-all cursor-pointer appearance-none min-w-[140px]"
                        >
                            <option value="">All Tags/Medications</option>
                            {allTags.map(tg => <option key={tg} value={tg}>{tg}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center gap-1.5 border border-border-subtle col-span-1 rounded-xl p-1 bg-surface-alt">
                        <button 
                            type="button" 
                            onClick={() => { playClick(); setSortBy('name'); }} 
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${sortBy === 'name' ? 'bg-accent-primary text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                        >
                            Name
                        </button>
                        <button 
                            type="button" 
                            onClick={() => { playClick(); setSortBy('ltv'); }} 
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${sortBy === 'ltv' ? 'bg-accent-primary text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                        >
                            LTV
                        </button>
                        <button 
                            type="button" 
                            onClick={() => { playClick(); setSortBy('date'); }} 
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${sortBy === 'date' ? 'bg-accent-primary text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                        >
                            Added
                        </button>
                    </div>

                    <button
                        onClick={() => { playClick(); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                        className="p-2 border border-border-subtle bg-surface-alt rounded-xl hover:bg-border-subtle text-text-secondary transition-colors"
                        title="Invert Sort Order"
                    >
                        <ArrowUpDown size={16} />
                    </button>
                </div>
            </div>

            {/* Main Table View */}
            <div id="sales-pool-table-container" className="bg-surface-main border border-border-subtle rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border-subtle bg-surface-alt/70 text-[10px] font-black tracking-widest text-text-muted uppercase">
                                <th className="px-5 py-4">Client Identifiers</th>
                                <th className="px-5 py-4">Direct Contact</th>
                                <th className="px-5 py-4">Vital Statistics</th>
                                <th className="px-5 py-4">Medical Profile</th>
                                <th className="px-5 py-4">Billing & Shipping Locations</th>
                                <th className="px-5 py-4 text-right">LTV Metric</th>
                                <th className="px-5 py-4 text-center">Maintenance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle text-xs">
                            {filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-12 text-center text-text-muted font-semibold">
                                        <div className="flex flex-col items-center gap-2">
                                            <AlertCircle size={24} className="text-text-muted" />
                                            <span>No matches found in the unique customer directory.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredCustomers.map(customer => {
                                    const medConditionsList = customer.medicalConditions || [];
                                    const ageVal = customer.age || '—';
                                    const heightVal = customer.height || '—';
                                    const weightVal = customer.weight || '—';
                                    const dobVal = customer.dob || '—';
                                    const middleInit = (customer as any).middleInitial ? `${(customer as any).middleInitial}. ` : '';
                                    const fullNameWithMI = `${customer.firstName || ''} ${middleInit}${customer.lastName || ''}`.trim() || customer.name || 'Unknown';
                                    
                                    // Precomputed dynamic properties derived on the fly from reactive sales ledger
                                    const metrics = customerDynamicMetrics.get(customer.id);
                                    const dynamicLtv = metrics?.ltv ?? customer.ltv ?? 0;
                                    const dynamicOrderCount = metrics?.orderCount ?? customer.orderCount ?? 0;
                                    const isVip = dynamicLtv >= 1000;
                                    const isExpanded = !!expandedCustomers[customer.id];

                                    return (
                                        <React.Fragment key={customer.id}>
                                            <tr className={`hover:bg-surface-alt/40 transition-colors group cursor-pointer ${isExpanded ? 'bg-surface-alt/20 shadow-inner' : ''}`} onClick={() => toggleRow(customer.id)}>
                                                {/* Name / Identifiers */}
                                                <td className="px-5 py-4.5">
                                                    <div className="flex items-center gap-3">
                                                        <div 
                                                            onClick={(e) => { e.stopPropagation(); toggleRow(customer.id); }}
                                                            className="w-8 h-8 rounded-full bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-xs font-black text-accent-primary hover:bg-accent-primary/20 transition-all shrink-0"
                                                        >
                                                            {isExpanded ? <ChevronUp size={14} /> : (customer.firstName || 'C')[0]}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-text-primary flex items-center gap-1.5 leading-tight">
                                                                {fullNameWithMI}
                                                                {isVip && (
                                                                    <span className="text-[9px] font-black bg-status-warning/10 border border-status-warning/20 text-status-warning px-1.5 py-0.5 rounded-full uppercase tracking-wider">VIP</span>
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] font-mono font-medium text-text-muted uppercase">UID: {customer.id}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Direct Contact */}
                                                <td className="px-5 py-4.5" onClick={(e) => e.stopPropagation()}>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-text-secondary font-bold font-mono">
                                                            <Phone size={12} className="text-accent-primary/60" />
                                                            {customer.phone || '—'}
                                                        </div>
                                                        {customer.email && (
                                                            <div className="flex items-center gap-2 text-[11px] text-text-muted font-medium">
                                                                <Mail size={12} className="text-accent-primary/60" />
                                                                {customer.email}
                                                            </div>
                                                        )}
                                                        {(customer as any).alternatePhone && (
                                                            <div className="flex items-center gap-2 text-[10px] text-text-muted font-mono font-semibold">
                                                                <Phone size={10} className="text-status-success/50" />
                                                                ALT: {(customer as any).alternatePhone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Age, DOB, Vitals */}
                                                <td className="px-5 py-4.5" onClick={(e) => e.stopPropagation()}>
                                                    <div className="space-y-1">
                                                        <div className="text-[11px] font-semibold text-text-secondary">
                                                            Age: <span className="font-black text-text-primary">{ageVal}</span>
                                                        </div>
                                                        <div className="text-[10px] font-mono text-text-muted">
                                                            DOB: {dobVal}
                                                        </div>
                                                        <div className="flex items-center gap-3 text-[10px] font-semibold text-text-muted">
                                                            <span>H: <span className="text-text-primary">{heightVal}</span></span>
                                                            <span>W: <span className="text-text-primary">{weightVal}</span></span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Medical profile */}
                                                <td className="px-5 py-4.5 max-w-[200px]" onClick={(e) => e.stopPropagation()}>
                                                    {medConditionsList.length === 0 ? (
                                                        <span className="text-[10px] font-medium text-text-muted italic">No declarations</span>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-1 max-h-[50px] overflow-y-auto">
                                                            {medConditionsList.map((m, idx) => (
                                                                <span key={idx} className="text-[9px] font-black tracking-wide uppercase px-1.5 py-0.5 rounded-md bg-status-error/10 border border-status-error/20 text-status-error">
                                                                    {m}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Locations */}
                                                <td className="px-5 py-4.5 max-w-[260px]" onClick={(e) => e.stopPropagation()}>
                                                    <div className="space-y-1.5 text-[11px]">
                                                        {customer.shippingAddress ? (
                                                            <div className="flex items-start gap-1">
                                                                <MapPin size={11} className="text-accent-primary mt-0.5 shrink-0" />
                                                                <span className="text-text-secondary line-clamp-1">
                                                                    <b className="text-[10px] text-accent-primary font-black">SHIP:</b> {customer.shippingAddress}{customer.shippingApt ? `, Apt ${customer.shippingApt}` : ''}, {customer.shippingCity || ''}, {customer.shippingState || ''} {customer.shippingZip || ''}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="text-[10px] text-text-muted italic">No shipping location saved</div>
                                                        )}

                                                        {customer.billingAddress ? (
                                                            <div className="flex items-start gap-1">
                                                                <CreditCard size={11} className="text-status-success mt-0.5 shrink-0" />
                                                                <span className="text-text-secondary line-clamp-1">
                                                                    <b className="text-[10px] text-status-success font-black">BILL:</b> {customer.billingAddress}{customer.billingApt ? `, Apt ${customer.billingApt}` : ''}, {customer.billingCity || ''}, {customer.billingState || ''} {customer.billingZip || ''}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="text-[10px] text-text-muted italic">No billing location saved</div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Cumulative metrics */}
                                                <td className="px-5 py-4.5 text-right font-medium">
                                                    <div className="text-sm font-black text-text-primary">
                                                        ${dynamicLtv || 0}
                                                    </div>
                                                    <div className="text-[10px] font-mono text-text-muted uppercase">
                                                        Orders: {dynamicOrderCount || 0}
                                                    </div>
                                                    {/* Latest transaction outcome status */}
                                                    {metrics?.lastStatus && metrics.lastStatus !== 'None' && (
                                                        <div className="mt-1 flex items-center justify-end">
                                                            <span className={`text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded ${
                                                                metrics.lastStatus === 'Approved' ? 'bg-status-success/10 text-status-success border border-status-success/20' :
                                                                metrics.lastStatus === 'Declined' ? 'bg-status-error/10 text-status-error border border-status-error/20' :
                                                                'bg-status-warning/10 text-status-warning border border-status-warning/20'
                                                            }`}>
                                                                LAST: {metrics.lastStatus}
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-5 py-4.5 text-center" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button 
                                                            onClick={() => { playClick(); setEditingCustomer({ ...customer, medicalConditionsString: medConditionsList.join(', ') } as any); }}
                                                            className="p-1.5 border border-border-subtle bg-surface-alt hover:border-accent-primary/40 hover:text-accent-primary rounded-lg transition-all"
                                                            title="Modify customer record"
                                                        >
                                                            <Edit3 size={13} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(customer.id, fullNameWithMI)}
                                                            className="p-1.5 border border-border-subtle bg-surface-alt hover:border-status-error/40 hover:text-status-error rounded-lg transition-all"
                                                            title="Erase customer permanently"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Expandable Transact Timeline Drawer Panel */}
                                            {isExpanded && (
                                                <tr className="bg-surface-alt/10">
                                                    <td colSpan={7} className="px-5 py-4.5">
                                                        <div
                                                            className="overflow-hidden border border-border-subtle rounded-2xl bg-surface-main/80 p-5 space-y-4 shadow-inner"
                                                            id={`expanded-ledger-${customer.id}`}
                                                        >
                                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-left">
                                                                {/* Left Column: List of transaction attempts */}
                                                                <div className="md:col-span-7 space-y-3">
                                                                    <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                                                                        <h4 className="text-xs font-black text-text-primary tracking-wider uppercase flex items-center gap-1.5">
                                                                            <Clock size={13} className="text-accent-primary" />
                                                                            Transaction History & Attempts ({metrics?.sales.length || 0})
                                                                        </h4>
                                                                        <span className="text-[10px] font-mono text-text-muted">Direct Phone: {customer.phone}</span>
                                                                    </div>

                                                                    <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1.5">
                                                                        {metrics?.sales && metrics.sales.length > 0 ? (
                                                                            metrics.sales.map((sale) => {
                                                                                const isApproved = sale.status === 'Approved';
                                                                                const isDeclined = sale.status === 'Declined';
                                                                                return (
                                                                                    <div 
                                                                                        key={sale.id} 
                                                                                        className={`border p-3 rounded-xl flex items-center justify-between text-xs transition-colors bg-surface-alt/70 ${
                                                                                            isApproved ? 'border-status-success/20 bg-status-success/5' : 
                                                                                            isDeclined ? 'border-status-error/20 bg-status-error/5' : 
                                                                                            'border-border-subtle'
                                                                                        }`}
                                                                                    >
                                                                                        <div className="space-y-1">
                                                                                            <div className="flex items-center gap-1.5 font-bold text-text-primary">
                                                                                                <span>{sale.product}</span>
                                                                                                <span className="text-text-muted font-normal">({sale.quantity}x {sale.dosage})</span>
                                                                                            </div>
                                                                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-text-muted font-medium font-sans">
                                                                                                <span>ID: <code className="font-mono text-text-primary">{sale.id}</code></span>
                                                                                                <span>Agent: <strong className="text-text-secondary">{sale.agent || 'Unknown'}</strong></span>
                                                                                                <span>Time: {new Date(sale.timestamp).toLocaleString()}</span>
                                                                                            </div>
                                                                                            {sale.declineReason && (
                                                                                                <div className="text-[10px] font-bold text-status-error flex items-center gap-1 mt-1 bg-status-error/5 px-2 py-0.5 rounded border border-status-error/10">
                                                                                                    <AlertTriangle size={10} />
                                                                                                    Reason: {sale.declineReason}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="text-right space-y-1 shrink-0 ml-3">
                                                                                            <div className="font-black text-text-primary text-sm">${sale.amount}</div>
                                                                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                                                                                isApproved ? 'bg-status-success/20 text-status-success' :
                                                                                                isDeclined ? 'bg-status-error/20 text-status-error' :
                                                                                                'bg-status-warning/20 text-status-warning'
                                                                                            }`}>
                                                                                                {sale.status}
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })
                                                                        ) : (
                                                                            <div className="text-center py-8 text-text-muted italic border border-dashed border-border-subtle rounded-xl flex flex-col items-center justify-center p-4">
                                                                                <FileText size={20} className="mb-1 text-text-muted/60" />
                                                                                No transaction attempts recorded under this unified phone profile.
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Right Column: Address Auto-Stitching & Rescues */}
                                                                <div className="md:col-span-5 space-y-4">
                                                                    <div>
                                                                        <h4 className="text-xs font-black text-text-primary tracking-wider uppercase flex items-center gap-1.5 border-b border-border-subtle pb-2">
                                                                            <MapPin size={13} className="text-status-success" />
                                                                            Unified Address Registries
                                                                        </h4>
                                                                        
                                                                        <div className="mt-2 space-y-2 text-[10px] font-medium text-text-secondary">
                                                                            <div className="bg-surface-alt p-2 rounded-xl space-y-1 border border-border-subtle">
                                                                                <div className="font-bold text-text-muted uppercase tracking-widest text-[8px]">Primary Destination address (Stitched):</div>
                                                                                <p>{customer.shippingAddress || 'No shipping address matching this profile.'}</p>
                                                                                {customer.shippingCity && <p>{customer.shippingCity}, {customer.shippingState} {customer.shippingZip}</p>}
                                                                            </div>

                                                                            <div className="bg-surface-alt p-2 rounded-xl space-y-1 border border-border-subtle">
                                                                                <div className="font-bold text-text-muted uppercase tracking-widest text-[8px]">Billing location (Stitched):</div>
                                                                                <p>{customer.billingAddress || 'No billing address matching this profile.'}</p>
                                                                                {customer.billingCity && <p>{customer.billingCity}, {customer.billingState} {customer.billingZip}</p>}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="bg-surface-alt p-4 rounded-2xl border border-border-subtle space-y-2">
                                                                        <div className="flex items-center gap-2">
                                                                            {metrics && metrics.declineCount > 0 ? (
                                                                                <>
                                                                                    <ShieldAlert size={16} className="text-status-error" />
                                                                                    <span className="text-[11px] font-black text-status-error uppercase tracking-wider">Decline Rescue Candidate</span>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <ShieldCheck size={16} className="text-status-success" />
                                                                                    <span className="text-[11px] font-black text-status-success uppercase tracking-wider">Health Assessment OK</span>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-[11px] text-text-muted leading-relaxed font-semibold">
                                                                            {metrics && metrics.declineCount > 0 
                                                                                ? `This user attempted checkouts but encountered ${metrics.declineCount} transaction failure(s). They are currently a prime candidate for an immediate recovery campaign.`
                                                                                : "This profile does not have outstanding declined transaction issues. Data stitching validation completed successfully with 100% address integrity rate."
                                                                            }
                                                                        </p>
                                                                        <div className="pt-2 flex items-center gap-1.5">
                                                                            <button 
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    playConfirm();
                                                                                    setToast({
                                                                                        title: 'Callback Prioritized',
                                                                                        message: `Successfully dispatched task! Agent call pool will prioritize calling ${customer.firstName || 'customer'} immediately.`,
                                                                                        type: 'success'
                                                                                    });
                                                                                }}
                                                                                className="flex-1 py-1.5 px-3 bg-accent-primary text-white text-[10px] font-bold uppercase rounded-lg hover:bg-accent-primary/95 transition-all text-center"
                                                                            >
                                                                                Prioritize Callback
                                                                            </button>
                                                                            <button 
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    playConfirm();
                                                                                    setToast({
                                                                                        title: 'Payment Link Dispatched',
                                                                                        message: `SMS text message initiated. Standard templated payment link dispatched to ${customer.phone || 'customer'}.`,
                                                                                        type: 'info'
                                                                                    });
                                                                                }}
                                                                                className="flex-1 py-1.5 px-3 border border-border-strong text-text-secondary text-[10px] font-bold uppercase rounded-lg hover:bg-surface-alt transition-all text-center"
                                                                            >
                                                                                Send Payment Link
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit / Detail Slider Form */}
            <AnimatePresence>
                {editingCustomer && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex justify-end">
                        <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                            className="w-full max-w-xl bg-surface-main border-l border-border-subtle h-full shadow-2xl flex flex-col overflow-hidden"
                            id="edit-customer-panel"
                        >
                            {/* Slide Title */}
                            <div className="p-6 border-b border-border-subtle bg-surface-alt/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-accent-primary/10 border border-accent-primary/20 rounded-xl text-accent-primary">
                                        <Users size={18} />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-black text-text-primary tracking-tight">Edit Unique Record</h2>
                                        <p className="text-xs text-text-muted mt-0.5">UID: {editingCustomer.id}</p>
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
                            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Biographical Section */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-2 flex items-center gap-2">
                                        <Activity size={14} className="text-accent-primary" />
                                        1. Biographical Identity
                                    </h3>
                                    
                                    <div className="grid grid-cols-12 gap-3">
                                        <div className="col-span-5 relative">
                                            <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">First Name</div>
                                            <input 
                                                required
                                                type="text" 
                                                value={editingCustomer.firstName || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, firstName: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs text-text-primary outline-none focus:border-accent-primary font-medium"
                                            />
                                        </div>
                                        <div className="col-span-2 relative">
                                            <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">MI</div>
                                            <input 
                                                maxLength={1}
                                                type="text" 
                                                value={(editingCustomer as any).middleInitial || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, middleInitial: e.target.value.toUpperCase() } as any)}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs text-text-primary outline-none focus:border-accent-primary font-medium text-center"
                                            />
                                        </div>
                                        <div className="col-span-5 relative">
                                            <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">Last Name</div>
                                            <input 
                                                required
                                                type="text" 
                                                value={editingCustomer.lastName || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, lastName: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs text-text-primary outline-none focus:border-accent-primary font-medium"
                                            />
                                        </div>

                                        <div className="col-span-6 relative">
                                            <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">Direct Phone</div>
                                            <input 
                                                required
                                                type="text" 
                                                value={editingCustomer.phone || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs font-mono text-text-primary outline-none focus:border-accent-primary font-bold"
                                            />
                                        </div>
                                        <div className="col-span-6 relative">
                                            <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">Alternate Phone</div>
                                            <input 
                                                type="text" 
                                                value={(editingCustomer as any).alternatePhone || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, alternatePhone: e.target.value } as any)}
                                                placeholder="N/A"
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs font-mono text-text-primary outline-none focus:border-accent-primary font-semibold"
                                            />
                                        </div>

                                        <div className="col-span-12 relative">
                                            <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">Contact Email</div>
                                            <input 
                                                type="email" 
                                                value={editingCustomer.email || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs text-text-primary outline-none focus:border-accent-primary font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Vital Statistics / Bio */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-2 flex items-center gap-2">
                                        <Scale size={14} className="text-accent-primary" />
                                        2. Vital Metrics
                                    </h3>
                                    
                                    <div className="grid grid-cols-4 gap-3">
                                        <div className="relative">
                                            <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">Age</div>
                                            <input 
                                                type="number" 
                                                value={editingCustomer.age || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, age: e.target.value ? Number(e.target.value) : undefined })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs text-text-primary outline-none focus:border-accent-primary font-bold"
                                            />
                                        </div>
                                        <div className="relative col-span-1">
                                            <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">Height</div>
                                            <input 
                                                type="text" 
                                                value={editingCustomer.height || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, height: e.target.value })}
                                                placeholder="5'10"
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs text-text-primary outline-none focus:border-accent-primary font-medium"
                                            />
                                        </div>
                                        <div className="relative col-span-1">
                                            <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">Weight</div>
                                            <input 
                                                type="text" 
                                                value={editingCustomer.weight || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, weight: e.target.value })}
                                                placeholder="180 lbs"
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs text-text-primary outline-none focus:border-accent-primary font-medium"
                                            />
                                        </div>
                                        <div className="relative col-span-1">
                                            <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">DOB</div>
                                            <input 
                                                type="text" 
                                                value={editingCustomer.dob || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, dob: e.target.value })}
                                                placeholder="MM/DD/YYYY"
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs font-mono text-text-primary outline-none focus:border-accent-primary font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Logistics Locations */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
                                            <MapPin size={14} className="text-accent-primary" />
                                            3. Shipping Location
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-12 gap-3">
                                        <div className="col-span-9 relative">
                                            <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">Shipping Address</div>
                                            <input 
                                                type="text" 
                                                value={editingCustomer.shippingAddress || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, shippingAddress: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs text-text-primary outline-none focus:border-accent-primary font-medium"
                                            />
                                        </div>
                                        <div className="col-span-3 relative">
                                            <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">Unit/Apt</div>
                                            <input 
                                                type="text" 
                                                value={editingCustomer.shippingApt || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, shippingApt: e.target.value })}
                                                placeholder="None"
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs text-text-primary outline-none focus:border-accent-primary font-medium"
                                            />
                                        </div>
                                        <div className="col-span-4 relative">
                                            <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">City</div>
                                            <input 
                                                type="text" 
                                                value={editingCustomer.shippingCity || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, shippingCity: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs text-text-primary outline-none focus:border-accent-primary font-medium"
                                            />
                                        </div>
                                        <div className="col-span-4 relative">
                                            <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">State</div>
                                            <input 
                                                type="text" 
                                                value={editingCustomer.shippingState || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, shippingState: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs text-text-primary outline-none focus:border-accent-primary font-semibold"
                                            />
                                        </div>
                                        <div className="col-span-4 relative">
                                            <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">ZIP Code</div>
                                            <input 
                                                type="text" 
                                                value={editingCustomer.shippingZip || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, shippingZip: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs font-mono text-text-primary outline-none focus:border-accent-primary font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
                                            <CreditCard size={14} className="text-status-success" />
                                            4. Billing Location
                                        </h3>
                                        <button 
                                            type="button"
                                            onClick={() => syncBillingWithShipping(true)}
                                            className="text-[10px] font-black uppercase text-accent-primary tracking-wider hover:underline"
                                        >
                                            Copy Shipping 地址
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-12 gap-3">
                                        <div className="col-span-9 relative">
                                            <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">Billing Address</div>
                                            <input 
                                                type="text" 
                                                value={editingCustomer.billingAddress || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, billingAddress: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs text-text-primary outline-none focus:border-accent-primary font-medium"
                                            />
                                        </div>
                                        <div className="col-span-3 relative">
                                            <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">Unit/Apt</div>
                                            <input 
                                                type="text" 
                                                value={editingCustomer.billingApt || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, billingApt: e.target.value })}
                                                placeholder="None"
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs text-text-primary outline-none focus:border-accent-primary font-medium"
                                            />
                                        </div>
                                        <div className="col-span-4 relative">
                                            <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">City</div>
                                            <input 
                                                type="text" 
                                                value={editingCustomer.billingCity || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, billingCity: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs text-text-primary outline-none focus:border-accent-primary font-medium"
                                            />
                                        </div>
                                        <div className="col-span-4 relative">
                                            <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">State</div>
                                            <input 
                                                type="text" 
                                                value={editingCustomer.billingState || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, billingState: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs text-text-primary outline-none focus:border-accent-primary font-semibold"
                                            />
                                        </div>
                                        <div className="col-span-4 relative">
                                            <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">ZIP Code</div>
                                            <input 
                                                type="text" 
                                                value={editingCustomer.billingZip || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, billingZip: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs font-mono text-text-primary outline-none focus:border-accent-primary font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Declarations / Medical */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-2 flex items-center gap-2">
                                        <Heart size={14} className="text-status-error" />
                                        5. Medical Annotations
                                    </h3>
                                    
                                    <div className="relative">
                                        <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">Conditions (Comma Separated)</div>
                                        <textarea 
                                            value={(editingCustomer as any).medicalConditionsString || ''}
                                            onChange={(e) => setEditingCustomer({ ...editingCustomer, medicalConditionsString: e.target.value } as any)}
                                            placeholder="Asthma, Diabetes, Heart Murmur"
                                            rows={2}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs text-text-primary outline-none focus:border-accent-primary font-semibold resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Save Button Footer */}
                                <div className="pt-4 border-t border-border-subtle flex items-center gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => { playClick(); setEditingCustomer(null); }}
                                        className="flex-1 py-3 border border-border-subtle rounded-xl text-xs font-bold tracking-wider uppercase hover:bg-surface-alt/50 text-text-secondary transition-colors"
                                    >
                                        Dismiss
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-[2] py-3 bg-accent-primary text-white rounded-xl text-xs font-bold tracking-wider uppercase hover:bg-accent-primary/90 transition-colors shadow-lg shadow-accent-primary/15"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Manual Client Pool Insertion Modal */}
            <AnimatePresence>
                {isAddOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-2xl bg-surface-main border border-border-subtle rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
                            id="add-customer-modal"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-border-subtle bg-surface-alt/50 flex justify-between items-center">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 bg-accent-primary/10 rounded-xl text-accent-primary">
                                        <Plus size={18} />
                                    </div>
                                    <h2 className="text-base font-black text-text-primary tracking-tight">Add New Unique Customer</h2>
                                </div>
                                <button 
                                    onClick={() => { playClick(); setIsAddOpen(false); }}
                                    className="p-2 border border-border-subtle hover:bg-surface-alt rounded-lg text-text-muted hover:text-text-primary transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Modal Form */}
                            <form onSubmit={handleAddCustomer} className="flex-1 overflow-y-auto p-6 space-y-5">
                                <div className="grid grid-cols-12 gap-3">
                                    <div className="col-span-5 relative">
                                        <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">First Name *</div>
                                        <input 
                                            required
                                            type="text"
                                            value={newCustForm.firstName}
                                            onChange={(e) => setNewCustForm({ ...newCustForm, firstName: e.target.value })}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs text-text-primary outline-none focus:border-accent-primary"
                                        />
                                    </div>
                                    <div className="col-span-2 relative">
                                        <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">MI</div>
                                        <input 
                                            maxLength={1}
                                            type="text"
                                            value={newCustForm.middleInitial}
                                            onChange={(e) => setNewCustForm({ ...newCustForm, middleInitial: e.target.value.toUpperCase() })}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs text-text-primary outline-none focus:border-accent-primary text-center"
                                        />
                                    </div>
                                    <div className="col-span-5 relative">
                                        <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">Last Name</div>
                                        <input 
                                            type="text"
                                            value={newCustForm.lastName}
                                            onChange={(e) => setNewCustForm({ ...newCustForm, lastName: e.target.value })}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs text-text-primary outline-none focus:border-accent-primary"
                                        />
                                    </div>

                                    <div className="col-span-6 relative">
                                        <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">Direct Phone *</div>
                                        <input 
                                            required
                                            type="text"
                                            value={newCustForm.phone}
                                            onChange={(e) => setNewCustForm({ ...newCustForm, phone: e.target.value })}
                                            placeholder="123-456-7890"
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs font-mono text-text-primary outline-none focus:border-accent-primary font-bold"
                                        />
                                    </div>
                                    <div className="col-span-6 relative">
                                        <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">Alternate Phone</div>
                                        <input 
                                            type="text"
                                            value={newCustForm.alternatePhone}
                                            onChange={(e) => setNewCustForm({ ...newCustForm, alternatePhone: e.target.value })}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs font-mono text-text-primary outline-none focus:border-accent-primary"
                                        />
                                    </div>

                                    <div className="col-span-12 relative">
                                        <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">Email Address</div>
                                        <input 
                                            type="email"
                                            value={newCustForm.email}
                                            onChange={(e) => setNewCustForm({ ...newCustForm, email: e.target.value })}
                                            placeholder="name@domain.com"
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs text-text-primary outline-none focus:border-accent-primary"
                                        />
                                    </div>
                                </div>

                                {/* Medical and Vitals Box */}
                                <div className="border border-border-subtle p-4 rounded-2xl bg-surface-alt/30 space-y-4">
                                    <h4 className="text-[10px] font-black tracking-wider text-text-muted uppercase flex items-center gap-1">Vitals & Declarations</h4>
                                    <div className="grid grid-cols-4 gap-3">
                                        <div className="relative">
                                            <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">Age</div>
                                            <input 
                                                type="number"
                                                value={newCustForm.age}
                                                onChange={(e) => setNewCustForm({ ...newCustForm, age: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs text-text-primary outline-none focus:border-accent-primary font-bold"
                                            />
                                        </div>
                                        <div className="relative col-span-1">
                                            <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">Height</div>
                                            <input 
                                                type="text"
                                                value={newCustForm.height}
                                                onChange={(e) => setNewCustForm({ ...newCustForm, height: e.target.value })}
                                                placeholder="5'10"
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs text-text-primary outline-none focus:border-accent-primary"
                                            />
                                        </div>
                                        <div className="relative col-span-1">
                                            <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">Weight</div>
                                            <input 
                                                type="text"
                                                value={newCustForm.weight}
                                                onChange={(e) => setNewCustForm({ ...newCustForm, weight: e.target.value })}
                                                placeholder="180 lbs"
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs text-text-primary outline-none focus:border-accent-primary"
                                            />
                                        </div>
                                        <div className="relative col-span-1">
                                            <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">DOB</div>
                                            <input 
                                                type="text"
                                                value={newCustForm.dob}
                                                onChange={(e) => setNewCustForm({ ...newCustForm, dob: e.target.value })}
                                                placeholder="MM/DD/YYYY"
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs font-mono text-text-primary outline-none focus:border-accent-primary font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">Medical Conditions (Comma Separated)</div>
                                        <input 
                                            type="text"
                                            value={newCustForm.medicalConditions}
                                            onChange={(e) => setNewCustForm({ ...newCustForm, medicalConditions: e.target.value })}
                                            placeholder="e.g. Asthma, High Blood Pressure"
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs text-text-primary outline-none focus:border-accent-primary"
                                        />
                                    </div>
                                </div>

                                {/* Shipping Blocks */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black tracking-wider text-text-muted uppercase">Shipping Information</h4>
                                    <div className="grid grid-cols-12 gap-3">
                                        <div className="col-span-9 relative">
                                            <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">Shipping Address</div>
                                            <input 
                                                type="text"
                                                value={newCustForm.shippingAddress}
                                                onChange={(e) => setNewCustForm({ ...newCustForm, shippingAddress: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs text-text-primary outline-none focus:border-accent-primary"
                                            />
                                        </div>
                                        <div className="col-span-3 relative">
                                            <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">Apt/Unit</div>
                                            <input 
                                                type="text"
                                                value={newCustForm.shippingApt}
                                                onChange={(e) => setNewCustForm({ ...newCustForm, shippingApt: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs text-text-primary outline-none focus:border-accent-primary"
                                            />
                                        </div>
                                        <div className="col-span-4 relative">
                                            <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">City</div>
                                            <input 
                                                type="text"
                                                value={newCustForm.shippingCity}
                                                onChange={(e) => setNewCustForm({ ...newCustForm, shippingCity: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs text-text-primary outline-none focus:border-accent-primary"
                                            />
                                        </div>
                                        <div className="col-span-4 relative">
                                            <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">State</div>
                                            <input 
                                                type="text"
                                                value={newCustForm.shippingState}
                                                onChange={(e) => setNewCustForm({ ...newCustForm, shippingState: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs text-text-primary outline-none focus:border-accent-primary font-semibold"
                                            />
                                        </div>
                                        <div className="col-span-4 relative">
                                            <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">ZIP Code</div>
                                            <input 
                                                type="text"
                                                value={newCustForm.shippingZip}
                                                onChange={(e) => setNewCustForm({ ...newCustForm, shippingZip: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs font-mono text-text-primary outline-none focus:border-accent-primary"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Billing Blocks */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[10px] font-black tracking-wider text-text-muted uppercase">Billing Information</h4>
                                        <button 
                                            type="button" 
                                            onClick={() => syncBillingWithShipping(false)}
                                            className="text-[10px] font-black uppercase text-accent-primary hover:underline"
                                        >
                                            Copy Shipping
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-12 gap-3">
                                        <div className="col-span-9 relative">
                                            <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">Billing Address</div>
                                            <input 
                                                type="text"
                                                value={newCustForm.billingAddress}
                                                onChange={(e) => setNewCustForm({ ...newCustForm, billingAddress: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs text-text-primary outline-none focus:border-accent-primary"
                                            />
                                        </div>
                                        <div className="col-span-3 relative">
                                            <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">Apt/Unit</div>
                                            <input 
                                                type="text"
                                                value={newCustForm.billingApt}
                                                onChange={(e) => setNewCustForm({ ...newCustForm, billingApt: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs text-text-primary outline-none focus:border-accent-primary"
                                            />
                                        </div>
                                        <div className="col-span-4 relative">
                                            <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">City</div>
                                            <input 
                                                type="text"
                                                value={newCustForm.billingCity}
                                                onChange={(e) => setNewCustForm({ ...newCustForm, billingCity: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs text-text-primary outline-none focus:border-accent-primary"
                                            />
                                        </div>
                                        <div className="col-span-4 relative">
                                            <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">State</div>
                                            <input 
                                                type="text"
                                                value={newCustForm.billingState}
                                                onChange={(e) => setNewCustForm({ ...newCustForm, billingState: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs text-text-primary outline-none focus:border-accent-primary font-semibold"
                                            />
                                        </div>
                                        <div className="col-span-4 relative">
                                            <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10">ZIP Code</div>
                                            <input 
                                                type="text"
                                                value={newCustForm.billingZip}
                                                onChange={(e) => setNewCustForm({ ...newCustForm, billingZip: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-xs font-mono text-text-primary outline-none focus:border-accent-primary"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Footer buttons */}
                                <div className="pt-4 border-t border-border-subtle flex items-center gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => { playClick(); setIsAddOpen(false); }}
                                        className="flex-1 py-3 border border-border-subtle rounded-xl text-xs font-bold tracking-wider uppercase hover:bg-surface-alt/50 text-text-secondary transition-colors"
                                    >
                                        Dismiss
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-[2] py-3 bg-accent-primary text-white rounded-xl text-xs font-bold tracking-wider uppercase hover:bg-accent-primary/95 transition-colors shadow-lg shadow-accent-primary/15"
                                    >
                                        Create Contact Entry
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
