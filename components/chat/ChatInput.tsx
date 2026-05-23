
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
        { cmd: '/stack', desc: 'Format sale for MS Teams', text: '[TEAMS_STACK: Sale Block]\nAgent: \nCustomer: \nProduct: $ \nPayment: ' },
        { cmd: '/dnc', desc: 'Flag number as Do Not Call', text: '[DNC: Do Not Call Request]\nPhone: \nReason: ' },
        { cmd: '/callback', desc: 'Schedule a callback', text: '[CALLBACK: Scheduled Callback]\nPhone: \nTime: \nNotes: ' },
        { cmd: '/whisper', desc: 'Toggle internal protocol', action: () => setIsInternal(true) },
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

    const bars = [4, 8, 12, 6, 10, 14, 8, 4, 12, 10, 6, 8, 14, 12, 4, 6, 10, 8, 12, 6];

    return (
        <div className={`relative flex flex-col items-center w-full transition-all duration-300 ${isBlocked ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
            
            {/* Smart Suggestions Chips */}
            {!propIsRecording && <div className="mb-2 w-full px-4"><SmartChips chips={smartChips} onSelect={(text) => { setInput(text); sfx.playClick(); textareaRef.current?.focus(); }} /></div>}

            {/* THE CAPSULE */}
            <div className="relative w-full bg-transparent flex items-end p-2 gap-2">
                
                <NeuralComposer show={showAI} isThinking={isThinking} onAction={() => {}} menuRef={React.createRef()} />

                {/* Slash Commands Dropdown */}
                {showSlashCommands && (
                    <div className="absolute bottom-full left-0 w-full mb-2 bg-surface-alt border border-border-subtle rounded-lg shadow-xl overflow-hidden z-20">
                        {slashCommands.filter(c => c.cmd.toLowerCase().startsWith(input.toLowerCase())).map((cmd, i) => (
                            <button 
                                key={i} 
                                onClick={() => executeCommand(cmd)}
                                className="w-full text-left px-4 py-2 hover:bg-surface-highlight flex items-center justify-between group transition-colors"
                            >
                                <span className="font-mono font-semibold text-accent-secondary group-hover:text-indigo-300">{cmd.cmd}</span>
                                <span className="text-xs text-text-muted group-hover:text-text-primary">{cmd.desc}</span>
                            </button>
                        ))}
                        {slashCommands.filter(c => c.cmd.toLowerCase().startsWith(input.toLowerCase())).length === 0 && (
                            <div className="px-4 py-2 text-xs text-text-muted">No matching commands.</div>
                        )}
                    </div>
                )}

                {/* Context Banner (Reply/Edit) */}
                <div className="absolute bottom-full left-0 w-full px-4 pb-2 pointer-events-none z-10">
                    <ContextBanner replyTo={replyTo} editingMsg={editingMsg} onCancel={onCancelContext} />
                    {isInternal && (
                        <div className="bg-amber-500/20 text-amber-200 border border-status-warning/30 text-xs font-semibold px-3 py-1 rounded-md w-fit mb-2 shadow-sm pointer-events-auto">
                            Internal Protocol Active
                        </div>
                    )}
                </div>

                {/* LEFT: Tools Trigger */}
                <div className="relative z-20 shrink-0 mb-0.5 flex flex-col gap-2">
                    <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={onAttach} 
                        multiple 
                        className="hidden" 
                    />
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)} 
                        className={`w-8 h-8 flex items-center justify-center rounded-md transition-all ${isMenuOpen ? 'bg-gray-700 text-text-primary rotate-45' : 'bg-surface-main text-text-muted hover:text-text-primary hover:bg-surface-highlight'}`}
                        title="Add attachment"
                    >
                        <Plus size={18} />
                    </button>

                    <button 
                        onClick={() => { setIsInternal(!isInternal); sfx.playClick(); }}
                        className={`w-8 h-8 flex items-center justify-center rounded-md transition-all ${isInternal ? 'bg-amber-500/20 text-status-warning' : 'bg-surface-main text-text-muted hover:text-text-primary hover:bg-surface-highlight'}`}
                        title="Toggle Internal Protocol"
                    >
                        <Lock size={16} fill={isInternal ? "currentColor" : "none"} />
                    </button>
                    
                    {/* Floating Tools Menu */}
                    {isMenuOpen && (
                        <div className="absolute bottom-20 left-0 bg-surface-alt border border-border-subtle p-2 rounded-lg shadow-xl flex flex-col gap-1 w-48 animate-in slide-in-from-bottom-2 zoom-in-95 origin-bottom-left z-50">
                            <button onClick={() => { fileInputRef.current?.click(); setIsMenuOpen(false); }} className="flex items-center gap-3 px-3 py-2 hover:bg-surface-highlight rounded-md text-sm font-medium text-text-primary transition-all text-left"><Paperclip size={16}/> Attach File</button>
                            <button onClick={() => { onCreatePoll(); setIsMenuOpen(false); }} className="flex items-center gap-3 px-3 py-2 hover:bg-surface-highlight rounded-md text-sm font-medium text-text-primary transition-all text-left"><BarChart2 size={16}/> Create Poll</button>
                            <button onClick={() => { onShareLocation(); setIsMenuOpen(false); }} className="flex items-center gap-3 px-3 py-2 hover:bg-surface-highlight rounded-md text-sm font-medium text-text-primary transition-all text-left"><MapPin size={16}/> Location</button>
                            <div className="h-px bg-gray-700 mx-2 my-1"></div>
                            <button onClick={() => { setShowAI(!showAI); setIsMenuOpen(false); }} className="flex items-center gap-3 px-3 py-2 hover:bg-indigo-500/20 rounded-md text-sm font-medium text-accent-secondary transition-all text-left"><Wand2 size={16}/> AI Assist</button>
                        </div>
                    )}
                </div>

                {/* CENTER: Input Area */}
                <div className="flex-1 min-w-0 relative bg-surface-main rounded-lg p-1.5 flex items-end">
                    {isRecording ? (
                        <div className="flex items-center gap-3 px-3 py-2 animate-in fade-in slide-in-from-left-4 w-full">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-semibold text-status-error">Recording</span>
                            </div>
                            <div className="h-4 w-px bg-gray-600"></div>
                            <span className="text-sm font-mono text-text-primary">{formatDuration(recordTime)}</span>
                            <div className="flex-1 flex items-center gap-1 overflow-hidden opacity-50">
                                {bars.map((h, i) => (
                                    <div key={i} className="w-0.5 bg-red-500 rounded-full" style={{ height: `${h}px` }}></div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <textarea 
                            ref={textareaRef}
                            value={input} 
                            onChange={handleInputChange} 
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            className="w-full bg-transparent text-text-primary px-3 py-1.5 text-sm outline-none placeholder:text-text-muted resize-none custom-scrollbar leading-relaxed max-h-[200px]"
                            rows={1}
                            style={{ fontFamily: EMOJI_FONT }}
                        />
                    )}

                    <div className="flex items-center mr-1 mb-0.5 shrink-0">
                        {showEmoji ? (
                            <button onClick={() => setShowEmoji(!showEmoji)} className="p-1.5 text-accent-secondary bg-indigo-500/20 rounded-md transition-colors"><Smile size={18}/></button>
                        ) : (
                            !isRecording && <button onClick={() => setShowEmoji(!showEmoji)} className="p-1.5 text-text-muted hover:text-text-primary transition-colors"><Smile size={18}/></button>
                        )}
                        
                        {/* Emoji Picker Popover */}
                        {showEmoji && (
                            <div className="absolute bottom-full right-0 mb-4 z-50">
                                <EmojiPicker onSelect={(e) => { insertText(e); setShowEmoji(false); }} onClose={() => setShowEmoji(false)} />
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Actions */}
                <div className="shrink-0 flex items-center mb-1">
                    {isRecording ? (
                        <div className="flex items-center gap-1.5">
                            <button 
                                onClick={cancelRecording}
                                className="p-2 text-text-muted hover:text-status-error hover:bg-surface-main rounded-md transition-all"
                                title="Cancel Recording"
                            >
                                <X size={18} />
                            </button>
                            <button 
                                onClick={stopRecording} 
                                className="w-9 h-9 bg-red-500 hover:bg-red-600 text-text-primary flex items-center justify-center rounded-md shadow-sm transition-all"
                            >
                                <Send size={16} className="ml-0.5" fill="currentColor"/>
                            </button>
                        </div>
                    ) : input.trim() ? (
                        <button 
                            onClick={handleSend} 
                            className="w-9 h-9 bg-indigo-500 hover:bg-indigo-600 text-text-primary flex items-center justify-center rounded-md shadow-sm transition-all"
                        >
                            <Send size={16} className="ml-0.5" fill="currentColor"/>
                        </button>
                    ) : (
                        <button 
                            onClick={startRecording}
                            className="w-9 h-9 bg-surface-main hover:bg-red-500/20 hover:text-status-error text-text-muted flex items-center justify-center rounded-md transition-all shadow-sm"
                        >
                            <Mic size={18}/>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
