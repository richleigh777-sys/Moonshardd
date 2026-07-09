import fs from 'fs';

const path = 'components/forms/enrollment/hooks/useEnrollment.ts';
let data = fs.readFileSync(path, 'utf8');

data = data.replace(
    "const parsedShippingStreet = formData.shippingAddress.split(',')[0].trim();",
    "const parsedShippingStreet = (formData.shippingAddress || '').split(',')[0].trim();"
);

data = data.replace(
    "const parsedBillingStreet = formData.billingAddress.split(',')[0].trim();",
    "const parsedBillingStreet = (formData.billingAddress || '').split(',')[0].trim();"
);

fs.writeFileSync(path, data, 'utf8');
console.log("Patched useEnrollment.ts");
