import React, { useState } from 'react';
import { motion } from 'motion/react';
import { DollarSign, Zap, Repeat, Star, Plus, Trash2, Award, Clock, ShieldCheck, Activity, Database } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { SystemConfig, SpiffRule } from '../../../types';
import { sfx } from '../../../lib/soundService';
import { Card, Input } from '../../ui/Base';

interface FinancialsTabProps {
    config: SystemConfig;
    onChange: (field: keyof SystemConfig, value: any) => void;
}

const BountyCard: React.FC<{ rule: SpiffRule, onUpdate: (r: Partial<SpiffRule>) => void, onDelete: () => void }> = ({ rule, onUpdate, onDelete }) => (
    <Card className="relative p-6 bg-surface-main border border-border-subtle shadow-2xl transition-all duration-300 group overflow-hidden hover:border-status-warning/40">
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none group-hover:opacity-[0.08] group-hover:scale-125 transition-all duration-700">
            <Award size={140} className="text-status-warning" />
        </div>
        
        <div className="space-y-5 relative z-10">
            <div className="flex justify-between items-start">
                <Input 
                    value={rule.label} 
                    onChange={e => onUpdate({ label: e.target.value })} 
                    className="bg-transparent h-10 border-none px-0 text-sm font-bold text-text-primary focus:text-status-warning w-full placeholder:text-text-muted/30 tracking-wider uppercase ring-0 shadow-none focus:ring-0"
                    placeholder="BOUNTY DESIGNATION"
                />
                <button onClick={() => { sfx.playDecline(); onDelete(); }} className="text-text-muted hover:text-status-error transition-colors p-2 hover:bg-surface-alt rounded-xl ml-2 shadow-sm border border-transparent hover:border-status-error/20"><Trash2 size={16}/></button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-alt/50 p-3.5 rounded-xl border border-border-subtle group-focus-within:border-accent-primary/50 transition-colors shadow-inner">
                    <label className="text-[10px] uppercase font-bold text-text-muted tracking-wide block mb-1">Min Threshold</label>
                    <div className="flex items-center gap-1.5">
                        <span className="text-text-muted text-sm font-bold">$</span>
                        <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                            type="number" 
                            value={rule.threshold} 
                            onChange={e => onUpdate({ threshold: parseInt(e.target.value) || 0 })} 
                            className="w-full bg-transparent text-lg font-mono font-bold outline-none text-text-primary" 
                        />
                    </div>
                </div>
                <div className="bg-status-warning/10 p-3.5 rounded-xl border border-status-warning/20 shadow-inner">
                    <label className="text-[10px] uppercase font-bold text-status-warning/80 tracking-wide block mb-1">Yield Payout</label>
                    <div className="flex items-center gap-1.5 text-status-warning">
                        <span className="text-sm font-bold">+</span>
                        <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                            type="number" 
                            value={rule.amount} 
                            onChange={e => onUpdate({ amount: parseInt(e.target.value) || 0 })} 
                            className="w-full bg-transparent text-lg font-mono font-bold outline-none" 
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border-subtle/50">
                <div className="flex items-center gap-2 px-3 py-2 bg-surface-alt rounded-lg border border-border-subtle">
                    <Clock size={14} className="text-text-muted"/>
                    <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                        type="number" 
                        value={rule.minHours} 
                        onChange={e => onUpdate({ minHours: parseInt(e.target.value) || 0 })} 
                        className="w-10 bg-transparent text-xs font-mono font-bold text-text-primary outline-none text-center" 
                    />
                    <span className="text-[10px] font-bold uppercase text-text-muted tracking-wide">Hrs/Day</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-status-success animate-pulse shadow-sm"></span>
                    <span className="text-[10px] font-bold text-status-success tracking-wide uppercase">Active</span>
                </div>
            </div>
            <p className="text-[10px] text-text-muted font-bold opacity-60 text-center uppercase tracking-wide leading-relaxed">
                Triggered automatically upon milestone validation.
            </p>
        </div>
    </Card>
);

export const FinancialsTab: React.FC<FinancialsTabProps> = ({ config, onChange }) => {
    const addSpiff = () => {
        sfx.playClick();
        const rules = [...(config.spiffRules || [])];
        rules.push({ id: `spiff-${Date.now()}`, label: 'New Incentive Protocol', threshold: 1000, amount: 50, minHours: 6 });
        onChange('spiffRules', rules);
    };

    const updateSpiff = (id: string, updates: Partial<SpiffRule>) => {
        const rules = config.spiffRules?.map(r => r.id === id ? { ...r, ...updates } : r) || [];
        onChange('spiffRules', rules);
    };

    const removeSpiff = (id: string) => {
        const rules = config.spiffRules?.filter(r => r.id !== id) || [];
        onChange('spiffRules', rules);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as any } }
    };

    const metricCards = [
        { label: 'Base Commission Rate', value: config.baseCommission || 10, key: 'baseCommission', icon: Zap, colorClass: 'text-emerald-500', bgClass: 'bg-emerald-500/10', borderClass: 'border-emerald-500/20', hoverClass: 'hover:border-emerald-500/40', unit: '%' },
        { label: 'Shipping Deduction (Pre-Basis)', value: config.shippingDeduction || 0, key: 'shippingDeduction', icon: DollarSign, colorClass: 'text-blue-500', bgClass: 'bg-blue-500/10', borderClass: 'border-blue-500/20', hoverClass: 'hover:border-blue-500/40', unit: '$' },
        { label: 'Chargeback Window', value: config.clawbackWindow || 90, key: 'clawbackWindow', icon: Repeat, colorClass: 'text-rose-500', bgClass: 'bg-rose-500/10', borderClass: 'border-rose-500/20', hoverClass: 'hover:border-rose-500/40', unit: 'Days' }
    ];

    return (
        <motion.section 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-12 pb-10"
        >
            <motion.div variants={itemVariants}>
                <SectionHeader icon={DollarSign} title="Compensation Architecture" sub="Commission Rates, Ledger Mechanics & Automated Bounties" color="text-status-success" />
                
                {/* GLOBAL METRICS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    {metricCards.map((item, idx) => (
                        <Card key={idx} className={`p-6 sm:p-8 bg-surface-main relative overflow-hidden shadow-2xl transition-all duration-300 group ${item.hoverClass}`}>
                            <div className={`absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 ${item.colorClass}`}>
                                <item.icon size={120} />
                            </div>
                            
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <h4 className="text-[10px] font-bold text-text-primary tracking-wide uppercase flex items-center gap-2 mb-6">
                                    <div className={`p-1.5 rounded-lg ${item.bgClass} ${item.colorClass} shadow-inner`}>
                                        <item.icon size={14}/>
                                    </div>
                                    {item.label}
                                </h4>
                                
                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center gap-2">
                                        {item.unit === '$' && <span className={`text-2xl font-bold ${item.colorClass}`}>$</span>}
                                        <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                            type="number" 
                                            value={item.value} 
                                            onChange={e => onChange(item.key as any, parseInt(e.target.value) || 0)} 
                                            className={`w-full bg-transparent text-4xl lg:text-5xl font-bold font-mono text-text-primary outline-none transition-colors border-b-2 border-transparent focus:border-text-primary/20 pb-1`} 
                                        />
                                        {item.unit !== '$' && <span className={`text-xl font-bold ${item.colorClass} self-end mb-2`}>{item.unit}</span>}
                                    </div>
                                    {item.key === 'shippingDeduction' && (
                                        <p className="text-[10px] uppercase font-bold text-text-muted tracking-wide leading-relaxed">
                                            Flat fee deducted from gross before basis calculation.
                                        </p>
                                    )}
                                    {item.key === 'baseCommission' && (
                                        <p className="text-[10px] uppercase font-bold text-text-muted tracking-wide leading-relaxed">
                                            Default global percentage applied across standard items.
                                        </p>
                                    )}
                                    {item.key === 'clawbackWindow' && (
                                        <p className="text-[10px] uppercase font-bold text-text-muted tracking-wide leading-relaxed">
                                            Commission liability hold duration.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </motion.div>

            
            {/* PAYROLL PARAMETERS */}
            <motion.div variants={itemVariants} className="pt-8 border-t border-border-subtle space-y-6">
                <div className="flex items-center gap-4 px-2">
                    <div className="p-3 bg-surface-alt rounded-xl text-text-primary border border-border-subtle shadow-inner">
                        <Database size={24}/>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-text-primary uppercase tracking-tighter">Payroll Parameters</h3>
                        <p className="text-sm text-text-muted font-bold">Define global settlement intervals & thresholds.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-surface-main border border-border-subtle rounded-xl p-5 shadow-sm focus-within:border-accent-primary/50 transition-colors">
                        <label className="text-[10px] font-bold uppercase text-text-muted tracking-wide block mb-3">Commission Architecture</label>
                        <select 
                            value={config.commissionStructure || 'flat'}
                            onChange={e => onChange('commissionStructure', e.target.value)}
                            className="w-full bg-surface-alt border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-accent-primary"
                        >
                            <option value="flat">Flat Percentage (Global)</option>
                            <option value="tiered">Tiered Performance Scale</option>
                            <option value="profit_share">Net Profit Margin Share</option>
                        </select>
                    </div>
                    
                    <div className="bg-surface-main border border-border-subtle rounded-xl p-5 shadow-sm focus-within:border-accent-primary/50 transition-colors">
                        <label className="text-[10px] font-bold uppercase text-text-muted tracking-wide block mb-3">Ledger Sync Cycle</label>
                        <select 
                            value={config.paymentCycle || 'bi-weekly'}
                            onChange={e => onChange('paymentCycle', e.target.value)}
                            className="w-full bg-surface-alt border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-accent-primary"
                        >
                            <option value="weekly">Weekly (Every Friday)</option>
                            <option value="bi-weekly">Bi-Weekly (1st & 15th)</option>
                            <option value="monthly">Monthly (End of Month)</option>
                        </select>
                    </div>

                    <div className="bg-surface-main border border-border-subtle rounded-xl p-5 shadow-sm focus-within:border-accent-primary/50 transition-colors">
                        <label className="text-[10px] font-bold uppercase text-text-muted tracking-wide block mb-3">Min Release Threshold ($)</label>
                        <div className="flex items-center gap-2 bg-surface-alt border border-border-subtle rounded-xl px-4 focus-within:border-accent-primary">
                            <span className="text-text-muted font-bold">$</span>
                            <input 
                                type="number"
                                value={config.minimumPayoutThreshold || 0}
                                onChange={e => onChange('minimumPayoutThreshold', parseInt(e.target.value) || 0)}
                                className="w-full bg-transparent py-3 text-sm font-mono font-bold text-text-primary outline-none"
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* BOUNTY BOARD */}
            <motion.div variants={itemVariants} className="pt-8 border-t border-border-subtle space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-status-warning/10 rounded-xl text-status-warning border border-status-warning/20 shadow-inner">
                            <Star size={24}/>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-text-primary uppercase tracking-tighter">Incentive Matrix</h3>
                            <p className="text-sm text-text-muted font-bold">Automated algorithmic spiff deployment rules.</p>
                        </div>
                    </div>
                    <button 
                        onClick={addSpiff}
                        className="shrink-0 px-5 py-3 bg-status-warning text-surface-main font-bold text-xs uppercase tracking-wide rounded-xl hover:bg-status-warning/90 transition-all shadow-sm hover:shadow-sm flex items-center gap-2"
                    >
                        <Plus size={16} strokeWidth={3} /> Inject New Bounty
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {config.spiffRules?.map((rule) => (
                        <BountyCard 
                            key={rule.id} 
                            rule={rule} 
                            onUpdate={(u) => updateSpiff(rule.id, u)} 
                            onDelete={() => removeSpiff(rule.id)}
                        />
                    ))}
                    
                    {(!config.spiffRules || config.spiffRules.length === 0) && (
                        <Card className="col-span-full py-16 flex flex-col items-center justify-center text-text-muted bg-surface-alt/30 border-2 border-dashed border-border-subtle">
                            <div className="p-4 bg-surface-main rounded-full border border-border-subtle shadow-sm mb-4">
                                <Award size={32} className="opacity-40" />
                            </div>
                            <p className="text-xs font-bold uppercase tracking-wide text-text-primary mb-1">No Active Protocols</p>
                            <p className="text-xs font-bold text-text-muted">Inject bounties to drive tactical momentum.</p>
                        </Card>
                    )}
                </div>
            </motion.div>

            {/* PAYOUT PROJECTION DECK */}
            <motion.div variants={itemVariants} className="pt-8 border-t border-border-subtle">
                <Card className="p-8 bg-surface-main border border-border-subtle shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-status-success/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none group-hover:bg-status-success/10 transition-colors duration-1000"></div>
                    
                    <div className="relative z-10 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-status-success/10 text-status-success rounded-xl border border-status-success/20 shadow-inner">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-text-primary uppercase tracking-tighter">Executive Forecasting Sandbox</h3>
                                <p className="text-sm text-text-muted font-bold">Safely simulate ledger impact against configured commission architecture.</p>
                            </div>
                        </div>

                        <ProjForecast config={config} />
                    </div>
                </Card>
            </motion.div>
        </motion.section>
    );
};

interface ForecastProps {
    config: SystemConfig;
}

const ProjForecast: React.FC<ForecastProps> = ({ config }) => {
    const [projectedSales, setProjectedSales] = React.useState<number>(100000);
    const [expectedReturns, setExpectedReturns] = React.useState<number>(5);

    const avgOrderValue = 2000;
    const estOrders = Math.max(1, Math.floor(projectedSales / avgOrderValue));
    
    const netBasis = Math.max(0, projectedSales - ((config.shippingDeduction || 0) * estOrders));
    const baseCommAmt = netBasis * ((config.baseCommission || 10) / 100);
    
    const clawbackReserve = baseCommAmt * (expectedReturns / 100);
    const estimatedSettlePayout = baseCommAmt - clawbackReserve;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-surface-alt/50 p-6 sm:p-8 rounded-xl border border-border-subtle shadow-inner">
            <div className="lg:col-span-5 space-y-6">
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-text-primary uppercase tracking-wide flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span> Target Revenue Vector
                    </label>
                    <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-text-muted group-focus-within:text-status-success transition-colors">$</span>
                        <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                            type="number" 
                            value={projectedSales || ''}
                            onChange={e => setProjectedSales(parseInt(e.target.value) || 0)}
                            className="w-full bg-surface-main border border-border-strong rounded-xl py-3.5 pl-8 pr-4 text-sm font-mono font-bold text-text-primary outline-none focus:border-status-success focus:ring-1 focus:ring-status-success/30 transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold text-text-primary uppercase tracking-wide">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-status-error animate-pulse"></span> Liability Margin (Refunds/Chargebacks)
                        </div>
                        <span className="text-status-error px-2 py-1 bg-status-error/10 rounded-lg">{expectedReturns}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="30" 
                        value={expectedReturns} 
                        onChange={e => setExpectedReturns(parseInt(e.target.value))}
                        className="w-full accent-status-error h-1.5 bg-surface-main border border-border-strong rounded-lg cursor-pointer"
                    />
                </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-surface-main border border-border-subtle rounded-xl flex flex-col justify-between items-center text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-text-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide relative z-10 mb-4">Gross Obligation</span>
                    <span className="text-2xl font-bold font-mono text-text-primary relative z-10 break-all w-full leading-none">${baseCommAmt.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    <span className="text-[10px] uppercase font-bold text-text-muted tracking-wide mt-4 relative z-10">Pre-liability basis</span>
                </div>
                <div className="p-5 bg-status-error/5 border border-status-error/20 rounded-xl shadow-inner flex flex-col justify-between items-center text-center">
                    <span className="text-[10px] font-bold text-status-error uppercase tracking-wide mb-4">Clawback Lock</span>
                    <span className="text-2xl font-bold font-mono text-status-error break-all w-full leading-none">${clawbackReserve.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    <span className="text-[10px] uppercase font-bold text-status-error/70 tracking-wide mt-4">{config.clawbackWindow || 90}d frozen asset</span>
                </div>
                <div className="p-5 bg-status-success/10 border border-status-success/30 rounded-xl shadow-inner flex flex-col justify-between items-center text-center relative">
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-status-success/20 rounded-full blur-xl"></div>
                    <span className="text-[10px] font-bold text-status-success uppercase tracking-wide mb-4 relative z-10">Estimated Settle</span>
                    <span className="text-2xl font-bold font-mono text-status-success relative z-10 break-all w-full leading-none">${estimatedSettlePayout.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    <span className="text-[10px] uppercase font-bold text-status-success/70 tracking-wide mt-4 relative z-10">Safe distribution</span>
                </div>
            </div>
            
            <div className="lg:col-span-12 flex justify-center pt-2">
                <div className="px-5 py-2.5 bg-surface-main border border-border-subtle rounded-xl flex items-center gap-3 shadow-inner">
                    <Activity size={14} className="text-status-success" />
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide">
                        Based on ~{estOrders} simulated transactions at $2k AOV. Spiff vectors omitted for baseline accuracy.
                    </p>
                </div>
            </div>
        </div>
    );
};
