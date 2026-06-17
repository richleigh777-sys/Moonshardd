const fs = require('fs');
let code = fs.readFileSync('components/admin/UniqueSalesPool.tsx', 'utf8');

const anchor = `            </AnimatePresence>
        </div>
    );
};`;

const resultsModal = `            </AnimatePresence>

            {/* Import Results Ledger (Post-Ingestion) */}
            <AnimatePresence>
                {importResults && (
                    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[130] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-4xl bg-surface-main border border-border-subtle rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
                            id="bulk-contacts-results-modal"
                        >
                            <div className="p-4 border-b border-border-subtle bg-surface-alt/70 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-accent-primary/10 text-accent-primary rounded-xl">
                                        <CheckCircle2 size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-black text-text-primary tracking-tight">Bulk Ingestion Results</h2>
                                        <p className="text-sm text-text-muted font-medium">Operation completed successfully.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { playClick(); setImportResults(null); }}
                                    className="p-2 border border-border-subtle hover:bg-surface-alt rounded-lg text-text-muted hover:text-text-primary transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 bg-surface-alt border border-border-subtle rounded-xl flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-accent-primary/20 text-accent-primary flex items-center justify-center">
                                            <Upload size={24} />
                                        </div>
                                        <div>
                                            <p className="text-3xl font-black text-text-primary">{importResults.added}</p>
                                            <p className="text-sm font-bold uppercase tracking-widest text-text-muted mt-1">Leads Imported</p>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-status-warning/10 border border-status-warning/30 rounded-xl flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-status-warning/20 text-status-warning flex items-center justify-center">
                                            <AlertTriangle size={24} />
                                        </div>
                                        <div>
                                            <p className="text-3xl font-black text-status-warning">{importResults.skipped}</p>
                                            <p className="text-sm font-bold uppercase tracking-widest text-status-warning/70 mt-1">Duplicates Skipped</p>
                                        </div>
                                    </div>
                                </div>

                                {importResults.skipped > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-status-warning flex items-center gap-2 border-b border-border-subtle pb-2">
                                            <AlertTriangle size={14} /> Skipped Duplicate Records (Already Existed)
                                        </h3>
                                        <div className="overflow-hidden border border-border-subtle rounded-xl">
                                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar bg-surface-alt/30">
                                                <table className="w-full text-left border-collapse min-w-[600px]">
                                                    <thead className="bg-surface-alt/80 sticky top-0 z-10 backdrop-blur-md">
                                                        <tr>
                                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-text-muted">Name</th>
                                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-text-muted">Phone Number</th>
                                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-text-muted">Email</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border-subtle/50">
                                                        {importResults.skippedDetails.map((dup, dIdx) => (
                                                            <tr key={dIdx} className="hover:bg-surface-main/40 transition-colors">
                                                                <td className="px-4 py-3 text-sm font-semibold text-text-primary">{dup.name}</td>
                                                                <td className="px-4 py-3 text-sm font-mono text-status-warning">{dup.phone}</td>
                                                                <td className="px-4 py-3 text-sm text-text-muted">{dup.email}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-border-subtle bg-surface-alt/40 flex justify-end">
                                <button
                                    onClick={() => { playClick(); setImportResults(null); }}
                                    className="px-6 py-3 bg-surface-main hover:bg-border-subtle text-text-primary border border-border-subtle rounded-xl text-sm font-extrabold tracking-wider uppercase transition-all shadow-sm"
                                >
                                    Dismiss Report
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};`;
code = code.replace(anchor, resultsModal);

fs.writeFileSync('components/admin/UniqueSalesPool.tsx', code);
