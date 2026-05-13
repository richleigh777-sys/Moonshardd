
import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Card } from '../ui/Base';
import { Note } from '../../types';
import { useLeadHub } from './useLeadHub';
import { LeadList } from './LeadList';
import { LeadDetail } from './LeadDetail';

interface LeadHubProps {
    notes?: Note[];
    onMarkDone?: (id: string) => void;
    onViewProfile?: (phone: string) => void;
    onEngage?: (lead: Note) => void;
}

export const LeadHub: React.FC<LeadHubProps> = ({ notes = [], onMarkDone, onViewProfile: _onViewProfile, onEngage }) => {
    const {
        leads, activeLead, selectedId, searchQuery, setSearchQuery,
        filterPriority, setFilterPriority, handleSelect, now
    } = useLeadHub(notes);

    if (leads.length === 0 && !searchQuery) {
         return (
            <Card variant="panel" className="flex flex-col h-full items-center justify-center text-center opacity-50 p-10 bg-surface-main border-dashed border-border-subtle">
                 <div className="w-24 h-24 bg-surface-alt rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <CheckCircle2 size={40} className="text-emerald-500" />
                 </div>
                 <h3 className="text-xl font-black uppercase tracking-widest text-text-primary">Pipeline Clear</h3>
                 <p className="text-xs font-bold text-text-muted mt-2 uppercase tracking-wide">No pending callbacks. Great work.</p>
            </Card>
         );
    }

    return (
        <Card variant="panel" className="flex h-full p-0 overflow-hidden bg-surface-main border-border-subtle shadow-xl relative">
            <LeadList 
                leads={leads}
                selectedId={selectedId}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterPriority={filterPriority}
                setFilterPriority={setFilterPriority}
                onSelect={handleSelect}
                now={now}
            />
            <LeadDetail 
                activeLead={activeLead}
                onMarkDone={onMarkDone}
                onEngage={onEngage}
            />
        </Card>
    );
};
