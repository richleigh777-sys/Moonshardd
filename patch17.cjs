const fs = require('fs');
let code = fs.readFileSync('components/admin/UniqueSalesPool.tsx', 'utf8');

code = code.replace("onChange={(e) => setSelectedState(e.target.value); setActiveSmartListId(null);}", "onChange={(e) => { setSelectedState(e.target.value); setActiveSmartListId(null); }}");

fs.writeFileSync('components/admin/UniqueSalesPool.tsx', code);
