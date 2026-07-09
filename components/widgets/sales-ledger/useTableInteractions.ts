import { useState, useEffect, useMemo, useCallback, DragEvent, MouseEvent } from 'react';
import { Sale } from '../../../types';
import { COLUMN_LABELS, COLUMN_WIDTHS } from './constants';
import { sfx } from '../../../lib/soundService';

interface UseTableInteractionsProps {
    sales: Sale[];
    columnOrder: string[];
    activeColumns: string[];
    onColumnReorder: (newOrder: string[]) => void;
}

export const useTableInteractions = ({ sales, columnOrder, activeColumns, onColumnReorder }: UseTableInteractionsProps) => {
    // --- DRAG HANDLERS ---
    const [draggedCol, setDraggedCol] = useState<string | null>(null);
    const [dragOverCol, setDragOverCol] = useState<string | null>(null);

    const handleDragStart = (e: DragEvent, col: string) => {
        if ((e.target as HTMLElement).classList.contains('resizer')) return;
        setDraggedCol(col);
        e.dataTransfer.setData('text/plain', col);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: DragEvent, col: string) => {
        e.preventDefault();
        if (draggedCol !== col) {
            setDragOverCol(col);
        }
    };

    const handleDragLeave = () => {
        setDragOverCol(null);
    };

    const handleDrop = (e: DragEvent, targetCol: string) => {
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
    const [userResizedCols, setUserResizedCols] = useState<Set<string>>(new Set());
    const [frozenCols, setFrozenCols] = useState<Set<string>>(new Set());
    const [resizingCol, setResizingCol] = useState<{ col: string, startX: number, startWidth: number } | null>(null);
    const [headerMenu, setHeaderMenu] = useState<{ x: number, y: number, col: string } | null>(null);

    useEffect(() => {
        if (!sales || sales.length === 0) return;
        const autoWidths: Record<string, number> = {};
        
        activeColumns.forEach(col => {
            let maxChars = (COLUMN_LABELS[col] || col).length + 2;
            const sampleRows = sales.slice(0, 100); // Check up to 100 rows
            sampleRows.forEach(sale => {
                let valStr = '';
                if (col === 'address' || col === 'shippingAddress' || col === 'billingAddress') {
                    const addr = (sale as any)[col] || '';
                    const city = col === 'billingAddress' ? sale.billingCity : (col === 'shippingAddress' ? sale.shippingCity : sale.city);
                    const state = col === 'billingAddress' ? sale.billingState : (col === 'shippingAddress' ? sale.shippingState : sale.state);
                    const zip = col === 'billingAddress' ? sale.billingZip : (col === 'shippingAddress' ? sale.shippingZip : sale.zip);
                    valStr = `${addr ? addr + ', ' : ''}${[city, state].filter(Boolean).join(', ')} ${zip || ''}`.trim();
                } else if (col === 'product' || col === 'quantity' || col === 'dosage') {
                    if (sale.rawCart && Array.isArray(sale.rawCart) && sale.rawCart.length > 0) {
                        valStr = sale.rawCart.map((item: any) => item[col] || (col === 'quantity' ? '1' : '-')).join(' + ');
                    } else {
                        valStr = String((sale as any)[col] || '');
                    }
                } else if (col === 'customer') {
                    valStr = typeof sale.customer === 'string' ? sale.customer : (sale.firstName || '') + ' ' + (sale.lastName || '');
                } else if (col === 'ageDob') {
                    valStr = '88 Yrs 12/12/1990';
                } else {
                    valStr = String((sale as any)[col] || '');
                }
                if (valStr.length > maxChars) maxChars = valStr.length;
            });
            // Calculate pixel width: roughly 9px per char + 44px for padding/icons
            autoWidths[col] = Math.max(100, Math.min(Math.ceil(maxChars * 9) + 44, 600));
        });

        setColumnWidths(prev => {
            const next = { ...prev };
            let changed = false;
            for (const col in autoWidths) {
                if (!userResizedCols.has(col)) {
                    if (next[col] !== autoWidths[col]) {
                        next[col] = autoWidths[col];
                        changed = true;
                    }
                }
            }
            return changed ? next : prev;
        });
    }, [sales, activeColumns, userResizedCols]);

    const autoFitColumn = useCallback((col: string) => {
        if (!sales || sales.length === 0) return;
        
        let maxChars = (COLUMN_LABELS[col] || col).length + 2;
        const sampleRows = sales.slice(0, 100);
        sampleRows.forEach(sale => {
            let valStr = '';
            if (col === 'address' || col === 'shippingAddress' || col === 'billingAddress') {
                const addr = (sale as any)[col] || '';
                const city = col === 'billingAddress' ? sale.billingCity : (col === 'shippingAddress' ? sale.shippingCity : sale.city);
                const state = col === 'billingAddress' ? sale.billingState : (col === 'shippingAddress' ? sale.shippingState : sale.state);
                const zip = col === 'billingAddress' ? sale.billingZip : (col === 'shippingAddress' ? sale.shippingZip : sale.zip);
                valStr = `${addr ? addr + ', ' : ''}${[city, state].filter(Boolean).join(', ')} ${zip || ''}`.trim();
            } else if (col === 'product' || col === 'quantity' || col === 'dosage') {
                if (sale.rawCart && Array.isArray(sale.rawCart) && sale.rawCart.length > 0) {
                    valStr = sale.rawCart.map((item: any) => item[col] || (col === 'quantity' ? '1' : '-')).join(' + ');
                } else {
                    valStr = String((sale as any)[col] || '');
                }
            } else if (col === 'customer') {
                valStr = typeof sale.customer === 'string' ? sale.customer : (sale.firstName || '') + ' ' + (sale.lastName || '');
            } else if (col === 'ageDob') {
                valStr = '88 Yrs 12/12/1990';
            } else {
                valStr = String((sale as any)[col] || '');
            }
            if (valStr.length > maxChars) maxChars = valStr.length;
        });
        
        const width = Math.max(100, Math.min(Math.ceil(maxChars * 9) + 44, 600));
        
        setColumnWidths(prev => ({ ...prev, [col]: width }));
        setUserResizedCols(prev => {
            const next = new Set(prev);
            next.delete(col);
            return next;
        });
    }, [sales]);

    useEffect(() => {
        if (!resizingCol) return;
        const handleMouseMove = (globalEvent: globalThis.MouseEvent) => {
            const diff = globalEvent.clientX - resizingCol.startX;
            setColumnWidths(prev => ({ ...prev, [resizingCol.col]: Math.max(60, resizingCol.startWidth + diff) }));
        };
        const handleMouseUp = () => {
            setUserResizedCols(prev => new Set(prev).add(resizingCol.col));
            setResizingCol(null);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
             document.removeEventListener('mousemove', handleMouseMove);
             document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [resizingCol]);

    const getColWidth = useCallback((col: string) => {
        if (columnWidths[col]) return columnWidths[col];
        if (COLUMN_WIDTHS[col]) {
            const match = COLUMN_WIDTHS[col].match(/w-\[([0-9]+)px\]/);
            if (match) return parseInt(match[1], 10);
            const legacyMatch = COLUMN_WIDTHS[col].split('-')[1];
            if (legacyMatch && !isNaN(parseInt(legacyMatch, 10))) return parseInt(legacyMatch, 10) * 4;
        }
        return 128;
    }, [columnWidths]);

    const startResize = (col: string, e: MouseEvent) => {
        e.stopPropagation();
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
    }, [activeColumns, columnWidths, frozenCols, getColWidth]);

    const handleHeaderContextMenu = (e: MouseEvent, col: string) => {
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

    return {
        draggedCol,
        dragOverCol,
        frozenCols,
        frozenOffsets,
        headerMenu,
        setHeaderMenu,
        getColWidth,
        startResize,
        autoFitColumn,
        handleDragStart,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        handleHeaderContextMenu,
        toggleFreeze
    };
};
