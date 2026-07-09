import fs from 'fs';

const path = 'components/widgets/ActionCenter.tsx';
let data = fs.readFileSync(path, 'utf8');

// Fix duplicate imports
data = data.replace(/import \{ useCRM \} from '\.\.\/\.\.\/hooks\/useCRM';\nimport \{ useCRM \} from '\.\.\/\.\.\/hooks\/useCRM';/, "import { useCRM } from '../../hooks/useCRM';");

// Fix duplicate declarations
data = data.replace(/const \{ notes, customers, sales, deleteNote \} = useCRM\(\);\n    const \{ systemConfig \} = useCRM\(\);/, "const { notes, customers, sales, deleteNote, systemConfig } = useCRM();");

fs.writeFileSync(path, data, 'utf8');
console.log("Fixed ActionCenter.tsx");
