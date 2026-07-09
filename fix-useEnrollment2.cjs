const fs = require('fs');
let code = fs.readFileSync('components/forms/enrollment/hooks/useEnrollment.ts', 'utf8');

const regex = /if \(isDeclined\) \{\s*setError\('Entry Declined: Invalid card details logged.'\);\s*sfx.playError\(\);\s*setLoading\(false\);\s*return;\s*\}/;
if(regex.test(code)) {
    code = code.replace(regex, `if (isDeclined) {
                // We keep it as processed but mark it as declined
            }`);
    fs.writeFileSync('components/forms/enrollment/hooks/useEnrollment.ts', code);
    console.log("Replaced successfully");
} else {
    console.log("Not found!");
}
