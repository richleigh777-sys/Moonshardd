import fs from 'fs';

const path = 'App.tsx';
let data = fs.readFileSync(path, 'utf8');

if (!data.includes('CustomWebDialerIframe')) {
    data = data.replace(
        "import { MainContent } from './components/app/MainContent';",
        "import { MainContent } from './components/app/MainContent';\nimport { CustomWebDialerIframe } from './components/widgets/telephony/CustomWebDialerIframe';"
    );
    
    data = data.replace(
        "<MainContent />",
        "<MainContent />\n                                <CustomWebDialerIframe />"
    );
}

fs.writeFileSync(path, data, 'utf8');
console.log("Patched App.tsx");
