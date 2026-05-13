
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
        setToast({ title: 'Clipboard', message: "Copied to buffer", type: 'success' });
    };

    const handleCopyLink = () => {
        const link = `${window.location.origin}/#msg-${msg.id}`;
        navigator.clipboard.writeText(link);
        setToast({ title: 'Clipboard', message: "Link copied", type: 'success' });
    };

    if (isSystem) {
        return (
            <div className="flex justify-center my-3 w-full px-6 animate-in fade-in zoom-in duration-500">
                <div className="bg-slate-900/50 backdrop-blur-md border border-white/5 px-3 py-1 flex items-center justify-center gap-1.5 max-w-[85%] shadow-sm">
                    {msg.text.includes('encrypted') ? <Lock size={8} className="text-emerald-500"/> : null}
                    <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest text-center leading-tight">
                        {msg.text}
                    </span>
                </div>
            </div>
        );
    }

    // --- STYLING LOGIC ---
    // Fluid Bubble Shapes
    const bubbleClass = isMe 
        ? `bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 text-white border-0 shadow-xl shadow-indigo-500/20 rounded-[20px] rounded-tr-[4px]` 
        : `bg-slate-800/60 backdrop-blur-xl border border-white/10 text-slate-100 shadow-lg rounded-[20px] rounded-tl-[4px]`;

    const internalClass = `bg-amber-900/40 border border-amber-500/30 text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.15)] rounded-[20px] rounded-tr-[4px]`;
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
                <div className="absolute inset-0 bg-accent-primary/20 -m-6 rounded-[40px] animate-pulse -z-10 blur-3xl"></div>
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
                    <div className="text-[9px] font-bold text-slate-400 mb-1 ml-2.5 uppercase tracking-widest opacity-60">{msg.senderName}</div>
                )}

                {/* Internal / Scheduled Badges */}
                {(isInternal || isScheduled) && (
                     <div className={`text-[7px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full mb-1 flex items-center gap-1 w-fit ${isInternal ? 'bg-amber-500 text-black' : 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'}`}>
                        {isInternal ? <EyeOff size={8} strokeWidth={3} /> : <Clock size={8} strokeWidth={3} />}
                        {isInternal ? 'Internal Note' : 'Scheduled'}
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

                <div className={`px-3 py-1.5 ${finalClass} ${msg.isDeleted ? 'opacity-50 italic' : ''} relative transition-all duration-300 hover:scale-[1.01] origin-bottom`}>
                    
                    {msg.replyToId && !msg.isDeleted && !isEmojiOnly && (
                        <div 
                            className={`mb-2 p-2 rounded-lg text-[9px] border-l-4 flex flex-col gap-0.5 cursor-pointer opacity-90 hover:opacity-100 transition-all ${isMe ? 'bg-black/20 border-white/30 text-white' : 'bg-black/40 border-accent-primary text-slate-300'}`}
                            onClick={(e) => { e.stopPropagation(); onJumpTo?.(msg.replyToId!); }}
                        >
                            <div className="flex items-center gap-1 font-black text-[7px] uppercase tracking-widest">
                                <Quote size={8} fill="currentColor" className="opacity-50"/> {msg.replyToName}
                            </div>
                            <div className="truncate italic text-[8px] opacity-80">"{msg.replyToText}"</div>
                        </div>
                    )}

                    {msg.isDeleted ? (
                        <span className="flex items-center gap-1.5 text-xs font-medium opacity-60"><Ban size={11}/> Message retracted</span>
                    ) : (
                        <>
                            {msg.attachments && <MessageAttachments attachments={msg.attachments} isMe={isMe} onViewImage={onViewImage || (() => {})} />}
                            {msg.poll && <MessagePoll poll={msg.poll} isMe={isMe} currentUserId={currentUser.id} onVote={(optionId) => onVote?.(msg.id, optionId)} />}
                            {msg.location && <MessageLocation location={msg.location} isMe={isMe} />}

                            {isEmojiOnly ? (
                                <div className="text-[3rem] leading-none hover:scale-125 transition-transform cursor-default filter drop-shadow-2xl py-1.5" style={{ fontFamily: EMOJI_FONT }}>
                                    {msg.text}
                                </div>
                            ) : (
                                <>
                                    {msg.text && (
                                        <div className={`text-xs font-medium leading-relaxed whitespace-pre-wrap break-words ${isMe ? 'text-white' : 'text-slate-100'}`}>
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
                <div className="flex items-center gap-2.5 mt-1 px-1 flex-wrap justify-end w-full">
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && !msg.isDeleted && (
                        <div className="flex gap-1 flex-wrap mr-auto">
                            {Object.entries(msg.reactions).map(([emoji, uids]) => {
                                const userIds = uids as string[];
                                return userIds.length > 0 && (
                                    <div 
                                        key={emoji} 
                                        onClick={() => onReaction(msg.id, emoji)} 
                                        style={{ fontFamily: EMOJI_FONT }} 
                                        className="cursor-pointer px-1.5 py-0.5 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-full text-[9px] flex items-center gap-1 hover:bg-slate-800 transition-all hover:scale-110 active:scale-95 shadow-lg"
                                    >
                                        <span>{emoji}</span>
                                        <span className="font-black text-slate-400">{userIds.length}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {!isEmojiOnly && (
                        <div className={`flex items-center gap-1 text-[8px] font-bold tracking-wider ${isMe ? 'text-slate-500' : 'text-slate-600'} transition-opacity select-none ${isStacked ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                            <span>{new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                            {isRead && isMe && !isInternal && !isScheduled && <CheckCheck size={10} className="text-accent-primary drop-shadow-[0_0_5px_rgba(129,140,248,0.5)]"/>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
