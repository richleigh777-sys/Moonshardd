import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function getFiles(dir, files = []) {
  const list = readdirSync(dir);
  for (const file of list) {
    const fullPath = join(dir, file);
    if (statSync(fullPath).isDirectory()) {
      getFiles(fullPath, files);
    } else if (fullPath.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = [...getFiles('components/chat'), ...getFiles('components/forms')];
const replacements = [
  { pattern: /bg-\[#09090b\]/g, replacement: 'bg-surface-alt' },
  { pattern: /bg-\[#121214\]/g, replacement: 'bg-surface-main' },
  { pattern: /bg-black\/40/g, replacement: 'bg-surface-alt/40' },
  { pattern: /bg-black\/20/g, replacement: 'bg-surface-alt/20' },
  { pattern: /bg-white\/\[0\.02\]/g, replacement: 'bg-surface-alt/20' },
  { pattern: /bg-white\/\[0\.03\]/g, replacement: 'bg-surface-main/40' },
  { pattern: /bg-white\/5/g, replacement: 'bg-surface-highlight' },
  { pattern: /hover:bg-white\/10/g, replacement: 'hover:bg-surface-alt/80' },
  { pattern: /bg-slate-950\/60/g, replacement: 'bg-surface-main/60' },
  { pattern: /bg-slate-950\/80/g, replacement: 'bg-surface-main/80' },
  { pattern: /bg-slate-950/g, replacement: 'bg-surface-main' },
  { pattern: /bg-slate-900\/95/g, replacement: 'bg-surface-alt/95' },
  { pattern: /bg-slate-800/g, replacement: 'bg-surface-main/80' },
  { pattern: /border-white\/5/g, replacement: 'border-border-subtle' },
  { pattern: /border-white\/10/g, replacement: 'border-border-subtle' },
  { pattern: /border-white\/20/g, replacement: 'border-border-strong' },
  { pattern: /border-slate-800/g, replacement: 'border-border-subtle' },
  { pattern: /text-slate-300/g, replacement: 'text-text-primary' },
  { pattern: /text-white\/90/g, replacement: 'text-text-primary' },
  { pattern: /text-white\/40/g, replacement: 'text-text-muted' },
  { pattern: /text-white/g, replacement: 'text-text-primary' },
  { pattern: /text-zinc-500/g, replacement: 'text-text-muted' },
  { pattern: /text-zinc-300/g, replacement: 'text-text-secondary' },
  { pattern: /text-slate-400/g, replacement: 'text-text-muted' },
  { pattern: /text-slate-500/g, replacement: 'text-text-muted' },
  { pattern: /text-slate-200/g, replacement: 'text-text-secondary' },
];

for (const file of files) {
  let text = readFileSync(file, 'utf8');
  let changed = false;
  for (const { pattern, replacement } of replacements) {
    if (pattern.test(text)) {
      text = text.replace(pattern, replacement);
      changed = true;
    }
  }
  if (changed) {
    writeFileSync(file, text);
    console.log(`Updated ${file}`);
  }
}
