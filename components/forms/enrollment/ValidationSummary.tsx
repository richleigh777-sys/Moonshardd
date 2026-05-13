import React from 'react';
import { Check } from 'lucide-react';

interface Props {
    formData: any;
    financials: any;
    cart: any[];
    cardStatus: string;
}

export const ValidationSummary: React.FC<Props> = ({ formData, financials, cart, cardStatus }) => {
    const checks = [
        { label: 'Identity', status: formData.fullName?.length > 3 },
        { label: 'Comms', status: formData.phone?.length >= 14 },
        { label: 'Target', status: formData.shippingAddress?.length > 10 },
        { label: 'Payload', status: cart.length > 0 },
        { label: 'Vault', status: cardStatus === 'valid' },
        { label: 'Cipher', status: financials.cardCvv?.length >= 3 }
    ];

    const completedCount = checks.filter(c => c.status).length;
    const totalCount = checks.length;
    const percent = Math.round((completedCount / totalCount) * 100);
    const isReady = percent === 100;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isReady ? 'bg-emerald-500 shadow-[0_0_8px_#10B981]' : 'bg-amber-500 animate-pulse'}`}></div>
                    <span className="text-xs font-bold text-white uppercase tracking-wide">System Status</span>
                </div>
                <span className={`text-xs font-mono font-bold ${isReady ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {percent}%
                </span>
            </div>

            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all duration-500 ${isReady ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${percent}%` }}
                ></div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                {checks.map((check, i) => (
                    <div 
                        key={i} 
                        className={`flex items-center gap-2 text-[10px] font-medium uppercase tracking-wide ${
                            check.status ? 'text-emerald-500' : 'text-zinc-600'
                        }`}
                    >
                        {check.status ? <Check size={12} strokeWidth={3} /> : <div className="w-3 h-3 rounded-full border border-zinc-700"></div>}
                        {check.label}
                    </div>
                ))}
            </div>
        </div>
    );
};