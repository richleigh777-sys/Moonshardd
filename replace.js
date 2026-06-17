const fs = require('fs');
const file = './components/admin/system/tabs/EcosystemTab.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/bg-\[#0A0A0C\]\/50/g, 'bg-surface-main/50');
content = content.replace(/border-\[#27272A\]/g, 'border-border-subtle');
content = content.replace(/text-\[#FAFAFA\]/g, 'text-text-primary');
content = content.replace(/text-\[#A1A1AA\]/g, 'text-text-muted');
content = content.replace(/text-\[13px\]/g, 'text-sm');
content = content.replace(/font-\[800\]/g, 'font-black');
content = content.replace(/font-\[500\]/g, 'font-medium');
content = content.replace(/rounded-\[24px\]/g, 'rounded-3xl');

fs.writeFileSync(file, content);
console.log('Replacements done!');
