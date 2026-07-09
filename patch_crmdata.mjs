import fs from 'fs';
const path = 'hooks/useCRMData.ts';
let data = fs.readFileSync(path, 'utf8');

data = data.replace(
    /customDialerType: 'CLIPBOARD_ONLY'/g,
    "customDialerType: 'PROTOCOL_URI'"
);

fs.writeFileSync(path, data, 'utf8');
console.log("Patched useCRMData.ts");
