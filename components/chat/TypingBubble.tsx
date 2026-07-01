
import React from 'react';

interface TypingBubbleProps {
    users: string[];
}

export const TypingBubble: React.FC<TypingBubbleProps> = ({ users }) => {
    if (users.length === 0) return null;

    return (
        <div className="flex px-4 mt-1 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-1.5 w-fit">
                <div className="flex gap-1 bg-surface-alt p-2 rounded-xl">
                    <div className="w-1.5 h-1.5 bg-surface-alt0 rounded-full animate-[pulse_1s_infinite_ease-in-out]"></div>
                    <div className="w-1.5 h-1.5 bg-surface-alt0 rounded-full animate-[pulse_1s_infinite_ease-in-out_0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-surface-alt0 rounded-full animate-[pulse_1s_infinite_ease-in-out_0.4s]"></div>
                </div>
                <span className="text-sm font-semibold text-text-muted">
                    {users.length > 2 ? 'Multiple agents typing...' : `${users.join(', ')} typing...`}
                </span>
            </div>
        </div>
    );
};
