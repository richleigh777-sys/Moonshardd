
import React, { useState } from 'react';
import { 
    MoreVertical, ChevronRight, Copy, Check, Mail, MapPin, 
    FileText, AlertCircle, HeartPulse, CreditCard, CheckSquare, Square, Users 
} from 'lucide-react';
import { Sale } from '../../../types';
import { CellRenderers } from './cells/CellRenderers';
import { sfx } from '../../../lib/soundService';
import { usePresence } from '../../../hooks/usePresence';
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
}



export const LedgerRow: React.FC<LedgerRowProps> = React.memo(({ 
    sale, activeColumns, frozenCols = new Set(), frozenOffsets = {}, isSelected, onToggle, onAction, density, onContextMenu, allowActions,
    style, className, measureRef, dataIndex, rowIndex
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Track presence when expanded
    usePresence(isExpanded ? sale.id : '', 'sale', 'viewing');

    const renderCell = (key: string) => {
        let val = (sale as any)[key];
        if (key === 'date') val = sale.timestamp;

        switch(key) {
            case 'date': 
            case 'followUpDate':
            case 'callbackTime': return <CellRenderers.DateCell value={val} isEditing={false} onChange={() => {}} />;
            case 'agent': return <CellRenderers.AgentCell value={val} isEditing={false} onChange={() => {}} />;
            case 'customer': return <CellRenderers.IdentityCell value={val} row={sale} onAction={onAction} isEditing={false} onChange={() => {}} />;
            case 'phone': 
            case 'email': return <CellRenderers.ContactCell value={val} isEditing={false} onChange={() => {}} />;
            
            case 'product': return <CellRenderers.ProductCell value={val} row={sale} isEditing={false} onChange={() => {}} />;
            case 'amount': return <CellRenderers.MoneyCell value={val} isEditing={false} onChange={() => {}} />;
            case 'cardType': return <CellRenderers.TextCell value={val} isEditing={false} onChange={() => {}} />;
            case 'bankNetwork': return <CellRenderers.BankCell value={val} isEditing={false} onChange={() => {}} row={sale} />;
            case 'cardNumber': return <CellRenderers.SecureCell value={val} isEditing={false} onChange={() => {}} />;
            case 'cardCvv': return <CellRenderers.SecureCell value={val} isEditing={false} onChange={() => {}} />;
            case 'cardExpiry': return <CellRenderers.TextCell value={val} isEditing={false} onChange={() => {}} />;
            
            case 'trackingId': return <CellRenderers.TrackingCell value={val} isEditing={false} onChange={() => {}} onAction={onAction} />;
            case 'deliveryStatus': return <CellRenderers.DeliveryStatusCell value={val} isEditing={false} onChange={() => {}} />;
            case 'address':
            case 'shippingAddress': 
            case 'billingAddress': return <CellRenderers.AddressCell value={val} row={sale} isEditing={false} onChange={() => {}} />;
            
            case 'city':
            case 'state':
            case 'zip': 
            case 'shippingCity':
            case 'shippingState':
            case 'shippingZip':
            case 'billingCity':
            case 'billingState':
            case 'billingZip': return <CellRenderers.TextCell value={val} isEditing={false} onChange={() => {}} />;
            
            case 'ageDob': return <CellRenderers.BioCell value={val} row={sale} isEditing={false} onChange={() => {}} />;
            case 'heightWeight': return <CellRenderers.PhysicalCell value={val} row={sale} isEditing={false} onChange={() => {}} />;
            case 'age': return <CellRenderers.BioCell value={val} row={sale} isEditing={false} onChange={() => {}} />;
            case 'medicalConditions': return <CellRenderers.TagsCell value={val} row={sale} isEditing={false} onChange={() => {}} />;
            case 'dob': return <CellRenderers.DateStringCell value={val} isEditing={false} onChange={() => {}} />;
            case 'height': return <CellRenderers.TextCell value={val} isEditing={false} onChange={() => {}} />;
            case 'weight': return <CellRenderers.TextCell value={val} isEditing={false} onChange={() => {}} />;

            case 'status': return <CellRenderers.StatusCell value={val} isEditing={false} onChange={() => {}} />;
            case 'pipelineStatus': return <CellRenderers.PipelineCell value={val} isEditing={false} onChange={() => {}} />;
            case 'declineReason': return <CellRenderers.DeclineReasonCell value={val} isEditing={false} onChange={() => {}} />;
            case 'isReorder': return <CellRenderers.RecurringCell value={val} isEditing={false} onChange={() => {}} />;
            case 'orderId': return <CellRenderers.IdCell value={val} isEditing={false} onChange={() => {}} />;
            
            case 'qaScore': return <CellRenderers.QACell value={val} isEditing={false} onChange={() => {}} />;
            
            case 'callSummary': return <CellRenderers.NoteCell value={val} row={sale} isEditing={false} onChange={() => {}} />;
            case 'recording': return <CellRenderers.MediaCell value={val} row={sale} onAction={onAction} isEditing={false} onChange={() => {}} />;
            


            case 'quantity': return <CellRenderers.QuantityCell value={val} row={sale} isEditing={false} onChange={() => {}} />;
            case 'dosage': return <CellRenderers.DosageCell value={val} row={sale} isEditing={false} onChange={() => {}} />;
            
            default: return <CellRenderers.TextCell value={val} isEditing={false} onChange={() => {}} />;
        }
    };

    const pad = density === 'compact' ? 'px-2 py-0.5' : 'px-3 py-1.5';

    // 2026 CRM UX: Row status color mappings
    const isApproved = sale.status === 'Approved';
    const isDelivered = isApproved && sale.deliveryStatus === 'Delivered';
    const isDeclinedOrCancelled = sale.status === 'Declined' || sale.status === 'Cancelled';
    const isRescue = sale.status === 'Rescue In Progress';

    let statusRowBgClass = 'bg-surface-main';
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
            <tr onContextMenu={onContextMenu} className={`border-l-2 ${finalBorderClass}`}>
                {rowIndex !== undefined && (
                    <td className={`sticky left-0 z-20 ${finalRowBgClass} bg-surface-main ${pad} text-center w-10 align-middle text-[10px] font-medium text-text-muted select-none`}>
                        {rowIndex}
                    </td>
                )}
                <td className={`sticky ${rowIndex !== undefined ? 'left-[40px]' : 'left-0'} z-20 ${finalRowBgClass} bg-surface-main ${pad} text-center w-12 align-middle`}>
                    <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className={`transition-all ${isSelected ? 'text-accent-primary scale-110' : 'text-border-subtle group-hover:text-text-muted hover:scale-110'}`}>
                        {isSelected ? <CheckSquare size={16}/> : <Square size={16}/>}
                    </button>
                </td>
                <td className={`sticky ${rowIndex !== undefined ? 'left-[88px]' : 'left-[48px]'} z-20 ${finalRowBgClass} bg-surface-main ${pad} w-10 text-center align-middle`}>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} 
                        className={`p-1 rounded-md hover:bg-surface-alt/80 transition-transform ${isExpanded ? 'rotate-90 text-accent-primary bg-surface-alt/80' : 'text-text-muted'}`}
                    >
                        <ChevronRight size={16} />
                    </button>
                </td>
                {activeColumns.map(col => (
                    <td 
                        key={col} 
                        className={`${pad} text-xs align-middle border-r border-border-subtle/20 last:border-0 truncate ${frozenCols.has(col) ? `${finalRowBgClass} bg-surface-main` : ''}`}
                        style={frozenCols.has(col) ? { position: 'sticky', left: frozenOffsets[col], zIndex: 20 } : {}}
                    >
                        <div className="truncate w-full block">
                            {renderCell(col)}
                        </div>
                    </td>
                ))}
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
