import { useSystem } from '../../../../hooks/useSystem';
import { AuditExplorer } from '../../tools/AuditExplorer';
import React, { useMemo, useState } from 'react';
import { Card } from '../../../ui/Base';
import { 
    ShieldAlert, Search, AlertTriangle, TrendingDown, Activity, 
    Send, Sparkles, Award, PhoneCall, Gift, X
} from 'lucide-react';
import { useCRM } from '../../../../hooks/useCRM';
import { getDailyHours } from '../../../../views/utils/crmLogic';
import { sfx } from '../../../../lib/soundService';

export const AuditTab: React.FC = () => { 
    const { setToast } = useSystem();
    const { users, sales, attendance, sendDirective, logAudit, addNote, auditLogs = [], clearAuditLogs } = useCRM();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [filterLevel, setFilterLevel] = useState<'all' | 'high' | 'medium' | 'low'>('all');
    
    // Active intervention selection state
    const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
    const [customDirective, setCustomDirective] = useState('');
    const [urgencyMode, setUrgencyMode] = useState<'Routine' | 'Immediate' | 'Flash'>('Routine');
    const [coachingType, setCoachingType] = useState<'spiff' | 'support' | 'coaching' | 'alert'>('support');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Deep diagnostic engine computing agent yields
    const auditResults = useMemo(() => {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
        const activeAgents = users.filter(u => u.role === 'agent' && u.active);
        
        const insights = activeAgents.map(agent => {
            const todaysSales = sales.filter(s => 
                s.agentId === agent.id && 
                s.status === 'Approved' && 
                s.timestamp >= startOfDay
            );
            const dailyRevenue = todaysSales.reduce((sum, s) => sum + (s.amount || 0), 0);

            let hoursLoggedToday = getDailyHours(agent.id, today.getTime(), attendance);
            if (hoursLoggedToday === 0 && agent.loginTimeToday) {
                 hoursLoggedToday = (today.getTime() - agent.loginTimeToday) / (1000 * 60 * 60);
            }
            const effectiveHours = Math.max(0.1, hoursLoggedToday); 
            const efficiency = dailyRevenue / effectiveHours;
            
            let riskLevel: 'high' | 'medium' | 'low' = 'low';
            const riskReasons: string[] = [];

            if (hoursLoggedToday > 2 && efficiency < 20) {
                riskLevel = 'high';
                riskReasons.push(`Critical yield ($${efficiency.toFixed(0)}/hr)`);
            } else if (hoursLoggedToday > 2 && efficiency < 40) {
                riskLevel = 'medium';
                riskReasons.push(`Low yield ($${efficiency.toFixed(0)}/hr)`);
            }

            if (hoursLoggedToday > 3 && todaysSales.length === 0) {
                riskLevel = 'high';
                riskReasons.push(`Zero production > 3 hours`);
            }

            const nowTime = today.getTime();

            if (agent.currentStatus === 'break' && (agent.lastActive || 0) < nowTime - (60 * 60 * 1000)) {
                riskLevel = riskLevel === 'high' ? 'high' : 'medium';
                riskReasons.push(`Extended Break (> 1 hour)`);
            }

            if (agent.lastActive && agent.lastActive < nowTime - (4 * 60 * 60 * 1000) && agent.currentStatus !== 'offline') {
                riskLevel = 'high';
                riskReasons.push(`Ghosted (System disconnect > 4h)`);
            }

            return {
                agent,
                dailyRevenue,
                effectiveHours,
                efficiency,
                riskLevel,
                riskReasons
            };
        });

        return insights.filter(i => {
            if (filterLevel !== 'all' && i.riskLevel !== filterLevel) return false;
            if (searchQuery && !i.agent.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            return true;
        }).sort((a, b) => {
            if (a.riskLevel === 'high' && b.riskLevel !== 'high') return -1;
            if (b.riskLevel === 'high' && a.riskLevel !== 'high') return 1;
            if (a.riskLevel === 'medium' && b.riskLevel === 'low') return -1;
            if (a.riskLevel === 'low' && b.riskLevel === 'medium') return 1;
            return a.efficiency - b.efficiency;
        });

    }, [users, sales, searchQuery, filterLevel, attendance]);

    // Aggregate summary stats for the dashboard
    const summaryStats = useMemo(() => {
        const total = auditResults.length;
        const highRisk = auditResults.filter(r => r.riskLevel === 'high').length;
        const medRisk = auditResults.filter(r => r.riskLevel === 'medium').length;
        const totalYield = auditResults.reduce((sum, r) => sum + r.dailyRevenue, 0);
        const totalHours = auditResults.reduce((sum, r) => sum + r.effectiveHours, 0);
        const avgEfficiency = totalHours > 0 ? totalYield / totalHours : 0;

        return {
            total,
            highRisk,
            medRisk,
            avgEfficiency,
            statusLevel: highRisk > 2 ? 'Warning' : 'Excellent'
        };
    }, [auditResults]);

    // Pre-filled empathy themes
    const prefilledTemplates = {
        spiff: {
            text: "🌟 High-Performance Challenge: Next sale gets an automatic +$100.00 commission multiplier. Let's make it happen!",
            urgency: 'Routine' as const,
            toast: "Incentive challenge activated for agent."
        },
        support: {
            text: "❤️ Operational Support: Spoke with Underwriting to expedite your pending submissions so you can hit your daily targets. Deep breath, you got this!",
            urgency: 'Immediate' as const,
            toast: "Underwriting validation note pushed to agent queue."
        },
        coaching: {
            text: "📞 High-Empathy Coaching: Initiating standard diagnostic whisper link. I will be on the line for your next dial to help qualifying.",
            urgency: 'Routine' as const,
            toast: "Coaching sync invite broadcasted."
        },
        alert: {
            text: "⚠️ Technical Assist: Re-transmitting SIP credentials. Please refresh ViciDial tunnels to lock-in operational queue routing.",
            urgency: 'Flash' as const,
            toast: "Paging critical alert dispatched."
        }
    };

    const applyTemplate = (type: 'spiff' | 'support' | 'coaching' | 'alert') => {
        setCoachingType(type);
        const template = prefilledTemplates[type];
        setCustomDirective(template.text);
        setUrgencyMode(template.urgency);
        sfx.playClick();
    };

    const handleInterveneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAgent || !customDirective.trim()) return;

        setIsSubmitting(true);
        try {
            sfx.playConfirm();

            // 1. Dispatch real-time tactical directive message
            await sendDirective({
                message: `[DIRECTIVE - Admin Sync]: ${customDirective}`,
                urgency: urgencyMode,
                senderName: "Director of CRM Ops"
            });

            // 2. Write client sheet/audit notation of support
            await addNote({
                agentId: selectedAgent.id,
                agentName: selectedAgent.name,
                content: `[SYSTEM COHORT INTERVENTION] Urgency: ${urgencyMode}. Type: ${coachingType}. Broadcast Note: ${customDirective}`,
                reason: "CRM Audited Support Plan",
                timestamp: Date.now()
            });

            // 3. Log into CRM Ledger logs
            await logAudit({
                module: "SYSTEM",
                category: "SECURITY",
                action: "AGENT_INTERVENTION",
                details: `Dispatched tactical directive to ${selectedAgent.name} (ID: ${selectedAgent.id}). Type: ${coachingType}. Details: ${customDirective}`,
                ipAddress: "127.0.0.1",
                timestamp: Date.now(),
                userId: "SYSTEM_COMMAND"
            });

            setToast({
                title: "Intervention Deployed",
                message: `Empathy telemetry dispatched successfully to ${selectedAgent.name}.`,
                type: "success"
            });

            // Reset forms
            setCustomDirective('');
            setSelectedAgent(null);
        } catch (_err) {
            sfx.playError();
            setToast({
                title: "Dispatch Failed",
                message: "Could not sync directive. Check connectivity.",
                type: "error"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-24 h-full flex flex-col">
            
            {/* Page Header */}
            <div className="flex flex-col gap-2 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse shadow-sm"></div>
                    <span className="text-sm font-bold tracking-wide uppercase text-accent-primary font-mono">Operations Vigil Protocol</span>
                </div>
                <h3 className="text-lg font-bold italic text-text-primary tracking-tight">
                    Primary CRM <span className="text-accent-primary">Visual Telemetry</span> & Audit
                </h3>
                <p className="text-sm text-text-muted leading-relaxed max-w-4xl">
                    Director's real-time diagnostic terminal to observe active efficiency yields, compliance levels, or network status. Instantly intervene with supportive, high-empathy directives or live spiffs to motivate underperforming pipelines.
                </p>
            </div>

            {/* Visual KPI Mini Hub */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card variant="refraction" className="p-4 border border-border-subtle hover:border-accent-primary/20 transition-all">
                    <p className="text-sm uppercase font-bold text-text-muted tracking-wider mb-1">Total Monitored</p>
                    <p className="text-xl font-bold text-text-primary font-mono">{summaryStats.total} <span className="text-sm text-text-muted font-bold">Agents</span></p>
                </Card>
                
                <Card variant="refraction" className="p-4 border border-border-subtle hover:border-accent-primary/20 transition-all">
                    <p className="text-sm uppercase font-bold text-status-error tracking-wider mb-1">Urgent Interventions</p>
                    <p className={`text-xl font-bold font-mono ${summaryStats.highRisk > 0 ? "text-status-error animate-pulse" : "text-text-primary"}`}>
                        {summaryStats.highRisk} <span className="text-sm text-text-muted font-bold">High Risk</span>
                    </p>
                </Card>

                <Card variant="refraction" className="p-4 border border-border-subtle hover:border-accent-primary/20 transition-all">
                    <p className="text-sm uppercase font-bold text-text-muted tracking-wider mb-1">Mean Yield Pace</p>
                    <p className="text-xl font-bold text-status-success font-mono">
                        ${summaryStats.avgEfficiency.toFixed(0)} <span className="text-sm text-text-muted font-bold">/ hr</span>
                    </p>
                </Card>

                <Card variant="refraction" className="p-4 border border-border-subtle hover:border-accent-primary/20 transition-all flex justify-between items-center bg-surface-alt/10">
                    <div>
                        <p className="text-sm uppercase font-bold text-text-muted tracking-wider mb-1 font-mono">SYSTEM AUDIT STATUS</p>
                        <p className="text-sm font-bold text-status-success flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-status-success rounded-full animate-ping"></span>
                            DIALER MATCH ACTIVE
                        </p>
                    </div>
                </Card>
            </div>

            {/* Searches and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                        type="text" 
                        placeholder="Search Operative..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-surface-main border border-border-subtle rounded-xl py-2 pl-9 pr-4 text-sm font-bold font-mono placeholder:text-text-muted/60 focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/10 outline-none transition-colors"
                    />
                </div>
                <div className="flex bg-surface-alt p-1 rounded-xl border border-border-subtle">
                    {['all', 'high', 'medium', 'low'].map(level => (
                        <button
                            key={level}
                            onClick={() => setFilterLevel(level as any)}
                            className={`px-4 py-1.5 rounded-lg text-sm uppercase font-bold tracking-wider transition-all ${
                                filterLevel === level 
                                ? level === 'high' ? 'bg-status-error text-white shadow-md shadow-status-error/15' 
                                : level === 'medium' ? 'bg-status-warning text-white shadow-md shadow-status-warning/15'
                                : level === 'low' ? 'bg-status-success text-white shadow-md shadow-status-success/15'
                                : 'bg-surface-main text-text-primary shadow-sm border border-border-subtle'
                                : 'text-text-muted hover:text-text-primary hover:bg-surface-main/50'
                            }`}
                        >
                            {level}
                        </button>
                    ))}
                </div>
            </div>

            {/* Active Inline Intervention Drawer */}
            {selectedAgent && (
                <div className="animate-in slide-in-from-top-3 duration-300">
                    <Card variant="refraction" className="p-4 border-2 border-accent-primary bg-surface-main relative overflow-hidden">
                        <div className="absolute right-4 top-4">
                            <button 
                                onClick={() => { setSelectedAgent(null); sfx.playDecline(); }}
                                className="p-1 rounded-lg hover:bg-surface-alt text-text-muted hover:text-text-primary transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-accent-primary/10 rounded-xl text-accent-primary">
                                <Sparkles size={18} />
                            </div>
                            <div>
                                <h4 className="text-base font-bold text-text-primary">Coaching Control Desk ↔ {selectedAgent.name}</h4>
                                <p className="text-sm text-text-muted font-bold font-mono uppercase tracking-tight">Active Room Session | ID: {selectedAgent.id}</p>
                            </div>
                        </div>

                        <form onSubmit={handleInterveneSubmit} className="space-y-4">
                            
                            {/* Choose Preset Type */}
                            <div>
                                <label className="block text-sm uppercase font-bold text-text-muted tracking-wider mb-2">Select High-Empathy Incentive Trigger</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    <button 
                                        type="button"
                                        onClick={() => applyTemplate('spiff')}
                                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm font-bold transition-all text-left ${coachingType === 'spiff' ? 'bg-accent-primary/10 border-accent-primary text-accent-primary shadow-sm' : 'bg-surface-alt hover:bg-surface-highlight border-border-subtle text-text-secondary'}`}
                                    >
                                        <Gift size={16} />
                                        <div>
                                            <p className="leading-tight font-bold">Commission Spiff</p>
                                            <p className="text-[8px] opacity-75">Boost pipeline drive</p>
                                        </div>
                                    </button>
                                    
                                    <button 
                                        type="button"
                                        onClick={() => applyTemplate('support')}
                                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm font-bold transition-all text-left ${coachingType === 'support' ? 'bg-status-success/10 border-status-success/30 text-status-success shadow-sm' : 'bg-surface-alt hover:bg-surface-highlight border-border-subtle text-text-secondary'}`}
                                    >
                                        <Award size={16} />
                                        <div>
                                            <p className="leading-tight font-bold">Underwriting Expedite</p>
                                            <p className="text-[8px] opacity-75">Pushed validation sync</p>
                                        </div>
                                    </button>

                                    <button 
                                        type="button"
                                        onClick={() => applyTemplate('coaching')}
                                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm font-bold transition-all text-left ${coachingType === 'coaching' ? 'bg-status-info/10 border-status-info/30 text-status-info shadow-sm' : 'bg-surface-alt hover:bg-surface-highlight border-border-subtle text-text-secondary'}`}
                                    >
                                        <PhoneCall size={16} />
                                        <div>
                                            <p className="leading-tight font-bold">Coaching Support</p>
                                            <p className="text-[8px] opacity-75">Whisper-audio assistance</p>
                                        </div>
                                    </button>

                                    <button 
                                        type="button"
                                        onClick={() => applyTemplate('alert')}
                                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm font-bold transition-all text-left ${coachingType === 'alert' ? 'bg-status-warning/10 border-status-warning/30 text-status-warning shadow-sm' : 'bg-surface-alt hover:bg-surface-highlight border-border-subtle text-text-secondary'}`}
                                    >
                                        <X size={16} />
                                        <div>
                                            <p className="leading-tight font-bold">SIP Core Assist</p>
                                            <p className="text-[8px] opacity-75">Clear dialer disconnects</p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Raw text input */}
                            <div>
                                <label className="block text-sm uppercase font-bold text-text-muted tracking-wider mb-2">Composed Support Message</label>
                                <textarea
                                    className="w-full bg-surface-alt border border-border-strong rounded-xl p-3 text-sm font-bold text-text-primary outline-none focus:border-accent-primary transition-all font-mono"
                                    rows={3}
                                    value={customDirective}
                                    onChange={(e) => setCustomDirective(e.target.value)}
                                    placeholder="Enter premium directive message or custom reward instructions..."
                                    required
                                />
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-text-muted uppercase font-mono tracking-wider">Directive Urgency:</span>
                                    <div className="flex bg-surface-alt p-0.5 rounded-lg border border-border-subtle">
                                        {(['Routine', 'Immediate', 'Flash'] as const).map(mode => (
                                            <button
                                                type="button"
                                                key={mode}
                                                onClick={() => { setUrgencyMode(mode); sfx.playClick(); }}
                                                className={`px-3 py-1 rounded text-sm font-bold uppercase tracking-tight transition-all ${
                                                    urgencyMode === mode 
                                                    ? 'bg-accent-primary text-white shadow-sm' 
                                                    : 'text-text-muted hover:text-text-primary'
                                                }`}
                                            >
                                                {mode}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-gradient-to-r from-accent-primary to-accent-secondary border border-accent-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-accent-primary/25 hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <Send size={14} />
                                    <span>{isSubmitting ? "Dispatching..." : `Deploy Directive to ${selectedAgent.name}`}</span>
                                </button>
                            </div>

                        </form>
                    </Card>
                </div>
            )}

            {/* Diagnostic Table */}
            <Card className="flex-1 overflow-hidden p-0 bg-surface-main rounded-xl border border-border-subtle flex flex-col shadow-sm">
                <div className="overflow-y-auto w-full flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-surface-alt/75 sticky top-0 z-10 border-b border-border-subtle">
                            <tr>
                                <th className="px-4 py-4 text-sm font-bold text-text-muted tracking-wide uppercase hidden sm:table-cell">Health Status</th>
                                <th className="px-4 py-4 text-sm font-bold text-text-muted tracking-wide uppercase">Operative Name</th>
                                <th className="px-4 py-4 text-sm font-bold text-text-muted tracking-wide uppercase font-mono">Time Online</th>
                                <th className="px-4 py-4 text-sm font-bold text-text-muted tracking-wide uppercase text-right">Revenue Yield</th>
                                <th className="px-4 py-4 text-sm font-bold text-text-muted tracking-wide uppercase">Dynamic Deficit Flags</th>
                                <th className="px-4 py-4 text-sm font-bold text-text-muted tracking-wide uppercase text-right">Intervention Console</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle/40">
                            {auditResults.length > 0 ? auditResults.map((row) => (
                                <tr key={row.agent.id} className="hover:bg-surface-alt/45 transition-colors group">
                                    <td className="px-4 py-4 align-top hidden sm:table-cell">
                                        <div className={`p-2 rounded-lg inline-flex ${row.riskLevel === 'high' ? 'bg-status-error/10 text-status-error border border-status-error/20' : row.riskLevel === 'medium' ? 'bg-status-warning/10 text-status-warning border border-status-warning/20' : 'bg-status-success/10 text-status-success border border-status-success/20'}`}>
                                            {row.riskLevel === 'high' ? <TrendingDown size={16} /> : row.riskLevel === 'medium' ? <AlertTriangle size={16} /> : <Activity size={16} />}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 align-top">
                                        <div className="font-extrabold text-sm text-text-primary group-hover:text-accent-primary transition-colors">{row.agent.name}</div>
                                        <div className="text-sm text-text-muted flex items-center gap-1 mt-0.5 font-mono">
                                            {row.agent.team || 'NO TEAM'} | ID: {row.agent.id}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 align-top">
                                        <div className="text-sm font-bold font-mono text-text-primary">{row.effectiveHours.toFixed(1)} hours logged</div>
                                        <div className={`text-sm font-mono font-bold uppercase tracking-wider mt-1 flex items-center gap-1`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${row.agent.currentStatus === 'online' ? 'bg-status-success animate-pulse' : row.agent.currentStatus === 'break' ? 'bg-status-warning' : 'bg-text-muted'}`}></span>
                                            <span className={row.agent.currentStatus === 'online' ? 'text-status-success' : row.agent.currentStatus === 'break' ? 'text-status-warning' : 'text-text-muted'}>
                                                {row.agent.currentStatus}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-right align-top">
                                        <div className={`text-sm font-bold font-mono ${row.efficiency < 20 ? 'text-status-error' : 'text-status-success'}`}>
                                            ${row.efficiency.toFixed(2)} <span className="text-sm text-text-muted">/ hr</span>
                                        </div>
                                        <div className="text-sm text-text-muted/70 font-mono mt-0.5">${row.dailyRevenue.toLocaleString()} volume realized</div>
                                    </td>
                                    <td className="px-4 py-4 align-top">
                                        {row.riskReasons.length > 0 ? (
                                            <ul className="space-y-1">
                                                {row.riskReasons.map((reason, idx) => (
                                                    <li key={idx} className="text-sm text-text-secondary flex items-start gap-1.5 leading-tight font-mono font-bold">
                                                        <span className="text-status-error font-bold">•</span> {reason}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span className="text-sm text-status-success font-bold uppercase tracking-wider bg-status-success/10 border border-status-success/20 px-2 py-0.5 rounded-md">Fully Optimized</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 align-middle text-right">
                                        <button 
                                            className="px-4 py-1.5 bg-surface-main hover:bg-accent-primary hover:text-white hover:border-accent-primary text-text-primary rounded-xl text-sm font-bold uppercase tracking-tight transition-all duration-300 border border-border-subtle shadow-sm flex items-center gap-1.5 ml-auto group-hover:scale-105"
                                            onClick={() => { setSelectedAgent(row.agent); sfx.playClick(); }}
                                        >
                                            <Sparkles size={12} className="text-accent-primary group-hover:text-white transition-colors" />
                                            Intervene
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-text-muted">
                                        <ShieldAlert size={32} className="mx-auto mb-3 opacity-20 text-accent-primary animate-pulse" />
                                        <p className="text-sm font-bold uppercase tracking-wide text-text-muted">No monitored operatives active.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Global Audit Ledger */}
            <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShieldAlert size={18} className="text-rose-500" />
                        <h3 className="text-lg font-bold italic text-text-primary tracking-tight">
                            Global <span className="text-rose-500">System Ledger</span> & Logs
                        </h3>
                    </div>
                    {clearAuditLogs && (
                        <button 
                            type="button"
                            onClick={async () => { /* if(window.confirm('Are you sure you want to permanently clear all global audit logs?')) */ { await clearAuditLogs(); setToast({title:'Ledger Cleared', message:'Global audit records have been purged.', type:'success'}); } }}
                            className="px-4 py-1.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 border border-rose-500/20 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                        >
                            Purge Global Ledger
                        </button>
                    )}
                </div>
                <AuditExplorer auditLogs={auditLogs} />
            </div>
        </div>
    );
};
