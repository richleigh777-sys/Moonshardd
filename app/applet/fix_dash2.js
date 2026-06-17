const fs = require('fs');
let code = fs.readFileSync('views/DashView.tsx', 'utf8');
code = code.replace(/title=\{\}/g, "title={`Hot streak! ${streak} in a row! `}");
fs.writeFileSync('views/DashView.tsx', code);
