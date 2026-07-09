import fs from 'fs';

const path = 'components/leads/LeadDetail.tsx';
let data = fs.readFileSync(path, 'utf8');

if (!data.includes('executeDialer')) {
    data = data.replace(
        "import { Customer } from '../../types';",
        "import { Customer } from '../../types';\nimport { executeDialer } from '../../lib/dialer';"
    );
}

// Find navigator.clipboard.writeText(activeLead.phone || '') and replace with executeDialer
data = data.replace(
    /navigator\.clipboard\.writeText\(activeLead\.phone \|\| ''\);/g,
    "executeDialer(activeLead.phone || '', activeLead, systemConfig);"
);

// We need systemConfig in LeadDetail
if (!data.includes('const { systemConfig } = useCRM();')) {
    data = data.replace(
        "const { customers, notes: allNotes, callLogs } = useCRM();",
        "const { customers, notes: allNotes, callLogs, systemConfig } = useCRM();"
    );
}

fs.writeFileSync(path, data, 'utf8');
console.log("Patched LeadDetail.tsx");
