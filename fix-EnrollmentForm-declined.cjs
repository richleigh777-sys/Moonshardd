const fs = require('fs');
let code = fs.readFileSync('components/forms/EnrollmentFormV2.tsx', 'utf8');

code = code.replace(/<h2 className="text-3xl font-bold text-text-primary">Order Confirmed<\/h2>/, 
    `{lastOrder.status === 'Declined' ? (
                         <h2 className="text-3xl font-bold text-status-error">Order Declined</h2>
                     ) : (
                         <h2 className="text-3xl font-bold text-status-success">Order Confirmed</h2>
                     )}`);

fs.writeFileSync('components/forms/EnrollmentFormV2.tsx', code);
