const fs = require('fs');
let code = fs.readFileSync('views/DashView.tsx', 'utf8');
code = code.replace(/title=\{\\'Hot Streak! \\'\+streak\+\\' deals in a row!\\'\}/g, 'title={`Hot Streak! ${streak} deals in a row!`}');
fs.writeFileSync('views/DashView.tsx', code);
