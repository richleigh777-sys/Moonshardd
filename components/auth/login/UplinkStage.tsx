import React, { useState } from 'react';
import { Globe, ArrowRight, ArrowLeft, Loader2, User as UserIcon } from 'lucide-react';
import { LoginInput } from './LoginInput';

interface UplinkStageProps {
    userId: string;
    onBack: () => void;
    onSubmit: (cid: string) => void;
    isProcessing: boolean;
}

export const UplinkStage: React.FC<UplinkStageProps> = ({ userId, onBack, onSubmit, isProcessing }) => {
    const [companyId, setCompanyId] = useState('srv-001'); // Provide helpful default
    const [activeField, setActiveField] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (companyId) onSubmit(companyId);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            
            <div className="p-4 rounded-[14px] bg-[#05110A] border border-emerald-500/20 flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-950/50 rounded-lg shadow-sm border border-emerald-500/20 text-emerald-400">
                        <UserIcon size={16} strokeWidth={2} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white tracking-wide">{userId}</p>
                        <p className="text-[11px] text-emerald-100/50 uppercase tracking-widest mt-0.5">Verified</p>
                    </div>
                </div>
                <button type="button" onClick={onBack} className="text-emerald-100/40 hover:text-white transition-colors text-xs font-semibold px-3 py-1.5 hover:bg-white/5 rounded-lg">
                    Change
                </button>
            </div>

            <div className="space-y-4">
                <LoginInput 
                    icon={Globe} 
                    value={companyId} 
                    onChange={(e) => setCompanyId(e.target.value)} 
                    onFocus={() => setActiveField('cid')}
                    onBlur={() => setActiveField(null)}
                    isActive={activeField === 'cid'}
                    placeholder="Organization ID (e.g., srv-001)" 
                    autoFocus
                    disabled={isProcessing}
                />
            </div>

            <div className="flex gap-3 pt-2">
                <button 
                    type="button" 
                    onClick={onBack}
                    className="h-12 w-14 p-0 flex items-center justify-center rounded-[14px] bg-[#05110A] text-white hover:bg-[#07180E] transition-colors border border-emerald-500/20 hover:border-emerald-500/40"
                    disabled={isProcessing}
                >
                    <ArrowLeft size={18} />
                </button>
                <button 
                    type="submit" 
                    disabled={isProcessing || !companyId}
                    className="flex-1 h-12 flex items-center justify-center gap-2 text-sm font-semibold bg-[#10b981] hover:bg-[#059669] text-[#022c22] rounded-[14px] transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isProcessing ? (
                        <><Loader2 size={16} className="animate-spin" /> Accessing...</>
                    ) : (
                        <>Access Workspace <ArrowRight size={16} strokeWidth={2.5} /></>
                    )}
                </button>
            </div>
        </form>
    );
};
