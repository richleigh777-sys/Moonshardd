const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all TypeScript files
const files = execSync('find components views -name "*.tsx" -o -name "*.ts"').toString().split('\n').filter(Boolean);

const replacements = [
    { from: /bg-\[#FDFBF7\] dark:bg-black\/40/g, to: 'bg-surface-alt' },
    { from: /bg-\[#F5F2EB\]\/50 dark:bg-black\/40/g, to: 'bg-surface-alt' },
    { from: /bg-\[#F5F2EB\]\/80 dark:bg-black\/40/g, to: 'bg-surface-alt' },
    { from: /border-\[#EAE5D9\] dark:border-white\/10/g, to: 'border-border-subtle' },
    { from: /border-\[#EAE5D9\] dark:border-white\/5/g, to: 'border-border-subtle' },
    { from: /hover:border-\[#DCD6C8\] dark:hover:border-white\/20/g, to: 'hover:border-border-strong' },
    { from: /text-\[#8C857B\] dark:text-gray-500/g, to: 'text-text-muted' },
    { from: /text-\[#8C857B\] dark:text-gray-400/g, to: 'text-text-muted' },
    { from: /text-\[#4A453E\] dark:text-gray-300/g, to: 'text-text-secondary' },
    { from: /text-\[#2D2A26\] dark:text-white/g, to: 'text-text-primary' },
    { from: /text-\[#2D2A26\] dark:text-gray-200/g, to: 'text-text-primary' },
    { from: /hover:bg-\[#F5F2EB\] dark:hover:bg-white\/5/g, to: 'hover:bg-surface-highlight' },
    { from: /hover:text-\[#2D2A26\] dark:hover:text-white/g, to: 'hover:text-text-primary' },
    { from: /hover:text-\[#2D2A26\] dark:hover:text-gray-200/g, to: 'hover:text-text-primary' },
    { from: /text-emerald-600 dark:text-emerald-400/g, to: 'text-status-success' },
    { from: /text-emerald-600 dark:text-emerald-500/g, to: 'text-status-success' },
    { from: /hover:text-emerald-600 dark:hover:text-emerald-400/g, to: 'hover:text-status-success' },
    { from: /text-red-600 dark:text-red-500/g, to: 'text-status-error' },
    { from: /text-amber-600 dark:text-amber-500/g, to: 'text-status-warning' },
    { from: /bg-emerald-50 dark:bg-emerald-500\/10/g, to: 'bg-status-success/10' },
    { from: /bg-amber-50 dark:bg-amber-500\/10/g, to: 'bg-status-warning/10' },
    { from: /bg-red-50 dark:bg-red-500\/10/g, to: 'bg-status-error/10' },
    { from: /border-emerald-500\/30/g, to: 'border-status-success/30' },
    { from: /border-amber-500\/30/g, to: 'border-status-warning/30' },
    { from: /border-red-500\/30/g, to: 'border-status-error/30' },
    { from: /border-emerald-500\/50/g, to: 'border-status-success/50' },
    { from: /text-emerald-400/g, to: 'text-status-success' },
    { from: /text-red-400/g, to: 'text-status-error' },
    { from: /text-amber-400/g, to: 'text-status-warning' },
    { from: /text-emerald-500/g, to: 'text-status-success' },
    { from: /text-red-500/g, to: 'text-status-error' },
    { from: /text-amber-500/g, to: 'text-status-warning' },
    { from: /text-indigo-400/g, to: 'text-accent-secondary' },
    { from: /text-indigo-500/g, to: 'text-accent-secondary' },
    { from: /bg-indigo-500\/10/g, to: 'bg-accent-secondary/10' },
    { from: /border-indigo-500\/20/g, to: 'border-accent-secondary/20' },
    { from: /hover:border-indigo-400/g, to: 'hover:border-accent-secondary' },
    { from: /bg-white\/10/g, to: 'bg-surface-highlight' },
    { from: /border-white\/10/g, to: 'border-border-subtle' },
    { from: /border-white\/5/g, to: 'border-border-subtle' },
    { from: /text-gray-200/g, to: 'text-text-primary' },
    { from: /text-gray-300/g, to: 'text-text-primary' },
    { from: /text-gray-400/g, to: 'text-text-muted' },
    { from: /text-gray-500/g, to: 'text-text-muted' },
    { from: /border-gray-600/g, to: 'border-border-subtle' },
    { from: /border-gray-800/g, to: 'border-border-subtle' },
    { from: /border-gray-700/g, to: 'border-border-subtle' },
    { from: /bg-gray-800/g, to: 'bg-surface-alt' },
    { from: /bg-gray-900/g, to: 'bg-surface-main' },
    { from: /bg-black\/40/g, to: 'bg-surface-alt' },
    { from: /bg-black\/50/g, to: 'bg-surface-alt' },
    { from: /bg-black\/60/g, to: 'bg-surface-alt' },
    { from: /shadow-sm dark:shadow-/g, to: 'shadow-' },
    { from: /shadow-sm dark:drop-shadow-/g, to: 'drop-shadow-' },
    { from: /drop-shadow-sm dark:drop-shadow-/g, to: 'drop-shadow-' }
];

let totalChanges = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    replacements.forEach(rep => {
        if (content.match(rep.from)) {
            content = content.replace(rep.from, rep.to);
            modified = true;
        }
    });

    if (modified) {
        fs.writeFileSync(file, content);
        console.log(`Updated ${file}`);
        totalChanges++;
    }
});

console.log(`Finished updating ${totalChanges} files.`);
