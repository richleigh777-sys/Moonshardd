const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function run(cmd) {
    console.log(cmd);
    try {
        execSync(cmd, { stdio: 'inherit' });
    } catch (e) {
        console.error(e);
    }
}

// Just bulk replacing text-xs with text-sm where safe
run('npx replace "text-xs" "text-sm" ./components/agent/IntelligentTerminalMap.tsx');
run('npx replace "text-xs" "text-sm" ./components/agent/OperationalRhythm.tsx');
run('npx replace "text-xs" "text-sm" ./components/widgets/telephony/SyncHubSection.tsx');

// More specific class upgrades!
run('npx replace "text-sm font-bold/g" "text-base font-black/g" ./components/agent/IntelligentTerminalMap.tsx ./components/agent/OperationalRhythm.tsx');
run('npx replace "text-sm text-text-muted/g" "text-sm text-text-secondary font-medium/g" ./components/agent/IntelligentTerminalMap.tsx ./components/agent/OperationalRhythm.tsx');
