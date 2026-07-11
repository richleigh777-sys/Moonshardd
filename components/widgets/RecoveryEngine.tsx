
import React, { useState, useEffect, useMemo } from 'react';
import { 
    ShieldCheck, AlertTriangle, Archive, CheckCircle, RefreshCcw, Link as LinkIcon, DollarSign, Phone, PlaySquare
} from 'lucide-react';
import { Sale } from '../../types';
import { Button, Card } from '../ui/Base';
import { sfx } from '../../lib/soundService';
import { useSystem } from '../../hooks/useSystem';
import { MaskedData } from '../ui/MaskedData';

interface Props {
  sales: Sale[];
  onAction: (sale: Sale, action: string) => void;
}

// Enterprise Recovery Logic (Dunning)
const useDunningLogic = (sales: Sale[]) => {
    const [now] = useState(() => Date.now());
    return useMemo(() => {
        return sales
            .filter(s => s.status === 'Declined' || s.status === 'Rescue In Progress')
            .map(s => {
                const timeDiff = now - (s.declineTimestamp || s.timestamp);
                const hoursOld = timeDiff / (1000 * 60 * 60);
                
                // Advanced scoring based on enterprise parameters
                let score = 100;
                let recommendedAction = 'Call Customer immediately';
                
                if (hoursOld > 24) score -= 20;
                if (hoursOld > 72) score -= 30;
                
                const reason = (s.declineReason || '').toLowerCase();
                
                if (reason.includes('insufficient')) {
                    score -= 15;
                    recommendedAction = 'Send "Split Payment" offer via SMS';
                } else if (reason.includes('honor') || reason.includes('bank')) {
                    recommendedAction = 'Advise customer to call bank to approve, then retry';
                } else if (reason.includes('fraud') || reason.includes('risk')) {
                    score -= 50;
                    recommendedAction = 'Mark as high risk. Request alternative payment method.';
                } else if (reason.includes('expired')) {
                    recommendedAction = 'Send Secure Update Payment Link via Email';
                }

                // Dunning Stage
                let dunningStage = 'Stage 1 (Soft)';
                if (hoursOld > 48) dunningStage = 'Stage 2 (Warning)';
                if (hoursOld > 120) dunningStage = 'Stage 3 (Final)';

                return { 
                    ...s, 
                    dunning: {
                        hoursOld,
                        score: Math.max(0, Math.min(99, Math.round(score))),
                        stage: dunningStage,
                        action: recommendedAction
                    }
                };
            })
            .sort((a, b) => b.dunning.score - a.dunning.score);
    }, [sales, now]);
};

export const RecoveryEngine = ({ sales, onAction }: Props) => {
  
  const { setToast } = useSystem();
  
  const dunningQueue = useDunningLogic(sales);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionProcessing, setActionProcessing] = useState<string | null>(null);

  // Metrics
  const totalAtRisk = dunningQueue.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const highProbabilityCount = dunningQueue.filter(s => s.dunning.score >= 70).length;

  useEffect(() => {
      if (dunningQueue.length > 0 && !selectedId) {
          setSelectedId(dunningQueue[0].id);
      }
  }, [dunningQueue, selectedId]);

  const activeRecord = useMemo(() => dunningQueue.find(op => op.id === selectedId), [dunningQueue, selectedId]);

  const handleSimulateAction = (actionName: string, icon: any, successMessage: string) => {
      sfx.playClick();
      setActionProcessing(actionName);
      setTimeout(() => {
          setToast({ title: 'Dunning Action Executed', message: successMessage, type: 'success' });
          setActionProcessing(null);
          sfx.playSuccess();
          if (activeRecord && actionName === 'Recover') {
             onAction(activeRecord, 'resurrect');
          }
      }, 1500);
  };

  if (dunningQueue.length === 0) {
      return (
        <Card variant="panel" className="h-full flex flex-col items-center justify-center p-5 opacity-50 border-dashed border-border-subtle bg-surface-alt/10">
            <div className="w-20 h-20 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20 shadow-sm">
                <ShieldCheck size={40} className="text-status-success" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-[700] text-text-primary tracking-[0.25em] uppercase">Zero Revenue Leakage</h3>
            <p className="text-text-muted text-xs font-bold mt-1">All payment failures resolved.</p>
        </Card>
      );
  }

  return (
    <Card variant="panel" className="flex flex-col h-full overflow-hidden p-0 relative border-border-subtle bg-surface-main">
        {/* Header / KPI Bar */}
        <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-surface-main/50 backdrop-blur-md z-10 shrink-0">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
                    <RefreshCcw size={20} className="text-rose-500" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest">Revenue Recovery Center</h2>
                    <p className="text-xs text-text-muted font-medium">Automated Dunning & Exception Handling</p>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest">At-Risk Pipeline</span>
                    <span className="text-sm font-mono font-bold text-rose-400">${totalAtRisk.toLocaleString()}</span>
                </div>
                <div className="w-px h-8 bg-border-subtle"></div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest">High Probability</span>
                    <span className="text-sm font-mono font-bold text-emerald-400">{highProbabilityCount} Records</span>
                </div>
            </div>
        </div>

        <div className="flex flex-1 min-h-0">
            {/* Left: Dunning Queue */}
            <div className="w-96 border-r border-border-subtle flex flex-col bg-surface-alt/10 shrink-0">
                <div className="p-3 border-b border-border-subtle bg-surface-alt/20 flex justify-between items-center text-xs font-bold text-text-muted uppercase tracking-wider">
                    <span>Queue ({dunningQueue.length})</span>
                    <span>Health Score</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {dunningQueue.map(record => {
                        const isSelected = record.id === selectedId;
                        const isHigh = record.dunning.score >= 70;
                        const isLow = record.dunning.score <= 40;
                        
                        return (
                            <button
                                key={record.id}
                                onClick={() => { setSelectedId(record.id); sfx.playClick(); }}
                                className={`w-full text-left p-4 border-b border-border-subtle/50 transition-all hover:bg-surface-alt group relative ${isSelected ? 'bg-surface-alt/30 border-l-2 border-l-accent-primary shadow-inner' : 'border-l-2 border-l-transparent'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="min-w-0 pr-2">
                                        <span className={`font-bold text-sm block truncate ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}>{record.customer}</span>
                                        <div className="text-[11px] font-mono text-text-muted block mt-1" onClick={(e) => e.stopPropagation()}>
                                            <MaskedData value={record.phone} type="phone" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end shrink-0">
                                        <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded border ${isHigh ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : isLow ? 'text-rose-400 border-rose-500/30 bg-rose-500/10' : 'text-amber-400 border-amber-500/30 bg-amber-500/10'}`}>
                                            {record.dunning.score} / 99
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-3">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5 truncate max-w-[150px]">
                                        <AlertTriangle size={12} className={isLow ? 'text-rose-500' : 'text-amber-500'} /> 
                                        {record.declineReason || 'Unknown Error'}
                                    </span>
                                    <span className="text-xs font-mono font-bold text-text-primary">${Number(record.amount).toLocaleString()}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Right: Recovery Operations Desk */}
            <div className="flex-1 flex flex-col bg-surface-main relative min-w-0">
                {activeRecord ? (
                    <>
                        {/* Selected Header */}
                        <div className="p-5 border-b border-border-subtle bg-surface-alt/10">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-xl font-bold text-text-primary tracking-tight">{activeRecord.customer}</h2>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                            {activeRecord.dunning.stage}
                                        </span>
                                    </div>
                                    <p className="text-sm font-mono text-text-muted flex items-center gap-2">
                                        <DollarSign size={14} /> {Number(activeRecord.amount).toLocaleString()} USD • Failed {Math.round(activeRecord.dunning.hoursOld)} hours ago
                                    </p>
                                </div>
                                <Button variant="secondary" className="text-xs border-border-subtle" onClick={() => onAction(activeRecord, 'delete')}>
                                    <Archive size={14} className="mr-2" /> Archive Record
                                </Button>
                            </div>

                            {/* Gateway Diagnostic */}
                            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 font-mono text-xs text-neutral-300 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                                <div className="flex justify-between items-center mb-2 text-neutral-500 uppercase tracking-widest text-[10px]">
                                    <span>Gateway Diagnostic Response</span>
                                    <span>{new Date(activeRecord.declineTimestamp || activeRecord.timestamp).toISOString()}</span>
                                </div>
                                <div className="text-rose-400 font-bold mb-1">
                                    [ERR_DECLINED] : {activeRecord.declineReason || 'Transaction rejected by issuing bank.'}
                                </div>
                                <div className="text-neutral-400">
                                    Recommended System Action: <span className="text-indigo-400">{activeRecord.dunning.action}</span>
                                </div>
                            </div>
                        </div>

                        {/* Operations Layout */}
                        <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
                            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">Recovery Tools</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                {/* Send Payment Link */}
                                <div 
                                    onClick={() => handleSimulateAction('Payment Link', LinkIcon, 'Secure payment link sent via SMS and Email.')}
                                    className="p-4 rounded-xl border border-border-subtle bg-surface-alt/20 hover:bg-surface-alt/40 transition-colors cursor-pointer group flex flex-col items-center text-center gap-3 relative overflow-hidden"
                                >
                                    {actionProcessing === 'Payment Link' && <div className="absolute inset-0 bg-indigo-500/20 animate-pulse z-0"></div>}
                                    <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform relative z-10">
                                        <LinkIcon size={24} />
                                    </div>
                                    <div className="relative z-10">
                                        <h4 className="text-sm font-bold text-text-primary">Send Update Link</h4>
                                        <p className="text-[11px] text-text-muted mt-1">Dispatches secure 1-click URL</p>
                                    </div>
                                </div>

                                {/* Automated Dunning */}
                                <div 
                                    onClick={() => handleSimulateAction('Dunning Sequence', RefreshCcw, 'Enrolled in 7-day automated recovery sequence.')}
                                    className="p-4 rounded-xl border border-border-subtle bg-surface-alt/20 hover:bg-surface-alt/40 transition-colors cursor-pointer group flex flex-col items-center text-center gap-3 relative overflow-hidden"
                                >
                                    {actionProcessing === 'Dunning Sequence' && <div className="absolute inset-0 bg-amber-500/20 animate-pulse z-0"></div>}
                                    <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform relative z-10">
                                        <RefreshCcw size={24} />
                                    </div>
                                    <div className="relative z-10">
                                        <h4 className="text-sm font-bold text-text-primary">Start Dunning Sequence</h4>
                                        <p className="text-[11px] text-text-muted mt-1">Automated retry & email flow</p>
                                    </div>
                                </div>

                                {/* Manual Call */}
                                <div 
                                    onClick={() => handleSimulateAction('Schedule Call', Phone, 'Placed in priority callback queue.')}
                                    className="p-4 rounded-xl border border-border-subtle bg-surface-alt/20 hover:bg-surface-alt/40 transition-colors cursor-pointer group flex flex-col items-center text-center gap-3 relative overflow-hidden"
                                >
                                    {actionProcessing === 'Schedule Call' && <div className="absolute inset-0 bg-blue-500/20 animate-pulse z-0"></div>}
                                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform relative z-10">
                                        <Phone size={24} />
                                    </div>
                                    <div className="relative z-10">
                                        <h4 className="text-sm font-bold text-text-primary">Log Manual Call</h4>
                                        <p className="text-[11px] text-text-muted mt-1">Add to dialer rhythm</p>
                                    </div>
                                </div>

                                {/* Force Approve (Simulated) */}
                                <div 
                                    onClick={() => handleSimulateAction('Recover', CheckCircle, 'Payment processed successfully.')}
                                    className="p-4 rounded-xl border border-border-subtle bg-surface-alt/20 hover:bg-surface-alt/40 transition-colors cursor-pointer group flex flex-col items-center text-center gap-3 relative overflow-hidden"
                                >
                                    {actionProcessing === 'Recover' && <div className="absolute inset-0 bg-emerald-500/20 animate-pulse z-0"></div>}
                                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform relative z-10">
                                        <DollarSign size={24} />
                                    </div>
                                    <div className="relative z-10">
                                        <h4 className="text-sm font-bold text-text-primary">Force Retry/Approve</h4>
                                        <p className="text-[11px] text-text-muted mt-1">Manually re-run gateway</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-text-muted opacity-40">
                        <PlaySquare size={48} strokeWidth={1} className="mb-4" />
                        <p className="text-xs font-bold uppercase tracking-widest">Select record for recovery operations</p>
                    </div>
                )}
            </div>
        </div>
    </Card>
  );
};

