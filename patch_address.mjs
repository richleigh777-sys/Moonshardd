import fs from 'fs';

const path = 'components/forms/enrollment/hooks/useEnrollment.ts';
let data = fs.readFileSync(path, 'utf8');

data = data.replace(
    "address: fullShippingAddress,",
    "address: streetAndAptShipping,"
);

fs.writeFileSync(path, data, 'utf8');
console.log("Patched useEnrollment.ts address mapping");
