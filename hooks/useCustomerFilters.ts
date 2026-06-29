import { useState, useMemo } from 'react';
import { Customer } from '../types';

export function useCustomerFilters(uniqueCustomers: Customer[], customerDynamicMetrics: Map<string, any>) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [selectedPipelineStage, setSelectedPipelineStage] = useState('');
    const [daysSinceOrderFilter, setDaysSinceOrderFilter] = useState<'all' | '14' | '30' | '60' | '90' | 'never'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'ltv' | 'date'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'approved' | 'declined' | 'incomplete' | 'cold' | 'upsell' | 'reorder' | 'winback'>('all');

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

    const filteredCustomers = useMemo(() => {
        return uniqueCustomers.filter(c => {
            const metrics = customerDynamicMetrics.get(c.id);
            const ltv = metrics?.ltv ?? 0;
            const declineCount = metrics?.declineCount ?? 0;

            if (selectedStatusFilter === 'approved' && ltv === 0) return false;
            if (selectedStatusFilter === 'declined' && declineCount === 0) return false;
            
            const now = Date.now();
            const lastOrderDate = metrics?.lastTimestamp || c.lastOrderDate || 0;
            const daysSinceLastOrder = lastOrderDate ? (now - lastOrderDate) / (1000 * 60 * 60 * 24) : -1;

            if (selectedStatusFilter === 'upsell') {
                if (daysSinceLastOrder < 0 || daysSinceLastOrder > 7 || ltv === 0) return false;
            }
            if (selectedStatusFilter === 'reorder') {
                if (daysSinceLastOrder < 25 || daysSinceLastOrder > 60 || ltv === 0) return false;
            }
            if (selectedStatusFilter === 'winback') {
                if (daysSinceLastOrder <= 90 || ltv === 0) return false;
            }

            if (selectedStatusFilter === 'incomplete') {
                const isComplete = c.firstName && c.lastName && c.phone && c.email && 
                                   c.shippingAddress && c.billingAddress && c.age && c.dob;
                if (isComplete) return false;
            }
            if (selectedStatusFilter === 'cold' && metrics && metrics.sales.length > 0) return false;

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

    return {
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
    };
}
