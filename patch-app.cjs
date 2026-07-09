const fs = require('fs');
let app = fs.readFileSync('App.tsx', 'utf8');

if (!app.includes('DLPWatermark')) {
    app = app.replace("import { AutoScaler } from './components/layout/AutoScaler';", "import { AutoScaler } from './components/layout/AutoScaler';\nimport { DLPWatermark } from './components/security/DLPWatermark';");
    app = app.replace("<MainContent />", "<DLPWatermark />\n                                <MainContent />");
    fs.writeFileSync('App.tsx', app);
    console.log("App.tsx patched");
}
