const fs = require('fs');
const path = require('path');

const directoryPath = path.resolve(__dirname, 'components/chat');

const replacements = {
  'bg-[#1e1f22]': 'bg-surface-main',
  'bg-[#2b2d31]': 'bg-surface-alt',
  'bg-[#1a1b1e]': 'bg-surface-main',
  'bg-[#3b3d45]': 'bg-surface-highlight',
  'bg-[#25262b]': 'bg-surface-main',
  'border-[#1a1b1e]': 'border-border-subtle',
  'border-[#2C2E33]': 'border-border-subtle',
  'border-[#3b3d45]': 'border-border-subtle',
  'border-[#1e1f22]': 'border-border-subtle',
  'text-gray-100': 'text-text-primary',
  'text-gray-400': 'text-text-muted',
  'text-gray-500': 'text-text-muted',
  'text-gray-300': 'text-text-secondary',
  'hover:bg-[#3b3d45]': 'hover:bg-surface-highlight',
  'hover:bg-[#1e1f22]': 'hover:bg-surface-main',
  'bg-slate-900/60': 'bg-surface-main/60',
  'bg-[#2C2E33]': 'bg-surface-alt',
  'border-[#2b2d31]': 'border-border-subtle'
};

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = content;
      
      for (const [key, value] of Object.entries(replacements)) {
        // use regex to replace globally
        const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        modified = modified.replace(regex, value);
      }

      if (content !== modified) {
        fs.writeFileSync(fullPath, modified);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(directoryPath);
processDirectory(path.resolve(__dirname, 'components/auth'));

console.log('Complete');
