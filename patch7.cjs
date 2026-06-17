const fs = require('fs');
let code = fs.readFileSync('components/admin/UniqueSalesPool.tsx', 'utf8');

const stateTarget = `const [activeTab, setActiveTab] = useState<'mapping' | 'resolution' | 'preview'>('mapping');`;
const stateReplacement = `const [activeTab, setActiveTab] = useState<'mapping' | 'resolution' | 'preview'>('mapping');

    const [importResults, setImportResults] = useState<{
        added: number;
        skipped: number;
        skippedDetails: Array<{ name: string, phone: string, email: string }>;
    } | null>(null);`;
code = code.replace(stateTarget, stateReplacement);

fs.writeFileSync('components/admin/UniqueSalesPool.tsx', code);
