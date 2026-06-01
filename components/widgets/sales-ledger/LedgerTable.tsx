
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { 
    Copy, Check, XCircle, User, GripVertical, 
    Edit, CheckSquare, Square, ChevronUp, ChevronDown, Star 
} from 'lucide-react';
import { Sale } from '../../../types';
import { LedgerRow } from './LedgerRow';
import { sfx } from '../../../lib/soundService';
import { OrderProcessingModal } from './OrderProcessingModal';
import { QAScorecardModal } from './QAScorecardModal';

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
    isLoading?: boolean;
}

const ContextMenu = ({ x, y, onClose, onAction, allowActions }: { x: number, y: number, onClose: () => void, onAction: (a: string) => void, saleId: string, allowActions: boolean }) => {
    const menuRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClick = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose(); };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [onClose]);

    return (
        <div ref={menuRef} style={{ top: y, left: x }} className="fixed z-[100] w-48 bg-surface-main/95 backdrop-blur-xl border border-border-subtle rounded-xl shadow-2xl p-1.5 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-200">
            {allowActions && (
                <>
                    <button onClick={() => onAction('approve')} className="flex items-center gap-3 px-3 py-2 hover:bg-emerald-500/10 text-text-primary hover:text-status-success rounded-lg transition-all text-xs font-bold text-left group">
                        <Check size={16} className="text-text-muted group-hover:text-status-success"/> Approve Order
                    </button>
                    <button onClick={() => onAction('decline')} className="flex items-center gap-3 px-3 py-2 hover:bg-rose-500/10 text-text-primary hover:text-rose-500 rounded-lg transition-all text-xs font-bold text-left group">
                        <XCircle size={16} className="text-text-muted group-hover:text-rose-500"/> Decline Order
                    </button>
                    <div className="h-px bg-border-subtle mx-2 my-1"></div>
                    <button onClick={() => onAction('update')} className="flex items-center gap-3 px-3 py-2 hover:bg-surface-alt text-text-primary rounded-lg transition-all text-xs font-bold text-left group">
                        <Edit size={16} className="text-text-muted group-hover:text-accent-primary"/> Edit Record
                    </button>
                    <button onClick={() => onAction('qa')} className="flex items-center gap-3 px-3 py-2 hover:bg-surface-alt text-text-primary rounded-lg transition-all text-xs font-bold text-left group">
                        <Star size={16} className="text-text-muted group-hover:text-status-warning"/> QA Review
                    </button>
                    <div className="h-px bg-border-subtle mx-2 my-1"></div>
                </>
            )}
            <button onClick={() => onAction('view_profile')} className="flex items-center gap-3 px-3 py-2 hover:bg-surface-alt text-text-primary rounded-lg transition-all text-xs font-bold text-left group">
                <User size={16} className="text-text-muted group-hover:text-accent-primary"/> View Profile
            </button>
             <button onClick={() => onAction('copy_id')} className="flex items-center gap-3 px-3 py-2 hover:bg-surface-alt text-text-primary rounded-lg transition-all text-xs font-bold text-left group">
                <Copy size={16} className="text-text-muted group-hover:text-accent-primary"/> Copy ID
            </button>
        </div>
    );
};

export const LedgerTable: React.FC<LedgerTableProps> = ({
    sales, columnOrder, visibleColumns, sortConfig, handleSort, selectedIds, toggleSelect, toggleSelectAll,
    allowActions, onAction, onColumnReorder, density, isLoading
}) => {
    const [isAddressExpanded, setIsAddressExpanded] = useState(false);
    
    const activeColumns = useMemo(() => {
        let cols = columnOrder.filter(k => visibleColumns[k]);
        if (!isAddressExpanded) {
            cols = cols.filter(k => !['city', 'state', 'zip'].includes(k));
        }
        return cols;
    }, [columnOrder, visibleColumns, isAddressExpanded]);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, sale: Sale } | null>(null);
    const [actionModal, setActionModal] = useState<{ action: 'approve' | 'decline' | 'qa', sale: Sale } | null>(null);
    
    // Drag State
    const [draggedCol, setDraggedCol] = useState<string | null>(null);
    const [dragOverCol, setDragOverCol] = useState<string | null>(null);

    const parentRef = useRef<HTMLDivElement>(null);
    const rowVirtualizer = useVirtualizer({
        count: isLoading ? 10 : sales.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => (density === 'compact' ? 44 : 56),
    });
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
        } else if (action === 'approve' || action === 'decline' || action === 'qa') {
            setActionModal({ action, sale: contextMenu.sale });
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
        email: 'Email',
        age: 'Age / Bio',
        dob: 'DOB',
        height: 'Height',
        weight: 'Weight',
        medicalConditions: 'Medical',
        address: 'Street Address',
        shippingAddress: 'Shipping Address',
        shippingCity: 'Shipping City',
        shippingState: 'Shipping State',
        shippingZip: 'Shipping ZIP',
        billingAddress: 'Billing Address',
        billingCity: 'Billing City',
        billingState: 'Billing State',
        billingZip: 'Billing ZIP',
        city: 'City',
        state: 'State',
        zip: 'ZIP Code',
        product: 'Product',
        amount: 'Amount',
        bankNetwork: 'Bank/Network',
        cardNumber: 'Card Number',
        cardExpiry: 'Expiry',
        cardCvv: 'CVV',
        status: 'Status',
        pipelineStatus: 'Stage',
        orderId: 'Order ID',
        qaScore: 'QA',
        declineReason: 'Decline Reason',
        followUpDate: 'Follow Up',
        callbackTime: 'Callback Time',
        isReorder: 'Reorder',
        callSummary: 'Notes'
    };

    const COLUMN_WIDTHS: Record<string, string> = {
        date: 'w-32',
        agent: 'w-36',
        customer: 'w-48',
        phone: 'w-32',
        email: 'w-48',
        age: 'w-48',
        dob: 'w-32',
        height: 'w-24',
        weight: 'w-24',
        medicalConditions: 'w-48',
        address: 'w-48',
        shippingAddress: 'w-48',
        shippingCity: 'w-32',
        shippingState: 'w-20',
        shippingZip: 'w-24',
        billingAddress: 'w-48',
        billingCity: 'w-32',
        billingState: 'w-20',
        billingZip: 'w-24',
        city: 'w-32',
        state: 'w-20',
        zip: 'w-24',
        product: 'w-48',
        amount: 'w-24',
        bankNetwork: 'w-36',
        cardNumber: 'w-32',
        cardExpiry: 'w-20',
        cardCvv: 'w-16',
        status: 'w-28',
        pipelineStatus: 'w-32',
        orderId: 'w-32',
        qaScore: 'w-20',
        declineReason: 'w-48',
        followUpDate: 'w-32',
        callbackTime: 'w-32',
        isReorder: 'w-24',
        callSummary: 'w-64'
    };

    return (
        <div ref={parentRef} className="w-full h-full overflow-auto custom-scrollbar bg-surface-main relative">
            <table className="w-full text-left border-collapse table-fixed min-w-max">
                <colgroup>
                    <col className="w-12" />
                    <col className="w-10" />
                    {activeColumns.map(col => (
                        <col key={col} className={COLUMN_WIDTHS[col] || 'w-32'} />
                    ))}
                    <col className="w-16" />
                </colgroup>
                <thead className="sticky top-0 z-20 bg-surface-main border-b border-border-subtle shadow-sm drop-shadow-sm">
                    <tr>
                        <th className={`w-12 bg-surface-alt/80 backdrop-blur-md text-center ${density === 'compact' ? 'p-2' : 'p-3'}`}>
                            <button onClick={toggleSelectAll} className="text-text-muted hover:text-accent-primary transition-colors">
                                {selectedIds.size > 0 && selectedIds.size === sales.length ? <CheckSquare size={16}/> : <Square size={16}/>}
                            </button>
                        </th>
                        <th className={`w-10 bg-surface-alt/80 backdrop-blur-md`}></th>
                        {activeColumns.map(col => (
                            <th 
                                key={col} 
                                draggable
                                onDragStart={(e) => handleDragStart(e, col)}
                                onDragOver={(e) => handleDragOver(e, col)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, col)}
                                className={`
                                    ${density === 'compact' ? 'px-2 py-2' : 'px-4 py-3'} 
                                    ${COLUMN_WIDTHS[col] || 'w-32'}
                                    text-xs font-[700] tracking-widest text-text-muted uppercase
                                    cursor-grab active:cursor-grabbing hover:bg-surface-alt transition-all select-none group relative
                                    ${draggedCol === col ? 'opacity-40 bg-surface-alt' : ''}
                                    ${dragOverCol === col ? 'border-l-2 border-accent-primary bg-accent-primary/5' : ''}
                                `}
                                onClick={() => handleSort(col)}
                            >
                                <div className="flex items-center gap-1.5 truncate">
                                    <GripVertical size={14} className="text-text-muted/20 group-hover:text-text-muted transition-colors shrink-0"/>
                                    <span className="truncate">{COLUMN_LABELS[col] || col.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    {col === 'address' && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setIsAddressExpanded(!isAddressExpanded); sfx.playClick(); }} 
                                            className="ml-1 text-[10px] text-text-muted hover:text-accent-primary shrink-0 transition-colors px-1 rounded bg-surface-main border border-border-subtle hover:border-accent-primary flex items-center"
                                            title={isAddressExpanded ? "Collapse Address Columns" : "Expand Address Columns"}
                                        >
                                            {isAddressExpanded ? 'Collapse' : 'Expand'}
                                        </button>
                                    )}
                                    {sortConfig.key === col && (
                                        <span className="text-accent-primary shrink-0">
                                            {sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                                        </span>
                                    )}
                                </div>
                            </th>
                        ))}
                        <th className={`${density === 'compact' ? 'p-2' : 'p-3'} w-16 text-right bg-surface-alt/80 backdrop-blur-md pr-6`}>CMD</th>
                    </tr>
                </thead>
                {rowVirtualizer.getVirtualItems().length > 0 && (
                    <tbody>
                        <tr style={{ height: `${rowVirtualizer.getVirtualItems()[0]?.start || 0}px` }}>
                            <td colSpan={activeColumns.length + 3} />
                        </tr>
                    </tbody>
                )}
                {rowVirtualizer.getVirtualItems().map(virtualRow => {
                    if (isLoading) {
                        return (
                            <tbody key={`skeleton-${virtualRow.index}`} ref={rowVirtualizer.measureElement} data-index={virtualRow.index}>
                                <tr className="animate-pulse border-b border-border-subtle/50">
                                    <td className="p-4" colSpan={activeColumns.length + 3}>
                                        <div className="h-4 bg-surface-alt rounded w-full"></div>
                                    </td>
                                </tr>
                            </tbody>
                        );
                    }
                    const sale = sales[virtualRow.index];
                    return (
                        <LedgerRow
                            key={sale.id}
                            sale={sale}
                            activeColumns={activeColumns}
                            isSelected={selectedIds.has(sale.id)}
                            onToggle={() => toggleSelect(sale.id)}
                            onAction={(act, pay) => {
                                if (act === 'approve' || act === 'decline' || act === 'qa') {
                                    setActionModal({ action: act as any, sale });
                                } else {
                                    onAction(sale, act, pay);
                                }
                            }}
                            allowActions={allowActions}
                            density={density}
                            onContextMenu={(e) => handleContextMenu(e, sale)}
                            measureRef={rowVirtualizer.measureElement}
                            dataIndex={virtualRow.index}
                        />
                    );
                })}
                {rowVirtualizer.getVirtualItems().length > 0 && (
                    <tbody>
                        <tr style={{ height: `${rowVirtualizer.getTotalSize() - (rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1]?.end || 0)}px` }}>
                            <td colSpan={activeColumns.length + 3} />
                        </tr>
                    </tbody>
                )}
                {!isLoading && sales.length === 0 && (
                    <tbody>
                        <tr><td colSpan={activeColumns.length + 3} className="p-20 text-center text-text-muted italic opacity-50">Sector empty. Standing by for telemetry.</td></tr>
                    </tbody>
                )}
            </table>
            
            {contextMenu && (
                <ContextMenu 
                    x={contextMenu.x} 
                    y={contextMenu.y} 
                    saleId={contextMenu.sale.id}
                    onClose={() => setContextMenu(null)}
                    onAction={handleContextAction}
                    allowActions={allowActions}
                />
            )}

            {actionModal && actionModal.action !== 'qa' && (
                <OrderProcessingModal
                    sale={actionModal.sale}
                    actionType={actionModal.action}
                    onConfirm={(payload) => {
                        onAction(actionModal.sale, actionModal.action, payload);
                        setActionModal(null);
                    }}
                    onClose={() => setActionModal(null)}
                />
            )}

            {actionModal && actionModal.action === 'qa' && (
                <QAScorecardModal
                    sale={actionModal.sale}
                    onSave={(payload) => {
                        onAction(actionModal.sale, 'qa', payload);
                        setActionModal(null);
                    }}
                    onClose={() => setActionModal(null)}
                />
            )}
        </div>
    );
};
