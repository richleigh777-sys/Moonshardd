
import React, { useState, useMemo } from 'react';
import { Tag, Plus, X, Sparkles, Filter, AlertTriangle, ShieldCheck, HeartPulse } from 'lucide-react';
import { SectionHeader } from '../SectionHeader';
import { Button } from '../../../ui/Base';
import { SystemConfig } from '../../../../types';
import { sfx } from '../../../../lib/soundService';

interface TaxonomyTabProps {
    config: SystemConfig;
    onChange: (field: keyof SystemConfig, value: any) => void;
}

const PRESET_CONDITIONS = [
    'Diabetes Type II',
    'Hypertension',
    'Cardiovascular Disease',
    'Chronic Pain',
    'Asthma',
    'Obesity Management',
    'Sleep Apnea',
    'Post-Op Rehabilitation',
    'Osteoarthritis',
    'COPD'
];

export const TaxonomyTab: React.FC<TaxonomyTabProps> = ({ config, onChange }) => {
    const [newCondition, setNewCondition] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'managed'>('all');

    const addCondition = (term?: string) => {
        const text = (term || newCondition).trim();
        if (!text) return;
        sfx.playSubmit();
        const list = [...(config.medicalConditions || [])];
        if (!list.includes(text)) {
            list.push(text);
            onChange('medicalConditions', list);
        }
        setNewCondition('');
    };

    const removeCondition = (cond: string) => {
        sfx.playDecline();
        const list = config.medicalConditions?.filter(c => c !== cond) || [];
        onChange('medicalConditions', list);
    };

    // Helper to determine threat tier / category
    const getConditionTier = (name: string): { label: string, color: string, badge: string } => {
        const lower = name.toLowerCase();
        if (lower.includes('cardio') || lower.includes('copd') || lower.includes('apnea') || lower.includes('hypertension')) {
            return { label: 'Cardioregulatory / High Risk', color: 'border-status-error/30 text-status-error bg-rose-500/5', badge: 'bg-status-error' };
        }
        if (lower.includes('diabetes') || lower.includes('pain') || lower.includes('asthma') || lower.includes('obesity')) {
            return { label: 'Managed / Chronic', color: 'border-status-warning/30 text-status-warning bg-amber-500/5', badge: 'bg-status-warning' };
        }
        return { label: 'Routine Practice', color: 'border-teal-500/30 text-teal-500 bg-teal-500/5', badge: 'bg-teal-500' };
    };

    const filteredConditions = useMemo(() => {
        const all = config.medicalConditions || [];
        if (activeFilter === 'all') return all;
        return all.filter(c => {
            const tier = getConditionTier(c);
            if (activeFilter === 'critical') return tier.label.includes('High Risk');
            return tier.label.includes('Managed');
        });
    }, [config.medicalConditions, activeFilter]);

    return (
        <section className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <SectionHeader icon={Tag} title="Data Taxonomy" sub="Classification Tags & Health Risk Matrices" color="text-purple-500" />
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Left controls */}
                <div className="md:col-span-4 space-y-6">
                    <div className="p-5 bg-surface-alt/40 border border-border-subtle rounded-xl space-y-4">
                        <span className="text-sm font-bold text-text-muted uppercase tracking-wider block">Add Taxonomy Label</span>
                        <div className="flex gap-2">
                            <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                value={newCondition} 
                                onChange={e => setNewCondition(e.target.value)} 
                                className="flex-1 bg-surface-main border border-border-subtle rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-purple-500 transition-all text-text-primary"
                                placeholder="Add Tag (e.g. Asthma)..."
                                onKeyDown={e => e.key === 'Enter' && addCondition()}
                            />
                            <Button onClick={() => addCondition()} variant="primary" className="h-9 px-3 bg-purple-600 hover:bg-purple-700">
                                <Plus size={16}/>
                            </Button>
                        </div>
                    </div>

                    {/* Presets card widget */}
                    <div className="p-5 bg-surface-alt/40 border border-border-subtle rounded-xl space-y-4 text-left">
                        <span className="text-sm font-bold text-text-muted uppercase tracking-wider block flex items-center gap-1.5">
                            <Sparkles size={14} className="text-purple-400" /> Quick Taxonomy Presets
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                            {PRESET_CONDITIONS.map(cond => {
                                const exists = config.medicalConditions?.includes(cond);
                                return (
                                    <button
                                        key={cond}
                                        type="button"
                                        disabled={exists}
                                        onClick={() => addCondition(cond)}
                                        className={`px-2 py-1 text-sm font-bold rounded-lg border transition-all ${
                                            exists 
                                                ? 'bg-surface-main/30 border-border-subtle/50 text-text-muted/40 cursor-not-allowed'
                                                : 'bg-surface-main border-border-subtle text-text-primary hover:border-purple-500/50 hover:text-purple-400'
                                        }`}
                                    >
                                        + {cond}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right display board */}
                <div className="md:col-span-8 p-4 bg-surface-alt/30 border border-border-subtle rounded-[2rem] flex flex-col min-h-[300px]">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-border-subtle mb-4 gap-3">
                        <div>
                            <h5 className="text-sm font-bold text-text-primary tracking-wide"> Roster Profiling Registry</h5>
                            <p className="text-sm text-text-muted">Filtered classifications and automated medical severity tagging</p>
                        </div>
                        <div className="flex items-center gap-1 bg-surface-main p-1 rounded-xl border border-border-subtle">
                            {[
                                { id: 'all', name: 'All Tags' },
                                { id: 'critical', name: 'High Risk' },
                                { id: 'managed', name: 'Chronic' }
                            ].map(filter => (
                                <button
                                    key={filter.id}
                                    onClick={() => { sfx.playClick(); setActiveFilter(filter.id as any); }}
                                    className={`px-3 py-1 rounded-lg text-sm font-bold uppercase transition-all ${
                                        activeFilter === filter.id 
                                            ? 'bg-purple-600 text-white'
                                            : 'text-text-muted hover:text-text-primary'
                                    }`}
                                >
                                    {filter.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 flex flex-wrap gap-2.5 content-start">
                        {filteredConditions.map((cond) => {
                            const tier = getConditionTier(cond);
                            return (
                                <div 
                                    key={cond} 
                                    className={`px-3 py-2 rounded-xl border flex items-center gap-3 shadow-sm group hover:scale-[1.02] active:scale-95 transition-all text-left ${tier.color}`}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full ${tier.badge}`} />
                                    <div>
                                        <p className="text-sm font-extrabold text-text-primary">{cond}</p>
                                        <p className="text-[8px] uppercase tracking-widest font-black opacity-60 mt-0.5">{tier.label}</p>
                                    </div>
                                    <button 
                                        onClick={() => removeCondition(cond)} 
                                        className="text-text-muted hover:text-status-error transition-colors ml-1 p-0.5 bg-surface-main rounded"
                                    >
                                        <X size={13}/>
                                    </button>
                                </div>
                            );
                        })}
                        {filteredConditions.length === 0 && (
                            <div className="w-full flex-1 flex flex-col items-center justify-center text-text-muted opacity-40 py-12">
                                <HeartPulse size={40} className="mb-2" />
                                <p className="text-sm font-bold tracking-widest uppercase">No Active Matches</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};
