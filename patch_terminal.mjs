import fs from 'fs';
const path = 'components/admin/system/tabs/TerminalsConfigTab.tsx';
let data = fs.readFileSync(path, 'utf8');

data = data.replace(
    "import { Terminal, ShieldCheck, Save, RefreshCw } from 'lucide-react';",
    "import { Terminal, ShieldCheck, Save, RefreshCw, Info } from 'lucide-react';"
);

data = data.replace(
    /<label className="text-xs font-bold text-text-muted block mb-2 uppercase tracking-wide">Terminal Base Layout \(Agent Modal\)<\/label>/,
    `<div className="flex items-center gap-2 mb-2">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Terminal Base Layout (Agent Modal)</label>
                                <div className="group relative">
                                    <Info size={14} className="text-text-muted cursor-help hover:text-[#3B82F6]" />
                                    <div className="absolute bottom-full left-0 mb-2 w-72 p-3 bg-surface-alt border border-border-strong rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-xs text-text-primary">
                                        <div className="font-bold mb-2 text-[#3B82F6]">Layout Explanations</div>
                                        <div className="space-y-2 text-text-muted">
                                            <p><strong className="text-text-primary">Hyper-Focus Modern:</strong> Standard, streamlined view for high-velocity sales.</p>
                                            <p><strong className="text-text-primary">Split Console View:</strong> Data-dense layout showing context side-by-side.</p>
                                            <p><strong className="text-text-primary">Minimalist HUD:</strong> Stripped down interface focusing only on core actions.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>`
);

fs.writeFileSync(path, data, 'utf8');
console.log("Patched TerminalsConfigTab.tsx");
