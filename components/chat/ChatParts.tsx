import React, { useState } from 'react';
import { 
    FileText, Download, BarChart2, CheckCircle, 
    MapPin, Globe, Edit2, Trash2, Reply, Plus, Quote, 
    UploadCloud, ChevronDown, X, Lock, Zap,
    PhoneOff, CalendarClock
} from 'lucide-react';
import { Attachment, PollData, LocationData, LinkPreview } from '../../types';
import { EmojiPicker } from './EmojiPicker';
import { EMOJI_FONT } from '../../utils/emojis';
import { AudioPlayer } from '../ui/Base';

// --- MESSAGE CONTENT PARTS ---

const CRMLeadBlock = ({ title, details }: { title: string, details: any[] }) => {
    const [opened, setOpened] = useState(false);
    return (
        <div className="bg-surface-main border border-border-subtle rounded-xl p-3 my-2 w-full max-w-[300px] font-sans break-words shadow-sm">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border-subtle/50">
                <div className="p-1.5 bg-indigo-500/20 text-accent-secondary rounded-md">
                    <FileText size={14} />
                </div>
                <span className="text-sm font-bold text-text-primary">{title}</span>
            </div>
            <div className="space-y-1.5">
                {details.map((d, i) => (
                    <div key={i} className="flex justify-between items-start text-xs">
                        <span className="text-text-muted font-semibold  shrink-0 mr-2">{d.key}:</span>
                        <span className="text-text-primary font-medium text-right break-words">{d.value || '-'}</span>
                    </div>
                ))}
            </div>
            <button 
                onClick={() => setOpened(true)}
                className={`mt-3 w-full py-1.5 rounded-md text-xs font-semibold transition-colors ${opened ? 'bg-indigo-500/50 text-text-primary cursor-default' : 'bg-surface-highlight hover:bg-indigo-500 text-text-primary'}`}
            >
                {opened ? 'Record Opened' : 'Open Record'}
            </button>
        </div>
    );
};

const TeamsStackBlock = ({ title, details }: { title: string, details: any[] }) => {
    const [sent, setSent] = useState(false);
    return (
        <div className="bg-emerald-500/10 border border-status-success/30 rounded-xl p-3 my-2 w-full max-w-[320px] font-sans break-words shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-status-success/20">
                <Globe size={64} />
            </div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-emerald-500/20 relative z-10">
                <div className="p-1.5 bg-emerald-500 rounded-md text-text-primary shadow-sm shadow-emerald-500/50">
                    <Zap size={14} fill="currentColor" />
                </div>
                <span className="text-sm font-[700]  tracking-widest text-emerald-100">{title}</span>
            </div>
            <div className="space-y-1.5 relative z-10">
                {details.map((d, i) => (
                    <div key={i} className="flex justify-between items-start text-xs">
                        <span className="text-status-success/70 font-[700]  tracking-wider shrink-0 mr-2">{d.key}:</span>
                        <span className="text-emerald-100 font-mono font-bold text-right break-words">{d.value || '-'}</span>
                    </div>
                ))}
            </div>
            <button 
                onClick={() => setSent(true)}
                className={`mt-3 w-full py-2 rounded-md text-xs font-[700]  tracking-widest transition-all shadow-sm relative z-10 flex items-center justify-center gap-2 ${sent ? 'bg-emerald-500/50 text-emerald-100 cursor-default shadow-none hover:shadow-none' : 'bg-emerald-500 hover:bg-emerald-400 text-gray-900 shadow-emerald-500/20 hover:shadow-emerald-500/40'}`}
            >
                {sent ? <><CheckCircle size={14} /> Pushed to Teams</> : <><Globe size={14} /> Send to MS Teams</>}
            </button>
        </div>
    );
};

const DNCBlock = ({ title, details }: { title: string, details: any[] }) => {
    const [confirmed, setConfirmed] = useState(false);
    return (
        <div className="bg-red-500/10 border border-status-error/30 rounded-xl p-3 my-2 w-full max-w-[300px] font-sans break-words shadow-sm">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-red-500/20">
                <div className="p-1.5 bg-red-500/20 text-status-error rounded-md">
                    <PhoneOff size={14} />
                </div>
                <span className="text-sm font-bold text-red-200">{title}</span>
            </div>
            <div className="space-y-1.5">
                {details.map((d, i) => (
                    <div key={i} className="flex justify-between items-start text-xs">
                        <span className="text-status-error/70 font-semibold  mr-2">{d.key}:</span>
                        <span className="text-red-100 font-medium break-words">{d.value || '-'}</span>
                    </div>
                ))}
            </div>
            <button 
                onClick={() => setConfirmed(true)}
                className={`mt-3 w-full py-1.5 rounded-md text-xs font-semibold transition-colors border ${confirmed ? 'bg-red-500/50 text-text-primary border-transparent cursor-default' : 'bg-red-500/20 hover:bg-red-500/40 text-status-error border-status-error/30'}`}
            >
                {confirmed ? 'Blacklisted' : 'Confirm Blacklist'}
            </button>
        </div>
    );
};

const CallbackBlock = ({ title, details }: { title: string, details: any[] }) => {
    const [scheduled, setScheduled] = useState(false);
    return (
        <div className="bg-amber-500/10 border border-status-warning/30 rounded-xl p-3 my-2 w-full max-w-[300px] font-sans break-words shadow-sm">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-amber-500/20">
                <div className="p-1.5 bg-amber-500/20 text-status-warning rounded-md">
                    <CalendarClock size={14} />
                </div>
                <span className="text-sm font-bold text-amber-200">{title}</span>
            </div>
            <div className="space-y-1.5">
                {details.map((d, i) => (
                    <div key={i} className="flex justify-between items-start text-xs">
                        <span className="text-status-warning/70 font-semibold  mr-2">{d.key}:</span>
                        <span className="text-amber-100 font-medium break-words">{d.value || '-'}</span>
                    </div>
                ))}
            </div>
            <button 
                onClick={() => setScheduled(true)}
                className={`mt-3 w-full py-1.5 rounded-md text-xs font-semibold transition-colors ${scheduled ? 'bg-amber-500/50 text-text-primary cursor-default' : 'bg-amber-500 hover:bg-amber-400 text-gray-900'}`}
            >
                {scheduled ? 'Scheduled' : 'Add to Schedule'}
            </button>
        </div>
    );
};

const parseMarkdown = (text: string) => {
    // 0. Custom CRM Lead/Transfer Blocks
    if (text.startsWith('[LEAD:')) {
        const lines = text.split('\n');
        const title = lines[0].replace('[LEAD:', '').replace(']', '').trim();
        const details = lines.slice(1).map(l => {
            const [k, ...v] = l.split(':');
            return { key: k?.trim(), value: v.join(':')?.trim() };
        }).filter(d => d.key);
        return <CRMLeadBlock title={title} details={details} />;
    }
    
    // 0.1 MS Teams Sales Stack
    if (text.startsWith('[TEAMS_STACK:')) {
        const lines = text.split('\n');
        const title = lines[0].replace('[TEAMS_STACK:', '').replace(']', '').trim();
        const details = lines.slice(1).map(l => {
            const [k, ...v] = l.split(':');
            return { key: k?.trim(), value: v.join(':')?.trim() };
        }).filter(d => d.key);
        return <TeamsStackBlock title={title} details={details} />;
    }

    // 0.2 DNC Block
    if (text.startsWith('[DNC:')) {
        const lines = text.split('\n');
        const title = lines[0].replace('[DNC:', '').replace(']', '').trim();
        const details = lines.slice(1).map(l => {
            const [k, ...v] = l.split(':');
            return { key: k?.trim(), value: v.join(':')?.trim() };
        }).filter(d => d.key);
        return <DNCBlock title={title} details={details} />;
    }

    // 0.3 Callback Block
    if (text.startsWith('[CALLBACK:')) {
        const lines = text.split('\n');
        const title = lines[0].replace('[CALLBACK:', '').replace(']', '').trim();
        const details = lines.slice(1).map(l => {
            const [k, ...v] = l.split(':');
            return { key: k?.trim(), value: v.join(':')?.trim() };
        }).filter(d => d.key);
        return <CallbackBlock title={title} details={details} />;
    }

    // 1. Split by URLs first to preserve links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) => {
        if (part.match(urlRegex)) {
            return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:underline font-bold break-all transition-colors cursor-pointer" onClick={(e) => e.stopPropagation()}>{part}</a>;
        }
        
        // 2. Process Mentions
        const mentionRegex = /(@\w+)/g;
        return part.split(mentionRegex).map((subPart, j) => {
            if (subPart.match(mentionRegex)) {
                return <span key={`${i}-${j}`} className="text-accent-primary font-[700] bg-accent-primary/10 px-1.5 rounded-md mx-0.5 cursor-pointer hover:bg-accent-primary/20 transition-colors">@{subPart.slice(1)}</span>;
            }

            // 3. Process Markdown Styles (Bold, Italic, Strike, Code, Blockquote)
            let segments: React.ReactNode[] = [subPart];
            const rules = [
                { regex: /`([^`]+)`/g, render: (m: string, idx: number) => <code key={`code-${idx}`} className="bg-surface-alt/20 text-accent-primary font-mono px-1 rounded text-xs border border-border-subtle">{m}</code> },
                { regex: /\*\*(.*?)\*\*/g, render: (m: string, idx: number) => <strong key={`bold-${idx}`} className="font-[700] text-text-primary">{m}</strong> },
                { regex: /\*(.*?)\*/g, render: (m: string, idx: number) => <em key={`italic-${idx}`} className="italic opacity-90">{m}</em> },
                { regex: /~(.*?)~/g, render: (m: string, idx: number) => <span key={`strike-${idx}`} className="line-through opacity-70">{m}</span> },
            ];

            rules.forEach(rule => {
                segments = segments.flatMap((seg, k) => {
                    if (typeof seg === 'string') {
                        const parts = seg.split(rule.regex);
                        if (parts.length > 1) {
                            return parts.map((p, pIdx) => {
                                if (pIdx % 2 === 1) return rule.render(p, k + pIdx); // Match content
                                return p; // Normal text
                            });
                        }
                    }
                    return seg;
                });
            });

            return <React.Fragment key={`${i}-${j}`}>{segments}</React.Fragment>;
        });
    });
};

export const RichTextRenderer = React.memo(({ text }: { text: string }) => {
    const lines = text.split('\n');
    return (
        <>
            {lines.map((line, idx) => {
                // Blockquote support
                if (line.startsWith('> ')) {
                    return (
                        <div key={idx} className="border-l-2 border-accent-primary pl-3 my-1 italic text-text-secondary">
                            {parseMarkdown(line.slice(2))}
                        </div>
                    );
                }
                // List support
                if (line.startsWith('- ')) {
                    return (
                        <div key={idx} className="pl-4 relative before:content-['•'] before:absolute before:left-1 before:text-accent-primary">
                            {parseMarkdown(line.slice(2))}
                        </div>
                    );
                }
                return <div key={idx}>{parseMarkdown(line)}</div>;
            })}
        </>
    );
});

export const MessageAttachments = React.memo(({ attachments, isMe, onViewImage }: { attachments: Attachment[], isMe: boolean, onViewImage: (url: string, name: string) => void }) => {
    return (
        <div className="space-y-2 mb-2">
            {attachments.map((at, i) => (
                <div key={i} className="relative group/att">
                    {at.type === 'image' && (
                        <div className="relative group/img cursor-pointer overflow-hidden rounded-2xl" onClick={(e) => { e.stopPropagation(); onViewImage(at.url, at.name); }}>
                            <img 
                                src={at.url} 
                                className={`w-full h-auto border border-black/5 shadow-md group-hover/img:scale-105 transition-transform duration-500 ${at.isScanning ? 'blur-sm grayscale' : ''}`} 
                                alt={at.name} 
                            />
                            {at.isScanning && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-alt/40 backdrop-blur-sm">
                                    <div className="w-12 h-12 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-2"></div>
                                    <span className="text-sm font-mono font-[700] text-accent-secondary  tracking-[0.3em] animate-pulse">Scanning Payload...</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors"></div>
                        </div>
                    )}
                    {at.type === 'audio' && (
                        <div className={`rounded-2xl overflow-hidden ${isMe ? 'bg-black/10 border border-border-subtle' : 'bg-surface-alt border border-border-subtle'}`}>
                            <AudioPlayer src={at.url} />
                        </div>
                    )}
                    {at.type === 'file' && (
                        <div className={`relative flex items-center gap-4 p-4 rounded-2xl border transition-all ${isMe ? 'bg-surface-highlight border-border-strong' : 'bg-surface-alt border-border-subtle'} ${at.isScanning ? 'opacity-50' : ''}`}>
                            <div className="p-2 bg-surface-highlight rounded-xl">
                                {at.isScanning ? <UploadCloud size={24} className="animate-bounce text-accent-secondary" /> : <FileText size={24}/>}
                            </div>
                            <div className="flex-1 truncate min-w-0">
                                <p className="text-xs font-bold truncate">{at.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <p className="text-xs font-mono opacity-50  tracking-wider">{at.size || 'FILE'}</p>
                                    {at.isEncrypted && (
                                        <span className="flex items-center gap-1 text-sm font-mono text-status-success  tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded">
                                            <Lock size={16} fill="currentColor" /> Encrypted
                                        </span>
                                    )}
                                </div>
                            </div>
                            {!at.isScanning && (
                                <button className="opacity-70 hover:opacity-100 p-2 rounded-lg hover:bg-black/10 transition-all" onClick={(e) => { e.stopPropagation(); }}>
                                    <Download size={20} />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Technical Metadata Overlay (Visible on Hover) */}
                    {!at.isScanning && at.md5 && (
                        <div className="absolute -bottom-1 right-2 opacity-0 group-hover/att:opacity-100 transition-opacity pointer-events-none">
                            <div className="bg-black/80 backdrop-blur-md border border-border-subtle px-3 py-1.5 rounded text-xs font-mono text-text-muted  tracking-widest shadow-2xl">
                                MD5: {at.md5}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
});

export const MessagePoll = React.memo(({ poll, isMe, currentUserId, onVote }: { poll: PollData, isMe: boolean, currentUserId: string, onVote?: (optionId: string) => void }) => {
    const totalVotes = poll.options.reduce((acc, o) => acc + o.votes, 0);

    return (
        <div className={`mb-2 p-4 rounded-2xl border ${isMe ? 'bg-black/10 border-border-strong' : 'bg-surface-main border-border-subtle'}`}>
            <div className="flex items-center gap-2 mb-4 font-[700] text-sm">
                <div className={`p-1.5 rounded-lg ${isMe ? 'bg-white/20' : 'bg-accent-primary/10 text-accent-primary'}`}><BarChart2 size={16}/></div>
                {poll.question}
            </div>
            <div className="space-y-2.5">
                {poll.options.map(opt => {
                    const isSelected = opt.voters && opt.voters.includes(currentUserId);
                    const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;

                    return (
                        <div key={opt.id} className="relative group/poll cursor-pointer" onClick={(e) => { e.stopPropagation(); onVote?.(opt.id); }}>
                            <div className={`absolute inset-0 rounded-xl transition-all duration-700 ease-out ${isMe ? 'bg-white/20' : 'bg-accent-primary/10'}`} style={{ width: `${percentage}%` }}></div>
                            <div className={`relative w-full px-4 py-3 text-xs font-bold rounded-xl border flex justify-between items-center transition-colors ${
                                    isSelected 
                                    ? (isMe ? 'border-white ring-1 ring-white/50' : 'border-accent-primary ring-1 ring-accent-primary text-accent-primary font-[700]') 
                                    : (isMe ? 'border-border-strong hover:bg-surface-highlight' : 'border-border-subtle hover:bg-surface-alt')
                                }`}>
                                <span className="flex items-center gap-3 relative z-10">
                                    {isSelected ? <CheckCircle size={16} strokeWidth={3} className={isMe ? 'text-text-primary' : 'text-accent-primary'} /> : <div className={`w-3.5 h-3.5 rounded-full border-2 ${isMe ? 'border-border-subtle' : 'border-border-subtle'}`}></div>}
                                    {opt.text}
                                </span>
                                <span className="text-xs font-mono font-[700] opacity-80">{percentage}%</span>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-3 text-xs opacity-70 text-right font-[700]  tracking-widest">
                {totalVotes} Votes
            </div>
        </div>
    );
});

export const MessageLocation = React.memo(({ location, isMe }: { location: LocationData, isMe: boolean }) => (
    <div className={`mb-2 p-1 rounded-2xl border overflow-hidden ${isMe ? 'bg-black/10 border-border-strong' : 'bg-surface-main border-border-subtle'}`}>
        <div className="h-24 bg-surface-alt relative flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(#a1a1aa_1px,transparent_1px)] [background-size:8px_8px] opacity-20"></div>
            <div className="w-8 h-8 bg-accent-primary rounded-full flex items-center justify-center shadow-lg animate-bounce text-text-primary z-10">
                <MapPin size={16} fill="currentColor"/>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-accent-primary/10 rounded-full animate-ping"></div>
            </div>
        </div>
        <div className="p-3">
            <p className="text-xs font-[700]  tracking-wider opacity-70 flex items-center gap-1">
                <Globe size={16}/> Live Location
            </p>
            <p className="text-xs font-bold mt-1">{location.address}</p>
        </div>
    </div>
));

export const MessageLinkPreview = React.memo(({ preview, isMe }: { preview: LinkPreview, isMe: boolean }) => (
    <div className={`mt-3 rounded-2xl overflow-hidden border ${isMe ? 'border-border-strong bg-black/10' : 'border-border-subtle bg-surface-alt'}`}>
        {preview.image && <div className="h-40 w-full bg-cover bg-center" style={{backgroundImage: `url(${preview.image})`}}></div>}
        <div className="p-4">
            <p className="text-xs font-[700] truncate mb-1">{preview.title}</p>
            <p className="text-sm opacity-70 line-clamp-2 leading-relaxed">{preview.description}</p>
        </div>
    </div>
));

export const MessageActions = ({ 
    isMe, onClose, onReaction, onReply, onEdit, onDelete, msgId 
}: { 
    isMe: boolean, onClose: () => void, onReaction: (id: string, e: string) => void, onReply: () => void, onEdit: () => void, onDelete: () => void, msgId: string 
}) => {
    const [showPicker, setShowPicker] = useState(false);
    const pickerRef = React.useRef<HTMLDivElement>(null);

    return (
        <div className={`absolute -top-12 ${isMe ? 'right-0' : 'left-0'} z-30 flex items-center gap-1 p-1.5 rounded-2xl bg-surface-main/90 backdrop-blur-xl border border-border-subtle shadow-xl animate-in fade-in zoom-in-95 duration-200 select-none`}>
            {['👍', '❤️', '🔥'].map(emoji => (
                <button 
                    key={emoji}
                    onClick={(e) => { e.stopPropagation(); onReaction(msgId, emoji); onClose(); }} 
                    style={{ fontFamily: EMOJI_FONT }} 
                    className="w-8 h-8 flex items-center justify-center hover:bg-surface-alt rounded-xl text-lg transition-transform hover:scale-125 active:scale-95"
                >
                    {emoji}
                </button>
            ))}
            
            <div className="relative" ref={pickerRef}>
                <button 
                    onClick={(e) => { e.stopPropagation(); setShowPicker(!showPicker); }} 
                    className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${showPicker ? 'bg-accent-primary text-text-primary' : 'hover:bg-surface-alt text-text-muted hover:text-text-primary'}`}
                >
                    <Plus size={16} />
                </button>
                {showPicker && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 origin-bottom animate-in zoom-in-95 duration-200" onMouseDown={(e) => e.stopPropagation()}>
                        <EmojiPicker 
                            onSelect={(e) => { onReaction(msgId, e); setShowPicker(false); onClose(); }} 
                            onClose={() => setShowPicker(false)} 
                            className="border border-border-subtle shadow-2xl"
                        />
                    </div>
                )}
            </div>

            <div className="w-px h-5 bg-border-subtle mx-1"></div>
            
            <button onClick={(e) => { e.stopPropagation(); onReply(); onClose(); }} className="p-2 hover:bg-surface-alt rounded-xl text-text-muted hover:text-text-primary transition-all" title="Reply"><Reply size={16}/></button>
            
            {isMe && (
                <>
                    <button onClick={(e) => { e.stopPropagation(); onEdit(); onClose(); }} className="p-2 hover:bg-surface-alt rounded-xl text-text-muted hover:text-text-primary transition-all" title="Edit"><Edit2 size={16}/></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); onClose(); }} className="p-2 hover:bg-red-500/10 rounded-xl text-text-muted hover:text-status-error transition-all" title="Delete"><Trash2 size={16}/></button>
                </>
            )}
        </div>
    );
};

export const ContextBanner = ({ 
    replyTo, editingMsg, onCancel 
}: { 
    replyTo?: { senderName: string, text: string } | null, 
    editingMsg?: { text: string } | null, 
    onCancel?: () => void 
}) => {
    if (!replyTo && !editingMsg) return null;
    
    return (
        <div className="flex items-center justify-between px-6 py-3 border-b border-border-subtle/50 bg-surface-alt/30 rounded-t-[2rem]">
            <div className="flex items-center gap-3 overflow-hidden">
                <div className={`p-1.5 rounded-lg ${editingMsg ? 'bg-amber-500/10 text-status-warning' : 'bg-accent-primary/10 text-accent-primary'}`}>
                    {editingMsg ? <Edit2 size={16}/> : <Quote size={16}/>}
                </div>
                <div className="flex flex-col min-w-0">
                    <span className={`text-xs font-[700]  tracking-widest ${editingMsg ? 'text-status-warning' : 'text-accent-primary'}`}>
                        {editingMsg ? 'Editing Message' : `Replying to ${replyTo?.senderName}`}
                    </span>
                    <span className="text-xs text-text-secondary truncate max-w-[200px] md:max-w-md italic">
                        {editingMsg ? editingMsg.text : replyTo?.text}
                    </span>
                </div>
            </div>
            <button onClick={onCancel} className="p-1 hover:bg-surface-alt rounded-full text-text-muted hover:text-text-primary transition-colors">
                <X size={16}/>
            </button>
        </div>
    );
};

export const DragOverlay = () => (
    <div className="absolute inset-0 z-50 bg-surface-main/90 backdrop-blur-xl flex flex-col items-center justify-center border-4 border-dashed border-accent-primary m-4 rounded-[2rem] animate-in fade-in duration-200 pointer-events-none">
        <div className="w-24 h-24 bg-accent-primary/10 rounded-full flex items-center justify-center mb-6 animate-bounce border border-accent-primary/30 shadow-neon">
            <UploadCloud size={48} className="text-accent-primary" />
        </div>
        <h3 className="text-2xl font-[700]  text-text-primary tracking-widest drop-shadow-md">Drop Payload</h3>
        <p className="text-xs font-bold text-text-muted mt-2">Release to attach files</p>
    </div>
);

export const ScrollToBottomButton = ({ onClick }: { onClick: () => void }) => (
    <button 
        onClick={onClick}
        className="absolute bottom-24 right-8 z-30 p-3 bg-surface-main/90 backdrop-blur-md border border-border-subtle rounded-full shadow-xl text-accent-primary hover:scale-110 transition-transform animate-in fade-in zoom-in hover:shadow-accent-primary/20"
    >
        <ChevronDown size={20} strokeWidth={3} />
    </button>
);