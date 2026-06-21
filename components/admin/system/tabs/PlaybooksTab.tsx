import React, { useState } from 'react';
import { Target, Zap, PackageOpen, RotateCcw, MessageCircle, Plus, X } from 'lucide-react';
import { SectionHeader } from '../SectionHeader';
import { ConfigToggle } from '../ConfigToggle';
import { Button } from '../../../ui/Base';
import { SystemConfig } from '../../../../types';

interface PlaybooksTabProps { config: SystemConfig; onChange: (field: keyof SystemConfig, value: any) => void; }
export const PlaybooksTab: React.FC<PlaybooksTabProps> = ({ config, onChange }) => {
    // 1-Call Close Engine state
    const engineEnabled = config.playbookEngineEnabled ?? true;
    const setEngineEnabled = (val: boolean) => onChange('playbookEngineEnabled', val);
    const nudgeSettings = config.playbookNudgeSettings || { enabled: true, days: 7 };
    const setNudgeSettings = (val: any) => onChange('playbookNudgeSettings', val);
    
    // Configurable Items
    const products = config.playbookProducts || [ { id: 1, name: 'Braveheart Elite Plan', supplyDays: 30, crossSell: 'Protection Add-on' } ];
    const setProducts = (val: any) => onChange('playbookProducts', val);
    const objections = config.playbookObjections || [ { id: 1, text: 'Need to speak to spouse', rebuttal: "I completely understand, family comes first. Let's lock in the pricing now since it's a promotion, and I'll send an confirmation email so you both have all the facts." }, { id: 2, text: 'Checking finances first', rebuttal: "I hear you. Taking care of your health is an investment, not an expense. We actually have a flexible 3-installment billing layout specifically to keep this budget-friendly." }, { id: 3, text: 'Driving right now', rebuttal: "Understood. My main goal is simply to make sure you get the right coverage in place before this enrollment window closes. Let's do a quick pre-qualification so everything is set when you're ready." } ];
    const setObjections = (val: any) => onChange('playbookObjections', val);

    // Product inputs
    const [newProdName, setNewProdName] = useState('');
    const [newProdSupply, setNewProdSupply] = useState('30');
    const [newProdCross, setNewProdCross] = useState('');

    // Objection input
    const [newObjection, setNewObjection] = useState('');
    const [newRebuttal, setNewRebuttal] = useState('');

    const addProduct = () => {
        if (!newProdName) return;
        setProducts([...products, { 
            id: Date.now(), 
            name: newProdName, 
            supplyDays: parseInt(newProdSupply) || 30, 
            crossSell: newProdCross 
        }]);
        setNewProdName('');
        setNewProdCross('');
    };

    const addObjection = () => {
        if (!newObjection) return;
        setObjections([...objections, { id: Date.now(), text: newObjection, rebuttal: newRebuttal }]);
        setNewObjection('');
        setNewRebuttal('');
    };

    const removeProduct = (id: number) => setProducts(products.filter(p => p.id !== id));
    const removeObjection = (id: number) => setObjections(objections.filter(o => o.id !== id));

    const [selectedSimProduct, setSelectedSimProduct] = useState(products[0]?.name || 'Braveheart Elite Plan');
    const [selectedSimObjection, setSelectedSimObjection] = useState(objections[0]?.text || 'Need to speak to spouse');

    const getSimulatedScript = () => {
        const matchingObjection = objections.find(o => o.text === selectedSimObjection);
        if (matchingObjection && matchingObjection.rebuttal) {
            return `“${matchingObjection.rebuttal}”`;
        }
        return `“Understood. My main goal is simply to make sure you get the right coverage in place before this enrollment window closes. Let's do a quick pre-qualification so everything is set when you're ready.”`;
    };

    return (
        <section className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <SectionHeader 
                icon={Target} 
                title="1-Call Close Operations" 
                sub="Configure products, playbooks, and automated loops for maximum conversions" 
                color="text-accent-secondary" 
            />

            <div className="p-5 bg-surface-highlight border border-border-subtle rounded-xl relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-32 h-32 bg-accent-secondary/10 rounded-bl-full blur-2xl" />
                <h3 className="text-sm font-bold text-text-primary mb-2 flex items-center gap-2">
                    <Target size={16} className="text-accent-secondary" />
                    How this empowers your Sales Floor
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                    By tailoring these settings, admins create a <strong>fail-proof safety net</strong> for their agents. 
                    When a rep drops a deal into <em>Closed Won</em>, the system automatically checks the product's <strong>Supply Life</strong> defined below and maps out exactly when to pitch the <strong>Cross-Sell</strong>. Seven days before the supply expires, the deal will resurface on the agent's <em>Action Center</em> queue as a <strong>Ready for Reorder</strong>. <br/><br/>
                    For deals dropped into <em>Call Back Today</em>, the system locks the rep into setting a specific callback time (combating the "I'll remember later" mistake) and triggers automated Nudge sequences for the selected <em>Short Loop Objections</em>. <strong>This guarantees no lead ever goes cold.</strong>
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ConfigToggle 
                    label="1-Call Close Engine" 
                    active={engineEnabled} 
                    onToggle={() => setEngineEnabled(!engineEnabled)}
                    icon={Zap}
                    description="Force strict pipeline rules (Call Back Today, Reorder Paths) for agents."
                />
                <div className="flex flex-col gap-2">
    <ConfigToggle 
        label="Nudge Sequence automation" 
        active={nudgeSettings.enabled} 
        onToggle={() => setNudgeSettings({ ...nudgeSettings, enabled: !nudgeSettings.enabled })}
        icon={MessageCircle}
        description={`Automated SMS/Email loops spanning ${nudgeSettings.days} days for 'Call Back' leads.`}
    />
    {nudgeSettings.enabled && (
        <div className="pl-16 pr-4 pb-4 animate-in slide-in-from-top-2 flex items-center gap-3">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Loop Duration (Days):</span>
            <input 
                type="number" 
                min="1" 
                max="30" 
                className="w-20 px-2 py-1 bg-surface-main border border-border-subtle rounded-lg text-sm font-mono text-center text-accent-secondary"
                value={nudgeSettings.days}
                onChange={e => setNudgeSettings({ ...nudgeSettings, days: parseInt(e.target.value) || 1 })}
            />
        </div>
    )}
</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* PRODUCTS & SUPPLY */}
                <div className="p-4 bg-surface-alt border border-border-subtle rounded-xl space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-border-subtle">
                        <div className="p-2 bg-text-primary text-surface-main rounded-xl">
                            <PackageOpen size={18} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold tracking-tight text-text-primary">Products & Retention Math</h4>
                            <p className="text-sm font-medium text-text-muted">Define product supply life for \"Ready to Reorder\" triggers</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col gap-3">
                            {products.map(p => (
                                <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-surface-main border border-border-subtle rounded-xl">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-text-primary truncate">{p.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-sm font-mono text-status-success bg-emerald-500/10 px-2 py-0.5 rounded">{p.supplyDays} Days Supply</span>
                                            {p.crossSell && <span className="text-sm text-text-muted truncate">Upsell: {p.crossSell}</span>}
                                        </div>
                                    </div>
                                    <button onClick={() => removeProduct(p.id)} className="text-text-muted hover:text-rose-500 p-1">
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 bg-surface-main rounded-xl border border-border-subtle border-dashed space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                    className="px-3 py-2 bg-surface-alt border border-border-subtle rounded-lg text-sm" 
                                    placeholder="Product Name" 
                                    value={newProdName}
                                    onChange={e => {
                                        setNewProdName(e.target.value);
                                        if(!selectedSimProduct) setSelectedSimProduct(e.target.value);
                                    }}
                                />
                                <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                    className="px-3 py-2 bg-surface-alt border border-border-subtle rounded-lg text-sm" 
                                    placeholder="Supply Limit (Days)" 
                                    type="number"
                                    value={newProdSupply}
                                    onChange={e => setNewProdSupply(e.target.value)}
                                />
                                <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                    className="px-3 py-2 bg-surface-alt border border-border-subtle rounded-lg text-sm col-span-2" 
                                    placeholder="Ideal Cross-Sell / Upsell Product" 
                                    value={newProdCross}
                                    onChange={e => setNewProdCross(e.target.value)}
                                />
                            </div>
                            <Button variant="secondary" className="w-full text-sm" onClick={addProduct}>
                                <Plus size={14} className="mr-1" /> Add Product Formula
                            </Button>
                        </div>
                    </div>
                </div>

                {/* CALLBACK OBJECTIONS */}
                <div className="p-4 bg-surface-alt border border-border-subtle rounded-xl space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-border-subtle">
                        <div className="p-2 bg-text-primary text-surface-main rounded-xl">
                            <RotateCcw size={18} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold tracking-tight text-text-primary">Short Loop Callbacks</h4>
                            <p className="text-sm font-medium text-text-muted">Standardized objections that force a callback time</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            {objections.map(o => (
                                <div key={o.id} className="flex flex-col gap-1 p-3 bg-surface-main border border-border-subtle rounded-xl text-sm text-text-secondary w-full relative group">
                                    <div className="flex justify-between items-start">
                                        <div className="font-bold text-text-primary uppercase tracking-tight">{o.text}</div>
                                        <button onClick={() => removeObjection(o.id)} className="text-text-muted hover:text-rose-500 rounded-full bg-surface-highlight p-1 transition-colors opacity-0 group-hover:opacity-100">
                                            <X size={14} />
                                        </button>
                                    </div>
                                    {o.rebuttal && <div className="text-xs text-text-muted italic border-l-2 border-accent-secondary/50 pl-2 mt-1 py-0.5 whitespace-pre-wrap">"{o.rebuttal}"</div>}
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border-subtle border-dashed">
                            <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                className="w-full px-3 py-2 bg-surface-main border border-border-subtle rounded-lg text-sm font-bold" 
                                placeholder="Short Objection Label (e.g., Checking finances)" 
                                value={newObjection}
                                onChange={e => {
                                    setNewObjection(e.target.value);
                                    if(!selectedSimObjection) setSelectedSimObjection(e.target.value);
                                }}
                            />
                            <textarea
                                className="w-full px-3 py-2 bg-surface-main border border-border-subtle rounded-lg text-sm text-text-secondary min-h-[60px] resize-none"
                                placeholder="Live Rebuttal Script..."
                                value={newRebuttal}
                                onChange={e => setNewRebuttal(e.target.value)}
                            />
                            <Button variant="secondary" onClick={addObjection} className="py-2 shrink-0 self-end mt-1">
                                <Plus size={14} className="mr-2" /> Add Objection Route
                            </Button>
                        </div>
                    </div>
                </div>

            </div>

            {/* LIVE PLAYGROUND PITCH SIMULATOR */}
            <div className="p-4 bg-surface-alt/40 border border-border-subtle rounded-xl space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 text-accent-secondary rounded-xl font-bold">
                        <Zap size={18} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-text-primary">Admin Sandbox: Dynamic Scripting Compiler</h4>
                        <p className="text-sm text-text-muted">Preview how the custom product parameters compile on agent terminals</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-text-muted uppercase tracking-wider">Select Product Context</label>
                            <select 
                                value={selectedSimProduct}
                                onChange={e => setSelectedSimProduct(e.target.value)}
                                className="w-full px-3 py-2.5 bg-surface-main border border-border-subtle rounded-xl text-sm text-text-primary outline-none focus:border-accent-secondary"
                            >
                                <option value="">-- No Product Selected --</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.name}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-text-muted uppercase tracking-wider">Select Expected Objection</label>
                            <select 
                                value={selectedSimObjection}
                                onChange={e => setSelectedSimObjection(e.target.value)}
                                className="w-full px-3 py-2.5 bg-surface-main border border-border-subtle rounded-xl text-sm text-text-primary outline-none focus:border-accent-secondary"
                            >
                                <option value="">-- No Objection Selected --</option>
                                {objections.map(o => (
                                    <option key={o.id} value={o.text}>{o.text}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="bg-surface-main border border-border-subtle rounded-xl p-5 space-y-4">
                        <div>
                            <span className="text-sm uppercase font-mono font-bold text-accent-secondary tracking-wide block mb-2 animate-pulse">
                                Live Compiled Rebuttal Script
                            </span>
                            <div className="p-4 rounded-xl bg-surface-alt border border-border-subtle text-sm text-text-secondary leading-relaxed font-serif italic text-left relative min-h-[90px]">
                                {getSimulatedScript()}
                            </div>
                        </div>

                        {selectedSimProduct && (
                            <div className="text-sm text-text-muted font-bold tracking-wide flex flex-col gap-1.5">
                                <div className="flex justify-between items-center bg-surface-alt px-3 py-1.5 rounded-lg">
                                    <span>Calculated Supply Lifetime:</span>
                                    <span className="text-emerald-500 font-mono">
                                        {products.find(p => p.name === selectedSimProduct)?.supplyDays || 30} Days
                                    </span>
                                </div>
                                <div className="flex justify-between items-center bg-surface-alt px-3 py-1.5 rounded-lg">
                                    <span>Target Cross-sell Action:</span>
                                    <span className="text-accent-secondary font-mono">
                                        {products.find(p => p.name === selectedSimProduct)?.crossSell || 'None'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};
