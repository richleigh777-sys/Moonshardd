import fs from 'fs';

const path = 'components/widgets/ActionCenter.tsx';
let data = fs.readFileSync(path, 'utf8');

data = data.replace(
    "const { notes, customers, sales, deleteNote } = useCRM();",
    "const { notes, customers, sales, deleteNote, systemConfig } = useCRM();"
);

data = data.replace(
    "    const { systemConfig } = useCRM();\n",
    ""
);

fs.writeFileSync(path, data, 'utf8');
console.log("Fixed ActionCenter.tsx hook placement.");
