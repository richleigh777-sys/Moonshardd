const fs = require('fs');
let text = fs.readFileSync('components/admin/system/tabs/AuditTab.tsx', 'utf8');

const target = `                <div className="flex items-center gap-2">
                    <ShieldAlert size={18} className="text-rose-500" />
                    <h3 className="text-lg font-black italic text-text-primary tracking-tight">
                        Global <span className="text-rose-500">System Ledger</span> & Logs
                    </h3>
                </div>`;

const replacement = `                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShieldAlert size={18} className="text-rose-500" />
                        <h3 className="text-lg font-black italic text-text-primary tracking-tight">
                            Global <span className="text-rose-500">System Ledger</span> & Logs
                        </h3>
                    </div>
                    {clearAuditLogs && (
                        <button 
                            type="button"
                            onClick={async () => {
                                if(window.confirm('Are you sure you want to permanently clear all global audit logs?')) {
                                    await clearAuditLogs();
                                    setToast({ title: 'Ledger Cleared', message: 'Global audit records have been purged.', type: 'success' });
                                }
                            }}
                            className="px-4 py-1.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 border border-rose-500/20 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
                        >
                            Purge Global Ledger
                        </button>
                    )}
                </div>`;

fs.writeFileSync('components/admin/system/tabs/AuditTab.tsx', text.replace(target, replacement));
