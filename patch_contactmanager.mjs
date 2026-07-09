import fs from 'fs';

const path = 'components/widgets/ContactManager.tsx';
let data = fs.readFileSync(path, 'utf8');

if (!data.includes('executeDialer')) {
    data = data.replace(
        "import { Customer } from '../../types';",
        "import { Customer } from '../../types';\nimport { executeDialer } from '../../lib/dialer';"
    );
}

if (!data.includes('const { systemConfig } = useCRM();')) {
    data = data.replace(
        "const { customers, deleteCustomer, refreshCustomers } = useCRM();",
        "const { customers, deleteCustomer, refreshCustomers, systemConfig } = useCRM();"
    );
}

// Ensure the phone span is clickable
data = data.replace(
    /<span className="flex items-center gap-1\.5"><Phone size=\{16\} className="text-text-muted"\/> \{maskPII\(customer\.phone, 'phone'\)\}<\/span>/g,
    `<span className="flex items-center gap-1.5 cursor-pointer hover:text-accent-primary" onClick={(e) => { e.stopPropagation(); executeDialer(customer.phone, customer, systemConfig); }}><Phone size={16} className="text-text-muted"/> {maskPII(customer.phone, 'phone')}</span>`
);

fs.writeFileSync(path, data, 'utf8');
console.log("Patched ContactManager.tsx");
