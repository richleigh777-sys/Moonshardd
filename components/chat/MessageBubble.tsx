
import React, { useState, useMemo } from 'react';
import { Ban, Lock, CheckCheck, Quote, EyeOff, Clock, ShieldCheck } from 'lucide-react';
import { ChatMessage, User } from '../../types';
import { EMOJI_FONT } from '../../utils/emojis';
import { 
    RichTextRenderer, MessageAttachments, MessagePoll, 
    MessageLocation, MessageLinkPreview, MessageActions 
} from './ChatParts';
import { MessageContextMenu } from './MessageContextMenu';
import { useSystem } from '../../hooks/useSystem';
import { sfx } from '../../lib/soundService';

interface MessageBubbleProps {
    msg: ChatMessage;
    isMe: boolean;
    isStacked: boolean;
    currentUser: User;
    onReply: (m: ChatMessage) => void;
    onEdit: (m: ChatMessage) => void;
    onDelete: (id: string) => void;
    onPin: (id: string) => void;
    onReaction: (id: string, emoji: string) => void;
    onForward: (m: ChatMessage) => void;
    onVote?: (id: string, optionId: string) => void;
    onJumpTo?: (id: string) => void;
    onViewImage?: (url: string, name: string) => void;
    onMarkUnread?: (id: string) => void;
    onSave?: (m: ChatMessage) => void;
    isHighlighted?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
    msg, isMe, isStacked, currentUser, 
    onReply, onEdit, onDelete, onReaction, onVote, onForward,
    onJumpTo, onViewImage, onMarkUnread, onSave, isHighlighted 
}) => {
    const { setToast } = useSystem();
    const [showMenu, setShowMenu] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);
    
    const isRead = useMemo(() => msg.isRead || (msg.readBy && msg.readBy.length > 1), [msg.isRead, msg.readBy]);
    const isSystem = msg.senderId === 'system';
    const isFailed = msg.id.startsWith('failed-');
    
    // Check if it's an admin message (using role or custom flag)
    const isAdmin = (msg as any).senderRole === 'admin' || msg.senderId === 'admin_broadcast';
    
    const isInternal = (msg as any).isInternal;
    const [now] = useState(() => Date.now());
    const isScheduled = (msg as any).scheduledFor && (msg as any).scheduledFor > now;

    const isEmojiOnly = useMemo(() => {
        if ((msg.attachments?.length ?? 0) > 0 || msg.poll || msg.location || isInternal) return false;
        const clean = msg.text.trim();
        if (clean.length === 0) return false;
        const emojiPattern = /^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])+$/;
        return emojiPattern.test(clean) && [...clean].length <= 3;
    }, [msg.text, msg.attachments, msg.poll, msg.location, isInternal]);

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        sfx.playHover();
        setContextMenu({ x: e.clientX, y: e.clientY });
        setShowMenu(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(msg.text);
        setToast({ title: 'Clipboard', message: "Copied text.", type: 'success' });
    };

    const handleCopyLink = () => {
        const link = `${window.location.origin}/#msg-${msg.id}`;
        navigator.clipboard.writeText(link);
        setToast({ title: 'Clipboard', message: "Link copied.", type: 'success' });
    };

    if (isSystem) {
        return (
            <div className="flex justify-center my-4 w-full px-6 duration-500">
                <div className="bg-surface-alt/70 border border-border-subtle backdrop-blur-sm rounded-full px-4 py-1.5 flex items-center justify-center gap-2 max-w-[85%] shadow-sm">
                    {msg.text.includes('encrypted') ? <Lock size={12} className="text-status-success"/> : null}
                    <span className="text-[11px] font-bold text-text-muted tracking-wide">
                        {msg.text}
                    </span>
                </div>
            </div>
        );
    }

    // --- STYLING LOGIC ---
    // Modern Bubble Shapes with "tails" based on stack position
    const baseBubbleClass = "px-3.5 py-2.5 relative shadow-sm transition-colors duration-200";
    
    let radiusClass = "";
    if (isMe) {
        // Flat right side if stacked, otherwise bottom right tail
        radiusClass = isStacked ? "rounded-l-2xl rounded-tr-2xl rounded-br-md" : "rounded-2xl rounded-br-sm";
    } else {
        // Flat left side if stacked, otherwise bottom left tail
        radiusClass = isStacked ? "rounded-r-2xl rounded-tl-2xl rounded-bl-md" : "rounded-2xl rounded-bl-sm";
    }

    // Color differentiation
    let colorClass = isMe 
        ? "bg-accent-primary text-white" // Outbound
        : "bg-surface-alt border border-border-subtle/50 text-text-primary"; // Inbound

    if (isAdmin && !isMe) {
        colorClass = "bg-rose-500/10 border border-rose-500/20 text-rose-500";
        radiusClass = "rounded-2xl"; // Admin messages are distinct blocks
    }

    const internalClass = "bg-amber-500/10 text-amber-600 border border-amber-500/20";
    const emojiClass = "bg-transparent border-none p-0 overflow-visible shadow-none";

    const finalClass = `${baseBubbleClass} ${isInternal ? internalClass : isEmojiOnly ? emojiClass : `${colorClass} ${radiusClass}`}`;
    
    // Stacking margins
    const stackMargin = isStacked ? 'mt-1' : 'mt-4';

    return (
        <div 
            className={`group flex w-full ${isMe || isInternal ? 'justify-end' : 'justify-start'} ${stackMargin} px-2 md:px-0 relative ${isHighlighted ? 'z-20' : ''}`}
            onMouseEnter={() => setShowMenu(true)}
            onMouseLeave={() => setShowMenu(false)}
            onContextMenu={handleContextMenu}
            id={`msg-${msg.id}`}
        >
            {isHighlighted && (
                <div className="absolute inset-0 bg-accent-secondary/10 -m-2 rounded-[20px] animate-pulse -z-10 blur-xl"></div>
            )}

            {contextMenu && (
                <MessageContextMenu 
                    position={contextMenu}
                    onClose={() => setContextMenu(null)}
                    onReaction={(emoji) => onReaction(msg.id, emoji)}
                    onReply={() => onReply(msg)}
                    onForward={() => onForward(msg)}
                    onCopy={handleCopy}
                    onCopyLink={handleCopyLink}
                    onSave={() => onSave?.(msg)}
                    onMarkUnread={() => onMarkUnread?.(msg.id)}
                    onEdit={() => onEdit(msg)}
                    onDelete={() => onDelete(msg.id)}
                    isMe={isMe}
                />
            )}

            <div className={`relative max-w-[90%] md:max-w-[75%] lg:max-w-[65%] flex flex-col ${isMe || isInternal ? 'items-end' : 'items-start'}`}>
                
                {/* Sender Header / Admin Banner */}
                {!isMe && !isStacked && !isInternal && (
                    <div className="flex items-center gap-1.5 mb-1.5 ml-1">
                        {isAdmin && <ShieldCheck size={14} className="text-rose-500" />}
                        <div className={`text-xs font-bold ${isAdmin ? 'text-rose-500' : 'text-text-muted opacity-80'}`}>{msg.senderName} {isAdmin && '- Admin'}</div>
                    </div>
                )}

                {/* Internal / Scheduled Badges */}
                {(isInternal || isScheduled) && (
                     <div className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full mb-1.5 flex items-center gap-1 w-fit ${isInternal ? 'bg-amber-500/20 text-amber-600 border border-amber-500/20' : 'bg-indigo-500/20 text-indigo-500 border border-indigo-500/20'}`}>
                        {isInternal ? <EyeOff size={12} strokeWidth={2.5} /> : <Clock size={12} strokeWidth={2.5} />}
                        {isInternal ? 'Internal Notice' : 'Sending Later'}
                     </div>
                )}

                {/* Floating Quick Action Menu */}
                {showMenu && !contextMenu && !msg.isDeleted && !isFailed && (
                    <MessageActions 
                        isMe={isMe} 
                        msgId={msg.id}
                        onClose={() => setShowMenu(false)}
                        onReaction={onReaction}
                        onReply={() => onReply(msg)}
                        onEdit={() => onEdit(msg)}
                        onDelete={() => onDelete(msg.id)}
                    />
                )}

                <div className={`
                    ${finalClass} 
                    ${msg.isDeleted ? 'opacity-50 italic' : ''}
                    hover:shadow-md transition-shadow
                `}>
                    
                    {msg.replyToId && !msg.isDeleted && !isEmojiOnly && (
                        <div 
                            className={`mb-2.5 p-2 rounded-lg text-[13px] border-l-[3px] flex flex-col gap-0.5 cursor-pointer opacity-90 hover:opacity-100 transition-all ${isMe ? 'bg-black/10 border-white/50 text-white' : 'bg-surface-main/80 border-accent-secondary text-text-primary backdrop-blur-sm'}`}
                            onClick={(e) => { e.stopPropagation(); onJumpTo?.(msg.replyToId!); }}
                        >
                            <div className="flex items-center gap-1 font-bold text-xs opacity-90">
                                <Quote size={12} /> {msg.replyToName}
                            </div>
                            <div className="truncate opacity-80 leading-tight">"{msg.replyToText}"</div>
                        </div>
                    )}

                    {msg.isDeleted ? (
                        <span className="flex items-center gap-1.5 text-xs font-medium opacity-70"><Ban size={14}/> This message was unsent</span>
                    ) : (
                        <>
                            {msg.attachments && <MessageAttachments attachments={msg.attachments} isMe={isMe} onViewImage={onViewImage || (() => {})} />}
                            {msg.poll && <MessagePoll poll={msg.poll} isMe={isMe} currentUserId={currentUser.id} onVote={(optionId) => onVote?.(msg.id, optionId)} />}
                            {msg.location && <MessageLocation location={msg.location} isMe={isMe} />}

                            {isEmojiOnly ? (
                                <div className="text-[3.5rem] leading-tight cursor-default py-1 animate-in zoom-in duration-300" style={{ fontFamily: EMOJI_FONT }}>
                                    {msg.text}
                                </div>
                            ) : (
                                <>
                                    {msg.text && (
                                        <div className={`text-[15px] leading-relaxed whitespace-pre-wrap break-words`}>
                                            <RichTextRenderer text={isInternal ? msg.text.replace('[INTERNAL NOTE]: ', '') : msg.text} />
                                        </div>
                                    )}
                                    {msg.linkPreview && <MessageLinkPreview preview={msg.linkPreview} isMe={isMe} />}
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* Footer: Reactions & Time */}
                <div className={`flex items-center gap-2 mt-1 px-1 flex-wrap w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && !msg.isDeleted && (
                        <div className={`flex gap-1 flex-wrap ${isMe ? 'order-first' : ''}`}>
                            {Object.entries(msg.reactions).map(([emoji, uids]) => {
                                const userIds = uids as string[];
                                return userIds.length > 0 && (
                                    <div 
                                        key={emoji} 
                                        onClick={() => onReaction(msg.id, emoji)} 
                                        style={{ fontFamily: EMOJI_FONT }} 
                                        className="cursor-pointer px-2 py-0.5 bg-surface-alt border border-border-subtle rounded-full text-xs flex items-center gap-1 hover:bg-surface-highlight transition-all shadow-sm"
                                    >
                                        <span className="animate-in zoom-in duration-200">{emoji}</span>
                                        <span className="font-bold text-text-muted">{userIds.length}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {!isEmojiOnly && (
                        <div className={`flex items-center gap-1 text-[10px] font-bold text-text-muted transition-opacity select-none ${isStacked ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'} ${isMe ? 'ml-auto' : ''}`}>
                            <span>{new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                            {isMe && !isInternal && !isScheduled && (
                                <span title={isRead ? "Read" : "Delivered"}>
                                    <CheckCheck size={14} className={isRead ? "text-accent-secondary" : "text-text-muted opacity-50"}/>
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

