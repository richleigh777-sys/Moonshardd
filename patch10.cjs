const fs = require('fs');
let code = fs.readFileSync('components/admin/UniqueSalesPool.tsx', 'utf8');

const oldSkippedOnly = `{importResults.skipped > 0 && (
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
                                )}`;

const newTables = `{importResults.added > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary flex items-center gap-2 border-b border-border-subtle pb-2">
                                            <CheckCircle2 size={14} className="text-accent-primary" /> Successfully Imported Leads
                                        </h3>
                                        <div className="overflow-hidden border border-border-subtle rounded-xl">
                                            <div className="max-h-[200px] overflow-y-auto custom-scrollbar bg-surface-alt/30">
                                                <table className="w-full text-left border-collapse min-w-[600px]">
                                                    <thead className="bg-surface-alt/80 sticky top-0 z-10 backdrop-blur-md">
                                                        <tr>
                                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-text-muted">Name</th>
                                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-text-muted">Phone Number</th>
                                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-text-muted">Email</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border-subtle/50">
                                                        {importResults.addedDetails?.map((dup, dIdx) => (
                                                            <tr key={'add'+dIdx} className="hover:bg-surface-main/40 transition-colors">
                                                                <td className="px-4 py-3 text-sm font-semibold text-text-primary">{dup.name}</td>
                                                                <td className="px-4 py-3 text-sm font-mono text-text-muted">{dup.phone}</td>
                                                                <td className="px-4 py-3 text-sm text-text-muted">{dup.email}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {importResults.skipped > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-status-warning flex items-center gap-2 border-b border-border-subtle pb-2">
                                            <AlertTriangle size={14} /> Skipped Duplicate Records (Already Existed)
                                        </h3>
                                        <div className="overflow-hidden border border-border-subtle rounded-xl">
                                            <div className="max-h-[200px] overflow-y-auto custom-scrollbar bg-surface-alt/30">
                                                <table className="w-full text-left border-collapse min-w-[600px]">
                                                    <thead className="bg-surface-alt/80 sticky top-0 z-10 backdrop-blur-md">
                                                        <tr>
                                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-text-muted">Name</th>
                                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-text-muted">Phone Number</th>
                                                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-text-muted">Email</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border-subtle/50">
                                                        {importResults.skippedDetails?.map((dup, dIdx) => (
                                                            <tr key={'skip'+dIdx} className="hover:bg-status-warning/10 transition-colors">
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
                                )}`;

if (!code.includes("addedDetails?.map")) {
    code = code.replace(oldSkippedOnly, newTables);
}
fs.writeFileSync('components/admin/UniqueSalesPool.tsx', code);
