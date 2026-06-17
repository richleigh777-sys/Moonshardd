
import React, { useState } from 'react';
import { Search, Send, X, Hash, ShieldAlert, CheckCircle2, CornerUpRight, MessageSquare, Paperclip } from 'lucide-react';
import { useCRM } from '../../hooks/useCRM';
import { ChatMessage } from '../../types';
import { getDmChannelId, sendMessage } from '../../lib/cloudService'; 
import { sfx } from '../../lib/soundService';

interface ForwardMessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    messageToForward: ChatMessage | null;
    currentUser: any;
}

export const ForwardMessageModal: React.FC<ForwardMessageModalProps> = ({ isOpen, onClose, messageToForward, currentUser }) => {
    const { users, channels } = useCRM();
    const [searchQuery, setSearchQuery] = useState('');
    const [sentIds, setSentIds] = useState<string[]>([]);
    const [comment, setComment] = useState('');

    const handleForward = React.useCallback(async (target: any) => {
        if (!messageToForward) return;
        sfx.playSubmit();
        
        const now = Date.now();
        let targetChannelId = target.id;
        if (target.type === 'user') {
            targetChannelId = getDmChannelId(currentUser.id, target.id);
        }

        // 1. Send the Forwarded Content
        await sendMessage({
            channelId: targetChannelId,
            text: messageToForward.text, // Send raw text, bubble handles "Forwarded" tag
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderRole: currentUser.role,
            timestamp: now,
            attachments: messageToForward.attachments || [],
            reactions: {},
            readBy: [currentUser.id],
            isRead: false,
            isForwarded: true, // Trigger the UI badge
        });

        // 2. Send Comment if exists
        if (comment.trim()) {
            await sendMessage({
                channelId: targetChannelId,
                text: comment,
                senderId: currentUser.id,
                senderName: currentUser.name,
                senderRole: currentUser.role,
                timestamp: now + 50, // Slight offset
                readBy: [currentUser.id],
                isRead: false
            });
        }

        setSentIds(prev => [...prev, target.id]);
    }, [currentUser, messageToForward, comment]);

    if (!messageToForward || !isOpen) return null;

    const targets = [
        ...(channels || []).map(c => ({ 
            id: c.id, 
            name: c.name, 
            type: 'channel', 
            subType: c.type, 
            avatar: null 
        })),
        ...(users || []).filter(u => u.id !== currentUser.id && u.active).map(u => ({ 
            id: u.id, 
            name: u.name, 
            type: 'user', 
            subType: null, 
            avatar: u.avatar 
        }))
    ].filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={onClose}></div>
            
            <div className="bg-surface-main w-full max-w-lg rounded-xl border border-border-subtle shadow-2xl flex flex-col relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[85vh]">
                
                {/* Header */}
                <div className="p-4 border-b border-border-subtle flex justify-between items-center bg-surface-alt/50">
                    <h3 className="text-sm font-[700]  tracking-widest text-text-primary flex items-center gap-2">
                        <CornerUpRight size={16} className="text-accent-primary"/> Forward Message
                    </h3>
                    <button onClick={onClose} className="p-1.5 hover:bg-surface-highlight rounded-lg text-text-muted hover:text-text-primary transition-colors">
                        <X size={16}/>
                    </button>
                </div>

                <div className="flex flex-col flex-1 overflow-hidden">
                    
                    {/* Preview Section */}
                    <div className="p-4 bg-surface-main border-b border-border-subtle shrink-0">
                        <div className="bg-surface-alt/40 p-3 rounded-xl border-l-4 border-accent-primary relative overflow-hidden">
                            <div className="flex items-center gap-2 mb-1.5">
                                <div className="text-xs font-bold text-accent-primary  tracking-widest opacity-90 flex items-center gap-1">
                                    <MessageSquare size={16} />
                                    {messageToForward.senderName}
                                </div>
                                <div className="text-xs text-text-muted font-mono">
                                    {new Date(messageToForward.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                </div>
                            </div>
                            
                            {messageToForward.attachments && messageToForward.attachments.length > 0 && (
                                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-text-primary bg-surface-main/50 p-2 rounded-lg border border-border-subtle/50 w-fit">
                                    <Paperclip size={16} className="text-accent-primary"/>
                                    {messageToForward.attachments.length} Attachment{messageToForward.attachments.length > 1 ? 's' : ''}
                                </div>
                            )}

                            <p className="text-xs text-text-primary italic line-clamp-3 leading-relaxed opacity-90 font-medium">
                                "{messageToForward.text}"
                            </p>
                        </div>

                        {/* Comment Input */}
                        <div className="mt-3 relative">
                            <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                className="w-full bg-surface-alt border border-border-subtle rounded-xl py-2.5 px-4 text-xs font-medium outline-none focus:border-accent-primary transition-all placeholder:text-text-muted/50"
                                placeholder="Add a comment (optional)..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Search */}
                    <div className="p-3 pb-0 shrink-0">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                            <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                autoFocus
                                placeholder="Search people or channels..." 
                                className="w-full bg-surface-alt border border-border-subtle rounded-xl py-2.5 pl-9 pr-4 text-xs font-bold outline-none focus:border-accent-primary transition-all shadow-inner"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
                        <p className="text-xs font-bold text-text-muted  tracking-widest px-2 mb-2">Suggested Targets</p>
                        {targets.map(target => {
                            const isSent = sentIds.includes(target.id);
                            return (
                                <button 
                                    key={target.id} 
                                    onClick={() => !isSent && handleForward(target)}
                                    disabled={isSent}
                                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all group ${
                                        isSent 
                                        ? 'bg-status-success/10 border-status-success/20 cursor-default' 
                                        : 'bg-transparent border-transparent hover:bg-surface-alt hover:border-border-subtle'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-text-secondary shrink-0 transition-transform group-hover:scale-105 ${
                                            target.type === 'channel' ? 'bg-surface-alt border border-border-subtle' : 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-accent-secondary/20'
                                        }`}>
                                            {target.type === 'channel' ? (
                                                target.subType === 'private' ? <ShieldAlert size={16}/> : <Hash size={16}/>
                                            ) : (
                                                target.avatar ? <img src={target.avatar} className="w-full h-full rounded-xl object-cover"/> : <span className="font-[700] text-xs">{target.name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className="text-left min-w-0">
                                            <p className={`text-xs font-bold truncate ${isSent ? 'text-status-success' : 'text-text-primary'}`}>{target.name}</p>
                                            <p className="text-xs text-text-muted  tracking-wider truncate">{target.type === 'user' ? 'Agent' : 'Channel'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                                        isSent 
                                        ? 'bg-status-success text-white shadow-lg shadow-status-success/20' 
                                        : 'text-text-muted hover:bg-accent-primary hover:text-white opacity-0 group-hover:opacity-100'
                                    }`}>
                                        {isSent ? <CheckCircle2 size={16} /> : <Send size={16} className={isSent ? '' : 'ml-0.5'} />}
                                    </div>
                                </button>
                            );
                        })}
                        {targets.length === 0 && (
                            <div className="text-center py-8 text-text-muted opacity-50 italic text-xs">No targets found.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
