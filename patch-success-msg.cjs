const fs = require('fs');
let code = fs.readFileSync('components/forms/EnrollmentFormV2.tsx', 'utf8');

code = code.replace(/<h2 className="text-3xl font-bold text-status-success">Order Confirmed<\/h2>/, '<h2 className="text-3xl font-bold text-status-success">Order Was Submitted</h2>');
code = code.replace(/'Transaction successfully processed\.'/, "'Transaction submitted for processing.'");

fs.writeFileSync('components/forms/EnrollmentFormV2.tsx', code);
console.log("Success message patched");
