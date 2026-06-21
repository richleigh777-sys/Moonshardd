import React from 'react';
import { Check } from 'lucide-react';

interface Props {
    formData: any;
    cart: any[];
}

export const ValidationSummary: React.FC<Props> = ({ formData, cart }) => {
    const checks = [
        { label: 'Name', status: formData.fullName?.length > 3 },
        { label: 'Phone', status: formData.phone?.length >= 14 },
        { label: 'Address', status: formData.shippingAddress?.length > 10 },
        { label: 'Cart', status: cart.length > 0 }
    ];

    const completedCount = checks.filter(c => c.status).length;
    const totalCount = checks.length;
    const percent = Math.round((completedCount / totalCount) * 100);
    const isReady = percent === 100;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isReady ? 'bg-emerald-400 shadow-sm' : 'bg-amber-400 shadow-sm animate-pulse'}`}></div>
                    <span className="text-sm font-medium text-text-primary  tracking-wide drop-shadow-sm">System Status</span>
                </div>
                <span className={`text-sm font-mono font-medium ${isReady ? 'text-status-success shadow-sm' : 'text-status-warning shadow-sm'}`}>
                    {percent}%
                </span>
            </div>

            <div className="h-2 w-full bg-surface-alt/50 rounded-full overflow-hidden border border-border-subtle">
                <div 
                    className={`h-full rounded-full transition-all duration-700 ease-out ${isReady ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-sm' : 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-sm'}`}
                    style={{ width: `${percent}%` }}
                ></div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
                {checks.map((check, i) => (
                    <div 
                        key={i} 
                        className={`flex items-center gap-3 text-sm font-medium  tracking-wide ${
                            check.status ? 'text-status-success' : 'text-zinc-600'
                        }`}
                    >
                        {check.status ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-status-success/50 flex items-center justify-center shadow-sm">
                                <Check size={12} strokeWidth={3} className="shadow-sm" />
                            </div>
                        ) : (
                            <div className="w-5 h-5 rounded-full border border-border-subtle bg-surface-alt/30"></div>
                        )}
                        {check.label}
                    </div>
                ))}
            </div>
        </div>
    );
};