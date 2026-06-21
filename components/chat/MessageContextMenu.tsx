
import React, { useState, useEffect, useRef } from 'react';
import { 
    Reply, Forward, Copy, Link as LinkIcon, Bookmark, 
    Eye, Edit2, Trash2, Plus 
} from 'lucide-react';
import { EmojiPicker } from './EmojiPicker';
import { sfx } from '../../lib/soundService';

interface MessageContextMenuProps {
    position: { x: number, y: number };
    onClose: () => void;
    onReaction: (emoji: string) => void;
    onReply: () => void;
    onForward: () => void;
    onCopy: () => void;
    onCopyLink: () => void;
    onSave: () => void;
    onMarkUnread: () => void;
    onEdit: () => void;
    onDelete: () => void;
    isMe: boolean;
}

export const MessageContextMenu: React.FC<MessageContextMenuProps> = ({
    position, onClose, onReaction, onReply, onForward, onCopy, onCopyLink, onSave, onMarkUnread, onEdit, onDelete, isMe
}) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Adjust position to prevent overflow
    const adjustPosition = () => {
        let x = position.x;
        let y = position.y;
        
        // Basic bounds checking (assuming window)
        if (x + 250 > window.innerWidth) x = window.innerWidth - 260;
        if (y + 400 > window.innerHeight) y = window.innerHeight - 410;

        return { x, y };
    };

    const coords = adjustPosition();

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('scroll', onClose, true);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('scroll', onClose, true);
        };
    }, [onClose]);

    const handleAction = (action: () => void) => {
        sfx.playClick();
        action();
        onClose();
    };

    const QUICK_REACTIONS = ['👍', '❤️', '🔥', '😂', '😮', '😢'];

    return (
        <div 
            className="fixed inset-0 z-[9999]" 
            onContextMenu={(e) => e.preventDefault()}
        >
            <div 
                ref={menuRef}
                className="absolute w-64 bg-surface-main/95  border border-border-subtle rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col"
                style={{ top: coords.y, left: coords.x }}
            >
                {/* 1. REACTION BAR */}
                <div className="p-2 border-b border-border-subtle bg-surface-alt/30">
                    <div className="flex justify-between items-center gap-1">
                        {QUICK_REACTIONS.map(emoji => (
                            <button
                                key={emoji}
                                onClick={() => handleAction(() => onReaction(emoji))}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-main hover:scale-110 transition-all text-lg"
                            >
                                {emoji}
                            </button>
                        ))}
                        <div className="w-px h-6 bg-border-subtle mx-1"></div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(!showEmojiPicker); }}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${showEmojiPicker ? 'bg-accent-primary text-text-primary' : 'hover:bg-surface-main text-text-muted hover:text-text-primary'}`}
                        >
                            <Plus size={16}/>
                        </button>
                    </div>
                    
                    {/* EXPANDED PICKER */}
                    {showEmojiPicker && (
                        <div className="absolute left-full top-0 ml-2 shadow-2xl rounded-xl overflow-hidden border border-border-subtle w-72 h-64 bg-surface-main z-50 animate-in slide-in-from-left-2">
                             <EmojiPicker 
                                onSelect={(e) => handleAction(() => onReaction(e))} 
                                onClose={() => setShowEmojiPicker(false)}
                                className="border-none shadow-none h-full"
                             />
                        </div>
                    )}
                </div>

                {/* 2. ACTION LIST */}
                <div className="p-1.5 space-y-0.5">
                    <MenuItem icon={Reply} label="Reply" onClick={() => handleAction(onReply)} />
                    <MenuItem icon={Forward} label="Forward" onClick={() => handleAction(onForward)} />
                    <div className="h-px bg-border-subtle my-1 mx-2"></div>
                    <MenuItem icon={Copy} label="Copy Text" onClick={() => handleAction(onCopy)} />
                    <MenuItem icon={LinkIcon} label="Copy Message Link" onClick={() => handleAction(onCopyLink)} />
                    <div className="h-px bg-border-subtle my-1 mx-2"></div>
                    <MenuItem icon={Bookmark} label="Save Message" onClick={() => handleAction(onSave)} />
                    <MenuItem icon={Eye} label="Mark as Unread" onClick={() => handleAction(onMarkUnread)} />
                    
                    {isMe && (
                        <>
                            <div className="h-px bg-border-subtle my-1 mx-2"></div>
                            <MenuItem icon={Edit2} label="Edit Message" onClick={() => handleAction(onEdit)} />
                            <MenuItem icon={Trash2} label="Delete" color="text-status-error hover:bg-red-500/10" onClick={() => handleAction(onDelete)} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const MenuItem = ({ icon: Icon, label, onClick, color = "text-text-primary hover:bg-surface-alt" }: any) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold transition-all group ${color}`}
    >
        <Icon size={16} className="opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
        {label}
    </button>
);
