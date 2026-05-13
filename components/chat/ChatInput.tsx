
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

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const bars = [4, 8, 12, 6, 10, 14, 8, 4, 12, 10, 6, 8, 14, 12, 4, 6, 10, 8, 12, 6];

    return (
        <div className={`relative flex flex-col items-center w-full transition-all duration-500 ${isBlocked ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
            
            {/* Smart Suggestions Chips */}
            {!propIsRecording && <div className="mb-2"><SmartChips chips={smartChips} onSelect={(text) => { setInput(text); sfx.playClick(); textareaRef.current?.focus(); }} /></div>}

            {/* THE CAPSULE */}
            <div className="relative w-full bg-transparent flex items-end p-2">
                
                <NeuralComposer show={showAI} isThinking={isThinking} onAction={() => {}} menuRef={React.createRef()} />

                {/* Context Banner (Reply/Edit) */}
                <div className="absolute bottom-full left-0 w-full px-4 pb-2 pointer-events-none">
                    <ContextBanner replyTo={replyTo} editingMsg={editingMsg} onCancel={onCancelContext} />
                    {isInternal && (
                        <div className="bg-amber-500 text-black text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full w-fit mb-2 shadow-lg animate-in slide-in-from-bottom-2">
                            Internal Protocol Active
                        </div>
                    )}
                </div>

                {/* LEFT: Tools Trigger */}
                <div className="relative z-20 shrink-0 mb-1 flex items-center gap-2">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={onAttach} 
                        multiple 
                        className="hidden" 
                    />
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)} 
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all shadow-lg ${isMenuOpen ? 'bg-white text-black rotate-45' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'}`}
                    >
                        <Plus size={16} />
                    </button>

                    <button 
                        onClick={() => { setIsInternal(!isInternal); sfx.playClick(); }}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all border ${isInternal ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-white/5 text-slate-500 border-white/5 hover:text-slate-300'}`}
                        title="Toggle Internal Protocol"
                    >
                        <Lock size={14} fill={isInternal ? "currentColor" : "none"} />
                    </button>
                    
                    {/* Floating Tools Menu */}
                    {isMenuOpen && (
                        <div className="absolute bottom-16 left-0 bg-slate-900/95 backdrop-blur-2xl border border-white/10 p-2.5 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex flex-col gap-1.5 w-52 animate-in slide-in-from-bottom-4 zoom-in-95 origin-bottom-left z-50">
                            <button onClick={() => { fileInputRef.current?.click(); setIsMenuOpen(false); }} className="flex items-center gap-3.5 p-3 hover:bg-white/5 rounded-2xl text-[13px] font-bold text-slate-300 hover:text-white transition-all text-left"><Paperclip size={18}/> Attach File</button>
                            <button onClick={() => { onCreatePoll(); setIsMenuOpen(false); }} className="flex items-center gap-3.5 p-3 hover:bg-white/5 rounded-2xl text-[13px] font-bold text-slate-300 hover:text-white transition-all text-left"><BarChart2 size={18}/> Create Poll</button>
                            <button onClick={() => { onShareLocation(); setIsMenuOpen(false); }} className="flex items-center gap-3.5 p-3 hover:bg-white/5 rounded-2xl text-[13px] font-bold text-slate-300 hover:text-white transition-all text-left"><MapPin size={18}/> Share Location</button>
                            <div className="h-px bg-white/10 mx-3 my-1"></div>
                            <button onClick={() => { setShowAI(!showAI); setIsMenuOpen(false); }} className="flex items-center gap-3.5 p-3 hover:bg-accent-primary/20 rounded-2xl text-[13px] font-bold text-accent-primary transition-all text-left"><Wand2 size={18}/> AI Assist</button>
                        </div>
                    )}
                </div>

                {/* CENTER: Input Area */}
                <div className="flex-1 min-w-0 mx-2 mb-1.5 relative">
                    {isRecording ? (
                        <div className="flex items-center gap-3 px-2 py-1.5 animate-in fade-in slide-in-from-left-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="text-[11px] font-mono font-black text-red-500 uppercase tracking-widest">Recording</span>
                            </div>
                            <div className="h-4 w-px bg-white/10"></div>
                            <span className="text-[11px] font-mono text-white/70">{formatDuration(recordTime)}</span>
                            <div className="flex-1 flex items-center gap-1 overflow-hidden opacity-30">
                                {bars.map((h, i) => (
                                    <div key={i} className="w-0.5 bg-red-500 rounded-full" style={{ height: `${h}px` }}></div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <textarea 
                            ref={textareaRef}
                            value={input} 
                            onChange={handleTyping} 
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            className="w-full bg-transparent text-white px-2 py-1 text-xs font-medium outline-none placeholder:text-slate-500 resize-none custom-scrollbar leading-relaxed max-h-[120px]"
                            rows={1}
                            style={{ fontFamily: EMOJI_FONT }}
                        />
                    )}
                </div>

                {/* RIGHT: Actions */}
                <div className="flex items-center gap-1.5 mb-1">
                    {!isRecording && <button onClick={() => setShowEmoji(!showEmoji)} className="p-1.5 text-slate-500 hover:text-yellow-400 transition-all hover:scale-110"><Smile size={16}/></button>}
                    
                    {isRecording ? (
                        <div className="flex items-center gap-1.5">
                            <button 
                                onClick={cancelRecording}
                                className="p-1.5 text-slate-500 hover:text-red-500 transition-all"
                                title="Cancel Recording"
                            >
                                <X size={16} />
                            </button>
                            <button 
                                onClick={stopRecording} 
                                className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center rounded-lg shadow-xl shadow-red-500/30 transition-all hover:scale-110 active:scale-90"
                            >
                                <Send size={14} className="ml-0.5" fill="currentColor"/>
                            </button>
                        </div>
                    ) : input.trim() ? (
                        <button 
                            onClick={handleSend} 
                            className="w-8 h-8 bg-accent-primary hover:bg-accent-primary/90 text-white flex items-center justify-center rounded-lg shadow-xl shadow-accent-primary/30 transition-all hover:scale-110 active:scale-90"
                        >
                            <Send size={14} className="ml-0.5" fill="currentColor"/>
                        </button>
                    ) : (
                        <button 
                            onClick={startRecording}
                            className="w-8 h-8 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-500 flex items-center justify-center rounded-lg transition-all hover:scale-110 active:scale-90 border border-white/5 hover:border-red-500/50 shadow-lg"
                        >
                            <Mic size={16}/>
                        </button>
                    )}
                </div>

                {/* Emoji Picker Popover */}
                {showEmoji && (
                    <div className="absolute bottom-full right-0 mb-4 z-50">
                        <EmojiPicker onSelect={(e) => { insertText(e); setShowEmoji(false); }} onClose={() => setShowEmoji(false)} />
                    </div>
                )}
            </div>
        </div>
    );
};
