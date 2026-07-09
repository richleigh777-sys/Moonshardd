import fs from 'fs';

const path = 'components/widgets/PriorityActions.tsx';
let data = fs.readFileSync(path, 'utf8');

if (!data.includes('executeDialer')) {
    data = data.replace(
        "import { useCRM } from '../../hooks/useCRM';",
        "import { useCRM } from '../../hooks/useCRM';\nimport { executeDialer } from '../../lib/dialer';"
    );
    
    // Ensure systemConfig is destructured
    if (!data.includes('systemConfig } = useCRM()')) {
        data = data.replace(
            "const { customers } = useCRM();",
            "const { customers, systemConfig } = useCRM();"
        );
    }
    
    data = data.replace(
        "onClick={() => window.location.href = `tel:${task.phone}`}",
        "onClick={() => executeDialer(task.phone, { phone: task.phone }, systemConfig)}"
    );
}

fs.writeFileSync(path, data, 'utf8');
console.log("Patched PriorityActions.tsx");
