
import React from 'react';
import { Pin, PinOff, GripVertical } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { sfx } from '../../lib/soundService';

interface WidgetContainerProps {
    id: string;
    children: React.ReactNode;
    isPinned: boolean;
    className?: string;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = ({ 
    id, children, isPinned, className = "" 
}) => {
    const { currentUser, updateProfile } = useAuth();

    const togglePin = async () => {
        if (!currentUser) return;
        
        const currentPins = currentUser.widgetPreferences?.pinnedWidgets || [];
        let newPins: string[];

        if (isPinned) {
            newPins = currentPins.filter(p => p !== id);
            sfx.playClick();
        } else {
            newPins = [...currentPins, id];
            sfx.playSuccess();
        }

        await updateProfile({
            widgetPreferences: {
                ...currentUser.widgetPreferences,
                pinnedWidgets: newPins
            }
        });
    };

    return (
        <div className={`relative group/widget ${className}`}>
            <div className="absolute top-3 right-3 z-20 flex gap-2 opacity-0 group-hover/widget:opacity-100 transition-opacity duration-300">
                <button 
                    onClick={togglePin}
                    className={`p-1.5 rounded-lg border  transition-all duration-300 shadow-sm ${
                        isPinned 
                        ? 'bg-accent-primary text-white border-accent-primary' 
                        : 'bg-surface-main/80 text-text-muted border-border-subtle hover:text-accent-primary'
                    }`}
                    title={isPinned ? "Unpin from top" : "Pin to top"}
                >
                    {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
                </button>
                <div className="p-1.5 rounded-lg bg-surface-main/80 text-text-muted border border-border-subtle cursor-grab active:cursor-grabbing ">
                    <GripVertical size={16} />
                </div>
            </div>

            {/* Title Overlay for Pinned Widgets */}
            {isPinned && (
                <div className="absolute top-3 left-6 z-20 flex items-center gap-2 pointer-events-none">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse" />
                    <span className="text-sm font-medium  tracking-wide text-accent-primary opacity-60">Pinned Sector</span>
                </div>
            )}

            {children}
        </div>
    );
};
