import React, { useContext, useMemo } from 'react';
import { CRMContext } from '../../context/CRMContextCore';
import { Eye, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PresenceIndicatorProps {
    resourceId: string;
    className?: string;
    showText?: boolean;
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({ 
    resourceId, 
    className = "",
    showText = true
}) => {
    const context = useContext(CRMContext);
    
    const presence = context?.presence;
    const currentUserId = context?.currentUser?.id;

    const activeUsers = useMemo(() => {
        if (!presence || !currentUserId) return [];
        return presence.filter(p => 
            p.resourceId === resourceId && 
            p.userId !== currentUserId
        );
    }, [presence, currentUserId, resourceId]);

    if (activeUsers.length === 0) return null;

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="flex -space-x-2 overflow-hidden">
                <AnimatePresence>
                    {activeUsers.map((p) => (
                        <motion.div
                            key={p.userId}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="relative group"
                        >
                            <div className={`w-6 h-6 rounded-full border-2 border-surface-main flex items-center justify-center text-xs font-[700] shadow-sm transition-transform hover:scale-110 cursor-help ${
                                p.action === 'editing' 
                                    ? 'bg-status-warning text-white' 
                                    : 'bg-accent-primary text-white'
                            }`}>
                                {p.userName.charAt(0)}
                            </div>
                            
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-surface-alt border border-border-subtle rounded text-xs font-bold text-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                                {p.userName} is {p.action === 'editing' ? 'editing' : 'viewing'}
                            </div>
                            
                            {/* Action Icon Overlay */}
                            <div className="absolute -bottom-1 -right-1 bg-surface-main rounded-full p-0.5 shadow-sm">
                                {p.action === 'editing' 
                                    ? <Edit3 size={6} className="text-status-warning" /> 
                                    : <Eye size={6} className="text-accent-primary" />
                                }
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            
            {showText && (
                <span className="text-xs font-bold text-text-muted animate-pulse">
                    {activeUsers.length} {activeUsers.length === 1 ? 'other user' : 'other users'} active
                </span>
            )}
        </div>
    );
};
