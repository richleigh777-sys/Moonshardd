import React, { useState } from 'react';
import { useSmartLeadQueue } from '../../hooks/useSmartLeadQueue';
import { SmartLead, LeadPriority } from '../../types/uiState';
import { LeadCard } from './LeadCard';
import { nexusGateway } from '../../nexus/adapters/DataGateway';
import { sfx } from '../../lib/soundService';

export const SmartLeadQueue: React.FC = () => {
  const leads = useSmartLeadQueue();
  const [expandedSection, setExpandedSection] = useState<LeadPriority>('urgent');
  const [isInjecting, setIsInjecting] = useState(false);

  const groupedLeads = {
    urgent: leads.filter((l) => l.priority === 'urgent'),
    high: leads.filter((l) => l.priority === 'high'),
    standard: leads.filter((l) => l.priority === 'standard'),
    low: leads.filter((l) => l.priority === 'low'),
  };

  const handleInjectMockLeads = async () => {
    setIsInjecting(true);
    try {
      await nexusGateway.injectSampleLeads();
      sfx.playSuccess();
    } catch (e) {
      sfx.playDecline();
      console.error(e);
    } finally {
      setIsInjecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-2">
           <h1 className="text-2xl font-bold text-white">Lead Queue</h1>
           <button 
             onClick={handleInjectMockLeads} 
             disabled={isInjecting}
             className="px-3 py-1 bg-indigo-500/20 text-indigo-400 font-bold text-xs uppercase tracking-wider rounded border border-indigo-500/30 hover:bg-indigo-500/30 disabled:opacity-50 transition-colors"
           >
             {isInjecting ? 'Loading...' : '+ Inject 20 Mock Leads'}
           </button>
        </div>
        <p className="text-slate-400 mb-6">Prioritized by score and urgency</p>

        {/* URGENT */}
        <LeadSection
          title="🔴 Callbacks Due Soon"
          leads={groupedLeads.urgent}
          color="red"
          isExpanded={expandedSection === 'urgent'}
          onToggle={() => setExpandedSection(expandedSection === 'urgent' ? 'high' : 'urgent')}
        />

        {/* HIGH */}
        <LeadSection
          title="🟡 High Priority Leads"
          leads={groupedLeads.high}
          color="yellow"
          isExpanded={expandedSection === 'high'}
          onToggle={() => setExpandedSection(expandedSection === 'high' ? 'standard' : 'high')}
        />

        {/* STANDARD */}
        <LeadSection
          title="⚪ Standard Queue"
          leads={groupedLeads.standard}
          color="slate"
          isExpanded={expandedSection === 'standard'}
          onToggle={() => setExpandedSection(expandedSection === 'standard' ? 'low' : 'standard')}
        />

        {/* LOW */}
        <LeadSection
          title="⬜ Lower Priority"
          leads={groupedLeads.low}
          color="gray"
          isExpanded={expandedSection === 'low'}
          onToggle={() => setExpandedSection(expandedSection === 'low' ? 'urgent' : 'low')}
        />

        {leads.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No leads in queue</p>
            <p className="text-slate-500 text-sm mt-2">Great work! You're all caught up.</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface LeadSectionProps {
  title: string;
  leads: SmartLead[];
  color: 'red' | 'yellow' | 'slate' | 'gray';
  isExpanded: boolean;
  onToggle: () => void;
}

const LeadSection: React.FC<LeadSectionProps> = ({ title, leads, color, isExpanded, onToggle }) => {
  const borderColor = {
    red: 'border-red-600',
    yellow: 'border-yellow-600',
    slate: 'border-slate-600',
    gray: 'border-gray-600',
  }[color];

  const bgColor = {
    red: 'bg-red-900 bg-opacity-20',
    yellow: 'bg-yellow-900 bg-opacity-20',
    slate: 'bg-slate-700 bg-opacity-20',
    gray: 'bg-gray-700 bg-opacity-20',
  }[color];

  return (
    <div className={`mb-4 border ${borderColor} rounded-lg overflow-hidden ${bgColor}`}>
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between font-semibold text-white hover:bg-black hover:bg-opacity-20 transition-colors"
      >
        <div>
          {title}
          <span className="ml-3 inline-block bg-slate-700 px-2 py-1 rounded text-sm">
            {leads.length}
          </span>
        </div>
        <span className="text-2xl">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && leads.length > 0 && (
        <div className="space-y-3 p-4 border-t border-opacity-20">
          {leads.map((lead, index) => (
            <LeadCard key={lead.id} lead={lead} index={index + 1} />
          ))}
        </div>
      )}

      {isExpanded && leads.length === 0 && (
        <div className="p-4 text-slate-400 text-center italic">No leads in this category</div>
      )}
    </div>
  );
};
