
import React from 'react';
import { DollarSign, Zap, Repeat, Star, Plus, Trash2, Award, Clock } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { SystemConfig, SpiffRule } from '../../../types';
import { sfx } from '../../../lib/soundService';
import { Button } from '../../ui/Base';

interface FinancialsTabProps {
    config: SystemConfig;
    onChange: (field: keyof SystemConfig, value: any) => void;
}

const BountyCard: React.FC<{ rule: SpiffRule, onUpdate: (r: Partial<SpiffRule>) => void, onDelete: () => void }> = ({ rule, onUpdate, onDelete }) => (
    <div className="relative p-5 bg-surface-main border border-border-subtle rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden hover:border-amber-500/30">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:opacity-10 transition-opacity group-hover:scale-110 duration-700">
            <Award size={120} className="text-amber-500" />
        </div>
        
        <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-start">
                <input 
                    value={rule.label} 
                    onChange={e => onUpdate({ label: e.target.value })} 
                    className="bg-transparent text-sm font-black uppercase text-text-primary outline-none focus:text-amber-500 w-full placeholder:text-text-muted/30 tracking-tight"
                    placeholder="BOUNTY NAME"
                />
                <button onClick={() => { sfx.playDecline(); onDelete(); }} className="text-text-muted hover:text-red-500 transition-colors p-1.5 hover:bg-surface-alt rounded-lg"><Trash2 size={14}/></button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-alt/50 p-3 rounded-2xl border border-border-subtle group-focus-within:border-accent-primary/50 transition-colors">
                    <label className="text-[8px] font-bold text-text-muted uppercase block mb-1">Min Sale Amount</label>
                    <div className="flex items-center gap-1">
                        <span className="text-text-muted text-xs font-bold">$</span>
                        <input 
                            type="number" 
                            value={rule.threshold} 
                            onChange={e => onUpdate({ threshold: parseInt(e.target.value) })} 
                            className="w-full bg-transparent text-base font-black num-font outline-none text-text-primary" 
                        />
                    </div>
                </div>
                <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20">
                    <label className="text-[8px] font-bold text-amber-600 uppercase block mb-1">Bonus Payout</label>
                    <div className="flex items-center gap-1 text-amber-500">
                        <span className="text-xs font-bold">+</span>
                        <input 
                            type="number" 
                            value={rule.amount} 
                            onChange={e => onUpdate({ amount: parseInt(e.target.value) })} 
                            className="w-full bg-transparent text-base font-black num-font outline-none" 
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-border-subtle/50">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-surface-alt rounded-lg">
                    <Clock size={10} className="text-text-muted"/>
                    <input 
                        type="number" 
                        value={rule.minHours} 
                        onChange={e => onUpdate({ minHours: parseInt(e.target.value) })} 
                        className="w-8 bg-transparent text-[9px] font-black text-text-primary outline-none text-center" 
                    />
                    <span className="text-[9px] font-bold text-text-muted uppercase">Hrs/Day</span>
                </div>
                <div className="h-px flex-1 bg-border-subtle/50"></div>
                <span className="text-[8px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">Active</span>
            </div>
            <p className="text-[9px] text-text-muted font-medium opacity-60 text-center italic">Applied per qualifying sale if daily hours met.</p>
        </div>
    </div>
);

export const FinancialsTab: React.FC<FinancialsTabProps> = ({ config, onChange }) => {
    
    const addSpiff = () => {
        sfx.playClick();
        const rules = [...(config.spiffRules || [])];
        rules.push({ id: `spiff-${Date.now()}`, label: 'New Incentive', threshold: 1000, amount: 50, minHours: 6 });
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

    return (
        <section className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <SectionHeader icon={DollarSign} title="Compensation Architecture" sub="Commission Rates & Automated Bounties" color="text-emerald-500" />
            
            {/* GLOBAL METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-1 bg-surface-alt/30 rounded-[2.5rem] border border-border-subtle">
                {[
                    { label: 'Base Commission', value: config.baseCommission, key: 'baseCommission', icon: Zap, color: 'emerald', unit: '%' },
                    { label: 'Shipping Deduction (Pre-Basis)', value: config.shippingDeduction || 0, key: 'shippingDeduction', icon: DollarSign, color: 'blue', unit: '$' },
                    { label: 'Chargeback Window', value: config.clawbackWindow || 90, key: 'clawbackWindow', icon: Repeat, color: 'rose', unit: 'Days' }
                ].map((item, idx) => (
                    <div key={idx} className={`p-6 bg-surface-main rounded-[2rem] border border-border-subtle shadow-sm group hover:border-${item.color}-500/30 transition-all relative overflow-hidden`}>
                        <div className={`absolute top-0 right-0 p-4 text-${item.color}-500/10`}>
                            <item.icon size={64} />
                        </div>
                        <label className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-3 flex items-center gap-1.5 relative z-10">
                            <item.icon size={12} className={`text-${item.color}-500`}/> {item.label}
                        </label>
                        <div className="flex items-center gap-1 relative z-10">
                            {item.unit === '$' && <span className="text-2xl font-bold text-text-muted">$</span>}
                            <input 
                                type="number" 
                                value={item.value} 
                                onChange={e => onChange(item.key as any, parseInt(e.target.value))} 
                                className={`w-full bg-transparent text-4xl font-black text-text-primary num-font outline-none focus:text-${item.color}-500 transition-colors`} 
                            />
                            {item.unit !== '$' && <span className="text-xs font-bold text-text-muted uppercase self-end mb-2">{item.unit}</span>}
                        </div>
                        {item.key === 'shippingDeduction' && (
                            <p className="relative z-10 mt-2 text-[9px] text-text-muted font-bold opacity-70">
                                Deducted from sale amount before commission % is applied.
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* BOUNTY BOARD */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500 border border-amber-500/20">
                            <Star size={18}/>
                        </div>
                        <div>
                            <h5 className="text-sm font-black text-text-primary uppercase tracking-widest">Incentive Matrix</h5>
                            <p className="text-[10px] text-text-muted font-bold">Automated Spiff Distribution</p>
                        </div>
                    </div>
                    <Button onClick={addSpiff} variant="primary" className="h-10 text-[10px] uppercase font-black tracking-widest px-6 shadow-lg shadow-accent-primary/20">
                        <Plus size={12} strokeWidth={4} className="mr-2"/> Create Bounty
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {config.spiffRules?.map((rule) => (
                        <BountyCard 
                            key={rule.id} 
                            rule={rule} 
                            onUpdate={(u) => updateSpiff(rule.id, u)} 
                            onDelete={() => removeSpiff(rule.id)}
                        />
                    ))}
                    
                    {(!config.spiffRules || config.spiffRules.length === 0) && (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-text-muted opacity-40 border-2 border-dashed border-border-subtle rounded-3xl">
                            <Star size={48} className="mb-4" strokeWidth={1}/>
                            <p className="text-xs font-black uppercase tracking-widest">No active incentives</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};
