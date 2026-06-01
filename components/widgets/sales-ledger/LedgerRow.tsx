
import React, { useState } from 'react';
import { 
    MoreVertical, ChevronRight, Copy, Check, Mail, MapPin, 
    FileText, AlertCircle, HeartPulse, CreditCard, CheckSquare, Square, Users 
} from 'lucide-react';
import { Sale } from '../../../types';
import { CellRenderers } from './cells/CellRenderers';
import { sfx } from '../../../lib/soundService';
import { usePresence } from '../../../hooks/usePresence';
import { PresenceIndicator } from '../../ui/PresenceIndicator';

interface LedgerRowProps {
    sale: Sale;
    activeColumns: string[];
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
}

const CopyButton = ({ text, label }: { text: string, label: string }) => {
    const [copied, setCopied] = useState(false);
    
    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopied(true);
        sfx.playConfirm();
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button 
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-bold  tracking-wider ${copied ? 'bg-emerald-500/10 border-emerald-500/20 text-status-success' : 'bg-surface-alt hover:bg-surface-highlight border-border-subtle text-text-muted hover:text-text-primary'}`}
            title={`Copy ${label}`}
        >
            {copied ? <Check size={16} strokeWidth={3}/> : <Copy size={16}/>} {label}
        </button>
    );
};

const ExpandedDetail = ({ sale, onAction }: { sale: Sale, onAction: (action: string, payload?: any) => void }) => (
    <div className="bg-surface-alt/30 border-y border-border-subtle p-6 animate-in slide-in-from-top-2 duration-300 relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

        <div className="mb-6 flex items-center justify-between border-b border-border-subtle pb-4 relative z-10">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-primary/10 rounded-xl text-accent-primary">
                    <Users size={18} />
                </div>
                <div>
                    <h4 className="text-sm font-[700] text-text-primary tracking-tight">Real-Time Collaboration</h4>
                    <p className="text-xs font-bold text-text-muted  tracking-widest">Active Intelligence Feed</p>
                </div>
            </div>
            <PresenceIndicator resourceId={sale.id} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            
            {/* Sector 1: Interaction & Notes */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h5 className="text-xs font-[700]  text-text-primary tracking-[0.2em] flex items-center gap-2">
                        <FileText size={16} className="text-accent-primary"/> Narrative
                    </h5>
                    {sale.callSummary && <CopyButton text={sale.callSummary} label="Copy Note" />}
                </div>
                <div className="bg-surface-main p-4 rounded-2xl border border-border-subtle shadow-sm relative group">
                    <p className="text-xs font-medium text-text-secondary leading-relaxed italic opacity-90">
                        "{sale.callSummary || 'No intelligence recorded for this interaction.'}"
                    </p>
                    <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-accent-primary/10 to-transparent rounded-bl-2xl"></div>
                </div>
                {sale.declineReason && (
                    <div className="bg-red-500/5 p-3 rounded-xl border border-red-500/20 flex items-start gap-3">
                        <div className="p-1.5 bg-red-500/10 rounded-lg text-status-error"><AlertCircle size={16}/></div>
                        <div>
                             <p className="text-xs font-[700] text-status-error  tracking-widest mb-0.5">Decline Protocol</p>
                             <p className="text-xs text-status-error font-medium">{sale.declineReason}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Sector 2: Profile Intelligence */}
            <div className="space-y-4">
                <h5 className="text-xs font-[700]  text-text-primary tracking-[0.2em] flex items-center gap-2">
                    <HeartPulse size={16} className="text-status-success"/> Bio-Matrix
                </h5>
                <div className="bg-surface-main rounded-2xl border border-border-subtle p-1 overflow-hidden shadow-sm">
                    <div className="grid grid-cols-2 divide-x divide-border-subtle/50">
                        <div className="p-3 text-center hover:bg-surface-alt/30 transition-colors">
                            <p className="text-sm font-bold text-text-muted  mb-1">Biological Age</p>
                            <p className="text-lg font-[700] text-text-primary num-font">{sale.age ? `${sale.age}` : '--'}</p>
                        </div>
                        <div className="p-3 text-center hover:bg-surface-alt/30 transition-colors">
                            <p className="text-sm font-bold text-text-muted  mb-1">Date of Origin</p>
                            <p className="text-xs font-bold text-text-primary font-mono">{sale.dob || 'Unknown'}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 p-3 border-t border-border-subtle/50 bg-surface-alt/20 min-h-[48px]">
                        {[
                            ...(sale.height || sale.weight ? [[sale.height, sale.weight].filter(Boolean).join(' / ')] : []),
                            ...(sale.medicalConditions || [])
                        ].map((c, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-lg bg-surface-main border border-border-subtle text-xs font-bold text-text-secondary shadow-sm flex items-center gap-1.5">
                                <div className="w-1 h-1 rounded-full bg-accent-primary"></div> {c}
                            </span>
                        ))}
                        {!(sale.height || sale.weight) && (!sale.medicalConditions || sale.medicalConditions.length === 0) && (
                            <span className="text-xs text-text-muted italic opacity-50">No conditions tagged</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Sector 3: Financial & Actions */}
            <div className="space-y-4">
                <h5 className="text-xs font-[700]  text-text-primary tracking-[0.2em] flex items-center gap-2">
                    <CreditCard size={16} className="text-status-warning"/> Vault & Ops
                </h5>
                <div className="bg-surface-main p-4 rounded-2xl border border-border-subtle shadow-sm space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-border-subtle/50">
                        <span className="text-xs font-bold text-text-muted ">Provider</span>
                        <span className="text-xs font-[700] text-text-primary  flex items-center gap-2">
                            {sale.bankName} <span className="text-text-muted">•</span> {sale.cardProvider}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-text-muted ">Order Ref</span>
                        <div className="flex items-center gap-2">
                             <code className="text-xs bg-surface-alt px-2.5 py-1 rounded border border-border-subtle text-accent-primary font-mono font-bold">{sale.orderId || 'PENDING'}</code>
                             {sale.orderId && <CopyButton text={sale.orderId} label="ID" />}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    {sale.email && (
                        <a href={`mailto:${sale.email}`} className="flex items-center justify-center gap-2 h-9 rounded-xl bg-surface-main border border-border-subtle hover:border-accent-primary/50 text-xs font-bold  tracking-wider text-text-secondary hover:text-accent-primary transition-all shadow-sm group">
                            <Mail size={16} className="group-hover:scale-110 transition-transform"/> Email
                        </a>
                    )}
                    {sale.address && (
                        <a href={`https://maps.google.com/?q=${encodeURIComponent(sale.address)}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 h-9 rounded-xl bg-surface-main border border-border-subtle hover:border-status-success/50 text-xs font-bold  tracking-wider text-text-secondary hover:text-status-success transition-all shadow-sm group">
                            <MapPin size={16} className="group-hover:scale-110 transition-transform"/> Map
                        </a>
                    )}
                    <CopyButton text={sale.address} label="Copy Addr" />
                    <CopyButton text={sale.phone} label="Copy #" />
                </div>

                {sale.status === 'Pending' && (
                    <div className="flex gap-2 pt-2">
                        <button onClick={() => onAction('approve')} className="flex-1 h-9 bg-status-success hover:bg-emerald-400 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
                            <Check size={16} strokeWidth={3} /> Approve
                        </button>
                        <button onClick={() => onAction('decline', { reason: 'Administrative Review Failure' })} className="flex-1 h-9 bg-status-error/10 hover:bg-status-error text-status-error hover:text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all border border-status-error/20 hover:border-status-error flex items-center justify-center gap-2">
                            Declined
                        </button>
                    </div>
                )}
            </div>

        </div>
    </div>
);

export const LedgerRow: React.FC<LedgerRowProps> = React.memo(({ 
    sale, activeColumns, isSelected, onToggle, onAction, density, onContextMenu, allowActions,
    style, className, measureRef, dataIndex
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
            case 'billingZip': 
            case 'height':
            case 'weight': return <CellRenderers.TextCell value={val} isEditing={false} onChange={() => {}} />;
            
            case 'age': return <CellRenderers.BioCell value={val} row={sale} isEditing={false} onChange={() => {}} />;
            case 'medicalConditions': return <CellRenderers.TagsCell value={val} row={sale} isEditing={false} onChange={() => {}} />;
            case 'dob': return <CellRenderers.DateStringCell value={val} isEditing={false} onChange={() => {}} />;

            case 'status': return <CellRenderers.StatusCell value={val} isEditing={false} onChange={() => {}} />;
            case 'pipelineStatus': return <CellRenderers.PipelineCell value={val} isEditing={false} onChange={() => {}} />;
            case 'declineReason': return <CellRenderers.DeclineReasonCell value={val} isEditing={false} onChange={() => {}} />;
            case 'isReorder': return <CellRenderers.RecurringCell value={val} isEditing={false} onChange={() => {}} />;
            case 'orderId': return <CellRenderers.IdCell value={val} isEditing={false} onChange={() => {}} />;
            
            case 'qaScore': return <CellRenderers.QACell value={val} isEditing={false} onChange={() => {}} />;
            
            case 'callSummary': return <CellRenderers.NoteCell value={val} isEditing={false} onChange={() => {}} />;
            case 'recording': return <CellRenderers.MediaCell value={val} row={sale} onAction={onAction} isEditing={false} onChange={() => {}} />;
            
            case 'quantity': 
            case 'dosage': return <CellRenderers.TextCell value={val} isEditing={false} onChange={() => {}} />;
            
            default: return <CellRenderers.TextCell value={val} isEditing={false} onChange={() => {}} />;
        }
    };

    const pad = density === 'compact' ? 'px-2 py-1.5' : 'px-4 py-3';

    return (
        <tbody 
            ref={measureRef}
            data-index={dataIndex}
            className={`group transition-colors duration-150 border-b border-border-subtle/50 ${className || ''} ${isSelected ? 'bg-accent-primary/5' : isExpanded ? 'bg-surface-alt/50' : 'bg-surface-main hover:bg-surface-highlight'}`}
            style={style}
        >
            <tr onContextMenu={onContextMenu} className={`border-l-[3px] ${isSelected ? 'border-l-accent-primary' : 'border-l-transparent'}`}>
                <td className={`${pad} text-center w-12 align-middle`}>
                    <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className={`transition-all ${isSelected ? 'text-accent-primary scale-110' : 'text-border-subtle group-hover:text-text-muted hover:scale-110'}`}>
                        {isSelected ? <CheckSquare size={16}/> : <Square size={16}/>}
                    </button>
                </td>
                <td className={`${pad} w-10 text-center align-middle`}>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} 
                        className={`p-1 rounded-md hover:bg-surface-alt transition-transform ${isExpanded ? 'rotate-90 text-accent-primary bg-surface-alt' : 'text-text-muted'}`}
                    >
                        <ChevronRight size={16} />
                    </button>
                </td>
                {activeColumns.map(col => (
                    <td key={col} className={`${pad} text-xs align-middle border-r border-transparent group-hover:border-border-subtle/30 last:border-0 truncate`}>
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
