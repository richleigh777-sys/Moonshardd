
import React, { useState } from 'react';
import { X, Play, Pause, FastForward, Rewind, Type } from 'lucide-react';
import { Button } from '../../ui/Base';
import { useAutoScroll } from './hooks/useAutoScroll';

interface TeleprompterOverlayProps {
    content: string;
    title: string;
    onClose: () => void;
}

export const TeleprompterOverlay: React.FC<TeleprompterOverlayProps> = ({ content, title, onClose }) => {
    const { isPlaying, togglePlay, scrollSpeed, adjustSpeed, scrollerRef } = useAutoScroll(2);
    const [fontSize, setFontSize] = useState(32);
    const [mirrorMode] = useState(false);

    // Highlight variables in content
    const processedContent = content.split(/(\{\{.*?\}\})|(\[.*?\])/g).filter(Boolean).map((part, i) => {
        if (part.match(/^\{\{.*?\}\}$/) || part.match(/^\[.*?\]$/)) {
            return <span key={i} className="text-accent-primary font-[700] bg-accent-primary/10 px-1 rounded mx-1">{part}</span>;
        }
        return part;
    });

    return (
        <div className="fixed inset-0 z-[300] bg-black flex flex-col animate-in fade-in duration-300">
            {/* Header Controls */}
            <div className="h-20 border-b border-border-subtle flex justify-between items-center px-8 shrink-0 bg-[#09090b] text-white">
                <div className="flex flex-col">
                    <h2 className="text-xl font-[700] text-white  tracking-tight flex items-center gap-2">
                        {title} <span className="text-xs bg-red-500 text-white px-2.5 py-1 rounded-full animate-pulse">LIVE</span>
                    </h2>
                    <p className="text-xs font-bold text-text-muted  tracking-[0.2em]">Teleprompter Mode</p>
                </div>
                
                <div className="flex items-center gap-4">
                    {/* Font Size */}
                    <div className="flex items-center gap-1 bg-surface-highlight p-1 rounded-xl border border-border-subtle">
                        <button onClick={() => setFontSize(s => Math.max(16, s - 4))} className="p-2 hover:bg-surface-highlight rounded-lg text-text-muted hover:text-white transition-colors"><Type size={16} className="scale-75"/></button>
                        <span className="text-xs font-mono font-bold w-8 text-center text-white">{fontSize}</span>
                        <button onClick={() => setFontSize(s => Math.min(96, s + 4))} className="p-2 hover:bg-surface-highlight rounded-lg text-text-muted hover:text-white transition-colors"><Type size={18}/></button>
                    </div>

                    {/* Speed Control */}
                    <div className="flex items-center gap-1 bg-surface-highlight p-1 rounded-xl border border-border-subtle">
                        <button onClick={() => adjustSpeed(-1)} className="p-2 hover:bg-surface-highlight rounded-lg text-text-muted hover:text-white transition-colors"><Rewind size={16}/></button>
                        <span className="text-xs font-mono font-bold w-12 text-center text-white">SPD {scrollSpeed}</span>
                        <button onClick={() => adjustSpeed(1)} className="p-2 hover:bg-surface-highlight rounded-lg text-text-muted hover:text-white transition-colors"><FastForward size={16}/></button>
                    </div>

                    <Button 
                        onClick={togglePlay} 
                        variant="primary"
                        className={`w-14 h-12 flex items-center justify-center rounded-xl shadow-lg border-0 ${isPlaying ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-emerald-500 hover:bg-emerald-400 text-black'}`}
                    >
                        {isPlaying ? <Pause size={20} fill="currentColor"/> : <Play size={20} fill="currentColor" className="ml-1"/>}
                    </Button>

                    <div className="w-px h-8 bg-surface-highlight mx-2"></div>

                    <button onClick={onClose} className="p-3 hover:bg-red-500/20 rounded-xl text-text-muted hover:text-status-error transition-colors border border-transparent hover:border-red-500/50">
                        <X size={24}/>
                    </button>
                </div>
            </div>

            {/* Content Scroller */}
            <div className="flex-1 relative overflow-hidden bg-black">
                {/* Focus Guides */}
                <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-center items-center">
                    <div className="w-full border-t border-accent-primary/30 opacity-50"></div>
                    <div className="h-24 w-full bg-accent-primary/5 border-y border-accent-primary/10"></div>
                    <div className="w-full border-t border-accent-primary/30 opacity-50"></div>
                </div>
                
                {/* Scroll Area */}
                <div 
                    ref={scrollerRef}
                    className="absolute inset-0 overflow-y-auto no-scrollbar scroll-smooth"
                    style={{ 
                        scrollBehavior: 'auto',
                        transform: mirrorMode ? 'scaleX(-1)' : 'none'
                    }}
                >
                    <div 
                        className="max-w-5xl mx-auto px-12 py-[45vh] text-center font-bold leading-relaxed text-white/90 transition-all duration-300" 
                        style={{ fontSize: `${fontSize}px` }}
                    >
                        {processedContent}
                    </div>
                </div>
            </div>
        </div>
    );
};
