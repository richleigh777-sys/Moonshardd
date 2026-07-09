const fs = require('fs');
let code = fs.readFileSync('components/forms/enrollment/wizard/Stage3Checkout.tsx', 'utf8');

// Add hidden dummy inputs at the very top of the returned JSX
code = code.replace(/<div className="flex flex-col md:flex-row gap-10 h-full">/,
`<div className="flex flex-col md:flex-row gap-10 h-full">
            {/* Autofill Traps to prevent browser from targeting real inputs */}
            <input type="text" name="fakeusernameremembered" style={{display: 'none'}} aria-hidden="true" autoComplete="off" />
            <input type="password" name="fakepasswordremembered" style={{display: 'none'}} aria-hidden="true" autoComplete="off" />
            <input type="text" name="cc-number" style={{display: 'none'}} aria-hidden="true" autoComplete="off" />
            <input type="text" name="cc-exp" style={{display: 'none'}} aria-hidden="true" autoComplete="off" />
            <input type="text" name="cc-csc" style={{display: 'none'}} aria-hidden="true" autoComplete="off" />
`);

// CVV password to text with webkit security
code = code.replace(/type="password"/, `type="text" style={{ WebkitTextSecurity: 'disc' }}`);

fs.writeFileSync('components/forms/enrollment/wizard/Stage3Checkout.tsx', code);
console.log("Stage 3 patched");
