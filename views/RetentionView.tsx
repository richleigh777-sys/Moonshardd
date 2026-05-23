
import React, { useState, useMemo } from 'react';
import { 
    PhoneOutgoing, Clock, 
    AlertTriangle, ShieldCheck, User, Activity, Star, 
    BarChart2 
} from 'lucide-react';
import { Sale } from '../types';
import { RETENTION_SCHEDULE } from '../constants';
import { Card } from '../components/ui/Base';

interface RetentionViewProps {
    sales: Sale[];
    onLoadToEnrollment?: (sale: Sale) => void;
    onAction?: (sale: Sale, action: string) => void;
}

export const RetentionView: React.FC<RetentionViewProps> = ({ sales, onLoadToEnrollment, onAction }) => {
  const [filterMode, setFilterMode] = useState<'All' | 'High Risk' | 'Upcoming' | 'VIP'>('All');

  // --- DATA PROCESSING ---
  const [today] = useState(() => Date.now());
  const retentionData = useMemo(() => {
      const active = sales.filter(s => s.status === 'Approved');
      const ONE_DAY = 86400000;

      return active.map(customer => {
          const daysSince = Math.floor((today - customer.timestamp) / ONE_DAY);
          const nextMilestone = RETENTION_SCHEDULE.find(s => s.days >= daysSince) || RETENTION_SCHEDULE[RETENTION_SCHEDULE.length - 1];
          const daysUntilNext = nextMilestone.days - daysSince;
          
          let health = 100 - daysSince; 
          if (health < 0) health = 0;
          if (customer.amount > 1000) health += 10; 

          let riskLevel = 'Low';
          if (daysSince > 60) riskLevel = 'High';
          else if (daysSince > 45) riskLevel = 'Medium';

          return {
              ...customer,
              metrics: {
                  daysSince,
                  daysUntilNext,
                  nextAction: nextMilestone.label,
                  health: Math.min(100, health),
                  riskLevel
              }
          };
      }).sort((a, b) => a.metrics.daysUntilNext - b.metrics.daysUntilNext); 
  }, [sales, today]);

  // --- FILTERING ---
  const filteredList = useMemo(() => {
      switch (filterMode) {
          case 'High Risk': return retentionData.filter(c => c.metrics.riskLevel === 'High');
          case 'Upcoming': return retentionData.filter(c => c.metrics.daysUntilNext <= 7 && c.metrics.daysUntilNext >= -7);
          case 'VIP': return retentionData.filter(c => c.amount >= 1000);
          default: return retentionData;
      }
  }, [retentionData, filterMode]);

  // --- STATS SUMMARY ---
  const summary = useMemo(() => {
    const total = retentionData.length;
    const highRisk = retentionData.filter(c => c.metrics.riskLevel === 'High').length;
    const avgHealth = total > 0 ? Math.round(retentionData.reduce((acc, c) => acc + c.metrics.health, 0) / total) : 0;
    return { total, highRisk, avgHealth };
  }, [retentionData]);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 overflow-hidden">
      
      {/* 1. NANO METRIC STRIP & TOOLBAR */}
      <div className="flex items-center justify-between bg-surface-main border border-border-subtle rounded-2xl p-2 mb-3 shrink-0 shadow-sm">
          <div className="flex items-center gap-4 px-3">
              <div className="flex items-center gap-2 border-r border-border-subtle pr-4">
                  <div className="w-2 h-2 rounded-full bg-status-success animate-pulse"></div>
                  <span className="text-xs font-[700]  text-text-primary tracking-tight">Retention Pulse</span>
              </div>
              
              <div className="flex items-center gap-4 text-xs font-bold text-text-muted  tracking-widest">
                  <span className="flex items-center gap-1.5"><User size={16}/> {summary.total} Active</span>
                  <span className="flex items-center gap-1.5 text-status-error"><Activity size={16}/> {summary.highRisk} Risk</span>
                  <span className="flex items-center gap-1.5 text-accent-primary"><BarChart2 size={16}/> {summary.avgHealth}% Health</span>
              </div>
          </div>

          <div className="flex items-center gap-1 bg-surface-alt rounded-xl p-1">
              {(['All', 'Upcoming', 'High Risk', 'VIP'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setFilterMode(mode)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-[700]  tracking-wider transition-all ${
                        filterMode === mode 
                        ? 'bg-white text-accent-primary shadow-sm ring-1 ring-border-subtle' 
                        : 'text-text-muted hover:text-text-primary hover:bg-surface-main/50'
                    }`}
                  >
                      {mode}
                  </button>
              ))}
          </div>
      </div>

      {/* 2. TACTICAL DATA GRID */}
      <Card variant="panel" className="flex-1 overflow-hidden p-0 relative border-border-subtle">
        <div className="overflow-y-auto custom-scrollbar h-full bg-surface-alt/10">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-surface-main/95 backdrop-blur-md border-b border-border-subtle z-10 grid grid-cols-12 gap-4 px-6 py-3 text-xs font-[700]  text-text-muted tracking-[0.2em] shadow-sm">
                <div className="col-span-3">Target Identity</div>
                <div className="col-span-2 text-center">Health Meter</div>
                <div className="col-span-3 text-center">Protocol Phase</div>
                <div className="col-span-2 text-right">Yield (LTV)</div>
                <div className="col-span-2 text-right">Direct Action</div>
            </div>

            <div className="p-2 space-y-1">
                {filteredList.map((customer) => {
                    const { riskLevel, health, daysSince, nextAction, daysUntilNext } = customer.metrics;
                    const statusColor = riskLevel === 'High' ? 'bg-status-error' : riskLevel === 'Medium' ? 'bg-status-warning' : 'bg-status-success';
                    const isVIP = customer.amount >= 1000;

                    return (
                        <div key={customer.id} className="grid grid-cols-12 gap-4 px-4 py-2 items-center bg-surface-main hover:bg-surface-alt rounded-xl border border-transparent hover:border-border-subtle transition-all group shadow-sm">
                            
                            {/* 1. Identity */}
                            <div className="col-span-3 flex items-center gap-3 min-w-0">
                                <div className={`w-1 h-8 rounded-full shrink-0 ${statusColor}`}></div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-xs text-text-primary truncate">{customer.customer}</span>
                                        {isVIP && <Star size={16} fill="#EAB308" className="text-yellow-500 shrink-0" />}
                                    </div>
                                    <span className="text-xs text-text-muted font-mono whitespace-nowrap block mt-0.5">Active {daysSince} days</span>
                                </div>
                            </div>

                            {/* 2. Health Meter */}
                            <div className="col-span-2 flex flex-col items-center justify-center gap-1">
                                <div className="w-full max-w-[100px] h-1.5 bg-surface-alt rounded-full overflow-hidden border border-border-subtle">
                                    <div className={`h-full ${statusColor}`} style={{ width: `${health}%` }}></div>
                                </div>
                                <span className="text-xs font-mono font-bold text-text-secondary">{health}% Vitality</span>
                            </div>

                            {/* 3. Protocol */}
                            <div className="col-span-3 flex flex-col items-center justify-center">
                                <div className={`flex items-center gap-1.5 font-[700] text-xs  tracking-wider ${daysUntilNext < 0 ? 'text-status-error animate-pulse' : 'text-accent-primary'}`}>
                                    {daysUntilNext < 0 ? <AlertTriangle size={16}/> : <Clock size={16}/>}
                                    <span className="truncate max-w-[140px]">{nextAction}</span>
                                </div>
                                <span className="text-xs text-text-muted font-medium mt-0.5">Due in {daysUntilNext} days</span>
                            </div>

                            {/* 4. Value */}
                            <div className="col-span-2 text-right">
                                <span className="text-sm font-[700] text-text-primary num-font tracking-tight">${Number(customer.amount).toLocaleString()}</span>
                            </div>

                            {/* 5. Actions */}
                            <div className="col-span-2 flex justify-end gap-2">
                                <button 
                                    onClick={() => onAction && onAction(customer, 'followup')}
                                    className="p-2 rounded-lg bg-surface-alt text-text-muted hover:bg-accent-primary hover:text-white transition-all border border-border-subtle"
                                    title="Log Interaction"
                                >
                                    <PhoneOutgoing size={16} />
                                </button>
                                <button 
                                    onClick={() => onLoadToEnrollment && onLoadToEnrollment(customer)}
                                    className="px-3 h-8 flex items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-all text-xs font-semibold shadow-sm hover:shadow-md"
                                >
                                    Renew
                                </button>
                            </div>

                        </div>
                    );
                })}
                
                {filteredList.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <ShieldCheck size={48} className="mb-4 text-text-muted" strokeWidth={1} />
                        <p className="text-sm font-semibold text-text-muted">No customers found.</p>
                    </div>
                )}
            </div>
        </div>
      </Card>
    </div>
  );
};
