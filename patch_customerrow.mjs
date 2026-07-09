import fs from 'fs';

const path = 'components/admin/unique-sales-pool/CustomerRow.tsx';
let data = fs.readFileSync(path, 'utf8');

if (!data.includes('executeDialer')) {
    data = data.replace(
        "import { Customer, Sale } from '../../../types';",
        "import { Customer, Sale } from '../../../types';\nimport { executeDialer } from '../../../lib/dialer';\nimport { useCRM } from '../../../hooks/useCRM';"
    );
}

// Ensure useCRM is called in the component
if (!data.includes('const { systemConfig } = useCRM();')) {
    data = data.replace(
        "export const CustomerRow = ({ customer, isSelected, onToggleSelect, onAction, metrics }: CustomerRowProps) => {",
        "export const CustomerRow = ({ customer, isSelected, onToggleSelect, onAction, metrics }: CustomerRowProps) => {\n    const { systemConfig } = useCRM();"
    );
}

// Replace the a href
data = data.replace(
    /\{customer\.phone \? <a href=\{\`tel:\$\{customer\.phone\}\`\} className="hover:text-accent-primary hover:underline transition-colors" onClick=\{\(e\) => e\.stopPropagation\(\)\}>\{customer\.phone\}<\/a> : '—'\}/g,
    `{customer.phone ? <span className="hover:text-accent-primary hover:underline transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); executeDialer(customer.phone, customer, systemConfig); }}>{customer.phone}</span> : '—'}`
);

fs.writeFileSync(path, data, 'utf8');
console.log("Patched CustomerRow.tsx");
