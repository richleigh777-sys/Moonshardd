import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '../ui/Base';
import { useCRM } from '../../hooks/useCRM';
import EnrollmentFormV2 from '../forms/EnrollmentFormV2';
import { sfx } from '../../lib/soundService';
import { ArrowLeft, Target, Key, Phone, Clock, ShoppingCart, RefreshCw, Star, Heart, FileText, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface SmartPitchProps {
    context: any; // The payload from SMART_PITCH event
    currentUser: any;
    onCancel: () => void;
    onSuccess: () => void;
}

export const SmartPitchWorkspace: React.FC<SmartPitchProps> = ({ context, currentUser, onCancel, onSuccess }) => {
    const { scripts } = useCRM();
    const actionType = context?.actionContext?.toLowerCase() || 'inbound';
    
    // Choose the best script
    const bestScript = React.useMemo(() => {
        if (!scripts || scripts.length === 0) return null;
        if (actionType === 'winback') return scripts.find(s => s.tags?.includes('Winback')) || scripts[0];
        if (actionType === 'upsell') return scripts.find(s => s.tags?.includes('Upsell')) || scripts[0];
        if (actionType === 'reorder') return scripts.find(s => s.tags?.includes('Reorder') || s.title.includes('Restock')) || scripts[0];
        if (actionType === 'recovery') return scripts.find(s => s.tags?.includes('Recovery')) || scripts[0];
        return scripts.find(s => s.tags?.includes('Inbound')) || scripts[0];
    }, [scripts, actionType]);

    const getActionColor = () => {
        if (actionType === 'winback') return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
        if (actionType === 'upsell') return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        if (actionType === 'reorder') return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
        if (actionType === 'recovery') return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    };

    const getActionIcon = () => {
        if (actionType === 'winback') return <Heart size={20} className="text-purple-500" />;
        if (actionType === 'upsell') return <Target size={20} className="text-amber-500" />;
        if (actionType === 'reorder') return <RefreshCw size={20} className="text-emerald-500" />;
        if (actionType === 'recovery') return <Key size={20} className="text-indigo-500" />;
        return <Phone size={20} className="text-blue-500" />;
    };

    return (
        <div className="w-full h-full flex flex-col md:flex-row overflow-hidden bg-background">
            {/* Left side: Intelligent CRM Panel (360 View + Script) */}
            <div className="w-full md:w-[400px] lg:w-[500px] h-full flex flex-col border-r border-border-subtle bg-surface-main z-10 shrink-0">
                <div className="p-4 border-b border-border-subtle flex items-center gap-3 shrink-0 bg-surface-alt/50">
                    <button onClick={onCancel} className="p-2 hover:bg-surface-highlight rounded-xl text-text-muted hover:text-text-primary transition-colors">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-text-primary uppercase tracking-tight">{context.customerName || 'Prospect'}</h2>
                            <div className={`px-2 py-0.5 rounded text-sm uppercase font-bold tracking-wider border ${getActionColor()}`}>
                                {actionType}
                            </div>
                        </div>
                        <p className="text-sm text-text-muted flex items-center gap-1 mt-0.5">
                            <Phone size={12} /> {context.phone}
                        </p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Action Engine Directives */}
                    <Card className="bg-surface-highlight border-border-subtle p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 bg-surface-main rounded-xl border border-border-subtle shadow-sm">
                                {getActionIcon()}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-text-primary uppercase">Agent Directive</h3>
                                <p className="text-sm text-text-muted">Automated Strategy Execution</p>
                            </div>
                        </div>
                        <div className="text-sm text-text-secondary leading-relaxed bg-surface-main p-3 rounded-xl border border-border-subtle font-medium">
                            {actionType === 'upsell' && <span>This customer bought recently. Their experience should be positive. Focus on the <strong>Upsell Package</strong> or complimentary products to lock in their routine.</span>}
                            {actionType === 'reorder' && <span>Their 30-day supply is nearly out. The primary goal is to enroll them in a <strong>Subscription</strong> or secure a 3-month supply restock.</span>}
                            {actionType === 'winback' && <span>It's been over 90 days. We need them back. Leverage the highest authorized discount to re-acquire their business. Emphasize new formulations.</span>}
                            {actionType === 'recovery' && <span>Their last payment failed. Ask for an alternate card softly. It's often just a fraud trigger or insufficient funds.</span>}
                            {actionType === 'inbound' && <span>Listen, verify needs, and guide them through a standard 1st-time close. Focus on urgency.</span>}
                            {actionType === 'callbacks' && <span>This is a scheduled follow-up. Acknowledge their time constraint from last call and move straight to value.</span>}
                        </div>
                    </Card>

                    {/* Customer Info 360 */}
                    {context.product && (
                        <Card className="bg-surface-alt border-border-subtle p-4">
                             <div className="flex items-center gap-2 mb-3">
                                <ShoppingCart size={16} className="text-text-muted" />
                                <h3 className="text-sm font-bold text-text-primary uppercase tracking-tight">Recent Purchase History</h3>
                            </div>
                            <div className="bg-surface-main p-3 rounded-xl border border-border-subtle text-sm text-text-secondary">
                                {context.product}
                            </div>
                        </Card>
                    )}

                    {/* Interactive Script Engine */}
                    <Card className="bg-surface-alt border-border-subtle flex-1 flex flex-col min-h-[300px]">
                        <div className="p-3 border-b border-border-subtle flex justify-between items-center bg-surface-highlight/50">
                            <div className="flex items-center gap-2">
                                <FileText size={16} className="text-text-muted"/>
                                <span className="text-sm font-bold uppercase tracking-wide text-text-primary">Live Playbook</span>
                            </div>
                            {bestScript && (
                                <span className="text-sm text-text-muted max-w-[120px] truncate">{bestScript.title}</span>
                            )}
                        </div>
                        <div className="p-4 flex-1 overflow-y-auto">
                            {bestScript ? (
                                <div 
                                    className="prose prose-sm prose-invert max-w-none text-text-secondary custom-html-content"
                                    dangerouslySetInnerHTML={{ __html: bestScript.content }}
                                />
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-text-muted space-y-2">
                                    <FileText size={24} className="opacity-20" />
                                    <span className="text-sm uppercase font-semibold">No active playbook</span>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Right side: Enrollment Form */}
            <div className="flex-1 h-full min-w-0 bg-surface-highlight flex flex-col relative overflow-hidden">
                {/* Visual Connector / Arrow */}
                <div className="hidden md:flex absolute left-[-16px] top-8 z-20 w-8 h-8 bg-surface-main border border-border-subtle rounded-full items-center justify-center shadow-lg">
                    <ChevronRight size={16} className="text-text-muted" />
                </div>
                
                <div className="flex-1 h-full overflow-hidden w-full relative">
                    {/* We re-key EnrollmentFormV2 to force it to re-mount with new prefills if lead changes */}
                    <EnrollmentFormV2 
                        key={context.id || context.phone}
                        currentUser={currentUser}
                        prefillPhone={context.phone}
                        onSuccess={onSuccess}
                        onCancel={onCancel}
                    />
                </div>
            </div>
        </div>
    );
};
