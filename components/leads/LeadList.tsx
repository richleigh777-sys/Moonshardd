
import React from 'react';
import { Search, Heart } from 'lucide-react';
import { Note } from '../../types';
import { LeadListItem } from './LeadListItem';

interface LeadListProps {
    leads: Note[];
    selectedId: string | null;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    filterPriority: 'All' | 'High' | 'Mid' | 'Low';
    setFilterPriority: (p: 'All' | 'High' | 'Mid' | 'Low') => void;
    onSelect: (id: string) => void;
    now: number;
}

export const LeadList: React.FC<LeadListProps> = ({
    leads, selectedId, searchQuery, setSearchQuery, filterPriority, setFilterPriority, onSelect, now
}) => {
    return (
        <div className="w-1/3 min-w-[300px] border-r border-border-subtle flex flex-col bg-surface-alt/10">
            <div className="p-4 border-b border-border-subtle flex flex-col gap-3 bg-surface-main/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Heart size={16} className="text-accent-primary fill-current" />
                        <h3 className="text-xs font-[700]  text-text-primary tracking-widest">Lead Pool</h3>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded bg-surface-alt border border-border-subtle text-text-muted">{leads.length} Pending</span>
                </div>
                
                <div className="relative group">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-primary transition-colors"/>
                    <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search names or numbers..."
                        className="w-full bg-surface-main border border-border-subtle rounded-xl py-2 pl-9 pr-3 text-xs font-bold outline-none focus:border-accent-primary transition-all shadow-inner"
                    />
                </div>

                <div className="flex gap-1 overflow-x-auto scrollbar-hide mt-2">
                    {(['All', 'High', 'Mid', 'Low'] as const).map(p => (
                        <button
                            key={p}
                            onClick={() => setFilterPriority(p)}
                            className={`flex-1 py-1.5 text-xs font-[700]  rounded-lg border transition-all ${filterPriority === p ? 'bg-accent-primary text-white border-accent-primary shadow-sm' : 'bg-surface-main text-text-muted border-border-subtle hover:text-text-primary'}`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {leads.map(lead => (
                    <LeadListItem 
                        key={lead.id}
                        lead={lead}
                        isSelected={lead.id === selectedId}
                        isOverdue={lead.timestamp < now}
                        now={now}
                        onSelect={onSelect}
                    />
                ))}
                {leads.length === 0 && (
                    <div className="p-5 text-center opacity-40 text-xs font-bold text-text-muted  tracking-widest">No matching leads</div>
                )}
            </div>
        </div>
    );
};
