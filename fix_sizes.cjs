const fs = require('fs');
let content = fs.readFileSync('./components/agent/IntelligentTerminalMap.tsx', 'utf8');

// Replace standard tiny text sizing with normal sizing
content = content.replace(/text-\[9px\]/g, 'text-xs');
content = content.replace(/text-\[10px\]/g, 'text-sm');
content = content.replace(/text-\[11px\]/g, 'text-sm');

fs.writeFileSync('./components/agent/IntelligentTerminalMap.tsx', content);
