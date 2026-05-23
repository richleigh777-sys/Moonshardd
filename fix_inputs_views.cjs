const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('./views', function(filePath) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let contents = fs.readFileSync(filePath, 'utf8');
        let newContents = contents.replace(/<input /g, '<input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} ');
        if (contents !== newContents) {
            fs.writeFileSync(filePath, newContents);
            console.log("Updated: " + filePath);
        }
    }
});
