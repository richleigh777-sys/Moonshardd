
import React, { useState } from 'react';
import { 
    MoreVertical, ChevronRight, CheckSquare, Square 
} from 'lucide-react';
import { Sale } from '../../../types';
import { CellRenderers } from './cells/CellRenderers';
import { usePresence } from '../../../hooks/usePresence';
import { CRMContext } from '../../../context/CRMContextCore';
import { ExpandedDetail } from './ExpandedDetail';

interface LedgerRowProps {
    sale: Sale;
    activeColumns: string[];
    frozenCols?: Set<string>;
    frozenOffsets?: Record<string, number>;
    isSelected: boolean;
    onToggle: () => void;
    onAction: (action: string, payload?: any) => void;
    allowActions: boolean;
    density: 'compact' | 'comfortable';
    onContextMenu: (e: React.MouseEvent) => void;
    style?: React.CSSProperties;
    className?: string;
    measureRef?: (node: Element | null) => void;
    dataIndex?: number;
    rowIndex?: number;
    selectionRange?: { startRow: number, startCol: number, endRow: number, endCol: number } | null;
    onCellMouseDown?: (rowIndex: number, colIndex: number) => void;
    onCellMouseEnter?: (rowIndex: number, colIndex: number) => void;
    isLevel10?: boolean;
}



export const LedgerRow: React.FC<LedgerRowProps> = React.memo(({ 
    sale, activeColumns, frozenCols = new Set(), frozenOffsets = {}, isSelected, onToggle, onAction, density, onContextMenu, allowActions,
    style, className, measureRef, dataIndex, rowIndex,
    selectionRange, onCellMouseDown, onCellMouseEnter, isLevel10
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const context = React.useContext(CRMContext);
    const activeUsers = context?.presence?.filter(p => p.resourceId === sale.id && p.action === 'editing' && p.userId !== context.currentUser?.id) || [];
    
    const [editingCol, setEditingCol] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<any>(null);

    // Optimistic UI state
    const [optimisticSale, setOptimisticSale] = useState<Sale>(sale);

    React.useEffect(() => {
        setOptimisticSale(sale);
    }, [sale]);

    usePresence(sale.id, 'sale', editingCol ? 'editing' : 'viewing', editingCol || undefined);

    const handleCellDoubleClick = (col: string) => {
        if (allowActions) {
            setEditingCol(col);
            setEditValue((optimisticSale as any)[col]);
        }
    };

    const stopEditing = () => {
        if (editingCol) {
            if (editValue !== (optimisticSale as any)[editingCol]) {
                setOptimisticSale(prev => ({ ...prev, [editingCol]: editValue }));
                onAction('update', { [editingCol]: editValue });
            }
            setEditingCol(null);
        }
    };
    
    // Track presence when expanded
    usePresence(isExpanded ? sale.id : '', 'sale', 'viewing');

    const renderCell = (key: string, isEditing: boolean = false, overrideVal?: any, onChange: (val: any) => void = () => {}, onBlur?: () => void, onKeyDown?: (e: React.KeyboardEvent) => void) => {
        let val = isEditing ? overrideVal : (optimisticSale as any)[key];
        if (key === 'date') val = optimisticSale.timestamp;

        switch(key) {
            case 'date': 
            case 'followUpDate':
            case 'callbackTime': return <CellRenderers.DateCell value={val} isEditing={isEditing} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} />;
            case 'agent': return <CellRenderers.AgentCell value={val} isEditing={isEditing} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} />;
            case 'customer': return <CellRenderers.IdentityCell value={val} row={sale} onAction={onAction} isEditing={isEditing} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} />;
            case 'phone': 
            case 'email': return <CellRenderers.ContactCell value={val} isEditing={isEditing} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} />;
            
            case 'product': return <CellRenderers.ProductCell value={val} row={sale} isEditing={isEditing} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} />;
            case 'amount': return <CellRenderers.MoneyCell value={val} isEditing={isEditing} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} />;
            case 'cardType': return <CellRenderers.TextCell value={val} isEditing={isEditing} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} />;
            case 'bankNetwork': return <CellRenderers.BankCell value={val} isEditing={isEditing} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} row={sale} />;
            case 'cardNumber': return <CellRenderers.SecureCell value={val} isEditing={isEditing} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} />;
            case 'cardCvv': return <CellRenderers.SecureCell value={val} isEditing={isEditing} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} />;
            case 'cardExpiry': return <CellRenderers.TextCell value={val} isEditing={isEditing} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} />;
            
            case 'trackingId': return <CellRenderers.TrackingCell value={val} isEditing={isEditing} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} onAction={onAction} />;
            case 'deliveryStatus': return <CellRenderers.DeliveryStatusCell value={val} isEditing={isEditing} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} />;
            case 'address':
            case 'shippingAddress': 
            case 'billingAddress': return <CellRenderers.AddressCell value={val} row={sale} isEditing={isEditing} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} />;
            
            case 'city':
            case 'state':
            case 'zip': 
            case 'shippingCity':
            case 'shippingState':
            case 'shippingZip':
            case 'billingCity':
            case 'billingState':
            case 'billingZip': return <CellRenderers.TextCell value={val} isEditing={isEditing} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} />;
            
            case 'ageDob': return <CellRenderers.BioCell value={val} row={sale} isEditing={isEditing} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} />;
            case 'heightWeight': return <CellRenderers.PhysicalCell value={val} row={sale} isEditing={isEditing} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} />;
            case 'age': return <CellRenderers.BioCell value={val} row={sale} isEditing={isEditing} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} />;
            case 'medicalConditions': return <CellRenderers.TagsCell value={val} row={sale} isEditing={isEditing} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} />;
            case 'dob': return <CellRenderers.DateStringCell value={val} isEditing={isEditing} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} />;
            case 'height': return <CellRenderers.TextCell value={val} isEditing={isEditing} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} />;
            case 'weight': return <CellRenderers.TextCell value={val} isEditing={isEditing} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} />;

            case 'status': return <CellRenderers.StatusCell value={val} isEditing={isEditing} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} />;
            case 'pipelineStatus': return <CellRenderers.PipelineCell value={val} isEditing={isEditing} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} />;
            case 'declineReason': return <CellRenderers.DeclineReasonCell value={val} isEditing={isEditing} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} />;
            case 'isReorder': return <CellRenderers.RecurringCell value={val} isEditing={isEditing} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} />;
            case 'orderId': return <CellRenderers.IdCell value={val} isEditing={isEditing} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} />;
            
            case 'qaScore': return <CellRenderers.QACell value={val} isEditing={isEditing} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} />;
            
            case 'callSummary': return <CellRenderers.NoteCell value={val} row={sale} isEditing={isEditing} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} />;
            case 'recording': return <CellRenderers.MediaCell value={val} row={sale} onAction={onAction} isEditing={isEditing} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} />;
            


            case 'quantity': return <CellRenderers.QuantityCell value={val} row={sale} isEditing={isEditing} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} />;
            case 'dosage': return <CellRenderers.DosageCell value={val} row={sale} isEditing={isEditing} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} />;
            
            default: return <CellRenderers.TextCell value={val} isEditing={isEditing} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} />;
        }
    };

    const pad = density === 'compact' ? 'px-2 py-0.5' : 'px-3 py-1.5';

    // 2026 CRM UX: Row status color mappings
    const isApproved = optimisticSale.status === 'Approved';
    const isDelivered = isApproved && optimisticSale.deliveryStatus === 'Delivered';
    const isDeclinedOrCancelled = optimisticSale.status === 'Declined' || optimisticSale.status === 'Cancelled';
    const isRescue = optimisticSale.status === 'Rescue In Progress';

    const statusRowBgClass = 'bg-surface-main';
    let statusBorderClass = 'border-l-transparent';
    let statusHoverClass = 'group-hover:bg-surface-alt/40';

    if (isApproved) {
        if (isDelivered) {
            statusHoverClass = 'group-hover:bg-emerald-500/5';
            statusBorderClass = 'border-l-emerald-500';
        } else {
            statusHoverClass = 'group-hover:bg-sky-500/5';
            statusBorderClass = 'border-l-sky-400';
        }
    } else if (isDeclinedOrCancelled) {
        statusHoverClass = 'group-hover:bg-rose-500/5';
        statusBorderClass = 'border-l-rose-500';
    } else if (isRescue) {
        statusHoverClass = 'group-hover:bg-amber-500/5';
        statusBorderClass = 'border-l-amber-400';
    }

    const unselectedRowBg = isExpanded ? 'bg-surface-alt/50 group-hover:bg-surface-alt/80' : `${statusRowBgClass} ${statusHoverClass}`;
    
    const finalRowBgClass = isSelected 
        ? 'bg-accent-primary/10 group-hover:bg-accent-primary/15' 
        : unselectedRowBg;

    const finalBorderClass = isSelected ? 'border-l-accent-primary' : statusBorderClass;

    return (
        <tbody 
            ref={measureRef}
            data-index={dataIndex}
            className={`group transition-colors duration-150 border-b border-border-subtle/40 ${className || ''} ${finalRowBgClass}`}
            style={style}
        >
            <tr onContextMenu={onContextMenu} className={`border-l-2 ${finalBorderClass} ${!isLevel10 ? "select-none" : ""}`}>
                {rowIndex !== undefined && (
                    <td onClick={(e) => { e.stopPropagation(); onToggle(); }} className={`sticky left-0 z-20 ${finalRowBgClass} bg-surface-main ${pad} text-center w-10 align-middle text-[10px] font-medium text-text-muted select-none cursor-pointer hover:text-accent-primary hover:bg-surface-alt/50 transition-colors`}>
                        {rowIndex}
                    </td>
                )}
                <td className={`sticky ${rowIndex !== undefined ? 'left-[40px]' : 'left-0'} z-20 ${finalRowBgClass} bg-surface-main ${pad} text-center w-12 align-middle`}>
                    <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className={`transition-all ${isSelected ? 'text-accent-primary scale-110' : 'text-border-subtle group-hover:text-text-muted hover:scale-110'}`}>
                        {isSelected ? <CheckSquare size={16}/> : <Square size={16}/>}
                    </button>
                </td>
                <td className={`sticky ${rowIndex !== undefined ? 'left-[88px]' : 'left-[48px]'} z-20 ${finalRowBgClass} bg-surface-main ${pad} w-10 text-center align-middle shadow-[1px_0_0_var(--border-subtle)]`}>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} 
                        className={`p-1 rounded-md hover:bg-surface-alt/80 transition-transform ${isExpanded ? 'rotate-90 text-accent-primary bg-surface-alt/80' : 'text-text-muted'}`}
                    >
                        <ChevronRight size={16} />
                    </button>
                </td>
                {activeColumns.map((col, colIndex) => {
                    const isSelectedCell = selectionRange && 
                        rowIndex !== undefined &&
                        rowIndex >= Math.min(selectionRange.startRow, selectionRange.endRow) &&
                        rowIndex <= Math.max(selectionRange.startRow, selectionRange.endRow) &&
                        colIndex >= Math.min(selectionRange.startCol, selectionRange.endCol) &&
                        colIndex <= Math.max(selectionRange.startCol, selectionRange.endCol);
                        
                    const isEditing = editingCol === col;
                    const cellEditors = activeUsers.filter(u => u.subResource === col);
                    const cellEditor = cellEditors[0]; // Just take first if multiple
                            return (
                        <td 
                            key={col} 
                            onDoubleClick={(e) => {
                                e.stopPropagation();
                                handleCellDoubleClick(col);
                            }}
                            onMouseDown={(e) => {
                                if (e.button === 0 && onCellMouseDown && rowIndex !== undefined) {
                                    onCellMouseDown(rowIndex, colIndex);
                                }
                            }}
                            onMouseEnter={() => {
                                if (onCellMouseEnter && rowIndex !== undefined) {
                                    onCellMouseEnter(rowIndex, colIndex);
                                }
                            }}
                            className={`${pad} text-xs align-middle border-r border-border-subtle/20 last:border-0 truncate ${frozenCols.has(col) ? `${finalRowBgClass} bg-surface-main` : ''} ${isSelectedCell ? 'bg-accent-primary/20 outline outline-1 outline-accent-primary z-10' : ''} ${cellEditor ? 'ring-2 ring-rose-500/50 bg-rose-500/5 relative' : ''}`}
                            style={frozenCols.has(col) ? { position: 'sticky', left: frozenOffsets[col], zIndex: isSelectedCell ? 21 : 20 } : {}}
                        >
                            <div className={`truncate w-full block ${isSelectedCell && !isEditing ? 'select-none pointer-events-none' : ''}`}>
                                {cellEditor && !isEditing && (
                                <div className="absolute top-0 right-0 -mt-1 -mr-1 px-1 py-0.5 bg-rose-500 text-white text-[8px] font-bold rounded-full z-30 shadow-lg" title={cellEditor.userName || 'User'}>
                                    {(cellEditor.userName || 'U').charAt(0).toUpperCase()}
                                </div>
                            )}
                            {isEditing ? (
                                    <div 
                                        onBlur={(e) => {
                                            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                                stopEditing();
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') stopEditing();
                                            if (e.key === 'Escape') setEditingCol(null);
                                        }}
                                    >
                                        {renderCell(col, true, editValue, setEditValue, stopEditing, (e) => {
                                            if (e.key === 'Enter') stopEditing();
                                            if (e.key === 'Escape') setEditingCol(null);
                                        })}
                                    </div>
                                ) : (
                                    renderCell(col, false, (sale as any)[col], () => {}, () => {}, () => {})
                                )}
                            </div>
                        </td>
                    );
                })}
                <td className={`${pad} text-right pr-6 align-middle`}>
                    <div className="relative flex justify-end">
                        <button 
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                onContextMenu(e);
                            }}
                            className="p-1.5 hover:bg-surface-alt rounded-md text-text-muted transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <MoreVertical size={16}/>
                        </button>
                    </div>
                </td>
            </tr>
            {isExpanded && (
                <tr>
                    <td colSpan={activeColumns.length + 3} className="p-0 border-b border-border-subtle">
                        <ExpandedDetail sale={sale} onAction={allowActions ? onAction : () => {}} />
                    </td>
                </tr>
            )}
        </tbody>
    );
});
