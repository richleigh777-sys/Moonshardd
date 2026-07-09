import fs from 'fs';

const path = 'components/widgets/sales-ledger/useImportLogic.ts';
let data = fs.readFileSync(path, 'utf8');

data = data.replace(
    "if (sysKey === 'address' && value && typeof value === 'string') {",
    "if ((sysKey === 'address' || sysKey === 'shippingAddress' || sysKey === 'billingAddress') && value && typeof value === 'string') {"
);

fs.writeFileSync(path, data, 'utf8');
console.log("Patched useImportLogic.ts address parsing");
