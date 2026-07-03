import React, { useRef, useEffect } from 'react';
import { Check, XCircle, Edit, Star, User, Copy, CopyPlus } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

interface ContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    onAction: (a: string) => void;
    saleId: string;
    allowActions: boolean;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, onAction, allowActions }) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const { currentUser } = useAuth();
    useEffect(() => {
        const handleClick = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose(); };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [onClose]);

    return (
        <div ref={menuRef} style={{ top: y, left: x }} className="fixed z-[100] w-48 bg-surface-main/95 backdrop-blur-xl border border-border-subtle rounded-xl shadow-2xl p-1.5 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-200">
            {allowActions && (
                <>
                    <button onClick={() => onAction('approve')} className="flex items-center gap-3 px-3 py-2 hover:bg-emerald-500/10 text-text-primary hover:text-status-success rounded-lg transition-all text-xs font-bold text-left group">
                        <Check size={16} className="text-text-muted group-hover:text-status-success"/> Approve Order
                    </button>
                    <button onClick={() => onAction('decline')} className="flex items-center gap-3 px-3 py-2 hover:bg-rose-500/10 text-text-primary hover:text-rose-500 rounded-lg transition-all text-xs font-bold text-left group">
                        <XCircle size={16} className="text-text-muted group-hover:text-rose-500"/> Decline Order
                    </button>
                    <div className="h-px bg-border-subtle mx-2 my-1"></div>
                    <button onClick={() => onAction('update')} className="flex items-center gap-3 px-3 py-2 hover:bg-surface-alt text-text-primary rounded-lg transition-all text-xs font-bold text-left group">
                        <Edit size={16} className="text-text-muted group-hover:text-accent-primary"/> Edit Record
                    </button>
                    <button onClick={() => onAction('qa')} className="flex items-center gap-3 px-3 py-2 hover:bg-surface-alt text-text-primary rounded-lg transition-all text-xs font-bold text-left group">
                        <Star size={16} className="text-text-muted group-hover:text-status-warning"/> QA Review
                    </button>
                    {currentUser?.level === 10 && (
                        <>
                        <button onClick={() => onAction('duplicate_row')} className="flex items-center gap-3 px-3 py-2 hover:bg-surface-alt text-text-primary rounded-lg transition-all text-xs font-bold text-left group">
                            <CopyPlus size={16} className="text-text-muted group-hover:text-accent-primary"/> Duplicate Row
                        </button>
                        <button onClick={() => onAction('copy_row')} className="flex items-center gap-3 px-3 py-2 hover:bg-surface-alt text-text-primary rounded-lg transition-all text-xs font-bold text-left group">
                            <Copy size={16} className="text-text-muted group-hover:text-accent-primary"/> Copy to Sheets
                        </button>
                        </>
                    )}
                    <div className="h-px bg-border-subtle mx-2 my-1"></div>
                </>
            )}
            <button onClick={() => onAction('view_profile')} className="flex items-center gap-3 px-3 py-2 hover:bg-surface-alt text-text-primary rounded-lg transition-all text-xs font-bold text-left group">
                <User size={16} className="text-text-muted group-hover:text-accent-primary"/> View Profile
            </button>
             <button onClick={() => onAction('copy_id')} className="flex items-center gap-3 px-3 py-2 hover:bg-surface-alt text-text-primary rounded-lg transition-all text-xs font-bold text-left group">
                <Copy size={16} className="text-text-muted group-hover:text-accent-primary"/> Copy ID
            </button>
        </div>
    );
};
