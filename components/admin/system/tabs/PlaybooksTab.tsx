import React, { useState } from 'react';
import { Target, Zap, PackageOpen, RotateCcw, MessageCircle, Plus, X } from 'lucide-react';
import { SectionHeader } from '../SectionHeader';
import { ConfigToggle } from '../ConfigToggle';
import { Button } from '../../../ui/Base';

export const PlaybooksTab = () => {
    // 1-Call Close Engine state
    const [engineEnabled, setEngineEnabled] = useState(true);
    const [nudgeSettings, setNudgeSettings] = useState({
        enabled: true,
        days: 7,
    });
    
    // Configurable Items
    const [products, setProducts] = useState([
        { id: 1, name: 'Braveheart Elite Plan', supplyDays: 30, crossSell: 'Protection Add-on' }
    ]);
    const [objections, setObjections] = useState([
        { id: 1, text: 'Need to speak to spouse' },
        { id: 2, text: 'Checking finances first' },
        { id: 3, text: 'Driving right now' }
    ]);

    // Product inputs
    const [newProdName, setNewProdName] = useState('');
    const [newProdSupply, setNewProdSupply] = useState('30');
    const [newProdCross, setNewProdCross] = useState('');

    // Objection input
    const [newObjection, setNewObjection] = useState('');

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
        setObjections([...objections, { id: Date.now(), text: newObjection }]);
        setNewObjection('');
    };

    const removeProduct = (id: number) => setProducts(products.filter(p => p.id !== id));
    const removeObjection = (id: number) => setObjections(objections.filter(o => o.id !== id));

    return (
        <section className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <SectionHeader 
                icon={Target} 
                title="1-Call Close Operations" 
                sub="Configure products, playbooks, and automated loops for maximum conversions" 
                color="text-accent-secondary" 
            />

            <div className="p-5 bg-surface-highlight border border-border-subtle rounded-2xl relative overflow-hidden group">
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
                <ConfigToggle 
                    label="Nudge Sequence automation" 
                    active={nudgeSettings.enabled} 
                    onToggle={() => setNudgeSettings({ ...nudgeSettings, enabled: !nudgeSettings.enabled })}
                    icon={MessageCircle}
                    description={`Automated SMS/Email loops spanning ${nudgeSettings.days} days for 'Call Back' leads.`}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* PRODUCTS & SUPPLY */}
                <div className="p-6 bg-surface-alt border border-border-subtle rounded-[32px] space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-border-subtle">
                        <div className="p-2 bg-text-primary text-surface-main rounded-xl">
                            <PackageOpen size={18} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold tracking-tight text-text-primary">Products & Retention Math</h4>
                            <p className="text-xs font-medium text-text-muted">Define product supply life for \"Ready to Reorder\" triggers</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col gap-3">
                            {products.map(p => (
                                <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-surface-main border border-border-subtle rounded-xl">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-text-primary truncate">{p.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-mono text-status-success bg-emerald-500/10 px-2 py-0.5 rounded">{p.supplyDays} Days Supply</span>
                                            {p.crossSell && <span className="text-xs text-text-muted truncate">Upsell: {p.crossSell}</span>}
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
                                    onChange={e => setNewProdName(e.target.value)}
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
                            <Button variant="secondary" className="w-full text-xs" onClick={addProduct}>
                                <Plus size={14} className="mr-1" /> Add Product Formula
                            </Button>
                        </div>
                    </div>
                </div>

                {/* CALLBACK OBJECTIONS */}
                <div className="p-6 bg-surface-alt border border-border-subtle rounded-[32px] space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-border-subtle">
                        <div className="p-2 bg-text-primary text-surface-main rounded-xl">
                            <RotateCcw size={18} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold tracking-tight text-text-primary">Short Loop Callbacks</h4>
                            <p className="text-xs font-medium text-text-muted">Standardized objections that force a callback time</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {objections.map(o => (
                                <div key={o.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-main border border-border-subtle rounded-full text-sm text-text-secondary">
                                    <span>{o.text}</span>
                                    <button onClick={() => removeObjection(o.id)} className="text-text-muted hover:text-rose-500 rounded-full bg-surface-highlight p-0.5">
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border-subtle border-dashed">
                            <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                className="flex-1 px-3 py-2 bg-surface-main border border-border-subtle rounded-lg text-sm" 
                                placeholder="E.g., Need to check bank account" 
                                value={newObjection}
                                onChange={e => setNewObjection(e.target.value)}
                            />
                            <Button variant="secondary" onClick={addObjection} className="py-2 shrink-0">
                                <Plus size={16} />
                            </Button>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};
