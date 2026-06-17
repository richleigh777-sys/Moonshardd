const fs = require('fs');
let code = fs.readFileSync('components/admin/UniqueSalesPool.tsx', 'utf8');
code = code.replace("import { Save, Filter, XCircle } from 'lucide-react';", "import { Save } from 'lucide-react';");
fs.writeFileSync('components/admin/UniqueSalesPool.tsx', code);
