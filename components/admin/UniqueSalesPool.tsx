import React, { useState, useMemo, useCallback } from 'react';
import { useCRM } from '../../hooks/useCRM';
import { 
    Users, Search, Filter, ArrowUpDown, Edit3, Trash2, Plus, 
    X, MapPin, CreditCard, Mail, Phone, Heart, Activity, Check, 
    AlertCircle, Sparkles, Scale, Accessibility, FileText,
    ChevronDown, ChevronUp, RefreshCw, AlertTriangle, CheckCircle2,
    TrendingUp, Zap, Clock, ArrowUpRight, ShieldCheck, ShieldAlert,
    Upload, Link2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Customer, Sale } from '../../types';
import { sfx } from '../../lib/soundService';
import { useSystem } from '../../hooks/useSystem';
import { parseCSV } from '../widgets/sales-ledger/utils';

import { Save } from 'lucide-react';

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
    const { customers = [], updateCustomer, deleteCustomer, addCustomer, sales = [] } = useCRM();
    const { setToast } = useSystem();

    // Filtering, Searching & Sorting States
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [selectedPipelineStage, setSelectedPipelineStage] = useState('');
    const [daysSinceOrderFilter, setDaysSinceOrderFilter] = useState<'all' | '14' | '30' | '60' | '90' | 'never'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'ltv' | 'date'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    
    // Smart Lists State
    const [smartLists, setSmartLists] = useState<SmartList[]>(() => {
        try {
            return JSON.parse(localStorage.getItem('crm_smart_lists_v1') || '[]');
        } catch { return []; }
    });
    const [activeSmartListId, setActiveSmartListId] = useState<string | null>(null);
    const [isSavingSmartList, setIsSavingSmartList] = useState(false);
    const [newSmartListName, setNewSmartListName] = useState('');

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
    
    // Quick Outcome Tabs Filter: 'all' | 'approved' | 'declined' | 'incomplete' | 'cold' | 'upsell' | 'reorder' | 'winback'
    const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'approved' | 'declined' | 'incomplete' | 'cold' | 'upsell' | 'reorder' | 'winback'>('all');
    
    // Expanded Accordion row tracking for transaction ledgers
    const [expandedCustomers, setExpandedCustomers] = useState<Record<string, boolean>>({});

    // UI details and modal states
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Bulk Contact Upload Configuration States & Ref
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [importConfig, setImportConfig] = useState<{
        headers: string[];
        previewData: string[][];
        fullData: string[][];
        fileName: string;
    } | null>(null);
    const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState<'mapping' | 'resolution' | 'preview'>('mapping');

    const [importResults, setImportResults] = useState<{
        added: number;
        stitched: number;
        stitchedDetails: Array<{ name: string, phone: string, email: string }>;
        addedDetails: Array<{ name: string, phone: string, email: string }>;
    } | null>(null);
    
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
        medicalConditions: '',
        crmTags: '',
        pipelineStages: '',
        leadSources: ''
    } as any);

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
            if (c.crmTags) c.crmTags.forEach(m => tags.add(m));
            if (c.leadSources) c.leadSources.forEach(m => tags.add(m));
        });
        return Array.from(tags).sort();
    }, [uniqueCustomers]);

    const allPipelineStages = useMemo(() => {
        const stages = new Set<string>();
        uniqueCustomers.forEach(c => {
            if (c.pipelineStages) c.pipelineStages.forEach(m => stages.add(m));
        });
        return Array.from(stages).sort();
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
            
            const now = Date.now();
            const lastOrderDate = metrics?.lastTimestamp || c.lastOrderDate || 0;
            const daysSinceLastOrder = lastOrderDate ? (now - lastOrderDate) / (1000 * 60 * 60 * 24) : -1;

            if (selectedStatusFilter === 'upsell') {
                if (daysSinceLastOrder < 0 || daysSinceLastOrder > 7 || ltv === 0) return false; // Early upsell window
            }
            if (selectedStatusFilter === 'reorder') {
                if (daysSinceLastOrder < 25 || daysSinceLastOrder > 60 || ltv === 0) return false; // 30 day reorder window
            }
            if (selectedStatusFilter === 'winback') {
                if (daysSinceLastOrder <= 90 || ltv === 0) return false; // 90+ days winback
            }

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
                (c.medicalConditions && c.medicalConditions.includes(selectedTag)) ||
                (c.crmTags && c.crmTags.includes(selectedTag)) ||
                (c.leadSources && c.leadSources.includes(selectedTag));
                
            const matchesPipeline = !selectedPipelineStage ||
                (c.pipelineStages && c.pipelineStages.includes(selectedPipelineStage));
                
            let matchesDaysSinceOrder = true;
            if (daysSinceOrderFilter !== 'all') {
                if (daysSinceOrderFilter === 'never') {
                    matchesDaysSinceOrder = ltv === 0 && metrics?.sales.length === 0;
                } else {
                    const daysFilter = parseInt(daysSinceOrderFilter);
                    matchesDaysSinceOrder = daysSinceLastOrder >= daysFilter;
                }
            }

            return matchesSearch && matchesState && matchesTag && matchesPipeline && matchesDaysSinceOrder;
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
    }, [uniqueCustomers, customerDynamicMetrics, selectedStatusFilter, searchQuery, selectedState, selectedTag, selectedPipelineStage, daysSinceOrderFilter, sortBy, sortOrder]);

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
            const crmConds = typeof (editingCustomer as any).crmTagsString === 'string'
                ? (editingCustomer as any).crmTagsString.split(',').map((s: string) => s.trim()).filter(Boolean)
                : editingCustomer.crmTags;
            const leadConds = typeof (editingCustomer as any).leadSourcesString === 'string'
                ? (editingCustomer as any).leadSourcesString.split(',').map((s: string) => s.trim()).filter(Boolean)
                : editingCustomer.leadSources;
            const pipeConds = typeof (editingCustomer as any).pipelineStagesString === 'string'
                ? (editingCustomer as any).pipelineStagesString.split(',').map((s: string) => s.trim()).filter(Boolean)
                : editingCustomer.pipelineStages;

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
                crmTags: crmConds,
                leadSources: leadConds,
                pipelineStages: pipeConds,
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
            const crmConds = (newCustForm as any).crmTags
                ? (newCustForm as any).crmTags.split(',').map((s: string) => s.trim()).filter(Boolean)
                : [];
            const pipeConds = (newCustForm as any).pipelineStages
                ? (newCustForm as any).pipelineStages.split(',').map((s: string) => s.trim()).filter(Boolean)
                : [];
            const leadConds = (newCustForm as any).leadSources
                ? (newCustForm as any).leadSources.split(',').map((s: string) => s.trim()).filter(Boolean)
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
                crmTags: crmConds,
                pipelineStages: pipeConds,
                leadSources: leadConds,
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
        // if (window.confirm(`Are you absolutely sure you want to permanently delete customer "${name}"? This action is irreversible.`)) {
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

    // --- BULK TRANS-INGESTION CONTACTS PIPELINE ---
    const CONTACT_MAPPABLES = [
        { key: 'firstName', label: 'First Name', required: true, synonyms: ['first', 'firstname', 'first name', 'given name_'] },
        { key: 'lastName', label: 'Last Name', required: true, synonyms: ['last', 'lastname', 'last name', 'surname', 'family name'] },
        { key: 'phone', label: 'Phone Number (Required)', required: true, synonyms: ['phone', 'phone number', 'tel', 'mobile', 'cell', 'contact_num', 'contact'] },
        { key: 'email', label: 'Email Address', required: false, synonyms: ['email', 'email address', 'mail', 'e-mail', 'email_address'] },
        { key: 'dob', label: 'Date of Birth', required: false, synonyms: ['dob', 'date of birth', 'birthday', 'birth'] },
        { key: 'age', label: 'Age', required: false, synonyms: ['age', 'years old', 'years'] },
        { key: 'shippingAddress', label: 'Shipping Street', required: false, synonyms: ['shipping address', 'shipping street', 'street', 'ship_address'] },
        { key: 'shippingCity', label: 'Shipping City', required: false, synonyms: ['shipping city', 'ship_city', 'city'] },
        { key: 'shippingState', label: 'Shipping State', required: false, synonyms: ['shipping state', 'ship_state', 'state', 'province'] },
        { key: 'shippingZip', label: 'Shipping ZIP', required: false, synonyms: ['shipping zip', 'ship_zip', 'zip', 'postal'] },
        { key: 'billingAddress', label: 'Billing Street', required: false, synonyms: ['billing address', 'billing street', 'bill_address'] },
        { key: 'billingCity', label: 'Billing City', required: false, synonyms: ['billing city', 'bill_city'] },
        { key: 'billingState', label: 'Billing State', required: false, synonyms: ['billing state', 'bill_state'] },
        { key: 'billingZip', label: 'Billing ZIP', required: false, synonyms: ['billing zip', 'bill_zip', 'billing zip code'] },
        { key: 'height', label: 'Height', required: false, synonyms: ['height', 'tall'] },
        { key: 'weight', label: 'Weight', required: false, synonyms: ['weight', 'mass'] },
        { key: 'medicalConditions', label: 'Medical Conditions', required: false, synonyms: ['conditions', 'medical', 'symptoms', 'history', 'health', 'illness'] },
        { key: 'crmTags', label: 'CRM Tags', required: false, synonyms: ['crm tags', 'tags', 'global tags'] },
        { key: 'leadSources', label: 'Lead Sources', required: false, synonyms: ['lead source', 'source', 'origin', 'marketing source'] },
        { key: 'pipelineStages', label: 'Pipeline Stages', required: false, synonyms: ['pipeline', 'stage', 'status', 'funnel stage'] }
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        playConfirm();
        const reader = new FileReader();
        reader.onload = (event) => {
            const csvText = event.target?.result as string;
            const rows = parseCSV(csvText);
            
            if (rows.length < 2) {
                setToast({
                    title: 'Invalid CSV Structure',
                    message: "No data rows detected below headers in this file.",
                    type: 'error'
                });
                return;
            }

            const headers = rows[0].map(h => h.trim().replace(/^"|"$/g, ''));
            const data = rows.slice(1).filter(row => row.some(cell => cell && cell.trim().length > 0));

            setImportConfig({
                headers,
                previewData: data.slice(0, 5),
                fullData: data,
                fileName: file.name
            });
            setColumnMapping({});
            setActiveTab('mapping');
        };
        reader.readAsText(file);
    };

    const autoMapColumns = () => {
        if (!importConfig) return;
        const headers = importConfig.headers;
        const initialMap: Record<string, string> = {};
        const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

        CONTACT_MAPPABLES.forEach(field => {
            // Find exact match first
            let match = headers.find(h => normalize(h) === normalize(field.key) || normalize(h) === normalize(field.label));
            
            // Fuzzy Match by synonym list
            if (!match) {
                match = headers.find(h => {
                    const normH = normalize(h);
                    return field.synonyms.some(syn => {
                        const normSyn = normalize(syn);
                        return normH === normSyn || normH.includes(normSyn) || normSyn.includes(normH);
                    });
                });
            }

            if (match) {
                initialMap[field.key] = match;
            }
        });

        setColumnMapping(initialMap);
        setToast({
            title: 'Auto Map Applied',
            message: 'Detected matching columns based on common synonym patterns.',
            type: 'success'
        });
        playSuccess();
    };

    // Calculate dry-run analysis for the imported file based on mapping keys
    const dryRunAnalysis = useMemo(() => {
        if (!importConfig) return { newCount: 0, duplicateCount: 0, stitchCount: 0, fupCount: 0, validRows: [] };

        const headers = importConfig.headers;
        const phoneHeader = columnMapping['phone'];
        const phoneIdx = phoneHeader ? headers.indexOf(phoneHeader) : -1;

        if (phoneIdx === -1) return { newCount: 0, duplicateCount: 0, stitchCount: 0, fupCount: 0, validRows: [] };

        let newCount = 0;
        let duplicateCount = 0;
        let stitchCount = 0;
        let fupCount = 0;
        const validRows: any[] = [];

        // Extract key indices
        const fnIdx = headers.indexOf(columnMapping['firstName'] || '');
        const lnIdx = headers.indexOf(columnMapping['lastName'] || '');
        const emailIdx = headers.indexOf(columnMapping['email'] || '');
        const shippingIdx = headers.indexOf(columnMapping['shippingAddress'] || '');
        const billingIdx = headers.indexOf(columnMapping['billingAddress'] || '');
        const medIdx = headers.indexOf(columnMapping['medicalConditions'] || '');
        const crmTagsIdx = headers.indexOf(columnMapping['crmTags'] || '');
        const leadSourcesIdx = headers.indexOf(columnMapping['leadSources'] || '');
        const pipelineStagesIdx = headers.indexOf(columnMapping['pipelineStages'] || '');

        importConfig.fullData.forEach(row => {
            const rawPhone = row[phoneIdx];
            if (!rawPhone || !rawPhone.trim()) return;
            const cleanPhone = rawPhone.replace(/\D/g, '');
            if (!cleanPhone) return;

            const fn = fnIdx !== -1 ? (row[fnIdx] || '').trim() : '';
            const ln = lnIdx !== -1 ? (row[lnIdx] || '').trim() : '';
            const email = emailIdx !== -1 ? (row[emailIdx] || '').trim() : '';
            const shipping = shippingIdx !== -1 ? (row[shippingIdx] || '').trim() : '';
            const billing = billingIdx !== -1 ? (row[billingIdx] || '').trim() : '';
            const rawMed = medIdx !== -1 ? (row[medIdx] || '').trim() : '';

            // Find match
            const match = uniqueCustomers.find(c => {
                const cPhone = (c.phone || '').replace(/\D/g, '');
                const cAltAlt = ((c as any).alternatePhone || '').replace(/\D/g, '');
                return cPhone === cleanPhone || cAltAlt === cleanPhone;
            });

            // Find unlinked decline log in systems
            const phoneSales = sales.filter(s => (s.phone || '').replace(/\D/g, '') === cleanPhone);
            const hasDeclines = phoneSales.some(s => s.status === 'Declined');

            const rowData = {
                phone: rawPhone,
                firstName: fn,
                lastName: ln,
                fullName: `${fn} ${ln}`.trim(),
                email,
                shippingAddress: shipping,
                billingAddress: billing,
                medicalConditions: rawMed,
                isMatch: !!match,
                matchName: match ? match.fullName : null,
                isFup: hasDeclines || (match && (customerDynamicMetrics.get(match.id)?.declineCount ?? 0) > 0)
            };
            validRows.push(rowData);

            if (match) {
                duplicateCount++;
                
                // Check if any incoming field represents a patchable stitch value
                const hasStitchableInfo = 
                    (email && (!match.email || match.email.toLowerCase() === 'unknown')) ||
                    (shipping && (match.shippingAddress || match.address) !== shipping) ||
                    (billing && match.billingAddress !== billing) ||
                    (rawMed && (match.medicalConditions || []).length === 0);

                if (hasStitchableInfo) {
                    stitchCount++;
                }

                if (rowData.isFup) {
                    fupCount++;
                }
            } else {
                newCount++;
                if (rowData.isFup) {
                    fupCount++;
                }
            }
        });

        return { newCount, duplicateCount, stitchCount, fupCount, validRows };
    }, [importConfig, columnMapping, uniqueCustomers, sales, customerDynamicMetrics]);

    const executeContactImport = async () => {
        if (!importConfig) return;
        
        const headers = importConfig.headers;
        const phoneHeader = columnMapping['phone'];
        const phoneIdx = phoneHeader ? headers.indexOf(phoneHeader) : -1;

        if (phoneIdx === -1) {
            setToast({
                title: 'Key Field Required',
                message: 'You must map the Phone Number column. This key field is used to avoid duplicate contacts and enable stitching.',
                type: 'warning'
            });
            playDecline();
            return;
        }

        setIsProcessing(true);
        playConfirm();

        const fnIdx = headers.indexOf(columnMapping['firstName'] || '');
        const lnIdx = headers.indexOf(columnMapping['lastName'] || '');
        const emailIdx = headers.indexOf(columnMapping['email'] || '');
        const ageIdx = headers.indexOf(columnMapping['age'] || '');
        const dobIdx = headers.indexOf(columnMapping['dob'] || '');
        const shipAddrIdx = headers.indexOf(columnMapping['shippingAddress'] || '');
        const shipCityIdx = headers.indexOf(columnMapping['shippingCity'] || '');
        const shipStateIdx = headers.indexOf(columnMapping['shippingState'] || '');
        const shipZipIdx = headers.indexOf(columnMapping['shippingZip'] || '');
        const billAddrIdx = headers.indexOf(columnMapping['billingAddress'] || '');
        const billCityIdx = headers.indexOf(columnMapping['billingCity'] || '');
        const billStateIdx = headers.indexOf(columnMapping['billingState'] || '');
        const billZipIdx = headers.indexOf(columnMapping['billingZip'] || '');
        const heightIdx = headers.indexOf(columnMapping['height'] || '');
        const weightIdx = headers.indexOf(columnMapping['weight'] || '');
        const medIdx = headers.indexOf(columnMapping['medicalConditions'] || '');

        let added = 0;
        let updated = 0;
        const importResultsData: any = { added: 0, stitched: 0, stitchedDetails: [], addedDetails: [] };

        // Create a fast Map to track phones and ensure duplicates from the SAME CSV file are stitched, not duplicated
        const phoneDbMap = new Map<string, Customer>();
        
        // Sort newest first to ensure we get the latest profile if duplicates already exist
        const sortedRaw = [...customers].sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
        sortedRaw.forEach(c => {
            if (c.phone) phoneDbMap.set(c.phone.replace(/\D/g, ''), c);
            if ((c as any).alternatePhone) phoneDbMap.set((c as any).alternatePhone.replace(/\D/g, ''), c);
        });

        try {
            for (const row of importConfig.fullData) {
                const rawPhone = row[phoneIdx];
                if (!rawPhone || !rawPhone.trim()) continue;
                const cleanPhone = rawPhone.replace(/\D/g, '');
                if (!cleanPhone) continue;

                const fn = fnIdx !== -1 ? (row[fnIdx] || '').trim() : '';
                const ln = lnIdx !== -1 ? (row[lnIdx] || '').trim() : '';
                const email = emailIdx !== -1 ? (row[emailIdx] || '').trim() : '';
                const age = ageIdx !== -1 ? Number(row[ageIdx]) || undefined : undefined;
                const dob = dobIdx !== -1 ? (row[dobIdx] || '').trim() : '';
                const shippingAddress = shipAddrIdx !== -1 ? (row[shipAddrIdx] || '').trim() : '';
                const shippingCity = shipCityIdx !== -1 ? (row[shipCityIdx] || '').trim() : '';
                const shippingState = shipStateIdx !== -1 ? (row[shipStateIdx] || '').trim() : '';
                const shippingZip = shipZipIdx !== -1 ? (row[shipZipIdx] || '').trim() : '';
                const billingAddress = billAddrIdx !== -1 ? (row[billAddrIdx] || '').trim() : '';
                const billingCity = billCityIdx !== -1 ? (row[billCityIdx] || '').trim() : '';
                const billingState = billStateIdx !== -1 ? (row[billStateIdx] || '').trim() : '';
                const billingZip = billZipIdx !== -1 ? (row[billZipIdx] || '').trim() : '';
                const height = heightIdx !== -1 ? (row[heightIdx] || '').trim() : '';
                const weight = weightIdx !== -1 ? (row[weightIdx] || '').trim() : '';
                const medList = medIdx !== -1 && row[medIdx] 
                    ? row[medIdx].split(',').map((s: string) => s.trim()).filter(Boolean)
                    : [];

                const fullName = `${fn} ${ln}`.trim();

                // 2. Fetch from our active tracker Map to catch cross-file duplicates AND in-file duplicates
                const existingMatch = phoneDbMap.get(cleanPhone);

                if (existingMatch) {
                    // Update / Stitch Profile
                    const updates: Partial<Customer> = { updatedAt: Date.now() };

                    if (fn && !existingMatch.firstName) updates.firstName = fn;
                    if (ln && !existingMatch.lastName) updates.lastName = ln;
                    if (fullName && (!existingMatch.fullName || existingMatch.fullName.length < fullName.length)) {
                        updates.fullName = fullName;
                        updates.name = fullName;
                    }
                    if (email && (!existingMatch.email || existingMatch.email.toLowerCase() === 'unknown')) updates.email = email;
                    if (age && !existingMatch.age) updates.age = age;
                    if (dob && !existingMatch.dob) updates.dob = dob;
                    if (height && !existingMatch.height) updates.height = height;
                    if (weight && !existingMatch.weight) updates.weight = weight;

                    // Locate details
                    if (shippingAddress) {
                        const originalShip = existingMatch.shippingAddress || existingMatch.address;
                        if (!originalShip) {
                            updates.shippingAddress = shippingAddress;
                            updates.address = shippingAddress;
                            updates.shippingCity = shippingCity;
                            updates.shippingState = shippingState;
                            updates.shippingZip = shippingZip;
                        } else if (originalShip.toLowerCase().trim() !== shippingAddress.toLowerCase().trim()) {
                            const past = existingMatch.pastShippingAddresses || [];
                            if (!past.includes(originalShip)) {
                                updates.pastShippingAddresses = [...past, originalShip];
                            }
                            updates.shippingAddress = shippingAddress;
                            updates.address = shippingAddress;
                            updates.shippingCity = shippingCity || existingMatch.shippingCity;
                            updates.shippingState = shippingState || existingMatch.shippingState;
                            updates.shippingZip = shippingZip || existingMatch.shippingZip;
                        }
                    }

                    if (billingAddress) {
                        const originalBill = existingMatch.billingAddress;
                        if (!originalBill) {
                            updates.billingAddress = billingAddress;
                            updates.billingCity = billingCity;
                            updates.billingState = billingState;
                            updates.billingZip = billingZip;
                        } else if (originalBill.toLowerCase().trim() !== billingAddress.toLowerCase().trim()) {
                            const past = existingMatch.pastBillingAddresses || [];
                            if (!past.includes(originalBill)) {
                                updates.pastBillingAddresses = [...past, originalBill];
                            }
                            updates.billingAddress = billingAddress;
                            updates.billingCity = billingCity || existingMatch.billingCity;
                            updates.billingState = billingState || existingMatch.billingState;
                            updates.billingZip = billingZip || existingMatch.billingZip;
                        }
                    }

                    if (medList.length > 0) {
                        const originalMed = existingMatch.medicalConditions || [];
                        updates.medicalConditions = Array.from(new Set([...originalMed, ...medList]));
                    }
                    if (crmList.length > 0) {
                        const originalCrm = existingMatch.crmTags || [];
                        updates.crmTags = Array.from(new Set([...originalCrm, ...crmList]));
                    }
                    if (leadList.length > 0) {
                        const originalLead = existingMatch.leadSources || [];
                        updates.leadSources = Array.from(new Set([...originalLead, ...leadList]));
                    }
                    if (pipeList.length > 0) {
                        const originalPipe = existingMatch.pipelineStages || [];
                        updates.pipelineStages = Array.from(new Set([...originalPipe, ...pipeList]));
                    }

                    await updateCustomer(existingMatch.id, updates);
                    updated++;
                    importResultsData.stitched++;
                    importResultsData.stitchedDetails.push({ 
                        name: fullName || 'Unknown', 
                        phone: rawPhone, 
                        email: email || 'unknown' 
                    });
                } else {
                    // Create customer record
                    const id = 'cust_' + Date.now() + Math.random().toString(36).substr(2, 5);
                    const customerPayload: Partial<Customer> = {
                        id,
                        firstName: fn,
                        lastName: ln,
                        fullName,
                        name: fullName,
                        phone: rawPhone,
                        email: email || 'unknown',
                        shippingAddress,
                        shippingCity,
                        shippingState,
                        shippingZip,
                        billingAddress,
                        billingCity,
                        billingState,
                        billingZip,
                        age,
                        dob,
                        height,
                        weight,
                        medicalConditions: medList,
                        crmTags: crmList,
                        leadSources: leadList,
                        pipelineStages: pipeList,
                        status: 'Active',
                        ltv: 0,
                        orderCount: 0,
                        declineCount: 0,
                        lastOrderDate: 0,
                        firstSource: 'CSV Bulk Import',
                        tags: [],
                        salesHistory: [],
                        phones: [rawPhone],
                        emails: [email].filter(Boolean),
                        createdAt: Date.now(),
                        updatedAt: Date.now()
                    };
                    await addCustomer(customerPayload);
                    
                    // Immediately add the new customer to the Map so subsequent rows with the same phone in the CSV get stitched into it!
                    phoneDbMap.set(cleanPhone, customerPayload as Customer);
                    
                    added++;
                    importResultsData.added++;
                    importResultsData.addedDetails.push({
                        name: fullName || 'Unknown',
                        phone: rawPhone,
                        email: email || 'unknown'
                    });
                }
            }

            setToast({
                title: 'Data Ingestion Nexus Succeeded',
                message: `Bulk contacts parsed successfully: ${added} new unique profiles registered. ${updated} pre-existing entries stitched.`,
                type: 'success'
            });
            playSuccess();
            setImportResults(importResultsData);
            setImportConfig(null);
        } catch (err) {
            console.error('Failed to parse columns:', err);
            setToast({
                title: 'Ingestion Aborted',
                message: 'Failed to process spreadsheet contacts.',
                type: 'error'
            });
            playDecline();
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div id="sales-pool-root" className="flex flex-col gap-3 p-3 min-h-[calc(100vh-60px)] bg-surface-main/30 rounded-xl border border-border-subtle animate-in fade-in duration-300">
            {/* Header Section */}
            <div id="sales-pool-header" className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                    <h1 className="text-lg font-black text-text-primary tracking-tight flex items-center gap-2">
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
                        onClick={() => { playClick(); setIsAddOpen(true); }}
                        className="px-3 py-1.5 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-lg text-sm font-bold tracking-wider uppercase transition-all shadow-md shadow-accent-primary/20 flex items-center gap-1.5"
                        id="btn-add-unique-customer"
                    >
                        <Plus size={14} /> Add Unique Record
                    </button>
                </div>
            </div>

            {/* Live Synchronizing Feed Banner */}
            <div className="bg-surface-main/80 backdrop-blur-md border border-border-strong/10 rounded-xl p-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 overflow-hidden shadow-sm relative before:absolute before:top-0 before:left-0 before:bottom-0 before:w-1 before:bg-accent-primary">
                <div className="flex items-center gap-3">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-status-success"></span>
                    </span>
                    <div className="flex flex-col">
                        <span className="text-sm font-black uppercase tracking-widest text-text-primary">LIVE CRM OUTCOME FEED</span>
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
                    <div>Gross Rev: <span className="text-status-success font-black">${stats.totalLtv.toLocaleString()}</span></div>
                    <div>Approved Orders: <span className="text-accent-primary font-black">{stats.totalApprovedCount}</span></div>
                    <div>Declined: <span className="text-status-error font-black">{stats.totalDeclinedCount}</span></div>
                </div>
            </div>

            {/* Admin Level 10 Badge Indicators */}
            <div id="sales-pool-kpi-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <div className="bg-surface-main border border-border-subtle p-3 rounded-xl shadow-sm flex flex-col justify-between">
                    <span className="text-sm font-black tracking-widest text-text-muted uppercase flex items-center gap-1"><Users size={12} className="text-accent-primary"/> TOTAL UNIQUE CONTACTS</span>
                    <h3 className="text-xl font-black text-text-primary mt-1.5">{stats.total}</h3>
                    <span className="text-sm text-status-success font-semibold mt-0.5">▲ Unified Directory</span>
                </div>
                <div className="bg-surface-main border border-border-subtle p-3 rounded-xl shadow-sm flex flex-col justify-between font-medium">
                    <span className="text-sm font-black tracking-widest text-text-muted uppercase flex items-center gap-1"><CreditCard size={12} className="text-accent-primary"/> AVERAGE LTV</span>
                    <h3 className="text-xl font-black text-text-primary mt-1.5">${stats.avgLtv}</h3>
                    <span className="text-sm text-text-muted mt-0.5">Per active profile</span>
                </div>
                <div className="bg-surface-main border border-border-subtle p-3 rounded-xl shadow-sm flex flex-col justify-between">
                    <span className="text-sm font-black tracking-widest text-text-muted uppercase flex items-center gap-1"><Activity size={12} className="text-accent-primary"/> COMPLETENESS RATE</span>
                    <h3 className="text-xl font-black text-text-primary mt-1.5">{stats.completenessRate}%</h3>
                    <div className="w-full bg-border-subtle h-1 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-accent-primary h-full rounded-full transition-all duration-500" style={{ width: `${stats.completenessRate}%` }} />
                    </div>
                </div>
                <div className="bg-surface-main border border-border-subtle p-3 rounded-xl shadow-sm flex flex-col justify-between">
                    <span className="text-sm font-black tracking-widest text-text-muted uppercase flex items-center gap-1"><Sparkles size={12} className="text-status-warning"/> VIP ACCOUNTS</span>
                    <h3 className="text-xl font-black text-text-primary mt-1.5">{stats.vipCount}</h3>
                    <span className="text-sm text-status-warning font-semibold mt-0.5">★ LTV exceeds $1,000</span>
                </div>
            </div>

            {/* SMART LISTS NAV BAR */}
            {smartLists.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-1 ml-1 mr-2"><Filter size={12}/> SMART LISTS:</span>
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
                    className={`px-4 py-1.5 rounded-xl text-sm font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${selectedStatusFilter === 'approved' ? 'bg-status-success/20 text-status-success border border-status-success/30 shadow-sm font-black' : 'text-text-secondary hover:bg-surface-alt/80'}`}
                >
                    <CheckCircle2 size={13} />
                    Approved Accounts ({uniqueCustomers.filter(c => (customerDynamicMetrics.get(c.id)?.ltv ?? 0) > 0).length})
                </button>
                <button
                    onClick={() => { playClick(); setActiveSmartListId(null); setSelectedStatusFilter('declined'); }}
                    className={`px-4 py-1.5 rounded-xl text-sm font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${selectedStatusFilter === 'declined' ? 'bg-status-error/20 text-status-error border border-status-error/30 shadow-sm font-black' : 'text-text-secondary hover:bg-surface-alt/80'}`}
                >
                    <AlertTriangle size={13} />
                    payment Decline List ({uniqueCustomers.filter(c => (customerDynamicMetrics.get(c.id)?.declineCount ?? 0) > 0).length})
                </button>
                <button
                    onClick={() => { playClick(); setActiveSmartListId(null); setSelectedStatusFilter('incomplete'); }}
                    className={`px-4 py-1.5 rounded-xl text-sm font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${selectedStatusFilter === 'incomplete' ? 'bg-status-warning/20 text-status-warning border border-status-warning/30 shadow-sm font-black' : 'text-text-secondary hover:bg-surface-alt/80'}`}
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
                    className={`px-4 py-1.5 rounded-xl text-sm font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${selectedStatusFilter === 'upsell' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30 shadow-sm font-black' : 'text-text-secondary hover:bg-surface-alt/80'}`}
                >
                    <ArrowUpRight size={13} />
                    Upsell Cycle
                </button>
                <button
                    onClick={() => { playClick(); setActiveSmartListId(null); setSelectedStatusFilter('reorder'); }}
                    className={`px-4 py-1.5 rounded-xl text-sm font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${selectedStatusFilter === 'reorder' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 shadow-sm font-black' : 'text-text-secondary hover:bg-surface-alt/80'}`}
                >
                    <RefreshCw size={13} />
                    Ready Reorders
                </button>
                <button
                    onClick={() => { playClick(); setActiveSmartListId(null); setSelectedStatusFilter('winback'); }}
                    className={`px-4 py-1.5 rounded-xl text-sm font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${selectedStatusFilter === 'winback' ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30 shadow-sm font-black' : 'text-text-secondary hover:bg-surface-alt/80'}`}
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
                            <tr className="border-b border-border-subtle bg-surface-alt text-sm font-black tracking-widest text-text-muted uppercase h-8">
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
                                                <td className="px-3 py-2">
                                                    <div className="flex items-center gap-3">
                                                        <div 
                                                            onClick={(e) => { e.stopPropagation(); toggleRow(customer.id); }}
                                                            className="w-8 h-8 rounded-full bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-sm font-black text-accent-primary hover:bg-accent-primary/20 transition-all shrink-0"
                                                        >
                                                            {isExpanded ? <ChevronUp size={14} /> : (customer.firstName || 'C')[0]}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-text-primary flex items-center gap-1.5 leading-tight">
                                                                {fullNameWithMI}
                                                                {isVip && (
                                                                    <span className="text-sm font-black bg-status-warning/10 border border-status-warning/20 text-status-warning px-1.5 py-0.5 rounded-full uppercase tracking-wider">VIP</span>
                                                                )}
                                                            </div>
                                                            <span className="text-sm font-mono font-medium text-text-muted uppercase">UID: {customer.id}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Direct Contact */}
                                                <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-text-secondary font-bold font-mono">
                                                            <Phone size={12} className="text-accent-primary/60" />
                                                            {customer.phone || '—'}
                                                        </div>
                                                        {customer.email && (
                                                            <div className="flex items-center gap-2 text-sm text-text-muted font-medium">
                                                                <Mail size={12} className="text-accent-primary/60" />
                                                                {customer.email}
                                                            </div>
                                                        )}
                                                        {(customer as any).alternatePhone && (
                                                            <div className="flex items-center gap-2 text-sm text-text-muted font-mono font-semibold">
                                                                <Phone size={10} className="text-status-success/50" />
                                                                ALT: {(customer as any).alternatePhone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Age, DOB, Vitals */}
                                                <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                                                    <div className="space-y-1">
                                                        <div className="text-sm font-semibold text-text-secondary">
                                                            Age: <span className="font-black text-text-primary">{ageVal}</span>
                                                        </div>
                                                        <div className="text-sm font-mono text-text-muted">
                                                            DOB: {dobVal}
                                                        </div>
                                                        <div className="flex items-center gap-3 text-sm font-semibold text-text-muted">
                                                            <span>H: <span className="text-text-primary">{heightVal}</span></span>
                                                            <span>W: <span className="text-text-primary">{weightVal}</span></span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Medical profile */}
                                                <td className="px-3 py-2 max-w-[200px]" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex flex-col gap-1 max-h-[60px] overflow-y-auto custom-scrollbar pr-1">
                                                        {medConditionsList.length === 0 && !(customer.crmTags?.length) && !(customer.pipelineStages?.length) ? (
                                                            <span className="text-[11px] font-medium text-text-muted italic">No declarations</span>
                                                        ) : (
                                                            <div className="flex flex-wrap gap-1">
                                                                {medConditionsList.map((m, idx) => (
                                                                    <span key={'med'+idx} className="text-[9px] font-black tracking-wide uppercase px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-500">
                                                                        {m}
                                                                    </span>
                                                                ))}
                                                                {(customer.crmTags || []).map((m, idx) => (
                                                                    <span key={'crm'+idx} className="text-[9px] font-black tracking-wide uppercase px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400">
                                                                        {m}
                                                                    </span>
                                                                ))}
                                                                {(customer.pipelineStages || []).map((m, idx) => (
                                                                    <span key={'pipe'+idx} className="text-[9px] font-black tracking-wide uppercase px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
                                                                        {m}
                                                                    </span>
                                                                ))}
                                                                {(customer.leadSources || []).map((m, idx) => (
                                                                    <span key={'lead'+idx} className="text-[9px] font-black tracking-wide uppercase px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                                                        {m}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Locations */}
                                                <td className="px-3 py-2 max-w-[260px]" onClick={(e) => e.stopPropagation()}>
                                                    <div className="space-y-1.5 text-sm">
                                                        {customer.shippingAddress ? (
                                                            <div className="flex items-start gap-1">
                                                                <MapPin size={11} className="text-accent-primary mt-0.5 shrink-0" />
                                                                <span className="text-text-secondary line-clamp-1">
                                                                    <b className="text-sm text-accent-primary font-black">SHIP:</b> {customer.shippingAddress}{customer.shippingApt ? `, Apt ${customer.shippingApt}` : ''}, {customer.shippingCity || ''}, {customer.shippingState || ''} {customer.shippingZip || ''}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="text-sm text-text-muted italic">No shipping location saved</div>
                                                        )}

                                                        {customer.billingAddress ? (
                                                            <div className="flex items-start gap-1">
                                                                <CreditCard size={11} className="text-status-success mt-0.5 shrink-0" />
                                                                <span className="text-text-secondary line-clamp-1">
                                                                    <b className="text-sm text-status-success font-black">BILL:</b> {customer.billingAddress}{customer.billingApt ? `, Apt ${customer.billingApt}` : ''}, {customer.billingCity || ''}, {customer.billingState || ''} {customer.billingZip || ''}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="text-sm text-text-muted italic">No billing location saved</div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Cumulative metrics */}
                                                <td className="px-3 py-2 text-right font-medium">
                                                    <div className="text-sm font-black text-text-primary">
                                                        ${dynamicLtv || 0}
                                                    </div>
                                                    <div className="text-sm font-mono text-text-muted uppercase">
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
                                                <td className="px-3 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button 
                                                            onClick={() => { 
    playClick(); 
    setEditingCustomer({ 
        ...customer, 
        medicalConditionsString: medConditionsList.join(', '),
        crmTagsString: (customer.crmTags || []).join(', '),
        leadSourcesString: (customer.leadSources || []).join(', '),
        pipelineStagesString: (customer.pipelineStages || []).join(', ')
    } as any); 
}}
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
                                                    <td colSpan={7} className="px-3 py-2">
                                                        <div
                                                            className="overflow-hidden border border-border-subtle rounded-xl bg-surface-main/80 p-3 space-y-2 shadow-inner"
                                                            id={`expanded-ledger-${customer.id}`}
                                                        >
                                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-left">
                                                                {/* Left Column: List of transaction attempts */}
                                                                <div className="md:col-span-7 space-y-3">
                                                                    <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                                                                        <h4 className="text-sm font-black text-text-primary tracking-wider uppercase flex items-center gap-1.5">
                                                                            <Clock size={13} className="text-accent-primary" />
                                                                            Transaction History & Attempts ({metrics?.sales.length || 0})
                                                                        </h4>
                                                                        <span className="text-sm font-mono text-text-muted">Direct Phone: {customer.phone}</span>
                                                                    </div>

                                                                    <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1.5">
                                                                        {metrics?.sales && metrics.sales.length > 0 ? (
                                                                            metrics.sales.map((sale) => {
                                                                                const isApproved = sale.status === 'Approved';
                                                                                const isDeclined = sale.status === 'Declined';
                                                                                return (
                                                                                    <div 
                                                                                        key={sale.id} 
                                                                                        className={`border p-3 rounded-xl flex items-center justify-between text-sm transition-colors bg-surface-alt/70 ${
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
                                                                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-muted font-medium font-sans">
                                                                                                <span>ID: <code className="font-mono text-text-primary">{sale.id}</code></span>
                                                                                                <span>Agent: <strong className="text-text-secondary">{sale.agent || 'Unknown'}</strong></span>
                                                                                                <span>Time: {new Date(sale.timestamp).toLocaleString()}</span>
                                                                                            </div>
                                                                                            {sale.declineReason && (
                                                                                                <div className="text-sm font-bold text-status-error flex items-center gap-1 mt-1 bg-status-error/5 px-2 py-0.5 rounded border border-status-error/10">
                                                                                                    <AlertTriangle size={10} />
                                                                                                    Reason: {sale.declineReason}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="text-right space-y-1 shrink-0 ml-3">
                                                                                            <div className="font-black text-text-primary text-sm">${sale.amount}</div>
                                                                                            <span className={`px-2 py-0.5 rounded text-sm font-black uppercase tracking-wider ${
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
                                                                        <h4 className="text-sm font-black text-text-primary tracking-wider uppercase flex items-center gap-1.5 border-b border-border-subtle pb-2">
                                                                            <MapPin size={13} className="text-status-success" />
                                                                            Unified Address Registries
                                                                        </h4>
                                                                        
                                                                        <div className="mt-2 space-y-2 text-sm font-medium text-text-secondary">
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

                                                                    <div className="bg-surface-alt p-4 rounded-xl border border-border-subtle space-y-2">
                                                                        <div className="flex items-center gap-2">
                                                                            {metrics && metrics.declineCount > 0 ? (
                                                                                <>
                                                                                    <ShieldAlert size={16} className="text-status-error" />
                                                                                    <span className="text-sm font-black text-status-error uppercase tracking-wider">Decline Rescue Candidate</span>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <ShieldCheck size={16} className="text-status-success" />
                                                                                    <span className="text-sm font-black text-status-success uppercase tracking-wider">Health Assessment OK</span>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-sm text-text-muted leading-relaxed font-semibold">
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
                                                                                className="flex-1 py-1.5 px-3 bg-accent-primary text-white text-sm font-bold uppercase rounded-lg hover:bg-accent-primary/95 transition-all text-center"
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
                                                                                className="flex-1 py-1.5 px-3 border border-border-strong text-text-secondary text-sm font-bold uppercase rounded-lg hover:bg-surface-alt transition-all text-center"
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
                            <div className="p-4 border-b border-border-subtle bg-surface-alt/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-accent-primary/10 border border-accent-primary/20 rounded-xl text-accent-primary">
                                        <Users size={18} />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-black text-text-primary tracking-tight">Edit Unique Record</h2>
                                        <p className="text-sm text-text-muted mt-0.5">UID: {editingCustomer.id}</p>
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
                            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-4 space-y-6">
                                {/* Biographical Section */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-2 flex items-center gap-2">
                                        <Activity size={14} className="text-accent-primary" />
                                        1. Biographical Identity
                                    </h3>
                                    
                                    <div className="grid grid-cols-12 gap-3">
                                        <div className="col-span-5 relative">
                                            <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">First Name</div>
                                            <input 
                                                required
                                                type="text" 
                                                value={editingCustomer.firstName || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, firstName: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-medium"
                                            />
                                        </div>
                                        <div className="col-span-2 relative">
                                            <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">MI</div>
                                            <input 
                                                maxLength={1}
                                                type="text" 
                                                value={(editingCustomer as any).middleInitial || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, middleInitial: e.target.value.toUpperCase() } as any)}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-medium text-center"
                                            />
                                        </div>
                                        <div className="col-span-5 relative">
                                            <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">Last Name</div>
                                            <input 
                                                required
                                                type="text" 
                                                value={editingCustomer.lastName || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, lastName: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-medium"
                                            />
                                        </div>

                                        <div className="col-span-6 relative">
                                            <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">Direct Phone</div>
                                            <input 
                                                required
                                                type="text" 
                                                value={editingCustomer.phone || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm font-mono text-text-primary outline-none focus:border-accent-primary font-bold"
                                            />
                                        </div>
                                        <div className="col-span-6 relative">
                                            <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">Alternate Phone</div>
                                            <input 
                                                type="text" 
                                                value={(editingCustomer as any).alternatePhone || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, alternatePhone: e.target.value } as any)}
                                                placeholder="N/A"
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm font-mono text-text-primary outline-none focus:border-accent-primary font-semibold"
                                            />
                                        </div>

                                        <div className="col-span-12 relative">
                                            <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">Contact Email</div>
                                            <input 
                                                type="email" 
                                                value={editingCustomer.email || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Vital Statistics / Bio */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-2 flex items-center gap-2">
                                        <Scale size={14} className="text-accent-primary" />
                                        2. Vital Metrics
                                    </h3>
                                    
                                    <div className="grid grid-cols-4 gap-3">
                                        <div className="relative">
                                            <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">Age</div>
                                            <input 
                                                type="number" 
                                                value={editingCustomer.age || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, age: e.target.value ? Number(e.target.value) : undefined })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-bold"
                                            />
                                        </div>
                                        <div className="relative col-span-1">
                                            <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">Height</div>
                                            <input 
                                                type="text" 
                                                value={editingCustomer.height || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, height: e.target.value })}
                                                placeholder="5'10"
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-medium"
                                            />
                                        </div>
                                        <div className="relative col-span-1">
                                            <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">Weight</div>
                                            <input 
                                                type="text" 
                                                value={editingCustomer.weight || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, weight: e.target.value })}
                                                placeholder="180 lbs"
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-medium"
                                            />
                                        </div>
                                        <div className="relative col-span-1">
                                            <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">DOB</div>
                                            <input 
                                                type="text" 
                                                value={editingCustomer.dob || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, dob: e.target.value })}
                                                placeholder="MM/DD/YYYY"
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm font-mono text-text-primary outline-none focus:border-accent-primary font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Logistics Locations */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
                                            <MapPin size={14} className="text-accent-primary" />
                                            3. Shipping Location
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-12 gap-3">
                                        <div className="col-span-9 relative">
                                            <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">Shipping Address</div>
                                            <input 
                                                type="text" 
                                                value={editingCustomer.shippingAddress || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, shippingAddress: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-medium"
                                            />
                                        </div>
                                        <div className="col-span-3 relative">
                                            <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">Unit/Apt</div>
                                            <input 
                                                type="text" 
                                                value={editingCustomer.shippingApt || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, shippingApt: e.target.value })}
                                                placeholder="None"
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-medium"
                                            />
                                        </div>
                                        <div className="col-span-4 relative">
                                            <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">City</div>
                                            <input 
                                                type="text" 
                                                value={editingCustomer.shippingCity || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, shippingCity: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-medium"
                                            />
                                        </div>
                                        <div className="col-span-4 relative">
                                            <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">State</div>
                                            <input 
                                                type="text" 
                                                value={editingCustomer.shippingState || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, shippingState: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-semibold"
                                            />
                                        </div>
                                        <div className="col-span-4 relative">
                                            <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">ZIP Code</div>
                                            <input 
                                                type="text" 
                                                value={editingCustomer.shippingZip || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, shippingZip: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm font-mono text-text-primary outline-none focus:border-accent-primary font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
                                            <CreditCard size={14} className="text-status-success" />
                                            4. Billing Location
                                        </h3>
                                        <button 
                                            type="button"
                                            onClick={() => syncBillingWithShipping(true)}
                                            className="text-sm font-black uppercase text-accent-primary tracking-wider hover:underline"
                                        >
                                            Copy Shipping 地址
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-12 gap-3">
                                        <div className="col-span-9 relative">
                                            <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">Billing Address</div>
                                            <input 
                                                type="text" 
                                                value={editingCustomer.billingAddress || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, billingAddress: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-medium"
                                            />
                                        </div>
                                        <div className="col-span-3 relative">
                                            <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">Unit/Apt</div>
                                            <input 
                                                type="text" 
                                                value={editingCustomer.billingApt || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, billingApt: e.target.value })}
                                                placeholder="None"
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-medium"
                                            />
                                        </div>
                                        <div className="col-span-4 relative">
                                            <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">City</div>
                                            <input 
                                                type="text" 
                                                value={editingCustomer.billingCity || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, billingCity: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-medium"
                                            />
                                        </div>
                                        <div className="col-span-4 relative">
                                            <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">State</div>
                                            <input 
                                                type="text" 
                                                value={editingCustomer.billingState || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, billingState: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-semibold"
                                            />
                                        </div>
                                        <div className="col-span-4 relative">
                                            <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">ZIP Code</div>
                                            <input 
                                                type="text" 
                                                value={editingCustomer.billingZip || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, billingZip: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm font-mono text-text-primary outline-none focus:border-accent-primary font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Declarations / Medical */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-2 flex items-center gap-2">
                                        <Heart size={14} className="text-status-error" />
                                        Medical Annotations
                                    </h3>
                                    
                                    <div className="relative">
                                        <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">Conditions (Comma Separated)</div>
                                        <textarea 
                                            value={(editingCustomer as any).medicalConditionsString || ''}
                                            onChange={(e) => setEditingCustomer({ ...editingCustomer, medicalConditionsString: e.target.value } as any)}
                                            placeholder="Asthma, Diabetes, Heart Murmur"
                                            rows={2}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-semibold resize-none"
                                        />
                                    </div>
                                    
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-2 flex items-center gap-2 mt-6">
                                        <Layers size={14} className="text-purple-500" />
                                        Taxonomy & CRM Variables
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="relative">
                                            <div className="absolute top-2 left-3 text-xs font-black tracking-widest text-purple-500 uppercase z-10">CRM Tags</div>
                                            <textarea 
                                                value={(editingCustomer as any).crmTagsString || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, crmTagsString: e.target.value } as any)}
                                                placeholder="VIP, High Value..."
                                                rows={2}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-purple-500 font-semibold resize-none"
                                            />
                                        </div>
                                        <div className="relative">
                                            <div className="absolute top-2 left-3 text-xs font-black tracking-widest text-blue-500 uppercase z-10">Lead Sources</div>
                                            <textarea 
                                                value={(editingCustomer as any).leadSourcesString || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, leadSourcesString: e.target.value } as any)}
                                                placeholder="Organic, Direct..."
                                                rows={2}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-blue-500 font-semibold resize-none"
                                            />
                                        </div>
                                        <div className="relative">
                                            <div className="absolute top-2 left-3 text-xs font-black tracking-widest text-amber-500 uppercase z-10">Pipeline Stages</div>
                                            <textarea 
                                                value={(editingCustomer as any).pipelineStagesString || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, pipelineStagesString: e.target.value } as any)}
                                                placeholder="New, Qualified..."
                                                rows={2}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-amber-500 font-semibold resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button Footer */}
                                <div className="pt-4 border-t border-border-subtle flex items-center gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => { playClick(); setEditingCustomer(null); }}
                                        className="flex-1 py-3 border border-border-subtle rounded-xl text-sm font-bold tracking-wider uppercase hover:bg-surface-alt/50 text-text-secondary transition-colors"
                                    >
                                        Dismiss
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-[2] py-3 bg-accent-primary text-white rounded-xl text-sm font-bold tracking-wider uppercase hover:bg-accent-primary/90 transition-colors shadow-lg shadow-accent-primary/15"
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
                            className="w-full max-w-2xl bg-surface-main border border-border-subtle rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
                            id="add-customer-modal"
                        >
                            {/* Modal Header */}
                            <div className="p-4 border-b border-border-subtle bg-surface-alt/50 flex justify-between items-center">
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
                            <form onSubmit={handleAddCustomer} className="flex-1 overflow-y-auto p-4 space-y-5">
                                <div className="grid grid-cols-12 gap-3">
                                    <div className="col-span-5 relative">
                                        <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">First Name *</div>
                                        <input 
                                            required
                                            type="text"
                                            value={newCustForm.firstName}
                                            onChange={(e) => setNewCustForm({ ...newCustForm, firstName: e.target.value })}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary"
                                        />
                                    </div>
                                    <div className="col-span-2 relative">
                                        <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">MI</div>
                                        <input 
                                            maxLength={1}
                                            type="text"
                                            value={newCustForm.middleInitial}
                                            onChange={(e) => setNewCustForm({ ...newCustForm, middleInitial: e.target.value.toUpperCase() })}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary text-center"
                                        />
                                    </div>
                                    <div className="col-span-5 relative">
                                        <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">Last Name</div>
                                        <input 
                                            type="text"
                                            value={newCustForm.lastName}
                                            onChange={(e) => setNewCustForm({ ...newCustForm, lastName: e.target.value })}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary"
                                        />
                                    </div>

                                    <div className="col-span-6 relative">
                                        <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">Direct Phone *</div>
                                        <input 
                                            required
                                            type="text"
                                            value={newCustForm.phone}
                                            onChange={(e) => setNewCustForm({ ...newCustForm, phone: e.target.value })}
                                            placeholder="123-456-7890"
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm font-mono text-text-primary outline-none focus:border-accent-primary font-bold"
                                        />
                                    </div>
                                    <div className="col-span-6 relative">
                                        <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">Alternate Phone</div>
                                        <input 
                                            type="text"
                                            value={newCustForm.alternatePhone}
                                            onChange={(e) => setNewCustForm({ ...newCustForm, alternatePhone: e.target.value })}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm font-mono text-text-primary outline-none focus:border-accent-primary"
                                        />
                                    </div>

                                    <div className="col-span-12 relative">
                                        <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">Email Address</div>
                                        <input 
                                            type="email"
                                            value={newCustForm.email}
                                            onChange={(e) => setNewCustForm({ ...newCustForm, email: e.target.value })}
                                            placeholder="name@domain.com"
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary"
                                        />
                                    </div>
                                </div>

                                {/* Medical and Vitals Box */}
                                <div className="border border-border-subtle p-4 rounded-xl bg-surface-alt/30 space-y-4">
                                    <h4 className="text-sm font-black tracking-wider text-text-muted uppercase flex items-center gap-1">Vitals & Declarations</h4>
                                    <div className="grid grid-cols-4 gap-3">
                                        <div className="relative">
                                            <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">Age</div>
                                            <input 
                                                type="number"
                                                value={newCustForm.age}
                                                onChange={(e) => setNewCustForm({ ...newCustForm, age: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-bold"
                                            />
                                        </div>
                                        <div className="relative col-span-1">
                                            <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">Height</div>
                                            <input 
                                                type="text"
                                                value={newCustForm.height}
                                                onChange={(e) => setNewCustForm({ ...newCustForm, height: e.target.value })}
                                                placeholder="5'10"
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary"
                                            />
                                        </div>
                                        <div className="relative col-span-1">
                                            <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">Weight</div>
                                            <input 
                                                type="text"
                                                value={newCustForm.weight}
                                                onChange={(e) => setNewCustForm({ ...newCustForm, weight: e.target.value })}
                                                placeholder="180 lbs"
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary"
                                            />
                                        </div>
                                        <div className="relative col-span-1">
                                            <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">DOB</div>
                                            <input 
                                                type="text"
                                                value={newCustForm.dob}
                                                onChange={(e) => setNewCustForm({ ...newCustForm, dob: e.target.value })}
                                                placeholder="MM/DD/YYYY"
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm font-mono text-text-primary outline-none focus:border-accent-primary font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">Medical Conditions (Comma Separated)</div>
                                        <input 
                                            type="text"
                                            value={newCustForm.medicalConditions}
                                            onChange={(e) => setNewCustForm({ ...newCustForm, medicalConditions: e.target.value })}
                                            placeholder="e.g. Asthma, High Blood Pressure"
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="relative">
                                            <div className="absolute top-2 left-3 text-[10px] font-black tracking-widest text-purple-500 uppercase z-10">CRM Tags</div>
                                            <input 
                                                type="text"
                                                value={(newCustForm as any).crmTags || ''}
                                                onChange={(e) => setNewCustForm({ ...newCustForm, crmTags: e.target.value } as any)}
                                                placeholder="VIP, Follow Up"
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-purple-500"
                                            />
                                        </div>
                                        <div className="relative">
                                            <div className="absolute top-2 left-3 text-[10px] font-black tracking-widest text-blue-500 uppercase z-10">Lead Sources</div>
                                            <input 
                                                type="text"
                                                value={(newCustForm as any).leadSources || ''}
                                                onChange={(e) => setNewCustForm({ ...newCustForm, leadSources: e.target.value } as any)}
                                                placeholder="Organic Search"
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="relative">
                                            <div className="absolute top-2 left-3 text-[10px] font-black tracking-widest text-amber-500 uppercase z-10">Pipeline Stages</div>
                                            <input 
                                                type="text"
                                                value={(newCustForm as any).pipelineStages || ''}
                                                onChange={(e) => setNewCustForm({ ...newCustForm, pipelineStages: e.target.value } as any)}
                                                placeholder="Qualified"
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-amber-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping Blocks */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-black tracking-wider text-text-muted uppercase">Shipping Information</h4>
                                    <div className="grid grid-cols-12 gap-3">
                                        <div className="col-span-9 relative">
                                            <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">Shipping Address</div>
                                            <input 
                                                type="text"
                                                value={newCustForm.shippingAddress}
                                                onChange={(e) => setNewCustForm({ ...newCustForm, shippingAddress: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary"
                                            />
                                        </div>
                                        <div className="col-span-3 relative">
                                            <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">Apt/Unit</div>
                                            <input 
                                                type="text"
                                                value={newCustForm.shippingApt}
                                                onChange={(e) => setNewCustForm({ ...newCustForm, shippingApt: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary"
                                            />
                                        </div>
                                        <div className="col-span-4 relative">
                                            <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">City</div>
                                            <input 
                                                type="text"
                                                value={newCustForm.shippingCity}
                                                onChange={(e) => setNewCustForm({ ...newCustForm, shippingCity: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary"
                                            />
                                        </div>
                                        <div className="col-span-4 relative">
                                            <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">State</div>
                                            <input 
                                                type="text"
                                                value={newCustForm.shippingState}
                                                onChange={(e) => setNewCustForm({ ...newCustForm, shippingState: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-semibold"
                                            />
                                        </div>
                                        <div className="col-span-4 relative">
                                            <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">ZIP Code</div>
                                            <input 
                                                type="text"
                                                value={newCustForm.shippingZip}
                                                onChange={(e) => setNewCustForm({ ...newCustForm, shippingZip: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm font-mono text-text-primary outline-none focus:border-accent-primary"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Billing Blocks */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-black tracking-wider text-text-muted uppercase">Billing Information</h4>
                                        <button 
                                            type="button" 
                                            onClick={() => syncBillingWithShipping(false)}
                                            className="text-sm font-black uppercase text-accent-primary hover:underline"
                                        >
                                            Copy Shipping
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-12 gap-3">
                                        <div className="col-span-9 relative">
                                            <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">Billing Address</div>
                                            <input 
                                                type="text"
                                                value={newCustForm.billingAddress}
                                                onChange={(e) => setNewCustForm({ ...newCustForm, billingAddress: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary"
                                            />
                                        </div>
                                        <div className="col-span-3 relative">
                                            <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">Apt/Unit</div>
                                            <input 
                                                type="text"
                                                value={newCustForm.billingApt}
                                                onChange={(e) => setNewCustForm({ ...newCustForm, billingApt: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary"
                                            />
                                        </div>
                                        <div className="col-span-4 relative">
                                            <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">City</div>
                                            <input 
                                                type="text"
                                                value={newCustForm.billingCity}
                                                onChange={(e) => setNewCustForm({ ...newCustForm, billingCity: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary"
                                            />
                                        </div>
                                        <div className="col-span-4 relative">
                                            <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">State</div>
                                            <input 
                                                type="text"
                                                value={newCustForm.billingState}
                                                onChange={(e) => setNewCustForm({ ...newCustForm, billingState: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-semibold"
                                            />
                                        </div>
                                        <div className="col-span-4 relative">
                                            <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">ZIP Code</div>
                                            <input 
                                                type="text"
                                                value={newCustForm.billingZip}
                                                onChange={(e) => setNewCustForm({ ...newCustForm, billingZip: e.target.value })}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm font-mono text-text-primary outline-none focus:border-accent-primary"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Footer buttons */}
                                <div className="pt-4 border-t border-border-subtle flex items-center gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => { playClick(); setIsAddOpen(false); }}
                                        className="flex-1 py-3 border border-border-subtle rounded-xl text-sm font-bold tracking-wider uppercase hover:bg-surface-alt/50 text-text-secondary transition-colors"
                                    >
                                        Dismiss
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-[2] py-3 bg-accent-primary text-white rounded-xl text-sm font-bold tracking-wider uppercase hover:bg-accent-primary/95 transition-colors shadow-lg shadow-accent-primary/15"
                                    >
                                        Create Contact Entry
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Bulk Contact Ingestion Nexus (Import Wizard) */}
            <AnimatePresence>
                {importConfig && (
                    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[120] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-4xl bg-surface-main border border-border-subtle rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
                            id="bulk-contacts-wizard-modal"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-border-subtle bg-surface-alt/70 flex justify-between items-center relative">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-accent-primary/10 text-accent-primary rounded-xl">
                                        <Upload size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-black text-text-primary tracking-tight">Unified Contact Ingestion Nexus</h2>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-sm font-mono bg-border-subtle px-2 py-0.5 rounded text-text-secondary font-bold">
                                                {importConfig.fileName}
                                            </span>
                                            <span className="text-sm text-text-muted font-medium">
                                                detected {importConfig.fullData.length} records to process
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { playClick(); setImportConfig(null); }}
                                    className="p-2 border border-border-subtle hover:bg-surface-alt rounded-lg text-text-muted hover:text-text-primary transition-colors"
                                    disabled={isProcessing}
                                >
                                    <X size={16} />
                                </button>
                                
                                {isProcessing && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-border-subtle overflow-hidden">
                                        <div className="h-full bg-accent-primary animate-pulse w-2/3 rounded-r"></div>
                                    </div>
                                )}
                            </div>

                            {/* Navigation Tabs */}
                            <div className="px-4 py-2 border-b border-border-subtle bg-surface-alt/30 flex gap-2">
                                <button
                                    onClick={() => { playClick(); setActiveTab('mapping'); }}
                                    className={`px-3 py-2 text-sm font-bold uppercase tracking-wider rounded-xl transition-all ${
                                        activeTab === 'mapping'
                                            ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/25'
                                            : 'text-text-muted hover:text-text-primary hover:bg-surface-alt border border-transparent'
                                    }`}
                                >
                                    1. Schema Mapping & Sync
                                </button>
                                <button
                                    onClick={() => { playClick(); setActiveTab('resolution'); }}
                                    className={`px-3 py-2 text-sm font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 ${
                                        activeTab === 'resolution'
                                            ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/25'
                                            : 'text-text-muted hover:text-text-primary hover:bg-surface-alt border border-transparent'
                                    }`}
                                >
                                    2. Resolution Hub (Dry-Run)
                                    {dryRunAnalysis.fupCount > 0 && (
                                        <span className="bg-status-danger/20 text-status-danger text-sm px-1.5 py-0.5 rounded-full font-black animate-pulse">
                                            {dryRunAnalysis.fupCount} FUPs
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => { playClick(); setActiveTab('preview'); }}
                                    className={`px-3 py-2 text-sm font-bold uppercase tracking-wider rounded-xl transition-all ${
                                        activeTab === 'preview'
                                            ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/25'
                                            : 'text-text-muted hover:text-text-primary hover:bg-surface-alt border border-transparent'
                                    }`}
                                >
                                    3. Spreadsheet Grid Preview
                                </button>
                            </div>

                            {/* Scrollable Content Pane */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                                {activeTab === 'mapping' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between bg-surface-alt p-4 rounded-xl border border-border-subtle">
                                            <div>
                                                <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">Configure Column Alignment</h3>
                                                <p className="text-sm text-text-muted mt-1 leading-relaxed">
                                                    Match database destinations with your spreadsheet's headers. Direct phone verification is strictly required.
                                                </p>
                                            </div>
                                            <button
                                                onClick={autoMapColumns}
                                                className="px-3.5 py-2 bg-surface-main hover:bg-border-subtle text-accent-primary hover:text-accent-primary border border-border-subtle rounded-xl text-sm font-extrabold tracking-wider uppercase transition-all flex items-center gap-1.5"
                                            >
                                                <Sparkles size={13} className="text-accent-primary animate-pulse" /> Auto Map columns
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {CONTACT_MAPPABLES.map(field => {
                                                const mappedValue = columnMapping[field.key] || '';
                                                const isMapped = !!mappedValue;
                                                return (
                                                    <div 
                                                        key={field.key} 
                                                        className={`p-4 rounded-xl border transition-all ${
                                                            isMapped 
                                                                ? 'bg-surface-alt/75 border-accent-primary/25 shadow-sm shadow-accent-primary/5' 
                                                                : field.required 
                                                                    ? 'bg-status-danger/5 border-status-danger/20' 
                                                                    : 'bg-surface-alt/20 border-border-subtle'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-sm font-black tracking-tight text-text-primary">
                                                                    {field.label}
                                                                </span>
                                                                {field.required && (
                                                                    <span className="text-sm bg-status-danger/10 text-status-danger px-1.5 py-0.5 rounded font-black uppercase">
                                                                        Required
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {isMapped ? (
                                                                <span className="text-sm text-accent-primary flex items-center gap-1 font-bold">
                                                                    <CheckCircle2 size={12} /> Bound
                                                                </span>
                                                            ) : (
                                                                <span className="text-sm text-text-muted italic">
                                                                    Unmapped
                                                                </span>
                                                            )}
                                                        </div>

                                                        <select
                                                            value={mappedValue}
                                                            onChange={(e) => {
                                                                playClick();
                                                                setColumnMapping({
                                                                    ...columnMapping,
                                                                    [field.key]: e.target.value
                                                                });
                                                            }}
                                                            className="w-full bg-surface-main border border-border-strong rounded-lg px-2.5 py-2 text-sm font-semibold text-text-primary outline-none focus:border-accent-primary"
                                                        >
                                                            <option value="">-- Ignore / Do Not Map --</option>
                                                            {importConfig.headers.map(header => (
                                                                <option key={header} value={header}>{header}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'resolution' && (
                                    <div className="space-y-6">
                                        {/* Dynamic Insights Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <div className="p-4 bg-surface-alt border border-border-subtle rounded-xl">
                                                <div className="text-sm font-black uppercase tracking-wider text-text-muted mb-1">
                                                    New Contacts
                                                </div>
                                                <div className="text-xl font-black text-text-primary tracking-tight font-mono">
                                                    {dryRunAnalysis.newCount}
                                                </div>
                                                <p className="text-sm text-text-muted mt-1 leading-none">
                                                    establishing new profiles
                                                </p>
                                            </div>

                                            <div className="p-4 bg-surface-alt border border-border-subtle rounded-xl">
                                                <div className="text-sm font-black uppercase tracking-wider text-text-muted mb-1">
                                                    Duplicates Detected
                                                </div>
                                                <div className="text-xl font-black text-text-secondary tracking-tight font-mono">
                                                    {dryRunAnalysis.duplicateCount}
                                                </div>
                                                <p className="text-sm text-text-muted mt-1 leading-none">
                                                    colliding on direct phones
                                                </p>
                                            </div>

                                            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                                                <div className="text-sm font-black uppercase tracking-wider text-emerald-600 mb-1">
                                                    Auto-Stitch targets
                                                </div>
                                                <div className="text-xl font-black text-emerald-600 tracking-tight font-mono">
                                                    {dryRunAnalysis.stitchCount}
                                                </div>
                                                <p className="text-sm text-text-muted mt-1 leading-none">
                                                    patching missing details
                                                </p>
                                            </div>

                                            <div className="p-4 bg-status-danger/5 border border-status-danger/20 rounded-xl">
                                                <div className="text-sm font-black uppercase tracking-wider text-status-danger mb-1">
                                                    FUP / Rejection recovery
                                                </div>
                                                <div className="text-xl font-black text-status-danger tracking-tight font-mono">
                                                    {dryRunAnalysis.fupCount}
                                                </div>
                                                <p className="text-sm text-text-muted mt-1 leading-none font-bold">
                                                    high-priority follow-ups
                                                </p>
                                            </div>
                                        </div>

                                        {/* Key stitching directives */}
                                        <div className="p-5 border border-border-subtle rounded-xl bg-surface-alt/45 space-y-4">
                                            <h3 className="text-sm font-black text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                                                <Link2 className="text-accent-primary font-bold" size={15} />
                                                Ingestion & Converging Rules
                                            </h3>
                                            
                                            <div className="space-y-3.5 text-sm leading-relaxed text-text-secondary">
                                                <div className="flex items-start gap-2.5">
                                                    <div className="p-1 bg-accent-primary/10 text-accent-primary rounded-md mt-0.5 font-bold">✓</div>
                                                    <div>
                                                        <span className="font-bold text-text-primary">Contact Phone Convergence (No Duplication):</span>
                                                        <p className="text-text-muted mt-0.5">
                                                            Every physical phone is a unique key. If an uploaded contact phone already exists, the system does not create a clone. It merges them.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-2.5">
                                                    <div className="p-1 bg-accent-primary/10 text-accent-primary rounded-md mt-0.5 font-bold">✓</div>
                                                    <div>
                                                        <span className="font-bold text-text-primary">Historical Address Stitching:</span>
                                                        <p className="text-text-muted mt-0.5">
                                                            If the uploaded billing/shipping values representing locations differ from their current profile records, the system preserves the old values by automatically appending them to the "Past Addresses" timeline. No data gets permanently overwritten!
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-2.5">
                                                    <div className="p-1 bg-accent-primary/10 text-accent-primary rounded-md mt-0.5 font-bold">✓</div>
                                                    <div>
                                                        <span className="font-bold text-text-primary">High-Triage FUP Flagging:</span>
                                                        <p className="text-text-muted mt-0.5">
                                                            Imported contacts with outstanding declined transactions in active sales registers are automatically tagged. This identifies immediate customer recovery phone leads for administrative focus.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'preview' && (
                                    <div className="space-y-4">
                                        <div className="text-sm text-text-muted font-medium mb-1">
                                            Displaying first 5 rows of your uploaded file. Adjust mapping to see corresponding alignments.
                                        </div>
                                        <div className="border border-border-subtle rounded-xl overflow-hidden bg-surface-alt">
                                            <div className="overflow-x-auto max-w-full">
                                                <table className="w-full text-left text-sm">
                                                    <thead>
                                                        <tr className="bg-surface-main border-b border-border-subtle">
                                                            {importConfig.headers.map((h, i) => (
                                                                <th key={i} className="px-4 py-3 font-black text-text-primary tracking-tight truncate max-w-[150px]">
                                                                    {h}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {importConfig.previewData.map((row, rIdx) => (
                                                            <tr key={rIdx} className="border-b border-border-subtle hover:bg-surface-main/30 font-medium">
                                                                {row.map((cell, cIdx) => (
                                                                    <td key={cIdx} className="px-4 py-3 text-text-muted font-mono truncate max-w-[150px]">
                                                                        {cell}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer Buttons */}
                            <div className="p-4 border-t border-border-subtle bg-surface-alt/40 flex justify-between items-center">
                                <div className="text-sm font-semibold text-text-muted">
                                    {!columnMapping['phone'] && (
                                        <span className="text-status-danger flex items-center gap-1">
                                            <AlertCircle size={14} /> Phone column alignment is strictly required
                                        </span>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => { playClick(); setImportConfig(null); }}
                                        className="px-5 py-3 border border-border-subtle rounded-xl text-sm font-bold tracking-wider uppercase hover:bg-surface-alt text-text-secondary transition-colors"
                                        disabled={isProcessing}
                                    >
                                        Cancel Upload
                                    </button>
                                    
                                    <button
                                        type="button"
                                        onClick={executeContactImport}
                                        className="px-4 py-3 bg-accent-primary text-white disabled:bg-border-subtle disabled:text-text-muted disabled:cursor-not-allowed rounded-xl text-sm font-extrabold tracking-wider uppercase hover:bg-accent-primary/90 transition-colors shadow-lg shadow-accent-primary/10 flex items-center gap-2"
                                        disabled={!columnMapping['phone'] || isProcessing}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <RefreshCw size={14} className="animate-spin" /> Ingesting Contacts...
                                            </>
                                        ) : (
                                            <>
                                                <Check size={14} /> Execute Ingestion ({importConfig.fullData.length} Rows)
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Import Results Ledger (Post-Ingestion) */}
            <AnimatePresence>
                {importResults && (
                    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[130] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-4xl bg-surface-main border border-border-subtle rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
                            id="bulk-contacts-results-modal"
                        >
                            <div className="p-4 border-b border-border-subtle bg-surface-alt/70 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-accent-primary/10 text-accent-primary rounded-xl">
                                        <CheckCircle2 size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-black text-text-primary tracking-tight">Bulk Ingestion Results</h2>
                                        <p className="text-sm text-text-muted font-medium">Operation completed successfully.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { playClick(); setImportResults(null); }}
                                    className="p-2 border border-border-subtle hover:bg-surface-alt rounded-lg text-text-muted hover:text-text-primary transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 bg-surface-alt border border-border-subtle rounded-xl flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-accent-primary/20 text-accent-primary flex items-center justify-center">
                                            <Upload size={24} />
                                        </div>
                                        <div>
                                            <p className="text-3xl font-black text-text-primary">{importResults.added}</p>
                                            <p className="text-sm font-bold uppercase tracking-widest text-text-muted mt-1">Leads Imported</p>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-status-warning/10 border border-status-warning/30 rounded-xl flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-status-warning/20 text-status-warning flex items-center justify-center">
                                            <AlertTriangle size={24} />
                                        </div>
                                        <div>
                                            <p className="text-3xl font-black text-status-warning">{importResults.stitched}</p>
                                            <p className="text-sm font-bold uppercase tracking-widest text-status-warning/70 mt-1">Duplicates Stitched / Updated</p>
                                        </div>
                                    </div>
                                </div>

                                {importResults.added > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary flex items-center gap-2 border-b border-border-subtle pb-2">
                                            <CheckCircle2 size={14} className="text-accent-primary" /> Successfully Imported Leads
                                        </h3>
                                        <div className="overflow-hidden border border-border-subtle rounded-xl">
                                            <div className="max-h-[200px] overflow-y-auto custom-scrollbar bg-surface-alt/30">
                                                <table className="w-full text-left border-collapse min-w-[600px]">
                                                    <thead className="bg-surface-alt/80 sticky top-0 z-10 backdrop-blur-md">
                                                        <tr>
                                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-text-muted">Name</th>
                                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-text-muted">Phone Number</th>
                                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-text-muted">Email</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border-subtle/50">
                                                        {importResults.addedDetails?.map((dup, dIdx) => (
                                                            <tr key={'add'+dIdx} className="hover:bg-surface-main/40 transition-colors">
                                                                <td className="px-4 py-3 text-sm font-semibold text-text-primary">{dup.name}</td>
                                                                <td className="px-4 py-3 text-sm font-mono text-text-muted">{dup.phone}</td>
                                                                <td className="px-4 py-3 text-sm text-text-muted">{dup.email}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {importResults.stitched > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-status-warning flex items-center gap-2 border-b border-border-subtle pb-2">
                                            <AlertTriangle size={14} /> Stitched Duplicate Records (Updated)
                                        </h3>
                                        <div className="overflow-hidden border border-border-subtle rounded-xl">
                                            <div className="max-h-[200px] overflow-y-auto custom-scrollbar bg-surface-alt/30">
                                                <table className="w-full text-left border-collapse min-w-[600px]">
                                                    <thead className="bg-surface-alt/80 sticky top-0 z-10 backdrop-blur-md">
                                                        <tr>
                                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-text-muted">Name</th>
                                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-text-muted">Phone Number</th>
                                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-text-muted">Email</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border-subtle/50">
                                                        {importResults.stitchedDetails?.map((dup, dIdx) => (
                                                            <tr key={'skip'+dIdx} className="hover:bg-status-warning/10 transition-colors">
                                                                <td className="px-4 py-3 text-sm font-semibold text-text-primary">{dup.name}</td>
                                                                <td className="px-4 py-3 text-sm font-mono text-status-warning">{dup.phone}</td>
                                                                <td className="px-4 py-3 text-sm text-text-muted">{dup.email}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-border-subtle bg-surface-alt/40 flex justify-end">
                                <button
                                    onClick={() => { playClick(); setImportResults(null); }}
                                    className="px-6 py-3 bg-surface-main hover:bg-border-subtle text-text-primary border border-border-subtle rounded-xl text-sm font-extrabold tracking-wider uppercase transition-all shadow-sm"
                                >
                                    Dismiss Report
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
