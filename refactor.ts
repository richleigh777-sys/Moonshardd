import fs from 'fs';
import path from 'path';

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
    const files = fs.readdirSync(dirPath);
    files.forEach((file) => {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.tsx')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });
    return arrayOfFiles;
}

const filePaths = getAllFiles('./components/forms/enrollment');
filePaths.push('./components/forms/EnrollmentFormV2.tsx');

const replaces = [
    { from: /bg-\[#0A0A0C\]/g, to: 'bg-surface-main' },
    { from: /border-\[#1C1C1F\]/g, to: 'border-border-subtle' },
    { from: /border-\[#27272A\]/g, to: 'border-border-highlight' },
    { from: /border-\[#2A2A2E\]/g, to: 'border-border-subtle' },
    { from: /text-\[#A1A1AA\]/g, to: 'text-text-muted' },
    { from: /text-\[#71717A\]/g, to: 'text-text-secondary' },
    { from: /text-\[#FAFAFA\]/g, to: 'text-text-primary' },
    { from: /bg-\[#141416\]/g, to: 'bg-surface-alt' },
    { from: /bg-\[#0C0C0E\]/g, to: 'bg-surface-main' },
    { from: /bg-\[#18181B\]/g, to: 'bg-surface-hover' },
    { from: /border-\[#3F3F46\]/g, to: 'border-border-strong' },
    { from: /text-\[#34D399\]/g, to: 'text-status-success' },
    { from: /bg-\[#10B981\]\/10/g, to: 'bg-status-success/10' },
    { from: /border-\[#10B981\]\/20/g, to: 'border-status-success/20' },
    { from: /bg-\[#10B981\]\/50/g, to: 'bg-status-success/50' },
    { from: /text-\[#FCA5A5\]/g, to: 'text-status-error' },
    { from: /bg-\[#7F1D1D\]\/20/g, to: 'bg-status-error/20' },
    { from: /bg-\[#7F1D1D\]\/40/g, to: 'bg-status-error/40' },
    { from: /border-\[#DC2626\]\/30/g, to: 'border-status-error/30' },
    { from: /text-\[#818CF8\]/g, to: 'text-accent-primary' },
    { from: /bg-\[#6366F1\]\/20/g, to: 'bg-accent-primary/20' },
    { from: /bg-\[#6366F1\]\/10/g, to: 'bg-accent-primary/10' },
    { from: /border-\[#6366F1\]\/30/g, to: 'border-accent-primary/30' },
    { from: /border-\[#6366F1\]\/50/g, to: 'border-accent-primary/50' },
    { from: /border-\[#6366F1\]/g, to: 'border-accent-primary' },
    { from: /text-\[#A5B4FC\]/g, to: 'text-accent-primary' },
    { from: /text-\[#F43F5E\]/g, to: 'text-status-error' },
    { from: /border-\[#F43F5E\]\/50/g, to: 'border-status-error/50' },
    { from: /border-\[#F43F5E\]/g, to: 'border-status-error' }
];

filePaths.forEach(fp => {
    const fullPath = path.resolve(process.cwd(), fp);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        replaces.forEach(r => {
            content = content.replace(r.from, r.to);
        });
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fp}`);
    } else {
        console.log(`Not found ${fp}`);
    }
});
