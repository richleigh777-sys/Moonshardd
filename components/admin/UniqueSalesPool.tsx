/* eslint-disable */
import React, { useState, useMemo, useCallback } from 'react';
import { useCRM } from '../../hooks/useCRM';
import { 
    Users, Search, Filter, ArrowUpDown, Edit3, Trash2, Plus, 
    X, MapPin, CreditCard, Mail, Phone, Heart, Activity, Check, 
    AlertCircle, Sparkles, Scale, Accessibility, FileText,
    ChevronDown, ChevronUp, RefreshCw, AlertTriangle, CheckCircle2,
    TrendingUp, Zap, Clock, ArrowUpRight, ShieldCheck, ShieldAlert,
    Upload, Download, Link2, Layers, ChevronLeft, ChevronRight
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

import { ScrollControls } from '../widgets/sales-ledger/ScrollControls';

export const UniqueSalesPool: React.FC = () => {
    const { customers = [], updateCustomer, deleteCustomer, addCustomer, bulkAddCustomers, sales = [], logAudit, systemConfig } = useCRM();
    const { currentUser: agent } = useAuth();
    const isSuperAdmin = agent?.role === 'admin' || agent?.level === 10;
    const { setToast } = useSystem();
    const containerRef = React.useRef<HTMLDivElement>(null);
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

    // Pagination State
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 100; // Can be configurable later if needed

    // Reset to page 1 when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedState, selectedTag, selectedPipelineStage, daysSinceOrderFilter, sortBy, sortOrder, selectedStatusFilter]);

    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
    const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Smart Lists State
    const [smartLists, setSmartLists] = useState<SmartList[]>([]);
    
    React.useEffect(() => {
        const fetchSmartLists = async () => {
            try {
                const res = await fetch('/api/collections/smart_lists', {
                    headers: {
                        'X-User-ID': agent?.id || 'sys_root',
                        'X-User-Level': String(agent?.role === 'admin' ? 10 : 1),
                        'X-Tenant-ID': 'srv-001'
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.data) {
                        setSmartLists(data.data.map((d: any) => d.data || d));
                    }
                }
            } catch (err) {
                console.error("Failed to fetch smart lists", err);
            }
        };
        fetchSmartLists();
    }, [agent]);
    const [activeSmartListId, setActiveSmartListId] = useState<string | null>(null);
    const [isSavingSmartList, setIsSavingSmartList] = useState(false);
    const [newSmartListName, setNewSmartListName] = useState('');

    const [expandedCustomers, setExpandedCustomers] = useState<Record<string, boolean>>({});

    const saveSmartList = async () => {
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
        
        try {
            await fetch('/api/collections/smart_lists', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-ID': agent?.id || 'sys_root',
                    'X-User-Level': String(agent?.role === 'admin' ? 10 : 1),
                    'X-Tenant-ID': 'srv-001'
                },
                body: JSON.stringify({ id: newList.id, ...newList })
            });
        } catch (err) {
            console.error(err);
        }
        
        setIsSavingSmartList(false);
        setNewSmartListName('');
        setActiveSmartListId(newList.id);
        playSuccess();
        setToast({ title: 'Smart List Saved', message: `Saved filter combination as "${newList.name}"`, type: 'success' });
    };

    const deleteSmartList = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = smartLists.filter(sl => sl.id !== id);
        setSmartLists(updated);
        
        try {
            await fetch(`/api/collections/smart_lists/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-User-ID': agent?.id || 'sys_root',
                    'X-User-Level': String(agent?.role === 'admin' ? 10 : 1),
                    'X-Tenant-ID': 'srv-001'
                }
            });
        } catch (err) {
            console.error(err);
        }
        
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
            className={`flex flex-col gap-2 p-2 flex-1 w-full min-h-0 bg-surface-main/30 rounded-xl border border-border-subtle animate-in fade-in duration-300 relative transition-colors overflow-hidden ${isDraggingOver ? 'ring-2 ring-accent-primary bg-accent-primary/5' : ''}`}
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
            {/* Unified Header & Analytics Bar */}
            <div className="flex flex-col gap-2 shrink-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-2 bg-surface-main border border-border-subtle rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                        <h1 className="text-lg font-bold text-text-primary tracking-tight flex items-center gap-2">
                            <Users className="text-accent-primary" size={20} /> Sales Pool
                        </h1>
                        <div className="w-[1px] h-6 bg-border-subtle hidden md:block" />
                        <div className="hidden md:flex items-center gap-4 text-xs font-bold text-text-muted">
                            <span className="flex items-center gap-1"><Users size={12}/> {stats.total} Contacts</span>
                            <span className="flex items-center gap-1"><CreditCard size={12}/> LTV: <span className="text-status-success">${stats.avgLtv}</span></span>
                            <span className="flex items-center gap-1"><Sparkles size={12}/> VIP: <span className="text-status-warning">{stats.vipCount}</span></span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isSuperAdmin && (
                            <>
                                <button
                                    onClick={() => { playClick(); fileInputRef.current?.click(); }}
                                    className="px-3 py-1.5 bg-surface-alt hover:bg-border-subtle border border-border-subtle text-text-secondary rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                                >
                                    <Upload size={14} /> Import
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv,.xlsx,.xls" />
                                <button
                                    onClick={handleExport}
                                    className="px-3 py-1.5 bg-surface-alt hover:bg-border-subtle border border-border-subtle text-text-secondary rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                                >
                                    <Download size={14} /> Export
                                </button>
                            </>
                        )}
                        <button 
                            id="btn-add-unique-customer"
                            onClick={() => { playClick(); setIsAddOpen(true); }}
                            className="px-3 py-1.5 bg-accent-primary hover:bg-accent-secondary text-white rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                        >
                            <Plus size={14} /> Add Record
                        </button>
                    </div>
                </div>

                {/* Filter & Smart Lists Row */}
                <div className="flex flex-col lg:flex-row gap-2">
                    <div className="flex-1 flex flex-col md:flex-row items-center gap-2 bg-surface-main border border-border-subtle rounded-xl p-2 shadow-sm min-w-0">
                        <div className="relative w-full md:w-64 shrink-0">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                            <input 
                                type="text"
                                placeholder="Search contacts..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setActiveSmartListId(null); }}
                                className="w-full bg-surface-alt border border-border-subtle rounded-lg pl-8 pr-3 py-1.5 text-sm text-text-primary outline-none focus:border-accent-primary focus:ring-1 transition-all"
                            />
                        </div>
                        
                        <div className="flex-1 flex items-center gap-2 overflow-x-auto ledger-scrollbar pb-1 md:pb-0 min-w-0">
                            {/* Smart Lists */}
                            {smartLists.map(sl => (
                                <div key={sl.id} className="relative group shrink-0 flex items-center">
                                    <button
                                        onClick={() => loadSmartList(sl)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-bold tracking-wider transition-all ${activeSmartListId === sl.id ? 'bg-accent-primary text-white shadow-md' : 'bg-surface-alt border border-border-subtle text-text-secondary hover:text-text-primary'}`}
                                    >
                                        {sl.name}
                                    </button>
                                    <button 
                                        onClick={(e) => deleteSmartList(sl.id, e)}
                                        className={`absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded-full transition-opacity ${activeSmartListId === sl.id ? 'text-white/70 hover:text-white' : 'text-text-muted hover:text-status-danger opacity-0 group-hover:opacity-100'}`}
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                            ))}
                            {smartLists.length > 0 && <div className="w-[1px] h-4 bg-border-subtle shrink-0" />}

                            {/* Quick Filters */}
                            <button onClick={() => { playClick(); setActiveSmartListId(null); setSelectedStatusFilter('all'); }} className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${selectedStatusFilter === 'all' ? 'bg-accent-primary/20 text-accent-primary' : 'bg-surface-alt text-text-secondary hover:text-text-primary'}`}>All</button>
                            <button onClick={() => { playClick(); setActiveSmartListId(null); setSelectedStatusFilter('approved'); }} className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${selectedStatusFilter === 'approved' ? 'bg-status-success/20 text-status-success' : 'bg-surface-alt text-text-secondary hover:text-text-primary'}`}>Approved</button>
                            <button onClick={() => { playClick(); setActiveSmartListId(null); setSelectedStatusFilter('declined'); }} className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${selectedStatusFilter === 'declined' ? 'bg-status-error/20 text-status-error' : 'bg-surface-alt text-text-secondary hover:text-text-primary'}`}>Declined</button>
                            <button onClick={() => { playClick(); setActiveSmartListId(null); setSelectedStatusFilter('incomplete'); }} className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${selectedStatusFilter === 'incomplete' ? 'bg-status-warning/20 text-status-warning' : 'bg-surface-alt text-text-secondary hover:text-text-primary'}`}>Incomplete</button>
                        </div>
                        
                        {/* Save View */}
                        <div className="shrink-0 ml-auto flex items-center gap-1">
                            {isSavingSmartList ? (
                                <div className="flex items-center gap-1 bg-surface-alt p-1 rounded border border-accent-primary/30">
                                    <input autoFocus type="text" value={newSmartListName} onChange={e => setNewSmartListName(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveSmartList()} placeholder="Name..." className="bg-transparent border-none outline-none text-xs w-20 text-text-primary" />
                                    <button onClick={saveSmartList} className="text-accent-primary hover:text-white"><Save size={12}/></button>
                                    <button onClick={() => setIsSavingSmartList(false)} className="text-status-danger hover:text-white"><X size={12}/></button>
                                </div>
                            ) : (
                                <button onClick={() => { playClick(); setIsSavingSmartList(true); }} className="p-1.5 text-accent-primary hover:bg-accent-primary/10 rounded border border-accent-primary/20" title="Save View"><Save size={14}/></button>
                            )}
                            {activeSmartListId && (
                                <button onClick={clearFilters} className="text-xs font-bold uppercase tracking-wider text-text-muted hover:text-text-primary transition-colors ml-2 underline decoration-text-muted/30 underline-offset-4">
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 bg-surface-main border border-border-subtle rounded-xl p-2 shadow-sm shrink-0">
                        <select value={selectedState} onChange={(e) => { setSelectedState(e.target.value); setActiveSmartListId(null); }} className="bg-surface-alt border border-border-subtle rounded-lg px-2 py-1.5 text-xs font-bold outline-none cursor-pointer">
                            <option value="">States</option>
                            {allStates.map(st => <option key={st} value={st}>{st}</option>)}
                        </select>
                        <select value={selectedTag} onChange={(e) => { setSelectedTag(e.target.value); setActiveSmartListId(null); }} className="bg-surface-alt border border-border-subtle rounded-lg px-2 py-1.5 text-xs font-bold outline-none cursor-pointer w-24 truncate">
                            <option value="">Tags</option>
                            {allTags.map(tg => <option key={tg} value={tg}>{tg}</option>)}
                        </select>
                        <select value={selectedPipelineStage} onChange={(e) => { setSelectedPipelineStage(e.target.value); setActiveSmartListId(null); }} className="bg-surface-alt border border-border-subtle rounded-lg px-2 py-1.5 text-xs font-bold outline-none cursor-pointer w-24 truncate">
                            <option value="">Pipeline</option>
                            {allPipelineStages.map(ps => <option key={ps} value={ps}>{ps}</option>)}
                        </select>
                        
                        <div className="w-[1px] h-4 bg-border-subtle hidden md:block" />
                        
                        <div className="flex items-center bg-surface-alt rounded-lg border border-border-subtle p-0.5">
                            <button onClick={() => { playClick(); setSortBy('name'); }} className={`px-2 py-1 rounded text-xs font-bold uppercase transition-all ${sortBy === 'name' ? 'bg-accent-primary text-white' : 'text-text-muted hover:text-text-primary'}`}>N</button>
                            <button onClick={() => { playClick(); setSortBy('ltv'); }} className={`px-2 py-1 rounded text-xs font-bold uppercase transition-all ${sortBy === 'ltv' ? 'bg-accent-primary text-white' : 'text-text-muted hover:text-text-primary'}`}>$</button>
                            <button onClick={() => { playClick(); setSortBy('date'); }} className={`px-2 py-1 rounded text-xs font-bold uppercase transition-all ${sortBy === 'date' ? 'bg-accent-primary text-white' : 'text-text-muted hover:text-text-primary'}`}>D</button>
                        </div>
                        <button onClick={() => { playClick(); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }} className="p-1 border border-border-subtle bg-surface-alt rounded hover:bg-border-subtle text-text-secondary transition-colors" title="Invert Sort Order">
                            <ArrowUpDown size={14} />
                        </button>
                    </div>
                </div>
            </div>            <div id="sales-pool-table-container" className="bg-surface-main border border-border-subtle rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col min-h-0 relative">
                <ScrollControls containerRef={containerRef} />
                <div ref={containerRef} className="overflow-auto ledger-scrollbar w-full flex-1 relative">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-30 bg-surface-main">
                            <tr className="border-b border-border-subtle bg-surface-alt text-sm font-bold tracking-wide text-text-muted uppercase h-8">
                                <th className="sticky left-0 z-40 bg-surface-alt px-3 py-1.5 shadow-[1px_0_0_var(--border-subtle)] min-w-[300px]">Client Identifiers</th>
                                <th className="px-3 py-1.5 min-w-[160px]">Direct Contact</th>
                                <th className="px-3 py-1.5 min-w-[160px]">Vital Statistics</th>
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
                                paginatedCustomers.map(customer => (
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

                {/* Pagination Footer */}
                <div className="bg-surface-alt/80 border-t border-border-subtle py-2 px-4 flex justify-between items-center text-xs font-bold tracking-wide text-text-muted backdrop-blur-md sticky bottom-0 z-20">
                    <div className="flex gap-4 items-center">
                        <span>Total Records: {filteredCustomers.length}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-text-secondary">Page {currentPage} of {totalPages}</span>
                        <div className="flex gap-1.5">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded-md border border-border-subtle hover:bg-surface-main disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1.5 rounded-md border border-border-subtle hover:bg-surface-main disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
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
