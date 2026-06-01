const fs = require('fs');

function replaceAlerts(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    if (!content.includes('alert(') && !content.includes('window.alert(')) return;
    
    // Add useSystem import if not present
    if (!content.includes('useSystem')) {
       let importLine = "import { useSystem } from '../../../hooks/useSystem';\n";
       const levels = (filePath.match(/\//g) || []).length;
       if (levels === 3) importLine = "import { useSystem } from '../../../hooks/useSystem';\n";
       if (levels === 4) importLine = "import { useSystem } from '../../../../hooks/useSystem';\n";
       if (levels === 5) importLine = "import { useSystem } from '../../../../../hooks/useSystem';\n";
       
       content = content.replace(/import {([^}]+)} from 'react';/, `import {$1} from 'react';\n${importLine}`);
       if (content === original) { // Fallback if no specific react import matched
            content = importLine + content;
       }
    }
    
    // Insert const { setToast } = useSystem(); if not present
    if (!content.includes('setToast')) {
        content = content.replace(/export\s+(const|function)\s+\w+.*?{/, `$& \n    const { setToast } = useSystem();\n`);
    }

    content = content.replace(/window\.alert\([^)]*\)/g, 'setToast({ title: "System Notification", message: "Action executed.", type: "info" })');
    content = content.replace(/alert\("([^"]+)"\)/g, 'setToast({ title: "Alert", message: "$1", type: "warning" })');
    content = content.replace(/alert\('([^']+)'\)/g, 'setToast({ title: "Alert", message: "$1", type: "warning" })');
    content = content.replace(/alert\(`([^`]+)`\)/g, 'setToast({ title: "Alert", message: `$1`, type: "warning" })');

    fs.writeFileSync(filePath, content);
}

const filesToFix = [
    'components/admin/system/tabs/AuditTab.tsx',
    'components/admin/system/tabs/SnapshotsTab.tsx',
    'components/admin/system/tabs/SystemTab.tsx',
    'components/admin/dashboard/StrategicInsightCard.tsx',
    'components/admin/dashboard/DashboardStrategicAnalytics.tsx',
    'components/admin/tools/PredictiveAlerts.tsx',
    'components/admin/tools/ScenarioPlanner.tsx',
    'components/admin/PresetManager.tsx',
    'components/widgets/telephony/DialerUploadWidget.tsx'
];

filesToFix.forEach(replaceAlerts);
console.log('Fixed alerts');
