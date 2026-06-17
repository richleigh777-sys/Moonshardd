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
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 my-2 w-full max-w-[300px] font-sans break-words shadow-sm text-gray-800">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-amber-200/60">
                <div className="p-2 bg-amber-400 text-amber-900 rounded-full">
                    <FileText size={16} />
                </div>
                <span className="text-sm font-semibold">{title}</span>
            </div>
            <div className="space-y-2">
                {details.map((d, i) => (
                    <div key={i} className="flex justify-between items-start text-sm">
                        <span className="text-amber-700/80 font-medium shrink-0 mr-2">{d.key}:</span>
                        <span className="text-gray-900 font-semibold text-right break-words">{d.value || '-'}</span>
                    </div>
                ))}
            </div>
            <button 
                onClick={() => setOpened(true)}
                className={`mt-4 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${opened ? 'bg-amber-200/50 text-amber-800 cursor-default' : 'bg-amber-400 hover:bg-amber-500 text-amber-950'}`}
            >
                {opened ? 'Opened' : 'Open Details'}
            </button>
        </div>
    );
};

const TeamsStackBlock = ({ title, details }: { title: string, details: any[] }) => {
    const [sent, setSent] = useState(false);
    return (
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 my-2 w-full max-w-[320px] font-sans break-words shadow-sm relative overflow-hidden text-gray-800">
            <div className="absolute -right-4 -top-4 text-sky-200/40">
                <Globe size={80} />
            </div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-sky-200/60 relative z-10">
                <div className="p-2 bg-sky-400 rounded-full text-white shadow-sm shadow-sky-400/50">
                    <Zap size={16} fill="currentColor" />
                </div>
                <span className="text-sm font-semibold text-sky-900">{title}</span>
            </div>
            <div className="space-y-2 relative z-10">
                {details.map((d, i) => (
                    <div key={i} className="flex justify-between items-start text-sm">
                        <span className="text-sky-700/80 font-medium shrink-0 mr-2">{d.key}:</span>
                        <span className="text-gray-900 font-semibold text-right break-words">{d.value || '-'}</span>
                    </div>
                ))}
            </div>
            <button 
                onClick={() => setSent(true)}
                className={`mt-4 w-full py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm relative z-10 flex items-center justify-center gap-2 ${sent ? 'bg-sky-200/50 text-sky-800 cursor-default shadow-none hover:shadow-none' : 'bg-sky-400 hover:bg-sky-500 text-white shadow-sky-400/20 hover:shadow-sky-400/40'}`}
            >
                {sent ? <><CheckCircle size={16} /> Shared with Team</> : <><Globe size={16} /> Share with Team</>}
            </button>
        </div>
    );
};

const DNCBlock = ({ title, details }: { title: string, details: any[] }) => {
    const [confirmed, setConfirmed] = useState(false);
    return (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 my-2 w-full max-w-[300px] font-sans break-words shadow-sm text-gray-800">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-rose-200/60">
                <div className="p-2 bg-rose-400 text-white rounded-full shadow-sm">
                    <PhoneOff size={16} />
                </div>
                <span className="text-sm font-semibold text-rose-900">{title}</span>
            </div>
            <div className="space-y-2">
                {details.map((d, i) => (
                    <div key={i} className="flex justify-between items-start text-sm">
                        <span className="text-rose-700/80 font-medium mr-2">{d.key}:</span>
                        <span className="text-gray-900 font-semibold break-words">{d.value || '-'}</span>
                    </div>
                ))}
            </div>
            <button 
                onClick={() => setConfirmed(true)}
                className={`mt-4 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors border ${confirmed ? 'bg-rose-100 text-rose-800 border-transparent cursor-default' : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-300'}`}
            >
                {confirmed ? 'Marked as Do Not Call' : 'Mark as Do Not Call'}
            </button>
        </div>
    );
};

const CallbackBlock = ({ title, details }: { title: string, details: any[] }) => {
    const [scheduled, setScheduled] = useState(false);
    return (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 my-2 w-full max-w-[300px] font-sans break-words shadow-sm text-gray-800">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-orange-200/60">
                <div className="p-2 bg-orange-400 text-white rounded-full shadow-sm">
                    <CalendarClock size={16} />
                </div>
                <span className="text-sm font-semibold text-orange-900">{title}</span>
            </div>
            <div className="space-y-2">
                {details.map((d, i) => (
                    <div key={i} className="flex justify-between items-start text-sm">
                        <span className="text-orange-700/80 font-medium mr-2">{d.key}:</span>
                        <span className="text-gray-900 font-semibold break-words">{d.value || '-'}</span>
                    </div>
                ))}
            </div>
            <button 
                onClick={() => setScheduled(true)}
                className={`mt-4 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm ${scheduled ? 'bg-orange-200/50 text-orange-800 cursor-default shadow-none' : 'bg-orange-400 hover:bg-orange-500 text-white'}`}
            >
                {scheduled ? 'Scheduled' : 'Save Reminder'}
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
            return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:underline font-semibold break-all transition-colors cursor-pointer" onClick={(e) => e.stopPropagation()}>{part}</a>;
        }
        
        // 2. Process Mentions
        const mentionRegex = /(@\w+)/g;
        return part.split(mentionRegex).map((subPart, j) => {
            if (subPart.match(mentionRegex)) {
                return <span key={`${i}-${j}`} className="text-accent-primary font-bold bg-accent-primary/10 px-2 py-0.5 rounded-lg mx-0.5 cursor-pointer hover:bg-accent-primary/20 transition-colors">@{subPart.slice(1)}</span>;
            }

            // 3. Process Markdown Styles (Bold, Italic, Strike, Code, Blockquote)
            let segments: React.ReactNode[] = [subPart];
            const rules = [
                { regex: /`([^`]+)`/g, render: (m: string, idx: number) => <code key={`code-${idx}`} className="bg-black/5 text-gray-700 font-mono px-1.5 py-0.5 rounded-md text-[13px] border border-black/5">{m}</code> },
                { regex: /\*\*(.*?)\*\*/g, render: (m: string, idx: number) => <strong key={`bold-${idx}`} className="font-bold">{m}</strong> },
                { regex: /\*(.*?)\*/g, render: (m: string, idx: number) => <em key={`italic-${idx}`} className="italic">{m}</em> },
                { regex: /~(.*?)~/g, render: (m: string, idx: number) => <span key={`strike-${idx}`} className="line-through opacity-60">{m}</span> },
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
                        <div key={idx} className="border-l-4 border-indigo-400 pl-4 my-2 italic text-gray-600 bg-indigo-50/50 py-2 pr-2 rounded-r-2xl">
                            {parseMarkdown(line.slice(2))}
                        </div>
                    );
                }
                // List support
                if (line.startsWith('- ')) {
                    return (
                        <div key={idx} className="pl-6 relative before:content-['•'] before:absolute before:left-2 before:-top-0.5 before:text-indigo-400 before:text-lg my-1">
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
        <div className="space-y-2.5 mb-3">
            {attachments.map((at, i) => (
                <div key={i} className="relative group/att">
                    {at.type === 'image' && (
                        <div className="relative group/img cursor-pointer overflow-hidden rounded-xl" onClick={(e) => { e.stopPropagation(); onViewImage(at.url, at.name); }}>
                            <img 
                                src={at.url} 
                                className={`w-full h-auto border-2 border-black/5 shadow-sm group-hover/img:scale-105 transition-transform duration-500 rounded-xl ${at.isScanning ? 'blur-sm grayscale' : ''}`} 
                                alt={at.name} 
                            />
                            {at.isScanning && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md">
                                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mb-3 shadow-md"></div>
                                    <span className="text-sm font-semibold text-indigo-700 tracking-wide animate-pulse bg-white/80 px-4 py-1.5 rounded-full shadow-sm">Checking picture...</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/5 transition-colors rounded-xl"></div>
                        </div>
                    )}
                    {at.type === 'audio' && (
                        <div className={`rounded-xl overflow-hidden ${isMe ? 'bg-indigo-600 border border-indigo-400' : 'bg-surface-alt border border-border-subtle'}`}>
                            <AudioPlayer src={at.url} />
                        </div>
                    )}
                    {at.type === 'file' && (
                        <div className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all ${isMe ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-surface-main border-border-subtle'} ${at.isScanning ? 'opacity-60' : ''}`}>
                            <div className={`p-3 rounded-xl shadow-sm ${isMe ? 'bg-indigo-400/50' : 'bg-surface-highlight'}`}>
                                {at.isScanning ? <UploadCloud size={24} className={`animate-bounce ${isMe ? 'text-white' : 'text-accent-secondary'}`} /> : <FileText size={24}/>}
                            </div>
                            <div className="flex-1 truncate min-w-0">
                                <p className="text-sm font-bold truncate mb-0.5">{at.name}</p>
                                <div className="flex items-center gap-2">
                                    <p className={`text-sm font-medium ${isMe ? 'opacity-80' : 'opacity-60'}`}>{at.size || 'Document'}</p>
                                    {at.isEncrypted && (
                                        <span className={`flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-full ${isMe ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                                            <Lock size={12} fill="currentColor" /> Safe
                                        </span>
                                    )}
                                </div>
                            </div>
                            {!at.isScanning && (
                                <button className={`opacity-80 hover:opacity-100 p-2.5 rounded-xl transition-all ${isMe ? 'hover:bg-white/20' : 'hover:bg-black/5'}`} onClick={(e) => { e.stopPropagation(); }}>
                                    <Download size={20} />
                                </button>
                            )}
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
        <div className={`mb-3 p-5 rounded-xl border ${isMe ? 'bg-indigo-500/90 border-indigo-400/50 text-white' : 'bg-surface-main border-border-subtle'}`}>
            <div className="flex items-start gap-3 mb-5 font-bold text-base leading-snug">
                <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${isMe ? 'bg-white/20' : 'bg-indigo-100 text-indigo-600'}`}><BarChart2 size={18}/></div>
                {poll.question}
            </div>
            <div className="space-y-3">
                {poll.options.map(opt => {
                    const isSelected = opt.voters && opt.voters.includes(currentUserId);
                    const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;

                    return (
                        <div key={opt.id} className="relative group/poll cursor-pointer" onClick={(e) => { e.stopPropagation(); onVote?.(opt.id); }}>
                            <div className={`absolute inset-0 rounded-xl transition-all duration-700 ease-out ${isMe ? 'bg-white/20' : 'bg-indigo-50'}`} style={{ width: `${percentage}%` }}></div>
                            <div className={`relative w-full px-4 py-3.5 text-sm font-semibold rounded-xl border-2 flex justify-between items-center transition-all ${
                                    isSelected 
                                    ? (isMe ? 'border-white bg-white/10 shadow-sm' : 'border-indigo-400 bg-white shadow-sm text-indigo-700') 
                                    : (isMe ? 'border-indigo-400/30 hover:bg-white/10' : 'border-border-subtle hover:bg-surface-alt bg-white')
                                }`}>
                                <span className="flex items-center gap-3 relative z-10 w-full">
                                    {isSelected ? <CheckCircle size={18} strokeWidth={2.5} className={isMe ? 'text-white shrink-0' : 'text-indigo-500 shrink-0'} /> : <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${isMe ? 'border-white/50' : 'border-gray-300'}`}></div>}
                                    <span className="truncate pr-4">{opt.text}</span>
                                </span>
                                <span className={`text-[13px] font-bold shrink-0 ${isMe ? 'opacity-90' : 'text-gray-500'}`}>{percentage}%</span>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className={`mt-4 text-sm font-medium text-right ${isMe ? 'opacity-80' : 'text-gray-500'}`}>
                {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
            </div>
        </div>
    );
});

export const MessageLocation = React.memo(({ location, isMe }: { location: LocationData, isMe: boolean }) => (
    <div className={`mb-3 p-1.5 rounded-xl border overflow-hidden ${isMe ? 'bg-indigo-500/90 border-indigo-400/50' : 'bg-surface-main border-border-subtle'}`}>
        <div className="h-32 bg-gray-100 relative items-center justify-center rounded-xl overflow-hidden shadow-inner">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')] opacity-20"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center shadow-xl animate-bounce text-white z-10">
                    <MapPin size={20} fill="currentColor"/>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 bg-indigo-500/10 rounded-full animate-ping"></div>
                </div>
            </div>
        </div>
        <div className={`p-4 ${isMe ? 'text-white' : 'text-gray-800'}`}>
            <p className="text-sm font-semibold opacity-80 flex items-center gap-1.5 mb-1">
                <Globe size={16}/> Shared Location
            </p>
            <p className="text-[15px] font-medium leading-snug">{location.address}</p>
        </div>
    </div>
));

export const MessageLinkPreview = React.memo(({ preview, isMe }: { preview: LinkPreview, isMe: boolean }) => (
    <div className={`mt-3 rounded-xl overflow-hidden border transition-shadow hover:shadow-md ${isMe ? 'border-indigo-400/50 bg-indigo-500/30' : 'border-border-subtle bg-surface-main'}`}>
        {preview.image && <div className="h-44 w-full bg-cover bg-center border-b border-black/5" style={{backgroundImage: `url(${preview.image})`}}></div>}
        <div className={`p-4 ${isMe ? 'text-white' : 'text-gray-800'}`}>
            <p className="text-[15px] font-bold truncate mb-1.5">{preview.title}</p>
            <p className={`text-[13px] leading-relaxed line-clamp-2 ${isMe ? 'opacity-80' : 'text-gray-500'}`}>{preview.description}</p>
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
        <div className={`absolute -top-12 ${isMe ? 'right-0' : 'left-0'} z-30 flex items-center gap-1 p-1.5 rounded-xl bg-surface-main/95 backdrop-blur-xl border border-border-subtle shadow-lg animate-in fade-in zoom-in-95 duration-200 select-none`}>
            {['👍', '❤️', '😂', '🎉'].map(emoji => (
                <button 
                    key={emoji}
                    onClick={(e) => { e.stopPropagation(); onReaction(msgId, emoji); onClose(); }} 
                    style={{ fontFamily: EMOJI_FONT }} 
                    className="w-9 h-9 flex items-center justify-center hover:bg-surface-alt rounded-xl text-xl transition-transform hover:scale-125 active:scale-95"
                >
                    {emoji}
                </button>
            ))}
            
            <div className="relative" ref={pickerRef}>
                <button 
                    onClick={(e) => { e.stopPropagation(); setShowPicker(!showPicker); }} 
                    className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${showPicker ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-surface-alt text-gray-400 hover:text-gray-700'}`}
                >
                    <Plus size={18} />
                </button>
                {showPicker && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 origin-bottom animate-in zoom-in-95 duration-200" onMouseDown={(e) => e.stopPropagation()}>
                        <EmojiPicker 
                            onSelect={(e) => { onReaction(msgId, e); setShowPicker(false); onClose(); }} 
                            onClose={() => setShowPicker(false)} 
                            className="border border-border-subtle shadow-2xl rounded-xl overflow-hidden"
                        />
                    </div>
                )}
            </div>

            <div className="w-px h-6 bg-border-subtle mx-1"></div>
            
            <button onClick={(e) => { e.stopPropagation(); onReply(); onClose(); }} className="p-2.5 hover:bg-surface-alt rounded-xl text-gray-500 hover:text-indigo-600 transition-all font-medium flex items-center gap-1.5" title="Reply"><Reply size={16}/> <span className="hidden sm:inline text-sm">Reply</span></button>
            
            {isMe && (
                <>
                    <button onClick={(e) => { e.stopPropagation(); onEdit(); onClose(); }} className="p-2.5 hover:bg-surface-alt rounded-xl text-gray-400 hover:text-gray-700 transition-all" title="Edit"><Edit2 size={16}/></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); onClose(); }} className="p-2.5 hover:bg-rose-50 rounded-xl text-gray-400 hover:text-rose-500 transition-all" title="Delete"><Trash2 size={16}/></button>
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
        <div className="flex items-center justify-between px-4 py-4 border-b border-border-subtle/50 bg-indigo-50/30 rounded-t-[2.5rem]">
            <div className="flex items-center gap-3.5 overflow-hidden">
                <div className={`p-2.5 rounded-xl ${editingMsg ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-500 shadow-sm'}`}>
                    {editingMsg ? <Edit2 size={18}/> : <Reply size={18} className="scale-110"/>}
                </div>
                <div className="flex flex-col min-w-0">
                    <span className={`text-[13px] font-bold ${editingMsg ? 'text-amber-600' : 'text-indigo-600'}`}>
                        {editingMsg ? 'Editing your message' : `Reply to ${replyTo?.senderName}`}
                    </span>
                    <span className="text-sm text-gray-500 truncate max-w-[200px] md:max-w-md">
                        {editingMsg ? editingMsg.text : replyTo?.text}
                    </span>
                </div>
            </div>
            <button onClick={onCancel} className="p-2 hover:bg-black/5 rounded-full text-gray-400 hover:text-gray-700 transition-colors">
                <X size={20}/>
            </button>
        </div>
    );
};

export const DragOverlay = () => (
    <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-xl flex flex-col items-center justify-center border-4 border-dashed border-indigo-400 m-6 rounded-[3rem] animate-in fade-in duration-200 pointer-events-none">
        <div className="w-28 h-28 bg-indigo-100 rounded-full flex items-center justify-center mb-6 animate-bounce shadow-lg">
            <UploadCloud size={56} className="text-indigo-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 drop-shadow-sm">Drop here!</h3>
        <p className="text-base font-medium text-gray-500 mt-3">Release your files to add them to the chat</p>
    </div>
);

export const ScrollToBottomButton = ({ onClick }: { onClick: () => void }) => (
    <button 
        onClick={onClick}
        className="absolute bottom-24 right-8 z-30 p-3 bg-white/90 backdrop-blur-md border border-border-subtle rounded-full shadow-lg text-indigo-500 hover:scale-105 active:scale-95 transition-all animate-in fade-in zoom-in hover:shadow-indigo-500/20"
    >
        <ChevronDown size={24} strokeWidth={3} />
    </button>
);
