
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
    <div className={`bg-surface-main border border-border-subtle rounded-xl shadow-xl overflow-hidden z-[150] animate-in slide-in-from-bottom-2 duration-300 backdrop-blur-xl flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-surface-alt/80 border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-text-muted ml-2">Choose an Emoji</span>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-surface-highlight text-text-muted hover:text-text-primary transition-colors">
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* Emoji Grid */}
      <div className="h-56 overflow-y-auto p-3 bg-surface-main custom-scrollbar w-[300px]">
        {currentEmojis.length > 0 ? (
            <div className="grid grid-cols-7 gap-1">
            {currentEmojis.map((emoji, index) => (
                <button
                key={`${activeCategory}-${index}`}
                onClick={() => handleEmojiSelect(emoji)}
                className="h-10 w-10 flex items-center justify-center text-xl hover:bg-accent-secondary/15 rounded-xl transition-all hover:scale-110 active:scale-95"
                style={{ fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif' }}
                >
                {emoji}
                </button>
            ))}
            </div>
        ) : (
            <div className="flex h-full items-center justify-center text-sm font-medium text-text-muted">
                No emojis around
            </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex bg-surface-alt/85 border-t border-border-subtle p-2 overflow-x-auto scrollbar-hide shrink-0 gap-1">
        {EMOJI_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`flex-1 min-w-[36px] flex items-center justify-center p-2 text-lg rounded-xl transition-all duration-300 grayscale hover:grayscale-0 ${
              activeCategory === cat.id ? 'bg-surface-main grayscale-0 shadow-sm border border-border-subtle' : 'opacity-50 hover:opacity-100 hover:bg-surface-highlight'
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
