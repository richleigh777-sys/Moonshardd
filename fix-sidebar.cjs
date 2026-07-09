const fs = require('fs');
let file = fs.readFileSync('components/agent/AgentSidebar.tsx', 'utf8');
if (!file.includes('Settings')) {
    file = file.replace("import {   Zap, Banknote} from 'lucide-react';", "import { Zap, Banknote, Settings } from 'lucide-react';");
    fs.writeFileSync('components/agent/AgentSidebar.tsx', file);
    console.log("Fixed sidebar imports");
}
