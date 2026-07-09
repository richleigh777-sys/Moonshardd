import fs from 'fs';

const path = 'components/admin/unique-sales-pool/CustomerRow.tsx';
let data = fs.readFileSync(path, 'utf8');

// Add systemConfig
if (!data.includes('const { systemConfig } = useCRM();')) {
    data = data.replace(
        "handleDelete\n}) => {",
        "handleDelete\n}) => {\n    const { systemConfig } = useCRM();"
    );
}

// Remove unused imports
data = data.replace(/, Sparkles, User/g, "");

fs.writeFileSync(path, data, 'utf8');
console.log("Fixed CustomerRow.tsx");
