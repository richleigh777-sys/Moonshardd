
import React, { useState } from 'react';
import { 
    Clock, Phone, Mail, Truck, 
    Hash, Landmark, Activity, FileText, 
    User, Heart, 
    Calendar, MapPin, ChevronDown, 
    CheckCircle, RotateCcw, XCircle, AlertTriangle, Eye, CreditCard, Plus, AlertCircle, Package
} from 'lucide-react';
import { AudioPlayer } from '../../../ui/Base';
import { sfx } from '../../../../lib/soundService';

// --- INTERFACES ---
interface CellProps {
    value: any;
    isEditing: boolean;
    onChange: (val: any) => void;
    row?: any; 
    onAction?: (action: string, payload?: any) => void;
}

// --- 1. STATUS & PIPELINE (The Pulse) ---

export const StatusCell: React.FC<CellProps> = ({ value, isEditing, onChange }) => {
    if (isEditing) {
        return (
            <div className="relative group">
                <select 
                    className="w-full bg-surface-alt border border-border-subtle rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none focus:border-accent-primary appearance-none cursor-pointer"
                    value={value} 
                    onChange={e => onChange(e.target.value)}
                >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Declined">Declined</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Rescue In Progress">Rescue</option>
                </select>
                <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"/>
            </div>
        );
    }
    
    let icon = <Activity size={10} />;
    let style = 'bg-surface-alt border-border-subtle text-text-muted';

    if (value === 'Approved') {
        icon = <CheckCircle size={10} />;
        style = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500';
    } else if (value === 'Declined') {
        icon = <XCircle size={10} />;
        style = 'bg-red-500/10 border-red-500/20 text-red-500';
    } else if (value === 'Pending') {
        icon = <Clock size={10} />;
        style = 'bg-amber-500/10 border-amber-500/20 text-amber-500';
    } else if (value === 'Rescue In Progress') {
        icon = <AlertTriangle size={10} />;
        style = 'bg-orange-500/10 border-orange-500/20 text-orange-500';
    }

    return (
        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border flex items-center gap-1.5 w-fit ${style}`}>
            {icon} {value}
        </span>
    );
};

export const PipelineCell: React.FC<CellProps> = ({ value, isEditing, onChange }) => {
    if (isEditing) {
        return (
            <div className="relative group">
                <select 
                    className="w-full bg-surface-alt border border-border-subtle rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none focus:border-accent-primary appearance-none"
                    value={value} 
                    onChange={e => onChange(e.target.value)}
                >
                    <option value="New">New</option>
                    <option value="Contacted – Interested">Interested</option>
                    <option value="Callback Scheduled">Callback</option>
                    <option value="Reorder Candidate">Reorder</option>
                    <option value="Closed">Closed</option>
                </select>
                <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"/>
            </div>
        );
    }
    
    let style = 'text-text-secondary bg-surface-alt/50 border-border-subtle';
    let icon = <Activity size={10} />;

    if (value === 'Closed') {
        style = 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]';
        icon = <CheckCircle size={10} />;
    }
    if (value?.includes('Interested')) {
        style = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        icon = <Heart size={10} />;
    }
    if (value?.includes('Callback')) {
        style = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
        icon = <Clock size={10} />;
    }
    if (value === 'Reorder Candidate') {
        style = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        icon = <RotateCcw size={10} />;
    }

    return (
        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border ${style} truncate max-w-[120px] flex items-center gap-1.5 transition-all hover:bg-opacity-100`}>
            {icon} {value}
        </span>
    );
};

// --- 2. FINANCIALS (The Ledger) ---

export const MoneyCell: React.FC<CellProps> = ({ value, isEditing, onChange }) => {
    if (isEditing) {
        return (
            <div className="relative group">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted font-bold">$</span>
                <input 
                    type="number" 
                    className="w-24 bg-surface-alt border border-border-subtle rounded-lg px-2 py-1 pl-5 text-xs font-mono font-bold outline-none focus:border-emerald-500"
                    value={value} 
                    onChange={e => onChange(e.target.value)} 
                />
            </div>
        );
    }
    return (
        <span className={`font-black num-font tracking-tight text-xs transition-colors ${Number(value) > 500 ? 'text-emerald-400 drop-shadow-sm' : 'text-text-primary'}`}>
            ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
    );
};

export const BankCell: React.FC<CellProps> = ({ value, isEditing, onChange, row }) => {
    if (isEditing) {
        return <input className="w-full bg-surface-alt border border-border-subtle rounded px-2 py-1 text-xs" value={value || ''} onChange={e => onChange(e.target.value)} />;
    }
    
    const bankName = value || row?.bankName || 'Unknown';
    const cardType = row?.cardProvider || 'Card';

    return (
        <div className="flex items-center gap-2 group cursor-help">
            <div className="p-1 rounded bg-surface-alt text-text-muted border border-border-subtle group-hover:border-accent-primary/50 group-hover:text-accent-primary transition-colors">
                <Landmark size={10} strokeWidth={2.5}/>
            </div>
            <div className="flex flex-col leading-none">
                <span className="text-[9px] font-black text-text-primary uppercase tracking-tight truncate max-w-[100px]">{bankName}</span>
                <span className="text-[8px] font-bold text-text-muted uppercase">{cardType}</span>
            </div>
        </div>
    );
};

export const SecureCell: React.FC<CellProps> = ({ value, isEditing, onChange }) => {
    const [visible, setVisible] = useState(false);

    if (isEditing) {
        return (
            <div className="relative">
                <input 
                    className="w-full bg-surface-alt border border-border-subtle rounded px-2 py-1 text-xs outline-none focus:border-accent-primary font-mono"
                    value={value || ''} 
                    onChange={e => onChange(e.target.value)} 
                    type={visible ? 'text' : 'password'}
                />
                <button onMouseDown={() => setVisible(true)} onMouseUp={() => setVisible(false)} className="absolute right-1 top-1 text-text-muted hover:text-text-primary"><Eye size={12}/></button>
            </div>
        );
    }
    
    // Masked View
    return (
        <div className="flex items-center gap-2 text-text-muted font-mono text-[10px] bg-surface-alt/20 px-2 py-1 rounded border border-transparent hover:border-border-subtle transition-all cursor-default">
            {value ? (
                <>
                    <CreditCard size={10} className="opacity-50"/>
                    <span className="tracking-widest">•••• {value.slice(-4)}</span>
                </>
            ) : <span className="opacity-30">-</span>}
        </div>
    );
};

// --- 3. IDENTITY (The Person) ---

export const IdentityCell: React.FC<CellProps> = ({ value, row, onAction }) => {
    return (
        <div className="flex items-start gap-3 group cursor-pointer" onClick={() => onAction && onAction('view_profile', row?.phone)}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-surface-alt to-surface-highlight border border-border-subtle flex items-center justify-center font-black text-[10px] text-text-secondary group-hover:border-accent-primary/40 group-hover:text-accent-primary transition-all shadow-sm">
                {value ? value.charAt(0) : '?'}
            </div>
            <div className="flex flex-col justify-center min-w-0">
                <span className="text-[11px] font-black uppercase text-text-primary group-hover:text-accent-primary transition-colors truncate max-w-[140px] leading-tight" title={value}>
                    {value}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                    {row?.age ? (
                        <span className="text-[8px] font-mono font-bold text-text-muted bg-surface-alt px-1 rounded border border-border-subtle">{row.age}Y</span>
                    ) : null}
                    {row?.spouseName && (
                        <span className="text-[8px] font-bold text-rose-400 bg-rose-500/5 px-1 rounded border border-rose-500/10 flex items-center gap-0.5" title={`Spouse: ${row.spouseName}`}>
                            <Heart size={6} fill="currentColor"/> +1
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export const ContactCell: React.FC<CellProps> = ({ value, isEditing, onChange }) => {
    const isPhone = !value?.includes('@'); 
    
    if (isEditing) {
        return (
            <input 
                className="w-full bg-surface-alt border border-border-subtle rounded px-2 py-1 text-xs outline-none focus:border-accent-primary"
                value={value || ''} 
                onChange={e => onChange(e.target.value)} 
            />
        );
    }

    const copyToClipboard = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(value);
        sfx.playConfirm();
    };

    return (
        <div 
            className="flex items-center gap-2 max-w-full cursor-pointer hover:bg-surface-alt/60 p-1.5 -ml-1.5 rounded-lg transition-colors group" 
            title="Click to copy"
            onClick={copyToClipboard}
        >
            <div className={`p-1 rounded bg-surface-alt border border-border-subtle ${isPhone ? 'text-emerald-500' : 'text-blue-500'}`}>
                {isPhone ? <Phone size={8} fill="currentColor"/> : <Mail size={8} fill="currentColor"/>}
            </div>
            <span className="truncate text-[10px] font-mono font-bold text-text-secondary group-hover:text-text-primary transition-colors select-all">
                {value || '-'}
            </span>
        </div>
    );
};

export const BioCell: React.FC<CellProps> = ({ row }) => (
    <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
            <User size={10} className="text-text-muted"/>
            <span className="text-[10px] font-bold text-text-primary">{row?.age || '--'} Yrs</span>
        </div>
        <div className="flex items-center gap-2">
            <Calendar size={10} className="text-text-muted"/>
            <span className="text-[9px] font-mono text-text-secondary">{row?.dob || 'Unknown'}</span>
        </div>
    </div>
);

// --- 4. LOGISTICS & PRODUCT (The Goods) ---

export const ProductCell: React.FC<CellProps> = ({ value, row }) => (
    <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5">
            <Package size={10} className="text-accent-primary"/>
            <span className="text-[10px] font-black text-text-primary truncate max-w-[140px] uppercase tracking-tight" title={value}>
                {value}
            </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 ml-4">
            <span className="text-[8px] font-bold text-text-muted uppercase bg-surface-alt px-1.5 py-0.5 rounded border border-border-subtle">
                {row?.quantity || '1'} Unit
            </span>
            {row?.dosage && (
                <span className="text-[8px] font-bold text-text-muted uppercase opacity-70">
                    {row.dosage}
                </span>
            )}
        </div>
    </div>
);

export const TrackingCell: React.FC<CellProps> = ({ value, isEditing, onChange, onAction }) => {
    if (isEditing) {
        return (
            <input 
                className="w-24 bg-surface-alt border border-border-subtle rounded px-2 py-1 text-[10px] font-mono outline-none focus:border-indigo-500"
                value={value || ''} 
                onChange={e => onChange(e.target.value)} 
                placeholder="TRACKING ID"
            />
        );
    }
    
    if (!value) {
        return (
            <button 
                onClick={() => onAction && onAction('openLogistics')} 
                className="text-[9px] font-bold text-text-muted/60 hover:text-accent-primary hover:bg-accent-primary/5 border border-dashed border-border-subtle hover:border-accent-primary/30 px-2 py-1 rounded-md transition-all flex items-center gap-1.5 w-full justify-center"
            >
                <Plus size={8}/> Track
            </button>
        );
    }

    return (
        <button 
            onClick={() => onAction && onAction('openLogistics')}
            className="group flex items-center gap-2 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 hover:border-indigo-500/30 rounded-lg p-1.5 transition-all w-full max-w-[140px]"
        >
            <div className="p-1 bg-indigo-500/20 rounded text-indigo-400">
                <Truck size={10}/>
            </div>
            <span className="font-mono text-[9px] font-bold text-indigo-400 truncate flex-1 text-left">
                {value}
            </span>
        </button>
    );
};

export const DeliveryStatusCell: React.FC<CellProps> = ({ value }) => {
    const getStatusStyle = (s: string) => {
        if (s === 'Delivered') return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
        if (s === 'Shipped' || s === 'In Transit') return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        if (s === 'Out for Delivery') return 'text-amber-500 bg-amber-500/10 border-amber-500/20 animate-pulse';
        return 'text-text-muted bg-surface-alt border-border-subtle';
    };

    return (
        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${getStatusStyle(value || '')} truncate max-w-[100px] block text-center`}>
            {value || 'Processing'}
        </span>
    );
};

// --- 5. SYSTEM & META (The Data) ---

export const DateCell: React.FC<CellProps> = ({ value }) => (
    <div className="flex flex-col leading-tight group cursor-default">
        <span className="font-bold text-[10px] text-text-primary whitespace-nowrap group-hover:text-accent-primary transition-colors">
            {new Date(value).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'2-digit'})}
        </span>
        <span className="text-[9px] opacity-50 flex items-center gap-1 font-mono text-text-muted group-hover:opacity-100 transition-opacity">
            <Clock size={8}/> {new Date(value).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
        </span>
    </div>
);

export const NoteCell: React.FC<CellProps> = ({ value, isEditing, onChange }) => {
    if (isEditing) {
        return <input className="w-full bg-surface-alt border border-border-subtle rounded px-2 py-1 text-xs" value={value || ''} onChange={e => onChange(e.target.value)} />;
    }
    if (!value) return <span className="text-text-muted opacity-10 text-[10px] italic">Empty</span>;

    return (
        <div className="relative group max-w-[180px]">
            <div className="flex items-center gap-1.5 cursor-help">
                <FileText size={10} className="text-accent-primary shrink-0"/>
                <span className="truncate text-[10px] font-medium text-text-secondary italic group-hover:text-text-primary transition-colors">
                    {value}
                </span>
            </div>
            {/* Tooltip */}
            <div className="absolute left-0 bottom-full mb-2 w-56 p-3 bg-slate-900/95 text-white text-[10px] rounded-xl border border-white/10 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 translate-y-2 group-hover:translate-y-0 backdrop-blur-md">
                <p className="leading-relaxed">{value}</p>
                <div className="absolute -bottom-1 left-3 w-2 h-2 bg-slate-900 border-b border-r border-white/10 rotate-45"></div>
            </div>
        </div>
    );
};

export const TagsCell: React.FC<CellProps> = ({ value }) => {
    const tags = Array.isArray(value) ? value : [];
    if (tags.length === 0) return <span className="text-text-muted opacity-20">-</span>;

    return (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
            {tags.slice(0, 2).map((tag: string, i: number) => (
                <span key={i} className="text-[8px] font-bold px-1.5 py-0.5 bg-surface-alt rounded-md border border-border-subtle text-text-secondary truncate max-w-[80px] shadow-sm" title={tag}>
                    {tag}
                </span>
            ))}
            {tags.length > 2 && <span className="text-[8px] text-text-muted font-bold bg-surface-alt px-1.5 py-0.5 rounded border border-border-subtle">+{tags.length - 2}</span>}
        </div>
    );
};

export const AddressCell: React.FC<CellProps> = ({ value, isEditing, onChange }) => {
    if (isEditing) {
        return (
            <input 
                className="w-full bg-surface-alt border border-border-subtle rounded px-2 py-1 text-xs outline-none focus:border-accent-primary"
                value={value || ''} 
                onChange={e => onChange(e.target.value)} 
            />
        );
    }
    
    // Extract City/State for quick view
    const parts = (value || '').split(',');
    const quickLoc = parts.length > 2 ? `${parts[parts.length-3]}, ${parts[parts.length-2]}` : value;

    return (
        <div className="group relative">
            <div className="flex items-center gap-1.5 text-[10px] text-text-secondary">
                <MapPin size={10} className="text-text-muted group-hover:text-accent-primary transition-colors shrink-0"/>
                <span className="truncate max-w-[140px] group-hover:text-text-primary transition-colors">{quickLoc || '-'}</span>
            </div>
            {/* Full Address Tooltip */}
            <div className="absolute left-0 top-full mt-1 w-48 p-2 bg-surface-main border border-border-subtle rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                <p className="text-[9px] text-text-primary leading-relaxed">{value}</p>
            </div>
        </div>
    );
};

export const IdCell: React.FC<CellProps> = ({ value }) => (
    <span className="font-mono text-[9px] font-bold text-text-muted bg-surface-alt/50 px-1.5 py-0.5 rounded border border-border-subtle select-all hover:bg-surface-alt hover:text-text-primary transition-colors cursor-text flex items-center gap-1">
        <Hash size={8} /> {value || '-'}
    </span>
);

export const DeclineReasonCell: React.FC<CellProps> = ({ value }) => (
    <div className="flex items-center gap-1.5 text-status-error/80 bg-status-error/5 px-2 py-0.5 rounded border border-status-error/10 max-w-fit">
        {value && <AlertCircle size={10} className="shrink-0" strokeWidth={2.5} />}
        <span className="text-[8px] font-black uppercase tracking-tight truncate max-w-[120px]" title={value}>
            {value || '-'}
        </span>
    </div>
);

// --- FALLBACK ---
export const TextCell: React.FC<CellProps> = ({ value, isEditing, onChange }) => {
    if (isEditing) {
        return (
            <input 
                className="w-full bg-surface-alt border border-border-subtle rounded px-2 py-1 text-xs outline-none focus:border-accent-primary"
                value={value || ''} 
                onChange={e => onChange(e.target.value)} 
            />
        );
    }
    return <span className="text-xs text-text-secondary truncate block" title={value}>{value || '-'}</span>;
};

// --- NEW CELLS (Added) ---

export const AgentCell: React.FC<CellProps> = ({ value, isEditing, onChange }) => {
    if (isEditing) {
        return <input className="w-full bg-surface-alt border border-border-subtle rounded px-2 py-1 text-xs outline-none focus:border-accent-primary" value={value || ''} onChange={e => onChange(e.target.value)} />;
    }
    return (
        <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-surface-alt border border-border-subtle flex items-center justify-center text-[10px] font-black text-text-secondary">
                {(value || '?').charAt(0)}
            </div>
            <span className="text-xs font-bold text-text-primary truncate max-w-[100px]">{value || 'Unknown'}</span>
        </div>
    );
};

export const SpouseCell: React.FC<CellProps> = ({ value, isEditing, onChange }) => {
    if (isEditing) {
        return <input className="w-full bg-surface-alt border border-border-subtle rounded px-2 py-1 text-xs outline-none focus:border-accent-primary" value={value || ''} onChange={e => onChange(e.target.value)} />;
    }
    if (!value) return <span className="text-text-muted opacity-20">-</span>;
    return (
        <div className="flex items-center gap-1.5 text-text-secondary">
            <Heart size={10} className="text-rose-400" fill="currentColor" />
            <span className="text-xs font-medium truncate max-w-[80px]">{value}</span>
        </div>
    );
};

export const DateStringCell: React.FC<CellProps> = ({ value, isEditing, onChange }) => {
    if (isEditing) {
        return <input type="date" className="w-full bg-surface-alt border border-border-subtle rounded px-2 py-1 text-xs outline-none focus:border-accent-primary" value={value || ''} onChange={e => onChange(e.target.value)} />;
    }
    return <span className="text-xs font-mono text-text-secondary">{value || '-'}</span>;
};

export const MediaCell: React.FC<CellProps> = ({ value, isEditing, onChange, onAction }) => {
    if (isEditing) {
        return <input className="w-full bg-surface-alt border border-border-subtle rounded px-2 py-1 text-xs outline-none focus:border-accent-primary" value={value || ''} onChange={e => onChange(e.target.value)} placeholder="URL" />;
    }
    if (!value) return <span className="text-text-muted opacity-20">-</span>;
    
    return (
        <div className="w-28">
             <AudioPlayer src={value} onDelete={onAction ? () => onAction('delete_recording') : undefined} />
        </div>
    );
};
