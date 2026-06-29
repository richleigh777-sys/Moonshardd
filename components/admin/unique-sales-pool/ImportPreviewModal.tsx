import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, X, AlertCircle, Link2, Plus, RefreshCw, Check } from 'lucide-react';

interface ImportPreviewModalProps {
    previewModalData: any;
    setPreviewModalData: (data: any) => void;
    confirmContactImport: () => void;
    isProcessing: boolean;
    playClick: () => void;
}

export const ImportPreviewModal: React.FC<ImportPreviewModalProps> = ({
    previewModalData,
    setPreviewModalData,
    confirmContactImport,
    isProcessing,
    playClick
}) => {
    if (!previewModalData) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/75 z-[125] flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-surface-base w-full max-w-4xl max-h-[85vh] rounded-xl border border-border-strong shadow-2xl flex flex-col overflow-hidden"
                >
                    <div className="p-6 border-b border-border-strong flex justify-between items-center bg-surface-alt/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                        <div>
                            <h2 className="text-2xl font-bold text-text-main flex items-center gap-3">
                                <CheckCircle2 size={24} className="text-accent-primary" />
                                Data Validation Preview
                            </h2>
                            <p className="text-text-secondary mt-1 text-sm font-medium">Review pending contact mutations before committing to the CRM database.</p>
                        </div>
                        <button
                            onClick={() => { playClick(); setPreviewModalData(null); }}
                            className="p-2 border border-border-subtle hover:bg-surface-alt rounded-lg text-text-muted hover:text-text-primary transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 bg-surface-main/30 custom-scrollbar space-y-6">
                        {/* Insights Header */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-surface-alt border border-border-subtle rounded-xl p-5 relative overflow-hidden">
                                <div className="text-sm font-bold text-text-muted uppercase tracking-wide mb-1 flex items-center gap-2">
                                    <Plus size={16} className="text-green-500" /> New Profiles
                                </div>
                                <div className="text-3xl font-bold text-text-main">{previewModalData.added.length}</div>
                            </div>
                            <div className="bg-surface-alt border border-border-subtle rounded-xl p-5 relative overflow-hidden">
                                <div className="text-sm font-bold text-text-muted uppercase tracking-wide mb-1 flex items-center gap-2">
                                    <Link2 size={16} className="text-blue-500" /> Existing Duplicate Matches
                                </div>
                                <div className="text-3xl font-bold text-text-main">{previewModalData.updated.length}</div>
                                <p className="text-[11px] text-text-muted mt-2 font-medium">These contacts will be stitched into existing records rather than duplicated.</p>
                            </div>
                        </div>
                        
                        {previewModalData.added.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide mb-3 flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-green-500" /> Preview: New Records (Sample)
                                </h3>
                                <div className="bg-surface-alt border border-border-subtle rounded-xl overflow-hidden">
                                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                        <table className="w-full text-left text-sm whitespace-nowrap">
                                            <thead className="sticky top-0 bg-surface-base border-b border-border-strong shadow-sm z-10">
                                                <tr className="text-text-muted uppercase tracking-wide text-[10px] font-bold">
                                                    <th className="px-4 py-3">Name</th>
                                                    <th className="px-4 py-3">Phone</th>
                                                    <th className="px-4 py-3">Email</th>
                                                    <th className="px-4 py-3">Address</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border-subtle font-medium">
                                                {previewModalData.added.slice(0, 100).map((c: any, i: number) => (
                                                    <tr key={i} className="hover:bg-surface-hover/50">
                                                        <td className="px-4 py-3 text-text-main">{c.fullName || c.firstName || 'Unknown'}</td>
                                                        <td className="px-4 py-3 text-text-secondary font-mono">{c.phone}</td>
                                                        <td className="px-4 py-3 text-text-muted">{c.email}</td>
                                                        <td className="px-4 py-3 text-text-muted max-w-[200px] truncate">{c.shippingAddress || c.address || ''}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {previewModalData.added.length > 100 && (
                                        <div className="p-2 text-center text-[10px] font-bold tracking-wide uppercase text-text-muted border-t border-border-subtle bg-surface-base">
                                            Showing first 100 of {previewModalData.added.length}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {previewModalData.updated.length > 0 && (
                            <div>
                                <div className="flex justify-between items-end mb-3">
                                    <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide flex items-center gap-2">
                                        <AlertCircle size={16} className="text-blue-500" /> Preview: Duplicate Stitching
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-text-muted uppercase tracking-wide">Global Duplicate Strategy:</span>
                                        <select 
                                            className="bg-surface-base border border-border-strong rounded-lg px-2 py-1 text-xs text-text-secondary font-medium outline-none"
                                            onChange={e => {
                                                const strat = e.target.value as any;
                                                setPreviewModalData((prev: any) => prev ? {
                                                    ...prev,
                                                    updated: prev.updated.map((u: any) => ({ ...u, strategy: strat }))
                                                } : null)
                                            }}
                                        >
                                            <option value="stitch">Smart Stitch (Fill Only Empties)</option>
                                            <option value="overwrite">Overwrite (Force Replace with New)</option>
                                            <option value="skip">Skip (Ignore these matches)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="bg-surface-alt border border-border-subtle rounded-xl overflow-hidden">
                                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                        <table className="w-full text-left text-sm whitespace-nowrap">
                                            <thead className="sticky top-0 bg-surface-base border-b border-border-strong shadow-sm z-10">
                                                <tr className="text-text-muted uppercase tracking-wide text-[10px] font-bold">
                                                    <th className="px-4 py-3">Existing Profile</th>
                                                    <th className="px-4 py-3">Phone MATCH</th>
                                                    <th className="px-4 py-3">Action Strategy</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border-subtle font-medium">
                                                {previewModalData.updated.slice(0, 100).map((c: any, i: number) => (
                                                    <tr key={i} className="hover:bg-surface-hover/50">
                                                        <td className="px-4 py-3 text-text-main">
                                                            <div>{c.existingFullName || 'Unknown'}</div>
                                                            <div className="text-xs text-text-muted mt-0.5">{c.existingEmail}</div>
                                                        </td>
                                                        <td className="px-4 py-3 text-blue-400 font-mono font-bold flex flex-col justify-center">
                                                            <div className="flex items-center gap-2"><Link2 size={12}/>{c.existingPhone}</div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <select 
                                                                value={c.strategy}
                                                                onChange={e => {
                                                                    const strat = e.target.value as any;
                                                                    setPreviewModalData((prev: any) => {
                                                                        if (!prev) return prev;
                                                                        const newUpdated = [...prev.updated];
                                                                        newUpdated[i] = { ...newUpdated[i], strategy: strat };
                                                                        return { ...prev, updated: newUpdated };
                                                                    });
                                                                }}
                                                                className={`bg-surface-base border border-border-subtle rounded-lg px-2 py-1 text-xs outline-none ${c.strategy === 'skip' ? 'text-text-muted line-through' : c.strategy === 'overwrite' ? 'text-yellow-500' : 'text-blue-500'}`}
                                                            >
                                                                <option value="stitch">Stitch (Append)</option>
                                                                <option value="overwrite">Overwrite Match</option>
                                                                <option value="skip">Skip (Ignore)</option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {previewModalData.updated.length > 100 && (
                                        <div className="p-2 text-center text-[10px] font-bold tracking-wide uppercase text-text-muted border-t border-border-subtle bg-surface-base">
                                            Showing first 100 of {previewModalData.updated.length}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-5 border-t border-border-strong bg-surface-base flex justify-between items-center shrink-0">
                        <button
                            type="button"
                            onClick={() => { playClick(); setPreviewModalData(null); }}
                            className="px-5 py-3 border border-border-subtle rounded-xl text-sm font-bold tracking-wider uppercase hover:bg-surface-alt text-text-secondary transition-colors"
                            disabled={isProcessing}
                        >
                            Cancel & Return
                        </button>
                        
                        <button
                            type="button"
                            onClick={confirmContactImport}
                            className="px-6 py-3 bg-accent-primary text-white disabled:bg-border-subtle disabled:text-text-muted disabled:cursor-not-allowed rounded-xl text-sm font-extrabold tracking-wider uppercase hover:bg-accent-primary/90 transition-colors shadow-lg shadow-accent-primary/10 flex items-center gap-2"
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <RefreshCw size={14} className="animate-spin" /> Committing...
                                </>
                            ) : (
                                <>
                                    <Check size={14} /> Commit to Database
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
