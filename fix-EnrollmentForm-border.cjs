const fs = require('fs');
let code = fs.readFileSync('components/forms/EnrollmentFormV2.tsx', 'utf8');

const target = `<div className="bg-surface-alt border border-emerald-500/30 rounded-xl p-12 max-w-lg w-full text-center shadow-2xl space-y-6">`;
const replacement = `<div className={\`bg-surface-alt border \${lastOrder.status === 'Declined' ? 'border-red-500/30' : 'border-emerald-500/30'} rounded-xl p-12 max-w-lg w-full text-center shadow-2xl space-y-6\`}>`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('components/forms/EnrollmentFormV2.tsx', code);
    console.log("Replaced");
} else {
    console.log("Not found");
}
