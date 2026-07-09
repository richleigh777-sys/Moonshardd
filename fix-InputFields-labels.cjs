const fs = require('fs');
let code = fs.readFileSync('components/forms/enrollment/wizard/InputFields.tsx', 'utf8');

// Replace {label} with {typeof label === 'string' ? label.split('').join('\u200B') : label}
code = code.replace(/\{label\}/g, "{typeof label === 'string' ? label.split('').join('\\u200B') : label}");

fs.writeFileSync('components/forms/enrollment/wizard/InputFields.tsx', code);
console.log("InputFields labels patched");
