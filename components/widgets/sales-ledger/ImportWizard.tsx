
import React, { useMemo, useState, useEffect } from 'react';
import { 
    RefreshCw, 
    User, 
    Activity, Sparkles, Fingerprint, Link2,
    ArrowRight, ShieldCheck
} from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Base';
import { GLOBAL_REGISTRY } from '../../../lib/registry';
import { useCRM } from '../../../hooks/useCRM';
import { nexusGateway } from '../../../nexus/adapters/DataGateway';
import { sfx } from '../../../lib/soundService';
import { calculateIdentityConfidence } from '../../../views/utils/dataSanitizer';
import { Sale, Customer } from '../../../types';

interface ImportWizardProps {
    importConfig: { headers: string[]; previewData: string[][]; fullData: string[][]; fileName: string; } | null;
    onClose: () => void;
    onExecute: (targetAgentId: string, defaultStatus: Sale['status']) => void;
    isProcessing: boolean;
    columnMapping: Record<string, string>;
    setColumnMapping: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    onAutoMap: () => void;
}

export const ImportWizard: React.FC<ImportWizardProps> = ({ 
    importConfig, onClose, onExecute, isProcessing, columnMapping, setColumnMapping, onAutoMap 
}) => {
    const { users } = useCRM();
    const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
    const [targetAgentId, setTargetAgentId] = useState('sys_root');
    const [defaultStatus, setDefaultStatus] = useState<Sale['status']>('Pending');
    const [activeTab, setActiveTab] = useState<'mapping' | 'resolution' | 'preview'>('mapping');

    useEffect(() => {
        const fetchCustomers = async () => {
            const data = await nexusGateway.get('customers');
            setAllCustomers(data);
        };
        if (importConfig) {
            fetchCustomers();
        }
    }, [importConfig]);

    // Run Auto-Map on mount if empty
    useEffect(() => {
        if (importConfig && Object.keys(columnMapping).length === 0) {
            onAutoMap();
        }
    }, [importConfig, columnMapping, onAutoMap]);

    const mappedData = useMemo(() => {
        if (!importConfig) return [];
        return importConfig.fullData.map(row => {
            const entry: any = {};
            Object.entries(columnMapping).forEach(([sysKey, csvHeader]) => {
                const idx = importConfig.headers.indexOf(csvHeader);
                if (idx !== -1) entry[sysKey] = row[idx];
            });
            return entry;
        });
    }, [importConfig, columnMapping]);

    const potentialMatches = useMemo(() => {
        return mappedData.map(entry => {
            const matches = allCustomers.map(c => ({
                customer: c,
                confidence: calculateIdentityConfidence(c, entry)
            })).filter(m => m.confidence >= 50)
               .sort((a, b) => b.confidence - a.confidence);
            return { entry, bestMatch: matches[0] || null };
        }).filter(m => m.bestMatch !== null);
    }, [mappedData, allCustomers]);

    const isStatusMapped = useMemo(() => !!columnMapping['status'], [columnMapping]);

    if (!importConfig) return null;

    return (
        <Modal isOpen={!!importConfig} onClose={onClose} title="Forensic Data Ingestion" size="2xl">
            <div className="space-y-6">
                {/* Protocol Tabs */}
                <div className="flex gap-2 p-1 bg-surface-alt rounded-2xl border border-border-subtle w-fit mx-auto shadow-inner">
                    <button onClick={() => setActiveTab('mapping')} className={`px-6 py-2 rounded-xl text-xs font-[700]  transition-all ${activeTab === 'mapping' ? 'bg-surface-main text-accent-primary shadow-md' : 'text-text-muted hover:text-text-primary'}`}>Schema Mapping</button>
                    <button onClick={() => setActiveTab('resolution')} className={`px-6 py-2 rounded-xl text-xs font-[700]  transition-all ${activeTab === 'resolution' ? 'bg-surface-main text-accent-primary shadow-md' : 'text-text-muted hover:text-text-primary'}`}>Resolution Hub ({potentialMatches.length})</button>
                    <button onClick={() => setActiveTab('preview')} className={`px-6 py-2 rounded-xl text-xs font-[700]  transition-all ${activeTab === 'preview' ? 'bg-surface-main text-accent-primary shadow-md' : 'text-text-muted hover:text-text-primary'}`}>Data Preview</button>
                </div>

                {/* Content Panel */}
                <div className="min-h-[400px]">
                    {activeTab === 'resolution' ? (
                        <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                            <div className="p-4 bg-indigo-500/5 border border-accent-secondary/20 rounded-2xl">
                                <p className="text-xs font-bold text-accent-secondary flex items-center gap-2  tracking-widest"><Sparkles size={16}/> Identity Stitching Analysis</p>
                                <p className="text-xs text-text-muted mt-1 leading-relaxed">The Nexus engine found {potentialMatches.length} existing identities. These records will be merged into their historical timelines automatically.</p>
                            </div>
                            {potentialMatches.map((match, idx) => (
                                <div key={idx} className="p-4 bg-surface-alt/40 border border-border-subtle rounded-2xl flex items-center justify-between group hover:bg-surface-main/40 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-[700] text-text-primary  truncate max-w-[180px]">{match.entry.customer}</span>
                                            <span className="text-xs font-mono text-text-muted">{match.entry.phone}</span>
                                        </div>
                                        <div className="text-accent-secondary group-hover:scale-110 transition-transform"><ArrowRight size={16}/></div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-[700] text-accent-secondary ">{match.bestMatch?.customer.fullName}</span>
                                            <span className="text-xs font-bold text-accent-secondary/60 ">Conf: {match.bestMatch?.confidence}%</span>
                                        </div>
                                    </div>
                                    <div className="bg-emerald-500/10 text-status-success px-3 py-1 rounded-full text-xs font-[700]  tracking-widest flex items-center gap-1.5"><Link2 size={16}/> Auto-Stitch</div>
                                </div>
                            ))}
                        </div>
                    ) : activeTab === 'mapping' ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-2">
                                <p className="text-xs font-bold text-text-muted  tracking-widest">
                                    Map CSV Columns to System Fields
                                </p>
                                <button 
                                    onClick={onAutoMap} 
                                    className="flex items-center gap-2 px-3 py-1.5 bg-accent-primary/10 hover:bg-accent-primary/20 border border-accent-primary/30 rounded-lg text-xs font-[700]  text-accent-primary transition-all shadow-sm active:scale-95"
                                >
                                    <Sparkles size={16} className="animate-pulse"/> Auto-Detect
                                </button>
                            </div>
                            <div className="grid grid-cols-1 gap-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                                {GLOBAL_REGISTRY.map(field => {
                                    const isMapped = !!columnMapping[field.key];
                                    return (
                                        <div key={field.key} className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${isMapped ? 'bg-surface-main border-border-subtle shadow-sm' : 'bg-surface-alt/10 border-transparent opacity-70'}`}>
                                            <div className="w-1/3 flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${isMapped ? 'bg-accent-primary/10 text-accent-primary' : 'bg-surface-alt text-text-muted'}`}>
                                                    {field.icon && <field.icon size={16} />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`text-xs font-[700]  ${field.required ? 'text-text-primary' : 'text-text-muted'}`}>
                                                        {field.label} {field.required && <span className="text-status-error">*</span>}
                                                    </span>
                                                    <span className="text-xs font-mono text-text-muted opacity-50">{field.key}</span>
                                                </div>
                                            </div>

                                            <div className="text-text-muted"><ArrowRight size={16}/></div>

                                            <div className="flex-1">
                                                <select 
                                                    className={`w-full bg-surface-alt/50 border border-border-subtle text-sm font-bold p-2.5 rounded-lg outline-none focus:border-accent-primary transition-all shadow-inner ${isMapped ? 'text-text-primary' : 'text-text-muted'}`}
                                                    value={columnMapping[field.key] || ''}
                                                    onChange={(e) => { sfx.playClick(); setColumnMapping(prev => ({ ...prev, [field.key]: e.target.value })); }}
                                                >
                                                    <option value="">-- UNMAPPED --</option>
                                                    {importConfig.headers.map((h, i) => <option key={`opt-${i}`} value={h}>{h}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto border border-border-subtle rounded-2xl max-h-[400px] shadow-inner">
                            <table className="w-full text-left border-collapse bg-surface-main">
                                <thead><tr className="bg-surface-alt text-xs font-[700]  text-text-muted border-b border-border-subtle">{importConfig.headers.map((h, i) => <th key={`th-${i}`} className="p-3 whitespace-nowrap">{h}</th>)}</tr></thead>
                                <tbody className="text-xs font-mono text-text-secondary">{importConfig.previewData.map((row, i) => <tr key={i} className="border-b border-border-subtle/30 hover:bg-surface-highlight">{row.map((cell, ci) => <td key={ci} className="p-3 truncate max-w-[150px]">{cell}</td>)}</tr>)}</tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Attribution & Status Global Override */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border-subtle">
                    <div className="p-4 bg-surface-alt/40 border border-border-subtle rounded-2xl flex items-center gap-4">
                        <div className="p-2 bg-accent-primary/10 rounded-xl text-accent-primary border border-accent-primary/20">
                            <User size={18}/>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-[700] text-text-muted  tracking-widest mb-1">Attribution Authority</p>
                            <select 
                                value={targetAgentId} 
                                onChange={(e) => { sfx.playClick(); setTargetAgentId(e.target.value); }}
                                className="w-full bg-transparent text-xs font-[700] text-text-primary  outline-none cursor-pointer hover:text-accent-primary transition-colors"
                            >
                                {users.filter(u => u.active).map((a, i) => (
                                    <option key={`a-${i}`} value={a.id} className="bg-surface-main">{a.name} ({a.role})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={`p-4 rounded-2xl border transition-all flex items-center gap-4 ${isStatusMapped ? 'bg-surface-alt/20 border-border-subtle/50 opacity-50 cursor-not-allowed' : 'bg-surface-alt/40 border-border-subtle shadow-inner'}`}>
                        <div className={`p-2 rounded-xl border ${defaultStatus === 'Approved' ? 'bg-emerald-500/10 text-status-success border-status-success/30' : defaultStatus === 'Declined' ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' : 'bg-amber-500/10 text-status-warning border-status-warning/30'}`}>
                            <Activity size={18}/>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-[700] text-text-muted  tracking-widest mb-1">Global Status Protocol</p>
                            {isStatusMapped ? (
                                <p className="text-xs font-bold text-text-muted flex items-center gap-1.5"><ShieldCheck size={16}/> Defined by CSV column</p>
                            ) : (
                                <div className="flex gap-1">
                                    <button 
                                        onClick={() => { sfx.playClick(); setDefaultStatus('Pending'); }}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-[700]  border transition-all ${defaultStatus === 'Pending' ? 'bg-amber-500 text-white border-amber-600 shadow-sm' : 'bg-surface-main text-text-muted border-border-subtle hover:text-text-primary'}`}
                                    >Pending</button>
                                    <button 
                                        onClick={() => { sfx.playClick(); setDefaultStatus('Approved'); }}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-[700]  border transition-all ${defaultStatus === 'Approved' ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm' : 'bg-surface-main text-text-muted border-border-subtle hover:text-text-primary'}`}
                                    >Approved</button>
                                    <button 
                                        onClick={() => { sfx.playClick(); setDefaultStatus('Declined'); }}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-[700]  border transition-all ${defaultStatus === 'Declined' ? 'bg-rose-500 text-white border-rose-600 shadow-sm' : 'bg-surface-main text-text-muted border-border-subtle hover:text-text-primary'}`}
                                    >Declined</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Direct Action Footer */}
                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="secondary" onClick={onClose} className="h-12 px-8 text-sm font-[700]  tracking-[0.2em]">Abort Sync</Button>
                    <Button 
                        variant="primary" 
                        className="h-12 px-12 bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 border border-status-success/30 font-[700]  tracking-[0.2em] relative overflow-hidden group"
                        onClick={() => { sfx.playSubmit(); onExecute(targetAgentId, defaultStatus); }} 
                        disabled={isProcessing || Object.keys(columnMapping).length === 0}
                    >
                        <div className="absolute inset-0 bg-surface-highlight translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        {isProcessing ? (
                            <RefreshCw className="animate-spin" size={16}/>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Fingerprint size={16}/>
                                <span>Commit {importConfig?.fullData.length} Records</span>
                            </div>
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
