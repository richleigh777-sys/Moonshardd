
import React from 'react';

interface DateSeparatorProps {
    date: Date;
}

export const DateSeparator: React.FC<DateSeparatorProps> = ({ date }) => {
    return (
        <div className="flex items-center justify-center my-6 relative z-10 w-full">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-border-subtle"></div>
            </div>
            <div className="relative flex justify-center">
                <span className="px-3 py-0.5 text-sm font-semibold text-text-muted bg-surface-main select-none">
                    {date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
            </div>
        </div>
    );
};
