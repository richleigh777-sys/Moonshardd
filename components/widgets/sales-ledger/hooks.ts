import { getStorageItem, setStorageItem } from '../../../lib/storage';

import { useState, useMemo, useEffect } from 'react';
import { Sale } from '../../../types';
import { sfx } from '../../../lib/soundService';

export const useLedgerLayout = () => {
    const DEFAULT_ORDER = [
        'date', 'customer', 'phone', 'billingAddress', 'shippingAddress', 'email', 
        'product', 'quantity', 'dosage', 'cardType', 'amount', 'cardNumber', 'ageDob', 'cardExpiry', 'cardCvv', 
        'callSummary', 'medicalConditions', 'heightWeight', 'agent', 
        'orderId', 'trackingId', 'status', 'declineReason', 'deliveryStatus', 'recording', 'cmd'
    ];
    const DEFAULT_VISIBLE = DEFAULT_ORDER.reduce((acc, k) => ({...acc, [k]: true}), {});

    const [preferences, setPreferences] = useState<{order: string[], visible: Record<string, boolean>}>(() => {
        const saved = getStorageItem('nexus_ledger_prefs_v9');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Ensure any new default columns are merged in if they are missing
            const missingOrders = DEFAULT_ORDER.filter(col => !parsed.order.includes(col));
            if (missingOrders.length > 0) {
                parsed.order = [...parsed.order, ...missingOrders];
                missingOrders.forEach(col => { parsed.visible[col] = true; });
            }
            return parsed;
        }
        return { order: DEFAULT_ORDER, visible: DEFAULT_VISIBLE };
    });

    useEffect(() => {
        setStorageItem('nexus_ledger_prefs_v9', JSON.stringify(preferences));
    }, [preferences]);

    return [preferences, setPreferences] as const;
};

export const useLedgerData = (sales: Sale[]) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: 'All',
        pipelineStatus: 'All',
        agent: 'All',
        product: 'All',
        startDate: '',
        endDate: '',
        minAmount: '',
        maxAmount: '',
        reorderCount: 'All',
        winback: 'All',
        trackingStatus: 'All'
    });

    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });

    const [now] = useState(() => Date.now());

    const processedData = useMemo(() => {
        const searchLower = searchTerm.toLowerCase();
        const hasSearch = !!searchTerm;
        const statusFilter = filters.status !== 'All' ? filters.status : null;
        const agentFilter = filters.agent !== 'All' ? filters.agent : null;
        const productFilter = filters.product !== 'All' ? filters.product : null;

        const customerFrequency = [...sales].reduce((acc, s) => {
            if (!acc[s.phone]) acc[s.phone] = { count: 0, lastOrder: 0 };
            acc[s.phone].count += 1;
            if (s.timestamp > acc[s.phone].lastOrder) acc[s.phone].lastOrder = s.timestamp;
            return acc;
        }, {} as Record<string, { count: number, lastOrder: number }>);

        const data = sales.filter(s => {
            if (hasSearch) {
                const matchesSearch = 
                    s.customer.toLowerCase().includes(searchLower) || 
                    s.phone.includes(searchLower) ||
                    (s.orderId && s.orderId.toLowerCase().includes(searchLower)) ||
                    s.agent.toLowerCase().includes(searchLower);
                if (!matchesSearch) return false;
            }

            if (statusFilter && s.status !== statusFilter) return false;
            if (filters.pipelineStatus !== 'All' && s.pipelineStatus !== filters.pipelineStatus) return false;
            if (agentFilter && s.agent !== agentFilter) return false;
            if (productFilter && s.product !== productFilter) return false;
            
            if (filters.startDate && s.timestamp < new Date(filters.startDate).getTime()) return false;
            if (filters.endDate && s.timestamp > new Date(filters.endDate).getTime() + 86400000) return false;

            if (filters.minAmount && Number(s.amount) < Number(filters.minAmount)) return false;
            if (filters.maxAmount && Number(s.amount) > Number(filters.maxAmount)) return false;

            if (filters.reorderCount !== 'All') {
                const count = customerFrequency[s.phone]?.count || 1;
                if (filters.reorderCount === '1+' && count < 2) return false;
                if (filters.reorderCount === '2+' && count < 3) return false;
                if (filters.reorderCount === '3+' && count < 4) return false;
            }

            if (filters.winback === 'True') {
                 const lastOrderTime = customerFrequency[s.phone]?.lastOrder || s.timestamp;
                 const daysSinceLastOrder = (now - lastOrderTime) / (1000 * 60 * 60 * 24);
                 if (daysSinceLastOrder <= 45) return false; 
            }
            
            if (filters.trackingStatus === 'Missing' && s.trackingId) return false;
            if (filters.trackingStatus === 'Present' && !s.trackingId) return false;
            
            return true;
        });

        return data.sort((a: any, b: any) => {
            const key = sortConfig.key;
            const aVal = key === 'date' ? a.timestamp : a[key];
            const bVal = key === 'date' ? b.timestamp : b[key];

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [sales, searchTerm, filters, sortConfig, now]);

    const summary = useMemo(() => ({
        total: processedData.reduce((acc, s) => acc + (Number(s.amount) || 0), 0),
        approved: processedData.filter(s => s.status === 'Approved').length,
        pending: processedData.filter(s => s.status === 'Pending').length,
        count: processedData.length
    }), [processedData]);

    const uniqueAgents = useMemo(() => Array.from(new Set(sales.map(s => s.agent).filter(Boolean))).sort(), [sales]);
    const uniqueProducts = useMemo(() => Array.from(new Set(sales.map(s => s.product).filter(Boolean))).sort(), [sales]);

    const handleSort = (key: string) => {
        sfx.playClick();
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const resetFilters = () => {
        sfx.playDecline();
        setFilters({ 
            status: 'All', pipelineStatus: 'All', agent: 'All', product: 'All', 
            startDate: '', endDate: '', minAmount: '', 
            maxAmount: '', reorderCount: 'All', winback: 'All', trackingStatus: 'All' 
        });
    };

    return {
        processedSales: processedData,
        summary,
        searchTerm, setSearchTerm,
        filters, setFilters,
        sortConfig, handleSort,
        uniqueAgents, uniqueProducts,
        resetFilters
    };
};
