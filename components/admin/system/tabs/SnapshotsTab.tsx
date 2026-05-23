import React, { useState } from 'react';
import { Card, Button } from '../../../ui/Base';
import { Package, Download, Upload, Copy, Settings, Check, Globe, LayoutTemplate, Share2 } from 'lucide-react';
import { sfx } from '../../../../lib/soundService';

interface Snapshot {
    id: string;
    name: string;
    description: string;
    version: string;
    moduleCount: number;
    size: string;
    lastUpdated: string;
}

const mockSnapshots: Snapshot[] = [
    { id: 'snap_1', name: 'Real Estate Mastery', description: 'Complete CRM setup for real estate agents with pre-built email templates and pipelines.', version: 'v2.1', moduleCount: 14, size: '2.4 MB', lastUpdated: '2 days ago' },
    { id: 'snap_2', name: 'Dental Practice Pro', description: 'Automation flows for appointment reminders, pipeline stages, and custom fields for patients.', version: 'v1.4', moduleCount: 9, size: '1.1 MB', lastUpdated: '1 week ago' },
    { id: 'snap_3', name: 'SaaS Onboarding', description: 'Standard B2B SaaS onboarding sequences, support pipelines, and customer health scoring fields.', version: 'v3.0', moduleCount: 22, size: '4.8 MB', lastUpdated: '1 month ago' },
];

export const SnapshotsTab = () => {
    const [snapshots] = useState<Snapshot[]>(mockSnapshots);
    const [deployingId, setDeployingId] = useState<string | null>(null);
    const [exportingId, setExportingId] = useState<string | null>(null);

    const handleDeploy = (id: string) => {
        sfx.playClick();
        setDeployingId(id);
        setTimeout(() => {
            sfx.playSuccess();
            setDeployingId(null);
            alert('Snapshot deployed successfully to the current sub-account!');
        }, 1500);
    };

    const handleExport = (id: string) => {
        sfx.playClick();
        setExportingId(id);
        setTimeout(() => {
            sfx.playConfirm();
            setExportingId(null);
        }, 1000);
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-surface-main/80 backdrop-blur-xl p-4 rounded-3xl border border-border-subtle shadow-sm gap-4 shrink-0 relative overflow-hidden">
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 bg-accent-secondary/10 border-2 border-accent-secondary/20 rounded-2xl flex items-center justify-center text-accent-secondary shadow-inner">
                        <Package size={24} />
                    </div>
                    <div>
                        <h2 className="text-sm font-[700] text-text-primary  tracking-widest">Snapshot Engine</h2>
                        <p className="text-sm font-medium text-text-muted mt-1">Package & deploy CRM configurations instantly across sub-accounts.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 relative z-10 w-full sm:w-auto">
                    <Button variant="secondary" className="flex-1 sm:flex-none border-border-subtle" onClick={() => sfx.playClick()}>
                        <Upload size={16} className="mr-2"/> Import
                    </Button>
                    <Button variant="primary" className="flex-1 sm:flex-none bg-indigo-500 hover:bg-indigo-600 border border-indigo-400 shadow-indigo-500/30" onClick={() => sfx.playClick()}>
                        <Copy size={16} className="mr-2"/> Create Snapshot
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {snapshots.map(snap => (
                    <Card key={snap.id} variant="panel" className="p-0 overflow-hidden bg-surface-main border-border-subtle hover:border-indigo-500/30 transition-all duration-300 group">
                        <div className="p-5 flex items-start justify-between border-b border-border-subtle/50 bg-gradient-to-br from-surface-alt/50 to-transparent">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-surface-main border border-border-subtle flex items-center justify-center text-text-muted group-hover:text-accent-secondary transition-colors shadow-sm">
                                    <LayoutTemplate size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-text-primary tracking-tight">{snap.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs font-[700]  tracking-wider text-accent-secondary bg-accent-secondary/10 px-2.5 py-1 rounded border border-accent-secondary/20">{snap.version}</span>
                                        <span className="text-xs text-text-muted font-mono">{snap.size}</span>
                                    </div>
                                </div>
                            </div>
                            <button className="text-text-muted hover:text-text-primary transition-colors p-1" onClick={() => sfx.playClick()}>
                                <Settings size={16} />
                            </button>
                        </div>
                        
                        <div className="p-5 bg-surface-main/30 space-y-4">
                            <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 min-h-[40px]">{snap.description}</p>
                            
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-2 border border-border-subtle rounded-lg bg-surface-main flex flex-col justify-center items-center text-center">
                                    <div className="text-[20px] font-[700] font-mono text-text-primary num-font leading-none">{snap.moduleCount}</div>
                                    <div className="text-xs font-bold  tracking-widest text-text-muted mt-1">Modules</div>
                                </div>
                                <div className="p-2 border border-border-subtle rounded-lg bg-surface-main flex flex-col justify-center items-center text-center">
                                    <div className="text-sm font-medium text-text-primary leading-none mt-1"><Globe size={16} className="text-status-success"/></div>
                                    <div className="text-xs font-bold  tracking-widest text-text-muted mt-1">Global</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-border-subtle bg-surface-alt/30 flex items-center justify-between gap-3">
                            <span className="text-xs text-text-muted font-medium ml-2">Updated {snap.lastUpdated}</span>
                            <div className="flex gap-2">
                                <Button 
                                    variant="secondary" 
                                    className="h-9 px-3 text-xs font-bold "
                                    onClick={() => handleExport(snap.id)}
                                    isLoading={exportingId === snap.id}
                                >
                                    <Download size={16} className="mr-1.5 opacity-70" /> Export
                                </Button>
                                <Button 
                                    variant="primary" 
                                    className="h-9 px-4 text-xs font-bold  bg-accent-secondary/10 hover:bg-indigo-500 border border-indigo-500/30 text-accent-secondary hover:text-white"
                                    onClick={() => handleDeploy(snap.id)}
                                    isLoading={deployingId === snap.id}
                                >
                                    {deployingId === snap.id ? <Check size={16} className="mr-1.5" /> : <Share2 size={16} className="mr-1.5" />}
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
