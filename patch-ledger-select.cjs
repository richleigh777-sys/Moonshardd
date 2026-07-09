const fs = require('fs');
let code = fs.readFileSync('components/widgets/sales-ledger/LedgerRow.tsx', 'utf8');

// The <tr needs to have select-none if !isLevel10
const trRegex = /<tr([\s\S]*?)className=\`([\s\S]*?)\`/;

code = code.replace(trRegex, (match, p1, p2) => {
    return `<tr${p1}className={\`${p2} \${!isLevel10 ? 'select-none' : ''}\`}`;
});

fs.writeFileSync('components/widgets/sales-ledger/LedgerRow.tsx', code);
console.log("LedgerRow select-none patched");
