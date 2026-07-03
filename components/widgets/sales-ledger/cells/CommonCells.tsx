
import React, { useState } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import { 
    Clock, Phone, Mail, Truck, 
    Hash, Landmark, Activity, FileText, 
    User, Heart, Copy,
    Calendar, MapPin, ChevronDown, 
    CheckCircle, RotateCcw, XCircle, AlertTriangle, Eye, CreditCard, Plus, AlertCircle, Package, Star, Music, Play, ExternalLink
} from 'lucide-react';
import { sfx } from '../../../../lib/soundService';

// --- INTERFACES ---
interface CellProps {
    value: any;
    isEditing: boolean;
    onChange: (val: any) => void;
    row?: any; 
    onAction?: (action: string, payload?: any) => void;
}

const CopyBtn = ({ text }: { text: string }) => {
    return (
        <button 
            type="button"
            onClick={(e) => { 
                e.stopPropagation(); 
                if (text && text !== '-') navigator.clipboard.writeText(text); 
            }}
            className="p-1 ml-1 text-text-muted hover:text-accent-primary hover:bg-surface-highlight rounded transition-all shrink-0 opacity-0 group-hover/cell:opacity-100"
            title="Copy"
        >
            <Copy size={14} />
        </button>
    );
};

// --- 1. STATUS & PIPELINE (The Pulse) ---

export const StatusCell: React.FC<CellProps> = ({ value, isEditing, onChange }) => {
    if (isEditing) {
        return (
            <div className="relative group">
                <select 
                    className="w-full bg-surface-alt border border-border-subtle rounded-lg px-3 py-1.5.5 text-xs font-bold outline-none focus:border-accent-primary appearance-none cursor-pointer"
                    value={value} 
                    onChange={e => onChange(e.target.value)}
                >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Declined">Declined</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Rescue In Progress">Rescue</option>
                </select>
                <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"/>
            </div>
        );
    }
    
    let icon = <Activity size={16} />;
    let style = 'bg-surface-alt border-border-subtle text-text-muted';

    if (value === 'Approved') {
        icon = <CheckCircle size={16} />;
        style = 'bg-emerald-500/10 border-emerald-500/20 text-status-success';
    } else if (value === 'Declined') {
        icon = <XCircle size={16} />;
        style = 'bg-red-500/10 border-red-500/20 text-status-error';
    } else if (value === 'Pending') {
        icon = <Clock size={16} />;
        style = 'bg-amber-500/10 border-amber-500/20 text-status-warning';
    } else if (value === 'Rescue In Progress') {
        icon = <AlertTriangle size={16} />;
        style = 'bg-orange-500/10 border-orange-500/20 text-orange-500';
    }

    return (
        <span className={`p-1.5 rounded-md text-xs font-medium tracking-wider border flex items-center justify-center w-fit ${style}`} title={value}>
            {icon}
        </span>
    );
};

export const PipelineCell: React.FC<CellProps> = ({ value, isEditing, onChange }) => {
    if (isEditing) {
        return (
            <div className="relative group">
                <select 
                    className="w-full bg-surface-alt border border-border-subtle rounded-lg px-3 py-1.5.5 text-xs font-bold outline-none focus:border-accent-primary appearance-none"
                    value={value} 
                    onChange={e => onChange(e.target.value)}
                >
                    <option value="New">New</option>
                    <option value="Contacted – Interested">Interested</option>
                    <option value="Callback Scheduled">Callback</option>
                    <option value="Reorder Candidate">Reorder</option>
                    <option value="Closed">Closed</option>
                </select>
                <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"/>
            </div>
        );
    }
    
    let style = 'text-text-secondary bg-surface-alt/50 border-border-subtle';
    let icon = <Activity size={16} />;

    if (value === 'Closed') {
        style = 'text-accent-secondary bg-accent-secondary/10 border-accent-secondary/20 shadow-sm';
        icon = <CheckCircle size={16} />;
    }
    if (value?.includes('Interested')) {
        style = 'text-status-success bg-emerald-500/10 border-emerald-500/20';
        icon = <Heart size={16} />;
    }
    if (value?.includes('Callback')) {
        style = 'text-status-warning bg-amber-500/10 border-amber-500/20';
        icon = <Clock size={16} />;
    }
    if (value === 'Reorder Candidate') {
        style = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        icon = <RotateCcw size={16} />;
    }

    return (
        <span className={`p-1.5 rounded-md border ${style} flex items-center justify-center transition-all hover:bg-opacity-100 w-fit`} title={value}>
            {icon}
        </span>
    );
};

// --- 2. FINANCIALS (The Ledger) ---

export const MoneyCell: React.FC<CellProps> = ({ value, isEditing, onChange }) => {
    if (isEditing) {
        return (
            <div className="relative group/cell">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted font-bold">$</span>
                <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                    type="number" 
                    className="w-24 bg-surface-alt border border-border-subtle rounded-lg px-3 py-1.5 pl-5 text-xs font-mono font-bold outline-none focus:border-emerald-500"
                    value={value} 
                    onChange={e => onChange(e.target.value)} 
                />
            </div>
        );
    }
    return (
        <span className={`group/cell flex items-center font-medium num-font tracking-tight text-xs transition-colors ${Number(value) > 500 ? 'text-status-success drop-shadow-sm' : 'text-text-primary'}`}>
            ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            <CopyBtn text={value?.toString()}/>
        </span>
    );
};

export const BankCell: React.FC<CellProps> = ({ value, isEditing, onChange, row }) => {
    if (isEditing) {
        return <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} className="w-full bg-surface-alt border border-border-subtle rounded px-3 py-1.5 text-xs" value={value || ''} onChange={e => onChange(e.target.value)} />;
    }
    
    const bankName = value || row?.bankName || 'Unknown';
    const cardType = row?.cardProvider || 'Card';

    return (
        <div className="flex items-center gap-2 group cursor-help">
            <div className="p-1 rounded bg-surface-alt text-text-muted border border-border-subtle group-hover:border-accent-primary/50 group-hover:text-accent-primary transition-colors">
                <Landmark size={16} strokeWidth={2.5}/>
            </div>
            <div className="flex flex-col leading-none">
                <span className="text-xs font-medium text-text-primary  tracking-tight truncate max-w-[100px]">{bankName}</span>
                <span className="text-sm font-bold text-text-muted ">{cardType}</span>
            </div>
        </div>
    );
};

export const SecureCell: React.FC<CellProps> = ({ value, isEditing, onChange }) => {
    const { currentUser } = useAuth();
    const [visible, setVisible] = useState(false);

    if (isEditing) {
        return (
            <div className="relative">
                <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                    className="w-full bg-surface-alt border border-border-subtle rounded px-3 py-1.5 text-xs outline-none focus:border-accent-primary font-mono"
                    value={value || ''} 
                    onChange={e => onChange(e.target.value)} 
                    type={visible ? 'text' : 'password'}
                />
                <button onMouseDown={() => { if((currentUser?.level || 0) >= 10) setVisible(true); }} onMouseUp={() => setVisible(false)} onMouseLeave={() => setVisible(false)} className="absolute right-1 top-1.5 text-text-muted hover:text-text-primary"><Eye size={14}/></button>
            </div>
        );
    }
    
    // Masked View
    const displayValue = decryptField(value, ENCRYPTION_KEY);
    const isLevel10 = (currentUser?.level || 0) >= 10;
    
    return (
        <div className="flex items-center gap-2 text-text-muted font-mono text-xs bg-surface-alt/20 px-3 py-1.5 rounded border border-transparent hover:border-border-subtle transition-all group/cell">
            {displayValue ? (
                <>
                    <CreditCard size={14} className="opacity-50 shrink-0"/>
                    <span className="tracking-wide truncate block min-w-0 flex-1">
                        {visible ? displayValue : (displayValue.length > 4 ? `•••• ${displayValue.slice(-4)}` : '•••')}
                    </span>
                    {isLevel10 && <CopyBtn text={displayValue} />}
                    {isLevel10 && (
                        <button onMouseDown={() => setVisible(true)} onMouseUp={() => setVisible(false)} onMouseLeave={() => setVisible(false)} className="ml-auto shrink-0 text-text-muted hover:text-text-primary"><Eye size={14}/></button>
                    )}
                </>
            ) : <span className="opacity-30">-</span>}
        </div>
    );
};

// --- 3. IDENTITY (The Person) ---

export const IdentityCell: React.FC<CellProps> = ({ value, row, onAction }) => {
    // Determine display name. If firstName and lastName are present on the row, use them. Otherwise fallback to the value.
    const hasParts = row?.firstName || row?.lastName;
    const initial = hasParts ? (row.firstName || row.lastName || '?').charAt(0) : (value ? value.charAt(0) : '?');
    const displayValue = value || (hasParts ? `${row.firstName || ''} ${row.lastName || ''}`.trim() : 'Unknown');

    return (
        <div className="flex items-start gap-3 group cursor-pointer" onClick={() => onAction && onAction('view_profile', row?.phone)}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-surface-alt to-surface-highlight border border-border-subtle flex min-w-8 items-center justify-center font-medium text-xs text-text-secondary group-hover:border-accent-primary/40 group-hover:text-accent-primary transition-all shadow-sm">
                {initial}
            </div>
            <div className="flex flex-col justify-center min-w-0">
                <div className="flex flex-col group/name relative">
                    <span className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors truncate max-w-[140px] leading-tight" title={displayValue}>
                        {displayValue}
                    </span>
                    {hasParts && (
                        <div className="absolute left-0 -bottom-5 w-max opacity-0 group-hover/name:opacity-100 transition-opacity bg-surface-main border border-border-subtle shadow-md px-2 py-1 rounded text-[10px] text-text-secondary z-50 pointer-events-none flex gap-1">
                            <span className="font-bold text-text-primary">First:</span> {row.firstName} 
                            <span className="font-bold border-l border-border-subtle pl-1 ml-1 text-text-primary">Last:</span> {row.lastName}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                    {row?.age ? (
                        <span className="text-sm font-mono font-bold text-text-muted bg-surface-alt px-1 rounded border border-border-subtle">{row.age}Y</span>
                    ) : null}
                    {row?.spouseName && (
                        <span className="text-sm font-bold text-rose-400 bg-rose-500/5 px-1 rounded border border-rose-500/10 flex items-center gap-0.5" title={`Spouse: ${row.spouseName}`}>
                            <Heart size={6} fill="currentColor"/> +1
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

import { MaskedData } from '../../../ui/MaskedData';

export const ContactCell: React.FC<CellProps> = ({ value, isEditing, onChange }) => {
    const { currentUser } = useAuth();
    const isPhone = !value?.includes('@'); 
    const isLevel10 = (currentUser?.level || 0) >= 10;
    
    if (isEditing) {
        return (
            <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                className="w-full bg-surface-alt border border-border-subtle rounded px-3 py-1.5 text-xs outline-none focus:border-accent-primary"
                value={value || ''} 
                onChange={e => onChange(e.target.value)} 
            />
        );
    }

    const canCopy = isPhone || isLevel10;

    const copyToClipboard = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (canCopy) {
            navigator.clipboard.writeText(value);
            sfx.playConfirm();
        }
    };

    return (
        <div 
            className={`flex items-center gap-2 max-w-full p-1.5 -ml-1.5 rounded-lg transition-colors group ${canCopy ? 'cursor-pointer hover:bg-surface-alt/60' : ''}`} 
            title={canCopy ? "Click to copy" : "Protected"}
            onClick={canCopy ? copyToClipboard : undefined}
        >
            <div className={`p-1 rounded bg-surface-alt border border-border-subtle ${isPhone ? 'text-status-success' : 'text-blue-500'}`}>
                {isPhone ? <Phone size={16} fill="currentColor"/> : <Mail size={16} fill="currentColor"/>}
            </div>
            <div className="flex items-center min-w-0 flex-1 group/cell text-xs font-mono font-bold text-text-secondary group-hover:text-text-primary transition-colors select-none" onClick={(e) => e.stopPropagation()}>
                <div className="truncate min-w-0 flex-1"><MaskedData value={value} type={isPhone ? 'phone' : 'email'} /></div>
                {canCopy && <CopyBtn text={value} />}
            </div>
        </div>
    );
};

import { decryptField, ENCRYPTION_KEY } from '../../../../lib/encryption';

export const BioCell: React.FC<CellProps> = ({ row }) => {
    const dob = decryptField(row?.dob, ENCRYPTION_KEY) || 'Unknown';
    return (
        <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-1.5">
                <User size={14} className="text-text-muted shrink-0"/>
                <span className="text-[11px] font-bold text-text-primary truncate">{row?.age || '--'} Yrs</span>
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
                <Calendar size={14} className="text-text-muted shrink-0"/>
                <span className="text-[11px] font-mono text-text-secondary truncate block">{dob}</span>
            </div>
        </div>
    );
};

export const PhysicalCell: React.FC<CellProps> = ({ row }) => (
    <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
            <User size={16} className="text-text-muted"/>
            <span className="text-xs font-bold text-text-primary">{row?.height || '--'}</span>
        </div>
        <div className="flex items-center gap-2">
            <Activity size={16} className="text-text-muted"/>
            <span className="text-xs font-mono text-text-secondary">{row?.weight || '--'}</span>
        </div>
    </div>
);

// --- 4. LOGISTICS & PRODUCT (The Goods) ---

export const QuantityCell: React.FC<CellProps> = ({ row }) => {
    let displayValue = row?.quantity?.toString() || '1';
    if (row?.rawCart && Array.isArray(row.rawCart) && row.rawCart.length > 0) {
        displayValue = row.rawCart.map((item: any) => item.quantity || '1').join(' + ');
    }
    return (
        <span className="text-xs font-bold text-text-primary flex items-center group/cell">
            {displayValue} <CopyBtn text={displayValue} />
        </span>
    );
};

export const DosageCell: React.FC<CellProps> = ({ row }) => {
    let displayValue = row?.dosage || '-';
    if (row?.rawCart && Array.isArray(row.rawCart) && row.rawCart.length > 0) {
        displayValue = row.rawCart.map((item: any) => item.dosage || '-').join(' + ');
    }
    return (
        <span className="text-xs text-text-secondary flex items-center group/cell">
            {displayValue} <CopyBtn text={displayValue} />
        </span>
    );
};

export const ProductCell: React.FC<CellProps> = ({ value, row }) => {
    let displayValue = value || '-';
    if (row?.rawCart && Array.isArray(row.rawCart) && row.rawCart.length > 0) {
        displayValue = row.rawCart.map((item: any) => item.product).join(' + ');
    }
    
    return (
        <div className="flex flex-col justify-center group/cell">
            <div className="flex items-center gap-1.5">
                <Package size={16} className="text-accent-primary shrink-0"/>
                <span className="text-xs font-medium text-text-primary truncate tracking-tight" title={displayValue}>
                    {displayValue}
                </span>
                <CopyBtn text={displayValue} />
            </div>
        </div>
    );
};

export const TrackingCell: React.FC<CellProps> = ({ value, isEditing, onChange, onAction }) => {
    if (isEditing) {
        return (
            <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                className="w-24 bg-surface-alt border border-border-subtle rounded px-3 py-1.5 text-xs font-mono outline-none focus:border-indigo-500"
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
                className="text-xs font-bold text-text-muted/60 hover:text-accent-primary hover:bg-accent-primary/5 border border-dashed border-border-subtle hover:border-accent-primary/30 px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 w-full justify-center"
            >
                <Plus size={16}/> Track
            </button>
        );
    }

    return (
        <button 
            onClick={() => {
                window.open(`https://tools.usps.com/go/TrackConfirmAction?tLabels=${value}`, '_blank', 'noopener,noreferrer');
            }}
            className="group flex items-center gap-2 bg-indigo-500/5 hover:bg-accent-secondary/10 border border-indigo-500/10 hover:border-indigo-500/30 rounded-lg p-1.5 transition-all w-full max-w-[140px]"
        >
            <div className="p-1 bg-indigo-500/20 rounded text-accent-secondary">
                <Truck size={16}/>
            </div>
            <span className="font-mono text-xs font-bold text-accent-secondary truncate flex-1 text-left">
                {value}
            </span>
            <ExternalLink size={14} className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
    );
};

export const DeliveryStatusCell: React.FC<CellProps> = ({ value }) => {
    const getStatusStyle = (s: string) => {
        if (s === 'Delivered') return 'text-status-success bg-emerald-500/10 border-emerald-500/20';
        if (s === 'Shipped' || s === 'In Transit') return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        if (s === 'Out for Delivery') return 'text-status-warning bg-amber-500/10 border-amber-500/20 animate-pulse';
        return 'text-text-muted bg-surface-alt border-border-subtle';
    };

    const getStatusIcon = (s: string) => {
        if (s === 'Delivered') return <CheckCircle size={16} />;
        if (s === 'Shipped' || s === 'In Transit') return <Package size={16} />;
        if (s === 'Out for Delivery') return <Truck size={16} />;
        return <Clock size={16} />;
    };

    return (
        <span className={`p-1.5 rounded-md border flex items-center justify-center w-fit ${getStatusStyle(value || '')}`} title={value || 'Processing'}>
            {getStatusIcon(value || '')}
        </span>
    );
};

// --- 5. SYSTEM & META (The Data) ---

export const DateCell: React.FC<CellProps> = ({ value }) => (
    <div className="flex flex-col leading-tight group cursor-default">
        <span className="font-bold text-xs text-text-primary whitespace-nowrap group-hover:text-accent-primary transition-colors">
            {new Date(value).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'2-digit'})}
        </span>
        <span className="text-xs opacity-50 flex items-center gap-1 font-mono text-text-muted group-hover:opacity-100 transition-opacity">
            <Clock size={16}/> {new Date(value).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
        </span>
    </div>
);

export const NoteCell: React.FC<CellProps> = ({ value, row, isEditing, onChange }) => {
    if (isEditing) {
        return <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} className="w-full bg-surface-alt border border-border-subtle rounded px-3 py-1.5 text-xs" value={value || ''} onChange={e => onChange(e.target.value)} />;
    }
    
    // Aggregating notes, med conditions, height, and weight
    const medTags = row?.medicalConditions?.length ? `Med: ${row.medicalConditions.join(', ')}` : '';
    const heightWeight = [row?.height, row?.weight].filter(Boolean).join(' / ');
    
    const parts = [value, medTags, heightWeight].filter(Boolean);
    const displayValue = parts.join(' | ');

    if (!displayValue) return <span className="text-text-muted opacity-10 text-xs italic">Empty</span>;

    return (
        <div className="relative group max-w-[180px]">
            <div className="flex items-center gap-1.5 cursor-help">
                <FileText size={16} className="text-accent-primary shrink-0"/>
                <span className="truncate text-xs font-medium text-text-secondary italic group-hover:text-text-primary transition-colors">
                    {displayValue}
                </span>
            </div>
            {/* Tooltip */}
            <div className="absolute left-0 bottom-full mb-2 w-56 p-3 bg-slate-900/95 text-white text-xs rounded-xl border border-border-subtle shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 translate-y-2 group-hover:translate-y-0 ">
                {value && <p className="leading-relaxed mb-2"><span className="text-accent-primary font-bold">Notes:</span> {value}</p>}
                {medTags && <p className="leading-relaxed mb-1"><span className="text-rose-400 font-bold">Medical:</span> {row.medicalConditions.join(', ')}</p>}
                {heightWeight && <p className="leading-relaxed"><span className="text-blue-400 font-bold">Vitals:</span> {heightWeight}</p>}
                <div className="absolute -bottom-1 left-3 w-2 h-2 bg-slate-900 border-b border-r border-border-subtle rotate-45"></div>
            </div>
        </div>
    );
};

export const TagsCell: React.FC<CellProps> = ({ value, row }) => {
    const tags = Array.isArray(value) ? [...value] : [];
    
    if (row && (row.height || row.weight)) {
        const hwInfo = [row.height, row.weight].filter(Boolean).join(' / ');
        tags.unshift(hwInfo);
    }
    
    if (tags.length === 0) return <span className="text-text-muted opacity-20">-</span>;

    return (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
            {tags.slice(0, 2).map((tag: string, i: number) => (
                <span key={i} className="text-sm font-bold px-3 py-1.5 bg-surface-alt rounded-md border border-border-subtle text-text-secondary truncate max-w-[80px] shadow-sm" title={tag}>
                    {tag}
                </span>
            ))}
            {tags.length > 2 && <span className="text-sm text-text-muted font-bold bg-surface-alt px-3 py-1.5 rounded border border-border-subtle">+{tags.length - 2}</span>}
        </div>
    );
};

export const AddressCell: React.FC<CellProps> = ({ value, row, isEditing, onChange }) => {
    if (isEditing) {
        return (
            <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                className="w-full bg-surface-alt border border-border-subtle rounded px-3 py-1.5 text-xs outline-none focus:border-accent-primary"
                value={value || ''} 
                onChange={e => onChange(e.target.value)} 
            />
        );
    }
    
    // Check if we have structured data
    const isShipping = row?.shippingAddress === value && value;
    const isBilling = row?.billingAddress === value && value;
    const isAddress = row?.address === value && value;

    const street = value || '';
    const city = isBilling ? row?.billingCity : (isShipping ? row?.shippingCity : (isAddress ? row?.city : ''));
    const state = isBilling ? row?.billingState : (isShipping ? row?.shippingState : (isAddress ? row?.state : ''));
    const zip = isBilling ? row?.billingZip : (isShipping ? row?.shippingZip : (isAddress ? row?.zip : ''));

    const hasStructured = city || state || zip;

    // Build the full address string if structured
    const fullAddress = hasStructured 
        ? `${street ? street + ', ' : ''}${[city, state].filter(Boolean).join(', ')} ${zip || ''}`.trim()
        : value;

    return (
        <div className="group relative group/cell min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer min-w-0">
                <MapPin size={16} className="text-text-muted group-hover:text-accent-primary transition-colors shrink-0"/>
                <span className="truncate group-hover:text-text-primary transition-colors block">{fullAddress || '-'}</span>
                <CopyBtn text={fullAddress || ''} />
            </div>
            {/* Full Address Tooltip */}
            <div className="absolute left-0 top-full mt-1 w-56 p-3 bg-surface-main border border-border-subtle rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-50 flex flex-col gap-1.5">
                {hasStructured ? (
                     <>
                         <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 px-1 bg-surface-alt py-0.5 rounded w-max">Full Address</div>
                         <div className="font-medium text-xs text-text-primary px-1">{street}</div>
                         <div className="text-xs text-text-secondary px-1">{[city, state].filter(Boolean).join(', ')} {zip}</div>
                     </>
                ) : (
                    <p className="text-xs text-text-primary leading-relaxed">{value}</p>
                )}
            </div>
        </div>
    );
};

export const IdCell: React.FC<CellProps> = ({ value }) => (
    <span className="font-mono text-xs font-bold text-text-muted bg-surface-alt/50 px-3 py-1.5 rounded border border-border-subtle select-none hover:bg-surface-alt hover:text-text-primary transition-colors flex items-center gap-1 group/cell">
        <Hash size={16} /> {value || '-'} <CopyBtn text={value} />
    </span>
);

export const QACell: React.FC<CellProps> = ({ value }) => {
    if (value === undefined || value === null) return <span className="text-xs text-text-muted italic">Pending</span>;
    return (
        <span className={`text-xs font-medium px-2 py-1 flex items-center gap-1 rounded border ${value >= 4 ? 'bg-emerald-500/10 text-status-success border-emerald-500/20' : value === 3 ? 'bg-amber-500/10 text-status-warning border-amber-500/20' : 'bg-red-500/10 text-status-error border-red-500/20'}`}>
            <Star size={12} fill="currentColor"/> {value}/5
        </span>
    );
};

export const DeclineReasonCell: React.FC<CellProps> = ({ value }) => (
    <div className="flex items-center gap-1.5 text-status-error/80 bg-status-error/5 px-2.5 py-1 rounded border border-status-error/10 max-w-fit">
        {value && <AlertCircle size={16} className="shrink-0" strokeWidth={2.5} />}
        <span className="text-sm font-medium tracking-tight truncate flex-1" title={value}>
            {value || '-'}
        </span>
    </div>
);

// --- FALLBACK ---
export const TextCell: React.FC<CellProps> = ({ value, isEditing, onChange }) => {
    if (isEditing) {
        return (
            <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                className="w-full bg-surface-alt border border-border-subtle rounded px-3 py-1.5 text-xs outline-none focus:border-accent-primary"
                value={value || ''} 
                onChange={e => onChange(e.target.value)} 
            />
        );
    }
    const displayValue = decryptField(value, ENCRYPTION_KEY);
    return (
        <div className="flex items-center min-w-0 group/cell" title={displayValue}>
            <span className="text-xs text-text-secondary truncate block">{displayValue || '-'}</span>
            <CopyBtn text={displayValue} />
        </div>
    );
};

// --- NEW CELLS (Added) ---

export const AgentCell: React.FC<CellProps> = ({ value, isEditing, onChange }) => {
    if (isEditing) {
        return <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} className="w-full bg-surface-alt border border-border-subtle rounded px-3 py-1.5 text-xs outline-none focus:border-accent-primary" value={value || ''} onChange={e => onChange(e.target.value)} />;
    }
    return (
        <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-surface-alt border border-border-subtle flex items-center justify-center text-xs font-medium text-text-secondary">
                {(value || '?').charAt(0)}
            </div>
            <span className="text-xs font-bold text-text-primary truncate max-w-[100px]">{value || 'Unknown'}</span>
        </div>
    );
};

export const SpouseCell: React.FC<CellProps> = ({ value, isEditing, onChange }) => {
    if (isEditing) {
        return <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} className="w-full bg-surface-alt border border-border-subtle rounded px-3 py-1.5 text-xs outline-none focus:border-accent-primary" value={value || ''} onChange={e => onChange(e.target.value)} />;
    }
    if (!value) return <span className="text-text-muted opacity-20">-</span>;
    return (
        <div className="flex items-center gap-1.5 text-text-secondary">
            <Heart size={16} className="text-rose-400" fill="currentColor" />
            <span className="text-xs font-medium truncate max-w-[80px]">{value}</span>
        </div>
    );
};

export const DateStringCell: React.FC<CellProps> = ({ value, isEditing, onChange }) => {
    if (isEditing) {
        return <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} type="date" className="w-full bg-surface-alt border border-border-subtle rounded px-3 py-1.5 text-xs outline-none focus:border-accent-primary" value={value || ''} onChange={e => onChange(e.target.value)} />;
    }
    return <span className="text-xs font-mono text-text-secondary">{value || '-'}</span>;
};

export const MediaCell: React.FC<CellProps> = ({ value, row, isEditing, onChange, onAction }) => {
    if (isEditing) {
        return <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} className="w-full bg-surface-alt border border-border-subtle rounded px-3 py-1.5 text-xs outline-none focus:border-accent-primary" value={value || ''} onChange={e => onChange(e.target.value)} placeholder="URL" />;
    }
    if (!value) return (
        <button className="flex items-center gap-1.5 px-2 py-1 bg-surface-alt border border-border-subtle hover:border-accent-primary hover:text-accent-primary text-text-muted rounded text-xs transition-colors shrink-0 whitespace-nowrap" onClick={(e) => { e.stopPropagation(); if (onAction) onAction('upload_recording', row); }}>
            <Music size={12} />
            <span>Upload</span>
        </button>
    );
    
    return (
        <div className="flex items-center gap-2">
             <button onClick={(e) => { e.stopPropagation(); if (onAction) onAction('listen_recording', row); }} className="flex items-center gap-1.5 px-2 py-1 bg-accent-primary/10 text-accent-primary border border-accent-primary/20 hover:bg-accent-primary/20 rounded text-xs transition-colors shrink-0 whitespace-nowrap">
                <Play size={12} />
                <span>Listen</span>
             </button>
        </div>
    );
};
