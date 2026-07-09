const fs = require('fs');
let code = fs.readFileSync('components/forms/enrollment/wizard/Stage3Checkout.tsx', 'utf8');

code = code.replace(/autoComplete="none"/g, 'autoComplete="chrome-off" data-lpignore="true" data-1p-ignore="true" data-form-type="other"');
code = code.replace(/autoComplete="new-password"/g, 'autoComplete="chrome-off" data-lpignore="true" data-1p-ignore="true" data-form-type="other"');
code = code.replace(/name="rnd_cc_number"/g, 'name={"fld_" + Math.random().toString(36).substring(2)}');
code = code.replace(/name="secure-exp-field"/g, 'name={"fld_" + Math.random().toString(36).substring(2)}');
code = code.replace(/name="secure-cvv-field"/g, 'name={"fld_" + Math.random().toString(36).substring(2)}');

fs.writeFileSync('components/forms/enrollment/wizard/Stage3Checkout.tsx', code);
console.log("Replaced Stage 3");
