const fs = require('fs');
let code = fs.readFileSync('components/widgets/sales-ledger/LedgerRow.tsx', 'utf8');

const target = 'className={`border-l-2 ${finalBorderClass}`}';
const replacement = 'className={`border-l-2 ${finalBorderClass} ${!isLevel10 ? "select-none" : ""}`}';

code = code.replace(target, replacement);

fs.writeFileSync('components/widgets/sales-ledger/LedgerRow.tsx', code);
console.log("LedgerRow select-none patched again");
