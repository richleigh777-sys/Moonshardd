
import React, { useState } from 'react';
import { EMOJI_LIST, EMOJI_CATEGORIES } from '../../utils/emojis';
import { X } from 'lucide-react';
import { sfx } from '../../lib/soundService';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
  className?: string;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose, className = "" }) => {
  const [activeCategory, setActiveCategory] = useState('smileys');

  const handleEmojiSelect = (emoji: string) => {
    sfx.playClick();
    onSelect(emoji);
  };

  const handleCategoryChange = (catId: string) => {
    sfx.playHover();
    setActiveCategory(catId);
  };

  // Safe accessor to prevent crashes if category key is missing
  const currentEmojis = EMOJI_LIST[activeCategory] || [];

  return (
    <div className={`bg-surface-main border border-border-subtle rounded-xl shadow-2xl overflow-hidden z-[150] animate-in slide-in-from-bottom-2 duration-300 backdrop-blur-xl flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-2.5 bg-surface-alt border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-2">
            <span className="text-xs font-[700] text-text-muted  tracking-[0.2em] ml-1">Emoji Select</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-highlight text-text-muted hover:text-text-primary transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Emoji Grid */}
      <div className="h-56 overflow-y-auto p-2 bg-surface-main custom-scrollbar">
        {currentEmojis.length > 0 ? (
            <div className="grid grid-cols-7 gap-1">
            {currentEmojis.map((emoji, index) => (
                <button
                key={`${activeCategory}-${index}`}
                onClick={() => handleEmojiSelect(emoji)}
                className="h-8 w-8 flex items-center justify-center text-lg hover:bg-surface-alt rounded-lg transition-all hover:scale-110 active:scale-95"
                style={{ fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif' }}
                >
                {emoji}
                </button>
            ))}
            </div>
        ) : (
            <div className="flex h-full items-center justify-center text-xs text-text-muted italic">
                No emojis found
            </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex bg-surface-alt border-t border-border-subtle p-1 overflow-x-auto scrollbar-hide shrink-0">
        {EMOJI_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`flex-1 min-w-[32px] p-1.5 text-base rounded-lg transition-all duration-300 grayscale hover:grayscale-0 ${
              activeCategory === cat.id ? 'bg-surface-main grayscale-0 shadow-sm border border-border-subtle' : 'opacity-40 hover:opacity-100'
            }`}
            title={cat.name}
            style={{ fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif' }}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
};
