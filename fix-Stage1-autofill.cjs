const fs = require('fs');
let code = fs.readFileSync('components/forms/enrollment/wizard/Stage1Profile.tsx', 'utf8');

code = code.replace(/<div className="flex flex-col xl:flex-row gap-8 h-full">/,
`<div className="flex flex-col xl:flex-row gap-8 h-full">
            {/* Autofill Traps to prevent browser from targeting real inputs */}
            <input type="text" name="fakeusernameremembered" style={{display: 'none'}} aria-hidden="true" autoComplete="off" />
            <input type="password" name="fakepasswordremembered" style={{display: 'none'}} aria-hidden="true" autoComplete="off" />
            <input type="email" name="fakeemailremembered" style={{display: 'none'}} aria-hidden="true" autoComplete="off" />
            <input type="text" name="address-line1" style={{display: 'none'}} aria-hidden="true" autoComplete="off" />
            <input type="text" name="phone" style={{display: 'none'}} aria-hidden="true" autoComplete="off" />
`);

fs.writeFileSync('components/forms/enrollment/wizard/Stage1Profile.tsx', code);
console.log("Stage 1 patched");
