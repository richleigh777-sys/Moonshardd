import React, { useState } from 'react';
import { 
    Users, FileText, AlertCircle, HeartPulse, CreditCard, Check, Copy, MapPin, Mail 
} from 'lucide-react';
import { Sale } from '../../../types';
import { sfx } from '../../../lib/soundService';
import { PresenceIndicator } from '../../ui/PresenceIndicator';

export const CopyButton = ({ text, label }: { text: string, label: string }) => {
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

export const ExpandedDetail = ({ sale, onAction }: { sale: Sale, onAction: (action: string, payload?: any) => void }) => (
    <div className="bg-surface-alt/30 border-y border-border-subtle p-6 animate-in slide-in-from-top-2 duration-300 relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

        <div className="mb-6 flex items-center justify-between border-b border-border-subtle pb-4 relative z-10">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-primary/10 rounded-xl text-accent-primary">
                    <Users size={18} />
                </div>
                <div>
                    <h4 className="text-sm font-medium text-text-primary tracking-tight">Real-Time Collaboration</h4>
                    <p className="text-xs font-bold text-text-muted  tracking-wide">Active Intelligence Feed</p>
                </div>
            </div>
            <PresenceIndicator resourceId={sale.id} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            
            {/* Sector 1: Interaction & Notes */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h5 className="text-xs font-medium  text-text-primary tracking-wide flex items-center gap-2">
                        <FileText size={16} className="text-accent-primary"/> Narrative
                    </h5>
                    {sale.callSummary && <CopyButton text={sale.callSummary} label="Copy Note" />}
                </div>
                <div className="bg-surface-main p-4 rounded-xl border border-border-subtle shadow-sm relative group">
                    <p className="text-xs font-medium text-text-secondary leading-relaxed italic opacity-90">
                        "{sale.callSummary || 'No intelligence recorded for this interaction.'}"
                    </p>
                    <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-accent-primary/10 to-transparent rounded-bl-2xl"></div>
                </div>
                {sale.declineReason && (
                    <div className="bg-red-500/5 p-3 rounded-xl border border-red-500/20 flex items-start gap-3">
                        <div className="p-1.5 bg-red-500/10 rounded-lg text-status-error"><AlertCircle size={16}/></div>
                        <div>
                             <p className="text-xs font-medium text-status-error  tracking-wide mb-0.5">Decline Protocol</p>
                             <p className="text-xs text-status-error font-medium">{sale.declineReason}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Sector 2: Profile Intelligence */}
            <div className="space-y-4">
                <h5 className="text-xs font-medium  text-text-primary tracking-wide flex items-center gap-2">
                    <HeartPulse size={16} className="text-status-success"/> Bio-Matrix
                </h5>
                <div className="bg-surface-main rounded-xl border border-border-subtle p-1 overflow-hidden shadow-sm">
                    <div className="grid grid-cols-2 divide-x divide-border-subtle/50">
                        <div className="p-3 text-center hover:bg-surface-alt/30 transition-colors">
                            <p className="text-sm font-bold text-text-muted  mb-1">Biological Age</p>
                            <p className="text-lg font-medium text-text-primary num-font">{sale.age ? `${sale.age}` : '--'}</p>
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
                <h5 className="text-xs font-medium  text-text-primary tracking-wide flex items-center gap-2">
                    <CreditCard size={16} className="text-status-warning"/> Vault & Ops
                </h5>
                <div className="bg-surface-main p-4 rounded-xl border border-border-subtle shadow-sm space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-border-subtle/50">
                        <span className="text-xs font-bold text-text-muted ">Provider</span>
                        <span className="text-xs font-medium text-text-primary  flex items-center gap-2">
                            {sale.bankName} <span className="text-text-muted">•</span> {sale.cardProvider}
                        </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-border-subtle/50">
                        <span className="text-xs font-bold text-text-muted ">Amount</span>
                        <span className="text-xs font-medium text-text-primary  num-font tracking-wide">${sale.amount.toFixed(2)}</span>
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
                        <button onClick={() => onAction('approve')} className="flex-1 h-9 bg-status-success hover:bg-emerald-400 text-white font-bold text-xs uppercase tracking-wide rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
                            <Check size={16} strokeWidth={3} /> Approve
                        </button>
                        <button onClick={() => onAction('decline', { reason: 'Administrative Review Failure' })} className="flex-1 h-9 bg-status-error/10 hover:bg-status-error text-status-error hover:text-white font-bold text-xs uppercase tracking-wide rounded-xl transition-all border border-status-error/20 hover:border-status-error flex items-center justify-center gap-2">
                            Declined
                        </button>
                    </div>
                )}
            </div>

        </div>
    </div>
);
