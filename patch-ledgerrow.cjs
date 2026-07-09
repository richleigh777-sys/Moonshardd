const fs = require('fs');
let code = fs.readFileSync('components/widgets/sales-ledger/LedgerRow.tsx', 'utf8');

// We need to add `const { currentUser } = useAuth();` to LedgerRow if not there, and conditionally add select-none to the tr.
if (!code.includes('const { currentUser } = useAuth();')) {
    code = code.replace("export const LedgerRow = React.memo(({", "import { useAuth } from '../../../hooks/useAuth';\nexport const LedgerRow = React.memo(({");
    code = code.replace("sale,\n    activeColumns,", "sale,\n    activeColumns,\n}) => {\n    const { currentUser } = useAuth();"); 
    // Wait, let's just use string replacement carefully.
}
