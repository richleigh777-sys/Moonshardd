
import { useState, useMemo, useEffect } from 'react';
import { Sale } from '../../../types';
import { sfx } from '../../../lib/soundService';

export const useLedgerLayout = () => {
    const DEFAULT_ORDER = ['date', 'agent', 'customer', 'phone', 'product', 'amount', 'status', 'pipelineStatus', 'orderId'];
    const DEFAULT_VISIBLE = DEFAULT_ORDER.reduce((acc, k) => ({...acc, [k]: true}), {});

    const [preferences, setPreferences] = useState<{order: string[], visible: Record<string, boolean>}>(() => {
        const saved = localStorage.getItem('nexus_ledger_prefs');
        return saved ? JSON.parse(saved) : { order: DEFAULT_ORDER, visible: DEFAULT_VISIBLE };
    });

    useEffect(() => {
        localStorage.setItem('nexus_ledger_prefs', JSON.stringify(preferences));
    }, [preferences]);

    return [preferences, setPreferences] as const;
};

export const useLedgerData = (sales: Sale[]) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: 'All',
        agent: 'All',
        product: 'All',
        startDate: '',
        endDate: ''
    });

    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });

    const processedData = useMemo(() => {
        const searchLower = searchTerm.toLowerCase();
        const hasSearch = !!searchTerm;
        const statusFilter = filters.status !== 'All' ? filters.status : null;
        const agentFilter = filters.agent !== 'All' ? filters.agent : null;
        const productFilter = filters.product !== 'All' ? filters.product : null;

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
            if (agentFilter && s.agent !== agentFilter) return false;
            if (productFilter && s.product !== productFilter) return false;
            
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
    }, [sales, searchTerm, filters, sortConfig]);

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
        setFilters({ status: 'All', agent: 'All', product: 'All', startDate: '', endDate: '' });
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
