const fs = require('fs');

const path = 'components/admin/unique-sales-pool/CustomerRow.tsx';
let data = fs.readFileSync(path, 'utf8');

data = data.replace(
    /\{customer\.phone \|\| '—'\}/g,
    `{customer.phone ? <a href={\`tel:\${customer.phone}\`} className="hover:text-accent-primary hover:underline transition-colors" onClick={(e) => e.stopPropagation()}>{customer.phone}</a> : '—'}`
);

fs.writeFileSync(path, data, 'utf8');
console.log("Patched CustomerRow.tsx");
