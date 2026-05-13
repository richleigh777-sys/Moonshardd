
import React from 'react';

interface DateSeparatorProps {
    date: Date;
}

export const DateSeparator: React.FC<DateSeparatorProps> = ({ date }) => {
    return (
        <div className="flex items-center justify-center my-8 relative z-10">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center">
                <span className="px-4 py-1 text-[8px] font-mono font-black uppercase tracking-[0.3em] text-slate-500 bg-black/40 backdrop-blur-md border border-white/10 rounded-md shadow-xl select-none flex items-center gap-2">
                    <span className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse"></span>
                    LOG_ENTRY: {date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
            </div>
        </div>
    );
};
