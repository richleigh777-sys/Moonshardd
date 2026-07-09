import fs from 'fs';

const path = 'components/widgets/ActionCenter.tsx';
let data = fs.readFileSync(path, 'utf8');

// Add import
if (!data.includes('executeDialer')) {
    data = data.replace(
        "import { sfx } from '../../lib/soundService';",
        "import { sfx } from '../../lib/soundService';\nimport { executeDialer } from '../../lib/dialer';\nimport { useCRM } from '../../hooks/useCRM';"
    );
}

// Modify handleCall
data = data.replace(
    /const handleCall = \(person: any, actionType\?: string\) => \{[\s\S]*?sfx\.playSubmit\(\);/,
    `const { systemConfig } = useCRM();\n\n    const handleCall = (person: any, actionType?: string) => {\n        sfx.playSubmit();\n        \n        // Execute Universal Dialer\n        if (person.phone) {\n            executeDialer(person.phone, person, systemConfig);\n        }`
);

fs.writeFileSync(path, data, 'utf8');
console.log("Patched ActionCenter.tsx");
