const fs = require('fs');
let code = fs.readFileSync('components/forms/enrollment/wizard/Stage3Checkout.tsx', 'utf8');

// Replace the duplicate attributes (removing the second line entirely or replacing with empty string)
code = code.replace(/data-lpignore="true" data-1p-ignore="true" data-form-type="other"\n\s*className/g, "className");

fs.writeFileSync('components/forms/enrollment/wizard/Stage3Checkout.tsx', code);
console.log("Stage 3 cleaned");
