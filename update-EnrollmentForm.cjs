const fs = require('fs');
let code = fs.readFileSync('components/forms/EnrollmentFormV2.tsx', 'utf8');

const target = `<div className="flex justify-between"><span className="text-text-muted">Order ID:</span> <span className="text-text-primary">{lastOrder?.id?.toUpperCase() || 'N/A'}</span></div>`;
const replacement = `<div className="flex justify-between"><span className="text-text-muted">Order ID:</span> <span className="text-text-primary">{lastOrder?.id?.toUpperCase() || 'N/A'}</span></div>
                         <div className="flex justify-between"><span className="text-text-muted">Agent:</span> <span className="text-text-primary">{lastOrder?.agent || 'Unknown'}</span></div>`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('components/forms/EnrollmentFormV2.tsx', code);
    console.log("Replaced");
} else {
    console.log("Not found");
}
