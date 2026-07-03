
import React, { useMemo, useState, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { 
    CheckSquare, Square, ChevronUp, ChevronDown, GripVertical 
} from 'lucide-react';
import { Sale } from '../../../types';
import { LedgerRow } from './LedgerRow';
import { sfx } from '../../../lib/soundService';
import { OrderProcessingModal } from './OrderProcessingModal';
import { QAScorecardModal } from './QAScorecardModal';
import { ContextMenu } from './ContextMenu';
import { COLUMN_LABELS } from './constants';
import { useTableInteractions } from './useTableInteractions';

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
    fetchNextPage?: () => void;
    hasMore?: boolean;
}

export const LedgerTable: React.FC<LedgerTableProps> = ({
    sales, columnOrder, visibleColumns, sortConfig, handleSort, selectedIds, toggleSelect, toggleSelectAll,
    allowActions, onAction, onColumnReorder, density, isLoading, fetchNextPage, hasMore
}) => {
    const activeColumns = useMemo(() => {
        return columnOrder.filter(k => visibleColumns[k] && k !== 'cmd');
    }, [columnOrder, visibleColumns]);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, sale: Sale } | null>(null);
    const [actionModal, setActionModal] = useState<{ action: 'approve' | 'decline' | 'qa', sale: Sale } | null>(null);
    
    const parentRef = useRef<HTMLDivElement>(null);
    const rowVirtualizer = useVirtualizer({
        count: hasMore ? sales.length + 1 : sales.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => (density === 'compact' ? 44 : 56),
        overscan: 5,
    });
    
    const virtualItems = rowVirtualizer.getVirtualItems();
    
    React.useEffect(() => {
        const lastItem = virtualItems[virtualItems.length - 1];
        if (!lastItem) return;
        
        if (hasMore && lastItem.index >= sales.length - 1 && fetchNextPage && !isLoading) {
            fetchNextPage();
        }
    }, [virtualItems, hasMore, fetchNextPage, isLoading, sales.length]);

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

    const {
        draggedCol,
        dragOverCol,
        frozenCols,
        frozenOffsets,
        headerMenu,
        setHeaderMenu,
        getColWidth,
        startResize,
        handleDragStart,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        handleHeaderContextMenu,
        toggleFreeze
    } = useTableInteractions({ sales, columnOrder, activeColumns, onColumnReorder });

    return (
        <div ref={parentRef} className="flex-1 min-h-0 w-full overflow-auto ledger-scrollbar bg-surface-main relative">
            <table className="w-full text-left border-collapse table-fixed min-w-max">
                <colgroup>
                    <col className="w-10 bg-surface-main" />
                    <col className="w-12 bg-surface-main" />
                    <col className="w-10 bg-surface-main" />
                    {activeColumns.map(col => (
                        <col key={col} style={{ width: getColWidth(col) }} />
                    ))}
                    <col className="w-16" />
                </colgroup>
                <thead className="sticky top-0 z-30 bg-surface-main border-b-2 border-border-subtle drop-shadow-sm">
                    <tr>
                        <th className={`sticky left-0 z-40 w-10 bg-surface-main backdrop-blur-md text-center ${density === 'compact' ? 'p-1' : 'p-2'}`}>
                            <span className="text-[10px] text-text-muted">#</span>
                        </th>
                        <th className={`sticky left-[40px] z-40 w-12 bg-surface-main backdrop-blur-md text-center ${density === 'compact' ? 'p-1' : 'p-2'}`}>
                            <button onClick={toggleSelectAll} className="text-text-muted hover:text-accent-primary transition-colors">
                                {selectedIds.size > 0 && selectedIds.size === sales.length ? <CheckSquare size={16}/> : <Square size={16}/>}
                            </button>
                        </th>
                        <th className={`sticky left-[88px] z-40 w-10 bg-surface-main backdrop-blur-md`}></th>
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
                                    ${density === 'compact' ? 'px-2 py-0.5' : 'px-3 py-1.5'} 
                                    text-[10px] sm:text-[11px] font-[600] tracking-wider text-text-muted uppercase
                                    cursor-grab active:cursor-grabbing transition-all select-none group border-r border-border-subtle/20 last:border-0
                                    ${draggedCol === col ? 'opacity-40 bg-surface-alt' : ''}
                                    ${dragOverCol === col ? 'border-l-2 border-accent-primary bg-accent-primary/5' : ''}
                                `}
                                onClick={() => handleSort(col)}
                                style={{
                                    ...(frozenCols.has(col) ? { position: 'sticky', left: frozenOffsets[col], zIndex: 35, background: 'var(--color-surface-main)' } : { position: 'relative' }),
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
                                    className="resizer absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-accent-primary z-50 transition-colors"
                                    onMouseDown={(e) => startResize(col, e)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </th>
                        ))}
                        <th className={`${density === 'compact' ? 'p-1' : 'p-2'} w-16 text-center bg-surface-main backdrop-blur-md pr-6 text-[10px] font-[600] tracking-wider text-text-muted uppercase`}>CMD</th>
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
                    if (isLoading && sales.length === 0) {
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
                    
                    if (virtualRow.index >= sales.length) {
                        return (
                            <tbody key={`skeleton-more-${virtualRow.index}`} ref={rowVirtualizer.measureElement} data-index={virtualRow.index}>
                                <tr className="animate-pulse border-b border-border-subtle/50 bg-surface-alt/10">
                                    <td className="p-4 text-center text-text-muted text-xs tracking-wider uppercase font-bold" colSpan={activeColumns.length + 4}>
                                        Loading more records...
                                    </td>
                                </tr>
                            </tbody>
                        );
                    }

                    const sale = sales[virtualRow.index];
                    return (
                        <LedgerRow
                            key={`${sale.id}-${virtualRow.index}`}
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
