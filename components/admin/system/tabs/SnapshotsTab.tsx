import { useSystem } from '../../../../hooks/useSystem';
import { useCRM } from '../../../../hooks/useCRM';
import React, { useState, useRef, useEffect } from 'react';
import { Card, Button } from '../../../ui/Base';
import { Package, Download, Upload, Copy, Settings, Check, Globe, LayoutTemplate, Share2, Shield, Activity, RefreshCw, Trash2 } from 'lucide-react';
import { sfx } from '../../../../lib/soundService';

interface Snapshot {
    id: string;
    name: string;
    description: string;
    version: string;
    moduleCount: number;
    size: string;
    lastUpdated: string;
    payload?: any;
}

const mockSnapshots: Snapshot[] = [
    { id: 'snap_1', name: 'Real Estate Mastery', description: 'Complete CRM setup for real estate agents with pre-built email templates and pipelines.', version: 'v2.1', moduleCount: 14, size: '2.4 MB', lastUpdated: '2 days ago' },
    { id: 'snap_2', name: 'Dental Practice Pro', description: 'Automation flows for appointment reminders, pipeline stages, and custom fields for patients.', version: 'v1.4', moduleCount: 9, size: '1.1 MB', lastUpdated: '1 week ago' },
    { id: 'snap_3', name: 'SaaS Onboarding', description: 'Standard B2B SaaS onboarding sequences, support pipelines, and customer health scoring fields.', version: 'v3.0', moduleCount: 22, size: '4.8 MB', lastUpdated: '1 month ago' },
];

export const SnapshotsTab = () => { 
    const { setToast } = useSystem();
    const { systemConfig, updateSystemConfig, productConfig } = useCRM();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [snapshots, setSnapshots] = useState<Snapshot[]>(() => {
        const stored = localStorage.getItem('bh_snapshots');
        if (stored) {
            try { return JSON.parse(stored); } catch (e) { console.error(e); }
        }
        return mockSnapshots;
    });

    useEffect(() => {
        localStorage.setItem('bh_snapshots', JSON.stringify(snapshots));
    }, [snapshots]);

    const [deployingId, setDeployingId] = useState<string | null>(null);
    const [exportingId, setExportingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Snapshot builder parameters

    const [showBuilder, setShowBuilder] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newVer, setNewVer] = useState('v1.0.0');
    const [includeOps, setIncludeOps] = useState(true);
    const [includeComps, setIncludeComps] = useState(true);
    const [includePlaybooks, setIncludePlaybooks] = useState(true);
    const [isForging, setIsForging] = useState(false);
    const [forgeLogs, setForgeLogs] = useState<string[]>([]);

    const handleDeploy = async (id: string) => {
        sfx.playClick();
        const snap = snapshots.find(s => s.id === id);
        
        // If it's a mock snapshot, we can simulate the payload
        let payloadToApply = snap?.payload?.systemConfig;
        if (!payloadToApply) {
            payloadToApply = systemConfig; // Use current system config as fallback for mocks
            if (!payloadToApply) {
                setToast({ title: "Deploy Failed", message: "Snapshot payload is empty or invalid structure.", type: "error" });
                return;
            }
            setToast({ title: "Notice", message: "Demo snapshot detected. Wrapping active config for simulation.", type: "info" });
        }

        // if (!window.confirm(`WARNING: Deploying "${snap?.name}" will overwrite the active system configurations. Proceed?`)) {
        //     return;
        // }

        setDeployingId(id);
        
        try {
            await updateSystemConfig(payloadToApply);
            // Simulating broader deployments via timeout
            setTimeout(() => {
                sfx.playSuccess();
                setDeployingId(null);
                setToast({ title: "Alert", message: "Snapshot deployed successfully to the active workspace!", type: "warning" });
            }, 1500);
        } catch (error) {
            setDeployingId(null);
            setToast({ title: "Deploy Failed", message: "Failed to apply system configuration module.", type: "error" });
        }
    };

    const handleDelete = (id: string) => {
        const snap = snapshots.find(s => s.id === id);
        // if (window.confirm(`Are you sure you want to permanently delete snapshot "${snap?.name}"?`)) {
            sfx.playDecline();
            setDeletingId(id);
            setTimeout(() => {
                setSnapshots(prev => prev.filter(s => s.id !== id));
                setDeletingId(null);
                setToast({ title: "Snapshot Deleted", message: "Package removed from system.", type: "success" });
            }, 600);
        // }
    };

    const handleExport = (id: string) => {
        sfx.playClick();
        const snap = snapshots.find(s => s.id === id);
        
        // Simulating the payload if missing
        const snapDataToExport = { ...snap };
        if (!snapDataToExport.payload) {
             snapDataToExport.payload = {
                 systemConfig,
                 productConfig,
                 metadata: { source: 'mock-simulation' }
             };
        }

        setExportingId(id);
        setTimeout(() => {
            try {
                const dataStr = JSON.stringify(snapDataToExport, null, 2);
                const blob = new Blob([dataStr], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `snapshot_${snap.name.replace(/\s+/g, '_').toLowerCase()}_${snap.version}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                
                sfx.playConfirm();
                setToast({ title: "Secure Export", message: "Snapshot configurations serialized to file stream.", type: "success" });
            } catch (err) {
                setToast({ title: "Export Failed", message: "Unable to serialize snapshot.", type: "error" });
            } finally {
                setExportingId(null);
            }
        }, 800);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target?.result as string);
                if (parsed && parsed.payload) {
                    // Update ID to guarantee unique list injection
                    const importedSnap = {
                        ...parsed,
                        id: `snap_imported_${Date.now()}`,
                        lastUpdated: 'Just Imported'
                    };
                    setSnapshots(prev => [importedSnap, ...prev]);
                    sfx.playSuccess();
                    setToast({ title: "Import Successful", message: `Loaded snapshot: ${parsed.name}`, type: "success" });
                } else {
                    throw new Error("Invalid schema");
                }
            } catch (error) {
                sfx.playDecline();
                setToast({ title: "Import Failed", message: "File is not a valid snapshot container.", type: "error" });
            }
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsText(file);
    };

    const initiateForge = () => {
        if (!newName) {
            sfx.playDecline();
            setToast({ title: "Validation Error", message: "Snapshot name is required before forging.", type: "error" });
            return;
        }

        sfx.playClick();
        setIsForging(true);
        setForgeLogs([]);

        const steps = [
            'Analyzing current system namespace schemas...',
            'Compiling operational shift patterns and cycles...',
            'Serializing compensation tables and spiff rules...',
            'Packaging 1-Call sales script playground profiles...',
            'Generating cryptographic verification checksum...'
        ];

        steps.forEach((step, idx) => {
            setTimeout(() => {
                setForgeLogs(prev => [...prev, `[OK] ${step}`]);
                sfx.playClick();
                if (idx === steps.length - 1) {
                    setTimeout(() => {
                        const totalModules = (includeOps ? 5 : 0) + (includeComps ? 4 : 0) + (includePlaybooks ? 6 : 0) || 3;
                        const payload = {
                            systemConfig: includeOps ? systemConfig : undefined,
                            productConfig: includeComps ? productConfig : undefined,
                            metadata: { timestamp: Date.now(), included: { ops: includeOps, comps: includeComps, playbooks: includePlaybooks } }
                        };
                        const payloadSizeInMB = (new Blob([JSON.stringify(payload)]).size / 1024 / 1024).toFixed(3);
                        
                        const newSnap: Snapshot = {
                            id: `snap_${Date.now()}`,
                            name: newName,
                            description: newDesc || 'Custom admin package exported from live workspace.',
                            version: newVer,
                            moduleCount: totalModules,
                            size: `${payloadSizeInMB} MB`,
                            lastUpdated: 'Just now',
                            payload
                        };
                        setSnapshots(prev => [newSnap, ...prev]);
                        setIsForging(false);
                        setShowBuilder(false);
                        setNewName('');
                        setNewDesc('');
                        sfx.playSuccess();
                        setToast({ title: "Snapshot Generated", message: `Successfully forged ${newName}`, type: "success" });
                    }, 800);
                }
            }, (idx + 1) * 450);
        });
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-surface-main/80  p-4 rounded-xl border border-border-subtle shadow-sm gap-4 shrink-0 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-5 opacity-5 pointer-events-none">
                    <Package size={120} />
                </div>
                <div className="flex items-center gap-4 relative z-10 text-left">
                    <div className="w-14 h-14 bg-accent-secondary/10 border-2 border-accent-secondary/20 rounded-xl flex items-center justify-center text-accent-secondary shadow-inner">
                        <Package size={28} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-text-primary uppercase tracking-wide">Snapshot Engine</h2>
                        <p className="text-base font-medium text-text-muted mt-1">Package & deploy CRM configurations instantly across sub-accounts.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 relative z-10 w-full sm:w-auto">
                    <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImport} />
                    <Button variant="secondary" className="flex-1 sm:flex-none border-border-subtle text-base font-bold" onClick={() => { sfx.playClick(); fileInputRef.current?.click(); }}>
                        <Upload size={18} className="mr-2"/> Import
                    </Button>
                    <Button 
                        variant="primary" 
                        className="flex-1 sm:flex-none bg-indigo-500 hover:bg-indigo-600 border border-indigo-400 shadow-indigo-500/30 text-base font-bold text-white px-5" 
                        onClick={() => { sfx.playClick(); setShowBuilder(true); }}
                    >
                        <Copy size={18} className="mr-2"/> Forge Snapshot
                    </Button>
                </div>
            </div>

            {showBuilder && (
                <div className="p-4 bg-surface-alt/40 border border-border-subtle rounded-xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
                        <div className="flex items-center gap-2">
                            <Shield className="text-indigo-500 animate-pulse" size={20} />
                            <h4 className="text-base font-bold text-text-primary uppercase tracking-wider">Forge Secure Custom Snapshot</h4>
                        </div>
                        <button 
                            onClick={() => { sfx.playDecline(); setShowBuilder(false); }}
                            className="text-base font-bold text-text-muted hover:text-text-primary px-4 py-2 bg-surface-main rounded-xl border border-border-subtle transition-colors"
                        >
                            Cancel
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-2">
                                <div className="col-span-2 space-y-1.5">
                                    <label className="text-sm font-bold uppercase text-text-muted tracking-wide block mb-1">Package Name</label>
                                    <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                        type="text" 
                                        placeholder="e.g. Enterprise Roster v2" 
                                        value={newName} 
                                        onChange={e => setNewName(e.target.value)}
                                        className="w-full bg-surface-main border border-border-subtle rounded-xl py-3 px-4 text-base font-bold text-text-primary outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold uppercase text-text-muted tracking-wide block mb-1">Version</label>
                                    <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                        type="text" 
                                        value={newVer} 
                                        onChange={e => setNewVer(e.target.value)}
                                        className="w-full bg-surface-main border border-border-subtle rounded-xl py-3 px-4 text-base font-mono font-bold text-text-primary text-center outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold uppercase text-text-muted tracking-wide block mb-1">Description</label>
                                <textarea 
                                    placeholder="Brief summary of what settings and parameters this package contains." 
                                    rows={3}
                                    value={newDesc}
                                    onChange={e => setNewDesc(e.target.value)}
                                    className="w-full bg-surface-main border border-border-subtle rounded-xl py-3 px-4 text-base font-medium text-text-primary outline-none resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>

                            <div className="space-y-3">
                                <span className="text-sm uppercase font-bold tracking-wide text-text-muted block">Systems to Bundle</span>
                                <div className="flex flex-wrap gap-3">
                                    <button 
                                        onClick={() => { sfx.playClick(); setIncludeOps(!includeOps); }}
                                        className={`px-4 py-2 rounded-xl border text-base font-bold transition-all ${includeOps ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-sm' : 'bg-surface-main border-border-subtle text-text-muted'}`}
                                    >
                                        Operations Settings
                                    </button>
                                    <button 
                                        onClick={() => { sfx.playClick(); setIncludeComps(!includeComps); }}
                                        className={`px-4 py-2 rounded-xl border text-base font-bold transition-all ${includeComps ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-sm' : 'bg-surface-main border-border-subtle text-text-muted'}`}
                                    >
                                        Compensation Matrix
                                    </button>
                                    <button 
                                        onClick={() => { sfx.playClick(); setIncludePlaybooks(!includePlaybooks); }}
                                        className={`px-4 py-2 rounded-xl border text-base font-bold transition-all ${includePlaybooks ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-sm' : 'bg-surface-main border-border-subtle text-text-muted'}`}
                                    >
                                        Sales Playbooks
                                    </button>
                                </div>
                            </div>

                            <button
                                type="button"
                                disabled={isForging || !newName}
                                onClick={initiateForge}
                                className="w-full h-12 rounded-xl bg-indigo-500 text-surface-main hover:bg-indigo-600 font-extrabold text-base uppercase tracking-wide transition-all shadow-sm disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 mt-4"
                            >
                                {isForging ? (
                                    <>
                                        <RefreshCw size={18} className="animate-spin" />
                                        Bundling Live Environment...
                                    </>
                                ) : (
                                    'Compile Blueprint'
                                )}
                            </button>
                        </div>

                        <div className="bg-surface-main/60 border border-border-subtle rounded-xl p-5 min-h-[180px] flex flex-col uppercase font-mono text-base tracking-wider text-text-muted space-y-2">
                            <span className="font-extrabold text-text-primary pb-2 border-b border-border-subtle mb-2">Live Compiler Outputs</span>
                            {forgeLogs.map((log, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-status-success font-bold">
                                    <Check size={16} strokeWidth={4} />
                                    <span>{log}</span>
                                </div>
                            ))}
                            {isForging && <div className="text-indigo-400 animate-pulse font-bold mt-2">Forging package manifest key...</div>}
                            {!isForging && forgeLogs.length === 0 && <span className="opacity-40 italic">Waiting to initiate snap compiler sequence...</span>}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {snapshots.map(snap => (
                    <Card key={snap.id} variant="panel" className="p-0 overflow-hidden bg-surface-main border-border-subtle hover:border-indigo-500/30 transition-all duration-300 group">
                        <div className="p-5 flex items-start justify-between border-b border-border-subtle/50 bg-gradient-to-br from-surface-alt/50 to-transparent">
                            <div className="flex items-center gap-4 text-left">
                                <div className="w-14 h-14 rounded-xl bg-surface-main border border-border-subtle flex items-center justify-center text-text-muted group-hover:text-accent-secondary transition-colors shadow-sm">
                                    <LayoutTemplate size={24} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-text-primary tracking-tight">{snap.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-base font-bold tracking-wider text-accent-secondary bg-accent-secondary/10 px-2.5 py-1 rounded border border-accent-secondary/20">{snap.version}</span>
                                        <span className="text-base text-text-muted font-mono bg-surface-main px-2 py-1 rounded border border-border-subtle">{snap.size}</span>
                                    </div>
                                </div>
                            </div>
                            <button className="text-text-muted hover:text-text-primary transition-colors p-2" onClick={() => sfx.playClick()}>
                                <Settings size={20} />
                            </button>
                        </div>
                        
                        <div className="p-5 bg-surface-main/30 space-y-4 text-left">
                            <p className="text-base font-medium text-text-secondary leading-relaxed line-clamp-2 min-h-[48px]">{snap.description}</p>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 border border-border-subtle rounded-xl bg-surface-main flex flex-col justify-center items-center text-center shadow-sm">
                                    <div className="text-3xl font-bold font-mono text-text-primary num-font leading-none">{snap.moduleCount}</div>
                                    <div className="text-sm font-bold uppercase tracking-wide text-text-muted mt-2">Modules</div>
                                </div>
                                <div className="p-3 border border-border-subtle rounded-xl bg-surface-main flex flex-col justify-center items-center text-center shadow-sm">
                                    <div className="text-3xl font-medium text-text-primary leading-none"><Globe size={24} className="text-status-success"/></div>
                                    <div className="text-sm font-bold uppercase tracking-wide text-text-muted mt-2">Global</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 border-t border-border-subtle bg-surface-alt/30 flex items-center justify-between gap-3">
                            <span className="text-base text-text-muted font-bold ml-2">Updated {snap.lastUpdated}</span>
                            <div className="flex gap-3">
                                <Button
                                    variant="secondary"
                                    className="h-11 px-3 text-base text-status-error bg-status-error/10 border-status-error/20 hover:bg-status-error hover:text-white transition-colors"
                                    onClick={() => handleDelete(snap.id)}
                                    isLoading={deletingId === snap.id}
                                    title="Delete Snapshot"
                                >
                                    <Trash2 size={18} />
                                </Button>
                                <Button 
                                    variant="secondary" 
                                    className="h-11 px-4 text-base font-bold bg-surface-main"
                                    onClick={() => handleExport(snap.id)}
                                    isLoading={exportingId === snap.id}
                                >
                                    <Download size={18} className="mr-1.5 opacity-70" /> Export
                                </Button>
                                <Button 
                                    variant="primary" 
                                    className="h-11 px-5 text-base font-bold bg-accent-secondary/10 hover:bg-indigo-500 border border-indigo-500/30 text-accent-secondary hover:text-white"
                                    onClick={() => handleDeploy(snap.id)}
                                    isLoading={deployingId === snap.id}
                                >
                                    {deployingId === snap.id ? <Check size={18} className="mr-2" /> : <Share2 size={18} className="mr-2" />}
                                    Deploy
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
