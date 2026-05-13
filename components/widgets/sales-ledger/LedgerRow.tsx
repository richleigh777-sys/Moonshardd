
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
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all text-[9px] font-bold uppercase tracking-wider ${copied ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-surface-alt hover:bg-surface-highlight border-border-subtle text-text-muted hover:text-text-primary'}`}
            title={`Copy ${label}`}
        >
            {copied ? <Check size={10} strokeWidth={3}/> : <Copy size={10}/>} {label}
        </button>
    );
};

const ExpandedDetail = ({ sale }: { sale: Sale }) => (
    <div className="bg-surface-alt/30 border-y border-border-subtle p-6 animate-in slide-in-from-top-2 duration-300 relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

        <div className="mb-6 flex items-center justify-between border-b border-border-subtle pb-4 relative z-10">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-primary/10 rounded-xl text-accent-primary">
                    <Users size={18} />
                </div>
                <div>
                    <h4 className="text-sm font-black text-text-primary tracking-tight">Real-Time Collaboration</h4>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Active Intelligence Feed</p>
                </div>
            </div>
            <PresenceIndicator resourceId={sale.id} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            
            {/* Sector 1: Interaction & Notes */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h5 className="text-[10px] font-black uppercase text-text-primary tracking-[0.2em] flex items-center gap-2">
                        <FileText size={12} className="text-accent-primary"/> Narrative
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
                        <div className="p-1.5 bg-red-500/10 rounded-lg text-red-500"><AlertCircle size={14}/></div>
                        <div>
                             <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-0.5">Decline Protocol</p>
                             <p className="text-[10px] text-red-400 font-medium">{sale.declineReason}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Sector 2: Profile Intelligence */}
            <div className="space-y-4">
                <h5 className="text-[10px] font-black uppercase text-text-primary tracking-[0.2em] flex items-center gap-2">
                    <HeartPulse size={12} className="text-emerald-500"/> Bio-Matrix
                </h5>
                <div className="bg-surface-main rounded-2xl border border-border-subtle p-1 overflow-hidden shadow-sm">
                    <div className="grid grid-cols-2 divide-x divide-border-subtle/50">
                        <div className="p-3 text-center hover:bg-surface-alt/30 transition-colors">
                            <p className="text-[8px] font-bold text-text-muted uppercase mb-1">Biological Age</p>
                            <p className="text-lg font-black text-text-primary num-font">{sale.age ? `${sale.age}` : '--'}</p>
                        </div>
                        <div className="p-3 text-center hover:bg-surface-alt/30 transition-colors">
                            <p className="text-[8px] font-bold text-text-muted uppercase mb-1">Date of Origin</p>
                            <p className="text-xs font-bold text-text-primary font-mono">{sale.dob || 'Unknown'}</p>
                        </div>
                    </div>
                    <div className="border-t border-border-subtle/50 p-3 flex justify-between items-center bg-surface-alt/20">
                         <span className="text-[9px] font-bold text-text-muted uppercase">Spouse Entity</span>
                         <span className="text-xs font-bold text-text-primary">{sale.spouseName || 'None Listed'}</span>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                    {sale.medicalConditions?.length ? sale.medicalConditions.map((c, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-surface-main border border-border-subtle text-[9px] font-bold text-text-secondary shadow-sm flex items-center gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-accent-primary"></div> {c}
                        </span>
                    )) : <span className="text-[10px] text-text-muted italic opacity-50">No conditions tagged</span>}
                </div>
            </div>

            {/* Sector 3: Financial & Actions */}
            <div className="space-y-4">
                <h5 className="text-[10px] font-black uppercase text-text-primary tracking-[0.2em] flex items-center gap-2">
                    <CreditCard size={12} className="text-amber-500"/> Vault & Ops
                </h5>
                <div className="bg-surface-main p-4 rounded-2xl border border-border-subtle shadow-sm space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-border-subtle/50">
                        <span className="text-[10px] font-bold text-text-muted uppercase">Provider</span>
                        <span className="text-xs font-black text-text-primary uppercase flex items-center gap-2">
                            {sale.bankName} <span className="text-text-muted">•</span> {sale.cardProvider}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-text-muted uppercase">Order Ref</span>
                        <div className="flex items-center gap-2">
                             <code className="text-[10px] bg-surface-alt px-2 py-0.5 rounded border border-border-subtle text-accent-primary font-mono font-bold">{sale.orderId || 'PENDING'}</code>
                             {sale.orderId && <CopyButton text={sale.orderId} label="ID" />}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    {sale.email && (
                        <a href={`mailto:${sale.email}`} className="flex items-center justify-center gap-2 h-9 rounded-xl bg-surface-main border border-border-subtle hover:border-accent-primary/50 text-[10px] font-bold uppercase tracking-wider text-text-secondary hover:text-accent-primary transition-all shadow-sm group">
                            <Mail size={12} className="group-hover:scale-110 transition-transform"/> Email
                        </a>
                    )}
                    {sale.address && (
                        <a href={`https://maps.google.com/?q=${encodeURIComponent(sale.address)}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 h-9 rounded-xl bg-surface-main border border-border-subtle hover:border-emerald-500/50 text-[10px] font-bold uppercase tracking-wider text-text-secondary hover:text-emerald-500 transition-all shadow-sm group">
                            <MapPin size={12} className="group-hover:scale-110 transition-transform"/> Map
                        </a>
                    )}
                    <CopyButton text={sale.address} label="Copy Addr" />
                    <CopyButton text={sale.phone} label="Copy #" />
                </div>
            </div>

        </div>
    </div>
);

export const LedgerRow: React.FC<LedgerRowProps> = React.memo(({ 
    sale, activeColumns, isSelected, onToggle, onAction, density, onContextMenu 
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
            
            case 'trackingId': return <CellRenderers.TrackingCell value={val} isEditing={false} onChange={() => {}} onAction={onAction} />;
            case 'deliveryStatus': return <CellRenderers.DeliveryStatusCell value={val} isEditing={false} onChange={() => {}} />;
            case 'address': 
            case 'billingAddress': return <CellRenderers.AddressCell value={val} isEditing={false} onChange={() => {}} />;
            
            case 'age': return <CellRenderers.BioCell value={val} row={sale} isEditing={false} onChange={() => {}} />;
            case 'spouseName': return <CellRenderers.SpouseCell value={val} isEditing={false} onChange={() => {}} />;
            case 'medicalConditions': return <CellRenderers.TagsCell value={val} isEditing={false} onChange={() => {}} />;
            case 'dob': return <CellRenderers.DateStringCell value={val} isEditing={false} onChange={() => {}} />;

            case 'status': return <CellRenderers.StatusCell value={val} isEditing={false} onChange={() => {}} />;
            case 'pipelineStatus': return <CellRenderers.PipelineCell value={val} isEditing={false} onChange={() => {}} />;
            case 'declineReason': return <CellRenderers.DeclineReasonCell value={val} isEditing={false} onChange={() => {}} />;
            case 'isReorder': return <CellRenderers.RecurringCell value={val} isEditing={false} onChange={() => {}} />;
            case 'orderId': return <CellRenderers.IdCell value={val} isEditing={false} onChange={() => {}} />;
            
            case 'callSummary': return <CellRenderers.NoteCell value={val} isEditing={false} onChange={() => {}} />;
            case 'recording': return <CellRenderers.MediaCell value={val} row={sale} onAction={onAction} isEditing={false} onChange={() => {}} />;
            
            case 'cardNumber': 
            case 'cardCvv': return <CellRenderers.SecureCell value={val} isEditing={false} onChange={() => {}} />;
            case 'cardExpiry': return <CellRenderers.TextCell value={val} isEditing={false} onChange={() => {}} />;
            
            case 'quantity': 
            case 'dosage': return <CellRenderers.TextCell value={val} isEditing={false} onChange={() => {}} />;
            
            default: return <CellRenderers.TextCell value={val} isEditing={false} onChange={() => {}} />;
        }
    };

    const pad = density === 'compact' ? 'p-2' : 'p-4';

    return (
        <>
            <tr 
                onContextMenu={onContextMenu}
                className={`group transition-all duration-200 border-l-2 ${isSelected ? 'bg-accent-primary/5 border-l-accent-primary' : isExpanded ? 'bg-surface-alt/30 border-l-transparent' : 'hover:bg-surface-alt/40 border-l-transparent hover:border-l-border-subtle'}`}
            >
                <td className={`${pad} text-center w-12`}>
                    <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className={`transition-all ${isSelected ? 'text-accent-primary' : 'text-border-subtle group-hover:text-text-muted'}`}>
                        {isSelected ? <CheckSquare size={16}/> : <Square size={16}/>}
                    </button>
                </td>
                <td className={`${pad} w-10 text-center`}>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} 
                        className={`p-1 rounded-lg hover:bg-surface-highlight transition-all ${isExpanded ? 'rotate-90 text-accent-primary bg-surface-highlight' : 'text-text-muted'}`}
                    >
                        <ChevronRight size={14} />
                    </button>
                </td>
                {activeColumns.map(col => (
                    <td key={col} className={`${pad} text-xs align-middle border-r border-transparent group-hover:border-border-subtle/30 last:border-0`}>
                        {renderCell(col)}
                    </td>
                ))}
                <td className={`${pad} text-right pr-6`}>
                    <div className="relative flex justify-end">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onAction('view_options', sale); }}
                            className="p-2 hover:bg-surface-alt rounded-lg text-text-muted transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <MoreVertical size={16}/>
                        </button>
                    </div>
                </td>
            </tr>
            {isExpanded && (
                <tr>
                    <td colSpan={100} className="p-0 border-t border-border-subtle">
                        <ExpandedDetail sale={sale} />
                    </td>
                </tr>
            )}
        </>
    );
});
