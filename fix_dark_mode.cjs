const fs = require('fs');
const path = require('path');

function replaceInFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInFiles(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;
            
            // Replace exact colors
            content = content.replace(/bg-\[#FDFBF7\]/g, 'bg-surface-main');
            content = content.replace(/bg-\[#050505\]\/90/g, 'bg-surface-alt/90');
            content = content.replace(/bg-\[#050505\]/g, 'bg-surface-alt');
            content = content.replace(/bg-\[#F5F2EB\]\/80/g, 'bg-surface-highlight/80');
            content = content.replace(/bg-\[#F5F2EB\]\/30/g, 'bg-surface-highlight/30');
            content = content.replace(/bg-\[#F5F2EB\]/g, 'bg-surface-highlight');
            content = content.replace(/bg-\[#DCD6C8\]/g, 'bg-border-subtle');
            content = content.replace(/border-\[#DCD6C8\]/g, 'border-border-subtle');
            content = content.replace(/text-\[#2D2A26\]/g, 'text-text-primary');
            content = content.replace(/text-\[#8C857B\]/g, 'text-text-muted');
            content = content.replace(/text-\[#A39C91\]/g, 'text-text-muted');
            content = content.replace(/text-\[#4A453E\]/g, 'text-text-primary');
            content = content.replace(/shadow-\[0_8px_30px_rgba\(168,159,145,0\.2\)\]/g, 'shadow-panel');
            
            // Also simplify other dark: mappings since the CSS variables handle light/dark automatically
            // Find class strings and replace dark variants
            content = content.replace(/dark:bg-surface-alt/g, '');
            content = content.replace(/dark:bg-surface-main/g, '');
            content = content.replace(/dark:shadow-2xl/g, 'shadow-panel');
            content = content.replace(/dark:backdrop-blur-3xl/g, 'backdrop-blur-3xl');
            
            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content);
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

replaceInFiles('./components');
replaceInFiles('./views');
replaceInFiles('./src');
