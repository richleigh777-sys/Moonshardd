
import { useState, useMemo, useEffect } from 'react';
import { Note } from '../../types';
import { sfx } from '../../lib/soundService';

export const useLeadHub = (notes: Note[] = []) => {
    const [now] = useState(() => Date.now());
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPriority, setFilterPriority] = useState<'All' | 'High' | 'Mid' | 'Low'>('All');

    const leads = useMemo(() => {
        let filtered = notes.filter(n => n.type === 'callback' && n.priority !== 'Low');
        
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(n => 
                n.customerName?.toLowerCase().includes(q) || 
                n.phone?.includes(q) ||
                n.content?.toLowerCase().includes(q)
            );
        }

        if (filterPriority !== 'All') {
            filtered = filtered.filter(n => n.priority === filterPriority);
        }

        return filtered.sort((a, b) => {
            // Priority 1: Overdue or active reminders
            const aReminder = a.reminderAt && !a.reminderDismissed ? a.reminderAt : Infinity;
            const bReminder = b.reminderAt && !b.reminderDismissed ? b.reminderAt : Infinity;
            if (aReminder !== bReminder) return aReminder - bReminder;
            
            // Priority 2: Standard timestamp
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
