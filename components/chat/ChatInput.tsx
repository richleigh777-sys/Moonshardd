
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

    const bars = [4, 8, 12, 6, 10, 14, 8, 4, 12, 10, 6, 8, 14, 12, 4, 6, 10, 8, 12, 6];

    return (
        <div className={`relative flex flex-col items-center w-full transition-all duration-300 ${isBlocked ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
            
            {/* Smart Suggestions Chips */}
            {!propIsRecording && <div className="mb-2 w-full px-4"><SmartChips chips={smartChips} onSelect={(text) => { setInput(text); sfx.playClick(); textareaRef.current?.focus(); }} /></div>}

            {/* THE CAPSULE (Highly rounded, modern WhatsApp feel) */}
            <div className="relative w-full bg-white flex items-end p-2 md:p-3 gap-2 rounded-3xl shadow-sm border border-gray-200/60">
                
                <NeuralComposer show={showAI} isThinking={isThinking} onAction={() => {}} menuRef={React.createRef()} />

                {/* Slash Commands Dropdown */}
                {showSlashCommands && (
                    <div className="absolute bottom-[calc(100%+8px)] left-0 w-full bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-20">
                        {slashCommands.filter(c => c.cmd.toLowerCase().startsWith(input.toLowerCase())).map((cmd, i) => (
                            <button 
                                key={i} 
                                onClick={() => executeCommand(cmd)}
                                className="w-full text-left px-5 py-3 hover:bg-gray-50 flex items-center justify-between group transition-colors border-b border-gray-100 last:border-0"
                            >
                                <span className="font-mono font-bold text-indigo-500">{cmd.cmd}</span>
                                <span className="text-sm text-gray-500 group-hover:text-gray-700">{cmd.desc}</span>
                            </button>
                        ))}
                        {slashCommands.filter(c => c.cmd.toLowerCase().startsWith(input.toLowerCase())).length === 0 && (
                            <div className="px-5 py-3 text-sm text-gray-500">No matching commands found.</div>
                        )}
                    </div>
                )}

                {/* Context Banner (Reply/Edit) */}
                <div className="absolute bottom-[100%] left-0 w-full pointer-events-none z-10 px-1 pb-1">
                    <ContextBanner replyTo={replyTo} editingMsg={editingMsg} onCancel={onCancelContext} />
                    {isInternal && (
                        <div className="bg-amber-100 text-amber-800 border border-amber-300 transform translate-y-2 text-xs font-bold px-4 py-1.5 rounded-full w-fit mb-2 shadow-sm pointer-events-auto mx-4 z-20 relative">
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
                        className={`w-9 h-9 flex items-center justify-center rounded-full transition-transform duration-300 ${isMenuOpen ? 'bg-gray-100 text-gray-700 rotate-45' : 'bg-transparent text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
                        title="Add attachment"
                    >
                        <Plus size={20} strokeWidth={2.5}/>
                    </button>

                    <button 
                        onClick={() => { setIsInternal(!isInternal); sfx.playClick(); }}
                        className={`w-9 h-9 hidden sm:flex items-center justify-center rounded-full transition-colors ${isInternal ? 'bg-amber-100 text-amber-600' : 'bg-transparent text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
                        title="Toggle Internal Notes"
                    >
                        <Lock size={18} fill={isInternal ? "currentColor" : "none"} strokeWidth={isInternal ? 1 : 2} />
                    </button>
                    
                    {/* Floating Tools Menu */}
                    {isMenuOpen && (
                        <div className="absolute bottom-14 left-0 bg-white border border-gray-200 p-2 rounded-2xl shadow-xl flex flex-col gap-1 w-56 animate-in slide-in-from-bottom-2 zoom-in-95 origin-bottom-left z-50">
                            <button onClick={() => { fileInputRef.current?.click(); setIsMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl text-sm font-semibold text-gray-800 transition-all text-left">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Paperclip size={18}/></div>
                                Document or Image
                            </button>
                            <button onClick={() => { onCreatePoll(); setIsMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl text-sm font-semibold text-gray-800 transition-all text-left">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><BarChart2 size={18}/></div>
                                Create a Poll
                            </button>
                            <button onClick={() => { onShareLocation(); setIsMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl text-sm font-semibold text-gray-800 transition-all text-left">
                                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><MapPin size={18}/></div>
                                Share Location
                            </button>
                            <div className="h-px bg-gray-100 mx-4 my-2"></div>
                            <button onClick={() => { setShowAI(!showAI); setIsMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 rounded-xl text-sm font-bold text-indigo-600 transition-all text-left">
                                <Wand2 size={20}/> Ask AI Assistant
                            </button>
                        </div>
                    )}
                </div>

                {/* CENTER: Input Area */}
                <div className="flex-1 min-w-0 flex items-end">
                    {isRecording ? (
                        <div className="flex items-center gap-3 px-4 py-2.5 bg-red-50 rounded-2xl flex-1 animate-in slide-in-from-right-4 w-full">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-sm shadow-red-500/50"></div>
                            <span className="text-[15px] font-semibold text-red-600">Recording audio...</span>
                            <span className="text-[15px] font-mono font-bold text-red-800 ml-auto bg-white px-2 py-0.5 rounded-lg shadow-sm">{formatDuration(recordTime)}</span>
                        </div>
                    ) : (
                        <div className="relative w-full bg-gray-50/50 border border-transparent focus-within:border-gray-200 focus-within:bg-white rounded-[20px] transition-all flex items-end">
                            <textarea 
                                ref={textareaRef}
                                value={input} 
                                onChange={handleInputChange} 
                                onKeyDown={handleKeyDown}
                                placeholder={placeholder}
                                className="w-full bg-transparent text-gray-800 px-4 py-3 text-[15px] outline-none placeholder:text-gray-400 resize-none custom-scrollbar leading-relaxed max-h-[160px]"
                                rows={1}
                                style={{ fontFamily: EMOJI_FONT }}
                            />
                            
                            <div className="flex items-center mr-2 mb-1.5 shrink-0">
                                {showEmoji ? (
                                    <button onClick={() => setShowEmoji(!showEmoji)} className="p-2 text-indigo-600 bg-indigo-50 rounded-full transition-colors"><Smile size={20}/></button>
                                ) : (
                                    <button onClick={() => setShowEmoji(!showEmoji)} className="p-2 text-gray-400 hover:text-gray-600 transition-colors"><Smile size={20}/></button>
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
                                className="w-10 h-10 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full flex items-center justify-center transition-all bg-white shadow-sm border border-gray-100"
                                title="Cancel Recording"
                            >
                                <X size={20} strokeWidth={2.5}/>
                            </button>
                            <button 
                                onClick={stopRecording} 
                                className="w-11 h-11 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center rounded-full shadow-md shadow-red-500/20 transition-all hover:scale-105 active:scale-95"
                            >
                                <Send size={18} className="translate-x-[1px] translate-y-[1px]" fill="currentColor"/>
                            </button>
                        </div>
                    ) : input.trim() ? (
                        <button 
                            onClick={handleSend} 
                            className="w-11 h-11 bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center rounded-full shadow-sm hover:shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
                        >
                            <Send size={18} className="translate-x-[1px] translate-y-[1px]" fill="currentColor"/>
                        </button>
                    ) : (
                        <button 
                            onClick={startRecording}
                            className="w-11 h-11 bg-white hover:bg-red-50 hover:text-red-500 text-gray-400 flex items-center justify-center rounded-full transition-colors shadow-sm border border-gray-200"
                        >
                            <Mic size={20} strokeWidth={2.5}/>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
