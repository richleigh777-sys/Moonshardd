
import React from 'react';
import { Bold, Italic, Strikethrough, Code, List, Quote } from 'lucide-react';

interface FormattingToolbarProps {
    onFormat: (format: string) => void;
}

export const FormattingToolbar: React.FC<FormattingToolbarProps> = ({ onFormat }) => {
    const tools = [
        { id: 'bold', icon: Bold, label: 'Bold (Ctrl+B)' },
        { id: 'italic', icon: Italic, label: 'Italic (Ctrl+I)' },
        { id: 'strike', icon: Strikethrough, label: 'Strikethrough' },
        { id: 'code', icon: Code, label: 'Code Block' },
        { id: 'list', icon: List, label: 'Bullet List' },
        { id: 'quote', icon: Quote, label: 'Blockquote' },
    ];

    return (
        <div className="flex items-center gap-0.5 px-4 pt-2 pb-1 border-b border-border-subtle/30 opacity-60 hover:opacity-100 transition-opacity">
            {tools.map((tool) => (
                <button
                    key={tool.id}
                    onClick={(e) => {
                        e.preventDefault(); // Prevent focus loss
                        onFormat(tool.id);
                    }}
                    className="p-1.5 rounded hover:bg-surface-alt text-text-muted hover:text-text-primary transition-colors"
                    title={tool.label}
                >
                    <tool.icon size={16} strokeWidth={2.5} />
                </button>
            ))}
            <div className="flex-1"></div>
            <span className="text-sm font-mono text-text-muted opacity-50  tracking-wider">Markdown</span>
        </div>
    );
};
