
import { useState, useMemo, useEffect } from 'react';
import { Note } from '../../types';
import { sfx } from '../../lib/soundService';

export const useLeadHub = (notes: Note[] = []) => {
    const [now] = useState(() => Date.now());
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPriority, setFilterPriority] = useState<'All' | 'High' | 'Mid' | 'Low'>('All');

    const leads = useMemo(() => {
        let filtered = notes.filter(n => n.type === 'callback');
        
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const normalizedQ = searchQuery.replace(/[\s\-()+]/g, '');
            const isNumericSearch = /^\d+$/.test(normalizedQ);

            filtered = filtered.filter(n => {
                if (isNumericSearch && n.phone) {
                    const normalizedPhone = n.phone.replace(/[\s\-()+]/g, '');
                    if (normalizedPhone.includes(normalizedQ)) return true;
                }
                return (n.customerName || '').toLowerCase().includes(q) || 
                       (n.phone || '').includes(q) ||
                       (n.content || '').toLowerCase().includes(q);
            });
        }

        if (filterPriority !== 'All') {
            filtered = filtered.filter(n => n.priority === filterPriority);
        }

        return filtered.sort((a, b) => {
            // Sort logic: 
            // 1. Overdue or due within 15 mins comes first
            // 2. High priority over mid/low
            // 3. Timestamp closest comes first
            
            const now = Date.now();
            const aDiff = a.timestamp - now;
            const bDiff = b.timestamp - now;
            
            const aDueOrOverdue = aDiff <= 900000; // 15 mins window
            const bDueOrOverdue = bDiff <= 900000;
            
            if (aDueOrOverdue && !bDueOrOverdue) return -1;
            if (!aDueOrOverdue && bDueOrOverdue) return 1;

            // Priority mapping
            const pMap: Record<string, number> = { 'High': 1, 'Mid': 2, 'Low': 3 };
            const aPri = pMap[a.priority as string] || 2;
            const bPri = pMap[b.priority as string] || 2;

            if (aPri !== bPri) return aPri - bPri;
            
            // Priority 3: Standard timestamp
            return a.timestamp - b.timestamp;
        });
    }, [notes, searchQuery, filterPriority]);

    useEffect(() => {
        if (!selectedId && leads.length > 0) {
            setTimeout(() => setSelectedId(leads[0].id), 0);
        }
    }, [leads, selectedId]);

    const activeLead = useMemo(() => leads.find(l => l.id === selectedId) || null, [leads, selectedId]);

    const handleSelect = (id: string) => {
        sfx.playClick();
        setSelectedId(id);
    };

    return {
        leads,
        activeLead,
        selectedId,
        searchQuery,
        setSearchQuery,
        filterPriority,
        setFilterPriority,
        handleSelect,
        now
    };
};
