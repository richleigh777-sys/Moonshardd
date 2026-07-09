const fs = require('fs');
let code = fs.readFileSync('components/forms/enrollment/wizard/InputFields.tsx', 'utf8');

const regex = /<input\s*\{...props\}/;
if (regex.test(code)) {
    code = code.replace(regex, `<input \n                {...props}\n                autoComplete="chrome-off"\n                data-lpignore="true"\n                data-1p-ignore="true"\n                data-form-type="other"`);
    fs.writeFileSync('components/forms/enrollment/wizard/InputFields.tsx', code);
    console.log("Replaced");
} else {
    console.log("Not found");
}
