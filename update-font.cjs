const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

// Replace font import
code = code.replace(
    /family=Plus\+Jakarta\+Sans:wght@[^&]+&/,
    'family=Nunito:wght@400;500;600;700;800&'
);

// Replace CSS variables
code = code.replace(/"Plus Jakarta Sans"/g, '"Nunito"');

// Update body/html for more empathetic reading experience (softer tracking/leading)
code = code.replace(
    /leading-relaxed tracking-normal;/,
    'leading-loose tracking-wide;'
);

fs.writeFileSync('src/index.css', code);
console.log("Empathy typography applied.");
