import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { maskPII } from '../../utils/security';
import { useAuth } from '../../hooks/useAuth';

interface MaskedDataProps {
    value: string;
    type?: 'phone' | 'email' | 'text';
}

export const MaskedData: React.FC<MaskedDataProps> = ({ value, type = 'phone' }) => {
    const { currentUser } = useAuth();
    const isSuperAdmin = (currentUser?.level || 0) >= 10;
    const [revealed, setRevealed] = useState(isSuperAdmin);

    // Auto-hide when unmounted or lost focus (optional)
    useEffect(() => {
        if (!isSuperAdmin) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setRevealed(false);
        }
    }, [value, isSuperAdmin]);

    if (!value) return <span>---</span>;

    const displayValue = revealed ? value : maskPII(value, type);

    if (isSuperAdmin) {
        return <span className="font-mono">{value}</span>;
    }

    return (
        <div className="flex items-center gap-2 group select-none">
            <span className="font-mono">{displayValue}</span>
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    if (!revealed) {
                        try {
                            const now = Date.now();
                            const cacheKey = `reveal_tracker_${currentUser?.id}`;
                            const history: number[] = JSON.parse(localStorage.getItem(cacheKey) || '[]');
                            const oneHourAgo = now - 60 * 60 * 1000;
                            const recent = history.filter(t => t > oneHourAgo);
                            recent.push(now);
                            localStorage.setItem(cacheKey, JSON.stringify(recent));

                            if (recent.length > 20) {
                                // Silent alert logic to Level 10 could be dispatched here
                                window.dispatchEvent(new CustomEvent('DLP_ALERT', { 
                                    detail: { 
                                        type: 'EXCESSIVE_REVEAL', 
                                        user: currentUser?.name, 
                                        count: recent.length 
                                    } 
                                }));
                            }
                        } catch (err) { /* silent fail */ }
                    }
                    setRevealed(!revealed);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 bg-surface-alt hover:bg-surface-main border border-border-subtle rounded transition-all text-text-muted hover:text-accent-primary"
            >
                {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
        </div>
    );
};
