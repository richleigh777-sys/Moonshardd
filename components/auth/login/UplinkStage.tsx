
import React, { useState } from 'react';
import { Globe, ArrowRight, ArrowLeft, Loader2, User as UserIcon } from 'lucide-react';
import { LoginInput } from './LoginInput';
import { Button } from '../../ui/Base';

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
            <div className="p-4 rounded-xl bg-surface-alt border border-border-subtle flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-surface-main rounded-lg shadow-sm border border-border-subtle"><UserIcon size={16} className="text-text-primary" /></div>
                    <div>
                        <p className="text-sm font-bold text-text-primary">{userId}</p>
                        <p className="text-xs text-text-muted mt-0.5">Authentication verified</p>
                    </div>
                </div>
                <button type="button" onClick={onBack} className="text-text-muted hover:text-text-primary transition-colors text-xs font-bold px-3 py-1.5 hover:bg-surface-main/50 rounded-lg">
                    Change User
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
                <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={onBack}
                    className="h-14 w-14 p-0 flex items-center justify-center rounded-xl hover:bg-surface-main transition-colors border border-border-subtle hover:border-text-muted"
                    disabled={isProcessing}
                >
                    <ArrowLeft size={18} />
                </Button>
                <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={isProcessing || !companyId}
                    className="flex-1 h-14 text-sm font-bold shadow-lg shadow-accent-primary/20 rounded-xl"
                >
                    {isProcessing ? (
                        <span className="flex items-center justify-center gap-2 w-full"><Loader2 size={16} className="animate-spin" /> Accessing Workspace...</span>
                    ) : (
                        <span className="flex items-center justify-center gap-2 w-full">Access Workspace <ArrowRight size={16} /></span>
                    )}
                </Button>
            </div>
        </form>
    );
};
