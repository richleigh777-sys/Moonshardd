const fs = require('fs');
let sidebar = fs.readFileSync('components/agent/AgentSidebar.tsx', 'utf8');

if (!sidebar.includes('value="settings"')) {
    sidebar = sidebar.replace("import { \n  Zap, \n  Banknote\n} from 'lucide-react';", "import { \n  Zap, \n  Banknote, \n  Settings\n} from 'lucide-react';");
    sidebar = sidebar.replace('</TabList>', '      <TabTrigger value="settings" icon={<Settings size={22}/>}>Settings</TabTrigger>\n    </TabList>');
    fs.writeFileSync('components/agent/AgentSidebar.tsx', sidebar);
    console.log('Sidebar patched');
}

let manager = fs.readFileSync('components/agent/AgentViewManager.tsx', 'utf8');

if (!manager.includes('AgentSettingsView')) {
    manager = manager.replace("import { SmartPitchWorkspace } from './SmartPitchWorkspace';", "import { SmartPitchWorkspace } from './SmartPitchWorkspace';\nimport { AgentSettingsView } from './AgentSettingsView';");
    
    // add TabContent for settings right before </>
    const settingsTab = `
            <TabContent value="settings" className="w-full h-full flex flex-col flex-1 min-h-0">
                <AgentSettingsView />
            </TabContent>
        </>
    `;
    manager = manager.replace('        </>\n    );\n};', settingsTab + '\n    );\n};');
    fs.writeFileSync('components/agent/AgentViewManager.tsx', manager);
    console.log('Manager patched');
}

