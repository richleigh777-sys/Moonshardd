
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
    quantity: 'Quantity',
    dosage: 'Dosage',
    amount: 'Amount',
    cardType: 'Debit/Credit',
    bankNetwork: 'Bank/Network',
    cardNumber: 'Card Number',
    cardExpiry: 'Expiry',
    cardCvv: 'CVV',
    status: 'Status',
    pipelineStatus: 'Stage',
    orderId: 'Order ID',
    qaScore: 'QA',
    declineReason: 'Decline Reason',
    deliveryStatus: 'Shipping Status',
    trackingId: 'Tracking ID',
    recording: 'Recording',
    followUpDate: 'Follow Up',
    callbackTime: 'Callback Time',
    isReorder: 'Reorder',
    callSummary: 'Notes',
    cmd: 'CMD'
};

const COLUMN_WIDTHS: Record<string, string> = {
    date: 'w-[100px]',
    agent: 'w-[100px]',
    customer: 'w-[124px]',
    phone: 'w-[100px]',
    email: 'w-[124px]',
    age: 'w-[100px]',
    dob: 'w-[100px]',
    height: 'w-[100px]',
    weight: 'w-[100px]',
    medicalConditions: 'w-[124px]',
    address: 'w-[124px]',
    shippingAddress: 'w-[124px]',
    shippingCity: 'w-[100px]',
    shippingState: 'w-[100px]',
    shippingZip: 'w-[100px]',
    billingAddress: 'w-[124px]',
    billingCity: 'w-[100px]',
    billingState: 'w-[100px]',
    billingZip: 'w-[100px]',
    city: 'w-[100px]',
    state: 'w-[100px]',
    zip: 'w-[100px]',
    product: 'w-[124px]',
    quantity: 'w-[100px]',
    dosage: 'w-[100px]',
    amount: 'w-[100px]',
    bankNetwork: 'w-[100px]',
    cardNumber: 'w-[100px]',
    cardExpiry: 'w-[100px]',
    cardCvv: 'w-[100px]',
    status: 'w-[100px]',
    pipelineStatus: 'w-[100px]',
    orderId: 'w-[100px]',
    qaScore: 'w-[100px]',
    declineReason: 'w-[124px]',
    deliveryStatus: 'w-[100px]',
    trackingId: 'w-[100px]',
    recording: 'w-[100px]',
    followUpDate: 'w-[100px]',
    callbackTime: 'w-[100px]',
    isReorder: 'w-[100px]',
    callSummary: 'w-[180px]',
    cmd: 'w-[100px]'
};

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
    const activeColumns = useMemo(() => {
        return columnOrder.filter(k => visibleColumns[k]);
    }, [columnOrder, visibleColumns]);
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
        if ((e.target as HTMLElement).classList.contains('resizer')) return;
        setDraggedCol(col);
        e.dataTransfer.setData('text/plain', col);
        e.dataTransfer.effectAllowed = 'move';
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
        newOrder.splice(sourceIdx, 1);
        const targetIdx = newOrder.indexOf(targetCol);
        newOrder.splice(targetIdx, 0, draggedCol);
        onColumnReorder(newOrder);
        sfx.playConfirm();
        setDraggedCol(null);
    };

    // --- RESIZE & FREEZE ---
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
    const [frozenCols, setFrozenCols] = useState<Set<string>>(new Set());
    const [resizingCol, setResizingCol] = useState<{ col: string, startX: number, startWidth: number } | null>(null);
    const [headerMenu, setHeaderMenu] = useState<{ x: number, y: number, col: string } | null>(null);

    useEffect(() => {
        if (!resizingCol) return;
        const handleMouseMove = (e: MouseEvent) => {
            const diff = e.clientX - resizingCol.startX;
            setColumnWidths(prev => ({ ...prev, [resizingCol.col]: Math.max(60, resizingCol.startWidth + diff) }));
        };
        const handleMouseUp = () => setResizingCol(null);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
             document.removeEventListener('mousemove', handleMouseMove);
             document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [resizingCol]);

    const getColWidth = (col: string) => {
        if (columnWidths[col]) return columnWidths[col];
        if (COLUMN_WIDTHS[col]) {
            const match = COLUMN_WIDTHS[col].match(/w-\[([0-9]+)px\]/);
            if (match) return parseInt(match[1], 10);
            const legacyMatch = COLUMN_WIDTHS[col].split('-')[1];
            if (legacyMatch && !isNaN(parseInt(legacyMatch, 10))) return parseInt(legacyMatch, 10) * 4;
        }
        return 128;
    };

    const startResize = (col: string, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setResizingCol({ col, startX: e.clientX, startWidth: getColWidth(col) });
    };

    const { frozenOffsets } = useMemo(() => {
        const offsets: Record<string, number> = {};
        let currentLeft = 48 + 40; // w-12 + w-10 class widths
        for (const col of activeColumns) {
            if (frozenCols.has(col)) {
                offsets[col] = currentLeft;
                currentLeft += getColWidth(col);
            }
        }
        return { frozenOffsets: offsets };
    }, [activeColumns, columnWidths, frozenCols]);

    const handleHeaderContextMenu = (e: React.MouseEvent, col: string) => {
        e.preventDefault();
        setHeaderMenu({ x: e.clientX, y: e.clientY, col });
    };

    const toggleFreeze = (col: string) => {
        const newSet = new Set(frozenCols);
        if (newSet.has(col)) newSet.delete(col);
        else newSet.add(col);
        setFrozenCols(newSet);
        setHeaderMenu(null);
    };

    const COLUMN_LABELS_INTERNAL = COLUMN_LABELS;
    const COLUMN_WIDTHS_INTERNAL = COLUMN_WIDTHS;

    return (
        <div ref={parentRef} className="flex-1 min-h-0 w-full overflow-auto custom-scrollbar bg-surface-main relative">
            <table className="w-full text-left border-collapse table-fixed min-w-max">
                <colgroup>
                    <col className="w-10 bg-surface-alt/10 border-r border-border-subtle/50" />
                    <col className="w-12 bg-surface-alt/10 border-r border-border-subtle/50" />
                    <col className="w-10" />
                    {activeColumns.map(col => (
                        <col key={col} style={{ width: getColWidth(col) }} />
                    ))}
                    <col className="w-16" />
                </colgroup>
                <thead className="sticky top-0 z-30 bg-surface-main border-b border-border-subtle shadow-sm drop-shadow-sm">
                    <tr>
                        <th className={`sticky left-0 z-40 w-10 bg-surface-alt/80 backdrop-blur-md text-center border-r border-border-subtle/50 ${density === 'compact' ? 'p-1' : 'p-2'}`}>
                            <span className="text-[10px] text-text-muted">#</span>
                        </th>
                        <th className={`sticky left-[40px] z-40 w-12 bg-surface-alt/80 backdrop-blur-md text-center border-r border-border-subtle/50 ${density === 'compact' ? 'p-1' : 'p-2'}`}>
                            <button onClick={toggleSelectAll} className="text-text-muted hover:text-accent-primary transition-colors">
                                {selectedIds.size > 0 && selectedIds.size === sales.length ? <CheckSquare size={16}/> : <Square size={16}/>}
                            </button>
                        </th>
                        <th className={`sticky left-[88px] z-40 w-10 bg-surface-alt/80 backdrop-blur-md border-r border-border-subtle/50`}></th>
                        {activeColumns.map(col => (
                            <th 
                                key={col} 
                                draggable
                                onDragStart={(e) => handleDragStart(e, col)}
                                onDragOver={(e) => handleDragOver(e, col)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, col)}
                                onContextMenu={(e) => handleHeaderContextMenu(e, col)}
                                className={`
                                    ${density === 'compact' ? 'px-2 py-0.5' : 'px-3 py-1'} 
                                    text-[10px] sm:text-xs font-[700] tracking-widest text-text-muted uppercase
                                    cursor-grab active:cursor-grabbing transition-all select-none group border-r border-border-subtle/50
                                    ${draggedCol === col ? 'opacity-40 bg-surface-alt' : ''}
                                    ${dragOverCol === col ? 'border-l-2 border-accent-primary bg-accent-primary/5' : ''}
                                `}
                                onClick={() => handleSort(col)}
                                style={{
                                    ...(frozenCols.has(col) ? { position: 'sticky', left: frozenOffsets[col], zIndex: 35, background: 'var(--color-surface-alt)' } : { position: 'relative' }),
                                    width: getColWidth(col)
                                }}
                            >
                                <div className="flex items-center justify-between w-full relative">
                                    <div className="flex items-center gap-1.5 truncate">
                                        <GripVertical size={14} className="text-text-muted/20 group-hover:text-text-muted transition-colors shrink-0"/>
                                        <span className="truncate">{COLUMN_LABELS[col] || col.replace(/([A-Z])/g, ' $1').trim()}</span>
                                        {sortConfig.key === col && (
                                            <span className="text-accent-primary shrink-0">
                                                {sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div 
                                    className="resizer absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-accent-primary z-50 transition-colors"
                                    onMouseDown={(e) => startResize(col, e)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </th>
                        ))}
                        <th className={`${density === 'compact' ? 'p-1' : 'p-2'} w-16 text-right bg-surface-alt/80 backdrop-blur-md pr-6 border-l border-border-subtle/50`}>CMD</th>
                    </tr>
                </thead>
                {rowVirtualizer.getVirtualItems().length > 0 && (
                    <tbody>
                        <tr style={{ height: `${rowVirtualizer.getVirtualItems()[0]?.start || 0}px` }}>
                            <td colSpan={activeColumns.length + 4} />
                        </tr>
                    </tbody>
                )}
                {rowVirtualizer.getVirtualItems().map(virtualRow => {
                    if (isLoading) {
                        return (
                            <tbody key={`skeleton-${virtualRow.index}`} ref={rowVirtualizer.measureElement} data-index={virtualRow.index}>
                                <tr className="animate-pulse border-b border-border-subtle/50">
                                    <td className="p-4" colSpan={activeColumns.length + 4}>
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
                            frozenCols={frozenCols}
                            frozenOffsets={frozenOffsets}
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
                            rowIndex={virtualRow.index + 1}
                        />
                    );
                })}
                {rowVirtualizer.getVirtualItems().length > 0 && (
                    <tbody>
                        <tr style={{ height: `${rowVirtualizer.getTotalSize() - (rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1]?.end || 0)}px` }}>
                            <td colSpan={activeColumns.length + 4} />
                        </tr>
                    </tbody>
                )}
                {!isLoading && sales.length === 0 && (
                    <tbody>
                        <tr><td colSpan={activeColumns.length + 4} className="p-20 text-center text-text-muted italic opacity-50">Sector empty. Standing by for telemetry.</td></tr>
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

            {headerMenu && (
                <div 
                    className="fixed z-[100] w-48 bg-surface-main/95 backdrop-blur-xl border border-border-subtle rounded-xl shadow-2xl p-1.5 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-200"
                    style={{ left: headerMenu.x, top: headerMenu.y }}
                >
                    <div 
                        className="fixed inset-0 -z-10" 
                        onClick={() => setHeaderMenu(null)}
                    />
                    <button 
                        onClick={() => toggleFreeze(headerMenu.col)}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-surface-alt text-text-primary rounded-lg transition-all text-xs font-bold text-left group"
                    >
                        {frozenCols.has(headerMenu.col) ? 'Unfreeze Column' : 'Freeze Column'}
                    </button>
                </div>
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
