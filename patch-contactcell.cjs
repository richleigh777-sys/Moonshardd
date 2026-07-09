const fs = require('fs');
let code = fs.readFileSync('components/widgets/sales-ledger/cells/CommonCells.tsx', 'utf8');

// 1. We need to add state for the multi-step copy
if (!code.includes('const [copyStep, setCopyStep] = useState(0)')) {
    code = code.replace('export const ContactCell: React.FC<CellProps> = ({ value, isEditing, onChange, onBlur, onKeyDown }) => {', `export const ContactCell: React.FC<CellProps> = ({ value, isEditing, onChange, onBlur, onKeyDown }) => {
    const [contextMenuPos, setContextMenuPos] = useState<{x: number, y: number} | null>(null);
    const [copyStep, setCopyStep] = useState(0);`);
}

fs.writeFileSync('components/widgets/sales-ledger/cells/CommonCells.tsx', code);
