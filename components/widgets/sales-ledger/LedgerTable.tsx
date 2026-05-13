
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { 
    Copy, Check, XCircle, User, GripVertical, 
    Edit, CheckSquare, Square, ChevronUp, ChevronDown 
} from 'lucide-react';
import { Sale } from '../../../types';
import { LedgerRow } from './LedgerRow';
import { sfx } from '../../../lib/soundService';

interface LedgerTableProps {
    sales: Sale[];
    columnOrder: string[];
    visibleColumns: Record<string, boolean>;
    sortConfig: { key: string; direction: 'asc' | 'desc' };
    handleSort: (key: string) => void;
    selectedIds: Set<string>;
    toggleSelect: (id: string) => void;
    toggleSelectAll: () => void;
    allowActions: boolean;
    onAction: (sale: Sale, action: string, payload?: any) => void;
    onColumnReorder: (newOrder: string[]) => void;
    density: 'compact' | 'comfortable';
}

const ContextMenu = ({ x, y, onClose, onAction }: { x: number, y: number, onClose: () => void, onAction: (a: string) => void, saleId: string }) => {
    const menuRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClick = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose(); };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [onClose]);

    return (
        <div ref={menuRef} style={{ top: y, left: x }} className="fixed z-[100] w-48 bg-surface-main/95 backdrop-blur-xl border border-border-subtle rounded-xl shadow-2xl p-1.5 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => onAction('approve')} className="flex items-center gap-3 px-3 py-2 hover:bg-emerald-500/10 text-text-primary hover:text-emerald-500 rounded-lg transition-all text-xs font-bold text-left group">
                <Check size={14} className="text-text-muted group-hover:text-emerald-500"/> Approve Order
            </button>
            <button onClick={() => onAction('decline')} className="flex items-center gap-3 px-3 py-2 hover:bg-rose-500/10 text-text-primary hover:text-rose-500 rounded-lg transition-all text-xs font-bold text-left group">
                <XCircle size={14} className="text-text-muted group-hover:text-rose-500"/> Decline Order
            </button>
            <div className="h-px bg-border-subtle mx-2 my-1"></div>
            <button onClick={() => onAction('view_profile')} className="flex items-center gap-3 px-3 py-2 hover:bg-surface-alt text-text-primary rounded-lg transition-all text-xs font-bold text-left group">
                <User size={14} className="text-text-muted group-hover:text-accent-primary"/> View Profile
            </button>
             <button onClick={() => onAction('update')} className="flex items-center gap-3 px-3 py-2 hover:bg-surface-alt text-text-primary rounded-lg transition-all text-xs font-bold text-left group">
                <Edit size={14} className="text-text-muted group-hover:text-accent-primary"/> Edit Record
            </button>
            <div className="h-px bg-border-subtle mx-2 my-1"></div>
             <button onClick={() => onAction('copy_id')} className="flex items-center gap-3 px-3 py-2 hover:bg-surface-alt text-text-primary rounded-lg transition-all text-xs font-bold text-left group">
                <Copy size={14} className="text-text-muted group-hover:text-accent-primary"/> Copy ID
            </button>
        </div>
    );
};

export const LedgerTable: React.FC<LedgerTableProps> = ({
    sales, columnOrder, visibleColumns, sortConfig, handleSort, selectedIds, toggleSelect, toggleSelectAll,
    allowActions, onAction, onColumnReorder, density
}) => {
    const activeColumns = useMemo(() => columnOrder.filter(k => visibleColumns[k]), [columnOrder, visibleColumns]);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, sale: Sale } | null>(null);
    
    // Drag State
    const [draggedCol, setDraggedCol] = useState<string | null>(null);
    const [dragOverCol, setDragOverCol] = useState<string | null>(null);

    const handleContextMenu = (e: React.MouseEvent, sale: Sale) => {
        e.preventDefault();
        sfx.playClick();
        setContextMenu({ x: e.clientX, y: e.clientY, sale });
    };

    const handleContextAction = (action: string) => {
        if (!contextMenu) return;
        if (action === 'copy_id') {
            navigator.clipboard.writeText(contextMenu.sale.id);
            sfx.playConfirm();
        } else {
            onAction(contextMenu.sale, action);
        }
        setContextMenu(null);
    };

    // --- DRAG HANDLERS ---
    const handleDragStart = (e: React.DragEvent, col: string) => {
        setDraggedCol(col);
        e.dataTransfer.setData('text/plain', col);
        e.dataTransfer.effectAllowed = 'move';
        // Optional: Custom drag image could be set here
    };

    const handleDragOver = (e: React.DragEvent, col: string) => {
        e.preventDefault(); // Necessary to allow drop
        if (draggedCol !== col) {
            setDragOverCol(col);
        }
    };

    const handleDragLeave = () => {
        setDragOverCol(null);
    };

    const handleDrop = (e: React.DragEvent, targetCol: string) => {
        e.preventDefault();
        setDragOverCol(null);
        if (!draggedCol || draggedCol === targetCol) return;

        const newOrder = [...columnOrder];
        const sourceIdx = newOrder.indexOf(draggedCol);
        
        // Remove from old position
        newOrder.splice(sourceIdx, 1);
        
        // Find new target index (re-calculate as array shifted)
        const targetIdx = newOrder.indexOf(targetCol);
        
        // Insert at new position
        newOrder.splice(targetIdx, 0, draggedCol);
        
        onColumnReorder(newOrder);
        sfx.playConfirm();
        setDraggedCol(null);
    };

    const COLUMN_LABELS: Record<string, string> = {
        date: 'Date/Time',
        agent: 'Agent',
        customer: 'Customer',
        phone: 'Phone',
        product: 'Product',
        amount: 'Amount',
        status: 'Status',
        pipelineStatus: 'Stage',
        orderId: 'Order ID',
        followUpDate: 'Follow Up',
        callbackTime: 'Callback Time',
        isReorder: 'Reorder'
    };

    return (
        <div className="w-full h-full overflow-auto custom-scrollbar bg-surface-main relative">
            <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead className="sticky top-0 z-20 bg-surface-main border-b border-border-subtle shadow-sm">
                    <tr>
                        <th className={`w-12 bg-surface-alt/50 text-center ${density === 'compact' ? 'p-2' : 'p-4'}`}>
                            <button onClick={toggleSelectAll} className="text-text-muted hover:text-accent-primary transition-colors">
                                {selectedIds.size > 0 && selectedIds.size === sales.length ? <CheckSquare size={16}/> : <Square size={16}/>}
                            </button>
                        </th>
                        <th className={`w-10 bg-surface-alt/50`}></th>
                        {activeColumns.map(col => (
                            <th 
                                key={col} 
                                draggable
                                onDragStart={(e) => handleDragStart(e, col)}
                                onDragOver={(e) => handleDragOver(e, col)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, col)}
                                className={`
                                    ${density === 'compact' ? 'p-2' : 'p-4'} 
                                    text-[10px] font-black uppercase tracking-widest text-text-muted 
                                    cursor-grab active:cursor-grabbing hover:bg-surface-alt transition-all select-none group relative
                                    ${draggedCol === col ? 'opacity-40 bg-surface-alt' : ''}
                                    ${dragOverCol === col ? 'border-l-2 border-accent-primary bg-accent-primary/5' : ''}
                                `}
                                onClick={() => handleSort(col)}
                            >
                                <div className="flex items-center gap-2">
                                    <GripVertical size={10} className="text-text-muted/20 group-hover:text-text-muted transition-colors"/>
                                    {COLUMN_LABELS[col] || col.replace(/([A-Z])/g, ' $1').trim()}
                                    {sortConfig.key === col && (
                                        sortConfig.direction === 'asc' ? <ChevronUp size={12}/> : <ChevronDown size={12}/>
                                    )}
                                </div>
                            </th>
                        ))}
                        <th className={`${density === 'compact' ? 'p-2' : 'p-4'} w-20 text-right bg-surface-alt/50 pr-6`}>CMD</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/50">
                    {sales.map((sale) => (
                        <LedgerRow
                            key={sale.id}
                            sale={sale}
                            activeColumns={activeColumns}
                            isSelected={selectedIds.has(sale.id)}
                            onToggle={() => toggleSelect(sale.id)}
                            onAction={(act, pay) => onAction(sale, act, pay)}
                            allowActions={allowActions}
                            density={density}
                            onContextMenu={(e) => handleContextMenu(e, sale)}
                        />
                    ))}
                    {sales.length === 0 && (
                        <tr><td colSpan={12} className="p-20 text-center text-text-muted italic opacity-50">Sector empty. Standing by for telemetry.</td></tr>
                    )}
                </tbody>
            </table>
            
            {contextMenu && (
                <ContextMenu 
                    x={contextMenu.x} 
                    y={contextMenu.y} 
                    saleId={contextMenu.sale.id}
                    onClose={() => setContextMenu(null)}
                    onAction={handleContextAction}
                />
            )}
        </div>
    );
};
