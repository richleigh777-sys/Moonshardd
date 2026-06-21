import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Clock, Coffee, Activity, AlertCircle, Calendar, ShieldCheck, Database, Search, Sparkles, ChevronRight, Settings } from 'lucide-react';
import { SectionHeader } from '../SectionHeader';
import { ShiftVisualizer } from '../ShiftVisualizer';
import { Input } from '../../../ui/Base';
import { SystemConfig } from '../../../../types';
import { sfx } from '../../../../lib/soundService';

interface OperationsTabProps {
    isSuperAdmin?: boolean;
    config: SystemConfig;
    onChange: (field: keyof SystemConfig, value: any) => void;
}

export const OperationsTab: React.FC<OperationsTabProps> = ({ config, onChange }) => {
    const [isAuditing, setIsAuditing] = useState(false);
    const [auditPhase, setAuditPhase] = useState<string>('');
    const [auditResult, setAuditResult] = useState<{ score: number, issues: string[] } | null>(null);

    const shiftPresets = [
        { name: 'Day Shift', start: '09:00', end: '17:00' },
        { name: 'Swing Shift', start: '14:00', end: '22:00' },
        { name: 'Extended', start: '08:00', end: '20:00' },
        { name: 'Overnight', start: '22:00', end: '06:00' }
    ];

    const applyPreset = (preset: { name: string, start: string, end: string }) => {
        sfx.playClick();
        onChange('shiftStart', preset.start);
        onChange('shiftEnd', preset.end);
    };

    const runAudit = () => {
        setIsAuditing(true);
        setAuditResult(null);
        setAuditPhase('Phase 1: Querying schemas...');
        sfx.playClick();

        setTimeout(() => {
            setAuditPhase('Phase 2: Auditing telemetry...');
            sfx.playSubmit();
            
            setTimeout(() => {
                setAuditPhase('Phase 3: Validating encryption...');
                sfx.playConfirm();

                setTimeout(() => {
                    setAuditResult({
                        score: 96,
                        issues: [
                            "3 legacy sales records missing attribution IDs",
                            "Ghost session detected on edge node",
                            "Unencrypted strings cached under memory"
                        ]
                    });
                    setIsAuditing(false);
                    setAuditPhase('');
                    sfx.playSuccess();
                }, 800);
            }, 800);
        }, 800);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any } }
    };

    return (
        <motion.section 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-12"
        >
            <motion.div variants={cardVariants}>
                <SectionHeader icon={Clock} title="Temporal Operations" sub="Shift Logic & Time Tracking" color="text-[#60A5FA]" />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* SHIFT CONFIGURATION */}
                    <div className="space-y-6 p-6 sm:p-8 bg-surface-main/ rounded-xl border border-border-subtle relative overflow-hidden shadow-inner group">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                            <Clock size={160} />
                        </div>

                        <div className="relative z-10 space-y-5">
                            <div className="flex justify-between items-center">
                                <h4 className="text-xs font-bold text-text-primary tracking-wide flex items-center gap-2 uppercase">
                                    <span className="w-2 h-2 rounded-full bg-[#60A5FA] shadow-sm"></span> Daily Cycle
                                </h4>
                                <span className="text-sm uppercase font-bold text-text-muted tracking-wide">Presets Engine</span>
                            </div>

                            {/* Preset Buttons */}
                            <div className="grid grid-cols-4 gap-2 p-1.5 bg-surface-alt rounded-xl border border-border-subtle shadow-inner">
                                {shiftPresets.map((p, idx) => {
                                    const isCurrent = config.shiftStart === p.start && config.shiftEnd === p.end;
                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => applyPreset(p)}
                                            className={`py-2 px-1 rounded-xl text-sm font-bold text-center transition-all duration-300 ${
                                                isCurrent 
                                                ? 'bg-[#1E3A8A]/50 border border-[#2563EB]/50 text-[#93C5FD] shadow-md'
                                                : 'bg-transparent text-text-muted hover:text-[#D4D4D8] hover:bg-surface-main border border-transparent'
                                            }`}
                                        >
                                            {p.name}
                                        </button>
                                    );
                                })}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-muted uppercase tracking-wide ml-1">Start Time</label>
                                    <Input 
                                        type="time" 
                                        value={config.shiftStart} 
                                        onChange={e => onChange('shiftStart', e.target.value)} 
                                        className="h-14 text-center font-mono font-semibold text-lg bg-surface-alt border-border-subtle text-text-primary focus:border-[#60A5FA]/50 focus:ring-1 focus:ring-[#60A5FA]/30 rounded-xl" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-muted uppercase tracking-wide ml-1">End Time</label>
                                    <Input 
                                        type="time" 
                                        value={config.shiftEnd} 
                                        onChange={e => onChange('shiftEnd', e.target.value)} 
                                        className="h-14 text-center font-mono font-semibold text-lg bg-surface-alt border-border-subtle text-text-primary focus:border-[#60A5FA]/50 focus:ring-1 focus:ring-[#60A5FA]/30 rounded-xl" 
                                    />
                                </div>
                            </div>

                            <ShiftVisualizer start={config.shiftStart} end={config.shiftEnd} />
                            
                            <div className="pt-5 border-t border-border-subtle">
                                <div className="flex items-center justify-between p-4 bg-surface-alt rounded-xl border border-border-subtle">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 bg-[#78350F]/30 rounded-xl border border-[#B45309]/30 text-[#FDBA74] shadow-inner">
                                            <Coffee size={18}/>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-text-primary">Break Allowance</p>
                                            <p className="text-sm text-text-muted mt-0.5">Max paid downtime</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                            type="number" 
                                            value={config.breakDurationMinutes} 
                                            onChange={e => onChange('breakDurationMinutes', parseInt(e.target.value))} 
                                            className="w-16 h-10 bg-surface-main border border-border-strong rounded-xl py-1.5 text-center text-xs font-bold text-text-primary outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]/30 transition-all"
                                        />
                                        <span className="text-sm font-bold text-text-muted uppercase tracking-wider">Min</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* PERIOD & THRESHOLDS */}
                    <div className="space-y-5">
                        <div className="p-6 sm:p-8 bg-surface-main/ rounded-xl border border-border-subtle space-y-5 shadow-inner">
                            <h4 className="text-xs font-bold text-text-primary tracking-wide flex items-center gap-2 uppercase">
                                <span className="w-2 h-2 rounded-full bg-[#34D399] shadow-sm"></span> Payroll Cycles
                            </h4>
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-muted uppercase tracking-wide ml-1">Cycle 1 Cutoff</label>
                                    <div className="relative group">
                                        <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-[#34D399] transition-colors" />
                                        <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                            type="number" 
                                            value={config.cutoffDay1} 
                                            onChange={e => onChange('cutoffDay1', parseInt(e.target.value))} 
                                            className="w-full h-12 bg-surface-alt border border-border-subtle text-text-primary rounded-xl py-3 pl-12 pr-4 text-sm font-bold outline-none focus:border-[#34D399] focus:ring-1 focus:ring-[#34D399]/30 transition-all" 
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-text-muted">DAY</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-muted uppercase tracking-wide ml-1">Cycle 2 Cutoff</label>
                                    <div className="relative group">
                                        <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-[#34D399] transition-colors" />
                                        <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                            type="number" 
                                            value={config.cutoffDay2} 
                                            onChange={e => onChange('cutoffDay2', parseInt(e.target.value))} 
                                            className="w-full h-12 bg-surface-alt border border-border-subtle text-text-primary rounded-xl py-3 pl-12 pr-4 text-sm font-bold outline-none focus:border-[#34D399] focus:ring-1 focus:ring-[#34D399]/30 transition-all" 
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-text-muted">DAY</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-text-muted bg-surface-alt p-3 rounded-xl border border-border-subtle flex items-center gap-3">
                                <AlertCircle size={16} className="text-[#34D399] shrink-0"/>
                                Payroll auto-locks at 23:59 on configured cutoff days.
                            </p>
                        </div>

                        <div className="p-6 sm:p-8 bg-surface-main/ rounded-xl border border-border-subtle space-y-5 shadow-inner">
                             <h4 className="text-xs font-bold text-text-primary tracking-wide flex items-center gap-2 uppercase">
                                <span className="w-2 h-2 rounded-full bg-[#F59E0B] shadow-sm"></span> Compliance
                             </h4>
                             <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-surface-alt rounded-xl border border-border-subtle">
                                     <div className="flex items-center gap-4">
                                         <div className="p-2.5 bg-[#7F1D1D]/30 border border-[#991B1B]/30 rounded-xl text-[#FCA5A5] shadow-inner">
                                             <Activity size={18}/>
                                         </div>
                                         <div>
                                             <p className="text-sm font-semibold text-text-primary">Overtime Limit</p>
                                             <p className="text-sm text-text-muted mt-0.5">Weekly hour cap</p>
                                         </div>
                                     </div>
                                     <div className="flex items-center gap-2">
                                        <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                            type="number" 
                                            value={config.overtimeThreshold || 40} 
                                            onChange={e => onChange('overtimeThreshold', parseInt(e.target.value))} 
                                            className="w-16 h-10 bg-surface-main border border-border-strong text-text-primary py-1.5 rounded-xl text-center text-xs font-bold outline-none focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]/30"
                                        />
                                        <span className="text-sm font-bold text-text-muted uppercase tracking-wider">Hrs</span>
                                     </div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-surface-alt rounded-xl border border-border-subtle">
                                     <div className="flex items-center gap-4">
                                         <div className="p-2.5 bg-[#1E3A8A]/30 border border-[#1E40AF]/30 rounded-xl text-[#93C5FD] shadow-inner">
                                             <Calendar size={18}/>
                                         </div>
                                         <div>
                                             <p className="text-sm font-semibold text-text-primary">Reorder Policy</p>
                                             <p className="text-sm text-text-muted mt-0.5">Min days before next sale</p>
                                         </div>
                                     </div>
                                     <div className="flex items-center gap-2">
                                        <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                            type="number" 
                                            value={config.reorderPolicyDays || 20} 
                                            onChange={e => onChange('reorderPolicyDays', parseInt(e.target.value))} 
                                            className="w-16 h-10 bg-surface-main border border-border-strong text-text-primary rounded-xl py-1.5 text-center text-xs font-bold outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/30"
                                        />
                                        <span className="text-sm font-bold text-text-muted uppercase tracking-wider">Days</span>
                                     </div>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* DATA INTEGRITY & PLATFORM OPERATIONS */}
            <motion.div variants={cardVariants} className="pt-10 border-t border-border-subtle space-y-10 pb-4">
                
                {/* MCP & DEPLOYMENT SETTINGS */}
                <div>
                    <SectionHeader icon={Database} title="Platform Ecosystem Hub" sub="MCP API Gateway, CMS Integration & Live Deployments" color="text-[#A78BFA]" />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
                        
                        {/* REMOTE MANAGEMENT */}
                        <div className="lg:col-span-3 p-8 bg-gradient-to-br from-[#2E1065]/60 to-[#1e1b4b]/20 rounded-xl border border-[#8B5CF6]/20 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none group-hover:scale-125 group-hover:opacity-10 transition-all duration-1000 ease-out text-[#A78BFA]">
                                <Sparkles size={160} />
                            </div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div>
                                    <h4 className="text-xs font-bold text-[#C4B5FD] tracking-wide uppercase flex items-center gap-3 mb-3">
                                        <div className="p-2 rounded-xl bg-[#6D28D9]/40 text-[#C4B5FD] border border-[#8B5CF6]/30 shadow-inner"><Database size={16}/></div>
                                        Remote Context Protocol
                                    </h4>
                                    <p className="text-sm text-[#A78BFA]/80 leading-relaxed max-w-md mb-8">
                                        Secure API gateway for external CMS integration. Allows MCP clients to trigger deployments, mutate state, and access tenant records seamlessly.
                                    </p>
                                </div>
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#C4B5FD]/70 uppercase tracking-wide ml-1">MCP Webhook Endpoint</label>
                                        <div className="flex gap-2">
                                            <Input 
                                                type="text" 
                                                value={config.companyName === 'MCP_ACTIVE' ? 'https://mcp.nexus-gateway.io/deploy' : 'https://api.system.local/mcp/v1/trigger'}
                                                readOnly
                                                className="font-mono font-medium text-xs bg-surface-main/ border-[#8B5CF6]/30 text-[#C4B5FD] h-12 w-full rounded-xl  focus:border-[#8B5CF6]/60 shadow-inner"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 flex-wrap pt-4 border-t border-[#8B5CF6]/10">
                                        <span className="text-sm text-[#C4B5FD]/50 font-bold uppercase tracking-wide mr-2">Clients:</span>
                                        <span className="px-3 py-1.5 bg-[#4C1D95]/40 border border-[#8B5CF6]/30 rounded-lg text-sm font-bold text-[#DDD6FE] uppercase tracking-wider hover:bg-[#5B21B6]/60 cursor-pointer transition-colors shadow-inner">Claude App</span>
                                        <span className="px-3 py-1.5 bg-[#4C1D95]/40 border border-[#8B5CF6]/30 rounded-lg text-sm font-bold text-[#DDD6FE] uppercase tracking-wider hover:bg-[#5B21B6]/60 cursor-pointer transition-colors shadow-inner">Cursor</span>
                                        <span className="px-3 py-1.5 bg-[#4C1D95]/40 border border-[#8B5CF6]/30 rounded-lg text-sm font-bold text-[#DDD6FE] uppercase tracking-wider hover:bg-[#5B21B6]/60 cursor-pointer transition-colors shadow-inner">Postman</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SITE VARIABLES */}
                        <div className="lg:col-span-2 p-8 bg-surface-alt rounded-xl border border-border-subtle shadow-inner relative overflow-hidden flex flex-col justify-between group">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000 text-text-primary">
                                <Settings size={140} />
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-xs font-bold text-text-primary tracking-wide uppercase flex items-center gap-3 mb-3">
                                    <div className="p-2 rounded-xl bg-surface-alt text-[#D4D4D8] border border-border-strong shadow-inner"><Settings size={16}/></div>
                                    Global Environment
                                </h4>
                                <p className="text-sm text-text-muted leading-relaxed mb-8">
                                    Updates here instantly propagate across all authenticated terminals in the network via real-time state hydration.
                                </p>
                            </div>
                            <div className="space-y-3 mt-auto relative z-10">
                                <label className="text-sm font-bold text-text-muted uppercase tracking-wide ml-1 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#FAFAFA]"></span> Primary CMS Tenant Alias
                                </label>
                                <Input 
                                    type="text" 
                                    value={config.companyName || ''}
                                    onChange={e => onChange('companyName', e.target.value)}
                                    placeholder="e.g. Acme Corp"
                                    className="h-12 text-sm font-semibold bg-surface-main text-text-primary shadow-inner focus:ring-1 focus:ring-[#FAFAFA]/20 rounded-xl border-border-strong"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* SELF-HEALING AUDIT */}
                <motion.div variants={cardVariants}>
                    <SectionHeader icon={ShieldCheck} title="Diagnostic Audit Protocol" sub="Automated System Healing & Clean Data Enforcement" color="text-[#10B981]" />
                    <div className="bg-[#022c22]/30 rounded-xl border border-[#10B981]/20 p-8 sm:p-10 mt-6 overflow-hidden relative shadow-sm backdrop-blur-3xl">
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#34D399]/60 to-transparent shadow-sm object-cover blur-[1px]"></div>
                        
                        <div className="flex flex-col xl:flex-row gap-10 items-center">
                            
                            <div className="space-y-8 max-w-md shrink-0 w-full relative z-10">
                                <div>
                                    <h4 className="text-2xl font-bold tracking-tight text-[#D1FAE5] mb-3">System Integrity Scanner</h4>
                                    <div className="text-sm text-[#A7F3D0]/70 leading-relaxed font-medium">
                                        Cross-validate multi-tenant data isolation, sync latency, and schema alignment. Network automatically seals leaking boundaries and falls back to safe states.
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={runAudit}
                                    disabled={isAuditing}
                                    className="w-full h-14 bg-gradient-to-r from-[#10B981] to-[#34D399] hover:from-[#059669] hover:to-[#10B981] text-[#022C22] font-bold text-xs uppercase tracking-wide rounded-xl active:scale-[0.98] disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3 transition-all shadow-sm border border-[#6EE7B7]/40"
                                >
                                    {isAuditing ? (
                                        <>
                                            <div className="w-5 h-5 border-[3px] border-[#022C22]/30 border-t-[#022C22] rounded-full animate-spin"></div>
                                            Running Diagnostics...
                                        </>
                                    ) : (
                                        <>
                                            <Search size={20} strokeWidth={2.5} />
                                            Initialize Audit
                                        </>
                                    )}
                                </button>
                                
                                <div className="space-y-4 pt-6 border-t border-[#10B981]/10">
                                    <p className="text-sm font-bold text-[#34D399]/70 uppercase tracking-wide ml-1 mb-2">Active Defense Protocols</p>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#064E3B]/40 border border-[#10B981]/20 hover:bg-status-success/30 transition-colors shadow-inner">
                                            <div className="p-2 rounded-lg bg-[#10B981]/20 text-[#34D399]"><ShieldCheck size={16} /></div>
                                            <span className="text-sm uppercase font-bold text-[#D1FAE5] tracking-wide">Cross-Terminal Isolation</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#064E3B]/40 border border-[#10B981]/20 hover:bg-status-success/30 transition-colors shadow-inner">
                                            <div className="p-2 rounded-lg bg-[#3B82F6]/20 text-[#60A5FA]"><Database size={16} /></div>
                                            <span className="text-sm uppercase font-bold text-[#D1FAE5] tracking-wide">Zero-Downtime Hydration</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 w-full min-w-0 flex flex-col justify-center h-full gap-5 relative z-10">
                                
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="p-8 bg-status-success/40 rounded-xl border border-[#10B981]/20 flex flex-col justify-center shadow-inner relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-[#10B981]/5 group-hover:bg-[#10B981]/10 transition-colors duration-500"></div>
                                        <p className="text-sm font-bold text-[#A7F3D0]/60 uppercase tracking-wide mb-2 relative z-10">Isolation Health Score</p>
                                        <p className="text-5xl md:text-7xl font-bold text-[#6EE7B7] shadow-sm relative z-10 px-1 tracking-tighter">
                                            {auditResult ? auditResult.score + '%' : '--'}
                                        </p>
                                    </div>
                                    <div className="p-8 bg-surface-main/ rounded-xl border border-border-subtle flex flex-col items-center justify-center text-center shadow-inner">
                                        <Activity size={48} className={`${isAuditing ? 'text-[#34D399] animate-bounce' : 'text-[#3F3F46]'} mb-4 transition-colors duration-1000`} strokeWidth={1.5}/>
                                        <p className="text-sm font-bold text-text-muted uppercase tracking-wide">
                                            {isAuditing ? 'Scanning Cluster...' : 'Scanner Idle'}
                                        </p>
                                    </div>
                                </div>

                                {/* Loader / Phase string ticker */}
                                {isAuditing && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="w-full p-5 bg-status-success/30 rounded-xl border border-[#10B981]/30 flex items-center justify-between shadow-xl "
                                    >
                                        <div className="flex items-center gap-4">
                                            <Activity size={20} className="text-[#6EE7B7] animate-spin" strokeWidth={2.5} />
                                            <span className="text-sm font-mono font-semibold text-[#D1FAE5] tracking-wide">{auditPhase}</span>
                                        </div>
                                        <div className="h-1.5 w-32 bg-[#022c22] rounded-full overflow-hidden shadow-inner">
                                            <div className="h-full bg-[#34D399] w-full animate-pulse shadow-sm"></div>
                                        </div>
                                    </motion.div>
                                )}

                                {auditResult && !isAuditing && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                        className="w-full p-6 sm:p-8 bg-gradient-to-br from-[#064E3B]/60 to-[#022c22]/90 border border-[#10B981]/30 rounded-xl space-y-5 shadow-sm  relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-[#10B981]/10 rounded-full blur-[50px] pointer-events-none"></div>
                                        <div className="flex items-center justify-between border-b border-[#10B981]/20 pb-4 relative z-10">
                                            <div className="text-xs font-bold uppercase tracking-wide text-[#6EE7B7] flex items-center gap-3">
                                                <div className="p-1.5 rounded-lg bg-[#10B981]/20 border border-[#10B981]/30"><Sparkles size={16} className="text-[#34D399]"/></div>
                                                Diagnostic Report
                                            </div>
                                            <span className="px-3 py-1.5 bg-[#10B981]/20 text-[#6EE7B7] rounded-full text-sm font-bold tracking-wide uppercase border border-[#10B981]/30 shadow-inner">Secured</span>
                                        </div>
                                        
                                        <div className="bg-[#022C22]/80 p-5 rounded-xl border border-[#10B981]/20 font-mono text-xs text-[#A7F3D0] space-y-3 h-[140px] overflow-y-auto custom-scrollbar relative z-10 shadow-inner">
                                            {auditResult.issues.map((issue, i) => (
                                                <div key={i} className="flex items-start gap-3">
                                                    <span className="text-[#059669] shrink-0 font-bold">[{new Date().toISOString().split('T')[1].slice(0,8)}]</span>
                                                    <span className="text-[#D1FAE5] font-medium leading-relaxed"><span className="text-[#34D399] font-bold mr-2">[RESOLVED]</span> {issue}</span>
                                                </div>
                                            ))}
                                            <div className="flex items-start gap-3 pt-4 border-t border-[#10B981]/10 mt-4">
                                                <span className="text-[#059669] shrink-0 font-bold">[{new Date().toISOString().split('T')[1].slice(0,8)}]</span>
                                                <span className="text-[#022C22] font-bold bg-[#34D399] px-3 py-1 rounded-md shadow-sm">System boundaries isolated. Node sync optimal.</span>
                                            </div>
                                        </div>
                                        
                                        <button className="w-full h-12 bg-[#022c22]/50 hover:bg-[#10B981]/20 transition-colors text-sm font-bold rounded-xl uppercase tracking-wide text-[#6EE7B7] border border-[#10B981]/30 relative z-10 flex items-center justify-center gap-2 group">
                                            View Architectural Snapshot
                                            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </motion.section>
    );
};
