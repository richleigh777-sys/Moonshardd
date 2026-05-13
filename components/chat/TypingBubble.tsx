
import React from 'react';

interface TypingBubbleProps {
    users: string[];
}

export const TypingBubble: React.FC<TypingBubbleProps> = ({ users }) => {
    if (users.length === 0) return null;

    return (
        <div className="flex flex-col gap-1 px-6 mt-2 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2.5 shadow-[0_0_15px_rgba(99,102,241,0.1)] flex items-center gap-1.5 w-fit backdrop-blur-md">
                <div className="flex gap-1">
                    <div className="w-1 h-1 bg-indigo-400 rounded-full animate-[pulse_1s_infinite_ease-in-out]"></div>
                    <div className="w-1 h-1 bg-indigo-400 rounded-full animate-[pulse_1s_infinite_ease-in-out_0.2s]"></div>
                    <div className="w-1 h-1 bg-indigo-400 rounded-full animate-[pulse_1s_infinite_ease-in-out_0.4s]"></div>
                </div>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1 italic opacity-80">
                    {users.length > 2 ? 'Multiple agents typing' : `${users.join(', ')} typing...`}
                </span>
            </div>
        </div>
    );
};
