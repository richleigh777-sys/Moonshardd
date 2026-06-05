import React, { useState } from 'react';
import { useSmartLeadQueue } from '../../hooks/useSmartLeadQueue';
import { SmartLead } from '../../types/uiState';
import { nexusGateway } from '../../nexus/adapters/DataGateway';
import { sfx } from '../../lib/soundService';
import { Phone, Mail, MessageSquare, X } from 'lucide-react';

export const SmartLeadQueue: React.FC = () => {
  const leads = useSmartLeadQueue();
  const [isInjecting, setIsInjecting] = useState(false);
  const [selectedLead, setSelectedLead] = useState<SmartLead | null>(null);

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
    <div className="min-h-full bg-surface-alt p-6 md:p-10 pb-24 font-sans text-text-primary">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
           <div>
             <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Customers</h1>
             <p className="text-sm font-medium text-text-muted mt-1 uppercase tracking-widest">Active Relationships</p>
           </div>
           <button 
             onClick={handleInjectMockLeads} 
             disabled={isInjecting}
             className="px-4 py-2.5 bg-surface-main text-accent-primary font-bold text-xs uppercase tracking-wider rounded-xl border border-border-subtle shadow-sm hover:shadow-panel disabled:opacity-50 transition-all flex items-center justify-center cursor-pointer"
           >
             {isInjecting ? 'Loading...' : '+ Inject Mock Data'}
           </button>
        </div>

        {leads.length === 0 ? (
          <div className="text-center py-24 bg-surface-main rounded-3xl border border-border-subtle shadow-sm">
            <p className="text-text-muted text-lg font-semibold">No customers found.</p>
            <p className="text-text-muted text-sm mt-1">Try injecting mock data or adding one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {leads.map(lead => (
               <div 
                 key={lead.id} 
                 onClick={() => setSelectedLead(lead)}
                 className="bg-surface-main border border-border-subtle p-5 rounded-2xl hover:shadow-float hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
               >
                 <div>
                   <h3 className="font-bold text-text-primary text-lg truncate">{lead.name}</h3>
                   <div className="mt-4 flex items-center gap-2">
                     <span className={`w-2 h-2 rounded-full ${lead.priority === 'urgent' ? 'bg-status-error animate-pulse' : lead.priority === 'high' ? 'bg-status-warning' : 'bg-status-success'}`}></span>
                     <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">{lead.status}</span>
                   </div>
                 </div>
                 <div className="mt-6 text-xs font-medium text-text-muted">
                    {lead.interactionCount > 0 ? `Contacted ${lead.interactionCount} times` : 'Never Contacted'}
                 </div>
               </div>
            ))}
          </div>
        )}
      </div>

      {/* The "Everything Card" Modal */}
      {selectedLead && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-surface-alt/80 backdrop-blur-sm" onClick={() => setSelectedLead(null)}></div>
            <div className="relative w-full max-w-md bg-surface-main rounded-3xl shadow-float border border-border-strong p-8 animate-in zoom-in-95 duration-200">
               <button onClick={() => setSelectedLead(null)} className="absolute top-6 right-6 text-text-muted hover:text-text-primary transition-colors">
                  <X size={24} />
               </button>
               
               <div className="mb-8">
                 <h2 className="text-2xl font-extrabold text-text-primary">{selectedLead.name}</h2>
                 <p className="text-sm font-semibold text-text-muted mt-1">{selectedLead.phone || 'No phone number'}</p>
               </div>

               {/* Action Icons */}
               <div className="flex justify-center gap-6 mb-8">
                  <button className="flex-1 flex flex-col items-center justify-center gap-2 max-w-[80px] hover:text-accent-primary group transition-colors">
                     <div className="w-14 h-14 rounded-full bg-surface-alt border border-border-subtle flex items-center justify-center group-hover:border-accent-primary/40 group-hover:bg-accent-primary/10 transition-colors">
                       <Phone size={20} className="text-text-primary group-hover:text-accent-primary" />
                     </div>
                     <span className="text-xs font-bold text-text-muted">Call</span>
                  </button>
                  <button className="flex-1 flex flex-col items-center justify-center gap-2 max-w-[80px] hover:text-accent-primary group transition-colors">
                     <div className="w-14 h-14 rounded-full bg-surface-alt border border-border-subtle flex items-center justify-center group-hover:border-accent-primary/40 group-hover:bg-accent-primary/10 transition-colors">
                       <MessageSquare size={20} className="text-text-primary group-hover:text-accent-primary" />
                     </div>
                     <span className="text-xs font-bold text-text-muted">Message</span>
                  </button>
                  <button className="flex-1 flex flex-col items-center justify-center gap-2 max-w-[80px] hover:text-accent-primary group transition-colors">
                     <div className="w-14 h-14 rounded-full bg-surface-alt border border-border-subtle flex items-center justify-center group-hover:border-accent-primary/40 group-hover:bg-accent-primary/10 transition-colors">
                       <Mail size={20} className="text-text-primary group-hover:text-accent-primary" />
                     </div>
                     <span className="text-xs font-bold text-text-muted">Email</span>
                  </button>
               </div>

               {/* Thread / Notes */}
               <div>
                  <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">Activity Log</h3>
                  <div className="space-y-4 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                     <div className="bg-surface-alt p-4 rounded-xl border border-border-subtle">
                        <p className="text-sm font-semibold text-text-primary">System Note</p>
                        <p className="text-xs text-text-muted mt-1 leading-relaxed">Lead created and assigned tracking score {selectedLead.score.toFixed(0)}.</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
