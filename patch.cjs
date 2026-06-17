const fs = require('fs');

let code = fs.readFileSync('components/modals/CustomerProfileModal.tsx', 'utf8');

const target = `                    <div className="space-y-3">
                        <h4 className="text-[10px] uppercase font-[700] text-text-primary flex items-center gap-2 tracking-widest">
                            <Shield size={12} className="text-accent-primary"/> Medical Context
                        </h4>
                        <div className="p-4 glass-panel rounded-xl min-h-[88px] flex flex-wrap content-start gap-2 shadow-inner">
                            {customerHistory.length > 0 && customerHistory[0].medicalConditions && customerHistory[0].medicalConditions.length > 0 ? (
                                customerHistory[0].medicalConditions.map((c, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-surface-alt rounded border border-border-subtle text-[11px] font-[700] tracking-wide text-text-primary flex items-center gap-1.5 shadow-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-accent-primary"></div>
                                        {c}
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs text-text-muted italic flex items-center gap-2 opacity-60">
                                    <AlertTriangle size={16}/> No conditions tagged.
                                </span>
                            )}
                        </div>
                    </div>`;

const replacement = `                    <div className="space-y-3">
                        <h4 className="text-[10px] uppercase font-[700] text-text-primary flex items-center gap-2 tracking-widest">
                            <Shield size={12} className="text-accent-primary"/> Medical Context
                        </h4>
                        <div className="p-4 glass-panel rounded-xl min-h-[88px] flex flex-wrap content-start gap-2 shadow-inner">
                            {customerHistory.length > 0 && customerHistory[0].medicalConditions && customerHistory[0].medicalConditions.length > 0 ? (
                                customerHistory[0].medicalConditions.map((c, i) => (
                                    <span key={i} className="px-3 py-1 bg-rose-500/10 rounded border border-rose-500/20 text-[11px] font-[700] tracking-wide text-rose-500 flex items-center gap-1.5">
                                        <div className="w-1 h-1 rounded-full bg-rose-500"></div>
                                        {c}
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs text-text-muted italic flex items-center gap-2 opacity-60">
                                    <HeartPulse size={12}/> No conditions.
                                </span>
                            )}
                        </div>
                    </div>
                    
                    <div className="space-y-3 md:col-span-2">
                        <h4 className="text-[10px] uppercase font-[700] text-text-primary flex items-center gap-2 tracking-widest">
                            <Tag size={12} className="text-purple-500"/> Global CRM Tags & Pipeline Data
                        </h4>
                        <div className="p-4 glass-panel rounded-xl min-h-[88px] flex flex-wrap content-start gap-2 shadow-inner">
                            {customerHistory.length > 0 && customerHistory[0].crmTags && customerHistory[0].crmTags.length > 0 ? (
                                customerHistory[0].crmTags.map((c, i) => (
                                    <span key={i} className="px-3 py-1 bg-purple-500/10 rounded border border-purple-500/20 text-[11px] font-[700] tracking-wide text-purple-400 flex items-center gap-1.5">
                                        <Tag size={10}/>
                                        {c}
                                    </span>
                                ))
                            ) : null}
                            
                            {customerHistory.length > 0 && customerHistory[0].leadSources && customerHistory[0].leadSources.length > 0 ? (
                                customerHistory[0].leadSources.map((c, i) => (
                                    <span key={i} className="px-3 py-1 bg-blue-500/10 rounded border border-blue-500/20 text-[11px] font-[700] tracking-wide text-blue-400 flex items-center gap-1.5">
                                        <Network size={10}/>
                                        {c}
                                    </span>
                                ))
                            ) : null}
                            
                            {customerHistory.length > 0 && customerHistory[0].pipelineStages && customerHistory[0].pipelineStages.length > 0 ? (
                                customerHistory[0].pipelineStages.map((c, i) => (
                                    <span key={i} className="px-3 py-1 bg-amber-500/10 rounded border border-amber-500/20 text-[11px] font-[700] tracking-wide text-amber-400 flex items-center gap-1.5">
                                        <Layers size={10}/>
                                        {c}
                                    </span>
                                ))
                            ) : null}

                            {(!customerHistory[0]?.crmTags?.length && !customerHistory[0]?.leadSources?.length && !customerHistory[0]?.pipelineStages?.length) ? (
                                <span className="text-xs text-text-muted italic flex items-center gap-2 opacity-60">
                                    <AlertTriangle size={12}/> No CRM tags assigned.
                                </span>
                            ) : null}
                        </div>
                    </div>`;

code = code.replace(target, replacement);

if(code.indexOf('HeartPulse') === -1) {
    code = code.replace(
        "import { User, ShoppingBag, Clock, Shield, Mail, Phone, MapPin, TrendingUp, Award, Calendar, Activity, AlertTriangle, ArrowUpRight, Zap, Link, Eye, EyeOff, UserIcon, FileText, ChevronDown, ChevronRight, CheckCircle2, Ticket, MessageSquare, PhoneOff } from 'lucide-react';",
        "import { User, ShoppingBag, Clock, Shield, Mail, Phone, MapPin, TrendingUp, Award, Calendar, Activity, AlertTriangle, ArrowUpRight, Zap, Link, Eye, EyeOff, UserIcon, FileText, ChevronDown, ChevronRight, CheckCircle2, Ticket, MessageSquare, PhoneOff, HeartPulse, Tag, Network, Layers } from 'lucide-react';"
    );
}

fs.writeFileSync('components/modals/CustomerProfileModal.tsx', code);
console.log('Update success');
