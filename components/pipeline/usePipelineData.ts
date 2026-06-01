
import { useState, useMemo } from 'react';
import { Sale } from '../../types';
import { calculateUrgencyScore } from '../../utils/ranking';
import { PIPELINE_STAGES } from '../../constants';

export const usePipelineData = (sales: Sale[], currentUserId?: string) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortMode, setSortMode] = useState<'value' | 'date' | 'urgency'>('urgency');
    const [focusMode, setFocusMode] = useState(false);
    const [viewOwn, setViewOwn] = useState(true);

    const filteredSales = useMemo(() => {
        let result = sales.filter(s => s.status !== 'Declined' && s.status !== 'Cancelled');

        if (viewOwn && currentUserId) {
            result = result.filter(s => s.agentId === currentUserId);
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(s => 
                s.customer.toLowerCase().includes(q) || 
                s.product.toLowerCase().includes(q)
            );
        }

        return result.sort((a, b) => {
            if (sortMode === 'value') return Number(b.amount) - Number(a.amount);
            if (sortMode === 'date') return b.timestamp - a.timestamp;
            return calculateUrgencyScore(b) - calculateUrgencyScore(a);
        });
    }, [sales, searchQuery, sortMode, viewOwn, currentUserId]);

    const pipelineData = useMemo(() => {
        const data: Record<string, { sales: Sale[], total: number }> = {};
        
        PIPELINE_STAGES.forEach(stage => {
            data[stage] = { sales: [], total: 0 };
        });

        filteredSales.forEach(s => {
            let sStage = s.pipelineStatus || 'New Order';
            if (!PIPELINE_STAGES.includes(sStage as any)) sStage = 'New Order';
            
            if (data[sStage]) {
                data[sStage].sales.push(s);
                data[sStage].total += Number(s.amount) || 0;
            }
        });

        return data;
    }, [filteredSales]);

    const stats = useMemo(() => {
        const totalValue = filteredSales.reduce((acc, curr) => acc + Number(curr.amount), 0);
        return {
            totalValue,
            totalCount: filteredSales.length,
            avgValue: filteredSales.length ? totalValue / filteredSales.length : 0
        };
    }, [filteredSales]);

    return {
        pipelineData,
        stats,
        searchQuery,
        setSearchQuery,
        sortMode,
        setSortMode,
        focusMode,
        setFocusMode,
        viewOwn,
        setViewOwn
    };
};
