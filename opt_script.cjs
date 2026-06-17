const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else {
      if (name.endsWith('.tsx') || name.endsWith('.ts')) {
        files.push(name);
      }
    }
  }
  return files;
}

const dirs = ['components', 'views'];
let files = [];
dirs.forEach(d => getFiles(d, files));

files.forEach(file => {
  if (file.includes('Auth.tsx') || file.includes('Login.tsx') || file.includes('layout')) return;
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content.replace(/p-6 lg:p-8/g, 'p-4')
                   .replace(/p-8/g, 'p-5')
                   .replace(/(?<![a-zA-Z0-9_-])p-6(?![a-zA-Z0-9_-])/g, 'p-4')
                   .replace(/(?<![a-zA-Z0-9_-])px-6(?![a-zA-Z0-9_-])/g, 'px-4')
                   .replace(/(?<![a-zA-Z0-9_-])py-6(?![a-zA-Z0-9_-])/g, 'py-4')
                   .replace(/(?<![a-zA-Z0-9_-])gap-8(?![a-zA-Z0-9_-])/g, 'gap-5')
                   .replace(/(?<![a-zA-Z0-9_-])gap-6(?![a-zA-Z0-9_-])/g, 'gap-4')
                   .replace(/(?<![a-zA-Z0-9_-])text-4xl(?![a-zA-Z0-9_-])/g, 'text-2xl')
                   .replace(/(?<![a-zA-Z0-9_-])text-3xl(?![a-zA-Z0-9_-])/g, 'text-xl')
                   .replace(/(?<![a-zA-Z0-9_-])text-2xl([^a-zA-Z])/g, 'text-lg$1')
                   .replace(/h-\[400px\]/g, 'h-[300px]')
                   .replace(/min-h-\[400px\]/g, 'min-h-[300px]')
                   .replace(/rounded-3xl/g, 'rounded-2xl')
                   .replace(/(?<![a-zA-Z0-9_-])rounded-2xl(?![a-zA-Z0-9_-])/g, 'rounded-xl');
                   
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log(`Updated ${file}`);
  }
});
