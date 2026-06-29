import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, X, AlertCircle, Upload, Link2, Sparkles, RefreshCw, Check } from 'lucide-react';

interface FileMapperModalProps {
    importConfig: any;
    setImportConfig: (data: any) => void;
    activeTab: 'mapping' | 'resolution' | 'preview';
    setActiveTab: (tab: 'mapping' | 'resolution' | 'preview') => void;
    autoMapColumns: () => void;
    columnMapping: Record<string, string>;
    setColumnMapping: (mapping: Record<string, string>) => void;
    dryRunAnalysis: any;
    executeContactImport: () => void;
    isProcessing: boolean;
    playClick: () => void;
    CONTACT_MAPPABLES: any[];
}

export const FileMapperModal: React.FC<FileMapperModalProps> = ({
    importConfig,
    setImportConfig,
    activeTab,
    setActiveTab,
    autoMapColumns,
    columnMapping,
    setColumnMapping,
    dryRunAnalysis,
    executeContactImport,
    isProcessing,
    playClick,
    CONTACT_MAPPABLES
}) => {
    if (!importConfig) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/75 z-[120] flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-4xl bg-surface-main border border-border-subtle rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
                    id="bulk-contacts-wizard-modal"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-border-subtle bg-surface-alt/70 flex justify-between items-center relative">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-accent-primary/10 text-accent-primary rounded-xl">
                                <Upload size={20} />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-text-primary tracking-tight">Unified Contact Ingestion Nexus</h2>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-sm font-mono bg-border-subtle px-2 py-0.5 rounded text-text-secondary font-bold">
                                        {importConfig.fileName}
                                    </span>
                                    <span className="text-sm text-text-muted font-medium">
                                        detected {importConfig.fullData.length} records to process
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => { playClick(); setImportConfig(null); }}
                            className="p-2 border border-border-subtle hover:bg-surface-alt rounded-lg text-text-muted hover:text-text-primary transition-colors"
                            disabled={isProcessing}
                        >
                            <X size={16} />
                        </button>
                        
                        {isProcessing && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-border-subtle overflow-hidden">
                                <div className="h-full bg-accent-primary animate-pulse w-2/3 rounded-r"></div>
                            </div>
                        )}
                    </div>

                    {/* Navigation Tabs */}
                    <div className="px-4 py-2 border-b border-border-subtle bg-surface-alt/30 flex gap-2">
                        <button
                            onClick={() => { playClick(); setActiveTab('mapping'); }}
                            className={`px-3 py-2 text-sm font-bold uppercase tracking-wider rounded-xl transition-all ${
                                activeTab === 'mapping'
                                    ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/25'
                                    : 'text-text-muted hover:text-text-primary hover:bg-surface-alt border border-transparent'
                            }`}
                        >
                            1. Schema Mapping & Sync
                        </button>
                        <button
                            onClick={() => { playClick(); setActiveTab('resolution'); }}
                            className={`px-3 py-2 text-sm font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 ${
                                activeTab === 'resolution'
                                    ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/25'
                                    : 'text-text-muted hover:text-text-primary hover:bg-surface-alt border border-transparent'
                            }`}
                        >
                            2. Resolution Hub (Dry-Run)
                            {dryRunAnalysis.fupCount > 0 && (
                                <span className="bg-status-danger/20 text-status-danger text-sm px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                                    {dryRunAnalysis.fupCount} FUPs
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => { playClick(); setActiveTab('preview'); }}
                            className={`px-3 py-2 text-sm font-bold uppercase tracking-wider rounded-xl transition-all ${
                                activeTab === 'preview'
                                    ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/25'
                                    : 'text-text-muted hover:text-text-primary hover:bg-surface-alt border border-transparent'
                            }`}
                        >
                            3. Spreadsheet Grid Preview
                        </button>
                    </div>

                    {/* Scrollable Content Pane */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {activeTab === 'mapping' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between bg-surface-alt p-4 rounded-xl border border-border-subtle">
                                    <div>
                                        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Configure Column Alignment</h3>
                                        <p className="text-sm text-text-muted mt-1 leading-relaxed">
                                            Match database destinations with your spreadsheet's headers. Direct phone verification is strictly required.
                                        </p>
                                    </div>
                                    <button
                                        onClick={autoMapColumns}
                                        className="px-3.5 py-2 bg-surface-main hover:bg-border-subtle text-accent-primary hover:text-accent-primary border border-border-subtle rounded-xl text-sm font-extrabold tracking-wider uppercase transition-all flex items-center gap-1.5"
                                    >
                                        <Sparkles size={13} className="text-accent-primary animate-pulse" /> Auto Map columns
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {CONTACT_MAPPABLES.map(field => {
                                        const mappedValue = columnMapping[field.key] || '';
                                        const isMapped = !!mappedValue;
                                        return (
                                            <div 
                                                key={field.key} 
                                                className={`p-4 rounded-xl border transition-all ${
                                                    isMapped 
                                                        ? 'bg-surface-alt/75 border-accent-primary/25 shadow-sm shadow-accent-primary/5' 
                                                        : field.required 
                                                            ? 'bg-status-danger/5 border-status-danger/20' 
                                                            : 'bg-surface-alt/20 border-border-subtle'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-sm font-bold tracking-tight text-text-primary">
                                                            {field.label}
                                                        </span>
                                                        {field.required && (
                                                            <span className="text-sm bg-status-danger/10 text-status-danger px-1.5 py-0.5 rounded font-bold uppercase">
                                                                Required
                                                            </span>
                                                        )}
                                                    </div>
                                                    {isMapped ? (
                                                        <span className="text-sm text-accent-primary flex items-center gap-1 font-bold">
                                                            <CheckCircle2 size={12} /> Bound
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-text-muted italic">
                                                            Unmapped
                                                        </span>
                                                    )}
                                                </div>

                                                <select
                                                    value={mappedValue}
                                                    onChange={(e) => {
                                                        playClick();
                                                        setColumnMapping({
                                                            ...columnMapping,
                                                            [field.key]: e.target.value
                                                        });
                                                    }}
                                                    className="w-full bg-surface-main border border-border-strong rounded-lg px-2.5 py-2 text-sm font-semibold text-text-primary outline-none focus:border-accent-primary"
                                                >
                                                    <option value="">-- Ignore / Do Not Map --</option>
                                                    {importConfig.headers.map((header: string) => (
                                                        <option key={header} value={header}>{header}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {activeTab === 'resolution' && (
                            <div className="space-y-6">
                                {/* Dynamic Insights Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="p-4 bg-surface-alt border border-border-subtle rounded-xl">
                                        <div className="text-sm font-bold uppercase tracking-wider text-text-muted mb-1">
                                            New Contacts
                                        </div>
                                        <div className="text-xl font-bold text-text-primary tracking-tight font-mono">
                                            {dryRunAnalysis.newCount}
                                        </div>
                                        <p className="text-sm text-text-muted mt-1 leading-none">
                                            establishing new profiles
                                        </p>
                                    </div>

                                    <div className="p-4 bg-surface-alt border border-border-subtle rounded-xl">
                                        <div className="text-sm font-bold uppercase tracking-wider text-text-muted mb-1">
                                            Duplicates Detected
                                        </div>
                                        <div className="text-xl font-bold text-text-secondary tracking-tight font-mono">
                                            {dryRunAnalysis.duplicateCount}
                                        </div>
                                        <p className="text-sm text-text-muted mt-1 leading-none">
                                            colliding on direct phones
                                        </p>
                                    </div>

                                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                                        <div className="text-sm font-bold uppercase tracking-wider text-emerald-600 mb-1">
                                            Auto-Stitch targets
                                        </div>
                                        <div className="text-xl font-bold text-emerald-600 tracking-tight font-mono">
                                            {dryRunAnalysis.stitchCount}
                                        </div>
                                        <p className="text-sm text-text-muted mt-1 leading-none">
                                            patching missing details
                                        </p>
                                    </div>

                                    <div className="p-4 bg-status-danger/5 border border-status-danger/20 rounded-xl">
                                        <div className="text-sm font-bold uppercase tracking-wider text-status-danger mb-1">
                                            FUP / Rejection recovery
                                        </div>
                                        <div className="text-xl font-bold text-status-danger tracking-tight font-mono">
                                            {dryRunAnalysis.fupCount}
                                        </div>
                                        <p className="text-sm text-text-muted mt-1 leading-none font-bold">
                                            high-priority follow-ups
                                        </p>
                                    </div>
                                </div>

                                {/* Key stitching directives */}
                                <div className="p-5 border border-border-subtle rounded-xl bg-surface-alt/45 space-y-4">
                                    <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                                        <Link2 className="text-accent-primary font-bold" size={15} />
                                        Ingestion & Converging Rules
                                    </h3>
                                    
                                    <div className="space-y-3.5 text-sm leading-relaxed text-text-secondary">
                                        <div className="flex items-start gap-2.5">
                                            <div className="p-1 bg-accent-primary/10 text-accent-primary rounded-md mt-0.5 font-bold">✓</div>
                                            <div>
                                                <span className="font-bold text-text-primary">Contact Phone Convergence (No Duplication):</span>
                                                <p className="text-text-muted mt-0.5">
                                                    Every physical phone is a unique key. If an uploaded contact phone already exists, the system does not create a clone. It merges them.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2.5">
                                            <div className="p-1 bg-accent-primary/10 text-accent-primary rounded-md mt-0.5 font-bold">✓</div>
                                            <div>
                                                <span className="font-bold text-text-primary">Historical Address Stitching:</span>
                                                <p className="text-text-muted mt-0.5">
                                                    If the uploaded billing/shipping values representing locations differ from their current profile records, the system preserves the old values by automatically appending them to the "Past Addresses" timeline. No data gets permanently overwritten!
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2.5">
                                            <div className="p-1 bg-accent-primary/10 text-accent-primary rounded-md mt-0.5 font-bold">✓</div>
                                            <div>
                                                <span className="font-bold text-text-primary">High-Triage FUP Flagging:</span>
                                                <p className="text-text-muted mt-0.5">
                                                    Imported contacts with outstanding declined transactions in active sales registers are automatically tagged. This identifies immediate customer recovery phone leads for administrative focus.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'preview' && (
                            <div className="space-y-4">
                                <div className="text-sm text-text-muted font-medium mb-1">
                                    Displaying first 5 rows of your uploaded file. Adjust mapping to see corresponding alignments.
                                </div>
                                <div className="border border-border-subtle rounded-xl overflow-hidden bg-surface-alt">
                                    <div className="overflow-x-auto max-w-full">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                                <tr className="bg-surface-main border-b border-border-subtle">
                                                    {importConfig.headers.map((h: string, i: number) => (
                                                        <th key={i} className="px-4 py-3 font-bold text-text-primary tracking-tight truncate max-w-[150px]">
                                                            {h}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {importConfig.previewData.map((row: any[], rIdx: number) => (
                                                    <tr key={rIdx} className="border-b border-border-subtle hover:bg-surface-main/30 font-medium">
                                                        {row.map((cell: any, cIdx: number) => (
                                                            <td key={cIdx} className="px-4 py-3 text-text-muted font-mono truncate max-w-[150px]">
                                                                {cell}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Buttons */}
                    <div className="p-4 border-t border-border-subtle bg-surface-alt/40 flex justify-between items-center">
                        <div className="text-sm font-semibold text-text-muted">
                            {!columnMapping['phone'] && (
                                <span className="text-status-danger flex items-center gap-1">
                                    <AlertCircle size={14} /> Phone column alignment is strictly required
                                </span>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => { playClick(); setImportConfig(null); }}
                                className="px-5 py-3 border border-border-subtle rounded-xl text-sm font-bold tracking-wider uppercase hover:bg-surface-alt text-text-secondary transition-colors"
                                disabled={isProcessing}
                            >
                                Cancel Upload
                            </button>
                            
                            <button
                                type="button"
                                onClick={executeContactImport}
                                className="px-4 py-3 bg-accent-primary text-white disabled:bg-border-subtle disabled:text-text-muted disabled:cursor-not-allowed rounded-xl text-sm font-extrabold tracking-wider uppercase hover:bg-accent-primary/90 transition-colors shadow-lg shadow-accent-primary/10 flex items-center gap-2"
                                disabled={!columnMapping['phone'] || isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <RefreshCw size={14} className="animate-spin" /> Ingesting Contacts...
                                    </>
                                ) : (
                                    <>
                                        <Check size={14} /> Execute Ingestion ({importConfig.fullData.length} Rows)
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
