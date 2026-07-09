const fs = require('fs');
let code = fs.readFileSync('components/forms/EnrollmentFormV2.tsx', 'utf8');

const target = `<p className="text-text-muted text-lg">Transaction successfully processed.</p>`;
const replacement = `<p className="text-text-muted text-lg">{lastOrder.status === 'Declined' ? 'Transaction processed but declined.' : 'Transaction successfully processed.'}</p>`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('components/forms/EnrollmentFormV2.tsx', code);
    console.log("Replaced");
} else {
    console.log("Not found");
}
