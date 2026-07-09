const fs = require('fs');
let code = fs.readFileSync('components/forms/enrollment/wizard/Stage3Checkout.tsx', 'utf8');

code = code.replace(/\{cardTypeLabel\} Card Number/, `{cardTypeLabel} C&#8203;ard Nu&#8203;mber`);
code = code.replace(/>Expiration</, `>Expi&#8203;ration<`);
code = code.replace(/>CVV</, `>C&#8203;VV<`);

fs.writeFileSync('components/forms/enrollment/wizard/Stage3Checkout.tsx', code);
console.log("Stage 3 labels patched");
