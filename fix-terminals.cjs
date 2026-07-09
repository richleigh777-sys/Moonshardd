const fs = require('fs');
let code = fs.readFileSync('components/agent/hooks/useAgentPortalLogic.ts', 'utf8');
code = code.replace("return ['action', 'money'];", "return ['action', 'money', 'settings'];");
fs.writeFileSync('components/agent/hooks/useAgentPortalLogic.ts', code);
console.log('Fixed terminals');
