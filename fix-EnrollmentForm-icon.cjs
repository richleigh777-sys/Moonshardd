const fs = require('fs');
let code = fs.readFileSync('components/forms/EnrollmentFormV2.tsx', 'utf8');

const target = `<CheckCircle2 className="text-emerald-500" size={48} />`;
const replacement = `{lastOrder.status === 'Declined' ? (
                             <XCircle className="text-red-500" size={48} />
                         ) : (
                             <CheckCircle2 className="text-emerald-500" size={48} />
                         )}`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('components/forms/EnrollmentFormV2.tsx', code);
    console.log("Replaced");
} else {
    console.log("Not found");
}
