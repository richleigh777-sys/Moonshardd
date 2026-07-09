import fs from 'fs';

const path = 'components/widgets/ActionCenter.tsx';
let data = fs.readFileSync(path, 'utf8');

const lines = data.split('\n');
const newLines = [];
let useCRMImported = false;

for (const line of lines) {
    if (line.includes("import { useCRM } from '../../hooks/useCRM';")) {
        if (!useCRMImported) {
            newLines.push(line);
            useCRMImported = true;
        }
    } else {
        newLines.push(line);
    }
}

fs.writeFileSync(path, newLines.join('\n'), 'utf8');
console.log("Fixed ActionCenter.tsx");
