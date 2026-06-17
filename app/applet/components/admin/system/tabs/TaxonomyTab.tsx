import React, { useState, useMemo } from 'react';
import { Tag, Plus, X, Sparkles, Database, HeartPulse, Network, Layers } from 'lucide-react';
import { SectionHeader } from '../SectionHeader';
import { Button } from '../../../ui/Base';
import { SystemConfig } from '../../../../types';
import { sfx } from '../../../../lib/soundService';

interface TaxonomyTabProps {
    config: SystemConfig;
    onChange: (field: keyof SystemConfig, value: any) => void;
}

const PRESETS = {
    medicalConditions: [
        'Diabetes Type II', 'Hypertension', 'Cardiovascular Disease', 
        'Chronic Pain', 'Asthma', 'Obesity Management', 'Sleep Apnea'
    ],
    crmTags: [
        'VIP', 'High Value', 'Follow Up', 'Churn Risk', 'Engaged',
        'Competitor', 'Referral', 'Partner', 'Cold'
    ],
    leadSources: [
        'Organic Search', 'Direct Traffic', 'Social Media', 'Paid Ads',
        'Referral', 'Email Campaign', 'Offline Event', 'Inbound Call'
    ],
    pipelineStages: [
        'New Lead', 'Attempted Contact', 'Contacted', 'Qualified',
        'Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost'
    ]
};

type TaxonomyType = 'medicalConditions' | 'crmTags' | 'leadSources' | 'pipelineStages';

const TAXONOMY_METADATA: Record<TaxonomyType, { title: string, icon: any, color: string, colorBadge: string, description: string }> = {
    medicalConditions: { title: 'Medical Tags', icon: HeartPulse, color: 'text-rose-500', colorBadge: 'bg-rose-500', description: 'Patient condition matrices and health risk profiles' },
    crmTags: { title: 'Global CRM Tags', icon: Tag, color: 'text-purple-500', colorBadge: 'bg-purple-500', description: 'Universal tags for accounts, contacts, and custom filtering' },
    leadSources: { title: 'Lead Sources', icon: Network, color: 'text-blue-500', colorBadge: 'bg-blue-500', description: 'Attribution origins for inbound and outbound pipelines' },
    pipelineStages: { title: 'Pipeline Stages', icon: Layers, color: 'text-amber-500', colorBadge: 'bg-amber-500', description: 'Custom funnel progression stages for deals and leads' }
};

export const TaxonomyTab: React.FC<TaxonomyTabProps> = ({ config, onChange }) => {
    const [activeTab, setActiveTab] = useState<TaxonomyType>('crmTags');
    const [newItem, setNewItem] = useState('');

    const addItem = (term?: string) => {
        const text = (term || newItem).trim();
        if (!text) return;
        sfx.playSubmit();
        const list = [...(config[activeTab] || [])];
        if (!list.includes(text)) {
            list.push(text);
            onChange(activeTab, list);
        }
        setNewItem('');
    };

    const removeItem = (item: string) => {
        sfx.playDecline();
        const list = config[activeTab]?.filter(i => i !== item) || [];
        onChange(activeTab, list);
    };

    const currentList = useMemo(() => config[activeTab] || [], [config, activeTab]);
    const meta = TAXONOMY_METADATA[activeTab];

    return (
        <section className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <SectionHeader icon={Database} title="System Taxonomy" sub="Global Labels, Pipelines, & Classification Tags" color="text-purple-500" />
            
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar border-b border-border-subtle shrink-0">
                {(Object.keys(TAXONOMY_METADATA) as TaxonomyType[]).map(type => {
                    const Icon = TAXONOMY_METADATA[type].icon;
                    const isActive = activeTab === type;
                    return (
                        <button
                            key={type}
                            onClick={() => { sfx.playClick(); setActiveTab(type); }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-bold tracking-wide transition-all whitespace-nowrap ${
                                isActive
                                    ? `bg-surface-alt border-t border-x border-border-subtle ${TAXONOMY_METADATA[type].color}`
                                    : 'text-text-muted hover:text-text-primary hover:bg-surface-main/50 border border-transparent'
                            }`}
                        >
                            <Icon size={16} />
                            {TAXONOMY_METADATA[type].title}
                        </button>
                    );
                })}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Left controls */}
                <div className="md:col-span-4 space-y-6">
                    <div className="p-5 bg-surface-alt/40 border border-border-subtle rounded-xl space-y-4">
                        <span className="text-sm font-bold text-text-muted uppercase tracking-wider block">Add {meta.title}</span>
                        <div className="flex gap-2">
                            <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                value={newItem} 
                                onChange={e => setNewItem(e.target.value)} 
                                className={`flex-1 bg-surface-main border border-border-subtle rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-${meta.color.split('-')[1]}-${meta.color.split('-')[2]} transition-all text-text-primary`}
                                placeholder="Add Label..."
                                onKeyDown={e => e.key === 'Enter' && addItem()}
                            />
                            <Button onClick={() => addItem()} variant="primary" className={`h-9 px-3 ${meta.colorBadge} hover:opacity-80`}>
                                <Plus size={16}/>
                            </Button>
                        </div>
                    </div>

                    {/* Presets card widget */}
                    <div className="p-5 bg-surface-alt/40 border border-border-subtle rounded-xl space-y-4 text-left">
                        <span className="text-sm font-bold text-text-muted uppercase tracking-wider block flex items-center gap-1.5">
                            <Sparkles size={14} className={meta.color} /> Quick Presets
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                            {PRESETS[activeTab].map(item => {
                                const exists = currentList.includes(item);
                                return (
                                    <button
                                        key={item}
                                        type="button"
                                        disabled={exists}
                                        onClick={() => addItem(item)}
                                        className={`px-2 py-1 text-sm font-bold rounded-lg border transition-all ${
                                            exists 
                                                ? 'bg-surface-main/30 border-border-subtle/50 text-text-muted/40 cursor-not-allowed'
                                                : `bg-surface-main border-border-subtle text-text-primary hover:border-${meta.color.split('-')[1]}-${meta.color.split('-')[2]}/50 hover:${meta.color}`
                                        }`}
                                    >
                                        + {item}
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
                            <h5 className="text-sm font-bold text-text-primary tracking-wide">{meta.title} Library</h5>
                            <p className="text-sm text-text-muted">{meta.description}</p>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-wrap gap-2.5 content-start">
                        {currentList.map((item) => {
                            return (
                                <div 
                                    key={item} 
                                    className={`px-3 py-2 rounded-xl border border-border-subtle bg-surface-main flex items-center gap-3 shadow-sm group hover:scale-[1.02] active:scale-95 transition-all text-left ${meta.color}`}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full ${meta.colorBadge} animate-pulse`} />
                                    <div>
                                        <p className="text-sm font-extrabold text-text-primary">{item}</p>
                                    </div>
                                    <button 
                                        onClick={() => removeItem(item)} 
                                        className="text-text-muted hover:text-status-error transition-colors ml-1 p-0.5 bg-surface-main rounded"
                                    >
                                        <X size={13}/>
                                    </button>
                                </div>
                            );
                        })}
                        {currentList.length === 0 && (
                            <div className="w-full flex-1 flex flex-col items-center justify-center text-text-muted opacity-40 py-12">
                                <Database size={40} className="mb-2" />
                                <p className="text-sm font-bold tracking-widest uppercase">No Active {meta.title}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};
