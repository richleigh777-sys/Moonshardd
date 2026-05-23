
import React, { useState, useMemo } from 'react';
import { Ban, Lock, CheckCheck, Quote, EyeOff, Clock } from 'lucide-react';
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
        setToast({ title: 'Clipboard', message: "Copied", type: 'success' });
    };

    const handleCopyLink = () => {
        const link = `${window.location.origin}/#msg-${msg.id}`;
        navigator.clipboard.writeText(link);
        setToast({ title: 'Clipboard', message: "Link copied", type: 'success' });
    };

    if (isSystem) {
        return (
            <div className="flex justify-center my-3 w-full px-6 duration-500">
                <div className="bg-surface-alt rounded-md px-3 py-1 flex items-center justify-center gap-1.5 max-w-[85%] shadow-sm">
                    {msg.text.includes('encrypted') ? <Lock size={14} className="text-status-success"/> : null}
                    <span className="text-xs font-semibold text-text-muted">
                        {msg.text}
                    </span>
                </div>
            </div>
        );
    }

    // --- STYLING LOGIC ---
    // Minimalist Bubble Shapes
    const bubbleClass = isMe 
        ? `bg-indigo-500 text-text-primary rounded-2xl rounded-tr-sm shadow-sm` 
        : `bg-surface-alt text-text-primary rounded-2xl rounded-tl-sm shadow-sm`;

    const internalClass = `bg-amber-500/20 text-amber-100 border border-status-warning/30 rounded-2xl rounded-tr-sm`;
    const emojiClass = "bg-transparent border-none p-0 overflow-visible shadow-none";

    const finalClass = isInternal ? internalClass : isEmojiOnly ? emojiClass : bubbleClass;
    
    // Stacking margins
    const stackMargin = isStacked ? 'mt-0.5' : 'mt-3';

    return (
        <div 
            className={`group flex w-full ${isMe || isInternal ? 'justify-end' : 'justify-start'} ${stackMargin} px-3 relative ${isHighlighted ? 'z-20' : ''}`}
            onMouseEnter={() => setShowMenu(true)}
            onMouseLeave={() => setShowMenu(false)}
            onContextMenu={handleContextMenu}
            id={`msg-${msg.id}`}
        >
            {isHighlighted && (
                <div className="absolute inset-0 bg-accent-secondary/10 -m-6 rounded-[40px] animate-pulse -z-10 blur-xl"></div>
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

            <div className={`relative max-w-[85%] lg:max-w-[70%] flex flex-col ${isMe || isInternal ? 'items-end' : 'items-start'}`}>
                
                {/* Sender Name (Only for others, unstacked) */}
                {!isMe && !isStacked && !isInternal && (
                    <div className="text-xs font-semibold text-text-muted mb-1 ml-2 opacity-80">{msg.senderName}</div>
                )}

                {/* Internal / Scheduled Badges */}
                {(isInternal || isScheduled) && (
                     <div className={`text-[10px] font-bold  tracking-wider px-2 py-0.5 rounded-full mb-1 flex items-center gap-1 w-fit ${isInternal ? 'bg-amber-500/20 text-amber-200' : 'bg-indigo-500/20 text-indigo-300'}`}>
                        {isInternal ? <EyeOff size={12} strokeWidth={2.5} /> : <Clock size={12} strokeWidth={2.5} />}
                        {isInternal ? 'Internal' : 'Scheduled'}
                     </div>
                )}

                {/* Action Hover Menu */}
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

                <div className={`px-3 py-2 ${finalClass} ${msg.isDeleted ? 'opacity-50 italic' : ''} relative`}>
                    
                    {msg.replyToId && !msg.isDeleted && !isEmojiOnly && (
                        <div 
                            className={`mb-2 p-2 rounded-md text-xs border-l-2 flex flex-col gap-0.5 cursor-pointer opacity-90 hover:opacity-100 transition-all ${isMe ? 'bg-black/10 border-border-subtle text-text-primary' : 'bg-surface-main border-indigo-400 text-text-primary'}`}
                            onClick={(e) => { e.stopPropagation(); onJumpTo?.(msg.replyToId!); }}
                        >
                            <div className="flex items-center gap-1 font-semibold text-xs">
                                <Quote size={12} className="opacity-50"/> {msg.replyToName}
                            </div>
                            <div className="truncate opacity-80">"{msg.replyToText}"</div>
                        </div>
                    )}

                    {msg.isDeleted ? (
                        <span className="flex items-center gap-1.5 text-xs font-medium opacity-60"><Ban size={12}/> Message deleted</span>
                    ) : (
                        <>
                            {msg.attachments && <MessageAttachments attachments={msg.attachments} isMe={isMe} onViewImage={onViewImage || (() => {})} />}
                            {msg.poll && <MessagePoll poll={msg.poll} isMe={isMe} currentUserId={currentUser.id} onVote={(optionId) => onVote?.(msg.id, optionId)} />}
                            {msg.location && <MessageLocation location={msg.location} isMe={isMe} />}

                            {isEmojiOnly ? (
                                <div className="text-[3rem] leading-none cursor-default py-1" style={{ fontFamily: EMOJI_FONT }}>
                                    {msg.text}
                                </div>
                            ) : (
                                <>
                                    {msg.text && (
                                        <div className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${isMe ? 'text-text-primary' : 'text-text-primary'}`}>
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
                <div className="flex items-center gap-2 mt-1 px-1 flex-wrap justify-end w-full">
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && !msg.isDeleted && (
                        <div className="flex gap-1 flex-wrap mr-auto">
                            {Object.entries(msg.reactions).map(([emoji, uids]) => {
                                const userIds = uids as string[];
                                return userIds.length > 0 && (
                                    <div 
                                        key={emoji} 
                                        onClick={() => onReaction(msg.id, emoji)} 
                                        style={{ fontFamily: EMOJI_FONT }} 
                                        className="cursor-pointer px-2 py-0.5 bg-surface-alt border border-border-subtle rounded-full text-xs flex items-center gap-1 hover:bg-surface-highlight transition-all"
                                    >
                                        <span>{emoji}</span>
                                        <span className="font-semibold text-text-muted">{userIds.length}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {!isEmojiOnly && (
                        <div className={`flex items-center gap-1 text-[10px] font-semibold text-text-muted transition-opacity select-none ${isStacked ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                            <span>{new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                            {isRead && isMe && !isInternal && !isScheduled && <CheckCheck size={14} className="text-accent-secondary"/>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
