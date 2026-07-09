const fs = require('fs');
let code = fs.readFileSync('components/forms/EnrollmentFormV2.tsx', 'utf8');

const replacement = "    if (mode === 'approved' && lastOrder) {\n" +
"        const compliments = [\n" +
"            \"Outstanding performance! Another win secured.\",\n" +
"            \"You're crushing it! Keep up the great momentum.\",\n" +
"            \"Excellent work closing this one.\",\n" +
"            \"Top tier effort! You're a true closer.\",\n" +
"            \"Boom! Another one on the board.\",\n" +
"            \"Fantastic execution. Way to seal the deal!\"\n" +
"        ];\n" +
"        const randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];\n" +
"        \n" +
"        return (\n" +
"            <motion.div initial={{opacity:0}} animate={{opacity:1}} className=\"absolute inset-0 z-50 flex items-center justify-center bg-surface-main/90 p-4 font-sans select-none  rounded-xl\">\n" +
"                 <div className=\"bg-surface-alt border border-emerald-500/30 rounded-xl p-12 max-w-lg w-full text-center shadow-2xl space-y-6\">\n" +
"                     <div className=\"w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6\">\n" +
"                         <CheckCircle2 className=\"text-emerald-500\" size={48} />\n" +
"                     </div>\n" +
"                     <h2 className=\"text-3xl font-bold text-text-primary\">Order Confirmed</h2>\n" +
"                     <p className=\"text-text-muted text-lg\">Transaction successfully processed.</p>\n" +
"                     <div className=\"bg-surface-main rounded-xl p-6 font-mono text-sm space-y-3 border border-border-subtle text-left mb-6\">\n" +
"                         <div className=\"flex justify-between\"><span className=\"text-text-muted\">Order ID:</span> <span className=\"text-text-primary\">{lastOrder?.id?.toUpperCase() || 'N/A'}</span></div>\n" +
"                         <div className=\"flex justify-between\"><span className=\"text-text-muted\">Total:</span> <span className=\"text-accent-primary\">${Number(lastOrder.amount || 0).toFixed(2)}</span></div>\n" +
"                         <div className=\"flex justify-between\"><span className=\"text-text-muted\">Status:</span> <span className={lastOrder.status === 'Declined' ? \"text-status-error\" : \"text-status-success\"}>{lastOrder.status}</span></div>\n" +
"                     </div>\n" +
"                     <div className=\"p-4 bg-accent-primary/10 rounded-xl border border-accent-primary/20 mb-8\">\n" +
"                         <p className=\"text-accent-primary font-bold\">{randomCompliment}</p>\n" +
"                     </div>\n" +
"                     <button onClick={onSuccess} className=\"w-full py-4 bg-gradient-to-r from-amber-400 to-[#C4A470] text-black font-bold uppercase tracking-wide rounded-xl hover:shadow-sm transition-all\">Return to Dashboard</button>\n" +
"                 </div>\n" +
"            </motion.div>\n" +
"        );\n" +
"    }";

code = code.replace(/if \(mode === 'approved' && lastOrder\) \{[\s\S]*?return \([\s\S]*?<\/motion\.div>\s*\);\s*\}/, replacement);

fs.writeFileSync('components/forms/EnrollmentFormV2.tsx', code);
