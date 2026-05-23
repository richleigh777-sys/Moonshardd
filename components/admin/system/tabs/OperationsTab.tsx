
import React, { useState } from 'react';
import { Clock, Coffee, Activity, AlertCircle, Calendar, ShieldCheck, Database, Search } from 'lucide-react';
import { SectionHeader } from '../SectionHeader';
import { ShiftVisualizer } from '../ShiftVisualizer';
import { Input } from '../../../ui/Base';
import { SystemConfig } from '../../../../types';

interface OperationsTabProps {
    config: SystemConfig;
    onChange: (field: keyof SystemConfig, value: any) => void;
}

export const OperationsTab: React.FC<OperationsTabProps> = ({ config, onChange }) => {
    const [isAuditing, setIsAuditing] = useState(false);
    const [auditResult, setAuditResult] = useState<{ score: number, issues: string[] } | null>(null);

    const runAudit = () => {
        setIsAuditing(true);
        setTimeout(() => {
            // Simulated audit logic
            setAuditResult({
                score: 94,
                issues: [
                    "3 legacy sales records missing attribution IDs",
                    "Ghost session detected in Server 002",
                    "Encryption vector rotation recommended"
                ]
            });
            setIsAuditing(false);
        }, 2000);
    };

    return (
        <section className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-12">
            <div>
                <SectionHeader icon={Clock} title="Temporal Operations" sub="Shift Logic & Time Tracking" color="text-blue-500" />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* SHIFT CONFIGURATION */}
                    <div className="space-y-6 p-6 bg-surface-alt/20 rounded-[2rem] border border-border-subtle relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Clock size={120} />
                        </div>

                        <div className="relative z-10 space-y-4">
                            <h4 className="text-xs font-[700]  text-text-primary tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Daily Cycle
                            </h4>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-text-muted  tracking-wider ml-1">Start Time</label>
                                    <Input 
                                        type="time" 
                                        value={config.shiftStart} 
                                        onChange={e => onChange('shiftStart', e.target.value)} 
                                        className="h-12 text-center font-mono font-bold text-lg bg-surface-main border-border-subtle" 
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-text-muted  tracking-wider ml-1">End Time</label>
                                    <Input 
                                        type="time" 
                                        value={config.shiftEnd} 
                                        onChange={e => onChange('shiftEnd', e.target.value)} 
                                        className="h-12 text-center font-mono font-bold text-lg bg-surface-main border-border-subtle" 
                                    />
                                </div>
                            </div>

                            <ShiftVisualizer start={config.shiftStart} end={config.shiftEnd} />
                            
                            <div className="pt-4 border-t border-border-subtle/50">
                                <div className="flex items-center justify-between p-3 bg-surface-main rounded-xl border border-border-subtle">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-500/10 rounded-lg text-status-warning">
                                            <Coffee size={16}/>
                                        </div>
                                        <div>
                                            <p className="text-xs font-[700]  text-text-primary">Break Allowance</p>
                                            <p className="text-xs text-text-muted">Max paid downtime</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                            type="number" 
                                            value={config.breakDurationMinutes} 
                                            onChange={e => onChange('breakDurationMinutes', parseInt(e.target.value))} 
                                            className="w-16 bg-surface-alt border border-border-subtle rounded-lg py-1.5 text-center text-xs font-bold outline-none focus:border-amber-500"
                                        />
                                        <span className="text-xs font-bold text-text-muted ">Min</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* PERIOD & THRESHOLDS */}
                    <div className="space-y-6">
                        <div className="p-6 bg-surface-alt/20 rounded-[2rem] border border-border-subtle space-y-4">
                            <h4 className="text-xs font-[700]  text-text-primary tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Payroll Cycles
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-text-muted  tracking-wider ml-1">Cycle 1 Cutoff</label>
                                    <div className="relative group">
                                        <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-status-success transition-colors" />
                                        <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                            type="number" 
                                            value={config.cutoffDay1} 
                                            onChange={e => onChange('cutoffDay1', parseInt(e.target.value))} 
                                            className="w-full bg-surface-main border border-border-subtle rounded-xl py-3 pl-10 pr-3 text-sm font-bold outline-none focus:border-emerald-500 transition-all" 
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">DAY</span>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-text-muted  tracking-wider ml-1">Cycle 2 Cutoff</label>
                                    <div className="relative group">
                                        <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-status-success transition-colors" />
                                        <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                            type="number" 
                                            value={config.cutoffDay2} 
                                            onChange={e => onChange('cutoffDay2', parseInt(e.target.value))} 
                                            className="w-full bg-surface-main border border-border-subtle rounded-xl py-3 pl-10 pr-3 text-sm font-bold outline-none focus:border-emerald-500 transition-all" 
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">DAY</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-text-muted bg-surface-main p-2 rounded-lg border border-border-subtle flex items-center gap-2">
                                <AlertCircle size={16} className="text-status-success"/>
                                Payroll auto-locks at 23:59 on configured cutoff days.
                            </p>
                        </div>

                        <div className="p-6 bg-surface-alt/20 rounded-[2rem] border border-border-subtle space-y-4">
                             <h4 className="text-xs font-[700]  text-text-primary tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Compliance
                            </h4>
                            <div className="flex items-center justify-between p-3 bg-surface-main rounded-xl border border-border-subtle">
                                 <div className="flex items-center gap-3">
                                     <div className="p-2 bg-red-500/10 rounded-lg text-status-error">
                                         <Activity size={16}/>
                                     </div>
                                     <div>
                                         <p className="text-xs font-[700]  text-text-primary">Overtime Limit</p>
                                         <p className="text-xs text-text-muted">Weekly hour cap</p>
                                     </div>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                        type="number" 
                                        value={config.overtimeThreshold || 40} 
                                        onChange={e => onChange('overtimeThreshold', parseInt(e.target.value))} 
                                        className="w-16 bg-surface-alt border border-border-subtle rounded-lg py-1.5 text-center text-xs font-bold outline-none focus:border-red-500"
                                    />
                                    <span className="text-xs font-bold text-text-muted ">Hrs</span>
                                 </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* DATA INTEGRITY SECTION */}
            <div className="pt-8 border-t border-border-subtle/50">
                <SectionHeader icon={ShieldCheck} title="Data Integrity" sub="Clean Data Protocols & Audit" color="text-status-success" />
                
                <div className="bg-surface-alt/20 rounded-[2rem] border border-border-subtle p-8 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
                    
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="space-y-4 max-w-md">
                            <h4 className="text-sm font-[700]  tracking-widest text-text-primary">Global Ledger Audit</h4>
                            <p className="text-xs text-text-secondary leading-relaxed">
                                Never underestimate clean data. Our automated audit scanning identifies inaccuracies, shadow records, and protocol breaches across your entire CRM infrastructure.
                            </p>
                            <button 
                                onClick={runAudit}
                                disabled={isAuditing}
                                className="px-6 py-3 bg-emerald-500 text-surface-main font-[700]  text-xs tracking-widest rounded-xl hover:brightness-110 active:scale-95 disabled:opacity-50 flex items-center gap-2 transition-all"
                            >
                                {isAuditing ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-surface-main border-t-transparent rounded-full animate-spin"></div>
                                        Auditing...
                                    </>
                                ) : (
                                    <>
                                        <Search size={16} />
                                        Initialize Audit
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                            <div className="p-4 bg-surface-main rounded-2xl border border-border-subtle flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-[700] text-text-muted  tracking-tighter">Sync Integrity</p>
                                    <p className="text-xl font-[700] text-status-success">{auditResult ? auditResult.score : '--'}%</p>
                                </div>
                                <Database size={24} className="text-status-success/20" />
                            </div>
                            <div className="p-4 bg-surface-main rounded-2xl border border-border-subtle relative overflow-hidden">
                                <div className="space-y-2 relative z-10">
                                    <p className="text-sm font-[700] text-text-muted  tracking-tighter">Active Protocols</p>
                                    <div className="flex flex-wrap gap-1">
                                        <span className="px-3 py-1.5 bg-blue-500/10 text-blue-500 text-sm font-[700] rounded ">AES-256</span>
                                        <span className="px-3 py-1.5 bg-emerald-500/10 text-status-success text-sm font-[700] rounded ">TLS 1.3</span>
                                        <span className="px-3 py-1.5 bg-amber-500/10 text-status-warning text-sm font-[700] rounded ">MFA-ENFORCED</span>
                                    </div>
                                </div>
                            </div>

                            {auditResult && (
                                <div className="sm:col-span-2 p-4 bg-red-500/5 border border-red-500/10 rounded-2xl space-y-2 animate-in slide-in-from-top-2 duration-300">
                                    <p className="text-sm font-[700] text-status-error  flex items-center gap-2">
                                        <AlertCircle size={16} />
                                        Detected Discrepancies
                                    </p>
                                    <ul className="space-y-1">
                                        {auditResult.issues.map((issue, i) => (
                                            <li key={i} className="text-xs text-text-secondary flex items-start gap-2">
                                                <span className="w-1 h-1 bg-red-500 rounded-full mt-1.5 shrink-0"></span>
                                                {issue}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

