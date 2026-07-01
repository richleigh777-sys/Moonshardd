import React from 'react';
import { SmartLead } from '../../types/uiState';

interface LeadCardProps {
  lead: SmartLead;
  index: number;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, index }) => {
  const handleCall = async () => {
    console.log('Calling:', lead.customer);
    // Implement calling logic
  };

  const handleText = async () => {
    console.log('Texting:', lead.customer);
    // Implement texting logic
  };

  const handleSkip = () => {
    console.log('Skipping:', lead.id);
    // Implement skip logic
  };

  return (
    <div className="border-l-4 border-blue-500 bg-slate-800 rounded p-4 hover:bg-slate-700 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-text-secondary">#{index}</span>
            <h4 className="font-bold text-white text-lg">{lead.customer}</h4>
          </div>
          {lead.callbackTime && (
            <p className="text-sm text-text-secondary mt-1">
              📞 Callback: {new Date(lead.callbackTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          )}
        </div>
        <span className="text-lg font-bold text-green-400">${lead.amount}</span>
      </div>

      {lead.reason && (
        <p className="text-sm text-text-primary mb-3">
          <span className="font-semibold">Status:</span> {lead.reason}
        </p>
      )}

      {lead.suggestedScript && (
        <div className="mb-3 bg-slate-900 rounded p-3 border border-slate-600">
          <p className="text-sm font-semibold text-text-secondary uppercase mb-1">💬 Script</p>
          <p className="text-sm text-text-primary italic">"{lead.suggestedScript}"</p>
        </div>
      )}

      <div className="flex gap-2 mt-3">
        <button
          onClick={handleCall}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition-colors"
        >
          📞 CALL
        </button>
        <button
          onClick={handleText}
          className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 rounded transition-colors"
        >
          💬 TEXT
        </button>
        <button
          onClick={handleSkip}
          className="px-3 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="mt-3 flex gap-2 text-sm text-text-secondary">
        <span>Score: {lead.score}/100</span>
        <span>•</span>
        <span>Conversion: {lead.conversionProbability}%</span>
      </div>
    </div>
  );
};
