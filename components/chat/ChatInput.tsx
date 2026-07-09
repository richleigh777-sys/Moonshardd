
import React, { useMemo, useEffect } from 'react';
import { 
    Send, Smile, Paperclip, BarChart2, MapPin, Mic, 
    Wand2, Plus, Lock, X
} from 'lucide-react';
import { ChatMessage, User } from '../../types';
import { ContextBanner } from './ChatParts';
import { sfx } from '../../lib/soundService';
import { SmartChips } from './input/SmartChips';
import { NeuralComposer } from './input/NeuralComposer';
import { EmojiPicker } from './EmojiPicker';
import { EMOJI_FONT } from '../../utils/emojis';
import { useChatInputLogic } from './hooks/useChatInputLogic';

interface ChatInputProps {
    input: string;
    setInput: (val: string) => void;
    onSend: (text: string, atts: any[], reply?: any, extras?: any) => void;
    onTyping: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    isRecording: boolean;
    isBlocked: boolean;
    onStartRecording: () => void;
    onStopRecording: () => void;
    onCancelRecording?: () => void;
    recordTime?: number;
    onAttach: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onCreatePoll: () => void;
    onShareLocation: () => void;
    placeholder?: string;
    replyTo?: ChatMessage | null;
    editingMsg?: ChatMessage | null;
    onCancelContext?: () => void;
    users?: User[];
    lastReceivedMessage?: ChatMessage | null;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    input: propInput, setInput: propSetInput, onSend, onTyping: propOnTyping, 
    isRecording: propIsRecording, isBlocked, onAttach, onCreatePoll, onShareLocation,
    placeholder, replyTo, editingMsg, onCancelContext,
    users: _users = [], lastReceivedMessage
}) => {
    const {
        input, setInput,
        isRecording, recordTime,
        startRecording, stopRecording, cancelRecording,
        showEmoji, setShowEmoji,
        showAI, setShowAI,
        isThinking,
        isInternal, setIsInternal,
        handleTyping, handleSend, insertText,
        textareaRef
    } = useChatInputLogic({ onSend, onTyping: propOnTyping });
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (propInput !== input) {
            if(propInput) setInput(propInput);
        }
    }, [propInput, input, setInput]);
    
    useEffect(() => {
        propSetInput(input);
    }, [input, propSetInput]);

    // Auto-resize Textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const newHeight = Math.min(textareaRef.current.scrollHeight, 150);
            textareaRef.current.style.height = `${Math.max(24, newHeight)}px`;
        }
    }, [input, textareaRef]);

    const smartChips = useMemo(() => {
        if (!lastReceivedMessage) return [];
        const text = lastReceivedMessage.text.toLowerCase();
        const chips = [];
        if (text.includes('price')) chips.push({ label: 'Send Pricing', text: "Our standard package starts at..." });
        return chips.slice(0, 3);
    }, [lastReceivedMessage]);

    const [showSlashCommands, setShowSlashCommands] = React.useState(false);
    
    const slashCommands = [
        { cmd: '/lead', desc: 'Share a lead card', text: '[LEAD: New Lead Transfer]\nName: \nPhone: \nStatus: \nNotes: ' },
        { cmd: '/transfer', desc: 'Request transfer', text: 'I need to transfer a call right now. Lead ID: ' },
        { cmd: '/stack', desc: 'Format sale for Sales Group', text: '[SALES_STACK: Sale Block]\nAgent: \nCustomer: \nProduct: $ \nPayment: ' },
        { cmd: '/dnc', desc: 'Flag number as Do Not Call', text: '[DNC: Do Not Call Request]\nPhone: \nReason: ' },
        { cmd: '/callback', desc: 'Schedule a callback', text: '[CALLBACK: Scheduled Callback]\nPhone: \nTime: \nNotes: ' },
        { cmd: '/whisper', desc: 'Toggle internal message mode', action: () => setIsInternal(true) },
        { cmd: '/price', desc: 'Send pricing snippet', text: 'Our standard B2C pricing starts at $49/mo.' }
    ];

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            if (showSlashCommands) {
                // If slash commands menu is open, maybe don't send? For now let's just close it.
                e.preventDefault();
                setShowSlashCommands(false);
            } else {
                e.preventDefault();
                handleSend();
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        handleTyping(e);
        const val = e.target.value;
        if (val.startsWith('/')) {
            setShowSlashCommands(true);
        } else {
            setShowSlashCommands(false);
        }
    };

    const executeCommand = (cmd: any) => {
        if (cmd.action) {
            cmd.action();
            setInput('');
        } else if (cmd.text) {
            setInput(cmd.text);
            textareaRef.current?.focus();
        }
        setShowSlashCommands(false);
    };

    const _bars = [4, 8, 12, 6, 10, 14, 8, 4, 12, 10, 6, 8, 14, 12, 4, 6, 10, 8, 12, 6];

    return (
        <div className={`relative flex flex-col items-center w-full transition-all duration-300 ${isBlocked ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
            
            {/* Smart Suggestions Chips */}
            {!propIsRecording && <div className="mb-2 w-full px-4"><SmartChips chips={smartChips} onSelect={(text) => { setInput(text); sfx.playClick(); textareaRef.current?.focus(); }} /></div>}

            {/* THE CAPSULE (Highly rounded, modern WhatsApp feel) */}
            <div className="relative w-full bg-surface-main flex items-end p-2 md:p-3 gap-2 rounded-xl border border-border-subtle focus-within:border-accent-secondary/60 focus-within:ring-4 focus-within:ring-accent-secondary/15 transition-all duration-300 shadow-float">
                
                <NeuralComposer show={showAI} isThinking={isThinking} onAction={() => {}} menuRef={React.createRef()} />

                {/* Slash Commands Dropdown */}
                {showSlashCommands && (
                    <div className="absolute bottom-[calc(100%+8px)] left-0 w-full bg-surface-main border border-border-subtle rounded-xl shadow-xl overflow-hidden z-20">
                        {slashCommands.filter(c => c.cmd.toLowerCase().startsWith(input.toLowerCase())).map((cmd, i) => (
                            <button 
                                key={i} 
                                onClick={() => executeCommand(cmd)}
                                className="w-full text-left px-5 py-3 hover:bg-surface-highlight flex items-center justify-between group transition-colors border-b border-border-subtle last:border-0"
                            >
                                <span className="font-mono font-bold text-accent-secondary">{cmd.cmd}</span>
                                <span className="text-sm text-text-secondary group-hover:text-text-primary">{cmd.desc}</span>
                            </button>
                        ))}
                        {slashCommands.filter(c => c.cmd.toLowerCase().startsWith(input.toLowerCase())).length === 0 && (
                            <div className="px-5 py-3 text-sm text-text-muted">No matching commands found.</div>
                        )}
                    </div>
                )}

                {/* Context Banner (Reply/Edit) */}
                <div className="absolute bottom-[100%] left-0 w-full pointer-events-none z-10 px-1 pb-1">
                    <ContextBanner replyTo={replyTo} editingMsg={editingMsg} onCancel={onCancelContext} />
                    {isInternal && (
                        <div className="bg-amber-500/15 text-amber-500 border border-amber-500/30 transform translate-y-2 text-sm font-bold px-4 py-1.5 rounded-full w-fit mb-2 shadow-sm pointer-events-auto mx-4 z-20 relative">
                            Internal Mode (Hidden from Customer)
                        </div>
                    )}
                </div>

                {/* LEFT: Tools Trigger */}
                <div className="relative z-20 shrink-0 mb-1 flex items-center gap-1.5 ml-1">
                    <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={onAttach} 
                        multiple 
                        className="hidden" 
                    />
                    
                    {/* Add Menu Button */}
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)} 
                        className={`w-9 h-9 flex items-center justify-center rounded-full transition-transform duration-300 ${isMenuOpen ? 'bg-surface-highlight text-text-primary rotate-45' : 'bg-transparent text-text-muted hover:text-text-primary hover:bg-surface-highlight'}`}
                        title="Add attachment"
                    >
                        <Plus size={20} strokeWidth={2.5}/>
                    </button>

                    <button 
                        onClick={() => { setIsInternal(!isInternal); sfx.playClick(); }}
                        className={`w-9 h-9 hidden sm:flex items-center justify-center rounded-full transition-colors ${isInternal ? 'bg-amber-500/15 text-amber-500' : 'bg-transparent text-text-muted hover:text-text-primary hover:bg-surface-highlight'}`}
                        title="Toggle Internal Notes"
                    >
                        <Lock size={18} fill={isInternal ? "currentColor" : "none"} strokeWidth={isInternal ? 1 : 2} />
                    </button>
                    
                    {/* Floating Tools Menu */}
                    {isMenuOpen && (
                        <div className="absolute bottom-14 left-0 bg-surface-main border border-border-subtle p-2 rounded-xl shadow-xl flex flex-col gap-1 w-56 animate-in slide-in-from-bottom-2 zoom-in-95 origin-bottom-left z-50">
                            <button onClick={() => { fileInputRef.current?.click(); setIsMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-highlight rounded-xl text-sm font-semibold text-text-primary transition-all text-left">
                                <div className="p-2 bg-accent-secondary/10 text-accent-secondary rounded-lg"><Paperclip size={18}/></div>
                                Document or Image
                            </button>
                            <button onClick={() => { onCreatePoll(); setIsMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-highlight rounded-xl text-sm font-semibold text-text-primary transition-all text-left">
                                <div className="p-2 bg-status-success/10 text-status-success rounded-lg"><BarChart2 size={18}/></div>
                                Create a Poll
                            </button>
                            <button onClick={() => { onShareLocation(); setIsMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-highlight rounded-xl text-sm font-semibold text-text-primary transition-all text-left">
                                <div className="p-2 bg-status-error/10 text-status-error rounded-lg"><MapPin size={18}/></div>
                                Share Location
                            </button>
                            <div className="h-px bg-border-subtle mx-4 my-2"></div>
                            <button onClick={() => { setShowAI(!showAI); setIsMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 hover:bg-accent-secondary/10 rounded-xl text-sm font-bold text-accent-secondary transition-all text-left">
                                <Wand2 size={20}/> Ask AI Assistant
                            </button>
                        </div>
                    )}
                </div>

                {/* CENTER: Input Area */}
                <div className="flex-1 min-w-0 flex items-end">
                    {isRecording ? (
                        <div className="flex items-center gap-3 px-4 py-2.5 bg-status-error/15 rounded-xl flex-1 animate-in slide-in-from-right-4 w-full">
                            <div className="w-3 h-3 bg-status-error rounded-full animate-pulse shadow-sm shadow-status-error/50"></div>
                            <span className="text-[15px] font-semibold text-status-error">Recording audio...</span>
                            <span className="text-[15px] font-mono font-bold text-status-error/80 ml-auto bg-surface-main px-2 py-0.5 rounded-lg shadow-sm">{formatDuration(recordTime)}</span>
                        </div>
                    ) : (
                        <div className="relative w-full bg-surface-alt border border-transparent focus-within:border-border-subtle focus-within:bg-surface-main rounded-lg transition-all flex items-end">
                            <textarea 
                                ref={textareaRef}
                                value={input} 
                                onChange={handleInputChange} 
                                onKeyDown={handleKeyDown}
                                placeholder={placeholder}
                                className="w-full bg-transparent text-text-primary px-4 py-3 text-[15px] outline-none placeholder:text-text-muted resize-none custom-scrollbar leading-relaxed max-h-[160px]"
                                rows={1}
                                style={{ fontFamily: EMOJI_FONT }}
                            />
                            
                            <div className="flex items-center mr-2 mb-1.5 shrink-0">
                                {showEmoji ? (
                                    <button onClick={() => setShowEmoji(!showEmoji)} className="p-2 text-accent-secondary bg-accent-secondary/10 rounded-full transition-colors"><Smile size={20}/></button>
                                ) : (
                                    <button onClick={() => setShowEmoji(!showEmoji)} className="p-2 text-text-muted hover:text-text-primary transition-colors"><Smile size={20}/></button>
                                )}
                                
                                {/* Emoji Picker Popover */}
                                {showEmoji && (
                                    <div className="absolute bottom-full right-0 mb-4 z-50 animate-in zoom-in-95 origin-bottom-right">
                                        <EmojiPicker onSelect={(e) => { insertText(e); setShowEmoji(false); }} onClose={() => setShowEmoji(false)} />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT: Actions */}
                <div className="shrink-0 flex items-center mb-1 mr-1">
                    {isRecording ? (
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={cancelRecording}
                                className="w-10 h-10 text-text-muted hover:text-status-error hover:bg-status-error/10 rounded-full flex items-center justify-center transition-all bg-surface-main shadow-sm border border-border-subtle"
                                title="Cancel Recording"
                            >
                                <X size={20} strokeWidth={2.5}/>
                            </button>
                            <button 
                                onClick={stopRecording} 
                                className="w-11 h-11 bg-status-error hover:bg-status-error/90 text-surface-main flex items-center justify-center rounded-full shadow-md shadow-status-error/20 transition-all hover:scale-105 active:scale-95"
                            >
                                <Send size={18} className="translate-x-[1px] translate-y-[1px]" fill="currentColor"/>
                            </button>
                        </div>
                    ) : input.trim() ? (
                        <button 
                            onClick={handleSend} 
                            className="w-11 h-11 bg-accent-secondary hover:bg-accent-secondary/90 text-surface-main flex items-center justify-center rounded-full shadow-sm hover:shadow-accent-secondary/20 transition-all hover:scale-105 active:scale-95"
                        >
                            <Send size={18} className="translate-x-[1px] translate-y-[1px]" fill="currentColor"/>
                        </button>
                    ) : (
                        <button 
                            onClick={startRecording}
                            className="w-11 h-11 bg-surface-main hover:bg-status-error/10 hover:text-status-error text-text-muted flex items-center justify-center rounded-full transition-colors shadow-sm border border-border-subtle"
                        >
                            <Mic size={20} strokeWidth={2.5}/>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
