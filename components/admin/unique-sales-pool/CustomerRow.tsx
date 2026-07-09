import React from 'react';
import { Customer, Sale } from '../../../types';
import { executeDialer } from '../../../lib/dialer';
import { useCRM } from '../../../hooks/useCRM';
import { ChevronUp, Phone, Mail, MapPin, CreditCard, Edit3, Trash2, Clock } from 'lucide-react';
import { sfx } from '../../../lib/soundService';

interface CustomerRowProps {
    customer: Customer;
    metrics: any;
    isExpanded: boolean;
    toggleRow: (id: string) => void;
    setEditingCustomer: (customer: any) => void;
    handleDelete: (id: string, name: string) => void;
}

export const CustomerRow: React.FC<CustomerRowProps> = ({
    customer,
    metrics,
    isExpanded,
    toggleRow,
    setEditingCustomer,
    handleDelete
}) => {
    const { systemConfig } = useCRM();
    const medConditionsList = customer.medicalConditions || [];
    const ageVal = customer.age || '—';
    const heightVal = customer.height || '—';
    const weightVal = customer.weight || '—';
    const dobVal = customer.dob || '—';
    const middleInit = (customer as any).middleInitial ? `${(customer as any).middleInitial}. ` : '';
    const fullNameWithMI = `${customer.firstName || ''} ${middleInit}${customer.lastName || ''}`.trim() || customer.name || 'Unknown';
    
    // Precomputed dynamic properties derived on the fly from reactive sales ledger
    const dynamicLtv = metrics?.ltv ?? customer.ltv ?? 0;
    const dynamicOrderCount = metrics?.orderCount ?? customer.orderCount ?? 0;
    const isVip = dynamicLtv >= 1000;

    const playClick = () => sfx.playClick();

    return (
        <React.Fragment>
            <tr className={`hover:bg-surface-alt/40 transition-colors group cursor-pointer ${isExpanded ? 'bg-surface-alt/20 shadow-inner' : ''}`} onClick={() => toggleRow(customer.id)}>
                {/* Name / Identifiers */}
                <td className="sticky left-0 z-20 bg-surface-main group-hover:bg-surface-alt/90 px-3 py-2 shadow-[1px_0_0_var(--border-subtle)] min-w-[300px]">
                    <div className="flex items-center gap-3">
                        <div 
                            onClick={(e) => { e.stopPropagation(); toggleRow(customer.id); }}
                            className="w-8 h-8 rounded-full bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-sm font-bold text-accent-primary hover:bg-accent-primary/20 transition-all shrink-0"
                        >
                            {isExpanded ? <ChevronUp size={14} /> : (customer.firstName || 'C')[0]}
                        </div>
                        <div>
                            <div className="font-bold text-text-primary flex items-center gap-1.5 leading-tight">
                                {fullNameWithMI}
                                {isVip && (
                                    <span className="text-sm font-bold bg-status-warning/10 border border-status-warning/20 text-status-warning px-1.5 py-0.5 rounded-full uppercase tracking-wider">VIP</span>
                                )}
                            </div>
                            <span className="text-sm font-mono font-medium text-text-muted uppercase">UID: {customer.id}</span>
                        </div>
                    </div>
                </td>

                {/* Direct Contact */}
                <td className="px-3 py-2 min-w-[160px]" onClick={(e) => e.stopPropagation()}>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-text-secondary font-bold font-mono">
                            <Phone size={12} className="text-accent-primary/60" />
                            {customer.phone ? <span className="hover:text-accent-primary hover:underline transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); executeDialer(customer.phone, customer, systemConfig); }}>{customer.phone}</span> : '—'}
                        </div>
                        {customer.email && (
                            <div className="flex items-center gap-2 text-sm text-text-muted font-medium">
                                <Mail size={12} className="text-accent-primary/60" />
                                {customer.email}
                            </div>
                        )}
                        {(customer as any).alternatePhone && (
                            <div className="flex items-center gap-2 text-sm text-text-muted font-mono font-semibold">
                                <Phone size={10} className="text-status-success/50" />
                                ALT: {(customer as any).alternatePhone}
                            </div>
                        )}
                    </div>
                </td>

                {/* Age, DOB, Vitals */}
                <td className="px-3 py-2 min-w-[160px]" onClick={(e) => e.stopPropagation()}>
                    <div className="space-y-1">
                        <div className="text-sm font-semibold text-text-secondary">
                            Age: <span className="font-bold text-text-primary">{ageVal}</span>
                        </div>
                        <div className="text-sm font-mono text-text-muted">
                            DOB: {dobVal}
                        </div>
                        <div className="flex items-center gap-3 text-sm font-semibold text-text-muted">
                            <span>H: <span className="text-text-primary">{heightVal}</span></span>
                            <span>W: <span className="text-text-primary">{weightVal}</span></span>
                        </div>
                    </div>
                </td>

                {/* Medical profile */}
                <td className="px-3 py-2 max-w-[200px]" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-col gap-1 max-h-[60px] overflow-y-auto custom-scrollbar pr-1">
                        {medConditionsList.length === 0 && !(customer.crmTags?.length) && !(customer.pipelineStages?.length) ? (
                            <span className="text-[11px] font-medium text-text-muted italic">No declarations</span>
                        ) : (
                            <div className="flex flex-wrap gap-1">
                                {medConditionsList.map((m, idx) => (
                                    <span key={'med'+idx} className="text-[9px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-500">
                                        {m}
                                    </span>
                                ))}
                                {(customer.crmTags || []).map((m, idx) => (
                                    <span key={'crm'+idx} className="text-[9px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400">
                                        {m}
                                    </span>
                                ))}
                                {(customer.pipelineStages || []).map((m, idx) => (
                                    <span key={'pipe'+idx} className="text-[9px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
                                        {m}
                                    </span>
                                ))}
                                {(customer.leadSources || []).map((m, idx) => (
                                    <span key={'lead'+idx} className="text-[9px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                        {m}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </td>

                {/* Locations */}
                <td className="px-3 py-2 max-w-[260px]" onClick={(e) => e.stopPropagation()}>
                    <div className="space-y-1.5 text-sm">
                        {customer.shippingAddress ? (
                            <div className="flex items-start gap-1">
                                <MapPin size={11} className="text-accent-primary mt-0.5 shrink-0" />
                                <span className="text-text-secondary line-clamp-1">
                                    <b className="text-sm text-accent-primary font-bold">SHIP:</b> {customer.shippingAddress}{customer.shippingApt ? `, Apt ${customer.shippingApt}` : ''}, {customer.shippingCity || ''}, {customer.shippingState || ''} {customer.shippingZip || ''}
                                </span>
                            </div>
                        ) : (
                            <div className="text-sm text-text-muted italic">No shipping location saved</div>
                        )}

                        {customer.billingAddress ? (
                            <div className="flex items-start gap-1">
                                <CreditCard size={11} className="text-status-success mt-0.5 shrink-0" />
                                <span className="text-text-secondary line-clamp-1">
                                    <b className="text-sm text-status-success font-bold">BILL:</b> {customer.billingAddress}{customer.billingApt ? `, Apt ${customer.billingApt}` : ''}, {customer.billingCity || ''}, {customer.billingState || ''} {customer.billingZip || ''}
                                </span>
                            </div>
                        ) : (
                            <div className="text-sm text-text-muted italic">No billing location saved</div>
                        )}
                    </div>
                </td>

                {/* Cumulative metrics */}
                <td className="px-3 py-2 text-right font-medium">
                    <div className="text-sm font-bold text-text-primary">
                        ${dynamicLtv || 0}
                    </div>
                    <div className="text-sm font-mono text-text-muted uppercase">
                        Orders: {dynamicOrderCount || 0}
                    </div>
                    {/* Latest transaction outcome status */}
                    {metrics?.lastStatus && metrics.lastStatus !== 'None' && (
                        <div className="mt-1 flex items-center justify-end">
                            <span className={`text-[8px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded ${
                                metrics.lastStatus === 'Approved' ? 'bg-status-success/10 text-status-success border border-status-success/20' :
                                metrics.lastStatus === 'Declined' ? 'bg-status-error/10 text-status-error border border-status-error/20' :
                                'bg-status-warning/10 text-status-warning border border-status-warning/20'
                            }`}>
                                LAST: {metrics.lastStatus}
                            </span>
                        </div>
                    )}
                </td>

                {/* Actions */}
                <td className="px-3 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1.5">
                        <button 
                            onClick={() => { 
                                playClick(); 
                                setEditingCustomer({ 
                                    ...customer, 
                                    medicalConditionsString: medConditionsList.join(', '),
                                    crmTagsString: (customer.crmTags || []).join(', '),
                                    leadSourcesString: (customer.leadSources || []).join(', '),
                                    pipelineStagesString: (customer.pipelineStages || []).join(', ')
                                } as any); 
                            }}
                            className="p-1.5 border border-border-subtle bg-surface-alt hover:border-accent-primary/40 hover:text-accent-primary rounded-lg transition-all"
                            title="Modify customer record"
                        >
                            <Edit3 size={13} />
                        </button>
                        <button 
                            onClick={() => handleDelete(customer.id, fullNameWithMI)}
                            className="p-1.5 border border-border-subtle bg-surface-alt hover:border-status-error/40 hover:text-status-error rounded-lg transition-all"
                            title="Erase customer permanently"
                        >
                            <Trash2 size={13} />
                        </button>
                    </div>
                </td>
            </tr>

            {/* Expandable Transact Timeline Drawer Panel */}
            {isExpanded && (
                <tr className="bg-surface-alt/10">
                    <td colSpan={7} className="px-3 py-2">
                        <div
                            className="overflow-hidden border border-border-subtle rounded-xl bg-surface-main/80 p-3 space-y-2 shadow-inner"
                            id={`expanded-ledger-${customer.id}`}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-left">
                                {/* Left Column: List of transaction attempts */}
                                <div className="md:col-span-7 space-y-3">
                                    <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                                        <h4 className="text-sm font-bold text-text-primary tracking-wider uppercase flex items-center gap-1.5">
                                            <Clock size={13} className="text-accent-primary" />
                                            Transaction History & Attempts ({metrics?.sales.length || 0})
                                        </h4>
                                        <span className="text-sm font-mono text-text-muted">Direct Phone: {customer.phone}</span>
                                    </div>

                                    <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1.5">
                                        {metrics?.sales && metrics.sales.length > 0 ? (
                                            metrics.sales.map((sale: Sale) => {
                                                const isApproved = sale.status === 'Approved';
                                                const isDeclined = sale.status === 'Declined';
                                                return (
                                                    <div 
                                                        key={sale.id} 
                                                        className={`border p-3 rounded-xl flex items-center justify-between text-sm transition-colors bg-surface-alt/70 ${
                                                            isApproved ? 'border-status-success/20 bg-status-success/5' : 
                                                            isDeclined ? 'border-status-error/20 bg-status-error/5' : 
                                                            'border-border-subtle'
                                                        }`}
                                                    >
                                                        <div className="flex flex-col gap-1 w-full">
                                                            <div className="flex justify-between items-center w-full">
                                                                <span className="font-bold text-text-primary truncate" style={{ maxWidth: '280px' }} title={sale.product}>{sale.product}</span>
                                                                <span className="font-bold font-mono text-text-primary">${sale.amount}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between mt-0.5">
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`text-[9px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded border ${
                                                                        isApproved ? 'bg-status-success/10 text-status-success border-status-success/30' : 
                                                                        isDeclined ? 'bg-status-error/10 text-status-error border-status-error/30' : 
                                                                        'bg-status-warning/10 text-status-warning border-status-warning/30'
                                                                    }`}>
                                                                        {sale.status}
                                                                    </span>
                                                                    <span className="text-[11px] font-mono font-medium text-text-muted opacity-80 uppercase flex items-center gap-1">
                                                                        Source: <span className="text-text-secondary">{sale.sourceType || 'Pipeline'}</span>
                                                                    </span>
                                                                </div>
                                                                <span className="text-[11px] text-text-muted font-mono">{sale.timestamp && !isNaN(new Date(sale.timestamp).getTime()) ? new Date(sale.timestamp).toLocaleString() : 'N/A'}</span>
                                                            </div>
                                                            {sale.declineReason && (
                                                                <div className="text-[11px] font-medium text-status-error italic truncate mt-1">
                                                                    Reason: {sale.declineReason}
                                                                </div>
                                                            )}
                                                            {sale.agent && (
                                                                <div className="text-[10px] text-text-muted flex justify-between mt-1">
                                                                    <span>Agent: {sale.agent}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center py-5 text-text-muted text-sm italic border border-dashed border-border-subtle rounded-xl bg-surface-alt/20">
                                                No direct ledger hits on file matching this customer ID or phone number.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Column: Detailed Customer Info Extract */}
                                <div className="md:col-span-5 flex flex-col h-full bg-surface-main p-4 rounded-xl shadow-inner border border-border-subtle/50">
                                    <h4 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2 mb-3 tracking-wider uppercase flex justify-between items-center">
                                        Profile Snapshot
                                        <button className="text-accent-primary hover:underline hover:text-accent-secondary transition-colors text-[11px]" onClick={(e) => { e.stopPropagation(); setEditingCustomer({...customer, medicalConditionsString: medConditionsList.join(', '), crmTagsString: (customer.crmTags || []).join(', '), leadSourcesString: (customer.leadSources || []).join(', '), pipelineStagesString: (customer.pipelineStages || []).join(', ')} as any); }}>
                                            [ Edit Profile ]
                                        </button>
                                    </h4>
                                    
                                    <div className="space-y-4 flex-1 text-sm font-medium">
                                        <div>
                                            <div className="text-[10px] text-text-muted tracking-wider uppercase mb-0.5">Contact Origination</div>
                                            <div className="text-text-primary">{customer.firstSource || 'Manual CRM Import'}</div>
                                            <div className="text-[11px] text-text-secondary font-mono mt-0.5">Created: {customer.createdAt && !isNaN(new Date(customer.createdAt).getTime()) ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}</div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-[10px] text-text-muted tracking-wider uppercase mb-0.5">Phone Lines</div>
                                                <div className="text-text-primary font-mono">{customer.phone}</div>
                                                {(customer as any).alternatePhone && <div className="text-text-secondary font-mono text-[11px] mt-0.5">ALT: {(customer as any).alternatePhone}</div>}
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-text-muted tracking-wider uppercase mb-0.5">Emails</div>
                                                <div className="text-text-primary break-all">{customer.email || 'None'}</div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-[10px] text-text-muted tracking-wider uppercase mb-1">CRM Taxonomies & Lifecycle</div>
                                            <div className="flex flex-wrap gap-1.5 mt-1">
                                                {(customer.crmTags || []).map((t, idx) => (
                                                    <span key={'c'+idx} className="px-2 py-0.5 rounded-sm bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold tracking-wide uppercase">{t}</span>
                                                ))}
                                                {(customer.pipelineStages || []).map((t, idx) => (
                                                    <span key={'p'+idx} className="px-2 py-0.5 rounded-sm bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold tracking-wide uppercase">{t}</span>
                                                ))}
                                                {(customer.leadSources || []).map((t, idx) => (
                                                    <span key={'l'+idx} className="px-2 py-0.5 rounded-sm bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold tracking-wide uppercase">{t}</span>
                                                ))}
                                                {!(customer.crmTags?.length) && !(customer.pipelineStages?.length) && !(customer.leadSources?.length) && (
                                                    <span className="text-[11px] text-text-muted italic">No custom categories applied.</span>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-[10px] text-text-muted tracking-wider uppercase mb-1">Addresses History</div>
                                            <div className="text-text-primary text-[12px] leading-snug">
                                                {customer.shippingAddress || customer.billingAddress ? (
                                                    <div className="space-y-1">
                                                        {customer.shippingAddress && (
                                                            <div>
                                                                <span className="text-accent-primary font-bold">SHIP:</span> {customer.shippingAddress}{customer.shippingApt ? `, Apt ${customer.shippingApt}` : ''}, {customer.shippingCity}, {customer.shippingState} {customer.shippingZip}
                                                            </div>
                                                        )}
                                                        {customer.billingAddress && (
                                                            <div>
                                                                <span className="text-status-success font-bold">BILL:</span> {customer.billingAddress}{customer.billingApt ? `, Apt ${customer.billingApt}` : ''}, {customer.billingCity}, {customer.billingState} {customer.billingZip}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : <span className="italic text-text-muted">None saved.</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-border-subtle flex justify-between items-center text-[11px] font-mono text-text-muted">
                                        <span>System UID</span>
                                        <span>{customer.id}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </React.Fragment>
    );
};
