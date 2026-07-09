const fs = require('fs');
let code = fs.readFileSync('components/widgets/sales-ledger/cells/CommonCells.tsx', 'utf8');

const targetRegex = /export const ContactCell: React\.FC<CellProps> = \(\{[\s\S]*?^\};/m;

const newContactCell = `export const ContactCell: React.FC<CellProps> = ({ value, isEditing, onChange, onBlur, onKeyDown }) => {
    const { currentUser } = useAuth();
    const isPhone = !value?.includes('@'); 
    const isLevel10 = (currentUser?.level || 0) >= 10;
    const [contextMenuPos, setContextMenuPos] = useState<{x: number, y: number} | null>(null);
    const [copyStep, setCopyStep] = useState(0);

    // Auto-hide context menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setContextMenuPos(null);
            setCopyStep(0);
        };
        if (contextMenuPos) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => document.removeEventListener('click', handleClickOutside);
    }, [contextMenuPos]);

    if (isEditing) {
        return (
            <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                className="w-full bg-surface-alt border border-border-subtle rounded px-3 py-1.5 text-xs outline-none focus:border-accent-primary"
                value={value || ''} 
                onChange={e => onChange(e.target.value)} autoFocus onBlur={onBlur} onKeyDown={onKeyDown} 
            />
        );
    }

    const canCopyDirectly = isLevel10;

    const copyToClipboardDirect = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (canCopyDirectly) {
            navigator.clipboard.writeText(value);
            sfx.playConfirm();
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        if (!isLevel10 && isPhone) {
            e.preventDefault();
            e.stopPropagation();
            setContextMenuPos({ x: e.clientX, y: e.clientY });
            setCopyStep(0);
        }
    };

    const handleMultiStepCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (copyStep === 0) {
            setCopyStep(1);
        } else if (copyStep === 1) {
            setCopyStep(2);
        } else {
            navigator.clipboard.writeText(value);
            sfx.playConfirm();
            setContextMenuPos(null);
            setCopyStep(0);
        }
    };

    return (
        <div 
            className={\`flex items-center gap-2 max-w-full p-1.5 -ml-1.5 rounded-lg transition-colors group \${canCopyDirectly ? 'cursor-pointer hover:bg-surface-alt/60' : ''}\`} 
            title={canCopyDirectly ? "Click to copy" : "Protected"}
            onClick={canCopyDirectly ? copyToClipboardDirect : undefined}
            onContextMenu={handleContextMenu}
        >
            <div className={\`p-1 rounded bg-surface-alt border border-border-subtle \${isPhone ? 'text-status-success' : 'text-blue-500'}\`}>
                {isPhone ? <Phone size={16} fill="currentColor"/> : <Mail size={16} fill="currentColor"/>}
            </div>
            <div className="flex items-center min-w-0 flex-1 group/cell text-xs font-mono font-bold text-text-secondary group-hover:text-text-primary transition-colors select-none" onClick={(e) => e.stopPropagation()}>
                <div className="truncate min-w-0 flex-1"><MaskedData value={value} type={isPhone ? 'phone' : 'email'} /></div>
                {canCopyDirectly && <CopyBtn text={value} />}
            </div>

            {contextMenuPos && (
                typeof document !== 'undefined' && createPortal(
                    <div 
                        className="fixed z-[9999] bg-surface-main border border-border-strong rounded-lg shadow-2xl overflow-hidden py-1 min-w-[160px]"
                        style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-3 py-2 text-xs text-text-muted border-b border-border-subtle select-none">
                            Protected Action
                        </div>
                        <button 
                            onClick={handleMultiStepCopy}
                            className="w-full text-left px-3 py-2 text-sm font-medium hover:bg-surface-hover transition-colors flex items-center gap-2"
                        >
                            {copyStep === 0 && <><Eye size={14} className="text-text-muted" /> Intent to Copy</>}
                            {copyStep === 1 && <><Shield size={14} className="text-amber-500" /> Confirm Request</>}
                            {copyStep === 2 && <><CheckCircle2 size={14} className="text-emerald-500" /> Click to Copy</>}
                        </button>
                    </div>,
                    document.body
                )
            )}
        </div>
    );
};`;

code = code.replace(targetRegex, newContactCell);

if (!code.includes("import { createPortal }")) {
    code = code.replace("import React, { useState } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { createPortal } from 'react-dom';");
}

fs.writeFileSync('components/widgets/sales-ledger/cells/CommonCells.tsx', code);
console.log("ContactCell rewritten");
