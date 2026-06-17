const fs = require('fs');
let code = fs.readFileSync('components/admin/UniqueSalesPool.tsx', 'utf8');
code = code.replace("onChange={(e) => setSearchQuery(e.target.value); setActiveSmartListId(null);}", "onChange={(e) => { setSearchQuery(e.target.value); setActiveSmartListId(null); }}");
fs.writeFileSync('components/admin/UniqueSalesPool.tsx', code);
