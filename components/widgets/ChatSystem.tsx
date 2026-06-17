
import React from 'react';
import { X } from 'lucide-react';
import { MessagingLayout } from '../chat/MessagingLayout';

export const ChatSystem: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex bg-surface-alt backdrop-blur-xl p-0 md:p-5 lg:p-12 animate-in fade-in duration-300">
            {/* Close trigger on backdrop */}
            <div className="absolute inset-0 z-0" onClick={onClose}></div>
            
            <div className="relative z-10 w-full h-full flex flex-col">
                {/* Floating Close Button for Mobile/Headerless feel */}
                <button 
                    onClick={onClose}
                    className="absolute -top-4 -right-4 md:top-4 md:right-4 p-3 bg-surface-main border border-border-subtle rounded-xl text-text-muted hover:text-status-error transition-all shadow-2xl hover:scale-110 active:scale-95 z-[250]"
                >
                    <X size={24} strokeWidth={2.5} />
                </button>

                <MessagingLayout />
            </div>
        </div>
    );
};
