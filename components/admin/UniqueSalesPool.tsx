/* eslint-disable */
import React, { useState, useMemo, useCallback } from 'react';
import { useCRM } from '../../hooks/useCRM';
import { 
    Users, Search, Filter, ArrowUpDown, Edit3, Trash2, Plus, 
    X, MapPin, CreditCard, Mail, Phone, Heart, Activity, Check, 
    AlertCircle, Sparkles, Scale, Accessibility, FileText,
    ChevronDown, ChevronUp, RefreshCw, AlertTriangle, CheckCircle2,
    TrendingUp, Zap, Clock, ArrowUpRight, ShieldCheck, ShieldAlert,
    Upload, Link2, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Customer, Sale } from '../../types';
import { sfx } from '../../lib/soundService';
import { useSystem } from '../../hooks/useSystem';
import { useAuth } from '../../hooks/useAuth';
import { useBulkImport, CONTACT_MAPPABLES } from '../../hooks/useBulkImport';
import { useCustomerFilters } from '../../hooks/useCustomerFilters';
import { useCustomerMetrics } from '../../hooks/useCustomerMetrics';
import { parseSmartAddress } from '../../lib/addressParser';
import { parseFullName } from '../../lib/nameParser';
import { ImportPreviewModal } from './unique-sales-pool/ImportPreviewModal';
import { ImportResultsModal } from './unique-sales-pool/ImportResultsModal';
import { FileMapperModal } from './unique-sales-pool/FileMapperModal';
import { EditCustomerModal } from './unique-sales-pool/EditCustomerModal';
import { CustomerRow } from './unique-sales-pool/CustomerRow';
import { AddCustomerModal } from './unique-sales-pool/AddCustomerModal';

import { Save } from 'lucide-react';

export function parseImportRow(row: string[], headers: string[], columnMapping: Record<string, string>) {
    const safeIdx = (key: string) => columnMapping[key] ? headers.indexOf(columnMapping[key]) : -1;
    const phoneIdx = safeIdx('phone');
    if (phoneIdx === -1) return null;

    const rawPhone = row[phoneIdx];
    if (!rawPhone || !rawPhone.trim()) return null;
    const cleanPhone = String(rawPhone).replace(/\D/g, '');
    if (!cleanPhone) return null;

    let fn = safeIdx('firstName') !== -1 ? (row[safeIdx('firstName')] || '').trim() : '';
    let ln = safeIdx('lastName') !== -1 ? (row[safeIdx('lastName')] || '').trim() : '';
    
    // Smart Name Parser for un-separated names
    if (fn && !ln && fn.includes(' ')) {
        const parsedName = parseFullName(fn);
        fn = parsedName.firstName;
        ln = parsedName.lastName;
    }

    const email = safeIdx('email') !== -1 ? (row[safeIdx('email')] || '').trim() : '';
    const age = safeIdx('age') !== -1 ? Number(row[safeIdx('age')]) || undefined : undefined;
    const dob = safeIdx('dob') !== -1 ? (row[safeIdx('dob')] || '').trim() : '';

    let shippingAddress = safeIdx('shippingAddress') !== -1 ? (row[safeIdx('shippingAddress')] || '').trim() : '';
    let shippingCity = safeIdx('shippingCity') !== -1 ? (row[safeIdx('shippingCity')] || '').trim() : '';
    let shippingState = safeIdx('shippingState') !== -1 ? (row[safeIdx('shippingState')] || '').trim() : '';
    let shippingZip = safeIdx('shippingZip') !== -1 ? (row[safeIdx('shippingZip')] || '').trim() : '';

    let billingAddress = safeIdx('billingAddress') !== -1 ? (row[safeIdx('billingAddress')] || '').trim() : '';
    let billingCity = safeIdx('billingCity') !== -1 ? (row[safeIdx('billingCity')] || '').trim() : '';
    let billingState = safeIdx('billingState') !== -1 ? (row[safeIdx('billingState')] || '').trim() : '';
    let billingZip = safeIdx('billingZip') !== -1 ? (row[safeIdx('billingZip')] || '').trim() : '';

    // Smart Address Parser
    if (shippingAddress) {
        const parsed = parseSmartAddress(shippingAddress);
        if (parsed) {
            shippingAddress = parsed.street;
            if (!shippingCity) shippingCity = parsed.city;
            if (!shippingState) shippingState = parsed.state;
            if (!shippingZip) shippingZip = parsed.zip;
        }
    }
    if (billingAddress) {
        const parsed = parseSmartAddress(billingAddress);
        if (parsed) {
            billingAddress = parsed.street;
            if (!billingCity) billingCity = parsed.city;
            if (!billingState) billingState = parsed.state;
            if (!billingZip) billingZip = parsed.zip;
        }
    }

    const height = safeIdx('height') !== -1 ? (row[safeIdx('height')] || '').trim() : '';
    const weight = safeIdx('weight') !== -1 ? (row[safeIdx('weight')] || '').trim() : '';

    const parseList = (key: string) => {
        const idx = safeIdx(key);
        return idx !== -1 && row[idx] ? row[idx].split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    };

    const medList = parseList('medicalConditions');
    const crmList = parseList('crmTags');
    const leadList = parseList('leadSources');
    const pipeList = parseList('pipelineStages');

    const fullName = `${fn} ${ln}`.trim();

    return {
        rawPhone,
        cleanPhone,
        fn, ln, fullName, email,
        shippingAddress, shippingCity, shippingState, shippingZip,
        billingAddress, billingCity, billingState, billingZip,
        age, dob, height, weight,
        medList, crmList, leadList, pipeList
    };
}

interface SmartList {
    id: string;
    name: string;
    filters: {
        searchQuery: string;
        selectedState: string;
        selectedTag: string;
        selectedPipelineStage: string;
        daysSinceOrderFilter: string;
        selectedStatusFilter: string;
        sortBy: string;
        sortOrder: string;
    };
}

export const UniqueSalesPool: React.FC = () => {
    const { customers = [], updateCustomer, deleteCustomer, addCustomer, bulkAddCustomers, sales = [], logAudit, systemConfig } = useCRM();
    const { currentUser: agent } = useAuth();
    const { setToast } = useSystem();
    const { uniqueCustomers, customerDynamicMetrics } = useCustomerMetrics(customers, sales);
    
    const {
        searchQuery, setSearchQuery,
        selectedState, setSelectedState,
        selectedTag, setSelectedTag,
        selectedPipelineStage, setSelectedPipelineStage,
        daysSinceOrderFilter, setDaysSinceOrderFilter,
        sortBy, setSortBy,
        sortOrder, setSortOrder,
        selectedStatusFilter, setSelectedStatusFilter,
        allTags, allPipelineStages,
        filteredCustomers
    } = useCustomerFilters(uniqueCustomers, customerDynamicMetrics);

    const {
        fileInputRef,
        importConfig, setImportConfig,
        columnMapping, setColumnMapping,
        isProcessing, setIsProcessing,
        activeTab, setActiveTab,
        isDraggingOver,
        previewModalData, setPreviewModalData,
        importResults, setImportResults,
        handleFileChange, handleDragOver, handleDragLeave, handleDrop,
        autoMapColumns, dryRunAnalysis, executeContactImport, confirmContactImport
    } = useBulkImport(uniqueCustomers, sales, customerDynamicMetrics);

    // Smart Lists State
    const [smartLists, setSmartLists] = useState<SmartList[]>(() => {
        try {
            return JSON.parse(localStorage.getItem('crm_smart_lists_v1') || '[]');
        } catch { return []; }
    });
    const [activeSmartListId, setActiveSmartListId] = useState<string | null>(null);
    const [isSavingSmartList, setIsSavingSmartList] = useState(false);
    const [newSmartListName, setNewSmartListName] = useState('');

    const [expandedCustomers, setExpandedCustomers] = useState<Record<string, boolean>>({});

    const saveSmartList = () => {
        if (!newSmartListName.trim()) return;
        const newList: SmartList = {
            id: 'sl_' + Date.now(),
            name: newSmartListName.trim(),
            filters: {
                searchQuery,
                selectedState,
                selectedTag,
                selectedPipelineStage,
                daysSinceOrderFilter,
                selectedStatusFilter,
                sortBy,
                sortOrder
            }
        };
        const updated = [...smartLists, newList];
        setSmartLists(updated);
        localStorage.setItem('crm_smart_lists_v1', JSON.stringify(updated));
        setIsSavingSmartList(false);
        setNewSmartListName('');
        setActiveSmartListId(newList.id);
        playSuccess();
        setToast({ title: 'Smart List Saved', message: `Saved filter combination as "${newList.name}"`, type: 'success' });
    };

    const deleteSmartList = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = smartLists.filter(sl => sl.id !== id);
        setSmartLists(updated);
        localStorage.setItem('crm_smart_lists_v1', JSON.stringify(updated));
        if (activeSmartListId === id) setActiveSmartListId(null);
        playDecline();
    };

    const loadSmartList = (sl: SmartList) => {
        setSearchQuery(sl.filters.searchQuery || '');
        setSelectedState(sl.filters.selectedState || '');
        setSelectedTag(sl.filters.selectedTag || '');
        setSelectedPipelineStage(sl.filters.selectedPipelineStage || '');
        setDaysSinceOrderFilter((sl.filters.daysSinceOrderFilter as any) || 'all');
        setActiveSmartListId(null); setSelectedStatusFilter((sl.filters.selectedStatusFilter as any) || 'all');
        setSortBy((sl.filters.sortBy as any) || 'name');
        setSortOrder((sl.filters.sortOrder as any) || 'asc');
        setActiveSmartListId(sl.id);
        playClick();
    };
    
    const clearFilters = () => {
        setSearchQuery('');
        setSelectedState('');
        setSelectedTag('');
        setSelectedPipelineStage('');
        setDaysSinceOrderFilter('all');
        setActiveSmartListId(null); setSelectedStatusFilter('all');
        setActiveSmartListId(null);
        playClick();
    };
    
    // Handle export to CSV
    const handleExport = () => {
        const canExport = agent?.role === 'admin' ? 
            (systemConfig?.rbacMatrix?.admin?.exportLeads ?? true) : 
            (systemConfig?.rbacMatrix?.agent?.exportLeads ?? false);
        
        if (!canExport) {
            playDecline();
            setToast({
                title: 'RBAC: Action Blocked',
                message: `Your clearance level (${agent?.role || 'user'}) is strictly prohibited from exporting proprietary directory CSVs.`,
                type: 'error'
            });
            return;
        }
        
        playClick();
        
        const csvData = customers.map(c => ({
            ID: c.id,
            FirstName: c.firstName,
            LastName: c.lastName,
            Phone: c.phone,
            Email: c.email,
            Address: c.address,
            City: c.city,
            State: c.state,
            Zip: c.shippingZip,
            LTV: c.ltv,
            Tags: c.tags.join(' | '),
            PipelineStage: c.pipelineStages ? c.pipelineStages.join(', ') : ''
        }));
        
        import('../../utils/crmLogic').then(({ exportToCSV }) => {
             exportToCSV(csvData, 'Contacts_Export');
        });
        
        logAudit({
            action: 'EXPORT',
            details: `Exported ${customers.length} contacts to CSV.`,
            module: 'CRM'
        });
    };

    // UI details and modal states
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [isAddOpen, setIsAddOpen] = useState(false);



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

    // Unique States and Tags for filtering
    const allStates = useMemo(() => {
        const states = new Set<string>();
        uniqueCustomers.forEach(c => {
            if (c.shippingState) states.add(c.shippingState);
            if (c.billingState) states.add(c.billingState);
        });
        return Array.from(states).sort();
    }, [uniqueCustomers]);



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

    // Handle delete customer
    const handleDelete = async (id: string, name: string) => {
        const canDelete = agent?.role === 'admin' ? 
            (systemConfig?.rbacMatrix?.admin?.deleteLeads ?? true) : 
            (systemConfig?.rbacMatrix?.agent?.deleteLeads ?? false);
        
        if (!canDelete) {
            playDecline();
            setToast({
                title: 'RBAC: Action Blocked',
                message: `Your clearance level (${agent?.role || 'user'}) is strictly prohibited from permanently deleting registry entries.`,
                type: 'error'
            });
            return;
        }

        // if (window.confirm(`Are you absolutely sure you want to permanently delete customer "${name}"? This action is irreversible.`)) {
            playClick();
            try {
                await deleteCustomer(id);
                setToast({
                    title: 'Record Purged',
                    message: `Client ${name} was permanently removed from the central CRM directory.`,
                    type: 'error'
                });
                await logAudit({
                    action: 'DELETE',
                    details: `Permanently deleted customer: ${name}`,
                    module: 'CRM'
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
        // }
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
        }
    };

    // --- BULK TRANS-INGESTION CONTACTS PIPELINE ---


    return (
        <div 
            id="sales-pool-root" 
            className={`flex flex-col gap-3 p-3 min-h-[calc(100vh-60px)] bg-surface-main/30 rounded-xl border border-border-subtle animate-in fade-in duration-300 relative transition-colors ${isDraggingOver ? 'ring-2 ring-accent-primary bg-accent-primary/5' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {isDraggingOver && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-surface-main/80  rounded-xl border-2 border-dashed border-accent-primary">
                    <div className="flex flex-col items-center gap-4 text-accent-primary">
                        <Upload size={48} className="animate-bounce" />
                        <h2 className="text-2xl font-bold tracking-tight">Drop CSV to Import</h2>
                    </div>
                </div>
            )}
            {/* Header Section */}
            <div id="sales-pool-header" className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                    <h1 className="text-lg font-bold text-text-primary tracking-tight flex items-center gap-2">
                        <Users className="text-accent-primary" size={20} />
                        Unique Customer Sales Pool
                    </h1>
                    <p className="text-sm text-text-muted mt-0.5 font-medium">
                        Root Super Admin database of distinct customer profiles. Duplicate phone registrations are automatically converged.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <input 
                        ref={fileInputRef} 
                        type="file" 
                        className="hidden" 
                        accept=".csv" 
                        onChange={handleFileChange} 
                    />
                    <button 
                        onClick={() => { playClick(); fileInputRef.current?.click(); }}
                        className="px-3 py-1.5 bg-surface-alt hover:bg-surface-main hover:text-text-primary text-text-muted border border-border-subtle rounded-lg text-sm font-bold tracking-wider uppercase transition-all flex items-center gap-1.5"
                        id="btn-import-contacts-bulk"
                    >
                        <Upload size={12} /> Bulk Import
                    </button>
                    <button 
                        onClick={handleExport}
                        className="px-3 py-1.5 bg-surface-alt hover:bg-surface-main hover:text-text-primary text-text-muted border border-border-subtle rounded-lg text-sm font-bold tracking-wider uppercase transition-all flex items-center gap-1.5"
                        id="btn-export-contacts-csv"
                    >
                        <Upload size={12} className="rotate-180" /> Export CSV
                    </button>
                    <button 
                        onClick={() => { playClick(); setIsAddOpen(true); }}
                        className="px-3 py-1.5 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-lg text-sm font-bold tracking-wider uppercase transition-all shadow-md shadow-accent-primary/20 flex items-center gap-1.5"
                        id="btn-add-unique-customer"
                    >
                        <Plus size={14} /> Add Unique Record
                    </button>
                </div>
            </div>

            {/* Live Synchronizing Feed Banner */}
            <div className="bg-surface-main/80  border border-border-strong/10 rounded-xl p-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 overflow-hidden shadow-sm relative before:absolute before:top-0 before:left-0 before:bottom-0 before:w-1 before:bg-accent-primary">
                <div className="flex items-center gap-3">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-status-success"></span>
                    </span>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold uppercase tracking-wide text-text-primary">LIVE CRM OUTCOME FEED</span>
                        <span className="text-sm text-text-muted">Auto-stitch active • Subscribed to real-time sales events</span>
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
                                    className="flex items-center gap-2 text-sm font-semibold w-full"
                                >
                                    <span className="font-mono text-text-muted">{new Date(latestSale.timestamp || Date.now()).toLocaleTimeString()}</span>
                                    <span className="font-bold text-text-primary">{latestSale.firstName} {latestSale.lastName ? latestSale.lastName[0] : ''}.</span>
                                    <span className="text-text-muted">processed</span>
                                    <span className="font-bold">{latestSale.product}</span>
                                    <span className="text-text-muted">—</span>
                                    <span className={`px-1.5 py-0.2 rounded text-sm font-bold uppercase shrink-0 ${isApp ? 'bg-status-success/15 text-status-success border border-status-success/20' : isDec ? 'bg-status-error/15 text-status-error border border-status-error/20' : 'bg-status-warning/15 text-status-warning border border-status-warning/20'}`}>
                                        {latestSale.status}: ${latestSale.amount}
                                    </span>
                                </motion.div>
                            );
                        })}
                        {sales.length === 0 && (
                            <span className="text-sm text-text-muted italic">Waiting for incoming sales ledger activity...</span>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex gap-4 shrink-0 font-mono text-sm font-bold text-text-secondary">
                    <div>Gross Rev: <span className="text-status-success font-bold">${stats.totalLtv.toLocaleString()}</span></div>
                    <div>Approved Orders: <span className="text-accent-primary font-bold">{stats.totalApprovedCount}</span></div>
                    <div>Declined: <span className="text-status-error font-bold">{stats.totalDeclinedCount}</span></div>
                </div>
            </div>

            {/* Admin Level 10 Badge Indicators */}
            <div id="sales-pool-kpi-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <div className="bg-surface-main border border-border-subtle p-3 rounded-xl shadow-sm flex flex-col justify-between">
                    <span className="text-sm font-bold tracking-wide text-text-muted uppercase flex items-center gap-1"><Users size={12} className="text-accent-primary"/> TOTAL UNIQUE CONTACTS</span>
                    <h3 className="text-xl font-bold text-text-primary mt-1.5">{stats.total}</h3>
                    <span className="text-sm text-status-success font-semibold mt-0.5">▲ Unified Directory</span>
                </div>
                <div className="bg-surface-main border border-border-subtle p-3 rounded-xl shadow-sm flex flex-col justify-between font-medium">
                    <span className="text-sm font-bold tracking-wide text-text-muted uppercase flex items-center gap-1"><CreditCard size={12} className="text-accent-primary"/> AVERAGE LTV</span>
                    <h3 className="text-xl font-bold text-text-primary mt-1.5">${stats.avgLtv}</h3>
                    <span className="text-sm text-text-muted mt-0.5">Per active profile</span>
                </div>
                <div className="bg-surface-main border border-border-subtle p-3 rounded-xl shadow-sm flex flex-col justify-between">
                    <span className="text-sm font-bold tracking-wide text-text-muted uppercase flex items-center gap-1"><Activity size={12} className="text-accent-primary"/> COMPLETENESS RATE</span>
                    <h3 className="text-xl font-bold text-text-primary mt-1.5">{stats.completenessRate}%</h3>
                    <div className="w-full bg-border-subtle h-1 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-accent-primary h-full rounded-full transition-all duration-500" style={{ width: `${stats.completenessRate}%` }} />
                    </div>
                </div>
                <div className="bg-surface-main border border-border-subtle p-3 rounded-xl shadow-sm flex flex-col justify-between">
                    <span className="text-sm font-bold tracking-wide text-text-muted uppercase flex items-center gap-1"><Sparkles size={12} className="text-status-warning"/> VIP ACCOUNTS</span>
                    <h3 className="text-xl font-bold text-text-primary mt-1.5">{stats.vipCount}</h3>
                    <span className="text-sm text-status-warning font-semibold mt-0.5">★ LTV exceeds $1,000</span>
                </div>
            </div>

            {/* SMART LISTS NAV BAR */}
            {smartLists.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wide text-text-muted flex items-center gap-1 ml-1 mr-2"><Filter size={12}/> SMART LISTS:</span>
                    {smartLists.map(sl => (
                        <div key={sl.id} className="relative group">
                            <button
                                onClick={() => loadSmartList(sl)}
                                className={`pl-3 pr-8 py-1.25 rounded-lg text-sm font-bold tracking-wider transition-all ${activeSmartListId === sl.id ? 'bg-accent-primary text-white shadow-md' : 'bg-surface-main border border-border-subtle text-text-secondary hover:bg-surface-alt hover:text-text-primary'}`}
                            >
                                {sl.name}
                            </button>
                            <button 
                                onClick={(e) => deleteSmartList(sl.id, e)}
                                className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full transition-opacity ${activeSmartListId === sl.id ? 'text-white/70 hover:text-white hover:bg-black/20' : 'text-text-muted hover:text-status-danger hover:bg-status-danger/10 opacity-0 group-hover:opacity-100'}`}
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                    {activeSmartListId && (
                        <button onClick={clearFilters} className="text-xs font-bold uppercase tracking-wider text-text-muted hover:text-text-primary transition-colors ml-2 underline decoration-text-muted/30 underline-offset-4">
                            Clear View
                        </button>
                    )}
                </div>
            )}

            {/* Realtime Outcome Quick-Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-surface-main/40 border border-border-subtle p-1.5 rounded-xl">
                <div className="flex flex-wrap items-center gap-1.5">
                <button
                    onClick={() => { playClick(); setActiveSmartListId(null); setSelectedStatusFilter('all'); }}
                    className={`px-4 py-1.5 rounded-xl text-sm font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${selectedStatusFilter === 'all' ? 'bg-accent-primary text-white shadow-sm' : 'text-text-secondary hover:bg-surface-alt/80'}`}
                >
                    <Users size={13} />
                    All ({uniqueCustomers.length})
                </button>
                <button
                    onClick={() => { playClick(); setActiveSmartListId(null); setSelectedStatusFilter('approved'); }}
                    className={`px-4 py-1.5 rounded-xl text-sm font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${selectedStatusFilter === 'approved' ? 'bg-status-success/20 text-status-success border border-status-success/30 shadow-sm font-bold' : 'text-text-secondary hover:bg-surface-alt/80'}`}
                >
                    <CheckCircle2 size={13} />
                    Approved Accounts ({uniqueCustomers.filter(c => (customerDynamicMetrics.get(c.id)?.ltv ?? 0) > 0).length})
                </button>
                <button
                    onClick={() => { playClick(); setActiveSmartListId(null); setSelectedStatusFilter('declined'); }}
                    className={`px-4 py-1.5 rounded-xl text-sm font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${selectedStatusFilter === 'declined' ? 'bg-status-error/20 text-status-error border border-status-error/30 shadow-sm font-bold' : 'text-text-secondary hover:bg-surface-alt/80'}`}
                >
                    <AlertTriangle size={13} />
                    payment Decline List ({uniqueCustomers.filter(c => (customerDynamicMetrics.get(c.id)?.declineCount ?? 0) > 0).length})
                </button>
                <button
                    onClick={() => { playClick(); setActiveSmartListId(null); setSelectedStatusFilter('incomplete'); }}
                    className={`px-4 py-1.5 rounded-xl text-sm font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${selectedStatusFilter === 'incomplete' ? 'bg-status-warning/20 text-status-warning border border-status-warning/30 shadow-sm font-bold' : 'text-text-secondary hover:bg-surface-alt/80'}`}
                >
                    <Activity size={13} />
                    Incomplete Bios ({uniqueCustomers.filter(c => !(c.firstName && c.lastName && c.phone && c.email && c.shippingAddress && c.billingAddress && c.age && c.dob)).length})
                </button>
                <button
                    onClick={() => { playClick(); setActiveSmartListId(null); setSelectedStatusFilter('cold'); }}
                    className={`px-4 py-1.5 rounded-xl text-sm font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${selectedStatusFilter === 'cold' ? 'bg-surface-alt text-text-muted border border-border-subtle' : 'text-text-secondary hover:bg-surface-alt/80'}`}
                >
                    <Clock size={13} />
                    Cold Leads ({uniqueCustomers.filter(c => (customerDynamicMetrics.get(c.id)?.sales.length ?? 0) === 0).length})
                </button>
                <div className="w-[1px] h-6 bg-border-subtle mx-1" />
                <button
                    onClick={() => { playClick(); setActiveSmartListId(null); setSelectedStatusFilter('upsell'); }}
                    className={`px-4 py-1.5 rounded-xl text-sm font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${selectedStatusFilter === 'upsell' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30 shadow-sm font-bold' : 'text-text-secondary hover:bg-surface-alt/80'}`}
                >
                    <ArrowUpRight size={13} />
                    Upsell Cycle
                </button>
                <button
                    onClick={() => { playClick(); setActiveSmartListId(null); setSelectedStatusFilter('reorder'); }}
                    className={`px-4 py-1.5 rounded-xl text-sm font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${selectedStatusFilter === 'reorder' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 shadow-sm font-bold' : 'text-text-secondary hover:bg-surface-alt/80'}`}
                >
                    <RefreshCw size={13} />
                    Ready Reorders
                </button>
                <button
                    onClick={() => { playClick(); setActiveSmartListId(null); setSelectedStatusFilter('winback'); }}
                    className={`px-4 py-1.5 rounded-xl text-sm font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${selectedStatusFilter === 'winback' ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30 shadow-sm font-bold' : 'text-text-secondary hover:bg-surface-alt/80'}`}
                >
                    <Heart size={13} />
                    Winback
                </button>
                </div>
                
                <div className="relative pr-1">
                    {isSavingSmartList ? (
                        <div className="flex items-center gap-1 bg-surface-main p-1 rounded-lg border border-accent-primary/30">
                            <input 
                                autoFocus
                                type="text" 
                                value={newSmartListName}
                                onChange={e => setNewSmartListName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && saveSmartList()}
                                placeholder="Name this view..."
                                className="bg-transparent border-none outline-none text-sm font-bold w-[140px] px-2 text-text-primary placeholder:text-text-muted/50"
                            />
                            <button onClick={saveSmartList} className="p-1 bg-accent-primary text-white rounded hover:bg-accent-secondary"><Save size={14}/></button>
                            <button onClick={() => setIsSavingSmartList(false)} className="p-1 text-text-muted hover:text-status-danger"><X size={14}/></button>
                        </div>
                    ) : (
                        <button onClick={() => { playClick(); setIsSavingSmartList(true); }} className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-accent-primary hover:bg-accent-primary/10 rounded-lg transition-colors flex items-center gap-1.5 border border-accent-primary/20">
                            <Save size={12}/> Save View
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Panel / Query Controls */}
            <div id="sales-pool-filters" className="p-2 bg-surface-main border border-border-subtle rounded-xl flex flex-col lg:flex-row items-center gap-2">
                <div className="relative w-full lg:flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                    <input 
                        type="text"
                        placeholder="Search by first/last/middle name, phone, email, alternative phone, state, or medical condition..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setActiveSmartListId(null); }}
                        className="w-full bg-surface-alt border border-border-subtle rounded-lg pl-8 pr-3 py-1.5 text-sm text-text-primary outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/20 transition-all font-medium"
                    />
                </div>
                
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                    <div className="relative">
                        <select
                            value={selectedState}
                            onChange={(e) => { setSelectedState(e.target.value); setActiveSmartListId(null); }}
                            className="bg-surface-alt border border-border-subtle rounded-lg px-2 py-1.5 text-sm font-semibold text-text-primary outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/20 transition-all cursor-pointer appearance-none min-w-[100px]"
                        >
                            <option value="">All States</option>
                            {allStates.map(st => <option key={st} value={st}>{st}</option>)}
                        </select>
                    </div>

                    <div className="relative">
                        <select
                            value={selectedTag}
                            onChange={(e) => { setSelectedTag(e.target.value); setActiveSmartListId(null); }}
                            className="bg-surface-alt border border-border-subtle rounded-lg px-2 py-1.5 text-sm font-semibold text-text-primary outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/20 transition-all cursor-pointer appearance-none min-w-[120px]"
                        >
                            <option value="">All Tags/Medications</option>
                            {allTags.map(tg => <option key={tg} value={tg}>{tg}</option>)}
                        </select>
                    </div>

                    <div className="relative">
                        <select
                            value={selectedPipelineStage}
                            onChange={(e) => { setSelectedPipelineStage(e.target.value); setActiveSmartListId(null); }}
                            className="bg-surface-alt border border-border-subtle rounded-lg px-2 py-1.5 text-sm font-semibold text-text-primary outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/20 transition-all cursor-pointer appearance-none min-w-[120px]"
                        >
                            <option value="">All Pipeline Stages</option>
                            {allPipelineStages.map(ps => <option key={ps} value={ps}>{ps}</option>)}
                        </select>
                    </div>

                    <div className="relative">
                        <select
                            value={daysSinceOrderFilter}
                            onChange={(e) => { setDaysSinceOrderFilter(e.target.value as any); setActiveSmartListId(null); }}
                            className="bg-surface-alt border border-border-subtle rounded-lg px-2 py-1.5 text-sm font-semibold text-text-primary outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/20 transition-all cursor-pointer appearance-none min-w-[120px]"
                        >
                            <option value="all">Any Order Age</option>
                            <option value="14">&gt; 14 days ago</option>
                            <option value="30">&gt; 30 days ago</option>
                            <option value="60">&gt; 60 days ago</option>
                            <option value="90">&gt; 90 days ago</option>
                            <option value="never">Never ordered</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-1 border border-border-subtle col-span-1 rounded-lg p-0.5 bg-surface-alt">
                        <button 
                            type="button" 
                            onClick={() => { playClick(); setSortBy('name'); }} 
                            className={`px-3 py-1 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${sortBy === 'name' ? 'bg-accent-primary text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                        >
                            Name
                        </button>
                        <button 
                            type="button" 
                            onClick={() => { playClick(); setSortBy('ltv'); }} 
                            className={`px-3 py-1 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${sortBy === 'ltv' ? 'bg-accent-primary text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                        >
                            LTV
                        </button>
                        <button 
                            type="button" 
                            onClick={() => { playClick(); setSortBy('date'); }} 
                            className={`px-3 py-1 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${sortBy === 'date' ? 'bg-accent-primary text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                        >
                            Added
                        </button>
                    </div>

                    <button
                        onClick={() => { playClick(); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                        className="p-1.5 border border-border-subtle bg-surface-alt rounded-lg hover:bg-border-subtle text-text-secondary transition-colors"
                        title="Invert Sort Order"
                    >
                        <ArrowUpDown size={14} />
                    </button>
                </div>
            </div>

            {/* Main Table View */}
            <div id="sales-pool-table-container" className="bg-surface-main border border-border-subtle rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col min-h-0">
                <div className="overflow-x-auto w-full flex-1 relative">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-10 bg-surface-main">
                            <tr className="border-b border-border-subtle bg-surface-alt text-sm font-bold tracking-wide text-text-muted uppercase h-8">
                                <th className="px-3 py-1.5">Client Identifiers</th>
                                <th className="px-3 py-1.5">Direct Contact</th>
                                <th className="px-3 py-1.5">Vital Statistics</th>
                                <th className="px-3 py-1.5">Profile & Taxonomy</th>
                                <th className="px-3 py-1.5">Billing & Shipping Locations</th>
                                <th className="px-3 py-1.5 text-right">LTV Metric</th>
                                <th className="px-3 py-1.5 text-center">Maintenance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle text-sm">
                            {filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-3 py-4 text-center text-text-muted font-semibold">
                                        <div className="flex flex-col items-center gap-2">
                                            <AlertCircle size={24} className="text-text-muted" />
                                            <span>No matches found in the unique customer directory.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredCustomers.map(customer => (
                                    <CustomerRow 
                                        key={customer.id}
                                        customer={customer}
                                        metrics={customerDynamicMetrics.get(customer.id)}
                                        isExpanded={!!expandedCustomers[customer.id]}
                                        toggleRow={toggleRow}
                                        setEditingCustomer={setEditingCustomer}
                                        handleDelete={handleDelete}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit / Detail Slider Form */}
            <EditCustomerModal 
                editingCustomer={editingCustomer}
                setEditingCustomer={setEditingCustomer}
            />

            {/* Manual Client Pool Insertion Modal */}
            <AddCustomerModal 
                isAddOpen={isAddOpen}
                setIsAddOpen={setIsAddOpen}
                uniqueCustomers={uniqueCustomers}
            />

            {/* Bulk Contact Ingestion Nexus (Import Wizard) */}
            <FileMapperModal
                importConfig={importConfig}
                setImportConfig={setImportConfig}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                autoMapColumns={autoMapColumns}
                columnMapping={columnMapping}
                setColumnMapping={setColumnMapping}
                dryRunAnalysis={dryRunAnalysis}
                executeContactImport={executeContactImport}
                isProcessing={isProcessing}
                playClick={playClick}
                CONTACT_MAPPABLES={CONTACT_MAPPABLES}
            />

            {/* Import Preview Modal */}
            <ImportPreviewModal
                previewModalData={previewModalData}
                setPreviewModalData={setPreviewModalData}
                confirmContactImport={confirmContactImport}
                isProcessing={isProcessing}
                playClick={playClick}
            />

            {/* Import Results Ledger (Post-Ingestion) */}
            <ImportResultsModal
                importResults={importResults}
                setImportResults={setImportResults}
                playClick={playClick}
            />
        </div>
    );
};
